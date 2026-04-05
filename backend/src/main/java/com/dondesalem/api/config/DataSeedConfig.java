package com.dondesalem.api.config;

import com.dondesalem.api.domain.Banner;
import com.dondesalem.api.domain.Category;
import com.dondesalem.api.domain.Event;
import com.dondesalem.api.domain.Game;
import com.dondesalem.api.domain.Product;
import com.dondesalem.api.domain.ProductImage;
import com.dondesalem.api.domain.Promotion;
import com.dondesalem.api.domain.PromotionType;
import com.dondesalem.api.domain.Role;
import com.dondesalem.api.domain.User;
import com.dondesalem.api.repository.BannerRepository;
import com.dondesalem.api.repository.CategoryRepository;
import com.dondesalem.api.repository.EventRepository;
import com.dondesalem.api.repository.GameRepository;
import com.dondesalem.api.repository.ProductRepository;
import com.dondesalem.api.repository.PromotionRepository;
import com.dondesalem.api.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("!prod")
public class DataSeedConfig {

  @Bean
  CommandLineRunner seedData(
      UserRepository users,
      PasswordEncoder encoder,
      CategoryRepository categories,
      GameRepository games,
      ProductRepository products,
      BannerRepository banners,
      EventRepository events,
      PromotionRepository promotions) {
    return args -> {
      seedDemoUsers(users, encoder);
      if (products.count() > 0) {
        return;
      }

      Category catBoosters = cat(categories, "Boosters / sobres", "boosters", 1);
      Category catAcc = cat(categories, "Accesorios", "accesorios", 2);
      Category catBoard = cat(categories, "Juegos de mesa", "juegos-de-mesa", 3);
      Category catPre = cat(categories, "Preventas", "preventas", 4);

      Game gPk = game(games, "Pokémon TCG", "pokemon-tcg");
      Game gMtg = game(games, "Magic: The Gathering", "magic-the-gathering");
      Game gYgo = game(games, "Yu-Gi-Oh!", "yu-gi-oh");
      Game gOp = game(games, "One Piece TCG", "one-piece-tcg");

      String ph = "https://placehold.co/800x600/1a1a2e/f5f5f5/png?text=DondeSalem";

      Product p1 =
          buildProduct(
              "Booster Pokémon — Evoluciones Prismáticas",
              "booster-pokemon-evoluciones-prismaticas",
              new BigDecimal("5990"),
              24,
              catBoosters,
              gPk,
              false,
              true);
      addImage(p1, ph, 0);
      products.save(p1);

      Product p2 =
          buildProduct(
              "Bundle MTG — Foundations",
              "bundle-mtg-foundations",
              new BigDecimal("32990"),
              8,
              catBoosters,
              gMtg,
              false,
              true);
      addImage(p2, ph, 0);
      products.save(p2);

      Product p3 =
          buildProduct(
              "Deck estructurado Yu-Gi-Oh!",
              "deck-estructurado-yugioh",
              new BigDecimal("18990"),
              5,
              catBoosters,
              gYgo,
              false,
              false);
      addImage(p3, ph, 0);
      products.save(p3);

      Product p4 =
          buildProduct(
              "Funda Dragon Shield — Matte",
              "funda-dragon-shield-matte",
              new BigDecimal("12990"),
              40,
              catAcc,
              null,
              false,
              false);
      p4.setCompareAtPrice(new BigDecimal("14990"));
      addImage(p4, ph, 0);
      products.save(p4);

      Product p5 =
          buildProduct(
              "Wingspan (edición en español)",
              "wingspan-es",
              new BigDecimal("45990"),
              6,
              catBoard,
              null,
              false,
              true);
      addImage(p5, ph, 0);
      products.save(p5);

      Product p6 =
          buildProduct(
              "Preventa — caja especial One Piece",
              "preventa-one-piece-caja-especial",
              new BigDecimal("89990"),
              10,
              catPre,
              gOp,
              true,
              true);
      p6.setPreorderReleaseDate(LocalDate.now().plusMonths(1));
      addImage(p6, ph, 0);
      products.save(p6);

      Banner b1 = new Banner();
      b1.setTitle("Torneos cada fin de semana");
      b1.setImageUrl("https://placehold.co/1600x500/16213e/e94560/png?text=Eventos+TCG");
      b1.setLinkUrl("/eventos");
      b1.setSortOrder(0);
      b1.setActive(true);
      b1.setStartsAt(Instant.now().minus(1, ChronoUnit.DAYS));
      b1.setEndsAt(Instant.now().plus(365, ChronoUnit.DAYS));
      banners.save(b1);

      Instant start = Instant.now().plus(3, ChronoUnit.DAYS);
      Event ev = new Event();
      ev.setTitle("Local League — Pokémon");
      ev.setDescription("Swiss + top 8. Registro desde las 10:00.");
      ev.setStartsAt(start);
      ev.setEndsAt(start.plus(5, ChronoUnit.HOURS));
      ev.setCapacity(32);
      ev.setEntryFee(new BigDecimal("8000"));
      ev.setFeaturedOnHome(true);
      ev.setActive(true);
      ev.setImageUrl("https://placehold.co/1200x630/16213e/e94560/png?text=Local+League+Pokémon");
      events.save(ev);

      Promotion pr = new Promotion();
      pr.setName("Accesorios -13%");
      pr.setPromoType(PromotionType.PORCENTAJE);
      pr.setValue(new BigDecimal("13"));
      pr.setStartsAt(Instant.now().minus(1, ChronoUnit.DAYS));
      pr.setEndsAt(Instant.now().plus(30, ChronoUnit.DAYS));
      pr.setActive(true);
      pr.setProduct(products.findBySlug("funda-dragon-shield-matte").orElse(p4));
      promotions.save(pr);
    };
  }

