package com.dondesalem.api.config;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;

/**
 * Con perfil {@code prod}, exige {@code DATABASE_URL}, {@code DATABASE_USER} y
 * {@code DATABASE_PASSWORD} reales (sin placeholders ni localhost).
 */
public class ProductionDatasourceEnvironmentPostProcessor
    implements EnvironmentPostProcessor, Ordered {

  private static final List<String> URL_PLACEHOLDER_MARKERS =
      List.of("HOST.pooler", "PROJECT_REF", "tu_password", "HOST.", "ejemplo");

  @Override
  public void postProcessEnvironment(
      ConfigurableEnvironment environment, SpringApplication application) {
    if (!isProdProfile(environment)) {
      return;
    }

    String url = environment.getProperty("DATABASE_URL");
    String user = environment.getProperty("DATABASE_USER");
    String password = environment.getProperty("DATABASE_PASSWORD");

    if (url == null || url.isBlank()) {
      throw fail(
          "DATABASE_URL es obligatorio con SPRING_PROFILES_ACTIVE=prod. "
              + "Configúralo en Railway → Variables con tu JDBC de Supabase "
              + "(ej. jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require).");
    }

    if (user == null || user.isBlank()) {
      throw fail(
          "DATABASE_USER es obligatorio con perfil prod (ej. postgres.TU_PROJECT_REF en Supabase pooler).");
    }

    if (password == null || password.isBlank()) {
      throw fail("DATABASE_PASSWORD es obligatorio con perfil prod.");
    }

    String urlLower = url.toLowerCase(Locale.ROOT);
    if (!urlLower.startsWith("jdbc:postgresql://")) {
      throw fail(
          "DATABASE_URL debe ser JDBC PostgreSQL (jdbc:postgresql://...). Valor actual: "
              + summarize(url));
    }

    if (urlLower.contains("localhost") || urlLower.contains("127.0.0.1")) {
      throw fail(
          "DATABASE_URL no puede apuntar a localhost en producción. Usa la URL de Supabase.");
    }

    for (String marker : URL_PLACEHOLDER_MARKERS) {
      if (url.contains(marker)) {
        throw fail(
            "DATABASE_URL parece un placeholder de documentación (contiene \""
                + marker
                + "\"). "
                + "Reemplázalo por la URL real de Supabase en Railway → Variables.");
      }
    }

    if (user.contains("PROJECT_REF")) {
      throw fail("DATABASE_USER contiene PROJECT_REF: sustituye por tu project ref de Supabase.");
    }
  }

  private static boolean isProdProfile(ConfigurableEnvironment environment) {
    return Arrays.asList(environment.getActiveProfiles()).contains("prod");
  }

  private static IllegalStateException fail(String message) {
    return new IllegalStateException("[DondeSalem prod] " + message);
  }

  private static String summarize(String url) {
    if (url.length() <= 80) {
      return url;
    }
    return url.substring(0, 77) + "...";
  }

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE;
  }
}
