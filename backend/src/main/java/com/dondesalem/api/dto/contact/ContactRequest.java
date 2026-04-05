package com.dondesalem.api.dto.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContactRequest(
    @NotBlank String name,
    @Email @NotBlank String email,
    String phone,
    @NotBlank String subject,
    @NotBlank String body) {}
