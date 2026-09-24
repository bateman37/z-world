---
id: DEC-0020
title: Entorno mutable y agricultura (WEB-002 S10)
status: approved
canonical_for:
  - evolución aditiva de contratos de S10 (`spatial-entities-v2`, `agriculture-v2`, `work-v2`, `events-v2`, `projections-v2`) y su compatibilidad con snapshots S1–S9
  - capas de terreno (cobertura, vía, barrera/perímetro) y su relación con la geometría de fondo ya generada
  - reutilización íntegra del motor de trabajos/planificador/prioridades para agricultura y entorno mutable (ningún motor paralelo)
  - geometría y aptitud de parcela libre, modelo de progreso parcial, tratamiento de vías, anclajes/cruces y topología de perímetro derivada
  - reloj determinista de crecimiento, conservación física de semillas/agua/herramientas, y fórmula causal de rendimiento (provisional)
  - simplificaciones y límites honestos de S10 frente a S11
depends_on:
  - DEC-0015
  - DEC-0016
  - DEC-0017
  - DEC-0018
  - DEC-0019
related:
  - CAT-005
  - SET-011
  - WLD-010
  - RDM-003
---

## Contexto

`WEB-002` reserva su incremento 6 (S10) para profundizar el entorno
mutable inicial y cerrar el ciclo agrícola completo (`WLD-010` §3.5-§3.7,
`SET-011` §3), que S1-S9 dejaron en forma esquelética: `TerrainArea`,
`Parcel` y `LinearFeature` existían como geometría de fondo, y
`CultivationPlot`/`CropCycle` tenían tipos definidos pero sin lógica ni
acciones reales. El prompt de subhito
`prompts/WEB-002_S10_agriculture-mutable-environment.md` pide una sola
entrega en la rama `feat/web-002-s10-agriculture-mutable-environment`,
con dos exigencias no negociables:

1. **Nunca un motor paralelo.** Limpiar vegetación/escombros, mutar una
   vía, construir una barrera y todo el ciclo agrícola (preparar,
   sembrar, cuidar, cosechar) son `Job`s del mismo `ActionMethodDefinition`
   + `advance-jobs.ts` que S4-S9 ya usan, con las mismas fases
   (`validate → travel → prepare → execute → record_result`), el mismo
   planificador y las mismas prioridades.
2. **Nunca un atajo temporal.** El crecimiento del cultivo depende del
   reloj determinista real (`SimulationClock`), nunca de un botón
   "crecer ahora"; un cultivo de ciclo abreviado documentado
   (`test_fast_vegetables`) existe solo para que las pruebas no esperen
   días reales de tiempo simulado, con el mismo motor causal.

## Decisión

### 1. Contratos: evolución aditiva, campo requerido-pero-nulo

Seguimos exactamente el patrón de `DEC-0019` §1, reforzado: cada campo
nuevo es **requerido-pero-nulo** en TypeScript (nunca `campo?: T`) y
lleva `.default()` en Zod. Marcarlo opcional en TS permitiría que un
punto de construcción (generador, migración, fixture) lo omitiera en
silencio mientras Zod lo rellena solo al releer, rompiendo la simetría
de serialización que las pruebas "guardar y recargar produce
exactamente el mismo estado" exigen. Requerido-pero-nulo obliga al
compilador a señalar cada punto de construcción real.

