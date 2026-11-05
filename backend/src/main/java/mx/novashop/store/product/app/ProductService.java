package mx.novashop.store.product.app;

import java.util.List;
import mx.novashop.store.product.domain.ProductEntity;
import mx.novashop.store.product.repo.ProductRepository;
import mx.novashop.store.product.repo.CategoryRepository;
import mx.novashop.store.shared.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Catálogo público: solo productos activos, sumarios con `available` derivado del stock. */
@Service
public class ProductService {

    public static final String NO_ENCONTRADO =
        "El producto que buscas no existe o ya no está disponible.";
    private static final String CATEGORIA_NO_ENCONTRADA =
        "La categoría no existe o ya no está activa.";

    public record ProductSummary(
        Long id,
        String slug,
        String name,
        Long priceCents,
        String imageUrl,
        String categoryName,
        String categorySlug,
        boolean available
    ) {
    }

    public record ProductDetail(
        Long id,
        String slug,
        String name,
        String description,
        Long priceCents,
        List<String> imageUrls,
        String categoryName,
        String categorySlug,
        Integer stock,
        boolean available
    ) {
    }

    public record CategoryView(Long id, String name, String slug) {
    }

    public record ProductPage(List<ProductSummary> content, Long totalElements, Integer page) {
    }

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    private static boolean availableOf(ProductEntity p) {
        return p.getStock() != null && p.getStock() > 0;
    }

    private static ProductSummary toSummary(ProductEntity p) {
        return new ProductSummary(
            p.getId(),
            p.getSlug(),
            p.getName(),
            p.getPriceCents().longValue(),
            (p.getImageUrls() == null || p.getImageUrls().isEmpty())
                ? null : p.getImageUrls().get(0),
            p.getCategory().getName(),
            p.getCategory().getSlug(),
            availableOf(p));
    }

    private static ProductDetail toDetail(ProductEntity p) {
        return new ProductDetail(
            p.getId(),
            p.getSlug(),
            p.getName(),
            p.getDescription(),
            p.getPriceCents().longValue(),
            p.getImageUrls() == null ? List.of() : p.getImageUrls(),
            p.getCategory().getName(),
            p.getCategory().getSlug(),
            p.getStock(),
            availableOf(p));
    }

    @Transactional(readOnly = true)
    public ProductPage list(String categorySlug, int page, int size) {
        if (categorySlug != null && !categorySlug.isBlank()
            && !categoryRepository.existsBySlug(categorySlug)) {
            throw new ResourceNotFoundException(CATEGORIA_NO_ENCONTRADA);
        }
        Page<ProductEntity> result;
        if (categorySlug != null && !categorySlug.isBlank()) {
            result = productRepository.findAllByCategorySlugAndIsActiveTrue(
                categorySlug, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        } else {
            result = productRepository
                .findAllByIsActiveTrue(PageRequest.of(page, size, Sort.by("createdAt").descending()));
        }
        List<ProductSummary> content = result.getContent().stream()
            .map(ProductService::toSummary)
            .toList();
        return new ProductPage(content, result.getTotalElements(), page);
    }

    @Transactional(readOnly = true)
    public ProductDetail detail(String slug) {
        return productRepository.findBySlugAndIsActiveTrue(slug)
            .map(ProductService::toDetail)
            .orElseThrow(() -> new ResourceNotFoundException(NO_ENCONTRADO));
    }

    @Transactional(readOnly = true)
    public List<CategoryView> listCategories() {
        return categoryRepository.findAllByOrderByNameAsc().stream()
            .map(c -> new CategoryView(c.getId(), c.getName(), c.getSlug()))
            .toList();
    }
}
