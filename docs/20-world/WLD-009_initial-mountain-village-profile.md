---
id: WLD-009
title: Perfil numérico inicial del pueblo de montaña
status: approved
canonical_for:
  - presupuesto numérico del mapa local del primer escenario
  - rangos de construcciones, red viaria, agua y cobertura de terreno del perfil inicial
  - presupuesto de puntos de interés y visibilidad inicial
  - amenaza zombi inicial como presupuesto numérico
  - relación entre este presupuesto, WLD-008 y CAT-004
depends_on:
  - WLD-008
  - SCN-001
related:
  - WLD-005
  - WLD-002
  - WLD-010
  - CAT-004
  - THR-001
  - SCN-003
  - RDM-003
---

## 1. Propósito

Fijar el presupuesto numérico concreto del primer mapa local de
[SCN-001](../scenarios/SCN-001_mountain-village-arrival.md): huella
aproximada, presupuesto de construcciones, red viaria, agua, cobertura de
terreno, puntos de interés, visibilidad inicial, tiempos de cruce y
amenaza zombi inicial, dentro del perfil de escenario ya aprobado en
[WLD-008](WLD-008_local-procedural-map-generation.md).

[WLD-008](WLD-008_local-procedural-map-generation.md) es canónico para el
**perfil conceptual** de pueblo pequeño de montaña, sus doce capas
generativas y su presupuesto de complejidad; este documento es canónico
para los **rangos numéricos concretos** que ese perfil usa en el primer
escenario. No duplica las capas ni la estructura espacial técnica de
`WLD-008`: las hereda y las instancia con cifras.

## 2. Principios que no deben romperse

