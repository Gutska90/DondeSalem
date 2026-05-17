package com.dondesalem.api.repository;

import com.dondesalem.api.domain.InventoryMovement;
import com.dondesalem.api.domain.MovementReason;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

  @EntityGraph(attributePaths = {"product"})
  Page<InventoryMovement> findAllByOrderByCreatedAtDesc(Pageable pageable);

  @EntityGraph(attributePaths = {"product"})
  Page<InventoryMovement> findByProduct_IdOrderByCreatedAtDesc(Long productId, Pageable pageable);

  boolean existsByReferenceTypeAndReferenceIdAndReason(
      String referenceType, Long referenceId, MovementReason reason);
}
