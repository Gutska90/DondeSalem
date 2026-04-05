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

  private final SecretKey key;
  private final long expirationMs;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.expiration-ms}") long expirationMs) {
    byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
    if (bytes.length < 32) {
      throw new IllegalStateException(
          "JWT secret must be at least 256 bits (32 bytes). Set JWT_SECRET to a long random string.");
    }
    this.key = Keys.hmacShaKeyFor(bytes);
    this.expirationMs = expirationMs;
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
}
