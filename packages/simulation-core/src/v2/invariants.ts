import type { EntityLocation, SimulationStateV2 } from "@z-world/contracts";
import { isFabricTerminal } from "@z-world/contracts";
import { containerUsedUnits } from "./objects/storage.js";
import { resolveRoomId, resolveTargetLocation } from "./jobs/location-utils.js";
import { buildingIdOfRoomInWorld, isOpeningPassable } from "./room-graph.js";
import { buildingIdOfTarget } from "./exploitation/targets.js";

/**
 * Validador de invariantes relacionales de `SimulationStateV2` (§6.2,
 * §6.4 de WEB-002): relaciones que un esquema Zod estructural no puede
 * garantizar por sí solo. Se ejecuta después de la validación Zod, tanto
 * al migrar como al cargar un snapshot V2.
 */
export interface InvariantViolation {
  readonly code: string;
  readonly message: string;
}

export interface InvariantReport {
  readonly ok: boolean;
  readonly violations: readonly InvariantViolation[];
}

export function validateSimulationStateV2Invariants(state: SimulationStateV2): InvariantReport {
  const violations: InvariantViolation[] = [];

  checkQuantitiesNonNegative(state, violations);
  checkContainerCyclesAndOrphans(state, violations);
  checkReservationExclusivity(state, violations);
  checkReservationsReferenceRealJobs(state, violations);
  checkJobReservationsBidirectional(state, violations);
  checkContainerContentConsistency(state, violations);
  checkPartsOnlyHasNoActiveFunctions(state, violations);
  checkBundleContentNotAlsoContained(state, violations);
  checkClosureObstructionExclusivity(state, violations);
  checkGlobalIdUniqueness(state, violations);
  checkEntityLocationsResolve(state, violations);
  checkSpatialHierarchy(state, violations);
  checkPersonPositionWithinBounds(state, violations);
  checkPositionLocationCoherence(state, violations);
  checkActiveMovementOrders(state, violations);
  checkExteriorOpeningsConnectToRoom(state, violations);
  checkDiscoveryRecordsValid(state, violations);
  checkFogGridShape(state, violations);
  checkS9ClosuresAndOpenings(state, violations);
  checkS9BuildingLayers(state, violations);
  checkS9TerminalBuildings(state, violations);
  checkS9JobsReferenceLiveTargets(state, violations);

  return { ok: violations.length === 0, violations };
}

/** Toda posición pública de persona cae dentro de los límites del mundo (S3 §8). */
function checkPersonPositionWithinBounds(state: SimulationStateV2, violations: InvariantViolation[]): void {
  const { bounds } = state.world;
  for (const person of Object.values(state.people)) {
    const { x, y } = person.public.position;
    if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) {
      violations.push({ code: "person_position_outside_bounds", message: `Persona ${person.public.id} tiene una posición fuera de los límites del mundo.` });
    }
  }
}

/**
 * `location: EntityLocation` es la única autoridad de posición (DEC-0017);
 * `public.position` es una proyección derivada que debe permanecer
 * sincronizada en todo momento. Cuando `location.kind === "world_point"`,
 * ambos deben coincidir exactamente: cualquier divergencia indica que se
 * mutó una de las dos representaciones sin la otra.
 */
function checkPositionLocationCoherence(state: SimulationStateV2, violations: InvariantViolation[]): void {
  for (const person of Object.values(state.people)) {
    if (person.location.kind !== "world_point") continue;
    const { point } = person.location;
    if (point.x !== person.public.position.x || point.y !== person.public.position.y) {
      violations.push({
        code: "position_location_divergence",
        message: `Persona ${person.public.id} tiene \`location.point\` y \`public.position\` divergentes.`,
      });
    }
  }
}

/** Toda orden de movimiento activa es internamente coherente: ruta dentro de límites, destino coincide con el final de la ruta, progreso no supera la distancia total (S3 §8). */
function checkActiveMovementOrders(state: SimulationStateV2, violations: InvariantViolation[]): void {
  const { bounds } = state.world;
  const EPSILON = 0.5;
  for (const person of Object.values(state.people)) {
    const order = person.public.activeMovementOrder;
    if (!order) continue;
    if (order.travelledDistanceMeters > order.totalDistanceMeters + EPSILON) {
      violations.push({ code: "movement_progress_exceeds_total", message: `Orden de ${person.public.id} avanzó más allá de su distancia total.` });
    }
    if (order.path.length === 0) {
      violations.push({ code: "movement_path_empty", message: `Orden de ${person.public.id} no tiene ninguna ruta.` });
      continue;
    }
    const last = order.path[order.path.length - 1]!;
    if (Math.abs(last.x - order.destination.x) > EPSILON || Math.abs(last.y - order.destination.y) > EPSILON) {
      violations.push({ code: "movement_destination_mismatch", message: `El último punto de la ruta de ${person.public.id} no coincide con el destino de la orden.` });
    }
    for (const point of order.path) {
      if (point.x < bounds.minX - EPSILON || point.x > bounds.maxX + EPSILON || point.y < bounds.minY - EPSILON || point.y > bounds.maxY + EPSILON) {
        violations.push({ code: "movement_path_point_outside_bounds", message: `La ruta de ${person.public.id} tiene un punto fuera de los límites del mundo.` });
        break;
      }
    }
  }
}

