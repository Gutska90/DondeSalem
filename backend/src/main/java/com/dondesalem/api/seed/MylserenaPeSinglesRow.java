package com.dondesalem.api.seed;

import java.math.BigDecimal;

/**
 * Fila del JSON {@code /seed/mylserena-pe-singles.json} (salida de {@code
 * scripts/fetch_mylserena_pe_singles.py}).
 */
public record MylserenaPeSinglesRow(
    String pathSlug,
    String listingTitle,
    String imageId,
    String imageVersion,
    BigDecimal price,
    String brandLine,
    String bloque) {}
