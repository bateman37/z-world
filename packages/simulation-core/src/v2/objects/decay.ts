import type { DomainEventV2, FreshnessBand, ResourceLot, SimulationStateV2 } from "@z-world/contracts";
import { DECAY_TUNING_BY_FAMILY, type DecayTuning } from "@z-world/catalogs";
import { nextEventId } from "../../sequences.js";

/**
 * Deterioro determinista del alimento fresco (S7, WEB-002 §6.6). La
 * fórmula y su justificación viven en `packages/catalogs/src/decay-tuning.ts`:
 * la condición es una función cerrada del instante simulado absoluto
 * (`decayStartedAtSimSeconds`, `conditionAtDecayStart`), nunca una resta
 * acumulada por tick, así que no depende de la velocidad, del tamaño del
 * paso ni de cuántas veces se recalcule.
 */

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export function decayedCondition(tuning: DecayTuning, conditionAtDecayStart: number, decayStartedAtSimSeconds: number, nowSimSeconds: number): number {
  const elapsedHours = Math.max(0, nowSimSeconds - decayStartedAtSimSeconds) / 3600;
  return round4(Math.max(0, conditionAtDecayStart * (1 - elapsedHours / tuning.shelfLifeSimHours)));
}

/** Banda cualitativa de conservación de un lote perecedero, o `null` si la familia no se deteriora en este recorte. */
export function freshnessBandFor(lot: Pick<ResourceLot, "family" | "condition">): FreshnessBand | null {
  const tuning = DECAY_TUNING_BY_FAMILY.get(lot.family);
  if (!tuning) return null;
  if (lot.condition < tuning.spoiledBelowCondition) return "spoiled";
  if (lot.condition < tuning.deterioratingBelowCondition) return "deteriorating";
  return "fresh";
}

/** Un alimento echado a perder nunca aparece como consumible (§6.6). */
export function isLotSpoiled(lot: Pick<ResourceLot, "family" | "condition">): boolean {
  return freshnessBandFor(lot) === "spoiled";
}

/** Instante simulado aproximado en que el lote cruzará el umbral de «echado a perder», o `null` si no aplica o ya lo cruzó. Derivado del tuning público, no de información oculta. */
export function spoilsAtSimSeconds(lot: Pick<ResourceLot, "family" | "condition" | "conditionAtDecayStart" | "decayStartedAtSimSeconds">): number | null {
  const tuning = DECAY_TUNING_BY_FAMILY.get(lot.family);
  if (!tuning || lot.conditionAtDecayStart === null || lot.decayStartedAtSimSeconds === null) return null;
  if (lot.conditionAtDecayStart <= tuning.spoiledBelowCondition) return null;
  const hours = tuning.shelfLifeSimHours * (1 - tuning.spoiledBelowCondition / lot.conditionAtDecayStart);
  return lot.decayStartedAtSimSeconds + Math.ceil(hours * 3600);
}

/**
 * Recalcula la condición de todos los lotes perecederos al instante actual
 * del reloj y emite `resource_lot_deteriorated` solo cuando cambia la
 * banda (límite causal, nunca telemetría por tick). Un lote perecedero de
 * una partida anterior a S7 (`decayStartedAtSimSeconds === null`) empieza
 * a deteriorarse ahora, con su condición actual como punto de partida: sin
 * retroactividad ni remuestreo (degradación de compatibilidad explícita,
 * documentada en `docs/STATUS.md`).
 */
export function applyResourceDecay(state: SimulationStateV2): { readonly state: SimulationStateV2; readonly events: readonly DomainEventV2[] } {
  const now = state.clock.elapsedSimSeconds;
  let resourceLots: Record<string, ResourceLot> | null = null;
  let sequences = state.sequences;
  const events: DomainEventV2[] = [];

  for (const lot of Object.values(state.resourceLots)) {
    const tuning = DECAY_TUNING_BY_FAMILY.get(lot.family);
    if (!tuning) continue;
    let next: ResourceLot = lot;
    if (lot.decayStartedAtSimSeconds === null || lot.conditionAtDecayStart === null) {
      next = { ...lot, decayStartedAtSimSeconds: lot.decayStartedAtSimSeconds ?? now, conditionAtDecayStart: lot.condition };
    }
    const condition = decayedCondition(tuning, next.conditionAtDecayStart!, next.decayStartedAtSimSeconds!, now);
    if (condition !== next.condition) next = { ...next, condition };
    if (next === lot) continue;
    resourceLots ??= { ...state.resourceLots };
    resourceLots[lot.id] = next;
    const before = freshnessBandFor(lot);
    const after = freshnessBandFor(next);
    if (after && before !== after) {
      const { eventId, sequences: nextSequences } = nextEventId(sequences);
      sequences = nextSequences;
      events.push({ type: "resource_lot_deteriorated", eventId, simSeconds: now, causedByCommandId: null, resourceLotId: lot.id, band: after });
    }
  }

  if (!resourceLots) return { state, events };
  return { state: { ...state, resourceLots, sequences }, events };
}
