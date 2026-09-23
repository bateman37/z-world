import { test, expect } from "@playwright/test";

/**
 * Recorrido E2E mínimo del panel de trabajos/necesidades/zonas (S4-S6 de
 * WEB-002, subhitos): verifica en navegador real que las proyecciones y
 * comandos nuevos llegan hasta la interfaz y producen efecto persistente,
 * sin depender de coordenadas de una semilla concreta (a diferencia de
 * `village-runtime.spec.ts`, que sí las necesita para el trayecto de
 * entrada a un edificio). El bucle completo de beber/comer/descansar tras
 * viajar y descubrir un contenido real se verifica manualmente (ver el
 * guion de `docs/STATUS.md`/informe de entrega): reproducirlo en Playwright
 * exige fijar de antemano una semilla cuyo refugio quede alcanzable en
 * pocos pasos, como ya hace `village-runtime.spec.ts` para la entrada a un
 * edificio.
 */
test("panel de trabajos (S4-S6): necesidades visibles y zona normativa creada y borrada", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/Semilla/).fill("work-panel-e2e-seed-1");
  await page.getByRole("button", { name: "Generar pueblo" }).click();
  await page.waitForURL(/\/village\//, { timeout: 20_000 });

  const personButtons = page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button");
  await expect(personButtons).toHaveCount(6, { timeout: 20_000 });
  await personButtons.first().click();

  const workPanel = page.getByRole("complementary", { name: "Trabajos y necesidades" });
  await expect(workPanel).toBeVisible();

  // Las tres necesidades causales (S6 §14.1) aparecen con una banda cualitativa, nunca un número.
  await expect(workPanel.getByText("Hidratación:")).toBeVisible();
  await expect(workPanel.getByText("Nutrición:")).toBeVisible();
  await expect(workPanel.getByText("Descanso:")).toBeVisible();

  // Sin trabajos activos al empezar.
  await expect(workPanel.getByText("Sin trabajos activos.")).toBeVisible();

  // Zona prohibida (S5 §6.7): crear y borrar, sin cambiar niebla ni seguridad, solo la norma.
  await workPanel.locator("select").filter({ hasText: "Habitual" }).selectOption("forbidden");
  await workPanel.getByRole("button", { name: "Crear zona" }).click();
  await expect(workPanel.getByText(/Zona forbidden/)).toBeVisible({ timeout: 10_000 });
  await workPanel.getByRole("button", { name: "Borrar" }).click();
  await expect(workPanel.getByText(/Zona forbidden/)).toHaveCount(0, { timeout: 10_000 });

  // Guardado automático tras los comandos anteriores, igual que el resto del runtime V2.
  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 10_000 });
});
