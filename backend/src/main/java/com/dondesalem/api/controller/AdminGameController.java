package com.dondesalem.api.controller;

import com.dondesalem.api.dto.catalog.GameDto;
import com.dondesalem.api.dto.catalog.GameRequest;
import com.dondesalem.api.service.AdminGameService;
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
@RequestMapping("/api/admin/games")
@PreAuthorize("hasRole('ADMIN')")
public class AdminGameController {

  private final AdminGameService adminGameService;

  public AdminGameController(AdminGameService adminGameService) {
    this.adminGameService = adminGameService;
  }

  @GetMapping
  public List<GameDto> list() {
    return adminGameService.findAll();
  }

  @GetMapping("/{id}")
  public GameDto get(@PathVariable Long id) {
    return adminGameService.findById(id);
  }

  @PostMapping
  public GameDto create(@Valid @RequestBody GameRequest request) {
    return adminGameService.create(request);
  }

  @PutMapping("/{id}")
  public GameDto update(@PathVariable Long id, @Valid @RequestBody GameRequest request) {
    return adminGameService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    adminGameService.delete(id);
  }
}
