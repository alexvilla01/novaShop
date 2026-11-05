package mx.novashop.store.shared;

/** 400 semántico con mensaje amigable controlado. */
public class InvalidRequestException extends RuntimeException {

    private final String userMessage;

    public InvalidRequestException(String userMessage) {
        super(userMessage);
        this.userMessage = userMessage;
    }

    public String getUserMessage() {
        return userMessage;
    }
}
