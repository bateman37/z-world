import { z } from "zod";
import { CHARACTERISTIC_IDS, PRIORITY_IDS, SKILL_IDS, type CharacteristicId, type PriorityId, type SkillId } from "./catalog-ids.js";
import { DISCOVERY_FACETS, KNOWLEDGE_STATES, type DiscoveryFacet, type KnowledgeState } from "./place-history-v2.js";
import { JOB_PHASE_KINDS, JOB_ROLES, type JobPhaseKind, type JobRole } from "./work-v2.js";

/**
 * Catálogo validado de acciones/métodos activos del motor común de
 * resolución (WEB-002 §5.2/§12.2, subhito S4). Datos puros versionados: la
 * tubería de resolución (`resolve-action.ts`) es la única lógica; aquí solo
 * se declara qué exige y qué produce cada método. No es el catálogo
 * completo del horizonte (recoger/transportar/reparar/desmontar/agricultura
 * llegan en S7-S10): S4-S6 solo activa los métodos mínimos exigidos por el
 * prompt de subhitos (reconocer, observar, inspeccionar, registrar, beber,
 * comer, descansar).
 */

export const ACTION_TARGET_KINDS = [
  "place",
  "building",
  "room",
  "opening",
  "resource_lot",
  "furniture",
  "world_object",
  "area",
  "own_need",
] as const;
export type ActionTargetKind = (typeof ACTION_TARGET_KINDS)[number];

export const CAPACITY_PROFILES = ["physical_70_30", "balanced_50_50", "technical_30_70"] as const;
export type CapacityProfile = (typeof CAPACITY_PROFILES)[number];

export const ACTION_CLASSIFICATIONS = ["open", "improvisable", "guided", "restricted"] as const;
export type ActionClassification = (typeof ACTION_CLASSIFICATIONS)[number];

export const RESOLUTION_MODELS = ["direct", "d", "b", "d_then_b"] as const;
export type ResolutionModel = (typeof RESOLUTION_MODELS)[number];

/** Requisito duro declarativo: comprobado por la tubería contra el estado real, nunca sustituido por una tirada (§5.4/§12.4). */
export const HARD_REQUIREMENT_KINDS = [
  "known_target",
  "requires_container_or_lot_present",
  "requires_rest_support",
  "requires_shared_location_or_reach",
  "requires_capacity_at_least",
  "requires_known_method",
] as const;
export type HardRequirementKind = (typeof HARD_REQUIREMENT_KINDS)[number];

export interface HardRequirement {
  readonly kind: HardRequirementKind;
  /** Umbral opcional pertinente al tipo de requisito (p. ej. capacidad mínima 0-10). */
  readonly threshold?: number;
}

export const hardRequirementSchema = z.object({
  kind: z.enum(HARD_REQUIREMENT_KINDS),
  threshold: z.number().optional(),
});

export interface KnowledgeRequirement {
  readonly facet: DiscoveryFacet;
  readonly minimumState: KnowledgeState;
}
export const knowledgeRequirementSchema = z.object({
  facet: z.enum(DISCOVERY_FACETS),
  minimumState: z.enum(KNOWLEDGE_STATES),
});

export interface KnowledgeReveal {
  readonly facet: DiscoveryFacet;
  readonly state: KnowledgeState;
}
export const knowledgeRevealSchema = z.object({
  facet: z.enum(DISCOVERY_FACETS),
  state: z.enum(KNOWLEDGE_STATES),
});

/**
 * Definición versionada de un método activo (§5.2/§12.2). `phases` usa
 * únicamente la gramática común de §11.3/§6.1; una acción sencilla omite
 * fases logísticas que no le aplican.
 */
export interface ActionMethodDefinition {
  readonly key: string;
  readonly version: number;
  readonly labelKey: string;
  readonly descriptionKey: string;
  readonly targetKinds: readonly ActionTargetKind[];
  readonly requiredKnowledge: readonly KnowledgeRequirement[];
  readonly revealsKnowledge: readonly KnowledgeReveal[];
  readonly priority: PriorityId;
  readonly characteristicIds: readonly CharacteristicId[];
  readonly skillIds: readonly SkillId[];
  readonly profile: CapacityProfile;
  readonly classification: ActionClassification;
  readonly hardRequirements: readonly HardRequirement[];
  /** Dificultad efectiva interna (0-10), nunca mostrada al jugador. Un solo valor representativo por método en este recorte; puede variar por fase en catálogos futuros. */
  readonly difficulty: number;
  readonly model: ResolutionModel;
  /** Trabajo base en `unit` para el modelo D (S4 §5.5). Ignorado en métodos puramente directos/B. */
  readonly baseWorkUnits: number;
  readonly unit: "minutes" | "liters" | "portions";
  readonly minParticipants: number;
  readonly recommendedParticipants: number;
  readonly maxParticipants: number;
  readonly rolesAllowed: readonly JobRole[];
  readonly phases: readonly JobPhaseKind[];
  readonly paceApplies: boolean;
  readonly attentionApplies: boolean;
}

export const actionMethodDefinitionSchema = z.object({
  key: z.string().min(1),
  version: z.number().int().positive(),
  labelKey: z.string(),
  descriptionKey: z.string(),
  targetKinds: z.array(z.enum(ACTION_TARGET_KINDS)).min(1),
  requiredKnowledge: z.array(knowledgeRequirementSchema),
  revealsKnowledge: z.array(knowledgeRevealSchema),
  priority: z.enum(PRIORITY_IDS),
  characteristicIds: z.array(z.enum(CHARACTERISTIC_IDS)).max(2),
  skillIds: z.array(z.enum(SKILL_IDS)).max(2),
  profile: z.enum(CAPACITY_PROFILES),
  classification: z.enum(ACTION_CLASSIFICATIONS),
  hardRequirements: z.array(hardRequirementSchema),
  difficulty: z.number().min(0).max(10),
  model: z.enum(RESOLUTION_MODELS),
  baseWorkUnits: z.number().nonnegative(),
  unit: z.enum(["minutes", "liters", "portions"]),
  minParticipants: z.number().int().min(1),
  recommendedParticipants: z.number().int().min(1),
  maxParticipants: z.number().int().min(1),
  rolesAllowed: z.array(z.enum(JOB_ROLES)).min(1),
  phases: z.array(z.enum(JOB_PHASE_KINDS)).min(1),
  paceApplies: z.boolean(),
  attentionApplies: z.boolean(),
});

/** Bandas internas exactas del modelo B (§12.6), nunca mostradas al jugador. */
export const OUTCOME_BANDS = ["exceptional", "favorable", "uncertain", "recoverable_poor", "severe"] as const;
export type OutcomeBand = (typeof OUTCOME_BANDS)[number];

export function bandForMargin(marginFinal: number): OutcomeBand {
  if (marginFinal >= 3) return "exceptional";
  if (marginFinal >= 1) return "favorable";
  if (marginFinal >= -1) return "uncertain";
  if (marginFinal > -3) return "recoverable_poor";
  return "severe";
}
