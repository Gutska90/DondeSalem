package com.dondesalem.api.controller;

import com.dondesalem.api.dto.auth.ChangePasswordRequest;
import com.dondesalem.api.dto.user.UserResponse;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.repository.UserRepository;
import com.dondesalem.api.security.AuthUser;
import com.dondesalem.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class MeController {

  private final UserRepository userRepository;
  private final AuthService authService;

  public MeController(UserRepository userRepository, AuthService authService) {
    this.userRepository = userRepository;
    this.authService = authService;
  }

  @GetMapping
  public UserResponse me(@AuthenticationPrincipal AuthUser auth) {
    if (auth == null) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "No autenticado");
    }
    return userRepository
        .findById(auth.id())
        .map(UserResponse::from)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
  }

  @PutMapping("/password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void changePassword(
      @AuthenticationPrincipal AuthUser auth, @Valid @RequestBody ChangePasswordRequest body) {
    if (auth == null) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "No autenticado");
    }
    authService.changePassword(auth.id(), body);
  }
}
