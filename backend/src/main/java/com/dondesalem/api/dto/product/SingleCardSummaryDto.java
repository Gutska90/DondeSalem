package com.dondesalem.api.dto.product;

/** Subconjunto para listados y tarjetas (singles). */
public record SingleCardSummaryDto(
    String cardName,
    String setName,
    String cardNumber,
    String rarity,
    String condition,
    String language,
    String finishType,
    String bloque) {}
