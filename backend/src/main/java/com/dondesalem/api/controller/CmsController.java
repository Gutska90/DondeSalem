package com.dondesalem.api.controller;

import com.dondesalem.api.dto.cms.BannerDto;
import com.dondesalem.api.dto.cms.EventDto;
import com.dondesalem.api.dto.cms.PromotionDto;
import com.dondesalem.api.service.CmsService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CmsController {

  private final CmsService cmsService;

  public CmsController(CmsService cmsService) {
    this.cmsService = cmsService;
  }

  @GetMapping("/banners")
  public List<BannerDto> banners() {
    return cmsService.activeBanners();
  }

  @GetMapping("/events")
  public List<EventDto> events() {
    return cmsService.upcomingEvents();
  }

  @GetMapping("/events/featured-home")
  public List<EventDto> featuredHomeEvents() {
    return cmsService.featuredHomeEvents();
  }

  @GetMapping("/promotions")
  public List<PromotionDto> promotions() {
    return cmsService.activePromotions();
  }
}
