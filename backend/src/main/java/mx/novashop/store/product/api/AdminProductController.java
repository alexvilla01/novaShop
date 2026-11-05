package mx.novashop.store.product.api;

import java.util.List;
import java.util.Map;
import mx.novashop.store.product.app.AdminCatalogService;
import mx.novashop.store.product.domain.ProductEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** CRUD admin de productos (US3, contracts/api.md). */
@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final AdminCatalogService catalogService;

    public AdminProductController(AdminCatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    Map<String, Object> list(
        @RequestParam(value = "page", defaultValue = "0") int page,
        @RequestParam(value = "size", defaultValue = "50") int size
    ) {
        List<AdminCatalogService.AdminProductSummary> content =
            catalogService.listAll(page, size);
        return Map.of("content", content, "totalElements", content.size());
    }

    @PostMapping
    ResponseEntity<ProductEntity> create(
        @RequestBody(required = false) AdminCatalogService.AdminProductRequest request
    ) {
        if (request == null) {
            throw new mx.novashop.store.shared.InvalidRequestException("Faltan los datos del producto.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogService.create(request));
    }

    @PutMapping("/{id}")
    ResponseEntity<ProductEntity> update(
        @PathVariable Long id,
        @RequestBody(required = false) AdminCatalogService.AdminProductRequest request
    ) {
        if (request == null) {
            throw new mx.novashop.store.shared.InvalidRequestException("Faltan los datos del producto.");
        }
        return ResponseEntity.ok(catalogService.update(id, request));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deactivate(@PathVariable Long id) {
        catalogService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
