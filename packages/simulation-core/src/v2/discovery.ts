import type { DiscoveryRecord, DomainEventV2, KnowledgeState, SemanticWorldV2, SimulationStateV2, WorldPoint } from "@z-world/contracts";
import type { NavigationIndexV2 } from "./room-graph.js";
import { nextEventId } from "../sequences.js";

/**
 * Descubrimiento progresivo pasivo (S3 de WEB-002 §5.6): reglas
 * provisionales, centralizadas y documentadas de distancia/visibilidad —
 * no fórmulas canónicas universales. Solo cubre los facetas activas en S3
 * (`exterior`, `structure`, `accesses`, `rooms`); `content`/`furniture`/
 * `installations` quedan sin tocar hasta que las acciones activas de
 * reconocer/inspeccionar lleguen en un subhito posterior.
 */
export const DISCOVERY_SIGHT_RADIUS_METERS = 50;
export const DISCOVERY_OBSERVE_RADIUS_METERS = 25;
export const DISCOVERY_ACCESS_RADIUS_METERS = 8;

const KNOWLEDGE_RANK: Readonly<Record<KnowledgeState, number>> = {
  unknown: 0,
  sighted: 1,
  observed: 2,
  inspected: 3,
  exploited: 4,
};

function distance(a: WorldPoint, b: WorldPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

class DiscoveryMap {
  private readonly byKey = new Map<string, DiscoveryRecord>();
  changed = false;

  constructor(records: readonly DiscoveryRecord[]) {
    for (const record of records) this.byKey.set(`${record.entityId}:${record.facet}`, record);
  }

  /** Sube el estado de conocimiento si es más alto que el actual (monótono salvo excepción documentada). Devuelve el estado anterior si hubo cambio, o null si no. */
  upgrade(entityId: string, facet: DiscoveryRecord["facet"], nextState: KnowledgeState): KnowledgeState | null {
    const key = `${entityId}:${facet}`;
    const existing = this.byKey.get(key);
    const currentRank = existing ? KNOWLEDGE_RANK[existing.state] : 0;
    if (KNOWLEDGE_RANK[nextState] <= currentRank) return null;
    this.byKey.set(key, { entityId, facet, state: nextState });
    this.changed = true;
    return existing?.state ?? "unknown";
  }

  toArray(): DiscoveryRecord[] {
    return [...this.byKey.values()];
  }
}

export interface DiscoveryUpdateResult {
  readonly discoveries: readonly DiscoveryRecord[];
  readonly changed: boolean;
  readonly events: readonly DomainEventV2[];
  readonly sequences: SimulationStateV2["sequences"];
}

/**
 * Recalcula descubrimientos a partir de la posición/ubicación real de las
 * seis personas. El conocimiento pertenece a la comunidad (cualquier
 * persona que observe algo lo descubre para todas, igual que la niebla).
 * Nunca depende de la cámara: solo de `people[].position`/`location`.
 */
export function updateDiscoveryV2(
  state: SimulationStateV2,
  nav: NavigationIndexV2,
  simSeconds: number,
): DiscoveryUpdateResult {
  const map = new DiscoveryMap(state.discoveries);
  const world = state.world;
  const events: DomainEventV2[] = [];
  let sequences = state.sequences;

  function emit(kind: "place" | "building" | "opening" | "room", entityId: string, facet: DiscoveryRecord["facet"], nextState: KnowledgeState) {
    const previous = map.upgrade(entityId, facet, nextState);
    if (previous === null) return;
    const { eventId, sequences: nextSequences } = nextEventId(sequences);
    sequences = nextSequences;
    events.push({
      type: "discovery_upgraded",
      eventId,
      simSeconds,
      causedByCommandId: null,
      entityKind: kind,
      entityId,
      facet,
      state: nextState,
    });
  }

  const outdoorPositions: WorldPoint[] = [];
  for (const personId of state.peopleOrder) {
    const person = state.people[personId];
    if (!person) continue;
    if (person.location.kind === "world_point") {
      outdoorPositions.push(person.location.point);
    } else if (person.location.kind === "room") {
      revealCurrentRoom(world, person.location.roomId, emit);
    }
  }

  for (const observer of outdoorPositions) {
    for (const place of Object.values(world.places)) {
      const dist = distance(observer, place.position);
      if (dist <= DISCOVERY_SIGHT_RADIUS_METERS) emit("place", place.id, "exterior", "sighted");
      if (dist <= DISCOVERY_OBSERVE_RADIUS_METERS) {
        emit("place", place.id, "exterior", "observed");
        if (place.buildingId) emit("building", place.buildingId, "structure", "observed");
      }
    }
    for (const opening of Object.values(world.openings)) {
      if (!opening.connectsToExterior) continue;
      if (distance(observer, opening.position) <= DISCOVERY_ACCESS_RADIUS_METERS) {
        emit("opening", opening.id, "accesses", "observed");
      }
    }
  }

  return { discoveries: map.toArray(), changed: map.changed, events, sequences };
}

function revealCurrentRoom(
  world: SemanticWorldV2,
  roomId: string,
  emit: (kind: "place" | "building" | "opening" | "room", entityId: string, facet: DiscoveryRecord["facet"], nextState: KnowledgeState) => void,
): void {
  const room = world.rooms[roomId];
  if (!room) return;
  emit("room", roomId, "rooms", "observed");
  for (const opening of Object.values(world.openings)) {
    if (opening.connectsRoomId === roomId || opening.connectsOtherRoomId === roomId) {
      emit("opening", opening.id, "accesses", "observed");
    }
  }
}
