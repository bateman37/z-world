"use client";

import { useState } from "react";
import type { AttentionMode, JobTarget, PaceMode, PriorityValue, SimulationStateV2, WorldPoint } from "@z-world/contracts";
import { useSimulationWorkerV2, nextCommandIdV2 } from "@/lib/use-simulation-worker-v2";
import { TopBar } from "@/components/top-bar";
import { PersonList } from "@/components/person-list";
import { PersonSheetPanel } from "@/components/person-sheet-panel";
import { VillageMapCanvas } from "@/components/village-map-canvas";
import { OperationalLog } from "@/components/operational-log";
import { WorkPanel } from "@/components/work-panel";

/**
 * Laboratorio jugable del pueblo semántico V2 (S3 de WEB-002 §5.9):
 * sustituye al visor de solo lectura de S2. Reutiliza sin cambios los
 * mismos componentes de presentación que `GameScreen` de WEB-001
 * (`TopBar`, `PersonList`, `PersonSheetPanel`, `OperationalLog`) porque
 * las proyecciones que consumen (reloj, estado de guardado, tarjetas y
 * fichas de persona, registro operacional) son idénticas entre V1 y V2;
 * solo el mapa cambia (`VillageMapCanvas`), porque el mundo espacial V2
 * tiene lugares/edificios/estancias/aberturas que V1 no tenía.
 */
export function VillageScreen({
  gameSaveId,
  initialState,
  initialRevision,
}: {
  readonly gameSaveId: string;
  readonly initialState: SimulationStateV2;
  readonly initialRevision: number;
}) {
  const { projections, workerFatalError, sendCommand, requestManualSave } = useSimulationWorkerV2(
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
        <p>Cargando pueblo…</p>
      </main>
    );
  }

  const selectedSheet = selectedPersonId ? (projections.personSheets[selectedPersonId] ?? null) : null;

  function handleOrderMove(personId: string, destination: WorldPoint) {
    sendCommand({ commandId: nextCommandIdV2(), type: "order_direct_move", personId, destination });
  }

  function handleUpdatePriority(priorityId: string, value: PriorityValue) {
    if (!selectedPersonId) return;
    sendCommand({ commandId: nextCommandIdV2(), type: "update_priority", personId: selectedPersonId, priorityId, value });
  }

  function handleCancelOrder() {
    if (!selectedPersonId) return;
    sendCommand({ commandId: nextCommandIdV2(), type: "cancel_direct_order", personId: selectedPersonId });
  }

  const selectedCard = projections.personCards.find((c) => c.personId === selectedPersonId);
  const canCancel = selectedCard?.operationalState === "moving";

  function handleOrderContextualAction(params: {
    actionKey: string;
    target: JobTarget;
    teamPersonIds: readonly string[];
    pace?: PaceMode;
    attention?: AttentionMode;
    disassemblyScope?: "selective" | "destructive";
    confirmIrreversible?: boolean;
  }) {
    if (!selectedPersonId) return;
    sendCommand({
      commandId: nextCommandIdV2(),
      type: "order_contextual_action",
      personId: selectedPersonId,
      teamPersonIds: [...params.teamPersonIds],
      actionKey: params.actionKey,
      target: params.target,
      pace: params.pace,
      attention: params.attention,
      disassemblyScope: params.disassemblyScope,
      confirmIrreversible: params.confirmIrreversible,
    });
  }

  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", height: "100vh" }}>
      <TopBar
        clock={projections.clock}
        saveStatus={projections.saveStatus}
        seed={projections.gameSummary.seed}
        onSetSpeed={(speed) => sendCommand({ commandId: nextCommandIdV2(), type: "set_speed", speed })}
        onManualSave={requestManualSave}
      />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 320px 300px", minHeight: 0 }}>
        <PersonList
          personCards={projections.personCards}
          selectedPersonId={selectedPersonId}
          onSelect={(id) => {
            setSelectedPersonId(id);
            setCenterRequestId((n) => n + 1);
          }}
        />
        <VillageMapCanvas
          mapEntities={projections.mapEntities}
          fog={projections.fog}
          movements={projections.movements}
          personCards={projections.personCards}
          selectedPersonId={selectedPersonId}
          onSelectPerson={setSelectedPersonId}
          onOrderMove={handleOrderMove}
          centerOnPersonRequestId={centerRequestId}
        />
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          {canCancel && (
            <div style={{ padding: 8 }}>
              <button onClick={handleCancelOrder}>Cancelar orden de movimiento</button>
            </div>
          )}
          <PersonSheetPanel sheet={selectedSheet} onUpdatePriority={handleUpdatePriority} />
        </div>
        <WorkPanel
          projections={projections}
          selectedPersonId={selectedPersonId}
          onOrderContextualAction={handleOrderContextualAction}
          onPauseJob={(jobId) => sendCommand({ commandId: nextCommandIdV2(), type: "pause_job", jobId })}
          onResumeJob={(jobId) => sendCommand({ commandId: nextCommandIdV2(), type: "resume_job", jobId })}
          onCancelJob={(jobId) => sendCommand({ commandId: nextCommandIdV2(), type: "cancel_job", jobId })}
          onDrawZone={(polygon, policy) => sendCommand({ commandId: nextCommandIdV2(), type: "draw_zone", zoneId: nextCommandIdV2(), polygon: [...polygon], policy })}
          onDeleteZone={(zoneId) => sendCommand({ commandId: nextCommandIdV2(), type: "delete_zone", zoneId })}
          onCreateAreaDesignation={(polygon) =>
            sendCommand({ commandId: nextCommandIdV2(), type: "create_area_designation", designationId: nextCommandIdV2(), kind: "systematic_recon", polygon: [...polygon] })
          }
          onCancelDesignation={(designationId) => sendCommand({ commandId: nextCommandIdV2(), type: "cancel_designation", designationId })}
        />
      </div>
      <OperationalLog entries={projections.operationalLog} />
    </div>
  );
}
