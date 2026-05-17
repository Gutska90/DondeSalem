package com.dondesalem.api.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Límites por IP en endpoints públicos sensibles (login, registro, contacto). Sin Redis — memoria
 * local del proceso (adecuado para un solo nodo o tráfico moderado).
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitFilter extends OncePerRequestFilter {

  private final Cache<String, Bucket> cache =
      Caffeine.newBuilder().maximumSize(50_000).expireAfterAccess(2, TimeUnit.HOURS).build();

  @Value("${app.rate-limit.auth-per-minute:30}")
  private int authPerMinute;

  @Value("${app.rate-limit.contact-per-minute:15}")
  private int contactPerMinute;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String uri = request.getRequestURI();
    if (!"POST".equalsIgnoreCase(request.getMethod())) {
      filterChain.doFilter(request, response);
      return;
    }
    String key = null;
    int perMinute = 0;
    if ("/api/auth/login".equals(uri)
        || "/api/auth/register".equals(uri)
        || "/api/auth/google".equals(uri)
        || "/api/auth/totp/complete".equals(uri)) {
      key = "auth:" + clientIp(request);
      perMinute = authPerMinute;
    } else if ("/api/contact".equals(uri)) {
      key = "contact:" + clientIp(request);
      perMinute = contactPerMinute;
    }
    if (key == null) {
      filterChain.doFilter(request, response);
      return;
    }
    int limit = Math.max(1, perMinute);
    Bucket bucket = cache.get(key, k -> newBucket(limit));
    if (!bucket.tryConsume(1)) {
      response.setStatus(429);
      response.setContentType("application/json;charset=UTF-8");
      response
          .getWriter()
          .write(
              "{\"error\":\"Demasiados intentos. Probá en un minuto.\",\"status\":429}");
      return;
    }
    filterChain.doFilter(request, response);
  }

  private static Bucket newBucket(int perMinute) {
    return Bucket.builder()
        .addLimit(Bandwidth.simple(perMinute, Duration.ofMinutes(1)))
        .build();
  }

  private static String clientIp(HttpServletRequest request) {
    String xf = request.getHeader("X-Forwarded-For");
    if (xf != null && !xf.isBlank()) {
      return xf.split(",")[0].trim();
    }
    return request.getRemoteAddr();
  }
}
