package com.dondesalem.api.controller;

import com.dondesalem.api.dto.PageResponse;
import com.dondesalem.api.dto.product.ProductCreateRequest;
import com.dondesalem.api.dto.product.ProductDetailDto;
import com.dondesalem.api.dto.product.ProductSummaryDto;
import com.dondesalem.api.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

  private final ProductService productService;

  public AdminProductController(ProductService productService) {
    this.productService = productService;
  }

  @GetMapping
  public PageResponse<ProductSummaryDto> list(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) Long categoryId,
      @RequestParam(required = false) Boolean active,
      @RequestParam(required = false) Boolean lowStockOnly,
      @RequestParam(defaultValue = "5") int lowStockThreshold,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return productService.adminSearch(
        search, categoryId, active, lowStockOnly, lowStockThreshold, page, size);
  }

  @GetMapping("/{id}")
  public ProductDetailDto get(@PathVariable Long id) {
    return productService.getByIdForAdmin(id);
  }

  @PostMapping
  public ProductDetailDto create(@Valid @RequestBody ProductCreateRequest request) {
    return productService.create(request);
  }

  @PutMapping("/{id}")
  public ProductDetailDto update(
      @PathVariable Long id, @Valid @RequestBody ProductCreateRequest request) {
    return productService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    productService.delete(id);
  }
}
