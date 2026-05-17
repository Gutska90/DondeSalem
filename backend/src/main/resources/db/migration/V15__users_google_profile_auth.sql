ALTER TABLE users
  ADD COLUMN profile_picture_url VARCHAR(512) NULL;

ALTER TABLE users
  ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'GOOGLE';

ALTER TABLE users
  ADD COLUMN last_login_at TIMESTAMPTZ NULL;

ALTER TABLE users
  ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE users
SET auth_provider = 'LOCAL'
WHERE password_hash IS NOT NULL;

UPDATE users
SET auth_provider = 'GOOGLE'
WHERE google_sub IS NOT NULL AND (password_hash IS NULL OR password_hash = '');
