import type { Anchor, BarrierSegment, DomainEventV2, JobTarget, Parcel, SimulationStateV2, WorldPoint } from "@z-world/contracts";
import { effectiveTerrainCoverage } from "@z-world/contracts";
import { ACTION_METHODS_BY_KEY } from "@z-world/catalogs";
import { createJob } from "../jobs/job-factory.js";
import { valuesById } from "../ordered.js";
import { centroidOf, distance } from "../generator/geometry-helpers.js";
import { evaluateCultivationSuitability, findHostTerrainArea } from "./suitability.js";

function pointInPolygon(point: WorldPoint, polygon: readonly WorldPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i]!;
    const pj = polygon[j]!;
    const intersects = pi.y > point.y !== pj.y > point.y && point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

export interface DesignationJobsResult {
  readonly state: SimulationStateV2;
  readonly events: readonly DomainEventV2[];
  readonly generatedJobIds: readonly string[];
}

function createDesignationJob(state: SimulationStateV2, actionKey: string, target: JobTarget, designationId: string): { state: SimulationStateV2; events: DomainEventV2[]; jobId: string } | null {
  const def = ACTION_METHODS_BY_KEY.get(actionKey);
  if (!def) return null;
  const created = createJob(state, { actionKey, def, target, origin: "designation", causingCommandOrDesignationId: designationId, directOrder: false, requestedPersonIds: [], urgency: 2 });
  if ("rejectedReasonKey" in created) return null;
  return { state: { ...state, sequences: created.sequences, jobs: { ...state.jobs, [created.job.id]: created.job } }, events: [...created.events], jobId: created.job.id };
}

/**
 * Genera los trabajos de una designación de entorno mutable/agricultura de
 * S10 (`clear_area`, `cut_vegetation`, `prepare_soil`, `harvest`,
 * `build_barrier`). Igual que `systematic_recon` (S5): produce trabajos
 * discretos y auditables por el planificador existente, nunca una mutación
 * instantánea al confirmar el dibujo (§11.4/§6.2 del prompt de subhito).
 */
export function generateTerrainDesignationJobs(
  state: SimulationStateV2,
  designationId: string,
  kind: "clear_area" | "cut_vegetation" | "prepare_soil" | "harvest" | "build_barrier",
  polygon: readonly WorldPoint[],
  wayCrossingMode: "full_block" | "pedestrian_gap" | "handcart_gate" | undefined,
): DesignationJobsResult {
  let nextState = state;
  const events: DomainEventV2[] = [];
  const generatedJobIds: string[] = [];

  if (kind === "clear_area" || kind === "cut_vegetation") {
    for (const area of valuesById(state.world.terrainAreas)) {
      const coverage = effectiveTerrainCoverage(area);
      if (coverage === "none") continue;
      if (kind === "cut_vegetation" && coverage !== "vegetation") continue;
      if (!pointInPolygon(centroidOf(area.polygon), polygon)) continue;
      const actionKey = coverage === "vegetation" ? "clear_vegetation" : "clear_debris";
      const result = createDesignationJob(nextState, actionKey, { kind: "terrain_area", terrainAreaId: area.id }, designationId);
      if (!result) continue;
      nextState = result.state;
      events.push(...result.events);
      generatedJobIds.push(result.jobId);
    }
  } else if (kind === "prepare_soil") {
    const suitability = evaluateCultivationSuitability(nextState, polygon);
    if (suitability.verdict === "valid" || suitability.verdict === "valid_with_limitations") {
      const host = findHostTerrainArea(nextState, polygon);
      if (host) {
        const existingParcel = valuesById(nextState.world.parcels).find((p) => p.terrainAreaId === host.id);
        let parcel: Parcel;
        if (existingParcel) {
          parcel = existingParcel;
        } else {
          const parcelId = `parcel-s${nextState.sequences.nextDomainEventSequence}`;
          parcel = { id: parcelId, polygon: host.polygon, cultivationPlotId: null, terrainAreaId: host.id };
          nextState = { ...nextState, world: { ...nextState.world, parcels: { ...nextState.world.parcels, [parcelId]: parcel } } };
        }
        let plot = parcel.cultivationPlotId ? nextState.cultivationPlots[parcel.cultivationPlotId] : undefined;
        if (!plot) {
          const plotId = `cultivation-plot-s${nextState.sequences.nextDomainEventSequence}`;
          plot = { id: plotId, parcelId: parcel.id, state: "unprepared", activeCropCycleId: null, preparationProgress: 0, damageLevel: 0 };
          nextState = {
            ...nextState,
            cultivationPlots: { ...nextState.cultivationPlots, [plotId]: plot },
            world: { ...nextState.world, parcels: { ...nextState.world.parcels, [parcel.id]: { ...parcel, cultivationPlotId: plotId } } },
          };
        }
        if (plot.state === "cleared" || plot.state === "harvested" || (plot.state === "unprepared" && effectiveTerrainCoverage(host) === "none")) {
          const result = createDesignationJob(nextState, "prepare_soil", { kind: "cultivation_plot", cultivationPlotId: plot.id }, designationId);
          if (result) {
            nextState = result.state;
            events.push(...result.events);
            generatedJobIds.push(result.jobId);
          }
        }
      }
    }
  } else if (kind === "harvest") {
    for (const plot of valuesById(nextState.cultivationPlots)) {
      if (plot.state !== "harvestable") continue;
      const parcel = nextState.world.parcels[plot.parcelId];
      if (!parcel || !pointInPolygon(centroidOf(parcel.polygon), polygon)) continue;
      const result = createDesignationJob(nextState, "harvest", { kind: "cultivation_plot", cultivationPlotId: plot.id }, designationId);
      if (!result) continue;
      nextState = result.state;
      events.push(...result.events);
      generatedJobIds.push(result.jobId);
    }
  } else if (kind === "build_barrier" && polygon.length >= 2) {
    const segment = resolveOrCreateBarrierSegment(nextState, polygon[0]!, polygon[polygon.length - 1]!, wayCrossingMode);
    if (segment) {
      nextState = segment.state;
      const result = createDesignationJob(nextState, "build_barrier", { kind: "barrier_segment", barrierSegmentId: segment.segment.id }, designationId);
      if (result) {
        nextState = result.state;
        events.push(...result.events);
        generatedJobIds.push(result.jobId);
      }
    }
  }

  return { state: nextState, events, generatedJobIds };
}

