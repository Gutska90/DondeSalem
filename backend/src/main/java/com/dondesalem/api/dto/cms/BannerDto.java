package com.dondesalem.api.dto.cms;

public record BannerDto(
    Long id, String title, String imageUrl, String linkUrl, Integer sortOrder) {}
