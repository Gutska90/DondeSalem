package com.dondesalem.api.dto.cart;

import java.math.BigDecimal;

public record CartLineDto(
    Long lineId,
    Long productId,
    String name,
    String slug,
    String imageUrl,
    BigDecimal unitPrice,
    Integer quantity,
    Integer maxQuantity,
    BigDecimal lineTotal) {}
