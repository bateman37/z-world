import { PLACE_PROFILE_IDS, type PlaceProfileId } from "@z-world/contracts";

/**
 * Catálogo versionado de los ocho perfiles de lugar aprobados (§8.1 de
 * WEB-002, CAT-004) y el presupuesto obligatorio por semilla válida
 * (§7.2). Datos puros, sin reglas mutables: el generador (S2, en
 * `packages/simulation-core`) los consume, nunca los redefine.
 *
 * Reconciliación documentada en `DEC-0016` (ver también `DEC-0015`):
 * - `RES-10`/`RES-17` cubren vivienda y construcción rural/aislada; la
 *   distinción rural se expresa como posición (aislada del núcleo), no
 *   como perfil nuevo.
 * - Cobertizos/garajes/anexos son subestructuras físicas ligadas a un
 *   `Place` de vivienda: `Building` adicional con el mismo `placeId`,
 *   `interiorGenerated: false`, nunca un `Place`/perfil propio.
 * - La franja "comercial/comunitaria/técnica" (6–10 construcciones) se
 *   cubre exclusivamente repitiendo instancias de `COM-02`/`TAL-01`
 *   (distintas en tamaño/estrato/negocio, nunca un noveno perfil):
 *   ningún ayuntamiento, iglesia, farmacia, hospital, gasolinera, granja
 *   ganadera o comisaría existe como lugar jugable en este alcance.
 * - "Colapsada" es una condición de `PlaceHistory` de una instancia
 *   soportada (kind `collapse`… ver `place-history-v2`), nunca otro
 *   arquetipo.
 */
export const PLACE_PROFILE_VERSION = "web-002-place-profiles-v1" as const;

export interface PlaceProfileDefinition {
  readonly id: PlaceProfileId;
  readonly nameEs: string;
  readonly spatialForm: "structure" | "natural_or_technical_node" | "area" | "linear";
  readonly footprintMinMeters?: { readonly width: number; readonly depth: number };
  readonly footprintMaxMeters?: { readonly width: number; readonly depth: number };
}

export const PLACE_PROFILES: readonly PlaceProfileDefinition[] = [
  { id: "RES-10", nameEs: "Casa familiar mediana", spatialForm: "structure", footprintMinMeters: { width: 8, depth: 7 }, footprintMaxMeters: { width: 12, depth: 10 } },
  { id: "RES-17", nameEs: "Cabaña", spatialForm: "structure", footprintMinMeters: { width: 5, depth: 5 }, footprintMaxMeters: { width: 7, depth: 6 } },
  { id: "COM-02", nameEs: "Supermercado pequeño", spatialForm: "structure", footprintMinMeters: { width: 12, depth: 10 }, footprintMaxMeters: { width: 18, depth: 14 } },
  { id: "TAL-01", nameEs: "Taller mecánico", spatialForm: "structure", footprintMinMeters: { width: 10, depth: 9 }, footprintMaxMeters: { width: 15, depth: 12 } },
  { id: "ENV-01", nameEs: "Fuente local de agua", spatialForm: "natural_or_technical_node" },
  { id: "ENV-02", nameEs: "Campo o parcela abierta", spatialForm: "area" },
  { id: "ENV-03", nameEs: "Bosque o matorral", spatialForm: "area" },
  { id: "ENV-04", nameEs: "Carretera o camino", spatialForm: "linear" },
];

if (PLACE_PROFILES.length !== PLACE_PROFILE_IDS.length) {
  throw new Error(`Catálogo de perfiles de lugar incompleto: se esperaban ${PLACE_PROFILE_IDS.length}, hay ${PLACE_PROFILES.length}.`);
}

export const PLACE_PROFILES_BY_ID: ReadonlyMap<PlaceProfileId, PlaceProfileDefinition> = new Map(
  PLACE_PROFILES.map((p) => [p.id, p]),
);

/** Rango entero inclusivo `[min, max]`. */
export interface IntRange {
  readonly min: number;
  readonly max: number;
}

/**
 * Presupuesto obligatorio por semilla válida (§7.2 de WEB-002). El
 * generador elige un valor concreto dentro de cada rango con el PRNG del
 * dominio `world`, así que semillas distintas producen recuentos
 * distintos sin salir nunca del presupuesto.
 */
export interface VillageBudget {
  readonly totalConstructions: IntRange;
  readonly housing: IntRange;
  readonly outbuildings: IntRange;
  readonly commercialOrTechnical: IntRange;
  readonly ruralOrIsolated: IntRange;
  readonly collapsed: IntRange;
  readonly secondaryStreets: IntRange;
  readonly ruralTracks: IntRange;
  readonly blockedRegionalAccesses: IntRange;
  readonly secondaryWaterSources: IntRange;
  readonly pointsOfInterest: IntRange;
  readonly initiallyKnownLandmarks: IntRange;
}

