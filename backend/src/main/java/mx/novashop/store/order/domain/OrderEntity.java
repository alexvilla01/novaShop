package mx.novashop.store.order.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "orden",
    indexes = { @Index(name = "idx_orden_created_at", columnList = "created_at DESC") }
)
public class OrderEntity {

    public enum OrderChannel {
        WHATSAPP
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private mx.novashop.store.product.domain.ProductEntity product;

    @Column(name = "product_name", nullable = false, length = 140)
    private String productName;

    @Column(name = "unit_price_cents", nullable = false)
    private Integer unitPriceCents;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private OrderChannel channel = OrderChannel.WHATSAPP;

    @jakarta.persistence.PrePersist
    void prePersist() {
        createdAt = OffsetDateTime.now();
    }

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Long getId() {
        return id;
    }

    public mx.novashop.store.product.domain.ProductEntity getProduct() {
        return product;
    }

    public void setProduct(mx.novashop.store.product.domain.ProductEntity product) {
        this.product = product;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getUnitPriceCents() {
        return unitPriceCents;
    }

    public void setUnitPriceCents(Integer unitPriceCents) {
        this.unitPriceCents = unitPriceCents;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public OrderChannel getChannel() {
        return channel;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
