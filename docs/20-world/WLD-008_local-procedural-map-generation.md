---
id: WLD-008
title: Generación procedural del mapa local
status: approved
canonical_for:
  - generación espacial del mapa local
  - perfil procedural controlado de pueblo pequeño de montaña
  - cadena de capas terreno → agua → vegetación → rutas → asentamiento → parcelas → lugares
  - presupuesto de complejidad y exclusión de grandes ciudades
  - estructura espacial técnica invisible del mapa local
depends_on:
  - WLD-001
  - WLD-005
  - ARC-002
related:
  - WLD-002
  - WLD-006
  - WLD-007
  - UI-005
  - UI-006
  - SCN-001
  - ARC-005
  - DEC-0005
  - DEC-0010
  - CAT-004
  - WLD-010
---

## 1. Propósito

Definir cómo se genera la **geografía del mapa local**: el perfil procedural
controlado del primer escenario, las capas espaciales que lo componen, la
variación permitida por semilla, el presupuesto de complejidad que impide
que una tirada extrema produzca una gran ciudad, y la estructura espacial
técnica invisible sobre la que se apoya un mapa visualmente continuo.

[WLD-005](WLD-005_semantic-place-and-building-generation.md) es canónico
para la generación **semántica** de un lugar o edificio concreto (tipo,
programa, grafo, ocupantes, contenido). Este documento es canónico para lo
que existe **antes y alrededor** de ese edificio: relieve, agua, vegetación,
red viaria, huella del asentamiento y parcelas. No duplica `WLD-005` ni
[UI-005](../80-interface/UI-005_top-down-simulation-workbench.md): enlaza a
ambos.

## 2. Principios que no deben romperse

- **La realidad semántica precede a la representación visual.** El generador
  espacial produce un mundo lógico; el Canvas 2D de
  [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md) lo
  dibuja. El Canvas nunca es fuente de verdad (ver
  [WLD-005](WLD-005_semantic-place-and-building-generation.md), sección
  3.8).
- **La geografía del primer escenario es ficticia.** Es un pueblo de montaña
  generado dentro de un perfil controlado, no la reproducción literal de
  Sort ni de ningún otro municipio real. Sort, Cataluña, Aragón, Andorra o
  Francia solo han sido referencias de ambiente y escala durante el diseño;
  no son contenido comprometido del juego.
- **Una semilla no puede romper el perfil.** El generador inicial no puede
  producir por azar complejidad que el juego todavía no soporta (ver
  sección 3.5).
- **El mapa es visualmente continuo y orgánico.** La estructura espacial
  interna (celdas, sectores, polígonos, grafos) es técnica e invisible: no
  se impone al jugador como estética obligatoria, salvo en herramientas de
  depuración o capas funcionales justificadas.
- **La generación mantiene las reglas ya aprobadas** de semilla, ID estable,
  versión de generador, generación diferida reproducible y persistencia de
  todo cambio causado o conocido (ver
  [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md)
  y [DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md)). Este
  documento no repite esas reglas: las hereda.

## 3. Modelo funcional

### 3.1 Perfil de escenario

Un **perfil de escenario** describe el tipo de mundo local que el generador
puede producir y acota lo que una semilla puede variar. El perfil inicial
aprobado, en forma conceptual y no como esquema de datos:

```text
Perfil: pueblo pequeño de montaña
Entorno dominante: valle, bosque, montaña, campos y agua posible
Tamaño: pequeño y acotado
Densidad: baja o media
Alturas ordinarias: una a tres plantas
Red viaria: carretera principal, calles limitadas y caminos secundarios
Catálogo permitido: subconjunto inicial soportado de lugares y edificios
Complejidad: limitada por presupuesto de generación y simulación
```

Los nombres técnicos definitivos del perfil y de sus campos quedan
**abiertos**. Este bloque no es un esquema TypeScript ni Prisma y no fija
unidades, métricas ni rangos numéricos. El subconjunto de catálogo
permitido depende de lo que se apruebe a partir de
[CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md), todavía
`draft`.

Si en el futuro se desea una geografía real, será **otro modo de generación
o fuente de datos**, con su propia decisión; no una consecuencia implícita
de este documento.

### 3.2 Cadena generativa espacial

El mapa local se construye conceptualmente por capas, en este orden de
dependencia lógica (cada capa puede materializarse de forma diferida, pero
no puede existir antes que aquella de la que depende):

