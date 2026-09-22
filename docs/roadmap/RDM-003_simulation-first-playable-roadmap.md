---
id: RDM-003
title: Hoja de ruta activa del laboratorio de simulación
status: approved
canonical_for:
  - secuencia activa de entregas de implementación tras el reinicio de línea de código
depends_on:
  - DEC-0008
related:
  - RDM-001
  - RDM-002
  - ARC-004
  - UI-005
  - UI-006
  - WLD-005
  - WLD-008
  - WLD-003
  - WLD-009
  - WLD-010
  - WLD-011
  - CAT-004
  - CAT-005
  - SET-010
  - SET-011
  - DEC-0010
  - DEC-0013
---

## 1. Propósito

Fijar la hoja de ruta activa de implementación para la nueva línea de
código Node.js/TypeScript/Next.js/PostgreSQL, sustituyendo a
[RDM-001](RDM-001_first-playable-slice.md) (ahora `deprecated`) como
secuencia de entregas de implementación en curso. Divide el trabajo futuro
en incrementos pequeños, funcionales y manualmente probables por Dennis en
el navegador, sin fechas ni compromiso de versión.

## 2. Principios que no deben romperse

- Ninguna entrega de este roadmap tiene fecha comprometida.
- Cada entrega debe terminar en algo que Dennis pueda probar en el
  navegador; no se agrupan zonas, defensa, amenaza, aprendizaje y autonomía
  en un único bloque monolítico, repitiendo el error que
  [RDM-001](RDM-001_first-playable-slice.md) evitó con sus cinco entregas
  separadas. `WEB-001` agrupó deliberadamente los incrementos 1 a 3 de la
  sección 3.1 en una sola entrega —decisión expresa del encargo, registrada
  en
  [DEC-0014](../decisions/DEC-0014_web-runtime-foundation-and-initial-simulation-contracts.md)—
  precisamente porque fundación técnica, reloj/cohorte y mapa/niebla/
  movimiento forman una única base coherente y verificable en un mismo
  laboratorio; esto no deroga este principio para los incrementos futuros
  (4 en adelante), que siguen sin agruparse trabajos, objetos,
  necesidades, amenazas, autonomía o narrativa entre sí.
- Esta entrega documental no crea código; cada incremento requerirá su
  propio prompt de implementación.
- Ninguna capacidad de este roadmap está implementada por el mero hecho de
  aparecer aquí: `docs/STATUS.md` es la única fuente de qué existe
  realmente en el juego ejecutable.

## 3. Modelo funcional

### 3.1 Incrementos previstos, en orden, sin fechas

1. ~~**Inicialización técnica y primer estado visible**~~ — **completado
   por `WEB-001`**: monorepo `npm workspaces`, núcleo de simulación
   TypeScript puro, PostgreSQL/Prisma desde el primer arranque, reloj
   continuo y pantalla inicial del escenario de llegada. Ver
   [DEC-0014](../decisions/DEC-0014_web-runtime-foundation-and-initial-simulation-contracts.md)
   y `docs/STATUS.md`.
2. ~~**Reloj continuo, seis personas y estado operativo**~~ — **completado
   por `WEB-001`**: seis protagonistas procedurales con ficha completa
   (identidad, nueve características, 34 habilidades, prioridades) y
   subconjunto real de estado operativo (esperando órdenes, aceptando
   orden, desplazándose, llegada completada, bloqueada, orden cancelada);
   el motor de resolución completo con todas las fases de
   [ARC-004](../90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md)
   sigue pendiente del incremento 6.
3. ~~**Mapa cenital, niebla y movimiento**~~ — **completado por `WEB-001`**
   para el fixture de llegada: Canvas 2D con terreno, niebla de tres
   estados, cámara con pan/zoom centrado en cursor, y movimiento directo
   con navegación A* determinista, según
   [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md). El
   generador semántico completo del mapa local (más allá del fixture del
   sector de llegada) sigue siendo el incremento 5.
4. **Trabajos, prioridades, recursos y necesidades**: designaciones con
   ratón, trabajos por fases, prioridades y recursos localizados básicos,
   coherentes con el subconjunto ya validado en el prototipo Godot
   (`IMPLEMENTATION-002`/`IMPLEMENTATION-003`) pero reconstruido de forma
   nativa en la nueva línea de código. Dennis podrá asignar prioridades,
   designar tareas y ver resultados.
5. **Generador semántico inicial y explotación de lugares**: los ocho
   perfiles y el catálogo de objetos, recursos y transporte ya aprobados
   por `DESIGN-008`
   ([CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md),
   [CAT-005](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md)),
   programa de estancias, contenido coherente por ocupante, y al menos
   una acción de cada una de las cinco capas de
   [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md).
   El alcance aprobado incluye además el modelo de entorno mutable y
   construcción espacial, la conectividad de accesos, la agricultura
   básica y el transporte local por porte manual/carretilla/carro (ver
   [WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md),
   [WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md),
   [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md) y
   [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md)), sin
   que esta precisión constituya un incremento nuevo ni comprometa fecha.
   Dennis podrá explorar, registrar y desmontar al menos un edificio
   generado semánticamente, despejar terreno, construir una barrera
   sencilla, cultivar una parcela y transportar una carga entre accesos.
6. **Autonomía, relaciones, amenazas y narrativa emergente**, en
   incrementos separados y no en una entrega monolítica: cada uno de estos
   cuatro sistemas recibe su propio incremento futuro, con su propio
   prompt, cuando le corresponda.
