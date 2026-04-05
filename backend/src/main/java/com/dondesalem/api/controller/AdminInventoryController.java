package com.dondesalem.api.controller;

import com.dondesalem.api.dto.PageResponse;
import com.dondesalem.api.dto.inventory.AdjustStockRequest;
import com.dondesalem.api.dto.inventory.InventoryMovementDto;
import com.dondesalem.api.security.AuthUser;
import com.dondesalem.api.service.AdminInventoryQueryService;
import com.dondesalem.api.service.InventoryService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/inventory")
@PreAuthorize("hasRole('ADMIN')")
public class AdminInventoryController {

  private final InventoryService inventoryService;
  private final AdminInventoryQueryService adminInventoryQueryService;

  public AdminInventoryController(
      InventoryService inventoryService, AdminInventoryQueryService adminInventoryQueryService) {
    this.inventoryService = inventoryService;
    this.adminInventoryQueryService = adminInventoryQueryService;
  }

  @GetMapping("/movements")
  public PageResponse<InventoryMovementDto> movements(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "30") int size,
      @RequestParam(required = false) Long productId) {
    return adminInventoryQueryService.list(page, size, productId);
  }

  @GetMapping(value = "/movements/export", produces = "text/csv;charset=UTF-8")
  public void exportMovementsCsv(
      @RequestParam(required = false) Long productId, HttpServletResponse response)
      throws IOException {
    String day = LocalDate.now(ZoneId.systemDefault()).format(DateTimeFormatter.ISO_LOCAL_DATE);
    String suffix = productId == null ? "todos" : "producto-" + productId;
    String filename = "movimientos-stock-" + suffix + "-" + day + ".csv";
    response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
    try (PrintWriter w =
        new PrintWriter(response.getOutputStream(), true, StandardCharsets.UTF_8)) {
      adminInventoryQueryService.writeExportCsv(productId, w);
    }
  }

  @PostMapping("/adjust")
  public void adjust(
      @AuthenticationPrincipal AuthUser auth, @Valid @RequestBody AdjustStockRequest request) {
    inventoryService.adjust(request, auth != null ? auth.id() : null);
  }
}
