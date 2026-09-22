"use client";

import { useState } from "react";
import type { PriorityValue, SimulationStateV1, WorldPoint } from "@z-world/contracts";
import { useSimulationWorker, nextCommandId } from "@/lib/use-simulation-worker";
import { TopBar } from "@/components/top-bar";
import { PersonList } from "@/components/person-list";
import { PersonSheetPanel } from "@/components/person-sheet-panel";
import { MapCanvas } from "@/components/map-canvas";
import { OperationalLog } from "@/components/operational-log";

export function GameScreen({
  gameSaveId,
  initialState,
  initialRevision,
}: {
  readonly gameSaveId: string;
  readonly initialState: SimulationStateV1;
  readonly initialRevision: number;
}) {
  const { projections, workerFatalError, sendCommand, requestManualSave } = useSimulationWorker(
    gameSaveId,
    initialState,
    initialRevision,
  );
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(initialState.peopleOrder[0] ?? null);
  const [centerRequestId, setCenterRequestId] = useState(0);

  if (workerFatalError) {
    return (
      <main style={{ maxWidth: 640, margin: "48px auto", padding: "0 16px" }}>
        <h1>Error del simulador</h1>
        <p className="z-panel" style={{ padding: 12, borderColor: "var(--z-danger)" }}>
          {workerFatalError}
        </p>
        <p className="z-muted">La partida se ha detenido para no dibujar un estado inválido.</p>
      </main>
    );
  }

  if (!projections) {
    return (
      <main style={{ padding: 24 }}>
        <p>Cargando simulación…</p>
      </main>
    );
  }

  const selectedSheet = selectedPersonId ? (projections.personSheets[selectedPersonId] ?? null) : null;

  function handleOrderMove(personId: string, destination: WorldPoint) {
    sendCommand({ commandId: nextCommandId(), type: "order_direct_move", personId, destination });
  }

  function handleUpdatePriority(priorityId: string, value: PriorityValue) {
    if (!selectedPersonId) return;
    sendCommand({ commandId: nextCommandId(), type: "update_priority", personId: selectedPersonId, priorityId, value });
  }

  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", height: "100vh" }}>
      <TopBar
        clock={projections.clock}
        saveStatus={projections.saveStatus}
        seed={projections.gameSummary.seed}
        onSetSpeed={(speed) => sendCommand({ commandId: nextCommandId(), type: "set_speed", speed })}
        onManualSave={requestManualSave}
      />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 320px", minHeight: 0 }}>
        <PersonList
          personCards={projections.personCards}
          selectedPersonId={selectedPersonId}
          onSelect={(id) => {
            setSelectedPersonId(id);
            setCenterRequestId((n) => n + 1);
          }}
        />
        <MapCanvas
          mapEntities={projections.mapEntities}
          fog={projections.fog}
          movements={projections.movements}
          personCards={projections.personCards}
          selectedPersonId={selectedPersonId}
          onSelectPerson={setSelectedPersonId}
          onOrderMove={handleOrderMove}
          centerOnPersonRequestId={centerRequestId}
        />
        <PersonSheetPanel sheet={selectedSheet} onUpdatePriority={handleUpdatePriority} />
      </div>
      <OperationalLog entries={projections.operationalLog} />
    </div>
  );
}
