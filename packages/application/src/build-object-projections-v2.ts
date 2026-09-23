import type {
  ContextualActionOptionProjection,
  ContextualActionTargetProjection,
  EntityLocation,
  InventoryEntryProjection,
  JobTarget,
  PossessionItem,
  ResourceLot,
  SimulationStateV2,
  StorageItemRef,
  TransportMeans,
  WorldObject,
} from "@z-world/contracts";
import { furnitureLocation } from "@z-world/contracts";
import { TRANSPORT_MEANS_VARIANT_BY_METHOD } from "@z-world/catalogs";
import {
  containerUsedUnits,
  freshnessBandFor,
  isContainerUsable,
  isLotSpoiled,
  locationWorldPoint,
  resolveHolderPersonId,
  resolveRoomId,
  resolveTransformationProfileId,
  spoilsAtSimSeconds,
  storageBlockReason,
} from "@z-world/simulation-core";

/**
 * Proyecciones de objetos, contenedores e inventario localizado de S7
 * (WEB-002 §6.3/§10.2/§10.3 del prompt S7-S9). Regla de conocimiento
 * única y conservadora:
 *
 * - lo que lleva una persona (directamente o en su mochila) es conocido;
 * - lo que está en una estancia (suelto, en un mueble o en un contenedor)
 *   solo se conoce si esa estancia tiene su contenido registrado
 *   (`content` ≥ `inspected`, lo revela `register`);
 * - lo que está en el exterior se conoce si su punto ya no está oculto por
 *   la niebla (alguien lo ha tenido a la vista).
 *
 * Nunca se filtra contenido de estancias sin registrar, componentes
 * internos, perfiles de reparación sin reconocer ni el estado funcional de
 * una instalación que nadie ha probado.
 */

const KNOWLEDGE_RANK: Readonly<Record<string, number>> = { unknown: 0, sighted: 1, observed: 2, inspected: 3, exploited: 4 };

type KnownLocation =
  | { readonly kind: "carried"; readonly holderPersonId: string }
  | { readonly kind: "container" | "room"; readonly roomId: string }
  | { readonly kind: "exterior" };

export interface ObjectKnowledge {
  readonly knownContentRoomIds: ReadonlySet<string>;
  known(location: EntityLocation): KnownLocation | null;
}

function fogHiddenAt(state: SimulationStateV2, x: number, y: number): boolean {
  const { fog } = state;
  const col = Math.floor((x - fog.originX) / fog.resolutionMeters);
  const row = Math.floor((y - fog.originY) / fog.resolutionMeters);
  if (col < 0 || row < 0 || col >= fog.columns || row >= fog.rows) return true;
  return (fog.cells[row * fog.columns + col] ?? 0) === 0;
}

export function buildObjectKnowledge(state: SimulationStateV2): ObjectKnowledge {
  const knownContentRoomIds = new Set<string>();
  for (const record of state.discoveries) {
    if (record.facet === "content" && (KNOWLEDGE_RANK[record.state] ?? 0) >= 3 && state.world.rooms[record.entityId]) knownContentRoomIds.add(record.entityId);
  }
  return {
    knownContentRoomIds,
    known(location: EntityLocation): KnownLocation | null {
      const holder = resolveHolderPersonId(state, location);
      if (holder) return { kind: "carried", holderPersonId: holder };
      const roomId = resolveRoomId(state, location);
      if (roomId) return knownContentRoomIds.has(roomId) ? { kind: location.kind === "room" ? "room" : "container", roomId } : null;
      const point = locationWorldPoint(state, location);
      if (!point) return null;
      return fogHiddenAt(state, point.x, point.y) ? null : { kind: "exterior" };
    },
  };
}

export function objectLabelKey(obj: Pick<WorldObject, "variant">): string {
  return obj.variant.startsWith("possession.") ? obj.variant : `object.${obj.variant}`;
}

