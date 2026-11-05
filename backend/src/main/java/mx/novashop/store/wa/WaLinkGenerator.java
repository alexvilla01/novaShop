package mx.novashop.store.wa;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import mx.novashop.store.shared.NovaConfig;
import org.springframework.stereotype.Component;

/**
 * Genera el deep link wa.me con payload estructurado (research R-004):
 * "Hola, me interesa *{producto}* (${precio} MXN).\nCantidad: 1\nDe: {landing}"
 * El número comercial vive en config del backend y nunca en el frontend.
 */
@Component
public class WaLinkGenerator {

    private final NovaConfig config;

    public WaLinkGenerator(NovaConfig config) {
        this.config = config;
    }

    public String buildLink(String productName, Integer priceCents, String productSlug) {
        String priceLabel = formatMxn(priceCents);
        String landing = config.publicUrl() + "/p/" + productSlug;
        String message =
            "Hola, me interesa *" + productName + "* (" + priceLabel + ").\n"
            + "Cantidad: 1\n"
            + "De: " + landing;
        String encoded = URLEncoder.encode(message, StandardCharsets.UTF_8)
            .replace("+", "%20");
        return "https://wa.me/" + config.waPhone() + "?text=" + encoded;
    }

    String formatMxn(Integer priceCents) {
        long whole = Math.abs(priceCents) / 100;
        int cents = Math.abs(priceCents) % 100;
        return "$" + whole + "." + String.format("%02d", cents) + " MXN";
    }
}
