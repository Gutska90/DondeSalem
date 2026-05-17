package com.dondesalem.api.controller;

import com.dondesalem.api.dto.auth.TotpConfirmRequest;
import com.dondesalem.api.dto.auth.TotpDisableRequest;
import com.dondesalem.api.dto.auth.TotpRecoveryCodesResponse;
import com.dondesalem.api.dto.auth.TotpRegenerateRecoveryRequest;
import com.dondesalem.api.dto.auth.TotpSetupResponse;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.security.AuthUser;
import com.dondesalem.api.service.UserTotpService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me/totp")
public class UserTotpController {

  private final UserTotpService userTotpService;

  public UserTotpController(UserTotpService userTotpService) {
    this.userTotpService = userTotpService;
  }

  @PostMapping("/setup")
  public TotpSetupResponse setup(@AuthenticationPrincipal AuthUser auth) {
    requireAuth(auth);
    return userTotpService.beginSetup(auth.id());
  }

  @PostMapping("/confirm")
  public TotpRecoveryCodesResponse confirm(
      @AuthenticationPrincipal AuthUser auth, @Valid @RequestBody TotpConfirmRequest body) {
    requireAuth(auth);
    return userTotpService.confirmSetup(auth.id(), body);
  }

  @PostMapping("/recovery/regenerate")
  public TotpRecoveryCodesResponse regenerateRecovery(
      @AuthenticationPrincipal AuthUser auth,
      @Valid @RequestBody TotpRegenerateRecoveryRequest body) {
    requireAuth(auth);
    return userTotpService.regenerateRecoveryCodes(auth.id(), body);
  }

  @PostMapping("/disable")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void disable(
      @AuthenticationPrincipal AuthUser auth, @Valid @RequestBody TotpDisableRequest body) {
    requireAuth(auth);
    userTotpService.disable(auth.id(), body);
  }

  private static void requireAuth(AuthUser auth) {
    if (auth == null) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "No autenticado");
    }
  }
}