function transportVariant(means: TransportMeans): string {
  return means.variant || TRANSPORT_MEANS_VARIANT_BY_METHOD[means.method];
}

export function containerLabelKey(state: SimulationStateV2, containerId: string): string {
  const container = state.containers[containerId];
  if (!container) return "container.label";
  if (container.hostFurnitureId) {
    const furniture = state.furniture[container.hostFurnitureId];
    if (furniture) return furniture.variant ? `object.${furniture.variant}` : furniture.kind;
  }
  if (container.hostWorldObjectId) {
    const obj = state.worldObjects[container.hostWorldObjectId];
    if (obj) return objectLabelKey(obj);
  }
  return "container.label";
}

function itemLabelKey(state: SimulationStateV2, ref: StorageItemRef): string {
  if (ref.kind === "world_object") {
    const obj = state.worldObjects[ref.id];
    return obj ? objectLabelKey(obj) : "container.label";
  }
  const lot = state.resourceLots[ref.id];
  return lot ? `resource.${lot.family}` : "container.label";
}

/** Una instalación técnica solo muestra su estado funcional tras probarla, repararla o verla averiarse (evidencia real). */
function installationStateKnown(obj: WorldObject): boolean {
  return obj.knownEvidenceIds.some((e) => e.startsWith("tested@") || e.startsWith("repaired@") || e.startsWith("broke_down@"));
}

function functionalStateKeyFor(obj: WorldObject): string {
  if (obj.installedAt && !installationStateKnown(obj)) return "functional_state.untested";
  return `functional_state.${obj.functionalState}`;
}

