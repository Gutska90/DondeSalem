package com.dondesalem.api.dto.product;

import com.dondesalem.api.domain.ProductType;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ProductSummaryDto(
    Long id,
    String name,
    String slug,
    ProductType productType,
    BigDecimal price,
    BigDecimal compareAtPrice,
    Integer stockQuantity,
    String categoryName,
    String categorySlug,
    String gameName,
    String gameSlug,
    String primaryImageUrl,
    Boolean preorder,
    LocalDate preorderReleaseDate,
    Boolean featured,
    Boolean active,
    SingleCardSummaryDto singleCard,
    /** Solo admin: unidades reservadas por pedidos pendientes; en tienda suele ser null. */
    Integer reservedQuantity) {}
