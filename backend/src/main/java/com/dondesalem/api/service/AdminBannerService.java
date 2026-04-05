package com.dondesalem.api.service;

import com.dondesalem.api.domain.Banner;
import com.dondesalem.api.dto.cms.BannerAdminDto;
import com.dondesalem.api.dto.cms.BannerRequest;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.repository.BannerRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminBannerService {

  private final BannerRepository bannerRepository;

  public AdminBannerService(BannerRepository bannerRepository) {
    this.bannerRepository = bannerRepository;
  }

  @Transactional(readOnly = true)
  public List<BannerAdminDto> findAll() {
    return bannerRepository.findAll(Sort.by("sortOrder", "id")).stream()
        .map(AdminBannerService::toDto)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public BannerAdminDto findById(Long id) {
    Banner b =
        bannerRepository
            .findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Banner no encontrado"));
    return toDto(b);
  }

  @Transactional
  public BannerAdminDto create(BannerRequest req) {
    Banner b = new Banner();
    apply(b, req);
    return toDto(bannerRepository.save(b));
  }

  @Transactional
  public BannerAdminDto update(Long id, BannerRequest req) {
    Banner b =
        bannerRepository
            .findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Banner no encontrado"));
    apply(b, req);
    return toDto(bannerRepository.save(b));
  }

  @Transactional
  public void delete(Long id) {
    if (!bannerRepository.existsById(id)) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Banner no encontrado");
    }
    bannerRepository.deleteById(id);
  }

  private static void apply(Banner b, BannerRequest req) {
    b.setTitle(req.title() != null && !req.title().isBlank() ? req.title().trim() : null);
    b.setImageUrl(req.imageUrl().trim());
    b.setLinkUrl(req.linkUrl() != null && !req.linkUrl().isBlank() ? req.linkUrl().trim() : null);
    b.setSortOrder(req.sortOrder());
    b.setActive(req.active());
    b.setStartsAt(req.startsAt());
    b.setEndsAt(req.endsAt());
  }

  private static BannerAdminDto toDto(Banner b) {
    return new BannerAdminDto(
        b.getId(),
        b.getTitle(),
        b.getImageUrl(),
        b.getLinkUrl(),
        b.getSortOrder(),
        Boolean.TRUE.equals(b.getActive()),
        b.getStartsAt(),
        b.getEndsAt());
  }
}
