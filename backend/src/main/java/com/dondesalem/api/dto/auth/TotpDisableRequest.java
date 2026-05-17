package com.dondesalem.api.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record TotpDisableRequest(
    /** Obligatoria si la cuenta tiene contraseña local. */
    String currentPassword,
    @NotBlank String totpCode) {}
