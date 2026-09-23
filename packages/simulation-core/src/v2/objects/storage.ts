import type { BulkClass, Container, EntityLocation, HandlingTag, ResourceLot, SimulationStateV2, StorageItemRef, WorldObject, WorldPoint } from "@z-world/contracts";
import { furnitureLocation } from "@z-world/contracts";
import { valuesById } from "../ordered.js";
import { OBJECT_CATALOG_BY_VARIANT } from "@z-world/catalogs";

/**
 * Almacenamiento físico real de S7 (WEB-002 §6.3/§6.4, CAT-005 §4.4):
 * funciones puras sobre `Container` y sus contenidos. No existe inventario
 * global ni almacén infinito: cada elemento ocupa unidades de capacidad
 * de un contenedor concreto, y cambiar de ubicación siempre deja la
 * jerarquía `Container → Content` coherente en ambos sentidos.
 *
 * Ocupación (provisional, documentada en `docs/STATUS.md`):
 * - objeto completo: `small` 1, `medium` 2, `large` 4, `bulky` 8 unidades;
 * - lote de recurso: una unidad por cada 5 L/kg (o 6 unidades de ración),
 *   con un mínimo de 1.
 */

const UNITS_BY_BULK: Readonly<Record<BulkClass, number>> = { small: 1, medium: 2, large: 4, bulky: 8 };

export function storageUnitsForWorldObject(obj: Pick<WorldObject, "bulk">): number {
  return UNITS_BY_BULK[obj.bulk];
}

export function storageUnitsForResourceLot(lot: Pick<ResourceLot, "quantity" | "unit">): number {
  const perUnit = lot.unit === "unit" ? 6 : 5;
  return Math.max(1, Math.ceil(lot.quantity / perUnit));
}

export function storageUnitsForItem(state: SimulationStateV2, ref: StorageItemRef): number | null {
  if (ref.kind === "world_object") {
    const obj = state.worldObjects[ref.id];
    return obj ? storageUnitsForWorldObject(obj) : null;
  }
  const lot = state.resourceLots[ref.id];
  return lot ? storageUnitsForResourceLot(lot) : null;
}

export function containerUsedUnits(state: SimulationStateV2, container: Container): number {
  let used = 0;
  for (const contentId of container.contentIds) {
    const obj = state.worldObjects[contentId];
    if (obj) {
      used += storageUnitsForWorldObject(obj);
      continue;
    }
    const lot = state.resourceLots[contentId];
    if (lot) used += storageUnitsForResourceLot(lot);
  }
  return used;
}

export function containerFreeUnits(state: SimulationStateV2, container: Container): number {
  return Math.max(0, container.capacityUnits - containerUsedUnits(state, container));
}

/** Un contenedor deja de admitir contenido si su anfitrión ya solo es piezas o si su capacidad útil se anuló (desmontaje, S7 §6.9). */
export function isContainerUsable(state: SimulationStateV2, container: Container): boolean {
  if (container.capacityUnits <= 0) return false;
  if (container.hostFurnitureId) {
    const host = state.furniture[container.hostFurnitureId];
    if (!host || host.functionalState === "parts_only") return false;
  }
  if (container.hostWorldObjectId) {
    const host = state.worldObjects[container.hostWorldObjectId];
    if (!host || host.functionalState === "parts_only") return false;
  }
  return true;
}

export function itemLocation(state: SimulationStateV2, ref: StorageItemRef): EntityLocation | null {
  if (ref.kind === "world_object") return state.worldObjects[ref.id]?.location ?? null;
  return state.resourceLots[ref.id]?.location ?? null;
}

function itemHandlingTags(state: SimulationStateV2, ref: StorageItemRef): readonly HandlingTag[] {
  if (ref.kind === "world_object") return state.worldObjects[ref.id]?.handlingTags ?? [];
  const lot = state.resourceLots[ref.id];
  if (!lot) return [];
  return lot.family === "water" ? ["liquid"] : [];
}

/**
 * Persona que sostiene físicamente una ubicación, atravesando contenedores
 * y objetos anfitriones (una botella dentro de la mochila que alguien
 * lleva). `null` si la cadena termina en una estancia, el exterior u otra
 * ubicación no personal.
 */
export function resolveHolderPersonId(state: SimulationStateV2, location: EntityLocation, depth = 0): string | null {
  if (depth > 16) return null;
  switch (location.kind) {
    case "carried_by_person":
      return location.personId;
    case "container": {
      const container = state.containers[location.containerId];
      return container ? resolveHolderPersonId(state, container.location, depth + 1) : null;
    }
    case "on_object": {
      const obj = state.worldObjects[location.objectId];
      if (obj) return resolveHolderPersonId(state, obj.location, depth + 1);
      return null;
    }
    default:
      return null;
  }
}

