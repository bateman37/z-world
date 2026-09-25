import { test, expect, type Locator, type Page } from "@playwright/test";
import type { SimulationStateV2, WorldPoint } from "@z-world/contracts";
import { createPrismaClient, loadGameV2, saveSnapshotV2, type PrismaClient } from "@z-world/persistence";

/**
 * Recorridos E2E de S8 (Puerta B) en navegador real (Chromium) contra
 * `next start` y PostgreSQL reales, sobre el pueblo generado por
 * `web-002-semantic-v3` con la semilla estable "probe-seed-92":
 *
 * 1. a pulso: el cubo real al pie de la bomba comunal hasta el punto de
 *    llegada;
 * 2. carretilla impuesta: la operadora va hasta la carretilla generada junto
 *    al refugio, la lleva hasta el cubo, carga, recorre, descarga y la deja
 *    estacionada en destino (con desgaste por uso);
 * 3. caso obligatorio de SET-010 §3.8: carro de mano → acceso exterior del
 *    supermercado (el único por el que cabe) → descarga en un punto de
 *    transferencia → nueva etapa a pulso con reserva propia → puertas
 *    interiores más estrechas → contenedor real de la trastienda;
 * 4. cancelar el caso 3 a mitad del recorrido cargado: la carga sigue
 *    montada en el carro y el carro queda donde lo dejó su operadora, lejos
 *    de su origen y del destino; sin reservas colgando, también tras recargar.
 *
 * Fixture (como en `s7-objects.spec.ts`): tras generar el pueblo desde la
 * interfaz se inyecta en el snapshot solo el conocimiento que daría la
 * exploración (niebla levantada, estancias del supermercado vistas y la
 * trastienda registrada). Ni las personas ni los objetos se mueven: todo
 * desplazamiento, carga y descarga lo hace el núcleo real en el Worker real
 * a partir de órdenes dadas en la interfaz real.
 */
const SEED = "probe-seed-92";
const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/zworld";

interface Fixture {
  readonly gameSaveId: string;
  readonly villageUrl: string;
  readonly bucketId: string;
  readonly bucketPoint: WorldPoint;
  readonly cartId: string;
  readonly cartPoint: WorldPoint;
  readonly barrowId: string;
  readonly barrowCondition: number;
  readonly backStorageContainerId: string;
  readonly supermarketBuildingId: string;
  readonly arrival: WorldPoint;
  readonly p1: string;
  readonly p2: string;
}

const dist = (a: WorldPoint, b: WorldPoint): number => Math.hypot(a.x - b.x, a.y - b.y);

