package com.dondesalem.api.config;

import com.dondesalem.api.service.MylserenaPeSinglesSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Sincronización periódica precio/imagen desde {@code seed/mylserena-pe-singles.json}. Activar con
 * {@code app.mylserena.sync.enabled=true} y regenerar el JSON (cron o manual + deploy).
 */
@Component
@ConditionalOnProperty(name = "app.mylserena.sync.enabled", havingValue = "true")
public class MylserenaPeSyncScheduler {

  private static final Logger log = LoggerFactory.getLogger(MylserenaPeSyncScheduler.class);

  private final MylserenaPeSinglesSyncService syncService;

  public MylserenaPeSyncScheduler(MylserenaPeSinglesSyncService syncService) {
    this.syncService = syncService;
  }

  @Scheduled(cron = "${app.mylserena.sync.cron:0 0 4 * * *}")
  public void syncNightly() {
    var r = syncService.syncFromClasspath();
    log.info(
        "Mylserena PE sync: filas JSON={}, actualizados={}, sin producto BD={}, omitidos no myl-pe={}, singles myl-pe con stock 0={}",
        r.rowsInFile(),
        r.updated(),
        r.skippedMissingProduct(),
        r.skippedNotMylPeSlug(),
        r.singlesWithZeroStock());
    if (r.singlesWithZeroStock() > 0) {
      log.warn(
          "Stock 0: hay {} singles Mylserena (myl-pe-*) sin unidades; revisar panel admin o reponer.",
          r.singlesWithZeroStock());
    }
  }
}
