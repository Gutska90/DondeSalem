package com.dondesalem.api.dto.inventory;

import com.dondesalem.api.domain.MovementReason;
import jakarta.validation.constraints.NotNull;

public record AdjustStockRequest(@NotNull Long productId, @NotNull Integer delta, MovementReason reason) {}
