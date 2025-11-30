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
     * Atualiza o status de um pedido e envia um e-mail de confirmação
     * se o status for alterado para "PAGO".
     */
    @Transactional
    public Pedido atualizarStatusPedido(Long pedidoId, String novoStatus) {
        // 1. Busca o pedido com FETCH para garantir que os itens sejam carregados
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        String statusAntigo = pedido.getStatus();

        // 2. Atualiza o status
        pedido.setStatus(novoStatus);
        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        // 3. Verifica se o status mudou para PAGO
        final String STATUS_PAGO = "PAGO";

        if (STATUS_PAGO.equalsIgnoreCase(novoStatus) && !STATUS_PAGO.equalsIgnoreCase(statusAntigo)) {
            try {
                System.out.println(">>> [ADMIN] Status mudou para PAGO. Enviando e-mail de confirmação de pagamento...");

                // IMPORTANTE: Força o carregamento dos itens antes de enviar o email
                // para evitar LazyInitializationException
                int totalItens = pedidoSalvo.getItens().size();
                System.out.println(">>> [ADMIN] Pedido tem " + totalItens + " itens. Enviando email...");

                // Envia o email de PAGAMENTO CONFIRMADO
                emailService.enviarPagamentoConfirmado(pedidoSalvo);

                System.out.println(">>> [ADMIN] E-mail de confirmação de pagamento enviado com sucesso para: "
                        + pedidoSalvo.getUsuario().getEmail());

            } catch (Exception e) {
                // Log detalhado do erro
                System.err.println("!!! [ADMIN] ERRO CRÍTICO ao enviar e-mail de confirmação de pagamento!");
                System.err.println("!!! Pedido ID: " + pedidoId);
                System.err.println("!!! Cliente: " + pedidoSalvo.getUsuario().getEmail());
                System.err.println("!!! Mensagem de erro: " + e.getMessage());
                e.printStackTrace();

                // IMPORTANTE: Não lançar exceção aqui para não reverter a transação
                // O pedido já foi salvo com status PAGO, o email é secundário
            }
        } else {
            System.out.println(">>> [ADMIN] Status atualizado de " + statusAntigo + " para " + novoStatus +
                    ". Nenhum e-mail adicional será enviado.");
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