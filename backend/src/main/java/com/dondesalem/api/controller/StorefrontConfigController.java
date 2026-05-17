package com.dondesalem.api.controller;

import com.dondesalem.api.dto.config.PublicStorefrontConfigDto;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/config")
public class StorefrontConfigController {

  private final String transferBankInstructions;
  private final String googleOAuthClientId;

  public StorefrontConfigController(
      @Value("${app.transfer.bank-instructions:}") String transferBankInstructions,
      @Value("${app.google.client-ids:}") String googleClientIds) {
    this.transferBankInstructions = transferBankInstructions != null ? transferBankInstructions : "";
    this.googleOAuthClientId = firstGoogleClientId(googleClientIds);
  }

  private static String firstGoogleClientId(String raw) {
    if (raw == null || raw.isBlank()) {
      return null;
    }
    return Arrays.stream(raw.split(",")).map(String::trim).filter(s -> !s.isEmpty()).findFirst().orElse(null);
  }

  @GetMapping("/public")
  public PublicStorefrontConfigDto publicConfig() {
    return new PublicStorefrontConfigDto(transferBankInstructions.trim(), googleOAuthClientId);
  }
}
