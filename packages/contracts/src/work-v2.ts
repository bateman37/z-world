import { z } from "zod";
import { entityLocationSchema, type EntityLocation } from "./location-v2.js";
import { PRIORITY_IDS, type PriorityId } from "./catalog-ids.js";
import { DISCOVERY_FACETS, type DiscoveryFacet } from "./place-history-v2.js";
import { NEED_DIMENSIONS, type NeedDimension } from "./needs-v2.js";
import { worldPointSchema, type WorldPoint } from "./geometry.js";

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

/** Designaciones ejecutables en S4-S6; las demás quedan en contrato para S7-S10 (§6.8). */
export const EXECUTABLE_DESIGNATION_KINDS: readonly DesignationKind[] = ["systematic_recon"];

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
  | { readonly kind: "area"; readonly polygon: readonly WorldPoint[] }
  | { readonly kind: "own_need"; readonly personId: string; readonly dimension: NeedDimension };

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
  z.object({ kind: z.literal("area"), polygon: z.array(worldPointSchema) }),
  z.object({ kind: z.literal("own_need"), personId: z.string(), dimension: z.enum(NEED_DIMENSIONS) }),
]);

/** Referencia a un objeto o lote que un trabajo de almacenamiento mueve (S7). */
export interface StorageItemRef {
  readonly kind: "world_object" | "resource_lot";
  readonly id: string;
}

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
