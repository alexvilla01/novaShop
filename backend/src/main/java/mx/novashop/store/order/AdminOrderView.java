package mx.novashop.store.order;

import java.time.Instant;

/** Vista de orden preliminar para el panel admin (contracts/api.md). */
public record AdminOrderView(
    Long id,
    Instant createdAt,
    String productSlug,
    String productName,
    Long unitPriceCents,
    Integer quantity,
    String channel
) {
}
