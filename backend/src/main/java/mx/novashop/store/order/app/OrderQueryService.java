package mx.novashop.store.order.app;

import java.util.List;
import mx.novashop.store.order.AdminOrderView;
import mx.novashop.store.order.repo.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Consulta de órdenes preliminares más recientes primero (FR-011). */
@Service
public class OrderQueryService {

    private static final int MAX_LIMIT = 200;

    private final OrderRepository orderRepository;

    public OrderQueryService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminOrderView> listRecent(int limit) {
        int capped = Math.max(1, Math.min(limit, MAX_LIMIT));
        return orderRepository.findAllByOrderByCreatedAtDesc(
                org.springframework.data.domain.PageRequest.of(0, capped))
            .stream()
            .map(o -> new AdminOrderView(
                o.getId(),
                o.getCreatedAt().toInstant(),
                o.getProduct() == null ? null : o.getProduct().getSlug(),
                o.getProductName(),
                o.getUnitPriceCents().longValue(),
                o.getQuantity(),
                o.getChannel() == null ? "WHATSAPP" : o.getChannel().name()))
            .toList();
    }
}
