import type { CultivationState } from "@z-world/contracts";
import { emit, withNextEventId, type Ctx } from "../jobs/engine-ctx.js";

/**
 * Transición compartida de la máquina de estados de una parcela (SET-011
 * §3.1): `packages/simulation-core/src/v2/terrain/actions.ts` (limpieza) y
 * `.../agriculture/actions.ts` (preparar/sembrar/cuidar/cosechar) la
 * reutilizan para no bifurcar la cadena `unprepared → cleared → prepared →
 * sown → growing → harvestable → harvested` en dos sitios.
 */
export function setPlotState(ctx: Ctx, plotId: string, nextState: CultivationState): void {
  const plot = ctx.state.cultivationPlots[plotId];
  if (!plot || plot.state === nextState) return;
  ctx.state = { ...ctx.state, cultivationPlots: { ...ctx.state.cultivationPlots, [plotId]: { ...plot, state: nextState } } };
  const eventId = withNextEventId(ctx);
  emit(ctx, { type: "cultivation_plot_state_changed", eventId, simSeconds: ctx.state.clock.elapsedSimSeconds, causedByCommandId: null, cultivationPlotId: plotId, state: nextState });
}
