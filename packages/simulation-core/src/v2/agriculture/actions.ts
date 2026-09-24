import type { CropCycle, EntityLocation, Job, ResourceLot, SimulationStateV2, WorldObject } from "@z-world/contracts";
import { effectiveTerrainCoverage } from "@z-world/contracts";
import { CROP_PROFILES_BY_ID } from "@z-world/catalogs";
import { emit, withNextEventId, type Ctx } from "../jobs/engine-ctx.js";
import { resolveHolderPersonId } from "../objects/storage.js";
import { polygonArea } from "../generator/geometry-helpers.js";
import { PrngStream } from "../../prng.js";
import { sampleVariationD } from "../resolution/model-d.js";
import { terrainAreaOfTarget } from "../terrain/actions.js";
import { setPlotState } from "./plot-state.js";
import { valuesById } from "../ordered.js";

const AGRICULTURE_ACTION_KEYS = new Set(["prepare_soil", "sow", "tend_crop", "harvest"]);

export function isAgricultureAction(actionKey: string): boolean {
  return AGRICULTURE_ACTION_KEYS.has(actionKey);
}

const round2 = (value: number): number => Math.round(value * 100) / 100;
const round6 = (value: number): number => Math.round(value * 1_000_000) / 1_000_000;

function plotOfTarget(state: SimulationStateV2, job: Job) {
  if (job.target.kind !== "cultivation_plot") return null;
  return state.cultivationPlots[job.target.cultivationPlotId] ?? null;
}

function parcelAreaM2(state: SimulationStateV2, parcelId: string): number {
  const parcel = state.world.parcels[parcelId];
  return parcel ? polygonArea(parcel.polygon) : 0;
}

/** Lotes de un recurso al alcance de una parcela: los que lleva la ejecutora o los depositados en su borde (`field_edge`). Nunca un almacén remoto (SET-011 §3: "semillas localizadas"). */
function resourceLotsAtFieldEdge(state: SimulationStateV2, parcelId: string, executorId: string, family: string): ResourceLot[] {
  return valuesById(state.resourceLots)
    .filter((lot) => lot.family === family && lot.quantity > 0 && (lot.reservedByJobId === null || lot.reservedByJobId === undefined))
    .filter((lot) => {
      const holder = resolveHolderPersonId(state, lot.location);
      if (holder === executorId) return true;
      if (holder !== null) return false;
      return lot.location.kind === "field_edge" && lot.location.parcelId === parcelId;
    })
    .sort((a, b) => (a.id < b.id ? -1 : 1));
}

function toolAtFieldEdge(state: SimulationStateV2, parcelId: string, executorId: string, variant: string): WorldObject | null {
  const candidates = valuesById(state.worldObjects).filter((o) => o.variant === variant && (o.functionalState === "functional" || o.functionalState === "degraded"));
  for (const obj of candidates) {
    const holder = resolveHolderPersonId(state, obj.location);
    if (holder === executorId) return obj;
    if (holder === null && obj.location.kind === "field_edge" && obj.location.parcelId === parcelId) return obj;
  }
  return null;
}

/** Motivo causal por el que un método de agricultura no puede empezar ahora, o `null`. */
export function agricultureValidationReason(state: SimulationStateV2, job: Job, executorId: string): string | null {
  const plot = plotOfTarget(state, job);
  if (!plot) return "block.target_no_longer_exists";
  const parcel = state.world.parcels[plot.parcelId];
  const hostArea = terrainAreaOfTarget(state, job.target);

  switch (job.actionKey) {
    case "prepare_soil": {
      if (plot.state === "cleared" || plot.state === "harvested") return null;
      if (plot.state === "unprepared" && (!hostArea || effectiveTerrainCoverage(hostArea) === "none")) return null;
      if (plot.state === "unprepared") return "block.plot_not_cleared";
      return "block.plot_already_prepared";
    }
    case "sow": {
      if (plot.state !== "prepared") return plot.state === "sown" || plot.state === "growing" ? "block.plot_already_sown" : "block.plot_not_prepared";
      const crop = CROP_PROFILES_BY_ID.get(job.cropId ?? "garden_vegetables") ?? null;
      if (!crop) return "block.unknown_crop";
      if (!parcel) return "block.target_no_longer_exists";
      // Sembrar no exige semillas para el campo entero: la superficie realmente sembrada se deriva de lo que hay
      // disponible (§5.4 del prompt de subhito), nunca al revés. Solo bloquea si no hay ninguna semilla localizada.
      const availableSeeds = resourceLotsAtFieldEdge(state, plot.parcelId, executorId, crop.seedResourceFamily).reduce((sum, lot) => sum + lot.quantity, 0);
      if (availableSeeds <= 0) return "block.missing_seeds";
      if (!toolAtFieldEdge(state, plot.parcelId, executorId, crop.requiredToolVariant)) return "block.missing_tool";
      return null;
    }
    case "tend_crop": {
      if (plot.state !== "sown" && plot.state !== "growing") return "block.nothing_to_tend";
      return null;
    }
    case "harvest": {
      return plot.state === "harvestable" ? null : "block.plot_not_harvestable";
    }
    default:
      return null;
  }
}

