---
id: ARC-005
title: Modelo conceptual de datos del mundo semántico
status: approved
canonical_for:
  - entidades conceptuales de edificio, estancia, instalación y contenido
  - entidades conceptuales de ocupantes, historia y saqueo
  - identidades, relaciones y límites entre estas entidades
depends_on:
  - ARC-004
  - WLD-005
related:
  - WLD-006
  - WLD-007
  - WLD-008
  - UI-006
  - SET-007
  - CAT-001
  - CAT-002
  - CAT-003
  - DEC-0003
---

## 1. Propósito

Definir, de forma conceptual y todavía no ejecutable, las entidades de datos
que representan un lugar semántico y su contenido: `Building`, `Room`,
`BuildingSystem`, `Fixture`, `Furniture`, `Container`, `Item`,
`StructuralComponent`, `OccupantProfile`, `Household`, `BusinessProfile`,
`BuildingHistory`, `LootPressureZone`, `LootingRoute`, `LootingEvent`,
`KnowledgeSource`, `DiscoveryState` y `BuildingCondition`. Fija
responsabilidades, identidades y relaciones entre ellas; no escribe Prisma,
SQL, tablas ni endpoints.

## 2. Principios que no deben romperse

- Estos nombres son un vocabulario conceptual candidato, no una
  implementación final. Una entrega de inicialización técnica puede
  ajustarlos si encuentra una razón técnica concreta, dejando constancia del
  cambio (ver [DEC-0003](../decisions/DEC-0003_data-driven-design.md)).
- Cada entidad tiene una identidad estable (ID) independiente de su
  materialización visual, coherente con la generación determinista de
  [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md).
- Ninguna entidad de esta sección resuelve por sí sola una fórmula numérica
  de deterioro, saqueo o aprendizaje: son contenedores de datos y
  relaciones, no motores de cálculo.
- El modelo debe servir igual para el Canvas 2D actual y para un futuro 3D
  (ver [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md),
  sección 3.8): ninguna entidad puede depender de un formato de
  representación visual concreto.

## 3. Modelo funcional

### 3.1 Entidades de estructura física y contenido

| Entidad | Responsabilidad conceptual | Relaciones principales |
|---|---|---|
| `Building` | Identidad de un edificio: tipo, subtipo, dimensiones, plantas, distrito, época constructiva, parcela. | Contiene `Room[]`; referencia `OccupantProfile`/`Household`/`BusinessProfile`, `BuildingHistory`, `BuildingCondition`. |
| `Room` | Una estancia del programa (ver [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md)): tipo de estancia, planta, adyacencias del grafo funcional. | Pertenece a un `Building`; contiene `Furniture[]`, `Fixture[]`, `BuildingSystem[]` relevantes. |
| `BuildingSystem` | Una instalación integrada (eléctrica, agua, ACS, calefacción/climatización, telecomunicaciones, ventilación). | Pertenece a un `Building` o a una o varias `Room`; tiene su propio `BuildingCondition`. |
| `Fixture` | Un elemento fijo o instalado (sanitario, luminaria, cuadro eléctrico) distinto del mobiliario móvil. | Pertenece a una `Room` o `BuildingSystem`. |
| `Furniture` | Mobiliario y equipamiento (capa 2 de [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md)). | Pertenece a una `Room`; puede contener `Container[]`. |
| `Container` | Un contenedor de contenido suelto (armario, cajón, estante). | Pertenece a `Furniture`, `Fixture` o directamente a una `Room`; contiene `Item[]`. |
| `Item` | Un objeto de contenido suelto (capa 1). | Pertenece a un `Container` o, si es voluminoso, directamente a una `Room`. |
| `StructuralComponent` | Un componente estructural recuperable (capa 5): viga, muro, tejado, cimentación. | Pertenece a un `Building`. |

### 3.2 Entidades de ocupantes y actividad

| Entidad | Responsabilidad conceptual | Relaciones principales |
|---|---|---|
| `OccupantProfile` | Un antiguo ocupante o trabajador individual: profesión, aficiones, rasgos (ver [CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md)). | Pertenece a un `Household` o `BusinessProfile`. |
| `Household` | Un hogar: composición, estrato económico, `OccupantProfile[]`. | Asociado a un `Building` (o a una `Room` en un edificio mixto). |
| `BusinessProfile` | Un negocio o servicio: tipo de actividad, `OccupantProfile[]` trabajadores. | Asociado a un `Building` (o a una `Room` en un edificio mixto). |

### 3.3 Entidades de historia y saqueo

| Entidad | Responsabilidad conceptual | Relaciones principales |
|---|---|---|
| `BuildingHistory` | La historia del apocalipsis aplicada a un edificio (ver [WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md)): tipo de historia, consecuencias aplicadas. | Pertenece a un `Building`. |
| `LootPressureZone` | La presión histórica de saqueo de una zona (ver [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md)). | Agrupa varios `Building` por proximidad geográfica. |
| `LootingRoute` | Un corredor histórico recorrido por un grupo saqueador. | Referencia una secuencia ordenada de `Building` o `LootPressureZone`. |
| `LootingEvent` | Un saqueo histórico concreto sobre un `Building`: qué capas afectó, con qué intensidad. | Pertenece a un `Building`; puede derivar de una `LootingRoute` o de la presión de una `LootPressureZone`. |
| `BuildingCondition` | El estado físico y de deterioro de un `Building`, `BuildingSystem`, `Furniture` o `StructuralComponent`: funcional, degradado, averiado, incompleto, reparable, irreparable o útil solo como piezas (ver [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md)). | Asociado a la entidad física que describe. |

### 3.4 Entidades de conocimiento y descubrimiento

