package com.dondesalem.api.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorConfig;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import java.util.concurrent.TimeUnit;
import org.springframework.stereotype.Service;

@Service
public class TotpService {

  /** Ventana ±1 intervalo (30 s) para tolerar desfase de reloj del teléfono. */
  private final GoogleAuthenticator googleAuthenticator =
      new GoogleAuthenticator(
          new GoogleAuthenticatorConfig.GoogleAuthenticatorConfigBuilder()
              .setTimeStepSizeInMillis(TimeUnit.SECONDS.toMillis(30))
              .setWindowSize(3)
              .build());

  public GoogleAuthenticatorKey createCredentials() {
    return googleAuthenticator.createCredentials();
  }

  public boolean authorize(String secret, int verificationCode) {
    if (secret == null || secret.isBlank()) {
      return false;
    }
    return googleAuthenticator.authorize(secret, verificationCode);
  }
}
