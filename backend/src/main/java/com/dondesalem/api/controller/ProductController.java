package com.dondesalem.api.controller;

import com.dondesalem.api.domain.ProductType;
import com.dondesalem.api.dto.PageResponse;
import com.dondesalem.api.dto.product.ProductDetailDto;
import com.dondesalem.api.dto.product.ProductSummaryDto;
import com.dondesalem.api.service.ProductService;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

  private final ProductService productService;

  public ProductController(ProductService productService) {
    this.productService = productService;
  }

  @GetMapping
  public PageResponse<ProductSummaryDto> list(
      @RequestParam(required = false) String category,
      @RequestParam(required = false) String game,
      @RequestParam(required = false) String q,
      @RequestParam(required = false) BigDecimal minPrice,
      @RequestParam(required = false) BigDecimal maxPrice,
      @RequestParam(required = false) Boolean inStock,
      @RequestParam(required = false) Boolean preorder,
      @RequestParam(required = false) String productType,
      @RequestParam(required = false) String cardName,
      @RequestParam(required = false) String setName,
      @RequestParam(required = false) String rarity,
      @RequestParam(required = false) String condition,
      @RequestParam(required = false) String language,
      @RequestParam(required = false) String finishType,
      @RequestParam(required = false) String bloque,
      @RequestParam(required = false) String era,
      @RequestParam(defaultValue = "false") boolean excludeSingles,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size) {
    return productService.search(
        category,
        game,
        q,
        minPrice,
        maxPrice,
        inStock,
        preorder,
        parseProductType(productType),
        cardName,
        setName,
        rarity,
        condition,
        language,
        finishType,
        normalizeBloque(bloque, era),
        excludeSingles,
        page,
        size);
  }

  private static String normalizeBloque(String bloque, String era) {
    String value = (bloque != null && !bloque.isBlank()) ? bloque : era;
    if (value == null || value.isBlank()) {
      return null;
    }
    String normalized = value.trim().toUpperCase();
    return switch (normalized) {
      case "PE", "PB" -> normalized;
      default -> null;
    };
  }

  private static ProductType parseProductType(String raw) {
    if (raw == null || raw.isBlank()) {
      return null;
    }
    try {
      return ProductType.valueOf(raw.trim().toUpperCase());
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  @GetMapping("/featured")
  public List<ProductSummaryDto> featured(@RequestParam(defaultValue = "8") int limit) {
    return productService.featured(Math.min(limit, 24));
  }

  @GetMapping("/slug/{slug}")
  public ProductDetailDto bySlug(@PathVariable String slug) {
    return productService.getPublicBySlug(slug);
  }
}
