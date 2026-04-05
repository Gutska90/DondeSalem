package com.dondesalem.api.controller;

import com.dondesalem.api.dto.catalog.CategoryDto;
import com.dondesalem.api.dto.catalog.CategoryRequest;
import com.dondesalem.api.service.AdminCategoryService;
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
@RequestMapping("/api/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCategoryController {

  private final AdminCategoryService adminCategoryService;

  public AdminCategoryController(AdminCategoryService adminCategoryService) {
    this.adminCategoryService = adminCategoryService;
  }

  @GetMapping
  public List<CategoryDto> list() {
    return adminCategoryService.findAll();
  }

  @GetMapping("/{id}")
  public CategoryDto get(@PathVariable Long id) {
    return adminCategoryService.findById(id);
  }

  @PostMapping
  public CategoryDto create(@Valid @RequestBody CategoryRequest request) {
    return adminCategoryService.create(request);
  }

  @PutMapping("/{id}")
  public CategoryDto update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
    return adminCategoryService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    adminCategoryService.delete(id);
  }
}
