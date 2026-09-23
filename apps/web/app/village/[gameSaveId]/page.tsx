import Link from "next/link";
import { loadGameV2Action } from "@/app/actions/games";
import { VillageScreen } from "@/components/village-screen";

export const dynamic = "force-dynamic";

/**
 * Visor del pueblo semántico V2 (S2 de WEB-002 §9.1 del encargo): consume
 * directamente `SimulationStateV2` generado por el generador real y
 * persistido con `createGameV2Action`. Deliberadamente de solo lectura por
 * ahora: el motor de resolución de acciones, el planificador y las
 * necesidades jugables llegan en subhitos posteriores (S4 en adelante);
 * este visor demuestra que la aplicación arranca sobre el nuevo estado y
 * que el mapa puede representarlo, no la interfaz completa de explotación.
 */
export default async function VillagePage({ params }: { readonly params: { readonly gameSaveId: string } }) {
  try {
    const { state, revision } = await loadGameV2Action(params.gameSaveId);
    return <VillageScreen gameSaveId={params.gameSaveId} state={state} revision={revision} />;
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
