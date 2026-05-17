package com.dondesalem.api.service;

import com.dondesalem.api.domain.Product;
import com.dondesalem.api.domain.ProductImage;
import com.dondesalem.api.domain.SingleCardDetails;
import com.dondesalem.api.dto.product.ProductDetailDto;
import com.dondesalem.api.dto.product.ProductImageDto;
import com.dondesalem.api.dto.product.ProductSummaryDto;
import com.dondesalem.api.dto.product.SingleCardDetailsDto;
import com.dondesalem.api.dto.product.SingleCardSummaryDto;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public final class ProductMapper {

  private ProductMapper() {}

  /** Catálogo / tienda: {@code stockQuantity} es lo comprable ahora (físico − reservado). */
  public static ProductSummaryDto toSummaryStorefront(Product p) {
    return toSummaryInternal(p, p.availableToSell(), null);
  }

  /** Admin: stock físico en depósito y reservado por pedidos pendientes. */
  public static ProductSummaryDto toSummaryAdmin(Product p) {
    int reserved = p.getReservedQuantity() != null ? p.getReservedQuantity() : 0;
    return toSummaryInternal(p, p.getStockQuantity(), reserved);
  }

  private static ProductSummaryDto toSummaryInternal(
      Product p, int stockForDto, Integer reservedQuantity) {
    String img = primaryImageUrl(p);
    SingleCardSummaryDto sc = toSingleCardSummary(p.getSingleCardDetails());
    return new ProductSummaryDto(
        p.getId(),
        p.getName(),
        p.getSlug(),
        p.getProductType(),
        p.getPrice(),
        p.getCompareAtPrice(),
        stockForDto,
        p.getCategory() != null ? p.getCategory().getName() : null,
        p.getCategory() != null ? p.getCategory().getSlug() : null,
        p.getGame() != null ? p.getGame().getName() : null,
        p.getGame() != null ? p.getGame().getSlug() : null,
        img,
        p.getPreorder(),
        p.getPreorderReleaseDate(),
        p.getFeatured(),
        p.getActive(),
        sc,
        reservedQuantity);
  }

  private static SingleCardSummaryDto toSingleCardSummary(SingleCardDetails s) {
    if (s == null) {
      return null;
    }
    return new SingleCardSummaryDto(
        s.getCardName(),
        s.getSetName(),
        s.getCardNumber(),
        s.getRarity(),
        s.getCardCondition(),
        s.getLanguage(),
        s.getFinishType(),
        s.getBloque());
  }

  public static ProductDetailDto toDetailStorefront(Product p) {
    return toDetailInternal(p, p.availableToSell(), null);
  }

  public static ProductDetailDto toDetailAdmin(Product p) {
    int reserved = p.getReservedQuantity() != null ? p.getReservedQuantity() : 0;
    return toDetailInternal(p, p.getStockQuantity(), reserved);
  }

  private static ProductDetailDto toDetailInternal(
      Product p, int stockForDto, Integer reservedQuantity) {
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
        p.getProductType(),
        p.getDescription(),
        p.getPrice(),
        p.getCompareAtPrice(),
        stockForDto,
        p.getSku(),
        p.getCategory() != null ? p.getCategory().getName() : null,
        p.getCategory() != null ? p.getCategory().getSlug() : null,
        p.getCategory() != null ? p.getCategory().getId() : null,
        p.getGame() != null ? p.getGame().getName() : null,
        p.getGame() != null ? p.getGame().getSlug() : null,
        p.getGame() != null ? p.getGame().getId() : null,
        toSingleCardDetailsDto(p.getSingleCardDetails()),
        p.getPreorder(),
        p.getPreorderReleaseDate(),
        p.getActive(),
        p.getFeatured(),
        imgs,
        tags,
        reservedQuantity);
  }

  private static SingleCardDetailsDto toSingleCardDetailsDto(SingleCardDetails s) {
    if (s == null) {
      return null;
    }
    return new SingleCardDetailsDto(
        s.getCardName(),
        s.getSetName(),
        s.getCardNumber(),
        s.getRarity(),
        s.getCardCondition(),
        s.getLanguage(),
        s.getFinishType(),
        s.getBloque(),
        s.getEditionType(),
        s.getArtist(),
        s.getManaCostOrCost(),
        s.getAttributeOrColor(),
        s.getGradeOrCertification(),
        s.getMetadataJson());
  }

  private static String primaryImageUrl(Product p) {
    return p.getImages().stream()
        .min(Comparator.comparing(ProductImage::getSortOrder))
        .map(ProductImage::getUrl)
        .orElse(null);
  }
}
