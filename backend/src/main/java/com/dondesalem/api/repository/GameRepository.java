package com.dondesalem.api.repository;

import com.dondesalem.api.domain.Game;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameRepository extends JpaRepository<Game, Long> {

  Optional<Game> findBySlug(String slug);
}
