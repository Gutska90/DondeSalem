package com.dondesalem.api.config;

import com.dondesalem.api.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.core.env.Environment;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      JwtAuthenticationFilter jwtAuthenticationFilter,
      Environment env)
      throws Exception {
    boolean swaggerEnabled =
        env.getProperty("springdoc.swagger-ui.enabled", Boolean.class, true);

    http.csrf(csrf -> csrf.disable())
        .cors(cors -> {})
        .headers(
            h ->
                h.referrerPolicy(
                    referrer ->
                        referrer.policy(
                            ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth -> {
              auth.requestMatchers(
                      HttpMethod.POST,
                      "/api/auth/login",
                      "/api/auth/register",
                      "/api/auth/bootstrap-admin",
                      "/api/auth/forgot-password",
                      "/api/auth/reset-password")
                  .permitAll()
                  .requestMatchers(HttpMethod.GET, "/api/health", "/api/health/ready")
                  .permitAll()
                  .requestMatchers(HttpMethod.GET, "/api/config/public")
                  .permitAll()
                  .requestMatchers(HttpMethod.GET, "/api/orders/track")
                  .permitAll()
                  .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**")
                  .permitAll()
                  .requestMatchers(HttpMethod.GET, "/api/categories", "/api/categories/**")
                  .permitAll()
                  .requestMatchers(HttpMethod.GET, "/api/games", "/api/games/**")
                  .permitAll()
                  .requestMatchers(HttpMethod.GET, "/api/events", "/api/events/**")
                  .permitAll()
                  .requestMatchers(HttpMethod.GET, "/api/banners", "/api/banners/**")
                  .permitAll()
                  .requestMatchers(HttpMethod.GET, "/api/promotions", "/api/promotions/**")
                  .permitAll()
                  .requestMatchers(HttpMethod.POST, "/api/contact")
                  .permitAll();
              if (swaggerEnabled) {
                auth.requestMatchers(
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**",
                        "/v3/api-docs",
                        "/api-docs",
                        "/api-docs/**")
                    .permitAll();
              }
              auth.anyRequest().authenticated();
            })
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }
}
