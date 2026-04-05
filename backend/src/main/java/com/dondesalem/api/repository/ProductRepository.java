package com.dondesalem.api.repository;

import com.dondesalem.api.domain.Product;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.lang.NonNull;

public interface ProductRepository
    extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

  long countByStockQuantityLessThan(int max);

  long countByCategory_Id(Long categoryId);

  long countByGame_Id(Long gameId);

  @EntityGraph("Product.WITH_DETAILS")
  @NonNull Page<Product> findAll(Specification<Product> spec, @NonNull Pageable pageable);

  @EntityGraph("Product.WITH_DETAILS")
  Optional<Product> findBySlugAndActiveTrue(String slug);

  @EntityGraph("Product.WITH_DETAILS")
  Optional<Product> findBySlug(String slug);

  @EntityGraph("Product.WITH_DETAILS")
  List<Product> findTop8ByFeaturedTrueAndActiveTrueOrderByCreatedAtDesc();

  @EntityGraph("Product.WITH_DETAILS")
  Optional<Product> findDetailById(Long id);
}
