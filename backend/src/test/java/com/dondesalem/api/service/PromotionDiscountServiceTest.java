package com.dondesalem.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.dondesalem.api.domain.Promotion;
import com.dondesalem.api.domain.PromotionType;
import com.dondesalem.api.dto.cart.CartPricingResult;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.junit.jupiter.api.Test;

class PromotionDiscountServiceTest {

  @Test
  void discountForLine_percentage() {
    BigDecimal d =
        PromotionDiscountService.discountForLine(
            PromotionType.PORCENTAJE,
            new BigDecimal("10"),
            new BigDecimal("100.00"));
    assertEquals(0, new BigDecimal("10.00").compareTo(d));
  }

  @Test
  void computeTotals_empty() {
    CartPricingResult r =
        PromotionDiscountService.computeTotals(new long[0], new BigDecimal[0], List.of());
    assertEquals(0, r.finalLineAmounts().length);
    assertEquals(0, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP).compareTo(r.merchandiseGross()));
    assertEquals(0, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP).compareTo(r.discountTotal()));
  }

  @Test
  void computeTotals_oneLine_noPromos() {
    long[] ids = {1L};
    BigDecimal[] gross = {new BigDecimal("100.00")};
    CartPricingResult r = PromotionDiscountService.computeTotals(ids, gross, List.of());
    assertEquals(0, new BigDecimal("100.00").compareTo(r.netMerchandise()));
    assertEquals(0, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP).compareTo(r.discountTotal()));
    assertEquals(1, r.finalLineAmounts().length);
    assertEquals(0, new BigDecimal("100.00").compareTo(r.finalLineAmounts()[0]));
  }

  @Test
  void distributeProportional_twoLines() {
    BigDecimal[] bases = {new BigDecimal("50.00"), new BigDecimal("50.00")};
    BigDecimal[] shares = PromotionDiscountService.distributeProportional(new BigDecimal("10.00"), bases);
    assertEquals(2, shares.length);
    assertEquals(0, new BigDecimal("5.00").compareTo(shares[0]));
    assertEquals(0, new BigDecimal("5.00").compareTo(shares[1]));
  }

  @Test
  void bestGlobalDiscount_emptyPromos() {
    BigDecimal d = PromotionDiscountService.bestGlobalDiscount(List.of(), new BigDecimal("100.00"));
    assertEquals(0, BigDecimal.ZERO.compareTo(d));
  }

  @Test
  void bestProductDiscount_respectsProductId() {
    Promotion p = new Promotion();
    p.setPromoType(PromotionType.PORCENTAJE);
    p.setValue(new BigDecimal("20"));
    // sin producto asociado → no aplica a bestProductDiscount
    BigDecimal d =
        PromotionDiscountService.bestProductDiscount(List.of(p), 1L, new BigDecimal("100.00"));
    assertEquals(0, BigDecimal.ZERO.compareTo(d));
  }
}
