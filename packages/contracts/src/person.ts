import { z } from "zod";
import type { PersonId, PlaceId } from "./ids.js";
import type { CharacteristicId, PriorityId, SkillId } from "./catalog-ids.js";
import { priorityValueSchema, type PriorityValue } from "./priority-value.js";
import { worldPointSchema, type WorldPoint } from "./geometry.js";

/** Nivel actual visible de una característica o habilidad, escala 0–10. */
export type CurrentLevel = number;
export const currentLevelSchema = z.number().int().min(0).max(10);

/** Media humana de referencia para características (CHR-006/DEC-0011). */
export const HUMAN_AVERAGE_CHARACTERISTIC_LEVEL = 4;

export const OPERATIONAL_STATES = [
  "awaiting_orders",
  "accepting_order",
  "moving",
  "arrival_completed",
  "blocked",
  "order_cancelled",
] as const;
export type OperationalState = (typeof OPERATIONAL_STATES)[number];
export const operationalStateSchema = z.enum(OPERATIONAL_STATES);

/** Frases cualitativas de potencial sin cifras (CHR-007 §3.9). */
export const POTENTIAL_PHRASE_KEYS = [
  "insufficient_evidence",
  "can_improve_enormously",
  "much_room",
  "notable_room",
  "moderate_room",
  "levelling_off",
  "near_maximum",
  "almost_fully_developed",
] as const;
export type PotentialPhraseKey = (typeof POTENTIAL_PHRASE_KEYS)[number];

/**
 * Calibre oculto de la cohorte protagonista (§10.5 de WEB-001). Solo la
 * mínima representación interna necesaria para la garantía de plazas; no es
 * una decisión canónica cerrada de los 34 techos de CHR-007. Nunca se
 * expone a presentación.
 */
export type HiddenCaliberTier = 3 | 4 | 5;
export const hiddenCaliberTierSchema = z.union([z.literal(3), z.literal(4), z.literal(5)]);

export interface RelationshipLink {
  readonly withPersonId: PersonId;
  readonly kind: "prior_bond" | "forged_during_crisis" | "strained_by_recent_decision" | "recently_joined_low_trust" | "vouches_for_newcomer";
  readonly descriptionKey: string;
}

export interface PossessionItem {
  readonly id: string;
  readonly labelKey: string;
  readonly isMeleeOrImprovisedWeapon: boolean;
}

export interface BiographySummary {
  readonly originKey: string;
  readonly professionKey: string;
  readonly experienceSummaryKey: string;
  readonly hobbiesKey: string;
  readonly strengthsKey: string;
  readonly limitationsKey: string;
}

export interface ArrivalCondition {
  readonly daysTravelled: number;
  readonly fatigueDescriptionKey: string;
  readonly restDeficitDescriptionKey: string;
  readonly remainingDaylightApproxMinutes: number;
  readonly notableHardshipKey: string;
}

/**
 * Punto de la ruta en el que la ubicación lógica de la persona cambia
 * (exterior ↔ estancia), expresado como distancia acumulada recorrida.
 * Campo aditivo usado solo por el runtime V2 (S3 de WEB-002): V1 nunca lo
 * rellena, así que las órdenes V1 siguen siendo válidas sin él.
 */
export interface MovementLocationCheckpoint {
  readonly afterDistanceMeters: number;
  readonly location: { readonly kind: "exterior" } | { readonly kind: "room"; readonly roomId: string };
}

export interface MovementOrder {
  readonly commandId: string;
  readonly destination: WorldPoint;
  readonly path: readonly WorldPoint[];
  readonly totalDistanceMeters: number;
  readonly travelledDistanceMeters: number;
  readonly startedAtSimSeconds: number;
  readonly locationCheckpoints?: readonly MovementLocationCheckpoint[];
  /** Aberturas que atraviesa la ruta, en orden (S9: invalidación dirigida al cambiar un acceso). Opcional: órdenes anteriores a S9 no lo tienen. */
  readonly crossedOpeningIds?: readonly string[];
}

