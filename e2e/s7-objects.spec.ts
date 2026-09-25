import { test, expect, type Locator, type Page } from "@playwright/test";
import type { ResourceLot } from "@z-world/contracts";
import { createPrismaClient, loadGameV2, saveSnapshotV2 } from "@z-world/persistence";

/**
 * Recorridos E2E de S7 (Puerta A) en navegador real (Chromium) contra
 * `next start` y PostgreSQL reales: retirar y volver a guardar en un
 * contenedor real (la mochila), entrar en un dormitorio, registrarlo y ver
 * solo entonces su contenido, reparar el armario con madera concreta del
 * propio lugar, vaciarlo, desmontarlo selectivamente con la casilla de
 * confirmación irreversible obligatoria, recoger los productos sueltos y
 * ver el deterioro del alimento fresco reflejado en el inventario.
 *
 * Semilla fija "probe-seed-92" (la misma que `village-runtime.spec.ts`,
 * cuyo trazado espacial `web-002-semantic-v2` conserva idéntico): a ~16 m
 * de la llegada (13, 36) hay una vivienda RES-10 cuyo primer dormitorio,
 * con centro en (0,43, 25,30), tiene un armario con 5 kg de madera dentro.
 *
 * Deterioro: con esta semilla no hay alimento fresco alcanzable en pocos
 * pasos (solo existe en la trastienda de un supermercado lejano), así que
 * el paso final inyecta en el snapshot guardado, como fixture de prueba,
 * un lote de alimento fresco en la mochila de la persona. El deterioro en
 * sí lo calcula el núcleo real dentro del Worker real y lo muestra la
 * interfaz real; la inyección solo sustituye el viaje hasta el
 * supermercado.
 */
const SEED = "probe-seed-92";
const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/zworld";

async function chooseAction(panel: Locator, actionLabel: string, targetText: string | RegExp): Promise<void> {
  const selects = panel.locator("section").filter({ hasText: "Acción contextual" }).locator("select");
  await selects.nth(0).selectOption({ label: actionLabel });
  const targetSelect = selects.nth(1);
  const option = targetSelect.locator("option").filter({ hasText: targetText }).first();
  await expect(option).toHaveCount(1, { timeout: 15_000 });
  const value = await option.getAttribute("value");
  await targetSelect.selectOption(value!);
}

async function orderAndWaitCompleted(page: Page, panel: Locator, jobLabel: string): Promise<void> {
  // Se acota a la sección «Trabajos» (no todo el panel): otras secciones del panel pueden contener texto que
  // coincida por subcadena (p. ej. «Sin preparar» de S10 contiene «reparar»).
  const jobsSection = panel.locator("section").filter({ hasText: "Trabajos" });
  const jobsBefore = await jobsSection.getByRole("listitem").filter({ hasText: jobLabel }).count();
  await panel.getByRole("button", { name: "Ordenar" }).click();
  const job = jobsSection.getByRole("listitem").filter({ hasText: jobLabel }).nth(jobsBefore);
  await expect(job).toContainText("completed", { timeout: 30_000 });
  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 15_000 });
}

