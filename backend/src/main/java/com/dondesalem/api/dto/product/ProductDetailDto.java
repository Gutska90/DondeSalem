package com.dondesalem.api.dto.product;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ProductDetailDto(
    Long id,
    String name,
    String slug,
    String description,
    BigDecimal price,
    BigDecimal compareAtPrice,
    Integer stockQuantity,
    String sku,
    String categoryName,
    String categorySlug,
    Long categoryId,
    String gameName,
    String gameSlug,
    Long gameId,
    Boolean preorder,
    LocalDate preorderReleaseDate,
    Boolean active,
    Boolean featured,
    List<ProductImageDto> images,
    List<String> tagSlugs) {}
