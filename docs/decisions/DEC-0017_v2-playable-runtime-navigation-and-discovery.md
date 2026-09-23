---
id: DEC-0017
title: Runtime jugable V2, navegación y descubrimiento progresivo (WEB-002 S3)
status: approved
canonical_for:
  - protocolo Worker V2 versionado (WORKER_PROTOCOL_VERSION_V2 = 2) como variante discriminada de la de V1, no una mutación
  - location EntityLocation como autoridad única de posición; public.position como proyección derivada sincronizada en una sola frontera
  - estrategia de navegación híbrida exterior (rejilla)/interior (grafo de accesos por edificio) y su corrección del vínculo Building.activeFloorId
  - interpretación de cierres/obstrucciones en S3 (qué se considera transitable sin acciones activas de forzar/abrir/reparar)
  - reglas provisionales de visibilidad y descubrimiento progresivo comunitario
  - filtrado de proyecciones V2 por descubrimiento, no por SimulationStateV2 completo
  - límite de tamaño de cuerpo de las Server Actions y coalescencia de guardados en WorkerSessionV2
  - límites explícitos de lo que S3 no implementa todavía
depends_on:
  - DEC-0015
  - DEC-0016
related:
  - DEC-0014
  - ARC-004
  - WLD-008
  - WLD-011
  - RDM-003
---

## Contexto

`WEB-002` §5 exige que una partida creada con el generador de S2 se abra
como una simulación V2 realmente activa — reloj, movimiento, navegación,
niebla y descubrimiento reales sobre el pueblo generado — y no como una
imagen estática del mundo. Antes de este subhito existían dos líneas
desconectadas: `/game/[id]` (Worker, reloj, movimiento y niebla reales,
pero sobre `SimulationStateV1` y el fixture de `WEB-001`) y
`/village/[id]` (visor de solo lectura de `SimulationStateV2`, sin
Worker ni comandos). Este es el subhito S3: extiende el runtime del
Worker a V2 y convierte `/village/[id]` en el laboratorio jugable real,
sin regenerar ni duplicar la geometría interior que S2 ya crea (lugares,
edificios, plantas, estancias, aberturas y cierres).

## Decisión

1. **Protocolo Worker V2 versionado, no una mutación del de V1.**
   `WORKER_PROTOCOL_VERSION_V2 = 2` (`packages/contracts/src/worker-protocol-v2.ts`)
   define una unión discriminada Zod independiente de la de V1
   (`protocolVersion: 1` sigue existiendo intacta). Un mensaje V1 enviado a
   una sesión V2 — o viceversa — no encaja en ninguno de los dos esquemas y
   se rechaza con `worker_error.invalid_payload`, nunca se confunde en
   silencio. `SimulationCommand` (los seis comandos de V1) y la mayoría de
   `DomainEvent` se reutilizan sin cambios (`DomainEventV2` es un
   superconjunto aditivo en `events-v2.ts`, con `room_entered`,
   `room_exited` y `discovery_upgraded` nuevos). V1 sigue siendo el runtime
   de partidas `schemaVersion: 1` existentes; ningún subhito futuro tiene
   todavía fecha de retirada para esa ruta.
2. **`WorkerSessionV2` como clase separada, deliberadamente análoga a
   `WorkerSession`.** Mismo ciclo de vida de mensajes, mismo manejo de
   `saveStatus` y del registro operacional que V1, para que ambas sesiones
   sean auditablemente equivalentes en su infraestructura — pero sin
   modificar la clase V1 ya probada (evita cualquier riesgo de regresión
   sobre WEB-001). Solo difieren en qué reductor/avance puro invocan
   (`applyCommandV2`/`advanceSimulationV2`) y en que V2 construye un
   índice de navegación una única vez al cargar la partida
   (`buildFullNavigationIndexV2`), nunca por comando.