| Nº | Capa | Fuente canónica de su contenido |
|---:|---|---|
| 1 | Perfil de escenario o región | Este documento, sección 3.1 |
| 2 | Terreno, relieve y pendientes | Este documento |
| 3 | Agua e hidrología relevante | Este documento |
| 4 | Vegetación y usos generales del suelo | Este documento |
| 5 | Red de carreteras, calles y caminos | Este documento |
| 6 | Huella del asentamiento y zonas funcionales | Este documento; alimenta el contexto de [WLD-005](WLD-005_semantic-place-and-building-generation.md) §3.2 |
| 7 | Parcelas y espacios no edificados | Este documento; alimenta [WLD-005](WLD-005_semantic-place-and-building-generation.md) §3.2 |
| 8 | Lugares y edificios semánticos | [WLD-005](WLD-005_semantic-place-and-building-generation.md) |
| 9 | Historia ambiental, deterioro y saqueo | [WLD-007](WLD-007_place-history-and-environmental-storytelling.md), [WLD-006](WLD-006_historical-looting-pressure-and-routes.md), [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) |
| 10 | Estado actual, amenazas y ocupación | [THR-001](../60-threats/THR-001_zombie-threat-model.md), [SOC-003](../50-society/SOC-003_external-communities-and-regional-history.md) |
| 11 | Información inicial, niebla y conocimiento comunitario | [WLD-002](WLD-002_local-exploration-and-information.md), [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md) |
| 12 | Representación Canvas | [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md) |

Las capas 1 a 7 son la responsabilidad canónica de este documento. Las
capas 8 a 12 se enlazan, nunca se duplican aquí.

El **algoritmo geométrico exacto** de cada capa (relieve, cauces, trazado
de calles, subdivisión en parcelas) permanece abierto; ver sección 7.

### 3.3 Variación permitida por semilla

Dentro del perfil, la semilla puede variar de forma coherente:

- relieve, pendientes y forma del valle;
- cursos y puntos de agua;
- vegetación, masas forestales y claros;
- campos y terrenos abiertos;
- carretera principal, calles y caminos;
- forma y distribución del asentamiento;
- zonas, distritos o agrupaciones funcionales;
- parcelas;
- cantidad, tipo, tamaño, orientación y estado de edificios;
- posición del grupo inicial y candidatos a refugio;
- accesos bloqueados o deteriorados;
- historia del colapso;
- presión y rutas de saqueo;
- ocupantes anteriores y actuales;
- amenazas;
- recursos y conocimiento recuperable;
- información inicial conocida por la comunidad.

Dos partidas del mismo perfil deben poder sentirse distintas sin dejar de
ser el mismo tipo de lugar.

### 3.4 Presupuesto de complejidad

El perfil declara un presupuesto conceptual de generación y simulación:
cuánto mundo puede existir, con cuánto detalle y con cuántos interiores
activos. Ese presupuesto, no una comprobación cosmética posterior, es lo
que impide que una semilla desborde el juego. Sus cifras concretas
permanecen abiertas y se medirán al implementar (ver
[ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md),
que ya prohíbe prometer rendimiento sin medir).

### 3.5 Complejidad excluida del perfil inicial

El generador inicial **no puede producir**, ni siquiera por una tirada
extrema:

- una gran ciudad;
- cientos o miles de bloques urbanos detallados;
- rascacielos;
- grandes autopistas urbanas;
- un puerto marítimo;
- un aeropuerto internacional;
- redes de metro;
- distritos de alta densidad;
- miles de interiores activos;
- arquetipos no incluidos en el subconjunto soportado.

Las grandes ciudades requerirán en el futuro **perfiles, presupuestos,
abstracciones y reglas propios**. No aparecen como efecto colateral de una
semilla afortunada ni de ampliar el catálogo.

### 3.6 Estructura espacial técnica invisible

Aunque el mapa se dibuje continuo y orgánico, puede y debe apoyarse
internamente en una estructura espacial que no se muestra al jugador. Esa
estructura puede servir para:

- navegación y cálculo de rutas;
- ocupación física y colisiones;
- costes de terreno y pendientes;
- línea de visión y ocultación;
- niebla de guerra;
- zonas habituales, de precaución y prohibidas;
- selección y designación de áreas;
- puntos de interacción;
- división en sectores o `chunks`;
- generación y carga diferida;
- consultas espaciales y rendimiento.

**No se decide en esta entrega** si la implementación final usa casillas
cuadradas, polígonos, navegación por grafos, una combinación u otra
estructura técnica. Tampoco se fijan tamaños de celda, sector o `chunk`.
Lo que sí queda cerrado es que esa estructura es interna: la cuadrícula no
es la estética del mapa local.

### 3.7 Territorio conocido, utilizado y controlado

El refugio inicial ocupa una parte pequeña del mapa local. El mapa debe
permitir distinguir conceptualmente:

- núcleo comunitario;
- entorno usado habitualmente;
- frontera operativa conocida pero insegura;
- territorio descubierto sin visión directa actual;
- territorio todavía oculto;
- áreas sobre las que el jugador aplica una norma espacial.

Estos son conceptos descriptivos, **no nuevos estados de zona**. Los únicos
estados normativos de zona siguen siendo los tres ya aprobados en
[UI-001](../80-interface/UI-001_interaction-and-command-model.md), sección
3.4: **Habitual**, **Precaución** y **Prohibida**.

Descubrir, observar, asegurar, reclamar y controlar territorio siguen siendo
procesos diferentes. Pintar una zona no la explora, no la limpia y no la
hace segura.

### 3.8 Información inicial y niebla

La comunidad empieza conociendo una fracción mínima del mapa: el grupo, el
punto de llegada y una cercanía razonable (ver
[UI-005](../80-interface/UI-005_top-down-simulation-workbench.md), sección
2). El generador decide qué información inicial existe, no qué se muestra:

