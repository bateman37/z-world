import { z } from "zod";
import { simulationClockSchema, type SimulationClock } from "./clock.js";
import { personStateSchema, type PersonId, type PersonState } from "./person.js";
import { localSectorFixtureSchema, type LocalSectorFixture } from "./world.js";
import { fogGridSchema, type FogGrid } from "./fog-grid.js";
import { prngStateByDomainSchema, type PrngStateByDomain } from "./prng.js";

export const SIMULATION_STATE_SCHEMA_VERSION = 1 as const;

export interface ScenarioMetadata {
  readonly scenarioId: "SCN-001";
  readonly arrivalMonth: "april";
  readonly title: string;
}

export interface CausalSequenceCounters {
  readonly nextDomainEventSequence: number;
  readonly nextPersonOrdinal: number;
  readonly nextPlaceOrdinal: number;
}

/**
 * Estado canónico serializable de una partida (§7.1 de WEB-001). Totalmente
 * representable en JSON; sin instancias de clase, `Map`, `Set` ni `Date`.
 */
export interface SimulationStateV1 {
  readonly schemaVersion: typeof SIMULATION_STATE_SCHEMA_VERSION;
  readonly seed: string;
  readonly generatorVersion: string;
  readonly scenario: ScenarioMetadata;
  readonly clock: SimulationClock;
  readonly people: Readonly<Record<PersonId, PersonState>>;
  readonly peopleOrder: readonly PersonId[];
  readonly world: LocalSectorFixture;
  readonly fog: FogGrid;
  readonly prng: PrngStateByDomain;
  readonly sequences: CausalSequenceCounters;
}

export interface ParseSimulationStateResult {
  readonly success: boolean;
  readonly data?: SimulationStateV1;
  readonly error?: string;
}

/**
 * Valida un valor desconocido (p. ej. la columna JSONB de un snapshot)
 * contra el esquema Zod y lo trata como `SimulationStateV1` si es válido.
 * El `as` está localizado aquí a propósito: Zod valida la forma en tiempo
 * de ejecución con más generalidad (`Record<string, ...>`) que las uniones
 * de literales de los tipos de dominio; una vez validada la forma, el
 * contenido es programáticamente correcto para esos IDs de catálogo.
 */
export function parseSimulationStateV1(data: unknown): ParseSimulationStateResult {
  const result = simulationStateV1Schema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.message };
  }
  return { success: true, data: result.data as unknown as SimulationStateV1 };
}

export const simulationStateV1Schema = z.object({
  schemaVersion: z.literal(SIMULATION_STATE_SCHEMA_VERSION),
  seed: z.string(),
  generatorVersion: z.string(),
  scenario: z.object({
    scenarioId: z.literal("SCN-001"),
    arrivalMonth: z.literal("april"),
    title: z.string(),
  }),
  clock: simulationClockSchema,
  people: z.record(z.string(), personStateSchema),
  peopleOrder: z.array(z.string()),
  world: localSectorFixtureSchema,
  fog: fogGridSchema,
  prng: prngStateByDomainSchema,
  sequences: z.object({
    nextDomainEventSequence: z.number().int().nonnegative(),
    nextPersonOrdinal: z.number().int().nonnegative(),
    nextPlaceOrdinal: z.number().int().nonnegative(),
  }),
});