/** Una abertura que declara conectar con el exterior debe además conectar una estancia real: si no, no representa una entrada válida (S3 §5.4/§8). */
function checkExteriorOpeningsConnectToRoom(state: SimulationStateV2, violations: InvariantViolation[]): void {
  for (const opening of Object.values(state.world.openings)) {
    if (opening.connectsToExterior && !opening.connectsRoomId) {
      violations.push({ code: "exterior_opening_without_room", message: `Abertura ${opening.id} conecta con el exterior pero no con ninguna estancia interior.` });
    }
  }
}

/** Cada `DiscoveryRecord` referencia una entidad real de la faceta correspondiente y no hay pares (entidad, faceta) duplicados (S3 §5.6/§8: sin entidades inexistentes, conocimiento monótono representado como registro único). */
function checkDiscoveryRecordsValid(state: SimulationStateV2, violations: InvariantViolation[]): void {
  const seen = new Set<string>();
  for (const record of state.discoveries) {
    const key = `${record.entityId}:${record.facet}`;
    if (seen.has(key)) {
      violations.push({ code: "duplicate_discovery_record", message: `Registro de descubrimiento duplicado para ${key}.` });
    }
    seen.add(key);

    // Un descubrimiento de faceta `exterior` puede referenciar tanto un
    // `Place` (edificio/parcela) como un `NaturalOrTechnicalNode` (p. ej. un
    // hito o fuente de agua): ambos son entidades exteriores observables
    // por silueta/proximidad (§7.2 de WEB-002, discretos del generador S2).
    const existsAsExteriorEntity = Boolean(
      state.world.places[record.entityId] ?? state.world.buildings[record.entityId] ?? state.world.nodes[record.entityId],
    );
    if (record.facet === "rooms" && !state.world.rooms[record.entityId]) {
      violations.push({ code: "orphan_discovery_room", message: `Descubrimiento referencia una estancia inexistente: ${record.entityId}.` });
    }
    if (record.facet === "accesses" && !state.world.openings[record.entityId]) {
      violations.push({ code: "orphan_discovery_opening", message: `Descubrimiento referencia una abertura inexistente: ${record.entityId}.` });
    }
    if ((record.facet === "exterior" || record.facet === "structure") && !existsAsExteriorEntity) {
      violations.push({ code: "orphan_discovery_place_or_building", message: `Descubrimiento referencia un lugar/edificio/nodo inexistente: ${record.entityId}.` });
    }
  }
}

/** La niebla cubre exactamente el rectángulo de límites del mundo a su propia resolución, sin celdas de más o de menos (S3 §8). */
function checkFogGridShape(state: SimulationStateV2, violations: InvariantViolation[]): void {
  const { fog, world } = state;
  if (fog.cells.length !== fog.columns * fog.rows) {
    violations.push({ code: "fog_cell_count_mismatch", message: "La niebla tiene un número de celdas distinto de columnas×filas." });
    return;
  }
  const expectedColumns = Math.max(1, Math.ceil((world.bounds.maxX - world.bounds.minX) / fog.resolutionMeters));
  const expectedRows = Math.max(1, Math.ceil((world.bounds.maxY - world.bounds.minY) / fog.resolutionMeters));
  if (fog.columns !== expectedColumns || fog.rows !== expectedRows) {
    violations.push({ code: "fog_dimensions_mismatch", message: "Las dimensiones de la niebla no corresponden a los límites del mundo a su resolución." });
  }
}

function checkQuantitiesNonNegative(state: SimulationStateV2, violations: InvariantViolation[]): void {
  for (const lot of Object.values(state.resourceLots)) {
    if (lot.quantity < 0) {
      violations.push({ code: "negative_quantity", message: `Lote ${lot.id} tiene cantidad negativa.` });
    }
  }
  for (const bundle of Object.values(state.loadBundles)) {
    if (bundle.totalWeightKg < 0) {
      violations.push({ code: "negative_weight", message: `Carga ${bundle.id} tiene peso negativo.` });
    }
  }
}

