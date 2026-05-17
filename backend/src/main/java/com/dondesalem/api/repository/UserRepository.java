package com.dondesalem.api.repository;

import com.dondesalem.api.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

  Optional<User> findByEmail(String email);

  Optional<User> findByGoogleSub(String googleSub);

  Optional<User> findByPasswordResetTokenHash(String passwordResetTokenHash);

  boolean existsByEmail(String email);
}