test("S7: contenedores reales, registro, reparación, desmontaje confirmado, recogida y deterioro", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/");
  await page.getByLabel(/Semilla/).fill(SEED);
  await page.getByRole("button", { name: "Generar pueblo" }).click();
  await page.waitForURL(/\/village\//, { timeout: 20_000 });
  const gameSaveId = page.url().split("/village/")[1]!.split(/[?#]/)[0]!;

  const personButtons = page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button");
  await expect(personButtons).toHaveCount(6, { timeout: 20_000 });
  // La segunda persona de la cohorte (la primera llega agotada y la autoprotección interrumpiría el recorrido).
  await personButtons.nth(1).click();
  const panel = page.getByRole("complementary", { name: "Trabajos y necesidades" });
  const inventory = panel.getByRole("region", { name: "Inventario conocido" });

  // Pertenencias SCN-003 reales: la botella de esta persona va dentro de su mochila, con agua dentro.
  const bottle = inventory.getByRole("listitem").filter({ hasText: "Botella" }).first();
  await expect(bottle).toContainText("Dentro de Mochila");
  await expect(inventory.getByRole("listitem").filter({ hasText: "Agua" }).first()).toContainText("Dentro de");
  // Nada de la vivienda cercana aparece antes de registrarla.
  await expect(inventory.getByText("Armario")).toHaveCount(0);

  // ×1: el tiempo real de espera entre pasos no debe acumular horas simuladas (la primera persona llega agotada).
  await page.getByRole("button", { name: "×1", exact: true }).click();

  // 1. Retirar la botella de la mochila (contenedor real) y volver a guardarla.
  await chooseAction(panel, "Retirar de almacenamiento", /^Botella \(en Mochila\)/);
  await orderAndWaitCompleted(page, panel, "Retirar de almacenamiento");
  await expect(inventory.getByRole("listitem").filter({ hasText: "Botella" }).first()).not.toContainText("Dentro de Mochila");
  await expect(page.getByText(/Se retiró un objeto del almacenamiento/).first()).toBeVisible();

  await chooseAction(panel, "Almacenar", /^Botella → Mochila/);
  await orderAndWaitCompleted(page, panel, "Almacenar");
  await expect(inventory.getByRole("listitem").filter({ hasText: "Botella" }).first()).toContainText("Dentro de Mochila");
  await expect(page.getByText(/Se almacenó un objeto/).first()).toBeVisible();

  // 2. Entrar hasta el dormitorio (a través de la entrada y el resto de estancias).
  const canvas = page.getByRole("application", { name: "Mapa del pueblo" });
  const box = await canvas.boundingBox();
  if (!box) throw new Error("No se pudo medir el Canvas del mapa.");
  const pixelsPerMeter = 3;
  const dx = 0.43 - 13;
  const dy = 25.3 - 36;
  await canvas.click({ button: "right", position: { x: box.width / 2 + dx * pixelsPerMeter, y: box.height / 2 + dy * pixelsPerMeter } });
  await page.getByRole("button", { name: "Moverse aquí" }).click();
  await expect(page.getByText(/Entró en una estancia/).first()).toBeVisible({ timeout: 20_000 });
  await expect(personButtons.nth(1)).not.toContainText("Desplazándose", { timeout: 20_000 });

  // 3. Registrar el dormitorio: solo entonces aparece su contenido.
  await chooseAction(panel, "Registrar", "Dormitorio");
  await orderAndWaitCompleted(page, panel, "Registrar");
  const wardrobe = inventory.getByRole("listitem").filter({ hasText: "Armario" }).first();
  await expect(wardrobe).toContainText("capacidad");
  await expect(inventory.getByRole("listitem").filter({ hasText: "Madera y tablones" }).first()).toContainText("Dentro de Armario");

  // 4. Reparar el armario: consume madera concreta del propio lugar (nunca "materiales de reparación").
  await chooseAction(panel, "Reparar", "Armario");
  await orderAndWaitCompleted(page, panel, "Reparar");
  await expect(page.getByText(/Se intentó una reparación/).first()).toBeVisible();
  await expect(page.getByText(/Se consumió un lote de recurso/).first()).toBeVisible();

  // 5. Desmontar exige vaciarlo antes: retirar la madera que queda dentro.
  await chooseAction(panel, "Retirar de almacenamiento", /^Madera y tablones \(en Armario\)/);
  await orderAndWaitCompleted(page, panel, "Retirar de almacenamiento");

  // 6. Desmontaje selectivo, ordenado a la persona con más técnica/mecánica de la cohorte (Iker, la
  // primera): el trabajo la lleva hasta el dormitorio en su fase de viaje. "Ordenar" está desactivado
  // hasta marcar la confirmación irreversible.
  await personButtons.nth(0).click();
  await chooseAction(panel, "Desmontar (selectivo)", "Armario");
  await expect(panel.getByRole("button", { name: "Ordenar" })).toBeDisabled();
  await panel.getByRole("checkbox").check();
  await expect(panel.getByRole("button", { name: "Ordenar" })).toBeEnabled();
  await orderAndWaitCompleted(page, panel, "Desmontar (selectivo)");
  await expect(inventory.getByRole("listitem").filter({ hasText: "Armario" }).first()).toContainText("Solo piezas");
  await expect(page.getByText(/Se desmontó un objeto/).first()).toBeVisible();

  // 7. Recoger el producto suelto que ha quedado en el dormitorio (de nuevo con la segunda persona, que sigue allí).
  await personButtons.nth(1).click();
  await chooseAction(panel, "Recoger", "Madera y tablones");
  await orderAndWaitCompleted(page, panel, "Recoger");
  await expect(page.getByText(/Se recogió un objeto/).first()).toBeVisible();

  // 8. Deterioro del alimento fresco reflejado en la interfaz (fixture: ver cabecera).
  await page.getByRole("button", { name: "Pausa", exact: true }).click();
  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 15_000 });
  // Se sale de la partida antes de tocar el snapshot: ningún guardado automático del Worker puede competir por la revisión.
  const villageUrl = page.url();
  await page.goto("about:blank");
  const prisma = createPrismaClient(DATABASE_URL);
  try {
    // Un guardado automático ya en vuelo en el servidor puede terminar después de salir: se reintenta
    // sobre la revisión más reciente hasta que la inyección entra limpia (control optimista real).
    for (let attempt = 0; ; attempt++) {
      await page.waitForTimeout(1_000);
      const { state, revision } = await loadGameV2(prisma, gameSaveId);
      const personId = state.peopleOrder[1]!;
      const packContainerId = `${personId}-pack-container`;
      const lot: ResourceLot = {
        id: "resource-lot-e2e-fresh",
        family: "fresh_food",
        quantity: 2,
        unit: "unit",
        location: { kind: "container", containerId: packContainerId },
        condition: 0.62,
        reservedByJobId: null,
        qualityKnown: true,
        quality: 1,
        provenance: "e2e_fixture",
        decayStartedAtSimSeconds: state.clock.elapsedSimSeconds,
        conditionAtDecayStart: 0.62,
      };
      const pack = state.containers[packContainerId]!;
      const next = {
        ...state,
        resourceLots: { ...state.resourceLots, [lot.id]: lot },
        containers: { ...state.containers, [pack.id]: { ...pack, contentIds: [...pack.contentIds, lot.id] } },
      };
      try {
        await saveSnapshotV2(prisma, { gameSaveId, expectedRevision: revision, state: next, events: [], reason: "manual_save", attemptId: crypto.randomUUID() });
        break;
      } catch (error) {
        if (attempt >= 5) throw error;
      }
    }
  } finally {
    await prisma.$disconnect();
  }
  await page.goto(villageUrl);
  await expect(personButtons).toHaveCount(6, { timeout: 20_000 });
  await personButtons.nth(1).click();
  const freshFood = inventory.getByRole("listitem").filter({ hasText: "Alimento fresco" }).first();
  await expect(freshFood).toContainText("Fresco");
  await expect(freshFood).toContainText("se echa a perder hacia");
  await page.getByRole("button", { name: "×10" }).click();
  await expect(freshFood).toContainText("Empezando a deteriorarse", { timeout: 60_000 });
  await expect(page.getByText(/Un alimento cambió de estado de conservación/).first()).toBeVisible();
});
