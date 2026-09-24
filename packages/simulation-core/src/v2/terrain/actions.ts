import type { BarrierSegment, EntityLocation, Job, JobTarget, ResourceFamily, ResourceLot, SimulationStateV2, TerrainArea } from "@z-world/contracts";
import { effectiveTerrainCoverage } from "@z-world/contracts";
import { TERRAIN_ACTION_KEYS, TERRAIN_TRANSFORM_TUNING } from "@z-world/catalogs";
import { emit, withNextEventId, type Ctx } from "../jobs/engine-ctx.js";
import { resolveTargetLocation } from "../jobs/location-utils.js";
import { polygonArea, distance } from "../generator/geometry-helpers.js";
import { buildFullNavigationIndexV2 } from "../room-graph.js";
import { derivePerimeterNetworks } from "./perimeter.js";
import { valuesById } from "../ordered.js";
import { setPlotState } from "../agriculture/plot-state.js";
import { resolveHolderPersonId, locationWorldPoint } from "../objects/storage.js";
import { resolveRoomId } from "../jobs/location-utils.js";
import { reserveResourceLot } from "../jobs/reservations.js";

/** Métodos S10 de entorno mutable (limpieza, carretera, barrera) — no incluye los de agricultura, ver `agriculture/actions.ts`. */
const ENVIRONMENT_ACTION_KEYS = new Set(["clear_vegetation", "clear_debris", "clear_road", "remove_way_function", "build_barrier"]);

export function isTerrainAction(actionKey: string): boolean {
  return TERRAIN_ACTION_KEYS.has(actionKey);
}

