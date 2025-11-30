package com.store.BACK.service;

import com.store.BACK.dto.PedidoAdminResponse;
import com.store.BACK.model.Contato;
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Produto;
import com.store.BACK.repository.ContatoRepository;
import com.store.BACK.repository.PedidoRepository;
import com.store.BACK.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final FileStorageService fileStorageService;
    private final ContatoRepository contatoRepository;

    private final EmailService emailService;

    public List<PedidoAdminResponse> listarTodosOsPedidos() {
        return pedidoRepository.findAllWithUsuario().stream()
                .map(PedidoAdminResponse::fromPedido)
                .collect(Collectors.toList());
    }

    public List<Produto> listarTodosOsProdutos() {
        return produtoRepository.findAll();
    }

    public List<Contato> listarTodasAsMensagens() {
        return contatoRepository.findAll();
    }

    /**
     * Atualiza o status de um pedido e envia um e-mail de confirmação
     * se o status for alterado para "PAGO".
     */
    @Transactional
    public Pedido atualizarStatusPedido(Long pedidoId, String novoStatus) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        String statusAntigo = pedido.getStatus();

        pedido.setStatus(novoStatus);
        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        final String STATUS_PAGO = "PAGO";

        if (STATUS_PAGO.equalsIgnoreCase(novoStatus) && !STATUS_PAGO.equalsIgnoreCase(statusAntigo)) {
            try {
                // CORREÇÃO: Chama o novo método dedicado para CONFIRMAÇÃO DE PAGAMENTO.
                emailService.enviarPagamentoConfirmado(pedidoSalvo);
            } catch (Exception e) {
                System.err.println("ERRO: Status do pedido " + pedidoId + " atualizado, mas falha ao enviar e-mail de confirmação.");
                e.printStackTrace();
            }
        }

        return pedidoSalvo;
    }

    @Transactional
    public Produto adicionarProduto(Produto produto, MultipartFile imagemFile) {
        if (imagemFile != null && !imagemFile.isEmpty()) {
            // CORREÇÃO: store(imagemFile) -> saveAndGetFilename(imagemFile)
            String imagemUrl = fileStorageService.saveAndGetFilename(imagemFile);
            produto.setImagemUrl(imagemUrl);
        }
        return produtoRepository.save(produto);
    }

    @Transactional
    public Produto atualizarProduto(Long id, Produto produtoDetails, MultipartFile imagemFile) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        if (imagemFile != null && !imagemFile.isEmpty()) {
            // CORREÇÃO: store(imagemFile) -> saveAndGetFilename(imagemFile)
            String imagemUrl = fileStorageService.saveAndGetFilename(imagemFile);
            produto.setImagemUrl(imagemUrl);
        }

        produto.setNome(produtoDetails.getNome());
        produto.setDescricao(produtoDetails.getDescricao());
        produto.setPreco(produtoDetails.getPreco());
        produto.setPrecoOriginal(produtoDetails.getPrecoOriginal());
        produto.setEstoque(produtoDetails.getEstoque());
        produto.setMarca(produtoDetails.getMarca());
        produto.setCategoria(produtoDetails.getCategoria());
        return produtoRepository.save(produto);
    }

    @Transactional
    public void deletarProduto(Long id) {
        produtoRepository.deleteById(id);
    }

    public Pedido getPedidoById(Long id) {
        return pedidoRepository.findById(id).orElse(null);
    }
}