function checkContainerCyclesAndOrphans(state: SimulationStateV2, violations: InvariantViolation[]): void {
  for (const container of Object.values(state.containers)) {
    if (container.location.kind !== "container") continue;
    const visited = new Set<string>([container.id]);
    let cursor: string | undefined = container.location.containerId;
    while (cursor) {
      if (visited.has(cursor)) {
        violations.push({ code: "circular_containment", message: `Contención circular detectada en ${container.id}.` });
        break;
      }
      visited.add(cursor);
      const nextContainer: (typeof state.containers)[string] | undefined = state.containers[cursor];
      if (!nextContainer) {
        violations.push({ code: "orphan_container_reference", message: `Contenedor ${container.id} referencia un contenedor inexistente: ${cursor}.` });
        break;
      }
      cursor = nextContainer.location.kind === "container" ? nextContainer.location.containerId : undefined;
    }
  }

  for (const container of Object.values(state.containers)) {
    for (const contentId of container.contentIds) {
      const asObject = state.worldObjects[contentId];
      const asLot = state.resourceLots[contentId];
      if (!asObject && !asLot) {
        violations.push({
          code: "orphan_container_content",
          message: `Contenedor ${container.id} referencia contenido inexistente: ${contentId}.`,
        });
      }
    }
  }
}

function checkReservationExclusivity(state: SimulationStateV2, violations: InvariantViolation[]): void {
  const reservedByTarget = new Map<string, string[]>();
  for (const reservation of Object.values(state.reservations)) {
    const key = `${reservation.targetKind}:${reservation.targetId}`;
    const jobsForTarget = reservedByTarget.get(key) ?? [];
    jobsForTarget.push(reservation.jobId);
    reservedByTarget.set(key, jobsForTarget);
  }
  for (const [key, jobIds] of reservedByTarget) {
    const uniqueJobs = new Set(jobIds);
    // S7: objeto, mueble, contenedor, medio y lote son reservas exclusivas
    // (un único trabajo a la vez). Persona y estancia admiten varios.
    const exclusive = EXCLUSIVE_RESERVATION_PREFIXES.some((prefix) => key.startsWith(prefix));
    if (uniqueJobs.size > 1 && exclusive) {
      violations.push({
        code: "double_exclusive_reservation",
        message: `${key} está reservado simultáneamente por varios trabajos: ${[...uniqueJobs].join(", ")}.`,
      });
    }
  }
}

// S8: una persona porteadora también es exclusiva (nunca comprometida por dos traslados a la vez).
const EXCLUSIVE_RESERVATION_PREFIXES = ["world_object:", "transport_means:", "container:", "furniture:", "resource_lot:", "person:"] as const;

/** `Job.reservationIds` lista exactamente reservas vigentes de ese mismo trabajo (reservas bidireccionales, §12 del prompt S7-S9). */
function checkJobReservationsBidirectional(state: SimulationStateV2, violations: InvariantViolation[]): void {
  for (const job of Object.values(state.jobs)) {
    for (const reservationId of job.reservationIds) {
      const reservation = state.reservations[reservationId];
      if (!reservation || reservation.jobId !== job.id) {
        violations.push({ code: "job_reservation_not_bidirectional", message: `El trabajo ${job.id} lista la reserva ${reservationId}, que no existe o pertenece a otro trabajo.` });
      }
    }
  }
}

/**
 * Jerarquía `Container → Content` coherente en ambos sentidos y dentro de
 * capacidad (S7 §6.4/§12): todo contenido listado está realmente ubicado
 * en ese contenedor, todo objeto/lote ubicado en un contenedor figura en su
 * lista, y nunca hay sobrecapacidad silenciosa.
 */
function checkContainerContentConsistency(state: SimulationStateV2, violations: InvariantViolation[]): void {
  for (const container of Object.values(state.containers)) {
    for (const contentId of container.contentIds) {
      const location = state.worldObjects[contentId]?.location ?? state.resourceLots[contentId]?.location;
      if (!location) continue; // ya lo informa `orphan_container_content`.
      if (location.kind !== "container" || location.containerId !== container.id) {
        violations.push({ code: "container_content_location_mismatch", message: `El contenedor ${container.id} lista ${contentId}, pero ese elemento está en otra ubicación.` });
      }
    }
    if (containerUsedUnits(state, container) > container.capacityUnits) {
      violations.push({ code: "container_over_capacity", message: `El contenedor ${container.id} supera su capacidad útil (${container.capacityUnits}).` });
    }
  }
  const check = (id: string, location: EntityLocation): void => {
    if (location.kind !== "container") return;
    const container = state.containers[location.containerId];
    if (container && !container.contentIds.includes(id)) {
      violations.push({ code: "contained_item_not_listed", message: `${id} está en el contenedor ${container.id}, que no lo lista como contenido.` });
    }
  };
  for (const obj of Object.values(state.worldObjects)) check(obj.id, obj.location);
  for (const lot of Object.values(state.resourceLots)) check(lot.id, lot.location);
}

/** Un objeto reducido a piezas no conserva funciones activas (S7 §12: "objeto destruido no conserva funciones incompatibles"; frigorífico desmontado no refrigera ni almacena; bomba desmontada no bombea). */
function checkPartsOnlyHasNoActiveFunctions(state: SimulationStateV2, violations: InvariantViolation[]): void {
  const entities: { id: string; functionalState: string; functions: readonly string[] }[] = [
    ...Object.values(state.worldObjects),
    ...Object.values(state.furniture),
    ...Object.values(state.transportMeans),
  ];
  for (const entity of entities) {
    if (entity.functionalState === "parts_only" && entity.functions.length > 0) {
      violations.push({ code: "parts_only_with_functions", message: `${entity.id} está reducido a piezas pero conserva funciones activas: ${entity.functions.join(", ")}.` });
    }
  }
}

