package com.dondesalem.api.repository;

import com.dondesalem.api.domain.Cart;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Long> {

  @EntityGraph(attributePaths = {"items", "items.product", "items.product.images", "items.product.category", "items.product.game"})
  Optional<Cart> findWithItemsByUser_Id(Long userId);
}
