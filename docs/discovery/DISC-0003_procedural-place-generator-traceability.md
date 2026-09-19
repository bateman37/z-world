---
id: DISC-0003
title: Trazabilidad del generador procedural de lugares
status: draft
canonical_for: []
depends_on: []
related:
  - CAT-001
  - CAT-002
  - CAT-003
  - CAT-004
  - WLD-005
  - WLD-006
  - WLD-007
  - SET-007
  - ARC-004
  - ARC-005
  - UI-005
  - RDM-003
  - DEC-0008
---

## 1. Propósito

Demostrar que ningún contenido del Anexo A de
[prompts/DESIGN-004_simulation-first-reboot-and-procedural-places.md](../../prompts/DESIGN-004_simulation-first-reboot-and-procedural-places.md)
se perdió al formalizarlo en documentación canónica. La sección 3 mapea
cada una de las 86 secciones numeradas (`0` a `85`) del Anexo A a su
documento canónico de destino o a una pregunta abierta concreta. Este
documento no duplica el catálogo ni las reglas: es un índice de
trazabilidad, síntesis según
[DOC-001](../00-governance/DOC-001_documentation-system.md), sección 3.8.

## 2. Principios que no deben romperse

- Este documento es `draft`: es una síntesis de trazabilidad, no una fuente
  canónica de reglas. Las reglas viven en los documentos de destino.
- Ninguna fila de la matriz puede quedar vacía: las 86 secciones deben
  tener un destino canónico, una pregunta abierta registrada, o ambos.
- Actualizar un documento de destino no obliga a reescribir esta matriz
  salvo que cambie a qué documento apunta una sección.

## 3. Matriz de trazabilidad (secciones 0–85 del Anexo A)

