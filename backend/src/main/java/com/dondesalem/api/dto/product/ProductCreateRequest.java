package com.dondesalem.api.dto.product;

import com.dondesalem.api.domain.ProductType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ProductCreateRequest(
    @NotBlank String name,
    @NotBlank String slug,
    String description,
    @NotNull @PositiveOrZero BigDecimal price,
    BigDecimal compareAtPrice,
    @NotNull @PositiveOrZero Integer stockQuantity,
    String sku,
    @NotNull Long categoryId,
    Long gameId,
    ProductType productType,
    SingleCardDetailsRequest singleCardDetails,
    boolean preorder,
    LocalDate preorderReleaseDate,
    boolean active,
    boolean featured,
    List<String> imageUrls,
    List<Long> tagIds) {}
