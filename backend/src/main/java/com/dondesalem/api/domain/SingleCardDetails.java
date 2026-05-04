package com.dondesalem.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "single_card_details")
@Getter
@Setter
public class SingleCardDetails extends BaseEntity {

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "product_id", nullable = false, unique = true)
  private Product product;

  @Column(name = "card_name", length = 500)
  private String cardName;

  @Column(name = "set_name", length = 500)
  private String setName;

  @Column(name = "card_number", length = 100)
  private String cardNumber;

  @Column(length = 200)
  private String rarity;

  @Column(name = "card_condition", length = 100)
  private String cardCondition;

  @Column(length = 100)
  private String language;

  @Column(name = "finish_type", length = 80)
  private String finishType;

  @Column(length = 2)
  private String bloque;

  @Column(name = "edition_type", length = 80)
  private String editionType;

  @Column(length = 300)
  private String artist;

  @Column(name = "mana_cost_or_cost", length = 200)
  private String manaCostOrCost;

  @Column(name = "attribute_or_color", length = 200)
  private String attributeOrColor;

  @Column(name = "grade_or_certification", length = 200)
  private String gradeOrCertification;

  @Column(name = "metadata_json", columnDefinition = "TEXT")
  private String metadataJson;
}
