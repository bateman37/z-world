import type { CausalSequenceCounters, NeedState, PersonStateV2, WorldObject, WorldPoint } from "@z-world/contracts";
import { needBandFor } from "@z-world/contracts";
import type { PrngStream } from "../../prng.js";
import { generateCohort } from "../../cohort/generate.js";

/**
 * Ubicación inicial de los seis protagonistas y materialización de sus
 * pertenencias como `WorldObject` reales del mundo V2 (§6.4 de WEB-002:
 * todo objeto tiene una única ubicación canónica; una posesión personal
 * nunca es una fuente de verdad aparte). Reutiliza `generateCohort` de
 * WEB-001 sin cambios: la cohorte protagonista ya es correcta y
 * determinista; S2 solo la reubica en el mundo semántico real y le añade
 * necesidades iniciales.
 */
const INITIAL_NEEDS: readonly Omit<NeedState, "band">[] = [
  { dimension: "hydration", value: 55 },
  { dimension: "nutrition", value: 55 },
  { dimension: "rest", value: 35 },
];

export interface PeopleResult {
  readonly people: Record<string, PersonStateV2>;
  readonly peopleOrder: string[];
  readonly worldObjects: WorldObject[];
  readonly sequences: CausalSequenceCounters;
}

export function generatePeopleAtArrival(
  seed: string,
  prng: PrngStream,
  sequencesIn: CausalSequenceCounters,
  arrivalPoint: WorldPoint,
): PeopleResult {
  const cohort = generateCohort(seed, prng, sequencesIn);
  const worldObjects: WorldObject[] = [];
  const people: Record<string, PersonStateV2> = {};

  for (const personId of cohort.peopleOrder) {
    const person = cohort.people[personId];
    if (!person) continue;

    for (const possession of person.public.possessions) {
      worldObjects.push({
        id: possession.id,
        family: possession.isMeleeOrImprovisedWeapon ? "improvised_tool_or_weapon" : "transport_container",
        variant: possession.labelKey,
        location: { kind: "carried_by_person", personId },
        ownerOrReservedByJobId: null,
        weightKg: possession.isMeleeOrImprovisedWeapon ? 1.2 : 2.5,
        bulk: "small",
        condition: 0.8,
        quality: 0.5,
        functionalState: "functional",
      });
    }

    people[personId] = {
      public: { ...person.public, position: arrivalPoint },
      hidden: person.hidden,
      needs: INITIAL_NEEDS.map((n) => ({ ...n, band: needBandFor(n.value) })),
      location: { kind: "world_point", point: arrivalPoint },
      carriedLoadBundleId: null,
      activeJobId: null,
    };
  }

  return { people, peopleOrder: [...cohort.peopleOrder], worldObjects, sequences: cohort.sequences };
}
