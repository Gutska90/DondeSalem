package com.dondesalem.api.service;

import com.dondesalem.api.domain.Cart;
import com.dondesalem.api.domain.CartItem;
import com.dondesalem.api.domain.Product;
import com.dondesalem.api.domain.Promotion;
import com.dondesalem.api.domain.User;
import com.dondesalem.api.dto.cart.AddCartItemRequest;
import com.dondesalem.api.dto.cart.CartLineDto;
import com.dondesalem.api.dto.cart.CartPricingResult;
import com.dondesalem.api.dto.cart.CartResponse;
import com.dondesalem.api.dto.cart.UpdateCartItemRequest;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.repository.CartRepository;
import com.dondesalem.api.repository.ProductRepository;
import com.dondesalem.api.repository.PromotionRepository;
import com.dondesalem.api.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

  private final CartRepository cartRepository;
  private final UserRepository userRepository;
  private final ProductRepository productRepository;
  private final PromotionRepository promotionRepository;

  public CartService(
      CartRepository cartRepository,
      UserRepository userRepository,
      ProductRepository productRepository,
      PromotionRepository promotionRepository) {
    this.cartRepository = cartRepository;
    this.userRepository = userRepository;
    this.productRepository = productRepository;
    this.promotionRepository = promotionRepository;
  }

  @Transactional(readOnly = true)
  public CartResponse getCart(Long userId) {
    Cart cart = cartRepository.findWithItemsByUser_Id(userId).orElse(null);
    if (cart == null || cart.getItems().isEmpty()) {
      BigDecimal z = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
      return new CartResponse(List.of(), z, z, z, 0);
    }
    List<CartItem> sorted =
        cart.getItems().stream()
            .sorted(Comparator.comparing(ci -> ci.getProduct().getName()))
            .collect(Collectors.toList());
    int n = sorted.size();
    BigDecimal[] lineGross = new BigDecimal[n];
    long[] productIds = new long[n];
    List<CartLineDto> lines = new java.util.ArrayList<>(n);
    int count = 0;
    for (int i = 0; i < n; i++) {
      CartItem ci = sorted.get(i);
      Product p = ci.getProduct();
      BigDecimal line =
          p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())).setScale(2, RoundingMode.HALF_UP);
      lineGross[i] = line;
      productIds[i] = p.getId();
      String img =
          p.getImages().stream()
              .min(Comparator.comparing(com.dondesalem.api.domain.ProductImage::getSortOrder))
              .map(com.dondesalem.api.domain.ProductImage::getUrl)
              .orElse(null);
      lines.add(
          new CartLineDto(
              ci.getId(),
              p.getId(),
              p.getName(),
              p.getSlug(),
              img,
              p.getPrice(),
              ci.getQuantity(),
              p.availableToSell(),
              line));
      count += ci.getQuantity();
    }
    List<Promotion> promos = promotionRepository.findAllActiveWithProduct(Instant.now());
    CartPricingResult pricing = PromotionDiscountService.computeTotals(productIds, lineGross, promos);
    return new CartResponse(
        lines,
        pricing.merchandiseGross(),
        pricing.discountTotal(),
        pricing.netMerchandise(),
        count);
  }

  @Transactional
  public CartResponse addItem(Long userId, AddCartItemRequest req) {
    User user = userRepository.findById(userId).orElseThrow();
    Product product =
        productRepository
            .findDetailById(req.productId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    if (!Boolean.TRUE.equals(product.getActive())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Producto no disponible");
    }
    if (product.availableToSell() < req.quantity()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Stock insuficiente");
    }
    Cart cart =
        cartRepository
            .findWithItemsByUser_Id(userId)
            .orElseGet(
                () -> {
                  Cart c = new Cart();
                  c.setUser(user);
                  return cartRepository.save(c);
                });
    CartItem existing =
        cart.getItems().stream()
            .filter(ci -> ci.getProduct().getId().equals(product.getId()))
            .findFirst()
            .orElse(null);
    int newQty = req.quantity();
    if (existing != null) {
      newQty = existing.getQuantity() + req.quantity();
    }
    if (newQty > product.availableToSell()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Stock insuficiente");
    }
    if (existing != null) {
      existing.setQuantity(newQty);
    } else {
      CartItem line = new CartItem();
      line.setCart(cart);
      line.setProduct(product);
      line.setQuantity(req.quantity());
      cart.getItems().add(line);
    }
    cartRepository.save(cart);
    return getCart(userId);
  }

  @Transactional
  public CartResponse updateLine(Long userId, Long lineId, UpdateCartItemRequest req) {
    Cart cart =
        cartRepository
            .findWithItemsByUser_Id(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Carrito vacío"));
    CartItem line =
        cart.getItems().stream()
            .filter(ci -> ci.getId().equals(lineId))
            .findFirst()
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Línea no encontrada"));
    Product p = line.getProduct();
    if (req.quantity() > p.availableToSell()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Stock insuficiente");
    }
    line.setQuantity(req.quantity());
    cartRepository.save(cart);
    return getCart(userId);
  }

  @Transactional
  public CartResponse removeLine(Long userId, Long lineId) {
    Cart cart = cartRepository.findWithItemsByUser_Id(userId).orElse(null);
    if (cart == null) {
      return getCart(userId);
    }
    cart.getItems().removeIf(ci -> ci.getId().equals(lineId));
    cartRepository.save(cart);
    return getCart(userId);
  }
}
