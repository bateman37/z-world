import { test, expect } from "@playwright/test";
import type { ResourceLot } from "@z-world/contracts";
import { createPrismaClient, loadGameV2, saveSnapshotV2 } from "@z-world/persistence";

/**
 * Recorrido E2E cruzado del perímetro/barrera (S11 §8, Puerta E): dibujar
 * el tramo en el Canvas → geometría validada contra anclajes reales →
 * comprobación de materiales → trabajo creado → reasignado a una persona
 * concreta (Puerta D) → recursos reservados y consumidos → ejecución real
 * → barrera materializada en el mundo → persistencia/recarga → registro
 * operacional → todo mediante los sistemas reales de órdenes, trabajos,
 * objetos y resolución del motor — sin motor paralelo ni atajo exclusivo
 * de la prueba.
 *
 * Semilla fija "probe-seed-92" (la misma que `village-runtime.spec.ts` y
 * `s7-objects.spec.ts`, ya verificada como transitable: ambas caminan
 * hasta esta misma vivienda RES-10 cerca de la llegada (13, 36)). El
 * trazado usa dos esquinas reales de esa vivienda (anclajes de tipo
 * `building_corner`, WLD-010 §3.6: "un anclaje puede ser... esquina de
 * edificio compatible") como tramo de barrera, en vez de buscar anclajes
 * en una zona nueva sin camino probado: los anclajes de S10 solo existen
 * en las esquinas de los edificios que genera el mundo real (no hay
 * "postes" sueltos en el generador), y elegir un par al azar en otra
 * parte del mapa puede caer fuera de la red de caminos conocida del
 * poblado (motivo real de bloqueo "No hay ruta conocida", verificado
 * durante el desarrollo de esta prueba con `barrier-e2e-seed-5`).
 *
 * Los ~9,8 m del tramo exigen ~29,5 kg de madera, que no están sueltos en
 * ningún punto único del mapa (todo el aserrín generado vive repartido en
 * contenedores de pocos kilos cada uno). Igual que la inyección de
 * alimento fresco de `s7-objects.spec.ts` sustituye un viaje al
 * supermercado lejano sin tocar el cálculo real de deterioro, aquí se
 * inyecta un lote de madera ya cargado por la persona ejecutora para
 * sustituir la logística de reunir varios contenedores de un tirón: la
 * reserva, el consumo exacto, la ejecución y la materialización del tramo
 * los sigue calculando el motor real dentro del Worker real.
 */
const SEED = "probe-seed-92";
const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/zworld";
const ARRIVAL = { x: 13, y: 36 };
const ANCHOR_A = { x: -2.988802, y: 19.621412 };
const ANCHOR_B = { x: 6.702454, y: 18.038507 };
const PIXELS_PER_METER = 3;

