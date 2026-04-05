package com.dondesalem.api.dto.product;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProductSummaryDto(
    Long id,
    String name,
    String slug,
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
    Boolean active) {}