3. **`location: EntityLocation` es la única autoridad de posición.**
   `PersonStateV2.public.position` (heredado de V1) es una proyección
   derivada, sincronizada en una única frontera: `advanceSimulationV2`
   actualiza ambos campos juntos en cada paso, nunca por separado.
   `MovementOrder` gana un campo aditivo y opcional,
   `locationCheckpoints` (`packages/contracts/src/person.ts`), calculado
   por el pathfinder híbrido: marca en qué distancia acumulada de la ruta
   cambia la ubicación lógica (exterior ↔ estancia). V1 nunca lo rellena,
   así que las órdenes V1 siguen siendo válidas sin él (extensión aditiva,
   mismo patrón que S2 usó para `Opening.connectsOtherRoomId`).
   `validateSimulationStateV2Invariants` gana `checkPositionLocationCoherence`,
   que detecta cualquier divergencia entre ambas representaciones cuando
   `location.kind === "world_point"`.
4. **Navegación híbrida: rejilla exterior + grafo de accesos por
   edificio, no una rejilla de alta resolución sobre los 9 km².**
   `buildWalkabilityGridV2` (`packages/simulation-core/src/v2/navigation-v2.ts`)
   rasteriza terreno/vías/edificios con cajas delimitadoras por entidad
   (imprescindible a esta escala: ~600×600 celdas frente a las ~60×60 de
   V1) y usa A* con montículo binario (`pathfinding-v2.ts`) en vez del
   escaneo lineal de V1, que sería O(n²) sobre una rejilla 100 veces mayor.
   El interior de cada edificio con planta activa se modela como un grafo
   pequeño (`room-graph.ts`): nodos = centroide de cada estancia, aristas =
   aberturas interiores transitables, más "puentes" desde el nodo de
   estancia hasta la celda exterior transitable más cercana a cada abertura
   que conecta con el exterior. El coste de cada arista interior es una
   aproximación de línea recta entre centroides — provisional y
   documentada, no un pathfinding geométrico dentro de la estancia,
   innecesario para el alcance de S3. `findPathV2` compone hasta tres
   tramos (salida de estancia → rejilla exterior → entrada a estancia)
   según el tipo de ancla de inicio/destino.
5. **Corrección de un defecto real de S2: `Building.activeFloorId` no se
   rellena en la práctica.** Al construir el grafo de accesos se descubrió
   que el generador de S2 crea `Floor` reales con `active: true` pero deja
   `Building.activeFloorId` en `null` — con la lectura estricta original
   (`buildBuildingNavIndex` exigiendo ese puntero), ningún edificio
   generado era realmente navegable, y por tanto tampoco entrable, pese a
   tener interior real. Se corrigió para buscar la planta activa real por
   `buildingId` cuando `activeFloorId` no está poblado, en vez de fallar
   silenciosamente. No se modificó el generador de S2 (fuera del alcance
   de este subhito); un subhito futuro puede decidir si rellenar el campo
   en origen es preferible a esta tolerancia en la lectura.
6. **Interpretación de cierres/obstrucciones en S3, sin forzar/abrir.**
   Una abertura es transitable (`isOpeningPassable` en `room-graph.ts`) si
   no tiene ninguna `Obstruction` registrada y, cuando tiene un
   `InstalledClosure`, su estado no es `locked` (`open`, `closed` sin
   llave o `destroyed` se interpretan como pasables: cruzar una puerta
   cerrada sin llave es una acción pasiva de caminar, no un trabajo).
   `locked` bloquea el paso; forzar, abrir con llave, reparar, tapiar o
   destruir un cierre quedan fuera de alcance de S3 y se presentan como
   bloqueo operativo (`no_known_route`), nunca como decisión de
   personalidad ni con un botón que simule esas acciones.