Nuevos campos/tipos relevantes: `TerrainArea.coverage`
(`"none"|"vegetation"|"debris"`, con `effectiveTerrainCoverage()` para
degradar con seguridad un área anterior a S10: `dense_vegetation` →
`"vegetation"`, el resto → `"none"`), `Parcel.terrainAreaId`,
`BarrierSegment.built`/`createdByJobId` (antes opcionales, ahora
requeridos), `CultivationPlot.preparationProgress`/`damageLevel`,
`CropCycle.sownAreaM2`/`seedsSownKg`/`careEvents`/
`lastCaredAtSimSeconds`/`harvestedAtSimSeconds`, `Job.cropId`. El
generador pasa a versionar su semilla espacial una vez más (mismo
trazado que v4 de S9; ninguna semilla ni ID cambia). Un snapshot
anterior a S10 carga con `coverage: "none"` salvo bosque denso
(`"vegetation"`), sin parcelas de cultivo nuevas y con
`preparationProgress`/`damageLevel` en `0`: verificado en
`s10-agriculture.integration.test.ts` (tercera prueba, que despoja a
mano los campos nuevos de un snapshot serializado y comprueba que
`advanceSimulationV2` lo sigue avanzando).

### 2. Capas de terreno: cobertura, vía y barrera sobre la misma geometría de fondo

S10 no introduce una nueva malla de tiles ni un mapa paralelo: añade
tres propiedades mutables sobre las entidades espaciales que S2 ya
genera (`TerrainArea`, `LinearFeature`) más una nueva
(`BarrierSegment`, ya prevista por S1 pero sin lógica):

- **Cobertura** (`TerrainArea.coverage`): `"none"` (transitable liso),
  `"vegetation"` (bosque/matorral, coste de tránsito ×1.8 ya existente
  desde S2) o `"debris"` (escombro ligero, nuevo: penaliza el coste con
  `DEBRIS_COVERAGE_COST_MULTIPLIER` en `navigation-v2.ts` sin bloquear).
  `clear_vegetation`/`clear_debris` la llevan a `"none"`, producen madera
  o escombro real (`TERRAIN_TRANSFORM_TUNING`) y registran un
  `PersistentTerrainChange`.
- **Estado de vía** (`LinearFeature.wayState` sobre `kind: "road"`):
  `"transitable"` → (generador) `"obstructed"` → `clear_road` →
  `"cleared"` (conserva la función viaria) o `remove_way_function` →
  `"function_removed"` (irreversible en este alcance: exige
  confirmación informada, deja terreno despejado, nunca una carretera
  reutilizable). `navigation-v2.ts` trata `"obstructed"` como
  transitable-pero-costoso (`OBSTRUCTED_ROAD_COST_MULTIPLIER`, nunca
  bloqueado — una vía obstruida sigue siendo una vía, solo más lenta) y
  `"function_removed"` como terreno liso sin pintar vía.
- **Barrera/perímetro** (`BarrierSegment`, nuevo `AnchorPoint`-a-`AnchorPoint`):
  `build_barrier` construye un tramo real consumiendo madera concreta
  (`TERRAIN_TRANSFORM_TUNING.buildBarrier`), rasteriza un bloqueo lineal
  fino en `navigation-v2.ts` (con hueco transitable de 2,5 m en un
  `pedestrian_gap`/`handcart_gate`, bloqueo total en `full_block`), y
  `PerimeterNetwork.closed` se **deriva**, nunca se guarda como booleano
  editable (ver §4).

Ninguna de las tres capas exige un edificio: aplican tanto sobre
terreno de fondo como sobre una `CultivationPlot` (una parcela puede
tener vegetación o escombro antes de prepararse).

### 3. Agricultura reutiliza el mismo motor de trabajos, nunca uno paralelo

`prepare_soil`, `sow`, `tend_crop` y `harvest` son
`ActionMethodDefinition`s más en `TERRAIN_ACTION_METHODS`
(`terrainMethod()`, mismo `model: "d"`, mismas fases, mismo
`baseWorkUnits` en minutos que cualquier otro método D del catálogo),
despachados desde el mismo `advance-jobs.ts` (`terrainPrepare`/
`terrainApplyConsequences` para entorno, `agriculturePrepare`/
`agricultureApplyConsequences` para agricultura) y con su propio
`terrainValidationReason`/`agricultureValidationReason` enchufado en la
fase `validate` junto a los de S7-S9. `terrainWorkUnits()` fija la
duración real de los métodos de entorno por superficie/longitud (como
`s9WorkUnits` con la huella de un edificio); los de agricultura usan el
`baseWorkUnits` fijo del catálogo (30 min preparar/sembrar/cosechar, 20
min cuidar), **no** el área de la parcela: una parcela puede ser mucho
más grande que las semillas realmente disponibles (ver §5), y atar la
duración a esa área habría hecho impracticable cualquier partida real.

