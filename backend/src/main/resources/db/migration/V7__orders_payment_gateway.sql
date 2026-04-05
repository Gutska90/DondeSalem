-- Campos opcionales para flujo de pasarela (demo Mercado Pago / futuras integraciones)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(40);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_session_token VARCHAR(64);

COMMENT ON COLUMN orders.payment_provider IS 'Ej. MERCADOPAGO_CHECKOUT — proveedor lógico';
COMMENT ON COLUMN orders.payment_session_token IS 'Token de sesión para validar retorno / webhook (demo)';
