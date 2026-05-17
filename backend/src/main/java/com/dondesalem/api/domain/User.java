package com.dondesalem.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends BaseEntity {

  @Column(nullable = false, unique = true)
  private String email;

  /** Null si el usuario solo usa Google (sin contraseña local). */
  @Column(name = "password_hash")
  private String passwordHash;

  /** Identificador estable de la cuenta Google (sub del ID token). */
  @Column(name = "google_sub", length = 128)
  private String googleSub;

  @Column(name = "profile_picture_url", length = 512)
  private String profilePictureUrl;

  @Enumerated(EnumType.STRING)
  @Column(name = "auth_provider", nullable = false, length = 20)
  private AuthProvider authProvider = AuthProvider.GOOGLE;

  @Column(name = "last_login_at")
  private Instant lastLoginAt;

  @Column(nullable = false)
  private boolean active = true;

  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Column(name = "last_name", nullable = false)
  private String lastName;

  private String phone;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Role role;

  @Column(name = "password_reset_token_hash", length = 64)
  private String passwordResetTokenHash;

  @Column(name = "password_reset_expires_at")
  private Instant passwordResetExpiresAt;

  /** Secreto Base32 (RFC 4648) para TOTP; null si nunca se inició la configuración o tras desactivar. */
  @Column(name = "totp_secret", length = 64)
  private String totpSecret;

  @Column(name = "totp_enabled", nullable = false)
  private boolean totpEnabled = false;

  public boolean hasPassword() {
    return passwordHash != null && !passwordHash.isBlank();
  }
}
