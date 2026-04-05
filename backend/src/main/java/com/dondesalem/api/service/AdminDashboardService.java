package com.dondesalem.api.service;

import com.dondesalem.api.domain.OrderStatus;
import com.dondesalem.api.dto.admin.AdminDashboardDto;
import com.dondesalem.api.repository.ContactMessageRepository;
import com.dondesalem.api.repository.CustomerOrderRepository;
import com.dondesalem.api.repository.ProductRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminDashboardService {

  private final ProductRepository productRepository;
  private final CustomerOrderRepository orderRepository;
  private final ContactMessageRepository contactMessageRepository;

  public AdminDashboardService(
      ProductRepository productRepository,
      CustomerOrderRepository orderRepository,
      ContactMessageRepository contactMessageRepository) {
    this.productRepository = productRepository;
    this.orderRepository = orderRepository;
    this.contactMessageRepository = contactMessageRepository;
  }

  @Transactional(readOnly = true)
  public AdminDashboardDto dashboard() {
    long total = productRepository.count();
    long low = productRepository.countByStockQuantityLessThan(5);
    long pending = orderRepository.countByStatus(OrderStatus.PENDIENTE);
    long unread = contactMessageRepository.countByReadFlag(false);
    Instant from = Instant.now().minus(30, ChronoUnit.DAYS);
    BigDecimal revenue = orderRepository.sumTotalCompletedSince(from, OrderStatus.CANCELADO);
    if (revenue == null) {
      revenue = BigDecimal.ZERO;
    }
    return new AdminDashboardDto(
        total,
        low,
        pending,
        revenue.setScale(2, java.math.RoundingMode.HALF_UP),
        unread);
  }
}
