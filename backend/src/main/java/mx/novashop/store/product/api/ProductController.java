package mx.novashop.store.product.api;

import mx.novashop.store.product.app.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints públicos del catálogo (contracts/api.md):
 * GET /api/products?category=&page=&size=, GET /api/products/{slug}, GET /api/categories.
 */
@RestController
public class ProductController {

    private static final int MAX_PAGE_SIZE = 48;

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/api/products")
    ProductService.ProductPage list(
        @RequestParam(value = "category", required = false) String category,
        @RequestParam(value = "page", defaultValue = "0") int page,
        @RequestParam(value = "size", defaultValue = "24") int size
    ) {
        return productService.list(category, Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
    }

    @GetMapping("/api/products/{slug}")
    ProductService.ProductDetail detail(@PathVariable String slug) {
        return productService.detail(slug);
    }

    @GetMapping("/api/categories")
    java.util.List<ProductService.CategoryView> categories() {
        return productService.listCategories();
    }
}
