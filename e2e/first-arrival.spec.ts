import { test, expect } from "@playwright/test";

/**
 * Recorrido E2E mínimo (§19.7 de WEB-001): abrir aplicación, crear
 * partida con semilla fija, comprobar seis tarjetas, pausar/reanudar y
 * cambiar velocidad, seleccionar persona, emitir movimiento válido,
 * observar progreso, guardar, recargar, comprobar continuidad, cambiar
 * prioridad y verificar ausencia de potencial numérico.
 */

const SEED = "web-001-e2e-seed";

test("recorrido crítico: crear partida, cohorte, reloj, movimiento y guardado", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Z-World" })).toBeVisible();

  await page.getByLabel(/Semilla/).fill(SEED);
  await page.getByRole("button", { name: "Crear partida" }).click();

  await page.waitForURL(/\/game\//, { timeout: 15_000 });

  const personButtons = page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button");
  await expect(personButtons).toHaveCount(6, { timeout: 15_000 });

  await expect(page.getByText(/Día 1 · 17:30/)).toBeVisible();

  await expect(page.getByRole("application", { name: "Mapa local" })).toBeVisible();

  await personButtons.first().click();
  await expect(page.getByRole("complementary", { name: "Ficha de persona" })).toBeVisible();
  await expect(page.getByText(/Todavía no conocemos bien sus posibilidades/).first()).toBeVisible();

  // La ficha explica con naturalidad que el calibre nunca se muestra; lo
  // que no debe aparecer es un VALOR de calibre, potencial numérico,
  // estrellas o fracción de progreso.
  const sheetText = await page.getByRole("complementary", { name: "Ficha de persona" }).innerText();
  expect(sheetText).not.toMatch(/calibre[:\s]+[1-5]\b/i);
  expect(sheetText).not.toMatch(/★/);
  expect(sheetText).not.toMatch(/\b[0-9]\/[0-9]\b/);
  expect(sheetText).not.toMatch(/potencial\s*:?\s*[0-9]/i);

  await page.getByRole("button", { name: "×2" }).click();
  await expect(page.getByRole("button", { name: "×2" })).toHaveAttribute("aria-pressed", "true");

  // Movimiento directo: clic derecho cerca del punto de llegada (la cámara
  // arranca centrada ahí) para abrir "Moverse aquí" y emitir la orden.
  const canvas = page.getByRole("application", { name: "Mapa local" });
  const box = await canvas.boundingBox();
  if (!box) throw new Error("No se pudo medir el Canvas del mapa.");
  await canvas.click({ button: "right", position: { x: box.width / 2 + 30, y: box.height / 2 + 20 } });
  await page.getByRole("button", { name: "Moverse aquí" }).click();

  await expect(page.getByText(/Desplazándose/).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Orden de movimiento aceptada|Movimiento iniciado/).first()).toBeVisible({
    timeout: 10_000,
  });

  // Cambio de prioridad: persiste como comando del núcleo.
  await page.getByRole("button", { name: "Respuesta vital y cuidados" }).click();
  const emergencySelect = page.getByLabel("Prioridad de Emergencias");
  await emergencySelect.selectOption("2");
  await expect(page.getByText(/Prioridad actualizada/).first()).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Pausa", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pausa", exact: true })).toHaveAttribute("aria-pressed", "true");

  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 10_000 });

  const gameUrl = page.url();
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button")).toHaveCount(6, {
    timeout: 15_000,
  });
  expect(page.url()).toBe(gameUrl);

  // La prioridad cambiada sobrevive a la recarga.
  await page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button").first().click();
  await page.getByRole("button", { name: "Respuesta vital y cuidados" }).click();
  await expect(page.getByLabel("Prioridad de Emergencias")).toHaveValue("2");
});
