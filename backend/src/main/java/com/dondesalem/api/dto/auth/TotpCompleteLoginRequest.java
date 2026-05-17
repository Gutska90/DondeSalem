package com.dondesalem.api.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record TotpCompleteLoginRequest(
    @NotBlank String pendingToken,
    /** Código TOTP de 6 dígitos (si no usás recoveryCode). */
    String code,
    /** Código de recuperación con formato XXXX-XXXX-XXXX (si no usás code). */
    String recoveryCode) {}
