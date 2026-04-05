package com.dondesalem.api.service;

import com.dondesalem.api.domain.Product;
import com.dondesalem.api.domain.ProductImage;
import com.dondesalem.api.dto.product.ProductDetailDto;
import com.dondesalem.api.dto.product.ProductImageDto;
import com.dondesalem.api.dto.product.ProductSummaryDto;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public final class ProductMapper {

  private ProductMapper() {}

  public static ProductSummaryDto toSummary(Product p) {
    String img = primaryImageUrl(p);
    return new ProductSummaryDto(
        p.getId(),
        p.getName(),
        p.getSlug(),
        p.getPrice(),
        p.getCompareAtPrice(),
        p.getStockQuantity(),
        p.getCategory() != null ? p.getCategory().getName() : null,
        p.getCategory() != null ? p.getCategory().getSlug() : null,
        p.getGame() != null ? p.getGame().getName() : null,
        p.getGame() != null ? p.getGame().getSlug() : null,
        img,
        p.getPreorder(),
        p.getPreorderReleaseDate(),
        p.getFeatured(),
        p.getActive());
  }

  public static ProductDetailDto toDetail(Product p) {
    List<ProductImageDto> imgs =
        p.getImages().stream()
            .sorted(Comparator.comparing(ProductImage::getSortOrder))
            .map(i -> new ProductImageDto(i.getUrl(), i.getSortOrder(), i.getAltText()))
            .collect(Collectors.toList());
    List<String> tags =
        p.getTags().stream().map(t -> t.getSlug()).sorted().collect(Collectors.toList());
    return new ProductDetailDto(
        p.getId(),
        p.getName(),
        p.getSlug(),
        p.getDescription(),
        p.getPrice(),
        p.getCompareAtPrice(),
        p.getStockQuantity(),
        p.getSku(),
        p.getCategory() != null ? p.getCategory().getName() : null,
        p.getCategory() != null ? p.getCategory().getSlug() : null,
        p.getCategory() != null ? p.getCategory().getId() : null,
        p.getGame() != null ? p.getGame().getName() : null,
        p.getGame() != null ? p.getGame().getSlug() : null,
        p.getGame() != null ? p.getGame().getId() : null,
        p.getPreorder(),
        p.getPreorderReleaseDate(),
        p.getActive(),
        p.getFeatured(),
        imgs,
        tags);
  }

  private static String primaryImageUrl(Product p) {
    return p.getImages().stream()
        .min(Comparator.comparing(ProductImage::getSortOrder))
        .map(ProductImage::getUrl)
        .orElse(null);
  }
}