El objetivo de estos cuatro métodos es siempre `cultivation_plot`
(nunca `terrain_area` directamente): su ubicación resuelta es
`field_edge` (nuevo caso de `EntityLocation`, ya previsto por S1 pero
sin lógica), el borde exterior de trabajo real de la parcela — el
mismo punto donde el generador deposita las semillas/herramienta
garantizadas de S1 (`§7.5` del prompt maestro). `locationToNavPoint`,
`resolveRoomId`, `isPersonCoLocated` (con tolerancia de 6 m sobre
cualquier vértice, porque un campo puede ser mucho mayor que el
alcance por defecto) y — corrección real encontrada por la E2E, ver
§9 — `locationWorldPoint` en `objects/storage.ts` resuelven todas
`field_edge` al centroide del polígono de la `Parcel`.

### 4. Perímetro: topología derivada, nunca un booleano guardado

`derivePerimeterNetworks(world)` recorre los `BarrierSegment` con
`built: true` con una estructura unión-búsqueda (`union-find`) sobre sus
anclajes: una componente está `closed` si `segments.length >=
distinctAnchors.length && distinctAnchors.length >= 3` (un ciclo real,
no una simple conexión). Guardar `closed` como campo editable habría
permitido un estado inconsistente con la geometría real tras cualquier
cambio posterior (destruir un tramo, por ejemplo); derivarlo en cada
punto de lectura lo hace imposible por construcción, igual que S9 hace
con las etapas de vida de un edificio a partir de sus capas físicas.

**Límite consciente**: esta topología solo cuenta tramos de barrera
construidos explícitamente. Las paredes exteriores de un edificio no se
modelan como aristas implícitas del perímetro (un edificio adosado a un
tramo no "cierra" el perímetro por sí solo en este alcance); queda
como horizonte de S11 si se necesita.

### 5. Geometría y aptitud de parcela libre

El jugador puede designar un `prepare_soil` sobre **cualquier polígono
que dibuje**, no solo sobre las `Parcel` de ejemplo que ENV-02 del
generador ya coloca. `generateTerrainDesignationJobs()` (en
`terrain/designations.ts`) crea, si no existe ya una `Parcel`/
`CultivationPlot` reutilizable con la forma exacta
(`polygonsRoughlyEqual`), una `Parcel` nueva **con el polígono que el
jugador dibujó** — nunca con el polígono completo del `TerrainArea` de
fondo que la aloja (que puede cubrir buena parte del mapa): el enlace a
ese `TerrainArea` vía `terrainAreaId` sirve solo para consultar
cobertura/aptitud, nunca para heredar su geometría. Este fue un error
real detectado por una prueba unitaria fallida durante el desarrollo
(ver §9).

`evaluateCultivationSuitability()` (en `terrain/suitability.ts`) es una
consulta pura que nunca muta nada: comprueba límites del mundo, tamaño
mínimo de geometría, niebla (nunca se puede designar sobre lo
desconocido), que el `TerrainArea` de fondo sea del tipo correcto, que
no solape con un edificio o con otra parcela activa, y la cobertura
actual, devolviendo un veredicto estructurado
(`valid`/`valid_with_limitations`/`unknown_insufficient_observation`/
`blocked_physical`/`blocked_access`/`blocked_requirements`) con motivos
explícitos, nunca un booleano opaco.

### 6. Modelo de progreso parcial: interrupción y reanudación conservan el trabajo

