import { advanceSimulationV2, applyCommandV2, buildFullNavigationIndexV2, type NavigationIndexV2 } from "@z-world/simulation-core";
import type {
  DomainEventV2,
  FromWorkerMessageV2,
  OperationalLogEntryProjection,
  SaveStatus,
  SemanticWorldV2,
  SimulationCommand,
  SimulationStateV2,
  SnapshotReasonV2,
  ToWorkerMessageV2,
} from "@z-world/contracts";
import { WORKER_PROTOCOL_VERSION_V2, parseToWorkerMessageV2 } from "@z-world/contracts";
import { buildWorkerProjectionsV2, splitWorkerProjectionsV2, toOperationalLogEntryV2 } from "./build-projections-v2.js";

const OPERATIONAL_LOG_MAX_ENTRIES = 50;

/**
 * Cadencia máxima del canal estructural (S11 §5.2), en concreto de la
 * niebla: `revealAroundObservers` produce un array nuevo en cada avance
 * (no hay atajo de "sin cambios" en el reductor puro), así que sin un
 * límite de tiempo el Worker reenviaría los ~360 000 valores de la
 * rejilla en cada tick (4×/s con `TICK_INTERVAL_MS = 250`). El resto del
 * canal estructural (geometría de edificios/lugares/estancias) se envía
 * también cuando cambia de verdad (`state.world` cambia de referencia
 * solo ante una mutación estructural real), nunca por cadencia.
 */
const STRUCTURAL_CADENCE_REAL_MS = 1_000;

/**
 * Cadencia de autosave (S11 §4.4): tiempo real mínimo entre guardados
 * disparados solo por la existencia de cambios pendientes sin un límite
 * material propio (avance de reloj, deterioro, cultivo, trabajo parcial).
 * No es "cada tick": es el intervalo mínimo entre dos guardados
 * consecutivos que no vienen de un límite material — el mismo criterio que
 * usan las pruebas con reloj simulado (`nowMs` avanzado explícitamente por
 * el test, nunca tiempo de pared real).
 */
const AUTOSAVE_DEBOUNCE_REAL_MS = 30_000;

const SNAPSHOT_TRIGGERING_EVENT_TYPES: ReadonlySet<DomainEventV2["type"]> = new Set([
  "game_created",
  "move_order_accepted",
  "movement_completed",
  "movement_blocked",
  "movement_cancelled",
  "priority_changed",
  "room_entered",
  "room_exited",
  // Trabajos, necesidades, zonas y designaciones (S4-S6, WEB-002 §10):
  // límites causales tan significativos como una orden de movimiento — sin
  // guardarlos, recargar a mitad de un trabajo, consumo o descanso podría
  // perder progreso ya comprometido (§10 del prompt de subhitos).
  "job_created",
  "job_state_changed",
  "job_phase_changed",
  "job_assignment_changed",
  "reservation_created",
  "reservation_released",
  "work_episode_created",
  "need_changed",
  "consumption_happened",
  "rest_progressed",
  "systemic_intention_created",
  "work_interrupted",
  "zone_changed",
  "designation_changed",
  // Traslados (S8): cada límite logístico (plan, medio recuperado, carga preparada, acceso, entrega,
  // transferencia, depósito, estacionamiento) se guarda para poder recargar a mitad sin perder nada.
  "transport_planned",
  "transport_means_retrieved",
  "load_prepared",
  "access_traversed",
  "transport_route_blocked",
  "load_delivered",
  "load_transferred",
  "load_deposited",
  "transport_means_parked",
  // Accesos y explotación de edificios (S9): cada cambio de acceso, capa o estructura es un límite causal que se guarda.
  "access_changed",
  "installation_surveyed",
  "installation_disconnected",
  "installation_dismantled",
  "finish_recovered",
  "structure_dismantled",
  "building_demolished",
  "building_life_stage_changed",
  "building_layer_exhausted",
  "object_uninstalled",
  "object_installed",
  "movement_blocked",
]);

