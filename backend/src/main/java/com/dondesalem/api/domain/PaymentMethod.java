package com.dondesalem.api.domain;

public enum PaymentMethod {
  TRANSFERENCIA,
  EFECTIVO_RETIRO,
  WEB_PAY_MOCK,
  /** Redirección a flujo tipo Mercado Pago (demo en este proyecto; sustituir por API real). */
  MERCADOPAGO_CHECKOUT
}
