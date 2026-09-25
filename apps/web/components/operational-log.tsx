"use client";

import { useState } from "react";
import type { OperationalLogEntryProjection, OperationalLogLevel } from "@z-world/contracts";
import { toSimulatedDayTime } from "@z-world/contracts";
import { copyKey } from "@z-world/catalogs";

const LEVEL_LABEL: Record<OperationalLogLevel, string> = {
  log: "Registro",
  notice: "Aviso",
  important: "Importante",
  critical: "Crítico",
};

const LEVEL_COLOR_VAR: Record<OperationalLogLevel, string> = {
  log: "--z-text-muted",
  notice: "--z-warning",
  important: "--z-accent-strong",
  critical: "--z-danger",
};

const LEVEL_FILTERS: readonly OperationalLogLevel[] = ["log", "notice", "important", "critical"];

/**
 * Registro operativo (S11 §6): cada entrada distingue nivel de atención,
 * agrupa repeticiones con contador, y ofrece centrar la persona
 * involucrada cuando sigue siendo conocida/seleccionable. Nunca muestra
 * IDs, semillas ni trazas internas — solo lo que `messageKey`/`params`
 * ya traducen a lenguaje de juego.
 */
export function OperationalLog({
  entries,
  onCenterPerson,
}: {
  readonly entries: readonly OperationalLogEntryProjection[];
  readonly onCenterPerson?: (personId: string) => void;
}) {
  const [levelFilter, setLevelFilter] = useState<OperationalLogLevel | "all">("all");
  const ordered = [...entries].reverse().filter((e) => levelFilter === "all" || e.level === levelFilter);

  return (
    <section aria-label="Registro operacional" className="z-panel z-scroll" style={{ padding: 8, maxHeight: 220 }}>
      <h2 style={{ fontSize: 14, margin: "4px 8px" }}>Sucesos recientes</h2>
      <div role="group" aria-label="Filtrar por nivel de atención" style={{ display: "flex", gap: 4, margin: "0 8px 6px", flexWrap: "wrap" }}>
        <button onClick={() => setLevelFilter("all")} aria-pressed={levelFilter === "all"} style={{ fontSize: 11, padding: "2px 6px" }}>
          Todos
        </button>
        {LEVEL_FILTERS.map((level) => (
          <button key={level} onClick={() => setLevelFilter(level)} aria-pressed={levelFilter === level} style={{ fontSize: 11, padding: "2px 6px" }}>
            {LEVEL_LABEL[level]}
          </button>
        ))}
      </div>
      {ordered.length === 0 ? (
        <p className="z-muted" style={{ margin: "0 8px" }}>
          Todavía no ha ocurrido nada.
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: "0 8px" }}>
          {ordered.map((entry) => {
            const t = toSimulatedDayTime(entry.simSeconds);
            const personId = entry.params.personId;
            return (
              <li key={entry.eventId} style={{ fontSize: 12, marginBottom: 4, display: "flex", alignItems: "baseline", gap: 6 }}>
                <span
                  aria-label={`Nivel: ${LEVEL_LABEL[entry.level]}`}
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: `var(${LEVEL_COLOR_VAR[entry.level]})`,
                    flexShrink: 0,
                  }}
                />
                <span>
                  <span className="z-muted">
                    Día {t.day} {String(t.hour).padStart(2, "0")}:{String(t.minute).padStart(2, "0")}
                  </span>{" "}
                  — {copyKey(entry.messageKey)}
                  {entry.count > 1 && <span className="z-muted"> (×{entry.count})</span>}
                  {personId && onCenterPerson && (
                    <button onClick={() => onCenterPerson(personId)} style={{ marginLeft: 6, fontSize: 11, padding: "0 4px" }}>
                      Centrar
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
