package com.dondesalem.api.dto.order;

import com.dondesalem.api.domain.DeliveryMethod;
import com.dondesalem.api.domain.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(
    @NotBlank String recipientName,
    @NotBlank String recipientPhone,
    @NotBlank String shippingStreet,
    @NotBlank String shippingCity,
    String shippingRegion,
    String shippingPostalCode,
    @NotBlank String shippingCountry,
    @NotNull DeliveryMethod deliveryMethod,
    @NotNull PaymentMethod paymentMethod,
    String notes) {}
