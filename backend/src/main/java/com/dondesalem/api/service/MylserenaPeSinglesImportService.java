package com.dondesalem.api.service;

import com.dondesalem.api.domain.Category;
import com.dondesalem.api.domain.Game;
import com.dondesalem.api.domain.Product;
import com.dondesalem.api.domain.ProductImage;
import com.dondesalem.api.domain.ProductType;
import com.dondesalem.api.domain.SingleCardDetails;
import com.dondesalem.api.repository.CategoryRepository;
import com.dondesalem.api.repository.GameRepository;
import com.dondesalem.api.repository.ProductRepository;
import com.dondesalem.api.seed.MylserenaPeSinglesImportResult;
import com.dondesalem.api.seed.MylserenaPeSinglesRow;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MylserenaPeSinglesImportService {

  private static final String RESOURCE_PE = "seed/mylserena-pe-singles.json";
  private static final String RESOURCE_PB = "seed/mylserena-pb-singles.json";

  private static final String SET_NAME_PE = "Primera Era · Singles PE";
  private static final String SET_NAME_PB = "Primer Bloque · Singles PB";
  private static final String LISTING_URL_PE = "https://mylserena.cl/primera-era/singles-pe";
  private static final String LISTING_URL_PB = "https://mylserena.cl/singles-pb-1";
  private static final String ERA_PE = "PE";
  private static final String ERA_PB = "PB";

  private final ProductRepository products;
  private final CategoryRepository categories;
  private final GameRepository games;
  private final ObjectMapper objectMapper;

  public MylserenaPeSinglesImportService(
      ProductRepository products,
      CategoryRepository categories,
      GameRepository games,
      ObjectMapper objectMapper) {
    this.products = products;
    this.categories = categories;
    this.games = games;
    this.objectMapper = objectMapper;
  }

  /**
   * Inserta singles desde {@code seed/mylserena-pe-singles.json} y {@code
   * seed/mylserena-pb-singles.json}; omite filas cuyo slug {@code myl-pe-…} ya existe.
   */
  @Transactional
  public MylserenaPeSinglesImportResult importMissingFromClasspath() {
    List<MylserenaPeSinglesRow> pe = loadResource(RESOURCE_PE);
    List<MylserenaPeSinglesRow> pb = loadResource(RESOURCE_PB);
    int totalRows = pe.size() + pb.size();

    Category catSingles = ensureSinglesCategory();
    Game gMyl = ensureMylGame();

    int inserted = 0;
    int skipped = 0;
    for (MylserenaPeSinglesRow row : pe) {
      String slug = "myl-pe-" + row.pathSlug();
      if (products.findBySlug(slug).isPresent()) {
        skipped++;
        continue;
      }
      persistSingle(catSingles, gMyl, row, SET_NAME_PE, LISTING_URL_PE, ERA_PE);
      inserted++;
    }
    for (MylserenaPeSinglesRow row : pb) {
      String slug = "myl-pe-" + row.pathSlug();
      if (products.findBySlug(slug).isPresent()) {
        skipped++;
        continue;
      }
      persistSingle(catSingles, gMyl, row, SET_NAME_PB, LISTING_URL_PB, ERA_PB);
      inserted++;
    }
    return new MylserenaPeSinglesImportResult(inserted, skipped, totalRows);
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

  private Category ensureSinglesCategory() {
    return categories
        .findBySlug("singles")
        .orElseGet(
            () -> {
              Category c = new Category();
              c.setName("Singles / cartas sueltas");
              c.setSlug("singles");
              c.setSortOrder(5);
              return categories.save(c);
            });
  }

  private Game ensureMylGame() {
    return games
        .findBySlug("mitos-y-leyendas")
        .orElseGet(
            () -> {
              Game g = new Game();
              g.setName("Mitos y Leyendas");
              g.setSlug("mitos-y-leyendas");
              return games.save(g);
            });
  }

  private void persistSingle(
      Category category,
      Game game,
      MylserenaPeSinglesRow row,
      String setName,
      String listingUrlForMetadata,
      String fallbackEra) {
    String slug = "myl-pe-" + row.pathSlug();
    String effectiveEra = normalizeEra(row.bloque(), fallbackEra);
    String effectiveSetName = eraSetName(effectiveEra, setName);
    String effectiveListingUrl = eraListingUrl(effectiveEra, listingUrlForMetadata);
    String imageUrl =
        "https://cdnx.jumpseller.com/mylserena/image/"
            + row.imageId()
            + "/resize/600/800?"
            + row.imageVersion();
    String[] nameAndVariant = splitListingTitle(row.listingTitle());
    String cardName = nameAndVariant[0];
    String variant = nameAndVariant[1];
    String rarity = variant != null ? variant : "—";
    String brandNote =
        row.brandLine() != null ? " Línea: " + row.brandLine() + "." : "";
    String description =
        "Single (referencia de listado Mylserena — "
            + effectiveSetName
            + ")."
            + brandNote
            + " Precio de catálogo al importar: CLP "
            + row.price().toPlainString()
            + ".";

    Product p = new Product();
    p.setName(row.listingTitle());
    p.setSlug(slug);
    p.setDescription(description);
    p.setPrice(row.price());
    p.setStockQuantity(5);
    p.setCategory(category);
    p.setGame(game);
    p.setProductType(ProductType.SINGLE_CARD);
    p.setPreorder(false);
    p.setActive(true);
    p.setFeatured(false);

    SingleCardDetails sc = new SingleCardDetails();
    sc.setProduct(p);
    sc.setCardName(cardName);
    sc.setSetName(effectiveSetName);
    sc.setCardNumber("—");
    sc.setRarity(rarity);
    sc.setCardCondition("Near Mint");
    sc.setLanguage("Español");
    sc.setFinishType("Normal");
    sc.setBloque(effectiveEra);
    sc.setEditionType(null);
    sc.setArtist(null);
    sc.setMetadataJson(metadataJson(effectiveListingUrl));
    p.setSingleCardDetails(sc);

    ProductImage img = new ProductImage();
    img.setProduct(p);
    img.setUrl(imageUrl);
    img.setSortOrder(0);
    img.setAltText(row.listingTitle());
    p.getImages().add(img);

    products.save(p);
  }

  private String metadataJson(String listingUrl) {
    try {
      return objectMapper.writeValueAsString(
          Map.of("source", "mylserena", "listingUrl", listingUrl));
    } catch (JsonProcessingException e) {
      throw new IllegalStateException(e);
    }
  }

  private static String[] splitListingTitle(String listingTitle) {
    int open = listingTitle.lastIndexOf('(');
    if (open > 0 && listingTitle.endsWith(")")) {
      String name = listingTitle.substring(0, open).trim();
      String inside = listingTitle.substring(open + 1, listingTitle.length() - 1).trim();
      return new String[] {name, inside};
    }
    return new String[] {listingTitle, null};
  }

  private static String normalizeEra(String era, String fallbackEra) {
    String value = era == null || era.isBlank() ? fallbackEra : era;
    String normalized = value == null ? "" : value.trim().toUpperCase();
    return switch (normalized) {
      case ERA_PB -> ERA_PB;
      default -> ERA_PE;
    };
  }

  private static String eraSetName(String era, String fallbackSetName) {
    return ERA_PB.equals(era) ? SET_NAME_PB : (SET_NAME_PE.equals(fallbackSetName) ? SET_NAME_PE : fallbackSetName);
  }

  private static String eraListingUrl(String era, String fallbackListingUrl) {
    return ERA_PB.equals(era)
        ? LISTING_URL_PB
        : (LISTING_URL_PE.equals(fallbackListingUrl) ? LISTING_URL_PE : fallbackListingUrl);
  }
}
