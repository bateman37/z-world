---
id: DEC-0011
title: Motor híbrido de resolución y presentación de capacidades
status: approved
canonical_for:
  - decisión transversal de cierre del motor de resolución (P01–P22)
  - decisión transversal de escala real 0–10 y nivel actual visible
depends_on: []
related:
  - CHR-006
  - CHR-007
  - ARC-006
  - ARC-007
  - ARC-008
  - UI-004
  - DEC-0009
  - DISC-0005
---

## Contexto

`DEC-0009` creó el dominio del motor de resolución de acciones, trabajos y
eventos (`ARC-006`–`ARC-008`) y el catálogo de personaje de horizonte
máximo (`CHR-006`, `CHR-007`), dejando expresamente pendientes de
calibración veintidós decisiones (`P01`–`P22`): la escala numérica de
características y habilidades, el peso entre característica y habilidad
efectivas, la forma matemática de los modelos B y D, los requisitos duros
por método, el umbral de tarea básica, la cooperación entre varias
personas, los modos de ejecución, los resultados multidimensionales, el
conocimiento imperfecto, los reintentos, la oposición activa, el
aprendizaje, los eventos y la persistencia aleatoria, y la presentación de
capacidades y potencial al jugador. Mientras estas decisiones permanecían
abiertas, `ARC-006`, `ARC-007` y `ARC-008` permanecían `draft` y
`UI-004` mantenía una prohibición absoluta de mostrar cifras de capacidad
que entraba en contradicción con la necesidad de mostrar el nivel actual
de un personaje.

`DESIGN-006` cierra las veintidós decisiones con las correcciones finales
de Dennis. Esta decisión registra, de forma transversal, el conjunto
coherente resultante para que ninguna entrega futura tenga que
reinterpretar conversaciones ni inventar reglas.

## Decisión

Se aprueba, como modelo transversal único del motor de resolución de
Z-World:

