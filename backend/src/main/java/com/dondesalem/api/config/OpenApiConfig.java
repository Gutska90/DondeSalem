package com.dondesalem.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  private static final String BEARER = "bearerAuth";

  @Bean
  public OpenAPI openAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title("DondeSalem API")
                .description(
                    "API REST para tienda TCG / juegos de mesa. "
                        + "Autenticación JWT: cabecera `Authorization: Bearer <token>` "
                        + "(obtenido en `POST /api/auth/login` o `POST /api/auth/register`).")
                .version("1.0.0"))
        .addSecurityItem(new SecurityRequirement().addList(BEARER))
        .components(
            new Components()
                .addSecuritySchemes(
                    BEARER,
                    new SecurityScheme()
                        .name(BEARER)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
  }
}