`CultivationPlot.preparationProgress` (0-1) persiste el avance de la
fase `execute` de `prepare_soil`/`clear_vegetation`/`clear_debris` a
través de pausa/reanudación manual (`pause_job`/`resume_job`) y de
interrupción por autoprotección (S6): nunca se rerrollea ni se pierde.
Esto es el mismo patrón D de S7-S9 (`workRemainingUnits`), expuesto
ahora también como campo propio de la parcela (no solo del `Job`) para
que sobreviva incluso si el trabajo se cancela y se reordena más tarde
sobre la misma parcela. Verificado por la E2E flagship (§8): pausar a
mitad de la preparación, comprobar que en pausa no avanza nada, y
reanudar sin repetir lo ya hecho.

### 7. Vías: tratamiento causal, nunca binario

Una vía obstruida sigue siendo una vía (más lenta, nunca intransitable)
hasta que se despeja o se le retira la función. Este tratamiento evita
dos atajos: (a) que "obstruido" bloquee completamente una ruta
regional que en la práctica se puede seguir con esfuerzo, y (b) que
"despejar" y "retirar función" sean la misma acción con una sola
consecuencia — son irreversibles en grados distintos y con costes
distintos (`clearRoad.minutesPerMeter: 0.6` frente a
`removeWayFunction.minutesPerMeter: 1.5`), reflejando que quitar la
función es una obra mayor, no solo limpieza.

### 8. Reloj determinista de crecimiento, cuidado y cosecha causal

`advanceCropGrowth(state, nav, simSecondsToAdvance)` corre tras
`applyResourceDecay` en `advanceSimulationV2`, puro respecto al tamaño
del tick (mismo determinismo que el resto del reloj V2): `growing` →
`harvestable` cuando `elapsedSimSeconds >= cycle.harvestableAtSimSeconds`;
el daño por abandono se deriva como
`min(1, tiempoVencidoDesdeElÚltimoCuidado / (careIntervalSimSeconds * 2))`
— **nunca acumulado tick a tick** (evitaría doble penalización si se
recarga a mitad de tick) — y si llega a `1` el cultivo se pierde
(`crop_lost`), la parcela vuelve a `"unprepared"`. No existe ningún
botón de avance instantáneo: la única forma de llegar a `harvestable`
es dejar pasar tiempo simulado real, acelerado como cualquier otro por
`×1/×2/×4/×10`.

`sow` **nunca exige la semilla nominal del campo entero**: bloquea solo
si no hay ninguna semilla localizada (`block.missing_seeds`); la
superficie realmente sembrada (`sownAreaM2`) se deriva de la semilla
efectivamente reservada/consumida (acotada al máximo que el campo
entero necesitaría, nunca más), y el resto del lote de semillas queda
sin reservar. Esta fue una corrección deliberada durante el desarrollo
(ver §9): con solo 1-3 kg de semilla garantizados por el generador
frente a parcelas de cientos o miles de m², exigir la cantidad nominal
completa habría hecho el cultivo del campo garantizado literalmente
imposible en cualquier partida real.

El rendimiento en la cosecha es explícitamente **provisional**
(`SET-011 §7` lo deja abierto): `baseYieldKgPerM2 * sownAreaM2 *
capacityFactor * (0.5 + 0.5 * careRatio) * penalizaciónPorDaño *
(1 + variación)`, con `sampleVariationD` sobre el stream `resolution`
(nunca `Math.random()`). Nada de esta fórmula pretende ser el balance
final del juego; es la primera implementación honesta de que cuidado y
daño importan causalmente, con un solo cultivo real jugable
(`garden_vegetables`, 12 días de ciclo) y un catálogo abierto a
crecer.

### 9. Errores reales encontrados y corregidos durante el desarrollo

Documentados porque cambian el comportamiento observable, no solo el
código:

- **`prepare_soil` copiaba el polígono equivocado**: al reutilizar el
  `TerrainArea` de fondo entero como geometría de la nueva `Parcel`
  (que puede cubrir gran parte del mapa), `neededSeedsKg` se volvía
  astronómico. Corregido en `terrain/designations.ts` (§5).
- **`sow` exigía semilla para el campo entero**: bloqueaba
  perpetuamente con la semilla garantizada real (1-3 kg). Rediseñado
  para derivar la superficie sembrada de lo disponible (§8).
- **La marca de "escombros" del generador etiquetaba el fondo entero**:
  `backgroundOpenGroundIds` en `generator/environment-places.ts` solo
  encontraba la única `TerrainArea` de fondo transitable que cubre casi
  todo el mapa (nunca una bolsa localizada), así que "despejar
  escombros" no tenía ningún objetivo demostrable de tamaño razonable.
  Corregido para marcar bolsas de campo (`ENV-02`) reales no elegidas
  como parcela de ejemplo.
- **`locationWorldPoint` no resolvía `field_edge`**: descubierto por la
  E2E de agricultura al intentar trasladar la cosecha — el lote
  cosechado nunca aparecía como objetivo de «Transportar» porque
  `buildObjectKnowledge().known()` trataba cualquier objeto en el borde
  de un campo como sin posición real, sin llegar a comprobar la niebla.
  Corregido con el mismo cálculo de centroide que `locationToNavPoint`.
- **Un traslado interrumpido por autoprotección nunca se retoma solo**
  (a diferencia de una orden directa): su carga ya se depositó al
  interrumpirse, así que hay que replantearlo con una orden nueva. Esto
  ya era el comportamiento correcto de S8 (`isResumableInterruption`
  excluye explícitamente `job.transport`); la E2E de agricultura lo
  destapó porque su recorrido incluye un traslado real al final del
  ciclo.

### 10. Snapshot, migración y compatibilidad

Igual que S7-S9: ningún snapshot se regenera. Uno anterior a S10 carga
con `coverage`/`terrainAreaId`/`preparationProgress`/`damageLevel`/
`built` por defecto seguro (§1), sin `CultivationPlot`s ni
`CropCycle`s nuevos más allá de los que S1 ya generaba, y sigue
avanzando el reloj sin excepciones. `migrate-v1-to-v2.ts` deriva
`coverage` de `TerrainArea.kind` (`dense_vegetation` → `"vegetation"`,
el resto → `"none"`) para una partida V1 migrada.

### 11. Invalidación de navegación: simplificación consciente

S9 estableció parcheo dirigido por edificio para accesos/estructura.
Para cambios de terreno/vía/barrera, S10 hace una reconstrucción
completa de `buildFullNavigationIndexV2` y sube `navigationRevision`
(`refreshNavigationAfterTerrainChange()`), en vez de un parcheo dirigido
equivalente al de S9. Es una simplificación consciente, aceptable dado
el tamaño del mundo y la baja frecuencia con la que estos cambios se
disparan (una designación de jugador, no cada tick); queda como
posible optimización de S11 si el coste se vuelve un problema real.

### 12. Interfaz mínima, funcional

Sin pasada artística (mismo principio que S4-S9): un selector de tipo
de designación (`clear_area`/`cut_vegetation`/`prepare_soil`/`harvest`/
`build_barrier`) con campos numéricos de geometría (rectángulo o los
dos extremos de una barrera) y modo de cruce con vía; un selector de
cultivo real en «Sembrar» (el catálogo tiene más de un perfil desde
S10: se añadió un selector en vez de mantenerlo fijo); una sección
nueva «Parcelas de cultivo» que expone estado/progreso/daño observables
sin depender del lienzo (útil tanto para jugar como para que las
pruebas E2E puedan verificar la fase agrícola); tintes de cobertura,
color por estado de vía y de parcela, y trazo de barrera (sólido si
está construida, discontinuo si no) en el Canvas existente.

## Alternativas descartadas

