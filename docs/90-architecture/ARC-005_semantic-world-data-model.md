---
id: ARC-005
title: Modelo conceptual de datos del mundo semántico
status: approved
canonical_for:
  - entidades conceptuales de edificio, estancia, instalación y contenido
  - entidades conceptuales de ocupantes, historia y saqueo
  - identidades, relaciones y límites entre estas entidades
  - entidades conceptuales de área, línea, nodo, estructura, anclaje, abertura, cierre, obstrucción, parcela de cultivo, medio de transporte y carga
depends_on:
  - ARC-004
  - WLD-005
related:
  - WLD-006
  - WLD-007
  - WLD-008
  - WLD-010
  - WLD-011
  - UI-006
  - SET-007
  - SET-010
  - CAT-001
  - CAT-002
  - CAT-003
  - CAT-004
  - CAT-005
  - DEC-0003
  - DEC-0013
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

### 3.5 Entidades del entorno moldeable, accesos y transporte (`DESIGN-008`)

Ampliación conceptual, sin fijar tablas o clases finales, que registra
nombres candidatos coherentes con el modelo de
[WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md)
y [WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md):

| Entidad candidata | Responsabilidad conceptual | Relaciones principales |
|---|---|---|
| `WorldFeature` (elemento espacial o entidad del mundo común) | Superclase conceptual, no técnica, que agrupa área, cobertura, elemento lineal, nodo y estructura no edificatoria. | Existe dentro de la geografía de [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md). |
| `TerrainArea` (área de terreno) | Una zona (campo, bosque/matorral, patio, parcela): capas semánticas de [WLD-010 §3.2](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md#32-capas-semánticas-de-una-zona-de-terreno). | Puede contener `Building[]`, `LinearFeature[]` o `CultivationPlot`. |
| `LandCover` (cobertura o uso del suelo) | La capa 2 de una `TerrainArea`: hierba, matorral, bosque, cultivo, asfalto, grava, barro, agua o escombros. | Pertenece a una `TerrainArea`. |
| `LinearFeature` (elemento lineal o corredor) | Muro, valla, carretera, camino, acequia o tubería. | Conecta `Anchor[]`; puede cruzar otra `LinearFeature` o `TerrainArea`. |
| `NaturalOrTechnicalNode` (nodo o instalación exterior) | Pozo, bomba, poste, árbol singular o depósito (perfil `ENV-01`). | Puede pertenecer a una `TerrainArea` o a un `Building`. |
| `NonBuildingStructure` (estructura construida no necesariamente edificatoria) | Torre, poste construido u otra estructura con huella sin programa de estancias completo. | Puede servir de `Anchor`. |
| `Anchor` (anclaje) | Punto estructural, esquina de muro, poste, extremo de barrera o portón válido para construcción lineal. | Referenciado por `LinearFeature`. |
| `Opening` (abertura) | Hueco físico que conecta dos espacios (ver [WLD-011 §3.1](../20-world/WLD-011_openings-access-and-connectivity.md#31-tres-conceptos-separados)). | Conecta dos `Room`, `TerrainArea` o exterior/interior. |
| `InstalledClosure` (cierre instalado) | Puerta, portón, ventana, persiana, verja o trampilla. | Controla una `Opening`; conserva su propio `BuildingCondition` y puede existir como `Item` si se recupera. |
| `Obstruction` (obstrucción, barricada o modificación) | Cerradura, bloqueo, barricada, tablones, refuerzo, escombros o tapiado. | Aplicada sobre una `Opening` o `InstalledClosure`; evoluciona de forma independiente. |
| `Connection` (conexión entre espacios) | Un enlace del grafo de circulación entre dos `Room`/`TerrainArea`/`NonBuildingStructure`. | Puede depender de una `Opening` transitable. |
| `CultivationPlot` (parcela de cultivo) | Estado del ciclo agrícola de [SET-011 §3.1](../40-settlement/SET-011_initial-agriculture-loop.md#31-estados-funcionales-mínimos). | Pertenece a una `TerrainArea` de tipo campo. |
| `TransportMeans` (medio de transporte local) | Carretilla, carro u otro medio de [SET-010 §3.2](../40-settlement/SET-010_local-hauling-and-transport.md#32-métodos-activos-en-el-primer-recorte). | Puede transportar `LoadBundle`; conserva su propio `BuildingCondition`. |
| `LoadBundle` (carga o conjunto de carga) | Agrupación de `Item`/recursos en tránsito, con peso, bulto y etiquetas de manipulación. | Referencia `Item[]` o cantidades de recurso; asociada a un `TransportMeans` o a una persona. |
| `TransferPoint` (punto de transferencia o destino logístico) | Punto de reunión, borde de campo, zona temporal de carga, puerta/portón del perímetro u otro destino de [SET-010 §3.8](../40-settlement/SET-010_local-hauling-and-transport.md#38-logística-por-etapas-y-puntos-de-transferencia). | Puede coincidir con una `Opening`, `Container` o `TerrainArea`. |
| `PersistentTerrainChange` (transformación persistente del terreno) | Registro de que una `TerrainArea` o `LinearFeature` fue despejada, excavada, rellenada, nivelada, cultivada, fortificada o construida. | Asociada a la entidad física transformada; nunca se deshace por recarga. |

### 3.6 Separación de identidad y contenido

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
- Un `Building` deja de ser el contenedor universal del mundo: las
  entidades de la sección 3.5 existen con la misma legitimidad, dentro o
  fuera de cualquier edificio.
- No todo elemento de la sección 3.5 debe convertirse en una entidad SQL
  separada; tampoco hereda todo de una clase técnica imaginaria común.
  `BuildingCondition` puede aplicarse igualmente a `InstalledClosure`,
  `NonBuildingStructure` y `TransportMeans`, no solo a `Building`.
- `DiscoveryState` sigue separado del estado real también para
  `TerrainArea`, `LinearFeature`, `CultivationPlot` y `TransportMeans`.

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
- Las reglas funcionales que gobiernan las entidades de la sección 3.5 se
  definen en
  [WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md),
  [WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md),
  [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md) y
  [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md); este
  documento solo registra su vocabulario conceptual.
- El primer catálogo implementable que instancia estas entidades se
  aprueba en
  [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md) y
  [CAT-005](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md).

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
