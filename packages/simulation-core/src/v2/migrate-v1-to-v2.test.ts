import { describe, expect, it } from "vitest";
import { parseSimulationStateV2, SIMULATION_STATE_V2_SCHEMA_VERSION } from "@z-world/contracts";
import { createInitialState } from "../create-initial-state.js";
import { migrateV1ToV2 } from "./migrate-v1-to-v2.js";
import { validateSimulationStateV2Invariants } from "./invariants.js";

describe("migrateV1ToV2", () => {
  it("produce un SimulationStateV2 válido según su esquema Zod", () => {
    const v1 = createInitialState("migration-seed-1");
    const { state } = migrateV1ToV2(v1);
    const parsed = parseSimulationStateV2(state);
    expect(parsed.success).toBe(true);
  });

  it("marca la versión de esquema V2", () => {
    const v1 = createInitialState("migration-seed-1");
    const { state } = migrateV1ToV2(v1);
    expect(state.schemaVersion).toBe(SIMULATION_STATE_V2_SCHEMA_VERSION);
  });

  it("preserva semilla, escenario, reloj, PRNG y orden de personas sin alterarlos", () => {
    const v1 = createInitialState("migration-seed-2");
    const { state } = migrateV1ToV2(v1);
    expect(state.seed).toBe(v1.seed);
    expect(state.scenario).toEqual(v1.scenario);
    expect(state.clock).toEqual(v1.clock);
    expect(state.prng).toEqual(v1.prng);
    expect(state.peopleOrder).toEqual(v1.peopleOrder);
  });

  it("preserva los hechos públicos y ocultos de cada persona sin modificarlos", () => {
    const v1 = createInitialState("migration-seed-3");
    const { state } = migrateV1ToV2(v1);
    for (const personId of v1.peopleOrder) {
      const v1Person = v1.people[personId];
      const v2Person = state.people[personId];
      expect(v2Person).toBeDefined();
      expect(v2Person?.public).toEqual(v1Person?.public);
      expect(v2Person?.hidden).toEqual(v1Person?.hidden);
    }
  });

  it("migra cada pertenencia a un WorldObject portado por su dueño", () => {
    const v1 = createInitialState("migration-seed-4");
    const { state } = migrateV1ToV2(v1);
    for (const personId of v1.peopleOrder) {
      const person = v1.people[personId];
      for (const possession of person?.public.possessions ?? []) {
        const object = state.worldObjects[possession.id];
        expect(object).toBeDefined();
        expect(object?.location).toEqual({ kind: "carried_by_person", personId });
      }
    }
  });

  it("crea un Place y un Building por cada estructura V1", () => {
    const v1 = createInitialState("migration-seed-5");
    const { state } = migrateV1ToV2(v1);
    for (const structure of v1.world.structures) {
      expect(state.world.buildings[structure.id]).toBeDefined();
      expect(state.world.buildings[structure.id]?.interiorGenerated).toBe(false);
      const placeId = state.world.buildings[structure.id]?.placeId;
      expect(placeId).toBeDefined();
      expect(state.world.places[placeId as string]).toBeDefined();
    }
  });

  it("registra al menos una degradación explícita por estructura y por la heurística de necesidades/pertenencias", () => {
    const v1 = createInitialState("migration-seed-6");
    const { state, degradations } = migrateV1ToV2(v1);
    expect(degradations.length).toBeGreaterThanOrEqual(v1.world.structures.length);
    expect(state.migration?.degradations).toEqual(degradations);
  });

  it("es determinista: la misma entrada V1 produce siempre la misma salida V2", () => {
    const v1 = createInitialState("migration-seed-7");
    const a = migrateV1ToV2(v1);
    const b = migrateV1ToV2(v1);
    expect(a.state).toEqual(b.state);
  });

  it("no deja colecciones nuevas de WEB-002 en un estado inconsistente (vacías pero presentes)", () => {
    const v1 = createInitialState("migration-seed-8");
    const { state } = migrateV1ToV2(v1);
    expect(state.jobs).toEqual({});
    expect(state.designations).toEqual({});
    expect(state.workZones).toEqual({});
    expect(state.reservations).toEqual({});
  });

  it("satisface el validador de invariantes relacionales tras migrar", () => {
    const v1 = createInitialState("migration-seed-9");
    const { state } = migrateV1ToV2(v1);
    const report = validateSimulationStateV2Invariants(state);
    expect(report.ok).toBe(true);
    expect(report.violations).toEqual([]);
  });

  it("satisface el validador de invariantes en 20 semillas distintas", () => {
    for (let i = 0; i < 20; i++) {
      const v1 = createInitialState(`migration-robustness-${i}`);
      const { state } = migrateV1ToV2(v1);
      const report = validateSimulationStateV2Invariants(state);
      expect(report.ok).toBe(true);
    }
  });
});
