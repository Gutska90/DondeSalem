package com.dondesalem.api.dto.catalog;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoryRequest(
    @NotBlank String name,
    @NotBlank String slug,
    Long parentId,
    @NotNull Integer sortOrder) {}
