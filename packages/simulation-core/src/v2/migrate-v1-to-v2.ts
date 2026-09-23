import type {
  Building,
  LinearFeature,
  NaturalOrTechnicalNode,
  NeedState,
  Place,
  PersonStateV2,
  SemanticWorldV2,
  SimulationStateV1,
  SimulationStateV2,
  TerrainArea,
  WorldObject,
} from "@z-world/contracts";
import { SIMULATION_STATE_V2_SCHEMA_VERSION } from "@z-world/contracts";
import { createPrngStreamState } from "../prng.js";

export const MIGRATED_FROM_V1_GENERATOR_VERSION = "migrated-from-v1-fixture" as const;

export interface MigrationResult {
  readonly state: SimulationStateV2;
  readonly degradations: readonly string[];
}

/**
 * Migración determinista V1 → V2 (§25.1 de WEB-002). Es una traducción
 * estructural del fixture y la cohorte ya existentes, no una regeneración:
 * las partidas nuevas usan el generador semántico real (S2), no esta
 * ruta. Cada campo que no puede reconstruirse con fidelidad queda
 * degradado de forma explícita y documentada en el resultado, nunca en
 * silencio.
 *
 * Pura y determinista: la misma entrada V1 produce siempre la misma
 * salida V2 (incluida la generación de IDs, derivada de la propia
 * identidad de origen, no de un contador aleatorio).
 */
export function migrateV1ToV2(v1: SimulationStateV1): MigrationResult {
  const degradations: string[] = [];

  const world = migrateWorld(v1, degradations);
  const { people, worldObjects } = migratePeopleAndPossessions(v1, degradations);

  const state: SimulationStateV2 = {
    schemaVersion: SIMULATION_STATE_V2_SCHEMA_VERSION,
    seed: v1.seed,
    scenario: v1.scenario,
    clock: v1.clock,
    people,
    peopleOrder: v1.peopleOrder,
    world,
    discoveries: [],
    fog: v1.fog,
    workZones: {},
    designations: {},
    jobs: {},
    episodes: {},
    reservations: {},
    furniture: {},
    containers: {},
    worldObjects,
    resourceLots: {},
    transportMeans: {},
    loadBundles: {},
    transferPoints: {},
    cultivationPlots: {},
    cropCycles: {},
    terrainChanges: {},
    // La migración es una traducción estructural (§7.1): nunca invoca el
    // generador semántico real, así que el stream `world` nace fresco y sin
    // usar, sin alterar los streams originales de la partida V1.
    prng: { ...v1.prng, world: createPrngStreamState(v1.seed, "world") },
    sequences: {
      nextDomainEventSequence: v1.sequences.nextDomainEventSequence,
      nextPersonOrdinal: v1.sequences.nextPersonOrdinal,
      nextPlaceOrdinal: v1.sequences.nextPlaceOrdinal,
      nextEntityOrdinal: 0,
    },
    migration: {
      fromSchemaVersion: v1.schemaVersion,
      toSchemaVersion: SIMULATION_STATE_V2_SCHEMA_VERSION,
      migratedAtSimSeconds: v1.clock.elapsedSimSeconds,
      degradations,
    },
    generationDegradations: [],
  };

  return { state, degradations };
}

function migrateWorld(v1: SimulationStateV1, degradations: string[]): SemanticWorldV2 {
  const terrainAreas: Record<string, TerrainArea> = {};
  for (const area of v1.world.areas) {
    // AreaFeature (V1) y TerrainArea (V2) comparten la misma forma, salvo
    // `placeId` (S2): el fixture V1 no tenía lugares ENV-02/ENV-03 propios.
    terrainAreas[area.id] = { ...area, placeId: null };
  }

  const linearFeatures: Record<string, LinearFeature> = {};
  for (const line of v1.world.lines) {
    linearFeatures[line.id] = {
      id: line.id,
      kind: line.kind,
      polyline: line.polyline,
      widthMeters: line.widthMeters,
      wayState: line.kind === "road" ? "transitable" : null,
      placeId: null,
    };
  }

  const nodes: Record<string, NaturalOrTechnicalNode> = {};
  for (const point of v1.world.points) {
    nodes[point.id] = {
      id: point.id,
      kind: point.kind,
      position: point.position,
      placeId: null,
      labelKey: point.labelKey,
    };
  }

  const places: Record<string, Place> = {};
  const buildings: Record<string, Building> = {};
  for (const structure of v1.world.structures) {
    const placeId = `${structure.id}-place`;
    places[placeId] = {
      id: placeId,
      // El fixture V1 no distinguía perfil de CAT-004; se asume vivienda
      // familiar mediana como aproximación documentada, no como dato real.
      profileId: "RES-10",
      position: structure.footprint[0] ?? v1.world.arrivalPoint,
      buildingId: structure.id,
    };
    buildings[structure.id] = {
      id: structure.id,
      placeId,
      footprint: structure.footprint,
      labelKey: structure.labelKey,
      interiorGenerated: false,
      activeFloorId: null,
    };
    degradations.push(
      `Estructura ${structure.id}: sin programa/interior real (perfil CAT-004 asumido como RES-10); pendiente de S3.`,
    );
  }

  return {
    generatorVersion: MIGRATED_FROM_V1_GENERATOR_VERSION,
    seed: v1.seed,
    bounds: v1.world.bounds,
    arrivalPoint: v1.world.arrivalPoint,
    terrainAreas,
    linearFeatures,
    nodes,
    parcels: {},
    places,
    buildings,
    floors: {},
    rooms: {},
    openings: {},
    installedClosures: {},
    obstructions: {},
    anchors: {},
    barrierSegments: {},
    perimeterNetworks: {},
    occupantProfiles: {},
    businessProfiles: {},
    placeHistories: {},
    lootPressureZones: {},
    lootingRoutes: {},
  };
}

/** Necesidades iniciales derivadas del estado descriptivo de llegada (solo para migración; S6 define la generación real para partidas nuevas). */
function deriveNeedsFromArrivalCondition(): readonly NeedState[] {
  return [
    { dimension: "hydration", value: 55, band: "in_need" },
    { dimension: "nutrition", value: 55, band: "in_need" },
    { dimension: "rest", value: 35, band: "in_need" },
  ];
}

function migratePeopleAndPossessions(
  v1: SimulationStateV1,
  degradations: string[],
): { people: Record<string, PersonStateV2>; worldObjects: Record<string, WorldObject> } {
  const people: Record<string, PersonStateV2> = {};
  const worldObjects: Record<string, WorldObject> = {};

  for (const personId of v1.peopleOrder) {
    const person = v1.people[personId];
    if (!person) continue;

    for (const possession of person.public.possessions) {
      worldObjects[possession.id] = {
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
      };
    }

    people[personId] = {
      public: person.public,
      hidden: person.hidden,
      needs: deriveNeedsFromArrivalCondition(),
      location: { kind: "world_point", point: person.public.position },
      carriedLoadBundleId: null,
      activeJobId: null,
    };
  }

  degradations.push(
    "Necesidades iniciales derivadas heurísticamente del estado descriptivo de llegada de WEB-001 (sin curva causal todavía; ver S6).",
  );
  degradations.push(
    "Pertenencias migradas a WorldObject conservando su ID; peso/bulto/condición son estimaciones provisionales hasta S7.",
  );

  return { people, worldObjects };
}
