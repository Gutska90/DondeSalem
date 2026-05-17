CREATE TABLE user_totp_recovery_codes (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  code_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consumed_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_totp_recovery_user ON user_totp_recovery_codes (user_id);
CREATE INDEX idx_totp_recovery_user_active ON user_totp_recovery_codes (user_id) WHERE consumed_at IS NULL;
