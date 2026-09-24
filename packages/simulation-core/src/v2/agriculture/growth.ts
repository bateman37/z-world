import type { DomainEventV2, SimulationStateV2 } from "@z-world/contracts";
import { CROP_PROFILES_BY_ID } from "@z-world/catalogs";
import { emit, withNextEventId, type Ctx } from "../jobs/engine-ctx.js";
import type { NavigationIndexV2 } from "../room-graph.js";
import { setPlotState } from "./plot-state.js";
import { valuesById } from "../ordered.js";

export interface AdvanceCropGrowthResult {
  readonly state: SimulationStateV2;
  readonly events: readonly DomainEventV2[];
}

/**
 * Ventana de gracia tras vencer el intervalo de cuidado antes de que el
 * daño alcance el máximo (SET-011 §3.5: "evita castigos sorpresa sin señal
 * previa"). El daño crece linealmente en esa ventana, nunca de golpe.
 */
const NEGLECT_DAMAGE_WINDOW_FACTOR = 2;

/**
 * Avance del ciclo agrícola por reloj (WEB-002 §5.5/S10 §5.5-§5.6): deriva
 * `growing → harvestable` y el nivel de daño por descuido como funciones
 * puras del instante de simulación, nunca de un contador acumulado por
 * tick — el resultado es idéntico avanzando el mismo tiempo con ×1 o ×10,
 * y en pausa no se llama en absoluto (mismo contrato que
 * `advanceJobs`/`applyResourceDecay`: solo se invoca con `simSecondsToAdvance > 0`).
 */
export function advanceCropGrowth(state: SimulationStateV2, nav: NavigationIndexV2, simSecondsToAdvance: number): AdvanceCropGrowthResult {
  if (simSecondsToAdvance <= 0) return { state, events: [] };
  const ctx: Ctx = { state, events: [], nav, simSecondsToAdvance };
  const now = ctx.state.clock.elapsedSimSeconds;

  for (const plot of valuesById(ctx.state.cultivationPlots)) {
    if (!plot.activeCropCycleId) continue;
    const cycle = ctx.state.cropCycles[plot.activeCropCycleId];
    if (!cycle) continue;
    const crop = CROP_PROFILES_BY_ID.get(cycle.cropId);
    if (!crop) continue;

    if (plot.state === "growing") {
      if (crop.needsWater) {
        const lastCare = cycle.lastCaredAtSimSeconds ?? cycle.sownAtSimSeconds;
        const overdueBy = now - lastCare - crop.careIntervalSimSeconds;
        const nextDamage = overdueBy <= 0 ? 0 : Math.min(1, overdueBy / (crop.careIntervalSimSeconds * NEGLECT_DAMAGE_WINDOW_FACTOR));
        if (nextDamage !== plot.damageLevel) {
          ctx.state = { ...ctx.state, cultivationPlots: { ...ctx.state.cultivationPlots, [plot.id]: { ...plot, damageLevel: nextDamage } } };
        }
        if (nextDamage >= 1) {
          ctx.state = { ...ctx.state, cultivationPlots: { ...ctx.state.cultivationPlots, [plot.id]: { ...ctx.state.cultivationPlots[plot.id]!, activeCropCycleId: null, damageLevel: 0 } } };
          setPlotState(ctx, plot.id, "unprepared");
          const eventId = withNextEventId(ctx);
          emit(ctx, { type: "crop_lost", eventId, simSeconds: now, causedByCommandId: null, cultivationPlotId: plot.id, cropCycleId: cycle.id, reasonKey: "neglect" });
          continue;
        }
      }
      if (now >= cycle.harvestableAtSimSeconds) {
        setPlotState(ctx, plot.id, "harvestable");
      }
    }
  }

  return { state: ctx.state, events: ctx.events };
}
