package com.dondesalem.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "events")
@Getter
@Setter
public class Event extends BaseEntity {

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(name = "image_url", length = 1024)
  private String imageUrl;

  @Column(name = "starts_at", nullable = false)
  private Instant startsAt;

  @Column(name = "ends_at", nullable = false)
  private Instant endsAt;

  private Integer capacity;

  @Column(name = "entry_fee", precision = 12, scale = 2)
  private BigDecimal entryFee;

  @Column(name = "external_url")
  private String externalUrl;

  @Column(name = "featured_on_home", nullable = false)
  private Boolean featuredOnHome = false;

  @Column(nullable = false)
  private Boolean active = true;
}
