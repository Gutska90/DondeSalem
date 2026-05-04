package com.dondesalem.api.dto.product;

public record SingleCardDetailsRequest(
    String cardName,
    String setName,
    String cardNumber,
    String rarity,
    String condition,
    String language,
    String finishType,
    String bloque,
    String editionType,
    String artist,
    String manaCostOrCost,
    String attributeOrColor,
    String gradeOrCertification,
    String metadataJson) {}
