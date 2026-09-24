import { test, expect, type Locator, type Page } from "@playwright/test";
import { createPrismaClient, loadGameV2, type PrismaClient } from "@z-world/persistence";

/**
 * Recorrido E2E de S10 sobre la carretera mutable (Puerta C): el generador
 * garantiza siempre al menos un acceso regional obstruido
 * (`VILLAGE_BUDGET.blockedRegionalAccesses`, `terrain.ts`), un tramo real de
 * `LinearFeature` con `wayState: "obstructed"` desde el arranque, sin
 * inyectar ningún conocimiento (los métodos S10 solo exigen que el blanco
 * exista, §"known_target"). Se despeja de verdad desde la interfaz
 * (conserva la función viaria), y después se le retira la función viaria de
 * forma irreversible con confirmación informada; ambos cambios persisten
 * tras recargar.
 */
const SEED = "probe-seed-92";
const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/zworld";

async function withPrisma<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  const prisma = createPrismaClient(DATABASE_URL);
  try {
    return await fn(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

interface RoadFixture {
  readonly gameSaveId: string;
  readonly roadId: string;
}

async function createVillage(page: Page): Promise<RoadFixture> {
  await page.goto("/");
  await page.getByLabel(/Semilla/).fill(SEED);
  await page.getByRole("button", { name: "Generar pueblo" }).click();
  await page.waitForURL(/\/village\//, { timeout: 20_000 });
  const gameSaveId = page.url().split("/village/")[1]!.split(/[?#]/)[0]!;
  await expect(page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button")).toHaveCount(6, { timeout: 20_000 });
  const roadId = await withPrisma(async (prisma) => {
    const { state } = await loadGameV2(prisma, gameSaveId);
    const road = Object.values(state.world.linearFeatures).find((l) => l.kind === "road" && l.wayState === "obstructed");
    if (!road) throw new Error("La semilla de prueba no generó ningún acceso regional obstruido (probabilístico entre 1 y 2).");
    return road.id;
  });
  return { gameSaveId, roadId };
}

function actionSection(panel: Locator): Locator {
  return panel.locator("section").filter({ hasText: "Acción contextual" });
}

async function chooseAction(panel: Locator, actionLabel: string, target: { readonly id?: string; readonly text?: string | RegExp }): Promise<void> {
  const selects = actionSection(panel).locator("select");
  await selects.nth(0).selectOption({ label: actionLabel });
  const targetSelect = selects.nth(1);
  const option = target.id ? targetSelect.locator(`option[data-target-id="${target.id}"]`) : targetSelect.locator("option").filter({ hasText: target.text! });
  await expect(option.first()).toHaveCount(1, { timeout: 15_000 });
  await targetSelect.selectOption((await option.first().getAttribute("value"))!);
}

async function order(panel: Locator, confirmIrreversible = false): Promise<string> {
  const section = actionSection(panel);
  if (confirmIrreversible) {
    await expect(section.getByRole("button", { name: "Ordenar" })).toBeDisabled();
    await section.getByLabel("Confirmar acción irreversible").check();
  }
  const orderedJobIds = () => panel.locator("li[data-job-id]").evaluateAll((els) => els.filter((e) => !["drink", "eat", "rest"].includes(e.getAttribute("data-job-action") ?? "")).map((e) => e.getAttribute("data-job-id")));
  const before = await orderedJobIds();
  await section.getByRole("button", { name: "Ordenar" }).click();
  await expect.poll(async () => (await orderedJobIds()).filter((id) => !before.includes(id)).length, { timeout: 15_000 }).toBeGreaterThan(0);
  return (await orderedJobIds()).find((id) => !before.includes(id))!;
}

async function accomplish(panel: Locator, choose: () => Promise<void>, options: { readonly confirm?: boolean; readonly timeout?: number } = {}): Promise<void> {
  await choose();
  const jobId = await order(panel, options.confirm ?? false);
  await expect(panel.locator(`li[data-job-id="${jobId}"]`)).toHaveAttribute("data-job-state", "completed", { timeout: options.timeout ?? 180_000 });
}

async function wayStateOf(gameSaveId: string, roadId: string): Promise<string | null> {
  return withPrisma(async (prisma) => {
    const { state } = await loadGameV2(prisma, gameSaveId);
    return state.world.linearFeatures[roadId]?.wayState ?? null;
  });
}

test("S10: carretera mutable — despejar conservando función y retirar la función viaria de forma irreversible", async ({ page }) => {
  test.setTimeout(300_000);
  const fx = await createVillage(page);
  const people = page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button");
  await people.nth(1).click();
  const panel = page.getByRole("complementary", { name: "Trabajos y necesidades" });
  await page.getByRole("button", { name: "×10", exact: true }).click();

  expect(await wayStateOf(fx.gameSaveId, fx.roadId)).toBe("obstructed");

  // Despejar conserva la función viaria (WLD-010 §3.7): no exige confirmación irreversible.
  await accomplish(panel, () => chooseAction(panel, "Despejar vía", { id: fx.roadId }));
  expect(await wayStateOf(fx.gameSaveId, fx.roadId)).toBe("cleared");

  // Persiste tras recargar antes de la segunda transformación.
  await page.getByRole("button", { name: "Pausa", exact: true }).click();
  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 15_000 });
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button")).toHaveCount(6, { timeout: 20_000 });
  expect(await wayStateOf(fx.gameSaveId, fx.roadId)).toBe("cleared");
  await page.getByRole("button", { name: "×10", exact: true }).click();
  await people.nth(1).click();

  // Retirar la función viaria es irreversible en este alcance (deja terreno despejado, no una carretera reutilizable): exige confirmación informada.
  await accomplish(panel, () => chooseAction(panel, "Retirar función viaria", { id: fx.roadId }), { confirm: true });
  expect(await wayStateOf(fx.gameSaveId, fx.roadId)).toBe("function_removed");

  // También persiste tras recargar.
  await page.getByRole("button", { name: "Pausa", exact: true }).click();
  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 15_000 });
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button")).toHaveCount(6, { timeout: 20_000 });
  expect(await wayStateOf(fx.gameSaveId, fx.roadId)).toBe("function_removed");
});
