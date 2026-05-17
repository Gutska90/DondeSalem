package com.dondesalem.api.service;

import com.dondesalem.api.domain.TotpRecoveryCode;
import com.dondesalem.api.domain.User;
import com.dondesalem.api.repository.TotpRecoveryCodeRepository;
import com.dondesalem.api.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TotpRecoveryCodeService {

  private static final int CODE_COUNT = 10;
  private static final SecureRandom RANDOM = new SecureRandom();

  private final TotpRecoveryCodeRepository recoveryCodeRepository;
  private final UserRepository userRepository;

  public TotpRecoveryCodeService(
      TotpRecoveryCodeRepository recoveryCodeRepository, UserRepository userRepository) {
    this.recoveryCodeRepository = recoveryCodeRepository;
    this.userRepository = userRepository;
  }

  /** Invalida los anteriores y crea un juego nuevo; devuelve los textos en claro (solo esta vez). */
  @Transactional
  public List<String> replaceCodesForUser(Long userId) {
    User user =
        userRepository.findById(userId).orElseThrow(() -> new IllegalStateException("user missing"));
    recoveryCodeRepository.deleteByUserId(userId);
    List<String> plaintext = new ArrayList<>(CODE_COUNT);
    for (int i = 0; i < CODE_COUNT; i++) {
      String code = generatePlainCode();
      plaintext.add(code);
      TotpRecoveryCode row = new TotpRecoveryCode();
      row.setUser(user);
      row.setCodeHash(hashNormalized(code));
      recoveryCodeRepository.save(row);
    }
    return plaintext;
  }

  @Transactional
  public boolean tryConsume(Long userId, String rawInput) {
    if (rawInput == null || rawInput.isBlank()) {
      return false;
    }
    String hash = hashNormalized(rawInput);
    return recoveryCodeRepository
        .findActiveByUserAndHash(userId, hash)
        .map(
            c -> {
              c.setConsumedAt(Instant.now());
              recoveryCodeRepository.save(c);
              return true;
            })
        .orElse(false);
  }

  @Transactional
  public void deleteAllForUser(Long userId) {
    recoveryCodeRepository.deleteByUserId(userId);
  }

  private static String generatePlainCode() {
    byte[] b = new byte[6];
    RANDOM.nextBytes(b);
    String h = HexFormat.of().formatHex(b).toUpperCase(Locale.ROOT);
    return h.substring(0, 4) + "-" + h.substring(4, 8) + "-" + h.substring(8, 12);
  }

  static String hashNormalized(String plaintext) {
    String n =
        plaintext
            .trim()
            .toUpperCase(Locale.ROOT)
            .replace("-", "")
            .replace(" ", "");
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      byte[] digest = md.digest(n.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(digest);
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }
}
