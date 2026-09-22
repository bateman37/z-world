import Link from "next/link";
import { loadGameAction } from "@/app/actions/games";
import { GameScreen } from "@/components/game-screen";

export const dynamic = "force-dynamic";

export default async function GamePage({ params }: { readonly params: { readonly gameSaveId: string } }) {
  try {
    const { state, revision } = await loadGameAction(params.gameSaveId);
    return <GameScreen gameSaveId={params.gameSaveId} initialState={state} initialRevision={revision} />;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo cargar la partida por un error desconocido.";
    return (
      <main style={{ maxWidth: 640, margin: "48px auto", padding: "0 16px" }}>
        <h1>No se pudo cargar la partida</h1>
        <p className="z-panel" style={{ padding: 12, borderColor: "var(--z-danger)" }}>
          {message}
        </p>
        <p className="z-muted">
          Esta partida no se regenera automáticamente por semilla: un snapshot corrupto o incompatible requiere
          revisión manual.
        </p>
        <Link href="/">Volver al inicio</Link>
      </main>
    );
  }
}