/**
 * Sesión activa del runtime V2 (S3 de WEB-002 §5.1). Misma forma que
 * `WorkerSession` de V1 — mismo ciclo de vida de mensajes, mismo manejo de
 * `saveStatus` y del registro operacional — deliberadamente, para que
 * ambas sesiones sean auditablemente equivalentes en su infraestructura
 * (ver DEC-0017); solo difieren en qué reductor/avance puro invocan y en
 * que esta construye el índice de navegación una única vez al cargar. El
 * Worker real en `apps/web` solo conecta `self.onmessage`/`postMessage` a
 * esta clase, igual que en V1.
 */
export class WorkerSessionV2 {
  private state: SimulationStateV2 | null = null;
  private nav: NavigationIndexV2 | null = null;
  private gameSaveId: string | null = null;
  private revision = 0;
  private saveStatus: SaveStatus = "saved";
  private lastSavedSimSeconds: number | null = null;
  private operationalLog: OperationalLogEntryProjection[] = [];
  private lastTickNowMs: number | null = null;
  /**
   * `true` entre el envío de un `snapshot_ready` y la respuesta
   * `snapshot_persisted`/`snapshot_persist_failed` correspondiente. Un
   * estado V2 real (~1 MB en JSON, ver DEC-0017) tarda lo bastante en ir y
   * volver como para que dos eventos que disparan guardado ocurran en ese
   * intervalo (p. ej. `move_order_accepted` seguido de `room_entered` en el
   * siguiente tick): sin coalescer, el segundo `snapshot_ready` usaría una
   * `expectedRevision` ya obsoleta y provocaría un `revision_conflict`
   * contra la propia sesión, no contra otra pestaña.
   */
  private awaitingPersistence = false;
  private pendingSnapshotReason: SnapshotReasonV2 | null = null;
  /**
   * Buffer autoritativo de eventos de dominio aún no confirmados por
   * persistencia (S11 §4.1). Todo evento producido por un comando o un
   * avance entra una sola vez, en orden; solo se elimina el prefijo
   * confirmado por un `snapshot_persisted` con la misma `attemptId` que se
   * envió — nunca se vacía al enviar el `snapshot_ready` (eso solo copia el
   * lote), así que un guardado que falla, o eventos producidos mientras el
   * guardado está en vuelo, permanecen para el intento siguiente sin
   * duplicarse ni perderse.
   */
  private pendingEvents: DomainEventV2[] = [];
  /** `attemptId` del lote actualmente en vuelo o del último que falló y puede reintentarse. */
  private inFlightAttemptId: string | null = null;
  /** Cuántos de los `pendingEvents` iniciales forman parte del lote en vuelo (se descartan del frente al confirmarse). */
  private inFlightEventCount = 0;
  /** Razón del lote en vuelo, para poder reconstruir el mismo `snapshot_ready` en `retry_save`. */
  private lastAttemptReason: SnapshotReasonV2 | null = null;
  /** `nowMs` del último intento de guardado disparado (de cualquier razón), para espaciar el autosave debounced (S11 §4.4). */
  private lastSnapshotAttemptNowMs: number | null = null;
  /** Secuencia monotónica compartida por `structural_projections` y `tick_projections` (S11 §5.2): detecta duplicados y huecos en el cliente. */
  private sequence = 0;
  /** Secuencia del último `structural_projections` enviado; cada `tick_projections` la referencia como su base explícita. */
  private structuralSequence = 0;
  /** Referencia de `state.world` en el último envío estructural: solo cambia ante una mutación estructural real, nunca en un tick sin eventos. */
  private lastSentWorld: SemanticWorldV2 | null = null;
  /** `nowMs` del último envío estructural, para la cadencia de niebla. */
  private lastStructuralSentNowMs: number | null = null;

