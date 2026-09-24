import type { BulkClass, CargoRef, EntityLocation, HandlingTag, SimulationStateV2 } from "@z-world/contracts";
import { furnitureLocation } from "@z-world/contracts";
import { valuesById } from "../ordered.js";
import { BULK_RANK, OBJECT_CATALOG_BY_VARIANT, RESOURCE_CATALOG_BY_FAMILY, RESOURCE_HANDLING_TAGS, RESOURCE_VOLUME_PER_UNIT } from "@z-world/catalogs";

/**
 * Modelo mínimo de carga de SET-010 §3.5 (S8, §7.2 del prompt S7-S9):
 * peso, volumen/bulto, etiquetas de manipulación y mínimo duro de personas,
 * todo derivado del contenido real (objetos con su propio contenido, lotes
 * con su cantidad, muebles con su contenedor). Evita los dos extremos:
 * peso como único factor y simulación milimétrica de la forma.
 */

export interface CargoSummary {
  readonly totalWeightKg: number;
  readonly totalVolumeLiters: number;
  readonly bulk: BulkClass;
  readonly handlingTags: readonly HandlingTag[];
  readonly minCarriers: number;
  readonly lowestCondition: number | null;
  /** Peso de cada elemento por separado (para repartir un porte a pulso en equipo). */
  readonly items: readonly { readonly ref: CargoRef; readonly weightKg: number; readonly volumeLiters: number; readonly bulk: BulkClass; readonly tags: readonly HandlingTag[] }[];
}

const round3 = (value: number): number => Math.round(value * 1000) / 1000;

export function cargoLocation(state: SimulationStateV2, ref: CargoRef): EntityLocation | null {
  if (ref.kind === "world_object") return state.worldObjects[ref.id]?.location ?? null;
  if (ref.kind === "resource_lot") return state.resourceLots[ref.id]?.location ?? null;
  const furniture = state.furniture[ref.id];
  return furniture ? furnitureLocation(furniture) : null;
}

function lotWeightKg(state: SimulationStateV2, lotId: string): number {
  const lot = state.resourceLots[lotId];
  if (!lot) return 0;
  return lot.quantity * (RESOURCE_CATALOG_BY_FAMILY.get(lot.family)?.kgPerUnit ?? 1);
}

/** Peso del contenido de un contenedor (recursivo: una botella con agua dentro de una mochila). */
function containerContentWeightKg(state: SimulationStateV2, containerId: string | null, depth = 0): number {
  if (!containerId || depth > 8) return 0;
  const container = state.containers[containerId];
  if (!container) return 0;
  let total = 0;
  for (const contentId of container.contentIds) {
    const obj = state.worldObjects[contentId];
    if (obj) total += objectWeightKg(state, obj.id, depth + 1);
    else total += lotWeightKg(state, contentId);
  }
  return total;
}

function objectWeightKg(state: SimulationStateV2, objectId: string, depth = 0): number {
  const obj = state.worldObjects[objectId];
  if (!obj) return 0;
  let total = obj.weightKg + containerContentWeightKg(state, obj.containerId, depth);
  // Líquido real dentro de un recipiente (lotes `on_object`).
  for (const lot of valuesById(state.resourceLots)) {
    if (lot.location.kind === "on_object" && lot.location.objectId === objectId) total += lotWeightKg(state, lot.id);
  }
  return total;
}

function lotTags(family: string): readonly HandlingTag[] {
  return RESOURCE_HANDLING_TAGS[family] ?? [];
}

/**
 * Etiquetas de manipulación que el contenido transmite a quien lo contiene
 * (SET-010 §3.5): un cubo con agua se lleva como líquido, una mochila con un
 * farol dentro es frágil y hay que mantenerla vertical. Las etiquetas
 * geométricas (`long`, `bulky`) no se heredan: las absorbe el propio
 * recipiente, cuyo bulto ya cuenta.
 */
const INHERITED_HANDLING_TAGS: ReadonlySet<HandlingTag> = new Set<HandlingTag>(["liquid", "fragile", "contaminating", "keep_upright"]);

function inheritable(tags: readonly HandlingTag[]): HandlingTag[] {
  return tags.filter((t) => INHERITED_HANDLING_TAGS.has(t));
}

function containerContentTags(state: SimulationStateV2, containerId: string | null, depth = 0): HandlingTag[] {
  if (!containerId || depth > 8) return [];
  const container = state.containers[containerId];
  if (!container) return [];
  const tags: HandlingTag[] = [];
  for (const contentId of container.contentIds) {
    const obj = state.worldObjects[contentId];
    if (obj) tags.push(...inheritable(obj.handlingTags), ...objectContentTags(state, obj.id, depth + 1));
    else {
      const lot = state.resourceLots[contentId];
      if (lot) tags.push(...inheritable(lotTags(lot.family)));
    }
  }
  return tags;
}

function objectContentTags(state: SimulationStateV2, objectId: string, depth = 0): HandlingTag[] {
  const obj = state.worldObjects[objectId];
  if (!obj) return [];
  const tags = containerContentTags(state, obj.containerId, depth);
  for (const lot of valuesById(state.resourceLots)) {
    if (lot.location.kind === "on_object" && lot.location.objectId === objectId) tags.push(...inheritable(lotTags(lot.family)));
  }
  return tags;
}

function uniqueSorted(tags: readonly HandlingTag[]): HandlingTag[] {
  return [...new Set(tags)].sort();
}

