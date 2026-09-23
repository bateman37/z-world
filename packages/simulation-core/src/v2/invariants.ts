import type { EntityLocation, SimulationStateV2 } from "@z-world/contracts";

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
  checkClosureObstructionExclusivity(state, violations);
  checkGlobalIdUniqueness(state, violations);
  checkEntityLocationsResolve(state, violations);
  checkSpatialHierarchy(state, violations);

  return { ok: violations.length === 0, violations };
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
    if (uniqueJobs.size > 1 && (key.startsWith("world_object:") || key.startsWith("transport_means:"))) {
      violations.push({
        code: "double_exclusive_reservation",
        message: `${key} está reservado simultáneamente por varios trabajos: ${[...uniqueJobs].join(", ")}.`,
      });
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