  handleMessage(raw: unknown): readonly FromWorkerMessageV2[] {
    const parsed = parseToWorkerMessageV2(raw);
    if (!parsed.success || !parsed.data) {
      return [
        { type: "worker_error", protocolVersion: WORKER_PROTOCOL_VERSION_V2, code: "invalid_payload", messageKey: "worker_error.invalid_payload" },
      ];
    }
    return this.handleTypedMessage(parsed.data);
  }

  private handleTypedMessage(message: ToWorkerMessageV2): readonly FromWorkerMessageV2[] {
    if (message.protocolVersion !== WORKER_PROTOCOL_VERSION_V2) {
      return [
        { type: "worker_error", protocolVersion: WORKER_PROTOCOL_VERSION_V2, code: "incompatible_protocol_version", messageKey: "worker_error.incompatible_protocol_version" },
      ];
    }

    switch (message.type) {
      case "load_state":
        this.state = message.state;
        this.nav = buildFullNavigationIndexV2(message.state.world);
        this.gameSaveId = message.gameSaveId;
        this.revision = message.revision;
        this.saveStatus = "saved";
        this.lastSavedSimSeconds = message.state.clock.elapsedSimSeconds;
        this.operationalLog = [];
        this.lastTickNowMs = null;
        this.awaitingPersistence = false;
        this.pendingSnapshotReason = null;
        this.pendingEvents = [];
        this.inFlightAttemptId = null;
        this.inFlightEventCount = 0;
        this.lastSnapshotAttemptNowMs = null;
        this.sequence = 0;
        this.structuralSequence = 0;
        this.lastSentWorld = null;
        this.lastStructuralSentNowMs = null;
        // S11 §6.4: reconstruye el registro operativo reciente desde
        // eventos ya persistidos, en vez de arrancar vacío tras recargar.
        // Reutiliza la misma agrupación que el registro en vivo — la
        // historia reconstruida colapsa repeticiones exactamente igual.
        if (message.recentEvents && message.recentEvents.length > 0) {
          this.appendToLog(message.recentEvents);
        }
        return this.projectionMessages(undefined, true);

      case "command":
        return this.handleCommand(message.command);

      case "request_snapshot":
        return this.requestSnapshot("manual_save");

      case "retry_save":
        return this.retrySave();

      case "request_resync":
        // S11 §5.2: hueco de secuencia, delta sobre base incorrecta, o
        // recuperación tras reanudar una pestaña suspendida. Siempre
        // fuerza un `structural_projections` fresco (secuencia nueva, sin
        // reiniciar la numeración — sigue siendo la misma sesión).
        if (!this.state) return [];
        return this.projectionMessages(this.lastTickNowMs ?? undefined, true);

      case "tick":
        return this.handleTick(message.nowMs);

      case "snapshot_persisted": {
        // Un ack de un intento que ya no es el que está en vuelo (respuesta
        // duplicada, o de una pestaña/Worker anterior) no debe avanzar
        // revisión ni recortar el buffer una segunda vez.
        if (message.attemptId !== this.inFlightAttemptId) {
          return this.projectionMessages();
        }
        this.revision = message.revision;
        this.pendingEvents = this.pendingEvents.slice(this.inFlightEventCount);
        this.inFlightAttemptId = null;
        this.inFlightEventCount = 0;
        this.awaitingPersistence = false;
        this.lastSavedSimSeconds = this.state?.clock.elapsedSimSeconds ?? this.lastSavedSimSeconds;
        const messages: FromWorkerMessageV2[] = [];
        if (this.pendingSnapshotReason) {
          const reason = this.pendingSnapshotReason;
          this.pendingSnapshotReason = null;
          messages.push(...this.triggerSnapshot(reason));
        } else {
          this.saveStatus = "saved";
        }
        messages.push(...this.projectionMessages());
        return messages;
      }

      case "snapshot_persist_failed": {
        if (message.attemptId !== this.inFlightAttemptId) {
          return this.projectionMessages();
        }
        this.awaitingPersistence = false;
        if (message.code === "revision_conflict") {
          // Congela la sesión: no se conserva el lote como reintentable
          // porque la revisión esperada ya no existe en el servidor — un
          // reintento del mismo lote solo repetiría el conflicto.
          this.pendingSnapshotReason = null;
          this.inFlightAttemptId = null;
          this.inFlightEventCount = 0;
          this.saveStatus = "revision_conflict";
        } else {
          // network_error / server_error: conserva attemptId + eventos tal
          // cual para que `retry_save` reenvíe exactamente el mismo lote.
          this.saveStatus = "save_error";
        }
        return this.projectionMessages();
      }

      default: {
        const exhaustive: never = message;
        throw new Error(`Mensaje de Worker V2 no reconocido: ${JSON.stringify(exhaustive)}`);
      }
    }
  }

