package com.dondesalem.api.dto.contact;

import java.time.Instant;

public record ContactMessageDto(
    Long id, String name, String email, String subject, boolean read, Instant createdAt) {}
