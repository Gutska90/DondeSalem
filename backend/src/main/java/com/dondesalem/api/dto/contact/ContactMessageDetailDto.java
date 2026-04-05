package com.dondesalem.api.dto.contact;

import java.time.Instant;

public record ContactMessageDetailDto(
    Long id,
    String name,
    String email,
    String phone,
    String subject,
    String body,
    boolean read,
    Instant createdAt) {}
