package com.dondesalem.api.service;

import com.dondesalem.api.domain.Promotion;
import com.dondesalem.api.domain.PromotionType;
import com.dondesalem.api.dto.cart.CartPricingResult;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Calcula descuentos de promociones vigentes sobre el carrito. Sin servicios externos — solo
 * reglas en base de datos (costo operativo mínimo).
 */
public final class PromotionDiscountService {

  private PromotionDiscountService() {}

  public static BigDecimal discountForLine(PromotionType type, BigDecimal value, BigDecimal lineAmount) {
    if (lineAmount.compareTo(BigDecimal.ZERO) <= 0) {
      return BigDecimal.ZERO;
    }
    if (type == PromotionType.PORCENTAJE) {
      return lineAmount
          .multiply(value)
          .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
          .min(lineAmount);
    }
    return value.min(lineAmount);
  }

  /** Mejor descuento entre promociones que aplican a un producto concreto. */
  public static BigDecimal bestProductDiscount(
      List<Promotion> promos, Long productId, BigDecimal lineAmount) {
    if (lineAmount.compareTo(BigDecimal.ZERO) <= 0) {
      return BigDecimal.ZERO;
    }
    return promos.stream()
        .filter(p -> p.getProduct() != null && p.getProduct().getId().equals(productId))
        .map(p -> discountForLine(p.getPromoType(), p.getValue(), lineAmount))
        .max(BigDecimal::compareTo)
        .orElse(BigDecimal.ZERO);
  }

  /** Mejor descuento entre promociones “globales” (sin producto asociado). */
  public static BigDecimal bestGlobalDiscount(List<Promotion> promos, BigDecimal amount) {
    if (amount.compareTo(BigDecimal.ZERO) <= 0) {
      return BigDecimal.ZERO;
    }
    return promos.stream()
        .filter(p -> p.getProduct() == null)
        .map(p -> discountForLine(p.getPromoType(), p.getValue(), amount))
        .max(BigDecimal::compareTo)
        .orElse(BigDecimal.ZERO);
  }

  /**
   * Reparte un descuento global proporcionalmente entre líneas (evita centavos perdidos en la
   * última línea).
   */
  public static BigDecimal[] distributeProportional(BigDecimal totalDiscount, BigDecimal[] lineBases) {
    BigDecimal[] shares = new BigDecimal[lineBases.length];
    BigDecimal sumBase = BigDecimal.ZERO;
    for (BigDecimal b : lineBases) {
      sumBase = sumBase.add(b);
    }
    if (sumBase.compareTo(BigDecimal.ZERO) <= 0 || totalDiscount.compareTo(BigDecimal.ZERO) <= 0) {
      for (int i = 0; i < lineBases.length; i++) {
        shares[i] = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
      }
      return shares;
    }
    BigDecimal allocated = BigDecimal.ZERO;
    for (int i = 0; i < lineBases.length - 1; i++) {
      BigDecimal share =
          totalDiscount
              .multiply(lineBases[i])
              .divide(sumBase, 2, RoundingMode.HALF_UP)
              .min(lineBases[i]);
      shares[i] = share;
      allocated = allocated.add(share);
    }
    BigDecimal last =
        totalDiscount.subtract(allocated).min(lineBases[lineBases.length - 1]).max(BigDecimal.ZERO);
    shares[lineBases.length - 1] = last.setScale(2, RoundingMode.HALF_UP);
    return shares;
  }

  /**
   * Misma lógica que el checkout: descuentos por producto + global proporcional.
   *
   * @param productIds mismo orden que lineGross
   */
  public static CartPricingResult computeTotals(
      long[] productIds, BigDecimal[] lineGross, List<Promotion> promos) {
    int n = lineGross.length;
    if (n == 0) {
      return new CartPricingResult(
          BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
          BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
          BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
          new BigDecimal[0]);
    }
    BigDecimal[] prodDisc = new BigDecimal[n];
    for (int i = 0; i < n; i++) {
      prodDisc[i] =
          bestProductDiscount(promos, productIds[i], lineGross[i]).setScale(2, RoundingMode.HALF_UP);
    }
    BigDecimal[] lineAfterProd = new BigDecimal[n];
    BigDecimal grossMerch = BigDecimal.ZERO;
    for (int i = 0; i < n; i++) {
      lineAfterProd[i] = lineGross[i].subtract(prodDisc[i]).setScale(2, RoundingMode.HALF_UP);
      grossMerch = grossMerch.add(lineGross[i]);
    }
    BigDecimal sumAfter = BigDecimal.ZERO;
    for (BigDecimal b : lineAfterProd) {
      sumAfter = sumAfter.add(b);
    }
    BigDecimal globalD = bestGlobalDiscount(promos, sumAfter).setScale(2, RoundingMode.HALF_UP);
    BigDecimal[] globalShares = distributeProportional(globalD, lineAfterProd);
    BigDecimal[] finalLine = new BigDecimal[n];
    BigDecimal netMerch = BigDecimal.ZERO;
    for (int i = 0; i < n; i++) {
      BigDecimal fl =
          lineAfterProd[i].subtract(globalShares[i]).setScale(2, RoundingMode.HALF_UP);
      if (fl.compareTo(BigDecimal.ZERO) < 0) {
        fl = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
      }
      finalLine[i] = fl;
      netMerch = netMerch.add(fl);
    }
    BigDecimal discountTotal = grossMerch.subtract(netMerch).setScale(2, RoundingMode.HALF_UP);
    return new CartPricingResult(
        grossMerch.setScale(2, RoundingMode.HALF_UP),
        discountTotal,
        netMerch.setScale(2, RoundingMode.HALF_UP),
        finalLine);
  }
}
