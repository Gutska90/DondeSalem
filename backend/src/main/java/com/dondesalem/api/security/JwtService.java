package com.dondesalem.api.security;

import com.dondesalem.api.domain.Role;
import com.dondesalem.api.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  public static final String CLAIM_TYP = "typ";
  public static final String TYP_TOTP_PENDING = "totp_pending";

  private final SecretKey key;
  private final long expirationMs;
  private final long totpPendingExpirationMs;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.expiration-ms}") long expirationMs,
      @Value("${app.totp.pending-expiration-ms:300000}") long totpPendingExpirationMs) {
    byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
    if (bytes.length < 32) {
      throw new IllegalStateException(
          "JWT secret must be at least 256 bits (32 bytes). Set JWT_SECRET to a long random string.");
    }
    this.key = Keys.hmacShaKeyFor(bytes);
    this.expirationMs = expirationMs;
    this.totpPendingExpirationMs = Math.max(60_000L, totpPendingExpirationMs);
  }

  public String generateToken(User user) {
    Date now = new Date();
    Date exp = new Date(now.getTime() + expirationMs);
    return Jwts.builder()
        .subject(user.getEmail())
        .claim("uid", user.getId())
        .claim("role", user.getRole().name())
        .issuedAt(now)
        .expiration(exp)
        .signWith(key)
        .compact();
  }

  public Claims parse(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }

  public String emailFromToken(String token) {
    return parse(token).getSubject();
  }

  public Role roleFromToken(String token) {
    String r = parse(token).get("role", String.class);
    return Role.valueOf(r);
  }

  public Long userIdFromToken(String token) {
    Number n = parse(token).get("uid", Number.class);
    return n != null ? n.longValue() : null;
  }

  /** JWT de un solo uso de flujo: credenciales OK, falta código TOTP. */
  public String generateTotpPendingToken(long userId) {
    Date now = new Date();
    Date exp = new Date(now.getTime() + totpPendingExpirationMs);
    return Jwts.builder()
        .subject("totp_pending")
        .claim(CLAIM_TYP, TYP_TOTP_PENDING)
        .claim("uid", userId)
        .issuedAt(now)
        .expiration(exp)
        .signWith(key)
        .compact();
  }

  public java.util.Optional<Long> parseTotpPendingTokenUserId(String token) {
    try {
      Claims c = parse(token);
      if (!TYP_TOTP_PENDING.equals(c.get(CLAIM_TYP, String.class))) {
        return java.util.Optional.empty();
      }
      Number n = c.get("uid", Number.class);
      return n == null ? java.util.Optional.empty() : java.util.Optional.of(n.longValue());
    } catch (Exception e) {
      return java.util.Optional.empty();
    }
  }
}
