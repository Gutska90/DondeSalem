package com.dondesalem.api.dto.order;

import java.math.BigDecimal;

public record OrderLineDto(
    Long productId, String productName, int quantity, BigDecimal unitPrice) {}
