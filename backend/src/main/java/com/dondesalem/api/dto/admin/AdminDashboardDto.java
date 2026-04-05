package com.dondesalem.api.dto.admin;

import java.math.BigDecimal;

public record AdminDashboardDto(
    long totalProducts,
    long lowStockProducts,
    long pendingOrders,
    BigDecimal revenueLast30Days,
    long unreadContactMessages) {}