| Entidad | Responsabilidad conceptual | Relaciones principales |
|---|---|---|
| `KnowledgeSource` | Una fuente de conocimiento física, humana o digital presente en el lugar (ver [SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md)). | Puede ser un `Item`, un `OccupantProfile` recordado o un `BuildingSystem`/`Fixture` que enseña por observación. |
| `DiscoveryState` | El estado de información conocido por la comunidad sobre un `Building`, `Room`, `Container` o `Item` concreto (ver los cinco estados generales de [WLD-002](../20-world/WLD-002_local-exploration-and-information.md) y las capas de [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md)). | Referencia la entidad física que describe; registra quién la obtuvo y con qué confianza cuando sea relevante. |

### 3.4.1 Relaciones conceptuales con el espacio, los puntos regionales y el equipo

Este documento no diseña todavía entidades propias para el mapa, los puntos
de interés regionales ni los equipos de trabajo, pero sí registra sus
relaciones conceptuales para que una futura entrega no las invente sin
coherencia:

- Las entidades de la sección 3.1 existen **dentro** de una geografía local
  generada según
  [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md): un
  `Building` ocupa una parcela, que pertenece a una huella de asentamiento,
  que existe sobre terreno, agua, vegetación y red viaria. Esa cadena
  espacial es información de generación, no una propiedad visual del
  edificio.
- La estructura espacial interna (celdas, sectores, polígonos o grafos) es
  una decisión técnica todavía abierta (ver
  [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md), sección
  3.6). Ninguna entidad de este documento puede depender de una forma
  concreta de esa estructura.
- Un **punto de interés regional** es una entidad de la escala regional (ver
  [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md)),
  con su propio estado de conocimiento. No implica la existencia de un
  `Building` materializado ni de un mapa local asociado.
- Un **equipo operativo local** no es una entidad persistente del mundo: es
  la composición de una orden concreta (ver
  [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md),
  sección 3.9, y
  [ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md), sección 3.2).
  Lo que persiste es el trabajo, su progreso, su responsable y sus
  participantes, no un objeto «equipo» independiente.

No se fija aquí ninguna tabla, columna ni clase para estos conceptos.

### 3.5 Separación de identidad y contenido

`DiscoveryState` y `BuildingCondition` son deliberadamente entidades
separadas del contenido físico que describen (`Building`, `Room`, `Item`,
etc.): la primera representa **qué sabe la comunidad**, la segunda
**cómo está** el objeto en la realidad simulada. Esta separación es la que
permite, por ejemplo, que un `Container` con `Item[]` técnicos sin
identificar tenga un `DiscoveryState` de «no reconocido» sin que eso
implique regenerar su contenido al visitarlo de nuevo (ver
[WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md) y
[DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md)).

## 4. Reglas aprobadas

- Toda entidad de las secciones 3.1 a 3.4 tiene una identidad estable
  derivada de semilla, ID y versión del generador, coherente con
  [ARC-002](ARC-002_procedural-generation-and-persistence.md).
- `DiscoveryState` nunca se fusiona con el contenido físico que describe:
  deben poder evolucionar de forma independiente.
- `BuildingCondition` puede aplicarse a cualquier entidad física
  (`Building`, `BuildingSystem`, `Furniture`, `StructuralComponent`), no
  solo al edificio completo.
- Ninguna forma concreta de tabla, columna o clase de ORM queda fijada por
  este documento; solo entidades, responsabilidades y relaciones
  conceptuales.

## 5. Interacciones con otros sistemas

- La generación semántica que produce estas entidades se define en
  [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md).
- La presión y rutas de saqueo que producen `LootPressureZone`,
  `LootingRoute` y `LootingEvent` se definen en
  [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md).
- La historia del apocalipsis que produce `BuildingHistory` se define en
  [WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md).
- Las cinco capas de aprovechamiento y las acciones que consumen
  `BuildingCondition` se definen en
  [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md).
- Los catálogos de arquetipos, estancias y perfiles que instancian estas
  entidades se definen en
  [CAT-001](../catalogs/CAT-001_maximum-place-catalog.md),
  [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) y
  [CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md).
- Las fronteras técnicas que impiden a estas entidades depender de Prisma,
  React o Next.js se definen en
  [ARC-004](ARC-004_simulation-core-runtime-and-boundaries.md).

## 6. Casos límite o riesgos

- Fusionar `DiscoveryState` con el contenido físico rompería el principio
  de contenido base estable de
  [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md).
- Fijar prematuramente un esquema SQL a partir de estas entidades sin medir
  necesidades reales de consulta contradice la sección 4.4 de `DESIGN-004`
  (PostgreSQL sin convertir cada fotograma en SQL).

## 7. Preguntas abiertas

- Forma concreta de persistencia (tablas, documentos, JSON estructurado)
  para cada entidad, que se decidirá en la entrega de inicialización
  técnica.
- Si la geografía local, los puntos de interés regionales y la composición
  de una orden necesitarán entidades propias o se derivarán de las ya
  existentes (sección 3.4.1).
- Granularidad exacta de `LootingEvent` (por capa, por contenedor, por
  edificio completo).
- Si `KnowledgeSource` debe modelarse como entidad propia o como una
  propiedad de `Item`/`OccupantProfile`/`BuildingSystem` según el caso.

## 8. Ejemplos no normativos

El ejemplo JSON conceptual de `Building` del Anexo A (sección 78) ilustra
los campos que estas entidades podrían combinar (tipo, subtipo,
dimensiones, planta, distrito, época constructiva, hogar y su nivel
económico, profesiones, aficiones e historia); no es un contrato de datos
final ni un esquema ejecutable.
