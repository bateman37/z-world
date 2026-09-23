import type { PlaceProfileId, SimulationStateV2 } from "@z-world/contracts";
import { PLACE_PROFILE_IDS } from "@z-world/contracts";
import { SHELTER_DISTANCE_METERS, VILLAGE_BUDGET, type IntRange } from "@z-world/catalogs";

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

  return { ok: violations.length === 0, violations };
}
