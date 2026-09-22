import {
  ARRIVAL_ELAPSED_SIM_SECONDS,
  SIMULATION_STATE_SCHEMA_VERSION,
  type SimulationStateV1,
} from "@z-world/contracts";
import { createPrngStateByDomain, PrngStream } from "./prng.js";
import { generateLocalSectorFixture, FIXTURE_GENERATOR_VERSION } from "./world-fixture.js";
import { createInitialFogGrid, revealAroundObservers } from "./fog.js";
import { generateCohort } from "./cohort/generate.js";

export const SCENARIO_TITLE = "Llegada al pueblo de montaña";

/**
 * Crea el estado canónico inicial de una partida a partir de una semilla
 * (§7.1 y §10 de WEB-001). Determinista: la misma semilla produce siempre
 * el mismo fixture y la misma cohorte.
 */
export function createInitialState(seed: string): SimulationStateV1 {
  const prng = createPrngStateByDomain(seed);
  const fixtureStream = new PrngStream(prng.fixture);
  const cohortStream = new PrngStream(prng.cohort);

  const world = generateLocalSectorFixture(seed, fixtureStream);

  const cohortResult = generateCohort(seed, cohortStream, {
    nextDomainEventSequence: 0,
    nextPersonOrdinal: 0,
    nextPlaceOrdinal: 0,
  });

  const peopleAtArrival = Object.fromEntries(
    Object.entries(cohortResult.people).map(([id, person]) => [
      id,
      { ...person, public: { ...person.public, position: world.arrivalPoint } },
    ]),
  );

  let fog = createInitialFogGrid(world);
  fog = revealAroundObservers(fog, [world.arrivalPoint]);

  return {
    schemaVersion: SIMULATION_STATE_SCHEMA_VERSION,
    seed,
    generatorVersion: FIXTURE_GENERATOR_VERSION,
    scenario: {
      scenarioId: "SCN-001",
      arrivalMonth: "april",
      title: SCENARIO_TITLE,
    },
    clock: {
      elapsedSimSeconds: ARRIVAL_ELAPSED_SIM_SECONDS,
      speed: 0,
    },
    people: peopleAtArrival,
    peopleOrder: cohortResult.peopleOrder,
    world,
    fog,
    prng: {
      cohort: cohortStream.snapshot(),
      fixture: fixtureStream.snapshot(),
      navigation: prng.navigation,
    },
    sequences: cohortResult.sequences,
  };
}
