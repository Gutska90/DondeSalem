package com.dondesalem.api.dto.order;

import com.dondesalem.api.domain.DeliveryMethod;
import com.dondesalem.api.domain.OrderStatus;
import com.dondesalem.api.domain.PaymentMethod;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderDetailDto(
    Long id,
    String orderNumber,
    OrderStatus status,
    BigDecimal subtotal,
    BigDecimal discountTotal,
    BigDecimal shippingCost,
    BigDecimal total,
    String recipientName,
    String recipientPhone,
    String shippingStreet,
    String shippingCity,
    String shippingRegion,
    String shippingPostalCode,
    String shippingCountry,
    DeliveryMethod deliveryMethod,
    PaymentMethod paymentMethod,
    String notes,
    Instant createdAt,
    List<OrderLineDto> lines,
    /** Si el pedido requiere ir a la pasarela (demo), URL absoluta del front. Null si no aplica. */
    String paymentRedirectUrl) {}
