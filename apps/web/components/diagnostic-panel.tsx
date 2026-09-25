"use client";

import { useState } from "react";
import type { ClockProjection, GameSummaryProjection, SaveStatusProjection } from "@z-world/contracts";
import { WORKER_PROTOCOL_VERSION_V2, SIMULATION_STATE_V2_SCHEMA_VERSION } from "@z-world/contracts";

/**
 * Panel de diagnóstico técnico (S11 §6.5): versión de protocolo/estado,
 * revisión vigente, último guardado y estado de guardado — información
 * suficiente para diagnosticar un problema real, cerrado por defecto y
 * sin exponer nada del mundo oculto (nunca calibre, semillas internas de
 * episodio, ni márgenes).
 */
export function DiagnosticPanel({
  gameSummary,
  clock,
  saveStatus,
  revision,
}: {
  readonly gameSummary: GameSummaryProjection;
  readonly clock: ClockProjection;
  readonly saveStatus: SaveStatusProjection;
  readonly revision: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section aria-label="Diagnóstico técnico" className="z-panel" style={{ padding: 8, fontSize: 12 }}>
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} style={{ fontSize: 12 }}>
        {open ? "Ocultar diagnóstico" : "Diagnóstico técnico"}
      </button>
      {open && (
        <dl style={{ margin: "8px 0 0", display: "grid", gridTemplateColumns: "auto 1fr", gap: "2px 8px" }}>
          <dt className="z-muted">Protocolo Worker</dt>
          <dd>v{WORKER_PROTOCOL_VERSION_V2}</dd>
          <dt className="z-muted">Esquema de estado</dt>
          <dd>v{SIMULATION_STATE_V2_SCHEMA_VERSION}</dd>
          <dt className="z-muted">Partida</dt>
          <dd>{gameSummary.gameSaveId}</dd>
          <dt className="z-muted">Semilla</dt>
          <dd>{gameSummary.seed}</dd>
          <dt className="z-muted">Revisión vigente</dt>
          <dd>{revision}</dd>
          <dt className="z-muted">Estado de guardado</dt>
          <dd>{saveStatus.status}</dd>
          <dt className="z-muted">Último guardado (tiempo simulado)</dt>
          <dd>{saveStatus.lastSavedSimSeconds ?? "—"}</dd>
          <dt className="z-muted">Reloj</dt>
          <dd>
            Día {clock.day}, {String(clock.hour).padStart(2, "0")}:{String(clock.minute).padStart(2, "0")}, ×{clock.speed}
          </dd>
        </dl>
      )}
    </section>
  );
}
