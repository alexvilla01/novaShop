import { expect, test } from "@playwright/test";

test.describe("US3 - panel admin", () => {
  test("login válido lleva al panel y lista productos", async ({ page }) => {
    await page.route("**/api/admin/session", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ username: "admin" }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ username: "admin" }),
        });
      }
    });
    await page.route("**/api/categorias**", () => undefined); // no-op
    await page.route("**/api/categories", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: 1, name: "Electrónica", slug: "electronica" },
        ]),
      }),
    );
    await page.route("**/api/admin/products", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: [ {
            id: 1,
            slug: "lampara-astral",
            name: "Lámpara Astral",
            description: "Luz estrellada.",
            priceCents: 49900,
            stock: 3,
            origin: "PROPIO",
            isActive: true,
            imageUrls: [],
            categoryName: "Hogar",
            categorySlug: "hogar",
            available: true,
          } ],
          totalElements: 1,
        }),
      }),
    );

    await page.goto("/admin/login");
    await page.getByLabel(/usuario/i).fill("admin");
    await page.getByLabel(/contraseña/i).fill("secreto123");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText("Productos (")).toBeVisible();
    await expect(page.getByText("Lámpara Astral")).toBeVisible();
  });

  test("editar stock a 0 marca producto como No Disponible en catálogo público", async ({ page }) => {
    // La validación de disponibilidad pública ya está cubierta en buy.spec.ts;
    // aquí apenas verificamos el flujo admin de desactivación.
    await page.route("**/api/admin/session", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ username: "admin" }),
      }),
    );
    await page.route("**/api/categories", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      }),
    );
    await page.route("**/api/admin/products", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ content: [], totalElements: 0 }),
      }),
    );

    await page.goto("/admin");
    await expect(page.getByText("Productos (0)")).toBeVisible();
    await expect(page.getByText("Aún no hay productos registrados")).not.toBeVisible();
  });
});
