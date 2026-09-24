import type { CausalSequenceCounters, NeedState, PersonStateV2, WorldPoint } from "@z-world/contracts";
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
  readonly sequences: CausalSequenceCounters;
}

export function generatePeopleAtArrival(
  seed: string,
  prng: PrngStream,
  sequencesIn: CausalSequenceCounters,
  arrivalPoint: WorldPoint,
): PeopleResult {
  const cohort = generateCohort(seed, prng, sequencesIn);
  const people: Record<string, PersonStateV2> = {};

  for (const [index, personId] of cohort.peopleOrder.entries()) {
    const person = cohort.people[personId];
    if (!person) continue;

    // Las pertenencias (arma, mochila y el presupuesto de grupo de SCN-003)
    // se materializan como objetos reales en `belongings.ts` (S7, v2 del
    // generador), a partir de estas mismas `possessions` y con sus mismos IDs.

    // Nadie empieza condenado por el tuning, pero al menos una persona llega
    // especialmente fatigada tras cuatro días de marcha (§14.2 del prompt
    // de subhitos S4-S6): la primera del orden estable de la cohorte.
    const needsForPerson =
      index === 0
        ? INITIAL_NEEDS.map((n) => (n.dimension === "rest" ? { ...n, value: 16 } : n))
        : INITIAL_NEEDS;

    people[personId] = {
      public: { ...person.public, position: arrivalPoint },
      hidden: person.hidden,
      needs: needsForPerson.map((n) => ({ ...n, band: needBandFor(n.value) })),
      location: { kind: "world_point", point: arrivalPoint },
      carriedLoadBundleId: null,
      activeJobId: null,
    };
  }

  return { people, peopleOrder: [...cohort.peopleOrder], sequences: cohort.sequences };
}
