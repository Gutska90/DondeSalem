package com.dondesalem.api.service;

import com.dondesalem.api.domain.Category;
import com.dondesalem.api.domain.Game;
import com.dondesalem.api.domain.Product;
import com.dondesalem.api.domain.ProductImage;
import com.dondesalem.api.domain.Tag;
import com.dondesalem.api.dto.PageResponse;
import com.dondesalem.api.dto.product.ProductCreateRequest;
import com.dondesalem.api.dto.product.ProductDetailDto;
import com.dondesalem.api.dto.product.ProductSummaryDto;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.repository.CategoryRepository;
import com.dondesalem.api.repository.GameRepository;
import com.dondesalem.api.repository.ProductRepository;
import com.dondesalem.api.repository.TagRepository;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;
  private final GameRepository gameRepository;
  private final TagRepository tagRepository;

  public ProductService(
      ProductRepository productRepository,
      CategoryRepository categoryRepository,
      GameRepository gameRepository,
      TagRepository tagRepository) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
    this.gameRepository = gameRepository;
    this.tagRepository = tagRepository;
  }

  @Transactional(readOnly = true)
  public PageResponse<ProductSummaryDto> search(
      String categorySlug,
      String gameSlug,
      String search,
      BigDecimal minPrice,
      BigDecimal maxPrice,
      Boolean inStockOnly,
      Boolean preorder,
      int page,
      int size) {
    Specification<Product> spec =
        Specification.where(ProductSpecs.activeTrue())
            .and(ProductSpecs.categorySlug(categorySlug))
            .and(ProductSpecs.gameSlug(gameSlug))
            .and(ProductSpecs.nameContains(search))
            .and(ProductSpecs.priceAtLeast(minPrice))
            .and(ProductSpecs.priceAtMost(maxPrice))
            .and(ProductSpecs.inStockOnly(Boolean.TRUE.equals(inStockOnly)));
    if (preorder != null) {
      spec = spec.and(ProductSpecs.preorder(preorder));
    }
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<Product> result = productRepository.findAll(spec, pageable);
    return PageResponse.from(result.map(ProductMapper::toSummary));
  }

  /**
   * Listado admin: incluye inactivos; filtros opcionales por categoría, estado y bajo stock.
   */
  @Transactional(readOnly = true)
  public PageResponse<ProductSummaryDto> adminSearch(
      String search,
      Long categoryId,
      Boolean active,
      Boolean lowStockOnly,
      int lowStockThreshold,
      int page,
      int size) {
    Specification<Product> spec =
        Specification.where(ProductSpecs.nameContains(search))
            .and(ProductSpecs.categoryId(categoryId))
            .and(ProductSpecs.activeEquals(active));
    if (Boolean.TRUE.equals(lowStockOnly)) {
      spec = spec.and(ProductSpecs.stockBelow(lowStockThreshold));
    }
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<Product> result = productRepository.findAll(spec, pageable);
    return PageResponse.from(result.map(ProductMapper::toSummary));
  }

  @Transactional(readOnly = true)
  public ProductDetailDto getPublicBySlug(String slug) {
    Product p =
        productRepository
            .findBySlugAndActiveTrue(slug)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    return ProductMapper.toDetail(p);
  }

  @Transactional(readOnly = true)
  public ProductDetailDto getByIdForAdmin(Long id) {
    Product p =
        productRepository
            .findDetailById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    return ProductMapper.toDetail(p);
  }

  @Transactional(readOnly = true)
  public List<ProductSummaryDto> featured(int limit) {
    return productRepository.findTop8ByFeaturedTrueAndActiveTrueOrderByCreatedAtDesc().stream()
        .limit(limit)
        .map(ProductMapper::toSummary)
        .collect(Collectors.toList());
  }

  @Transactional
  public ProductDetailDto create(ProductCreateRequest req) {
    if (productRepository.findBySlug(req.slug()).isPresent()) {
      throw new ApiException(HttpStatus.CONFLICT, "Slug ya existe");
    }
    Category cat =
        categoryRepository
            .findById(req.categoryId())
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Categoría inválida"));
    Product p = new Product();
    p.setName(req.name().trim());
    p.setSlug(req.slug().trim().toLowerCase());
    p.setDescription(req.description());
    p.setPrice(req.price());
    p.setCompareAtPrice(req.compareAtPrice());
    p.setStockQuantity(req.stockQuantity());
    p.setSku(req.sku());
    p.setCategory(cat);
    if (req.gameId() != null) {
      Game g =
          gameRepository
              .findById(req.gameId())
              .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Juego inválido"));
      p.setGame(g);
    }
    p.setPreorder(req.preorder());
    p.setPreorderReleaseDate(req.preorderReleaseDate());
    p.setActive(req.active());
    p.setFeatured(req.featured());
    p = productRepository.save(p);
    if (req.imageUrls() != null) {
      int i = 0;
      for (String url : req.imageUrls()) {
        if (url == null || url.isBlank()) continue;
        ProductImage img = new ProductImage();
        img.setProduct(p);
        img.setUrl(url.trim());
        img.setSortOrder(i++);
        img.setAltText(p.getName());
        p.getImages().add(img);
      }
    }
    if (req.tagIds() != null && !req.tagIds().isEmpty()) {
      Set<Tag> tags = new HashSet<>(tagRepository.findAllById(req.tagIds()));
      p.setTags(tags);
    }
    productRepository.save(p);
    return ProductMapper.toDetail(productRepository.findDetailById(p.getId()).orElseThrow());
  }

  @Transactional
  public ProductDetailDto update(Long id, ProductCreateRequest req) {
    Product p =
        productRepository
            .findDetailById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    productRepository
        .findBySlug(req.slug())
        .filter(other -> !other.getId().equals(id))
        .ifPresent(
            x -> {
              throw new ApiException(HttpStatus.CONFLICT, "Slug ya existe");
            });
    Category cat =
        categoryRepository
            .findById(req.categoryId())
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Categoría inválida"));
    p.setName(req.name().trim());
    p.setSlug(req.slug().trim().toLowerCase());
    p.setDescription(req.description());
    p.setPrice(req.price());
    p.setCompareAtPrice(req.compareAtPrice());
    p.setStockQuantity(req.stockQuantity());
    p.setSku(req.sku());
    p.setCategory(cat);
    p.setGame(null);
    if (req.gameId() != null) {
      Game g =
          gameRepository
              .findById(req.gameId())
              .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Juego inválido"));
      p.setGame(g);
    }
    p.setPreorder(req.preorder());
    p.setPreorderReleaseDate(req.preorderReleaseDate());
    p.setActive(req.active());
    p.setFeatured(req.featured());
    p.getImages().clear();
    if (req.imageUrls() != null) {
      int i = 0;
      for (String url : req.imageUrls()) {
        if (url == null || url.isBlank()) continue;
        ProductImage img = new ProductImage();
        img.setProduct(p);
        img.setUrl(url.trim());
        img.setSortOrder(i++);
        img.setAltText(p.getName());
        p.getImages().add(img);
      }
    }
    p.getTags().clear();
    if (req.tagIds() != null && !req.tagIds().isEmpty()) {
      p.getTags().addAll(new HashSet<>(tagRepository.findAllById(req.tagIds())));
    }
    productRepository.save(p);
    return ProductMapper.toDetail(productRepository.findDetailById(p.getId()).orElseThrow());
  }

  @Transactional
  public void delete(Long id) {
    if (!productRepository.existsById(id)) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado");
    }
    productRepository.deleteById(id);
  }
}
