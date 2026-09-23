import type { JobTarget, NeedDimension, ResourceLot, SimulationStateV2 } from "@z-world/contracts";

/**
 * Resuelve un blanco concreto y conocido para la autoprotección mínima por
 * necesidad crítica (WEB-002 §7.6 del prompt de subhitos: "genera una
 * intención/trabajo sistémico solo si conoce una solución accesible").
 * Nunca materializa recursos: si no hay candidato conocido, devuelve
 * `null` y el llamador debe explicar el bloqueo, no inventar una solución
 * (§7.6).
 */
export function resolveOwnNeedTarget(state: SimulationStateV2, personId: string, dimension: NeedDimension): JobTarget | null {
  const person = state.people[personId];
  if (!person) return null;

  if (dimension === "hydration" || dimension === "nutrition") {
    const families: readonly ResourceLot["family"][] = dimension === "hydration" ? ["water"] : ["fresh_food", "preserved_food"];
    const candidates = Object.values(state.resourceLots).filter(
      (lot) => families.includes(lot.family) && lot.quantity > 0 && !lot.reservedByJobId && isKnownToPerson(state, personId, lot.id),
    );
    if (candidates.length === 0) return null;
    const best = candidates.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))[0]!;
    return { kind: "resource_lot", resourceLotId: best.id };
  }

  // Descanso: el suelo es siempre una alternativa conocida y accesible allí
  // donde la persona ya se encuentra (§14.5/§7.5 del prompt de subhitos).
  if (person.location.kind === "room") {
    const currentRoomId = person.location.roomId;
    const restFurniture = Object.values(state.furniture).find((f) => f.roomId === currentRoomId && isRestKind(f.kind));
    return restFurniture ? { kind: "furniture", furnitureId: restFurniture.id } : { kind: "room", roomId: currentRoomId };
  }
  return { kind: "area", polygon: [person.public.position] };
}

function isRestKind(kind: string): boolean {
  return /bed|bedroll|mattress|cot|sofa/i.test(kind);
}

/**
 * Un lote se considera conocido por la comunidad si la persona lo lleva
 * consigo (pertenencia, §14.7: "cubrir una necesidad con pertenencias
 * iniciales también debe funcionar") o si la estancia que lo contiene ya
 * tiene su contenido registrado (`DiscoveryRecord` facet `content`).
 */
function isKnownToPerson(state: SimulationStateV2, personId: string, lotId: string): boolean {
  const lot = state.resourceLots[lotId];
  if (!lot) return false;
  if (lot.location.kind === "carried_by_person" && lot.location.personId === personId) return true;
  const roomId = resolveContainerRoomId(state, lot);
  if (!roomId) return false;
  return state.discoveries.some((d) => d.entityId === roomId && d.facet === "content" && d.state !== "unknown");
}

function resolveContainerRoomId(state: SimulationStateV2, lot: ResourceLot): string | null {
  if (lot.location.kind === "room") return lot.location.roomId;
  if (lot.location.kind === "container") {
    const container = state.containers[lot.location.containerId];
    if (!container) return null;
    if (container.location.kind === "room") return container.location.roomId;
  }
  return null;
}
