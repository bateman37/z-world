import { z } from "zod";
import {
  gameCreatedEventSchema,
  speedOrPauseChangedEventSchema,
  moveOrderAcceptedEventSchema,
  moveOrderRejectedEventSchema,
  movementStartedEventSchema,
  movementCompletedEventSchema,
  movementBlockedEventSchema,
  movementCancelledEventSchema,
  priorityChangedEventSchema,
} from "./events.js";
import { JOB_PHASE_KINDS, JOB_STATES, OUTCOME_BAND_VALUES, RESERVATION_TARGET_KINDS, ZONE_POLICIES, DESIGNATION_KINDS } from "./work-v2.js";
import { NEED_BANDS, NEED_DIMENSIONS } from "./needs-v2.js";
import { TRANSPORT_METHODS } from "./objects-v2.js";
import { BUILDING_LAYERS, BUILDING_LIFE_STAGES, demolitionLossesSchema } from "./building-exploitation-v2.js";

/**
 * Eventos de dominio del runtime V2 (S3 de WEB-002 §5.1): reutiliza sin
 * cambios los eventos de movimiento/reloj/prioridad de V1 y añade los
 * eventos causales de S3 (exterior/interior, descubrimiento) más los de
 * S4-S6 (trabajos, fases, episodios, reservas, necesidades). Todos
 * representan límites causales, nunca telemetría por tick (§8 del prompt
 * de subhitos).
 */

const baseEventFields = {
  eventId: z.string().min(1),
  simSeconds: z.number().int().nonnegative(),
  causedByCommandId: z.string().nullable(),
};

export const DISCOVERY_ENTITY_KINDS = ["place", "building", "opening", "room", "building_installation"] as const;
export type DiscoveryEntityKind = (typeof DISCOVERY_ENTITY_KINDS)[number];

export const roomEnteredEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("room_entered"),
  personId: z.string(),
  roomId: z.string(),
});

export const roomExitedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("room_exited"),
  personId: z.string(),
  roomId: z.string(),
});

export const discoveryUpgradedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("discovery_upgraded"),
  entityKind: z.enum(DISCOVERY_ENTITY_KINDS),
  entityId: z.string(),
  facet: z.string(),
  state: z.string(),
});

export const jobCreatedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("job_created"),
  jobId: z.string(),
  actionKey: z.string(),
  origin: z.string(),
});

export const jobStateChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("job_state_changed"),
  jobId: z.string(),
  fromState: z.enum(JOB_STATES),
  toState: z.enum(JOB_STATES),
  reasonKey: z.string().nullable(),
});

export const jobPhaseChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("job_phase_changed"),
  jobId: z.string(),
  phase: z.enum(JOB_PHASE_KINDS),
});

export const jobAssignmentChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("job_assignment_changed"),
  jobId: z.string(),
  personId: z.string(),
  change: z.enum(["added", "removed"]),
});

export const reservationCreatedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("reservation_created"),
  reservationId: z.string(),
  jobId: z.string(),
  targetKind: z.enum(RESERVATION_TARGET_KINDS),
  targetId: z.string(),
});

export const reservationReleasedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("reservation_released"),
  reservationId: z.string(),
  jobId: z.string(),
});

export const workEpisodeCreatedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("work_episode_created"),
  episodeId: z.string(),
  jobId: z.string(),
  band: z.enum(OUTCOME_BAND_VALUES),
});

export const needChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("need_changed"),
  personId: z.string(),
  dimension: z.enum(NEED_DIMENSIONS),
  band: z.enum(NEED_BANDS),
});

export const consumptionHappenedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("consumption_happened"),
  personId: z.string(),
  resourceLotId: z.string(),
  dimension: z.enum(NEED_DIMENSIONS),
  quantity: z.number().positive(),
});

export const restProgressedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("rest_progressed"),
  personId: z.string(),
  jobId: z.string(),
  completed: z.boolean(),
});

export const systemicIntentionCreatedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("systemic_intention_created"),
  personId: z.string(),
  dimension: z.enum(NEED_DIMENSIONS),
  jobId: z.string().nullable(),
  blockedReasonKey: z.string().nullable(),
});

export const workInterruptedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("work_interrupted"),
  jobId: z.string(),
  reasonKey: z.string(),
});

