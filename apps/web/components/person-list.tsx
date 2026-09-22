"use client";

import type { PersonCardProjection } from "@z-world/contracts";

const OPERATIONAL_STATE_LABEL: Record<PersonCardProjection["operationalState"], string> = {
  awaiting_orders: "Esperando órdenes",
  accepting_order: "Aceptando orden",
  moving: "Desplazándose",
  arrival_completed: "Llegada completada",
  blocked: "Bloqueada",
  order_cancelled: "Orden cancelada",
};

export function PersonList({
  personCards,
  selectedPersonId,
  onSelect,
}: {
  readonly personCards: readonly PersonCardProjection[];
  readonly selectedPersonId: string | null;
  readonly onSelect: (personId: string) => void;
}) {
  return (
    <nav aria-label="Protagonistas" className="z-panel z-scroll" style={{ padding: 8, height: "100%" }}>
      <h2 style={{ fontSize: 14, margin: "4px 8px" }}>Protagonistas ({personCards.length})</h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {personCards.map((person) => (
          <li key={person.personId}>
            <button
              onClick={() => onSelect(person.personId)}
              aria-pressed={selectedPersonId === person.personId}
              style={{
                width: "100%",
                textAlign: "left",
                marginBottom: 4,
                borderColor: selectedPersonId === person.personId ? "var(--z-accent-strong)" : undefined,
              }}
            >
              <div>
                {person.firstName} {person.lastName}
              </div>
              <div className="z-muted" style={{ fontSize: 12 }}>
                {OPERATIONAL_STATE_LABEL[person.operationalState]}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
