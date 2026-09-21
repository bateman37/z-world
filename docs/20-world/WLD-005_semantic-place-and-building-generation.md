---
id: WLD-005
title: Generación semántica de lugares y edificios
status: approved
canonical_for:
  - cadena generativa mundo → región → asentamiento → parcela → edificio
  - separación entre edificio semántico y su representación geométrica
  - programa de estancias y grafo funcional
  - jerarquía habitación → mobiliario → contenedor → contenido
  - coherencia de contenido por ocupante, profesión y actividad
depends_on:
  - WLD-001
  - CAT-001
  - CAT-002
  - CAT-003
related:
  - WLD-002
  - WLD-004
  - WLD-006
  - WLD-007
  - WLD-008
  - SET-007
  - ARC-002
  - ARC-005
  - DEC-0005
---

## 1. Propósito

Fijar el principio de que un lugar y un edificio existen como realidad
lógica o semántica antes de cualquier representación en Canvas 2D o en un
futuro 3D, y definir la cadena generativa que produce esa realidad lógica:
de mundo a región, asentamiento, distrito, calle, parcela, arquetipo,
subtipo, programa de estancias, grafo funcional, instalaciones, ocupantes y
contenido. Desarrolla las secciones 1–5, 19–27 y 63–64, 71 y 77–81 del Anexo
A de `DESIGN-004`.

## 2. Principios que no deben romperse

- **Semántica antes que geometría**: un edificio existe lógicamente (tipo,
  dimensiones, programa, ocupantes, historia) antes de convertirse en
  Canvas 2D o en geometría 3D. Ningún sistema puede depender de que exista
  representación visual para razonar sobre un lugar.
- **Las dimensiones no determinan por sí solas el tipo**: limitan usos
  físicamente posibles, pero el tipo real depende conjuntamente de calle,
  distrito, densidad, contexto rural/urbano, parcela, época, accesibilidad,
  vecinos, tamaño y altura.
- **El edificio no es un cofre de loot**: todo lugar relevante debe poder
  representar función anterior, dimensiones y plantas, programa y grafo de
  estancias, instalaciones, mobiliario, contenedores y objetos, hogar o
  negocio con ocupantes, historia del apocalipsis, presión y saqueos,
  deterioro y estado, recursos en sus distintos grados de reconocimiento,
  conocimiento recuperable y valor futuro como edificio incluso agotado.
- El contenido nunca se genera como objetos independientes: deriva de
  estancia, mobiliario/contenedor, perfil de hogar o negocio, profesión,
  aficiones, rasgos, nivel económico, época e historia (ver
  [CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md)).
- La generación es determinista por semilla, ID estable y versión del
  generador, sin resorteo al abrir un contenedor ni al recargar una partida
  (ver [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md)
  y [DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md)); este
  documento no repite esa regla, la hereda.
- Este documento define el modelo conceptual válido tanto para el mapa
  Canvas 2D actual como para un futuro 3D; no debe rediseñarse cuando llegue
  una capa visual más avanzada.

## 3. Modelo funcional

### 3.1 Cadena generativa

```text
mundo
→ región
→ asentamiento
→ distrito o zona
→ calles y rutas
→ parcelas
→ dimensiones posibles
→ arquetipos compatibles
→ tipo y subtipo (ver CAT-001)
→ programa de estancias (ver CAT-002)
→ grafo funcional
→ instalaciones (ver CAT-002)
→ ocupantes, hogar o negocio (ver CAT-003)
→ mobiliario, contenedores y objetos (ver CAT-002)
→ conocimiento recuperable (ver sección 3.6)
→ historia del apocalipsis (ver WLD-007)
→ presión y rutas históricas de saqueo (ver WLD-006)
→ saqueos concretos (ver WLD-006)
→ deterioro y estado actual (ver SET-007)
→ capacidad de quien explora (ver WLD-004)
→ información comunicada al jugador (ver WLD-002)
```

Cada eslabón puede materializarse de forma diferida (ver
[ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md)),
pero el orden lógico de dependencia no cambia: un programa de estancias no
existe antes de un tipo y subtipo, y un tipo no existe antes de que la
parcela y el contexto limiten sus arquetipos compatibles.

