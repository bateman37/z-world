import { z } from "zod";
import { gameSpeedSchema } from "./clock.js";
import { priorityValueSchema } from "./priority-value.js";
import { worldPointSchema } from "./geometry.js";
import { jobTargetSchema } from "./work-v2.js";
import { ATTENTION_MODES, DESIGNATION_KINDS, MEANS_DISPOSITIONS, PACE_MODES, TRANSPORT_METHOD_CHOICES, ZONE_POLICIES, transportDestinationSchema } from "./work-v2.js";
import { cargoRefSchema } from "./objects-v2.js";

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

/**
 * Comandos de trabajos/planificador/zonas/designaciones de S4-S6 (WEB-002
 * §11, §6.9). `order_contextual_action` es la única puerta de entrada para
 * una orden directa: cubre reconocer/observar/inspeccionar/registrar y
 * también beber/comer/descansar (mismo motor común, §12.1). El origen
 * `direct_order` precede al planificador pero sigue respetando `Nunca`,
 * zonas y requisitos (§6.9).
 */
export const orderContextualActionCommandSchema = z.object({
  ...baseCommandFields,
  type: z.literal("order_contextual_action"),
  personId: z.string().min(1),
  teamPersonIds: z.array(z.string().min(1)).max(3).default([]),
  actionKey: z.string().min(1),
  target: jobTargetSchema,
  pace: z.enum(PACE_MODES).optional(),
  attention: z.enum(ATTENTION_MODES).optional(),
  /** Alcance de desmontaje elegido, solo relevante para `disassemble_*` (§16.3, S7). */
  disassemblyScope: z.enum(["selective", "destructive"]).optional(),
  /** Confirmación informada del coste irreversible del método (§16.4, S7). Un método `irreversible` sin esto queda bloqueado, nunca se ejecuta en silencio. */
  confirmIrreversible: z.boolean().optional(),
  /** Objeto o lote concreto que `store`/`retrieve_from_storage` mueve hacia/desde el contenedor del blanco (S7). */
  storageItem: z.object({ kind: z.enum(["world_object", "resource_lot"]), id: z.string().min(1) }).optional(),
  /** Cantidad parcial de un lote a retirar (divide el lote, S7 §6.5). */
  storageQuantity: z.number().positive().optional(),
  /** Selector de método de transporte de SET-010 §3.9 (`auto` o un método concreto), solo para `transport` (S8). */
  transportMethod: z.enum(TRANSPORT_METHOD_CHOICES).optional(),
  /** Carretilla/carro concreto que se quiere usar (opcional: `Auto` elige entre los conocidos y disponibles). */
  transportMeansId: z.string().min(1).optional(),
  /** Destino físico del traslado (S8). */
  transportDestination: transportDestinationSchema.optional(),
  /** Elementos adicionales de la misma carga, además del blanco (S8). */
  transportCargo: z.array(cargoRefSchema).max(12).optional(),
  /** Qué hacer con el medio al terminar: estacionarlo en destino o devolverlo a su origen (S8, fase 9 de SET-010 §3.7). */
  meansDisposition: z.enum(MEANS_DISPOSITIONS).optional(),
});

export const pauseJobCommandSchema = z.object({ ...baseCommandFields, type: z.literal("pause_job"), jobId: z.string().min(1) });
export const resumeJobCommandSchema = z.object({ ...baseCommandFields, type: z.literal("resume_job"), jobId: z.string().min(1) });
export const cancelJobCommandSchema = z.object({ ...baseCommandFields, type: z.literal("cancel_job"), jobId: z.string().min(1) });

export const reassignJobCommandSchema = z.object({
  ...baseCommandFields,
  type: z.literal("reassign_job"),
  jobId: z.string().min(1),
  addPersonId: z.string().min(1).nullable(),
  removePersonId: z.string().min(1).nullable(),
});

export const setJobModesCommandSchema = z.object({
  ...baseCommandFields,
  type: z.literal("set_job_modes"),
  jobId: z.string().min(1),
  pace: z.enum(PACE_MODES).optional(),
  attention: z.enum(ATTENTION_MODES).optional(),
});

export const drawZoneCommandSchema = z.object({
  ...baseCommandFields,
  type: z.literal("draw_zone"),
  zoneId: z.string().min(1),
  polygon: z.array(worldPointSchema).min(3),
  policy: z.enum(ZONE_POLICIES),
});

export const editZoneCommandSchema = z.object({
  ...baseCommandFields,
  type: z.literal("edit_zone"),
  zoneId: z.string().min(1),
  polygon: z.array(worldPointSchema).min(3).optional(),
  policy: z.enum(ZONE_POLICIES).optional(),
});

export const deleteZoneCommandSchema = z.object({ ...baseCommandFields, type: z.literal("delete_zone"), zoneId: z.string().min(1) });

export const createAreaDesignationCommandSchema = z.object({
  ...baseCommandFields,
  type: z.literal("create_area_designation"),
  designationId: z.string().min(1),
  kind: z.enum(DESIGNATION_KINDS),
  polygon: z.array(worldPointSchema).min(1),
});

export const cancelDesignationCommandSchema = z.object({
  ...baseCommandFields,
  type: z.literal("cancel_designation"),
  designationId: z.string().min(1),
});

export const simulationCommandSchema = z.discriminatedUnion("type", [
  initializeScenarioCommandSchema,
  setPauseCommandSchema,
  setSpeedCommandSchema,
  orderDirectMoveCommandSchema,
  cancelDirectOrderCommandSchema,
  updatePriorityCommandSchema,
  orderContextualActionCommandSchema,
  pauseJobCommandSchema,
  resumeJobCommandSchema,
  cancelJobCommandSchema,
  reassignJobCommandSchema,
  setJobModesCommandSchema,
  drawZoneCommandSchema,
  editZoneCommandSchema,
  deleteZoneCommandSchema,
  createAreaDesignationCommandSchema,
  cancelDesignationCommandSchema,
]);

export type SimulationCommand = z.infer<typeof simulationCommandSchema>;
export type InitializeScenarioCommand = z.infer<typeof initializeScenarioCommandSchema>;
export type SetPauseCommand = z.infer<typeof setPauseCommandSchema>;
export type SetSpeedCommand = z.infer<typeof setSpeedCommandSchema>;
export type OrderDirectMoveCommand = z.infer<typeof orderDirectMoveCommandSchema>;
export type CancelDirectOrderCommand = z.infer<typeof cancelDirectOrderCommandSchema>;
export type UpdatePriorityCommand = z.infer<typeof updatePriorityCommandSchema>;
export type OrderContextualActionCommand = z.infer<typeof orderContextualActionCommandSchema>;
export type PauseJobCommand = z.infer<typeof pauseJobCommandSchema>;
export type ResumeJobCommand = z.infer<typeof resumeJobCommandSchema>;
export type CancelJobCommand = z.infer<typeof cancelJobCommandSchema>;
export type ReassignJobCommand = z.infer<typeof reassignJobCommandSchema>;
export type SetJobModesCommand = z.infer<typeof setJobModesCommandSchema>;
export type DrawZoneCommand = z.infer<typeof drawZoneCommandSchema>;
export type EditZoneCommand = z.infer<typeof editZoneCommandSchema>;
export type DeleteZoneCommand = z.infer<typeof deleteZoneCommandSchema>;
export type CreateAreaDesignationCommand = z.infer<typeof createAreaDesignationCommandSchema>;
export type CancelDesignationCommand = z.infer<typeof cancelDesignationCommandSchema>;
