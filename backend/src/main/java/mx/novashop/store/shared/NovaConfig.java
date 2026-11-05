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

    public String waPhone() {
        return waPhone;
    }

    public String publicUrl() {
        return publicUrl;
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