  private handleCommand(command: SimulationCommand): readonly FromWorkerMessageV2[] {
    if (this.saveStatus === "revision_conflict") {
      return this.projectionMessages();
    }
    if (!this.state || !this.nav) {
      return [{ type: "worker_error", protocolVersion: WORKER_PROTOCOL_VERSION_V2, code: "internal_error", messageKey: "worker_error.no_state_loaded" }];
    }
    const { state, events } = applyCommandV2(this.state, command, this.nav);
    this.state = state;
    this.appendToLog(events);
    this.pendingEvents.push(...events);

    const messages: FromWorkerMessageV2[] = [];
    const triggeringReason = this.snapshotReasonFor(events);
    if (triggeringReason) {
      messages.push(...this.triggerSnapshot(triggeringReason));
    } else if (this.saveStatus !== "saving") {
      this.saveStatus = "pending_changes";
    }
    messages.push(...this.projectionMessages());
    return messages;
  }

  private handleTick(nowMs: number): readonly FromWorkerMessageV2[] {
    if (!this.state || !this.nav) return [];
    if (this.saveStatus === "revision_conflict") return [];
    const elapsedRealSeconds = this.lastTickNowMs === null ? 0 : (nowMs - this.lastTickNowMs) / 1000;
    this.lastTickNowMs = nowMs;
    if (elapsedRealSeconds <= 0) return [];

    const { state, events, nav } = advanceSimulationV2(this.state, elapsedRealSeconds, this.nav);
    this.state = state;
    // S9: el índice derivado ya refleja cualquier acceso o estructura que haya cambiado en este paso (invalidación dirigida).
    this.nav = nav;
    this.appendToLog(events);
    this.pendingEvents.push(...events);

    const messages: FromWorkerMessageV2[] = [];
    const triggeringReason = this.snapshotReasonFor(events);
    if (triggeringReason) {
      messages.push(...this.triggerSnapshot(triggeringReason, nowMs));
    } else {
      if (events.length > 0 && this.saveStatus !== "saving") {
        this.saveStatus = "pending_changes";
      }
      // Cadencia de autosave (S11 §4.4): eventos que no traen su propio
      // límite material (p. ej. progreso de deterioro/cultivo sin cambiar
      // de fase) quedan como `pending_changes` en memoria; si ya pasó el
      // intervalo mínimo de debounce desde el último intento de guardado
      // y el reloj simulado avanzó de verdad desde el último guardado
      // confirmado, se dispara igualmente — nunca en cada tick.
      const stateChangedSinceLastSave = this.lastSavedSimSeconds !== this.state.clock.elapsedSimSeconds;
      const dueForAutosave = this.lastSnapshotAttemptNowMs === null || nowMs - this.lastSnapshotAttemptNowMs >= AUTOSAVE_DEBOUNCE_REAL_MS;
      if (this.saveStatus === "pending_changes" && !this.awaitingPersistence && stateChangedSinceLastSave && dueForAutosave) {
        messages.push(...this.triggerSnapshot("autosave_debounced", nowMs));
      }
    }
    messages.push(...this.projectionMessages(nowMs));
    return messages;
  }

