package mx.novashop.store.shared;

/** 404 semántico con mensaje amigable controlado. */
public class ResourceNotFoundException extends RuntimeException {

    private final String userMessage;

    public ResourceNotFoundException(String userMessage) {
        super(userMessage);
        this.userMessage = userMessage;
    }

    public String getUserMessage() {
        return userMessage;
    }
}
