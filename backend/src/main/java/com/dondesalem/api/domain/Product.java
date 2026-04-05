package com.dondesalem.api.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.NamedAttributeNode;
import jakarta.persistence.NamedEntityGraph;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "products")
@NamedEntityGraph(
    name = "Product.WITH_DETAILS",
    attributeNodes = {
      @NamedAttributeNode("images"),
      @NamedAttributeNode("category"),
      @NamedAttributeNode("game"),
      @NamedAttributeNode("tags")
    })
@Getter
@Setter
public class Product extends BaseEntity {

  @Column(nullable = false)
  private String name;

  @Column(nullable = false, unique = true)
  private String slug;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal price;

  @Column(name = "compare_at_price", precision = 12, scale = 2)
  private BigDecimal compareAtPrice;

  @Column(name = "stock_quantity", nullable = false)
  private Integer stockQuantity = 0;

  private String sku;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "category_id")
  private Category category;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "game_id")
  private Game game;

  @Column(nullable = false)
  private Boolean preorder = false;

  @Column(name = "preorder_release_date")
  private LocalDate preorderReleaseDate;

  @Column(nullable = false)
  private Boolean active = true;

  @Column(nullable = false)
  private Boolean featured = false;

  @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("sortOrder ASC")
  private Set<ProductImage> images = new HashSet<>();

  @ManyToMany
  @JoinTable(
      name = "product_tags",
      joinColumns = @JoinColumn(name = "product_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  private Set<Tag> tags = new HashSet<>();
}
