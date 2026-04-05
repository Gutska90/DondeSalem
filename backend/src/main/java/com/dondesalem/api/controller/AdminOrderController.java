package com.dondesalem.api.controller;

import com.dondesalem.api.domain.CustomerOrder;
import com.dondesalem.api.domain.OrderStatus;
import com.dondesalem.api.dto.PageResponse;
import com.dondesalem.api.dto.order.OrderDetailDto;
import com.dondesalem.api.dto.order.OrderSummaryDto;
import com.dondesalem.api.repository.CustomerOrderRepository;
import com.dondesalem.api.service.OrderService;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

  private final OrderService orderService;
  private final CustomerOrderRepository orderRepository;

  public AdminOrderController(OrderService orderService, CustomerOrderRepository orderRepository) {
    this.orderService = orderService;
    this.orderRepository = orderRepository;
  }

  @GetMapping
  public PageResponse<OrderSummaryDto> list(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) OrderStatus status) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<CustomerOrder> pg =
        status == null
            ? orderRepository.findAll(pageable)
            : orderRepository.findByStatus(status, pageable);
    return PageResponse.from(
        pg.map(
            o ->
                new OrderSummaryDto(
                    o.getId(),
                    o.getOrderNumber(),
                    o.getStatus(),
                    o.getTotal(),
                    o.getCreatedAt())));
  }

  /** Exportación simple (hasta 5000 filas) — sin servicios de pago; abrir en Excel/LibreOffice. */
  @GetMapping(value = "/export", produces = "text/csv;charset=UTF-8")
  public void exportCsv(
      @RequestParam(required = false) OrderStatus status, HttpServletResponse response)
      throws IOException {
    String day = LocalDate.now(ZoneId.systemDefault()).format(DateTimeFormatter.ISO_LOCAL_DATE);
    String slug = status == null ? "todos" : status.name().toLowerCase(Locale.ROOT);
    String filename = "pedidos-" + slug + "-" + day + ".csv";
    response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
    int max = 5000;
    Pageable pageable =
        PageRequest.of(0, max, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<CustomerOrder> pg =
        status == null
            ? orderRepository.findAll(pageable)
            : orderRepository.findByStatus(status, pageable);
    try (PrintWriter w = new PrintWriter(response.getOutputStream(), true, java.nio.charset.StandardCharsets.UTF_8)) {
      w.write('\uFEFF');
      w.println("id;orderNumber;status;total;discountTotal;createdAt");
      for (CustomerOrder o : pg.getContent()) {
        w.printf(
            "%d;%s;%s;%s;%s;%s%n",
            o.getId(),
            o.getOrderNumber(),
            o.getStatus(),
            o.getTotal().toPlainString(),
            o.getDiscountTotal().toPlainString(),
            o.getCreatedAt().toString());
      }
    }
  }

  @GetMapping("/{id}")
  public OrderDetailDto get(@PathVariable Long id) {
    return orderService.getByIdAdmin(id);
  }

  public record OrderStatusBody(OrderStatus status) {}

  @PatchMapping("/{id}/status")
  public OrderDetailDto status(@PathVariable Long id, @RequestBody OrderStatusBody body) {
    return orderService.updateStatus(id, body.status());
  }
}
