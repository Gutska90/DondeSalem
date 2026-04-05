package com.dondesalem.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "inventory_movements")
@Getter
@Setter
public class InventoryMovement extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "product_id")
  private Product product;

  @Column(name = "quantity_change", nullable = false)
  private Integer quantityChange;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 40)
  private MovementReason reason;

  @Column(name = "reference_type")
  private String referenceType;

  @Column(name = "reference_id")
  private Long referenceId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by_user_id")
  private User createdBy;
}
