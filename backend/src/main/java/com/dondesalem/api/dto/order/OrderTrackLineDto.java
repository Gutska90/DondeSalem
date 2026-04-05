package com.dondesalem.api.dto.order;

import java.math.BigDecimal;

public record OrderTrackLineDto(String productName, int quantity, BigDecimal unitPrice) {}
