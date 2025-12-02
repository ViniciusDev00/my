package com.store.BACK.dto;

import com.store.BACK.model.Endereco;
import com.store.BACK.model.Pedido;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UsuarioDTO {
    private Long id;
    private String nome;
    private String email;
    private String cpf;      // CAMPO NOVO
    private String telefone; // CAMPO NOVO
    private String role;

    private List<Endereco> enderecos;
    private List<Pedido> pedidos;
}