export const VILLAGE_BUDGET: VillageBudget = {
  totalConstructions: { min: 55, max: 85 },
  housing: { min: 28, max: 42 },
  outbuildings: { min: 10, max: 18 },
  commercialOrTechnical: { min: 6, max: 10 },
  ruralOrIsolated: { min: 4, max: 8 },
  collapsed: { min: 3, max: 7 },
  secondaryStreets: { min: 2, max: 4 },
  ruralTracks: { min: 5, max: 9 },
  blockedRegionalAccesses: { min: 1, max: 2 },
  secondaryWaterSources: { min: 1, max: 3 },
  pointsOfInterest: { min: 12, max: 18 },
  initiallyKnownLandmarks: { min: 3, max: 6 },
};

/** Cobertura de terreno aproximada exigida (§7.2), en fracción [0,1] del área total del sector. */
export const TERRAIN_COVERAGE_RATIO = {
  forestOrScrub: { min: 0.35, max: 0.55 },
  fieldsOrOpen: { min: 0.15, max: 0.3 },
  builtOrRoadsOrParcels: { min: 0.08, max: 0.15 },
} as const;

/** Distancia del refugio provisional al punto de llegada (§7.2), en metros. */
export const SHELTER_DISTANCE_METERS: IntRange = { min: 100, max: 250 };

/** Programa de estancias obligatorias de los cuatro perfiles de edificio (§8.2). */
export type RoomProgramRole =
  | "entry_distributor"
  | "common_space"
  | "kitchen"
  | "bathroom"
  | "bedroom"
  | "domestic_storage"
  | "main_multiuse_room"
  | "kitchen_solution"
  | "rest_area"
  | "minimal_storage"
  | "public_sales_floor"
  | "checkout"
  | "shelving_display"
  | "back_storage"
  | "restroom"
  | "customer_access"
  | "service_or_loading_access"
  | "work_area"
  | "workbench_tools"
  | "parts_storage"
  | "minimal_office"
  | "restroom_locker"
  | "personnel_access"
  | "wide_gate";

export interface RoomProgramEntry {
  readonly role: RoomProgramRole;
  readonly required: boolean;
  /** Si es verdadero, esta estancia debe tener una abertura exterior (§8.2/§8.6). */
  readonly exteriorAccess: boolean;
  readonly repeatable?: boolean;
}

export interface BuildingProgram {
  readonly profileId: Extract<PlaceProfileId, "RES-10" | "RES-17" | "COM-02" | "TAL-01">;
  readonly rooms: readonly RoomProgramEntry[];
  readonly minBedroomsOrEquivalent: number;
}

export const BUILDING_PROGRAMS: readonly BuildingProgram[] = [
  {
    profileId: "RES-10",
    minBedroomsOrEquivalent: 2,
    rooms: [
      { role: "entry_distributor", required: true, exteriorAccess: true },
      { role: "common_space", required: true, exteriorAccess: false },
      { role: "kitchen", required: true, exteriorAccess: false },
      { role: "bathroom", required: true, exteriorAccess: false },
      { role: "bedroom", required: true, exteriorAccess: false, repeatable: true },
      { role: "domestic_storage", required: true, exteriorAccess: false },
    ],
  },
  {
    profileId: "RES-17",
    minBedroomsOrEquivalent: 0,
    rooms: [
      { role: "main_multiuse_room", required: true, exteriorAccess: true },
      { role: "kitchen_solution", required: true, exteriorAccess: false },
      { role: "rest_area", required: true, exteriorAccess: false },
      { role: "minimal_storage", required: true, exteriorAccess: false },
    ],
  },
  {
    profileId: "COM-02",
    minBedroomsOrEquivalent: 0,
    rooms: [
      { role: "public_sales_floor", required: true, exteriorAccess: false },
      { role: "checkout", required: true, exteriorAccess: false },
      { role: "shelving_display", required: true, exteriorAccess: false, repeatable: true },
      { role: "back_storage", required: true, exteriorAccess: false },
      { role: "restroom", required: true, exteriorAccess: false },
      { role: "customer_access", required: true, exteriorAccess: true },
      { role: "service_or_loading_access", required: true, exteriorAccess: true },
    ],
  },
  {
    profileId: "TAL-01",
    minBedroomsOrEquivalent: 0,
    rooms: [
      { role: "work_area", required: true, exteriorAccess: false },
      { role: "workbench_tools", required: true, exteriorAccess: false },
      { role: "parts_storage", required: true, exteriorAccess: false },
      { role: "minimal_office", required: true, exteriorAccess: false },
      { role: "restroom_locker", required: true, exteriorAccess: false },
      { role: "personnel_access", required: true, exteriorAccess: true },
      { role: "wide_gate", required: true, exteriorAccess: true },
    ],
  },
];

export const BUILDING_PROGRAMS_BY_PROFILE: ReadonlyMap<BuildingProgram["profileId"], BuildingProgram> = new Map(
  BUILDING_PROGRAMS.map((p) => [p.profileId, p]),
);

if (BUILDING_PROGRAMS.length !== 4) {
  throw new Error(`Catálogo de programas de edificio incompleto: se esperaban 4 (RES-10, RES-17, COM-02, TAL-01), hay ${BUILDING_PROGRAMS.length}.`);
}
