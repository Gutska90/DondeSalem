package com.dondesalem.api.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
    /** Obligatoria si ya hay contraseña; puede ir vacía si la cuenta es solo Google. */
    String currentPassword,
    @NotBlank @Size(min = 8) String newPassword) {}
