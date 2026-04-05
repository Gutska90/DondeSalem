package com.dondesalem.api.dto.cart;

import java.math.BigDecimal;
import java.util.List;

/**
 * @param merchandiseSubtotal Suma de precios de catálogo (sin promos)
 * @param promotionDiscount Total descontado por promociones vigentes
 * @param subtotal Importe neto de productos (tras promos), mismo criterio que el pedido
 */
public record CartResponse(
    List<CartLineDto> lines,
    BigDecimal merchandiseSubtotal,
    BigDecimal promotionDiscount,
    BigDecimal subtotal,
    int itemCount) {}
