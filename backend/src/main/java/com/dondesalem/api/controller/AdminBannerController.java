package com.dondesalem.api.controller;

import com.dondesalem.api.dto.cms.BannerAdminDto;
import com.dondesalem.api.dto.cms.BannerRequest;
import com.dondesalem.api.service.AdminBannerService;
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
@RequestMapping("/api/admin/banners")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBannerController {

  private final AdminBannerService adminBannerService;

  public AdminBannerController(AdminBannerService adminBannerService) {
    this.adminBannerService = adminBannerService;
  }

  @GetMapping
  public List<BannerAdminDto> list() {
    return adminBannerService.findAll();
  }

  @GetMapping("/{id}")
  public BannerAdminDto get(@PathVariable Long id) {
    return adminBannerService.findById(id);
  }

  @PostMapping
  public BannerAdminDto create(@Valid @RequestBody BannerRequest request) {
    return adminBannerService.create(request);
  }

  @PutMapping("/{id}")
  public BannerAdminDto update(@PathVariable Long id, @Valid @RequestBody BannerRequest request) {
    return adminBannerService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    adminBannerService.delete(id);
  }
}
