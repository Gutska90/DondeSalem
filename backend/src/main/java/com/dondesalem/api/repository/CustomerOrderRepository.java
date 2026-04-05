package com.dondesalem.api.repository;

import com.dondesalem.api.domain.CustomerOrder;
import com.dondesalem.api.domain.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

  @EntityGraph(attributePaths = {"items", "items.product"})
  List<CustomerOrder> findByUser_IdOrderByCreatedAtDesc(Long userId);

  List<CustomerOrder> findTop5ByOrderByCreatedAtDesc();

  List<CustomerOrder> findTop100ByOrderByCreatedAtDesc();

  @EntityGraph(attributePaths = {"items", "items.product"})
  Optional<CustomerOrder> findByOrderNumber(String orderNumber);

  @EntityGraph(attributePaths = {"items", "items.product", "user"})
  Optional<CustomerOrder> findByOrderNumberAndUser_EmailIgnoreCase(
      String orderNumber, String email);

  @EntityGraph(attributePaths = {"items", "items.product", "user"})
  Optional<CustomerOrder> findDetailById(Long id);

  @EntityGraph(attributePaths = {"items", "items.product", "user"})
  Optional<CustomerOrder> findByOrderNumberAndUser_Id(String orderNumber, Long userId);

  long countByStatus(OrderStatus status);

  Page<CustomerOrder> findByStatus(OrderStatus status, Pageable pageable);

  @Query(
      """
      SELECT COALESCE(SUM(o.total), 0) FROM CustomerOrder o
      WHERE o.createdAt >= :from AND o.status <> :excluded
      """)
  BigDecimal sumTotalCompletedSince(@Param("from") Instant from, @Param("excluded") OrderStatus excluded);
}
