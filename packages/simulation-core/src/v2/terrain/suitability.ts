import type { SimulationStateV2, SuitabilityReason, TerrainSuitability, WorldPoint } from "@z-world/contracts";
import { combineSuitability, effectiveTerrainCoverage } from "@z-world/contracts";
import { centroidOf, polygonArea } from "../generator/geometry-helpers.js";
import { valuesById } from "../ordered.js";

/**
 * Evaluación común y explicable de aptitud física (S10, WLD-010 §3.1). Pura
 * función de consulta: nunca muta el estado. Devuelve razones estructuradas,
 * nunca un booleano desnudo, clasificadas según la sección 3.1 del prompt de
 * subhito. Cuando una dimensión física no está modelada todavía (pendiente,
 * humedad/drenaje reales), se documenta aquí como aproximación conservadora
 * en vez de inventar precisión que los datos no sostienen.
 */

const MIN_PLOT_AREA_M2 = 20;
const MAX_PLOT_AREA_M2 = 4000;

function fogStateAt(state: SimulationStateV2, point: WorldPoint): "hidden" | "known" | "observable" {
  const { fog } = state;
  const col = Math.floor((point.x - fog.originX) / fog.resolutionMeters);
  const row = Math.floor((point.y - fog.originY) / fog.resolutionMeters);
  if (col < 0 || row < 0 || col >= fog.columns || row >= fog.rows) return "hidden";
  const value = fog.cells[row * fog.columns + col] ?? 0;
  return value === 2 ? "observable" : value === 1 ? "known" : "hidden";
}

/** Encuentra la `TerrainArea` de fondo cuyo polígono contiene el centro de un polígono candidato (S10: la parcela se recorta a la superficie física real, nunca al trazado libre del jugador). */
export function findHostTerrainArea(state: SimulationStateV2, candidatePolygon: readonly WorldPoint[]) {
  const center = centroidOf(candidatePolygon);
  return valuesById(state.world.terrainAreas).find((area) => pointInPolygon(center, area.polygon)) ?? null;
}

function pointInPolygon(point: WorldPoint, polygon: readonly WorldPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i]!;
    const pj = polygon[j]!;
    const intersects = pi.y > point.y !== pj.y > point.y && point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

/**
 * Evalúa si un polígono candidato es apto para delimitar una parcela de
 * cultivo (SET-011, WLD-010 §3.4). No decide aún si la parcela YA existe
 * (eso lo comprueba el llamador); solo la aptitud física del terreno.
 */
export function evaluateCultivationSuitability(state: SimulationStateV2, candidatePolygon: readonly WorldPoint[]): TerrainSuitability {
  const reasons: SuitabilityReason[] = [];
  const { bounds } = state.world;
  const area = polygonArea(candidatePolygon);
  const outOfBounds = candidatePolygon.some((p) => p.x < bounds.minX || p.x > bounds.maxX || p.y < bounds.minY || p.y > bounds.maxY);
  if (candidatePolygon.length < 3 || area <= 0 || outOfBounds) {
    reasons.push({ code: "degenerate_or_out_of_bounds_geometry", verdict: "blocked_physical" });
    return combineSuitability(reasons);
  }
  if (area < MIN_PLOT_AREA_M2 || area > MAX_PLOT_AREA_M2) {
    reasons.push({ code: "geometry_size_out_of_range", verdict: "blocked_physical" });
  }

  const center = centroidOf(candidatePolygon);
  const fog = fogStateAt(state, center);
  if (fog === "hidden") {
    reasons.push({ code: "unobserved_terrain", verdict: "unknown_insufficient_observation" });
    return combineSuitability(reasons);
  }

  const host = findHostTerrainArea(state, candidatePolygon);
  if (!host) {
    reasons.push({ code: "no_background_terrain_here", verdict: "blocked_physical" });
    return combineSuitability(reasons);
  }
  if (host.kind === "water" || host.kind === "obstacle") {
    reasons.push({ code: "terrain_kind_incompatible", verdict: "blocked_physical" });
    return combineSuitability(reasons);
  }
  if (!host.transitable) {
    reasons.push({ code: "terrain_not_accessible", verdict: "blocked_access" });
  }

  // Colisión con edificios, otras parcelas activas o barreras construidas (WLD-010 §5.1: nunca solapa superficies incompatibles).
  const overlapsBuilding = valuesById(state.world.buildings).some((b) => polygonsOverlapRoughly(candidatePolygon, b.footprint));
  if (overlapsBuilding) reasons.push({ code: "overlaps_building", verdict: "blocked_physical" });
  const overlapsParcel = valuesById(state.world.parcels).some((p) => p.cultivationPlotId && polygonsOverlapRoughly(candidatePolygon, p.polygon));
  if (overlapsParcel) reasons.push({ code: "overlaps_active_cultivation_plot", verdict: "blocked_physical" });

  const coverage = effectiveTerrainCoverage(host);
  if (coverage !== "none") {
    reasons.push({ code: coverage === "vegetation" ? "requires_clearing_vegetation_first" : "requires_clearing_debris_first", verdict: "valid_with_limitations" });
  }

  return combineSuitability(reasons);
}

/** Solape aproximado: cualquier vértice de un polígono cae dentro del otro (barata y conservadora; suficiente para bloquear casos claros sin geometría de intersección completa). */
function polygonsOverlapRoughly(a: readonly WorldPoint[], b: readonly WorldPoint[]): boolean {
  return a.some((p) => pointInPolygon(p, b)) || b.some((p) => pointInPolygon(p, a));
}
