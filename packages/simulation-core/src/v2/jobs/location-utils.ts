import type { EntityLocation, JobTarget, SimulationStateV2, WorldPoint } from "@z-world/contracts";
import { furnitureLocation } from "@z-world/contracts";
import { isBuildingTerminal, isRoomInTerminalBuilding, openingsOfBuilding, roomsOfBuilding } from "../exploitation/fabric.js";

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
      // S9: un edificio en pie se trabaja (inspecciona, reconoce) desde su estancia de entrada; la posición del lugar cae
      // dentro de la huella, que no es transitable. Solo un edificio terminal (sin estancias utilizables) se localiza en su lugar.
      if (!isBuildingTerminal(state.world, target.buildingId)) {
        const entry = openingsOfBuilding(state.world, target.buildingId).find((o) => o.connectsToExterior && o.connectsRoomId);
        const roomId = entry?.connectsRoomId ?? roomsOfBuilding(state.world, target.buildingId)[0]?.id;
        if (roomId) return { kind: "room", roomId };
      }
      const place = state.world.places[building.placeId];
      return place ? { kind: "world_point", point: place.position } : null;
    }
    case "room":
      // S9: las estancias de un edificio desmantelado o demolido ya no existen como lugar utilizable (irreversible).
      if (!state.world.rooms[target.roomId] || isRoomInTerminalBuilding(state.world, target.roomId)) return null;
      return { kind: "room", roomId: target.roomId };
    case "opening": {
      const opening = state.world.openings[target.openingId];
      return opening ? { kind: "world_point", point: opening.position } : null;
    }
    case "building_installation": {
      // S9: una instalación se trabaja desde una de las estancias a las que da servicio (o desde el edificio si no tiene ninguna).
      const installation = state.world.buildingInstallations?.[target.installationId];
      if (!installation) return null;
      const roomId = installation.roomIds.find((id) => state.world.rooms[id]);
      if (roomId) return isRoomInTerminalBuilding(state.world, roomId) ? null : { kind: "room", roomId };
      return resolveTargetLocation(state, { kind: "building", buildingId: installation.buildingId });
    }
    case "building_finish": {
      const finish = state.world.buildingFinishes?.[target.finishId];
      if (!finish) return null;
      if (finish.roomId && state.world.rooms[finish.roomId]) return isRoomInTerminalBuilding(state.world, finish.roomId) ? null : { kind: "room", roomId: finish.roomId };
      return resolveTargetLocation(state, { kind: "building", buildingId: finish.buildingId });
    }
    case "resource_lot": {
      const lot = state.resourceLots[target.resourceLotId];
      return lot ? lot.location : null;
    }
    case "furniture": {
      const furniture = state.furniture[target.furnitureId];
      return furniture ? furnitureLocation(furniture) : null;
    }
    case "world_object": {
      const obj = state.worldObjects[target.worldObjectId];
      return obj ? obj.location : null;
    }
    case "container": {
      const container = state.containers[target.containerId];
      return container ? container.location : null;
    }
    case "transport_means": {
      const means = state.transportMeans[target.transportMeansId];
      return means ? means.location : null;
    }
    case "area":
      return { kind: "world_point", point: centroid(target.polygon) };
    case "own_need":
      // Un blanco `own_need` debe resolverse a un blanco concreto antes de
      // crear el `Job` (ver `resolveOwnNeedTarget`): nunca llega aquí.
      return null;
    case "terrain_area": {
      const area = state.world.terrainAreas[target.terrainAreaId];
      return area ? { kind: "world_point", point: centroid(area.polygon) } : null;
    }
    case "linear_feature": {
      const line = state.world.linearFeatures[target.linearFeatureId];
      return line ? { kind: "world_point", point: centroid(line.polyline) } : null;
    }
    case "cultivation_plot": {
      // S10: el borde del campo es la ubicación exterior de trabajo real de la parcela (SET-011 §3.5, `field_edge`).
      const plot = state.cultivationPlots[target.cultivationPlotId];
      if (!plot || !state.world.parcels[plot.parcelId]) return null;
      return { kind: "field_edge", parcelId: plot.parcelId };
    }
    case "barrier_segment": {
      const segment = state.world.barrierSegments[target.barrierSegmentId];
      if (!segment) return null;
      const from = state.world.anchors[segment.fromAnchorId];
      const to = state.world.anchors[segment.toAnchorId];
      if (!from || !to) return null;
      return { kind: "world_point", point: { x: (from.position.x + to.position.x) / 2, y: (from.position.y + to.position.y) / 2 } };
    }
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
    case "on_object": {
      const worldObject = state.worldObjects[location.objectId];
      if (worldObject) return locationToNavPoint(state, worldObject.location);
      const furniture = state.furniture[location.objectId];
      return furniture ? locationToNavPoint(state, furnitureLocation(furniture)) : null;
    }
    // S8: la carga, el medio y el punto de transferencia tienen su propia ubicación única.
    case "in_load_bundle": {
      const bundle = state.loadBundles[location.loadBundleId];
      return bundle ? locationToNavPoint(state, bundle.location) : null;
    }
    case "mounted_on_transport": {
      const means = state.transportMeans[location.transportId];
      return means ? locationToNavPoint(state, means.location) : null;
    }
    case "transfer_point": {
      const point = state.transferPoints[location.transferPointId];
      return point ? locationToNavPoint(state, point.location) : null;
    }
    // S10: el borde de una parcela es un punto exterior real, junto a su polígono (nunca dentro de él, que puede no ser transitable).
    case "field_edge": {
      const parcel = state.world.parcels[location.parcelId];
      return parcel ? centroid(parcel.polygon) : null;
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
    case "on_object": {
      const worldObject = state.worldObjects[location.objectId];
      if (worldObject) return resolveRoomId(state, worldObject.location);
      const furniture = state.furniture[location.objectId];
      return furniture ? resolveRoomId(state, furnitureLocation(furniture)) : null;
    }
    case "in_load_bundle": {
      const bundle = state.loadBundles[location.loadBundleId];
      return bundle ? resolveRoomId(state, bundle.location) : null;
    }
    case "mounted_on_transport": {
      const means = state.transportMeans[location.transportId];
      return means ? resolveRoomId(state, means.location) : null;
    }
    case "transfer_point": {
      const point = state.transferPoints[location.transferPointId];
      return point ? resolveRoomId(state, point.location) : null;
    }
    default:
      return null;
  }
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

