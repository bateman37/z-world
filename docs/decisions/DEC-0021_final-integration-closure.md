---
id: DEC-0021
title: Cierre final de integración (WEB-002 S11)
status: approved
canonical_for:
  - protocolo Worker V3 partido en canales estructural/tick con secuencia, referencia estructural y resincronización explícita
  - persistencia idempotente por `attemptId`, buffer real de eventos pendientes, congelación por conflicto de revisión y autosave debounced
  - registro operativo persistente y reconstruible desde eventos, con niveles de atención y agrupación de causas repetidas
  - selección universal del Canvas y ficha contextual común (patrón único, no un componente por clase de entidad)
  - herramientas gráficas de dibujo en el Canvas como flujo primario para zonas/designaciones/barreras, con los formularios numéricos como apoyo técnico secundario
  - reasignación y ritmo/atención de trabajos expuestos en la interfaz, y visibilidad de recursos reservados en el inventario
  - recorrido cruzado completo de barrera/perímetro y harness de rendimiento documentado
  - simplificaciones y límites honestos de S11 y deuda explícita posterior
depends_on:
  - DEC-0015
  - DEC-0016
  - DEC-0017
  - DEC-0018
  - DEC-0019
  - DEC-0020
related:
  - WLD-010
  - SET-010
  - SET-011
  - UI-005
  - UI-006
  - RDM-003
---

## Contexto

`WEB-002` reserva su último subhito (S11) para el cierre final de
integración: la parte de la entrega que S1-S10 dejaron deliberadamente
para el final porque depende de que el resto del motor ya exista —
persistencia definitiva y migración, protocolo Worker de producción,
observabilidad jugable, selección/edición universal en el Canvas y
cierre transversal de pruebas y documentación. A diferencia de S1-S10,
S11 no llegó con un prompt de subhito propio archivado en el
repositorio: la instrucción de cierre se recibió directamente de Dennis
en dos sesiones de trabajo consecutivas sobre la rama
`feat/web-002-s11-final-integration-closure`, con la misma exigencia que
todos los subhitos anteriores: **ningún motor paralelo**, cada pieza
nueva usa el motor de trabajos/resolución/persistencia/proyecciones ya
cerrado por `DEC-0015`-`DEC-0020`.

S11 se dividió en seis bloques (llamados "Puertas" en el historial de
commits, sin relación con las "Puertas A/B/C" de S7-S9), cerrados en
orden y sin reabrir los anteriores:

- **Puerta A** — persistencia final y migración: buffer real de
  eventos, guardado idempotente por `attemptId`, congelación real por
  conflicto de revisión, autosave debounced, migración V1→V2 operativa
  desde la pantalla de inicio.
- **Puerta B** — protocolo del Worker de producción: canales
  estructural/tick separados, validación Zod real de ambas direcciones,
  fronteras de conocimiento cerradas.
- **Puerta C** — observabilidad: registro operativo persistente y
  reconstruible, panel de diagnóstico técnico.
- **Puerta D** — Canvas/interfaz: selección universal, ficha contextual
  común, herramientas gráficas de dibujo, paneles operativos completos.
- **Puerta E** — cierre transversal: recorrido cruzado de barrera/
  perímetro y harness de rendimiento.
- **Puerta F** (este documento y el resto de la reconciliación
  documental) — cierre documental.

## Decisión

### 1. Puerta A: persistencia final y migración

