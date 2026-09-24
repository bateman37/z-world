"use client";

import { useState } from "react";
import type {
  AttentionMode,
  CargoRef,
  InventoryEntryProjection,
  JobProjection,
  JobTarget,
  MeansDisposition,
  PaceMode,
  StorageItemRef,
  TransportDestination,
  TransportMethodChoice,
  WorkerProjectionsV2,
} from "@z-world/contracts";
import { toSimulatedDayTime } from "@z-world/contracts";
import { copyKey } from "@z-world/catalogs";

/** Parámetros propios de una orden de traslado (S8, SET-010 §3.9). */
export interface TransportOrderParams {
  readonly method: TransportMethodChoice;
  readonly meansId?: string;
  readonly destination: TransportDestination;
  readonly extraCargo: readonly CargoRef[];
  readonly meansDisposition: MeansDisposition;
}

function cargoRefOf(target: JobTarget): CargoRef | null {
  if (target.kind === "world_object") return { kind: "world_object", id: target.worldObjectId };
  if (target.kind === "resource_lot") return { kind: "resource_lot", id: target.resourceLotId };
  if (target.kind === "furniture") return { kind: "furniture", id: target.furnitureId };
  return null;
}

/**
 * Panel funcional de trabajos/necesidades/zonas/designaciones (S4-S6 de
 * WEB-002, subhitos). Sin pasada artística (§9 del prompt de subhitos):
 * controles mínimos para probar el motor de resolución, el planificador y
 * las necesidades causales con claridad, reutilizando el Canvas y la
 * interfaz funcional existentes de S1-S3.
 */