| § | Título del Anexo A | Destino canónico | Nota |
|---:|---|---|---|
| 0 | Propósito | [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md), [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md), [WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md), [CAT-001](../catalogs/CAT-001_maximum-place-catalog.md)–[CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md) | Objetivo general repartido entre generador semántico, saqueo histórico, historia ambiental y catálogos. |
| 1 | Visión general | [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §2 | Principio «el edificio no es un cofre de loot». |
| 2 | Principio fundamental: el edificio semántico existe antes que el 3D | [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §2, §3.8 | Semántica antes que geometría. |
| 3 | Las dimensiones no determinan por sí solas el tipo | [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §3.2 | — |
| 4 | Estructura procedural general | [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §3.1 | Cadena generativa completa. |
| 5 | El edificio tiene varias capas de recursos | [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §2, §3.1 | — |
| 6 | Capa 1 — Contenido suelto | [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §3.1; [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.3 | — |
| 7 | Capa 2 — Mobiliario y equipamiento | [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §3.1 | — |
| 8 | Capa 3 — Instalaciones desmontables | [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §3.1; [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.6 | — |
| 9 | Instalación eléctrica | [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.6 | — |
| 10 | Instalación de agua | [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.6 | — |
| 11 | Calefacción y climatización | [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.6 | — |
| 12 | Telecomunicaciones | [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.6 | — |
| 13 | Ventilación | [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.6 | — |
| 14 | Capa 4 — Acabados recuperables | [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.7; [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §3.1 | — |
| 15 | Capa 5 — Estructura | [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.8; [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §3.1 | — |
| 16 | Desmontar no es demoler | [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §3.3 | — |
| 17 | Tres vidas de un edificio | [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §3.2 | — |
| 18 | Estados de explotación de un edificio | [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §3.4 | — |
| 19 | Módulos funcionales reutilizables | [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.1 | — |
| 20 | Edificios mixtos | [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.2; [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §3.3 | — |
| 21 | Programa de estancias | [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §3.4 | — |
| 22 | Grafo de estancias | [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §3.4 | — |
| 23 | Habitación → mobiliario → contenido | [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.3; [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §3.5 | — |
| 24 | Ejemplo: cocina | [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.3 | Ejemplo no normativo. |
| 25 | Perfil de los antiguos ocupantes | [CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md) §3.1; [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §3.6 | — |
| 26 | Ejemplo de coherencia | [CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md) §3.6 | Ejemplo no normativo. |
| 27 | Composición del hogar | [CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md) §3.1 | — |
| 28 | Nivel económico | [CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md) §3.2 | — |
| 29 | Profesiones de ocupantes | [CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md) §3.3 | — |
| 30 | Aficiones | [CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md) §3.4 | — |
| 31 | Traits especiales | [CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md) §3.5 | — |
| 32 | Ejemplo: radioaficionado | [CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md) §3.5 | Ejemplo no normativo. |
| 33 | Historia del edificio durante el apocalipsis | [WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md) §3.1 | — |
| 34 | Evacuación ordenada | [WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md) §3.2 | — |
| 35 | Huida precipitada | [WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md) §3.2 | — |
| 36 | Familia que no salió | [WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md) §3.2 | — |
| 37 | Edificio saqueado | [WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md) §3.2; [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §6 | Prioridades de saqueador, no recorte lineal. |
| 38 | Principio fundamental nuevo: el saqueo es espacialmente correlacionado | [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §2 | — |
| 39 | Mapa de presión histórica de saqueo | [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §3.1 | — |
| 40 | Factores que aumentan la presión | [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §3.2 | — |
| 41 | Factores que reducen la presión | [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §3.2 | — |
| 42 | Correlación local | [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §3.3 | — |
| 43 | Rutas históricas de saqueo | [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §3.5 | — |
| 44 | Bolsas olvidadas | [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §3.6 | — |
| 45 | La zona no debe imponer un resultado absoluto | [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §2 | — |
| 46 | Posible modelo interno | [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §3.4 | Pseudocódigo conceptual, no fórmula cerrada; pesos abiertos (§7). |
| 47 | Valor percibido vs. valor real | [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §2 | — |
| 48 | Edificios especializados pueden sobrevivir al saqueo | [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §3.7 | — |
| 49 | Saqueo dinámico durante la partida | [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §3.8 | Horizonte futuro, no activado por esta entrega; condicionado a coste de simulación (§7). |
| 50 | La exploración de un lugar no es binaria | [WLD-002](../20-world/WLD-002_local-exploration-and-information.md) §3.1; [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md) §3.5 | — |
| 51 | Quién registra cambia qué se descubre | [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md) §3.2 | — |
| 52 | Ejemplo de garaje | [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md) §3.2 | Ejemplo no normativo, ya presente en el documento. |
| 53 | Ejemplo médico | [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md) §3.2 | Generalizado; no se añadió literalmente como ejemplo nuevo (§7). |
| 54 | Ejemplo eléctrico | [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md) §3.2 | Generalizado (§7). |
| 55 | Ejemplo informático | [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md) §3.2; [SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md) §8 | — |
| 56 | Registrar dos veces puede tener sentido | [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md) §3.5 | — |
| 57 | Loot desconocido | [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md) §3.4 | — |
| 58 | Desmontaje también depende del conocimiento | [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md) §3.6; [SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md) | — |
| 59 | Recursos de una vivienda vacía | [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §2 | — |
| 60 | Decisión estratégica sobre edificios vecinos | [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §3.6, §8 | — |
| 61 | Conocimiento como parte del contenido | [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §3.7; [SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md) | — |
| 62 | Un edificio puede desbloquear información sobre otros lugares | [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §3.7; [SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md) §3.8 | — |
| 63 | Catálogo máximo de lugares | [CAT-001](../catalogs/CAT-001_maximum-place-catalog.md) | Las 22 familias A–V completas. |
| 64 | Catálogo de estancias potenciales | [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.4 | Base heredada, marcada como ampliable (§7). |
| 65 | Instalaciones según edad del edificio | [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md) §3.5 | — |
| 66 | Deterioro | [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §3.5 | Valores/curvas exactos abiertos (heredado de `SET-003`). |
| 67 | Funcionalidad parcial | [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §3.5 | — |
| 68 | Un edificio puede ser reutilizado | [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §3.6 | — |
| 69 | Relación con las prioridades de trabajo | [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md) §5; [UI-003](../80-interface/UI-003_work-priority-taxonomy.md) | Sin duplicar la taxonomía de prioridades. |
| 70 | Relación con mapa local y mapamundi | [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §3.7; [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md) | Mapamundi jugable sigue fuera de alcance (`RDM-003`). |
| 71 | Generación determinista | [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md); [DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md); [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §2 | — |
| 72 | No generar loot al abrir un contenedor | [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md) §3.1 | — |
| 73 | Historia ambiental | [WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md) §3.3 | — |
| 74 | Historia del lugar y loot deben estar conectados | [WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md) §2, §3.2 | — |
| 75 | Edificios memorables | [WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md) §3.4 | — |
| 76 | Preguntas que la documentación formal debe resolver | Repartidas en las secciones «Preguntas abiertas» de todos los documentos de destino de esta matriz | Ver sección 4 de este documento para el listado consolidado. |
| 77 | Estructuras de datos que deberían existir conceptualmente | [ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md) | — |
| 78 | Ejemplo de Building conceptual | [ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md) §8 | Ejemplo no normativo. |
| 79 | Ejemplo de presión de saqueo | [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §8 | Ejemplo no normativo. |
| 80 | Principio final sobre el saqueo zonal | [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md) §2, §6 | — |
| 81 | Principio final del generador | [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §3.1 | — |
| 82 | Filosofía final | [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §2 | — |
| 83 | Identidad del sistema | [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §2 | — |
| 84 | Instrucción para la siguiente conversación | Cumplida por el conjunto de esta entrega `DESIGN-004`: [CAT-001](../catalogs/CAT-001_maximum-place-catalog.md)–[CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md), [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md)–[WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md), [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md), [ARC-004](../90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md), [ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md) | Los 30 puntos de la lista se reparten entre estos documentos; el punto 27 (catálogo inicial implementable) se cumple con [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md) en `draft`. |
| 85 | Frase resumen | [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §2 | Cita de cierre del principio del documento. |

## 4. Decisiones aprobadas, propuestas `draft`, fórmulas abiertas y horizonte fuera del primer subconjunto

### 4.1 Decisiones aprobadas por esta entrega

- Cambio de línea técnica activa a Node.js/TypeScript/Next.js/PostgreSQL
  ([DEC-0008](../decisions/DEC-0008_simulation-first-web-architecture.md)),
  con Godot preservado como prototipo histórico y
  [DEC-0001](../decisions/DEC-0001_godot-4.md) `deprecated`.
- Núcleo de simulación puro, reloj continuo y fases visibles de trabajo
  ([ARC-004](../90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md)).
- Modelo conceptual de datos del mundo semántico
  ([ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md)).
- Mapa Canvas 2D cenital con niebla y exploración progresiva
  ([UI-005](../80-interface/UI-005_top-down-simulation-workbench.md)).
- Generación semántica de lugares y edificios, con cinco capas de
  aprovechamiento y tres vidas del edificio
  ([WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md),
  [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md)).
- Presión histórica de saqueo, correlación local, rutas y bolsas olvidadas
  ([WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md)).
- Historia del apocalipsis y narrativa ambiental conectada causalmente al
  contenido ([WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md)).
- Catálogo máximo de lugares (22 familias A–V), estancias/instalaciones y
  ocupantes/profesiones/aficiones/rasgos, como horizonte de referencia
  ([CAT-001](../catalogs/CAT-001_maximum-place-catalog.md)–[CAT-003](../catalogs/CAT-003_occupants-professions-hobbies-and-traits.md)).
- Nuevo roadmap activo por incrementos pequeños
  ([RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md)), con
  [RDM-001](../roadmap/RDM-001_first-playable-slice.md) `deprecated`.
- Reconocimiento de que `IMPLEMENTATION-004` fue completada técnicamente en
  su rama/PR, sin aceptación manual ni fusión, preservada como referencia
  histórica.

### 4.2 Propuestas `draft`, no aprobadas

- Subconjunto inicial implementable de lugares
  ([CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md)): cinco
  arquetipos propuestos, pendientes de aprobación explícita de Dennis.

### 4.3 Fórmulas o equilibrios deliberadamente abiertos

- Pesos, escalas y unidades del modelo interno de presión de saqueo
  ([WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md)
  §3.4, §7).
- Valores y curvas exactos de deterioro por edificio, instalación y
  material ([SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md)
  §7, heredado de `SET-003`).
- Tiempos, requisitos y cantidades exactas de cada acción de desmontaje,
  desmantelamiento y demolición ([SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md)
  §7).
- Algoritmo exacto de trazado de calles, distritos, parcelas y
  probabilidad de arquetipo ([WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md)
  §7).
- Frecuencia exacta de ticks internos y cadencia exacta de persistencia
  sobre PostgreSQL ([ARC-004](../90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md)
  §7).
- Condiciones exactas de activación y coste de simulación del saqueo
  dinámico futuro ([WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md)
  §3.8, §7).

### 4.4 Elementos de horizonte que no entran en el primer subconjunto

- El catálogo máximo completo (22 familias, más de 400 arquetipos) sigue
  siendo horizonte de referencia; solo un subconjunto `draft` de cinco
  arquetipos se propone para una futura primera implementación (ver
  [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md)).
- Autonomía, relaciones, amenazas y narrativa emergente sobre la nueva
  línea de código quedan como incrementos futuros separados en
  [RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md),
  punto 6.
- Saqueo dinámico durante la partida por otras comunidades
  ([WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md)
  §3.8).
- Evaluación de una capa visual 3D avanzada sobre el modelo semántico
  ([RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md),
  punto 7).
- Ampliación del catálogo de estancias más allá de la base heredada del
  Anexo A ([CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md)
  §7).

## 5. Interacciones con otros sistemas

Cada fila de la matriz enlaza su documento canónico; este documento no
repite sus reglas. La lista de la sección 4 no sustituye
`docs/OPEN-QUESTIONS.md`, que registra el mismo contenido de forma
consolidada por dominio.

## 6. Casos límite o riesgos

- Si un documento de destino se divide o renombra en el futuro, esta
  matriz debe actualizarse para seguir apuntando al documento correcto,
  sin perder ninguna fila de las 86 secciones.

## 7. Preguntas abiertas

Ver la sección 4.3 (fórmulas y equilibrios abiertos) y `docs/OPEN-QUESTIONS.md`
para el listado consolidado por dominio.

## 8. Ejemplos no normativos

Ninguno adicional a los ya citados en las secciones enlazadas por la
matriz.
