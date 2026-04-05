ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS discount_total NUMERIC(12, 2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN orders.discount_total IS 'Descuentos por promociones aplicados al momento del checkout';
