package mx.novashop.store.shared;

/** 409 semántico: producto sin stock o inactivo al momento de comprar. */
public class ProductUnavailableException extends RuntimeException {

    private final String userMessage;

    public ProductUnavailableException(String userMessage) {
        super(userMessage);
        this.userMessage = userMessage;
    }

    public String getUserMessage() {
        return userMessage;
    }
}
