package mx.novashop.store.admin.api;

import mx.novashop.store.admin.AdminSessionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/** Endpoints de sesión admin (contracts/api.md). */
@RestController
@RequestMapping("/api/admin")
public class AdminSessionController {

    private final AdminSessionService sessionService;
    private final boolean secureCookie;

    public AdminSessionController(
        AdminSessionService sessionService,
        @org.springframework.beans.factory.annotation.Value("${novashop.session-cookie-secure:true}") boolean secureCookie
    ) {
        this.sessionService = sessionService;
        this.secureCookie = secureCookie;
    }

    public record LoginRequest(String username, String password) {
    }

    @PostMapping("/session")
    ResponseEntity<Map<String, String>> login(
        @RequestBody(required = false) LoginRequest request, HttpServletResponse response
    ) {
        if (request == null) {
            throw new mx.novashop.store.shared.InvalidRequestException(
                "Faltan las credenciales.");
        }
        var session = sessionService.login(request.username(), request.password());
        Cookie cookie = new Cookie(AdminSessionService.COOKIE_NAME, session.cookieValue());
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setAttribute("SameSite", "Lax");
        cookie.setPath("/");
        cookie.setMaxAge((int) Duration.ofHours(12).toSeconds());
        response.addCookie(cookie);
        return ResponseEntity.ok(Map.of("username", session.username()));
    }

    @GetMapping("/session")
    ResponseEntity<Map<String, String>> active(HttpServletRequest request) {
        return ResponseEntity.ok(Map.of(
            "username", usernameFrom(request)));
    }

    @DeleteMapping("/session")
    ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie expired = new Cookie(AdminSessionService.COOKIE_NAME, "");
        expired.setHttpOnly(true);
        expired.setMaxAge(0);
        expired.setPath("/");
        response.addCookie(expired);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    private String usernameFrom(HttpServletRequest request) {
        var username = String.valueOf(request.getAttribute("adminUsername"));
        return Optional.ofNullable(username).orElse("admin");
    }
}
