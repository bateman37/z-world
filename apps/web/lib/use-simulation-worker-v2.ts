"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FromWorkerMessageV2, SimulationCommand, SimulationStateV2, WorkerProjectionsV2 } from "@z-world/contracts";
import { WORKER_PROTOCOL_VERSION_V2 } from "@z-world/contracts";
import { saveSnapshotV2Action } from "@/app/actions/games";

export interface UseSimulationWorkerV2Result {
  readonly projections: WorkerProjectionsV2 | null;
  readonly workerFatalError: string | null;
  readonly sendCommand: (command: SimulationCommand) => void;
  readonly requestManualSave: () => void;
  readonly retrySave: () => void;
}

let commandCounter = 0;
export function nextCommandIdV2(): string {
  commandCounter += 1;
  return `client-cmd-v2-${Date.now()}-${commandCounter}`;
}

/**
 * Conecta React con el Web Worker del runtime V2 (S3 §5.1). Misma forma
 * que `useSimulationWorker` de V1: React nunca decide reglas, solo emite
 * comandos y consume proyecciones; el round-trip de persistencia vive
 * aquí porque el Worker no puede importar Prisma.
 */
export function useSimulationWorkerV2(gameSaveId: string, initialState: SimulationStateV2, initialRevision: number): UseSimulationWorkerV2Result {
  const workerRef = useRef<Worker | null>(null);
  const [projections, setProjections] = useState<WorkerProjectionsV2 | null>(null);
  const [workerFatalError, setWorkerFatalError] = useState<string | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL("../workers/simulation-v2.worker.ts", import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<FromWorkerMessageV2>) => {
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
      protocolVersion: WORKER_PROTOCOL_VERSION_V2,
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
    workerRef.current?.postMessage({ type: "command", protocolVersion: WORKER_PROTOCOL_VERSION_V2, command });
  }, []);

  const requestManualSave = useCallback(() => {
    workerRef.current?.postMessage({ type: "request_snapshot", protocolVersion: WORKER_PROTOCOL_VERSION_V2 });
  }, []);

  const retrySave = useCallback(() => {
    workerRef.current?.postMessage({ type: "retry_save", protocolVersion: WORKER_PROTOCOL_VERSION_V2 });
  }, []);

  return { projections, workerFatalError, sendCommand, requestManualSave, retrySave };
}

async function persistSnapshot(worker: Worker, message: Extract<FromWorkerMessageV2, { type: "snapshot_ready" }>): Promise<void> {
  try {
    const result = await saveSnapshotV2Action({
      gameSaveId: message.gameSaveId,
      expectedRevision: message.expectedRevision,
      state: message.state,
      events: message.events,
      reason: message.reason,
      attemptId: message.attemptId,
    });
    if (result.ok) {
      worker.postMessage({ type: "snapshot_persisted", protocolVersion: WORKER_PROTOCOL_VERSION_V2, revision: result.revision, attemptId: message.attemptId });
    } else {
      worker.postMessage({ type: "snapshot_persist_failed", protocolVersion: WORKER_PROTOCOL_VERSION_V2, code: "revision_conflict", attemptId: message.attemptId });
    }
  } catch {
    worker.postMessage({ type: "snapshot_persist_failed", protocolVersion: WORKER_PROTOCOL_VERSION_V2, code: "server_error", attemptId: message.attemptId });
  }
}
