"use client";

import Link from "next/link";
import type { SimulationStateV2 } from "@z-world/contracts";
import { VillageMapCanvas } from "./village-map-canvas";

const PROFILE_LABELS: Record<string, string> = {
  "RES-10": "Casa familiar mediana",
  "RES-17": "Cabaña",
  "COM-02": "Supermercado pequeño",
  "TAL-01": "Taller mecánico",
  "ENV-01": "Fuente de agua",
  "ENV-02": "Campo/parcela abierta",
  "ENV-03": "Bosque/matorral",
  "ENV-04": "Carretera/camino",
};

/**
 * Pantalla del pueblo semántico V2 (S2 de WEB-002): mapa de solo lectura
 * más un resumen del escenario generado (perfiles, protagonistas,
 * degradaciones si las hubo). No incluye todavía controles de juego: el
 * motor de resolución de acciones y el planificador llegan en subhitos
 * posteriores.
 */
export function VillageScreen({ gameSaveId, state, revision }: { readonly gameSaveId: string; readonly state: SimulationStateV2; readonly revision: number }) {
  const countByProfile = new Map<string, number>();
  for (const place of Object.values(state.world.places)) {
    countByProfile.set(place.profileId, (countByProfile.get(place.profileId) ?? 0) + 1);
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside className="z-panel" style={{ width: 320, padding: 16, overflowY: "auto", flexShrink: 0 }}>
        <Link href="/">← Volver al inicio</Link>
        <h1 style={{ fontSize: 18 }}>{state.scenario.title}</h1>
        <p className="z-muted">
          Semilla <code>{state.seed}</code> · generador <code>{state.world.generatorVersion}</code> · revisión {revision}
        </p>
        <p className="z-muted">
          Día {Math.floor(state.clock.elapsedSimSeconds / 86400) + 1}, {Math.floor((state.clock.elapsedSimSeconds % 86400) / 3600)}:
          {String(Math.floor((state.clock.elapsedSimSeconds % 3600) / 60)).padStart(2, "0")}
        </p>

        <h2 style={{ fontSize: 15 }}>Perfiles generados</h2>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          {Object.entries(PROFILE_LABELS).map(([id, label]) => (
            <li key={id}>
              {label} ({id}): {countByProfile.get(id) ?? 0}
            </li>
          ))}
        </ul>
        <p className="z-muted">Construcciones totales: {Object.keys(state.world.buildings).length}</p>

        <h2 style={{ fontSize: 15 }}>Protagonistas</h2>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          {state.peopleOrder.map((personId) => {
            const person = state.people[personId];
            if (!person) return null;
            return (
              <li key={personId}>
                {person.public.firstName} {person.public.lastName}
              </li>
            );
          })}
        </ul>

        <h2 style={{ fontSize: 15 }}>Garantías del escenario</h2>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li>Medios de transporte: {Object.keys(state.transportMeans).length}</li>
          <li>Parcelas de cultivo candidatas: {Object.keys(state.cultivationPlots).length}</li>
          <li>Fuentes de agua: {Object.values(state.world.nodes).filter((n) => n.kind === "water_source").length}</li>
        </ul>

        {state.generationDegradations.length > 0 && (
          <>
            <h2 style={{ fontSize: 15 }}>Degradaciones registradas</h2>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {state.generationDegradations.map((d, i) => (
                <li key={i} className="z-muted">
                  {d}
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="z-muted" style={{ marginTop: 16 }}>
          Visor de solo lectura (S2): el motor de resolución, el planificador de trabajos y las necesidades
          jugables llegan en subhitos posteriores de WEB-002.
        </p>
      </aside>
      <main style={{ flexGrow: 1 }}>
        <VillageMapCanvas state={state} />
      </main>
    </div>
  );
}
