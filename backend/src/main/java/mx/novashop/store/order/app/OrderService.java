package mx.novashop.store.order.app;

import mx.novashop.store.order.domain.OrderEntity;
import mx.novashop.store.order.repo.OrderRepository;
import mx.novashop.store.product.domain.ProductEntity;
import mx.novashop.store.product.repo.ProductRepository;
import mx.novashop.store.shared.ProductUnavailableException;
import mx.novashop.store.shared.ResourceNotFoundException;
import mx.novashop.store.wa.WaLinkGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Regla central del embudo (FR-005/FR-006/FR-007): validar disponibilidad,
 * persistir la orden preliminar con snapshot del precio vigente y devolver
 * el deep link de WhatsApp en una única llamada atómica.
 */
@Service
public class OrderService {

    public record OrderCreated(Long orderId, String whatsappUrl) {
    }

    private static final String NO_DISPONIBLE =
        "Este producto no está disponible en este momento.";
    private static final String NO_ENCONTRADO =
        "El producto que buscas no existe o ya no está disponible.";

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final WaLinkGenerator waLinkGenerator;

    public OrderService(
        ProductRepository productRepository,
        OrderRepository orderRepository,
        WaLinkGenerator waLinkGenerator
    ) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.waLinkGenerator = waLinkGenerator;
    }

    @Transactional
    public OrderCreated createOrder(String productSlug) {
        ProductEntity product = productRepository
            .findBySlugAndIsActiveTrue(productSlug)
            .orElseThrow(() -> new ResourceNotFoundException(NO_ENCONTRADO));
        if (product.getStock() == null || product.getStock() <= 0) {
            throw new ProductUnavailableException(NO_DISPONIBLE);
        }

        OrderEntity order = new OrderEntity();
        order.setProduct(product);
        order.setProductName(product.getName());
        order.setUnitPriceCents(product.getPriceCents());
        order.setQuantity(1);
        OrderEntity saved = orderRepository.save(order);

        String whatsappUrl = waLinkGenerator.buildLink(
            product.getName(), product.getPriceCents(), product.getSlug());
        return new OrderCreated(saved.getId(), whatsappUrl);
    }
}
