package com.dondesalem.api.controller;

import com.dondesalem.api.seed.MylserenaPeSinglesImportResult;
import com.dondesalem.api.seed.MylserenaPeSinglesSyncResult;
import com.dondesalem.api.seed.MylserenaSinglesEraStatsResult;
import com.dondesalem.api.service.MylserenaPeSinglesImportService;
import com.dondesalem.api.service.MylserenaPeSinglesSyncService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/seed")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSeedController {

  private final MylserenaPeSinglesImportService mylserenaPeSinglesImportService;
  private final MylserenaPeSinglesSyncService mylserenaPeSinglesSyncService;

  public AdminSeedController(
      MylserenaPeSinglesImportService mylserenaPeSinglesImportService,
      MylserenaPeSinglesSyncService mylserenaPeSinglesSyncService) {
    this.mylserenaPeSinglesImportService = mylserenaPeSinglesImportService;
    this.mylserenaPeSinglesSyncService = mylserenaPeSinglesSyncService;
  }

  /** Carga singles desde los JSON de seed del catálogo externo. */
  @PostMapping("/catalog-singles/import")
  public MylserenaPeSinglesImportResult importMylserenaPeSingles() {
    return mylserenaPeSinglesImportService.importMissingFromClasspath();
  }

  /** Actualiza precio e imagen de singles ya existentes según JSON en classpath. */
  @PostMapping("/catalog-singles/sync")
  public MylserenaPeSinglesSyncResult syncMylserenaPeSingles() {
    return mylserenaPeSinglesSyncService.syncFromClasspath();
  }

  /** Conteo rápido por bloque detectado en setName (PE/PB/Otros). */
  @GetMapping("/catalog-singles/bloque-stats")
  public MylserenaSinglesEraStatsResult mylserenaEraStats() {
    return mylserenaPeSinglesSyncService.eraStats();
  }
}