/** La persona comparte ubicación con el blanco (misma estancia, o exterior a corta distancia) — condición mínima de alcance (§14.5/§15.5: "no se consume desde un almacén remoto"). */
export function isPersonCoLocated(state: SimulationStateV2, personId: string, targetLocation: EntityLocation): boolean {
  const person = state.people[personId];
  if (!person) return false;
  const targetRoomId = resolveRoomId(state, targetLocation);
  if (targetRoomId) return person.location.kind === "room" && person.location.roomId === targetRoomId;
  const personPoint = person.location.kind === "world_point" ? person.location.point : person.public.position;
  // S10: una parcela puede ser mucho más ancha que el alcance de 6 m — estar en cualquier punto de ella (o a corta distancia de su borde) cuenta como estar en el campo.
  if (targetLocation.kind === "field_edge") {
    const parcel = state.world.parcels[targetLocation.parcelId];
    if (!parcel) return false;
    if (pointInPolygon(personPoint, parcel.polygon)) return true;
    return parcel.polygon.some((vertex) => Math.hypot(vertex.x - personPoint.x, vertex.y - personPoint.y) <= 6);
  }
  const point = locationToNavPoint(state, targetLocation);
  if (!point) return false;
  return Math.hypot(personPoint.x - point.x, personPoint.y - point.y) <= 6;
}
