package com.dondesalem.api.service;

import com.dondesalem.api.domain.Product;
import com.dondesalem.api.domain.ProductImage;
import com.dondesalem.api.domain.ProductType;
import com.dondesalem.api.repository.ProductRepository;
import com.dondesalem.api.seed.MylserenaPeSinglesRow;
import com.dondesalem.api.seed.MylserenaPeSinglesSyncResult;
import com.dondesalem.api.seed.MylserenaSinglesEraStatsResult;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Actualiza precios (y URL de imagen principal) de singles importados desde Mylserena comparando
 * con {@code seed/mylserena-pe-singles.json} y {@code seed/mylserena-pb-singles.json} (mismas
 * filas que import; si un pathSlug aparece en ambos, gana el PB). No inserta productos nuevos.
 */
@Service
public class MylserenaPeSinglesSyncService {

  private static final Logger log = LoggerFactory.getLogger(MylserenaPeSinglesSyncService.class);
  private static final String RESOURCE_PE = "seed/mylserena-pe-singles.json";
  private static final String RESOURCE_PB = "seed/mylserena-pb-singles.json";
  private static final String SLUG_PREFIX = "myl-pe-";

  private final ProductRepository products;
  private final ObjectMapper objectMapper;

  public MylserenaPeSinglesSyncService(ProductRepository products, ObjectMapper objectMapper) {
    this.products = products;
    this.objectMapper = objectMapper;
  }

  @Transactional
  public MylserenaPeSinglesSyncResult syncFromClasspath() {
    List<MylserenaPeSinglesRow> rows = loadRows();
    int updated = 0;
    int skippedMissing = 0;
    int skippedNotMyl = 0;

    for (MylserenaPeSinglesRow row : rows) {
      String slug = SLUG_PREFIX + row.pathSlug();
      var opt = products.findBySlug(slug);
      if (opt.isEmpty()) {
        skippedMissing++;
        continue;
      }
      Product p = opt.get();
      if (!p.getSlug().startsWith(SLUG_PREFIX) || p.getProductType() != ProductType.SINGLE_CARD) {
        skippedNotMyl++;
        continue;
      }

      boolean changed = false;
      if (p.getPrice().compareTo(row.price()) != 0) {
        log.debug("Mylserena sync precio {}: {} -> {}", slug, p.getPrice(), row.price());
        p.setPrice(row.price());
        changed = true;
      }

      String newImg =
          "https://cdnx.jumpseller.com/mylserena/image/"
              + row.imageId()
              + "/resize/600/800?"
              + row.imageVersion();
      Set<ProductImage> imgs = p.getImages();
      if (!imgs.isEmpty()) {
        ProductImage first =
            imgs.stream()
                .min(Comparator.comparingInt(ProductImage::getSortOrder))
                .orElse(imgs.iterator().next());
        if (!newImg.equals(first.getUrl())) {
          first.setUrl(newImg);
          changed = true;
        }
      }

      if (changed) {
        products.save(p);
        updated++;
      }
    }

    int zeroStock =
        (int)
            products.countByProductTypeAndSlugStartingWithAndStockQuantityLessThanEqual(
                ProductType.SINGLE_CARD, SLUG_PREFIX, 0);

    return new MylserenaPeSinglesSyncResult(rows.size(), updated, skippedMissing, skippedNotMyl, zeroStock);
  }

  @Transactional(readOnly = true)
  public MylserenaSinglesEraStatsResult eraStats() {
    long pe = 0;
    long pb = 0;
    long other = 0;
    List<Object[]> rows =
        products.countMylserenaSinglesGroupedByEra(ProductType.SINGLE_CARD, SLUG_PREFIX);
    for (Object[] row : rows) {
      Object eraObj = row[0];
      String era = eraObj instanceof String s ? s.toUpperCase(Locale.ROOT) : "OTHER";
      long count = row[1] instanceof Number n ? n.longValue() : 0L;
      switch (era) {
        case "PE" -> pe += count;
        case "PB" -> pb += count;
        default -> other += count;
      }
    }
    return new MylserenaSinglesEraStatsResult(pe + pb + other, pe, pb, other);
  }

  private List<MylserenaPeSinglesRow> loadRows() {
    List<MylserenaPeSinglesRow> merged = new ArrayList<>();
    LinkedHashMap<String, MylserenaPeSinglesRow> byPath = new LinkedHashMap<>();
    for (MylserenaPeSinglesRow row : loadResource(RESOURCE_PE)) {
      byPath.put(row.pathSlug(), row);
    }
    for (MylserenaPeSinglesRow row : loadResource(RESOURCE_PB)) {
      byPath.put(row.pathSlug(), row);
    }
    merged.addAll(byPath.values());
    return merged;
  }

  private List<MylserenaPeSinglesRow> loadResource(String classpathLocation) {
    ClassPathResource res = new ClassPathResource(classpathLocation);
    if (!res.exists()) {
      return List.of();
    }
    try (InputStream in = res.getInputStream()) {
      return objectMapper.readValue(in, new TypeReference<List<MylserenaPeSinglesRow>>() {});
    } catch (IOException e) {
      throw new UncheckedIOException("No se pudo leer classpath:" + classpathLocation, e);
    }
  }
}
