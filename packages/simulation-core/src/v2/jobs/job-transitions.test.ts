import { describe, expect, it } from "vitest";
import type { Job } from "@z-world/contracts";
import { transitionJob } from "./job-transitions.js";
import { makeSyntheticBuildingState } from "../test-fixtures.js";

function baseJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "job-1",
    origin: "direct_order",
    causingCommandOrDesignationId: null,
    actionKey: "drink",
    methodVersion: 1,
    target: { kind: "own_need", personId: "p1", dimension: "hydration" },
    effectivePriority: "water_supply",
    location: { kind: "world_point", point: { x: 0, y: 0 } },
    urgency: 1,
    knowledgeUsed: [],
    phases: [{ kind: "execute", state: "pending" }],
    currentPhaseIndex: 0,
    assignments: [],
    requestedPersonIds: [],
    desiredTeamSize: 1,
    pace: "normal",
    attention: "standard",
    timeLimit: null,
    responsePolicy: "standard",
    state: "proposed",
    blockReasonKey: null,
    reservationIds: [],
    episodeIds: [],
    progressRatio: 0,
    workRemainingUnits: 1,
    workRateVariation: null,
    directOrder: true,
    disassemblyScope: null,
    irreversibleConfirmed: false,
    createdAtSimSeconds: 0,
    updatedAtSimSeconds: 0,
    ...overrides,
  };
}

describe("transitionJob (máquina de estados §6.2/§11.2)", () => {
  it("aplica una transición legal y emite job_state_changed", () => {
    const state = makeSyntheticBuildingState("job-transitions-1");
    const { job, events } = transitionJob(state, baseJob({ state: "proposed" }), "available", null);
    expect(job.state).toBe("available");
    expect(events).toEqual([expect.objectContaining({ type: "job_state_changed", fromState: "proposed", toState: "available" })]);
  });

  it("rechaza una transición ilegal sin cambiar el estado ni emitir eventos", () => {
    const state = makeSyntheticBuildingState("job-transitions-2");
    const { job, events } = transitionJob(state, baseJob({ state: "proposed" }), "completed", null);
    expect(job.state).toBe("proposed");
    expect(events).toEqual([]);
  });

  it("completed y cancelled son estados terminales sin transiciones salientes", () => {
    const state = makeSyntheticBuildingState("job-transitions-3");
    const { job: fromCompleted } = transitionJob(state, baseJob({ state: "completed" }), "in_progress", null);
    expect(fromCompleted.state).toBe("completed");
    const { job: fromCancelled } = transitionJob(state, baseJob({ state: "cancelled" }), "available", null);
    expect(fromCancelled.state).toBe("cancelled");
  });

  it("un bloqueo registra el motivo causal y una reactivación lo limpia", () => {
    const state = makeSyntheticBuildingState("job-transitions-4");
    const { job: blocked } = transitionJob(state, baseJob({ state: "in_progress" }), "blocked", "block.resource_exhausted");
    expect(blocked.blockReasonKey).toBe("block.resource_exhausted");
    const { job: revived } = transitionJob(state, blocked, "in_progress", null);
    expect(revived.blockReasonKey).toBeNull();
  });
});