7. **Visibilidad y descubrimiento progresivo comunitario, con reglas
   provisionales y centralizadas.** El conocimiento pertenece a la
   comunidad (igual que la niebla ya hacía en V1): cualquiera de las seis
   personas que observe algo lo descubre para todas. `discovery.ts` define
   tres radios provisionales y documentados
   (`DISCOVERY_SIGHT_RADIUS_METERS = 50` para silueta,
   `DISCOVERY_OBSERVE_RADIUS_METERS = 25` para exterior reconocido —
   coincide deliberadamente con el radio de niebla ya existente —,
   `DISCOVERY_ACCESS_RADIUS_METERS = 8` para una abertura concreta) y
   distingue causalmente: terreno visto (niebla, sin `DiscoveryRecord`
   propio, ya que sus entidades no tienen ID individual), silueta/exterior
   de un lugar (`facet: "exterior"`, `sighted`→`observed`), estructura de
   un edificio conocida (`facet: "structure"`, solo al observar su lugar
   de cerca), una abertura descubierta (`facet: "accesses"`, por
   proximidad exterior o por estar dentro de la estancia que conecta), y
   una estancia descubierta (`facet: "rooms"`, solo al ocupar
   físicamente esa estancia — nunca por proximidad exterior ni por
   conocer el edificio). `content`/`furniture`/`installations`
   (`DiscoveryRecord.facet` ya los define en `place-history-v2.ts`) quedan
   sin tocar hasta que las acciones activas de reconocer/inspeccionar
   lleguen en un subhito posterior: S3 solo implementa descubrimiento
   pasivo o causado por desplazamiento y acceso físico, nunca acciones
   activas con comprobación. El conocimiento es monótono (nunca retrocede
   al alejarse); `validateSimulationStateV2Invariants` gana
   `checkDiscoveryRecordsValid` (sin duplicados por entidad+faceta, sin
   referencias a entidades inexistentes — incluidos los `NaturalOrTechnicalNode`
   que S2 ya usaba como objetivo válido de la faceta `exterior`) y
   `checkFogGridShape`.
8. **Proyecciones V2 filtradas por descubrimiento, nunca el estado
   completo.** `buildWorkerProjectionsV2`
   (`packages/application/src/build-projections-v2.ts`) reutiliza sin
   cambios los sub-tipos de proyección de V1 que ya eran válidos para V2
   (`ClockProjection`, `SaveStatusProjection`, `PersonCardProjection`,
   `PersonSheetProjection`, `FogMaskProjection`, `MovementProjection`,
   `OperationalLogEntryProjection`) y añade solo lo que cambia: el mundo
   espacial. Un lugar solo aparece si su faceta `exterior` es al menos
   `sighted`, y su `profileId` se omite (silueta, `null`) hasta que sea
   `observed`, para no filtrar el tipo de lugar por adelantado. Edificios,
   estancias y aberturas exigen su faceta propia en `observed`. El terreno
   se filtra por niebla, igual que V1. Ningún componente de React recibe
   `SimulationStateV2` íntegro.
9. **Límite de cuerpo de las Server Actions ampliado a 10 MB.** El
   snapshot JSON de un pueblo generado por S2 pesa ~1,2 MB — por encima
   del límite por defecto de 1 MB de las Server Actions de Next.js. Sin
   este ajuste (`experimental.serverActions.bodySizeLimit` en
   `next.config.mjs`), todo guardado V2 fallaba en silencio hacia
   `saveStatus: "save_error"` sin ningún error visible más allá del log
   del servidor: un defecto real descubierto por la prueba E2E de este
   subhito, no una hipótesis. 10 MB deja margen para semillas más grandes
   y para los subhitos futuros que añaden más colecciones al estado.
10. **Coalescencia de guardados en `WorkerSessionV2`.** Un estado V2 real
    tarda lo bastante en ir y volver al servidor (~1 MB) como para que dos
    eventos que disparan guardado ocurran dentro de ese intervalo (p. ej.
    `move_order_accepted` seguido de `room_entered` en el siguiente tick).
    Sin coalescer, el segundo `snapshot_ready` usaría una
    `expectedRevision` ya obsoleta y provocaría un `revision_conflict`
    contra la propia sesión, no contra otra pestaña — un defecto real
    encontrado por la prueba E2E de este subhito. `WorkerSessionV2` ahora
    encola la razón pendiente (`pendingSnapshotReason`) mientras un
    guardado sigue en vuelo y encadena automáticamente el siguiente al
    recibir `snapshot_persisted`. El mismo riesgo existe idénticamente en
    `WorkerSession` de V1 (comparte la estructura), pero no se corrige ahí
    en este subhito para no tocar código ya probado de WEB-001 fuera de lo
    que S3 pidió extender; queda registrado como deuda conocida.
11. **Rendimiento medido, sin optimización definitiva.**
    `buildWalkabilityGridV2` construye una rejilla de 600×600 celdas (mundo
    de ~3×3 km a 5 m de resolución) en menos de 5 s incluso en el caso de
    prueba deliberadamente amplio (ver `navigation-v2.test.ts`); en la
    práctica, sobre un mundo real generado por S2 (bordes ajustados al
    asentamiento, no 3×3 km completos), la construcción es sensiblemente
    más rápida. El Canvas del mapa (`village-map-canvas.tsx`) solo
    recorre las celdas de niebla visibles en el viewport actual, no la
    rejilla completa, a diferencia del Canvas de V1 (aceptable ahí por su
    tamaño pequeño, no escalable al mundo V2). No se midió ni se optimizó
    más allá de evitar estas dos regresiones evidentes.

