import type { PlaceProfileId, SimulationStateV2 } from "@z-world/contracts";
import { PLACE_PROFILE_IDS } from "@z-world/contracts";
import { OBJECT_CATALOG_BY_VARIANT, SHELTER_DISTANCE_METERS, VILLAGE_BUDGET, type IntRange } from "@z-world/catalogs";
import { resolveHolderPersonId } from "../objects/storage.js";

/**
 * Validación de la generación antes de exponer la partida (§7.5 de
 * WEB-002: "la validación se realiza antes de iniciar la partida... nunca
 * añade una solución después de que el jugador observe el mundo"). Se
 * ejecuta además de Zod y `validateSimulationStateV2Invariants`
 * (`../invariants.ts`), que cubren la forma y las relaciones genéricas;
 * este módulo cubre el presupuesto y las garantías propias de la
 * generación (§7.2/§7.5/§8).
 */
export interface GenerationViolation {
  readonly code: string;
  readonly message: string;
}

export interface GenerationValidationReport {
  readonly ok: boolean;
  readonly violations: readonly GenerationViolation[];
}

function inRange(value: number, range: IntRange): boolean {
  return value >= range.min && value <= range.max;
}

export function validateGeneratedVillage(
  state: SimulationStateV2,
  extra: { readonly shelterDistanceMeters: number; readonly shelterWasWithinBudget: boolean },
): GenerationValidationReport {
  const violations: GenerationViolation[] = [];
  const places = Object.values(state.world.places);
  const buildings = Object.values(state.world.buildings);

  const countByProfile = new Map<PlaceProfileId, number>();
  for (const place of places) countByProfile.set(place.profileId, (countByProfile.get(place.profileId) ?? 0) + 1);
  for (const profileId of PLACE_PROFILE_IDS) {
    if (!countByProfile.get(profileId)) {
      violations.push({ code: "missing_profile", message: `El perfil ${profileId} no aparece ni una vez en el mundo generado.` });
    }
  }

  const housingCount = (countByProfile.get("RES-10") ?? 0) + (countByProfile.get("RES-17") ?? 0);
  if (!inRange(housingCount, VILLAGE_BUDGET.housing)) {
    violations.push({ code: "housing_out_of_budget", message: `Viviendas generadas (${housingCount}) fuera del presupuesto ${VILLAGE_BUDGET.housing.min}-${VILLAGE_BUDGET.housing.max}.` });
  }
  const commercialCount = (countByProfile.get("COM-02") ?? 0) + (countByProfile.get("TAL-01") ?? 0);
  if (!inRange(commercialCount, VILLAGE_BUDGET.commercialOrTechnical)) {
    violations.push({ code: "commercial_out_of_budget", message: `Construcciones comerciales/técnicas (${commercialCount}) fuera del presupuesto ${VILLAGE_BUDGET.commercialOrTechnical.min}-${VILLAGE_BUDGET.commercialOrTechnical.max}.` });
  }
  const totalConstructions = buildings.length;
  if (!inRange(totalConstructions, VILLAGE_BUDGET.totalConstructions)) {
    violations.push({ code: "total_constructions_out_of_budget", message: `Construcciones totales (${totalConstructions}) fuera del presupuesto ${VILLAGE_BUDGET.totalConstructions.min}-${VILLAGE_BUDGET.totalConstructions.max}.` });
  }

  // Cada edificio con programa (interiorGenerated) tiene al menos una estancia y al menos una abertura exterior (§8.2/§8.6).
  const exteriorOpeningRoomIds = new Set(
    Object.values(state.world.openings)
      .filter((o) => o.connectsToExterior && o.connectsRoomId)
      .map((o) => o.connectsRoomId as string),
  );

  for (const building of buildings) {
    if (!building.interiorGenerated) continue;
    const floorIds = Object.values(state.world.floors).filter((f) => f.buildingId === building.id).map((f) => f.id);
    const buildingRooms = Object.values(state.world.rooms).filter((r) => floorIds.includes(r.floorId));
    if (buildingRooms.length === 0) {
      violations.push({ code: "building_without_rooms", message: `Edificio ${building.id} tiene interior generado pero no tiene estancias.` });
      continue;
    }
    const hasExteriorAccess = buildingRooms.some((r) => exteriorOpeningRoomIds.has(r.id));
    if (!hasExteriorAccess) {
      violations.push({ code: "building_without_exterior_access", message: `Edificio ${building.id} no tiene ninguna abertura exterior válida.` });
    }
  }

  // Refugio dentro de la distancia acordada (§7.2); si no lo estuvo, la generación ya registró la degradación explícita en `migration`/`extra`, no la silencia.
  if (!extra.shelterWasWithinBudget) {
    violations.push({
      code: "shelter_outside_distance_budget",
      message: `El refugio quedó a ${extra.shelterDistanceMeters.toFixed(1)} m del punto de llegada, fuera de ${SHELTER_DISTANCE_METERS.min}-${SHELTER_DISTANCE_METERS.max} m (degradación ya registrada explícitamente).`,
    });
  }

  checkCatalogVariants(state, violations);
  checkInitialBelongings(state, violations);

  return { ok: violations.length === 0, violations };
}

