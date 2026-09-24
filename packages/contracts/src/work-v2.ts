import { z } from "zod";
import { entityLocationSchema, type EntityLocation } from "./location-v2.js";
import { PRIORITY_IDS, type PriorityId } from "./catalog-ids.js";
import { DISCOVERY_FACETS, type DiscoveryFacet } from "./place-history-v2.js";
import { NEED_DIMENSIONS, type NeedDimension } from "./needs-v2.js";
import { worldPointSchema, type WorldPoint } from "./geometry.js";
import { cargoRefSchema, TRANSPORT_METHODS, type CargoRef, type TransportMethod } from "./objects-v2.js";

/**
 * Trabajos, zonas y designaciones de WEB-002 §6.3/§11 (subhito S4-S6:
 * evoluciona la forma esquelética de S1 con la máquina de estados, fases,
 * planificador, reservas y episodios reales — ver `DEC-0018`). Las tres
 * colecciones (`jobs`, `episodes`, `reservations`) siempre nacen vacías en
 * `create-initial-state-v2`/`migrate-v1-to-v2`, así que esta evolución no
 * exige una migración de datos existentes, solo de forma.
 */

export const ZONE_POLICIES = ["habitual", "precaution", "forbidden"] as const;
export type ZonePolicy = (typeof ZONE_POLICIES)[number];

export interface WorkZone {
  readonly id: string;
  readonly polygon: readonly { readonly x: number; readonly y: number }[];
  readonly policy: ZonePolicy;
  readonly createdAtSimSeconds: number;
}

export const workZoneSchema = z.object({
  id: z.string(),
  polygon: z.array(z.object({ x: z.number(), y: z.number() })).min(3),
  policy: z.enum(ZONE_POLICIES),
  createdAtSimSeconds: z.number().int().nonnegative(),
});

export const DESIGNATION_KINDS = [
  "clear_area",
  "cut_vegetation",
  "prepare_soil",
  "harvest",
  "remove_known_objects",
  "build_barrier",
  /** Reconocimiento/observación sistemática de objetivos ya conocidos dentro de un área (§6.8 del prompt S4-S6). Única designación por área ejecutable en esta entrega. */
  "systematic_recon",
] as const;
export type DesignationKind = (typeof DESIGNATION_KINDS)[number];

/** Designaciones ejecutables. S10 activa las cinco de entorno mutable/agricultura (§6.8, `DEC-0020`); `remove_known_objects` sigue sin motor propio. */
export const EXECUTABLE_DESIGNATION_KINDS: readonly DesignationKind[] = [
  "systematic_recon",
  "clear_area",
  "cut_vegetation",
  "prepare_soil",
  "harvest",
  "build_barrier",
];

export interface Designation {
  readonly id: string;
  readonly kind: DesignationKind;
  readonly areaOrLinePolygon: readonly { readonly x: number; readonly y: number }[];
  readonly generatedJobIds: readonly string[];
  readonly cancelled: boolean;
  readonly createdAtSimSeconds: number;
}

export const designationSchema = z.object({
  id: z.string(),
  kind: z.enum(DESIGNATION_KINDS),
  areaOrLinePolygon: z.array(z.object({ x: z.number(), y: z.number() })).min(1),
  generatedJobIds: z.array(z.string()),
  cancelled: z.boolean(),
  createdAtSimSeconds: z.number().int().nonnegative(),
});

export const JOB_ORIGINS = ["direct_order", "zone_policy", "systemic_need", "designation"] as const;
export type JobOrigin = (typeof JOB_ORIGINS)[number];

export const JOB_STATES = [
  "proposed",
  "available",
  "reserved",
  "assigned",
  "in_progress",
  "blocked",
  "paused",
  "interrupted",
  "completed",
  "cancelled",
  "causal_failure",
] as const;
export type JobState = (typeof JOB_STATES)[number];

/** Transiciones legales de la máquina de estados de `Job` (§6.2/§11.2). */
export const JOB_LEGAL_TRANSITIONS: Readonly<Record<JobState, readonly JobState[]>> = {
  proposed: ["available", "cancelled", "blocked"],
  available: ["reserved", "cancelled", "blocked"],
  reserved: ["assigned", "available", "cancelled", "blocked"],
  assigned: ["in_progress", "available", "cancelled", "blocked"],
  in_progress: ["paused", "interrupted", "completed", "cancelled", "causal_failure", "blocked"],
  blocked: ["available", "reserved", "assigned", "in_progress", "cancelled"],
  paused: ["in_progress", "cancelled", "interrupted"],
  interrupted: ["available", "in_progress", "cancelled"],
  completed: [],
  cancelled: [],
  causal_failure: [],
};