  private requestSnapshot(reason: SnapshotReasonV2): readonly FromWorkerMessageV2[] {
    if (!this.state || this.saveStatus === "revision_conflict") return this.projectionMessages();
    return [...this.triggerSnapshot(reason), ...this.projectionMessages()];
  }

  /**
   * Reenvía exactamente el mismo lote (`attemptId` + eventos) del último
   * intento fallido por red/servidor (S11 §4.5). No genera un lote nuevo:
   * si mientras tanto llegaron más eventos, quedan detrás en el buffer
   * para el siguiente guardado, no se cuelan en este reintento.
   */
  private retrySave(): readonly FromWorkerMessageV2[] {
    if (!this.state || !this.gameSaveId) return this.projectionMessages();
    if (this.saveStatus !== "save_error" || this.awaitingPersistence || !this.inFlightAttemptId) {
      return this.projectionMessages();
    }
    this.awaitingPersistence = true;
    this.saveStatus = "saving";
    const reason = this.lastAttemptReason ?? "manual_save";
    return [this.snapshotReadyMessage(reason, this.inFlightAttemptId, this.pendingEvents.slice(0, this.inFlightEventCount)), ...this.projectionMessages()];
  }

  /**
   * Punto único de disparo de guardado: si ya hay un `snapshot_ready` en
   * vuelo, coalesce la razón en `pendingSnapshotReason` (se encadenará al
   * recibir `snapshot_persisted`) en vez de emitir un segundo mensaje con
   * una revisión que quedaría obsoleta antes de llegar al servidor. En
   * caso contrario, congela el lote actual de `pendingEvents` bajo una
   * `attemptId` nueva y estable: eventos que lleguen después de este punto
   * (mientras el guardado está en vuelo) se añaden al final del buffer y
   * quedan para el intento siguiente, nunca se cuelan en este.
   */
  private triggerSnapshot(reason: SnapshotReasonV2, nowMs?: number): readonly FromWorkerMessageV2[] {
    if (this.awaitingPersistence) {
      this.pendingSnapshotReason = reason;
      return [];
    }
    this.awaitingPersistence = true;
    this.saveStatus = "saving";
    if (nowMs !== undefined) this.lastSnapshotAttemptNowMs = nowMs;
    const attemptId = crypto.randomUUID();
    this.inFlightAttemptId = attemptId;
    this.inFlightEventCount = this.pendingEvents.length;
    this.lastAttemptReason = reason;
    return [this.snapshotReadyMessage(reason, attemptId, this.pendingEvents.slice(0, this.inFlightEventCount))];
  }

  private snapshotReasonFor(events: readonly DomainEventV2[]): SnapshotReasonV2 | null {
    for (const event of events) {
      if (event.type === "game_created") return "game_created";
    }
    for (const event of events) {
      if (event.type === "speed_or_pause_changed") return "session_pause_or_relevant_change";
      if (event.type === "priority_changed") return "priority_changed";
      if (SNAPSHOT_TRIGGERING_EVENT_TYPES.has(event.type)) return "order_settled";
    }
    for (const event of events) {
      if (event.type === "discovery_upgraded") return "discovery_progressed";
    }
    return null;
  }

  /**
   * Ventana de agrupación del registro operativo (S11 §6.2): repeticiones
   * de la misma causa sobre la misma entidad dentro de esta ventana de
   * tiempo simulado se colapsan en una sola entrada con contador, en vez
   * de convertir cada tick interno en ruido visible.
   */
  private static readonly LOG_GROUPING_WINDOW_SIM_SECONDS = 300;

  private primaryEntityKeyOf(params: Readonly<Record<string, string>>): string | null {
    return params.personId ?? params.entityId ?? params.roomId ?? null;
  }