Los eslabones **espaciales** previos a la parcela —perfil de escenario,
terreno, agua, vegetación, red viaria, huella del asentamiento y
subdivisión en parcelas— se definen en
[WLD-008](WLD-008_local-procedural-map-generation.md), sección 3.2, que este
documento no duplica. `WLD-005` es canónico desde la parcela hacia el
edificio semántico; `WLD-008`, desde el perfil hasta la parcela.

### 3.2 Contexto, parcela y arquetipos compatibles

Las dimensiones de una parcela establecen qué usos son físicamente
posibles, nunca cuál se elige. La probabilidad real de cada arquetipo
compatible depende conjuntamente de: posición en el asentamiento, tipo de
calle (principal, residencial, periferia), densidad, contexto
rural/urbano, época, edificios cercanos, uso del barrio, accesibilidad,
tamaño y altura. Por ejemplo, una calle principal favorece comercio,
hostelería y servicios; una zona residencial favorece vivienda; la
periferia favorece talleres, naves y explotaciones con terreno. Estas
tendencias son orientativas, no reglas deterministas ni fórmulas numéricas
cerradas.

### 3.3 Tipo, subtipo y edificios mixtos

El tipo y subtipo se seleccionan de
[CAT-001](../catalogs/CAT-001_maximum-place-catalog.md) entre los
arquetipos compatibles con la parcela y el contexto. Un edificio puede
combinar más de un módulo funcional de
[CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md)
(edificio mixto), por ejemplo tienda con vivienda superior o taller con
vivienda.

### 3.4 Programa de estancias y grafo funcional

Elegido el tipo, el generador produce un **programa de estancias**: el
conjunto de habitaciones necesarias según dimensiones, plantas, subtipo,
época y perfil de ocupantes, y un **grafo funcional** que conecta esas
estancias mediante entradas, escaleras, distribuidores y adyacencias. El
grafo existe antes de cualquier geometría; el futuro generador físico lo
usa para decidir paredes, puertas, escaleras, pasillos, accesibilidad y
disposición de muebles, sin necesitar rediseñar el programa. Dos edificios
del mismo tipo y dimensiones pueden generar programas distintos (por
ejemplo, distinto número de dormitorios) según su semilla derivada; la
geometría final responde siempre al programa, nunca al revés.

### 3.5 Instalaciones, mobiliario, contenedores y objetos

Elegido el programa, el generador asigna instalaciones y mobiliario por
estancia según [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md),
y el contenido concreto sigue siempre la jerarquía **habitación →
mobiliario/instalación → contenedor → contenido** (ver
[CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md), sección
3.3). Ninguna implementación puede asignar contenido directamente a un
edificio o estancia sin pasar por esta jerarquía.

### 3.6 Perfil de ocupantes, negocio y coherencia de contenido

El programa de estancias con contenido relevante requiere un perfil de
hogar o negocio: composición, estrato económico y, cuando aplique,
profesiones, aficiones y rasgos especiales de
[CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md).
Este perfil condiciona el contenido de cada estancia (por ejemplo, un
garaje con perfil mecánico aficionado genera herramientas, repuestos y
manuales con mayor probabilidad que uno sin ese rasgo). El nivel económico
modifica cantidad, calidad, espacio, redundancia, vehículos y tecnología;
nunca es un multiplicador lineal de valor.

### 3.7 Conocimiento recuperable

Un lugar puede contener fuentes de conocimiento (libros, manuales,
documentos, cintas, soportes digitales, servidores, planos, mapas y
procedimientos) que revelan otros lugares o infraestructura: un
ayuntamiento puede revelar redes de agua; una cooperativa agrícola, pozos,
parcelas o silos; un archivo profesional, ubicaciones técnicas. Este
conocimiento se integra con el modelo de fuentes y fragmentos de
[SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md), con
el conocimiento individual y comunitario de
[CHR-002](../30-characters/CHR-002_knowledge-and-learning.md), y puede
crear información o una pista de localización sobre el mapa local o, en el
futuro, el mapamundi, sin teletransportar el lugar ni garantizar que su
estado actual coincida con el documento (ver
[WLD-003](WLD-003_strategic-world-and-regional-simulation.md) y
[NAR-002](../70-narrative/NAR-002_memory-and-causal-world-history.md)).

### 3.8 Separación semántica de la representación

