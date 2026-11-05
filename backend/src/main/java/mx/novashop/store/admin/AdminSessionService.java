package mx.novashop.store.admin;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import mx.novashop.store.shared.InvalidAdminCredentialsException;
import org.springframework.security.crypto.bcrypt.BCrypt;

/**
 * Sesión de administrador con cookie httpOnly firmada (R-005):
 * valor de cookie like "username.exp.hmac" con expiración a 12 h.
 */
public class AdminSessionService {

    public static final String COOKIE_NAME = "ns_admin_session";
    private static final Duration TTL = Duration.ofHours(12);

    public record Session(String username, String cookieValue) {
    }

    private final String adminUsername;
    private final String adminPasswordHash;
    private final String secret;

    public AdminSessionService(String adminUsername, String adminPasswordHash, String secret) {
        this.adminUsername = adminUsername;
        this.adminPasswordHash = adminPasswordHash;
        this.secret = secret == null || secret.isBlank() ? "nova-dev-secret" : secret;
    }

    public String cookieName() {
        return COOKIE_NAME;
    }

    /** Autentica y devuelve la sesión; vacío o excepción 401 si son inválidas. */
    public Session login(String username, String password) {
        if (adminPasswordHash == null || adminPasswordHash.isBlank()) {
            throw new InvalidAdminCredentialsException(
                "Verifica usuario y contraseña e intenta de nuevo.");
        }
        boolean ok = adminUsername.equals(username)
            && password != null
            && BCrypt.checkpw(password, adminPasswordHash);
        if (!ok) {
            throw new InvalidAdminCredentialsException(
                "Verifica usuario y contraseña e intenta de nuevo.");
        }
        return new Session(username, sign(username, Instant.now().plus(TTL).getEpochSecond()));
    }

    /** Valida cookie firmada; devuelve el username si es vigente. */
    public Optional<String> resolve(String cookieValue) {
        if (cookieValue == null) {
            return Optional.empty();
        }
        String[] parts = cookieValue.split("\\.");
        if (parts.length != 3) {
            return Optional.empty();
        }
        try {
            String username = parts[0];
            long exp = Long.parseLong(parts[1]);
            if (exp < Instant.now().getEpochSecond() || !adminUsername.equals(username)) {
                return Optional.empty();
            }
            if (!MessageDigest.isEqual(
                parts[2].getBytes(StandardCharsets.UTF_8),
                hmac(username, exp).getBytes(StandardCharsets.UTF_8))) {
                return Optional.empty();
            }
            return Optional.of(username);
        } catch (RuntimeException | NoSuchAlgorithmException | java.security.InvalidKeyException e) {
            return Optional.empty();
        }
    }

    private String sign(String username, long expiry) {
        try {
            return username + "." + expiry + "." + hmac(username, expiry);
        } catch (NoSuchAlgorithmException | java.security.InvalidKeyException e) {
            throw new IllegalStateException(e);
        }
    }

    private String hmac(String username, long expiry) throws NoSuchAlgorithmException,
        java.security.InvalidKeyException {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal((username + ":" + expiry).getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(digest);
    }
}