`WorkerSessionV2` deja de enviar `events: []` fijo en cada guardado y
mantiene un `pendingEvents` real: el lote que viaja en `snapshot_ready`
es exactamente lo producido desde el último guardado confirmado, nunca
un placeholder. Cada intento de guardado lleva una `attemptId` estable
generada por el cliente (protocolo Worker V2 y columna Prisma nueva,
migración `s11_snapshot_attempt_id` probada desde una base vacía y
desde el esquema de S10); `saveSnapshotV2` responde idempotentemente a
un reintento del mismo lote ya confirmado (respuesta de red perdida
tras el commit) sin reinsertar snapshot ni eventos, y sigue rechazando
una escritura distinta que llegue con `expectedRevision` obsoleta.
`revision_conflict` congela la sesión de verdad — comandos y ticks
posteriores dejan de mutar el mundo hasta recargar o salir, con una
pantalla bloqueante que solo ofrece esas dos salidas, nunca sobrescribir
en silencio. `save_error` conserva el lote exacto para que `retry_save`
lo reenvíe sin generar uno nuevo, con un botón de reintento visible. La
migración V1→V2 (con su vista previa, resumen de degradación,
confirmación explícita, promoción transaccional, idempotencia y
conservación del respaldo V1) pasa a poder iniciarse directamente desde
la pantalla de inicio, no solo por un flujo separado.

### 2. Puerta B: protocolo Worker V3 en dos canales de cadencia distinta

El mensaje único `"projections"` (protocolo V2) se sustituye por dos
canales con un mismo `sequence` monótono compartido:
`structural_projections` (geometría del mundo, niebla, edificios —
cambia raramente, se reenvía como máximo cada `STRUCTURAL_CADENCE_REAL_MS`
= 1000 ms de tiempo real o al forzarse) y `tick_projections` (reloj,
movimiento, trabajos, registro, fichas de persona — barato, se reenvía
en cada tick/comando). Cada `tick_projections` lleva un
`structuralSequence` que referencia el último paquete estructural real
en el que se apoya, de modo que React puede detectar un mensaje
duplicado, un hueco en la secuencia o un `tick` apoyado en una base
estructural ya obsoleta; ante cualquiera de esos tres casos, o al volver
a la pestaña visible tras un tiempo fuera de foco
(`visibilitychange`), el cliente pide `request_resync` y el Worker
reenvía ambos canales completos con `forceStructural`. `personSheets`
se decidió deliberadamente en el canal barato (`tick`), no en el frío
(`structural`): dejarlo en el estructural habría retrasado hasta un
segundo real la prioridad que alguien acaba de tocar en la interfaz, un
coste de UX que ningún ahorro de payload justifica. Todo el protocolo,
ambas direcciones, se valida con esquemas Zod reales
(`parseToWorkerMessageV2`/`parseFromWorkerMessageV2`); un mensaje que no
valida nunca llega a mutar React. Las pruebas de frontera de
conocimiento (objeto suelto en una habitación sin registrar, objeto
dentro de un contenedor via `on_object`, objeto exterior tras niebla
completamente oculta, barrido genérico de subcadenas prohibidas en las
tres proyecciones) se ampliaron y cierran explícitamente este bloque.

### 3. Puerta C: registro operativo persistente y reconstruible

El registro operativo deja de vivir solo en memoria de React: se
reconstruye desde `domainEventRecord` guardados en PostgreSQL al cargar
o recargar la partida (`listRecentDomainEventsV2`), nunca arranca
vacío. Cada entrada lleva un nivel de atención
(`"log"|"notice"|"important"|"critical"`, derivado por tipo de evento
vía una tabla de clasificación explícita) y se agrupan causas repetidas
sobre la misma entidad dentro de una ventana de tiempo simulado
(`LOG_GROUPING_WINDOW_SIM_SECONDS`), mostrando un contador `×N` en vez
de inundar el panel de ruido idéntico. La interfaz añade filtros por
nivel, un botón "Centrar" por entrada que recentra el Canvas en la
persona relacionada, y un panel de diagnóstico técnico colapsado por
defecto (versión de protocolo, versión de esquema de estado, revisión
vigente, estado de guardado, reloj) que nunca expone calibre, semillas
internas de episodio ni márgenes.

### 4. Puerta D: selección universal del Canvas y ficha contextual común