1. **Escala real `0–10`** para características y habilidades, con `4` como
   referencia humana media de una característica y `0` como valor real,
   distinto de dato desconocido o de falta de conocimiento (cierra `P01`,
   `P02`; ver
   [CHR-006 §3.6](../30-characters/CHR-006_characteristics-and-skill-catalog.md#36-escala-real-0–10-y-calibración-canónica)
   y
   [ARC-006 §3.8](../90-architecture/ARC-006_action-and-event-resolution-model.md#38-cero-dato-desconocido-y-precisión-cierra-p02)).
2. **Tres perfiles cerrados de ponderación** entre característica y
   habilidad efectivas: instintivo/físico (70/30), equilibrado (50/50) y
   técnico/aprendido (30/70), asignados a la fase o el método, nunca a la
   persona (cierra `P03`; ver
   [ARC-006 §3.7](../90-architecture/ARC-006_action-and-event-resolution-model.md#37-perfiles-de-ponderación-entre-característica-y-habilidad-cierra-p03)).
3. **Modelo híbrido de ejecución directa, progreso continuo `D` y
   comprobaciones significativas `B`**: acciones básicas se ejecutan sin
   tirada cuando la capacidad efectiva supera la dificultad efectiva en
   `+3` puntos (no `+2`) y se cumplen el resto de condiciones; `D` progresa
   con una variación acotada de hasta `±8 %` por fase o sesión; `B`
   resuelve incertidumbre pertinente mediante margen, variación acotada
   `[-4, +4]` y cinco bandas internas de resultado (cierra `P04`, `P05`,
   `P07`; ver
   [ARC-006 §§3.9–3.10 y 3.12](../90-architecture/ARC-006_action-and-event-resolution-model.md#39-modelo-b-margen-azar-acotado-y-bandas-cierra-p04)).
4. **Requisitos duros por método**, clasificados en abierto, improvisable,
   guiado/supervisado y restringido, y **episodios persistentes** que
   delimitan cuándo procede una nueva comprobación (cierra `P06`, `P08`;
   ver
   [ARC-006 §§3.11–3.12](../90-architecture/ARC-006_action-and-event-resolution-model.md#311-requisitos-duros-e-improvisación-por-método-cierra-p06)).
5. **Cooperación por funciones reales**, con rendimientos decrecientes de
   contribución (`100 %/60 %/35 %/20 %` para ejecutor principal y hasta
   tres ayudantes) y separación explícita de responsable, ejecutor
   principal y supervisor, incluida su sustitución (cierra `P09`, `P10`;
   ver
   [ARC-007 §§3.6–3.7](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md#36-cooperación-por-funciones-y-rendimientos-decrecientes-cierra-p09)).
6. **Dos dimensiones combinables de modo de trabajo** —ritmo (relajado/
   normal/rápido) y atención o alcance (estándar/cuidadoso/exhaustivo)—, en
   lugar de cuatro modos mutuamente excluyentes, con rangos conceptuales de
   efectos y costes, límites temporales heredados del lugar y cuatro
   políticas cualitativas de respuesta ante amenazas (cierra `P11`–`P14`;
   ver
   [ARC-007 §§3.8–3.11](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md#38-modos-en-dos-dimensiones-combinables-cierra-p11)).
7. **Resultados multidimensionales, conocimiento imperfecto, reintentos y
   aprendizaje** gobernados por reglas cerradas de causalidad, sin crítico
   ni pifia como capa universal generadora de sucesos, con cuatro capas de
   conocimiento imperfecto, presupuestos de reintento por orden, una única
   resolución de margen para oposición activa y una fórmula conceptual de
   aprendizaje por participación (cierra `P15`–`P19`; ver
   [ARC-008 §§3.7–3.11](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#37-resultados-multidimensionales-críticos-e-incidencias-cierra-p15)).
8. **Eventos con cadena causal cerrada y cuatro niveles de atención**
   (registro, aviso, importante, crítico), con valores predeterminados de
   pausa crítica configurables (cierra `P20`; ver
   [ARC-008 §3.12](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#312-eventos-causalidad-avisos-y-pausa-cierra-p20)).
9. **Determinismo temporal**: misma semilla, mismo estado y mismas órdenes
   producen los mismos resultados relevantes con independencia de cámara,
   FPS, pausa, guardado/carga o velocidad de simulación (cierra `P21`; ver
   [ARC-008 §3.13](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#313-persistencia-aleatoria-y-equivalencia-temporal-cierra-p21)).
10. **Nivel actual visible y potencial oculto**: la ficha del personaje
    muestra el nivel actual numérico `0–10`; el potencial real, el calibre
    oculto y el máximo numérico permanecen siempre ocultos, comunicados
    mediante un catálogo cerrado de frases cualitativas moduladas por
    confianza; ninguna orden o evaluación operativa muestra porcentajes,
    umbrales o margen matemático (cierra `P22`; ver
    [ARC-008 §3.14](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#314-presentación-visible-y-potencial-oculto-cierra-p22),
    [CHR-007 §3.9](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#39-catálogo-y-actualización-de-frases-de-potencial-cierra-parte-de-p22)
    y
    [UI-004 §3.8](../80-interface/UI-004_qualitative-capability-presentation.md#38-nivel-actual-visible-en-la-ficha-reconciliado-con-p22)).

## Razones

- **Cierre real, no otro borrador.** El motor de resolución llevaba
  22 decisiones abiertas desde `DEC-0009`; mantenerlas indefinidamente
  impedía a `ARC-006`–`ARC-008` alcanzar `approved` y bloqueaba cualquier
  implementación futura sin reinterpretar conversaciones.
- **Coherencia entre capas.** La escala `0–10`, los perfiles de
  ponderación, los modelos B/D y la cooperación forman un único sistema:
  cerrarlos por separado, sin una decisión transversal, habría arriesgado
  contradicciones entre `CHR-006`, `ARC-006`, `ARC-007` y `ARC-008`.
- **Presentación coherente con el resto de la interfaz.** La corrección de
  `UI-004` (nivel actual visible, cifras internas ocultas) evita que la
  ficha del personaje y la evaluación operativa de un trabajo usen reglas
  de visibilidad incompatibles.

## Consecuencias

- `ARC-006`, `ARC-007` y `ARC-008` pasan de `draft` a `approved`.
- `CHR-006` mantiene `approved`, actualizado a la escala `0–10` y a la
  visibilidad del nivel actual.
- `CHR-007` permanece `draft`: incorpora el catálogo de frases y la
  relación entre nivel actual, potencial oculto y confianza, pero
  conserva abiertas la distribución exacta de estrellas del calibre, los
  campos de potencial, la adaptación al apocalipsis, los dominios de
  habilidad y el catálogo de rasgos.
- `UI-004` mantiene `approved`, corregida para no prohibir de forma
  absoluta el nivel actual numérico de la ficha.
- Todo contenido futuro de balance por acción, objeto o familia (por
  ejemplo, la dificultad efectiva exacta de una reparación concreta) es
  parametrización de contenido sobre este modelo base, no una reapertura
  del modelo.
- Las preguntas de otros sistemas que dependían de este cierre para
  avanzar (fórmulas de idoneidad por acción, dominios de habilidad,
  distribución de estrellas, adaptación al apocalipsis, catálogos de
  combate) permanecen abiertas y registradas en `docs/OPEN-QUESTIONS.md`.

## Alternativas descartadas

- Cerrar cada decisión `P01`–`P22` de forma aislada, sin una decisión
  transversal: se descarta porque el modelo es un único sistema coherente
  y una decisión aislada por cada `P` dificultaría rastrear su interacción
  (por ejemplo, cómo el umbral `+3` de `P07` depende de los perfiles de
  `P03`).
- Mantener `ARC-006`–`ARC-008` en `draft` pese a cerrar las 22 decisiones:
  se descarta porque `DOC-001` reserva `draft` para propuestas todavía en
  definición, y este cierre deja su alcance canónico completamente
  cubierto.
- Cerrar `CHR-007` por extensión junto con el resto del motor: se descarta
  porque el prompt de esta entrega no decide la distribución de estrellas,
  los campos de potencial ni la adaptación al apocalipsis; forzar su cierre
  habría implementado en silencio decisiones no tomadas.

## No decisión

Esta entrega no implementa código, no amplía `RDM-003`, no fija ninguna
fórmula de contenido concreta (dificultad numérica de una acción, catálogo
de dominios, distribución de estrellas del calibre, escala de adaptación al
apocalipsis) y no reabre el catálogo cerrado de nueve características y 34
habilidades de `CHR-006`.
