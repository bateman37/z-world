"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { GameSaveSummary } from "@z-world/persistence";
import { createGameAction, createGameV2Action } from "@/app/actions/games";

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
            {initialGames.map((game) => (
              <li key={game.id} className="z-panel" style={{ padding: 12, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{game.name ?? game.seed}</strong>
                    <div className="z-muted">
                      Semilla: {game.seed} · Último uso: {new Date(game.lastUsedAt).toLocaleString("es-ES")}
                    </div>
                  </div>
                  <button onClick={() => router.push(game.schemaVersion >= 2 ? `/village/${game.id}` : `/game/${game.id}`)}>
                    Continuar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
