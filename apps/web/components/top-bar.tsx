"use client";

import type { ClockProjection, GameSpeed, SaveStatusProjection } from "@z-world/contracts";

const SPEED_OPTIONS: readonly GameSpeed[] = [0, 1, 2, 4, 10];

const SAVE_STATUS_LABEL: Record<SaveStatusProjection["status"], string> = {
  saved: "Guardado",
  pending_changes: "Cambios sin guardar",
  saving: "Guardando…",
  save_error: "Error al guardar",
  revision_conflict: "Conflicto: la partida cambió en otra pestaña",
};

export function TopBar({
  clock,
  saveStatus,
  seed,
  onSetSpeed,
  onManualSave,
}: {
  readonly clock: ClockProjection;
  readonly saveStatus: SaveStatusProjection;
  readonly seed: string;
  readonly onSetSpeed: (speed: GameSpeed) => void;
  readonly onManualSave: () => void;
}) {
  return (
    <header
      className="z-panel"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "8px 16px",
        flexWrap: "wrap",
      }}
    >
      <strong>Z-World</strong>
      <span className="z-muted">Semilla: {seed}</span>
      <span>
        Día {clock.day} · {String(clock.hour).padStart(2, "0")}:{String(clock.minute).padStart(2, "0")}
      </span>
      <div role="group" aria-label="Velocidad de simulación" style={{ display: "flex", gap: 4 }}>
        {SPEED_OPTIONS.map((speed) => (
          <button
            key={speed}
            onClick={() => onSetSpeed(speed)}
            aria-pressed={clock.speed === speed}
            style={clock.speed === speed ? { borderColor: "var(--z-accent-strong)", fontWeight: 700 } : undefined}
          >
            {speed === 0 ? "Pausa" : `×${speed}`}
          </button>
        ))}
      </div>
      <span
        className="z-badge"
        style={{
          marginLeft: "auto",
          borderColor:
            saveStatus.status === "save_error" || saveStatus.status === "revision_conflict"
              ? "var(--z-danger)"
              : saveStatus.status === "saving"
                ? "var(--z-warning)"
                : "var(--z-accent)",
        }}
      >
        {SAVE_STATUS_LABEL[saveStatus.status]}
      </span>
      <button onClick={onManualSave}>Guardar</button>
    </header>
  );
}