export const JOB_PHASE_KINDS = [
  "validate",
  "reserve",
  "travel",
  "prepare",
  "execute",
  "collect",
  "transport",
  "deliver",
  "close",
  "record_result",
] as const;
export type JobPhaseKind = (typeof JOB_PHASE_KINDS)[number];

export interface JobPhase {
  readonly kind: JobPhaseKind;
  readonly state: "pending" | "active" | "done" | "skipped";
}

export const jobPhaseSchema = z.object({
  kind: z.enum(JOB_PHASE_KINDS),
  state: z.enum(["pending", "active", "done", "skipped"]),
});

export const JOB_ROLES = ["responsible", "primary_executor", "operational_helper", "logistics_support", "reviewer", "watch"] as const;
export type JobRole = (typeof JOB_ROLES)[number];

export interface Assignment {
  readonly personId: string;
  readonly role: JobRole;
}

export const assignmentSchema = z.object({
  personId: z.string(),
  role: z.enum(JOB_ROLES),
});

export const PACE_MODES = ["relaxed", "normal", "fast"] as const;
export type PaceMode = (typeof PACE_MODES)[number];
export const ATTENTION_MODES = ["standard", "careful", "thorough"] as const;
export type AttentionMode = (typeof ATTENTION_MODES)[number];
export const RESPONSE_POLICIES = ["cautious", "standard", "decisive", "emergency"] as const;
export type ResponsePolicy = (typeof RESPONSE_POLICIES)[number];

export const OUTCOME_BAND_VALUES = ["exceptional", "favorable", "uncertain", "recoverable_poor", "severe"] as const;
export type OutcomeBandValue = (typeof OUTCOME_BAND_VALUES)[number];

/**
 * Comprobación incierta persistente (modelo B, §5.7/§12.7). Identidad causal
 * suficiente para no repetir tirada por tick/paso: objetivo+método+blanco+
 * participantes+condiciones relevantes ya viven en el `Job` propietario; el
 * episodio guarda solo el resultado comprometido y no remuestreable.
 */
export interface WorkEpisode {
  readonly id: string;
  readonly jobId: string;
  readonly phase: JobPhaseKind;
  readonly executorPersonId: string;
  readonly capacityEffective: number;
  readonly difficultyEffective: number;
  readonly marginPrevious: number;
  readonly variationB: number;
  readonly marginFinal: number;
  readonly band: OutcomeBandValue;
  readonly createdAtSimSeconds: number;
}

export const workEpisodeSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  phase: z.enum(JOB_PHASE_KINDS),
  executorPersonId: z.string(),
  capacityEffective: z.number(),
  difficultyEffective: z.number(),
  marginPrevious: z.number(),
  variationB: z.number().min(-4).max(4),
  marginFinal: z.number(),
  band: z.enum(OUTCOME_BAND_VALUES),
  createdAtSimSeconds: z.number().int().nonnegative(),
});

/** Blanco real de un trabajo: entidad concreta sobre la que actúa el método (§11.1). */
export type JobTarget =
  | { readonly kind: "place"; readonly placeId: string }
  | { readonly kind: "building"; readonly buildingId: string }
  | { readonly kind: "room"; readonly roomId: string }
  | { readonly kind: "opening"; readonly openingId: string }
  | { readonly kind: "resource_lot"; readonly resourceLotId: string }
  | { readonly kind: "furniture"; readonly furnitureId: string }
  | { readonly kind: "world_object"; readonly worldObjectId: string }
  | { readonly kind: "container"; readonly containerId: string }
  /** Carretilla/carro como objeto completo (S7 §6.10): reparar, desmontar, diagnosticar. El uso como medio de carga es S8. */
  | { readonly kind: "transport_means"; readonly transportMeansId: string }
  /** Instalación desmontable de un edificio (capa 3, S9). */
  | { readonly kind: "building_installation"; readonly installationId: string }
  /** Acabado recuperable de un edificio (capa 4, S9). */
  | { readonly kind: "building_finish"; readonly finishId: string }
  | { readonly kind: "area"; readonly polygon: readonly WorldPoint[] }
  | { readonly kind: "own_need"; readonly personId: string; readonly dimension: NeedDimension }
  /** S10: zona de terreno de fondo (matorral, escombros) sobre la que se despeja cobertura fuera de una parcela de cultivo. */
  | { readonly kind: "terrain_area"; readonly terrainAreaId: string }
  /** S10: tramo de carretera/camino sobre el que se despeja un bloqueo o se retira su función viaria. */
  | { readonly kind: "linear_feature"; readonly linearFeatureId: string }
  /** S10: parcela de cultivo (preparar, sembrar, cuidar, cosechar). */
  | { readonly kind: "cultivation_plot"; readonly cultivationPlotId: string }
  /** S10: tramo de barrera lineal entre dos anclajes en construcción. */
  | { readonly kind: "barrier_segment"; readonly barrierSegmentId: string };

