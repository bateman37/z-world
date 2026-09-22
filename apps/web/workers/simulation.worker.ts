import { WorkerSession } from "@z-world/application";

/**
 * Archivo real del Web Worker (capa de presentación, §8.1 de WEB-001).
 * Deliberadamente delgado: toda la lógica vive en `WorkerSession`
 * (framework-agnóstica, en `packages/application`). Este archivo solo
 * conecta `self.onmessage`/`postMessage` y el bucle de `tick` interno.
 * Nunca importa Prisma, React ni Next.js.
 */

/**
 * Forma mínima de `DedicatedWorkerGlobalScope` que necesitamos. Se declara
 * localmente en vez de añadir la librería `webworker` completa a todo el
 * proyecto (que colisiona con los globales de `dom` usados por Next.js).
 */
interface MinimalWorkerScope {
  onmessage: ((event: MessageEvent<unknown>) => void) | null;
  postMessage(message: unknown): void;
}

const workerScope = self as unknown as MinimalWorkerScope;
const session = new WorkerSession();

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
    protocolVersion: 1,
    nowMs: Date.now(),
  });
  for (const response of responses) {
    workerScope.postMessage(response);
  }
}, TICK_INTERVAL_MS);
