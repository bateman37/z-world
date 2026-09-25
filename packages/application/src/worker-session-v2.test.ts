import { describe, expect, it } from "vitest";
import { createInitialStateV2 } from "@z-world/simulation-core";
import { WORKER_PROTOCOL_VERSION_V2, type FromWorkerMessageV2, type ResourceLot, type StructuralProjectionsV2, type TickProjectionsV2 } from "@z-world/contracts";
import { WorkerSessionV2 } from "./worker-session-v2.js";

/**
 * Reconstruye el mismo objeto de proyecciones fusionado que
 * `use-simulation-worker-v2.ts` expone a React (S11 §5.2): guarda el
 * último `structural_projections` aplicado y lo combina con cada
 * `tick_projections` que llega. Las pruebas de este archivo ejercitan
 * `WorkerSessionV2` directamente (no el hook), así que aquí no hace falta
 * el descarte de duplicados/huecos — eso se prueba aparte, contra la
 * secuencia real que emite la sesión.
 */
class ProjectionMerger {
  private structural: StructuralProjectionsV2 | null = null;
  private tick: TickProjectionsV2 | null = null;

  apply(messages: readonly FromWorkerMessageV2[]): void {
    for (const message of messages) {
      if (message.type === "structural_projections") this.structural = message.structural;
      if (message.type === "tick_projections") this.tick = message.tick;
    }
  }

  get merged() {
    if (!this.structural || !this.tick) throw new Error("Sin proyección estructural o de tick aplicada todavía");
    const { mapEntitiesStatic, ...structuralRest } = this.structural;
    const { mapPeople, ...tickRest } = this.tick;
    return { ...structuralRest, ...tickRest, mapEntities: { ...mapEntitiesStatic, people: mapPeople } };
  }
}

function structuralOf(messages: readonly FromWorkerMessageV2[]) {
  const found = messages.find((m) => m.type === "structural_projections");
  if (!found || found.type !== "structural_projections") throw new Error("Sin mensaje structural_projections V2");
  return found;
}

function tickOf(messages: readonly FromWorkerMessageV2[]) {
  const found = messages.find((m) => m.type === "tick_projections");
  if (!found || found.type !== "tick_projections") throw new Error("Sin mensaje tick_projections V2");
  return found;
}

/** Carga un estado y devuelve una `ProjectionMerger` ya aplicada con la primera proyección, más `session`. */
function loadedSession(state: ReturnType<typeof createInitialStateV2>, gameSaveId = "game-v2-1") {
  const session = new WorkerSessionV2();
  const merger = new ProjectionMerger();
  merger.apply(session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId, revision: 0, state }));
  return { session, merger };
}

function snapshotReadyOf(messages: readonly FromWorkerMessageV2[]) {
  const found = messages.find((m) => m.type === "snapshot_ready");
  if (!found || found.type !== "snapshot_ready") throw new Error("Sin mensaje snapshot_ready V2");
  return found;
}

