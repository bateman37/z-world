---
id: DEC-0018
title: Motor de resolución, trabajos planificados y necesidades causales (WEB-002 S4–S6)
status: approved
canonical_for:
  - tubería única de resolución directa/D/B y su implementación en `packages/simulation-core/src/v2/resolution`
  - catálogo activo de métodos (`packages/catalogs/src/action-methods.ts`) y su forma validada en `packages/contracts/src/action-catalog.ts`
  - capacidad efectiva exacta, incluida la capacidad "universal" para métodos sin características/habilidades declaradas
  - muestreo determinista de las variaciones D (±8 %) y B (campana truncada, sd 1,15, [-4,+4]) sobre un stream de PRNG dedicado (`resolution`)
  - máquina de estados de `Job`, planificador determinista y su orden exacto de criterios
  - modelo de reservas limitado a lotes de recurso en este alcance
  - necesidades causales: evolución, recuperación, autoprotección mínima y tuning provisional
  - simplificaciones y límites honestos de S4–S6 frente a S7–S11
depends_on:
  - DEC-0015
  - DEC-0016
  - DEC-0017
related:
  - ARC-006
  - ARC-007
  - ARC-008
  - UI-003
  - RDM-003
---

## Contexto

`WEB-002` agrupa sus incrementos 4 y 5 en once subhitos (`RDM-003`). Tras
S1–S3 (esqueleto de `SimulationStateV2`, generador semántico, runtime
jugable con navegación y descubrimiento pasivo), esta entrega ejecuta
juntos S4 (motor común de resolución), S5 (trabajos/planificador/zonas/
designaciones) y S6 (necesidades causales), por decisión expresa del
prompt de subhitos: las tres piezas son un único sistema causal — las
acciones se resuelven con el motor común, las órdenes se materializan
como trabajos reales, y las necesidades afectan y generan trabajo
mediante el mismo `Job`.

Los contratos de `Job`, `WorkEpisode`, `Reservation` y `NeedState` ya
existían como forma esquelética desde S1 (`DEC-0015`), siempre con esas
colecciones vacías en toda partida generada: esta entrega evoluciona su
forma sin necesitar una migración de datos (no hay snapshots reales con
trabajos que preservar).

## Decisión

### 1. Una sola tubería, datos versionados, no motores separados

`packages/simulation-core/src/v2/jobs/advance-jobs.ts` es el único punto
que avanza fases de trabajo. Todo método activo (reconocer, observar,
inspeccionar, registrar, beber, comer, descansar — el mínimo exigido por
el prompt de subhitos §5.2) es una entrada de datos validada
(`ActionMethodDefinition`, `packages/contracts/src/action-catalog.ts`)
consumida por la misma función `progressExecutePhase`, que despacha a
`resolveDirectExecution`, `resolveModelDExecution` o
`resolveModelBExecution` según el `model` declarado. Las diferencias
entre "buscar agua" y "registrar una estancia" viven en la definición
del método (prioridad, características/habilidades, dificultad,
modelo, fases, requisitos), nunca en una rama especial del motor.

El catálogo activo (`packages/catalogs/src/action-methods.ts`) declara
solo esos siete métodos. Recoger, transportar, reparar, desmontar y
agricultura no se declaran: quedan preparados en el esquema
(`hardRequirements`, `phases`, `model`, etc. ya son suficientemente
generales) pero no aparecen como botón funcional, tal como exige §5.2
del prompt de subhitos.

### 2. Capacidad efectiva y "capacidad universal"

`computeEffectiveCapacity` (`resolution/capacity.ts`) implementa
exactamente las fórmulas de §5.3/§12.3: media de una o dos
características, media de una o dos habilidades, y las tres
combinaciones de perfil (`70/30`, `50/50`, `30/70`). Decisión técnica
nueva no prevista literalmente por el prompt: cuando un método no
declara ninguna característica ni habilidad (beber, comer — acciones
que cualquier persona puede intentar por diseño), la capacidad es
"universal" (`isUniversalCapacity`, representada como `+Infinity`
internamente, nunca serializada así): el requisito de margen `+3` de la
ejecución directa se omite para esos métodos, y en un eventual modelo B
se sustituye `capacidad_efectiva` por `10` (el máximo de la escala) para
el cálculo del margen. Documentado aquí porque no es una regla del
prompt maestro; es la interpretación más simple y defendible de "un
método sin características/habilidades declaradas" sin inventar una
octava combinación de perfil.

### 3. Modelo D y modelo B

