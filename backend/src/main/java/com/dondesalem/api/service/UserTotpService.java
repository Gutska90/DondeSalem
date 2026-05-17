package com.dondesalem.api.service;

import com.dondesalem.api.domain.User;
import com.dondesalem.api.dto.auth.TotpConfirmRequest;
import com.dondesalem.api.dto.auth.TotpDisableRequest;
import com.dondesalem.api.dto.auth.TotpRecoveryCodesResponse;
import com.dondesalem.api.dto.auth.TotpRegenerateRecoveryRequest;
import com.dondesalem.api.dto.auth.TotpSetupResponse;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.repository.UserRepository;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserTotpService {

  private final UserRepository userRepository;
  private final TotpService totpService;
  private final TotpRecoveryCodeService totpRecoveryCodeService;
  private final PasswordEncoder passwordEncoder;
  private final String issuer;

  public UserTotpService(
      UserRepository userRepository,
      TotpService totpService,
      TotpRecoveryCodeService totpRecoveryCodeService,
      PasswordEncoder passwordEncoder,
      @Value("${app.totp.issuer:DondeSalem}") String issuer) {
    this.userRepository = userRepository;
    this.totpService = totpService;
    this.totpRecoveryCodeService = totpRecoveryCodeService;
    this.passwordEncoder = passwordEncoder;
    this.issuer = issuer != null && !issuer.isBlank() ? issuer.trim() : "DondeSalem";
  }

  @Transactional
  public TotpSetupResponse beginSetup(Long userId) {
    User u =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    if (u.isTotpEnabled()) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "Ya tenés 2FA activo. Desactivalo antes de reconfigurar.");
    }
    GoogleAuthenticatorKey key = totpService.createCredentials();
    u.setTotpSecret(key.getKey());
    userRepository.save(u);
    return new TotpSetupResponse(key.getKey(), buildOtpauthUri(u.getEmail(), key.getKey()));
  }

  @Transactional
  public TotpRecoveryCodesResponse confirmSetup(Long userId, TotpConfirmRequest req) {
    User u =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    if (u.isTotpEnabled()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "2FA ya está activo");
    }
    if (u.getTotpSecret() == null || u.getTotpSecret().isBlank()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Primero iniciá la configuración de 2FA");
    }
    int code = parseCode(req.code());
    if (!totpService.authorize(u.getTotpSecret(), code)) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Código incorrecto");
    }
    u.setTotpEnabled(true);
    userRepository.save(u);
    return new TotpRecoveryCodesResponse(totpRecoveryCodeService.replaceCodesForUser(userId));
  }

  @Transactional
  public void disable(Long userId, TotpDisableRequest req) {
    User u =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    if (!u.isTotpEnabled()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "2FA no está activo");
    }
    if (u.getTotpSecret() == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Estado de 2FA inconsistente");
    }
    int code = parseCode(req.totpCode());
    if (!totpService.authorize(u.getTotpSecret(), code)) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Código incorrecto");
    }
    if (u.hasPassword()) {
      if (req.currentPassword() == null
          || req.currentPassword().isBlank()
          || !passwordEncoder.matches(req.currentPassword(), u.getPasswordHash())) {
        throw new ApiException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
      }
    }
    totpRecoveryCodeService.deleteAllForUser(userId);
    u.setTotpSecret(null);
    u.setTotpEnabled(false);
    userRepository.save(u);
  }

  @Transactional
  public TotpRecoveryCodesResponse regenerateRecoveryCodes(
      Long userId, TotpRegenerateRecoveryRequest req) {
    User u =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    if (!u.isTotpEnabled()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "2FA no está activo");
    }
    if (u.getTotpSecret() == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Estado de 2FA inconsistente");
    }
    int code = parseCode(req.totpCode());
    if (!totpService.authorize(u.getTotpSecret(), code)) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Código incorrecto");
    }
    if (u.hasPassword()) {
      if (req.currentPassword() == null
          || req.currentPassword().isBlank()
          || !passwordEncoder.matches(req.currentPassword(), u.getPasswordHash())) {
        throw new ApiException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
      }
    }
    return new TotpRecoveryCodesResponse(totpRecoveryCodeService.replaceCodesForUser(userId));
  }

  private String buildOtpauthUri(String email, String secret) {
    String encLabel = URLEncoder.encode(issuer + ":" + email, StandardCharsets.UTF_8);
    String encIssuer = URLEncoder.encode(issuer, StandardCharsets.UTF_8);
    return "otpauth://totp/"
        + encLabel
        + "?secret="
        + secret
        + "&issuer="
        + encIssuer
        + "&algorithm=SHA1&digits=6&period=30";
  }

  private static int parseCode(String raw) {
    try {
      return Integer.parseInt(raw.trim().replaceAll("\\s+", ""));
    } catch (NumberFormatException e) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Código inválido");
    }
  }
}