/**
 * Una carga nunca aparece simultáneamente en un contenedor y en un bulto de
 * transporte (§12), salvo el recipiente personal que la materializa (S8,
 * método `personal_container`). S8 añade la coherencia completa carga ↔
 * contenido ↔ medio ↔ persona (§12 del prompt S7-S9: «persona/medio/carga
 * coherentes durante transporte»).
 */
function checkBundleContentNotAlsoContained(state: SimulationStateV2, violations: InvariantViolation[]): void {
  for (const bundle of Object.values(state.loadBundles)) {
    for (const id of [...bundle.contentObjectIds, ...bundle.contentResourceLotIds]) {
      const location = state.worldObjects[id]?.location ?? state.resourceLots[id]?.location;
      if (!location) {
        violations.push({ code: "bundle_content_missing", message: `La carga ${bundle.id} lista ${id}, que no existe.` });
        continue;
      }
      if (location.kind === "container" && location.containerId !== bundle.containerId) {
        violations.push({ code: "bundle_content_also_contained", message: `${id} figura en la carga ${bundle.id} y a la vez dentro del contenedor ${location.containerId}.` });
      } else if (location.kind !== "container" && (location.kind !== "in_load_bundle" || location.loadBundleId !== bundle.id)) {
        violations.push({ code: "bundle_content_location_mismatch", message: `La carga ${bundle.id} lista ${id}, pero ese elemento está en otra ubicación.` });
      }
    }
    for (const id of bundle.contentFurnitureIds) {
      const furniture = state.furniture[id];
      if (!furniture || furniture.movedToLocation?.kind !== "in_load_bundle" || furniture.movedToLocation.loadBundleId !== bundle.id) {
        violations.push({ code: "bundle_content_location_mismatch", message: `La carga ${bundle.id} lista el mueble ${id}, que no está en ella.` });
      }
    }
    if (bundle.transportMeansId) {
      const means = state.transportMeans[bundle.transportMeansId];
      if (bundle.location.kind === "mounted_on_transport" && (!means || means.currentLoadBundleId !== bundle.id)) {
        violations.push({ code: "bundle_means_mismatch", message: `La carga ${bundle.id} va montada en ${bundle.transportMeansId}, que no la registra.` });
      }
    }
    if (bundle.jobId && !state.jobs[bundle.jobId]) violations.push({ code: "bundle_orphan_job", message: `La carga ${bundle.id} referencia un trabajo inexistente: ${bundle.jobId}.` });
  }
  const listed = (bundleId: string, id: string): boolean => {
    const bundle = state.loadBundles[bundleId];
    return bundle !== undefined && (bundle.contentObjectIds.includes(id) || bundle.contentResourceLotIds.includes(id) || bundle.contentFurnitureIds.includes(id));
  };
  for (const item of [...Object.values(state.worldObjects), ...Object.values(state.resourceLots)]) {
    if (item.location.kind === "in_load_bundle" && !listed(item.location.loadBundleId, item.id)) {
      violations.push({ code: "bundled_item_not_listed", message: `${item.id} está en la carga ${item.location.loadBundleId}, que no lo lista.` });
    }
  }
  for (const means of Object.values(state.transportMeans)) {
    if (means.currentLoadBundleId && !state.loadBundles[means.currentLoadBundleId]) {
      violations.push({ code: "means_orphan_bundle", message: `El medio ${means.id} referencia una carga inexistente: ${means.currentLoadBundleId}.` });
    }
  }
  for (const person of Object.values(state.people)) {
    if (person.carriedLoadBundleId && !state.loadBundles[person.carriedLoadBundleId]) {
      violations.push({ code: "person_orphan_bundle", message: `La persona ${person.public.id} referencia una carga inexistente: ${person.carriedLoadBundleId}.` });
    }
  }
}

function checkReservationsReferenceRealJobs(state: SimulationStateV2, violations: InvariantViolation[]): void {
  for (const reservation of Object.values(state.reservations)) {
    if (!state.jobs[reservation.jobId]) {
      violations.push({
        code: "orphan_reservation",
        message: `Reserva ${reservation.id} referencia un trabajo inexistente: ${reservation.jobId}.`,
      });
    }
  }
}

/**
 * Unicidad global de ID (S2 de WEB-002 §6.4): ningún identificador
 * generado se reutiliza entre colecciones distintas, condición necesaria
 * para que una `EntityLocation` nunca sea ambigua sobre a qué entidad
 * apunta.
 */