describe("WorkerSessionV2 (protocolo Worker V3 — canales estructural/tick, S11 §5.2)", () => {
  it("carga estado V2 y responde con structural_projections + tick_projections, sin datos ocultos", () => {
    const state = createInitialStateV2("worker-v2-seed-1");
    const { merger, session } = loadedSession(state);
    void session;
    const projections = merger.merged;
    expect(projections.personCards).toHaveLength(6);
    expect(JSON.stringify(projections)).not.toContain("caliberTier");
  });

  it("load_state siempre fuerza structural_projections, con secuencia 1 y structuralSequence 1 en el tick que le sigue", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("worker-v2-seed-seq");
    const messages = session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-v2-seq", revision: 0, state });
    const structural = structuralOf(messages);
    const tick = tickOf(messages);
    expect(structural.sequence).toBe(1);
    expect(tick.sequence).toBe(2);
    expect(tick.structuralSequence).toBe(1);
  });

  it("rechaza un payload inválido sin lanzar excepción", () => {
    const session = new WorkerSessionV2();
    const messages = session.handleMessage({ type: "not_a_real_type" });
    expect(messages[0]).toMatchObject({ type: "worker_error", code: "invalid_payload" });
  });

  it("rechaza un mensaje con el protocolo v2 anterior (sin canales), nunca lo confunde en silencio", () => {
    const session = new WorkerSessionV2();
    const messages = session.handleMessage({
      type: "request_snapshot",
      protocolVersion: 2,
    });
    expect(messages[0]).toMatchObject({ type: "worker_error", code: "invalid_payload" });
  });

  it("un comando de pausa/velocidad pide snapshot inmediato", () => {
    const state = createInitialStateV2("worker-v2-seed-2");
    const { session } = loadedSession(state, "game-v2-2");

    const messages = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-1", type: "set_speed", speed: 2 },
    });
    const snapshotReady = messages.find((m) => m.type === "snapshot_ready");
    expect(snapshotReady).toBeDefined();
    if (snapshotReady?.type === "snapshot_ready") {
      expect(snapshotReady.reason).toBe("session_pause_or_relevant_change");
    }
  });

  it("tick avanza el reloj cuando hay velocidad y produce tick_projections actualizadas", () => {
    const state = createInitialStateV2("worker-v2-seed-3");
    const { session, merger } = loadedSession(state, "game-v2-3");
    session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-2", type: "set_speed", speed: 1 },
    });

    session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 1000 });
    merger.apply(session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 2000 }));
    const before = merger.merged;
    merger.apply(session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 60000 }));
    const after = merger.merged;
    expect(after.clock.minute !== before.clock.minute || after.clock.hour !== before.clock.hour).toBe(true);
  });

  it("no reenvía structural_projections en cada tick cuando el mundo no cambió y la cadencia de niebla no venció", () => {
    const state = createInitialStateV2("worker-v2-seed-cadence");
    const { session } = loadedSession(state, "game-v2-cadence");
    session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-speed", type: "set_speed", speed: 1 },
    });
    session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 0 });
    // Ticks muy seguidos (250 ms, la cadencia real del Worker): ninguno debería alcanzar
    // la cadencia máxima de niebla (1000 ms) ni cambiar `state.world`.
    const tick1 = session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 250 });
    const tick2 = session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 500 });
    const tick3 = session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 750 });
    for (const messages of [tick1, tick2, tick3]) {
      expect(messages.some((m) => m.type === "structural_projections")).toBe(false);
      expect(messages.some((m) => m.type === "tick_projections")).toBe(true);
    }
  });

  it("snapshot_persisted actualiza la revisión y vuelve a saved", () => {
    const state = createInitialStateV2("worker-v2-seed-4");
    const { session, merger } = loadedSession(state, "game-v2-4");
    const triggered = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-3", type: "set_speed", speed: 1 },
    });
    const attemptId = snapshotReadyOf(triggered).attemptId;
    merger.apply(session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: 1, attemptId }));
    const afterPersisted = merger.merged;
    expect(afterPersisted.saveStatus.status).toBe("saved");
    expect(afterPersisted.revision).toBe(1);
  });

  it("un ack con attemptId distinto al del lote en vuelo (duplicado/obsoleto) no avanza revisión ni estado", () => {
    const state = createInitialStateV2("worker-v2-seed-stale-ack");
    const { session, merger } = loadedSession(state, "game-v2-stale");
    session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-stale", type: "set_speed", speed: 1 },
    });
    merger.apply(session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: 1, attemptId: "not-the-real-attempt" }));
    const stale = merger.merged;
    expect(stale.revision).toBe(0);
    expect(stale.saveStatus.status).toBe("saving");
  });

  it("snapshot_persist_failed por conflicto de revisión se refleja en el estado de guardado y congela la sesión", () => {
    const state = createInitialStateV2("worker-v2-seed-5");
    const { session, merger } = loadedSession(state, "game-v2-5");
    const triggered = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-conflict", type: "set_speed", speed: 1 },
    });
    const attemptId = snapshotReadyOf(triggered).attemptId;
    merger.apply(
      session.handleMessage({
        type: "snapshot_persist_failed",
        protocolVersion: WORKER_PROTOCOL_VERSION_V2,
        code: "revision_conflict",
        attemptId,
      }),
    );
    const projections = merger.merged;
    expect(projections.saveStatus.status).toBe("revision_conflict");

    // La sesión queda congelada: ni un comando nuevo ni un tick avanzan el mundo.
    const beforeClock = projections.clock;
    merger.apply(
      session.handleMessage({
        type: "command",
        protocolVersion: WORKER_PROTOCOL_VERSION_V2,
        command: { commandId: "cmd-after-conflict", type: "set_speed", speed: 2 },
      }),
    );
    const afterCommand = merger.merged;
    expect(afterCommand.saveStatus.status).toBe("revision_conflict");
    const afterTick = session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 1000 });
    expect(afterTick).toHaveLength(0);
    expect(afterCommand.clock).toEqual(beforeClock);
  });

  it("save_error conserva el lote (attemptId + eventos) y retry_save reenvía exactamente el mismo lote", () => {
    const state = createInitialStateV2("worker-v2-seed-retry");
    const { session, merger } = loadedSession(state, "game-v2-retry");
    const triggered = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-retry", type: "set_speed", speed: 1 },
    });
    const original = snapshotReadyOf(triggered);

    merger.apply(
      session.handleMessage({ type: "snapshot_persist_failed", protocolVersion: WORKER_PROTOCOL_VERSION_V2, code: "network_error", attemptId: original.attemptId }),
    );
    expect(merger.merged.saveStatus.status).toBe("save_error");

    const retried = session.handleMessage({ type: "retry_save", protocolVersion: WORKER_PROTOCOL_VERSION_V2 });
    const resent = snapshotReadyOf(retried);
    expect(resent.attemptId).toBe(original.attemptId);
    expect(resent.events).toEqual(original.events);
    expect(resent.expectedRevision).toBe(original.expectedRevision);
  });

  it("un comando de movimiento se procesa mediante el reductor V2 real (índice de navegación construido al cargar) sin lanzar excepción", () => {
    const state = createInitialStateV2("worker-v2-seed-6");
    const { session, merger } = loadedSession(state, "game-v2-6");
    const personId = state.peopleOrder[0]!;
    const destination = { x: state.world.arrivalPoint.x + 5, y: state.world.arrivalPoint.y };

    merger.apply(
      session.handleMessage({
        type: "command",
        protocolVersion: WORKER_PROTOCOL_VERSION_V2,
        command: { commandId: "cmd-move-1", type: "order_direct_move", personId, destination },
      }),
    );
    const projections = merger.merged;
    expect(Array.isArray(projections.movements)).toBe(true);
    expect(projections.operationalLog.length).toBeGreaterThan(0);
  });

  it("coalesce guardados: un segundo evento que dispara guardado mientras el primero sigue en vuelo no emite un segundo snapshot_ready con revisión obsoleta", () => {
    const state = createInitialStateV2("worker-v2-seed-7");
    const { session, merger } = loadedSession(state, "game-v2-7");

    const first = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-a", type: "set_speed", speed: 2 },
    });
    expect(first.some((m) => m.type === "snapshot_ready")).toBe(true);
    const firstAttemptId = snapshotReadyOf(first).attemptId;

    // Segundo evento disparador mientras el primer guardado sigue "en
    // vuelo" (todavía no llegó `snapshot_persisted`): no debe producir un
    // segundo `snapshot_ready`.
    const second = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-b", type: "update_priority", personId: state.peopleOrder[0]!, priorityId: Object.keys(state.people[state.peopleOrder[0]!]!.public.priorities)[0]!, value: 3 },
    });
    expect(second.some((m) => m.type === "snapshot_ready")).toBe(false);
    merger.apply(second);
    expect(merger.merged.saveStatus.status).toBe("saving");

    // Al confirmarse el primer guardado, el segundo se encadena
    // automáticamente con una `attemptId` distinta (nuevo lote, nunca la
    // misma revisión reenviada dos veces).
    const afterPersisted = session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: 1, attemptId: firstAttemptId });
    expect(afterPersisted.some((m) => m.type === "snapshot_ready")).toBe(true);
    const secondAttemptId = snapshotReadyOf(afterPersisted).attemptId;
    expect(secondAttemptId).not.toBe(firstAttemptId);
    merger.apply(afterPersisted);
    expect(merger.merged.saveStatus.status).toBe("saving");

    const finalMessages = session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: 2, attemptId: secondAttemptId });
    merger.apply(finalMessages);
    expect(merger.merged.saveStatus.status).toBe("saved");
    expect(merger.merged.revision).toBe(2);
  });

  it("el buffer de eventos pendientes envía el lote real: eventos acumulados desde el último guardado confirmado, nunca `events: []` fijo", () => {
    const state = createInitialStateV2("worker-v2-seed-events");
    const { session } = loadedSession(state, "game-v2-events");

    const triggered = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-events-1", type: "set_speed", speed: 1 },
    });
    const readyOne = snapshotReadyOf(triggered);
    expect(readyOne.events.length).toBeGreaterThan(0);
    expect(readyOne.events.some((e) => e.type === "speed_or_pause_changed")).toBe(true);

    session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: 1, attemptId: readyOne.attemptId });

    const personId = state.peopleOrder[0]!;
    const priorityId = Object.keys(state.people[personId]!.public.priorities)[0]!;
    const secondTrigger = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-events-2", type: "update_priority", personId, priorityId, value: 5 },
    });
    const readyTwo = snapshotReadyOf(secondTrigger);
    // El segundo lote no repite los eventos ya confirmados del primero.
    expect(readyTwo.events.some((e) => e.eventId === readyOne.events[0]!.eventId)).toBe(false);
    expect(readyTwo.events.some((e) => e.type === "priority_changed")).toBe(true);
  });

  it("cadencia de autosave (S11 §4.4): un cambio sin límite material propio (deterioro por tiempo) no se pierde en memoria, aunque nunca se guarda en cada tick", () => {
    const base = createInitialStateV2("worker-v2-seed-autosave");
    const personId = base.peopleOrder[0]!;
    // Lote perecedero justo por encima del umbral "deteriorating" (0.6):
    // unas horas simuladas más lo cruzan sin que ningún comando lo pida.
    const decayingLot: ResourceLot = {
      id: "lot-autosave-1",
      family: "fresh_food",
      quantity: 1,
      unit: "unit",
      location: { kind: "carried_by_person", personId },
      condition: 0.65,
      reservedByJobId: null,
      qualityKnown: true,
      quality: 1,
      provenance: "unit_test",
      decayStartedAtSimSeconds: base.clock.elapsedSimSeconds,
      conditionAtDecayStart: 0.65,
    };
    const state = { ...base, resourceLots: { ...base.resourceLots, [decayingLot.id]: decayingLot } };

    const { session } = loadedSession(state, "game-v2-autosave");

    const speedUp = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-speed", type: "set_speed", speed: 10 },
    });
    const speedAttempt = snapshotReadyOf(speedUp);
    session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: 1, attemptId: speedAttempt.attemptId });

    // Primer tick: solo fija el instante base, sin avance real todavía.
    session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 0 });
    // Segundo tick: ~5.6 h simuladas después (2016 s reales × velocidad 10), cruza el umbral de deterioro.
    const afterDecayTick = session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 2_016_000 });

    // A lo largo de varias horas simuladas, otras seis personas también
    // evolucionan sus necesidades: el guardado real puede llegar por su
    // propio límite material (`order_settled`) o, si nada más lo pide, por
    // la cadencia de autosave — lo que nunca puede pasar es que el evento
    // de deterioro se pierda sin guardarse.
    const autosave = snapshotReadyOf(afterDecayTick);
    expect(["autosave_debounced", "order_settled"]).toContain(autosave.reason);
    expect(autosave.events.some((e) => e.type === "resource_lot_deteriorated")).toBe(true);
    expect(autosave.state.resourceLots[decayingLot.id]!.condition).toBeLessThan(0.6);
  });

  it("dispara autosave_debounced cuando el único cambio pendiente no tiene límite material propio", () => {
    // Prueba de unidad de la cadencia en sí (S11 §4.4), sin depender de
    // ningún subsistema del reductor real: fuerza `pending_changes`
    // mediante un evento de tipo no disparador (`resource_lot_deteriorated`
    // no está en `SNAPSHOT_TRIGGERING_EVENT_TYPES`) y comprueba que, una
    // vez que el reloj avanzó de verdad desde el último guardado
    // confirmado, la propia sesión decide guardar sin que nada más lo pida.
    const state = createInitialStateV2("worker-v2-seed-autosave-unit");
    const { session } = loadedSession(state, "game-v2-autosave-unit");

    const speedUp = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-speed-unit", type: "set_speed", speed: 1 },
    });
    const speedAttempt = snapshotReadyOf(speedUp);
    session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: 1, attemptId: speedAttempt.attemptId });

    // Simula (vía casteo, sin depender de un subsistema real) que el tick
    // ya dejó eventos pendientes de un tipo no disparador y que el reloj
    // avanzó desde el último guardado — exactamente el estado en el que
    // `handleTick` decide si aplica la cadencia de autosave.
    const internal = session as unknown as {
      saveStatus: string;
      pendingEvents: unknown[];
      lastSavedSimSeconds: number | null;
    };
    internal.saveStatus = "pending_changes";
    internal.pendingEvents = [{ type: "resource_lot_deteriorated", eventId: "evt-fake-1", simSeconds: 0, causedByCommandId: null, resourceLotId: "lot-x", band: "deteriorating" }];
    internal.lastSavedSimSeconds = -1; // fuerza `stateChangedSinceLastSave` a verdadero frente a cualquier reloj real.

    // El primer tick solo fija el instante base (sin avance real todavía);
    // el segundo, apenas 1 ms real después, es el que evalúa la cadencia.
    session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 0 });
    const afterTick = session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 1 });
    const autosave = snapshotReadyOf(afterTick);
    expect(autosave.reason).toBe("autosave_debounced");
  });

  it("request_resync fuerza un structural_projections fresco con secuencia nueva (nunca reinicia la numeración)", () => {
    const state = createInitialStateV2("worker-v2-seed-resync");
    const { session } = loadedSession(state, "game-v2-resync");
    session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-speed", type: "set_speed", speed: 1 },
    });
    // Varios ticks muy seguidos: no deberían forzar structural por sí solos.
    session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 0 });
    const lastTick = tickOf(session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 100 }));

    const resynced = structuralOf(session.handleMessage({ type: "request_resync", protocolVersion: WORKER_PROTOCOL_VERSION_V2 }));
    expect(resynced.sequence).toBeGreaterThan(lastTick.sequence);
  });

  it("una mutación estructural real (state.world cambia de referencia) fuerza structural_projections aunque la cadencia de niebla no haya vencido", () => {
    const state = createInitialStateV2("worker-v2-seed-structural-change");
    const { session } = loadedSession(state, "game-v2-structural-change");
    session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-speed", type: "set_speed", speed: 1 },
    });
    // Ticks muy seguidos: no fuerzan structural por cadencia.
    session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 0 });
    const quietTick = session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 50 });
    expect(quietTick.some((m) => m.type === "structural_projections")).toBe(false);

    // Sustituye `state.world` por una copia superficial con nueva
    // referencia (exactamente lo que produce cualquier mutación
    // estructural real del reductor — acceso, edificio, zona, barrera):
    // sin depender de un fixture S9/S10 completo, prueba directamente el
    // contrato de `projectionMessages` — compara `state.world` por
    // referencia, nunca por heurística de tipo de evento.
    const internal = session as unknown as { state: { world: object } | null };
    if (!internal.state) throw new Error("estado no cargado");
    internal.state = { ...internal.state, world: { ...internal.state.world } };

    const afterWorldChange = session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 100 });
    expect(afterWorldChange.some((m) => m.type === "structural_projections")).toBe(true);
  });
});

