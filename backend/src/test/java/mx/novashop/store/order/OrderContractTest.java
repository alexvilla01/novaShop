package mx.novashop.store.order;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import mx.novashop.store.order.api.OrderController;
import mx.novashop.store.order.app.OrderService;
import mx.novashop.store.shared.ApiExceptionHandler;
import mx.novashop.store.shared.ProductUnavailableException;
import mx.novashop.store.shared.ResourceNotFoundException;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

/**
 * Contrato de POST /api/orders (contracts/api.md):
 * 201 con whatsappUrl, 404 producto inexistente o inactivo,
 * 409 sin stock disponible, 400 cuerpo inválido.
 */
class OrderContractTest {

    private OrderService orderService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        orderService = Mockito.mock(OrderService.class);
        mockMvc = MockMvcBuilders
            .standaloneSetup(new OrderController(orderService))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
    }

    @Test
    @DisplayName("201 crea la orden y devuelve whatsappUrl estructurado")
    void createOrderHappyPath() throws Exception {
        when(orderService.createOrder("auriculares-pro-x"))
            .thenReturn(new OrderService.OrderCreated(
                42L,
                "https://wa.me/5215500000000?text=Hola%20me%20interesa"));

        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"productSlug\":\"auriculares-pro-x\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.orderId").value(42))
            .andExpect(jsonPath("$.whatsappUrl").isString())
            .andExpect(jsonPath("$.whatsappUrl").value(
                Matchers.startsWith("https://wa.me/")));
    }

    @Test
    @DisplayName("404 cuando el producto no existe o está inactivo")
    void createOrderProductNotFound() throws Exception {
        when(orderService.createOrder(anyString()))
            .thenThrow(new ResourceNotFoundException(
                "El producto que buscas no existe o ya no está disponible."));

        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"productSlug\":\"no-existe\"}"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.title").value("No encontrado"));
    }

    @Test
    @DisplayName("409 cuando el producto no tiene stock disponible")
    void createOrderProductUnavailable() throws Exception {
        when(orderService.createOrder(anyString()))
            .thenThrow(new ProductUnavailableException(
                "Este producto no está disponible en este momento."));

        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"productSlug\":\"sin-stock\"}"))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.title").value("Producto no disponible"));
    }

    @Test
    @DisplayName("400 cuando falta el productSlug")
    void createOrderInvalidBody() throws Exception {
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.title").value("Petición inválida"));
    }
}
