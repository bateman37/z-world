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
  // Viewport ancho: la rejilla de 4 columnas de `village-screen.tsx`
  // (lista/mapa/ficha/panel de trabajos) desborda el ancho por defecto de
  // Playwright, lo que dejaría el panel de trabajos fuera de la vista y
  // haría que el desplazamiento horizontal interfiriera con el registro
  // operacional fijo. No es parte de este cambio: solo evita el síntoma
  // en la prueba.
  await page.setViewportSize({ width: 1920, height: 1080 });
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

  // Zona prohibida (S5 §6.7), dibujada en el Canvas (S11 §7.3: el dibujo
  // gráfico es el flujo primario, no los formularios numéricos). Se traza
  // un triángulo alrededor del punto de llegada con tres clics y se cierra
  // con el botón explícito (más fiable en un test automatizado que acertar
  // el clic exacto de cierre por proximidad al primer vértice).
  const canvas = page.getByRole("application", { name: "Mapa del pueblo" });
  const box = await canvas.boundingBox();
  if (!box) throw new Error("No se pudo medir el Canvas del mapa.");
  const centerX = box.width / 2;
  const centerY = box.height / 2;

  await workPanel.locator("select").filter({ hasText: "Habitual" }).selectOption("forbidden");
  await workPanel.getByRole("button", { name: "Dibujar zona en el mapa" }).click();
  await expect(page.getByRole("status")).toContainText("Dibujando forma");
  await canvas.click({ position: { x: centerX - 30, y: centerY - 30 } });
  await canvas.click({ position: { x: centerX + 30, y: centerY - 30 } });
  await canvas.click({ position: { x: centerX, y: centerY + 30 } });
  await page.getByRole("button", { name: "Cerrar forma" }).click();
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(workPanel.getByText(/Zona forbidden/)).toBeVisible({ timeout: 10_000 });
  await workPanel.getByRole("button", { name: "Borrar" }).click();
  await expect(workPanel.getByText(/Zona forbidden/)).toHaveCount(0, { timeout: 10_000 });

  // Cancelar un dibujo a medias (Escape) no deja ningún estado a medio crear.
  await workPanel.getByRole("button", { name: "Dibujar zona en el mapa" }).click();
  await canvas.click({ position: { x: centerX - 10, y: centerY - 10 } });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(workPanel.getByText(/Zona (habitual|precaution|forbidden)/)).toHaveCount(0);

  // Guardado automático tras los comandos anteriores, igual que el resto del runtime V2.
  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 10_000 });
});
