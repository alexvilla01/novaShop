package mx.novashop.store.product.repo;

import java.util.List;
import java.util.Optional;
import mx.novashop.store.product.domain.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {

    Optional<CategoryEntity> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);

    List<CategoryEntity> findAllByOrderByNameAsc();
}
