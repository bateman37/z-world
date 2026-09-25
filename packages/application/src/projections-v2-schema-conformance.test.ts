import { describe, expect, it } from "vitest";
import { createInitialStateV2 } from "@z-world/simulation-core";
import {
  WORKER_PROTOCOL_VERSION_V2,
  parseFromWorkerMessageV2,
  structuralProjectionsV2Schema,
  tickProjectionsV2Schema,
  type FromWorkerMessageV2,
} from "@z-world/contracts";
import { WorkerSessionV2 } from "./worker-session-v2.js";

/**
 * Conformidad de los esquemas Zod reales del protocolo V3 (S11 §5.1/§5.2)
 * contra proyecciones que produce el propio `WorkerSessionV2` real — no un
 * objeto de prueba escrito a mano que pueda derivar en silencio del tipo
 * TypeScript. Cubre carga, avance de reloj, movimiento y cambios de
 * prioridad/velocidad, en ambos canales (`structural_projections` y
 * `tick_projections`); también que un payload corrupto se rechaza con
 * error tipado en vez de colarse como proyección válida.
 */
function structuralMessagesOf(messages: readonly FromWorkerMessageV2[]): readonly Extract<FromWorkerMessageV2, { type: "structural_projections" }>[] {
  return messages.filter((m): m is Extract<FromWorkerMessageV2, { type: "structural_projections" }> => m.type === "structural_projections");
}

function tickMessagesOf(messages: readonly FromWorkerMessageV2[]): readonly Extract<FromWorkerMessageV2, { type: "tick_projections" }>[] {
  return messages.filter((m): m is Extract<FromWorkerMessageV2, { type: "tick_projections" }> => m.type === "tick_projections");
}

describe("esquemas de proyección V3 — conformidad con mensajes reales", () => {
  it("valida structural_projections y tick_projections de la carga inicial, sin datos ocultos", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("schema-conformance-seed-1");
    const messages = session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-schema-1", revision: 0, state });

    for (const message of structuralMessagesOf(messages)) {
      const result = structuralProjectionsV2Schema.safeParse(message.structural);
      expect(result.success, result.success ? undefined : JSON.stringify(result.error.issues.slice(0, 5))).toBe(true);
      expect(JSON.stringify(message.structural)).not.toContain("caliberTier");
    }
    for (const message of tickMessagesOf(messages)) {
      const result = tickProjectionsV2Schema.safeParse(message.tick);
      expect(result.success, result.success ? undefined : JSON.stringify(result.error.issues.slice(0, 5))).toBe(true);
      expect(JSON.stringify(message.tick)).not.toContain("caliberTier");
    }
    expect(structuralMessagesOf(messages).length).toBeGreaterThan(0);
    expect(tickMessagesOf(messages).length).toBeGreaterThan(0);
  });

  it("valida ambos canales tras avanzar el reloj, mover a una persona y cambiar prioridad/velocidad", () => {
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

    const structuralMessages = structuralMessagesOf(allMessages);
    const tickMessages = tickMessagesOf(allMessages);
    expect(tickMessages.length).toBeGreaterThan(0);
    for (const message of structuralMessages) {
      expect(structuralProjectionsV2Schema.safeParse(message.structural).success).toBe(true);
      expect(parseFromWorkerMessageV2(message).success).toBe(true);
    }
    for (const message of tickMessages) {
      const result = tickProjectionsV2Schema.safeParse(message.tick);
      expect(result.success, result.success ? undefined : JSON.stringify(result.error.issues.slice(0, 5))).toBe(true);
      expect(parseFromWorkerMessageV2(message).success).toBe(true);
    }
  });

  it("rechaza con error tipado un payload que no cumple el esquema, en vez de colarlo como proyección válida", () => {
    const bogus = { type: "structural_projections", protocolVersion: WORKER_PROTOCOL_VERSION_V2, sequence: 1, structural: { gameSummary: { gameSaveId: "x" } } };
    const result = parseFromWorkerMessageV2(bogus);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("rechaza un tick_projections cuya structuralSequence falta o no es numérica", () => {
    const bogus = { type: "tick_projections", protocolVersion: WORKER_PROTOCOL_VERSION_V2, sequence: 2, tick: {} };
    expect(parseFromWorkerMessageV2(bogus).success).toBe(false);
  });

  it("rechaza una `fog.cells` corrupta (validador rápido de S11 §9.2), sin dejar de ser una validación real", () => {
    const session = new WorkerSessionV2();
    const state = createInitialStateV2("schema-conformance-seed-fog");
    const messages = session.handleMessage({ type: "load_state", protocolVersion: WORKER_PROTOCOL_VERSION_V2, gameSaveId: "game-schema-fog", revision: 0, state });
    const structural = structuralMessagesOf(messages)[0]!.structural;

    const valid = structuralProjectionsV2Schema.safeParse(structural);
    expect(valid.success).toBe(true);

    const corrupted = { ...structural, fog: { ...structural.fog, cells: [...structural.fog.cells.slice(0, -1), "not_a_real_state"] } };
    const invalid = structuralProjectionsV2Schema.safeParse(corrupted);
    expect(invalid.success).toBe(false);

    const notAnArray = { ...structural, fog: { ...structural.fog, cells: "not-an-array" } };
    expect(structuralProjectionsV2Schema.safeParse(notAnArray).success).toBe(false);
  });
});
