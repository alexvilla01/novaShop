package mx.novashop.store.admin;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;

/**
 * Protege /api/admin/** (GET/DELETE sesión, CRUD y órdenes). Solo el login
 * (POST /api/admin/session) es público. Respuesta 401 amigable.
 */
public class AdminSessionFilter implements jakarta.servlet.Filter {

    private final AdminSessionService sessionService;

    public AdminSessionFilter(AdminSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        if (!req.getRequestURI().startsWith("/api/admin")) {
            chain.doFilter(request, response);
            return;
        }
        boolean isLogin = HttpMethod.POST.matches(req.getMethod())
            && "/api/admin/session".equals(req.getRequestURI());

        String user = resolveUser(req);
        if (isLogin && user == null) {
            chain.doFilter(request, response);
            return;
        }
        if (user == null) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.setContentType("application/problem+json");
            res.getWriter().write(
                "{\"title\":\"Credenciales inválidas\","
                    + "\"detail\":\"Verifica usuario y contraseña e intenta de nuevo.\","
                    + "\"status\":401}");
            return;
        }
        req.setAttribute("adminUsername", user);
        chain.doFilter(request, response);
    }

    private String resolveUser(HttpServletRequest req) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) {
            return null;
        }
        Optional<Cookie> session = Arrays.stream(cookies)
            .filter(c -> AdminSessionService.COOKIE_NAME.equals(c.getName()))
            .findFirst();
        return session.flatMap(c -> sessionService.resolve(c.getValue())).orElse(null);
    }
}
