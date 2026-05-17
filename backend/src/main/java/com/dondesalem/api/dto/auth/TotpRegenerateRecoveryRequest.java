package com.dondesalem.api.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record TotpRegenerateRecoveryRequest(
    String currentPassword,
    @NotBlank String totpCode) {}
