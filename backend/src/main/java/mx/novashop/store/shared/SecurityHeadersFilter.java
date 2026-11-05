package mx.novashop.store.shared;

import java.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Hardening de cabeceras (T036): nosniff, anti-clickjacking, referrer-policy
 * y HSTS cuando sirvamos por HTTPS. CSP se completa en el edge (CDN/nginx).
 */
public class SecurityHeadersFilter implements jakarta.servlet.Filter {

    private final boolean httpsPublicUrl;

    public SecurityHeadersFilter(boolean httpsPublicUrl) {
        this.httpsPublicUrl = httpsPublicUrl;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
        if (httpsPublicUrl || req.isSecure()) {
            res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        }
        chain.doFilter(request, response);
    }
}
