import { expect, test } from "@playwright/test";

const PRODUCT = {
  id: 1,
  slug: "auriculares-pro-x",
  name: "Auriculares Pro X",
  description: "Cancelación activa de ruido y 40 h de batería.",
  priceCents: 249900,
  imageUrls: [],
  categoryName: "Electrónica",
  categorySlug: "electronica",
  stock: 25,
  available: true,
};

test.describe("US1 - compra directa por WhatsApp", () => {
  test("landing muestra producto y Comprar abre WhatsApp con payload correcto", async ({ page }) => {
    await page.route("**/api/products/auriculares-pro-x", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(PRODUCT),
      }),
    );
    await page.route("**/api/orders", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          orderId: 77,
          whatsappUrl:
            "https://wa.me/5215500000000?text=Hola%2C%20me%20interesa%20*Auriculares%20Pro%20X*%20%28%242%2C499.00%20MXN%29.%20Cantidad%3A%201",
        }),
      }),
    );
    // Congelamos la red de WhatsApp para no seguir la cadena wa.me → app/web.
    await page.route("**/wa.me/**", (route) => route.fulfill({ status: 200, body: "" }));

    await page.goto("/p/auriculares-pro-x");
    await expect(page.getByRole("heading", { name: "Auriculares Pro X" })).toBeVisible();
    await expect(page.getByText("$2,499.00").first()).toBeVisible();

    await page.getByRole("button", { name: /Comprar/i }).click();

    await page.waitForURL(/wa\.me\/5215500000000/, { waitUntil: "commit" });
    const payload = decodeURIComponent(page.url().replace(/\+/g, " "));
    expect(payload).toContain("Auriculares Pro X");
    expect(payload).toContain("Cantidad");
  });

  test("producto agotado muestra No Disponible y sin botón de compra", async ({ page }) => {
    await page.route("**/api/products/hoodie-agotado-demo", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...PRODUCT, slug: "hoodie-agotado-demo", stock: 0, available: false }),
      }),
    );

    await page.goto("/p/hoodie-agotado-demo");
    await expect(page.getByText("No Disponible")).toBeVisible();
    await expect(page.getByRole("button", { name: /Comprar/i })).toHaveCount(0);
  });

  test("producto inexistente muestra mensaje amigable (sin stack traces)", async ({ page }) => {
    await page.route("**/api/products/no-existe", (route) =>
      route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          title: "No encontrado",
          detail: "El producto que buscas no existe o ya no está disponible.",
          status: 404,
        }),
      }),
    );

    await page.goto("/p/no-existe");
    await expect(
      page.getByText("El producto que buscas no existe o ya no está disponible."),
    ).toBeVisible();
  });
});
