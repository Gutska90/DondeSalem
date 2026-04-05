package com.dondesalem.api.controller;

import java.sql.Connection;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class HealthController {

  private final DataSource dataSource;

  public HealthController(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  @GetMapping("/api/health")
  public Map<String, String> health() {
    return Map.of("status", "ok");
  }

  /** Liveness + conexión JDBC (útil detrás de balanceadores / K8s). */
  @GetMapping("/api/health/ready")
  public Map<String, String> ready() {
    try (Connection c = dataSource.getConnection()) {
      if (!c.isValid(3)) {
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "DB not valid");
      }
      return Map.of("status", "ready", "database", "up");
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "DB unavailable");
    }
  }
}
