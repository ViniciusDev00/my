package com.store.BACK.repository;

import com.store.BACK.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Consulta customizada para trazer os itens e produtos junto com o pedido
    // Evita o problema de "LazyInitializationException" ou dados faltando
    @Query("SELECT p FROM Pedido p JOIN FETCH p.itens i JOIN FETCH i.produto WHERE p.usuario.id = :usuarioId")
    List<Pedido> findByUsuarioId(@Param("usuarioId") Long usuarioId);

    @Query("SELECT SUM(p.valorTotal) FROM Pedido p")
    Optional<BigDecimal> findTotalVendas();

    @Query("SELECT p FROM Pedido p JOIN FETCH p.usuario")
    List<Pedido> findAllWithUsuario();

    @Query("SELECT FUNCTION('DATE', p.dataPedido) as date, SUM(p.valorTotal) as total FROM Pedido p GROUP BY FUNCTION('DATE', p.dataPedido) ORDER BY date ASC")
    List<Map<String, Object>> findSalesOverTime();

    @Query("SELECT p.status, COUNT(p) FROM Pedido p GROUP BY p.status")
    List<Object[]> countByStatus();
}