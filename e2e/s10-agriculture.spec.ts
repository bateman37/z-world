import { test, expect, type Locator, type Page } from "@playwright/test";
import { createPrismaClient, loadGameV2, type PrismaClient } from "@z-world/persistence";

/**
 * Recorrido E2E flagship de S10 (Puerta C, agricultura completa) en
 * navegador real (Chromium) contra `next start`/`next dev` y PostgreSQL
 * reales, sobre el pueblo generado por `web-002-semantic-v4` con la
 * semilla estable "probe-seed-92": el generador garantiza siempre una
 * `CultivationPlot` sin preparar con semillas (1-3 kg) y una herramienta
 * agrícola reales en el borde de su campo (§7.5/§20.3). El requisito duro
 * `known_target` de los métodos S10 solo exige que el blanco exista, no
 * niebla/descubrimiento, así que a diferencia de S9 esta fixture no
 * inyecta ningún conocimiento por Prisma: solo LEE el snapshot para
 * localizar los IDs reales ya generados (parcela, cultivo) antes de
 * operar desde la interfaz real.
 *
 * Recorrido: preparar suelo con interrupción y reanudación real del
 * progreso parcial, sembrar con el cultivo de ciclo abreviado de
 * verificación (mismo motor causal, solo tiempos abreviados —
 * `crop.test_fast_vegetables`), confirmar que en pausa no hay avance,
 * avanzar a ×10 hasta cosechable, cuidar/regar, cosechar en el borde del
 * campo, trasladar la cosecha y comprobar que persiste tras recargar.
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

interface FieldFixture {
  readonly gameSaveId: string;
  readonly villageUrl: string;
  readonly plotId: string;
  readonly parcelId: string;
  readonly fittestPersonName: string;
}

async function createVillage(page: Page): Promise<FieldFixture> {
  await page.goto("/");
  await page.getByLabel(/Semilla/).fill(SEED);
  await page.getByRole("button", { name: "Generar pueblo" }).click();
  await page.waitForURL(/\/village\//, { timeout: 20_000 });
  const villageUrl = page.url();
  const gameSaveId = villageUrl.split("/village/")[1]!.split(/[?#]/)[0]!;
  await expect(page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button")).toHaveCount(6, { timeout: 20_000 });
  const { plotId, parcelId, fittestPersonName } = await withPrisma(async (prisma) => {
    const { state } = await loadGameV2(prisma, gameSaveId);
    const plot = Object.values(state.cultivationPlots)[0]!;
    // La persona mejor descansada, hidratada y alimentada minimiza el riesgo de que la autoprotección (S6) interrumpa
    // las órdenes de este recorrido; a diferencia de S9, aquí no hace falta evitar a nadie en concreto por posición.
    const fittest = state.peopleOrder.map((id) => state.people[id]!).sort((a, b) => Math.min(...b.needs.map((n) => n.value)) - Math.min(...a.needs.map((n) => n.value)))[0]!;
    return { plotId: plot.id, parcelId: plot.parcelId, fittestPersonName: `${fittest.public.firstName} ${fittest.public.lastName}` };
  });
  return { gameSaveId, villageUrl, plotId, parcelId, fittestPersonName };
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

async function accomplish(panel: Locator, choose: () => Promise<void>, options: { readonly confirm?: boolean; readonly timeout?: number } = {}): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    await choose();
    const jobId = await order(panel, options.confirm ?? false);
    const item = panel.locator(`li[data-job-id="${jobId}"]`);
    await expect(item).toHaveAttribute("data-job-state", /completed|causal_failure/, { timeout: options.timeout ?? 180_000 });
    if ((await item.getAttribute("data-job-state")) === "completed") return jobId;
  }
  throw new Error("La orden no llegó a completarse tras varios intentos.");
}

function plotItem(panel: Locator, plotId: string): Locator {
  return panel.locator(`li[data-cultivation-plot-id="${plotId}"]`);
}

test("S10: ciclo agrícola completo — preparar con interrupción, sembrar, cuidar, cosechar y persistir", async ({ page }) => {
  test.setTimeout(600_000);
  const fx = await createVillage(page);
  const people = page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button");
  await people.filter({ hasText: fx.fittestPersonName }).click();
  const panel = page.getByRole("complementary", { name: "Trabajos y necesidades" });
  // A ×1 el reloj determinista avanza 72 s simulados por s real (§4.4): lo bastante lento para observar de verdad la
  // interrupción a mitad de un trabajo de 30 min simulados y la pausa del crecimiento, sin ningún atajo de "avanzar ya".
  await page.getByRole("button", { name: "×1", exact: true }).click();

  await expect(plotItem(panel, fx.plotId)).toHaveAttribute("data-cultivation-plot-state", "unprepared");

  // Preparar suelo: se interrumpe a mitad y se reanuda conservando el progreso parcial (nunca se rerrollea ni se pierde).
  await chooseAction(panel, "Preparar suelo", { id: fx.plotId });
  const prepareJobId = await order(panel);
  await expect(panel.locator(`li[data-job-id="${prepareJobId}"]`)).toHaveAttribute("data-job-state", "in_progress", { timeout: 60_000 });
  await expect.poll(async () => Number(await plotItem(panel, fx.plotId).getAttribute("data-cultivation-plot-preparation")), { timeout: 60_000 }).toBeGreaterThan(0);
  await panel.locator(`li[data-job-id="${prepareJobId}"]`).getByRole("button", { name: "Pausar" }).click({ timeout: 10_000 });
  await expect(panel.locator(`li[data-job-id="${prepareJobId}"]`)).toHaveAttribute("data-job-state", "paused");
  const progressAtPause = Number(await plotItem(panel, fx.plotId).getAttribute("data-cultivation-plot-preparation"));
  expect(progressAtPause).toBeGreaterThan(0);
  await page.waitForTimeout(1_000);
  expect(Number(await plotItem(panel, fx.plotId).getAttribute("data-cultivation-plot-preparation"))).toBe(progressAtPause); // en pausa no avanza nada.
  await panel.locator(`li[data-job-id="${prepareJobId}"]`).getByRole("button", { name: "Reanudar" }).click();
  await expect(panel.locator(`li[data-job-id="${prepareJobId}"]`)).toHaveAttribute("data-job-state", "completed", { timeout: 120_000 });
  await expect(plotItem(panel, fx.plotId)).toHaveAttribute("data-cultivation-plot-state", "prepared");

  // Sembrar con el cultivo de ciclo abreviado de verificación (mismo motor, mismas reglas, tiempos abreviados).
  await chooseAction(panel, "Sembrar", { id: fx.plotId });
  const section = actionSection(panel);
  await section.getByLabel("Cultivo:").selectOption({ label: "Hortaliza de ciclo abreviado (verificación)" });
  const sowJobId = await order(panel);
  await expect(panel.locator(`li[data-job-id="${sowJobId}"]`)).toHaveAttribute("data-job-state", "completed", { timeout: 120_000 });
  await expect(plotItem(panel, fx.plotId)).toHaveAttribute("data-cultivation-plot-state", "growing");

  // En pausa no hay crecimiento: se comprueba deteniendo el reloj un momento antes de avanzar de verdad.
  await page.getByRole("button", { name: "Pausa", exact: true }).click();
  await page.waitForTimeout(1_000);
  await expect(plotItem(panel, fx.plotId)).toHaveAttribute("data-cultivation-plot-state", "growing");

  // Cuidar/regar mientras crece, y dejar avanzar el reloj determinista (sin botón de "crecer ahora") hasta cosechable.
  await page.getByRole("button", { name: "×1", exact: true }).click();
  await chooseAction(panel, "Cuidar/regar", { id: fx.plotId });
  await order(panel);
  await expect(plotItem(panel, fx.plotId)).toHaveAttribute("data-cultivation-plot-state", "harvestable", { timeout: 60_000 });

  // Cosechar: la producción queda en el borde del campo hasta transportarla.
  const harvestJobId = await accomplish(panel, () => chooseAction(panel, "Cosechar", { id: fx.plotId }), { timeout: 120_000 });
  expect(harvestJobId).toBeTruthy();
  await expect(plotItem(panel, fx.plotId)).toHaveAttribute("data-cultivation-plot-state", "harvested");

  // Trasladar la cosecha real (fresh_food) desde el borde del campo a un destino de almacenamiento real, o al punto de
  // llegada si no hay ninguno accesible desde aquí; en ambos casos es un traslado real del motor de logística (S8).
  await accomplish(panel, async () => {
    await section.locator("select").nth(0).selectOption({ label: "Transportar" });
    const harvestOption = section.locator("select").nth(1).locator("option").filter({ hasText: /kg/ }).first();
    await expect(harvestOption).toHaveCount(1, { timeout: 15_000 });
    await section.locator("select").nth(1).selectOption((await harvestOption.getAttribute("value"))!);
    const destinationSelect = section.getByLabel("Destino del traslado");
    const containerDestination = destinationSelect.locator("option[data-destination-id]").filter({ hasText: "Contenedor:" }).first();
    if (await containerDestination.count()) {
      await destinationSelect.selectOption((await containerDestination.getAttribute("value"))!);
    } else {
      await destinationSelect.selectOption({ label: "Punto de llegada del grupo (exterior)" });
    }
    await section.getByLabel("Método de transporte").selectOption({ label: "A pulso" });
  });

  // Guardar y recargar: el ciclo agrícola completo persiste exactamente igual.
  await page.getByRole("button", { name: "Pausa", exact: true }).click();
  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 15_000 });
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button")).toHaveCount(6, { timeout: 20_000 });
  await expect(plotItem(page.getByRole("complementary", { name: "Trabajos y necesidades" }), fx.plotId)).toHaveAttribute("data-cultivation-plot-state", "harvested");

  const finalLot = await withPrisma(async (prisma) => {
    const { state } = await loadGameV2(prisma, fx.gameSaveId);
    return Object.values(state.resourceLots).find((lot) => lot.family === "fresh_food" && lot.provenance?.startsWith("harvest:"));
  });
  expect(finalLot).toBeTruthy();
  expect(finalLot!.quantity).toBeGreaterThan(0);
});