export const jobTargetSchema: z.ZodType<JobTarget> = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("place"), placeId: z.string() }),
  z.object({ kind: z.literal("building"), buildingId: z.string() }),
  z.object({ kind: z.literal("room"), roomId: z.string() }),
  z.object({ kind: z.literal("opening"), openingId: z.string() }),
  z.object({ kind: z.literal("resource_lot"), resourceLotId: z.string() }),
  z.object({ kind: z.literal("furniture"), furnitureId: z.string() }),
  z.object({ kind: z.literal("world_object"), worldObjectId: z.string() }),
  z.object({ kind: z.literal("container"), containerId: z.string() }),
  z.object({ kind: z.literal("transport_means"), transportMeansId: z.string() }),
  z.object({ kind: z.literal("building_installation"), installationId: z.string() }),
  z.object({ kind: z.literal("building_finish"), finishId: z.string() }),
  z.object({ kind: z.literal("area"), polygon: z.array(worldPointSchema) }),
  z.object({ kind: z.literal("own_need"), personId: z.string(), dimension: z.enum(NEED_DIMENSIONS) }),
  z.object({ kind: z.literal("terrain_area"), terrainAreaId: z.string() }),
  z.object({ kind: z.literal("linear_feature"), linearFeatureId: z.string() }),
  z.object({ kind: z.literal("cultivation_plot"), cultivationPlotId: z.string() }),
  z.object({ kind: z.literal("barrier_segment"), barrierSegmentId: z.string() }),
]);

/** Referencia a un objeto o lote que un trabajo de almacenamiento mueve (S7). */
export interface StorageItemRef {
  readonly kind: "world_object" | "resource_lot";
  readonly id: string;
}

/**
 * Destino físico de un traslado (S8, SET-010 §3.8): un contenedor real (con
 * capacidad), una estancia, un punto exterior o un punto de transferencia.
 */
export type TransportDestination =
  | { readonly kind: "container"; readonly containerId: string }
  | { readonly kind: "room"; readonly roomId: string }
  | { readonly kind: "world_point"; readonly point: WorldPoint }
  | { readonly kind: "transfer_point"; readonly transferPointId: string }
  /**
   * S9: «instalar» como destino real de un traslado (una puerta recuperada
   * hacia una abertura sin cierre, o la bomba hacia una fuente `ENV-01`):
   * la carga se deja junto al sitio y una etapa `install` encadenada, con
   * su propia reserva, la instala.
   */
  | { readonly kind: "install_at_opening"; readonly openingId: string }
  | { readonly kind: "install_at_place"; readonly placeId: string };

export const transportDestinationSchema: z.ZodType<TransportDestination> = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("container"), containerId: z.string().min(1) }),
  z.object({ kind: z.literal("room"), roomId: z.string().min(1) }),
  z.object({ kind: z.literal("world_point"), point: worldPointSchema }),
  z.object({ kind: z.literal("transfer_point"), transferPointId: z.string().min(1) }),
  z.object({ kind: z.literal("install_at_opening"), openingId: z.string().min(1) }),
  z.object({ kind: z.literal("install_at_place"), placeId: z.string().min(1) }),
]);

/** Selector de método de SET-010 §3.9: `auto` o uno de los cinco métodos activos. Nunca se confunde con prioridad, equipo, ritmo ni atención. */
export const TRANSPORT_METHOD_CHOICES = ["auto", ...TRANSPORT_METHODS] as const;
export type TransportMethodChoice = (typeof TRANSPORT_METHOD_CHOICES)[number];

