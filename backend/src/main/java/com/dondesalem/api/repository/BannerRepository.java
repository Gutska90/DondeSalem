package com.dondesalem.api.repository;

import com.dondesalem.api.domain.Banner;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BannerRepository extends JpaRepository<Banner, Long> {

  @Query(
      """
      SELECT b FROM Banner b WHERE b.active = true
      AND (b.startsAt IS NULL OR b.startsAt <= :now)
      AND (b.endsAt IS NULL OR b.endsAt >= :now)
      ORDER BY b.sortOrder ASC
      """)
  List<Banner> findActiveVisible(@Param("now") Instant now);
}
