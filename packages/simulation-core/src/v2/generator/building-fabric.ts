import type {
  BuildingFabric,
  BuildingFinish,
  BuildingInstallation,
  ConstructionEra,
  FinishKind,
  InstallationSystem,
  Place,
  PlaceHistory,
  Room,
  SemanticWorldV2,
  WorldPoint,
} from "@z-world/contracts";
import { INSTALLATION_VARIANTS_BY_ID, STRUCTURE_PROFILES_BY_ID, structureProfileIdFor } from "@z-world/catalogs";
import type { PrngStream } from "../../prng.js";
import type { IdAllocator } from "./id-allocator.js";
import { valuesById } from "../ordered.js";
import { initialFabric } from "../exploitation/fabric.js";

/**
 * Tejido de edificio de `web-002-semantic-v4` (S9 — Puerta C, CAT-002
 * §3.5-§3.9, SET-007 §3.1). Para cada edificio de los cuatro perfiles con
 * programa: época constructiva (condiciona instalaciones y materiales,
 * regla aprobada de CAT-002 §4), perfil estructural versionado, las
 * instalaciones plausibles de su programa y los acabados recuperables de
 * cada estancia. Lo materializa un stream PRNG derivado propio (`s9-buildings`)
 * al final del pipeline, así que el trazado, los objetos y los IDs de v3 no
 * cambian (verificado con semillas estables).
 *
 * El generador no produce obstrucciones históricas: las viviendas del
 * programa actual tienen un único acceso exterior y bloquearlo dejaría el
 * edificio inaccesible desde el primer día. Las obstrucciones (barricada,
 * tapiado) solo las crea la comunidad.
 *
 * Nada de esto infla el edificio: son los sistemas y acabados que un
 * edificio de ese perfil y época tiene de verdad, sin cantidades mágicas; lo
 * que se recupera de cada uno lo decide la receta versionada del catálogo.
 */
export const S9_BUILDINGS_STREAM_LABEL = "s9-buildings";

export interface BuildingFabricResult {
  readonly buildingFabrics: Readonly<Record<string, BuildingFabric>>;
  readonly buildingInstallations: Readonly<Record<string, BuildingInstallation>>;
  readonly buildingFinishes: Readonly<Record<string, BuildingFinish>>;
  readonly degradations: readonly string[];
}

type ExploitableProfile = "RES-10" | "RES-17" | "COM-02" | "TAL-01";

const round1 = (value: number): number => Math.round(value * 10) / 10;
const round4 = (value: number): number => Math.round(value * 10000) / 10000;

function polygonArea(polygon: readonly WorldPoint[]): number {
  let area = 0;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) area += (polygon[j]!.x + polygon[i]!.x) * (polygon[j]!.y - polygon[i]!.y);
  return Math.abs(area / 2);
}

/** Instalaciones plausibles de cada programa (CAT-002 §3.6/§3.8): sistema, estancias servidas y probabilidad según época. */
function installationPlan(profile: ExploitableProfile, era: ConstructionEra): readonly { system: InstallationSystem; roles: readonly string[] | "all"; chance: number }[] {
  const modern = era === "modern";
  switch (profile) {
    case "RES-10":
      return [
        { system: "electricity", roles: "all", chance: 1 },
        { system: "water", roles: ["kitchen", "bathroom"], chance: 1 },
        { system: "hot_water", roles: ["bathroom"], chance: modern ? 0.9 : 0.6 },
        { system: "heating", roles: ["common_space", "bedroom"], chance: 0.7 },
        { system: "telecom", roles: ["common_space"], chance: modern ? 0.7 : 0.3 },
      ];
    case "RES-17":
      return [
        { system: "electricity", roles: "all", chance: modern ? 0.8 : 0.5 },
        { system: "water", roles: ["kitchen_solution"], chance: 0.4 },
        { system: "heating", roles: ["main_multiuse_room"], chance: 0.6 },
      ];
    case "COM-02":
      return [
        { system: "electricity", roles: "all", chance: 1 },
        { system: "water", roles: ["restroom"], chance: 1 },
        { system: "ventilation", roles: ["public_sales_floor", "back_storage"], chance: modern ? 0.8 : 0.5 },
        { system: "telecom", roles: ["checkout"], chance: modern ? 0.8 : 0.3 },
      ];
    case "TAL-01":
      return [
        { system: "electricity", roles: "all", chance: 1 },
        { system: "water", roles: ["restroom_locker"], chance: 0.9 },
        { system: "ventilation", roles: ["work_area"], chance: modern ? 0.7 : 0.4 },
        { system: "heating", roles: ["minimal_office"], chance: 0.4 },
      ];
    default: {
      const exhaustive: never = profile;
      throw new Error(`Perfil no reconocido: ${String(exhaustive)}`);
    }
  }
}

const WINDOW_ROLES: ReadonlySet<string> = new Set(["common_space", "bedroom", "kitchen", "main_multiuse_room", "rest_area", "public_sales_floor", "minimal_office", "work_area"]);
const RESIDENTIAL_FLOOR_ROLES: ReadonlySet<string> = new Set(["entry_distributor", "common_space", "bedroom", "main_multiuse_room", "rest_area"]);
const WET_ROLES: ReadonlySet<string> = new Set(["bathroom", "restroom", "restroom_locker"]);

