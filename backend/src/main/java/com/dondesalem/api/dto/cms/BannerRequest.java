package com.dondesalem.api.dto.cms;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record BannerRequest(
    String title,
    @NotBlank String imageUrl,
    String linkUrl,
    @NotNull Integer sortOrder,
    @NotNull Boolean active,
    Instant startsAt,
    Instant endsAt) {}