/** ¿La cadena de ubicación de `location` atraviesa el objeto `objectId` (o un contenedor alojado por él)? Evita contención circular (§6.4). */
function locationPassesThroughObject(state: SimulationStateV2, location: EntityLocation, objectId: string, depth = 0): boolean {
  if (depth > 16) return true;
  switch (location.kind) {
    case "on_object":
      if (location.objectId === objectId) return true;
      return state.worldObjects[location.objectId] ? locationPassesThroughObject(state, state.worldObjects[location.objectId]!.location, objectId, depth + 1) : false;
    case "container": {
      const container = state.containers[location.containerId];
      if (!container) return false;
      if (container.hostWorldObjectId === objectId) return true;
      return locationPassesThroughObject(state, container.location, objectId, depth + 1);
    }
    default:
      return false;
  }
}

/**
 * Motivo causal por el que `ref` no cabe hoy en `container`, o `null` si
 * cabe. Nunca hay sobrecapacidad silenciosa: un contenedor lleno bloquea
 * con motivo explícito (§6.4).
 */
export function storageBlockReason(state: SimulationStateV2, container: Container, ref: StorageItemRef): string | null {
  if (!isContainerUsable(state, container)) return "block.container_unusable";
  const units = storageUnitsForItem(state, ref);
  if (units === null) return "block.target_no_longer_exists";
  const location = itemLocation(state, ref);
  if (location && location.kind === "container" && location.containerId === container.id) return "block.item_already_stored";
  if (ref.kind === "world_object") {
    if (container.hostWorldObjectId === ref.id) return "block.container_incompatible";
    if (locationPassesThroughObject(state, container.location, ref.id)) return "block.container_incompatible";
    const obj = state.worldObjects[ref.id]!;
    if (obj.portability === "fixed" || obj.installedAt) return "block.container_incompatible";
  }
  if (container.acceptedHandlingTags) {
    const accepted = new Set(container.acceptedHandlingTags);
    if (itemHandlingTags(state, ref).some((tag) => !accepted.has(tag))) return "block.container_incompatible";
  }
  if (containerFreeUnits(state, container) < units) return "block.container_full";
  return null;
}

/** Punto de mundo aproximado de una ubicación (para alcance en exterior). */
export function locationWorldPoint(state: SimulationStateV2, location: EntityLocation, depth = 0): WorldPoint | null {
  if (depth > 16) return null;
  switch (location.kind) {
    case "world_point":
      return location.point;
    case "carried_by_person":
      return state.people[location.personId]?.public.position ?? null;
    case "container": {
      const container = state.containers[location.containerId];
      return container ? locationWorldPoint(state, container.location, depth + 1) : null;
    }
    case "on_object": {
      const obj = state.worldObjects[location.objectId];
      if (obj) return locationWorldPoint(state, obj.location, depth + 1);
      const furniture = state.furniture[location.objectId];
      return furniture ? locationWorldPoint(state, furnitureLocation(furniture), depth + 1) : null;
    }
    case "room": {
      const room = state.world.rooms[location.roomId];
      if (!room || room.polygon.length === 0) return null;
      const sum = room.polygon.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
      return { x: sum.x / room.polygon.length, y: sum.y / room.polygon.length };
    }
    case "mounted_on_transport": {
      const means = state.transportMeans[location.transportId];
      return means ? locationWorldPoint(state, means.location, depth + 1) : null;
    }
    default:
      return null;
  }
}

/**
 * Mueve un objeto o lote a `nextLocation` en un único límite causal,
 * manteniendo la jerarquía bidireccional: lo retira del `contentIds` del
 * contenedor de origen (si lo había) y lo añade al del destino (si es un
 * contenedor). Nunca duplica ni deja huérfano el contenido.
 */
export function moveItem(state: SimulationStateV2, ref: StorageItemRef, nextLocation: EntityLocation): SimulationStateV2 {
  const previous = itemLocation(state, ref);
  if (!previous) return state;
  let containers = state.containers;
  if (previous.kind === "container") {
    const source = containers[previous.containerId];
    if (source) containers = { ...containers, [source.id]: { ...source, contentIds: source.contentIds.filter((id) => id !== ref.id) } };
  }
  if (nextLocation.kind === "container") {
    const destination = containers[nextLocation.containerId];
    if (destination && !destination.contentIds.includes(ref.id)) {
      containers = { ...containers, [destination.id]: { ...destination, contentIds: [...destination.contentIds, ref.id] } };
    }
  }
  if (ref.kind === "world_object") {
    const obj = state.worldObjects[ref.id]!;
    return { ...state, containers, worldObjects: { ...state.worldObjects, [obj.id]: { ...obj, location: nextLocation } } };
  }
  const lot = state.resourceLots[ref.id]!;
  return { ...state, containers, resourceLots: { ...state.resourceLots, [lot.id]: { ...lot, location: nextLocation } } };
}

