import { test, expect } from "@playwright/test";

/**
 * E2E A — Migración V1→V2 real (S11 §10.5): crea una partida V1 (fixture
 * WEB-001), la migra desde la home, revisa el resumen de degradaciones,
 * continúa en `/village/[id]` con la cohorte/reloj/prioridades reales, y
 * comprueba que guardar/recargar conserva la migración (no la repite ni
 * regenera el pueblo). No expone la base de datos desde la UI: la
 * conservación del snapshot V1 histórico se verifica por integración
 * (`migrate-v2.integration.test.ts`), no aquí.
 */
const SEED = "web-002-s11-e2e-migration-seed";

test("migración V1→V2 real: crear V1, migrar desde la home, y continuar como V2 jugable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Z-World" })).toBeVisible();

  await page.getByLabel(/Semilla/).fill(SEED);
  await page.getByRole("button", { name: "Crear partida (fixture WEB-001)" }).click();
  await page.waitForURL(/\/game\//, { timeout: 20_000 });

  await page.goto("/");
  const gameRow = page.locator("li", { hasText: SEED });
  await expect(gameRow).toBeVisible();
  await expect(gameRow.getByText("V1 — WEB-001")).toBeVisible();

  await gameRow.getByRole("button", { name: "Migrar a WEB-002" }).click();
  await expect(gameRow.getByRole("heading", { name: /Migrar/ })).toBeVisible();
  await expect(gameRow.getByText(/Se conservan: identificador de partida, semilla/)).toBeVisible();

  await gameRow.getByRole("button", { name: "Confirmar migración" }).click();
  await page.waitForURL(/\/village\//, { timeout: 20_000 });

  const personButtons = page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button");
  await expect(personButtons).toHaveCount(6, { timeout: 20_000 });
  await expect(page.getByText(new RegExp(SEED))).toBeVisible();

  const villageUrl = page.url();
  await page.reload();
  await expect(personButtons).toHaveCount(6, { timeout: 20_000 });
  expect(page.url()).toBe(villageUrl);

  // Volver a la home confirma que la migración quedó promovida (no reaparece "Migrar a WEB-002").
  await page.goto("/");
  const migratedRow = page.locator("li", { hasText: SEED });
  await expect(migratedRow.getByRole("button", { name: "Migrar a WEB-002" })).toHaveCount(0);
  await migratedRow.getByRole("button", { name: "Continuar" }).click();
  await page.waitForURL(/\/village\//, { timeout: 20_000 });
  await expect(personButtons).toHaveCount(6, { timeout: 20_000 });
});