/** Materiales/semillas que `sow` debe reservar en `prepare` (§5.4: "sembrar consume un lote de semillas localizado y reservado"). */
export function agriculturePrepare(ctx: Ctx, jobId: string, executorId: string): { readonly blockReasonKey: string | null } {
  const job = ctx.state.jobs[jobId];
  if (!job) return { blockReasonKey: null };
  if (job.actionKey !== "sow") return { blockReasonKey: null };
  const plot = plotOfTarget(ctx.state, job);
  if (!plot) return { blockReasonKey: "block.target_no_longer_exists" };
  const crop = CROP_PROFILES_BY_ID.get(job.cropId ?? "garden_vegetables");
  if (!crop) return { blockReasonKey: "block.unknown_crop" };
  // Reserva como máximo lo que exige el campo entero, nunca más de lo disponible (§5.4: la superficie sembrada se deriva
  // de las semillas efectivamente reservadas/consumidas, calculada en `agricultureApplyConsequences`).
  const areaM2 = parcelAreaM2(ctx.state, plot.parcelId);
  const fullFieldKg = round6(areaM2 * crop.seedKgPerM2);
  let remaining = fullFieldKg;
  let reservedAny = false;
  for (const lot of resourceLotsAtFieldEdge(ctx.state, plot.parcelId, executorId, crop.seedResourceFamily)) {
    if (remaining <= 0) break;
    if (lot.reservedByJobId && lot.reservedByJobId !== jobId) continue;
    ctx.state = { ...ctx.state, resourceLots: { ...ctx.state.resourceLots, [lot.id]: { ...lot, reservedByJobId: jobId } } };
    remaining -= lot.quantity;
    reservedAny = true;
  }
  if (!reservedAny) return { blockReasonKey: "block.missing_seeds" };
  return { blockReasonKey: null };
}

export function agricultureBlockerStillApplies(state: SimulationStateV2, job: Job, executorId: string): boolean {
  return agricultureValidationReason(state, job, executorId) !== null;
}

function newHarvestLot(ctx: Ctx, family: string, quantity: number, location: EntityLocation, provenance: string): string | null {
  if (quantity <= 0) return null;
  const lotId = `resource-lot-${ctx.state.sequences.nextEntityOrdinal}`;
  ctx.state = { ...ctx.state, sequences: { ...ctx.state.sequences, nextEntityOrdinal: ctx.state.sequences.nextEntityOrdinal + 1 } };
  const lot: ResourceLot = {
    id: lotId,
    family: family as ResourceLot["family"],
    quantity: round2(quantity),
    unit: "kilogram",
    location,
    condition: 0.9,
    reservedByJobId: null,
    qualityKnown: true,
    quality: 0.9,
    provenance,
    decayStartedAtSimSeconds: ctx.state.clock.elapsedSimSeconds,
    conditionAtDecayStart: 0.9,
  };
  ctx.state = { ...ctx.state, resourceLots: { ...ctx.state.resourceLots, [lotId]: lot } };
  return lotId;
}

