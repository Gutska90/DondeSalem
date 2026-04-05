package com.dondesalem.api.controller;

import com.dondesalem.api.dto.cart.AddCartItemRequest;
import com.dondesalem.api.dto.cart.CartResponse;
import com.dondesalem.api.dto.cart.UpdateCartItemRequest;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.security.AuthUser;
import com.dondesalem.api.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

  private final CartService cartService;

  public CartController(CartService cartService) {
    this.cartService = cartService;
  }

  @GetMapping
  public CartResponse get(@AuthenticationPrincipal AuthUser auth) {
    requireUser(auth);
    return cartService.getCart(auth.id());
  }

  @PostMapping("/items")
  public CartResponse add(
      @AuthenticationPrincipal AuthUser auth, @Valid @RequestBody AddCartItemRequest request) {
    requireUser(auth);
    return cartService.addItem(auth.id(), request);
  }

  @PatchMapping("/items/{lineId}")
  public CartResponse update(
      @AuthenticationPrincipal AuthUser auth,
      @PathVariable Long lineId,
      @Valid @RequestBody UpdateCartItemRequest request) {
    requireUser(auth);
    return cartService.updateLine(auth.id(), lineId, request);
  }

  @DeleteMapping("/items/{lineId}")
  public CartResponse remove(
      @AuthenticationPrincipal AuthUser auth, @PathVariable Long lineId) {
    requireUser(auth);
    return cartService.removeLine(auth.id(), lineId);
  }

  private static void requireUser(AuthUser auth) {
    if (auth == null) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Inicia sesión para usar el carrito");
    }
  }
}