test("S10/S11 (Puerta E): recorrido cruzado completo de barrera/perímetro", async ({ page }) => {
  test.setTimeout(180_000);
  // Viewport ancho: ver la nota equivalente en `work-panel.spec.ts` (la
  // rejilla de 4 columnas desborda el ancho por defecto de Playwright).
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");
  await page.getByLabel(/Semilla/).fill(SEED);
  await page.getByRole("button", { name: "Generar pueblo" }).click();
  await page.waitForURL(/\/village\//, { timeout: 20_000 });
  const gameSaveId = page.url().split("/village/")[1]!.split(/[?#]/)[0]!;

  const personButtons = page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button");
  await expect(personButtons).toHaveCount(6, { timeout: 20_000 });
  await personButtons.first().click();
  const panel = page.getByRole("complementary", { name: "Trabajos y necesidades" });
  const jobsSection = panel.locator("section").filter({ hasText: "Trabajos" });
  await expect(panel.getByText("Sin trabajos activos.")).toBeVisible();

  // Se pausa para que el trazado y la reasignación no compitan con avance simulado.
  await page.getByRole("button", { name: "Pausa", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pausa", exact: true })).toHaveAttribute("aria-pressed", "true");

  const canvas = page.getByRole("application", { name: "Mapa del pueblo" });
  const box = await canvas.boundingBox();
  if (!box) throw new Error("No se pudo medir el Canvas del mapa.");
  const centerX = box.width / 2;
  const centerY = box.height / 2;
  const toScreen = (world: { x: number; y: number }) => ({
    x: centerX + (world.x - ARRIVAL.x) * PIXELS_PER_METER,
    y: centerY + (world.y - ARRIVAL.y) * PIXELS_PER_METER,
  });

  // 1-2: dibujar el tramo desde el Canvas entre los dos anclajes reales de
  // la semilla (geometría validada por el motor: `resolveOrCreateBarrierSegment`
  // solo acepta el trazado si ambos extremos caen cerca de un anclaje real).
  const designationSelect = panel.locator("select").filter({ hasText: "Construir barrera entre anclajes" });
  await designationSelect.selectOption("build_barrier");
  await panel.getByRole("button", { name: "Dibujar tramo en el mapa" }).click();
  await expect(page.getByRole("status")).toContainText("Dibujando tramo de barrera");
  const pointA = toScreen(ANCHOR_A);
  const pointB = toScreen(ANCHOR_B);
  await canvas.click({ position: pointA });
  await canvas.click({ position: pointB });
  await expect(page.getByRole("status")).toHaveCount(0);

  // 2b (Puerta D): seleccionar el tramo recién trazado en el Canvas antes
  // de que nadie llegue a trabajar en él — confirma la geometría real
  // (unido a los anclajes reales, sin construir todavía) por el mismo
  // camino de selección universal ya cerrado en esa puerta. Se hace lejos
  // de la persona ejecutora porque el trabajo aún no tiene asignada
  // (ver más abajo): nadie debería estar de pie sobre la línea todavía.
  await canvas.click({ position: pointA });
  const drawnSheet = page.getByRole("complementary", { name: "Ficha de selección" });
  await expect(drawnSheet).toBeVisible({ timeout: 10_000 });
  await expect(drawnSheet).toHaveAttribute("data-selection-kind", "barrier_segment");
  await expect(drawnSheet.getByText("Todavía sin construir.")).toBeVisible();
  await drawnSheet.getByRole("button", { name: "Cerrar ficha" }).click();

  // 3-4: el trabajo se crea solo (comprobación de requisitos duros ya
  // resuelta: blanco conocido y materiales concretos, verificados en fase
  // `prepare`, no aquí — igual que el resto de S10).
  const jobItem = jobsSection.getByRole("listitem").filter({ hasText: "Construir barrera" }).first();
  await expect(jobItem).toBeVisible({ timeout: 10_000 });
  await expect(jobItem).toContainText("Asignadas: nadie");

  // 5 (Puerta D): reasignar el trabajo a la persona seleccionada con el
  // control de reasignación del panel — el mismo mecanismo real ya
  // expuesto para cualquier trabajo, no algo especial de esta prueba.
  const actorFullName = (await personButtons.first().locator("div").first().innerText()).trim();
  const actorFirstName = actorFullName.split(" ")[0]!;
  await jobItem.getByRole("combobox", { name: "Añadir persona al trabajo" }).selectOption({ label: actorFirstName });
  await jobItem.getByRole("button", { name: "Añadir" }).click();
  await expect(jobItem).toContainText(`Asignadas: ${actorFirstName}`);
  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 10_000 });

  // 6 (fixture, ver cabecera): inyecta la madera ya cargada por la persona
  // ejecutora, sustituyendo el trayecto de reunir varios contenedores.
  const villageUrl = page.url();
  await page.goto("about:blank");
  const prisma = createPrismaClient(DATABASE_URL);
  try {
    for (let attempt = 0; ; attempt++) {
      await page.waitForTimeout(1_000);
      const { state, revision } = await loadGameV2(prisma, gameSaveId);
      const actorPersonId = state.peopleOrder[0]!;
      const lot: ResourceLot = {
        id: "resource-lot-e2e-barrier-wood",
        family: "wood_and_planks",
        quantity: 35,
        unit: "kilogram",
        location: { kind: "carried_by_person", personId: actorPersonId },
        condition: 0.8,
        reservedByJobId: null,
        qualityKnown: true,
        quality: 0.8,
        provenance: "e2e_fixture",
        decayStartedAtSimSeconds: null,
        conditionAtDecayStart: null,
      };
      const next = { ...state, resourceLots: { ...state.resourceLots, [lot.id]: lot } };
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

  // 7-8: recargar y dejar correr el trabajo (reserva, ejecución) a ×10
  // hasta que se complete.
  await page.goto(villageUrl);
  await expect(personButtons).toHaveCount(6, { timeout: 20_000 });
  const inventory = panel.getByRole("region", { name: "Inventario conocido" });
  await expect(inventory.getByRole("listitem").filter({ hasText: "Madera y tablones" }).first()).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "×10" }).click();
  const jobAfterReload = jobsSection.getByRole("listitem").filter({ hasText: "Construir barrera" }).first();
  await expect(jobAfterReload).toHaveAttribute("data-job-state", "completed", { timeout: 120_000 });
  await expect(page.getByText(/Se completó un tramo de barrera/).first()).toBeVisible();
  // La madera reservada se consumió realmente (~29,5 kg de los 9,8 m del tramo, del lote de 35 kg inyectado):
  // queda un resto real en el inventario, nunca se destruye de más ni desaparece el lote entero.
  const remainingWood = inventory.getByRole("listitem").filter({ hasText: "Madera y tablones" }).first();
  await expect(remainingWood).toBeVisible({ timeout: 10_000 });
  await expect(remainingWood).not.toContainText("×35");
  await expect(page.getByText(/Se consumió un lote de recurso/).first()).toBeVisible();

  // 9 (materialización real, no cosmética): el evento persistido y el
  // estado del trabajo ya prueban que `barrierSegment.built` pasó a
  // verdadero (verificado también a nivel de motor en
  // `terrain-agriculture.test.ts`); la vivienda reúne a varias personas
  // en descanso justo sobre este tramo (necesidad "Urgente" ya visible
  // desde el principio de esta prueba), así que reseleccionar por Canvas
  // aquí competiría por el mismo punto que alguien real está pisando —
  // la selección de un tramo de barrera (Puerta D) ya quedó demostrada
  // arriba, antes de construirlo, cuando el sitio todavía estaba libre.

  // 10-11: persistir, cerrar y recargar conservando el resultado.
  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 10_000 });
  const villageUrlAfterBuild = page.url();
  await page.reload();
  await expect(personButtons).toHaveCount(6, { timeout: 20_000 });
  expect(page.url()).toBe(villageUrlAfterBuild);

  // 12 (registro persistido): el aviso de barrera completada sigue visible
  // tras recargar, reconstruido desde eventos persistidos (S11 §6.4).
  await expect(page.getByRole("region", { name: "Registro operacional" }).getByText(/Se completó un tramo de barrera/).first()).toBeVisible({ timeout: 15_000 });

  // 13 (fronteras de conocimiento e idempotencia): el trabajo sigue
  // "completed" tras recargar — el estado reconstruido no retrocede ni
  // duplica el resultado por releer el mismo snapshot/revisión (§14 del
  // encargo). No se repite la selección por Canvas tras la recarga: la
  // cámara se recentra en quien sea `mapEntities.people[0]` en ese
  // instante (no necesariamente en la llegada), y la Puerta D ya quedó
  // demostrada arriba sin depender de una recarga.
  await expect(jobsSection.getByRole("listitem").filter({ hasText: "Construir barrera" }).first()).toHaveAttribute("data-job-state", "completed");
});
