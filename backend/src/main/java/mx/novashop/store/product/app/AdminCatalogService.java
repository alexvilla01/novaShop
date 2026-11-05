package mx.novashop.store.product.app;

import java.util.List;
import java.util.Locale;
import mx.novashop.store.product.domain.CategoryEntity;
import mx.novashop.store.product.domain.ProductEntity;
import mx.novashop.store.product.domain.ProductOrigin;
import mx.novashop.store.product.repo.CategoryRepository;
import mx.novashop.store.product.repo.ProductRepository;
import mx.novashop.store.shared.InvalidRequestException;
import mx.novashop.store.shared.ProductUnavailableException;
import mx.novashop.store.shared.ResourceNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Catálogo admin (US3): lista con inactivos, CRUD con validaciones del
 * data-model y baja lógica idempotente.
 */
@Service
public class AdminCatalogService {

    public record AdminProductRequest(
        String slug,
        String name,
        String description,
        long priceCents,
        int stock,
        String origin,
        List<String> imageUrls,
        String categorySlug
    ) {
    }

    public record AdminProductSummary(
        Long id,
        String slug,
        String name,
        Long priceCents,
        String description,
        List<String> imageUrls,
        Integer stock,
        String origin,
        boolean isActive,
        String categorySlug,
        String categoryName
    ) {
    }

    private static final String NO_EXISTE = "El producto no existe.";

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public AdminCatalogService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminProductSummary> listAll(int page, int size) {
        return productRepository.findAll(PageRequest.of(page, Math.min(size, 100), Sort.by("id")))
            .getContent().stream()
            .map(p -> new AdminProductSummary(
                p.getId(), p.getSlug(), p.getName(), p.getPriceCents().longValue(),
                p.getDescription() == null ? "" : p.getDescription(),
                p.getImageUrls() == null ? List.of() : List.copyOf(p.getImageUrls()),
                p.getStock(),
                p.getOrigin() == null ? ProductOrigin.PROPIO.name() : p.getOrigin().name(),
                p.getIsActive() != null && p.getIsActive(),                p.getCategory() == null ? "" : p.getCategory().getSlug(),
                p.getCategory() == null ? "" : p.getCategory().getName()))
            .toList();
    }

    ProductEntity validateAndBuild(AdminProductRequest r) {
        if (r.slug() == null || !r.slug().matches("[a-z0-9]+(-[a-z0-9]+)*")) {
            throw new InvalidRequestException(
                "El slug debe ser kebab-case (letras minúsculas, números y guiones).");
        }
        if (r.name() == null || r.name().isBlank()) {
            throw new InvalidRequestException("El nombre es obligatorio.");
        }
        if (r.priceCents() <= 0) {
            throw new InvalidRequestException("El precio debe ser mayor a 0.");
        }
        if (r.stock() < 0) {
            throw new InvalidRequestException("El stock no puede ser negativo.");
        }
        if (r.imageUrls() != null && r.imageUrls().size() > 5) {
            throw new InvalidRequestException("Máximo 5 imágenes por producto.");
        }
        if (r.categorySlug() == null
            || categoryRepository.findBySlug(r.categorySlug()).isEmpty()) {
            throw new InvalidRequestException("La categoría indicada no existe.");
        }
        ProductEntity p = new ProductEntity();
        p.setSlug(r.slug());
        p.setName(r.name());
        p.setDescription(r.description());
        p.setPriceCents((int) r.priceCents());
        p.setStock(r.stock());
        p.setOrigin(ProductOrigin.valueOf(
            r.origin() == null ? "PROPIO" : r.origin().toUpperCase(Locale.ROOT)));
        p.setImageUrls(r.imageUrls() == null ? List.of() : r.imageUrls());
        p.setCategory(categoryRepository.findBySlug(r.categorySlug()).orElseThrow());
        p.setIsActive(true);
        return p;
    }

    @Transactional
    public ProductEntity create(AdminProductRequest r) {
        if (productRepository.existsBySlugIgnoreCase(r.slug() == null ? "" : r.slug())) {
            throw new ProductUnavailableException("Ya existe un producto con ese slug.");
        }
        return productRepository.save(validateAndBuild(r));
    }

    @Transactional
    public ProductEntity update(Long id, AdminProductRequest r) {
        ProductEntity existing = productRepository.findWithDetailById(id)
            .orElseThrow(() -> new ResourceNotFoundException(NO_EXISTE));
        ProductEntity refreshed = validateAndBuild(r);
        if (productRepository.existsBySlugIgnoreCaseAndIdNot(
            refreshed.getSlug(), id)) {
            throw new ProductUnavailableException("Ya existe un producto con ese slug.");
        }
        existing.setSlug(refreshed.getSlug());
        existing.setName(refreshed.getName());
        existing.setDescription(refreshed.getDescription());
        existing.setPriceCents(refreshed.getPriceCents());
        existing.setStock(refreshed.getStock());
        existing.setOrigin(refreshed.getOrigin());
        existing.setImageUrls(refreshed.getImageUrls());
        existing.setCategory(refreshed.getCategory());
        return productRepository.save(existing);
    }

    /** Baja lógica; idempotente para productos ya inactivos. */
    @Transactional
    public boolean deactivate(Long id) {
        ProductEntity p = productRepository.findWithDetailById(id)
            .orElseThrow(() -> new ResourceNotFoundException(NO_EXISTE));
        if (p.getIsActive() == null || !p.getIsActive()) {
            return true;
        }
        p.setIsActive(false);
        productRepository.save(p);
        return true;
    }
}
