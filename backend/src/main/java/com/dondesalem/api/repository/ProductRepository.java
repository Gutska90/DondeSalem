package com.dondesalem.api.repository;

import com.dondesalem.api.domain.Product;
import com.dondesalem.api.domain.ProductType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;

public interface ProductRepository
    extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

  long countByProductType(ProductType productType);

  long countByStockQuantityLessThan(int max);

  /** Singles Mylserena (slug {@code myl-pe-…}) sin unidades disponibles. */
  long countByProductTypeAndSlugStartingWithAndStockQuantityLessThanEqual(
      ProductType productType, String slugPrefix, int maxStockInclusive);

  long countByCategory_Id(Long categoryId);

  long countByGame_Id(Long gameId);

  @EntityGraph("Product.WITH_DETAILS")
  @NonNull Page<Product> findAll(Specification<Product> spec, @NonNull Pageable pageable);

  @EntityGraph("Product.WITH_DETAILS")
  Optional<Product> findBySlugAndActiveTrue(String slug);

  @EntityGraph("Product.WITH_DETAILS")
  Optional<Product> findBySlug(String slug);

  @EntityGraph("Product.WITH_DETAILS")
  @Query(
      "SELECT p FROM Product p WHERE p.featured = true AND p.active = true AND p.productType <> :exclude"
          + " ORDER BY p.createdAt DESC")
  List<Product> findFeaturedHomeExcluding(@Param("exclude") ProductType exclude, Pageable pageable);

  @Query(
      "SELECT p.id FROM Product p JOIN p.singleCardDetails sc WHERE p.productType = :type AND ("
          + "(:gameId IS NULL AND p.game IS NULL) OR (:gameId IS NOT NULL AND p.game IS NOT NULL AND"
          + " p.game.id = :gameId)) AND lower(trim(sc.cardName)) = :cardName AND"
          + " lower(trim(coalesce(sc.setName, ''))) = :setName AND lower(trim(coalesce(sc.cardNumber,"
          + " ''))) = :cardNumber AND lower(trim(coalesce(sc.cardCondition, ''))) = :cardCondition AND"
          + " lower(trim(coalesce(sc.language, ''))) = :language AND lower(trim(coalesce(sc.finishType,"
          + " ''))) = :finishType AND (:excludeId IS NULL OR p.id <> :excludeId)")
  Optional<Long> findIdBySingleVariantFingerprint(
      @Param("type") ProductType type,
      @Param("gameId") Long gameId,
      @Param("cardName") String cardName,
      @Param("setName") String setName,
      @Param("cardNumber") String cardNumber,
      @Param("cardCondition") String cardCondition,
      @Param("language") String language,
      @Param("finishType") String finishType,
      @Param("excludeId") Long excludeId);

  @EntityGraph("Product.WITH_DETAILS")
  Optional<Product> findDetailById(Long id);

  @Query(
      "SELECT CASE "
          + "WHEN lower(coalesce(sc.setName, '')) LIKE '%primer bloque%' THEN 'PB' "
          + "WHEN lower(coalesce(sc.setName, '')) LIKE '%primera era%' THEN 'PE' "
          + "ELSE 'OTHER' END, COUNT(p.id) "
          + "FROM Product p JOIN p.singleCardDetails sc "
          + "WHERE p.productType = :type AND p.slug LIKE CONCAT(:slugPrefix, '%') "
          + "GROUP BY CASE "
          + "WHEN lower(coalesce(sc.setName, '')) LIKE '%primer bloque%' THEN 'PB' "
          + "WHEN lower(coalesce(sc.setName, '')) LIKE '%primera era%' THEN 'PE' "
          + "ELSE 'OTHER' END")
  List<Object[]> countMylserenaSinglesGroupedByEra(
      @Param("type") ProductType type, @Param("slugPrefix") String slugPrefix);
}