/**
 * Paso logístico fino dentro de las fases comunes del `Job` (SET-010 §3.7):
 * `reserve` (fase `reserve`) → `retrieve_means`/`go_to_origin` (fase
 * `prepare`) → `load` (fase `collect`) → `traverse`, que incluye atravesar
 * accesos (fase `transport`) → `unload`/`deposit` (fase `deliver`) →
 * `park` (fase `close`) → `done`.
 */
export const TRANSPORT_STEPS = ["plan", "reserve", "retrieve_means", "go_to_origin", "load", "traverse", "unload", "deposit", "park", "done"] as const;
export type TransportStep = (typeof TRANSPORT_STEPS)[number];

export const MEANS_DISPOSITIONS = ["park_at_destination", "return_to_origin"] as const;
export type MeansDisposition = (typeof MEANS_DISPOSITIONS)[number];

export interface TransportRouteAccess {
  readonly openingId: string;
  /** Metros de la ruta de la porteadora principal a los que se atraviesa el acceso. */
  readonly atMeters: number;
  readonly crossed: boolean;
}

export interface TransportSurfaceMeters {
  readonly road: number;
  readonly open_ground: number;
  readonly dense_vegetation: number;
  readonly interior: number;
  /** Escombros de un edificio demolido (S9). Opcional en el tipo y `.default(0)` en el esquema. */
  readonly rubble?: number;
}

/** Parada forzada de una etapa: el medio no puede seguir más allá de este acceso (S8, SET-010 §3.8). */
export interface TransportStagedStop {
  readonly openingId: string;
  readonly point: WorldPoint;
  readonly roomId: string | null;
}

/**
 * Estado de un traslado (S8 — Puerta B). Vive en el mismo `Job` y la misma
 * máquina de fases que S4-S7: no es una tubería paralela. `null` en todo
 * trabajo que no sea `transport` y en todo trabajo anterior a S8.
 */
export interface TransportJobState {
  readonly requestedMethod: TransportMethodChoice;
  readonly method: TransportMethod | null;
  readonly requestedMeansId: string | null;
  readonly transportMeansId: string | null;
  readonly cargo: readonly CargoRef[];
  /** Destino final de la orden completa. */
  readonly destination: TransportDestination;
  /** Parada de esta etapa cuando el medio no puede llegar al destino final (punto de transferencia a crear). */
  readonly stagedStop: TransportStagedStop | null;
  readonly transferPointId: string | null;
  readonly step: TransportStep;
  readonly stepRemainingMinutes: number;
  readonly meansDisposition: MeansDisposition;
  readonly meansOriginLocation: EntityLocation | null;
  readonly loadBundleId: string | null;
  readonly carrierPersonIds: readonly string[];
  readonly requiredCarriers: number;
  readonly usefulCarrierLimit: number;
  readonly routeAccesses: readonly TransportRouteAccess[];
  readonly routeDistanceMeters: number;
  readonly surfaceMeters: TransportSurfaceMeters;
  readonly travelledLoadedMeters: number;
  /** Progreso (m) de la porteadora principal sobre la ruta cargada vigente (para ruido y accesos por tramo). */
  readonly routeTravelledMeters: number;
  readonly noiseUnits: number;
  readonly nextNoiseReportAtMeters: number;
  readonly fatigueUnits: number;
  readonly previousJobId: string | null;
  readonly nextJobId: string | null;
  /** Motivo cualitativo de la elección de `Auto` o de la aceptación del método impuesto. */
  readonly planNoteKey: string | null;
  /** Etapa a pulso tras un punto de transferencia: nunca vuelve a elegir un medio con ruedas (evita replantear la misma transferencia). */
  readonly manualOnly: boolean;
  /** Método (y medio) de la etapa siguiente cuando esta es una etapa de recogida a pulso hasta el medio. */
  readonly continuationMethod: TransportMethodChoice | null;
  readonly continuationMeansId: string | null;
}

const surfaceMetersSchema = z.object({
  road: z.number().nonnegative(),
  open_ground: z.number().nonnegative(),
  dense_vegetation: z.number().nonnegative(),
  interior: z.number().nonnegative(),
  rubble: z.number().nonnegative().default(0),
});

