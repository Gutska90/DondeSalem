package com.dondesalem.api.service;

import com.dondesalem.api.domain.Product;
import com.dondesalem.api.domain.ProductType;
import com.dondesalem.api.domain.SingleCardDetails;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
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

  /**
   * Búsqueda de texto: nombre del producto o (si hay detalle) carta, set y rareza del single.
   * Usa EXISTS sobre {@link SingleCardDetails} para no duplicar JOINs con otros filtros de single.
   */
  public static Specification<Product> catalogTextSearch(String term) {
    if (term == null || term.isBlank()) {
      return (root, q, cb) -> cb.conjunction();
    }
    String pattern = "%" + term.trim().toLowerCase() + "%";
    return (root, query, cb) -> {
      Subquery<Long> sq = query.subquery(Long.class);
      Root<SingleCardDetails> sc = sq.from(SingleCardDetails.class);
      sq.select(sc.get("product").get("id"));
      sq.where(
          cb.and(
              cb.equal(sc.get("product").get("id"), root.get("id")),
              cb.or(
                  cb.like(cb.lower(sc.get("cardName")), pattern),
                  cb.like(cb.lower(sc.get("setName")), pattern),
                  cb.like(cb.lower(sc.get("rarity")), pattern))));
      return cb.or(cb.like(cb.lower(root.get("name")), pattern), cb.exists(sq));
    };
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
    // Disponible = stock físico − reservado
    return (root, q, cb) ->
        cb.greaterThan(
            root.get("stockQuantity"), cb.coalesce(root.get("reservedQuantity"), cb.literal(0)));
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

  public static Specification<Product> productTypeEquals(ProductType type) {
    if (type == null) {
      return (root, q, cb) -> cb.conjunction();
    }
    return (root, q, cb) -> cb.equal(root.get("productType"), type);
  }

  public static Specification<Product> excludeSingles(boolean excludeSingles) {
    if (!excludeSingles) {
      return (root, q, cb) -> cb.conjunction();
    }
    return (root, q, cb) -> cb.notEqual(root.get("productType"), ProductType.SINGLE_CARD);
  }

  public static Specification<Product> singleCardCardNameContains(String term) {
    if (term == null || term.isBlank()) {
      return (root, q, cb) -> cb.conjunction();
    }
    String pattern = "%" + term.trim().toLowerCase() + "%";
    return (root, q, cb) -> {
      Join<Object, Object> sc = root.join("singleCardDetails", JoinType.INNER);
      return cb.and(
          cb.equal(root.get("productType"), ProductType.SINGLE_CARD),
          cb.like(cb.lower(sc.get("cardName")), pattern));
    };
  }

  public static Specification<Product> singleCardSetNameContains(String term) {
    if (term == null || term.isBlank()) {
      return (root, q, cb) -> cb.conjunction();
    }
    String pattern = "%" + term.trim().toLowerCase() + "%";
    return (root, q, cb) -> {
      Join<Object, Object> sc = root.join("singleCardDetails", JoinType.INNER);
      return cb.and(
          cb.equal(root.get("productType"), ProductType.SINGLE_CARD),
          cb.like(cb.lower(sc.get("setName")), pattern));
    };
  }

  public static Specification<Product> singleCardRarityEquals(String value) {
    if (value == null || value.isBlank()) {
      return (root, q, cb) -> cb.conjunction();
    }
    String v = value.trim().toLowerCase();
    return (root, q, cb) -> {
      Join<Object, Object> sc = root.join("singleCardDetails", JoinType.INNER);
      return cb.and(
          cb.equal(root.get("productType"), ProductType.SINGLE_CARD),
          cb.equal(cb.lower(sc.get("rarity")), v));
    };
  }

  /** Rareza parcial (p. ej. "MR", "Legendaria") — catálogo público. */
  public static Specification<Product> singleCardRarityContains(String term) {
    if (term == null || term.isBlank()) {
      return (root, q, cb) -> cb.conjunction();
    }
    String pattern = "%" + term.trim().toLowerCase() + "%";
    return (root, q, cb) -> {
      Join<Object, Object> sc = root.join("singleCardDetails", JoinType.INNER);
      return cb.and(
          cb.equal(root.get("productType"), ProductType.SINGLE_CARD),
          cb.like(cb.lower(sc.get("rarity")), pattern));
    };
  }

  public static Specification<Product> singleCardConditionEquals(String value) {
    if (value == null || value.isBlank()) {
      return (root, q, cb) -> cb.conjunction();
    }
    String v = value.trim().toLowerCase();
    return (root, q, cb) -> {
      Join<Object, Object> sc = root.join("singleCardDetails", JoinType.INNER);
      return cb.and(
          cb.equal(root.get("productType"), ProductType.SINGLE_CARD),
          cb.equal(cb.lower(sc.get("cardCondition")), v));
    };
  }

  public static Specification<Product> singleCardLanguageEquals(String value) {
    if (value == null || value.isBlank()) {
      return (root, q, cb) -> cb.conjunction();
    }
    String v = value.trim().toLowerCase();
    return (root, q, cb) -> {
      Join<Object, Object> sc = root.join("singleCardDetails", JoinType.INNER);
      return cb.and(
          cb.equal(root.get("productType"), ProductType.SINGLE_CARD),
          cb.equal(cb.lower(sc.get("language")), v));
    };
  }

  public static Specification<Product> singleCardFinishTypeEquals(String value) {
    if (value == null || value.isBlank()) {
      return (root, q, cb) -> cb.conjunction();
    }
    String v = value.trim().toLowerCase();
    return (root, q, cb) -> {
      Join<Object, Object> sc = root.join("singleCardDetails", JoinType.INNER);
      return cb.and(
          cb.equal(root.get("productType"), ProductType.SINGLE_CARD),
          cb.equal(cb.lower(sc.get("finishType")), v));
    };
  }

  public static Specification<Product> singleCardBloqueEquals(String bloque) {
    if (bloque == null || bloque.isBlank()) {
      return (root, q, cb) -> cb.conjunction();
    }
    String normalized = bloque.trim().toUpperCase();
    if (!"PE".equals(normalized) && !"PB".equals(normalized)) {
      return (root, q, cb) -> cb.conjunction();
    }
    return (root, q, cb) -> {
      Join<Object, Object> sc = root.join("singleCardDetails", JoinType.INNER);
      return cb.and(
          cb.equal(root.get("productType"), ProductType.SINGLE_CARD),
          cb.equal(cb.upper(sc.get("bloque")), normalized));
    };
  }
}
