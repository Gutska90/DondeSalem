package com.dondesalem.api.dto.user;

import com.dondesalem.api.domain.AuthProvider;
import com.dondesalem.api.domain.Role;
import com.dondesalem.api.domain.User;
import java.time.Instant;

public record UserResponse(
    Long id,
    String email,
    String firstName,
    String lastName,
    String phone,
    Role role,
    String profilePictureUrl,
    AuthProvider authProvider,
    Instant lastLoginAt,
    boolean active,
    boolean passwordConfigured,
    boolean totpEnabled) {

  public static UserResponse from(User u) {
    return new UserResponse(
        u.getId(),
        u.getEmail(),
        u.getFirstName(),
        u.getLastName(),
        u.getPhone(),
        u.getRole(),
        u.getProfilePictureUrl(),
        u.getAuthProvider(),
        u.getLastLoginAt(),
        u.isActive(),
        u.hasPassword(),
        u.isTotpEnabled());
  }
}
