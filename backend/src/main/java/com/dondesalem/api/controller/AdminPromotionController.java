package com.dondesalem.api.controller;

import com.dondesalem.api.dto.cms.PromotionAdminDto;
import com.dondesalem.api.dto.cms.PromotionRequest;
import com.dondesalem.api.service.AdminPromotionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/promotions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPromotionController {

  private final AdminPromotionService adminPromotionService;

  public AdminPromotionController(AdminPromotionService adminPromotionService) {
    this.adminPromotionService = adminPromotionService;
  }

  @GetMapping
  public List<PromotionAdminDto> list() {
    return adminPromotionService.findAll();
  }

  @GetMapping("/{id}")
  public PromotionAdminDto get(@PathVariable Long id) {
    return adminPromotionService.findById(id);
  }

  @PostMapping
  public PromotionAdminDto create(@Valid @RequestBody PromotionRequest request) {
    return adminPromotionService.create(request);
  }

  @PutMapping("/{id}")
  public PromotionAdminDto update(@PathVariable Long id, @Valid @RequestBody PromotionRequest request) {
    return adminPromotionService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    adminPromotionService.delete(id);
  }
}
