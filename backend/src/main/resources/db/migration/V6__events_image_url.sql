ALTER TABLE events
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(1024);

COMMENT ON COLUMN events.image_url IS 'URL pública de imagen del evento (cartel, flyer)';
