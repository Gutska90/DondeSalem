package com.dondesalem.api.service;

import com.dondesalem.api.domain.Category;
import com.dondesalem.api.dto.catalog.CategoryDto;
import com.dondesalem.api.dto.catalog.CategoryRequest;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.repository.CategoryRepository;
import com.dondesalem.api.repository.ProductRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminCategoryService {

  private final CategoryRepository categoryRepository;
  private final ProductRepository productRepository;

  public AdminCategoryService(
      CategoryRepository categoryRepository, ProductRepository productRepository) {
    this.categoryRepository = categoryRepository;
    this.productRepository = productRepository;
  }

  @Transactional(readOnly = true)
  public List<CategoryDto> findAll() {
    return categoryRepository.findAll(Sort.by("sortOrder", "name")).stream()
        .map(AdminCategoryService::toDto)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public CategoryDto findById(Long id) {
    Category c =
        categoryRepository
            .findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));
    return toDto(c);
  }

  @Transactional
  public CategoryDto create(CategoryRequest req) {
    String slug = normalizeSlug(req.slug());
    if (categoryRepository.existsBySlug(slug)) {
      throw new ApiException(HttpStatus.CONFLICT, "El slug ya existe");
    }
    Category c = new Category();
    c.setName(req.name().trim());
    c.setSlug(slug);
    c.setSortOrder(req.sortOrder());
    applyParent(c, req.parentId());
    return toDto(categoryRepository.save(c));
  }

  @Transactional
  public CategoryDto update(Long id, CategoryRequest req) {
    Category c =
        categoryRepository
            .findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));
    String slug = normalizeSlug(req.slug());
    categoryRepository
        .findBySlug(slug)
        .filter(other -> !other.getId().equals(id))
        .ifPresent(x -> {
          throw new ApiException(HttpStatus.CONFLICT, "El slug ya existe");
        });
    c.setName(req.name().trim());
    c.setSlug(slug);
    c.setSortOrder(req.sortOrder());
    applyParent(c, req.parentId());
    if (req.parentId() != null && req.parentId().equals(id)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "La categoría no puede ser padre de sí misma");
    }
    return toDto(categoryRepository.save(c));
  }

  @Transactional
  public void delete(Long id) {
    if (!categoryRepository.existsById(id)) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Categoría no encontrada");
    }
    if (productRepository.countByCategory_Id(id) > 0) {
      throw new ApiException(
          HttpStatus.CONFLICT, "No se puede eliminar: hay productos asociados a esta categoría");
    }
    if (categoryRepository.countByParent_Id(id) > 0) {
      throw new ApiException(
          HttpStatus.CONFLICT, "No se puede eliminar: hay subcategorías bajo esta categoría");
    }
    categoryRepository.deleteById(id);
  }

  private void applyParent(Category c, Long parentId) {
    if (parentId == null) {
      c.setParent(null);
      return;
    }
    Category parent =
        categoryRepository
            .findById(parentId)
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Categoría padre inválida"));
    c.setParent(parent);
  }

  private static String normalizeSlug(String slug) {
    return slug.trim().toLowerCase();
  }

  private static CategoryDto toDto(Category c) {
    return new CategoryDto(
        c.getId(),
        c.getName(),
        c.getSlug(),
        c.getSortOrder(),
        c.getParent() != null ? c.getParent().getId() : null);
  }
}
