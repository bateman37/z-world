import { WorkerSessionV2 } from "@z-world/application";
import { WORKER_PROTOCOL_VERSION_V2 } from "@z-world/contracts";

/**
 * Archivo real del Web Worker del runtime V2 (S3 de WEB-002 §5.1).
 * Deliberadamente delgado, igual que `simulation.worker.ts` de WEB-001:
 * toda la lógica vive en `WorkerSessionV2` (framework-agnóstica, en
 * `packages/application`). Es un archivo de entrada separado del Worker
 * V1 (no una rama condicional dentro del mismo) para no arriesgar ninguna
 * regresión sobre la ruta V1 ya probada: cada partida abre el Worker que
 * corresponde a su `schemaVersion`, decidido en la página del servidor.
 * Nunca importa Prisma, React ni Next.js.
 */
interface MinimalWorkerScope {
  onmessage: ((event: MessageEvent<unknown>) => void) | null;
  postMessage(message: unknown): void;
}

const workerScope = self as unknown as MinimalWorkerScope;
const session = new WorkerSessionV2();

const TICK_INTERVAL_MS = 250;

workerScope.onmessage = (event: MessageEvent<unknown>) => {
  const responses = session.handleMessage(event.data);
  for (const response of responses) {
    workerScope.postMessage(response);
  }
};

setInterval(() => {
  const responses = session.handleMessage({
    type: "tick",
    protocolVersion: WORKER_PROTOCOL_VERSION_V2,
    nowMs: Date.now(),
  });
  for (const response of responses) {
    workerScope.postMessage(response);
  }
}, TICK_INTERVAL_MS);
