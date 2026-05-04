ALTER TABLE single_card_details
  ADD COLUMN IF NOT EXISTS bloque VARCHAR(2);

UPDATE single_card_details
SET bloque = CASE
  WHEN lower(coalesce(set_name, '')) LIKE '%primer bloque%' THEN 'PB'
  WHEN lower(coalesce(set_name, '')) LIKE '%primera era%' THEN 'PE'
  WHEN lower(coalesce(set_name, '')) LIKE '%(lbpb%' THEN 'PB'
  WHEN lower(coalesce(set_name, '')) LIKE '%(lpe%' THEN 'PE'
  ELSE bloque
END
WHERE bloque IS NULL;

UPDATE single_card_details sc
SET bloque = CASE
  WHEN lower(coalesce(p.name, '')) LIKE '%(lbpb%' THEN 'PB'
  WHEN lower(coalesce(p.name, '')) LIKE '%(lpe%' THEN 'PE'
  ELSE sc.bloque
END
FROM products p
WHERE sc.product_id = p.id
  AND sc.bloque IS NULL;

CREATE INDEX IF NOT EXISTS idx_single_card_bloque ON single_card_details (bloque);

ALTER TABLE single_card_details
  ADD CONSTRAINT chk_single_card_bloque
  CHECK (bloque IS NULL OR bloque IN ('PE', 'PB'));