/** Todo objeto generado por v2 usa una variante de catálogo real (S7 §6.1: nada de variantes `.generic` fuera de catálogo). */
function checkCatalogVariants(state: SimulationStateV2, violations: GenerationViolation[]): void {
  for (const obj of Object.values(state.worldObjects)) {
    if (!OBJECT_CATALOG_BY_VARIANT.has(obj.variant)) {
      violations.push({ code: "object_variant_not_in_catalog", message: `El objeto ${obj.id} usa la variante ${obj.variant}, que no está en el catálogo.` });
    }
  }
  for (const means of Object.values(state.transportMeans)) {
    if (!OBJECT_CATALOG_BY_VARIANT.has(means.variant)) {
      violations.push({ code: "transport_variant_not_in_catalog", message: `El medio ${means.id} usa la variante ${means.variant}, que no está en el catálogo.` });
    }
  }
}

/**
 * Presupuesto de pertenencias de SCN-003 §3.5 (S7 §6.11): cada persona
 * porta un arma y todas sus `possessions` existen como objetos reales que
 * lleva ella; el grupo suma 8–12 L de recipientes, 5–8 L de agua y unas
 * seis comidas, todo físicamente sobre las personas. Nada de ese
 * presupuesto se duplica en el refugio.
 */
function checkInitialBelongings(state: SimulationStateV2, violations: GenerationViolation[]): void {
  let vesselLiters = 0;
  let waterLiters = 0;
  let meals = 0;
  for (const personId of state.peopleOrder) {
    const person = state.people[personId];
    if (!person) continue;
    for (const possession of person.public.possessions) {
      const obj = state.worldObjects[possession.id];
      if (!obj || resolveHolderPersonId(state, obj.location) !== personId) {
        violations.push({ code: "possession_not_materialized", message: `La pertenencia ${possession.id} de ${personId} no existe como objeto real que lleve esa persona.` });
      }
    }
    const held = Object.values(state.worldObjects).filter((o) => resolveHolderPersonId(state, o.location) === personId);
    if (!held.some((o) => o.family === "improvised_tool_or_weapon" && o.functions.includes("melee"))) {
      violations.push({ code: "person_without_melee_weapon", message: `${personId} no lleva ningún arma cuerpo a cuerpo o improvisada (SCN-003 §3.5).` });
    }
    for (const o of held) vesselLiters += OBJECT_CATALOG_BY_VARIANT.get(o.variant)?.liquidCapacityLiters ?? 0;
  }
  for (const lot of Object.values(state.resourceLots)) {
    if (!resolveHolderPersonId(state, lot.location)) continue;
    if (lot.family === "water") waterLiters += lot.quantity;
    if (lot.family === "preserved_food" || lot.family === "fresh_food") meals += lot.quantity;
  }
  if (vesselLiters < 8 || vesselLiters > 12) violations.push({ code: "belongings_vessel_capacity", message: `Los recipientes del grupo suman ${vesselLiters} L, fuera de 8–12 L (SCN-003 §3.5).` });
  if (waterLiters < 5 || waterLiters > 8) violations.push({ code: "belongings_water", message: `El grupo lleva ${waterLiters} L de agua, fuera de 5–8 L (SCN-003 §3.5).` });
  if (meals < 5 || meals > 7) violations.push({ code: "belongings_meals", message: `El grupo lleva ${meals} comidas, lejos de las seis de SCN-003 §3.5.` });
  const requiredGroupFunctions = ["ignition", "cutting", "illumination", "heat_water"];
  const groupFunctions = new Set(Object.values(state.worldObjects).filter((o) => resolveHolderPersonId(state, o.location)).flatMap((o) => o.functions));
  for (const fn of requiredGroupFunctions) {
    if (!groupFunctions.has(fn)) violations.push({ code: "belongings_missing_function", message: `Ninguna pertenencia del grupo cubre la función ${fn} (SCN-003 §3.5).` });
  }
  if (!Object.values(state.resourceLots).some((l) => l.family === "healing_material" && resolveHolderPersonId(state, l.location))) {
    violations.push({ code: "belongings_missing_first_aid", message: "El grupo no lleva material básico de primeros auxilios (SCN-003 §3.5)." });
  }
}
