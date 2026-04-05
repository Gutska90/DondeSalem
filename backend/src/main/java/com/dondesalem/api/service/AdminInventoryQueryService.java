package com.dondesalem.api.service;

import com.dondesalem.api.domain.InventoryMovement;
import com.dondesalem.api.dto.PageResponse;
import com.dondesalem.api.dto.inventory.InventoryMovementDto;
import com.dondesalem.api.repository.InventoryMovementRepository;
import java.io.PrintWriter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminInventoryQueryService {

  private final InventoryMovementRepository inventoryMovementRepository;

  public AdminInventoryQueryService(InventoryMovementRepository inventoryMovementRepository) {
    this.inventoryMovementRepository = inventoryMovementRepository;
  }

  @Transactional(readOnly = true)
  public PageResponse<InventoryMovementDto> list(int page, int size, Long productId) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<InventoryMovement> pg =
        productId == null
            ? inventoryMovementRepository.findAllByOrderByCreatedAtDesc(pageable)
            : inventoryMovementRepository.findByProduct_IdOrderByCreatedAtDesc(productId, pageable);
    return PageResponse.from(
        pg.map(
            m ->
                new InventoryMovementDto(
                    m.getId(),
                    m.getProduct().getId(),
                    m.getProduct().getName(),
                    m.getQuantityChange(),
                    m.getReason(),
                    m.getReferenceType(),
                    m.getReferenceId(),
                    m.getCreatedAt())));
  }

  /** Hasta 5000 filas, más recientes primero — mismo filtro opcional que la lista. */
  @Transactional(readOnly = true)
  public void writeExportCsv(Long productId, PrintWriter w) {
    int max = 5000;
    Pageable pageable = PageRequest.of(0, max, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<InventoryMovement> pg =
        productId == null
            ? inventoryMovementRepository.findAllByOrderByCreatedAtDesc(pageable)
            : inventoryMovementRepository.findByProduct_IdOrderByCreatedAtDesc(productId, pageable);
    w.write('\uFEFF');
    w.println("id;productId;productName;quantityChange;reason;referenceType;referenceId;createdAt");
    for (InventoryMovement m : pg.getContent()) {
      w.printf(
          "%d;%d;%s;%d;%s;%s;%s;%s%n",
          m.getId(),
          m.getProduct().getId(),
          csvEscape(m.getProduct().getName()),
          m.getQuantityChange(),
          m.getReason().name(),
          m.getReferenceType() != null ? m.getReferenceType() : "",
          m.getReferenceId() != null ? m.getReferenceId().toString() : "",
          m.getCreatedAt().toString());
    }
  }

  private static String csvEscape(String s) {
    if (s == null) {
      return "";
    }
    String t = s.replace("\"", "\"\"");
    if (t.contains(";") || t.contains("\n") || t.contains("\"")) {
      return "\"" + t + "\"";
    }
    return t;
  }
}
