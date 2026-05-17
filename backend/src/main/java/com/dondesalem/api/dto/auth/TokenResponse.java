package com.dondesalem.api.dto.auth;

import com.dondesalem.api.dto.user.UserResponse;

/**
 * @param accessToken JWT de sesión completa; null si falta el paso TOTP.
 * @param pendingTotpToken JWT de corta vida para completar login con código del autenticador.
 */
public record TokenResponse(String accessToken, String pendingTotpToken, UserResponse user) {}
