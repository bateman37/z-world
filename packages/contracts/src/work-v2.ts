import { z } from "zod";
import { entityLocationSchema, type EntityLocation } from "./location-v2.js";
import { PRIORITY_IDS, type PriorityId } from "./catalog-ids.js";

/** Trabajos, zonas y designaciones mínimos de WEB-002 §6.3/§11. Forma esquelética (S1); planificador real en S5. */

export const ZONE_POLICIES = ["habitual", "precaution", "forbidden"] as const;
export type ZonePolicy = (typeof ZONE_POLICIES)[number];

export interface WorkZone {
  readonly id: string;
  readonly polygon: readonly { readonly x: number; readonly y: number }[];
  readonly policy: ZonePolicy;
}

export const workZoneSchema = z.object({
  id: z.string(),
  polygon: z.array(z.object({ x: z.number(), y: z.number() })).min(3),
  policy: z.enum(ZONE_POLICIES),
});

export const DESIGNATION_KINDS = [
  "clear_area",
  "cut_vegetation",
  "prepare_soil",
  "harvest",
  "remove_known_objects",
  "build_barrier",
] as const;
export type DesignationKind = (typeof DESIGNATION_KINDS)[number];

export interface Designation {
  readonly id: string;
  readonly kind: DesignationKind;
  readonly areaOrLinePolygon: readonly { readonly x: number; readonly y: number }[];
  readonly generatedJobIds: readonly string[];
}

export const designationSchema = z.object({
  id: z.string(),
  kind: z.enum(DESIGNATION_KINDS),
  areaOrLinePolygon: z.array(z.object({ x: z.number(), y: z.number() })).min(1),
  generatedJobIds: z.array(z.string()),
});

export const JOB_ORIGINS = ["direct_order", "zone_policy", "systemic_need"] as const;
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

export interface WorkEpisode {
  readonly id: string;
  readonly marginPrevious: number;
  readonly marginFinal: number;
  readonly variationB: number;
}

export const workEpisodeSchema = z.object({
  id: z.string(),
  marginPrevious: z.number(),
  marginFinal: z.number(),
  variationB: z.number().min(-4).max(4),
});

export interface Job {
  readonly id: string;
  readonly origin: JobOrigin;
  readonly causingCommandOrDesignationId: string | null;
  readonly actionKey: string;
  readonly effectivePriority: PriorityId;
  readonly location: EntityLocation;
  readonly urgency: number;
  readonly phases: readonly JobPhase[];
  readonly assignments: readonly Assignment[];
  readonly desiredTeamSize: number;
  readonly pace: PaceMode;
  readonly attention: AttentionMode;
  readonly responsePolicy: ResponsePolicy;
  readonly state: JobState;
  readonly blockReasonKey: string | null;
  readonly reservationIds: readonly string[];
  readonly episodeIds: readonly string[];
  readonly progressRatio: number;
  readonly createdAtSimSeconds: number;
}

export const jobSchema = z.object({
  id: z.string(),
  origin: z.enum(JOB_ORIGINS),
  causingCommandOrDesignationId: z.string().nullable(),
  actionKey: z.string(),
  effectivePriority: z.enum(PRIORITY_IDS),
  location: entityLocationSchema,
  urgency: z.number(),
  phases: z.array(jobPhaseSchema),
  assignments: z.array(assignmentSchema),
  desiredTeamSize: z.number().int().min(0).max(4),
  pace: z.enum(PACE_MODES),
  attention: z.enum(ATTENTION_MODES),
  responsePolicy: z.enum(RESPONSE_POLICIES),
  state: z.enum(JOB_STATES),
  blockReasonKey: z.string().nullable(),
  reservationIds: z.array(z.string()),
  episodeIds: z.array(z.string()),
  progressRatio: z.number().min(0).max(1),
  createdAtSimSeconds: z.number().int().nonnegative(),
});

export const RESERVATION_TARGET_KINDS = ["world_object", "resource_lot", "transport_means", "person", "room"] as const;
export type ReservationTargetKind = (typeof RESERVATION_TARGET_KINDS)[number];

export interface Reservation {
  readonly id: string;
  readonly targetKind: ReservationTargetKind;
  readonly targetId: string;
  readonly quantity: number | null;
  readonly jobId: string;
  readonly phase: JobPhaseKind;
}

export const reservationSchema = z.object({
  id: z.string(),
  targetKind: z.enum(RESERVATION_TARGET_KINDS),
  targetId: z.string(),
  quantity: z.number().positive().nullable(),
  jobId: z.string(),
  phase: z.enum(JOB_PHASE_KINDS),
});
