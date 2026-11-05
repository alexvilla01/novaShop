package mx.novashop.store.product.repo;

import java.util.List;
import java.util.Optional;
import mx.novashop.store.product.domain.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    Optional<ProductEntity> findBySlug(String slug);

    boolean existsBySlugIgnoreCase(String slug);

    @EntityGraph(attributePaths = "category")
    Page<ProductEntity> findAllByIsActiveTrue(Pageable pageable);

    @EntityGraph(attributePaths = "category")
    List<ProductEntity> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = { "category", "imageUrls" })
    Optional<ProductEntity> findBySlugAndIsActiveTrue(String slug);

    @EntityGraph(attributePaths = { "category", "imageUrls" })
    Optional<ProductEntity> findWithDetailById(Long id);

    @EntityGraph(attributePaths = { "category", "imageUrls" })
    Page<ProductEntity> findAllByCategorySlugAndIsActiveTrue(String categorySlug, Pageable pageable);
}
