package com.dondesalem.api.dto.config;

/**
 * Configuración pública para la tienda (sin secretos). Texto multilínea permitido en
 * {@code transferBankInstructions}.
 */
public record PublicStorefrontConfigDto(
    String transferBankInstructions,
    /**
     * Client id OAuth (web) para el botón de Google; null si no está configurado en el servidor.
     */
    String googleOAuthClientId) {}
