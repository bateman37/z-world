import { describe, expect, it } from "vitest";
import { createInitialStateV2 } from "@z-world/simulation-core";
import { WORKER_PROTOCOL_VERSION_V2, type FromWorkerMessageV2 } from "@z-world/contracts";
import { WorkerSessionV2 } from "./worker-session-v2.js";

function projectionsOf(messages: readonly FromWorkerMessageV2[]) {
  const found = messages.find((m) => m.type === "projections");
  if (!found || found.type !== "projections") throw new Error("Sin mensaje de proyecciones V2");
  return found.projections;
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
    session.handleMessage({
      type: "command",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      command: { commandId: "cmd-3", type: "set_speed", speed: 1 },
    });
    const afterPersisted = projectionsOf(
      session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: 1 }),
    );
    expect(afterPersisted.saveStatus.status).toBe("saved");
    expect(afterPersisted.revision).toBe(1);
  });

  it("snapshot_persist_failed por conflicto de revisión se refleja en el estado de guardado", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("worker-v2-seed-5");
    session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-v2-5", revision: 0, state });
    const messages = session.handleMessage({
      type: "snapshot_persist_failed",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      code: "revision_conflict",
    });
    const projections = projectionsOf(messages);
    expect(projections.saveStatus.status).toBe("revision_conflict");
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

    // Al confirmarse el primer guardado, el segundo se encadena automáticamente.
    const afterPersisted = session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: 1 });
    expect(afterPersisted.some((m) => m.type === "snapshot_ready")).toBe(true);
    expect(projectionsOf(afterPersisted).saveStatus.status).toBe("saving");

    const finalMessages = session.handleMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: 2 });
    expect(projectionsOf(finalMessages).saveStatus.status).toBe("saved");
    expect(projectionsOf(finalMessages).revision).toBe(2);
  });
});
