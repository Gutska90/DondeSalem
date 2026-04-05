package com.dondesalem.api.service;

import com.dondesalem.api.domain.Role;
import com.dondesalem.api.domain.User;
import com.dondesalem.api.dto.auth.BootstrapAdminRequest;
import com.dondesalem.api.dto.auth.ChangePasswordRequest;
import com.dondesalem.api.dto.auth.ForgotPasswordRequest;
import com.dondesalem.api.dto.auth.LoginRequest;
import com.dondesalem.api.dto.auth.RegisterRequest;
import com.dondesalem.api.dto.auth.ResetPasswordRequest;
import com.dondesalem.api.dto.auth.TokenResponse;
import com.dondesalem.api.dto.user.UserResponse;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.repository.UserRepository;
import com.dondesalem.api.security.JwtService;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private static final Logger log = LoggerFactory.getLogger(AuthService.class);

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final String adminBootstrapToken;
  private final ObjectProvider<JavaMailSender> mailSender;
  private final String mailFrom;
  private final String publicFrontendUrl;
  private final int passwordResetExpirationMinutes;

  private final SecureRandom secureRandom = new SecureRandom();

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      @Value("${app.admin-bootstrap-token:}") String adminBootstrapToken,
      ObjectProvider<JavaMailSender> mailSender,
      @Value("${app.mail.from:}") String mailFrom,
      @Value("${app.public-frontend-url:http://localhost:3000}") String publicFrontendUrl,
      @Value("${app.auth.password-reset-expiration-minutes:60}") int passwordResetExpirationMinutes) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.adminBootstrapToken = adminBootstrapToken;
    this.mailSender = mailSender;
    this.mailFrom = mailFrom;
    this.publicFrontendUrl = publicFrontendUrl != null ? publicFrontendUrl.trim() : "";
    this.passwordResetExpirationMinutes = Math.max(15, passwordResetExpirationMinutes);
  }

  @Transactional
  public TokenResponse register(RegisterRequest req) {
    String email = req.email().trim().toLowerCase();
    if (userRepository.existsByEmail(email)) {
      throw new ApiException(HttpStatus.CONFLICT, "El correo ya está registrado");
    }
    User u = new User();
    u.setEmail(email);
    u.setPasswordHash(passwordEncoder.encode(req.password()));
    u.setFirstName(req.firstName().trim());
    u.setLastName(req.lastName().trim());
    u.setPhone(req.phone() != null ? req.phone().trim() : null);
    u.setRole(Role.CLIENTE);
    userRepository.save(u);
    return new TokenResponse(jwtService.generateToken(u), toUser(u));
  }

  @Transactional(readOnly = true)
  public TokenResponse login(LoginRequest req) {
    String email = req.email().trim().toLowerCase();
    User u =
        userRepository
            .findByEmail(email)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));
    if (!passwordEncoder.matches(req.password(), u.getPasswordHash())) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
    }
    return new TokenResponse(jwtService.generateToken(u), toUser(u));
  }

  /**
   * Crea la primera cuenta ADMIN cuando {@code app.admin-bootstrap-token} coincide. Deshabilitado si
   * el token no está definido en el entorno.
   */
  @Transactional
  public TokenResponse bootstrapAdmin(BootstrapAdminRequest req) {
    if (adminBootstrapToken == null || adminBootstrapToken.isBlank()) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Bootstrap de administrador no configurado");
    }
    if (!adminBootstrapToken.equals(req.bootstrapToken())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Token de bootstrap inválido");
    }
    String email = req.email().trim().toLowerCase();
    if (userRepository.existsByEmail(email)) {
      throw new ApiException(HttpStatus.CONFLICT, "El correo ya está registrado");
    }
    User u = new User();
    u.setEmail(email);
    u.setPasswordHash(passwordEncoder.encode(req.password()));
    u.setFirstName(req.firstName().trim());
    u.setLastName(req.lastName().trim());
    u.setPhone(null);
    u.setRole(Role.ADMIN);
    userRepository.save(u);
    return new TokenResponse(jwtService.generateToken(u), toUser(u));
  }

  @Transactional
  public void changePassword(Long userId, ChangePasswordRequest req) {
    User u =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    if (!passwordEncoder.matches(req.currentPassword(), u.getPasswordHash())) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Contraseña actual incorrecta");
    }
    u.setPasswordHash(passwordEncoder.encode(req.newPassword()));
    u.setPasswordResetTokenHash(null);
    u.setPasswordResetExpiresAt(null);
    userRepository.save(u);
  }

  /**
   * Si el correo existe, genera token y envía mail (si hay SMTP). Respuesta siempre genérica para no
   * filtrar correos registrados.
   */
  @Transactional
  public void requestPasswordReset(ForgotPasswordRequest req) {
    String email = req.email().trim().toLowerCase();
    Optional<User> opt = userRepository.findByEmail(email);
    if (opt.isEmpty()) {
      log.info("Solicitud de restablecimiento: correo no registrado (omitido)");
      return;
    }
    User u = opt.get();
    byte[] raw = new byte[32];
    secureRandom.nextBytes(raw);
    String token = HexFormat.of().formatHex(raw);
    String hash = sha256Hex(token);
    u.setPasswordResetTokenHash(hash);
    u.setPasswordResetExpiresAt(
        Instant.now().plus(passwordResetExpirationMinutes, ChronoUnit.MINUTES));
    userRepository.save(u);

    String link = resetLink(token);
    JavaMailSender sender = mailSender.getIfAvailable();
    if (sender != null && mailFrom != null && !mailFrom.isBlank()) {
      try {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(mailFrom);
        msg.setTo(u.getEmail());
        msg.setSubject("Restablecer contraseña — DondeSalem");
        msg.setText(
            "Hola,\n\n"
                + "Para elegir una nueva contraseña, abrí este enlace (válido por "
                + passwordResetExpirationMinutes
                + " minutos):\n\n"
                + link
                + "\n\n"
                + "Si no pediste este correo, ignorá el mensaje.\n\n"
                + "— DondeSalem\n");
        sender.send(msg);
      } catch (Exception e) {
        log.warn("No se pudo enviar correo de restablecimiento", e);
      }
    } else {
      log.warn(
          "SMTP no configurado: enlace de restablecimiento para {} → {}",
          u.getEmail(),
          link);
    }
  }

  @Transactional
  public void resetPassword(ResetPasswordRequest req) {
    String token = req.token().trim();
    if (token.isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Enlace inválido o caducado");
    }
    String hash = sha256Hex(token);
    User u =
        userRepository
            .findByPasswordResetTokenHash(hash)
            .orElseThrow(
                () -> new ApiException(HttpStatus.BAD_REQUEST, "Enlace inválido o caducado"));
    if (u.getPasswordResetExpiresAt() == null
        || u.getPasswordResetExpiresAt().isBefore(Instant.now())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Enlace inválido o caducado");
    }
    u.setPasswordHash(passwordEncoder.encode(req.newPassword()));
    u.setPasswordResetTokenHash(null);
    u.setPasswordResetExpiresAt(null);
    userRepository.save(u);
  }

  private String resetLink(String rawToken) {
    String base = publicFrontendUrl.replaceAll("/+$", "");
    return base + "/auth/restablecer?token=" + URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
  }

  private static String sha256Hex(String input) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(digest);
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }

  private static UserResponse toUser(User u) {
    return new UserResponse(
        u.getId(), u.getEmail(), u.getFirstName(), u.getLastName(), u.getPhone(), u.getRole());
  }
}
