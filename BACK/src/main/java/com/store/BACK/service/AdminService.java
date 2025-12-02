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

    // LINK FIXO DOS CORREIOS
    private final String CORREIOS_LINK_BASE = "https://rastreamento.correios.com.br/app/index.php?e2s=SRO&a=";

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

    @Transactional
    public Pedido atualizarStatusPedido(Long pedidoId, String novoStatus, String codigoRastreio, String linkRastreio) {
        // 1. Busca o pedido
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        String statusAntigo = pedido.getStatus();

        // 2. Lógica para o status ENVIADO (Gera o link automaticamente)
        final String STATUS_ENVIADO = "ENVIADO";
        if (STATUS_ENVIADO.equalsIgnoreCase(novoStatus) && !STATUS_ENVIADO.equalsIgnoreCase(statusAntigo)) {
            if (codigoRastreio == null || codigoRastreio.trim().isEmpty()) {
                throw new IllegalArgumentException("Código de rastreio é obrigatório para o status ENVIADO.");
            }
            pedido.setCodigoRastreio(codigoRastreio);
            // Concatena o link fixo com o código
            pedido.setLinkRastreio(CORREIOS_LINK_BASE + codigoRastreio);
        } else if (!STATUS_ENVIADO.equalsIgnoreCase(novoStatus)) {
            pedido.setCodigoRastreio(null);
            pedido.setLinkRastreio(null);
        }

        // 3. Atualiza o status
        pedido.setStatus(novoStatus);
        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        // 4. ENVIOS DE E-MAIL
        final String STATUS_PAGO = "PAGO";

        // E-mail de Pagamento Confirmado
        if (STATUS_PAGO.equalsIgnoreCase(novoStatus) && !STATUS_PAGO.equalsIgnoreCase(statusAntigo)) {
            try {
                // Inicializa dados para evitar erro no Async
                pedidoSalvo.getItens().size();
                pedidoSalvo.getUsuario().getEmail();
                emailService.enviarPagamentoConfirmado(pedidoSalvo);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // E-mail de Pedido Enviado
        if (STATUS_ENVIADO.equalsIgnoreCase(novoStatus) && !STATUS_ENVIADO.equalsIgnoreCase(statusAntigo)) {
            try {
                System.out.println(">>> [ADMIN] Status ENVIADO detectado. Preparando dados para e-mail...");

                // --- CORREÇÃO CRÍTICA: INICIALIZAÇÃO DE DADOS ---
                // Acessamos explicitamente os dados LAZY (usuário, itens, endereço)
                // para garantir que o Hibernate os busque antes de passar para a thread de e-mail.
                String email = pedidoSalvo.getUsuario().getEmail();
                String nome = pedidoSalvo.getUsuario().getNome();
                int itens = pedidoSalvo.getItens().size();
                String rua = pedidoSalvo.getEnderecoDeEntrega().getRua();

                System.out.println(">>> [ADMIN] Dados carregados com sucesso: " + email);

                if (pedidoSalvo.getCodigoRastreio() != null) {
                    emailService.enviarPedidoEnviado(pedidoSalvo);
                    System.out.println(">>> [ADMIN] E-mail de rastreio disparado.");
                }
            } catch (Exception e) {
                System.err.println("!!! [ADMIN] Erro ao preparar e-mail de envio: " + e.getMessage());
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