export const transportJobStateSchema = z.object({
  requestedMethod: z.enum(TRANSPORT_METHOD_CHOICES),
  method: z.enum(TRANSPORT_METHODS).nullable(),
  requestedMeansId: z.string().nullable(),
  transportMeansId: z.string().nullable(),
  cargo: z.array(cargoRefSchema).min(1),
  destination: transportDestinationSchema,
  stagedStop: z.object({ openingId: z.string(), point: worldPointSchema, roomId: z.string().nullable() }).nullable(),
  transferPointId: z.string().nullable(),
  step: z.enum(TRANSPORT_STEPS),
  stepRemainingMinutes: z.number().nonnegative(),
  meansDisposition: z.enum(MEANS_DISPOSITIONS),
  meansOriginLocation: entityLocationSchema.nullable(),
  loadBundleId: z.string().nullable(),
  carrierPersonIds: z.array(z.string()),
  requiredCarriers: z.number().int().positive(),
  usefulCarrierLimit: z.number().int().positive(),
  routeAccesses: z.array(z.object({ openingId: z.string(), atMeters: z.number().nonnegative(), crossed: z.boolean() })),
  routeDistanceMeters: z.number().nonnegative(),
  surfaceMeters: surfaceMetersSchema,
  travelledLoadedMeters: z.number().nonnegative(),
  routeTravelledMeters: z.number().nonnegative().default(0),
  noiseUnits: z.number().nonnegative(),
  nextNoiseReportAtMeters: z.number().nonnegative(),
  fatigueUnits: z.number().nonnegative(),
  previousJobId: z.string().nullable(),
  nextJobId: z.string().nullable(),
  planNoteKey: z.string().nullable(),
  manualOnly: z.boolean().default(false),
  continuationMethod: z.enum(TRANSPORT_METHOD_CHOICES).nullable().default(null),
  continuationMeansId: z.string().nullable().default(null),
});

export interface JobTimeLimit {
  readonly kind: "until_complete" | "until_sim_seconds" | "quantity";
  readonly value: number | null;
}
export const jobTimeLimitSchema = z.object({
  kind: z.enum(["until_complete", "until_sim_seconds", "quantity"]),
  value: z.number().nullable(),
});

export interface Job {
  readonly id: string;
  readonly origin: JobOrigin;
  readonly causingCommandOrDesignationId: string | null;
  readonly actionKey: string;
  readonly methodVersion: number;
  readonly target: JobTarget;
  readonly effectivePriority: PriorityId;
  readonly location: EntityLocation;
  readonly urgency: number;
  readonly knowledgeUsed: readonly { readonly entityId: string; readonly facet: DiscoveryFacet }[];
  readonly phases: readonly JobPhase[];
  readonly currentPhaseIndex: number;
  readonly assignments: readonly Assignment[];
  /** Personas solicitadas explícitamente por una orden directa (§11.9); vacío para trabajos de zona/designación/necesidad sistémica, que el planificador puebla libremente. */
  readonly requestedPersonIds: readonly string[];
  readonly desiredTeamSize: number;
  readonly pace: PaceMode;
  readonly attention: AttentionMode;
  readonly timeLimit: JobTimeLimit | null;
  readonly responsePolicy: ResponsePolicy;
  readonly state: JobState;
  readonly blockReasonKey: string | null;
  readonly reservationIds: readonly string[];
  readonly episodeIds: readonly string[];
  readonly progressRatio: number;
  readonly workRemainingUnits: number;
  /** Variación determinista del modelo D (§12.5), muestreada una sola vez la primera vez que el trabajo progresa y nunca remuestreada. `null` hasta entonces o si el método no usa modelo D. */
  readonly workRateVariation: number | null;
  readonly directOrder: boolean;
  /**
   * Alcance del desmontaje para métodos `disassemble_*` (§16.3/§16.9): a lo
   * sumo la reparación/desmontaje conserva lo que el perfil declara.
   * `null` cuando el método no es un desmontaje.
   */
  readonly disassemblyScope: "selective" | "destructive" | null;
  /**
   * `true` si una orden directa ya confirmó el coste irreversible del
   * método (§16.4 del prompt S7-S9). Un método marcado `irreversible` en su
   * `ActionMethodDefinition` nunca progresa de fase `prepare` sin esto.
   */
  readonly irreversibleConfirmed: boolean;
  /**
   * Elemento concreto que un trabajo `store`/`retrieve_from_storage` mueve
   * hacia/desde el `Container` real del blanco (S7 §6.3/§6.4, CAT-005
   * §4.4). `null` para cualquier otro método y para trabajos anteriores a
   * S7 (default seguro).
   */
  readonly storageItem: StorageItemRef | null;
  /** Cantidad parcial a retirar de un lote (`retrieve_from_storage`, S7 §6.5: dividir un lote). `null` = el lote entero. Default seguro para trabajos anteriores. */
  readonly storageQuantity: number | null;
  /** Estado del traslado (S8). `null` fuera de `transport` y en trabajos anteriores a S8 (default seguro). */
  readonly transport: TransportJobState | null;
  /**
   * Trabajo total real de este trabajo concreto cuando difiere del valor de
   * referencia del método (S9: puerta frente a portón, receta de la
   * instalación, m² de huella). `null` = `baseWorkUnits` del método. Opcional
   * en el tipo y con `.default(null)` en el esquema.
   */
  readonly workTotalUnits?: number | null;
  readonly createdAtSimSeconds: number;
  readonly updatedAtSimSeconds: number;
}