- **D** (`resolution/model-d.ts`): variación única `±8 %` muestreada la
  primera vez que el trabajo entra en fase `execute` y persistida en el
  nuevo campo `Job.workRateVariation` — nunca remuestreada por pausa,
  velocidad, guardado o reanudación (probado en
  `jobs/advance-jobs.test.ts`, "pausar y reanudar conserva la
  variación D"). Solo `descansar` usa este modelo en el catálogo activo.
- **B** (`resolution/model-b.ts`): `margen_final = capacidad_efectiva -
  dificultad_efectiva + variación_B`, con `variación_B` una
  aproximación Box–Muller sobre el stream de PRNG `resolution`
  (mulberry32, nunca `Math.random()`), desviación orientativa `1,15`,
  acotada a `[-4,+4]`. Las bandas (`bandForMargin`,
  `packages/contracts/src/action-catalog.ts`) son las cinco exactas del
  prompt maestro §12.6, con los límites probados en
  `resolution/model-b.test.ts` (`>=3` excepcional … `<=-3` grave). Nunca
  se muestran al jugador: `WorkEpisode` las persiste (identidad causal
  suficiente: trabajo, fase, ejecutor, márgenes, banda), pero las
  proyecciones nunca serializan margen, variación ni dificultad interna.

Una banda `severe` transiciona el trabajo a `causal_failure` y libera
sus reservas (§12.8: sin salud/amenazas completas, una banda grave se
representa como bloqueo/reintento necesario, nunca como lesión
inventada).

### 4. Un solo `Job`, tres orígenes

`origin: "direct_order" | "zone_policy" | "systemic_need" | "designation"`
(se añadió `"designation"` a los tres del prompt maestro porque una
designación por área en S5 genera trabajos discretos con una causa
propia, distinta de una orden puntual — documentado como extensión
compatible, no una cuarta vía de motor). Los tres/cuatro orígenes
construyen el mismo `Job` mediante `jobs/job-factory.ts`; solo cambia
qué llama a `createJob` (`applyCommandV2` para orden directa/zona,
`advance-jobs.ts` para necesidad sistémica, `applyCreateAreaDesignation`
para designación).

**Máquina de estados** (`JOB_LEGAL_TRANSITIONS`,
`packages/contracts/src/work-v2.ts`): transiciones explícitas
`proposed → available → reserved → assigned → in_progress`, con
`blocked`/`paused`/`interrupted` como desvíos reversibles y
`completed`/`cancelled`/`causal_failure` como terminales.
`transitionJob` rechaza cualquier transición no listada devolviendo el
trabajo sin cambios (probado en `jobs/job-transitions.test.ts`).

**Bloqueo temporal y reevaluación** (§11.2: "se reevalúa por eventos
pertinentes, no recorriendo todo el mundo cada tick"): `blockJob`
libera las reservas del trabajo al bloquear (para no retener un recurso
que otro trabajo podría usar mientras tanto) y `reviveBlockedJobs` — que
se ejecuta cada tick pero solo sobre la lista, pequeña, de trabajos
actualmente `blocked`, nunca sobre el mundo espacial — reintenta sus
requisitos duros y lo reactiva si ya se cumplen.

### 5. Planificador determinista

`jobs/planner.ts` implementa el orden exacto de §11.7/§6.4 del prompt
de subhitos: prioridad personal `1→5` (`Nunca` excluye), urgencia,
zona (`habitual` < `precaución`; `prohibida` excluida), distancia,
antigüedad del trabajo, y desempate estable por ID. No usa azar ni
información oculta. Reacciona sobre la lista de trabajos/personas
activos, no sobre el mundo entero.

**Simplificación documentada**: la orden directa (§11.9/§6.9) tiene
precedencia sobre el planificador y sigue respetando `Nunca` — pero en
este alcance **no** valida explícitamente que su blanco esté fuera de
una zona `forbidden` antes de aceptarla (sí lo hace el planificador para
trabajos de zona/necesidad sistémica). Una orden directa que un jugador
emita deliberadamente sobre una zona prohibida no se bloquea todavía por
esa causa concreta; sigue bloqueándose por cualquier otro requisito
duro incumplido. Pendiente de cerrar en un subhito posterior si el
guion manual revela que hace falta antes de S7.

**Autoprotección mínima** (§7.6): `runAutoprotection` no está sujeta a
`Nunca` — es supervivencia, no autonomía discrecional (§11.7: "la
autoprotección... no es el sistema de autonomía de `CHR-003`") — pero sí
respeta que solo genera un trabajo cuando `resolveOwnNeedTarget`
encuentra una solución **ya conocida**: un lote que la persona lleva
consigo, o cuyo contenedor está en una estancia con al menos un
`DiscoveryRecord` (co-ubicación cuenta como conocimiento suficiente para
un recurso que la persona tiene delante, sin exigir haber "registrado"
antes esa estancia — decisión deliberada: registrar y beber son
acciones distintas por diseño, §10.2, pero exigir registro previo para
beber del vaso que tienes delante habría sido menos honesto, no más).
Sin solución conocida, emite `systemic_intention_created` con
`jobId: null` y un `blockedReasonKey` explicativo — nunca materializa un
recurso (probado en `jobs/advance-jobs.test.ts`).

### 6. Reservas

Limitadas en este alcance a lotes de recurso (`reserveResourceLot`,
`jobs/reservations.ts`): impide que dos trabajos consuman la misma
unidad. Las reservas de persona/habitación/soporte de descanso se
resuelven implícitamente por `Job.assignments`/`activeJobId` y por la
co-ubicación en el momento de ejecutar, sin una entidad `Reservation`
dedicada — las reservas profundas de herramientas, carga y transporte
quedan expresamente para S7/S8 (§6.6 del prompt de subhitos).

### 7. Zonas y designación por área

Tres políticas exactas (`habitual`/`precaution`/`forbidden`), normas
sin efecto en niebla/seguridad/estado material. Solo
`systematic_recon` es una designación por área ejecutable en S4-S6
(§6.8): genera un `observe` discreto por cada `Place` ya `sighted`
dentro del polígono, nunca revela lugares desconocidos ni registra
contenido. Las demás claves de `DesignationKind` (despejar, cortar
vegetación, preparar suelo, cosechar, retirar objetos, barrera) quedan
en el contrato (`EXECUTABLE_DESIGNATION_KINDS` las excluye
explícitamente) para S7–S10, sin ofrecerse como opción ejecutable en la
interfaz.

### 8. Necesidades causales

Tuning centralizado en `packages/catalogs/src/needs-tuning.ts`,
provisional y medido a `×1`/`×10` (mismo resultado por diseño: el
descenso depende de minutos simulados, nunca de cuántos ticks reales lo
compusieron — probado explícitamente). Tasas elegidas para que la
sesión muestre cambios observables sin convertir las primeras horas en
cuenta atrás: pasivo `0,05–0,12`/min según dimensión; coste de trabajo
activo más alto que el pasivo (nunca se suman los dos: la fase
`execute` sustituye el coste pasivo por el de trabajo, y beber/comer/
descansar no incurren además en el coste genérico de "trabajo activo"
sobre sí mismos — bug real detectado por la propia prueba de descanso y
corregido en este mismo subhito). Recuperación: `+18`/litro de agua,
`+30`/porción de comida, `100/240` (cama), `100/300` (zona
acondicionada) o `100/420` (suelo) por minuto de descanso.

**Redondeo a 6 decimales** (`evolve-needs.ts::clamp`): sin él, la
acumulación de sumas/restas en coma flotante produce valores de 17
dígitos significativos que un guardado/recarga a través de JSONB
(PostgreSQL) puede reconstruir con un bit distinto — detectado por la
prueba de integración real
(`persistence/worker-runtime-v2.integration.test.ts`) y corregido antes
de esta entrega. No es una decisión de balance, es una garantía de
determinismo tras persistir.

Beber/comer consumen una cantidad real de un `ResourceLot` (1 L o 1
porción por acción), reducen su cantidad una sola vez en el límite
causal correcto y liberan la reserva; un lote agotado se elimina de
`resourceLots`, sin dejar referencias huérfanas (cubierto por
`checkEntityLocationsResolve`). Descansar usa el suelo como alternativa
siempre disponible de menor rendimiento (`ground`), o una `Furniture` de
tipo cama/camastro/sofá si existe en la estancia — nunca bloquea por
falta de soporte, tal como exige §14.5/§7.5 del prompt de subhitos.

### 9. Garantías iniciales de S6

`generator/scenario.ts` añade junto al refugio provisional (mismo pase
de generación que el resto de garantías de §7.5, nunca después de
exponer el mundo): `5–8 L` de agua en un contenedor de `8–12 L` de
capacidad y seis porciones de alimento conservado. `generator/people.ts`
diferencia la fatiga inicial: la primera persona del orden estable de
la cohorte llega con descanso `16` (banda `urgent`, "especialmente
fatigada"), el resto en `35` — nadie condenado por el tuning (§14.2).

### 10. Persistencia de los eventos causales nuevos

`worker-session-v2.ts` solo disparaba guardado automático (`order_settled`)
ante los ocho tipos de evento heredados de S1-S3. Se añadieron los
catorce eventos nuevos de trabajos/necesidades/zonas/designaciones al
mismo conjunto: sin ello, "guardar y recargar a mitad de un trabajo,
consumo o descanso sin perder continuidad" (§10 del prompt de subhitos)
no se cumplía. Corregido antes de cerrar esta entrega, con un E2E real
(`e2e/work-panel.spec.ts`) que confirma el guardado tras crear/borrar
una zona.

### 11. Proyecciones e interfaz

`WorkerProjectionsV2` añade `needsByPerson`, `jobs`, `zones`,
`designations` y `contextualActions`. Esta última es la única fuente de
qué botón mostrar (§10.3): un blanco solo aparece si ya se conoce al
nivel exigido por el método, y un blanco bloqueado lleva su motivo
causal, nunca oculto mediante un botón deshabilitado sin explicación.
**Corrección de fuga real**: la primera versión etiquetaba el blanco de
`reconocer`/`observar` con el nombre real del perfil de lugar (p. ej.
"Casa familiar mediana") incluso cuando el lugar solo estaba `sighted`,
exactamente el secreto que `VisiblePlaceProjection.profileId = null` ya
protegía en el mapa — detectado por el E2E de S3 ya existente
(`village-runtime.spec.ts`, que comprueba que esos textos "no
aparecían... en el antiguo visor"), corregido con una etiqueta genérica
hasta que la propia acción revele el perfil.

La interfaz (`apps/web/components/work-panel.tsx`) añade, sin pasada
artística: necesidades por banda cualitativa, selector de acción
contextual + objetivo + orden, panel de trabajos con
pausar/reanudar/cancelar y motivo de bloqueo, y zonas/designación de
reconocimiento por área mediante un rectángulo numérico (no dibujado a
mano sobre el Canvas en este alcance — decisión pragmática documentada,
ver Límites).

## Límites honestos y deuda para S7–S11

- **Dibujo de zonas/designaciones**: se crean mediante cuatro
  coordenadas numéricas, no arrastrando el ratón sobre el Canvas. El
  contrato (`WorkZone.polygon`, `Designation.areaOrLinePolygon`) ya
  admite cualquier polígono; falta la interacción de dibujo en
  `village-map-canvas.tsx`.
- **Orden directa y zona prohibida**: no se rechaza explícitamente
  todavía por esa causa concreta (ver §5 arriba).
- **Cooperación por funciones y techos de contribución** (§13 del
  prompt maestro: responsable/ejecutor/ayudante con techos `100/60/35/
  20 %`): el motor soporta múltiples `assignments` por trabajo y el
  primer asignado es `primary_executor`, pero el modelo D actual no
  aplica todavía los techos de contribución de un segundo/tercer
  ayudante al ritmo de progreso — con el catálogo activo de siete
  métodos (todos de un único ejecutor efectivo en la práctica), esta
  simplificación no afecta a ningún resultado probado, pero es deuda
  real para cuando S7+ active métodos con equipo grande.
  Ídem para revisor/vigilancia y para los efectos de ritmo/atención más
  allá de aceptar los campos `pace`/`attention` en el `Job` (se
  persisten y se exponen en la interfaz, pero ningún método activo
  declara todavía un efecto numérico dependiente de ellos).
- **Reservas de habitación/soporte de descanso**: no existen como
  entidad `Reservation` dedicada (ver §6); dos personas pueden descansar
  en la misma estancia sin conflicto, lo cual es físicamente razonable
  en este alcance pero no es una reserva formal.
- **Política de respuesta** (`cautious/standard/decisive/emergency`):
  se persiste en el `Job` y se acepta por comando, pero sin amenazas
  activas todavía no dispara ningún comportamiento distinto — contrato
  preparado, sin efecto observable en S4-S6, tal como permite §13.6 del
  prompt maestro ("aunque sin amenazas complejas").
- **`DISC-0008`** se actualiza para reflejar que S6 cierra necesidades y
  satisfacción física local/accesible; la logística completa (recoger,
  cargar, transportar y almacenar desde otro lugar) sigue pendiente de
  S7/S8, tal como exige §7.7 del prompt de subhitos.

## Alternativas descartadas

- **Una entidad `Reservation` para cada tipo de recurso desde ya**: se
  descartó por alcance; el prompt de subhitos permite explícitamente
  limitar las reservas profundas a S7/S8 y exige solo persona/
  habitación/lote consumible "funcionando" — persona y habitación se
  resuelven ya con `activeJobId`/co-ubicación sin una entidad extra.
- **Capacidad universal como `10` fijo en vez de `+Infinity` interno**:
  se descartó porque un método sin características/habilidades
  declaradas no tiene "el máximo de la escala" como capacidad real —
  es senzillamente no gateado por capacidad; `10` solo se usa como
  sustituto puntual dentro del cálculo de margen B si algún método
  universal futuro llegara a usar ese modelo (ninguno lo hace hoy).
- **Fase `execute` con tirada por tick para el modelo B**: descartado
  expresamente por el prompt maestro (§12.7); el episodio se crea una
  única vez al entrar en `execute` y su resultado se persiste.
