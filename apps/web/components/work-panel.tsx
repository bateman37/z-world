"use client";

import { useState } from "react";
import type { AttentionMode, JobTarget, PaceMode, WorkerProjectionsV2 } from "@z-world/contracts";
import { copyKey } from "@z-world/catalogs";

/**
 * Panel funcional de trabajos/necesidades/zonas/designaciones (S4-S6 de
 * WEB-002, subhitos). Sin pasada artística (§9 del prompt de subhitos):
 * controles mínimos para probar el motor de resolución, el planificador y
 * las necesidades causales con claridad, reutilizando el Canvas y la
 * interfaz funcional existentes de S1-S3.
 */
export function WorkPanel({
  projections,
  selectedPersonId,
  onOrderContextualAction,
  onPauseJob,
  onResumeJob,
  onCancelJob,
  onDrawZone,
  onDeleteZone,
  onCreateAreaDesignation,
  onCancelDesignation,
}: {
  readonly projections: WorkerProjectionsV2;
  readonly selectedPersonId: string | null;
  readonly onOrderContextualAction: (params: { actionKey: string; target: JobTarget; teamPersonIds: readonly string[]; pace?: PaceMode; attention?: AttentionMode }) => void;
  readonly onPauseJob: (jobId: string) => void;
  readonly onResumeJob: (jobId: string) => void;
  readonly onCancelJob: (jobId: string) => void;
  readonly onDrawZone: (polygon: readonly { x: number; y: number }[], policy: "habitual" | "precaution" | "forbidden") => void;
  readonly onDeleteZone: (zoneId: string) => void;
  readonly onCreateAreaDesignation: (polygon: readonly { x: number; y: number }[]) => void;
  readonly onCancelDesignation: (designationId: string) => void;
}) {
  const [actionKey, setActionKey] = useState<string>("");
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [zoneBounds, setZoneBounds] = useState({ minX: "-20", minY: "-20", maxX: "20", maxY: "20" });
  const [zonePolicy, setZonePolicy] = useState<"habitual" | "precaution" | "forbidden">("habitual");

  const needs = selectedPersonId ? (projections.needsByPerson[selectedPersonId] ?? []) : [];
  const selectedOption = projections.contextualActions.find((o) => o.actionKey === actionKey) ?? projections.contextualActions[0];
  const targets = selectedOption?.targets ?? [];

  function handleOrder() {
    if (!selectedPersonId || !selectedOption) return;
    const target = targets[targetIndex]?.target;
    if (!target) return;
    onOrderContextualAction({ actionKey: selectedOption.actionKey, target, teamPersonIds: [] });
  }

  function handleCreateZone() {
    const minX = Number(zoneBounds.minX);
    const minY = Number(zoneBounds.minY);
    const maxX = Number(zoneBounds.maxX);
    const maxY = Number(zoneBounds.maxY);
    if ([minX, minY, maxX, maxY].some((n) => Number.isNaN(n))) return;
    onDrawZone(
      [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY },
      ],
      zonePolicy,
    );
  }

  function handleCreateDesignation() {
    const minX = Number(zoneBounds.minX);
    const minY = Number(zoneBounds.minY);
    const maxX = Number(zoneBounds.maxX);
    const maxY = Number(zoneBounds.maxY);
    if ([minX, minY, maxX, maxY].some((n) => Number.isNaN(n))) return;
    onCreateAreaDesignation([
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ]);
  }

  return (
    <aside className="z-panel z-scroll" style={{ padding: 12, height: "100%", display: "flex", flexDirection: "column", gap: 16 }} aria-label="Trabajos y necesidades">
      <section>
        <h3 style={{ marginTop: 0 }}>Necesidades</h3>
        {selectedPersonId ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {needs.map((n) => (
              <li key={n.dimension}>
                {copyKey(`need.${n.dimension}`)}: <strong>{copyKey(`need.band.${n.band}`)}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="z-muted">Selecciona una persona.</p>
        )}
      </section>

      <section>
        <h3>Acción contextual</h3>
        {projections.contextualActions.length === 0 ? (
          <p className="z-muted">No hay ninguna acción disponible con lo que se conoce ahora mismo.</p>
        ) : (
          <>
            <label style={{ display: "block" }}>
              Acción:{" "}
              <select
                value={selectedOption?.actionKey ?? ""}
                onChange={(e) => {
                  setActionKey(e.target.value);
                  setTargetIndex(0);
                }}
              >
                {projections.contextualActions.map((o) => (
                  <option key={o.actionKey} value={o.actionKey}>
                    {copyKey(o.labelKey)}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "block", marginTop: 4 }}>
              Objetivo:{" "}
              <select value={targetIndex} onChange={(e) => setTargetIndex(Number(e.target.value))}>
                {targets.map((t, i) => (
                  <option key={i} value={i} disabled={t.blockedReasonKey !== null}>
                    {copyKey(t.labelKey)}
                    {t.blockedReasonKey ? ` — ${copyKey(t.blockedReasonKey)}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <button style={{ marginTop: 8 }} disabled={!selectedPersonId || targets.length === 0} onClick={handleOrder}>
              Ordenar
            </button>
          </>
        )}
      </section>

      <section>
        <h3>Trabajos</h3>
        {projections.jobs.length === 0 ? (
          <p className="z-muted">Sin trabajos activos.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {projections.jobs.map((job) => (
              <li key={job.id} className="z-panel" style={{ padding: 6 }}>
                <div>
                  <strong>{copyKey(job.labelKey)}</strong> — {job.state}
                  {job.phaseKind ? ` (${job.phaseKind})` : ""}
                </div>
                <div className="z-muted">Progreso: {Math.round(job.progressRatio * 100)}%</div>
                {job.blockReasonKey && <div style={{ color: "var(--z-danger)" }}>{copyKey(job.blockReasonKey)}</div>}
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {job.state === "in_progress" && <button onClick={() => onPauseJob(job.id)}>Pausar</button>}
                  {job.state === "paused" && <button onClick={() => onResumeJob(job.id)}>Reanudar</button>}
                  {job.state !== "completed" && job.state !== "cancelled" && job.state !== "causal_failure" && <button onClick={() => onCancelJob(job.id)}>Cancelar</button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Zonas y designaciones</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <label>
            minX <input value={zoneBounds.minX} onChange={(e) => setZoneBounds({ ...zoneBounds, minX: e.target.value })} style={{ width: 56 }} />
          </label>
          <label>
            minY <input value={zoneBounds.minY} onChange={(e) => setZoneBounds({ ...zoneBounds, minY: e.target.value })} style={{ width: 56 }} />
          </label>
          <label>
            maxX <input value={zoneBounds.maxX} onChange={(e) => setZoneBounds({ ...zoneBounds, maxX: e.target.value })} style={{ width: 56 }} />
          </label>
          <label>
            maxY <input value={zoneBounds.maxY} onChange={(e) => setZoneBounds({ ...zoneBounds, maxY: e.target.value })} style={{ width: 56 }} />
          </label>
        </div>
        <label style={{ display: "block", marginTop: 4 }}>
          Política:{" "}
          <select value={zonePolicy} onChange={(e) => setZonePolicy(e.target.value as "habitual" | "precaution" | "forbidden")}>
            <option value="habitual">Habitual</option>
            <option value="precaution">Precaución</option>
            <option value="forbidden">Prohibida</option>
          </select>
        </label>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          <button onClick={handleCreateZone}>Crear zona</button>
          <button onClick={handleCreateDesignation}>Designar reconocimiento por área</button>
        </div>
        <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
          {projections.zones.map((z) => (
            <li key={z.id}>
              Zona {z.policy} <button onClick={() => onDeleteZone(z.id)}>Borrar</button>
            </li>
          ))}
        </ul>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {projections.designations.map((d) => (
            <li key={d.id}>
              Designación {d.kind} ({d.generatedJobCount} trabajos){" "}
              {!d.cancelled && <button onClick={() => onCancelDesignation(d.id)}>Cancelar</button>}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
