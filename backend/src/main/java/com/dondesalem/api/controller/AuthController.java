package com.dondesalem.api.controller;

import com.dondesalem.api.dto.auth.BootstrapAdminRequest;
import com.dondesalem.api.dto.auth.ForgotPasswordRequest;
import com.dondesalem.api.dto.auth.GoogleAuthRequest;
import com.dondesalem.api.dto.auth.LoginRequest;
import com.dondesalem.api.dto.auth.RegisterRequest;
import com.dondesalem.api.dto.auth.ResetPasswordRequest;
import com.dondesalem.api.dto.auth.TotpCompleteLoginRequest;
import com.dondesalem.api.dto.auth.TokenResponse;
import com.dondesalem.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public TokenResponse register(@Valid @RequestBody RegisterRequest request) {
    return authService.register(request);
  }

  @PostMapping("/login")
  public TokenResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }

  @PostMapping("/google")
  public TokenResponse loginWithGoogle(@Valid @RequestBody GoogleAuthRequest request) {
    return authService.loginWithGoogle(request);
  }

  @PostMapping("/totp/complete")
  public TokenResponse completeTotp(@Valid @RequestBody TotpCompleteLoginRequest request) {
    return authService.completeTotpLogin(request);
  }

  @PostMapping("/bootstrap-admin")
  public TokenResponse bootstrapAdmin(@Valid @RequestBody BootstrapAdminRequest request) {
    return authService.bootstrapAdmin(request);
  }

  @PostMapping("/forgot-password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    authService.requestPasswordReset(request);
  }

  @PostMapping("/reset-password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request);
  }
}
