package com.dondesalem.api.dto.cart;

import java.math.BigDecimal;

/**
 * Resultado de aplicar promociones a líneas de carrito/pedido (misma lógica que checkout).
 */
public record CartPricingResult(
    BigDecimal merchandiseGross,
    BigDecimal discountTotal,
    BigDecimal netMerchandise,
    BigDecimal[] finalLineAmounts) {}
