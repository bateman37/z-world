"use client";

import { useState } from "react";
import type { AttentionMode, DomainEventV2, JobTarget, PaceMode, PriorityValue, SimulationStateV2, StorageItemRef, WorldPoint } from "@z-world/contracts";
import { useSimulationWorkerV2, nextCommandIdV2 } from "@/lib/use-simulation-worker-v2";
import { TopBar } from "@/components/top-bar";
import { PersonList } from "@/components/person-list";
import { PersonSheetPanel } from "@/components/person-sheet-panel";
import { VillageMapCanvas } from "@/components/village-map-canvas";
import { OperationalLog } from "@/components/operational-log";
import { DiagnosticPanel } from "@/components/diagnostic-panel";
import { WorkPanel, type TransportOrderParams } from "@/components/work-panel";
import { ContextualSheet } from "@/components/contextual-sheet";
import type { SelectionTarget } from "@/lib/selection";

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
  initialRecentEvents,
}: {
  readonly gameSaveId: string;
  readonly initialState: SimulationStateV2;
  readonly initialRevision: number;
  readonly initialRecentEvents?: readonly DomainEventV2[];
}) {
  const { projections, workerFatalError, sendCommand, requestManualSave, retrySave } = useSimulationWorkerV2(
    gameSaveId,
    initialState,
    initialRevision,
    initialRecentEvents,
  );
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(initialState.peopleOrder[0] ?? null);
  const [selectedTarget, setSelectedTarget] = useState<SelectionTarget | null>(null);
  const [centerRequestId, setCenterRequestId] = useState(0);

  function handleSelectTarget(next: SelectionTarget | null) {
    setSelectedTarget(next);
    // Seleccionar una persona en el Canvas también la convierte en la
    // persona actuante (misma persona que en la lista lateral); seleccionar
    // cualquier otra clase de entidad no toca a la persona actuante, para
    // poder elegir blanco y actor por separado (§7.3).
    if (next?.kind === "person") setSelectedPersonId(next.id);
  }

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
    storageItem?: StorageItemRef;
    storageQuantity?: number;
    transport?: TransportOrderParams;
    cropId?: string;
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
      storageItem: params.storageItem,
      storageQuantity: params.storageQuantity,
      transportMethod: params.transport?.method,
      transportMeansId: params.transport?.meansId,
      transportDestination: params.transport?.destination,
      transportCargo: params.transport?.extraCargo ? [...params.transport.extraCargo] : undefined,
      meansDisposition: params.transport?.meansDisposition,
      cropId: params.cropId,
    });
  }

  const isRevisionConflict = projections.saveStatus.status === "revision_conflict";

  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", height: "100vh", position: "relative" }}>
      <TopBar
        clock={projections.clock}
        saveStatus={projections.saveStatus}
        seed={projections.gameSummary.seed}
        onSetSpeed={(speed) => sendCommand({ commandId: nextCommandIdV2(), type: "set_speed", speed })}
        onManualSave={requestManualSave}
        onRetrySave={retrySave}
      />
      {isRevisionConflict ? (
        <div
          role="alertdialog"
          aria-labelledby="revision-conflict-title"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "color-mix(in srgb, var(--z-bg) 70%, transparent)",
          }}
        >
          <div className="z-panel" style={{ padding: 24, maxWidth: 420, borderColor: "var(--z-danger)" }}>
            <h2 id="revision-conflict-title">Conflicto de guardado</h2>
            <p>
              Esta partida se guardó desde otra pestaña o sesión mientras jugabas aquí. Para no perder ni sobrescribir
              nada, la sesión se detuvo: ningún cambio nuevo se aplica hasta que decidas cómo continuar.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => window.location.reload()} autoFocus>
                Recargar estado vigente
              </button>
              <a
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "var(--z-panel)",
                  border: "1px solid var(--z-panel-border)",
                  color: "var(--z-text)",
                  borderRadius: 4,
                  padding: "6px 10px",
                  textDecoration: "none",
                }}
              >
                Salir a la lista de partidas
              </a>
            </div>
          </div>
        </div>
      ) : null}
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
          selectedTarget={selectedTarget}
          onSelectTarget={handleSelectTarget}
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
          {selectedTarget && selectedTarget.kind !== "person" && (
            <ContextualSheet
              target={selectedTarget}
              projections={projections}
              selectedPersonId={selectedPersonId}
              onOrderContextualAction={handleOrderContextualAction}
              onClose={() => setSelectedTarget(null)}
            />
          )}
        </div>
        <WorkPanel
          projections={projections}
          selectedPersonId={selectedPersonId}
          onOrderContextualAction={handleOrderContextualAction}
          onPauseJob={(jobId) => sendCommand({ commandId: nextCommandIdV2(), type: "pause_job", jobId })}
          onResumeJob={(jobId) => sendCommand({ commandId: nextCommandIdV2(), type: "resume_job", jobId })}
          onCancelJob={(jobId) => sendCommand({ commandId: nextCommandIdV2(), type: "cancel_job", jobId })}
          onReassignJob={(jobId, addPersonId, removePersonId) =>
            sendCommand({ commandId: nextCommandIdV2(), type: "reassign_job", jobId, addPersonId, removePersonId })
          }
          onSetJobModes={(jobId, pace, attention) => sendCommand({ commandId: nextCommandIdV2(), type: "set_job_modes", jobId, pace, attention })}
          onDrawZone={(polygon, policy) => sendCommand({ commandId: nextCommandIdV2(), type: "draw_zone", zoneId: nextCommandIdV2(), polygon: [...polygon], policy })}
          onDeleteZone={(zoneId) => sendCommand({ commandId: nextCommandIdV2(), type: "delete_zone", zoneId })}
          onCreateAreaDesignation={(polygon, kind, wayCrossingMode) =>
            sendCommand({ commandId: nextCommandIdV2(), type: "create_area_designation", designationId: nextCommandIdV2(), kind, polygon: [...polygon], wayCrossingMode })
          }
          onCancelDesignation={(designationId) => sendCommand({ commandId: nextCommandIdV2(), type: "cancel_designation", designationId })}
        />
      </div>
      <OperationalLog
        entries={projections.operationalLog}
        onCenterPerson={(personId) => {
          setSelectedPersonId(personId);
          setCenterRequestId((n) => n + 1);
        }}
      />
      <DiagnosticPanel gameSummary={projections.gameSummary} clock={projections.clock} saveStatus={projections.saveStatus} revision={projections.revision} />
    </div>
  );
}
