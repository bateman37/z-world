import {
  CHARACTERISTIC_IDS,
  HUMAN_AVERAGE_CHARACTERISTIC_LEVEL,
  PRIORITY_IDS,
  SKILL_IDS,
  type CausalSequenceCounters,
  type CharacteristicId,
  type CurrentLevel,
  type HiddenCaliberTier,
  type PersonId,
  type PersonState,
  type PotentialPhraseKey,
  type PriorityValue,
  type RelationshipLink,
  type SkillId,
} from "@z-world/contracts";
import { PrngStream } from "../prng.js";
import { nextPersonId } from "../sequences.js";
import { COHORT_ARCHETYPES } from "./archetypes.js";
import { FIRST_NAMES, LAST_NAMES } from "./names.js";

export const COHORT_SIZE = 6;
/** Plazas mínimas de calibre oculto de la cohorte protagonista (§10.5). */
const CALIBER_SLOTS: readonly HiddenCaliberTier[] = [5, 4, 4, 3, 3, 3];

const ARRIVAL_ARM_LABEL_KEYS = ["possession.kitchen_knife", "possession.hiking_axe", "possession.iron_pipe", "possession.wood_axe"] as const;

export interface CohortGenerationResult {
  readonly peopleOrder: readonly PersonId[];
  readonly people: Readonly<Record<PersonId, PersonState>>;
  readonly sequences: CausalSequenceCounters;
}

function clampLevel(value: number): CurrentLevel {
  return Math.max(0, Math.min(10, Math.round(value)));
}

function generateCharacteristics(
  prng: PrngStream,
  biased: readonly CharacteristicId[],
): Record<CharacteristicId, CurrentLevel> {
  const result = {} as Record<CharacteristicId, CurrentLevel>;
  for (const id of CHARACTERISTIC_IDS) {
    const variance = prng.nextInt(-2, 2);
    const bias = biased.includes(id) ? prng.nextInt(1, 2) : 0;
    result[id] = clampLevel(HUMAN_AVERAGE_CHARACTERISTIC_LEVEL + variance + bias);
  }
  return result;
}

function generateSkills(
  prng: PrngStream,
  signatureSkills: readonly SkillId[],
  signatureLevelRange: readonly [number, number],
): Record<SkillId, CurrentLevel> {
  const result = {} as Record<SkillId, CurrentLevel>;
  for (const id of SKILL_IDS) {
    if (signatureSkills.includes(id)) {
      result[id] = clampLevel(prng.nextInt(signatureLevelRange[0], signatureLevelRange[1]));
    } else {
      result[id] = clampLevel(prng.nextInt(0, 3));
    }
  }
  return result;
}

function insufficientEvidencePhrases<T extends string>(ids: readonly T[]): Record<T, PotentialPhraseKey> {
  const result = {} as Record<T, PotentialPhraseKey>;
  for (const id of ids) result[id] = "insufficient_evidence";
  return result;
}

function generatePriorities(): Record<string, PriorityValue> {
  const result: Record<string, PriorityValue> = {};
  for (const id of PRIORITY_IDS) result[id] = 3;
  // Emergencias empieza en la máxima prioridad por defecto: es la única
  // disposición inicial no neutra, coherente con SCN-003 (llegada tensa).
  result.emergency_response = 1;
  return result;
}

interface RelationshipPlan {
  readonly fromIndex: number;
  readonly toIndex: number;
  readonly fromKind: RelationshipLink["kind"];
  readonly toKind: RelationshipLink["kind"];
  readonly descriptionKey: string;
}

/**
 * Red de relaciones fija que satisface todas las condiciones de SCN-002
 * (dos pares con relación previa, un vínculo fuerte positivo, un vínculo
 * nacido durante el desastre, una relación deteriorada, una persona recién
 * incorporada con confianza limitada y quien responde por ella, nadie
 * aislado, ningún líder oficial impuesto). Es estructural, no depende del
 * azar, para que la garantía se cumpla en todas las semillas.
 */
const RELATIONSHIP_PLAN: readonly RelationshipPlan[] = [
  { fromIndex: 0, toIndex: 1, fromKind: "prior_bond", toKind: "prior_bond", descriptionKey: "relationship.strong_prior_bond" },
  { fromIndex: 2, toIndex: 3, fromKind: "prior_bond", toKind: "prior_bond", descriptionKey: "relationship.prior_acquaintance" },
  { fromIndex: 1, toIndex: 2, fromKind: "forged_during_crisis", toKind: "forged_during_crisis", descriptionKey: "relationship.forged_during_the_march" },
  { fromIndex: 3, toIndex: 4, fromKind: "strained_by_recent_decision", toKind: "strained_by_recent_decision", descriptionKey: "relationship.strained_by_recent_decision" },
  { fromIndex: 0, toIndex: 5, fromKind: "vouches_for_newcomer", toKind: "recently_joined_low_trust", descriptionKey: "relationship.newcomer_vouched_for" },
];

function buildRelationships(personIds: readonly PersonId[]): RelationshipLink[][] {
  const relationships: RelationshipLink[][] = personIds.map(() => []);
  for (const plan of RELATIONSHIP_PLAN) {
    relationships[plan.fromIndex]!.push({
      withPersonId: personIds[plan.toIndex]!,
      kind: plan.fromKind,
      descriptionKey: plan.descriptionKey,
    });
    relationships[plan.toIndex]!.push({
      withPersonId: personIds[plan.fromIndex]!,
      kind: plan.toKind,
      descriptionKey: plan.descriptionKey,
    });
  }
  return relationships;
}