function checkGlobalIdUniqueness(state: SimulationStateV2, violations: InvariantViolation[]): void {
  const seen = new Map<string, string>();
  const record = (id: string, collection: string): void => {
    const existing = seen.get(id);
    if (existing && existing !== collection) {
      violations.push({ code: "duplicate_global_id", message: `El ID ${id} aparece tanto en ${existing} como en ${collection}.` });
      return;
    }
    seen.set(id, collection);
  };

  for (const id of Object.keys(state.people)) record(id, "people");
  const worldCollections: readonly [string, Readonly<Record<string, { readonly id: string }>>][] = [
    ["world.terrainAreas", state.world.terrainAreas],
    ["world.linearFeatures", state.world.linearFeatures],
    ["world.nodes", state.world.nodes],
    ["world.parcels", state.world.parcels],
    ["world.places", state.world.places],
    ["world.buildings", state.world.buildings],
    ["world.floors", state.world.floors],
    ["world.rooms", state.world.rooms],
    ["world.openings", state.world.openings],
    ["world.installedClosures", state.world.installedClosures],
    ["world.obstructions", state.world.obstructions],
    ["world.anchors", state.world.anchors],
    ["world.barrierSegments", state.world.barrierSegments],
    ["world.perimeterNetworks", state.world.perimeterNetworks],
    ["world.occupantProfiles", state.world.occupantProfiles],
    ["world.businessProfiles", state.world.businessProfiles],
    ["world.placeHistories", state.world.placeHistories],
    ["world.lootPressureZones", state.world.lootPressureZones],
    ["world.lootingRoutes", state.world.lootingRoutes],
    ["world.buildingInstallations", state.world.buildingInstallations ?? {}],
    ["world.buildingFinishes", state.world.buildingFinishes ?? {}],
    ["workZones", state.workZones],
    ["designations", state.designations],
    ["jobs", state.jobs],
    ["episodes", state.episodes],
    ["reservations", state.reservations],
    ["furniture", state.furniture],
    ["containers", state.containers],
    ["worldObjects", state.worldObjects],
    ["resourceLots", state.resourceLots],
    ["transportMeans", state.transportMeans],
    ["loadBundles", state.loadBundles],
    ["transferPoints", state.transferPoints],
    ["cultivationPlots", state.cultivationPlots],
    ["cropCycles", state.cropCycles],
    ["terrainChanges", state.terrainChanges],
  ];
  for (const [name, collection] of worldCollections) {
    for (const id of Object.keys(collection)) record(id, name);
  }
}

/**
 * Toda `EntityLocation` (S2 §6.4) resuelve a una entidad real existente.
 * Cubre personas, objetos, lotes, medios de transporte, contenedores y
 * cargas: ninguna referencia de ubicación puede quedar huérfana.
 */
function checkEntityLocationsResolve(state: SimulationStateV2, violations: InvariantViolation[]): void {
  const check = (ownerLabel: string, location: EntityLocation): void => {
    switch (location.kind) {
      case "world_point":
        return;
      case "room":
        if (!state.world.rooms[location.roomId]) violations.push({ code: "orphan_location_room", message: `${ownerLabel} referencia una estancia inexistente: ${location.roomId}.` });
        return;
      case "zone":
        if (!state.workZones[location.zoneId]) violations.push({ code: "orphan_location_zone", message: `${ownerLabel} referencia una zona inexistente: ${location.zoneId}.` });
        return;
      case "container":
        if (!state.containers[location.containerId]) violations.push({ code: "orphan_location_container", message: `${ownerLabel} referencia un contenedor inexistente: ${location.containerId}.` });
        return;
      case "carried_by_person":
        if (!state.people[location.personId]) violations.push({ code: "orphan_location_person", message: `${ownerLabel} referencia una persona inexistente: ${location.personId}.` });
        return;
      case "mounted_on_transport":
        if (!state.transportMeans[location.transportId]) violations.push({ code: "orphan_location_transport", message: `${ownerLabel} referencia un medio de transporte inexistente: ${location.transportId}.` });
        return;
      case "installed_at_opening":
        if (!state.world.openings[location.openingId]) violations.push({ code: "orphan_location_opening", message: `${ownerLabel} referencia una abertura inexistente: ${location.openingId}.` });
        return;
      case "transfer_point":
        if (!state.transferPoints[location.transferPointId]) violations.push({ code: "orphan_location_transfer_point", message: `${ownerLabel} referencia un punto de transferencia inexistente: ${location.transferPointId}.` });
        return;
      case "work_site":
        if (!state.jobs[location.jobId]) violations.push({ code: "orphan_location_job", message: `${ownerLabel} referencia un trabajo inexistente: ${location.jobId}.` });
        return;
      case "field_edge":
        if (!state.world.parcels[location.parcelId]) violations.push({ code: "orphan_location_parcel", message: `${ownerLabel} referencia una parcela inexistente: ${location.parcelId}.` });
        return;
      case "on_object":
        if (!state.worldObjects[location.objectId] && !state.furniture[location.objectId]) {
          violations.push({ code: "orphan_location_object", message: `${ownerLabel} referencia un objeto/mueble contenedor inexistente: ${location.objectId}.` });
        }
        return;
      case "in_load_bundle":
        if (!state.loadBundles[location.loadBundleId]) violations.push({ code: "orphan_location_load_bundle", message: `${ownerLabel} referencia una carga inexistente: ${location.loadBundleId}.` });
        return;
      default: {
        const exhaustive: never = location;
        throw new Error(`Ubicación no reconocida: ${JSON.stringify(exhaustive)}`);
      }
    }
  };

  for (const person of Object.values(state.people)) check(`Persona ${person.public.id}`, person.location);
  for (const obj of Object.values(state.worldObjects)) check(`Objeto ${obj.id}`, obj.location);
  for (const lot of Object.values(state.resourceLots)) check(`Lote ${lot.id}`, lot.location);
  for (const transport of Object.values(state.transportMeans)) check(`Transporte ${transport.id}`, transport.location);
  for (const bundle of Object.values(state.loadBundles)) check(`Carga ${bundle.id}`, bundle.location);
  for (const container of Object.values(state.containers)) check(`Contenedor ${container.id}`, container.location);
  for (const item of Object.values(state.furniture)) {
    if (item.movedToLocation) check(`Mueble ${item.id}`, item.movedToLocation);
  }
}

