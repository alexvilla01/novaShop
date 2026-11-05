package mx.novashop.store.order.api;

import jakarta.validation.constraints.NotBlank;
import mx.novashop.store.order.app.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoint público del botón Comprar (contracts/api.md). */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    record CreateOrderRequest(@NotBlank String productSlug) {
    }

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    ResponseEntity<OrderService.OrderCreated> create(
        @RequestBody(required = false) CreateOrderRequest request) {
        if (request == null || request.productSlug() == null || request.productSlug().isBlank()) {
            throw new mx.novashop.store.shared.InvalidRequestException(
                "Falta el identificador del producto a comprar.");
        }
        mx.novashop.store.order.app.OrderService.OrderCreated created =
            orderService.createOrder(request.productSlug());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
