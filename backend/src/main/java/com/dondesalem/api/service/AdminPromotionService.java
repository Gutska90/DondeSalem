package com.dondesalem.api.service;

import com.dondesalem.api.domain.Product;
import com.dondesalem.api.domain.Promotion;
import com.dondesalem.api.dto.cms.PromotionAdminDto;
import com.dondesalem.api.dto.cms.PromotionRequest;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.repository.ProductRepository;
import com.dondesalem.api.repository.PromotionRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminPromotionService {

  private final PromotionRepository promotionRepository;
  private final ProductRepository productRepository;

  public AdminPromotionService(
      PromotionRepository promotionRepository, ProductRepository productRepository) {
    this.promotionRepository = promotionRepository;
    this.productRepository = productRepository;
  }

  @Transactional(readOnly = true)
  public List<PromotionAdminDto> findAll() {
    return promotionRepository.findAll(Sort.by(Sort.Direction.DESC, "startsAt")).stream()
        .map(AdminPromotionService::toDto)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public PromotionAdminDto findById(Long id) {
    Promotion p =
        promotionRepository
            .findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Promoción no encontrada"));
    return toDto(p);
  }

  @Transactional
  public PromotionAdminDto create(PromotionRequest req) {
    validateWindow(req);
    Promotion p = new Promotion();
    apply(p, req);
    return toDto(promotionRepository.save(p));
  }

  @Transactional
  public PromotionAdminDto update(Long id, PromotionRequest req) {
    validateWindow(req);
    Promotion p =
        promotionRepository
            .findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Promoción no encontrada"));
    apply(p, req);
    return toDto(promotionRepository.save(p));
  }

  @Transactional
  public void delete(Long id) {
    if (!promotionRepository.existsById(id)) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Promoción no encontrada");
    }
    promotionRepository.deleteById(id);
  }

  private static void validateWindow(PromotionRequest req) {
    if (!req.endsAt().isAfter(req.startsAt())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "La fecha de fin debe ser posterior al inicio");
    }
  }

  private void apply(Promotion p, PromotionRequest req) {
    p.setName(req.name().trim());
    p.setPromoType(req.promoType());
    p.setValue(req.value());
    p.setStartsAt(req.startsAt());
    p.setEndsAt(req.endsAt());
    p.setActive(req.active());
    p.setProduct(null);
    if (req.productId() != null) {
      Product product =
          productRepository
              .findById(req.productId())
              .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Producto inválido"));
      p.setProduct(product);
    }
  }

  private static PromotionAdminDto toDto(Promotion p) {
    return new PromotionAdminDto(
        p.getId(),
        p.getName(),
        p.getPromoType(),
        p.getValue(),
        p.getStartsAt(),
        p.getEndsAt(),
        Boolean.TRUE.equals(p.getActive()),
        p.getProduct() != null ? p.getProduct().getId() : null);
  }
}