## Razones

- **Separar protocolo/sesión por versión, no por rama condicional**, evita
  que un error de tipos entre V1 y V2 se cuele en tiempo de ejecución: dos
  discriminated unions distintas son más seguras que una sola con un campo
  opcional que distinga el caso.
- **`location` como autoridad única con `position` derivado** es la única
  forma de que S4 (motor de resolución) y S5 (trabajos) puedan razonar
  sobre "dónde está una persona" sin ambigüedad, cumpliendo el requisito
  expreso del encargo de no tener dos posiciones autoritativas que puedan
  divergir.
- **Grafo de accesos en vez de rejilla interior de alta resolución**
  evita construir y mantener en memoria una estructura desproporcionada
  (decenas de estancias por cada una de las 55-85 construcciones) para un
  problema — moverse dentro de una vivienda pequeña — que no lo necesita
  a esta escala del juego.
- **Descubrimiento pasivo, nunca activo, en S3** respeta la instrucción
  expresa de no adelantar las acciones de reconocer/observar/inspeccionar/
  registrar, que pertenecen al motor de resolución de S4.

## Consecuencias

- S4 (motor de resolución directa/D/B) debe decidir cómo las
  comprobaciones D/B interactúan con `location`/`locationCheckpoints` sin
  reinterpretar su forma.
- S5 (trabajos/planificador) puede asumir que `location` siempre resuelve
  a una entidad real (invariante ya garantizada) y que el grafo de
  accesos por edificio es reutilizable para planificar tareas dentro de
  interiores, sin reconstruirlo.
- La deuda de coalescencia de guardados en `WorkerSession` (V1) queda
  registrada pero no resuelta; cualquier subhito que toque ese archivo
  debe considerar portar la misma corrección si introduce eventos más
  frecuentes.
- `Building.activeFloorId` sigue sin poblarse en el generador de S2; la
  tolerancia de lectura de S3 es un parche, no una corrección de origen.
  Un futuro ajuste del generador debe conservar la compatibilidad con
  snapshots ya persistidos que tengan el campo en `null`.

## Alternativas descartadas

- **Reinterpretar el protocolo V1 con un campo de versión opcional en vez
  de una unión discriminada nueva**: se descarta porque permitiría que un
  mensaje malformado de una versión pasara la validación estructural de
  la otra por coincidencia de forma, exactamente lo que el encargo pide
  evitar explícitamente.
- **Rejilla única de alta resolución cubriendo interiores y exterior**:
  se descarta por coste de memoria/cómputo desproporcionado (miles de
  celdas extra por estancia, sin beneficio de precisión a esta escala de
  juego).
- **Corregir el generador de S2 para rellenar `Building.activeFloorId`
  en vez de tolerar su ausencia en la lectura**: se descarta para este
  subhito porque tocar el generador está fuera del alcance declarado de
  S3 y arriesgaría invalidar snapshots ya generados con semillas de
  prueba existentes; queda anotado como consecuencia para un ajuste
  futuro más deliberado.
- **Aplicar la misma corrección de coalescencia de guardados a
  `WorkerSession` de V1**: se descarta en este subhito para no tocar
  código ya probado de WEB-001 sin que el encargo lo pidiera; queda
  como deuda documentada.

## No decisión

Esta decisión no implementa la fórmula común de resolución directa/D/B,
tiradas, márgenes, críticos ni pifias (S4); no implementa las acciones
activas completas de reconocer/observar/inspeccionar/registrar; no
implementa trabajos, fases laborales, designaciones ni planificador (S5);
no implementa degradación causal de necesidades (S6); no implementa
objetos profundos, saqueo, recogida, carga, transporte, almacenamiento,
desmontaje, explotación de las cinco capas de un edificio, agricultura,
modificación de terreno, construcción, amenazas, combate, autonomía,
relaciones dinámicas ni narrativa. Ninguno de esos sistemas se simula con
botones que cambien estados directamente.
