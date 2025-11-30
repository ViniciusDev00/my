package com.store.BACK.service;

import com.store.BACK.dto.CheckoutRequestDTO;
import com.store.BACK.dto.ItemPedidoDTO;
import com.store.BACK.model.ItemPedido;
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Produto;
import com.store.BACK.model.Usuario;
import com.store.BACK.model.Endereco;
import com.store.BACK.repository.PedidoRepository;
import com.store.BACK.repository.ProdutoRepository;
import com.store.BACK.repository.EnderecoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private EnderecoRepository enderecoRepository;

    @Autowired
    private PixPayloadService pixPayloadService;

    @Transactional
    public Pedido criarPedido(CheckoutRequestDTO checkoutRequest, Usuario usuario) {

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setDataPedido(LocalDateTime.now());
        pedido.setStatus("PENDENTE");

        Long enderecoEntregaId = checkoutRequest.getEnderecoEntregaId();
        Endereco endereco = enderecoRepository.findById(enderecoEntregaId)
                .orElseThrow(() -> new RuntimeException("Endereço de entrega não encontrado: " + enderecoEntregaId));
        pedido.setEnderecoDeEntrega(endereco);

        // CORREÇÃO: Usando os métodos getNomeDestinatario e getTelefoneDestinatario
        pedido.setNomeDestinatario(checkoutRequest.getNomeDestinatario());
        pedido.setTelefoneDestinatario(checkoutRequest.getTelefoneDestinatario());

        pedido.setCpfDestinatario(checkoutRequest.getCpfDestinatario());
        pedido.setObservacoes(checkoutRequest.getObservacoes());

        // --- NOVAS OPÇÕES SALVAS NO PEDIDO ---
        pedido.setComCaixa(checkoutRequest.isComCaixa());
        pedido.setEntregaPrioritaria(checkoutRequest.isEntregaPrioritaria());
        // --- FIM NOVAS OPÇÕES ---


        List<ItemPedido> itensPedido = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        List<ItemPedidoDTO> itensDTO = checkoutRequest.getItens();
        for (ItemPedidoDTO itemDTO : itensDTO) {
            Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDTO.getProdutoId()));

            ItemPedido itemPedido = new ItemPedido();
            itemPedido.setPedido(pedido);
            itemPedido.setProduto(produto);
            itemPedido.setQuantidade(itemDTO.getQuantidade());
            itemPedido.setTamanho(itemDTO.getTamanho());
            itemPedido.setPrecoUnitario(produto.getPreco());

            itensPedido.add(itemPedido);
            subtotal = subtotal.add(produto.getPreco().multiply(BigDecimal.valueOf(itemDTO.getQuantidade())));
        }

        pedido.setItens(itensPedido);

        // --- CÁLCULO DAS TAXAS E VALOR FINAL ---
        BigDecimal valorTotal = subtotal;

        final BigDecimal TAXA = new BigDecimal("0.05");

        if (pedido.isComCaixa()) {
            BigDecimal taxaCaixa = subtotal.multiply(TAXA);
            valorTotal = valorTotal.add(taxaCaixa);
        }

        if (pedido.isEntregaPrioritaria()) {
            BigDecimal taxaPrioritaria = subtotal.multiply(TAXA);
            valorTotal = valorTotal.add(taxaPrioritaria);
        }

        pedido.setValorTotal(valorTotal.setScale(2, RoundingMode.HALF_UP));
        // --- FIM CÁLCULO DAS TAXAS ---

        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        String pixCode = pixPayloadService.generatePayload(pedidoSalvo);

        if (pixCode != null) {
            pedidoSalvo.setPixCopiaECola(pixCode);
            pedidoSalvo = pedidoRepository.save(pedidoSalvo);
        } else {
            throw new RuntimeException("Falha crítica ao gerar o código PIX para o pedido. Pedido ID: " + pedidoSalvo.getId());
        }

        // CORREÇÃO APLICADA AQUI: Chama o novo método para Pedido Recebido (Aguardando Pagamento)
        emailService.enviarPedidoRecebido(pedidoSalvo);

        return pedidoSalvo;
    }

    @Transactional
    public List<Pedido> getPedidosByUsuarioId(Long usuarioId){
        return pedidoRepository.findByUsuarioId(usuarioId);
    }

    public Pedido getPedidoById(Long id) {
        return pedidoRepository.findById(id).orElse(null);
    }

    public boolean isOwner(Long pedidoId, Long usuarioId) {
        return pedidoRepository.findById(pedidoId)
                .map(pedido -> pedido.getUsuario().getId().equals(usuarioId))
                .orElse(false);
    }
}