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
  - CAT-004
  - DEC-0010
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
  separadas.
- Esta entrega documental no crea código; cada incremento requerirá su
  propio prompt de implementación.
- Ninguna capacidad de este roadmap está implementada por el mero hecho de
  aparecer aquí: `docs/STATUS.md` es la única fuente de qué existe
  realmente en el juego ejecutable.

## 3. Modelo funcional

### 3.1 Incrementos previstos, en orden, sin fechas

1. **Inicialización técnica y primer estado visible**: proyecto Next.js
   local, núcleo de simulación TypeScript mínimo, conexión a PostgreSQL vía
   Prisma, reloj continuo funcionando y una pantalla que muestre el estado
   inicial del asentamiento. Dennis podrá arrancar la aplicación localmente
   y ver un estado inicial coherente.
2. **Reloj continuo, seis personas y estado operativo**: seis
   supervivientes iniciales con estado operativo visible (qué hacen, fase,
   progreso, motivo de bloqueo), coherente con el modelo de fases de
   [ARC-004](../90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md).
   Dennis podrá ver el reloj avanzar y observar el estado de cada persona.
3. **Mapa cenital, niebla y movimiento**: mapa Canvas 2D con terreno,
   niebla de guerra, exploración progresiva y movimiento visible de
   personas, según
   [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md).
   Dennis podrá desplazar la cámara, hacer zoom y ver a las personas
   moverse sobre el mapa.
4. **Trabajos, prioridades, recursos y necesidades**: designaciones con
   ratón, trabajos por fases, prioridades y recursos localizados básicos,
   coherentes con el subconjunto ya validado en el prototipo Godot
   (`IMPLEMENTATION-002`/`IMPLEMENTATION-003`) pero reconstruido de forma
   nativa en la nueva línea de código. Dennis podrá asignar prioridades,
   designar tareas y ver resultados.
5. **Generador semántico inicial y explotación de lugares**: primer
   subconjunto de arquetipos (ver
   [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md), sujeto a
   aprobación previa de Dennis), programa de estancias, contenido
   coherente por ocupante, y al menos una acción de cada una de las cinco
   capas de
   [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md).
   Dennis podrá explorar, registrar y desmontar al menos un edificio
   generado semánticamente.
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
- Si el incremento 5 usa el subconjunto de
  [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md) tal cual,
  una variación, o uno decidido en el momento por Dennis.
- Cuándo se evalúa formalmente una capa visual 3D avanzada (incremento 7).

## 8. Ejemplos no normativos

Ninguno adicional a los ya citados en la sección 3.1.
