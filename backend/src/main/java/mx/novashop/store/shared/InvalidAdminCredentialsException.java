package mx.novashop.store.shared;

/** 401 semántico: credenciales admin inválidas. */
public class InvalidAdminCredentialsException extends RuntimeException {

    public InvalidAdminCredentialsException(String userMessage) {
        super(userMessage);
    }

    public InvalidAdminCredentialsException() {
        this("Credenciales incorrectas.");
    }
}
