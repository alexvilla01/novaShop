package mx.novashop.store.order;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * Rate limit de POST /api/orders: N requests por IP por ventana,
 * 429 amigable con Retry-After cuando se excede; otras rutas libres.
 */
class OrderRateLimitFilterTest {

    private final OrderRateLimitFilter filter = new OrderRateLimitFilter(2, 60);

    private HttpServletResponse pass(HttpServletRequest req) throws Exception {
        MockHttpServletResponse res = new MockHttpServletResponse();
        filter.doFilter(req, res, new FilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest r, jakarta.servlet.ServletResponse rr)
                throws java.io.IOException, jakarta.servlet.ServletException {
                ((HttpServletResponse) rr).setStatus(201);
            }
        });
        return res;
    }

    private static MockHttpServletRequest post(String ip) {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/orders");
        req.setRemoteAddr(ip);
        return req;
    }

    @Test
    @DisplayName("permite hasta el límite y da 429 amigable con Retry-After después")
    void limitExceeded() throws Exception {
        assertThat(pass(post("10.0.0.1")).getStatus()).isEqualTo(201);
        assertThat(pass(post("10.0.0.1")).getStatus()).isEqualTo(201);

        MockHttpServletResponse res = new MockHttpServletResponse();
        filter.doFilter(post("10.0.0.1"), res, new FilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest r, jakarta.servlet.ServletResponse rr) {
                throw new AssertionError("no debe llegar al controller");
            }
        });
        assertThat(res.getStatus()).isEqualTo(429);
        assertThat(res.getHeader("Retry-After")).isEqualTo("60");
        assertThat(res.getContentAsString()).contains("Demasiadas solicitudes");
    }

    @Test
    @DisplayName("la ventana es por IP y no bloquea a otros clientes")
    void perIpIsolation() throws Exception {
        assertThat(pass(post("10.0.0.2")).getStatus()).isEqualTo(201);
        assertThat(pass(post("10.0.0.3")).getStatus()).isEqualTo(201);
    }

    @Test
    @DisplayName("respeta X-Forwarded-For cuando existe (detrás de CDN)")
    void forwardedFor() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/orders");
        req.setRemoteAddr("127.0.0.1");
        req.addHeader(OrderRateLimitFilter.X_FORWARDED_FOR, "203.0.113.9, 10.0.0.254");
        assertThat(pass(req).getStatus()).isEqualTo(201);
        assertThat(pass(req).getStatus()).isEqualTo(201);
        assertThat(pass(req).getStatus()).isEqualTo(429);
    }

    @Test
    @DisplayName("GET /api/products no pasa por el límite")
    void otherPathsFree() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/products");
        req.setRemoteAddr("10.0.0.9");
        for (int i = 0; i < 10; i++) {
            assertThat(pass(req).getStatus()).isEqualTo(201);
        }
    }
}
