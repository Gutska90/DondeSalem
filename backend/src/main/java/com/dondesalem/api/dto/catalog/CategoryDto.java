package com.dondesalem.api.dto.catalog;

public record CategoryDto(Long id, String name, String slug, Integer sortOrder, Long parentId) {}
