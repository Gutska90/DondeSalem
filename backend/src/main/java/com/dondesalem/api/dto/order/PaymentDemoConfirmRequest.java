package com.dondesalem.api.dto.order;

import jakarta.validation.constraints.NotBlank;

public record PaymentDemoConfirmRequest(
    @NotBlank String orderNumber, @NotBlank String sessionToken) {}