/** Hechos públicos de una persona: todo lo que puede llegar a presentación. */
export interface PersonPublicFacts {
  readonly id: PersonId;
  readonly firstName: string;
  readonly lastName: string;
  readonly ageYears: number;
  readonly biography: BiographySummary;
  readonly characteristics: Readonly<Record<CharacteristicId, CurrentLevel>>;
  readonly skills: Readonly<Record<SkillId, CurrentLevel>>;
  readonly potentialPhraseByCharacteristic: Readonly<Record<CharacteristicId, PotentialPhraseKey>>;
  readonly potentialPhraseBySkill: Readonly<Record<SkillId, PotentialPhraseKey>>;
  readonly priorities: Readonly<Record<PriorityId, PriorityValue>>;
  readonly relationships: readonly RelationshipLink[];
  readonly sharedEventInterpretationKey: string;
  readonly possessions: readonly PossessionItem[];
  readonly arrivalCondition: ArrivalCondition;
  readonly operationalState: OperationalState;
  readonly position: WorldPoint;
  readonly activeMovementOrder: MovementOrder | null;
  readonly lastBlockReasonKey: string | null;
}

/** Hechos ocultos: nunca se serializan hacia una proyección de presentación. */
export interface PersonHiddenFacts {
  readonly caliberTier: HiddenCaliberTier;
}

export interface PersonState {
  readonly public: PersonPublicFacts;
  readonly hidden: PersonHiddenFacts;
}

const relationshipLinkSchema = z.object({
  withPersonId: z.string(),
  kind: z.enum([
    "prior_bond",
    "forged_during_crisis",
    "strained_by_recent_decision",
    "recently_joined_low_trust",
    "vouches_for_newcomer",
  ]),
  descriptionKey: z.string(),
});

export const personPublicFactsSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  ageYears: z.number().int().min(18).max(90),
  biography: z.object({
    originKey: z.string(),
    professionKey: z.string(),
    experienceSummaryKey: z.string(),
    hobbiesKey: z.string(),
    strengthsKey: z.string(),
    limitationsKey: z.string(),
  }),
  characteristics: z.record(z.string(), currentLevelSchema),
  skills: z.record(z.string(), currentLevelSchema),
  potentialPhraseByCharacteristic: z.record(z.string(), z.enum(POTENTIAL_PHRASE_KEYS)),
  potentialPhraseBySkill: z.record(z.string(), z.enum(POTENTIAL_PHRASE_KEYS)),
  priorities: z.record(z.string(), priorityValueSchema),
  relationships: z.array(relationshipLinkSchema),
  sharedEventInterpretationKey: z.string(),
  possessions: z.array(
    z.object({
      id: z.string(),
      labelKey: z.string(),
      isMeleeOrImprovisedWeapon: z.boolean(),
    }),
  ),
  arrivalCondition: z.object({
    daysTravelled: z.number().int().nonnegative(),
    fatigueDescriptionKey: z.string(),
    restDeficitDescriptionKey: z.string(),
    remainingDaylightApproxMinutes: z.number().int().nonnegative(),
    notableHardshipKey: z.string(),
  }),
  operationalState: operationalStateSchema,
  position: worldPointSchema,
  activeMovementOrder: z
    .object({
      commandId: z.string(),
      destination: worldPointSchema,
      path: z.array(worldPointSchema),
      totalDistanceMeters: z.number().nonnegative(),
      travelledDistanceMeters: z.number().nonnegative(),
      startedAtSimSeconds: z.number().int().nonnegative(),
      locationCheckpoints: z
        .array(
          z.object({
            afterDistanceMeters: z.number().nonnegative(),
            location: z.discriminatedUnion("kind", [
              z.object({ kind: z.literal("exterior") }),
              z.object({ kind: z.literal("room"), roomId: z.string() }),
            ]),
          }),
        )
        .optional(),
      crossedOpeningIds: z.array(z.string()).optional(),
    })
    .nullable(),
  lastBlockReasonKey: z.string().nullable(),
});

export const personHiddenFactsSchema = z.object({
  caliberTier: hiddenCaliberTierSchema,
});

export const personStateSchema = z.object({
  public: personPublicFactsSchema,
  hidden: personHiddenFactsSchema,
});

export type { PersonId, PlaceId };
