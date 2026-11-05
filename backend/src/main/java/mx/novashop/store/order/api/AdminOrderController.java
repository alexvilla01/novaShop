package mx.novashop.store.order.api;

import java.util.List;
import mx.novashop.store.order.AdminOrderView;
import mx.novashop.store.order.app.OrderQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Listado de órdenes preliminares para el panel admin (contracts/api.md). */
@RestController
@RequestMapping("/api/admin")
public class AdminOrderController {

    private final OrderQueryService orderQueryService;

    public AdminOrderController(OrderQueryService orderQueryService) {
        this.orderQueryService = orderQueryService;
    }

    @GetMapping("/orders")
    List<AdminOrderView> list(
        @RequestParam(value = "limit", defaultValue = "50") int limit
    ) {
        return orderQueryService.listRecent(limit);
    }
}
