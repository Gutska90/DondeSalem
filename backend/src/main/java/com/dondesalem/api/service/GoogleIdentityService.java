package com.dondesalem.api.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GoogleIdentityService {

  private final GoogleIdTokenVerifier verifier;

  public GoogleIdentityService(@Value("${app.google.client-ids:}") String clientIdsRaw) {
    List<String> audiences =
        Arrays.stream((clientIdsRaw != null ? clientIdsRaw : "").split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toList());
    if (audiences.isEmpty()) {
      this.verifier = null;
      return;
    }
    this.verifier =
        new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
            .setAudience(audiences)
            .build();
  }

  public boolean isConfigured() {
    return verifier != null;
  }

  public Optional<VerifiedGoogleProfile> verify(String idTokenJwt) {
    if (verifier == null || idTokenJwt == null || idTokenJwt.isBlank()) {
      return Optional.empty();
    }
    try {
      GoogleIdToken idToken = verifier.verify(idTokenJwt);
      if (idToken == null) {
        return Optional.empty();
      }
      GoogleIdToken.Payload p = idToken.getPayload();
      if (!Boolean.TRUE.equals(p.getEmailVerified())) {
        return Optional.empty();
      }
      String email = p.getEmail();
      String sub = p.getSubject();
      if (email == null || email.isBlank() || sub == null || sub.isBlank()) {
        return Optional.empty();
      }
      String given = (String) p.get("given_name");
      String family = (String) p.get("family_name");
      if (given == null) {
        given = "";
      }
      if (family == null) {
        family = "";
      }
      String picture = (String) p.get("picture");
      if (picture != null) {
        picture = picture.trim();
        if (picture.isBlank()) {
          picture = null;
        }
      }
      return Optional.of(
          new VerifiedGoogleProfile(
              email.trim().toLowerCase(), sub.trim(), given.trim(), family.trim(), picture));
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  public record VerifiedGoogleProfile(
      String email, String subject, String givenName, String familyName, String pictureUrl) {}
}
