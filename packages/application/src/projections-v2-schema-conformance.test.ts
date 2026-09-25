import { describe, expect, it } from "vitest";
import { createInitialStateV2 } from "@z-world/simulation-core";
import { WORKER_PROTOCOL_VERSION_V2, parseFromWorkerMessageV2, workerProjectionsV2Schema, type FromWorkerMessageV2 } from "@z-world/contracts";
import { WorkerSessionV2 } from "./worker-session-v2.js";

/**
 * Conformidad del esquema Zod real de `WorkerProjectionsV2` (S11 §5.1)
 * contra proyecciones que produce el propio `WorkerSessionV2` real — no un
 * objeto de prueba escrito a mano que pueda derivar en silencio del tipo
 * TypeScript. Cubre carga, avance de reloj, movimiento y cambios de
 * prioridad/velocidad; también que un payload corrupto se rechaza con
 * error tipado en vez de colarse como proyección válida.
 */
function projectionsMessagesOf(messages: readonly FromWorkerMessageV2[]): readonly Extract<FromWorkerMessageV2, { type: "projections" }>[] {
  return messages.filter((m): m is Extract<FromWorkerMessageV2, { type: "projections" }> => m.type === "projections");
}

describe("workerProjectionsV2Schema — conformidad con proyecciones reales", () => {
  it("valida la proyección inicial de carga sin datos ocultos", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("schema-conformance-seed-1");
    const messages = session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-schema-1", revision: 0, state });
    for (const message of projectionsMessagesOf(messages)) {
      const result = workerProjectionsV2Schema.safeParse(message.projections);
      expect(result.success, result.success ? undefined : JSON.stringify(result.error.issues.slice(0, 5))).toBe(true);
    }
  });

  it("valida las proyecciones tras avanzar el reloj, mover a una persona y cambiar prioridad/velocidad", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("schema-conformance-seed-2");
    const personId = state.peopleOrder[0]!;
    const priorityId = Object.keys(state.people[personId]!.public.priorities)[0]!;
    const destination = { x: state.world.arrivalPoint.x + 5, y: state.world.arrivalPoint.y };

    const allMessages: FromWorkerMessageV2[] = [];
    allMessages.push(...session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-schema-2", revision: 0, state }));
    allMessages.push(...session.handleMessage({ type: "command", protocolVersion: WORKER_PROTOCOL_VERSION_V2, command: { commandId: "cmd-1", type: "set_speed", speed: 2 } }));
    allMessages.push(...session.handleMessage({ type: "command", protocolVersion: WORKER_PROTOCOL_VERSION_V2, command: { commandId: "cmd-2", type: "order_direct_move", personId, destination } }));
    allMessages.push(...session.handleMessage({ type: "command", protocolVersion: WORKER_PROTOCOL_VERSION_V2, command: { commandId: "cmd-3", type: "update_priority", personId, priorityId, value: 4 } }));
    allMessages.push(...session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 1000 }));
    allMessages.push(...session.handleMessage({ type: "tick", protocolVersion: WORKER_PROTOCOL_VERSION_V2, nowMs: 4000 }));

    const projectionsMessages = projectionsMessagesOf(allMessages);
    expect(projectionsMessages.length).toBeGreaterThan(0);
    for (const message of projectionsMessages) {
      const result = workerProjectionsV2Schema.safeParse(message.projections);
      expect(result.success, result.success ? undefined : JSON.stringify(result.error.issues.slice(0, 5))).toBe(true);
      const wrapped = parseFromWorkerMessageV2(message);
      expect(wrapped.success).toBe(true);
    }
  });

  it("rechaza con error tipado un payload que no cumple el esquema, en vez de colarlo como proyección válida", () => {
    const bogus = { type: "projections", protocolVersion: WORKER_PROTOCOL_VERSION_V2, projections: { gameSummary: { gameSaveId: "x" } } };
    const result = parseFromWorkerMessageV2(bogus);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("rechaza una `fog.cells` corrupta (validador rápido de S11 §9.2), sin dejar de ser una validación real", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("schema-conformance-seed-fog");
    const messages = session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-schema-fog", revision: 0, state });
    const projectionsMessage = projectionsMessagesOf(messages)[0]!;

    const valid = workerProjectionsV2Schema.safeParse(projectionsMessage.projections);
    expect(valid.success).toBe(true);

    const corrupted = { ...projectionsMessage.projections, fog: { ...projectionsMessage.projections.fog, cells: [...projectionsMessage.projections.fog.cells.slice(0, -1), "not_a_real_state"] } };
    const invalid = workerProjectionsV2Schema.safeParse(corrupted);
    expect(invalid.success).toBe(false);

    const notAnArray = { ...projectionsMessage.projections, fog: { ...projectionsMessage.projections.fog, cells: "not-an-array" } };
    expect(workerProjectionsV2Schema.safeParse(notAnArray).success).toBe(false);
  });
});
