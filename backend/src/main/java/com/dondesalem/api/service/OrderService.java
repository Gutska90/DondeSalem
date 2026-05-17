package com.dondesalem.api.service;

import com.dondesalem.api.domain.Cart;
import com.dondesalem.api.domain.CartItem;
import com.dondesalem.api.domain.CustomerOrder;
import com.dondesalem.api.domain.DeliveryMethod;
import com.dondesalem.api.domain.InventoryMovement;
import com.dondesalem.api.domain.MovementReason;
import com.dondesalem.api.domain.OrderItem;
import com.dondesalem.api.domain.OrderStatus;
import com.dondesalem.api.domain.PaymentMethod;
import com.dondesalem.api.domain.Product;
import com.dondesalem.api.domain.User;
import com.dondesalem.api.dto.cart.CartPricingResult;
import com.dondesalem.api.dto.order.CheckoutRequest;
import com.dondesalem.api.dto.order.OrderDetailDto;
import com.dondesalem.api.dto.order.OrderLineDto;
import com.dondesalem.api.dto.order.OrderSummaryDto;
import com.dondesalem.api.dto.order.OrderTrackLineDto;
import com.dondesalem.api.dto.order.OrderTrackPublicDto;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.repository.CartRepository;
import com.dondesalem.api.repository.CustomerOrderRepository;
import com.dondesalem.api.repository.InventoryMovementRepository;
import com.dondesalem.api.repository.ProductRepository;
import com.dondesalem.api.repository.PromotionRepository;
import com.dondesalem.api.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

  private static final BigDecimal SHIPPING_FLAT = new BigDecimal("3990");

  private final String publicFrontendUrl;

  private final CustomerOrderRepository orderRepository;
  private final CartRepository cartRepository;
  private final UserRepository userRepository;
  private final ProductRepository productRepository;
  private final InventoryMovementRepository inventoryMovementRepository;
  private final PromotionRepository promotionRepository;
  private final OrderNotificationService orderNotificationService;

  public OrderService(
      @Value("${app.public-frontend-url:http://localhost:3000}") String publicFrontendUrl,
      CustomerOrderRepository orderRepository,
      CartRepository cartRepository,
      UserRepository userRepository,
      ProductRepository productRepository,
      InventoryMovementRepository inventoryMovementRepository,
      PromotionRepository promotionRepository,
      OrderNotificationService orderNotificationService) {
    this.publicFrontendUrl = publicFrontendUrl;
    this.orderRepository = orderRepository;
    this.cartRepository = cartRepository;
    this.userRepository = userRepository;
    this.productRepository = productRepository;
    this.inventoryMovementRepository = inventoryMovementRepository;
    this.promotionRepository = promotionRepository;
    this.orderNotificationService = orderNotificationService;
  }

  @Transactional
  public OrderDetailDto checkout(Long userId, CheckoutRequest req) {
    User user = userRepository.findById(userId).orElseThrow();
    Cart cart =
        cartRepository
            .findWithItemsByUser_Id(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Carrito vacío"));
    if (cart.getItems().isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Carrito vacío");
    }
    for (CartItem ci : cart.getItems()) {
      Product p =
          productRepository
              .findById(ci.getProduct().getId())
              .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Producto inválido"));
      if (!p.getActive()) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "Producto no disponible: " + p.getName());
      }
      if (p.availableToSell() < ci.getQuantity()) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "Stock insuficiente: " + p.getName());
      }
    }
    List<CartItem> items = cart.getItems();
    int n = items.size();
    BigDecimal[] lineGross = new BigDecimal[n];
    long[] productIds = new long[n];
    int[] qty = new int[n];
    for (int i = 0; i < n; i++) {
      CartItem ci = items.get(i);
      Product p = productRepository.findById(ci.getProduct().getId()).orElseThrow();
      lineGross[i] =
          p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())).setScale(2, RoundingMode.HALF_UP);
      productIds[i] = p.getId();
      qty[i] = ci.getQuantity();
    }
    CartPricingResult pricing =
        PromotionDiscountService.computeTotals(
            productIds, lineGross, promotionRepository.findAllActiveWithProduct(Instant.now()));
    BigDecimal discountTotal = pricing.discountTotal();
    BigDecimal subtotal = pricing.netMerchandise();
    BigDecimal[] finalLine = pricing.finalLineAmounts();
    BigDecimal shipping =
        req.deliveryMethod() == DeliveryMethod.RETIRO_TIENDA
            ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
            : SHIPPING_FLAT.setScale(2, RoundingMode.HALF_UP);
    BigDecimal total = subtotal.add(shipping).setScale(2, RoundingMode.HALF_UP);

    CustomerOrder order = new CustomerOrder();
    order.setOrderNumber("ORD-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());
    order.setUser(user);
    order.setStatus(OrderStatus.PENDIENTE);
    order.setSubtotal(subtotal);
    order.setDiscountTotal(discountTotal);
    order.setShippingCost(shipping);
    order.setTotal(total);
    order.setRecipientName(req.recipientName().trim());
    order.setRecipientPhone(req.recipientPhone().trim());
    order.setShippingStreet(req.shippingStreet().trim());
    order.setShippingCity(req.shippingCity().trim());
    order.setShippingRegion(req.shippingRegion() != null ? req.shippingRegion().trim() : null);
    order.setShippingPostalCode(req.shippingPostalCode() != null ? req.shippingPostalCode().trim() : null);
    order.setShippingCountry(req.shippingCountry().trim());
    order.setDeliveryMethod(req.deliveryMethod());
    order.setPaymentMethod(req.paymentMethod());
    order.setNotes(req.notes());
    if (req.paymentMethod() == PaymentMethod.MERCADOPAGO_CHECKOUT) {
      order.setPaymentProvider("MERCADOPAGO_CHECKOUT");
      order.setPaymentSessionToken(
          UUID.randomUUID().toString().replace("-", "")
              + UUID.randomUUID().toString().replace("-", ""));
    }

    for (int i = 0; i < n; i++) {
      CartItem ci = items.get(i);
      Product p = productRepository.findById(ci.getProduct().getId()).orElseThrow();
      OrderItem oi = new OrderItem();
      oi.setOrder(order);
      oi.setProduct(p);
      oi.setProductName(p.getName());
      oi.setQuantity(ci.getQuantity());
      BigDecimal unit =
          finalLine[i]
              .divide(BigDecimal.valueOf(qty[i]), 2, RoundingMode.HALF_UP);
      oi.setUnitPrice(unit);
      order.getItems().add(oi);
    }
    order = orderRepository.save(order);

    for (CartItem ci : cart.getItems()) {
      Product p = productRepository.findById(ci.getProduct().getId()).orElseThrow();
      int lineQty = ci.getQuantity();
      if (p.availableToSell() < lineQty) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "Stock insuficiente: " + p.getName());
      }
      int reserved = p.getReservedQuantity() != null ? p.getReservedQuantity() : 0;
      p.setReservedQuantity(reserved + lineQty);
      productRepository.save(p);
    }
    cart.getItems().clear();
    cartRepository.save(cart);
    CustomerOrder saved = orderRepository.findDetailById(order.getId()).orElseThrow();
    orderNotificationService.notifyOrderCreated(saved, user);
    return toDetail(saved);
  }

  @Transactional(readOnly = true)
  public OrderTrackPublicDto trackPublic(String orderNumber, String email) {
    if (orderNumber == null || orderNumber.isBlank() || email == null || email.isBlank()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Indicá número de pedido y email");
    }
    CustomerOrder o =
        orderRepository
            .findByOrderNumberAndUser_EmailIgnoreCase(orderNumber.trim(), email.trim().toLowerCase())
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND,
                        "No encontramos un pedido con ese número y email asociado a tu cuenta."));
    return toTrackPublic(o);
  }

  @Transactional(readOnly = true)
  public List<OrderSummaryDto> listMine(Long userId) {
    return orderRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
        .map(
            o ->
                new OrderSummaryDto(
                    o.getId(), o.getOrderNumber(), o.getStatus(), o.getTotal(), o.getCreatedAt()))
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public OrderDetailDto getMine(Long userId, Long orderId) {
    CustomerOrder o =
        orderRepository
            .findDetailById(orderId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
    if (!o.getUser().getId().equals(userId)) {
      throw new ApiException(HttpStatus.FORBIDDEN, "No autorizado");
    }
    return toDetail(o);
  }

  private static OrderTrackPublicDto toTrackPublic(CustomerOrder o) {
    List<OrderTrackLineDto> lines =
        o.getItems().stream()
            .map(
                i ->
                    new OrderTrackLineDto(
                        i.getProductName(), i.getQuantity(), i.getUnitPrice()))
            .collect(Collectors.toList());
    return new OrderTrackPublicDto(
        o.getOrderNumber(),
        o.getStatus(),
        o.getSubtotal(),
        o.getDiscountTotal(),
        o.getShippingCost(),
        o.getTotal(),
        o.getCreatedAt(),
        lines);
  }

  private OrderDetailDto toDetail(CustomerOrder o) {
    List<OrderLineDto> lines =
        o.getItems().stream()
            .map(
                i ->
                    new OrderLineDto(
                        i.getProduct().getId(),
                        i.getProductName(),
                        i.getQuantity(),
                        i.getUnitPrice()))
            .collect(Collectors.toList());
    String paymentRedirectUrl = null;
    if (o.getPaymentMethod() == PaymentMethod.MERCADOPAGO_CHECKOUT
        && o.getPaymentSessionToken() != null
        && !o.getPaymentSessionToken().isBlank()
        && o.getStatus() == OrderStatus.PENDIENTE
        && publicFrontendUrl != null
        && !publicFrontendUrl.isBlank()) {
      String base = publicFrontendUrl.trim().replaceAll("/+$", "");
      paymentRedirectUrl =
          base
              + "/checkout/pago-simulado?orderNumber="
              + URLEncoder.encode(o.getOrderNumber(), StandardCharsets.UTF_8)
              + "&token="
              + URLEncoder.encode(o.getPaymentSessionToken(), StandardCharsets.UTF_8);
    }
    return new OrderDetailDto(
        o.getId(),
        o.getOrderNumber(),
        o.getStatus(),
        o.getSubtotal(),
        o.getDiscountTotal(),
        o.getShippingCost(),
        o.getTotal(),
        o.getRecipientName(),
        o.getRecipientPhone(),
        o.getShippingStreet(),
        o.getShippingCity(),
        o.getShippingRegion(),
        o.getShippingPostalCode(),
        o.getShippingCountry(),
        o.getDeliveryMethod(),
        o.getPaymentMethod(),
        o.getNotes(),
        o.getCreatedAt(),
        lines,
        paymentRedirectUrl);
  }

  @Transactional
  public OrderDetailDto confirmMercadoPagoDemo(Long userId, String orderNumber, String sessionToken) {
    CustomerOrder o =
        orderRepository
            .findByOrderNumberAndUser_Id(orderNumber.trim(), userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
    if (o.getPaymentMethod() != PaymentMethod.MERCADOPAGO_CHECKOUT) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Este pedido no usa el flujo demo de pasarela");
    }
    if (o.getPaymentSessionToken() == null
        || !o.getPaymentSessionToken().equals(sessionToken.trim())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Token de pago inválido");
    }
    if (o.getStatus() != OrderStatus.PENDIENTE) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "El pedido ya no está pendiente de pago");
    }
    o.setStatus(OrderStatus.PAGADO);
    o.setPaymentSessionToken(null);
    orderRepository.save(o);
    CustomerOrder paid =
        orderRepository.findDetailById(o.getId()).orElseThrow();
    finalizePaidOrderInventory(paid);
    return toDetail(orderRepository.findDetailById(o.getId()).orElseThrow());
  }

  @Transactional(readOnly = true)
  public OrderDetailDto getByIdAdmin(Long orderId) {
    CustomerOrder o =
        orderRepository
            .findDetailById(orderId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
    return toDetail(o);
  }

  @Transactional
  public OrderDetailDto updateStatus(Long orderId, OrderStatus status) {
    CustomerOrder o =
        orderRepository
            .findDetailById(orderId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
    OrderStatus previous = o.getStatus();
    if (status == OrderStatus.PAGADO && previous == OrderStatus.PENDIENTE) {
      finalizePaidOrderInventory(o);
    }
    if (status == OrderStatus.CANCELADO && previous != OrderStatus.CANCELADO) {
      handleCancelledOrderInventory(o, previous);
    }
    o.setStatus(status);
    orderRepository.save(o);
    return toDetail(orderRepository.findDetailById(orderId).orElseThrow());
  }

  /**
   * Pedido pendiente: solo había reserva. Otros estados: ya se había consolidado la venta al pagar.
   */
  private void handleCancelledOrderInventory(CustomerOrder order, OrderStatus previous) {
    if (previous == OrderStatus.PENDIENTE) {
      releaseReservationForOrder(order);
    } else {
      restorePhysicalStockAfterPaidCancellation(order);
    }
  }

  private void releaseReservationForOrder(CustomerOrder order) {
    for (OrderItem line : order.getItems()) {
      Product p =
          productRepository
              .findById(line.getProduct().getId())
              .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Producto inválido en línea de pedido"));
      int qty = line.getQuantity();
      int reserved = p.getReservedQuantity() != null ? p.getReservedQuantity() : 0;
      int release = Math.min(qty, reserved);
      p.setReservedQuantity(reserved - release);
      productRepository.save(p);
    }
  }

  /** Venta ya registrada (pago): devolver unidades al stock físico. */
  private void restorePhysicalStockAfterPaidCancellation(CustomerOrder order) {
    if (!inventoryMovementRepository.existsByReferenceTypeAndReferenceIdAndReason(
        "ORDER", order.getId(), MovementReason.VENTA)) {
      return;
    }
    for (OrderItem line : order.getItems()) {
      Product p =
          productRepository
              .findById(line.getProduct().getId())
              .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Producto inválido en línea de pedido"));
      int qty = line.getQuantity();
      p.setStockQuantity(p.getStockQuantity() + qty);
      productRepository.save(p);
      InventoryMovement mov = new InventoryMovement();
      mov.setProduct(p);
      mov.setQuantityChange(qty);
      mov.setReason(MovementReason.DEVOLUCION);
      mov.setReferenceType("ORDER_CANCEL");
      mov.setReferenceId(order.getId());
      inventoryMovementRepository.save(mov);
    }
  }

  /**
   * Libera reserva y descuenta stock físico; registra VENTA (una vez por pedido).
   */
  private void finalizePaidOrderInventory(CustomerOrder order) {
    if (inventoryMovementRepository.existsByReferenceTypeAndReferenceIdAndReason(
        "ORDER", order.getId(), MovementReason.VENTA)) {
      return;
    }
    for (OrderItem line : order.getItems()) {
      Product p =
          productRepository
              .findById(line.getProduct().getId())
              .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Producto inválido en línea de pedido"));
      int qty = line.getQuantity();
      int reserved = p.getReservedQuantity() != null ? p.getReservedQuantity() : 0;
      if (reserved < qty) {
        throw new ApiException(
            HttpStatus.CONFLICT,
            "Inconsistencia de inventario al confirmar pago (producto " + p.getName() + ")");
      }
      p.setReservedQuantity(reserved - qty);
      p.setStockQuantity(p.getStockQuantity() - qty);
      productRepository.save(p);
      InventoryMovement mov = new InventoryMovement();
      mov.setProduct(p);
      mov.setQuantityChange(-qty);
      mov.setReason(MovementReason.VENTA);
      mov.setReferenceType("ORDER");
      mov.setReferenceId(order.getId());
      inventoryMovementRepository.save(mov);
    }
  }
}