/** Opciones contextuales de objetos S7: recoger, almacenar, retirar, reparar, desmontar/desguazar, probar instalación y extraer agua. */
export function buildObjectActionOptions(state: SimulationStateV2, knowledge: ObjectKnowledge): ContextualActionOptionProjection[] {
  const options: ContextualActionOptionProjection[] = [];
  const push = (actionKey: string, labelKey: string, targets: ContextualActionTargetProjection[]) => {
    if (targets.length > 0) options.push({ actionKey, labelKey, targets });
  };

  // Recoger: objetos y lotes sueltos (en el suelo de una estancia registrada o en un exterior a la vista), nunca instalaciones fijas.
  const collectTargets: ContextualActionTargetProjection[] = [];
  for (const obj of Object.values(state.worldObjects)) {
    if (obj.installedAt || obj.portability === "fixed") continue;
    if (obj.location.kind !== "room" && obj.location.kind !== "world_point") continue;
    if (!knowledge.known(obj.location)) continue;
    collectTargets.push({ target: { kind: "world_object", worldObjectId: obj.id }, labelKey: objectLabelKey(obj), blockedReasonKey: obj.ownerOrReservedByJobId ? "block.object_reserved" : null });
  }
  for (const lot of Object.values(state.resourceLots)) {
    if (lot.location.kind !== "room" && lot.location.kind !== "world_point") continue;
    if (!knowledge.known(lot.location)) continue;
    collectTargets.push({ target: { kind: "resource_lot", resourceLotId: lot.id }, labelKey: `resource.${lot.family}`, blockedReasonKey: lot.reservedByJobId ? "block.resource_reserved" : null });
  }
  push("collect", "action.collect.label", collectTargets);

  // Contenedores reales conocidos y utilizables.
  const knownContainers = Object.values(state.containers)
    .map((container) => ({ container, where: knowledge.known(container.location) }))
    .filter((c): c is { container: (typeof c)["container"]; where: KnownLocation } => c.where !== null)
    .sort((a, b) => (a.container.id < b.container.id ? -1 : 1));

  // Retirar: cualquier contenido de un contenedor conocido.
  const retrieveTargets: ContextualActionTargetProjection[] = [];
  for (const { container, where } of knownContainers) {
    for (const contentId of container.contentIds) {
      const ref: StorageItemRef | null = state.worldObjects[contentId] ? { kind: "world_object", id: contentId } : state.resourceLots[contentId] ? { kind: "resource_lot", id: contentId } : null;
      if (!ref) continue;
      const reserved = ref.kind === "world_object" ? state.worldObjects[ref.id]!.ownerOrReservedByJobId : state.resourceLots[ref.id]!.reservedByJobId;
      retrieveTargets.push({
        target: { kind: "container", containerId: container.id },
        labelKey: containerLabelKey(state, container.id),
        blockedReasonKey: reserved ? "block.target_reserved" : null,
        storageItem: { ...ref, labelKey: itemLabelKey(state, ref), holderPersonId: where.kind === "carried" ? where.holderPersonId : null },
      });
    }
  }
  push("retrieve_from_storage", "action.retrieve_from_storage.label", retrieveTargets);

  // Almacenar: lo que lleva alguien (fuera de un contenedor) o lo que está suelto en la misma estancia que el contenedor.
  const storeTargets: ContextualActionTargetProjection[] = [];
  const candidates: { ref: StorageItemRef; holder: string | null; roomId: string | null }[] = [];
  for (const obj of Object.values(state.worldObjects)) {
    if (obj.installedAt || obj.portability === "fixed") continue;
    if (obj.location.kind === "carried_by_person") candidates.push({ ref: { kind: "world_object", id: obj.id }, holder: obj.location.personId, roomId: null });
    else if (obj.location.kind === "room" && knowledge.knownContentRoomIds.has(obj.location.roomId)) candidates.push({ ref: { kind: "world_object", id: obj.id }, holder: null, roomId: obj.location.roomId });
  }
  for (const lot of Object.values(state.resourceLots)) {
    if (lot.location.kind === "carried_by_person") candidates.push({ ref: { kind: "resource_lot", id: lot.id }, holder: lot.location.personId, roomId: null });
    else if (lot.location.kind === "room" && knowledge.knownContentRoomIds.has(lot.location.roomId)) candidates.push({ ref: { kind: "resource_lot", id: lot.id }, holder: null, roomId: lot.location.roomId });
  }
  for (const { container, where } of knownContainers) {
    if (!isContainerUsable(state, container)) continue;
    for (const candidate of candidates) {
      // Una mochila solo recibe lo que lleva su propia portadora; un contenedor de estancia, lo que lleve cualquiera o lo suelto en esa estancia.
      if (where.kind === "carried" && candidate.holder !== where.holderPersonId) continue;
      if (where.kind !== "carried" && candidate.holder === null && (where.kind === "exterior" || candidate.roomId !== where.roomId)) continue;
      if (candidate.ref.kind === "world_object" && container.hostWorldObjectId === candidate.ref.id) continue;
      const reason = storageBlockReason(state, container, candidate.ref);
      if (reason === "block.container_incompatible" || reason === "block.item_already_stored") continue;
      storeTargets.push({
        target: { kind: "container", containerId: container.id },
        labelKey: containerLabelKey(state, container.id),
        blockedReasonKey: reason,
        storageItem: { ...candidate.ref, labelKey: itemLabelKey(state, candidate.ref), holderPersonId: candidate.holder },
      });
    }
  }
  push("store", "action.store.label", storeTargets);

  // Reparar / desmontar: objetos, muebles y medios conocidos con perfil real.
  const transformTargets = (actionKey: "repair" | "disassemble_selective"): ContextualActionTargetProjection[] => {
    const targets: ContextualActionTargetProjection[] = [];
    for (const obj of Object.values(state.worldObjects)) {
      const target: JobTarget = { kind: "world_object", worldObjectId: obj.id };
      if (!resolveTransformationProfileId(state, target, actionKey)) continue;
      if (obj.functionalState === "parts_only" || !knowledge.known(obj.location)) continue;
      targets.push({ target, labelKey: objectLabelKey(obj), blockedReasonKey: obj.ownerOrReservedByJobId ? "block.object_reserved" : null });
    }
    for (const furniture of Object.values(state.furniture)) {
      const target: JobTarget = { kind: "furniture", furnitureId: furniture.id };
      if (!resolveTransformationProfileId(state, target, actionKey)) continue;
      const location = furnitureLocation(furniture);
      if (furniture.functionalState === "parts_only" || location.kind !== "room" || !knowledge.knownContentRoomIds.has(location.roomId)) continue;
      targets.push({ target, labelKey: furniture.variant ? `object.${furniture.variant}` : furniture.kind, blockedReasonKey: null });
    }
    for (const means of Object.values(state.transportMeans)) {
      const target: JobTarget = { kind: "transport_means", transportMeansId: means.id };
      if (!resolveTransformationProfileId(state, target, actionKey)) continue;
      if (means.functionalState === "parts_only" || !knowledge.known(means.location)) continue;
      targets.push({ target, labelKey: `object.${transportVariant(means)}`, blockedReasonKey: null });
    }
    return targets;
  };
  push("repair", "action.repair.label", transformTargets("repair"));
  const disassemblyTargets = transformTargets("disassemble_selective");
  push("disassemble_selective", "action.disassemble_selective.label", disassemblyTargets);
  push("disassemble_destructive", "action.disassemble_destructive.label", disassemblyTargets);

  // Instalaciones técnicas conocidas (bomba): probar siempre; extraer agua muestra el bloqueo solo cuando el estado ya se ha reconocido.
  const installations = Object.values(state.worldObjects).filter((o) => o.installedAt && o.functionalState !== "parts_only" && knowledge.known(o.location));
  push(
    "test_installation",
    "action.test_installation.label",
    installations.map((o) => ({ target: { kind: "world_object", worldObjectId: o.id } as JobTarget, labelKey: objectLabelKey(o), blockedReasonKey: o.ownerOrReservedByJobId ? "block.object_reserved" : null })),
  );
  push(
    "draw_water",
    "action.draw_water.label",
    installations.map((o) => ({
      target: { kind: "world_object", worldObjectId: o.id } as JobTarget,
      labelKey: objectLabelKey(o),
      blockedReasonKey: o.ownerOrReservedByJobId ? "block.object_reserved" : installationStateKnown(o) && !(o.functions.includes("water_pumping") && (o.functionalState === "functional" || o.functionalState === "degraded")) ? "block.installation_not_functional" : null,
    })),
  );

  return options;
}

