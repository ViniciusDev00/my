package com.store.BACK.controller;

import com.store.BACK.dto.UsuarioDTO;
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Usuario;
import com.store.BACK.service.PedidoService;
import com.store.BACK.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*; // Importante: garante que PutMapping e RequestBody funcionem

import java.util.List;

@RestController
@RequestMapping("/api/usuario")
public class UsuarioController {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/meus-dados")
    public ResponseEntity<UsuarioDTO> getMeusDados(@AuthenticationPrincipal Usuario usuarioLogado) {
        UsuarioDTO usuarioDTO = usuarioService.getDadosUsuario(usuarioLogado);
        return ResponseEntity.ok(usuarioDTO);
    }

    // --- CORREÇÃO: ADICIONADO O MÉTODO PUT PARA RESOLVER O ERRO 405 ---
    @PutMapping("/meus-dados")
    public ResponseEntity<UsuarioDTO> updateMeusDados(@AuthenticationPrincipal Usuario usuarioLogado, @RequestBody UsuarioDTO dadosAtualizados) {
        UsuarioDTO novoUsuario = usuarioService.atualizarDados(usuarioLogado, dadosAtualizados);
        return ResponseEntity.ok(novoUsuario);
    }
    // ------------------------------------------------------------------

    @GetMapping("/meus-pedidos")
    public ResponseEntity<List<Pedido>> getMeusPedidos(@AuthenticationPrincipal Usuario usuarioLogado) {
        List<Pedido> pedidos = pedidoService.getPedidosByUsuarioId(usuarioLogado.getId());
        return ResponseEntity.ok(pedidos);
    }
}