package com.store.BACK.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.BACK.dto.PedidoAdminResponse;
import com.store.BACK.dto.StatusUpdateDTO;
import com.store.BACK.model.Contato;
import com.store.BACK.model.Pedido;
import com.store.BACK.model.PedidoAviso;
import com.store.BACK.model.Produto;
import com.store.BACK.service.AdminService;
import com.store.BACK.service.PedidoAvisoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final PedidoAvisoService pedidoAvisoService;
    private final ObjectMapper objectMapper;

    @GetMapping("/contatos")
    public ResponseEntity<List<Contato>> getAllContatos() {
        return ResponseEntity.ok(adminService.listarTodasAsMensagens());
    }

    @GetMapping("/pedidos")
    public ResponseEntity<List<PedidoAdminResponse>> getAllPedidos() {
        return ResponseEntity.ok(adminService.listarTodosOsPedidos());
    }

    @GetMapping("/pedidos/{id}")
    public ResponseEntity<Pedido> getPedidoById(@PathVariable Long id) {
        Pedido pedido = adminService.getPedidoById(id);
        if (pedido != null) {
            return ResponseEntity.ok(pedido);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * ENDPOINT CORRIGIDO: Aceita status + código/link de rastreio
     */
    @PatchMapping("/pedidos/{pedidoId}/status")
    public ResponseEntity<Pedido> updatePedidoStatus(
<<<<<<< HEAD
            @PathVariable Long pedidoId,
            @RequestBody StatusUpdateDTO statusUpdate) {

        return ResponseEntity.ok(
                adminService.atualizarStatusPedido(
                        pedidoId,
                        statusUpdate.getStatus(),
                        statusUpdate.getCodigoRastreio(),
                        statusUpdate.getLinkRastreio()
                )
=======
            @PathVariable Long pedidoId, 
            @RequestBody StatusUpdateDTO statusUpdate) {
        
        return ResponseEntity.ok(
            adminService.atualizarStatusPedido(
                pedidoId, 
                statusUpdate.getStatus(),
                statusUpdate.getCodigoRastreio(),
                statusUpdate.getLinkRastreio()
            )
>>>>>>> 05f4c2bbd4ddc53764e00cd8c7186b539edec53c
        );
    }

    @GetMapping("/produtos")
    public ResponseEntity<List<Produto>> getAllProdutos() {
        return ResponseEntity.ok(adminService.listarTodosOsProdutos());
    }

    @PostMapping("/produtos")
    public ResponseEntity<Produto> createProduto(
            @RequestParam("produto") String produtoJson,
            @RequestParam(value = "imagem", required = false) MultipartFile imagemFile) throws IOException {

        Produto produto = objectMapper.readValue(produtoJson, Produto.class);
        Produto produtoSalvo = adminService.adicionarProduto(produto, imagemFile);
        return ResponseEntity.ok(produtoSalvo);
    }

    @PutMapping("/produtos/{id}")
    public ResponseEntity<Produto> updateProduto(
            @PathVariable Long id,
            @RequestParam("produto") String produtoJson,
            @RequestParam(value = "imagem", required = false) MultipartFile imagemFile) throws IOException {

        Produto produtoDetails = objectMapper.readValue(produtoJson, Produto.class);
        Produto produtoAtualizado = adminService.atualizarProduto(id, produtoDetails, imagemFile);
        return ResponseEntity.ok(produtoAtualizado);
    }

    @DeleteMapping("/produtos/{id}")
    public ResponseEntity<Void> deleteProduto(@PathVariable Long id) {
        adminService.deletarProduto(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/pedidos/{pedidoId}/avisos")
    public ResponseEntity<PedidoAviso> createAviso(
            @PathVariable Long pedidoId,
            @RequestParam("mensagem") String mensagem,
            @RequestParam(value = "imagem", required = false) MultipartFile imagem) {
        try {
            PedidoAviso aviso = pedidoAvisoService.createAviso(pedidoId, mensagem, imagem);
            return ResponseEntity.status(HttpStatus.CREATED).body(aviso);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
