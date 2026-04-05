package com.dondesalem.api.dto.auth;

import com.dondesalem.api.dto.user.UserResponse;

public record TokenResponse(String accessToken, UserResponse user) {}