/** Consume exactamente las semillas ya reservadas por el trabajo (§5.4: "consumo proporcional e idempotente"). */
function consumeReservedSeeds(ctx: Ctx, jobId: string, family: string, quantity: number): void {
  let remaining = quantity;
  for (const lot of valuesById(ctx.state.resourceLots).filter((l) => l.family === family && l.reservedByJobId === jobId)) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, lot.quantity);
    remaining = round6(remaining - take);
    const next = round6(lot.quantity - take);
    if (next <= 0) {
      const resourceLots = { ...ctx.state.resourceLots };
      delete resourceLots[lot.id];
      ctx.state = { ...ctx.state, resourceLots };
    } else {
      // Lo que sobra de la reserva (se pidió más de lo que exigía la superficie realmente sembrada) queda libre, nunca
      // atrapado bajo un trabajo ya terminado.
      ctx.state = { ...ctx.state, resourceLots: { ...ctx.state.resourceLots, [lot.id]: { ...lot, quantity: next, reservedByJobId: null } } };
    }
    const eventId = withNextEventId(ctx);
    emit(ctx, { type: "resource_lot_consumed", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, resourceLotId: lot.id, jobId, quantity: take });
  }
}

function nextCropCycleId(ctx: Ctx): string {
  return `crop-cycle-s${ctx.state.sequences.nextDomainEventSequence}`;
}