/**
 * Jerarquía espacial `Place → Building → Floor → Room` y las aberturas que
 * los conectan (S2 §6.3/§8.2/§8.3) resuelven siempre a entidades reales.
 */
function checkSpatialHierarchy(state: SimulationStateV2, violations: InvariantViolation[]): void {
  for (const building of Object.values(state.world.buildings)) {
    if (!state.world.places[building.placeId]) {
      violations.push({ code: "orphan_building_place", message: `Edificio ${building.id} referencia un lugar inexistente: ${building.placeId}.` });
    }
  }
  for (const place of Object.values(state.world.places)) {
    if (place.buildingId && !state.world.buildings[place.buildingId]) {
      violations.push({ code: "orphan_place_building", message: `Lugar ${place.id} referencia un edificio inexistente: ${place.buildingId}.` });
    }
  }
  for (const floor of Object.values(state.world.floors)) {
    if (!state.world.buildings[floor.buildingId]) {
      violations.push({ code: "orphan_floor_building", message: `Planta ${floor.id} referencia un edificio inexistente: ${floor.buildingId}.` });
    }
  }
  for (const room of Object.values(state.world.rooms)) {
    if (!state.world.floors[room.floorId]) {
      violations.push({ code: "orphan_room_floor", message: `Estancia ${room.id} referencia una planta inexistente: ${room.floorId}.` });
    }
  }
  for (const furniture of Object.values(state.furniture)) {
    if (!state.world.rooms[furniture.roomId]) {
      violations.push({ code: "orphan_furniture_room", message: `Mobiliario ${furniture.id} referencia una estancia inexistente: ${furniture.roomId}.` });
    }
  }
  for (const opening of Object.values(state.world.openings)) {
    if (opening.connectsRoomId && !state.world.rooms[opening.connectsRoomId]) {
      violations.push({ code: "orphan_opening_room", message: `Abertura ${opening.id} referencia una estancia inexistente: ${opening.connectsRoomId}.` });
    }
    if (opening.connectsOtherRoomId && !state.world.rooms[opening.connectsOtherRoomId]) {
      violations.push({ code: "orphan_opening_other_room", message: `Abertura ${opening.id} referencia una segunda estancia inexistente: ${opening.connectsOtherRoomId}.` });
    }
    if (!opening.connectsToExterior && !opening.connectsRoomId && !opening.connectsOtherRoomId) {
      violations.push({ code: "opening_without_any_room", message: `Abertura ${opening.id} no conecta ninguna estancia ni el exterior.` });
    }
  }
  for (const closure of Object.values(state.world.installedClosures)) {
    if (!state.world.openings[closure.openingId]) {
      violations.push({ code: "orphan_closure_opening", message: `Cierre ${closure.id} referencia una abertura inexistente: ${closure.openingId}.` });
    }
  }
  for (const obstruction of Object.values(state.world.obstructions)) {
    if (!state.world.openings[obstruction.openingId]) {
      violations.push({ code: "orphan_obstruction_opening", message: `Obstrucción ${obstruction.id} referencia una abertura inexistente: ${obstruction.openingId}.` });
    }
  }
}

function checkClosureObstructionExclusivity(state: SimulationStateV2, violations: InvariantViolation[]): void {
  // Un cierre instalado nunca es simultáneamente una carga portátil
  // (§6.4): si su abertura también aparece como transportMeans/loadBundle
  // origen no tiene sentido en este modelo, así que basta comprobar que
  // ningún objeto de mundo declara la misma identidad que un cierre.
  for (const closure of Object.values(state.world.installedClosures)) {
    if (state.worldObjects[closure.id]) {
      violations.push({
        code: "closure_as_portable_object",
        message: `El cierre instalado ${closure.id} coincide con un objeto portátil, lo que no es válido.`,
      });
    }
  }
}

