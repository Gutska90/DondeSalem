package com.dondesalem.api.controller;

import com.dondesalem.api.dto.config.PublicStorefrontConfigDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/config")
public class StorefrontConfigController {

  private final String transferBankInstructions;

  public StorefrontConfigController(
      @Value("${app.transfer.bank-instructions:}") String transferBankInstructions) {
    this.transferBankInstructions = transferBankInstructions != null ? transferBankInstructions : "";
  }

  @GetMapping("/public")
  public PublicStorefrontConfigDto publicConfig() {
    return new PublicStorefrontConfigDto(transferBankInstructions.trim());
  }
}