/** Capacidad de líquido (L) de un recipiente según su variante de catálogo, o `null` si no es un recipiente de líquido. */
export function liquidCapacityOf(obj: Pick<WorldObject, "variant" | "functionalState">): number | null {
  if (obj.functionalState === "parts_only" || obj.functionalState === "broken") return null;
  return OBJECT_CATALOG_BY_VARIANT.get(obj.variant)?.liquidCapacityLiters ?? null;
}

/** Litros de agua que ya contiene un recipiente (lotes `on_object` sobre él). */
export function liquidHeldBy(state: SimulationStateV2, objectId: string): number {
  let total = 0;
  for (const lot of valuesById(state.resourceLots)) {
    if (lot.family === "water" && lot.location.kind === "on_object" && lot.location.objectId === objectId) total += lot.quantity;
  }
  return total;
}

/**
 * División y fusión de lotes (S7 §6.5): conservan la cantidad exacta, la
 * condición y la procedencia, y nunca mezclan estados incompatibles sin una
 * regla expresa. Regla de compatibilidad provisional (documentada en
 * `docs/STATUS.md`): misma familia y unidad, misma calidad conocida, y
 * - no perecederos: condición a ±0,1 → la condición resultante es la media
 *   ponderada por cantidad;
 * - perecederos: solo si comparten exactamente el mismo inicio y punto de
 *   partida de deterioro (misma curva), para no falsear la frescura.
 */
export function canMergeResourceLots(a: ResourceLot, b: ResourceLot): boolean {
  if (a.id === b.id || a.family !== b.family || a.unit !== b.unit || a.qualityKnown !== b.qualityKnown) return false;
  if (a.reservedByJobId || b.reservedByJobId) return false;
  if (a.decayStartedAtSimSeconds !== null || b.decayStartedAtSimSeconds !== null) {
    return a.decayStartedAtSimSeconds === b.decayStartedAtSimSeconds && a.conditionAtDecayStart === b.conditionAtDecayStart && a.condition === b.condition;
  }
  return Math.abs(a.condition - b.condition) <= 0.1 && Math.abs(a.quality - b.quality) <= 0.1;
}

const round4 = (value: number): number => Math.round(value * 10000) / 10000;

/** Fusiona `mergedId` en `survivorId` (misma ubicación final que el superviviente). Devuelve `null` si no son compatibles. */
export function mergeResourceLots(state: SimulationStateV2, survivorId: string, mergedId: string): SimulationStateV2 | null {
  const survivor = state.resourceLots[survivorId];
  const merged = state.resourceLots[mergedId];
  if (!survivor || !merged || !canMergeResourceLots(survivor, merged)) return null;
  const total = survivor.quantity + merged.quantity;
  const weighted = (x: number, y: number) => (total > 0 ? round4((x * survivor.quantity + y * merged.quantity) / total) : x);
  const provenance = [survivor.provenance, `merged:${merged.id}${merged.provenance ? `(${merged.provenance})` : ""}`].filter(Boolean).join("+");
  let containers = state.containers;
  if (merged.location.kind === "container") {
    const source = containers[merged.location.containerId];
    if (source) containers = { ...containers, [source.id]: { ...source, contentIds: source.contentIds.filter((id) => id !== merged.id) } };
  }
  const resourceLots = { ...state.resourceLots };
  delete resourceLots[merged.id];
  resourceLots[survivor.id] = {
    ...survivor,
    quantity: Math.round(total * 1000) / 1000,
    condition: survivor.decayStartedAtSimSeconds !== null ? survivor.condition : weighted(survivor.condition, merged.condition),
    quality: weighted(survivor.quality, merged.quality),
    provenance,
  };
  return { ...state, containers, resourceLots };
}

/** Separa `quantity` de un lote en un lote nuevo `newLotId` situado en `nextLocation`, con la misma condición, calidad, curva de deterioro y procedencia. */
export function splitResourceLot(state: SimulationStateV2, lotId: string, quantity: number, newLotId: string, nextLocation: EntityLocation): SimulationStateV2 | null {
  const lot = state.resourceLots[lotId];
  if (!lot || quantity <= 0 || quantity >= lot.quantity) return null;
  const remaining = Math.round((lot.quantity - quantity) * 1000) / 1000;
  const part: ResourceLot = { ...lot, id: newLotId, quantity: Math.round(quantity * 1000) / 1000, location: nextLocation, reservedByJobId: null, provenance: `split_from:${lot.id}${lot.provenance ? `(${lot.provenance})` : ""}` };
  let next: SimulationStateV2 = { ...state, resourceLots: { ...state.resourceLots, [lot.id]: { ...lot, quantity: remaining }, [newLotId]: part } };
  if (nextLocation.kind === "container") {
    const destination = next.containers[nextLocation.containerId];
    if (destination) next = { ...next, containers: { ...next.containers, [destination.id]: { ...destination, contentIds: [...destination.contentIds, newLotId] } } };
  }
  return next;
}
