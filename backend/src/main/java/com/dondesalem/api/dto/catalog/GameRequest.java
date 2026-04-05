package com.dondesalem.api.dto.catalog;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GameRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Size(max = 160) String slug,
    @Size(max = 512) String logoUrl) {}
