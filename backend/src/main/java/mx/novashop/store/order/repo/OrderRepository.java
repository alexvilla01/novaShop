package mx.novashop.store.order.repo;

import java.util.List;
import mx.novashop.store.order.domain.OrderEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    @EntityGraph(attributePaths = "product")
    List<OrderEntity> findAllByOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);
}