/**
 * S9 (WLD-011 §4): abertura, cierre y obstrucción siguen siendo tres
 * identidades separadas y coherentes. Un cierre instalado está referenciado
 * por su abertura (y un cierre retirado ya no existe como cierre, sino como
 * objeto con la misma identidad); la abertura persiste tras retirar la
 * puerta; un acceso tapiado, barricado u obstruido no es transitable.
 */
function checkS9ClosuresAndOpenings(state: SimulationStateV2, violations: InvariantViolation[]): void {
  for (const opening of Object.values(state.world.openings)) {
    if (!opening.installedClosureId) continue;
    const closure = state.world.installedClosures[opening.installedClosureId];
    if (!closure) violations.push({ code: "opening_references_missing_closure", message: `La abertura ${opening.id} referencia un cierre inexistente: ${opening.installedClosureId}.` });
    else if (closure.openingId !== opening.id) violations.push({ code: "closure_opening_mismatch", message: `El cierre ${closure.id} no pertenece a la abertura ${opening.id} que lo referencia.` });
  }
  for (const closure of Object.values(state.world.installedClosures)) {
    const opening = state.world.openings[closure.openingId];
    if (opening && opening.installedClosureId !== closure.id) violations.push({ code: "closure_not_installed", message: `El cierre ${closure.id} ya no está instalado en su abertura ${closure.openingId} pero sigue existiendo como cierre.` });
  }
  for (const obj of Object.values(state.worldObjects)) {
    if (!obj.provenance?.startsWith("closure_removed:")) continue;
    const openingId = obj.provenance.slice("closure_removed:".length);
    if (!state.world.openings[openingId]) violations.push({ code: "removed_closure_without_opening", message: `La puerta retirada ${obj.id} procede de una abertura que ya no existe (${openingId}): retirar un cierre nunca elimina la abertura.` });
  }
  const obstructed = new Set(Object.values(state.world.obstructions).map((o) => o.openingId));
  for (const openingId of obstructed) {
    if (state.world.openings[openingId] && isOpeningPassable(openingId, state.world)) violations.push({ code: "obstructed_opening_passable", message: `La abertura ${openingId} está obstruida/tapiada pero figura como transitable.` });
  }
}

/** S9: capas coherentes (instalaciones/acabados de edificios reales, etapas dentro de rango, estados terminales con su marca temporal). */
function checkS9BuildingLayers(state: SimulationStateV2, violations: InvariantViolation[]): void {
  for (const fabric of Object.values(state.world.buildingFabrics ?? {})) {
    if (!state.world.buildings[fabric.buildingId]) violations.push({ code: "fabric_without_building", message: `Tejido de edificio sin edificio: ${fabric.buildingId}.` });
    if (fabric.dismantleStagesDone > fabric.dismantleStagesTotal) violations.push({ code: "fabric_stages_overflow", message: `El edificio ${fabric.buildingId} tiene más etapas desmanteladas que las existentes.` });
    if (fabric.structureState === "dismantled" && (fabric.dismantleStagesDone !== fabric.dismantleStagesTotal || fabric.dismantledAtSimSeconds === null)) violations.push({ code: "fabric_dismantled_incoherent", message: `El edificio ${fabric.buildingId} figura desmantelado sin completar sus etapas.` });
    if (fabric.structureState === "demolished" && fabric.demolishedAtSimSeconds === null) violations.push({ code: "fabric_demolished_without_time", message: `El edificio ${fabric.buildingId} figura demolido sin instante de demolición.` });
    if (fabric.demolishedAtSimSeconds !== null && fabric.structureState !== "demolished") violations.push({ code: "fabric_demolition_reverted", message: `El edificio ${fabric.buildingId} fue demolido y ya no figura como demolido: la demolición es irreversible.` });
    if (isFabricTerminal(fabric) && fabric.lifeStage !== "terminal") violations.push({ code: "fabric_terminal_life_stage", message: `El edificio ${fabric.buildingId} es terminal pero su vida no lo es.` });
  }
  for (const installation of Object.values(state.world.buildingInstallations ?? {})) {
    if (!state.world.buildings[installation.buildingId]) violations.push({ code: "installation_without_building", message: `La instalación ${installation.id} referencia un edificio inexistente.` });
    for (const roomId of installation.roomIds) {
      if (buildingIdOfRoomInWorld(state.world, roomId) !== installation.buildingId) violations.push({ code: "installation_room_outside_building", message: `La instalación ${installation.id} da servicio a una estancia de otro edificio: ${roomId}.` });
    }
    if ((installation.state === "dismantled" || installation.state === "destroyed") && installation.functionalState !== "parts_only" && installation.functionalState !== "irreparable") {
      violations.push({ code: "dismantled_installation_still_functional", message: `La instalación ${installation.id} está desmontada o destruida pero conserva estado funcional.` });
    }
  }
  for (const finish of Object.values(state.world.buildingFinishes ?? {})) {
    if (!state.world.buildings[finish.buildingId]) violations.push({ code: "finish_without_building", message: `El acabado ${finish.id} referencia un edificio inexistente.` });
    if (finish.roomId && buildingIdOfRoomInWorld(state.world, finish.roomId) !== finish.buildingId) violations.push({ code: "finish_room_outside_building", message: `El acabado ${finish.id} está en una estancia de otro edificio.` });
  }
}

