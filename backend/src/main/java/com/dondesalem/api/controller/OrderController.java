package com.dondesalem.api.controller;

import com.dondesalem.api.dto.order.CheckoutRequest;
import com.dondesalem.api.dto.order.OrderDetailDto;
import com.dondesalem.api.dto.order.PaymentDemoConfirmRequest;
import com.dondesalem.api.dto.order.OrderSummaryDto;
import com.dondesalem.api.dto.order.OrderTrackPublicDto;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.security.AuthUser;
import com.dondesalem.api.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

  private final OrderService orderService;

  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  @PostMapping("/checkout")
  public OrderDetailDto checkout(
      @AuthenticationPrincipal AuthUser auth, @Valid @RequestBody CheckoutRequest request) {
    requireUser(auth);
    return orderService.checkout(auth.id(), request);
  }

  /** Confirma pago en el flujo demo tipo Mercado Pago (sandbox visual en el front). */
  @PostMapping("/payment/demo/confirm")
  public OrderDetailDto confirmPaymentDemo(
      @AuthenticationPrincipal AuthUser auth, @Valid @RequestBody PaymentDemoConfirmRequest body) {
    requireUser(auth);
    return orderService.confirmMercadoPagoDemo(auth.id(), body.orderNumber(), body.sessionToken());
  }

  /** Consulta pública: número de pedido + email de la cuenta que compró (sin login). */
  @GetMapping("/track")
  public OrderTrackPublicDto track(
      @RequestParam String orderNumber, @RequestParam String email) {
    return orderService.trackPublic(orderNumber, email);
  }

  @GetMapping("/mine")
  public List<OrderSummaryDto> mine(@AuthenticationPrincipal AuthUser auth) {
    requireUser(auth);
    return orderService.listMine(auth.id());
  }

  @GetMapping("/mine/{orderId}")
  public OrderDetailDto mineOne(
      @AuthenticationPrincipal AuthUser auth, @PathVariable Long orderId) {
    requireUser(auth);
    return orderService.getMine(auth.id(), orderId);
  }

  private static void requireUser(AuthUser auth) {
    if (auth == null) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Inicia sesión");
    }
  }
}