  /** Usuarios de demo (solo si no existen por email). No sustituye cuentas ya creadas. */
  private static void seedDemoUsers(UserRepository users, PasswordEncoder encoder) {
    if (users.findByEmail("admin@dondesalem.local").isEmpty()) {
      User admin = new User();
      admin.setEmail("admin@dondesalem.local");
      admin.setPasswordHash(encoder.encode("Admin123!"));
      admin.setFirstName("Admin");
      admin.setLastName("DondeSalem");
      admin.setPhone("+56900000000");
      admin.setRole(Role.ADMIN);
      users.save(admin);
    }
    if (users.findByEmail("cliente@dondesalem.local").isEmpty()) {
      User cliente = new User();
      cliente.setEmail("cliente@dondesalem.local");
      cliente.setPasswordHash(encoder.encode("Cliente123!"));
      cliente.setFirstName("Cliente");
      cliente.setLastName("Prueba");
      cliente.setPhone("+56911111111");
      cliente.setRole(Role.CLIENTE);
      users.save(cliente);
    }
  }

  private static Category cat(CategoryRepository repo, String name, String slug, int sort) {
    Category c = new Category();
    c.setName(name);
    c.setSlug(slug);
    c.setSortOrder(sort);
    return repo.save(c);
  }

  private static Game game(GameRepository repo, String name, String slug) {
    Game g = new Game();
    g.setName(name);
    g.setSlug(slug);
    return repo.save(g);
  }

  private static Product buildProduct(
      String name,
      String slug,
      BigDecimal price,
      int stock,
      Category cat,
      Game game,
      boolean preorder,
      boolean featured) {
    Product p = new Product();
    p.setName(name);
    p.setSlug(slug);
    p.setDescription("Producto de ejemplo para el MVP DondeSalem.");
    p.setPrice(price);
    p.setStockQuantity(stock);
    p.setCategory(cat);
    p.setGame(game);
    p.setPreorder(preorder);
    p.setActive(true);
    p.setFeatured(featured);
    return p;
  }

  private static void addImage(Product p, String url, int order) {
    ProductImage img = new ProductImage();
    img.setProduct(p);
    img.setUrl(url);
    img.setSortOrder(order);
    img.setAltText(p.getName());
    p.getImages().add(img);
  }
}