/**
 * Genera exactamente seis protagonistas procedurales a partir del stream
 * `cohort` del PRNG de la partida (§10 de WEB-001). Determinista: la misma
 * semilla produce siempre la misma cohorte.
 */
export function generateCohort(
  seed: string,
  prng: PrngStream,
  sequencesIn: CausalSequenceCounters,
): CohortGenerationResult {
  let sequences = sequencesIn;
  const personIds: PersonId[] = [];
  for (let i = 0; i < COHORT_SIZE; i++) {
    const result = nextPersonId(seed, sequences);
    personIds.push(result.personId);
    sequences = result.sequences;
  }

  const archetypeAssignment = prng.shuffle(COHORT_ARCHETYPES);
  const caliberAssignment = prng.shuffle(CALIBER_SLOTS);
  // Como máximo una o dos personas empiezan siendo especialistas realmente
  // sobresalientes (nivel 8-9); al menos dos carecen de especialización
  // destacada (todas sus habilidades quedan en 0-4). El resto es competente
  // sin ser sobresaliente (5-6).
  const outstandingCount = prng.nextInt(1, 2);
  const generalistIndexes = new Set(prng.shuffle([...Array(COHORT_SIZE).keys()]).slice(0, 2));
  const outstandingIndexes = new Set(
    prng
      .shuffle([...Array(COHORT_SIZE).keys()].filter((i) => !generalistIndexes.has(i)))
      .slice(0, outstandingCount),
  );

  const shuffledFirstNames = prng.shuffle(FIRST_NAMES).slice(0, COHORT_SIZE);
  const shuffledLastNames = prng.shuffle(LAST_NAMES).slice(0, COHORT_SIZE);

  const relationshipsByIndex = buildRelationships(personIds);

  const people: Record<PersonId, PersonState> = {};

  for (let i = 0; i < COHORT_SIZE; i++) {
    const personId = personIds[i]!;
    const archetype = archetypeAssignment[i]!;
    const caliberTier = caliberAssignment[i]!;

    // El mínimo de cobertura colectiva (§10.4) exige que el arquetipo de
    // cada persona alcance un nivel útil en su(s) habilidad(es) de firma
    // incluso cuando esa persona es la "generalista" sin especialización
    // destacada (§10.3): su firma llega a la media humana alta (3-4), útil
    // pero nunca "sobresaliente"; nunca queda en 0-2 como el resto de su
    // ficha.
    const signatureLevelRange: [number, number] = generalistIndexes.has(i)
      ? [4, 5]
      : outstandingIndexes.has(i)
        ? [8, 9]
        : [5, 7];

    const characteristics = generateCharacteristics(prng, archetype.biasedCharacteristics);
    const skills = generateSkills(prng, archetype.signatureSkills, signatureLevelRange);

    // Carencia avanzada relevante: la primera persona generalista pierde
    // por completo una habilidad ajena a su arquetipo (nunca una signature).
    if (i === [...generalistIndexes][0]) {
      const nonSignature = SKILL_IDS.filter((id) => !archetype.signatureSkills.includes(id));
      const gap = prng.pick(nonSignature);
      skills[gap] = 0;
    }

    const possessionPool = ARRIVAL_ARM_LABEL_KEYS;
    const weaponLabelKey = prng.pick(possessionPool);

    const person: PersonState = {
      public: {
        id: personId,
        firstName: shuffledFirstNames[i]!,
        lastName: shuffledLastNames[i]!,
        ageYears: prng.nextInt(20, 58),
        biography: {
          originKey: "biography.origin.regional_town",
          professionKey: archetype.professionKey,
          experienceSummaryKey: `${archetype.professionKey}.experience`,
          hobbiesKey: archetype.hobbiesKey,
          strengthsKey: `${archetype.id}.strengths`,
          limitationsKey: `${archetype.id}.limitations`,
        },
        characteristics,
        skills,
        potentialPhraseByCharacteristic: insufficientEvidencePhrases(CHARACTERISTIC_IDS),
        potentialPhraseBySkill: insufficientEvidencePhrases(SKILL_IDS),
        priorities: generatePriorities() as PersonState["public"]["priorities"],
        relationships: relationshipsByIndex[i]!,
        sharedEventInterpretationKey: `shared_event.interpretation.${archetype.id}`,
        possessions: [
          { id: `${personId}-weapon`, labelKey: weaponLabelKey, isMeleeOrImprovisedWeapon: true },
          { id: `${personId}-pack`, labelKey: "possession.personal_pack", isMeleeOrImprovisedWeapon: false },
        ],
        arrivalCondition: {
          daysTravelled: 4,
          fatigueDescriptionKey: "arrival.fatigue.significant",
          restDeficitDescriptionKey: "arrival.rest_deficit.two_short_nights",
          remainingDaylightApproxMinutes: 120,
          notableHardshipKey: "arrival.hardship.scarce_water",
        },
        operationalState: "awaiting_orders",
        position: { x: 0, y: 0 },
        activeMovementOrder: null,
        lastBlockReasonKey: null,
      },
      hidden: {
        caliberTier,
      },
    };

    people[personId] = person;
  }

  return { peopleOrder: personIds, people, sequences };
}
