package com.dondesalem.api.dto.cms;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;

public record EventRequest(
    @NotBlank String title,
    String description,
    String imageUrl,
    @NotNull Instant startsAt,
    @NotNull Instant endsAt,
    Integer capacity,
    BigDecimal entryFee,
    String externalUrl,
    boolean featuredOnHome,
    boolean active) {}
