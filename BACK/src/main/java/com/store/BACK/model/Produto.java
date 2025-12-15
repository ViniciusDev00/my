package com.store.BACK.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "produtos")
@Getter
@Setter
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(length = 1000)
    private String descricao;

    @Column(nullable = false)
    private BigDecimal preco;

    private BigDecimal precoOriginal;

    // --- NOVO: Agrupamento de Cores ---
    // Produtos com o mesmo código (ex: "NIKE_TN") serão tratados como variações
    @Column(name = "codigo_modelo")
    private String codigoModelo; 

    // --- IMAGENS ---
    private String imagemUrl;  // Foto Principal (Capa)

    @Column(name = "imagem_url_2")
    private String imagemUrl2; // Foto Lateral

    @Column(name = "imagem_url_3")
    private String imagemUrl3; // Foto Traseira/Sola

    @Column(name = "imagem_url_4")
    private String imagemUrl4; // Foto Detalhe/Pé
    // ----------------

    @Column(nullable = false)
    private int estoque;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "marca_id", nullable = false)
    private Marca marca;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;
}