export const zoneChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("zone_changed"),
  zoneId: z.string(),
  change: z.enum(["created", "updated", "deleted"]),
  policy: z.enum(ZONE_POLICIES).nullable(),
});

export const designationChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("designation_changed"),
  designationId: z.string(),
  change: z.enum(["created", "cancelled"]),
  kind: z.enum(DESIGNATION_KINDS).nullable(),
});

/**
 * Eventos de objetos, contenedores y recursos de S7 (§22.2 del prompt
 * S7-S9). Representan límites causales de la cadena
 * descubrir→recoger→almacenar→reparar/desmontar, nunca telemetría por tick.
 */
/** `resource_lot` y `transport_means` se añaden en S7 de forma aditiva (almacenar lotes; reparar/desmontar la carretilla/carro): los eventos ya persistidos siguen validando. */
export const OBJECT_LOCATION_ENTITY_KINDS = ["world_object", "furniture", "resource_lot", "transport_means"] as const;
export type ObjectLocationEntityKind = (typeof OBJECT_LOCATION_ENTITY_KINDS)[number];

export const objectCollectedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("object_collected"),
  objectId: z.string(),
  entityKind: z.enum(OBJECT_LOCATION_ENTITY_KINDS),
  personId: z.string(),
  jobId: z.string(),
});

export const objectStoredEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("object_stored"),
  objectId: z.string(),
  entityKind: z.enum(OBJECT_LOCATION_ENTITY_KINDS),
  containerId: z.string(),
  jobId: z.string(),
});

export const objectRetrievedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("object_retrieved"),
  objectId: z.string(),
  entityKind: z.enum(OBJECT_LOCATION_ENTITY_KINDS),
  containerId: z.string(),
  jobId: z.string(),
});

export const objectRepairedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("object_repaired"),
  objectId: z.string(),
  entityKind: z.enum(OBJECT_LOCATION_ENTITY_KINDS),
  jobId: z.string(),
  outcome: z.enum(["complete", "provisional", "partial", "blocked"]),
  functionalStateAfter: z.string(),
});

export const objectDisassembledEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("object_disassembled"),
  objectId: z.string(),
  entityKind: z.enum(OBJECT_LOCATION_ENTITY_KINDS),
  jobId: z.string(),
  scope: z.enum(["selective", "destructive"]),
  producedResourceLotIds: z.array(z.string()),
  functionsLost: z.array(z.string()),
});

export const resourceLotConsumedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("resource_lot_consumed"),
  resourceLotId: z.string(),
  jobId: z.string(),
  quantity: z.number().positive(),
});

export const resourceLotSplitEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("resource_lot_split"),
  sourceResourceLotId: z.string(),
  newResourceLotId: z.string(),
  quantity: z.number().positive(),
});

export const resourceLotMergedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("resource_lot_merged"),
  survivingResourceLotId: z.string(),
  mergedResourceLotId: z.string(),
});

/** Avería causal (S7 §6.2/§6.10): el desgaste determinista por uso lleva un objeto por debajo de su umbral funcional. */
export const objectBrokeDownEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("object_broke_down"),
  objectId: z.string(),
  entityKind: z.enum(OBJECT_LOCATION_ENTITY_KINDS),
  jobId: z.string().nullable(),
  reasonKey: z.string(),
});

/** Prueba/diagnóstico de una instalación (bomba, S7 §6.10): registra el estado funcional reconocido, no una tirada de dificultad. */
export const installationTestedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("installation_tested"),
  objectId: z.string(),
  jobId: z.string(),
  functionalState: z.string(),
  inactiveFunctionKeys: z.array(z.string()),
});

/** Extracción de agua potable con una bomba funcional conectada a su fuente real (S7 §6.10). */
export const waterDrawnEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("water_drawn"),
  objectId: z.string(),
  jobId: z.string(),
  resourceLotId: z.string(),
  quantity: z.number().positive(),
});

export const FRESHNESS_BANDS = ["fresh", "deteriorating", "spoiled"] as const;
export type FreshnessBand = (typeof FRESHNESS_BANDS)[number];

/** Cambio de banda de deterioro de un lote perecedero (S7 §6.6). Solo en el límite de banda, nunca por tick. */
export const resourceLotDeterioratedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("resource_lot_deteriorated"),
  resourceLotId: z.string(),
  band: z.enum(FRESHNESS_BANDS),
});

