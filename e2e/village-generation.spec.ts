import { test, expect } from "@playwright/test";

/**
 * Recorrido E2E mínimo del generador semántico determinista (S2 de
 * WEB-002 §9.1 del encargo): crear una partida con el generador real desde
 * la pantalla de inicio y comprobar que el pueblo generado se abre como
 * runtime jugable real (S3), no como visor estático — reloj, seis
 * protagonistas y mapa Canvas interactivo — y que recargar recupera la
 * misma partida sin regenerarla. El recorrido jugable completo (movimiento,
 * niebla, descubrimiento, entrada a un edificio) vive en
 * `village-runtime.spec.ts`; este archivo solo cubre la creación.
 */
const SEED = "web-002-s2-e2e-seed";

test("generar pueblo (WEB-002 S2): crear, ver el runtime V2 y recargar sin regenerar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Z-World" })).toBeVisible();

  await page.getByLabel(/Semilla/).fill(SEED);
  await page.getByRole("button", { name: "Generar pueblo" }).click();

  await page.waitForURL(/\/village\//, { timeout: 20_000 });

  const personButtons = page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button");
  await expect(personButtons).toHaveCount(6, { timeout: 20_000 });
  await expect(page.getByText(/Día 1 · 17:30/)).toBeVisible();
  await expect(page.getByText(new RegExp(SEED))).toBeVisible();
  await expect(page.getByRole("application", { name: "Mapa del pueblo" })).toBeVisible();

  const villageUrl = page.url();
  await page.reload();
  await expect(personButtons).toHaveCount(6, { timeout: 20_000 });
  expect(page.url()).toBe(villageUrl);
});
