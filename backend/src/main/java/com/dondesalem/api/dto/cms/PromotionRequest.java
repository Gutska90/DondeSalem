package com.dondesalem.api.dto.cms;

import com.dondesalem.api.domain.PromotionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;

public record PromotionRequest(
    @NotBlank String name,
    @NotNull PromotionType promoType,
    @NotNull BigDecimal value,
    @NotNull Instant startsAt,
    @NotNull Instant endsAt,
    @NotNull Boolean active,
    Long productId) {}
