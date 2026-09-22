import { describe, expect, it } from "vitest";
import { createInitialState } from "./create-initial-state.js";
import { applyCommand } from "./apply-command.js";
import { advanceSimulation } from "./advance-simulation.js";

function firstPersonId(state: ReturnType<typeof createInitialState>) {
  return state.peopleOrder[0]!;
}

describe("órdenes de movimiento directo", () => {
  it("acepta una orden a un punto observable y transitable, y la persona avanza al reanudar el reloj", () => {
    const state0 = createInitialState("movement-seed");
    const personId = firstPersonId(state0);
    const person0 = state0.people[personId]!;
    const destination = { x: person0.public.position.x + 5, y: person0.public.position.y };

    const { state: state1, events } = applyCommand(state0, {
      commandId: "cmd-1",
      type: "order_direct_move",
      personId,
      destination,
    });

    expect(events.map((e) => e.type)).toEqual(["move_order_accepted", "movement_started"]);
    expect(state1.people[personId]!.public.operationalState).toBe("moving");
    expect(state1.people[personId]!.public.activeMovementOrder).not.toBeNull();

    const state2 = { ...state1, clock: { ...state1.clock, speed: 1 as const } };
    const { state: state3 } = advanceSimulation(state2, 60);
    const person3 = state3.people[personId]!;
    expect(person3.public.position.x).not.toBe(person0.public.position.x);
  });

  it("rechaza un destino fuera del mundo", () => {
    const state0 = createInitialState("movement-seed-2");
    const personId = firstPersonId(state0);
    const { events } = applyCommand(state0, {
      commandId: "cmd-2",
      type: "order_direct_move",
      personId,
      destination: { x: 99999, y: 99999 },
    });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: "move_order_rejected", code: "destination_outside_world" });
  });

  it("rechaza un destino oculto (no observable ni conocido)", () => {
    const state0 = createInitialState("movement-seed-3");
    const personId = firstPersonId(state0);
    const { bounds } = state0.world;
    const { events } = applyCommand(state0, {
      commandId: "cmd-3",
      type: "order_direct_move",
      personId,
      // Esquina opuesta a la llegada, lejos del radio de observación inicial.
      destination: { x: bounds.minX + 1, y: bounds.maxY - 1 },
    });
    expect(events[0]).toMatchObject({ type: "move_order_rejected", code: "destination_hidden" });
  });

  it("rechaza una segunda orden mientras la persona ya está en movimiento", () => {
    const state0 = createInitialState("movement-seed-4");
    const personId = firstPersonId(state0);
    const person0 = state0.people[personId]!;
    const destination = { x: person0.public.position.x + 5, y: person0.public.position.y };

    const { state: state1 } = applyCommand(state0, {
      commandId: "cmd-4a",
      type: "order_direct_move",
      personId,
      destination,
    });
    const { events } = applyCommand(state1, {
      commandId: "cmd-4b",
      type: "order_direct_move",
      personId,
      destination: { x: destination.x + 1, y: destination.y },
    });
    expect(events[0]).toMatchObject({ type: "move_order_rejected", code: "person_already_ordered" });
  });

  it("cancelar una orden limpia el estado de movimiento", () => {
    const state0 = createInitialState("movement-seed-5");
    const personId = firstPersonId(state0);
    const person0 = state0.people[personId]!;
    const destination = { x: person0.public.position.x + 5, y: person0.public.position.y };
    const { state: state1 } = applyCommand(state0, {
      commandId: "cmd-5a",
      type: "order_direct_move",
      personId,
      destination,
    });
    const { state: state2, events } = applyCommand(state1, {
      commandId: "cmd-5b",
      type: "cancel_direct_order",
      personId,
    });
    expect(events[0]!.type).toBe("movement_cancelled");
    expect(state2.people[personId]!.public.activeMovementOrder).toBeNull();
    expect(state2.people[personId]!.public.operationalState).toBe("order_cancelled");
  });

  it("la velocidad temporal cambia la duración real, no el resultado final", () => {
    const stateBase = createInitialState("movement-speed-seed");
    const personId = firstPersonId(stateBase);
    const person0 = stateBase.people[personId]!;
    const destination = { x: person0.public.position.x + 3, y: person0.public.position.y };
    const { state: ordered } = applyCommand(stateBase, {
      commandId: "cmd-6",
      type: "order_direct_move",
      personId,
      destination,
    });

    const at1x = advanceSimulation({ ...ordered, clock: { ...ordered.clock, speed: 1 } }, 100).state;
    const at10x = advanceSimulation({ ...ordered, clock: { ...ordered.clock, speed: 10 } }, 10).state;

    expect(at1x.people[personId]!.public.position).toEqual(at10x.people[personId]!.public.position);
  });

  it("guardar/cargar a mitad de ruta (serializar y deserializar) conserva posición, ruta y progreso", () => {
    const state0 = createInitialState("movement-persist-seed");
    const personId = firstPersonId(state0);
    const person0 = state0.people[personId]!;
    const destination = { x: person0.public.position.x + 8, y: person0.public.position.y };
    const { state: ordered } = applyCommand(state0, {
      commandId: "cmd-7",
      type: "order_direct_move",
      personId,
      destination,
    });
    const midway = advanceSimulation({ ...ordered, clock: { ...ordered.clock, speed: 1 } }, 1).state;

    const serialized = JSON.stringify(midway);
    const restored = JSON.parse(serialized) as typeof midway;

    expect(restored.people[personId]!.public.activeMovementOrder).toEqual(
      midway.people[personId]!.public.activeMovementOrder,
    );
    expect(restored.people[personId]!.public.position).toEqual(midway.people[personId]!.public.position);

    const continuedFromLive = advanceSimulation({ ...midway, clock: { ...midway.clock, speed: 1 } }, 30).state;
    const continuedFromRestored = advanceSimulation({ ...restored, clock: { ...restored.clock, speed: 1 } }, 30).state;
    expect(continuedFromRestored.people[personId]!.public.position).toEqual(
      continuedFromLive.people[personId]!.public.position,
    );
  });
});