- Las cifras de este documento son un **presupuesto orientativo del
  generador**, no una fórmula matemática cerrada ni un contrato de datos
  ejecutable: fijan rangos coherentes con el presupuesto de complejidad
  de
  [WLD-008 §3.4](WLD-008_local-procedural-map-generation.md#34-presupuesto-de-complejidad),
  no valores exactos idénticos en cada semilla.
- La huella de `3 × 3 km` es una contención aproximada, nunca un cuadrado
  visual obligatorio: relieve, bosque, cauces, carreteras y zonas
  inaccesibles forman límites naturales, coherente con
  [WLD-008 §3.1](WLD-008_local-procedural-map-generation.md#31-perfil-de-escenario).
- Este presupuesto describe el **mundo funcional máximo** del escenario;
  no aprueba, por sí solo, ningún subconjunto técnico de implementación
  (ver sección 3.7 y
  [DEC-0006](../decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md)).
- La visibilidad inicial limitada (sección 3.6) no es opcional: la
  comunidad nunca conoce de entrada más que una fracción de los puntos de
  interés generados.

## 3. Modelo funcional

### 3.1 Extensión y forma

El mapa ocupa una huella funcional irregular contenida aproximadamente
en:

```text
3 km × 3 km
```

No se muestra como un cuadrado artificial. Referencias temporales de
cruce: de extremo a extremo por una ruta favorable, aproximadamente
`45–60` minutos simulados; por una ruta montañosa, cargada o degradada,
puede superar `90` minutos. Los trayectos de horas o días fuera de este
espacio pertenecen al futuro mapa regional de
[WLD-003](WLD-003_strategic-world-and-regional-simulation.md), sin
abrirse en esta entrega.

### 3.2 Presupuesto de construcciones

El escenario genera entre `55` y `85` construcciones, incluyendo:

| Familia | Rango orientativo |
|---|---:|
| Viviendas | 28–42 |
| Garajes, cobertizos, graneros y anexos | 10–18 |
| Lugares comerciales, comunitarios o técnicos | 6–10 |
| Construcciones rurales o aisladas | 4–8 |
| Construcciones colapsadas o parcialmente inutilizables | 3–7 |

Las categorías pueden solaparse conceptualmente si un edificio cumple
varias funciones, pero el total no se cuenta dos veces. No todos los
interiores permanecen activos simultáneamente: se conserva la generación
diferida reproducible de
[ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md)
y la realidad semántica de
[WLD-005](WLD-005_semantic-place-and-building-generation.md) previa a la
representación Canvas.

### 3.3 Red viaria

- una carretera principal que atraviesa o bordea el asentamiento;
- entre dos y cuatro calles secundarias;
- entre cinco y nueve caminos rurales, senderos o pistas;
- uno o dos accesos regionales bloqueados, peligrosos o inicialmente
  desconocidos;
- al menos una ruta alternativa descubrible.

### 3.4 Agua

Toda semilla válida contiene: una fuente natural principal (arroyo, río
pequeño, manantial o equivalente); entre una y tres fuentes secundarias
(pozo, cisterna, depósito, estanque, instalación doméstica o captación);
al menos dos rutas potenciales distintas para resolver el abastecimiento
inicial, coherente con la garantía de
[SCN-003 §3.7](../scenarios/SCN-003_first-day-starting-state.md#37-garantías-de-una-semilla-válida).
Encontrar agua no garantiza que sea potable, accesible, sostenible ni
comprendida: inspección, recipientes, tratamiento, reparación o
conducción pueden seguir siendo necesarios (ver
[SET-003 §4](../40-settlement/SET-003_resources-logistics-and-condition.md#4-reglas-aprobadas)).

### 3.5 Cobertura del terreno

| Terreno | Cobertura orientativa |
|---|---:|
| Bosque y matorral | 35–55 % |
| Campos, prados y espacios abiertos | 15–30 % |
| Núcleo construido, carreteras y parcelas | 8–15 % |
| Pendientes, roca, agua y terreno difícil | Resto coherente |

No se exige que todas las semillas sumen mediante una elección
independiente de porcentajes; el generador produce una geografía causal
dentro de estas bandas, sobre las capas de terreno, agua y vegetación ya
aprobadas en
[WLD-008 §3.2](WLD-008_local-procedural-map-generation.md#32-cadena-generativa-espacial).

### 3.6 Puntos de interés y visibilidad inicial

Se generan entre `12` y `18` lugares significativos, de familias
posibles como: comercio alimentario, taller, punto de agua, edificio
comunitario, recurso sanitario, explotación agrícola o ganadera,
instalación eléctrica o de comunicaciones, edificio parcialmente
colapsado, vehículo o bloqueo, lugar con historia del colapso, refugio
anterior, o zona con señales humanas o zombis.

Al llegar, la comunidad solo conoce entre tres y seis siluetas, accesos o
indicios, coherente con la niebla de
[WLD-002 §3.1](WLD-002_local-exploration-and-information.md#31-estados-de-información)
y con
[WLD-008 §3.8](WLD-008_local-procedural-map-generation.md#38-información-inicial-y-niebla).
Ver un campanario, una nave o humo no revela su interior ni su estado
real.

### 3.7 Relación con CAT-004

`DESIGN-008` aprobó
[CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md) como
primer catálogo implementable (ocho perfiles), pero esa aprobación no
amplía por sí sola este presupuesto ni el alcance de una entrega de
código concreta:

- este documento sigue describiendo el **mundo funcional máximo** del
  escenario; `CAT-004` describe el **catálogo de contenido aprobado** para
  una futura entrega de programación, no el mundo funcional completo de
  este presupuesto;
- un mapa de `55–85` construcciones puede reutilizar los ocho perfiles y
  sus variaciones semánticas de
  [CAT-001](../catalogs/CAT-001_maximum-place-catalog.md) sin exigir
  `55–85` clases de perfil distintas; el resto del presupuesto puede
  seguir generándose con detalle diferido y perfiles todavía no
  soportados (ver [WLD-010 §3.3](WLD-010_mutable-terrain-and-spatial-construction.md#33-identidad-estable-y-persistencia));
- ningún lugar de este presupuesto se marca como implementado ni amplía
  [RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md);
- la transformación mutable del terreno, la agricultura, los accesos y el
  transporte que actúan sobre este mapa se definen en
  [WLD-010](WLD-010_mutable-terrain-and-spatial-construction.md),
  [WLD-011](WLD-011_openings-access-and-connectivity.md),
  [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md) y
  [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md).

### 3.8 Amenaza zombi inicial

La población zombi inicial real del mapa local se sitúa entre `12` y
`30` zombis, ni conocida por el jugador ni por el grupo. El detalle
completo de distribución, contención y limpieza es responsabilidad
canónica de
[SCN-003 §3.6](../scenarios/SCN-003_first-day-starting-state.md#36-amenaza-zombi-inicial-contenida-y-limpiable),
que aplica el zombi estándar ya cerrado en
[THR-001](../60-threats/THR-001_zombie-threat-model.md). Este documento
solo registra la cifra como parte del presupuesto numérico del mapa; no
la repite ni la reinterpreta.

## 4. Reglas aprobadas

- La huella del mapa local de este escenario es una contención
  aproximada de `3 × 3 km`, nunca un cuadrado visual obligatorio.
- El presupuesto de `55–85` construcciones, con los rangos por familia de
  la sección 3.2, es obligatorio en toda semilla válida de este
  escenario.
- La red viaria, el agua y la cobertura de terreno de las secciones 3.3 a
  3.5 son rangos obligatorios, no cifras exactas fijas.
- Al llegar, la comunidad conoce como máximo entre tres y seis siluetas o
  indicios, nunca la totalidad de los `12–18` puntos de interés
  generados.
- Este presupuesto no autoriza, por sí solo, ningún subconjunto técnico
  de implementación de `CAT-004` ni amplía `RDM-003`.

## 5. Interacciones con otros sistemas

- El perfil conceptual, las doce capas generativas, el presupuesto de
  complejidad y la estructura espacial técnica invisible siguen siendo
  propiedad de
  [WLD-008](WLD-008_local-procedural-map-generation.md), que este
  documento no duplica.
- La generación semántica de cada edificio y lugar concreto dentro de
  este presupuesto se rige por
  [WLD-005](WLD-005_semantic-place-and-building-generation.md).
- Los estados de información y la niebla sobre estos puntos de interés se
  rigen por
  [WLD-002](WLD-002_local-exploration-and-information.md).
- El catálogo de arquetipos que puebla este presupuesto se rige por
  [CAT-001](../catalogs/CAT-001_maximum-place-catalog.md); el primer
  catálogo aprobado para implementación es
  [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md)
  (`approved`, ocho perfiles).
- El modelo de nodo, línea, área y estructura que este presupuesto
  instancia se rige por
  [WLD-010](WLD-010_mutable-terrain-and-spatial-construction.md).
- La amenaza zombi inicial aplicada sobre este mapa se rige por
  [SCN-003](../scenarios/SCN-003_first-day-starting-state.md) y por
  [THR-001](../60-threats/THR-001_zombie-threat-model.md).
- La hoja de ruta activa que decide qué parte de este mundo funcional
  máximo se implementa primero es
  [RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md).
- El punto de entrada y síntesis del escenario es
  [SCN-001](../scenarios/SCN-001_mountain-village-arrival.md).

## 6. Casos límite o riesgos

- Tratar la huella de `3 × 3 km` como un límite cuadrado visual
  contradice la sección 2 y el principio de mapa orgánico de `WLD-008`.
- Revelar al jugador, desde el inicio, la totalidad de los `12–18` puntos
  de interés contradice la sección 3.6 y la niebla de `WLD-002`.
- Interpretar este documento como aprobación de `CAT-004` para
  implementación contradice la sección 3.7 y
  [DEC-0006](../decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md).

## 7. Preguntas abiertas

- Algoritmo geométrico exacto de terreno, agua, calles y parcelas dentro
  de estos rangos (heredada de
  [WLD-008 §7](WLD-008_local-procedural-map-generation.md#7-preguntas-abiertas)).
- Tamaño de celdas, sectores o `chunks` internos, si los hay.
- Radio de visión, línea de visión y oclusión exactos que determinan qué
  siluetas se conocen al llegar.
- Cantidades exactas definitivas de edificios o lugares por semilla
  concreta, más allá de los rangos orientativos de este documento.
- Qué parte de este presupuesto usa exactamente el subconjunto de
  [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md), ahora
  `approved`, frente a perfiles todavía no soportados por ninguna entrega
  de código.

Ver también `docs/OPEN-QUESTIONS.md`.

## 8. Ejemplos no normativos

- Una semilla puede generar `62` construcciones con `34` viviendas, `12`
  anexos, `8` lugares comerciales/comunitarios, `5` rurales aisladas y
  `3` colapsadas; otra semilla puede desplazar esos totales dentro de los
  mismos rangos sin dejar de ser el mismo perfil.
- Un valle con la carretera principal siguiendo un arroyo, el núcleo
  antiguo en la ladera y dos granjas dispersas en la periferia es una
  salida plausible de este presupuesto; ninguna semilla concreta está
  garantizada.
