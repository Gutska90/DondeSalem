package com.dondesalem.api.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record TotpConfirmRequest(@NotBlank String code) {}
