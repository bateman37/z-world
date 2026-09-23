import type { EntityLocation, JobTarget, SimulationStateV2, WorldPoint } from "@z-world/contracts";

/**
 * Traduce un `JobTarget` (WEB-002 §11.1, subhito S5) a la `EntityLocation`
 * real donde vive esa entidad hoy y a un punto de mundo utilizable como
 * destino de navegación. Devuelve `null` si el blanco ya no existe (p. ej.
 * un lote consumido entre la creación del trabajo y su ejecución): el
 * llamador debe tratarlo como bloqueo causal, nunca como error silencioso.
 */
export function resolveTargetLocation(state: SimulationStateV2, target: JobTarget): EntityLocation | null {
  switch (target.kind) {
    case "place": {
      const place = state.world.places[target.placeId];
      return place ? { kind: "world_point", point: place.position } : null;
    }
    case "building": {
      const building = state.world.buildings[target.buildingId];
      if (!building) return null;
      const place = state.world.places[building.placeId];
      return place ? { kind: "world_point", point: place.position } : null;
    }
    case "room":
      return state.world.rooms[target.roomId] ? { kind: "room", roomId: target.roomId } : null;
    case "opening": {
      const opening = state.world.openings[target.openingId];
      return opening ? { kind: "world_point", point: opening.position } : null;
    }
    case "resource_lot": {
      const lot = state.resourceLots[target.resourceLotId];
      return lot ? lot.location : null;
    }
    case "furniture": {
      const furniture = state.furniture[target.furnitureId];
      return furniture ? { kind: "room", roomId: furniture.roomId } : null;
    }
    case "world_object": {
      const obj = state.worldObjects[target.worldObjectId];
      return obj ? obj.location : null;
    }
    case "area":
      return { kind: "world_point", point: centroid(target.polygon) };
    case "own_need":
      // Un blanco `own_need` debe resolverse a un blanco concreto antes de
      // crear el `Job` (ver `resolveOwnNeedTarget`): nunca llega aquí.
      return null;
    default: {
      const exhaustive: never = target;
      throw new Error(`Blanco de trabajo no reconocido: ${JSON.stringify(exhaustive)}`);
    }
  }
}

function centroid(polygon: readonly WorldPoint[]): WorldPoint {
  const sum = polygon.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / polygon.length, y: sum.y / polygon.length };
}

/** Resuelve el punto de navegación concreto para una `EntityLocation`. `null` cuando la ubicación no es alcanzable como destino directo (p. ej. dentro de un contenedor: se navega a la estancia que lo contiene). */
export function locationToNavPoint(state: SimulationStateV2, location: EntityLocation): WorldPoint | null {
  switch (location.kind) {
    case "world_point":
      return location.point;
    case "room": {
      const room = state.world.rooms[location.roomId];
      if (!room || room.polygon.length === 0) return null;
      return centroid(room.polygon);
    }
    case "container": {
      const container = state.containers[location.containerId];
      return container ? locationToNavPoint(state, container.location) : null;
    }
    case "carried_by_person": {
      const person = state.people[location.personId];
      return person ? person.public.position : null;
    }
    default:
      return null;
  }
}

/** Estancia (si la hay) que contiene realmente una `EntityLocation`, atravesando contenedores. */
export function resolveRoomId(state: SimulationStateV2, location: EntityLocation): string | null {
  switch (location.kind) {
    case "room":
      return location.roomId;
    case "container": {
      const container = state.containers[location.containerId];
      return container ? resolveRoomId(state, container.location) : null;
    }
    case "carried_by_person": {
      const person = state.people[location.personId];
      return person ? (person.location.kind === "room" ? person.location.roomId : null) : null;
    }
    default:
      return null;
  }
}

/** La persona comparte ubicación con el blanco (misma estancia, o exterior a corta distancia) — condición mínima de alcance (§14.5/§15.5: "no se consume desde un almacén remoto"). */
export function isPersonCoLocated(state: SimulationStateV2, personId: string, targetLocation: EntityLocation): boolean {
  const person = state.people[personId];
  if (!person) return false;
  const targetRoomId = resolveRoomId(state, targetLocation);
  if (targetRoomId) return person.location.kind === "room" && person.location.roomId === targetRoomId;
  const point = locationToNavPoint(state, targetLocation);
  if (!point) return false;
  const personPoint = person.location.kind === "world_point" ? person.location.point : person.public.position;
  return Math.hypot(personPoint.x - point.x, personPoint.y - point.y) <= 6;
}
