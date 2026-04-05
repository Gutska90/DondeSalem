package com.dondesalem.api.service;

import com.dondesalem.api.dto.catalog.CategoryDto;
import com.dondesalem.api.dto.catalog.GameDto;
import com.dondesalem.api.repository.CategoryRepository;
import com.dondesalem.api.repository.GameRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {

  private final CategoryRepository categoryRepository;
  private final GameRepository gameRepository;

  public CatalogService(CategoryRepository categoryRepository, GameRepository gameRepository) {
    this.categoryRepository = categoryRepository;
    this.gameRepository = gameRepository;
  }

  @Transactional(readOnly = true)
  public List<CategoryDto> categories() {
    return categoryRepository.findAll(Sort.by("sortOrder", "name")).stream()
        .map(
            c ->
                new CategoryDto(
                    c.getId(),
                    c.getName(),
                    c.getSlug(),
                    c.getSortOrder(),
                    c.getParent() != null ? c.getParent().getId() : null))
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public List<GameDto> games() {
    return gameRepository.findAll(Sort.by("name")).stream()
        .map(g -> new GameDto(g.getId(), g.getName(), g.getSlug(), g.getLogoUrl()))
        .collect(Collectors.toList());
  }
}
