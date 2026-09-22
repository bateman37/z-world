import { z } from "zod";
import { gameSpeedSchema } from "./clock.js";
import { priorityValueSchema } from "./priority-value.js";
import { worldPointSchema } from "./geometry.js";

/**
 * Comandos del núcleo: unión discriminada validada (§7.2 de WEB-001). La
 * selección visual, el hover y la cámara son estado de presentación y NO
 * son comandos.
 */

const baseCommandFields = {
  commandId: z.string().min(1),
};

export const initializeScenarioCommandSchema = z.object({
  ...baseCommandFields,
  type: z.literal("initialize_scenario"),
  seed: z.string().min(1),
});

export const setPauseCommandSchema = z.object({
  ...baseCommandFields,
  type: z.literal("set_pause"),
  paused: z.boolean(),
});

export const setSpeedCommandSchema = z.object({
  ...baseCommandFields,
  type: z.literal("set_speed"),
  speed: gameSpeedSchema,
});

export const orderDirectMoveCommandSchema = z.object({
  ...baseCommandFields,
  type: z.literal("order_direct_move"),
  personId: z.string().min(1),
  destination: worldPointSchema,
});

export const cancelDirectOrderCommandSchema = z.object({
  ...baseCommandFields,
  type: z.literal("cancel_direct_order"),
  personId: z.string().min(1),
});

export const updatePriorityCommandSchema = z.object({
  ...baseCommandFields,
  type: z.literal("update_priority"),
  personId: z.string().min(1),
  priorityId: z.string().min(1),
  value: priorityValueSchema,
});

export const simulationCommandSchema = z.discriminatedUnion("type", [
  initializeScenarioCommandSchema,
  setPauseCommandSchema,
  setSpeedCommandSchema,
  orderDirectMoveCommandSchema,
  cancelDirectOrderCommandSchema,
  updatePriorityCommandSchema,
]);

export type SimulationCommand = z.infer<typeof simulationCommandSchema>;
export type InitializeScenarioCommand = z.infer<typeof initializeScenarioCommandSchema>;
export type SetPauseCommand = z.infer<typeof setPauseCommandSchema>;
export type SetSpeedCommand = z.infer<typeof setSpeedCommandSchema>;
export type OrderDirectMoveCommand = z.infer<typeof orderDirectMoveCommandSchema>;
export type CancelDirectOrderCommand = z.infer<typeof cancelDirectOrderCommandSchema>;
export type UpdatePriorityCommand = z.infer<typeof updatePriorityCommandSchema>;