const ANCHOR_SNAP_TOLERANCE_METERS = 3;

function nearestAnchor(state: SimulationStateV2, point: WorldPoint): Anchor | null {
  let best: Anchor | null = null;
  let bestDistance = ANCHOR_SNAP_TOLERANCE_METERS;
  for (const anchor of valuesById(state.world.anchors)) {
    const d = distance(anchor.position, point);
    if (d <= bestDistance) {
      best = anchor;
      bestDistance = d;
    }
  }
  return best;
}

function segmentIntersection(a: WorldPoint, b: WorldPoint, polyline: readonly WorldPoint[]): WorldPoint | null {
  for (let i = 1; i < polyline.length; i++) {
    const c = polyline[i - 1]!;
    const d = polyline[i]!;
    const denom = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
    if (Math.abs(denom) < 1e-9) continue;
    const t = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / denom;
    const u = ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / denom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
  }
  return null;
}

/**
 * Resuelve el trazado de una barrera entre dos puntos a sus anclajes reales
 * (WLD-010 §3.6: "anclaje puede ser..."), `null` si alguno no cae cerca de
 * un anclaje válido (el jugador debe corregir el trazado; nunca se crea un
 * anclaje nuevo implícito). Detecta el cruce con una vía real y exige el
 * modo de paso cuando cruza (§3.6: "debe resolverse explícitamente").
 */
function resolveOrCreateBarrierSegment(
  state: SimulationStateV2,
  fromPoint: WorldPoint,
  toPoint: WorldPoint,
  wayCrossingMode: "full_block" | "pedestrian_gap" | "handcart_gate" | undefined,
): { readonly state: SimulationStateV2; readonly segment: BarrierSegment } | null {
  const from = nearestAnchor(state, fromPoint);
  const to = nearestAnchor(state, toPoint);
  if (!from || !to || from.id === to.id) return null;
  const crossing = valuesById(state.world.linearFeatures).find((line) => line.kind === "road" && segmentIntersection(from.position, to.position, line.polyline) !== null);
  if (crossing && !wayCrossingMode) return null;
  const existing = valuesById(state.world.barrierSegments).find(
    (s) => (s.fromAnchorId === from.id && s.toAnchorId === to.id) || (s.fromAnchorId === to.id && s.toAnchorId === from.id),
  );
  if (existing) return existing.built ? null : { state, segment: existing };
  const id = `barrier-segment-s${state.sequences.nextDomainEventSequence}`;
  const segment: BarrierSegment = { id, fromAnchorId: from.id, toAnchorId: to.id, crossesWayId: crossing?.id ?? null, wayCrossingMode: crossing ? (wayCrossingMode ?? null) : null, built: false, createdByJobId: null };
  return { state: { ...state, world: { ...state.world, barrierSegments: { ...state.world.barrierSegments, [id]: segment } } }, segment };
}