/**
 * Eventos de transporte y logística local de S8 (Puerta B, §10.1 del
 * prompt S7-S9): límites causales del traslado — plan elegido, medio
 * recuperado, carga preparada, acceso atravesado o bloqueado, ruido a lo
 * largo de la ruta, entrega, transferencia, depósito y estacionamiento.
 * Nunca telemetría por tick (el ruido se registra por tramos de ruta).
 */
export const NOISE_BANDS = ["quiet", "audible", "loud"] as const;
export type NoiseBand = (typeof NOISE_BANDS)[number];

export const transportPlannedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("transport_planned"),
  jobId: z.string(),
  method: z.enum(TRANSPORT_METHODS),
  chosenBy: z.enum(["auto", "imposed"]),
  transportMeansId: z.string().nullable(),
  staged: z.boolean(),
});

export const transportMeansRetrievedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("transport_means_retrieved"),
  jobId: z.string(),
  transportMeansId: z.string(),
  personId: z.string(),
});

export const loadPreparedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("load_prepared"),
  jobId: z.string(),
  loadBundleId: z.string(),
  method: z.enum(TRANSPORT_METHODS),
  totalWeightKg: z.number().nonnegative(),
  carrierPersonIds: z.array(z.string()),
});

export const accessTraversedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("access_traversed"),
  jobId: z.string(),
  openingId: z.string(),
  loadBundleId: z.string().nullable(),
});

export const transportRouteBlockedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("transport_route_blocked"),
  jobId: z.string(),
  openingId: z.string().nullable(),
  reasonKey: z.string(),
});

export const transportNoiseEmittedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("transport_noise_emitted"),
  jobId: z.string(),
  point: z.object({ x: z.number(), y: z.number() }),
  band: z.enum(NOISE_BANDS),
  metersTravelled: z.number().nonnegative(),
});

export const loadDeliveredEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("load_delivered"),
  jobId: z.string(),
  loadBundleId: z.string(),
  destinationKind: z.enum(["container", "room", "world_point", "transfer_point", "install_at_opening", "install_at_place"]),
  destinationId: z.string().nullable(),
});

export const loadTransferredEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("load_transferred"),
  jobId: z.string(),
  transferPointId: z.string(),
  nextJobId: z.string().nullable(),
});

export const loadDepositedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("load_deposited"),
  jobId: z.string(),
  loadBundleId: z.string(),
  reasonKey: z.string(),
  onTransportMeans: z.boolean(),
});

export const transportMeansParkedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("transport_means_parked"),
  jobId: z.string().nullable(),
  transportMeansId: z.string(),
  disposition: z.enum(["parked", "returned", "abandoned"]),
});

// --- S9 — Puerta C: accesos mutables y explotación progresiva de edificios ---

/** Cambios de acceso de WLD-011 §3.4: cada uno es un límite causal que altera navegación y logística en el mismo instante. */
export const ACCESS_CHANGE_KINDS = [
  "opened",
  "closed",
  "locked",
  "unlocked",
  "forced",
  "obstruction_cleared",
  "barricaded",
  "boarded_up",
  "reinforced",
  "closure_repaired",
  "closure_removed",
  "closure_destroyed",
  "closure_installed",
  "building_demolished",
  "building_dismantled",
] as const;
export type AccessChangeKind = (typeof ACCESS_CHANGE_KINDS)[number];

export const accessChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("access_changed"),
  openingId: z.string(),
  buildingId: z.string().nullable(),
  change: z.enum(ACCESS_CHANGE_KINDS),
  jobId: z.string().nullable(),
  passableAfter: z.boolean(),
  /** Objeto en que se convirtió un cierre retirado, o que se instaló (identidad conservada). */
  objectId: z.string().nullable().default(null),
  noiseBand: z.enum(["quiet", "audible", "loud"]).default("quiet"),
});

export const installationSurveyedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("installation_surveyed"),
  buildingId: z.string(),
  jobId: z.string(),
  revealedInstallationIds: z.array(z.string()),
  complete: z.boolean(),
});

export const installationDisconnectedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("installation_disconnected"),
  installationId: z.string(),
  buildingId: z.string(),
  jobId: z.string(),
});

