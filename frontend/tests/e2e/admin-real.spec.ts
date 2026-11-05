import { expect, test } from "@playwright/test";

/**
 * Flujo admin contra el backend REAL (Postgres + seed demo, sin mocks):
 * login UI → crear producto → visible en catálogo público → stock 0
 * → No Disponible en landing → limpieza (baja lógica).
 */
test.describe("US3 - panel admin con backend real", () => {
  test("login → crear producto → catálogo → stock 0 → No Disponible", async ({ page }) => {
    test.setTimeout(120_000);
    const stamp = Date.now();
    const slug = `docena-test-${stamp}`;
    const name = `Doceña Test ${stamp}`;

    // 1. Login UI con credenciales del entorno demo
    await page.goto("/admin/login");
    await page.getByLabel(/usuario/i).fill("admin");
    await page.getByLabel(/contraseña/i).fill("nova-admin-2026");
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page.getByText("Productos (")).toBeVisible(); // AdminLayout cargó

    // 2. Crear producto nuevo desde el formulario
    await page.getByLabel(/slug/i).fill(slug);
    await page.getByLabel(/^nombre$/i).fill(name);
    await page.getByLabel(/categoría/i).selectOption({ label: "Electrónica" });
    await page.getByLabel(/precio/i).fill("12900");
    await page.getByLabel(/stock/i).fill("7");
    await page.getByLabel(/descripción/i).fill("Producto creado por E2E con backend real.");
    await page.getByRole("button", { name: /crear producto/i }).click();

    await expect(page.getByText(name)).toBeVisible(); // aparece en la tabla admin

    // 3. Visible en el catálogo público (refleja isActive)
    await page.goto("/");
    await expect(page.getByText(name)).toBeVisible();

    // 4. Editar stock a 0 → landing muestra No Disponible
    await page.goto("/admin");
    await page
      .locator("tr", { hasText: slug })
      .getByRole("button", { name: /editar/i })
      .click();
    await page.getByLabel(/stock/i).fill("0");
    const putResponse = page.waitForResponse(
      (r) => r.url().includes("/api/admin/products/") && r.request().method() === "PUT",
    );
    await page.getByRole("button", { name: /guardar cambios/i }).click();
    expect((await putResponse).status()).toBe(200);
    await expect(page.getByText("Productos (")).toBeVisible();

    await page.goto(`/p/${slug}`);
    await expect(page.getByText("No Disponible")).toBeVisible();
    await expect(page.getByRole("button", { name: /comprar/i })).toHaveCount(0);

    // 5. Limpieza: baja lógica del producto de prueba
    const list = await page.request.get("/api/admin/products");
    const products = (await list.json()) as {
      content: { id: number; slug: string }[];
    };
    const created = products.content.find((p) => p.slug === slug);
    expect(created).toBeDefined();
    const deleted = await page.request.delete(`/api/admin/products/${created!.id}`);
    expect(deleted.status()).toBe(204);
  });
});