- la niebla responde a la **visibilidad espacial**;
- los cinco estados de
  [WLD-002](WLD-002_local-exploration-and-information.md) responden a lo que
  la comunidad **sabe** de un lugar;
- revelar terreno no genera contenido, no registra habitaciones y no asegura
  edificios;
- un lugar puede permanecer conocido aunque no esté a la vista;
- la información puede quedar anticuada si el mundo cambia.

El conocimiento local debe poder guardar, como mínimo, cuándo y con qué
confianza se conoció algo cuando esa diferencia sea relevante (ver
`DiscoveryState` en
[ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md)). Las
fórmulas de deterioro de información no se fijan en esta entrega.

## 4. Reglas aprobadas

- La geografía del primer escenario es procedural, reproducible y derivada
  de semilla; nunca una reproducción literal de un municipio real.
- El perfil inicial es un pueblo pequeño de montaña acotado; una semilla no
  puede convertirlo en una gran ciudad ni introducir los arquetipos
  excluidos de la sección 3.5.
- El orden lógico de dependencia de las doce capas de la sección 3.2 no se
  altera: la realidad semántica precede a la representación Canvas.
- La estructura espacial interna del mapa local es técnica e invisible; la
  cuadrícula no es la estética del mapa.
- Los estados normativos de zona siguen siendo exactamente tres
  (`Habitual`, `Precaución`, `Prohibida`); los conceptos de territorio de la
  sección 3.7 no crean estados nuevos.
- Una geografía real futura requerirá otro modo de generación y su propia
  decisión.

## 5. Interacciones con otros sistemas

- La generación semántica de cada lugar y edificio que ocupa las parcelas de
  la capa 7 se define en
  [WLD-005](WLD-005_semantic-place-and-building-generation.md).
- La presión histórica de saqueo y las rutas que modifican el estado
  resultante se definen en
  [WLD-006](WLD-006_historical-looting-pressure-and-routes.md); la historia
  del apocalipsis, en
  [WLD-007](WLD-007_place-history-and-environmental-storytelling.md).
- Los estados de información sobre un lugar se rigen por
  [WLD-002](WLD-002_local-exploration-and-information.md).
- La representación Canvas 2D cenital, la niebla y el control con ratón se
  rigen por
  [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md).
- La interacción contextual con los lugares generados y la composición de
  equipos se rigen por
  [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md).
- La reproducibilidad por semilla, ID y versión, y la persistencia de
  cambios, siguen definidas en
  [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md)
  y [DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md).
- La condición inicial de partida que este generador debe poder satisfacer
  se define en
  [SCN-001](../scenarios/SCN-001_mountain-village-arrival.md).
- La dirección de mapas y escalas que respalda este documento se registra en
  [DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md).
- La transformación persistente de terreno, cobertura, carreteras y
  estructuras lineales que actúa sobre las capas 2 a 7 de la sección 3.2 se
  define en
  [WLD-010](WLD-010_mutable-terrain-and-spatial-construction.md); esta
  entrega no redefine el orden ni el contenido de esas capas.

## 6. Casos límite o riesgos

- Dejar que el catálogo crezca sin actualizar el presupuesto de complejidad
  permitiría que una semilla generase un asentamiento que el juego no puede
  simular; el presupuesto de la sección 3.4 debe revisarse con cada
  ampliación de catálogo.
- Tratar la estructura interna (celdas o sectores) como la presentación del
  mapa contradiría la sección 3.6 y
  [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md).
- Convertir los seis conceptos de territorio de la sección 3.7 en estados de
  zona rompería las tres zonas cerradas por `DESIGN-001` en
  [UI-001](../80-interface/UI-001_interaction-and-command-model.md).
- Derivar contenido semántico de la huella dibujada en Canvas invertiría la
  dependencia de la sección 3.2.

## 7. Preguntas abiertas

- Dimensiones exactas del mapa local y unidades empleadas.
- Tamaño de celdas, sectores o `chunks` internos, si los hay.
- Algoritmo de pathfinding.
- Algoritmo geométrico exacto de terreno, agua, calles y parcelas.
- Radio de visión, línea de visión y oclusión exactos (compartida con
  [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md)).
- Interfaz exacta para varias plantas de un edificio.
- Cantidades exactas de edificios o lugares por semilla.
- Cifras del presupuesto de complejidad y de rendimiento.
- Nombres técnicos definitivos del perfil y de sus campos.
- Catálogo inicial definitivo mientras
  [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md) siga
  pendiente de aprobación.

Ver también `docs/OPEN-QUESTIONS.md`.

## 8. Ejemplos no normativos

- Un valle con la carretera principal siguiendo el río, el núcleo antiguo en
  la ladera y dos granjas dispersas en la periferia es una salida plausible
  del perfil; otra semilla puede colocar el núcleo junto a un puente y dejar
  la ladera como bosque. Ninguna de las dos está garantizada.
- Un arroyo que cruza un campo abierto y una pequeña masa forestal irregular
  ilustran que la vegetación y el agua no se dibujan como rectángulos; no
  fijan forma, tamaño ni técnica de generación.