- **Guardar `PerimeterNetwork.closed` como campo mutable**: descartado
  por la misma razón que S9 deriva las etapas de vida de un edificio:
  permitiría un estado inconsistente con la geometría real tras
  cualquier cambio posterior.
- **Atar la duración de `prepare_soil`/`sow`/`harvest` al área de la
  parcela** (como hacen los métodos de entorno con su superficie):
  descartado porque una parcela de ejemplo puede ser mucho mayor que
  cualquier semilla disponible, volviendo la duración desproporcionada
  frente a lo que realmente se siembra.
- **Exigir semilla nominal completa para sembrar**: descartado (§8/§9):
  habría hecho el único cultivo garantizado del generador
  perpetuamente inalcanzable.
- **Modelar las paredes de un edificio como aristas implícitas del
  perímetro**: descartado por alcance/tiempo, documentado como límite
  consciente (§4), no como omisión silenciosa.
- **Parcheo dirigido de navegación para terreno/vía/barrera** (como
  S9 hace con accesos): descartado por alcance/tiempo a favor de una
  reconstrucción completa (§11), con el coste documentado como
  aceptable a este tamaño de mundo.

## Límites conscientes y horizonte de S11

- Perímetro sin paredes de edificio como arista implícita (§4).
- Reconstrucción completa de navegación en vez de parcheo dirigido para
  cambios de terreno/vía/barrera (§11).
- Catálogo de cultivos mínimo: un solo cultivo real jugable
  (`garden_vegetables`); el catálogo completo, las fórmulas de
  rendimiento y los tiempos exactos quedan abiertos (`SET-011 §7`).
- Sin estaciones ni clima: el ciclo de 12 días de `garden_vegetables`
  no depende de fecha ni temporada.
- La E2E de barrera/perímetro (crossing peatonal/carro, cerrar un lazo,
  reabrir vía gate/brecha) no se automatizó en Chromium por límite de
  tiempo de esta entrega: su lógica sí está cubierta por pruebas
  unitarias reales (`terrain-agriculture.test.ts`), pero el recorrido
  jugable completo de esa parte concreta no está probado en navegador.
  Queda como trabajo pendiente explícito, no como "cerrado".

## Pruebas

- Unitarias: `packages/simulation-core/src/v2/terrain/terrain-agriculture.test.ts`
  (8 pruebas: limpieza de vegetación con interrupción/recarga, escombro
  frente a corte de vegetación, vía obstruida→despejada→sin función con
  confirmación irreversible, derivación de perímetro, construcción real
  de barrera consumiendo material, aptitud de terreno, ciclo agrícola
  completo con bloqueo por falta de semillas y abandono/pérdida de
  cultivo) más ajustes aditivos en fixtures/pruebas ya existentes de
  S1-S9 para los nuevos campos requeridos.
- Integración PostgreSQL:
  `packages/persistence/src/s10-agriculture.integration.test.ts` (3
  pruebas contra la parcela garantizada real del generador con la
  semilla `probe-seed-92`: preparar→sembrar→crecer→cosechar con
  guardar/recargar en cada fase; conflicto de revisión real entre dos
  clientes que consumen la misma semilla; snapshot anterior a S10 con
  los campos nuevos despojados a mano que sigue avanzando con
  defaults seguros).
- E2E (Chromium real, `next dev`/`next start` + PostgreSQL real,
  semilla `probe-seed-92`): `e2e/s10-agriculture.spec.ts` (ciclo
  agrícola completo sobre la parcela garantizada: preparar con
  interrupción/reanudación real de progreso parcial, sembrar con el
  cultivo de ciclo abreviado de verificación, confirmar que en pausa no
  hay crecimiento, cuidar/regar, cosechar, trasladar la cosecha real y
  persistencia tras recargar) y `e2e/s10-mutable-environment.spec.ts`
  (acceso regional obstruido garantizado → despejar conservando
  función → persistir → retirar función viaria con confirmación
  irreversible → persistir).
