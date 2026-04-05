package com.dondesalem.api.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class CustomerOrder extends BaseEntity {

  @Column(name = "order_number", nullable = false, unique = true, length = 40)
  private String orderNumber;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private OrderStatus status;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal subtotal;

  /** Suma de descuentos por promociones (producto + globales) sobre el carrito. */
  @Column(name = "discount_total", nullable = false, precision = 12, scale = 2)
  private BigDecimal discountTotal = BigDecimal.ZERO;

  @Column(name = "shipping_cost", nullable = false, precision = 12, scale = 2)
  private BigDecimal shippingCost = BigDecimal.ZERO;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal total;

  @Column(name = "recipient_name", nullable = false)
  private String recipientName;

  @Column(name = "recipient_phone", nullable = false)
  private String recipientPhone;

  @Column(name = "shipping_street", nullable = false)
  private String shippingStreet;

  @Column(name = "shipping_city", nullable = false)
  private String shippingCity;

  @Column(name = "shipping_region")
  private String shippingRegion;

  @Column(name = "shipping_postal_code")
  private String shippingPostalCode;

  @Column(name = "shipping_country", nullable = false)
  private String shippingCountry = "CL";

  @Enumerated(EnumType.STRING)
  @Column(name = "delivery_method", nullable = false, length = 30)
  private DeliveryMethod deliveryMethod;

  @Enumerated(EnumType.STRING)
  @Column(name = "payment_method", nullable = false, length = 30)
  private PaymentMethod paymentMethod;

  /** Coincide con PaymentMethod o nombre de proveedor futuro (Mercado Pago, Transbank, etc.). */
  @Column(name = "payment_provider", length = 40)
  private String paymentProvider;

  /** Token de sesión para validar retorno desde pasarela (demo / preferencia). */
  @Column(name = "payment_session_token", length = 64)
  private String paymentSessionToken;

  private String notes;

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<OrderItem> items = new ArrayList<>();
}