describe("WorkerSessionV2 — registro operativo persistente y reconstruible (S11 §6)", () => {
  it("carga sin recentEvents arranca con el registro vacío (comportamiento anterior conservado)", () => {
    const state = createInitialStateV2("worker-v2-seed-log-empty");
    const { merger } = loadedSession(state, "game-v2-log-empty");
    expect(merger.merged.operationalLog).toEqual([]);
  });

  it("reconstruye el registro reciente desde eventos persistidos pasados en load_state, sin duplicarlos ni repetir el reductor", () => {
    const state = createInitialStateV2("worker-v2-seed-log-reconstruct");
    const session = new WorkerSessionV2();
    const merger = new ProjectionMerger();
    const recentEvents = [
      { type: "game_created" as const, eventId: "evt-hist-0", simSeconds: 0, causedByCommandId: null, seed: state.seed },
      { type: "speed_or_pause_changed" as const, eventId: "evt-hist-1", simSeconds: 10, causedByCommandId: "hist-cmd-1", speed: 1 as const },
    ];
    merger.apply(
      session.handleMessage({
        type: "load_state",
        protocolVersion: WORKER_PROTOCOL_VERSION_V2,
        gameSaveId: "game-v2-log-reconstruct",
        revision: 3,
        state,
        recentEvents,
      }),
    );
    const log = merger.merged.operationalLog;
    expect(log).toHaveLength(2);
    expect(log[0]!.eventId).toBe("evt-hist-0");
    expect(log[1]!.eventId).toBe("evt-hist-1");
  });

  it("cada entrada del registro lleva un nivel de atención (registro/aviso/importante/crítico)", () => {
    const state = createInitialStateV2("worker-v2-seed-log-level");
    const { session, merger } = loadedSession(state, "game-v2-log-level");
    merger.apply(
      session.handleMessage({
        type: "command",
        protocolVersion: WORKER_PROTOCOL_VERSION_V2,
        command: { commandId: "cmd-speed", type: "set_speed", speed: 1 },
      }),
    );
    const entry = merger.merged.operationalLog.find((e) => e.messageKey === "log.speed_or_pause_changed");
    expect(entry?.level).toBe("log");
    expect(entry?.count).toBe(1);
  });

  it("agrupa repeticiones de la misma causa sobre la misma entidad dentro de la ventana simulada, con contador, en vez de una entrada por cada una", () => {
    const state = createInitialStateV2("worker-v2-seed-log-group");
    const session = new WorkerSessionV2();
    const merger = new ProjectionMerger();
    // Dos "movement_blocked" seguidos de la misma persona, muy cerca en tiempo simulado.
    const personId = state.peopleOrder[0]!;
    const recentEvents = [
      { type: "movement_blocked" as const, eventId: "evt-block-1", simSeconds: 100, causedByCommandId: null, personId, code: "no_known_route" as const },
      { type: "movement_blocked" as const, eventId: "evt-block-2", simSeconds: 105, causedByCommandId: null, personId, code: "no_known_route" as const },
      { type: "movement_blocked" as const, eventId: "evt-block-3", simSeconds: 110, causedByCommandId: null, personId, code: "no_known_route" as const },
    ];
    merger.apply(
      session.handleMessage({
        type: "load_state",
        protocolVersion: WORKER_PROTOCOL_VERSION_V2,
        gameSaveId: "game-v2-log-group",
        revision: 0,
        state,
        recentEvents,
      }),
    );
    const blockedEntries = merger.merged.operationalLog.filter((e) => e.messageKey === "log.movement_blocked");
    expect(blockedEntries).toHaveLength(1);
    expect(blockedEntries[0]!.count).toBe(3);
    expect(blockedEntries[0]!.level).toBe("notice");
    expect(blockedEntries[0]!.simSeconds).toBe(110); // conserva el instante del más reciente.
  });

  it("no agrupa la misma causa sobre entidades distintas (cada persona conserva su propia entrada)", () => {
    const state = createInitialStateV2("worker-v2-seed-log-nogroup");
    const session = new WorkerSessionV2();
    const merger = new ProjectionMerger();
    const [personA, personB] = state.peopleOrder;
    const recentEvents = [
      { type: "movement_blocked" as const, eventId: "evt-a", simSeconds: 100, causedByCommandId: null, personId: personA!, code: "no_known_route" as const },
      { type: "movement_blocked" as const, eventId: "evt-b", simSeconds: 101, causedByCommandId: null, personId: personB!, code: "no_known_route" as const },
    ];
    merger.apply(
      session.handleMessage({
        type: "load_state",
        protocolVersion: WORKER_PROTOCOL_VERSION_V2,
        gameSaveId: "game-v2-log-nogroup",
        revision: 0,
        state,
        recentEvents,
      }),
    );
    const blockedEntries = merger.merged.operationalLog.filter((e) => e.messageKey === "log.movement_blocked");
    expect(blockedEntries).toHaveLength(2);
    expect(blockedEntries.every((e) => e.count === 1)).toBe(true);
  });
});
