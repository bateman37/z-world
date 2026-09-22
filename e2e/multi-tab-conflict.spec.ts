import { test, expect } from "@playwright/test";

/**
 * Robustez §21/§22: dos pestañas sobre la misma partida. La segunda en
 * guardar debe ver un conflicto de revisión explícito, nunca una fusión
 * silenciosa de estados de simulación.
 */
test("dos pestañas sobre la misma partida detectan conflicto de revisión", async ({ browser }) => {
  const context = await browser.newContext();
  const pageA = await context.newPage();

  await pageA.goto("/");
  await pageA.getByLabel(/Semilla/).fill("web-001-conflict-seed");
  await pageA.getByRole("button", { name: "Crear partida" }).click();
  await pageA.waitForURL(/\/game\//, { timeout: 15_000 });
  await expect(pageA.getByRole("navigation", { name: "Protagonistas" }).getByRole("button")).toHaveCount(6, {
    timeout: 15_000,
  });
  const gameUrl = pageA.url();

  const pageB = await context.newPage();
  await pageB.goto(gameUrl);
  await expect(pageB.getByRole("navigation", { name: "Protagonistas" }).getByRole("button")).toHaveCount(6, {
    timeout: 15_000,
  });

  // Pestaña A cambia velocidad (dispara guardado) y confirma que se guardó.
  await pageA.getByRole("button", { name: "×2" }).click();
  await expect(pageA.getByText("Guardado")).toBeVisible({ timeout: 10_000 });

  // Pestaña B, todavía con la revisión antigua en memoria, intenta guardar
  // también: el servidor debe rechazarla por conflicto de revisión.
  await pageB.getByRole("button", { name: "×4" }).click();
  await expect(pageB.getByText(/Conflicto: la partida cambió en otra pestaña/)).toBeVisible({ timeout: 10_000 });

  await context.close();
});
