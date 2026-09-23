import type { SimulationStateV2 } from "@z-world/contracts";

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