export const installationDismantledEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("installation_dismantled"),
  installationId: z.string(),
  buildingId: z.string(),
  jobId: z.string(),
  producedResourceLotIds: z.array(z.string()),
  /** Fracción de la receta recuperada (extracción torpe = pérdida persistente, SET-007 §3.5). */
  recoveryRatio: z.number().min(0).max(1),
});

export const finishRecoveredEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("finish_recovered"),
  finishId: z.string(),
  buildingId: z.string(),
  jobId: z.string(),
  producedResourceLotIds: z.array(z.string()),
});

export const structureDismantledEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("structure_dismantled"),
  buildingId: z.string(),
  jobId: z.string(),
  stagesDone: z.number().int().nonnegative(),
  stagesTotal: z.number().int().positive(),
  producedResourceLotIds: z.array(z.string()),
});

export const buildingDemolishedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("building_demolished"),
  buildingId: z.string(),
  jobId: z.string(),
  producedResourceLotIds: z.array(z.string()),
  losses: demolitionLossesSchema,
});

export const buildingLifeStageChangedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("building_life_stage_changed"),
  buildingId: z.string(),
  lifeStage: z.enum(BUILDING_LIFE_STAGES),
});

export const buildingLayerExhaustedEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("building_layer_exhausted"),
  buildingId: z.string(),
  layer: z.enum(BUILDING_LAYERS),
});

export const objectUninstalledEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("object_uninstalled"),
  objectId: z.string(),
  jobId: z.string(),
  placeId: z.string().nullable(),
});

export const objectInstalledEventSchema = z.object({
  ...baseEventFields,
  type: z.literal("object_installed"),
  objectId: z.string(),
  jobId: z.string(),
  siteKind: z.enum(["opening", "place"]),
  siteId: z.string(),
});

export const domainEventV2Schema = z.discriminatedUnion("type", [
  gameCreatedEventSchema,
  speedOrPauseChangedEventSchema,
  moveOrderAcceptedEventSchema,
  moveOrderRejectedEventSchema,
  movementStartedEventSchema,
  movementCompletedEventSchema,
  movementBlockedEventSchema,
  movementCancelledEventSchema,
  priorityChangedEventSchema,
  roomEnteredEventSchema,
  roomExitedEventSchema,
  discoveryUpgradedEventSchema,
  jobCreatedEventSchema,
  jobStateChangedEventSchema,
  jobPhaseChangedEventSchema,
  jobAssignmentChangedEventSchema,
  reservationCreatedEventSchema,
  reservationReleasedEventSchema,
  workEpisodeCreatedEventSchema,
  needChangedEventSchema,
  consumptionHappenedEventSchema,
  restProgressedEventSchema,
  systemicIntentionCreatedEventSchema,
  workInterruptedEventSchema,
  zoneChangedEventSchema,
  designationChangedEventSchema,
  objectCollectedEventSchema,
  objectStoredEventSchema,
  objectRetrievedEventSchema,
  objectRepairedEventSchema,
  objectDisassembledEventSchema,
  resourceLotConsumedEventSchema,
  resourceLotSplitEventSchema,
  resourceLotMergedEventSchema,
  objectBrokeDownEventSchema,
  installationTestedEventSchema,
  waterDrawnEventSchema,
  resourceLotDeterioratedEventSchema,
  transportPlannedEventSchema,
  transportMeansRetrievedEventSchema,
  loadPreparedEventSchema,
  accessTraversedEventSchema,
  transportRouteBlockedEventSchema,
  transportNoiseEmittedEventSchema,
  loadDeliveredEventSchema,
  loadTransferredEventSchema,
  loadDepositedEventSchema,
  transportMeansParkedEventSchema,
  accessChangedEventSchema,
  installationSurveyedEventSchema,
  installationDisconnectedEventSchema,
  installationDismantledEventSchema,
  finishRecoveredEventSchema,
  structureDismantledEventSchema,
  buildingDemolishedEventSchema,
  buildingLifeStageChangedEventSchema,
  buildingLayerExhaustedEventSchema,
  objectUninstalledEventSchema,
  objectInstalledEventSchema,
]);

export type DomainEventV2 = z.infer<typeof domainEventV2Schema>;
