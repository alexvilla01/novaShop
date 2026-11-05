package mx.novashop.store.product;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import mx.novashop.store.product.api.ProductController;
import mx.novashop.store.product.app.ProductService;
import mx.novashop.store.shared.ApiExceptionHandler;
import mx.novashop.store.shared.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

/**
 * Contrato de los endpoints de catálogo público (contracts/api.md):
 * 200 con sumarios/available, 404 con categoría o slug inexistente/inactivo.
 */
class ProductContractTest {

    private ProductService productService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        productService = Mockito.mock(ProductService.class);
        mockMvc = MockMvcBuilders
            .standaloneSetup(new ProductController(productService))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
    }

    @Test
    @DisplayName("GET /api/products devuelve página con sumarios y available")
    void listHappyPath() throws Exception {
        when(productService.list(isNull(), eq(0), anyInt()))
            .thenReturn(new ProductService.ProductPage(
                List.of(new ProductService.ProductSummary(
                    1L, "auriculares-pro-x", "Auriculares Pro X", 249900L,
                    null, "Electrónica", "electronica", true)),
                1L, 0));

        mockMvc.perform(get("/api/products").param("page", "0"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].slug").value("auriculares-pro-x"))
            .andExpect(jsonPath("$.content[0].priceCents").value(249900))
            .andExpect(jsonPath("$.content[0].available").value(true))
            .andExpect(jsonPath("$.totalElements").value(1))
            .andExpect(jsonPath("$.page").value(0));
    }

    @Test
    @DisplayName("GET /api/products?categoria inexistente responde 404 amigable")
    void listUnknownCategory() throws Exception {
        when(productService.list(eq("no-existe"), anyInt(), anyInt()))
            .thenThrow(new ResourceNotFoundException(
                "La categoría no existe o ya no está activa."));

        mockMvc.perform(get("/api/products").param("category", "no-existe"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.title").value("No encontrado"));
    }

    @Test
    @DisplayName("GET /api/products/{slug} devuelve detalle con stock y available")
    void detailHappyPath() throws Exception {
        when(productService.detail("auriculares-pro-x"))
            .thenReturn(new ProductService.ProductDetail(
                1L, "auriculares-pro-x", "Auriculares Pro X", "Cancelación activa.",
                249900L, List.of(), "Electrónica", "electronica", 25, true));

        mockMvc.perform(get("/api/products/auriculares-pro-x"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Auriculares Pro X"))
            .andExpect(jsonPath("$.stock").value(25))
            .andExpect(jsonPath("$.available").value(true))
            .andExpect(jsonPath("$.imageUrls").isArray());
    }

    @Test
    @DisplayName("GET /api/products/{slug} inactivo o inexistente responde 404")
    void detailNotFound() throws Exception {
        when(productService.detail("no-existe"))
            .thenThrow(new ResourceNotFoundException(
                "El producto que buscas no existe o ya no está disponible."));

        mockMvc.perform(get("/api/products/no-existe"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.title").value("No encontrado"))
            .andExpect(jsonPath("$.detail").value(
                "El producto que buscas no existe o ya no está disponible."));
    }

    @Test
    @DisplayName("GET /api/categories devuelve lista completa de categorías activas")
    void categoriesHappyPath() throws Exception {
        when(productService.listCategories())
            .thenReturn(List.of(
                new ProductService.CategoryView(1L, "Electrónica", "electronica"),
                new ProductService.CategoryView(2L, "Moda", "moda")));

        mockMvc.perform(get("/api/categories"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Electrónica"))
            .andExpect(jsonPath("$[1].slug").value("moda"));
    }
}
