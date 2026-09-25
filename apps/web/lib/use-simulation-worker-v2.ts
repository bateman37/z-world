"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FromWorkerMessageV2, SimulationCommand, SimulationStateV2, StructuralProjectionsV2, TickProjectionsV2, WorkerProjectionsV2 } from "@z-world/contracts";
import { WORKER_PROTOCOL_VERSION_V2, parseFromWorkerMessageV2 } from "@z-world/contracts";
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

function mergeProjections(structural: StructuralProjectionsV2, tick: TickProjectionsV2): WorkerProjectionsV2 {
  const { mapEntitiesStatic, ...structuralRest } = structural;
  const { mapPeople, ...tickRest } = tick;
  return { ...structuralRest, ...tickRest, mapEntities: { ...mapEntitiesStatic, people: mapPeople } };
}

/**
 * Conecta React con el Web Worker del runtime V2 (S3 §5.1). Misma forma
 * que `useSimulationWorker` de V1: React nunca decide reglas, solo emite
 * comandos y consume proyecciones; el round-trip de persistencia vive
 * aquí porque el Worker no puede importar Prisma.
 *
 * El protocolo V3 (S11 §5.2) separa `structural_projections` (geometría
 * del mundo, edificios, niebla: cambia raramente) de `tick_projections`
 * (todo lo demás: cambia en cada tick). Este hook es el único lugar que
 * conoce esa partición — recompone el mismo `WorkerProjectionsV2` de
 * siempre para que ningún componente consumidor tenga que cambiar. La
 * secuencia monotónica de ambos canales detecta duplicados, huecos y
 * deltas sobre una base estructural incorrecta; cualquiera de esos casos
 * pide una resincronización completa en vez de aplicar un estado a
 * medias.
 */
export function useSimulationWorkerV2(gameSaveId: string, initialState: SimulationStateV2, initialRevision: number): UseSimulationWorkerV2Result {
  const workerRef = useRef<Worker | null>(null);
  const [projections, setProjections] = useState<WorkerProjectionsV2 | null>(null);
  const [workerFatalError, setWorkerFatalError] = useState<string | null>(null);
  const structuralRef = useRef<StructuralProjectionsV2 | null>(null);
  const structuralSequenceRef = useRef(0);
  const lastSequenceRef = useRef(0);

  useEffect(() => {
    const worker = new Worker(new URL("../workers/simulation-v2.worker.ts", import.meta.url));
    workerRef.current = worker;
    structuralRef.current = null;
    structuralSequenceRef.current = 0;
    lastSequenceRef.current = 0;

    worker.onmessage = (event: MessageEvent<unknown>) => {
      // S11 §5.1: un payload que no cumpla el protocolo (versión
      // incompatible, `postMessage` corrupto, bug de serialización) nunca
      // se trata como mensaje válido — React se detiene con un error
      // tipado en vez de representar un estado a medias.
      const parsed = parseFromWorkerMessageV2(event.data);
      if (!parsed.success || !parsed.data) {
        setWorkerFatalError("worker_error.invalid_payload");
        return;
      }
      const message = parsed.data;

      if (message.type === "structural_projections") {
        if (message.sequence <= lastSequenceRef.current) return; // duplicado o fuera de orden: se ignora, idempotente.
        structuralRef.current = message.structural;
        structuralSequenceRef.current = message.sequence;
        lastSequenceRef.current = message.sequence;
        return;
      }

      if (message.type === "tick_projections") {
        if (message.sequence <= lastSequenceRef.current) return; // duplicado o fuera de orden: se ignora, idempotente.
        if (message.structuralSequence !== structuralSequenceRef.current) {
          // Hueco de secuencia o delta sobre una base estructural que este
          // cliente no tiene aplicada (Worker reiniciado, tab suspendida y
          // retomada, mensaje perdido): nunca se aplica sobre una base
          // incorrecta — se pide resincronización completa.
          lastSequenceRef.current = message.sequence;
          workerRef.current?.postMessage({ type: "request_resync", protocolVersion: WORKER_PROTOCOL_VERSION_V2 });
          return;
        }
        lastSequenceRef.current = message.sequence;
        if (structuralRef.current) {
          setProjections(mergeProjections(structuralRef.current, message.tick));
        }
        return;
      }

      if (message.type === "worker_error") {
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

    // Tab suspendida y retomada (S11 §5.5): al volver a estar visible, se
    // pide una resincronización completa en vez de confiar en que ningún
    // mensaje se perdió mientras la pestaña estaba en segundo plano.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        workerRef.current?.postMessage({ type: "request_resync", protocolVersion: WORKER_PROTOCOL_VERSION_V2 });
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
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
