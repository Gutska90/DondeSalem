package com.dondesalem.api.dto.cms;

import java.math.BigDecimal;
import java.time.Instant;

public record EventDto(
    Long id,
    String title,
    String description,
    String imageUrl,
    Instant startsAt,
    Instant endsAt,
    Integer capacity,
    BigDecimal entryFee,
    String externalUrl,
    Boolean featuredOnHome,
    Boolean active) {}
