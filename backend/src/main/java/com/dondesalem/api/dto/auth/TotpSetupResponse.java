package com.dondesalem.api.dto.auth;

/** Respuesta al iniciar alta de 2FA: escanear QR o ingresar secreto manualmente. */
public record TotpSetupResponse(String secret, String otpauthUri) {}