/** Aplica la consecuencia persistente de un método de agricultura terminado. */
export function agricultureApplyConsequences(ctx: Ctx, job: Job, executorId: string): string | null {
  const now = ctx.state.clock.elapsedSimSeconds;
  const plot = plotOfTarget(ctx.state, job);
  if (!plot) return "block.target_no_longer_exists";

  switch (job.actionKey) {
    case "prepare_soil": {
      setPlotState(ctx, plot.id, "prepared");
      ctx.state = { ...ctx.state, cultivationPlots: { ...ctx.state.cultivationPlots, [plot.id]: { ...ctx.state.cultivationPlots[plot.id]!, preparationProgress: 1 } } };
      return null;
    }
    case "sow": {
      const crop = CROP_PROFILES_BY_ID.get(job.cropId ?? "garden_vegetables");
      if (!crop) return "block.unknown_crop";
      const fullAreaM2 = parcelAreaM2(ctx.state, plot.parcelId);
      // La superficie realmente sembrada se deriva de las semillas ya reservadas en `prepare` (§5.4), nunca al revés:
      // sembrar con menos semillas de las que exige el campo entero siembra menos superficie, nunca bloquea el trabajo.
      const reservedKg = round6(valuesById(ctx.state.resourceLots).filter((l) => l.family === crop.seedResourceFamily && l.reservedByJobId === job.id).reduce((sum, l) => sum + l.quantity, 0));
      const fullFieldKg = round6(fullAreaM2 * crop.seedKgPerM2);
      const consumedKg = Math.min(reservedKg, fullFieldKg);
      const sownAreaM2 = Math.min(fullAreaM2, round6(consumedKg / crop.seedKgPerM2));
      consumeReservedSeeds(ctx, job.id, crop.seedResourceFamily, consumedKg);
      const cycleId = nextCropCycleId(ctx);
      const cycle: CropCycle = {
        id: cycleId,
        cultivationPlotId: plot.id,
        cropId: crop.id,
        sownAtSimSeconds: now,
        harvestableAtSimSeconds: now + crop.growthSimSeconds,
        cared: false,
        sownAreaM2,
        seedsSownKg: consumedKg,
        careEvents: [],
        lastCaredAtSimSeconds: null,
        harvestedAtSimSeconds: null,
      };
      ctx.state = { ...ctx.state, cropCycles: { ...ctx.state.cropCycles, [cycleId]: cycle } };
      ctx.state = { ...ctx.state, cultivationPlots: { ...ctx.state.cultivationPlots, [plot.id]: { ...ctx.state.cultivationPlots[plot.id]!, activeCropCycleId: cycleId, damageLevel: 0 } } };
      setPlotState(ctx, plot.id, "growing");
      const eventId = withNextEventId(ctx);
      emit(ctx, { type: "crop_sown", eventId, simSeconds: now, causedByCommandId: null, cultivationPlotId: plot.id, cropCycleId: cycleId, cropId: crop.id, sownAreaM2, jobId: job.id });
      return null;
    }
    case "tend_crop": {
      const cycle = plot.activeCropCycleId ? ctx.state.cropCycles[plot.activeCropCycleId] : null;
      if (!cycle) return "block.nothing_to_tend";
      const crop = CROP_PROFILES_BY_ID.get(cycle.cropId);
      let sufficient = true;
      if (crop?.needsWater) {
        const waterLots = resourceLotsAtFieldEdge(ctx.state, plot.parcelId, executorId, "water");
        const needed = 5;
        let remaining = needed;
        for (const lot of waterLots) {
          if (remaining <= 0) break;
          const take = Math.min(remaining, lot.quantity);
          const next = round2(lot.quantity - take);
          if (next <= 0) {
            const resourceLots = { ...ctx.state.resourceLots };
            delete resourceLots[lot.id];
            ctx.state = { ...ctx.state, resourceLots };
          } else {
            ctx.state = { ...ctx.state, resourceLots: { ...ctx.state.resourceLots, [lot.id]: { ...lot, quantity: next } } };
          }
          remaining -= take;
        }
        sufficient = remaining <= 0;
      }
      const updatedCycle: CropCycle = { ...cycle, cared: cycle.cared || sufficient, careEvents: [...cycle.careEvents, { atSimSeconds: now, sufficient }], lastCaredAtSimSeconds: now };
      ctx.state = { ...ctx.state, cropCycles: { ...ctx.state.cropCycles, [cycle.id]: updatedCycle } };
      const eventId = withNextEventId(ctx);
      emit(ctx, { type: "crop_tended", eventId, simSeconds: now, causedByCommandId: null, cultivationPlotId: plot.id, cropCycleId: cycle.id, sufficient, jobId: job.id });
      return null;
    }
    case "harvest": {
      const cycle = plot.activeCropCycleId ? ctx.state.cropCycles[plot.activeCropCycleId] : null;
      if (!cycle) return "block.nothing_to_tend";
      const crop = CROP_PROFILES_BY_ID.get(cycle.cropId);
      if (!crop) return "block.unknown_crop";
      const executor = ctx.state.people[executorId];
      const skill = executor?.public.skills.agriculture ?? 0;
      const capacityFactor = 0.7 + Math.min(1, skill / 10) * 0.3;
      const careRatio = cycle.careEvents.length === 0 ? 0.7 : cycle.careEvents.filter((e) => e.sufficient).length / cycle.careEvents.length;
      const damagePenalty = 1 - plot.damageLevel;
      const stream = new PrngStream(ctx.state.prng.resolution);
      const variation = sampleVariationD(stream);
      ctx.state = { ...ctx.state, prng: { ...ctx.state.prng, resolution: stream.snapshot() } };
      const baseYield = crop.baseYieldKgPerM2 * cycle.sownAreaM2;
      const yieldKg = Math.max(0, round2(baseYield * capacityFactor * (0.5 + 0.5 * careRatio) * damagePenalty * (1 + variation)));
      const location = { kind: "field_edge" as const, parcelId: plot.parcelId };
      const lotId = newHarvestLot(ctx, crop.harvestResourceFamily, yieldKg, location, `harvest:${cycle.id}`);
      const finishedCycle: CropCycle = { ...cycle, harvestedAtSimSeconds: now };
      ctx.state = { ...ctx.state, cropCycles: { ...ctx.state.cropCycles, [cycle.id]: finishedCycle } };
      ctx.state = { ...ctx.state, cultivationPlots: { ...ctx.state.cultivationPlots, [plot.id]: { ...ctx.state.cultivationPlots[plot.id]!, activeCropCycleId: null } } };
      setPlotState(ctx, plot.id, "harvested");
      const eventId = withNextEventId(ctx);
      emit(ctx, {
        type: "crop_harvested",
        eventId,
        simSeconds: now,
        causedByCommandId: null,
        cultivationPlotId: plot.id,
        cropCycleId: cycle.id,
        producedResourceLotId: lotId,
        yieldKg,
        jobId: job.id,
        breakdown: { baseYield: round2(baseYield), capacityFactor: round2(capacityFactor), careRatio: round2(careRatio), damagePenalty: round2(damagePenalty), variation: round2(variation) },
      });
      return null;
    }
    default:
      return null;
  }
}
