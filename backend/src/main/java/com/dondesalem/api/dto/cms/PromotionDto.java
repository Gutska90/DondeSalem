package com.dondesalem.api.dto.cms;

import com.dondesalem.api.domain.PromotionType;
import java.math.BigDecimal;
import java.time.Instant;

public record PromotionDto(
    Long id,
    String name,
    PromotionType promoType,
    BigDecimal value,
    Instant startsAt,
    Instant endsAt,
    Long productId) {}
