import { advanceSimulation, applyCommand } from "@z-world/simulation-core";
import type {
  DomainEvent,
  FromWorkerMessage,
  OperationalLogEntryProjection,
  SaveStatus,
  SimulationCommand,
  SimulationStateV1,
  SnapshotReason,
  ToWorkerMessage,
} from "@z-world/contracts";
import { WORKER_PROTOCOL_VERSION, parseToWorkerMessage } from "@z-world/contracts";
import { buildWorkerProjections, toOperationalLogEntry } from "./build-projections.js";

const OPERATIONAL_LOG_MAX_ENTRIES = 50;

const SNAPSHOT_TRIGGERING_EVENT_TYPES: ReadonlySet<DomainEvent["type"]> = new Set([
  "game_created",
  "move_order_accepted",
  "movement_completed",
  "movement_blocked",
  "movement_cancelled",
  "priority_changed",
]);

/**
 * Sesión activa del Worker (§8 de WEB-001). Posee el estado autoritativo,
 * aplica comandos mediante el núcleo puro, y decide cuándo pedir a la
 * orquestación que persista (nunca persiste directamente: no importa
 * Prisma). Framework-agnóstica: el archivo real del Web Worker en
 * `apps/web` solo conecta `self.onmessage`/`postMessage` a esta clase.
 */
export class WorkerSession {
  private state: SimulationStateV1 | null = null;
  private gameSaveId: string | null = null;
  private revision = 0;
  private saveStatus: SaveStatus = "saved";
  private lastSavedSimSeconds: number | null = null;
  private operationalLog: OperationalLogEntryProjection[] = [];
  private lastTickNowMs: number | null = null;

  handleMessage(raw: unknown): readonly FromWorkerMessage[] {
    const parsed = parseToWorkerMessage(raw);
    if (!parsed.success || !parsed.data) {
      return [
        {
          type: "worker_error",
          protocolVersion: WORKER_PROTOCOL_VERSION,
          code: "invalid_payload",
          messageKey: "worker_error.invalid_payload",
        },
      ];
    }
    return this.handleTypedMessage(parsed.data);
  }

  private handleTypedMessage(message: ToWorkerMessage): readonly FromWorkerMessage[] {
    if (message.protocolVersion !== WORKER_PROTOCOL_VERSION) {
      return [
        {
          type: "worker_error",
          protocolVersion: WORKER_PROTOCOL_VERSION,
          code: "incompatible_protocol_version",
          messageKey: "worker_error.incompatible_protocol_version",
        },
      ];
    }

    switch (message.type) {
      case "load_state":
        this.state = message.state;
        this.gameSaveId = message.gameSaveId;
        this.revision = message.revision;
        this.saveStatus = "saved";
        this.lastSavedSimSeconds = message.state.clock.elapsedSimSeconds;
        this.operationalLog = [];
        this.lastTickNowMs = null;
        return [this.projectionsMessage()];

      case "command":
        return this.handleCommand(message.command);

      case "request_snapshot":
        return this.requestSnapshot("manual_save");

      case "tick":
        return this.handleTick(message.nowMs);

      case "snapshot_persisted":
        this.revision = message.revision;
        this.saveStatus = "saved";
        this.lastSavedSimSeconds = this.state?.clock.elapsedSimSeconds ?? this.lastSavedSimSeconds;
        return [this.projectionsMessage()];

      case "snapshot_persist_failed":
        this.saveStatus = message.code === "revision_conflict" ? "revision_conflict" : "save_error";
        return [this.projectionsMessage()];

      default: {
        const exhaustive: never = message;
        throw new Error(`Mensaje de Worker no reconocido: ${JSON.stringify(exhaustive)}`);
      }
    }
  }

  private handleCommand(command: SimulationCommand): readonly FromWorkerMessage[] {
    if (!this.state) {
      return [
        {
          type: "worker_error",
          protocolVersion: WORKER_PROTOCOL_VERSION,
          code: "internal_error",
          messageKey: "worker_error.no_state_loaded",
        },
      ];
    }
    const { state, events } = applyCommand(this.state, command);
    this.state = state;
    this.appendToLog(events);

    const messages: FromWorkerMessage[] = [];
    const triggeringReason = this.snapshotReasonFor(events);
    if (triggeringReason) {
      this.saveStatus = "saving";
      messages.push(this.snapshotReadyMessage(triggeringReason));
    } else {
      this.saveStatus = "pending_changes";
    }
    messages.push(this.projectionsMessage());
    return messages;
  }

  private handleTick(nowMs: number): readonly FromWorkerMessage[] {
    if (!this.state) return [];
    const elapsedRealSeconds = this.lastTickNowMs === null ? 0 : (nowMs - this.lastTickNowMs) / 1000;
    this.lastTickNowMs = nowMs;
    if (elapsedRealSeconds <= 0) return [];

    const { state, events } = advanceSimulation(this.state, elapsedRealSeconds);
    this.state = state;
    this.appendToLog(events);

    const messages: FromWorkerMessage[] = [];
    const triggeringReason = this.snapshotReasonFor(events);
    if (triggeringReason) {
      this.saveStatus = "saving";
      messages.push(this.snapshotReadyMessage(triggeringReason));
    }
    messages.push(this.projectionsMessage());
    return messages;
  }

  private requestSnapshot(reason: SnapshotReason): readonly FromWorkerMessage[] {
    if (!this.state) return [];
    this.saveStatus = "saving";
    return [this.snapshotReadyMessage(reason), this.projectionsMessage()];
  }

  private snapshotReasonFor(events: readonly DomainEvent[]): SnapshotReason | null {
    for (const event of events) {
      if (event.type === "game_created") return "game_created";
    }
    for (const event of events) {
      if (event.type === "speed_or_pause_changed") return "session_pause_or_relevant_change";
      if (event.type === "priority_changed") return "priority_changed";
      if (SNAPSHOT_TRIGGERING_EVENT_TYPES.has(event.type)) return "order_settled";
    }
    return null;
  }

  private appendToLog(events: readonly DomainEvent[]): void {
    for (const event of events) {
      this.operationalLog.push(toOperationalLogEntry(event));
    }
    if (this.operationalLog.length > OPERATIONAL_LOG_MAX_ENTRIES) {
      this.operationalLog = this.operationalLog.slice(-OPERATIONAL_LOG_MAX_ENTRIES);
    }
  }

  private snapshotReadyMessage(reason: SnapshotReason): FromWorkerMessage {
    if (!this.state || !this.gameSaveId) {
      throw new Error("No se puede pedir snapshot sin estado ni gameSaveId cargados.");
    }
    return {
      type: "snapshot_ready",
      protocolVersion: WORKER_PROTOCOL_VERSION,
      gameSaveId: this.gameSaveId,
      expectedRevision: this.revision,
      reason,
      state: this.state,
      events: [],
    };
  }

  private projectionsMessage(): FromWorkerMessage {
    if (!this.state || !this.gameSaveId) {
      throw new Error("No se pueden construir proyecciones sin estado cargado.");
    }
    const projections = buildWorkerProjections({
      state: this.state,
      gameSaveId: this.gameSaveId,
      revision: this.revision,
      saveStatus: this.saveStatus,
      lastSavedSimSeconds: this.lastSavedSimSeconds,
      operationalLog: this.operationalLog,
    });
    return { type: "projections", protocolVersion: WORKER_PROTOCOL_VERSION, projections };
  }
}
