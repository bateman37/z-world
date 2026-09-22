import { describe, expect, it } from "vitest";
import { createInitialState } from "@z-world/simulation-core";
import { WORKER_PROTOCOL_VERSION, type FromWorkerMessage } from "@z-world/contracts";
import { WorkerSession } from "./worker-session.js";

function projectionsOf(messages: readonly FromWorkerMessage[]) {
  const found = messages.find((m) => m.type === "projections");
  if (!found || found.type !== "projections") throw new Error("Sin mensaje de proyecciones");
  return found.projections;
}

describe("WorkerSession (protocolo Worker)", () => {
  it("carga estado y responde con proyecciones sin datos ocultos", () => {
    const session = new WorkerSession();
    const state = createInitialState("worker-seed-1");
    const messages = session.handleMessage({
      type: "load_state",
      protocolVersion: WORKER_PROTOCOL_VERSION,
      gameSaveId: "game-1",
      revision: 0,
      state,
    });
    const projections = projectionsOf(messages);
    expect(projections.personCards).toHaveLength(6);
    expect(JSON.stringify(projections)).not.toContain("caliberTier");
  });

  it("rechaza un payload inválido sin lanzar excepción", () => {
    const session = new WorkerSession();
    const messages = session.handleMessage({ type: "not_a_real_type" });
    expect(messages[0]).toMatchObject({ type: "worker_error", code: "invalid_payload" });
  });

  it("rechaza una versión de protocolo incompatible", () => {
    const session = new WorkerSession();
    const messages = session.handleMessage({
      type: "request_snapshot",
      protocolVersion: 999,
    });
    expect(messages[0]).toMatchObject({ type: "worker_error", code: "invalid_payload" });
  });

  it("un comando de pausa/velocidad pide snapshot inmediato", () => {
    const session = new WorkerSession();
    const state = createInitialState("worker-seed-2");
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION, gameSaveId: "game-2", revision: 0, state });

    const messages = session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION,
      command: { commandId: "cmd-1", type: "set_speed", speed: 2 },
    });
    const snapshotReady = messages.find((m) => m.type === "snapshot_ready");
    expect(snapshotReady).toBeDefined();
    if (snapshotReady?.type === "snapshot_ready") {
      expect(snapshotReady.reason).toBe("session_pause_or_relevant_change");
    }
  });

  it("tick avanza el reloj cuando hay velocidad y produce proyecciones actualizadas", () => {
    const session = new WorkerSession();
    const state = createInitialState("worker-seed-3");
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION, gameSaveId: "game-3", revision: 0, state });
    session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION,
      command: { commandId: "cmd-2", type: "set_speed", speed: 1 },
    });

    // El primer tick tras cargar solo fija la marca de tiempo base (sin
    // referencia previa no hay delta que avanzar); los siguientes sí
    // producen avance real y sus proyecciones correspondientes.
    session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION, nowMs: 1000 });
    const before = projectionsOf(session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION, nowMs: 2000 }));
    const after = projectionsOf(session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION, nowMs: 60000 }));
    expect(after.clock.minute !== before.clock.minute || after.clock.hour !== before.clock.hour).toBe(true);
  });

  it("snapshot_persisted actualiza la revisión y vuelve a saved", () => {
    const session = new WorkerSession();
    const state = createInitialState("worker-seed-4");
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION, gameSaveId: "game-4", revision: 0, state });
    session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION,
      command: { commandId: "cmd-3", type: "set_speed", speed: 1 },
    });
    const afterPersisted = projectionsOf(
      session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION, revision: 1 }),
    );
    expect(afterPersisted.saveStatus.status).toBe("saved");
    expect(afterPersisted.revision).toBe(1);
  });

  it("snapshot_persist_failed por conflicto de revisión se refleja en el estado de guardado", () => {
    const session = new WorkerSession();
    const state = createInitialState("worker-seed-5");
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION, gameSaveId: "game-5", revision: 0, state });
    const messages = session.handleMessage({
      type: "snapshot_persist_failed",
      protocolVersion: WORKER_PROTOCOL_VERSION,
      code: "revision_conflict",
    });
    const projections = projectionsOf(messages);
    expect(projections.saveStatus.status).toBe("revision_conflict");
  });
});
