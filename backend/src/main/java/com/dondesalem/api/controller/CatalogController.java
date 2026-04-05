package com.dondesalem.api.controller;

import com.dondesalem.api.dto.catalog.CategoryDto;
import com.dondesalem.api.dto.catalog.GameDto;
import com.dondesalem.api.service.CatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CatalogController {

  private final CatalogService catalogService;

  public CatalogController(CatalogService catalogService) {
    this.catalogService = catalogService;
  }

  @GetMapping("/categories")
  public List<CategoryDto> categories() {
    return catalogService.categories();
  }

  @GetMapping("/games")
  public List<GameDto> games() {
    return catalogService.games();
  }
}
