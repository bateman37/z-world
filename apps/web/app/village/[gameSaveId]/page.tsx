import Link from "next/link";
import { loadGameV2Action } from "@/app/actions/games";
import { VillageScreen } from "@/components/village-screen";

export const dynamic = "force-dynamic";

/**
 * Runtime jugable del pueblo semántico V2 (S3 de WEB-002 §5.9): consume
 * `SimulationStateV2` generado por S2 y lo ejecuta con un Worker propio
 * (`WorkerSessionV2`), no un visor estático. Reloj, movimiento, navegación,
 * niebla y descubrimiento progresivo son reales sobre este pueblo; el motor
 * de resolución D/B, los trabajos, las necesidades causales y la
 * explotación de edificios siguen llegando en subhitos posteriores (S4 en
 * adelante).
 */
export default async function VillagePage({ params }: { readonly params: { readonly gameSaveId: string } }) {
  try {
    const { state, revision } = await loadGameV2Action(params.gameSaveId);
    return <VillageScreen gameSaveId={params.gameSaveId} initialState={state} initialRevision={revision} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar el pueblo por un error desconocido.";
    return (
      <main style={{ maxWidth: 640, margin: "48px auto", padding: "0 16px" }}>
        <h1>No se pudo cargar el pueblo</h1>
        <p className="z-panel" style={{ padding: 12, borderColor: "var(--z-danger)" }}>
          {message}
        </p>
        <Link href="/">Volver al inicio</Link>
      </main>
    );
  }
}
