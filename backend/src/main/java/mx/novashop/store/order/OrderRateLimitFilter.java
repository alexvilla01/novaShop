package mx.novashop.store.order;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;

/**
 * Control de abuso para POST /api/orders (sin login): ventana fija por IP.
 * Límite configurable: novashop.orders-ratelimit-request-per-window N (default 5)
 * en N segundos (novashopOrdersRateLimitWindowSeconds, default 60).
 */
public class OrderRateLimitFilter implements jakarta.servlet.Filter {

    public static final String X_FORWARDED_FOR = "X-Forwarded-For";

    private final int limitPerWindow;
    private final int windowSeconds;
    private final Map<String, Deque<Long>> hits;
    private final ScheduledExecutorService sweeper;

    public OrderRateLimitFilter(int limitPerWindow, int windowSeconds) {
        this.limitPerWindow = limitPerWindow;
        this.windowSeconds = windowSeconds;
        this.hits = new HashMap<>();
        this.sweeper = Executors.newSingleThreadScheduledExecutor();
        long cleanupMs = Math.max(windowSeconds, 1) * 1000L;
        this.sweeper.scheduleAtFixedRate(this::sweep, cleanupMs, cleanupMs, TimeUnit.MILLISECONDS);
    }

    private void sweep() {
        long cutoff = System.currentTimeMillis() - windowSeconds * 1000L;
        synchronized (hits) {
            hits.entrySet().removeIf(e -> {
                e.getValue().removeIf(t -> t < cutoff);
                return e.getValue().isEmpty();
            });
        }
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        if (!("/api/orders".equals(req.getRequestURI())
            && HttpMethod.POST.matches(req.getMethod()))) {
            chain.doFilter(request, response);
            return;
        }

        String key = clientIp(req);
        long now = System.currentTimeMillis();
        long cutoff = now - windowSeconds * 1000L;
        boolean allowed;
        synchronized (hits) {
            Deque<Long> deque = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
            deque.removeIf(t -> t < cutoff);
            allowed = deque.size() < limitPerWindow;
            if (allowed) {
                deque.addLast(now);
            }
        }
        if (!allowed) {
            res.setStatus(429);
            res.setHeader("Retry-After", String.valueOf(windowSeconds));
            res.setContentType("application/problem+json");
            res.getWriter().write(
                "{\"title\":\"Demasiadas solicitudes\","
                    + "\"detail\":\"Espera unos segundos antes de intentar de nuevo.\","
                    + "\"status\":429}");
            return;
        }
        chain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest req) {
        String forwarded = req.getHeader(X_FORWARDED_FOR);
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }
}
