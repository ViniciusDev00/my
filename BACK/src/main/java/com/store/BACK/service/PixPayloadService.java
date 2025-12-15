package com.store.BACK.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.resources.payment.Payment;
import com.store.BACK.model.Pedido;
import com.store.BACK.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PixPayloadService {

    @Value("${mercadopago.access_token}")
    private String accessToken;

    private final PedidoRepository pedidoRepository;

    public PixPayloadService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    public String generatePayload(Pedido pedido) {
        try {
            // Se o token ainda for o placeholder, retorna um erro amigável no console
            if (accessToken == null || accessToken.contains("COLE_SEU_TOKEN")) {
                System.err.println(">>> ERRO: Token do Mercado Pago não configurado no application.properties");
                return null;
            }

            // 1. Configura o Token
            MercadoPagoConfig.setAccessToken(accessToken);

            PaymentClient client = new PaymentClient();

            // 2. Prepara os dados do Pagador (Cliente)
            String emailCliente = (pedido.getUsuario() != null && pedido.getUsuario().getEmail() != null) 
                                  ? pedido.getUsuario().getEmail() 
                                  : "cliente@japauniverse.com";

            PaymentPayerRequest payer = PaymentPayerRequest.builder()
                    .email(emailCliente)
                    .firstName(pedido.getNomeDestinatario())
                    .build();

            // 3. Cria a requisição de Pagamento
            PaymentCreateRequest paymentCreateRequest = PaymentCreateRequest.builder()
                    .transactionAmount(pedido.getValorTotal())
                    .description("Pedido #" + pedido.getId() + " - Japa Universe")
                    .paymentMethodId("pix")
                    .payer(payer)
                    .build();

            // 4. Envia para o Mercado Pago
            Payment payment = client.create(paymentCreateRequest);

            // 5. SALVA O ID DO PAGAMENTO NO PEDIDO (CRUCIAL PARA O WEBHOOK)
            pedido.setPagamentoIdExterno(payment.getId());
            pedidoRepository.save(pedido);

            // 6. Retorna o código "Copia e Cola"
            if (payment.getPointOfInteraction() != null && 
                payment.getPointOfInteraction().getTransactionData() != null) {
                return payment.getPointOfInteraction().getTransactionData().getQrCode();
            }
            return null;

        } catch (Exception e) {
            e.printStackTrace();
            // Retorna null para o controller tratar (ou lance uma exceção personalizada)
            return null;
        }
    }
}