El Canvas sustituye la selección exclusiva de persona por un
hit-testing priorizado sobre todo lo que tiene geometría real en la
proyección del mapa — persona, abertura, lugar, tramo de barrera,
estancia, parcela de cultivo, edificio, en ese orden de especificidad —
y un único patrón de ficha contextual extensible (`ContextualSheet`)
en vez de un componente por clase de entidad: muestra solo lo conocido
y solo las acciones de `contextualActions` cuyo blanco real coincide
con la selección, reutilizando el filtrado por conocimiento/viabilidad
que ya hace el Worker en vez de reimplementarlo. Seleccionar una
persona en el mapa la sigue marcando como persona actuante (mismo
comportamiento que antes de S11); seleccionar cualquier otra clase de
entidad deja la persona actuante intacta, permitiendo elegir blanco y
actor por separado.

Objetos, contenedores y lotes de recurso quedan **deliberadamente**
fuera de esa selección de Canvas: `MapEntitiesProjectionV2` nunca ha
llevado su posición (no son terreno ni geometría de fondo), así que no
hay nada que seleccionar ahí — siguen siendo completamente
inspeccionables y accionables desde el panel de inventario y las
acciones contextuales, que es donde siempre han vivido. Auditado
explícitamente contra el mandato completo de esta puerta (objetos,
contenedores, lotes de recurso, trabajos, zonas, puntos de
transferencia, inventario/almacenamiento, recursos reservados, objetos
en tránsito): el único hueco real encontrado fue que un objeto o lote
reservado por un trabajo (`reservedByJobId`/`ownerOrReservedByJobId`,
ya usado desde S5 para bloquear acciones contextuales) nunca llegaba a
la proyección de inventario ni se mostraba en ningún sitio — cerrado
añadiendo el campo a `InventoryEntryProjection` y mostrándolo como
"reservado para «trabajo»" en el panel.

El Canvas pasa a ser el flujo **primario** para trazar zonas,
designaciones de área y tramos de barrera — clic por vértice con
previsualización en vivo, cierre explícito (clic cerca del primer
punto o botón «Cerrar forma» para un polígono; automático al segundo
punto para un tramo de barrera), cancelación con Escape o clic derecho,
sin ningún estado a medio crear. Los formularios de coordenadas
existentes se conservan solo como apoyo técnico secundario, plegados
bajo «Avanzado: coordenadas exactas» — nunca eliminados, porque siguen
siendo útiles para pruebas automatizadas y para geometría exacta que el
dibujo a mano no puede expresar con precisión.

Los paneles operativos se completan exponiendo comandos del motor que
ya existían desde S5 (`reassign_job`, `set_job_modes`) pero no tenían
ningún control: cada trabajo permite ahora añadir/quitar personas
asignadas y aplicar ritmo/atención en marcha directamente desde su
fila, sin motor nuevo. La reacción de la interfaz a sesión congelada
por conflicto, error/reintento de guardado, resincronización, blanco
seleccionado que desaparece o pierde conocimiento, y trabajos
bloqueados/cancelados ya estaba cubierta por el trabajo de las Puertas
A-C y por el propio `ContextualSheet` (que muestra "Selección ya no
disponible" en vez de una ficha huérfana cuando el blanco deja de
resolverse); auditada explícitamente en esta puerta, no encontró
huecos adicionales que cerrar.

### 5. Puerta E: recorrido cruzado de barrera/perímetro y harness de rendimiento

`e2e/s10-barrier-perimeter-cross-flow.spec.ts` recorre en un navegador
real contra PostgreSQL real las catorce etapas del mandato de cierre —
dibujar el tramo en el Canvas, validar su geometría contra anclajes
reales, comprobar materiales, crear el trabajo, reasignarlo con el
control de la Puerta D, reservar y consumir recursos reales, ejecutar,
materializar la barrera, persistir/recargar conservando el resultado,
registrar el evento y mantener el trabajo "completado" sin retroceder
tras recargar — usando en cada paso el sistema real correspondiente
(orden/trabajo/reserva/resolución/persistencia/proyección/Canvas/
observabilidad), nunca un atajo exclusivo de la prueba. La única
sustitución deliberada es la misma ya aceptada en `s7-objects.spec.ts`
para el deterioro de alimento fresco: inyectar directamente en el
snapshot guardado un lote de madera ya cargado por la persona
ejecutora, en vez de recorrer en el navegador la logística de reunir
varios contenedores de pocos kilos cada uno (todo el aserrín generado
vive repartido así, nunca suelto en un único punto) — la reserva, el
consumo exacto, la ejecución y la materialización del tramo las sigue
calculando el motor real dentro del Worker real.

