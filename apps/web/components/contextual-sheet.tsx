"use client";

import { useState } from "react";
import type { AttentionMode, JobTarget, PaceMode, StorageItemRef, WorkerProjectionsV2 } from "@z-world/contracts";
import { copyKey } from "@z-world/catalogs";
import type { TransportOrderParams } from "@/components/work-panel";
import type { SelectionTarget } from "@/lib/selection";
import { selectionMatchesJobTarget } from "@/lib/selection";

/**
 * Ficha contextual común de selección universal del Canvas (S11 §7.3):
 * un único patrón extensible para persona/lugar/edificio/estancia/
 * abertura/parcela de cultivo/tramo de barrera, en vez de un componente
 * separado por clase de entidad. Muestra solo lo conocido (§8.1) y solo
 * las acciones contextuales cuyo blanco real coincide con la selección
 * (reutilizando `projections.contextualActions`, que ya viene filtrada
 * por conocimiento/viabilidad desde el Worker — nunca se decide aquí qué
 * es "posible", solo se reordena/filtra por blanco). Las órdenes que
 * necesitan parámetros adicionales (traslado, elemento almacenado,
 * cultivo a sembrar) remiten al panel de trabajo existente en vez de
 * duplicar esos controles.
 */
export function ContextualSheet({
  target,
  projections,
  selectedPersonId,
  onOrderContextualAction,
  onClose,
}: {
  readonly target: SelectionTarget;
  readonly projections: WorkerProjectionsV2;
  readonly selectedPersonId: string | null;
  readonly onOrderContextualAction: (params: {
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
  }) => void;
  readonly onClose: () => void;
}) {
  const [confirmedActionKey, setConfirmedActionKey] = useState<string | null>(null);

  // La ficha de persona ya existe (`PersonSheetPanel`) y muestra bastante
  // más de lo que cabría aquí sin duplicar estado: seleccionar una persona
  // en el mapa no abre una ficha contextual propia.
  if (target.kind === "person") return null;

  const header = headerFor(target, projections);

  if (!header) {
    return (
      <aside className="z-panel" style={{ padding: 12 }} aria-label="Ficha de selección">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <strong>Selección ya no disponible</strong>
          <button onClick={onClose} aria-label="Cerrar ficha">
            ×
          </button>
        </div>
        <p className="z-muted" style={{ fontSize: 12 }}>
          Esta entidad ya no está a la vista o dejó de conocerse desde que se seleccionó.
        </p>
      </aside>
    );
  }

  const matches = projections.contextualActions.flatMap((option) =>
    option.targets.filter((t) => selectionMatchesJobTarget(target, t.target)).map((targetEntry) => ({ option, targetEntry })),
  );

  return (
    <aside
      className="z-panel z-scroll"
      style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8, minHeight: 0, overflow: "auto" }}
      aria-label="Ficha de selección"
      data-selection-kind={target.kind}
      data-selection-id={target.id}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <strong>{header.title}</strong>
          {header.lines.map((line, i) => (
            <div key={i} className="z-muted" style={{ fontSize: 12 }}>
              {line}
            </div>
          ))}
        </div>
        <button onClick={onClose} aria-label="Cerrar ficha">
          ×
        </button>
      </div>
      <div>
        <h4 style={{ margin: "4px 0" }}>Acciones disponibles</h4>
        {matches.length === 0 ? (
          <p className="z-muted" style={{ fontSize: 12 }}>
            Nada disponible aquí con lo que se conoce ahora mismo.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {matches.map(({ option, targetEntry }, i) => {
              const isIrreversible = option.irreversible === true || option.actionKey === "disassemble_selective" || option.actionKey === "disassemble_destructive";
              const needsExtraParams = Boolean(targetEntry.storageItem) || Boolean(option.transport) || option.actionKey === "sow";
              const confirmed = confirmedActionKey === option.actionKey;
              return (
                <li key={i} className="z-panel" style={{ padding: 6 }} data-action-key={option.actionKey}>
                  <div>
                    <strong>{copyKey(option.labelKey)}</strong>
                  </div>
                  {targetEntry.detailKeys && targetEntry.detailKeys.length > 0 && (
                    <div className="z-muted" style={{ fontSize: 12 }}>
                      {targetEntry.detailKeys.map((k) => copyKey(k)).join(" · ")}
                    </div>
                  )}
                  {targetEntry.blockedReasonKey ? (
                    <div style={{ color: "var(--z-danger)", fontSize: 12 }}>{copyKey(targetEntry.blockedReasonKey)}</div>
                  ) : needsExtraParams ? (
                    <div className="z-muted" style={{ fontSize: 12 }}>
                      Necesita elegir más opciones (traslado, elemento o cultivo concreto): usa el panel de trabajo.
                    </div>
                  ) : !selectedPersonId ? (
                    <div className="z-muted" style={{ fontSize: 12 }}>
                      Selecciona antes una persona en la lista para ordenar esto.
                    </div>
                  ) : (
                    <>
                      {isIrreversible && (
                        <label style={{ display: "block", fontSize: 12, color: "var(--z-danger)", marginTop: 4 }}>
                          <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmedActionKey(e.target.checked ? option.actionKey : null)}
                          />{" "}
                          Confirmo que esta acción es irreversible.
                        </label>
                      )}
                      <button
                        style={{ marginTop: 4 }}
                        disabled={isIrreversible && !confirmed}
                        onClick={() => {
                          onOrderContextualAction({
                            actionKey: option.actionKey,
                            target: targetEntry.target,
                            teamPersonIds: [],
                            disassemblyScope: option.actionKey === "disassemble_destructive" ? "destructive" : option.actionKey === "disassemble_selective" ? "selective" : undefined,
                            confirmIrreversible: isIrreversible ? confirmed : undefined,
                          });
                          setConfirmedActionKey(null);
                        }}
                      >
                        Ordenar
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

function headerFor(target: SelectionTarget, projections: WorkerProjectionsV2): { readonly title: string; readonly lines: readonly string[] } | null {
  switch (target.kind) {
    case "place": {
      const place = projections.mapEntities.places.find((p) => p.id === target.id);
      if (!place) return null;
      return {
        title: place.profileId ? copyKey(`place.${place.profileId}`) : "Silueta detectada",
        lines: [place.knowledge === "sighted" ? "Solo se ha detectado su silueta todavía." : "Lugar observado de cerca."],
      };
    }
    case "building": {
      const building = projections.mapEntities.buildings.find((b) => b.id === target.id);
      if (!building) return null;
      const exploitation = projections.buildings.find((b) => b.buildingId === target.id);
      const place = exploitation ? projections.mapEntities.places.find((p) => p.id === exploitation.placeId) : null;
      const lines: string[] = [];
      if (building.terminal) lines.push(building.terminal === "demolished" ? "Demolido: ya no queda edificio en pie." : "Desmantelado del todo.");
      if (exploitation) {
        lines.push(copyKey(`exploitation_stage.${exploitation.stage}`));
        if (exploitation.habitability) lines.push(copyKey(`habitability.${exploitation.habitability.band}`));
      }
      return { title: place?.profileId ? copyKey(`place.${place.profileId}`) : "Edificio sin identificar", lines };
    }
    case "room": {
      const room = projections.mapEntities.rooms.find((r) => r.id === target.id);
      if (!room) return null;
      return { title: "Estancia conocida", lines: [] };
    }
    case "opening": {
      const opening = projections.mapEntities.openings.find((o) => o.id === target.id);
      if (!opening) return null;
      const lines = [opening.connectsToExterior ? "Acceso exterior." : "Puerta interior."];
      if (opening.passable === false) lines.push("Bloqueada o impasable ahora mismo.");
      return { title: "Abertura", lines };
    }
    case "cultivation_plot": {
      const plot = projections.mapEntities.cultivationPlots.find((p) => p.id === target.id);
      if (!plot) return null;
      const status = projections.cultivationPlots.find((p) => p.id === target.id);
      const lines: string[] = [];
      if (status) {
        lines.push(copyKey(`cultivation_state.${status.state}`));
        if (status.preparationProgress > 0 && status.preparationProgress < 1) lines.push(`Preparación: ${Math.round(status.preparationProgress * 100)}%`);
        if (status.damageLevel > 0) lines.push(`Daño: ${Math.round(status.damageLevel * 100)}%`);
      }
      return { title: "Parcela de cultivo", lines };
    }
    case "barrier_segment": {
      const segment = projections.mapEntities.barrierSegments.find((s) => s.id === target.id);
      if (!segment) return null;
      const lines = [segment.built ? "Construido." : "Todavía sin construir."];
      if (segment.crossesWay) lines.push(`Cruza una vía: ${segment.wayCrossingMode ?? "modo desconocido"}.`);
      return { title: "Tramo de barrera", lines };
    }
    default:
      return null;
  }
}
