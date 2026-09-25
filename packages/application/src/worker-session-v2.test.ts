import { describe, expect, it } from "vitest";
import { createInitialStateV2 } from "@z-world/simulation-core";
import { WORKER_PROTOCOL_VERSION_V2, type FromWorkerMessageV2, type ResourceLot } from "@z-world/contracts";
import { WorkerSessionV2 } from "./worker-session-v2.js";

function projectionsOf(messages: readonly FromWorkerMessageV2[]) {
  const found = messages.find((m) => m.type === "projections");
  if (!found || found.type !== "projections") throw new Error("Sin mensaje de proyecciones V2");
  return found.projections;
}

function snapshotReadyOf(messages: readonly FromWorkerMessageV2[]) {
  const found = messages.find((m) => m.type === "snapshot_ready");
  if (!found || found.type !== "snapshot_ready") throw new Error("Sin mensaje snapshot_ready V2");
  return found;
}

describe("WorkerSessionV2 (protocolo Worker V2)", () => {
  it("carga estado V2 y responde con proyecciones sin datos ocultos", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("worker-v2-seed-1");
    const messages = session.handleMessage({
      type: "load_state",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      gameSaveId: "game-v2-1",
      revision: 0,
      state,
    });
    const projections = projectionsOf(messages);
    expect(projections.personCards).toHaveLength(6);
    expect(JSON.stringify(projections)).not.toContain("caliberTier");
  });

  it("rechaza un payload inválido sin lanzar excepción", () => {
    const session = new WorkerSessionV2();
    const messages = session.handleMessage({ type: "not_a_real_type" });
    expect(messages[0]).toMatchObject({ type: "worker_error", code: "invalid_payload" });
  });

  it("rechaza un mensaje con el protocolo V1 (versión 1), nunca lo confunde en silencio", () => {
    const session = new WorkerSessionV2();
    const messages = session.handleMessage({
      type: "request_snapshot",
      protocolVersion: 1,
    });
    expect(messages[0]).toMatchObject({ type: "worker_error", code: "invalid_payload" });
  });

  it("un comando de pausa/velocidad pide snapshot inmediato", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("worker-v2-seed-2");
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-v2-2", revision: 0, state });

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

  it("tick avanza el reloj cuando hay velocidad y produce proyecciones actualizadas", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("worker-v2-seed-3");
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-v2-3", revision: 0, state });
    session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-2", type: "set_speed", speed: 1 },
    });

    session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 1000 });
    const before = projectionsOf(session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 2000 }));
    const after = projectionsOf(session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 60000 }));
    expect(after.clock.minute !== before.clock.minute || after.clock.hour !== before.clock.hour).toBe(true);
  });

  it("snapshot_persisted actualiza la revisión y vuelve a saved", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("worker-v2-seed-4");
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-v2-4", revision: 0, state });
    const triggered = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-3", type: "set_speed", speed: 1 },
    });
    const attemptId = snapshotReadyOf(triggered).attemptId;
    const afterPersisted = projectionsOf(
      session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: 1, attemptId }),
    );
    expect(afterPersisted.saveStatus.status).toBe("saved");
    expect(afterPersisted.revision).toBe(1);
  });

  it("un ack con attemptId distinto al del lote en vuelo (duplicado/obsoleto) no avanza revisión ni estado", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("worker-v2-seed-stale-ack");
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-v2-stale", revision: 0, state });
    session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-stale", type: "set_speed", speed: 1 },
    });
    const stale = projectionsOf(
      session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: 1, attemptId: "not-the-real-attempt" }),
    );
    expect(stale.revision).toBe(0);
    expect(stale.saveStatus.status).toBe("saving");
  });

  it("snapshot_persist_failed por conflicto de revisión se refleja en el estado de guardado y congela la sesión", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("worker-v2-seed-5");
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-v2-5", revision: 0, state });
    const triggered = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-conflict", type: "set_speed", speed: 1 },
    });
    const attemptId = snapshotReadyOf(triggered).attemptId;
    const messages = session.handleMessage({
      type: "snapshot_persist_failed",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      code: "revision_conflict",
      attemptId,
    });
    const projections = projectionsOf(messages);
    expect(projections.saveStatus.status).toBe("revision_conflict");

    // La sesión queda congelada: ni un comando nuevo ni un tick avanzan el mundo.
    const beforeClock = projections.clock;
    const afterCommand = projectionsOf(
      session.handleMessage({
        type: "command",
        protocolVersion: WORKER_PROTOCOL_VERSION_V2,
        command: { commandId: "cmd-after-conflict", type: "set_speed", speed: 2 },
      }),
    );
    expect(afterCommand.saveStatus.status).toBe("revision_conflict");
    const afterTick = session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 1000 });
    expect(afterTick).toHaveLength(0);
    expect(afterCommand.clock).toEqual(beforeClock);
  });

  it("save_error conserva el lote (attemptId + eventos) y retry_save reenvía exactamente el mismo lote", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("worker-v2-seed-retry");
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-v2-retry", revision: 0, state });
    const triggered = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-retry", type: "set_speed", speed: 1 },
    });
    const original = snapshotReadyOf(triggered);

    const failed = projectionsOf(
      session.handleMessage({ type: "snapshot_persist_failed", protocolVersion: WORKER_PROTOCOL_VERSION_V2, code: "network_error", attemptId: original.attemptId }),
    );
    expect(failed.saveStatus.status).toBe("save_error");

    const retried = session.handleMessage({ type: "retry_save", protocolVersion: WORKER_PROTOCOL_VERSION_V2 });
    const resent = snapshotReadyOf(retried);
    expect(resent.attemptId).toBe(original.attemptId);
    expect(resent.events).toEqual(original.events);
    expect(resent.expectedRevision).toBe(original.expectedRevision);
  });

  it("un comando de movimiento se procesa mediante el reductor V2 real (índice de navegación construido al cargar) sin lanzar excepción", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("worker-v2-seed-6");
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-v2-6", revision: 0, state });
    const personId = state.peopleOrder[0]!;
    const destination = { x: state.world.arrivalPoint.x + 5, y: state.world.arrivalPoint.y };

    const messages = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-move-1", type: "order_direct_move", personId, destination },
    });
    const projections = projectionsOf(messages);
    expect(Array.isArray(projections.movements)).toBe(true);
    expect(projections.operationalLog.length).toBeGreaterThan(0);
  });

  it("coalesce guardados: un segundo evento que dispara guardado mientras el primero sigue en vuelo no emite un segundo snapshot_ready con revisión obsoleta", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("worker-v2-seed-7");
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-v2-7", revision: 0, state });

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
    expect(projectionsOf(second).saveStatus.status).toBe("saving");

    // Al confirmarse el primer guardado, el segundo se encadena
    // automáticamente con una `attemptId` distinta (nuevo lote, nunca la
    // misma revisión reenviada dos veces).
    const afterPersisted = session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: 1, attemptId: firstAttemptId });
    expect(afterPersisted.some((m) => m.type === "snapshot_ready")).toBe(true);
    const secondAttemptId = snapshotReadyOf(afterPersisted).attemptId;
    expect(secondAttemptId).not.toBe(firstAttemptId);
    expect(projectionsOf(afterPersisted).saveStatus.status).toBe("saving");

    const finalMessages = session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: 2, attemptId: secondAttemptId });
    expect(projectionsOf(finalMessages).saveStatus.status).toBe("saved");
    expect(projectionsOf(finalMessages).revision).toBe(2);
  });

  it("el buffer de eventos pendientes envía el lote real: eventos acumulados desde el último guardado confirmado, nunca `events: []` fijo", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("worker-v2-seed-events");
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-v2-events", revision: 0, state });

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

    const session = new WorkerSessionV2();
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-v2-autosave", revision: 0, state });

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
    const session = new WorkerSessionV2();
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-v2-autosave-unit", revision: 0, state });

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
});
