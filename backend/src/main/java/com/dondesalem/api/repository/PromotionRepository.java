package com.dondesalem.api.repository;

import com.dondesalem.api.domain.Promotion;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

  @Query(
      """
      SELECT p FROM Promotion p WHERE p.active = true
      AND p.startsAt <= :now AND p.endsAt >= :now
      ORDER BY p.startsAt DESC
      """)
  List<Promotion> findActiveAt(@Param("now") Instant now);

  @Query(
      """
      SELECT DISTINCT p FROM Promotion p
      LEFT JOIN FETCH p.product
      WHERE p.active = true AND p.startsAt <= :now AND p.endsAt >= :now
      """)
  List<Promotion> findAllActiveWithProduct(@Param("now") Instant now);
}
