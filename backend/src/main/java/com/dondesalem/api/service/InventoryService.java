package com.dondesalem.api.service;

import com.dondesalem.api.domain.InventoryMovement;
import com.dondesalem.api.domain.MovementReason;
import com.dondesalem.api.domain.Product;
import com.dondesalem.api.domain.User;
import com.dondesalem.api.dto.inventory.AdjustStockRequest;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.repository.InventoryMovementRepository;
import com.dondesalem.api.repository.ProductRepository;
import com.dondesalem.api.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

  private final ProductRepository productRepository;
  private final InventoryMovementRepository inventoryMovementRepository;
  private final UserRepository userRepository;

  public InventoryService(
      ProductRepository productRepository,
      InventoryMovementRepository inventoryMovementRepository,
      UserRepository userRepository) {
    this.productRepository = productRepository;
    this.inventoryMovementRepository = inventoryMovementRepository;
    this.userRepository = userRepository;
  }

  @Transactional
  public void adjust(AdjustStockRequest req, Long adminUserId) {
    Product p =
        productRepository
            .findById(req.productId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    int newStock = p.getStockQuantity() + req.delta();
    if (newStock < 0) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "El ajuste deja stock negativo");
    }
    p.setStockQuantity(newStock);
    productRepository.save(p);
    InventoryMovement m = new InventoryMovement();
    m.setProduct(p);
    m.setQuantityChange(req.delta());
    m.setReason(req.reason() != null ? req.reason() : MovementReason.AJUSTE_MANUAL);
    m.setReferenceType("MANUAL");
    if (adminUserId != null) {
      User u = userRepository.findById(adminUserId).orElse(null);
      m.setCreatedBy(u);
    }
    inventoryMovementRepository.save(m);
  }
}
