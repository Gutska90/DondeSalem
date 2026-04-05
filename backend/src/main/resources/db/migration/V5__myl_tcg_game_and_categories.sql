-- Mitos y Leyendas (MYL) como juego TCG + categorías PE y PB bajo la familia MYL

INSERT INTO games (name, slug, logo_url, created_at, updated_at)
SELECT 'Mitos y Leyendas', 'mitos-y-leyendas', NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM games WHERE slug = 'mitos-y-leyendas');

INSERT INTO categories (name, slug, parent_id, sort_order, created_at, updated_at)
SELECT 'Mitos y Leyendas', 'mitos-y-leyendas', NULL, 5, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'mitos-y-leyendas');

INSERT INTO categories (name, slug, parent_id, sort_order, created_at, updated_at)
SELECT
  'PE',
  'myl-pe',
  (SELECT id FROM categories WHERE slug = 'mitos-y-leyendas' LIMIT 1),
  1,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'myl-pe');

INSERT INTO categories (name, slug, parent_id, sort_order, created_at, updated_at)
SELECT
  'PB',
  'myl-pb',
  (SELECT id FROM categories WHERE slug = 'mitos-y-leyendas' LIMIT 1),
  2,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'myl-pb');
