import type { Building, Opening, Place, Room, TransportMeans, WorldPoint } from "@z-world/contracts";
import type { PrngStream } from "../../prng.js";
import type { IdAllocator } from "./id-allocator.js";
import { makeTransportMeans } from "./scenario.js";
import { cellToWorldCenterV2, nearestWalkableCellV2, type WalkabilityGridV2 } from "../navigation-v2.js";

/**
 * Demostradores de transporte de S8 (Puerta B, generador `web-002-semantic-v3`):
 * un carro de compra/mano abandonado ante el acceso de clientes del
 * supermercado COM-02 más cercano a la llegada, y una carretilla junto a la
 * entrada del refugio provisional. Así una partida nueva permite comparar
 * los cinco métodos (a pulso, recipiente personal, porte coordinado,
 * carretilla y carro) sin depender de que el medio aleatorio de v1/v2 (en un
 * taller lejano, a menudo averiado) sea el que se necesita.
 *
 * Stream PRNG derivado propio: el trazado espacial y todo lo generado por
 * v2 no cambia. Cada medio se deja en una celda exterior transitable real,
 * a unos metros de la abertura, nunca dentro de una huella.
 */
export interface TransportDemonstratorsResult {
  readonly transportMeans: TransportMeans[];
  readonly degradations: readonly string[];
}

function centroid(points: readonly WorldPoint[]): WorldPoint {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function outsideOpening(grid: WalkabilityGridV2, building: Building, opening: Opening, meters: number): WorldPoint | null {
  const c = centroid(building.footprint);
  const dx = opening.position.x - c.x;
  const dy = opening.position.y - c.y;
  const len = Math.hypot(dx, dy) || 1;
  const candidate = { x: opening.position.x + (dx / len) * meters, y: opening.position.y + (dy / len) * meters };
  const cell = nearestWalkableCellV2(grid, candidate);
  return cell ? cellToWorldCenterV2(grid, cell.col, cell.row) : null;
}

export function materializeTransportDemonstrators(
  prng: PrngStream,
  ids: IdAllocator,
  grid: WalkabilityGridV2,
  arrivalPoint: WorldPoint,
  places: readonly Place[],
  buildings: readonly Building[],
  rooms: readonly Room[],
  floors: readonly { id: string; buildingId: string }[],
  openings: readonly Opening[],
  shelterBuildingId: string,
): TransportDemonstratorsResult {
  const degradations: string[] = [];
  const transportMeans: TransportMeans[] = [];
  const buildingOfRoom = new Map<string, string>();
  for (const room of rooms) {
    const floor = floors.find((f) => f.id === room.floorId);
    if (floor) buildingOfRoom.set(room.id, floor.buildingId);
  }
  const exteriorOpeningOf = (buildingId: string, role: string | null): Opening | undefined =>
    openings.find((o) => o.connectsToExterior && o.connectsRoomId && buildingOfRoom.get(o.connectsRoomId) === buildingId && (role === null || rooms.find((r) => r.id === o.connectsRoomId)?.programRoleKey === role));

  const supermarket = places
    .filter((p) => p.profileId === "COM-02" && p.buildingId)
    .sort((a, b) => Math.hypot(a.position.x - arrivalPoint.x, a.position.y - arrivalPoint.y) - Math.hypot(b.position.x - arrivalPoint.x, b.position.y - arrivalPoint.y) || (a.id < b.id ? -1 : 1))[0];
  const supermarketBuilding = supermarket ? buildings.find((b) => b.id === supermarket.buildingId) : undefined;
  const customerAccess = supermarketBuilding ? (exteriorOpeningOf(supermarketBuilding.id, "customer_access") ?? exteriorOpeningOf(supermarketBuilding.id, null)) : undefined;
  const cartPoint = supermarketBuilding && customerAccess ? outsideOpening(grid, supermarketBuilding, customerAccess, 4) : null;
  if (cartPoint) {
    const condition = Math.round((0.75 + prng.nextFloat() * 0.17) * 10000) / 10000;
    transportMeans.push({ ...makeTransportMeans(ids.next("transport"), "handcart", { kind: "world_point", point: cartPoint }, 110 + prng.nextInt(0, 20), condition), provenance: "generated:s8_supermarket_cart" });
  } else {
    degradations.push("No hay supermercado COM-02 con acceso exterior utilizable: no se colocó el carro de mano demostrador de S8.");
  }

  const shelterBuilding = buildings.find((b) => b.id === shelterBuildingId);
  const shelterAccess = shelterBuilding ? exteriorOpeningOf(shelterBuilding.id, null) : undefined;
  const barrowPoint = shelterBuilding && shelterAccess ? outsideOpening(grid, shelterBuilding, shelterAccess, 4) : null;
  if (barrowPoint) {
    const condition = Math.round((0.72 + prng.nextFloat() * 0.18) * 10000) / 10000;
    transportMeans.push({ ...makeTransportMeans(ids.next("transport"), "wheelbarrow", { kind: "world_point", point: barrowPoint }, 70 + prng.nextInt(0, 20), condition), provenance: "generated:s8_shelter_wheelbarrow" });
  } else {
    degradations.push("El refugio no tiene acceso exterior utilizable: no se colocó la carretilla demostradora de S8.");
  }
  return { transportMeans, degradations };
}