7. **Ampliación progresiva del catálogo y eventual evaluación de capa
   visual avanzada**: incorporación gradual de más arquetipos del catálogo
   máximo de [CAT-001](../catalogs/CAT-001_maximum-place-catalog.md) a
   [CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md),
   y evaluación futura, no comprometida, de un motor visual 3D sobre el
   modelo semántico ya validado.

Los incrementos 3 a 5 trabajan sobre el **mapa local**: su geografía
procedural (ver
[WLD-008](../20-world/WLD-008_local-procedural-map-generation.md)), su
representación Canvas 2D cenital (ver
[UI-005](../80-interface/UI-005_top-down-simulation-workbench.md)) y su
interacción contextual con lugares y equipos (ver
[UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md)).

### 3.2 Relación con el prototipo Godot

Este roadmap no reabre ni continúa las entregas de implementación del
prototipo Godot (`IMPLEMENTATION-001` a `IMPLEMENTATION-004`). Ese trabajo
queda preservado como historia y aprendizaje técnico (ver
[DEC-0008](../decisions/DEC-0008_simulation-first-web-architecture.md)).
Las mecánicas ya validadas manualmente en Godot (reloj, cámara, selección,
prioridades, trabajo por fases, exploración e información de lugares)
sirven de referencia funcional para los incrementos 2 a 4 de la sección
3.1, sin que el código se porte automáticamente.

### 3.3 El mapa regional no está en este roadmap

El mapa regional documentado en
[WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md) es
un **horizonte futuro coherente**, no un incremento de esta secuencia. La
atención de las próximas entregas sigue en el mapa local y el laboratorio de
simulación. Su implementación —expediciones, niebla regional, red creciente
de puntos de interés, viaje y eventos— requerirá su propia secuencia, su
propia decisión de alcance y sus propios prompts, sin fecha comprometida
(ver
[DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md)).

## 4. Reglas aprobadas

- El mapa regional no se incorpora como incremento de este roadmap mientras
  no exista una decisión expresa que lo abra (sección 3.3).
- La secuencia de la sección 3.1 es el orden aprobado de incrementos; una
  entrega futura puede dividir un incremento en varias entregas más
  pequeñas, nunca fusionar varios incrementos en una sola entrega
  monolítica sin registrar el motivo.
- Cada incremento debe declarar explícitamente qué puede probar Dennis en
  el navegador al terminar y qué queda deliberadamente fuera, siguiendo el
  mismo estándar de
  [RDM-001](RDM-001_first-playable-slice.md).
- Ningún incremento de este roadmap se marca `implemented` en la
  documentación de dominio hasta que exista una entrega de código real y
  verificada (ver
  [DOC-001](../00-governance/DOC-001_documentation-system.md)).

## 5. Interacciones con otros sistemas

- El stack y la decisión de reinicio de línea activa se registran en
  [DEC-0008](../decisions/DEC-0008_simulation-first-web-architecture.md).
- El núcleo de simulación, reloj y fases que sustentan los incrementos 1 a
  4 se definen en
  [ARC-004](../90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md).
- El mapa Canvas 2D del incremento 3 se define en
  [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md); su
  geografía procedural, en
  [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md).
- La interacción contextual y los equipos locales de los incrementos 4 y 5
  se definen en
  [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md).
- El mapa regional, fuera de esta secuencia, se documenta en
  [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md).
- El generador semántico del incremento 5 se define en
  [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md),
  [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md),
  [WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md)
  y [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md).
- El catálogo de contenido aprobado y el entorno mutable del incremento 5
  se definen en
  [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md),
  [CAT-005](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md),
  [WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md),
  [WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md),
  [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md) y
  [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md), cerrados
  por `DESIGN-008`.
- El presupuesto numérico y las garantías del primer escenario que el
  incremento 5 podría usar como referencia (mundo funcional máximo, no
  alcance aprobado) se documentan en
  [WLD-009](../20-world/WLD-009_initial-mountain-village-profile.md) y en
  [docs/scenarios/SCN-002](../scenarios/SCN-002_initial-survivor-cohort.md)/[SCN-003](../scenarios/SCN-003_first-day-starting-state.md);
  esta referencia no amplía ni adelanta ningún incremento de esta
  sección.
- El horizonte de capacidades a largo plazo sigue organizado en
  [RDM-002](RDM-002_long-term-capability-horizon.md) (`draft`), que este
  roadmap no amplía ni reduce.
- El roadmap histórico del prototipo Godot, ahora `deprecated`, es
  [RDM-001](RDM-001_first-playable-slice.md).

## 6. Casos límite o riesgos

- Repetir el patrón de agrupar zonas, defensa, amenaza, aprendizaje y
  autonomía en un único incremento contradice explícitamente la sección 2 y
  la lección ya registrada sobre `IMPLEMENTATION-004`.
- Marcar un incremento como completado sin una entrega de código real y
  verificada contradice
  [DOC-001](../00-governance/DOC-001_documentation-system.md).

## 7. Preguntas abiertas

- Alcance exacto de cada incremento cuando se escriba su propio prompt de
  implementación.
- Cuándo se evalúa formalmente una capa visual 3D avanzada (incremento 7).

## 8. Ejemplos no normativos

Ninguno adicional a los ya citados en la sección 3.1.
