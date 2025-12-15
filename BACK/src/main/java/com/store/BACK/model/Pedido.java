package com.store.BACK.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnore
    private Usuario usuario;

    @Column(nullable = false)
    private LocalDateTime dataPedido;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(columnDefinition = "TEXT")
    private String pixCopiaECola;

    // NOVO CAMPO: ID do pagamento no Mercado Pago
    @Column(name = "pagamento_id_externo")
    private Long pagamentoIdExterno;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "endereco_id", nullable = false)
    private Endereco enderecoDeEntrega;

    // --- CAMPOS DE DESTINATÁRIO ---
    @Column(name = "nome_destinatario")
    private String nomeDestinatario;

    @Column(name = "telefone_destinatario")
    private String telefoneDestinatario;

    @Column(name = "cpf_destinatario")
    private String cpfDestinatario;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    // --- CAMPOS DE OPÇÕES ---
    private boolean comCaixa;
    private boolean entregaPrioritaria;

    // --- NOVOS CAMPOS DE RASTREIO ---
    @Column(name = "codigo_rastreio")
    private String codigoRastreio;

    @Column(name = "link_rastreio")
    private String linkRastreio;
    // --- FIM NOVOS CAMPOS ---

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("pedido-itens")
    private List<ItemPedido> itens;

    // Getters e Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public LocalDateTime getDataPedido() {
        return dataPedido;
    }

    public void setDataPedido(LocalDateTime dataPedido) {
        this.dataPedido = dataPedido;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public String getPixCopiaECola() {
        return pixCopiaECola;
    }

    public void setPixCopiaECola(String pixCopiaECola) {
        this.pixCopiaECola = pixCopiaECola;
    }

    public Long getPagamentoIdExterno() {
        return pagamentoIdExterno;
    }

    public void setPagamentoIdExterno(Long pagamentoIdExterno) {
        this.pagamentoIdExterno = pagamentoIdExterno;
    }

    public Endereco getEnderecoDeEntrega() {
        return enderecoDeEntrega;
    }

    public void setEnderecoDeEntrega(Endereco enderecoDeEntrega) {
        this.enderecoDeEntrega = enderecoDeEntrega;
    }

    public String getNomeDestinatario() {
        return nomeDestinatario;
    }

    public void setNomeDestinatario(String nomeDestinatario) {
        this.nomeDestinatario = nomeDestinatario;
    }

    public String getTelefoneDestinatario() {
        return telefoneDestinatario;
    }

    public void setTelefoneDestinatario(String telefoneDestinatario) {
        this.telefoneDestinatario = telefoneDestinatario;
    }

    public String getCpfDestinatario() {
        return cpfDestinatario;
    }

    public void setCpfDestinatario(String cpfDestinatario) {
        this.cpfDestinatario = cpfDestinatario;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public List<ItemPedido> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedido> itens) {
        this.itens = itens;
    }

    public boolean isComCaixa() {
        return comCaixa;
    }

    public void setComCaixa(boolean comCaixa) {
        this.comCaixa = comCaixa;
    }

    public boolean isEntregaPrioritaria() {
        return entregaPrioritaria;
    }

    public void setEntregaPrioritaria(boolean entregaPrioritaria) {
        this.entregaPrioritaria = entregaPrioritaria;
    }

    public String getCodigoRastreio() {
        return codigoRastreio;
    }

    public void setCodigoRastreio(String codigoRastreio) {
        this.codigoRastreio = codigoRastreio;
    }

    public String getLinkRastreio() {
        return linkRastreio;
    }

    public void setLinkRastreio(String linkRastreio) {
        this.linkRastreio = linkRastreio;
    }
}