export const jobSchema = z.object({
  id: z.string(),
  origin: z.enum(JOB_ORIGINS),
  causingCommandOrDesignationId: z.string().nullable(),
  actionKey: z.string(),
  methodVersion: z.number().int().positive(),
  target: jobTargetSchema,
  effectivePriority: z.enum(PRIORITY_IDS),
  location: entityLocationSchema,
  urgency: z.number(),
  knowledgeUsed: z.array(z.object({ entityId: z.string(), facet: z.enum(DISCOVERY_FACETS) })),
  phases: z.array(jobPhaseSchema),
  currentPhaseIndex: z.number().int().nonnegative(),
  assignments: z.array(assignmentSchema),
  requestedPersonIds: z.array(z.string()),
  desiredTeamSize: z.number().int().min(0).max(4),
  pace: z.enum(PACE_MODES),
  attention: z.enum(ATTENTION_MODES),
  timeLimit: jobTimeLimitSchema.nullable(),
  responsePolicy: z.enum(RESPONSE_POLICIES),
  state: z.enum(JOB_STATES),
  blockReasonKey: z.string().nullable(),
  reservationIds: z.array(z.string()),
  episodeIds: z.array(z.string()),
  progressRatio: z.number().min(0).max(1),
  workRemainingUnits: z.number().nonnegative(),
  workRateVariation: z.number().min(-0.08).max(0.08).nullable(),
  directOrder: z.boolean(),
  disassemblyScope: z.enum(["selective", "destructive"]).nullable().default(null),
  irreversibleConfirmed: z.boolean().default(false),
  storageItem: z
    .object({ kind: z.enum(["world_object", "resource_lot"]), id: z.string() })
    .nullable()
    .default(null),
  storageQuantity: z.number().positive().nullable().default(null),
  transport: transportJobStateSchema.nullable().default(null),
  workTotalUnits: z.number().positive().nullable().default(null),
  createdAtSimSeconds: z.number().int().nonnegative(),
  updatedAtSimSeconds: z.number().int().nonnegative(),
});

export const RESERVATION_TARGET_KINDS = [
  "world_object",
  "resource_lot",
  "transport_means",
  "person",
  "room",
  "furniture",
  "container",
  /** S9: accesos, edificios (desmantelar/demoler), instalaciones y acabados se comprometen en exclusiva. */
  "opening",
  "building",
  "building_installation",
  "building_finish",
  /** S10: superficie de fondo, tramo de vía, parcela de cultivo y tramo de barrera se comprometen en exclusiva (evita que dos trabajos despejen o siembren la misma superficie a la vez). */
  "terrain_area",
  "linear_feature",
  "cultivation_plot",
  "barrier_segment",
] as const;
export type ReservationTargetKind = (typeof RESERVATION_TARGET_KINDS)[number];

export const RESERVATION_RELEASE_POLICIES = ["on_job_end", "on_phase_end", "manual"] as const;
export type ReservationReleasePolicy = (typeof RESERVATION_RELEASE_POLICIES)[number];

export interface Reservation {
  readonly id: string;
  readonly targetKind: ReservationTargetKind;
  readonly targetId: string;
  readonly quantity: number | null;
  readonly jobId: string;
  readonly phase: JobPhaseKind;
  readonly releasePolicy: ReservationReleasePolicy;
  readonly createdAtSimSeconds: number;
}

export const reservationSchema = z.object({
  id: z.string(),
  targetKind: z.enum(RESERVATION_TARGET_KINDS),
  targetId: z.string(),
  quantity: z.number().positive().nullable(),
  jobId: z.string(),
  phase: z.enum(JOB_PHASE_KINDS),
  releasePolicy: z.enum(RESERVATION_RELEASE_POLICIES),
  createdAtSimSeconds: z.number().int().nonnegative(),
});
