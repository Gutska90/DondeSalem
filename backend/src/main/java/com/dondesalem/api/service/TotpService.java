package com.dondesalem.api.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.stereotype.Service;

@Service
public class TotpService {

  private final GoogleAuthenticator googleAuthenticator = new GoogleAuthenticator();

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
