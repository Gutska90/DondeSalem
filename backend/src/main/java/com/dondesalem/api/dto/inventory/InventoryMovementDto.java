package com.dondesalem.api.dto.inventory;

import com.dondesalem.api.domain.MovementReason;
import java.time.Instant;

public record InventoryMovementDto(
    Long id,
    Long productId,
    String productName,
    Integer quantityChange,
    MovementReason reason,
    String referenceType,
    Long referenceId,
    Instant createdAt) {}
