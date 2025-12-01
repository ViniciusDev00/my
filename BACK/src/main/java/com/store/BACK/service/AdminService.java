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
     * Atualiza o status de um pedido e envia emails conforme o novo status.
     * - PAGO: Email de confirmação de pagamento
     * - ENVIADO: Email de pedido enviado com código de rastreio
     */
    @Transactional
    public Pedido atualizarStatusPedido(Long pedidoId, String novoStatus, String codigoRastreio, String linkRastreio) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        String statusAntigo = pedido.getStatus();
        pedido.setStatus(novoStatus);

        // Se for ENVIADO, salva os dados de rastreio
        if ("ENVIADO".equalsIgnoreCase(novoStatus)) {
            if (codigoRastreio != null && !codigoRastreio.trim().isEmpty()) {
                pedido.setCodigoRastreio(codigoRastreio);
                pedido.setLinkRastreio(linkRastreio);
            }
        }

        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        // === LÓGICA DE ENVIO DE EMAILS ===
<<<<<<< HEAD

=======
        
>>>>>>> 05f4c2bbd4ddc53764e00cd8c7186b539edec53c
        // 1. Email de Pagamento Confirmado
        if ("PAGO".equalsIgnoreCase(novoStatus) && !"PAGO".equalsIgnoreCase(statusAntigo)) {
            try {
                System.out.println(">>> [ADMIN] Status mudou para PAGO. Enviando e-mail de confirmação de pagamento...");
                int totalItens = pedidoSalvo.getItens().size();
                System.out.println(">>> [ADMIN] Pedido tem " + totalItens + " itens. Enviando email...");
<<<<<<< HEAD

                emailService.enviarPagamentoConfirmado(pedidoSalvo);

                System.out.println(">>> [ADMIN] E-mail de confirmação de pagamento enviado com sucesso para: "
                        + pedidoSalvo.getUsuario().getEmail());

=======
                
                emailService.enviarPagamentoConfirmado(pedidoSalvo);
                
                System.out.println(">>> [ADMIN] E-mail de confirmação de pagamento enviado com sucesso para: " 
                    + pedidoSalvo.getUsuario().getEmail());
                    
>>>>>>> 05f4c2bbd4ddc53764e00cd8c7186b539edec53c
            } catch (Exception e) {
                System.err.println("!!! [ADMIN] ERRO ao enviar e-mail de confirmação de pagamento!");
                System.err.println("!!! Pedido ID: " + pedidoId);
                e.printStackTrace();
            }
        }

        // 2. Email de Pedido Enviado
        if ("ENVIADO".equalsIgnoreCase(novoStatus) && !"ENVIADO".equalsIgnoreCase(statusAntigo)) {
            try {
                System.out.println(">>> [ADMIN] Status mudou para ENVIADO. Enviando e-mail de pedido enviado...");
<<<<<<< HEAD

                if (pedidoSalvo.getCodigoRastreio() != null) {
                    System.out.println(">>> [ADMIN] Código de rastreio: " + pedidoSalvo.getCodigoRastreio());
                }

                emailService.enviarPedidoEnviado(pedidoSalvo);

                System.out.println(">>> [ADMIN] E-mail de pedido enviado com sucesso para: "
                        + pedidoSalvo.getUsuario().getEmail());

=======
                
                if (pedidoSalvo.getCodigoRastreio() != null) {
                    System.out.println(">>> [ADMIN] Código de rastreio: " + pedidoSalvo.getCodigoRastreio());
                }
                
                emailService.enviarPedidoEnviado(pedidoSalvo);
                
                System.out.println(">>> [ADMIN] E-mail de pedido enviado com sucesso para: " 
                    + pedidoSalvo.getUsuario().getEmail());
                    
>>>>>>> 05f4c2bbd4ddc53764e00cd8c7186b539edec53c
            } catch (Exception e) {
                System.err.println("!!! [ADMIN] ERRO ao enviar e-mail de pedido enviado!");
                System.err.println("!!! Pedido ID: " + pedidoId);
                e.printStackTrace();
            }
        }

        return pedidoSalvo;
    }

    @Transactional
    public Produto adicionarProduto(Produto produto, MultipartFile imagemFile) {
        if (imagemFile != null && !imagemFile.isEmpty()) {
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
