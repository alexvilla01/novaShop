package mx.novashop.store.shared;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Traduce todo error técnico a ProblemDetail (RFC 7807) con mensajes amigables
 * en español, sin exponer stack traces ni detalles internos (FR-012).
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final String NOT_FOUND_MENSAJE =
        "El recurso que buscas no existe o ya no está disponible.";
    private static final String SERVICIO_INDISPONIBLE =
        "Servicio temporalmente no disponible, intenta de nuevo.";

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetail> notFound(ResourceNotFoundException ex) {
        return body(HttpStatus.NOT_FOUND, "No encontrado", ex.getUserMessage());
    }

    @ExceptionHandler(ProductUnavailableException.class)
    public ResponseEntity<ProblemDetail> unavailable(ProductUnavailableException ex) {
        return body(HttpStatus.CONFLICT, "Producto no disponible", ex.getUserMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> invalidBody(MethodArgumentNotValidException ex) {
        return body(HttpStatus.BAD_REQUEST,
            "Petición inválida", "Datos de la petición incompletos o inválidos.");
    }

    @ExceptionHandler({ HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class })
    public ResponseEntity<ProblemDetail> unreadable(Exception ex) {
        return body(HttpStatus.BAD_REQUEST,
            "Petición inválida", "Datos de la petición incompletos o inválidos.");
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ProblemDetail> invalidRequest(InvalidRequestException ex) {
        return body(HttpStatus.BAD_REQUEST, "Petición inválida", ex.getUserMessage());
    }

    @ExceptionHandler(InvalidAdminCredentialsException.class)
    public ResponseEntity<ProblemDetail> invalidCredentials(InvalidAdminCredentialsException ex) {
        return body(HttpStatus.UNAUTHORIZED,
            "Credenciales inválidas", "Verifica usuario y contraseña e intenta de nuevo.");
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ProblemDetail> noStaticResource(NoResourceFoundException ex) {
        return body(HttpStatus.NOT_FOUND, "No encontrado", NOT_FOUND_MENSAJE);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> internal(Exception ex) {
        return body(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno", SERVICIO_INDISPONIBLE);
    }

    private ResponseEntity<ProblemDetail> body(HttpStatus status, String title, String detail) {
        ProblemDetail detail0 = ProblemDetail.forStatusAndDetail(status, detail);
        detail0.setTitle(title);
        return ResponseEntity.status(status).body(detail0);
    }
}
