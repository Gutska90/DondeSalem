-- Tipo de producto + detalle 1:1 para cartas sueltas (singles)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_type VARCHAR(32) NOT NULL DEFAULT 'SEALED_TCG';

COMMENT ON COLUMN products.product_type IS 'SEALED_TCG | SINGLE_CARD | ACCESSORY | BOARD_GAME';

CREATE TABLE IF NOT EXISTS single_card_details (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL UNIQUE REFERENCES products (id) ON DELETE CASCADE,
  card_name VARCHAR(500),
  set_name VARCHAR(500),
  card_number VARCHAR(100),
  rarity VARCHAR(200),
  card_condition VARCHAR(100),
  language VARCHAR(100),
  finish_type VARCHAR(80),
  edition_type VARCHAR(80),
  artist VARCHAR(300),
  mana_cost_or_cost VARCHAR(200),
  attribute_or_color VARCHAR(200),
  grade_or_certification VARCHAR(200),
  metadata_json TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_single_card_set ON single_card_details (set_name);
CREATE INDEX IF NOT EXISTS idx_single_card_rarity ON single_card_details (rarity);
CREATE INDEX IF NOT EXISTS idx_single_card_condition ON single_card_details (card_condition);
CREATE INDEX IF NOT EXISTS idx_single_card_language ON single_card_details (language);
CREATE INDEX IF NOT EXISTS idx_single_card_finish ON single_card_details (finish_type);
