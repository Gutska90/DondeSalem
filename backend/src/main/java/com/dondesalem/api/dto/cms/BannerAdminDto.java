package com.dondesalem.api.dto.cms;

import java.time.Instant;

public record BannerAdminDto(
    Long id,
    String title,
    String imageUrl,
    String linkUrl,
    Integer sortOrder,
    boolean active,
    Instant startsAt,
    Instant endsAt) {}
