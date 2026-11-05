package mx.novashop.store.shared;

import mx.novashop.store.admin.AdminSessionFilter;
import mx.novashop.store.admin.AdminSessionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Config por entorno de novaShop (research R-008) y CORS limitado al frontend autorizado (R-012). */
@Configuration
public class NovaConfig {

    @Value("${novashop.wa-phone}")
    private String waPhone;

    @Value("${novashop.public-url}")
    private String publicUrl;

    @Value("${novashop.cors-origins}")
    private String corsOrigins;

    @Value("${novashop.admin-user}")
    private String adminUsername;

    @Value("${novashop.admin-password-hash}")
    private String adminPasswordHash;

    @Value("${novashop.admin-secret:}")
    private String adminSecret;

    @Value("${novashop.session-cookie-secure:true}")
    private boolean sessionCookieSecure;

    @Value("${novashop.orders-ratelimit-per-window:5}")
    private int ordersRateLimitPerWindow;

    @Value("${novashop.orders-ratelimit-window-seconds:60}")
    private int ordersRateLimitWindowSeconds;

    public String waPhone() {
        return waPhone;
    }

    public String publicUrl() {
        return publicUrl;
    }

    public boolean sessionCookieSecure() {
        return sessionCookieSecure;
    }

    @Bean
    AdminSessionService adminSessionService() {
        return new AdminSessionService(adminUsername, adminPasswordHash, adminSecret);
    }

    @Bean
    FilterRegistrationBean<AdminSessionFilter> adminSessionFilter(AdminSessionService sessionService) {
        FilterRegistrationBean<AdminSessionFilter> registration =
            new FilterRegistrationBean<>(new AdminSessionFilter(sessionService));
        registration.addUrlPatterns("/api/admin/*");
        registration.setOrder(1);
        return registration;
    }

    @Bean
    FilterRegistrationBean<SecurityHeadersFilter> securityHeadersFilter() {
        FilterRegistrationBean<SecurityHeadersFilter> registration =
            new FilterRegistrationBean<>(new SecurityHeadersFilter(
                publicUrl != null && publicUrl.startsWith("https://")));
        registration.addUrlPatterns("/api/*");
        registration.setOrder(0);
        return registration;
    }

    @Bean
    FilterRegistrationBean<mx.novashop.store.order.OrderRateLimitFilter> orderRateLimitFilter() {
        FilterRegistrationBean<mx.novashop.store.order.OrderRateLimitFilter> registration =
            new FilterRegistrationBean<>(new mx.novashop.store.order.OrderRateLimitFilter(
                ordersRateLimitPerWindow, ordersRateLimitWindowSeconds));
        registration.addUrlPatterns("/api/orders");
        registration.setOrder(2);
        return registration;
    }

    @Bean
    WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(corsOrigins.split(","))
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