Se descubrió durante el desarrollo de esta prueba que un par de
anclajes elegido sin verificar en otra parte del mapa puede no estar
conectado a la red de caminos conocida del poblado (bloqueo real "No
hay ruta conocida"): la prueba final usa deliberadamente dos esquinas
de la vivienda ya verificada transitable por `village-runtime.spec.ts`
y `s7-objects.spec.ts`, en vez de coordenadas nuevas sin probar.

El harness de rendimiento (`s11-performance-harness.test.ts`) construye
un pueblo semántico completo, lo carga con zonas/designación/órdenes y
dos horas simuladas de bucle causal real con la niebla totalmente
descubierta (peor caso realista de tamaño de proyección), y mide sobre
ese único escenario, con 20 repeticiones por métrica: coste de
construir y partir las proyecciones, coste de validarlas con los
esquemas Zod reales de cada canal, coste de aplicar un comando real y
de avanzar un tick real, tamaño en bytes del estado interno y de cada
canal serializado, y recuento de entidades por colección. Los
resultados reales medidos (no inventados) están transcritos en
`docs/STATUS.md` § «S11 — harness de rendimiento»; los `expect` del
propio archivo son solo un umbral de humo que detecta una regresión de
uno o dos órdenes de magnitud, nunca una garantía de producción.

## Alternativas descartadas

- **Delta JSON-patch genérico en vez de dos canales fijos**: el propio
  encargo permitía cualquiera de los dos enfoques; se eligió el más
  simple de razonar y de detectar hueco/duplicado/base obsoleta
  (secuencia + referencia estructural) para minimizar riesgo de
  implementación en el tiempo disponible, cumpliendo igualmente todos
  los requisitos literales del protocolo.
- **`personSheets` en el canal estructural**: descartado por el coste
  de UX de retrasar hasta un segundo real una prioridad recién editada
  (§2).
- **Reescribir el panel de trabajo con un flujo de ordenar por Canvas
  también para acciones complejas (traslado, elemento almacenado,
  cultivo a sembrar)**: descartado por alcance — `ContextualSheet`
  remite esas acciones al panel de trabajo existente en vez de
  duplicar sus controles (equipo, método de traslado, cantidad
  parcial), evitando dos implementaciones divergentes del mismo flujo.
- **Unificar selección de persona (lista) y de blanco (Canvas) en un
  único estado**: descartado a favor de un modelo dual pragmático
  (`selectedPersonId` para quien actúa, `selectedTarget` para lo que se
  selecciona en el mapa) — la unificación completa habría exigido
  redefinir cómo `PersonSheetPanel`/`WorkPanel` deciden la persona
  actuante cuando se selecciona una entidad no-persona, sin beneficio
  claro dentro del tiempo de esta puerta.
- **Forzar el descubrimiento de cada interior/contenedor en el
  escenario del harness de rendimiento para un "peor caso" absoluto**:
  descartado por complejidad frente a beneficio — la niebla totalmente
  descubierta ya es un peor caso realista y honesto para la geometría
  exterior/edificios, que es la parte voluminosa de la proyección
  estructural; el harness documenta explícitamente esta limitación en
  vez de perseguir una cota teórica exacta.

## Límites conscientes y deuda explícita posterior a S11

- **Selección de barrier segments sin frontera de conocimiento
  propia**: a diferencia de `cultivationPlots`, `barrierSegments` se
  proyecta sin comprobar niebla (`build-projections-v2.ts`,
  `barrierSegments`) — visible en cuanto existe en `world.barrierSegments`,
  no solo cuando la niebla lo alcanza. Detectado durante el desarrollo
  de la Puerta E; no se corrigió dentro de esta puerta por no formar
  parte de su mandato explícito (auditoría de selección de Canvas, no
  auditoría general de fronteras de conocimiento) y queda documentado
  aquí, no arrastrado en silencio.
- **Tamaño del canal estructural**: el harness de rendimiento midió el
  canal `structural_projections` serializado más grande que el propio
  estado interno completo en el escenario cargado (niebla totalmente
  descubierta). Es una observación real, no un fallo demostrado — el
  canal estructural solo se reenvía por completo al forzarse o cada
  `STRUCTURAL_CADENCE_REAL_MS`, nunca en cada tick — pero es una
  oportunidad de optimización de payload (p. ej. no repetir toda
  `mapEntitiesStatic` si solo cambió la niebla) que queda fuera del
  alcance de S11.
- **Sin drag continuo para editar un polígono ya dibujado**: las
  herramientas de dibujo de la Puerta D crean geometría nueva vértice a
  vértice; editar un polígono existente (mover un vértice concreto,
  redibujar una barrera) sigue pasando por borrar y volver a dibujar, o
  por el formulario de coordenadas avanzado.
- **Reasignación de trabajo sin restricción de idoneidad en la
  interfaz**: el selector "Añadir…" del panel de trabajos ofrece a
  cualquier persona conocida, no solo a quienes cumplen los requisitos
  reales del método (el motor los sigue validando en `validate` y
  bloqueará causalmente si no encajan, pero la interfaz no filtra la
  lista de antemano).
- **Harness de rendimiento de un solo escenario, un solo momento**: no
  hay serie histórica ni comparación entre commits; sus números son una
  fotografía de esta entrega, útil para detectar una regresión grosera
  futura si se vuelve a ejecutar, no una tendencia.
- **Herencia de S7-S10**: los límites ya documentados en `DEC-0019` y
  `DEC-0020` (perímetro sin paredes de edificio como arista implícita,
  reconstrucción completa de navegación, catálogo de cultivos mínimo,
  sin estaciones ni clima, entre otros) siguen abiertos — S11 cierra la
  integración final, no reabre ni resuelve la deuda funcional de
  subhitos anteriores que no formaba parte de su mandato.
- **Ramas sin fusionar y aceptación manual pendiente**: ninguna de las
  ramas `feat/web-002-s7-*` a `feat/web-002-s11-*` está fusionada contra
  `main`; la aceptación manual de Dennis de S7-S11 sigue pendiente (ver
  el guion al final de `docs/STATUS.md` § «S11»).

## Pruebas

- Unitarias (paquetes `contracts`/`application`/`simulation-core`):
  pruebas de secuencia/duplicado/hueco/resync del protocolo V3,
  conformidad de esquema de los dos canales reales, frontera de
  conocimiento (4 pruebas nuevas), registro operativo persistente y
  reconstruible (5 pruebas: vacío por defecto, reconstrucción,
  presencia de nivel, agrupación con contador, sin agrupar entre
  entidades distintas), propagación de `reservedByJobId` al inventario,
  y el harness de rendimiento (una prueba que construye el escenario,
  mide y deja umbrales de humo).
- Integración PostgreSQL: idempotencia de `attemptId`, atomicidad,
  acknowledgement duplicado/obsoleto, congelación por conflicto de
  revisión, autosave (Puerta A); `listRecentDomainEventsV2` en orden
  ascendente y respetando el límite (Puerta C).
- E2E (Chromium real, `next start` + PostgreSQL real): recorrido de
  selección universal + ficha contextual sobre `village-runtime.spec.ts`
  (zoom manteniendo fijo el centro de cámara, clic sobre una abertura
  conocida); recorrido de herramientas de dibujo sobre
  `work-panel.spec.ts` (trazar, cerrar, borrar una zona; cancelar un
  dibujo a medias con Escape); recorrido cruzado completo de
  barrera/perímetro nuevo,
  `e2e/s10-barrier-perimeter-cross-flow.spec.ts` (§5).