export function WorkPanel({
  projections,
  selectedPersonId,
  onOrderContextualAction,
  onPauseJob,
  onResumeJob,
  onCancelJob,
  onDrawZone,
  onDeleteZone,
  onCreateAreaDesignation,
  onCancelDesignation,
}: {
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
  }) => void;
  readonly onPauseJob: (jobId: string) => void;
  readonly onResumeJob: (jobId: string) => void;
  readonly onCancelJob: (jobId: string) => void;
  readonly onDrawZone: (polygon: readonly { x: number; y: number }[], policy: "habitual" | "precaution" | "forbidden") => void;
  readonly onDeleteZone: (zoneId: string) => void;
  readonly onCreateAreaDesignation: (polygon: readonly { x: number; y: number }[]) => void;
  readonly onCancelDesignation: (designationId: string) => void;
}) {
  const [actionKey, setActionKey] = useState<string>("");
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [zoneBounds, setZoneBounds] = useState({ minX: "-20", minY: "-20", maxX: "20", maxY: "20" });
  const [zonePolicy, setZonePolicy] = useState<"habitual" | "precaution" | "forbidden">("habitual");
  const [irreversibleConfirmed, setIrreversibleConfirmed] = useState(false);
  const [partialQuantity, setPartialQuantity] = useState("");
  // Traslado (S8).
  const [transportMethod, setTransportMethod] = useState<TransportMethodChoice>("auto");
  const [transportMeansId, setTransportMeansId] = useState<string>("");
  const [destinationIndex, setDestinationIndex] = useState<number>(0);
  const [extraCargo, setExtraCargo] = useState<readonly string[]>([]);
  const [teamIds, setTeamIds] = useState<readonly string[]>([]);
  const [pace, setPace] = useState<PaceMode>("normal");
  const [attention, setAttention] = useState<AttentionMode>("standard");
  const [meansDisposition, setMeansDisposition] = useState<MeansDisposition>("park_at_destination");

  const needs = selectedPersonId ? (projections.needsByPerson[selectedPersonId] ?? []) : [];
  const selectedOption = projections.contextualActions.find((o) => o.actionKey === actionKey) ?? projections.contextualActions[0];
  // Almacenar (S7): solo lo que lleva la persona seleccionada o lo que está suelto junto al contenedor;
  // lo que lleva otra persona exigiría transporte (S8), así que no se ofrece.
  // Retirar: igual, solo de contenedores de estancia o de la mochila de la propia persona seleccionada.
  const isTransport = selectedOption?.actionKey === "transport";
  const targets = (selectedOption?.targets ?? []).filter(
    (t) => !t.storageItem || t.storageItem.holderPersonId === null || t.storageItem.holderPersonId === selectedPersonId || (isTransport && teamIds.includes(t.storageItem.holderPersonId)),
  );
  const transportOptions = selectedOption?.transport;
  const selectedTarget = targets[targetIndex];
  const extraCandidates = isTransport && selectedTarget?.cargoGroupKey ? targets.filter((t, i) => i !== targetIndex && t.cargoGroupKey === selectedTarget.cargoGroupKey && t.blockedReasonKey === null) : [];
  const wheeledChoice = transportMethod === "wheelbarrow" || transportMethod === "handcart";
  const meansChoices = (transportOptions?.means ?? []).filter((m) => transportMethod === "auto" || m.method === transportMethod);
  // Los dos métodos de desmontaje son irreversibles (§16.4 del prompt
  // S7-S9): la orden directa exige confirmación informada explícita, nunca
  // implícita por pulsar "Ordenar" una sola vez.
  const isIrreversibleAction = selectedOption?.actionKey === "disassemble_selective" || selectedOption?.actionKey === "disassemble_destructive";

  // Retirar solo una parte de un lote lo divide en el núcleo (S7 §6.5); vacío = el lote entero.
  const isPartialRetrieve = selectedOption?.actionKey === "retrieve_from_storage" && targets[targetIndex]?.storageItem?.kind === "resource_lot";

  function handleOrder() {
    if (!selectedPersonId || !selectedOption) return;
    const target = targets[targetIndex]?.target;
    if (!target) return;
    if (isIrreversibleAction && !irreversibleConfirmed) return;
    if (isTransport) {
      const destination = transportOptions?.destinations[destinationIndex]?.destination;
      if (!destination) return;
      const extra = extraCandidates.filter((t) => extraCargo.includes(JSON.stringify(t.target))).map((t) => cargoRefOf(t.target)).filter((c): c is CargoRef => c !== null);
      onOrderContextualAction({
        actionKey: "transport",
        target,
        teamPersonIds: teamIds.filter((id) => id !== selectedPersonId),
        pace,
        attention,
        transport: { method: transportMethod, meansId: transportMeansId || undefined, destination, extraCargo: extra, meansDisposition },
      });
      setExtraCargo([]);
      return;
    }
    onOrderContextualAction({
      actionKey: selectedOption.actionKey,
      target,
      teamPersonIds: [],
      disassemblyScope: selectedOption.actionKey === "disassemble_destructive" ? "destructive" : selectedOption.actionKey === "disassemble_selective" ? "selective" : undefined,
      confirmIrreversible: isIrreversibleAction ? irreversibleConfirmed : undefined,
      storageItem: targets[targetIndex]?.storageItem ? { kind: targets[targetIndex]!.storageItem!.kind, id: targets[targetIndex]!.storageItem!.id } : undefined,
      storageQuantity: isPartialRetrieve && Number(partialQuantity) > 0 ? Number(partialQuantity) : undefined,
    });
    setPartialQuantity("");
    setIrreversibleConfirmed(false);
  }

  function handleCreateZone() {
    const minX = Number(zoneBounds.minX);
    const minY = Number(zoneBounds.minY);
    const maxX = Number(zoneBounds.maxX);
    const maxY = Number(zoneBounds.maxY);
    if ([minX, minY, maxX, maxY].some((n) => Number.isNaN(n))) return;
    onDrawZone(
      [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY },
      ],
      zonePolicy,
    );
  }

  function handleCreateDesignation() {
    const minX = Number(zoneBounds.minX);
    const minY = Number(zoneBounds.minY);
    const maxX = Number(zoneBounds.maxX);
    const maxY = Number(zoneBounds.maxY);
    if ([minX, minY, maxX, maxY].some((n) => Number.isNaN(n))) return;
    onCreateAreaDesignation([
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ]);
  }

  return (
    <aside className="z-panel z-scroll" style={{ padding: 12, height: "100%", display: "flex", flexDirection: "column", gap: 16 }} aria-label="Trabajos y necesidades">
      <section>
        <h3 style={{ marginTop: 0 }}>Necesidades</h3>
        {selectedPersonId ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {needs.map((n) => (
              <li key={n.dimension}>
                {copyKey(`need.${n.dimension}`)}: <strong>{copyKey(`need.band.${n.band}`)}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="z-muted">Selecciona una persona.</p>
        )}
      </section>

      <section>
        <h3>Acción contextual</h3>
        {projections.contextualActions.length === 0 ? (
          <p className="z-muted">No hay ninguna acción disponible con lo que se conoce ahora mismo.</p>
        ) : (
          <>
            <label style={{ display: "block" }}>
              Acción:{" "}
              <select
                value={selectedOption?.actionKey ?? ""}
                onChange={(e) => {
                  setActionKey(e.target.value);
                  setTargetIndex(0);
                }}
              >
                {projections.contextualActions.map((o) => (
                  <option key={o.actionKey} value={o.actionKey}>
                    {copyKey(o.labelKey)}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "block", marginTop: 4 }}>
              Objetivo:{" "}
              <select value={targetIndex} onChange={(e) => setTargetIndex(Number(e.target.value))}>
                {targets.map((t, i) => (
                  <option key={i} value={i} disabled={t.blockedReasonKey !== null}>
                    {isTransport
                      ? `${copyKey(t.labelKey)}${t.storageItem?.holderPersonId ? ` (lo lleva ${projections.personCards.find((c) => c.personId === t.storageItem!.holderPersonId)?.firstName ?? ""})` : ""}`
                      : t.storageItem
                      ? selectedOption?.actionKey === "store"
                        ? `${copyKey(t.storageItem.labelKey)} → ${copyKey(t.labelKey)}`
                        : `${copyKey(t.storageItem.labelKey)} (en ${copyKey(t.labelKey)})`
                      : copyKey(t.labelKey)}
                    {t.blockedReasonKey ? ` — ${copyKey(t.blockedReasonKey)}` : ""}
                  </option>
                ))}
              </select>
            </label>
            {isPartialRetrieve && (
              <label style={{ display: "block", marginTop: 4 }}>
                Cantidad (vacío = todo): <input aria-label="Cantidad a retirar" value={partialQuantity} onChange={(e) => setPartialQuantity(e.target.value)} style={{ width: 56 }} />
              </label>
            )}
            {isTransport && transportOptions && (
              <TransportControls
                options={transportOptions}
                extraCandidates={extraCandidates}
                extraCargo={extraCargo}
                onToggleExtra={(key) => setExtraCargo(extraCargo.includes(key) ? extraCargo.filter((k) => k !== key) : [...extraCargo, key])}
                method={transportMethod}
                onMethod={(m) => {
                  setTransportMethod(m);
                  setTransportMeansId("");
                }}
                meansChoices={meansChoices}
                meansId={transportMeansId}
                onMeans={setTransportMeansId}
                destinationIndex={destinationIndex}
                onDestination={setDestinationIndex}
                people={projections.personCards.filter((c) => c.personId !== selectedPersonId).map((c) => ({ id: c.personId, name: c.firstName }))}
                teamIds={teamIds}
                onToggleTeam={(id) => setTeamIds(teamIds.includes(id) ? teamIds.filter((x) => x !== id) : teamIds.length >= 3 ? teamIds : [...teamIds, id])}
                pace={pace}
                onPace={setPace}
                attention={attention}
                onAttention={setAttention}
                showDisposition={wheeledChoice || transportMethod === "auto"}
                meansDisposition={meansDisposition}
                onMeansDisposition={setMeansDisposition}
              />
            )}
            {isIrreversibleAction && (
              <label style={{ display: "block", marginTop: 6, color: "var(--z-danger)" }}>
                <input type="checkbox" checked={irreversibleConfirmed} onChange={(e) => setIrreversibleConfirmed(e.target.checked)} /> Confirmo que esta acción es irreversible y puede perder
                componentes/función para siempre.
              </label>
            )}
            <button style={{ marginTop: 8 }} disabled={!selectedPersonId || targets.length === 0 || (isIrreversibleAction && !irreversibleConfirmed)} onClick={handleOrder}>
              Ordenar
            </button>
          </>
        )}
      </section>

      <InventorySection entries={projections.inventory} personNames={Object.fromEntries(projections.personCards.map((c) => [c.personId, c.firstName]))} />

      <section>
        <h3>Trabajos</h3>
        {projections.jobs.length === 0 ? (
          <p className="z-muted">Sin trabajos activos.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {projections.jobs.map((job) => (
              <li key={job.id} className="z-panel" style={{ padding: 6 }}>
                <div>
                  <strong>{copyKey(job.labelKey)}</strong> — {job.state}
                  {job.phaseKind ? ` (${job.phaseKind})` : ""}
                </div>
                {job.transport ? <TransportJobDetails job={job} personNames={Object.fromEntries(projections.personCards.map((c) => [c.personId, c.firstName]))} /> : <div className="z-muted">Progreso: {Math.round(job.progressRatio * 100)}%</div>}
                {job.blockReasonKey && <div style={{ color: "var(--z-danger)" }}>{copyKey(job.blockReasonKey)}</div>}
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {job.state === "in_progress" && <button onClick={() => onPauseJob(job.id)}>Pausar</button>}
                  {job.state === "paused" && <button onClick={() => onResumeJob(job.id)}>Reanudar</button>}
                  {job.state !== "completed" && job.state !== "cancelled" && job.state !== "causal_failure" && <button onClick={() => onCancelJob(job.id)}>Cancelar</button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Zonas y designaciones</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <label>
            minX <input value={zoneBounds.minX} onChange={(e) => setZoneBounds({ ...zoneBounds, minX: e.target.value })} style={{ width: 56 }} />
          </label>
          <label>
            minY <input value={zoneBounds.minY} onChange={(e) => setZoneBounds({ ...zoneBounds, minY: e.target.value })} style={{ width: 56 }} />
          </label>
          <label>
            maxX <input value={zoneBounds.maxX} onChange={(e) => setZoneBounds({ ...zoneBounds, maxX: e.target.value })} style={{ width: 56 }} />
          </label>
          <label>
            maxY <input value={zoneBounds.maxY} onChange={(e) => setZoneBounds({ ...zoneBounds, maxY: e.target.value })} style={{ width: 56 }} />
          </label>
        </div>
        <label style={{ display: "block", marginTop: 4 }}>
          Política:{" "}
          <select value={zonePolicy} onChange={(e) => setZonePolicy(e.target.value as "habitual" | "precaution" | "forbidden")}>
            <option value="habitual">Habitual</option>
            <option value="precaution">Precaución</option>
            <option value="forbidden">Prohibida</option>
          </select>
        </label>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          <button onClick={handleCreateZone}>Crear zona</button>
          <button onClick={handleCreateDesignation}>Designar reconocimiento por área</button>
        </div>
        <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
          {projections.zones.map((z) => (
            <li key={z.id}>
              Zona {z.policy} <button onClick={() => onDeleteZone(z.id)}>Borrar</button>
            </li>
          ))}
        </ul>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {projections.designations.map((d) => (
            <li key={d.id}>
              Designación {d.kind} ({d.generatedJobCount} trabajos){" "}
              {!d.cancelled && <button onClick={() => onCancelDesignation(d.id)}>Cancelar</button>}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

/** Controles del traslado (S8): carga compuesta, destino, selector Auto/método, medio, equipo, ritmo/atención y destino del medio. */
function TransportControls(props: {
  readonly options: NonNullable<WorkerProjectionsV2["contextualActions"][number]["transport"]>;
  readonly extraCandidates: readonly WorkerProjectionsV2["contextualActions"][number]["targets"][number][];
  readonly extraCargo: readonly string[];
  readonly onToggleExtra: (key: string) => void;
  readonly method: TransportMethodChoice;
  readonly onMethod: (m: TransportMethodChoice) => void;
  readonly meansChoices: NonNullable<WorkerProjectionsV2["contextualActions"][number]["transport"]>["means"];
  readonly meansId: string;
  readonly onMeans: (id: string) => void;
  readonly destinationIndex: number;
  readonly onDestination: (i: number) => void;
  readonly people: readonly { readonly id: string; readonly name: string }[];
  readonly teamIds: readonly string[];
  readonly onToggleTeam: (id: string) => void;
  readonly pace: PaceMode;
  readonly onPace: (p: PaceMode) => void;
  readonly attention: AttentionMode;
  readonly onAttention: (a: AttentionMode) => void;
  readonly showDisposition: boolean;
  readonly meansDisposition: MeansDisposition;
  readonly onMeansDisposition: (d: MeansDisposition) => void;
}) {
  const { options } = props;
  return (
    <div aria-label="Opciones de traslado" style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
      {props.extraCandidates.length > 0 && (
        <fieldset style={{ margin: 0, padding: 4 }}>
          <legend>Añadir a la carga (mismo lugar)</legend>
          {props.extraCandidates.map((t) => {
            const key = JSON.stringify(t.target);
            return (
              <label key={key} style={{ display: "block" }}>
                <input type="checkbox" checked={props.extraCargo.includes(key)} onChange={() => props.onToggleExtra(key)} /> {copyKey(t.labelKey)}
              </label>
            );
          })}
        </fieldset>
      )}
      <label>
        Destino:{" "}
        <select aria-label="Destino del traslado" value={props.destinationIndex} onChange={(e) => props.onDestination(Number(e.target.value))}>
          {options.destinations.map((d, i) => (
            <option key={i} value={i}>
              {d.destination.kind === "container" ? "Contenedor: " : d.destination.kind === "room" ? "Estancia: " : ""}
              {copyKey(d.labelKey)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Método de transporte:{" "}
        <select aria-label="Método de transporte" value={props.method} onChange={(e) => props.onMethod(e.target.value as TransportMethodChoice)}>
          {options.methods.map((m) => (
            <option key={m.method} value={m.method}>
              {copyKey(m.labelKey)}
            </option>
          ))}
        </select>
      </label>
      {props.meansChoices.length > 0 && (props.method === "wheelbarrow" || props.method === "handcart" || props.method === "auto") && (
        <label>
          Medio:{" "}
          <select aria-label="Medio concreto" value={props.meansId} onChange={(e) => props.onMeans(e.target.value)}>
            <option value="">El más cercano disponible</option>
            {props.meansChoices.map((m) => (
              <option key={m.id} value={m.id} disabled={m.blockedReasonKey !== null}>
                {copyKey(m.labelKey)}
                {m.blockedReasonKey ? ` — ${copyKey(m.blockedReasonKey)}` : ""}
              </option>
            ))}
          </select>
        </label>
      )}
      <fieldset style={{ margin: 0, padding: 4 }}>
        <legend>Equipo (hasta 3 más)</legend>
        {props.people.map((p) => (
          <label key={p.id} style={{ marginRight: 6 }}>
            <input type="checkbox" checked={props.teamIds.includes(p.id)} onChange={() => props.onToggleTeam(p.id)} /> {p.name}
          </label>
        ))}
      </fieldset>
      <label>
        Ritmo:{" "}
        <select aria-label="Ritmo" value={props.pace} onChange={(e) => props.onPace(e.target.value as PaceMode)}>
          <option value="relaxed">Tranquilo</option>
          <option value="normal">Normal</option>
          <option value="fast">Rápido (más fatiga y ruido)</option>
        </select>
      </label>
      <label>
        Atención:{" "}
        <select aria-label="Atención" value={props.attention} onChange={(e) => props.onAttention(e.target.value as AttentionMode)}>
          <option value="standard">Estándar</option>
          <option value="careful">Cuidadosa (más lenta, protege lo frágil)</option>
        </select>
      </label>
      {props.showDisposition && (
        <label>
          Al terminar, el medio:{" "}
          <select aria-label="Destino del medio" value={props.meansDisposition} onChange={(e) => props.onMeansDisposition(e.target.value as MeansDisposition)}>
            <option value="park_at_destination">{copyKey("meansDisposition.park_at_destination")}</option>
            <option value="return_to_origin">{copyKey("meansDisposition.return_to_origin")}</option>
          </select>
        </label>
      )}
    </div>
  );
}

/** Fases logísticas y ubicaciones visibles de un traslado (S8). */
function TransportJobDetails({ job, personNames }: { readonly job: JobProjection; readonly personNames: Readonly<Record<string, string>> }) {
  const t = job.transport!;
  return (
    <div className="z-muted" style={{ fontSize: 12 }} data-transport-step={t.step}>
      <div>
        {t.method ? copyKey(`transport_method.${t.method}`) : copyKey(`transport_method.${t.requestedMethod}`)}
        {t.meansLabelKey ? ` (${copyKey(t.meansLabelKey)})` : ""} → {copyKey(t.destinationLabelKey)}
      </div>
      <div>
        Paso: <strong>{copyKey(`transport_step.${t.step}`)}</strong>
        {t.stagedStop ? " · etapa hasta un acceso (transferencia)" : ""}
      </div>
      <div>
        Porteadoras: {t.carrierPersonIds.map((id) => personNames[id] ?? id).join(", ") || "—"}
        {t.requiredCarriers > 1 ? ` (mínimo ${t.requiredCarriers})` : ""}
      </div>
      {t.loadWeightKg !== null && (
        <div>
          Carga: {t.loadWeightKg} kg · bulto {t.loadBulk}
          {t.loadPlacement ? ` · ${copyKey(`load_placement.${t.loadPlacement}`)}` : ""}
        </div>
      )}
      {t.accessesTotal > 0 && (
        <div>
          Accesos atravesados: {t.accessesCrossed}/{t.accessesTotal} · ruido {copyKey(`noise.${t.noiseBand}`)}
        </div>
      )}
      {t.planNoteKey && <div>{copyKey(t.planNoteKey)}</div>}
      {t.nextJobId && <div>Sigue en una nueva etapa a pulso desde el punto de transferencia.</div>}
      {t.previousJobId && <div>Etapa tras un punto de transferencia.</div>}
    </div>
  );
}

function locationText(entry: InventoryEntryProjection, personNames: Readonly<Record<string, string>>): string {
  const inside = entry.containerLabelKey ? ` · ${copyKey("location.container")} ${copyKey(entry.containerLabelKey)}` : "";
  if (entry.locationKind === "carried") return `${copyKey("location.carried")} ${entry.holderPersonId ? (personNames[entry.holderPersonId] ?? "") : ""}${inside}`;
  if (entry.locationKind === "exterior") return `${copyKey("location.exterior")}${inside}`;
  if (entry.locationKind === "load") return `${copyKey("location.load")} (${copyKey(entry.containerLabelKey)})${entry.holderPersonId ? ` · ${copyKey("location.carried")} ${personNames[entry.holderPersonId] ?? ""}` : ""}`;
  if (entry.locationKind === "transfer_point") return `${copyKey("location.transfer_point")} ${copyKey(entry.containerLabelKey)}`;
  return `${copyKey("location.room")}${inside}`;
}

function spoilText(simSeconds: number | null): string {
  if (simSeconds === null) return "";
  const t = toSimulatedDayTime(simSeconds);
  return ` · se echa a perder hacia Día ${t.day}, ${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`;
}

/**
 * Inventario localizado conocido (S7, WEB-002 §6.3/§10.3): nunca una bolsa
 * global. Cada línea dice dónde está realmente cada objeto o lote (quién
 * lo lleva, en qué contenedor, en qué estancia registrada o en qué
 * exterior), su estado reconocido y, para el alimento fresco, su banda de
 * conservación calculada por el deterioro determinista del núcleo.
 */
function InventorySection({ entries, personNames }: { readonly entries: readonly InventoryEntryProjection[]; readonly personNames: Readonly<Record<string, string>> }) {
  return (
    <section aria-label="Inventario conocido">
      <h3>Inventario conocido</h3>
      {entries.length === 0 ? (
        <p className="z-muted">Nada localizado todavía.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 2, fontSize: 12 }}>
          {entries.map((entry) => (
            <li key={entry.id} data-inventory-id={entry.id}>
              <strong>{copyKey(entry.labelKey)}</strong>
              {entry.quantity !== null ? ` ×${entry.quantity}${entry.unit === "liter" ? " L" : entry.unit === "kilogram" ? " kg" : ""}` : ""}
              {entry.functionalStateKey ? ` — ${copyKey(entry.functionalStateKey)}` : ""}
              {entry.freshness ? ` — ${copyKey(`freshness.${entry.freshness}`)}${entry.freshness !== "spoiled" ? spoilText(entry.spoilsAtSimSeconds) : ""}` : ""}
              {entry.capacity ? ` — capacidad ${entry.capacity.used}/${entry.capacity.total}` : ""}
              <div className="z-muted">{locationText(entry, personNames)}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