/** Acabados recuperables de una estancia según su función, el perfil y la época (CAT-002 §3.7). */
function finishesForRoom(profile: ExploitableProfile, era: ConstructionEra, role: string, prng: PrngStream): FinishKind[] {
  const kinds: FinishKind[] = [];
  const residential = profile === "RES-10" || profile === "RES-17";
  if (WINDOW_ROLES.has(role)) {
    kinds.push("window");
    if (role === "public_sales_floor") kinds.push("window"); // escaparate: dos ventanales.
    if (residential && prng.nextBool(0.6)) kinds.push("shutters");
  }
  if (WET_ROLES.has(role)) kinds.push("sanitary_ware", "wall_tiles");
  if (role === "kitchen") kinds.push("kitchen_units", "countertop", "wall_tiles");
  if (role === "kitchen_solution" && prng.nextBool(0.5)) kinds.push("kitchen_units");
  if (residential && RESIDENTIAL_FLOOR_ROLES.has(role)) kinds.push(era === "old" ? "wood_flooring" : "floor_tiles");
  if (role === "public_sales_floor") kinds.push("floor_tiles");
  return kinds;
}

export function materializeBuildingFabric(
  prng: PrngStream,
  ids: IdAllocator,
  world: SemanticWorldV2,
): BuildingFabricResult {
  const buildingFabrics: Record<string, BuildingFabric> = {};
  const buildingInstallations: Record<string, BuildingInstallation> = {};
  const buildingFinishes: Record<string, BuildingFinish> = {};
  const degradations: string[] = [];

  const historiesByPlace = new Map<string, PlaceHistory>();
  for (const history of valuesById(world.placeHistories)) historiesByPlace.set(history.placeId, history);
  const roomsByBuilding = new Map<string, Room[]>();
  for (const room of valuesById(world.rooms)) {
    const buildingId = world.floors[room.floorId]?.buildingId;
    if (!buildingId) continue;
    const list = roomsByBuilding.get(buildingId) ?? [];
    list.push(room);
    roomsByBuilding.set(buildingId, list);
  }
  const exploitable = valuesById(world.places).filter((p): p is Place & { profileId: ExploitableProfile } => (p.profileId === "RES-10" || p.profileId === "RES-17" || p.profileId === "COM-02" || p.profileId === "TAL-01") && p.buildingId !== null);

  for (const place of exploitable) {
    const building = world.buildings[place.buildingId!];
    if (!building) continue;
    const history = historiesByPlace.get(place.id);
    const kinds = history?.historyKinds ?? [];
    const era: ConstructionEra = prng.nextBool(place.profileId === "RES-17" ? 0.7 : 0.45) ? "old" : "modern";
    const structureProfileId = structureProfileIdFor(place.profileId, era);
    const profile = STRUCTURE_PROFILES_BY_ID.get(structureProfileId);
    if (!profile) {
      degradations.push(`Sin perfil estructural para ${place.profileId}/${era}: el edificio ${building.id} no tiene capa 5.`);
      continue;
    }
    const structureCondition = round4(kinds.includes("collapse") ? 0.3 : kinds.includes("fire") ? 0.5 : 0.75 + prng.nextFloat() * 0.2);
    buildingFabrics[building.id] = initialFabric({
      buildingId: building.id,
      era,
      structureProfileId,
      footprintAreaM2: round1(polygonArea(building.footprint)),
      structureCondition,
      dismantleStagesTotal: profile.dismantleStages,
    });

    const rooms = roomsByBuilding.get(building.id) ?? [];
    if (!building.interiorGenerated || rooms.length === 0) continue; // colapsado: solo estructura (capa 5), sin instalaciones ni acabados accesibles.

    for (const plan of installationPlan(place.profileId, era)) {
      if (plan.chance < 1 && !prng.nextBool(plan.chance)) continue;
      const served = rooms.filter((r) => plan.roles === "all" || (r.programRoleKey !== null && plan.roles.includes(r.programRoleKey)));
      if (served.length === 0) continue;
      const variant = `installation.${plan.system}.${era}`;
      const def = INSTALLATION_VARIANTS_BY_ID.get(variant);
      if (!def) continue;
      const condition = round4(0.3 + prng.nextFloat() * 0.6);
      const id = ids.next("installation");
      buildingInstallations[id] = {
        id,
        buildingId: building.id,
        system: plan.system,
        variant,
        roomIds: served.map((r) => r.id),
        condition,
        functionalState: condition < 0.4 ? "degraded" : "functional",
        state: "connected",
        serviceInactiveReason: def.inactiveReason,
        provenance: "generated:s9",
      };
    }

    for (const room of rooms) {
      for (const kind of finishesForRoom(place.profileId, era, room.programRoleKey ?? "", prng)) {
        const id = ids.next("finish");
        buildingFinishes[id] = { id, buildingId: building.id, roomId: room.id, kind, variant: `finish.${kind}.${era}`, condition: round4(0.4 + prng.nextFloat() * 0.5), state: "installed", provenance: "generated:s9" };
      }
    }
    if (era === "modern" && (place.profileId === "RES-10" || place.profileId === "COM-02")) {
      const id = ids.next("finish");
      buildingFinishes[id] = { id, buildingId: building.id, roomId: null, kind: "insulation", variant: "finish.insulation.modern", condition: round4(0.5 + prng.nextFloat() * 0.4), state: "installed", provenance: "generated:s9" };
    }
    if (place.profileId === "RES-17" && prng.nextBool(0.5)) {
      const id = ids.next("finish");
      buildingFinishes[id] = { id, buildingId: building.id, roomId: null, kind: "railing", variant: `finish.railing.${era}`, condition: round4(0.4 + prng.nextFloat() * 0.4), state: "installed", provenance: "generated:s9" };
    }

  }

  return { buildingFabrics, buildingInstallations, buildingFinishes, degradations };
}
