"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FromWorkerMessage, SimulationCommand, SimulationStateV1, WorkerProjections } from "@z-world/contracts";
import { WORKER_PROTOCOL_VERSION } from "@z-world/contracts";
import { saveSnapshotAction } from "@/app/actions/games";

export interface UseSimulationWorkerResult {
  readonly projections: WorkerProjections | null;
  readonly workerFatalError: string | null;
  readonly sendCommand: (command: SimulationCommand) => void;
  readonly requestManualSave: () => void;
}

let commandCounter = 0;
export function nextCommandId(): string {
  commandCounter += 1;
  return `client-cmd-${Date.now()}-${commandCounter}`;
}

/**
 * Conecta React con el Web Worker de simulación (§8.1). React nunca decide
 * reglas: solo emite comandos y consume proyecciones. El round-trip de
 * persistencia (`snapshot_ready` → server action → `snapshot_persisted`/
 * `snapshot_persist_failed`) vive aquí porque el Worker no puede importar
 * Prisma.
 */
export function useSimulationWorker(gameSaveId: string, initialState: SimulationStateV1, initialRevision: number): UseSimulationWorkerResult {
  const workerRef = useRef<Worker | null>(null);
  const [projections, setProjections] = useState<WorkerProjections | null>(null);
  const [workerFatalError, setWorkerFatalError] = useState<string | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL("../workers/simulation.worker.ts", import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<FromWorkerMessage>) => {
      const message = event.data;
      if (message.type === "projections") {
        setProjections(message.projections);
      } else if (message.type === "worker_error") {
        setWorkerFatalError(message.messageKey);
      } else if (message.type === "snapshot_ready") {
        void persistSnapshot(worker, message);
      }
    };

    worker.onerror = () => {
      setWorkerFatalError("worker_error.crashed");
    };

    worker.postMessage({
      type: "load_state",
      protocolVersion: WORKER_PROTOCOL_VERSION,
      gameSaveId,
      revision: initialRevision,
      state: initialState,
    });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameSaveId]);

  const sendCommand = useCallback((command: SimulationCommand) => {
    workerRef.current?.postMessage({ type: "command", protocolVersion: WORKER_PROTOCOL_VERSION, command });
  }, []);

  const requestManualSave = useCallback(() => {
    workerRef.current?.postMessage({ type: "request_snapshot", protocolVersion: WORKER_PROTOCOL_VERSION });
  }, []);

  return { projections, workerFatalError, sendCommand, requestManualSave };
}

async function persistSnapshot(
  worker: Worker,
  message: Extract<FromWorkerMessage, { type: "snapshot_ready" }>,
): Promise<void> {
  try {
    const result = await saveSnapshotAction({
      gameSaveId: message.gameSaveId,
      expectedRevision: message.expectedRevision,
      state: message.state,
      events: message.events,
      reason: message.reason,
    });
    if (result.ok) {
      worker.postMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION, revision: result.revision });
    } else {
      worker.postMessage({ type: "snapshot_persist_failed", protocolVersion: WORKER_PROTOCOL_VERSION, code: "revision_conflict" });
    }
  } catch {
    worker.postMessage({ type: "snapshot_persist_failed", protocolVersion: WORKER_PROTOCOL_VERSION, code: "server_error" });
  }
}
