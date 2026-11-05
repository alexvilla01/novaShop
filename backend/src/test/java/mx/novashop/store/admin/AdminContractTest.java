package mx.novashop.store.admin;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;
import java.time.Instant;
import java.util.List;
import mx.novashop.store.admin.api.AdminSessionController;
import mx.novashop.store.order.AdminOrderView;
import mx.novashop.store.order.api.AdminOrderController;
import mx.novashop.store.order.app.OrderQueryService;
import mx.novashop.store.product.api.AdminProductController;
import mx.novashop.store.product.app.AdminCatalogService;
import mx.novashop.store.shared.ApiExceptionHandler;
import mx.novashop.store.shared.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.security.crypto.bcrypt.BCrypt;

/**
 * Contratos admin (contracts/api.md): sesión 200/401, CRUD productos con
 * validaciones 400, DELETE baja lógica idempotente, órdenes reciente-primero,
 * 401 sin sesión.
 */
class AdminContractTest {

    private static final String USER = "admin";
    private static final String PASS = "secreto123";

    private AdminSessionService sessionService;
    private AdminCatalogService catalogService;
    private OrderQueryService orderQueryService;
    private String validCookie;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        String hash = BCrypt.hashpw(PASS, BCrypt.gensalt(4));
        sessionService = new AdminSessionService(USER, hash, "test-secret");
        catalogService = Mockito.mock(AdminCatalogService.class);
        orderQueryService = Mockito.mock(OrderQueryService.class);

        validCookie = sessionService.login(USER, PASS).cookieValue();

        mockMvc = MockMvcBuilders
            .standaloneSetup(
                new AdminSessionController(sessionService, false),
                new AdminProductController(catalogService),
                new AdminOrderController(orderQueryService))
            .addFilters(new AdminSessionFilter(sessionService))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
    }

    private Cookie sesion() {
        return new Cookie("ns_admin_session", validCookie);
    }

    @Test
    @DisplayName("POST /api/admin/session con credenciales válidas responde 200 y Set-Cookie")
    void loginValid() throws Exception {
        mockMvc.perform(post("/api/admin/session")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"admin\",\"password\":\"secreto123\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value(USER))
            .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    @DisplayName("POST /api/admin/session con credenciales inválidas responde 401 genérico")
    void loginInvalid() throws Exception {
        mockMvc.perform(post("/api/admin/session")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"admin\",\"password\":\"mala\"}"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.title").value("Credenciales inválidas"))
            .andExpect(jsonPath("$.detail").value("Verifica usuario y contraseña e intenta de nuevo."));
    }

    @Test
    @DisplayName("GET /api/admin/products sin sesión responde 401")
    void productsWithoutSession() throws Exception {
        mockMvc.perform(get("/api/admin/products"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/admin/products con sesión responde lista con origin/isActive")
    void productsWithSession() throws Exception {
        when(catalogService.listAll(anyInt(), anyInt()))
            .thenReturn(List.of(new AdminCatalogService.AdminProductSummary(
                1L, "sku-demo", "Producto Demo", 12900L, null, 5, "PROPIO", true)));

        mockMvc.perform(get("/api/admin/products").cookie(sesion()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].origin").value("PROPIO"))
            .andExpect(jsonPath("$.content[0].isActive").value(true));
    }

    @Test
    @DisplayName("POST /api/admin/products con priceCents inválido responde 400")
    void createProductInvalidPrice() throws Exception {
        when(catalogService.create(org.mockito.ArgumentMatchers.any())).thenThrow(
            new mx.novashop.store.shared.InvalidRequestException("El precio debe ser mayor a 0."));

        mockMvc.perform(post("/api/admin/products")
                .cookie(sesion())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"slug\":\"sku-demo\",\"name\":\"Demo\",\"description\":\"x\","
                    + "\"priceCents\":0,\"stock\":1,\"origin\":\"PROPIO\",\"imageUrls\":[],"
                    + "\"categorySlug\":\"electronica\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.title").value("Petición inválida"));
    }

    @Test
    @DisplayName("DELETE idempotente: 204 si ya inactivo, 404 si el id no existe")
    void deleteIdempotent() throws Exception {
        when(catalogService.deactivate(1L)).thenReturn(true);
        when(catalogService.deactivate(9L)).thenThrow(
            new ResourceNotFoundException("El producto no existe."));

        mockMvc.perform(delete("/api/admin/products/1").cookie(sesion()))
            .andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/admin/products/9").cookie(sesion()))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/admin/orders reciente-primero")
    void ordersRecentFirst() throws Exception {
        when(orderQueryService.listRecent(50)).thenReturn(List.of(
            new AdminOrderView(2L, Instant.now(), "b", "B", 9900L, 1, "WHATSAPP"),
            new AdminOrderView(1L, Instant.now().minusSeconds(60), "a", "A", 4900L, 1, "WHATSAPP")));

        mockMvc.perform(get("/api/admin/orders").cookie(sesion()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(2))
            .andExpect(jsonPath("$[0].channel").value("WHATSAPP"));
    }
}
