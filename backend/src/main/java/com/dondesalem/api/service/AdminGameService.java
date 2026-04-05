package com.dondesalem.api.service;

import com.dondesalem.api.domain.Game;
import com.dondesalem.api.dto.catalog.GameDto;
import com.dondesalem.api.dto.catalog.GameRequest;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.repository.GameRepository;
import com.dondesalem.api.repository.ProductRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminGameService {

  private final GameRepository gameRepository;
  private final ProductRepository productRepository;

  public AdminGameService(GameRepository gameRepository, ProductRepository productRepository) {
    this.gameRepository = gameRepository;
    this.productRepository = productRepository;
  }

  @Transactional(readOnly = true)
  public List<GameDto> findAll() {
    return gameRepository.findAll(Sort.by("name")).stream()
        .map(AdminGameService::toDto)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public GameDto findById(Long id) {
    Game g =
        gameRepository
            .findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Juego no encontrado"));
    return toDto(g);
  }

  @Transactional
  public GameDto create(GameRequest req) {
    String slug = normalizeSlug(req.slug());
    if (gameRepository.findBySlug(slug).isPresent()) {
      throw new ApiException(HttpStatus.CONFLICT, "El slug ya existe");
    }
    Game g = new Game();
    g.setName(req.name().trim());
    g.setSlug(slug);
    g.setLogoUrl(blankToNull(req.logoUrl()));
    return toDto(gameRepository.save(g));
  }

  @Transactional
  public GameDto update(Long id, GameRequest req) {
    Game g =
        gameRepository
            .findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Juego no encontrado"));
    String slug = normalizeSlug(req.slug());
    gameRepository
        .findBySlug(slug)
        .filter(other -> !other.getId().equals(id))
        .ifPresent(x -> {
          throw new ApiException(HttpStatus.CONFLICT, "El slug ya existe");
        });
    g.setName(req.name().trim());
    g.setSlug(slug);
    g.setLogoUrl(blankToNull(req.logoUrl()));
    return toDto(gameRepository.save(g));
  }

  @Transactional
  public void delete(Long id) {
    if (!gameRepository.existsById(id)) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Juego no encontrado");
    }
    if (productRepository.countByGame_Id(id) > 0) {
      throw new ApiException(
          HttpStatus.CONFLICT, "No se puede eliminar: hay productos asociados a este juego");
    }
    gameRepository.deleteById(id);
  }

  private static String normalizeSlug(String slug) {
    return slug.trim().toLowerCase();
  }

  private static String blankToNull(String s) {
    if (s == null) return null;
    String t = s.trim();
    return t.isEmpty() ? null : t;
  }

  private static GameDto toDto(Game g) {
    return new GameDto(g.getId(), g.getName(), g.getSlug(), g.getLogoUrl());
  }
}