/**
 * S9: un edificio desmantelado o demolido no conserva estancias habitadas,
 * contenido, mobiliario, instalaciones activas, acabados instalados ni
 * cierres activos (§12 del prompt S7-S9).
 */
function checkS9TerminalBuildings(state: SimulationStateV2, violations: InvariantViolation[]): void {
  const terminal = new Set(Object.values(state.world.buildingFabrics ?? {}).filter((f) => isFabricTerminal(f)).map((f) => f.buildingId));
  if (terminal.size === 0) return;
  const inTerminal = (location: EntityLocation): boolean => {
    const roomId = resolveRoomId(state, location);
    const buildingId = roomId ? buildingIdOfRoomInWorld(state.world, roomId) : null;
    return buildingId !== null && terminal.has(buildingId);
  };
  for (const person of Object.values(state.people)) if (inTerminal(person.location)) violations.push({ code: "person_inside_terminal_building", message: `La persona ${person.public.id} está dentro de un edificio demolido o desmantelado.` });
  for (const obj of Object.values(state.worldObjects)) if (inTerminal(obj.location)) violations.push({ code: "object_inside_terminal_building", message: `El objeto ${obj.id} sigue dentro de un edificio demolido o desmantelado.` });
  for (const lot of Object.values(state.resourceLots)) if (inTerminal(lot.location)) violations.push({ code: "lot_inside_terminal_building", message: `El lote ${lot.id} sigue dentro de un edificio demolido o desmantelado.` });
  for (const furniture of Object.values(state.furniture)) {
    const buildingId = buildingIdOfRoomInWorld(state.world, furniture.roomId);
    if (buildingId && terminal.has(buildingId) && (furniture.movedToLocation === null || inTerminal(furniture.movedToLocation))) violations.push({ code: "furniture_inside_terminal_building", message: `El mueble ${furniture.id} sigue en un edificio demolido o desmantelado.` });
  }
  for (const installation of Object.values(state.world.buildingInstallations ?? {})) {
    if (terminal.has(installation.buildingId) && (installation.state === "connected" || installation.state === "disconnected")) violations.push({ code: "terminal_building_active_installation", message: `La instalación ${installation.id} sigue activa en un edificio demolido o desmantelado.` });
  }
  for (const finish of Object.values(state.world.buildingFinishes ?? {})) {
    if (terminal.has(finish.buildingId) && finish.state === "installed") violations.push({ code: "terminal_building_installed_finish", message: `El acabado ${finish.id} sigue instalado en un edificio demolido o desmantelado.` });
  }
  for (const opening of Object.values(state.world.openings)) {
    const buildingId = opening.connectsRoomId ? buildingIdOfRoomInWorld(state.world, opening.connectsRoomId) : null;
    if (!buildingId || !terminal.has(buildingId) || !opening.installedClosureId) continue;
    const closure = state.world.installedClosures[opening.installedClosureId];
    if (closure && closure.state !== "destroyed") violations.push({ code: "terminal_building_active_closure", message: `El cierre ${closure.id} sigue activo en un edificio demolido o desmantelado.` });
  }
}

/**
 * S9 (§12: «trabajos no referencian objetivos destruidos sin bloqueo/fallo
 * causal»): ningún trabajo vivo sigue actuando sobre un edificio desmantelado
 * o demolido, ni sobre algo que desapareció con él.
 */
function checkS9JobsReferenceLiveTargets(state: SimulationStateV2, violations: InvariantViolation[]): void {
  const terminal = new Set(Object.values(state.world.buildingFabrics ?? {}).filter((f) => isFabricTerminal(f)).map((f) => f.buildingId));
  if (terminal.size === 0) return;
  for (const job of Object.values(state.jobs)) {
    if (job.state === "completed" || job.state === "cancelled" || job.state === "causal_failure") continue;
    const buildingId = buildingIdOfTarget(state, job.target);
    const gone = job.target.kind !== "own_need" && job.target.kind !== "area" && !resolveTargetLocation(state, job.target);
    if ((buildingId && terminal.has(buildingId)) || (gone && job.state !== "blocked")) {
      violations.push({ code: "live_job_on_destroyed_target", message: `El trabajo ${job.id} (${job.state}) sigue actuando sobre un edificio demolido/desmantelado o algo destruido con él.` });
    }
  }
}
