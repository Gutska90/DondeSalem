package com.dondesalem.api.dto.product;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ProductBulkUpdateRequest(
    @NotEmpty List<Long> productIds,
    Boolean active,
    Integer stockDelta) {}