  private appendToLog(events: readonly DomainEventV2[]): void {
    for (const event of events) {
      const entry = toOperationalLogEntryV2(event);
      const last = this.operationalLog[this.operationalLog.length - 1];
      const entryKey = this.primaryEntityKeyOf(entry.params);
      if (
        last &&
        last.messageKey === entry.messageKey &&
        entryKey !== null &&
        this.primaryEntityKeyOf(last.params) === entryKey &&
        entry.simSeconds - last.simSeconds <= WorkerSessionV2.LOG_GROUPING_WINDOW_SIM_SECONDS
      ) {
        this.operationalLog[this.operationalLog.length - 1] = { ...last, simSeconds: entry.simSeconds, count: last.count + 1 };
      } else {
        this.operationalLog.push(entry);
      }
    }
    if (this.operationalLog.length > OPERATIONAL_LOG_MAX_ENTRIES) {
      this.operationalLog = this.operationalLog.slice(-OPERATIONAL_LOG_MAX_ENTRIES);
    }
  }

  private snapshotReadyMessage(reason: SnapshotReasonV2, attemptId: string, events: readonly DomainEventV2[]): FromWorkerMessageV2 {
    if (!this.state || !this.gameSaveId) {
      throw new Error("No se puede pedir snapshot V2 sin estado ni gameSaveId cargados.");
    }
    return {
      type: "snapshot_ready",
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
      gameSaveId: this.gameSaveId,
      expectedRevision: this.revision,
      reason,
      state: this.state,
      events,
      attemptId,
    };
  }

  /**
   * Construye y devuelve los mensajes de proyección que corresponden al
   * estado actual (S11 §5.2): siempre un `tick_projections`, y un
   * `structural_projections` delante cuando `forceStructural` lo pide (al
   * cargar o resincronizar), cuando `state.world` cambió de referencia
   * (mutación estructural real: acceso, edificio, zona, designación...) o
   * cuando venció la cadencia máxima de niebla. La secuencia es
   * monotónica y compartida por ambos canales; `tick_projections` siempre
   * referencia la `structuralSequence` vigente, así que el cliente puede
   * detectar sin ambigüedad si su base estructural quedó desactualizada.
   */
  private projectionMessages(nowMs?: number, forceStructural = false): readonly FromWorkerMessageV2[] {
    if (!this.state || !this.gameSaveId) {
      throw new Error("No se pueden construir proyecciones V2 sin estado cargado.");
    }
    const full = buildWorkerProjectionsV2({
      state: this.state,
      gameSaveId: this.gameSaveId,
      revision: this.revision,
      saveStatus: this.saveStatus,
      lastSavedSimSeconds: this.lastSavedSimSeconds,
      operationalLog: this.operationalLog,
    });
    const { structural, tick } = splitWorkerProjectionsV2(full);

    const effectiveNowMs = nowMs ?? this.lastStructuralSentNowMs ?? 0;
    const worldChanged = this.state.world !== this.lastSentWorld;
    const cadenceDue = this.lastStructuralSentNowMs === null || effectiveNowMs - this.lastStructuralSentNowMs >= STRUCTURAL_CADENCE_REAL_MS;
    const sendStructural = forceStructural || worldChanged || cadenceDue;

    const messages: FromWorkerMessageV2[] = [];
    if (sendStructural) {
      this.sequence += 1;
      this.structuralSequence = this.sequence;
      this.lastSentWorld = this.state.world;
      this.lastStructuralSentNowMs = effectiveNowMs;
      messages.push({ type: "structural_projections", protocolVersion: WORKER_PROTOCOL_VERSION_V2, sequence: this.sequence, structural });
    }
    this.sequence += 1;
    messages.push({ type: "tick_projections", protocolVersion: WORKER_PROTOCOL_VERSION_V2, sequence: this.sequence, structuralSequence: this.structuralSequence, tick });
    return messages;
  }
}