async function withPrisma<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  const prisma = createPrismaClient(DATABASE_URL);
  try {
    return await fn(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

/** Genera el pueblo desde la interfaz e inyecta solo el conocimiento de exploración (ver cabecera). */
async function createVillageWithKnowledge(page: Page): Promise<Fixture> {
  await page.goto("/");
  await page.getByLabel(/Semilla/).fill(SEED);
  await page.getByRole("button", { name: "Generar pueblo" }).click();
  await page.waitForURL(/\/village\//, { timeout: 20_000 });
  const villageUrl = page.url();
  const gameSaveId = villageUrl.split("/village/")[1]!.split(/[?#]/)[0]!;
  await expect(page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button")).toHaveCount(6, { timeout: 20_000 });
  // Se sale de la partida antes de tocar el snapshot: ningún guardado automático del Worker compite por la revisión.
  await page.goto("about:blank");
  const fixture = await withPrisma(async (prisma) => {
    for (let attempt = 0; ; attempt++) {
      await page.waitForTimeout(1_000);
      const { state, revision } = await loadGameV2(prisma, gameSaveId);
      const arrival = state.world.arrivalPoint;
      const supermarket = Object.values(state.world.places)
        .filter((p) => p.profileId === "COM-02" && p.buildingId)
        .sort((a, b) => dist(a.position, arrival) - dist(b.position, arrival))[0]!;
      const rooms = Object.values(state.world.rooms).filter((r) => state.world.floors[r.floorId]!.buildingId === supermarket.buildingId);
      const backStorage = rooms.find((r) => r.programRoleKey === "back_storage")!;
      const container = Object.values(state.containers).find((c) => c.location.kind === "room" && c.location.roomId === backStorage.id)!;
      const bucket = Object.values(state.worldObjects).find((o) => o.variant === "work_container.bucket" && o.location.kind === "world_point")!;
      const cart = Object.values(state.transportMeans).find((m) => m.provenance === "generated:s8_supermarket_cart")!;
      const barrow = Object.values(state.transportMeans).find((m) => m.provenance === "generated:s8_shelter_wheelbarrow")!;
      const next: SimulationStateV2 = {
        ...state,
        fog: { ...state.fog, cells: state.fog.cells.map(() => 1) },
        discoveries: [...state.discoveries, ...rooms.map((r) => ({ entityId: r.id, facet: "rooms" as const, state: "observed" as const })), { entityId: backStorage.id, facet: "content" as const, state: "inspected" as const }],
      };
      try {
        await saveSnapshotV2(prisma, { gameSaveId, expectedRevision: revision, state: next, events: [], reason: "manual_save", attemptId: crypto.randomUUID() });
      } catch (error) {
        if (attempt >= 5) throw error;
        continue;
      }
      const point = (loc: { kind: string; point?: WorldPoint }): WorldPoint => loc.point!;
      return {
        gameSaveId,
        villageUrl,
        bucketId: bucket.id,
        bucketPoint: point(bucket.location),
        cartId: cart.id,
        cartPoint: point(cart.location),
        barrowId: barrow.id,
        barrowCondition: barrow.condition,
        backStorageContainerId: container.id,
        supermarketBuildingId: supermarket.buildingId!,
        arrival,
        p1: state.peopleOrder[1]!,
        p2: state.peopleOrder[2]!,
      };
    }
  });
  await page.goto(villageUrl);
  await expect(page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button")).toHaveCount(6, { timeout: 20_000 });
  return fixture;
}

async function selectByData(select: Locator, attribute: string, id: string): Promise<void> {
  const option = select.locator(`option[${attribute}="${id}"]`);
  await expect(option).toHaveCount(1, { timeout: 15_000 });
  await select.selectOption((await option.getAttribute("value"))!);
}

interface TransportOrder {
  readonly cargoId: string;
  readonly methodLabel: string;
  readonly meansId?: string;
  readonly destinationId: string;
  /** Índices, dentro de la lista «Equipo», de las ayudantes (la lista excluye a la persona seleccionada). */
  readonly teamIndexes?: readonly number[];
}

/** Ordena un traslado desde el panel (acción, carga, destino, método, medio y equipo) y devuelve el id del trabajo creado. */
async function orderTransport(panel: Locator, order: TransportOrder): Promise<string> {
  const section = panel.locator("section").filter({ hasText: "Acción contextual" });
  await section.locator("select").nth(0).selectOption({ label: "Transportar" });
  await selectByData(section.locator("select").nth(1), "data-target-id", order.cargoId);
  await selectByData(section.getByLabel("Destino del traslado"), "data-destination-id", order.destinationId);
  await section.getByLabel("Método de transporte").selectOption({ label: order.methodLabel });
  if (order.meansId) await selectByData(section.getByLabel("Medio concreto"), "data-means-id", order.meansId);
  const team = section.getByRole("group", { name: "Equipo (hasta 3 más)" }).getByRole("checkbox");
  for (const index of order.teamIndexes ?? []) await team.nth(index).check();
  const before = await panel.locator("li[data-job-id]").evaluateAll((els) => els.map((e) => e.getAttribute("data-job-id")));
  await section.getByRole("button", { name: "Ordenar" }).click();
  await expect.poll(async () => (await panel.locator("li[data-job-id]").evaluateAll((els) => els.map((e) => e.getAttribute("data-job-id")))).filter((id) => !before.includes(id)).length, { timeout: 15_000 }).toBeGreaterThan(0);
  const after = await panel.locator("li[data-job-id]").evaluateAll((els) => els.map((e) => e.getAttribute("data-job-id")));
  return after.find((id) => !before.includes(id))!;
}

function jobItem(panel: Locator, jobId: string): Locator {
  return panel.locator(`li[data-job-id="${jobId}"]`);
}

/** Pausa, espera al guardado y devuelve el último snapshot que cumpla la condición. */
async function pausedSnapshot(page: Page, gameSaveId: string, predicate: (s: SimulationStateV2) => boolean): Promise<SimulationStateV2> {
  await page.getByRole("button", { name: "Pausa" }).click();
  await expect(page.getByText("Guardado")).toBeVisible({ timeout: 15_000 });
  return withPrisma(async (prisma) => {
    for (let attempt = 0; attempt < 30; attempt++) {
      const { state } = await loadGameV2(prisma, gameSaveId);
      if (predicate(state)) return state;
      await page.waitForTimeout(500);
    }
    throw new Error("El snapshot guardado no alcanzó el estado esperado.");
  });
}

function selectSecondPerson(page: Page): Promise<void> {
  // La primera persona de la cohorte llega agotada: su autoprotección interrumpiría el recorrido.
  return page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button").nth(1).click();
}

test("S8: a pulso, el cubo real de la bomba hasta el punto de llegada", async ({ page }) => {
  test.setTimeout(180_000);
  const fx = await createVillageWithKnowledge(page);
  await selectSecondPerson(page);
  const panel = page.getByRole("complementary", { name: "Trabajos y necesidades" });
  await page.getByRole("button", { name: "×10", exact: true }).click();
  const jobId = await orderTransport(panel, { cargoId: fx.bucketId, methodLabel: "A pulso", destinationId: "arrival_point" });
  const job = jobItem(panel, jobId);
  await expect(job).toContainText("A pulso");
  await expect(job).toHaveAttribute("data-job-state", "completed", { timeout: 60_000 });
  await expect(page.getByText("Se entregó una carga en su destino.").first()).toBeVisible();

  const state = await pausedSnapshot(page, fx.gameSaveId, (s) => s.jobs[jobId]?.state === "completed");
  const bucket = state.worldObjects[fx.bucketId]!;
  expect(bucket.location.kind).toBe("world_point");
  expect(dist(bucket.location.kind === "world_point" ? bucket.location.point : { x: 1e9, y: 1e9 }, fx.arrival)).toBeLessThan(3);
  expect(state.jobs[jobId]!.transport!.method).toBe("hand_carry");
  expect(Object.values(state.reservations).filter((r) => r.jobId === jobId)).toHaveLength(0);
  expect(Object.keys(state.loadBundles)).toHaveLength(0);
});

test("S8: carretilla impuesta — recuperar el medio, cargar, recorrer, descargar y estacionar en destino", async ({ page }) => {
  test.setTimeout(180_000);
  const fx = await createVillageWithKnowledge(page);
  await selectSecondPerson(page);
  const panel = page.getByRole("complementary", { name: "Trabajos y necesidades" });
  await page.getByRole("button", { name: "×10", exact: true }).click();
  const jobId = await orderTransport(panel, { cargoId: fx.bucketId, methodLabel: "Carretilla", meansId: fx.barrowId, destinationId: "arrival_point" });
  const job = jobItem(panel, jobId);
  await expect(job).toContainText("Carretilla");
  await expect(job).toHaveAttribute("data-job-state", "completed", { timeout: 90_000 });

  const state = await pausedSnapshot(page, fx.gameSaveId, (s) => s.jobs[jobId]?.state === "completed");
  const barrow = state.transportMeans[fx.barrowId]!;
  const bucket = state.worldObjects[fx.bucketId]!;
  expect(barrow.location.kind).toBe("world_point");
  expect(bucket.location.kind).toBe("world_point");
  const barrowAt = barrow.location.kind === "world_point" ? barrow.location.point : fx.bucketPoint;
  const bucketAt = bucket.location.kind === "world_point" ? bucket.location.point : fx.bucketPoint;
  // Descarga en destino y medio estacionado allí mismo: nada queda en el origen ni montado.
  expect(dist(bucketAt, fx.arrival)).toBeLessThan(3);
  expect(dist(barrowAt, fx.arrival)).toBeLessThan(3);
  expect(barrow.currentLoadBundleId).toBeNull();
  expect(state.jobs[jobId]!.transport!.method).toBe("wheelbarrow");
  expect(state.jobs[jobId]!.transport!.travelledLoadedMeters).toBeGreaterThan(50);
  expect(Object.values(state.reservations).filter((r) => r.jobId === jobId)).toHaveLength(0);

  // Uso real del medio: desgaste determinista (S7 `applyUseWear`) y ruido registrado por tramos de ruta.
  expect(barrow.condition).toBeLessThan(fx.barrowCondition);
  expect(state.jobs[jobId]!.transport!.noiseUnits).toBeGreaterThan(0);
  // Cada fase logística deja su rastro en el registro operativo real.
  for (const text of ["Se planificó un traslado.", "Se recuperó un medio de transporte.", "Se preparó una carga.", "Un traslado hizo ruido por el camino.", "Se entregó una carga en su destino.", "Se dejó un medio de transporte."]) {
    await expect(page.getByText(text).first()).toBeVisible();
  }
});

test("S8: caso obligatorio — carro hasta el acceso del supermercado, transferencia y porte a pulso hasta la trastienda", async ({ page }) => {
  test.setTimeout(240_000);
  const fx = await createVillageWithKnowledge(page);
  await selectSecondPerson(page);
  const panel = page.getByRole("complementary", { name: "Trabajos y necesidades" });
  await page.getByRole("button", { name: "×10", exact: true }).click();
  const firstJobId = await orderTransport(panel, { cargoId: fx.bucketId, methodLabel: "Carro de mano", meansId: fx.cartId, destinationId: fx.backStorageContainerId, teamIndexes: [1] });
  const first = jobItem(panel, firstJobId);
  await expect(first).toContainText("Carro de mano");
  await expect(first).toHaveAttribute("data-job-state", "completed", { timeout: 90_000 });
  await expect(first).toContainText("Sigue en una nueva etapa a pulso desde el punto de transferencia.");
  await expect(page.getByText("Se descargó una carga en un punto de transferencia.").first()).toBeVisible();
  const second = panel.locator("li[data-job-id]").filter({ hasText: "Etapa tras un punto de transferencia." });
  await expect(second).toHaveCount(1, { timeout: 30_000 });
  await expect(second).toHaveAttribute("data-job-state", "completed", { timeout: 90_000 });
  await expect(second).toContainText("A pulso");

  const state = await pausedSnapshot(page, fx.gameSaveId, (s) => {
    const next = s.jobs[firstJobId]?.transport?.nextJobId;
    return Boolean(next && s.jobs[next]?.state === "completed");
  });
  const firstJob = state.jobs[firstJobId]!;
  const secondJobId = firstJob.transport!.nextJobId!;
  expect(state.jobs[secondJobId]!.transport!.previousJobId).toBe(firstJobId);
  expect(state.jobs[secondJobId]!.transport!.method).toBe("hand_carry");
  // El carro se detuvo ante un acceso exterior ancho del supermercado y allí se creó el punto de transferencia.
  const transferPoint = state.transferPoints[firstJob.transport!.transferPointId!]!;
  const access = state.world.openings[transferPoint.openingId!]!;
  expect(access.connectsToExterior).toBe(true);
  expect(["wide", "gate"]).toContain(access.widthClass);
  expect(state.world.floors[state.world.rooms[access.connectsRoomId!]!.floorId]!.buildingId).toBe(fx.supermarketBuildingId);
  const cart = state.transportMeans[fx.cartId]!;
  expect(cart.location.kind).toBe("world_point");
  const tpPoint = transferPoint.location.kind === "world_point" ? transferPoint.location.point : null;
  expect(tpPoint).not.toBeNull();
  expect(dist(cart.location.kind === "world_point" ? cart.location.point : fx.cartPoint, tpPoint!)).toBeLessThan(3);
  // La etapa a pulso atraviesa el acceso exterior y puertas interiores más estrechas que la que exigía el carro.
  const secondAccesses = state.jobs[secondJobId]!.transport!.routeAccesses;
  expect(secondAccesses.every((a) => a.crossed)).toBe(true);
  const crossedBySecond = secondAccesses.map((a) => state.world.openings[a.openingId]!.widthClass);
  await expect(page.getByText("Una carga atravesó un acceso.").first()).toBeVisible();
  expect(crossedBySecond.length).toBeGreaterThanOrEqual(2);
  expect(crossedBySecond.slice(1).every((w) => w === "normal")).toBe(true);
  expect(state.worldObjects[fx.bucketId]!.location).toEqual({ kind: "container", containerId: fx.backStorageContainerId });
  expect(Object.keys(state.reservations)).toHaveLength(0);
  expect(Object.keys(state.loadBundles)).toHaveLength(0);

  // La interfaz real refleja el resultado en el inventario localizado.
  const inventory = panel.getByRole("region", { name: "Inventario conocido" });
  await expect(inventory.getByRole("listitem").filter({ hasText: "Cubo" }).filter({ hasText: "Dentro de" }).first()).toBeVisible();
});

test("S8: cancelar el carro a mitad de ruta deja carga y medio en su posición causal, también tras recargar", async ({ page }) => {
  test.setTimeout(240_000);
  const fx = await createVillageWithKnowledge(page);
  await selectSecondPerson(page);
  const panel = page.getByRole("complementary", { name: "Trabajos y necesidades" });
  // ×1: el tramo cargado dura unos tres segundos reales, suficiente para cancelar a mitad.
  await page.getByRole("button", { name: "×1", exact: true }).click();
  const jobId = await orderTransport(panel, { cargoId: fx.bucketId, methodLabel: "Carro de mano", meansId: fx.cartId, destinationId: fx.backStorageContainerId, teamIndexes: [1] });
  const job = jobItem(panel, jobId);
  await expect(job.locator('[data-transport-step="traverse"]')).toHaveCount(1, { timeout: 60_000 });
  await page.waitForTimeout(1_200);
  await job.getByRole("button", { name: "Cancelar" }).click();
  await expect(job).toHaveAttribute("data-job-state", "cancelled", { timeout: 15_000 });
  await expect(page.getByText("Una carga quedó depositada donde estaba.").first()).toBeVisible();

  const state = await pausedSnapshot(page, fx.gameSaveId, (s) => s.jobs[jobId]?.state === "cancelled");
  const cart = state.transportMeans[fx.cartId]!;
  expect(cart.location.kind).toBe("world_point");
  const cartAt = cart.location.kind === "world_point" ? cart.location.point : fx.cartPoint;
  const legEnd = state.jobs[jobId]!.transport!.stagedStop?.point ?? null;
  // Ni vuelve a su origen ni aparece en el destino: queda a mitad del recorrido cargado, donde lo dejó su operadora.
  expect(dist(cartAt, fx.cartPoint)).toBeGreaterThan(5);
  expect(dist(cartAt, fx.bucketPoint)).toBeGreaterThan(5);
  if (legEnd) expect(dist(cartAt, legEnd)).toBeGreaterThan(5);
  const bundle = state.loadBundles[cart.currentLoadBundleId!]!;
  expect(bundle.state).toBe("deposited");
  expect(bundle.location).toEqual({ kind: "mounted_on_transport", transportId: fx.cartId });
  expect(state.worldObjects[fx.bucketId]!.location).toEqual({ kind: "in_load_bundle", loadBundleId: bundle.id });
  expect(Object.values(state.reservations).filter((r) => r.jobId === jobId)).toHaveLength(0);
  await expect(page.getByText("Se dejó un medio de transporte.").first()).toBeVisible();

  // Tras recargar, la interfaz muestra el cubo aún en la carga del carro, fuera de su origen.
  await page.goto(fx.villageUrl);
  await expect(page.getByRole("navigation", { name: "Protagonistas" }).getByRole("button")).toHaveCount(6, { timeout: 20_000 });
  await selectSecondPerson(page);
  const inventory = panel.getByRole("region", { name: "Inventario conocido" });
  await expect(inventory.getByRole("listitem").filter({ hasText: "Cubo" }).filter({ hasText: "En una carga" }).first()).toBeVisible({ timeout: 15_000 });
  const reloaded = await withPrisma(async (prisma) => (await loadGameV2(prisma, fx.gameSaveId)).state);
  expect(reloaded.transportMeans[fx.cartId]!.location).toEqual(cart.location);
});