/** Lotes consumibles conocidos para beber/comer: los que lleva alguien, los de estancias registradas y los de un exterior a la vista (agua recién bombeada en el cubo). */
export function knownConsumableLots(state: SimulationStateV2, knowledge: ObjectKnowledge, families: readonly ResourceLot["family"][]): ContextualActionTargetProjection[] {
  return Object.values(state.resourceLots)
    .filter((lot) => families.includes(lot.family) && lot.quantity > 0 && knowledge.known(lot.location) !== null)
    .sort((a, b) => (a.id < b.id ? -1 : 1))
    .map((lot) => ({
      target: { kind: "resource_lot", resourceLotId: lot.id } as JobTarget,
      labelKey: `resource.${lot.family}`,
      blockedReasonKey: lot.reservedByJobId ? "block.resource_reserved" : isLotSpoiled(lot) ? "block.food_spoiled" : null,
    }));
}

/** Inventario localizado conocido (nunca bolsa global): cada entrada enlaza a su ubicación real. */
export function buildInventoryProjection(state: SimulationStateV2, knowledge: ObjectKnowledge): InventoryEntryProjection[] {
  const entries: InventoryEntryProjection[] = [];
  const locationFields = (location: EntityLocation, where: KnownLocation) => {
    const containerId = location.kind === "container" ? location.containerId : null;
    const hostId = location.kind === "on_object" ? location.objectId : null;
    const containerLabel = containerId ? containerLabelKey(state, containerId) : hostId && state.worldObjects[hostId] ? objectLabelKey(state.worldObjects[hostId]!) : null;
    return {
      locationKind: where.kind,
      holderPersonId: where.kind === "carried" ? where.holderPersonId : null,
      containerLabelKey: containerLabel,
      roomId: where.kind === "room" || where.kind === "container" ? where.roomId : null,
    } as const;
  };
  const capacityOf = (containerId: string | null) => {
    const container = containerId ? state.containers[containerId] : undefined;
    return container ? { used: containerUsedUnits(state, container), total: container.capacityUnits } : null;
  };

  for (const obj of Object.values(state.worldObjects)) {
    const where = knowledge.known(obj.location);
    if (!where) continue;
    entries.push({
      id: obj.id,
      entityKind: "world_object",
      labelKey: objectLabelKey(obj),
      ...locationFields(obj.location, where),
      quantity: null,
      unit: null,
      functionalStateKey: functionalStateKeyFor(obj),
      freshness: null,
      spoilsAtSimSeconds: null,
      capacity: capacityOf(obj.containerId),
    });
  }
  for (const lot of Object.values(state.resourceLots)) {
    const where = knowledge.known(lot.location);
    if (!where) continue;
    entries.push({
      id: lot.id,
      entityKind: "resource_lot",
      labelKey: `resource.${lot.family}`,
      ...locationFields(lot.location, where),
      quantity: lot.quantity,
      unit: lot.unit,
      functionalStateKey: null,
      freshness: freshnessBandFor(lot),
      spoilsAtSimSeconds: spoilsAtSimSeconds(lot),
      capacity: null,
    });
  }
  for (const furniture of Object.values(state.furniture)) {
    if (!furniture.family) continue;
    const location = furnitureLocation(furniture);
    const where = knowledge.known(location);
    if (!where) continue;
    entries.push({
      id: furniture.id,
      entityKind: "furniture",
      labelKey: furniture.variant ? `object.${furniture.variant}` : furniture.kind,
      ...locationFields(location, where),
      quantity: null,
      unit: null,
      functionalStateKey: `functional_state.${furniture.functionalState}`,
      freshness: null,
      spoilsAtSimSeconds: null,
      capacity: capacityOf(furniture.containerId),
    });
  }
  for (const means of Object.values(state.transportMeans)) {
    const where = knowledge.known(means.location);
    if (!where) continue;
    entries.push({
      id: means.id,
      entityKind: "transport_means",
      labelKey: `object.${transportVariant(means)}`,
      ...locationFields(means.location, where),
      quantity: null,
      unit: null,
      functionalStateKey: `functional_state.${means.functionalState}`,
      freshness: null,
      spoilsAtSimSeconds: null,
      capacity: null,
    });
  }
  return entries.sort((a, b) => (a.holderPersonId ?? "~").localeCompare(b.holderPersonId ?? "~") || a.labelKey.localeCompare(b.labelKey) || a.id.localeCompare(b.id));
}

/**
 * Pertenencias de la ficha derivadas del inventario real (S7 §6.3: nunca
 * dos existencias divergentes). Si una partida anterior no tuviera objeto
 * real para alguna pertenencia de llegada, se conserva el resumen legado.
 */
export function derivePossessions(state: SimulationStateV2, personId: string): readonly PossessionItem[] {
  const person = state.people[personId];
  if (!person) return [];
  const held = Object.values(state.worldObjects)
    .filter((o) => resolveHolderPersonId(state, o.location) === personId)
    .sort((a, b) => (a.id < b.id ? -1 : 1))
    .map((o) => ({ id: o.id, labelKey: objectLabelKey(o), isMeleeOrImprovisedWeapon: o.family === "improvised_tool_or_weapon" && (o.functions.includes("melee") || o.variant.startsWith("possession.")) }));
  if (held.length === 0) return person.public.possessions;
  return held;
}
