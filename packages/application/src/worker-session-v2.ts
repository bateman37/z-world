import { advanceSimulationV2, applyCommandV2, buildFullNavigationIndexV2, type NavigationIndexV2 } from "@z-world/simulation-core";
import type {
  DomainEventV2,
  FromWorkerMessageV2,
  OperationalLogEntryProjection,
  SaveStatus,
  SimulationCommand,
  SimulationStateV2,
  SnapshotReasonV2,
  ToWorkerMessageV2,
} from "@z-world/contracts";
import { WORKER_PROTOCOL_VERSION_V2, parseToWorkerMessageV2 } from "@z-world/contracts";
import { buildWorkerProjectionsV2, toOperationalLogEntryV2 } from "./build-projections-v2.js";

const OPERATIONAL_LOG_MAX_ENTRIES = 50;

const SNAPSHOT_TRIGGERING_EVENT_TYPES: ReadonlySet<DomainEventV2["type"]> = new Set([
  "game_created",
  "move_order_accepted",
  "movement_completed",
  "movement_blocked",
  "movement_cancelled",
  "priority_changed",
  "room_entered",
  "room_exited",
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
        return [this.projectionsMessage()];

      case "command":
        return this.handleCommand(message.command);

      case "request_snapshot":
        return this.requestSnapshot("manual_save");

      case "tick":
        return this.handleTick(message.nowMs);

      case "snapshot_persisted": {
        this.revision = message.revision;
        this.awaitingPersistence = false;
        this.lastSavedSimSeconds = this.state?.clock.elapsedSimSeconds ?? this.lastSavedSimSeconds;
        const messages: FromWorkerMessageV2[] = [];
        if (this.pendingSnapshotReason) {
          const reason = this.pendingSnapshotReason;
          this.pendingSnapshotReason = null;
          this.awaitingPersistence = true;
          this.saveStatus = "saving";
          messages.push(this.snapshotReadyMessage(reason));
        } else {
          this.saveStatus = "saved";
        }
        messages.push(this.projectionsMessage());
        return messages;
      }

      case "snapshot_persist_failed":
        this.awaitingPersistence = false;
        this.pendingSnapshotReason = null;
        this.saveStatus = message.code === "revision_conflict" ? "revision_conflict" : "save_error";
        return [this.projectionsMessage()];

      default: {
        const exhaustive: never = message;
        throw new Error(`Mensaje de Worker V2 no reconocido: ${JSON.stringify(exhaustive)}`);
      }
    }
  }

  private handleCommand(command: SimulationCommand): readonly FromWorkerMessageV2[] {
    if (!this.state || !this.nav) {
      return [{ type: "worker_error", protocolVersion: WORKER_PROTOCOL_VERSION_V2, code: "internal_error", messageKey: "worker_error.no_state_loaded" }];
    }
    const { state, events } = applyCommandV2(this.state, command, this.nav);
    this.state = state;
    this.appendToLog(events);

    const messages: FromWorkerMessageV2[] = [];
    const triggeringReason = this.snapshotReasonFor(events);
    if (triggeringReason) {
      messages.push(...this.triggerSnapshot(triggeringReason));
    } else if (this.saveStatus !== "saving") {
      this.saveStatus = "pending_changes";
    }
    messages.push(this.projectionsMessage());
    return messages;
  }

  private handleTick(nowMs: number): readonly FromWorkerMessageV2[] {
    if (!this.state || !this.nav) return [];
    const elapsedRealSeconds = this.lastTickNowMs === null ? 0 : (nowMs - this.lastTickNowMs) / 1000;
    this.lastTickNowMs = nowMs;
    if (elapsedRealSeconds <= 0) return [];

    const { state, events } = advanceSimulationV2(this.state, elapsedRealSeconds, this.nav);
    this.state = state;
    this.appendToLog(events);

    const messages: FromWorkerMessageV2[] = [];
    const triggeringReason = this.snapshotReasonFor(events);
    if (triggeringReason) {
      messages.push(...this.triggerSnapshot(triggeringReason));
    } else if (events.length > 0 && this.saveStatus !== "saving") {
      this.saveStatus = "pending_changes";
    }
    messages.push(this.projectionsMessage());
    return messages;
  }

  private requestSnapshot(reason: SnapshotReasonV2): readonly FromWorkerMessageV2[] {
    if (!this.state) return [];
    return [...this.triggerSnapshot(reason), this.projectionsMessage()];
  }

  /**
   * Punto único de disparo de guardado: si ya hay un `snapshot_ready` en
   * vuelo, coalesce la razón en `pendingSnapshotReason` (se encadenará al
   * recibir `snapshot_persisted`) en vez de emitir un segundo mensaje con
   * una revisión que quedaría obsoleta antes de llegar al servidor.
   */
  private triggerSnapshot(reason: SnapshotReasonV2): readonly FromWorkerMessageV2[] {
    if (this.awaitingPersistence) {
      this.pendingSnapshotReason = reason;
      return [];
    }
    this.awaitingPersistence = true;
    this.saveStatus = "saving";
    return [this.snapshotReadyMessage(reason)];
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

  private appendToLog(events: readonly DomainEventV2[]): void {
    for (const event of events) {
      this.operationalLog.push(toOperationalLogEntryV2(event));
    }
    if (this.operationalLog.length > OPERATIONAL_LOG_MAX_ENTRIES) {
      this.operationalLog = this.operationalLog.slice(-OPERATIONAL_LOG_MAX_ENTRIES);
    }
  }

  private snapshotReadyMessage(reason: SnapshotReasonV2): FromWorkerMessageV2 {
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
      events: [],
    };
  }

  private projectionsMessage(): FromWorkerMessageV2 {
    if (!this.state || !this.gameSaveId) {
      throw new Error("No se pueden construir proyecciones V2 sin estado cargado.");
    }
    const projections = buildWorkerProjectionsV2({
      state: this.state,
      gameSaveId: this.gameSaveId,
      revision: this.revision,
      saveStatus: this.saveStatus,
      lastSavedSimSeconds: this.lastSavedSimSeconds,
      operationalLog: this.operationalLog,
    });
    return { type: "projections", protocolVersion: WORKER_PROTOCOL_VERSION_V2, projections };
  }
}
