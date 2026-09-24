import {
  ARRIVAL_ELAPSED_SIM_SECONDS,
  SIMULATION_STATE_V2_SCHEMA_VERSION,
  parseSimulationStateV2,
  type DiscoveryRecord,
  type SimulationStateV2,
} from "@z-world/contracts";
import { createDerivedPrngStreamState, createPrngStateByDomainV2, PrngStream } from "../prng.js";
import { createInitialFogGrid, revealAroundObservers } from "../fog.js";
import {
  DEFAULT_VILLAGE_GENERATOR_CONFIG,
  generateVillage,
  validateGeneratedVillage,
  type VillageGenerationResult,
  type VillageGeneratorConfig,
} from "./generator/index.js";
import { generatePeopleAtArrival } from "./generator/people.js";
import { materializeInitialBelongings } from "./generator/belongings.js";
import { IdAllocator } from "./generator/id-allocator.js";
import { roundStateNumbers } from "./generator/round-state.js";
import { validateSimulationStateV2Invariants } from "./invariants.js";

export const SCENARIO_TITLE_V2 = "Llegada al pueblo de montaña";

export class VillageGenerationError extends Error {
  constructor(
    public readonly seed: string,
    public readonly reasons: readonly string[],
  ) {
    super(`Generación inválida para la semilla "${seed}": ${reasons.join("; ")}`);
    this.name = "VillageGenerationError";
  }
}

/**
 * Crea el estado canónico inicial `SimulationStateV2` de una partida nueva
 * a partir de una semilla (§7 de WEB-002, S2). Produce directamente un V2
 * válido: nunca genera primero un V1 para migrarlo (§6.2.7). Determinista:
 * la misma semilla, la misma `VILLAGE_GENERATOR_VERSION` y la misma
 * configuración producen siempre exactamente el mismo estado.
 *
 * Ejecuta Zod y `validateSimulationStateV2Invariants` (y las garantías
 * propias de generación de `validateGeneratedVillage`) antes de devolver
 * el estado: una semilla que no pase esta validación nunca llega a
 * persistirse ni a mostrarse (§7.5).
 */
export function createInitialStateV2(seed: string, config: VillageGeneratorConfig = DEFAULT_VILLAGE_GENERATOR_CONFIG): SimulationStateV2 {
  const prng = createPrngStateByDomainV2(seed);
  const worldStream = new PrngStream(prng.world);
  const cohortStream = new PrngStream(prng.cohort);

  const generation = generateVillage(seed, worldStream, config);
  const peopleResult = generatePeopleAtArrival(seed, cohortStream, { nextDomainEventSequence: 0, nextPersonOrdinal: 0, nextPlaceOrdinal: 0 }, generation.arrivalPoint);

  // Pertenencias de SCN-003 por persona (S7): IDs a continuación de los del
  // pueblo y stream derivado propio, sin tocar los streams `world`/`cohort`.
  const belongingIds = new IdAllocator(seed, generation.nextEntityOrdinal);
  const belongingsStream = new PrngStream(createDerivedPrngStreamState(seed, "s7-belongings"));
  const belongings = materializeInitialBelongings(belongingsStream, belongingIds, peopleResult.people, peopleResult.peopleOrder, generation.groupSupplies);

  let fog = createInitialFogGrid({ bounds: generation.world.bounds }, config.fogResolutionMeters);
  fog = revealAroundObservers(fog, [generation.arrivalPoint]);

  const discoveries = buildInitialDiscoveries(generation, worldStream);

  const rawState: SimulationStateV2 = {
    schemaVersion: SIMULATION_STATE_V2_SCHEMA_VERSION,
    seed,
    scenario: { scenarioId: "SCN-001", arrivalMonth: "april", title: SCENARIO_TITLE_V2 },
    clock: { elapsedSimSeconds: ARRIVAL_ELAPSED_SIM_SECONDS, speed: 0 },
    people: peopleResult.people,
    peopleOrder: peopleResult.peopleOrder,
    world: generation.world,
    discoveries,
    fog,
    workZones: {},
    designations: {},
    jobs: {},
    episodes: {},
    reservations: {},
    furniture: Object.fromEntries(generation.furniture.map((f) => [f.id, f])),
    containers: Object.fromEntries([...generation.containers, ...belongings.containers].map((c) => [c.id, c])),
    worldObjects: Object.fromEntries([...generation.worldObjects, ...belongings.worldObjects].map((o) => [o.id, o])),
    resourceLots: Object.fromEntries([...generation.resourceLots, ...belongings.resourceLots].map((r) => [r.id, r])),
    transportMeans: Object.fromEntries(generation.transportMeans.map((t) => [t.id, t])),
    loadBundles: {},
    transferPoints: {},
    cultivationPlots: Object.fromEntries(generation.cultivationPlots.map((c) => [c.id, c])),
    cropCycles: {},
    terrainChanges: {},
    prng: {
      cohort: cohortStream.snapshot(),
      fixture: prng.fixture,
      navigation: prng.navigation,
      world: worldStream.snapshot(),
      resolution: prng.resolution,
    },
    sequences: {
      nextDomainEventSequence: peopleResult.sequences.nextDomainEventSequence,
      nextPersonOrdinal: peopleResult.sequences.nextPersonOrdinal,
      nextPlaceOrdinal: peopleResult.sequences.nextPlaceOrdinal,
      nextEntityOrdinal: belongingIds.nextOrdinal,
    },
    migration: null,
    generationDegradations: generation.degradations,
  };

  // El redondeo se aplica antes de validar/devolver: lo que se valida, lo que se compara en pruebas de
  // determinismo y lo que se persiste son siempre exactamente la misma forma numérica (ver `round-state.ts`).
  const state = roundStateNumbers(rawState);

  validateOrThrow(state, generation.shelterDistanceMeters, generation.shelterWasWithinBudget, seed);

  return state;
}

function validateOrThrow(state: SimulationStateV2, shelterDistanceMeters: number, shelterWasWithinBudget: boolean, seed: string): void {
  const zodResult = parseSimulationStateV2(state);
  if (!zodResult.success) {
    throw new VillageGenerationError(seed, [`Zod: ${zodResult.error}`]);
  }
  const invariantReport = validateSimulationStateV2Invariants(state);
  const generationReport = validateGeneratedVillage(state, { shelterDistanceMeters, shelterWasWithinBudget });
  const reasons = [...invariantReport.violations.map((v) => `${v.code}: ${v.message}`), ...generationReport.violations.map((v) => `${v.code}: ${v.message}`)];
  if (reasons.length > 0) {
    throw new VillageGenerationError(seed, reasons);
  }
}

/** Solo 3-6 siluetas/accesos/indicios quedan inicialmente conocidos (§7.2): el resto se descubre jugando. */
function buildInitialDiscoveries(generation: VillageGenerationResult, worldStream: PrngStream): DiscoveryRecord[] {
  const nodeIds = Object.keys(generation.world.nodes);
  const landmarkCandidates = [generation.shelterPlaceId, ...nodeIds];
  const count = Math.min(worldStream.nextInt(3, 6), landmarkCandidates.length);
  const chosen = worldStream.shuffle(landmarkCandidates).slice(0, count);
  return chosen.map((entityId) => ({ entityId, facet: "exterior" as const, state: "sighted" as const }));
}