export function isEnvironmentAction(actionKey: string): boolean {
  return ENVIRONMENT_ACTION_KEYS.has(actionKey);
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

/** Trabajo (minutos) de un método de entorno según la superficie/longitud real del blanco (§4.1 del prompt: "unidad de progreso y duración"). */
export function terrainWorkUnits(state: SimulationStateV2, actionKey: string, target: JobTarget): number | null {
  switch (actionKey) {
    case "clear_vegetation":
    case "clear_debris": {
      const area = terrainAreaOfTarget(state, target);
      if (!area) return null;
      const m2 = polygonArea(area.polygon);
      const perM2 = actionKey === "clear_vegetation" ? TERRAIN_TRANSFORM_TUNING.clearVegetation.minutesPerM2 : TERRAIN_TRANSFORM_TUNING.clearDebris.minutesPerM2;
      return Math.max(5, Math.round(m2 * perM2));
    }
    case "clear_road":
    case "remove_way_function": {
      if (target.kind !== "linear_feature") return null;
      const line = state.world.linearFeatures[target.linearFeatureId];
      if (!line) return null;
      const meters = polylineLength(line.polyline);
      const perMeter = actionKey === "clear_road" ? TERRAIN_TRANSFORM_TUNING.clearRoad.minutesPerMeter : TERRAIN_TRANSFORM_TUNING.removeWayFunction.minutesPerMeter;
      return Math.max(5, Math.round(meters * perMeter));
    }
    case "build_barrier": {
      if (target.kind !== "barrier_segment") return null;
      const segment = state.world.barrierSegments[target.barrierSegmentId];
      if (!segment) return null;
      const from = state.world.anchors[segment.fromAnchorId];
      const to = state.world.anchors[segment.toAnchorId];
      if (!from || !to) return null;
      return Math.max(10, Math.round(distance(from.position, to.position) * TERRAIN_TRANSFORM_TUNING.buildBarrier.minutesPerMeter));
    }
    default:
      return null;
  }
}

function polylineLength(polyline: readonly { x: number; y: number }[]): number {
  let total = 0;
  for (let i = 1; i < polyline.length; i++) total += distance(polyline[i - 1]!, polyline[i]!);
  return total;
}

/** `TerrainArea` física real detrás de un blanco `terrain_area` o `cultivation_plot` (vía su `Parcel.terrainAreaId`). */
export function terrainAreaOfTarget(state: SimulationStateV2, target: JobTarget): TerrainArea | null {
  if (target.kind === "terrain_area") return state.world.terrainAreas[target.terrainAreaId] ?? null;
  if (target.kind === "cultivation_plot") {
    const plot = state.cultivationPlots[target.cultivationPlotId];
    const parcel = plot ? state.world.parcels[plot.parcelId] : undefined;
    return parcel?.terrainAreaId ? (state.world.terrainAreas[parcel.terrainAreaId] ?? null) : null;
  }
  return null;
}

/** Motivo causal por el que un método de entorno no puede empezar ahora, o `null` (§4.1: "razones estructuradas"). */
export function terrainValidationReason(state: SimulationStateV2, job: Job): string | null {
  const target = job.target;
  switch (job.actionKey) {
    case "clear_vegetation":
    case "clear_debris": {
      const area = terrainAreaOfTarget(state, target);
      if (!area) return "block.target_no_longer_exists";
      const coverage = effectiveTerrainCoverage(area);
      if (coverage === "none") return "block.nothing_to_clear";
      const wantsVegetation = job.actionKey === "clear_vegetation";
      if (wantsVegetation && coverage !== "vegetation") return "block.wrong_coverage_kind";
      if (!wantsVegetation && coverage !== "debris") return "block.wrong_coverage_kind";
      return null;
    }
    case "clear_road": {
      if (target.kind !== "linear_feature") return "block.target_no_longer_exists";
      const line = state.world.linearFeatures[target.linearFeatureId];
      if (!line) return "block.target_no_longer_exists";
      return line.wayState === "obstructed" ? null : "block.way_not_obstructed";
    }
    case "remove_way_function": {
      if (target.kind !== "linear_feature") return "block.target_no_longer_exists";
      const line = state.world.linearFeatures[target.linearFeatureId];
      if (!line) return "block.target_no_longer_exists";
      if (!job.irreversibleConfirmed) return "block.irreversible_not_confirmed";
      return line.wayState === "function_removed" ? "block.way_function_already_removed" : null;
    }
    case "build_barrier": {
      if (target.kind !== "barrier_segment") return "block.target_no_longer_exists";
      const segment = state.world.barrierSegments[target.barrierSegmentId];
      if (!segment) return "block.target_no_longer_exists";
      if (segment.built) return "block.barrier_already_built";
      if (segment.crossesWayId && !segment.wayCrossingMode) return "block.way_crossing_mode_required";
      return null;
    }
    default:
      return null;
  }
}

/** Materiales concretos que debe reservar `build_barrier` antes de ejecutar (§4.1: "herramientas y materiales"). */
export function terrainMaterialsFor(job: Job) {
  if (job.actionKey !== "build_barrier") return [];
  return TERRAIN_TRANSFORM_TUNING.buildBarrier.materialsPerMeter;
}

export function terrainBlockerStillApplies(state: SimulationStateV2, job: Job): boolean {
  return terrainValidationReason(state, job) !== null;
}

const MATERIAL_REACH_METERS = 6;

function materialLotsInReach(state: SimulationStateV2, location: EntityLocation, executorId: string, family: ResourceFamily): ResourceLot[] {
  const siteRoom = resolveRoomId(state, location);
  const sitePoint = siteRoom ? null : locationWorldPoint(state, location);
  return valuesById(state.resourceLots)
    .filter((lot) => lot.family === family && lot.quantity > 0 && (lot.reservedByJobId === null || lot.reservedByJobId === undefined))
    .filter((lot) => {
      const holder = resolveHolderPersonId(state, lot.location);
      if (holder === executorId) return true;
      if (holder !== null) return false;
      const lotRoom = resolveRoomId(state, lot.location);
      if (siteRoom) return lotRoom === siteRoom;
      if (lotRoom !== null || !sitePoint) return false;
      const point = locationWorldPoint(state, lot.location);
      return point !== null && distance(point, sitePoint) <= MATERIAL_REACH_METERS;
    });
}

/** Fase `prepare` de `build_barrier` (§4.1: "reservas necesarias"): reserva la madera concreta que se consumirá al terminar, sin moverla todavía. */
export function terrainPrepare(ctx: Ctx, jobId: string, executorId: string): { readonly blockReasonKey: string | null } {
  const job = ctx.state.jobs[jobId];
  if (!job || job.actionKey !== "build_barrier") return { blockReasonKey: null };
  const requirements = terrainMaterialsFor(job);
  if (requirements.length === 0) return { blockReasonKey: null };
  const location = resolveTargetLocation(ctx.state, job.target);
  if (!location) return { blockReasonKey: "block.target_no_longer_exists" };
  const segment = job.target.kind === "barrier_segment" ? ctx.state.world.barrierSegments[job.target.barrierSegmentId] : undefined;
  const from = segment ? ctx.state.world.anchors[segment.fromAnchorId] : undefined;
  const to = segment ? ctx.state.world.anchors[segment.toAnchorId] : undefined;
  const meters = from && to ? distance(from.position, to.position) : 1;
  for (const requirement of requirements) {
    let remaining = requirement.quantity * meters;
    for (const lot of materialLotsInReach(ctx.state, location, executorId, requirement.resourceFamily)) {
      if (remaining <= 0) break;
      const reserved = reserveResourceLot(ctx.state, ctx.state.jobs[jobId]!, lot.id, "prepare");
      if (!reserved) continue;
      ctx.state = reserved.state;
      ctx.events.push(...reserved.events);
      ctx.state = { ...ctx.state, jobs: { ...ctx.state.jobs, [jobId]: { ...ctx.state.jobs[jobId]!, reservationIds: [...ctx.state.jobs[jobId]!.reservationIds, reserved.reservation.id] } } };
      remaining -= lot.quantity;
    }
    if (remaining > 1e-6) return { blockReasonKey: "block.missing_materials" };
  }
  return { blockReasonKey: null };
}

function newResourceLot(ctx: Ctx, family: ResourceFamily, quantity: number, location: EntityLocation, provenance: string): string | null {
  if (quantity <= 0) return null;
  const lotId = `resource-lot-${ctx.state.sequences.nextEntityOrdinal}`;
  ctx.state = { ...ctx.state, sequences: { ...ctx.state.sequences, nextEntityOrdinal: ctx.state.sequences.nextEntityOrdinal + 1 } };
  const lot: ResourceLot = {
    id: lotId,
    family,
    quantity: round2(quantity),
    unit: "kilogram",
    location,
    condition: 0.6,
    reservedByJobId: null,
    qualityKnown: true,
    quality: 0.6,
    provenance,
    decayStartedAtSimSeconds: null,
    conditionAtDecayStart: null,
  };
  ctx.state = { ...ctx.state, resourceLots: { ...ctx.state.resourceLots, [lotId]: lot } };
  return lotId;
}

function nextTerrainChangeId(ctx: Ctx): string {
  return `terrain-change-s${ctx.state.sequences.nextDomainEventSequence}`;
}

/** Reconstruye la navegación entera tras un cambio de terreno/vía/barrera (S10: invalidación dirigida completa pendiente, ver `DEC-0020` §10 — el mundo es pequeño y esto no ocurre por tick). */
function refreshNavigationAfterTerrainChange(ctx: Ctx): void {
  ctx.state = { ...ctx.state, world: { ...ctx.state.world, navigationRevision: { global: (ctx.state.world.navigationRevision?.global ?? 0) + 1, byBuilding: ctx.state.world.navigationRevision?.byBuilding ?? {} } } };
  ctx.nav = buildFullNavigationIndexV2(ctx.state.world);
}

/** Aplica la consecuencia persistente de un método de entorno terminado. Devuelve un motivo de bloqueo si el mundo cambió entretanto. */
export function terrainApplyConsequences(ctx: Ctx, job: Job): string | null {
  const target = job.target;
  const now = ctx.state.clock.elapsedSimSeconds;

  switch (job.actionKey) {
    case "clear_vegetation":
    case "clear_debris": {
      const area = terrainAreaOfTarget(ctx.state, target);
      if (!area) return "block.target_no_longer_exists";
      const coverage = effectiveTerrainCoverage(area);
      if (coverage === "none") return "block.nothing_to_clear";
      const location = resolveTargetLocation(ctx.state, target) ?? { kind: "world_point" as const, point: ctx.state.world.arrivalPoint };
      const m2 = polygonArea(area.polygon);
      const produced: string[] = [];
      if (coverage === "vegetation") {
        const lotId = newResourceLot(ctx, "wood_and_planks", m2 * TERRAIN_TRANSFORM_TUNING.clearVegetation.woodKgPerM2, location, `cleared_vegetation:${area.id}`);
        if (lotId) produced.push(lotId);
      } else {
        const lotId = newResourceLot(ctx, "rubble", m2 * TERRAIN_TRANSFORM_TUNING.clearDebris.rubbleKgPerM2, location, `cleared_debris:${area.id}`);
        if (lotId) produced.push(lotId);
      }
      putTerrainArea(ctx, { ...area, coverage: "none", traversalCostMultiplier: area.kind === "dense_vegetation" ? 1 : area.traversalCostMultiplier });
      recordTerrainChange(ctx, job, area.id, coverage === "vegetation" ? "cleared_vegetation" : "cleared_debris", produced);
      const clearEventId = withNextEventId(ctx);
      emit(ctx, { type: "terrain_coverage_cleared", eventId: clearEventId, simSeconds: now, causedByCommandId: null, terrainAreaId: area.id, jobId: job.id, producedResourceLotIds: produced });
      // S10: al despejar la parcela de cultivo enlazada (si la hay), la máquina de estados avanza de `unprepared` a `cleared`.
      if (target.kind === "cultivation_plot") {
        const plot = ctx.state.cultivationPlots[target.cultivationPlotId];
        if (plot && plot.state === "unprepared") setPlotState(ctx, plot.id, "cleared");
      }
      refreshNavigationAfterTerrainChange(ctx);
      return null;
    }
    case "clear_road": {
      if (target.kind !== "linear_feature") return "block.target_no_longer_exists";
      const line = ctx.state.world.linearFeatures[target.linearFeatureId];
      if (!line || line.wayState !== "obstructed") return "block.way_not_obstructed";
      ctx.state = { ...ctx.state, world: { ...ctx.state.world, linearFeatures: { ...ctx.state.world.linearFeatures, [line.id]: { ...line, wayState: "cleared" } } } };
      recordTerrainChange(ctx, job, line.id, "cleared_road", []);
      const eventId = withNextEventId(ctx);
      emit(ctx, { type: "way_state_changed", eventId, simSeconds: now, causedByCommandId: null, linearFeatureId: line.id, wayState: "cleared", jobId: job.id });
      refreshNavigationAfterTerrainChange(ctx);
      return null;
    }
    case "remove_way_function": {
      if (target.kind !== "linear_feature") return "block.target_no_longer_exists";
      const line = ctx.state.world.linearFeatures[target.linearFeatureId];
      if (!line) return "block.target_no_longer_exists";
      ctx.state = { ...ctx.state, world: { ...ctx.state.world, linearFeatures: { ...ctx.state.world.linearFeatures, [line.id]: { ...line, wayState: "function_removed" } } } };
      recordTerrainChange(ctx, job, line.id, "way_function_removed", []);
      const eventId = withNextEventId(ctx);
      emit(ctx, { type: "way_state_changed", eventId, simSeconds: now, causedByCommandId: null, linearFeatureId: line.id, wayState: "function_removed", jobId: job.id });
      refreshNavigationAfterTerrainChange(ctx);
      return null;
    }
    case "build_barrier": {
      if (target.kind !== "barrier_segment") return "block.target_no_longer_exists";
      const segment = ctx.state.world.barrierSegments[target.barrierSegmentId];
      if (!segment || segment.built) return "block.barrier_already_built";
      const requirements = terrainMaterialsFor(job);
      const from = ctx.state.world.anchors[segment.fromAnchorId];
      const to = ctx.state.world.anchors[segment.toAnchorId];
      const meters = from && to ? distance(from.position, to.position) : 1;
      for (const requirement of requirements) consumeReservedMaterial(ctx, job.id, requirement.resourceFamily, requirement.quantity * meters);
      const built: BarrierSegment = { ...segment, built: true };
      ctx.state = { ...ctx.state, world: { ...ctx.state.world, barrierSegments: { ...ctx.state.world.barrierSegments, [segment.id]: built } } };
      recomputePerimeterNetworks(ctx);
      recordTerrainChange(ctx, job, segment.id, "barrier_built", []);
      const eventId = withNextEventId(ctx);
      emit(ctx, { type: "barrier_segment_built", eventId, simSeconds: now, causedByCommandId: null, barrierSegmentId: segment.id, jobId: job.id });
      refreshNavigationAfterTerrainChange(ctx);
      return null;
    }
    default:
      return null;
  }
}

function putTerrainArea(ctx: Ctx, area: TerrainArea): void {
  ctx.state = { ...ctx.state, world: { ...ctx.state.world, terrainAreas: { ...ctx.state.world.terrainAreas, [area.id]: area } } };
}

function recordTerrainChange(ctx: Ctx, job: Job, targetId: string, kind: "cleared_vegetation" | "cleared_debris" | "cleared_road" | "way_function_removed" | "barrier_built", producedResourceLotIds: readonly string[]): void {
  const id = nextTerrainChangeId(ctx);
  ctx.state = {
    ...ctx.state,
    terrainChanges: {
      ...ctx.state.terrainChanges,
      [id]: { id, kind, targetAreaOrLineId: targetId, appliedAtSimSeconds: ctx.state.clock.elapsedSimSeconds, producedResourceLotIds, createdByJobId: job.id },
    },
  };
}

/** Consume una cantidad reservada por el trabajo de una familia concreta, de los lotes que ya tiene comprometidos (`prepare`). */
function consumeReservedMaterial(ctx: Ctx, jobId: string, family: ResourceFamily, quantity: number): void {
  let remaining = quantity;
  for (const lot of valuesById(ctx.state.resourceLots).filter((l) => l.family === family && l.reservedByJobId === jobId)) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, lot.quantity);
    remaining = round2(remaining - take);
    const next = round2(lot.quantity - take);
    if (next <= 0) {
      const resourceLots = { ...ctx.state.resourceLots };
      delete resourceLots[lot.id];
      ctx.state = { ...ctx.state, resourceLots };
    } else {
      ctx.state = { ...ctx.state, resourceLots: { ...ctx.state.resourceLots, [lot.id]: { ...lot, quantity: next } } };
    }
    const eventId = withNextEventId(ctx);
    emit(ctx, { type: "resource_lot_consumed", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, resourceLotId: lot.id, jobId, quantity: take });
  }
}

export function recomputePerimeterNetworks(ctx: Ctx): void {
  ctx.state = { ...ctx.state, world: { ...ctx.state.world, perimeterNetworks: derivePerimeterNetworks(ctx.state.world) } };
}
