package com.dondesalem.api.dto.config;

/**
 * Configuración pública para la tienda (sin secretos). Texto multilínea permitido en
 * {@code transferBankInstructions}.
 */
public record PublicStorefrontConfigDto(String transferBankInstructions) {}