Ningún dato de esta cadena depende del motor de representación. El mismo
edificio lógico puede representarse en el mapa Canvas 2D cenital actual
(ver [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md)) o
en un futuro 3D sin recalcular tipo, programa, grafo, instalaciones,
ocupantes, historia o saqueo: solo cambia cómo se dibuja.

## 4. Reglas aprobadas

- Todo lugar relevante existe primero como realidad semántica (tipo,
  dimensiones, programa, grafo, instalaciones, ocupantes, historia,
  presión, saqueo, deterioro) antes de cualquier representación visual.
- Las dimensiones de una parcela limitan usos posibles; nunca determinan
  por sí solas el tipo elegido.
- Todo contenido sigue la jerarquía habitación → mobiliario/instalación →
  contenedor → contenido; ninguna excepción asigna objetos sueltos
  directamente a un edificio.
- El nivel económico del perfil de ocupantes modifica conjuntamente
  cantidad, calidad, espacio, redundancia, vehículos y tecnología; nunca es
  un único multiplicador de valor de loot.
- El modelo conceptual de esta sección es válido para Canvas 2D y para un
  futuro 3D sin rediseño.

## 5. Interacciones con otros sistemas

- Los arquetipos, módulos, estancias y perfiles de ocupantes que alimentan
  esta cadena se definen en
  [CAT-001](../catalogs/CAT-001_maximum-place-catalog.md),
  [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) y
  [CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md).
- La historia del apocalipsis y su rastro ambiental se definen en
  [WLD-007](WLD-007_place-history-and-environmental-storytelling.md).
- La presión y rutas históricas de saqueo que modifican el estado
  resultante se definen en
  [WLD-006](WLD-006_historical-looting-pressure-and-routes.md).
- Las cinco capas de aprovechamiento, las tres vidas del edificio y sus
  acciones de explotación se definen en
  [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md).
- El reconocimiento dependiente de la persona que interpreta este contenido
  base estable se define en
  [WLD-004](WLD-004_expertise-dependent-recovery.md), sin que este
  documento repita sus reglas.
- Los estados generales de información sobre un lugar y sus acciones de
  descubrimiento siguen siendo los de
  [WLD-002](WLD-002_local-exploration-and-information.md).
- Las entidades conceptuales `Building`, `Room`, `BuildingSystem`,
  `Fixture`, `Furniture`, `Container`, `Item`, `StructuralComponent`,
  `OccupantProfile`, `Household`, `BusinessProfile` y `KnowledgeSource` se
  definen en
  [ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md).
- La generación reproducible por semilla, ID y versión sigue definida en
  [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md)
  y [DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md).
- La generación espacial del mapa local que produce el contexto, las calles
  y las parcelas de la sección 3.2 se define en
  [WLD-008](WLD-008_local-procedural-map-generation.md).

## 6. Casos límite o riesgos

- Determinar el tipo de un edificio únicamente por sus dimensiones
  contradice la sección 3.2 y la sección 3 del Anexo A de `DESIGN-004`.
- Generar contenido sin pasar por la jerarquía de la sección 3.5 rompería
  la coherencia por ocupante exigida en la sección 3.6.
- Diseñar este modelo pensando solo en el mapa Canvas 2D actual obligaría a
  rediseñarlo cuando llegue un futuro 3D, contradiciendo la sección 3.8.

## 7. Preguntas abiertas

- Algoritmo exacto de trazado de calles, distritos y parcelas dentro de un
  asentamiento (compartida con
  [WLD-008](WLD-008_local-procedural-map-generation.md), sección 7).
- Fórmulas exactas de probabilidad de arquetipo según los factores de la
  sección 3.2.
- Catálogo exhaustivo de programas de estancias por subtipo más allá de los
  ejemplos de [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md).
- Algoritmo exacto de generación del grafo funcional y su traducción a
  geometría 2D/3D.

## 8. Ejemplos no normativos

El ejemplo de `Building #0274` del Anexo A (sección 2): vivienda familiar
grande de 12×12 m, 2 plantas, con programa de once estancias, cuatro
antiguos ocupantes, instalaciones domésticas completas, historia de
evacuación precipitada y estado de ligero saqueo posterior, ilustra que
toda esta información puede existir sin geometría 3D. No es un edificio
garantizado en ninguna semilla.
