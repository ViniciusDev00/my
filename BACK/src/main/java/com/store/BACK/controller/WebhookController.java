package com.store.BACK.controller;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.resources.payment.Payment;
import com.store.BACK.model.Pedido;
import com.store.BACK.repository.PedidoRepository;
import com.store.BACK.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhook")
public class WebhookController {

    @Value("${mercadopago.access_token}")
    private String accessToken;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private AdminService adminService;

    @PostMapping
    public ResponseEntity<String> receberNotificacao(@RequestParam(value = "type", required = false) String type, 
                                                     @RequestParam(value = "data.id", required = false) String dataId) {
        
        // O Mercado Pago manda notificações de vários tipos. Focamos em "payment".
        if ("payment".equals(type) && dataId != null) {
            try {
                MercadoPagoConfig.setAccessToken(accessToken);
                PaymentClient client = new PaymentClient();
                
                // 1. Consulta o pagamento no Mercado Pago para garantir que é real
                Long paymentId = Long.parseLong(dataId);
                Payment payment = client.get(paymentId);

                // 2. Se estiver aprovado
                if ("approved".equals(payment.getStatus())) {
                    // 3. Busca o pedido no nosso banco pelo ID do pagamento externo
                    Pedido pedido = pedidoRepository.findAll().stream()
                            .filter(p -> paymentId.equals(p.getPagamentoIdExterno()))
                            .findFirst()
                            .orElse(null);

                    // 4. Se achou o pedido e ele ainda não está pago
                    if (pedido != null && !"PAGO".equals(pedido.getStatus())) {
                        System.out.println(">>> WEBHOOK: Pagamento APROVADO para o Pedido #" + pedido.getId());
                        
                        // Atualiza status para PAGO e envia e-mail usando o AdminService
                        adminService.atualizarStatusPedido(pedido.getId(), "PAGO", null, null);
                    }
                }
            } catch (Exception e) {
                System.err.println("Erro no Webhook: " + e.getMessage());
                // Retornamos OK para o MP não ficar reenviando, mesmo com erro interno nosso
                return ResponseEntity.ok().build(); 
            }
        }
        
        return ResponseEntity.ok().build();
    }
}