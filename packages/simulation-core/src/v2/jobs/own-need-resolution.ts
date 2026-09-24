import type { JobTarget, NeedDimension, ResourceLot, SimulationStateV2 } from "@z-world/contracts";
import { valuesById } from "../ordered.js";
import { resolveHolderPersonId } from "../objects/storage.js";
import { resolveRoomId } from "./location-utils.js";

/** Estados en los que otro trabajo está a punto de usar (o usando) un lote; uno interrumpido o bloqueado no lo retiene. */
const CONTENDING_JOB_STATES: ReadonlySet<string> = new Set(["proposed", "available", "in_progress"]);

/**
 * Resuelve un blanco concreto y conocido para la autoprotección mínima por
 * necesidad crítica (WEB-002 §7.6 del prompt de subhitos: "genera una
 * intención/trabajo sistémico solo si conoce una solución accesible").
 * Nunca materializa recursos: si no hay candidato conocido, devuelve
 * `null` y el llamador debe explicar el bloqueo, no inventar una solución
 * (§7.6).
 */
export function resolveOwnNeedTarget(
  state: SimulationStateV2,
  personId: string,
  dimension: NeedDimension,
  /** Desde S9 los accesos cambian (tapiar, bloquear): solo cuenta un lote al que la persona tiene ruta conocida. */
  isReachable: (lot: ResourceLot) => boolean = () => true,
): JobTarget | null {
  const person = state.people[personId];
  if (!person) return null;

  if (dimension === "hydration" || dimension === "nutrition") {
    const families: readonly ResourceLot["family"][] = dimension === "hydration" ? ["water"] : ["fresh_food", "preserved_food"];
    // Un lote que ya es blanco de otro trabajo en marcha (aunque todavía no lo haya reservado) no se disputa: si no, todas las
    // personas eligen en el mismo tick el mismo lote y todas menos una chocan con la reserva.
    const targetedByLiveJob = new Set(
      valuesById(state.jobs)
        .filter((j) => j.target.kind === "resource_lot" && CONTENDING_JOB_STATES.has(j.state) && !j.assignments.some((a) => a.personId === personId))
        .map((j) => (j.target as { resourceLotId: string }).resourceLotId),
    );
    const candidates = valuesById(state.resourceLots).filter(
      (lot) => families.includes(lot.family) && lot.quantity > 0 && !lot.reservedByJobId && !targetedByLiveJob.has(lot.id) && isKnownToPerson(state, personId, lot.id),
    );
    if (candidates.length === 0) return null;
    // Primero lo que la persona lleva consigo (pertenencias, a cualquier profundidad: la botella dentro de su mochila); luego el
    // resto conocido, en orden estable por ID.
    const own = candidates.filter((lot) => resolveHolderPersonId(state, lot.location) === personId);
    const best = own[0] ?? candidates.find((lot) => isReachable(lot));
    return best ? { kind: "resource_lot", resourceLotId: best.id } : null;
  }

  // Descanso: el suelo es siempre una alternativa conocida y accesible allí
  // donde la persona ya se encuentra (§14.5/§7.5 del prompt de subhitos).
  if (person.location.kind === "room") {
    const currentRoomId = person.location.roomId;
    const restFurniture = valuesById(state.furniture).find((f) => f.roomId === currentRoomId && isRestKind(f.kind));
    return restFurniture ? { kind: "furniture", furnitureId: restFurniture.id } : { kind: "room", roomId: currentRoomId };
  }
  return { kind: "area", polygon: [person.public.position] };
}

function isRestKind(kind: string): boolean {
  return /bed|bedroll|mattress|cot|sofa/i.test(kind);
}

/**
 * Un lote se considera conocido por la comunidad si la persona lo lleva
 * consigo a cualquier profundidad (pertenencia, §14.7: "cubrir una necesidad
 * con pertenencias iniciales también debe funcionar"; desde S7 el agua va en
 * una botella dentro de la mochila) o si la estancia que lo contiene, aunque
 * sea dentro de contenedores anidados, ya tiene su contenido registrado
 * (`DiscoveryRecord` facet `content`).
 */
function isKnownToPerson(state: SimulationStateV2, personId: string, lotId: string): boolean {
  const lot = state.resourceLots[lotId];
  if (!lot) return false;
  const holder = resolveHolderPersonId(state, lot.location);
  if (holder === personId) return true;
  // Lo que lleva otra persona no es una solución accesible para esta.
  if (holder !== null) return false;
  const roomId = resolveRoomId(state, lot.location);
  if (!roomId) return false;
  return state.discoveries.some((d) => d.entityId === roomId && d.facet === "content" && d.state !== "unknown");
}
