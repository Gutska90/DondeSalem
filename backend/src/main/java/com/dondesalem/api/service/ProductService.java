package com.dondesalem.api.service;

import com.dondesalem.api.domain.Category;
import com.dondesalem.api.domain.Game;
import com.dondesalem.api.domain.Product;
import com.dondesalem.api.domain.ProductImage;
import com.dondesalem.api.domain.ProductType;
import com.dondesalem.api.domain.SingleCardDetails;
import com.dondesalem.api.domain.Tag;
import com.dondesalem.api.dto.PageResponse;
import com.dondesalem.api.dto.product.ProductBulkUpdateRequest;
import com.dondesalem.api.dto.product.ProductBulkUpdateResult;
import com.dondesalem.api.dto.product.ProductCreateRequest;
import com.dondesalem.api.dto.product.ProductDetailDto;
import com.dondesalem.api.dto.product.ProductSummaryDto;
import com.dondesalem.api.dto.product.SingleCardDetailsRequest;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.repository.CategoryRepository;
import com.dondesalem.api.repository.GameRepository;
import com.dondesalem.api.repository.ProductRepository;
import com.dondesalem.api.repository.TagRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
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

  @PersistenceContext private EntityManager em;

  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;
  private final GameRepository gameRepository;
  private final TagRepository tagRepository;
  private final ObjectMapper objectMapper;

  public ProductService(
      ProductRepository productRepository,
      CategoryRepository categoryRepository,
      GameRepository gameRepository,
      TagRepository tagRepository,
      ObjectMapper objectMapper) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
    this.gameRepository = gameRepository;
    this.tagRepository = tagRepository;
    this.objectMapper = objectMapper;
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
      ProductType productType,
      String cardName,
      String setName,
      String rarity,
      String cardCondition,
      String language,
      String finishType,
      String bloque,
      boolean excludeSingles,
      int page,
      int size) {
    Specification<Product> spec =
        Specification.where(ProductSpecs.activeTrue())
            .and(ProductSpecs.categorySlug(categorySlug))
            .and(ProductSpecs.gameSlug(gameSlug))
            .and(ProductSpecs.catalogTextSearch(search))
            .and(ProductSpecs.priceAtLeast(minPrice))
            .and(ProductSpecs.priceAtMost(maxPrice))
            .and(ProductSpecs.inStockOnly(Boolean.TRUE.equals(inStockOnly)))
            .and(ProductSpecs.productTypeEquals(productType))
            .and(ProductSpecs.singleCardCardNameContains(cardName))
            .and(ProductSpecs.singleCardSetNameContains(setName))
            .and(ProductSpecs.singleCardRarityContains(rarity))
            .and(ProductSpecs.singleCardConditionEquals(cardCondition))
            .and(ProductSpecs.singleCardLanguageEquals(language))
            .and(ProductSpecs.singleCardFinishTypeEquals(finishType))
            .and(ProductSpecs.singleCardBloqueEquals(bloque))
            .and(ProductSpecs.excludeSingles(excludeSingles));
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
      ProductType productType,
      String setName,
      String rarity,
      String cardCondition,
      String language,
      String finishType,
      String bloque,
      int page,
      int size) {
    Specification<Product> spec =
        adminFilterSpec(
            search, categoryId, active, lowStockOnly, lowStockThreshold, productType, setName, rarity,
            cardCondition, language, finishType, bloque);
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<Product> result = productRepository.findAll(spec, pageable);
    return PageResponse.from(result.map(ProductMapper::toSummary));
  }

  @Transactional(readOnly = true)
  public PageResponse<Long> adminSearchIdsPage(
      String search,
      Long categoryId,
      Boolean active,
      Boolean lowStockOnly,
      int lowStockThreshold,
      ProductType productType,
      String setName,
      String rarity,
      String cardCondition,
      String language,
      String finishType,
      String bloque,
      int page,
      int size) {
    int safePage = Math.max(0, page);
    int safeSize = Math.min(Math.max(1, size), 2000);
    Specification<Product> spec =
        adminFilterSpec(
            search, categoryId, active, lowStockOnly, lowStockThreshold, productType, setName, rarity,
            cardCondition, language, finishType, bloque);

    CriteriaQuery<Long> idQuery = em.getCriteriaBuilder().createQuery(Long.class);
    Root<Product> root = idQuery.from(Product.class);
    idQuery.select(root.get("id"));
    idQuery.where(spec.toPredicate(root, idQuery, em.getCriteriaBuilder()));
    idQuery.orderBy(em.getCriteriaBuilder().desc(root.get("createdAt")));
    TypedQuery<Long> tq = em.createQuery(idQuery);
    tq.setFirstResult(safePage * safeSize);
    tq.setMaxResults(safeSize);
    List<Long> ids = tq.getResultList();

    CriteriaQuery<Long> countQuery = em.getCriteriaBuilder().createQuery(Long.class);
    Root<Product> countRoot = countQuery.from(Product.class);
    countQuery.select(em.getCriteriaBuilder().countDistinct(countRoot));
    countQuery.where(spec.toPredicate(countRoot, countQuery, em.getCriteriaBuilder()));
    long total = em.createQuery(countQuery).getSingleResult();
    int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / (double) safeSize);
    return new PageResponse<>(ids, safePage, safeSize, total, totalPages);
  }

  private static Specification<Product> adminFilterSpec(
      String search,
      Long categoryId,
      Boolean active,
      Boolean lowStockOnly,
      int lowStockThreshold,
      ProductType productType,
      String setName,
      String rarity,
      String cardCondition,
      String language,
      String finishType,
      String bloque) {
    Specification<Product> spec =
        Specification.where(ProductSpecs.catalogTextSearch(search))
            .and(ProductSpecs.categoryId(categoryId))
            .and(ProductSpecs.activeEquals(active))
            .and(ProductSpecs.productTypeEquals(productType))
            .and(ProductSpecs.singleCardSetNameContains(setName))
            .and(ProductSpecs.singleCardRarityEquals(rarity))
            .and(ProductSpecs.singleCardConditionEquals(cardCondition))
            .and(ProductSpecs.singleCardLanguageEquals(language))
            .and(ProductSpecs.singleCardFinishTypeEquals(finishType))
            .and(ProductSpecs.singleCardBloqueEquals(bloque));
    if (Boolean.TRUE.equals(lowStockOnly)) {
      spec = spec.and(ProductSpecs.stockBelow(lowStockThreshold));
    }
    return spec;
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
    int n = Math.min(Math.max(limit, 1), 24);
    return productRepository
        .findFeaturedHomeExcluding(ProductType.SINGLE_CARD, PageRequest.of(0, n))
        .stream()
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
    syncSingleCardDetails(p, req);
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
    syncSingleCardDetails(p, req);
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

  @Transactional
  public ProductBulkUpdateResult bulkUpdate(ProductBulkUpdateRequest req) {
    if ((req.active() == null) && (req.stockDelta() == null || req.stockDelta() == 0)) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "Debés indicar al menos un cambio (active o stockDelta)");
    }
    List<Product> products = productRepository.findAllById(req.productIds());
    if (products.isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "No se encontraron productos para actualizar");
    }
    for (Product p : products) {
      if (req.active() != null) {
        p.setActive(req.active());
      }
      if (req.stockDelta() != null && req.stockDelta() != 0) {
        int next = p.getStockQuantity() + req.stockDelta();
        p.setStockQuantity(Math.max(0, next));
      }
    }
    productRepository.saveAll(products);
    return new ProductBulkUpdateResult(req.productIds().size(), products.size());
  }

  private static ProductType resolveProductType(ProductCreateRequest req) {
    return req.productType() != null ? req.productType() : ProductType.SEALED_TCG;
  }

  private void syncSingleCardDetails(Product p, ProductCreateRequest req) {
    ProductType type = resolveProductType(req);
    p.setProductType(type);
    if (type != ProductType.SINGLE_CARD) {
      p.setSingleCardDetails(null);
      return;
    }
    SingleCardDetailsRequest sc = req.singleCardDetails();
    if (sc == null || sc.cardName() == null || sc.cardName().isBlank()) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "Los productos tipo single requieren nombre de carta");
    }
    SingleCardDetails d = p.getSingleCardDetails();
    if (d == null) {
      d = new SingleCardDetails();
      d.setProduct(p);
      p.setSingleCardDetails(d);
    }
    d.setCardName(trimOrNull(sc.cardName()));
    d.setSetName(trimOrNull(sc.setName()));
    d.setCardNumber(trimOrNull(sc.cardNumber()));
    d.setRarity(trimOrNull(sc.rarity()));
    d.setCardCondition(trimOrNull(sc.condition()));
    d.setLanguage(trimOrNull(sc.language()));
    d.setFinishType(trimOrNull(sc.finishType()));
    d.setBloque(resolveBloque(sc.bloque(), sc.setName(), p.getName()));
    d.setEditionType(trimOrNull(sc.editionType()));
    d.setArtist(trimOrNull(sc.artist()));
    d.setManaCostOrCost(trimOrNull(sc.manaCostOrCost()));
    d.setAttributeOrColor(trimOrNull(sc.attributeOrColor()));
    d.setGradeOrCertification(trimOrNull(sc.gradeOrCertification()));
    d.setMetadataJson(validateAndNormalizeMetadataJson(sc.metadataJson()));
    assertNoConflictingSingle(p);
  }

  /**
   * Otro single con el mismo juego (o ambos sin juego) y misma huella de variante se considera
   * duplicado.
   */
  private void assertNoConflictingSingle(Product p) {
    if (p.getProductType() != ProductType.SINGLE_CARD || p.getSingleCardDetails() == null) {
      return;
    }
    // Import Mylserena: los slugs myl-pe-* pueden existir duplicados por diseño (mismo nombre/variante
    // con sufijos -1, -2, etc.). Permitimos editar estos registros sin bloquear por "huella" de variante.
    if (p.getSlug() != null && p.getSlug().startsWith("myl-pe-")) {
      return;
    }
    Long gameId = p.getGame() != null ? p.getGame().getId() : null;
    SingleCardDetails sc = p.getSingleCardDetails();
    String cardName = normKey(sc.getCardName());
    if (cardName.isEmpty()) {
      return;
    }
    Optional<Long> otherId =
        productRepository.findIdBySingleVariantFingerprint(
            ProductType.SINGLE_CARD,
            gameId,
            cardName,
            normKeyOrEmpty(sc.getSetName()),
            normKeyOrEmpty(sc.getCardNumber()),
            normKeyOrEmpty(sc.getCardCondition()),
            normKeyOrEmpty(sc.getLanguage()),
            normKeyOrEmpty(sc.getFinishType()),
            p.getId());
    otherId.ifPresent(
        id -> {
          throw new ApiException(
              HttpStatus.CONFLICT,
              "Ya existe otro single con el mismo juego, carta, set, número, estado, idioma y acabado (id "
                  + id
                  + ")");
        });
  }

  private static String normKey(String s) {
    if (s == null) {
      return "";
    }
    return s.trim().toLowerCase(Locale.ROOT);
  }

  private static String normKeyOrEmpty(String s) {
    return normKey(s);
  }

  private String validateAndNormalizeMetadataJson(String raw) {
    String t = emptyToNull(raw);
    if (t == null) {
      return null;
    }
    try {
      objectMapper.readTree(t);
      return t;
    } catch (JsonProcessingException e) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "metadataJson no es JSON válido");
    }
  }

  private static String trimOrNull(String s) {
    if (s == null) {
      return null;
    }
    String t = s.trim();
    return t.isEmpty() ? null : t;
  }

  private static String resolveBloque(String explicit, String setName, String productName) {
    String fromExplicit = normalizeBloque(explicit);
    if (fromExplicit != null) {
      return fromExplicit;
    }
    String fromSet = normalizeBloque(inferBloqueCandidate(setName));
    if (fromSet != null) {
      return fromSet;
    }
    return normalizeBloque(inferBloqueCandidate(productName));
  }

  private static String inferBloqueCandidate(String text) {
    if (text == null) {
      return null;
    }
    String t = text.toLowerCase(Locale.ROOT);
    if (t.contains("primer bloque") || t.contains("(lbpb")) {
      return "PB";
    }
    if (t.contains("primera era") || t.contains("(lpe")) {
      return "PE";
    }
    return null;
  }

  private static String normalizeBloque(String raw) {
    if (raw == null) {
      return null;
    }
    String v = raw.trim().toUpperCase(Locale.ROOT);
    return ("PE".equals(v) || "PB".equals(v)) ? v : null;
  }

  private static String emptyToNull(String s) {
    if (s == null) {
      return null;
    }
    String t = s.trim();
    return t.isEmpty() ? null : t;
  }
}
