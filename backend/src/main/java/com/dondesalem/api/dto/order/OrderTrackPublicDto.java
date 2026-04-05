package com.dondesalem.api.dto.order;

import com.dondesalem.api.domain.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Vista pública mínima (sin dirección ni teléfono) — número de pedido + email de la cuenta. */
public record OrderTrackPublicDto(
    String orderNumber,
    OrderStatus status,
    BigDecimal subtotal,
    BigDecimal discountTotal,
    BigDecimal shippingCost,
    BigDecimal total,
    Instant createdAt,
    List<OrderTrackLineDto> lines) {}
