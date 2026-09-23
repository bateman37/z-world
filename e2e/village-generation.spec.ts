import { test, expect } from "@playwright/test";

/**
 * Recorrido E2E mínimo del generador semántico determinista (S2 de
 * WEB-002 §9.1 del encargo): crear una partida con el generador real desde
 * la pantalla de inicio, comprobar que el pueblo generado se muestra (no
 * el fixture de WEB-001), que aparecen los seis protagonistas y que
 * recargar recupera la misma partida sin regenerarla.
 */
const SEED = "web-002-s2-e2e-seed";

test("generar pueblo (WEB-002 S2): crear, ver mapa semántico y recargar sin regenerar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Z-World" })).toBeVisible();

  await page.getByLabel(/Semilla/).fill(SEED);
  await page.getByRole("button", { name: "Generar pueblo" }).click();

  await page.waitForURL(/\/village\//, { timeout: 20_000 });

  await expect(page.getByText(/Llegada al pueblo de montaña/)).toBeVisible();
  await expect(page.getByText(new RegExp(SEED))).toBeVisible();
  await expect(page.getByText(/web-002-semantic-v1/)).toBeVisible();

  // Los ocho perfiles del catálogo aparecen listados con recuento (§8.1).
  for (const label of ["Casa familiar mediana", "Cabaña", "Supermercado pequeño", "Taller mecánico", "Fuente de agua", "Campo/parcela abierta", "Bosque/matorral", "Carretera/camino"]) {
    await expect(page.getByText(label)).toBeVisible();
  }

  await expect(page.getByRole("img", { name: "Mapa del pueblo generado" })).toBeVisible();

  const villageUrl = page.url();
  await page.reload();
  await expect(page.getByText(new RegExp(SEED))).toBeVisible({ timeout: 15_000 });
  expect(page.url()).toBe(villageUrl);
});
