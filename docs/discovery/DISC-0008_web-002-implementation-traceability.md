# DISC-0008 — Matriz de trazabilidad de implementación de WEB-002

## Responsabilidad

Documento vivo, actualizado en cada subhito de `WEB-002` (no una síntesis
cerrada de diseño): registra qué bloque de requisitos de la
especificación maestra `prompts/WEB-002_jobs-needs-semantic-world-exploitation.md`
cubre cada subhito (S1-S11), su estado real y su evidencia (decisión,
código, pruebas). Existe por instrucción expresa de Dennis
("Mantén una matriz de trazabilidad para impedir que se pierdan
requisitos") al dividir `WEB-002` en subhitos. No sustituye a `DEC-0015`
a `DEC-0017` (y las que sigan): esta tabla enlaza a ellas, no repite su
contenido.

## Qué no pertenece aquí

- El detalle funcional completo de cada decisión: vive en su `DEC-00XX`.
- El estado operativo general del proyecto: vive en `docs/STATUS.md`.

## Convención de estado

- `cerrado` — implementado, probado y documentado en un subhito ya
  completado.
- `pendiente` — todavía no iniciado; subhito futuro asignado según el
  desglose de la instrucción original de Dennis.
- `parcial` — el subhito que lo cubre está en curso o cubre solo una
  parte declarada del bloque (se anota qué falta).

## Matriz

| Bloque de WEB-002 | Referencia | Subhito | Estado | Evidencia |
|---|---|---|---|---|
| Evolución determinista a `SimulationStateV2` | §6 | S1 | `cerrado` | [DEC-0015](../decisions/DEC-0015_simulation-state-v2-skeleton-and-v1-migration.md) |
| Migración V1→V2 | §25.1 | S1 | `cerrado` | [DEC-0015](../decisions/DEC-0015_simulation-state-v2-skeleton-and-v1-migration.md), `migrate-v1-to-v2.ts` |
| Generación semántica y reproducible del pueblo | §7 | S2 | `cerrado` | [DEC-0016](../decisions/DEC-0016_semantic-village-generator.md) |
| Lugares, edificios, estancias, accesos y zonas (geometría) | §6.3, §8 | S2 | `cerrado` | [DEC-0016](../decisions/DEC-0016_semantic-village-generator.md), `generator/buildings.ts` |
| Runtime activo de `SimulationStateV2` (Worker/protocolo/comandos/eventos/proyecciones) | §5.1 | S3 | `cerrado` | [DEC-0017](../decisions/DEC-0017_v2-playable-runtime-navigation-and-discovery.md) |
| Reloj y avance determinista V2 | §5.2 | S3 | `cerrado` | [DEC-0017](../decisions/DEC-0017_v2-playable-runtime-navigation-and-discovery.md), `advance-simulation-v2.ts` |
| Movimiento de personas V2 (ubicación única, sin dos posiciones autoritativas) | §5.3 | S3 | `cerrado` | [DEC-0017](../decisions/DEC-0017_v2-playable-runtime-navigation-and-discovery.md), `apply-command-v2.ts` |
| Navegación exterior/interior sobre el pueblo semántico | §5.4 | S3 | `cerrado` | [DEC-0017](../decisions/DEC-0017_v2-playable-runtime-navigation-and-discovery.md), `navigation-v2.ts`, `room-graph.ts`, `pathfinding-v2.ts` |
| Niebla y conocimiento (sin fuga por cámara/proyección) | §5.5 | S3 | `cerrado` | [DEC-0017](../decisions/DEC-0017_v2-playable-runtime-navigation-and-discovery.md), `build-projections-v2.ts` |
| Descubrimiento progresivo (pasivo/causal, sin acciones activas) | §5.6 | S3 | `cerrado` (solo el descubrimiento pasivo; las acciones activas de reconocer/observar/inspeccionar/registrar quedan para S4) | [DEC-0017](../decisions/DEC-0017_v2-playable-runtime-navigation-and-discovery.md), `discovery.ts` |
| Acceso e interiores (entrar/salir de un edificio) | §5.7 | S3 | `cerrado` | [DEC-0017](../decisions/DEC-0017_v2-playable-runtime-navigation-and-discovery.md), `e2e/village-runtime.spec.ts` |
| Proyecciones seguras V2 | §5.8 | S3 | `cerrado` | [DEC-0017](../decisions/DEC-0017_v2-playable-runtime-navigation-and-discovery.md), `build-projections-v2.ts` |
| Interfaz jugable V2 (`/village/[id]` como laboratorio real) | §5.9 | S3 | `cerrado` | [DEC-0017](../decisions/DEC-0017_v2-playable-runtime-navigation-and-discovery.md), `village-screen.tsx`, `village-map-canvas.tsx` |
| Persistencia y concurrencia del runtime V2 | §5.10 | S3 | `cerrado` | [DEC-0017](../decisions/DEC-0017_v2-playable-runtime-navigation-and-discovery.md), `worker-runtime-v2.integration.test.ts` |
| Motor común de resolución directa/D/B, tiradas, márgenes, críticos/pifias | §5 (fuera de alcance de S3) | S4 | `pendiente` | — |
| Acciones activas completas de reconocer/observar/inspeccionar/registrar | §5.6 (fuera de alcance de S3) | S4 | `pendiente` | — |
| Trabajos, fases laborales, designaciones, planificador | §11 | S5 | `pendiente` | — |
| Necesidades causales evolutivas y primer ciclo jugable completo | §14 | S6 | `pendiente` | — |
| Objetos profundos, inventarios, recursos, transformaciones | §15 | S7 | `pendiente` | — |
| Recogida, carga, transporte, descarga | §16-17 | S8 | `pendiente` | — |
| Explotación progresiva de edificios (cinco capas) | §8.6 | S9 | `pendiente` | — |
| Agricultura y terreno mutable inicial | §18, §20 | S10 | `pendiente` | — |
| Persistencia final, interfaz, observabilidad, pruebas y cierre documental de WEB-002 | (cierre general) | S11 | `pendiente` | — |

## Notas

- Los bloques "Evolución determinista..." a "Lugares, edificios..." se
  heredan del desglose original presentado por el agente al recibir la
  instrucción de subhitos; los bloques de S3 en adelante se derivan
  directamente de las secciones §5.1-§5.10 y §6 en adelante de
  `WEB-002` según cada encargo de subhito recibido.
- Un bloque marcado `cerrado` significa que ese subhito lo implementó,
  probó y documentó — no que agote para siempre todo matiz de la sección
  de WEB-002 referenciada si un subhito posterior necesita ampliarlo
  (p. ej. el descubrimiento pasivo de S3 seguirá extendiéndose cuando S4
  añada las acciones activas de la misma sección §5.6).
- Ningún bloque de S4 en adelante se marca `cerrado` hasta que exista una
  entrega de código real, probada y documentada para él (ver `DOC-001`).
