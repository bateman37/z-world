"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { GameSaveSummary } from "@z-world/persistence";
import { createGameAction, createGameV2Action, migrateGameToV2Action, previewMigrationV1ToV2Action } from "@/app/actions/games";

function normalizeSeed(raw: string): string {
  return raw.trim().replace(/\s+/g, "-").slice(0, 64);
}

export function HomeScreen({
  initialGames,
  initialError,
}: {
  readonly initialGames: readonly GameSaveSummary[];
  readonly initialError: string | null;
}) {
  const router = useRouter();
  const [seedInput, setSeedInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(initialError);
  const [migrationPreview, setMigrationPreview] = useState<{ gameSaveId: string; degradations: readonly string[] } | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  const normalizedSeed = normalizeSeed(seedInput);

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createGameAction(normalizedSeed, nameInput.trim() || undefined);
        router.push(`/game/${result.gameSaveId}`);
      } catch (err) {
        setError(
          err instanceof Error
            ? `No se pudo crear la partida: ${err.message}`
            : "No se pudo crear la partida (error de configuración de PostgreSQL).",
        );
      }
    });
  }

  function handleCreateVillage() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createGameV2Action(normalizedSeed, nameInput.trim() || undefined);
        router.push(`/village/${result.gameSaveId}`);
      } catch (err) {
        setError(
          err instanceof Error
            ? `No se pudo generar el pueblo: ${err.message}`
            : "No se pudo generar el pueblo (error de configuración de PostgreSQL).",
        );
      }
    });
  }

  function handleStartMigration(gameSaveId: string) {
    setError(null);
    startTransition(async () => {
      try {
        const preview = await previewMigrationV1ToV2Action(gameSaveId);
        setMigrationPreview({ gameSaveId, degradations: preview.degradations });
      } catch (err) {
        setError(err instanceof Error ? `No se pudo preparar la migración: ${err.message}` : "No se pudo preparar la migración.");
      }
    });
  }

  function handleConfirmMigration() {
    if (!migrationPreview) return;
    const { gameSaveId } = migrationPreview;
    setError(null);
    setIsMigrating(true);
    startTransition(async () => {
      try {
        await migrateGameToV2Action(gameSaveId);
        setMigrationPreview(null);
        setIsMigrating(false);
        router.push(`/village/${gameSaveId}`);
      } catch (err) {
        setIsMigrating(false);
        setError(
          err instanceof Error
            ? `No se pudo migrar la partida (sigue abriendo como estaba): ${err.message}`
            : "No se pudo migrar la partida (sigue abriendo como estaba).",
        );
      }
    });
  }

  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: "0 16px" }}>
      <h1>Z-World — laboratorio de simulación</h1>
      <p className="z-muted">
        Primera entrega ejecutable de la línea web: fundación técnica, cohorte procedural y mapa local con
        movimiento directo.
      </p>

      {error && (
        <div className="z-panel" style={{ padding: 12, borderColor: "var(--z-danger)", marginBottom: 16 }}>
          {error}
        </div>
      )}

      <section className="z-panel" style={{ padding: 16, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Crear partida</h2>
        <label htmlFor="seed-input" style={{ display: "block", marginBottom: 4 }}>
          Semilla (opcional; se genera una si la dejas vacía)
        </label>
        <input
          id="seed-input"
          type="text"
          value={seedInput}
          onChange={(event) => setSeedInput(event.target.value)}
          placeholder="p. ej. web-001-acceptance"
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        {seedInput.trim().length > 0 && (
          <p className="z-muted" style={{ marginTop: 0 }}>
            Semilla normalizada: <code>{normalizedSeed}</code>
          </p>
        )}
        <label htmlFor="name-input" style={{ display: "block", marginBottom: 4 }}>
          Nombre de la partida (opcional)
        </label>
        <input
          id="name-input"
          type="text"
          value={nameInput}
          onChange={(event) => setNameInput(event.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />
        <button onClick={handleCreate} disabled={isPending}>
          {isPending ? "Creando…" : "Crear partida (fixture WEB-001)"}
        </button>
        <button onClick={handleCreateVillage} disabled={isPending} style={{ marginLeft: 8 }}>
          {isPending ? "Generando…" : "Generar pueblo (WEB-002 S2)"}
        </button>
        <p className="z-muted" style={{ marginTop: 8 }}>
          «Generar pueblo» usa el generador semántico determinista de WEB-002 S2 (pueblo procedural de ~3×3 km con
          lugares, edificios y escenario inicial reales) en lugar del fixture provisional de WEB-001.
        </p>
      </section>

      <section>
        <h2>Continuar partida</h2>
        {initialGames.length === 0 ? (
          <p className="z-muted">Todavía no hay partidas guardadas.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {initialGames.map((game) => {
              const isV1 = game.schemaVersion < 2;
              const previewingThis = migrationPreview?.gameSaveId === game.id;
              return (
                <li key={game.id} className="z-panel" style={{ padding: 12, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong>{game.name ?? game.seed}</strong>{" "}
                      {isV1 && (
                        <span className="z-badge" style={{ borderColor: "var(--z-warning)" }}>
                          V1 — WEB-001
                        </span>
                      )}
                      <div className="z-muted">
                        Semilla: {game.seed} · Último uso: {new Date(game.lastUsedAt).toLocaleString("es-ES")}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {isV1 && (
                        <button onClick={() => handleStartMigration(game.id)} disabled={isPending}>
                          Migrar a WEB-002
                        </button>
                      )}
                      <button onClick={() => router.push(isV1 ? `/game/${game.id}` : `/village/${game.id}`)}>
                        Continuar
                      </button>
                    </div>
                  </div>
                  {previewingThis && migrationPreview && (
                    <div className="z-panel" style={{ marginTop: 12, padding: 12, borderColor: "var(--z-accent)" }}>
                      <h3 style={{ marginTop: 0 }}>Migrar «{game.name ?? game.seed}» a WEB-002</h3>
                      <p>
                        Se conservan: identificador de partida, semilla, reloj (pausa y velocidad), las seis
                        personas con sus biografías, capacidades, prioridades, relaciones y datos ocultos, sus
                        posiciones y pertenencias. La partida V1 original queda intacta como respaldo; si algo
                        falla aquí, la partida sigue abriendo tal cual estaba.
                      </p>
                      {migrationPreview.degradations.length > 0 && (
                        <>
                          <p className="z-muted" style={{ marginBottom: 4 }}>
                            Degradaciones conocidas de esta migración:
                          </p>
                          <ul style={{ marginTop: 0 }}>
                            {migrationPreview.degradations.map((degradation, i) => (
                              <li key={i} className="z-muted">
                                {degradation}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button onClick={handleConfirmMigration} disabled={isMigrating}>
                          {isMigrating ? "Migrando…" : "Confirmar migración"}
                        </button>
                        <button onClick={() => setMigrationPreview(null)} disabled={isMigrating}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
