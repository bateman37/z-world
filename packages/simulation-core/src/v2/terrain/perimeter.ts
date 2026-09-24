import type { PerimeterNetwork, SemanticWorldV2 } from "@z-world/contracts";
import { valuesById } from "../ordered.js";

/**
 * Red de perímetro derivada de la topología física real (S10, WLD-010 §3.6
 * y §4: "`PerimeterNetwork.closed` no debe ser una verdad editable
 * independiente"). Reconstruye por completo `world.perimeterNetworks` a
 * partir de los tramos de barrera construidos cada vez que cambia algo que
 * pueda abrir o cerrar un lazo (una barrera termina, un cierre cambia de
 * estado, un edificio ancla se desmantela/demuele): nunca se persiste un
 * booleano `closed` editado a mano.
 *
 * Modelo: los anclajes son nodos de un grafo; cada `BarrierSegment`
 * construido es una arista que solo cuenta como cerrada si su cruce con una
 * vía (si lo tiene) no es un hueco abierto de facto. Un anclaje
 * `building_corner`/`compatible_wall` cuyo edificio ya no está en pie deja
 * de aportar continuidad (un ancla demolida rompe el perímetro). Un lazo
 * (ciclo) en ese grafo es un perímetro cerrado; un componente conexo sin
 * ciclo es un tramo incompleto (huecos conocidos).
 */
export function derivePerimeterNetworks(world: SemanticWorldV2): Readonly<Record<string, PerimeterNetwork>> {
  const builtSegments = valuesById(world.barrierSegments).filter((s) => s.built && effectiveSegmentPassable(world, s) === false);

  // Unión-búsqueda sobre anclajes para agrupar segmentos conectados, y detección de ciclo por comparación de aristas y nodos por componente.
  const parent = new Map<string, string>();
  const find = (id: string): string => {
    let root = id;
    while (parent.get(root) && parent.get(root) !== root) root = parent.get(root)!;
    parent.set(id, root);
    return root;
  };
  const union = (a: string, b: string): void => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  for (const segment of builtSegments) {
    if (!parent.has(segment.fromAnchorId)) parent.set(segment.fromAnchorId, segment.fromAnchorId);
    if (!parent.has(segment.toAnchorId)) parent.set(segment.toAnchorId, segment.toAnchorId);
    union(segment.fromAnchorId, segment.toAnchorId);
  }

  const byComponent = new Map<string, { readonly nodes: Set<string>; readonly segments: string[] }>();
  for (const segment of builtSegments) {
    const root = find(segment.fromAnchorId);
    const bucket = byComponent.get(root) ?? { nodes: new Set<string>(), segments: [] };
    bucket.nodes.add(segment.fromAnchorId);
    bucket.nodes.add(segment.toAnchorId);
    bucket.segments.push(segment.id);
    byComponent.set(root, bucket);
  }

  const networks: Record<string, PerimeterNetwork> = {};
  for (const [root, bucket] of [...byComponent.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    // Un componente conexo con al menos tantas aristas como nodos contiene un ciclo (perímetro cerrado); con menos, es un árbol (tramos, sin cierre).
    const closed = bucket.segments.length >= bucket.nodes.size && bucket.nodes.size >= 3;
    const id = `perimeter-${root}`;
    networks[id] = { id, segmentIds: [...bucket.segments].sort(), closed };
  }
  return networks;
}

/**
 * `false` si el tramo, en su cruce con una vía, deja un hueco realmente
 * abierto ahora mismo (un portón sin cerrar cuenta como hueco, no como
 * segmento; WLD-010 §3.6: "un hueco, portón abierto... conserva
 * vulnerabilidad"). Sin cruce, el tramo construido siempre cierra.
 */
function effectiveSegmentPassable(world: SemanticWorldV2, segment: { readonly crossesWayId: string | null; readonly wayCrossingMode: "full_block" | "pedestrian_gap" | "handcart_gate" | null }): boolean {
  if (!segment.crossesWayId) return false;
  if (segment.wayCrossingMode === "full_block") return false;
  // `pedestrian_gap`/`handcart_gate` sin cierre instalado son huecos permanentes: nunca cierran el perímetro por sí solos.
  return true;
}

/** Huecos conocidos de un perímetro: anclajes con menos de dos aristas vigentes (extremos sueltos de un tramo incompleto). */
export function perimeterGapAnchorIds(world: SemanticWorldV2, network: PerimeterNetwork): readonly string[] {
  const degree = new Map<string, number>();
  for (const segmentId of network.segmentIds) {
    const segment = world.barrierSegments[segmentId];
    if (!segment) continue;
    degree.set(segment.fromAnchorId, (degree.get(segment.fromAnchorId) ?? 0) + 1);
    degree.set(segment.toAnchorId, (degree.get(segment.toAnchorId) ?? 0) + 1);
  }
  return [...degree.entries()].filter(([, count]) => count < 2).map(([id]) => id);
}
