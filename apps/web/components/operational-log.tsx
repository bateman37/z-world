"use client";

import type { OperationalLogEntryProjection } from "@z-world/contracts";
import { toSimulatedDayTime } from "@z-world/contracts";
import { copyKey } from "@z-world/catalogs";

export function OperationalLog({ entries }: { readonly entries: readonly OperationalLogEntryProjection[] }) {
  const ordered = [...entries].reverse();
  return (
    <section aria-label="Registro operacional" className="z-panel z-scroll" style={{ padding: 8, maxHeight: 160 }}>
      <h2 style={{ fontSize: 14, margin: "4px 8px" }}>Sucesos recientes</h2>
      {ordered.length === 0 ? (
        <p className="z-muted" style={{ margin: "0 8px" }}>
          Todavía no ha ocurrido nada.
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: "0 8px" }}>
          {ordered.map((entry) => {
            const t = toSimulatedDayTime(entry.simSeconds);
            return (
              <li key={entry.eventId} style={{ fontSize: 12, marginBottom: 2 }}>
                <span className="z-muted">
                  Día {t.day} {String(t.hour).padStart(2, "0")}:{String(t.minute).padStart(2, "0")}
                </span>{" "}
                — {copyKey(entry.messageKey)}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
