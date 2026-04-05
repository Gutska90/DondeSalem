package com.dondesalem.api.service;

import com.dondesalem.api.domain.Product;
import java.math.BigDecimal;
import org.springframework.data.jpa.domain.Specification;

public final class ProductSpecs {

  private ProductSpecs() {}

  public static Specification<Product> activeTrue() {
    return (root, q, cb) -> cb.isTrue(root.get("active"));
  }

  public static Specification<Product> categorySlug(String slug) {
    if (slug == null || slug.isBlank()) {
      return (root, q, cb) -> cb.conjunction();
    }
    return (root, q, cb) -> cb.equal(root.get("category").get("slug"), slug);
  }

  public static Specification<Product> gameSlug(String slug) {
    if (slug == null || slug.isBlank()) {
      return (root, q, cb) -> cb.conjunction();
    }
    return (root, q, cb) -> cb.equal(root.get("game").get("slug"), slug);
  }

  public static Specification<Product> nameContains(String term) {
    if (term == null || term.isBlank()) {
      return (root, q, cb) -> cb.conjunction();
    }
    String pattern = "%" + term.trim().toLowerCase() + "%";
    return (root, q, cb) -> cb.like(cb.lower(root.get("name")), pattern);
  }

  public static Specification<Product> priceAtLeast(BigDecimal min) {
    if (min == null) {
      return (root, q, cb) -> cb.conjunction();
    }
    return (root, q, cb) -> cb.greaterThanOrEqualTo(root.get("price"), min);
  }

  public static Specification<Product> priceAtMost(BigDecimal max) {
    if (max == null) {
      return (root, q, cb) -> cb.conjunction();
    }
    return (root, q, cb) -> cb.lessThanOrEqualTo(root.get("price"), max);
  }

  public static Specification<Product> inStockOnly(boolean onlyInStock) {
    if (!onlyInStock) {
      return (root, q, cb) -> cb.conjunction();
    }
    return (root, q, cb) -> cb.greaterThan(root.get("stockQuantity"), 0);
  }

  public static Specification<Product> preorder(boolean preorder) {
    return (root, q, cb) -> cb.equal(root.get("preorder"), preorder);
  }

  public static Specification<Product> categoryId(Long id) {
    if (id == null) {
      return (root, q, cb) -> cb.conjunction();
    }
    return (root, q, cb) -> cb.equal(root.get("category").get("id"), id);
  }

  public static Specification<Product> activeEquals(Boolean active) {
    if (active == null) {
      return (root, q, cb) -> cb.conjunction();
    }
    return (root, q, cb) -> cb.equal(root.get("active"), active);
  }

  /** Stock estrictamente menor que {@code threshold} (p. ej. alertas de bajo stock). */
  public static Specification<Product> stockBelow(int threshold) {
    return (root, q, cb) -> cb.lessThan(root.get("stockQuantity"), threshold);
  }
}