/** Objetos frágiles de la carga, incluidos los que van dentro de un recipiente (para la conservación en ruta). */
export function fragileCargoObjectIds(state: SimulationStateV2, cargo: readonly CargoRef[]): string[] {
  const out: string[] = [];
  const visitContainer = (containerId: string | null, depth: number): void => {
    if (!containerId || depth > 8) return;
    for (const id of state.containers[containerId]?.contentIds ?? []) visitObject(id, depth + 1);
  };
  const visitObject = (id: string, depth: number): void => {
    const obj = state.worldObjects[id];
    if (!obj) return;
    if (obj.handlingTags.includes("fragile")) out.push(obj.id);
    visitContainer(obj.containerId, depth);
  };
  for (const ref of cargo) {
    if (ref.kind === "world_object") visitObject(ref.id, 0);
    else if (ref.kind === "furniture") visitContainer(state.furniture[ref.id]?.containerId ?? null, 0);
  }
  return [...new Set(out)].sort();
}

function bulkForLot(quantity: number, unit: "liter" | "kilogram" | "unit"): BulkClass {
  const liters = quantity * RESOURCE_VOLUME_PER_UNIT[unit];
  if (liters <= 5) return "small";
  if (liters <= 25) return "medium";
  if (liters <= 60) return "large";
  return "bulky";
}

export function describeCargoItem(state: SimulationStateV2, ref: CargoRef): CargoSummary["items"][number] | null {
  if (ref.kind === "world_object") {
    const obj = state.worldObjects[ref.id];
    if (!obj) return null;
    return { ref, weightKg: round3(objectWeightKg(state, obj.id)), volumeLiters: obj.volumeLiters, bulk: obj.bulk, tags: uniqueSorted([...obj.handlingTags, ...objectContentTags(state, obj.id)]) };
  }
  if (ref.kind === "resource_lot") {
    const lot = state.resourceLots[ref.id];
    if (!lot) return null;
    return { ref, weightKg: round3(lotWeightKg(state, lot.id)), volumeLiters: round3(lot.quantity * RESOURCE_VOLUME_PER_UNIT[lot.unit]), bulk: bulkForLot(lot.quantity, lot.unit), tags: lotTags(lot.family) };
  }
  const furniture = state.furniture[ref.id];
  if (!furniture) return null;
  const entry = furniture.variant ? OBJECT_CATALOG_BY_VARIANT.get(furniture.variant) : undefined;
  return {
    ref,
    weightKg: round3(furniture.weightKg + containerContentWeightKg(state, furniture.containerId)),
    volumeLiters: entry?.defaultVolumeLiters ?? 400,
    bulk: furniture.bulk,
    tags: uniqueSorted([...furniture.handlingTags, ...containerContentTags(state, furniture.containerId)]),
  };
}

function minCarriersFor(state: SimulationStateV2, ref: CargoRef): number {
  if (ref.kind === "world_object") {
    const obj = state.worldObjects[ref.id];
    if (!obj) return 1;
    return Math.max(obj.minOperators, obj.portability === "two_person" && obj.bulk === "bulky" ? 2 : 1);
  }
  if (ref.kind === "furniture") {
    const furniture = state.furniture[ref.id];
    if (!furniture) return 1;
    const entry = furniture.variant ? OBJECT_CATALOG_BY_VARIANT.get(furniture.variant) : undefined;
    return Math.max(entry?.minOperators ?? 1, furniture.bulk === "bulky" ? 2 : 1);
  }
  return 1;
}

function conditionOf(state: SimulationStateV2, ref: CargoRef): number | null {
  if (ref.kind === "world_object") return state.worldObjects[ref.id]?.condition ?? null;
  if (ref.kind === "resource_lot") return state.resourceLots[ref.id]?.condition ?? null;
  return state.furniture[ref.id]?.condition ?? null;
}

export function summarizeCargo(state: SimulationStateV2, cargo: readonly CargoRef[]): CargoSummary | null {
  const items: CargoSummary["items"][number][] = [];
  let bulk: BulkClass = "small";
  const tags = new Set<HandlingTag>();
  let minCarriers = 1;
  let lowest: number | null = null;
  for (const ref of cargo) {
    const item = describeCargoItem(state, ref);
    if (!item) return null;
    items.push(item);
    if (BULK_RANK[item.bulk] > BULK_RANK[bulk]) bulk = item.bulk;
    for (const tag of item.tags) tags.add(tag);
    minCarriers = Math.max(minCarriers, minCarriersFor(state, ref));
    const condition = conditionOf(state, ref);
    if (condition !== null) lowest = lowest === null ? condition : Math.min(lowest, condition);
  }
  // Varios elementos medianos juntos ya no son «a mano» sin más: el volumen total sube el bulto de la carga.
  const totalVolumeLiters = round3(items.reduce((acc, i) => acc + i.volumeLiters, 0));
  if (totalVolumeLiters > 60 && BULK_RANK[bulk] < BULK_RANK.bulky) bulk = "bulky";
  else if (totalVolumeLiters > 25 && BULK_RANK[bulk] < BULK_RANK.large) bulk = "large";
  return {
    totalWeightKg: round3(items.reduce((acc, i) => acc + i.weightKg, 0)),
    totalVolumeLiters,
    bulk,
    handlingTags: [...tags].sort(),
    minCarriers,
    lowestCondition: lowest,
    items,
  };
}

/** Un elemento es transportable como carga (no instalado ni fijo, no desmontado a piezas si es mueble). */
export function cargoItemBlockReason(state: SimulationStateV2, ref: CargoRef): string | null {
  if (ref.kind === "world_object") {
    const obj = state.worldObjects[ref.id];
    if (!obj) return "block.target_no_longer_exists";
    if (obj.portability === "fixed" || obj.installedAt) return "block.cargo_fixed_installation";
    return null;
  }
  if (ref.kind === "resource_lot") return state.resourceLots[ref.id] ? null : "block.target_no_longer_exists";
  const furniture = state.furniture[ref.id];
  if (!furniture) return "block.target_no_longer_exists";
  return null;
}
