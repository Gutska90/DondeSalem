package com.dondesalem.api.dto.user;

import com.dondesalem.api.domain.Role;

public record UserResponse(
    Long id, String email, String firstName, String lastName, String phone, Role role) {}
