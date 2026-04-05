package com.dondesalem.api.service;

import com.dondesalem.api.dto.cms.BannerDto;
import com.dondesalem.api.dto.cms.EventDto;
import com.dondesalem.api.dto.cms.PromotionDto;
import com.dondesalem.api.repository.BannerRepository;
import com.dondesalem.api.repository.EventRepository;
import com.dondesalem.api.repository.PromotionRepository;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CmsService {

  private final BannerRepository bannerRepository;
  private final EventRepository eventRepository;
  private final PromotionRepository promotionRepository;

  public CmsService(
      BannerRepository bannerRepository,
      EventRepository eventRepository,
      PromotionRepository promotionRepository) {
    this.bannerRepository = bannerRepository;
    this.eventRepository = eventRepository;
    this.promotionRepository = promotionRepository;
  }

  @Transactional(readOnly = true)
  public List<BannerDto> activeBanners() {
    Instant now = Instant.now();
    return bannerRepository.findActiveVisible(now).stream()
        .map(
            b ->
                new BannerDto(
                    b.getId(), b.getTitle(), b.getImageUrl(), b.getLinkUrl(), b.getSortOrder()))
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public List<EventDto> upcomingEvents() {
    return eventRepository.findByActiveTrueAndStartsAtAfterOrderByStartsAtAsc(Instant.now()).stream()
        .map(
            e ->
                new EventDto(
                    e.getId(),
                    e.getTitle(),
                    e.getDescription(),
                    e.getImageUrl(),
                    e.getStartsAt(),
                    e.getEndsAt(),
                    e.getCapacity(),
                    e.getEntryFee(),
                    e.getExternalUrl(),
                    e.getFeaturedOnHome(),
                    e.getActive()))
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public List<EventDto> featuredHomeEvents() {
    return eventRepository
        .findTop3ByFeaturedOnHomeTrueAndActiveTrueAndStartsAtAfterOrderByStartsAtAsc(Instant.now())
        .stream()
        .map(
            e ->
                new EventDto(
                    e.getId(),
                    e.getTitle(),
                    e.getDescription(),
                    e.getImageUrl(),
                    e.getStartsAt(),
                    e.getEndsAt(),
                    e.getCapacity(),
                    e.getEntryFee(),
                    e.getExternalUrl(),
                    e.getFeaturedOnHome(),
                    e.getActive()))
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public List<PromotionDto> activePromotions() {
    return promotionRepository.findActiveAt(Instant.now()).stream()
        .map(
            p ->
                new PromotionDto(
                    p.getId(),
                    p.getName(),
                    p.getPromoType(),
                    p.getValue(),
                    p.getStartsAt(),
                    p.getEndsAt(),
                    p.getProduct() != null ? p.getProduct().getId() : null))
        .collect(Collectors.toList());
  }
}
