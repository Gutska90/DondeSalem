package com.dondesalem.api.repository;

import com.dondesalem.api.domain.TotpRecoveryCode;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TotpRecoveryCodeRepository extends JpaRepository<TotpRecoveryCode, Long> {

  @Query(
      "SELECT c FROM TotpRecoveryCode c WHERE c.user.id = :userId AND c.codeHash = :hash AND"
          + " c.consumedAt IS NULL")
  Optional<TotpRecoveryCode> findActiveByUserAndHash(
      @Param("userId") Long userId, @Param("hash") String hash);

  @Modifying
  @Query("DELETE FROM TotpRecoveryCode c WHERE c.user.id = :userId")
  void deleteByUserId(@Param("userId") Long userId);
}
