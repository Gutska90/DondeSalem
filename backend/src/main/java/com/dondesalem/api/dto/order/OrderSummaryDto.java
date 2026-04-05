package com.dondesalem.api.dto.order;

import com.dondesalem.api.domain.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record OrderSummaryDto(
    Long id, String orderNumber, OrderStatus status, BigDecimal total, Instant createdAt) {}
