---
id: DEC-0012
title: Contrato del primer escenario de llegada
status: approved
canonical_for:
  - por qué el escenario combina una situación fija con personas y mundo procedurales
  - por qué la cohorte protagonista usa una distribución mínima de calibre alta
  - por qué el escenario exige garantías de semilla sin fijar una historia lineal
depends_on: []
related:
  - SCN-001
  - SCN-002
  - SCN-003
  - WLD-009
  - CHR-007
  - DEC-0006
  - DEC-0011
---

## Contexto

`SCN-001` describía la llegada al pueblo de montaña como una condición
inicial genérica, con la estación, la cohorte, el refugio, las
dimensiones del mapa, la amenaza inicial y los recursos iniciales
declarados expresamente como preguntas abiertas. Esto impedía que el
escenario fuera reconocible entre partidas y dejaba sin resolver cómo se
combinan una situación fija (momento, lugar, tono) con un mundo y unas
personas generados proceduralmente en cada semilla.

Al mismo tiempo, tratar a los seis supervivientes iniciales como
protagonistas de la partida —no como población corriente elegida sin
restricciones— exigía una decisión explícita sobre cómo aplicar el
calibre oculto ya aprobado en `CHR-007` sin romper su ocultación ni
convertirlo en una regla general de toda la población del mundo.

## Decisión

Se cierra el contrato del primer escenario de llegada como la
combinación de tres capas que no se sustituyen entre sí:

1. **Elementos fijos**: seis supervivientes adultos que han huido
   juntos, llegada el Día 1 a las 17:30 tras cuatro días de marcha,
   aproximadamente seis semanas después del colapso, primera mitad de
   abril, pueblo pequeño de montaña ficticio y procedural, refugio
   provisional cercano pero no garantizado como seguro, aproximadamente
   dos horas de luz útil, y amenaza zombi local baja, real y finita (ver
   [SCN-003](../scenarios/SCN-003_first-day-starting-state.md)).
2. **Elementos procedurales**: identidades, biografías, capacidades,
   relaciones, meteorología dentro de banda, geografía, edificios,
   estancias, ocupantes anteriores, posición del grupo, distribución de
   zombis, pertenencias y saqueo, generados por semilla (ver
   [SCN-002](../scenarios/SCN-002_initial-survivor-cohort.md),
   [WLD-009](../20-world/WLD-009_initial-mountain-village-profile.md) y
   [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md)).
3. **Ausencia de guion lineal**: no existe secuencia obligatoria de
   tareas, misión «haz A, después B», líder predeterminado, refugio
   definitivo correcto, garantía de que los seis permanezcan juntos o
   sobrevivan, configuración fija de profesiones, ni combate tutorial
   forzado (ver `SCN-002` y `SCN-003`, secciones de reglas aprobadas).

Se cierra además que la cohorte protagonista aplica una **distribución
mínima de calibre oculto específica de este escenario**
(`5 / 4+ / 4+ / 3+ / 3+ / 3+`, ver
[SCN-002 §3.2](../scenarios/SCN-002_initial-survivor-cohort.md#32-distribución-mínima-obligatoria-de-calibre-oculto)
y
[CHR-007 §3.2.1](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#321-distribución-mínima-de-calibre-de-la-cohorte-protagonista-de-scn-001-específica-de-escenario)):
esta regla es una aplicación de escenario, no una modificación de la
distribución global de calibre de la población mundial, todavía abierta
en `CHR-007`.

Se cierra, por último, que toda semilla debe cumplir un conjunto de
**garantías internas de generación** (refugio, agua, alimento, acceso,
almacenamiento, salida, descanso, amenaza detectable y al menos una
secuencia de acciones viable, ver
[SCN-003 §3.7](../scenarios/SCN-003_first-day-starting-state.md#37-garantías-de-una-semilla-válida)),
verificadas antes del inicio de la partida y nunca comunicadas al
jugador como información gratuita.

## Consecuencias

- `SCN-001` pasa a ser el punto de entrada y síntesis del escenario, sin
  duplicar el detalle ya cerrado en `SCN-002`, `SCN-003` y `WLD-009`.
- `CHR-007` incorpora la regla de calibre de la cohorte protagonista como
  sección propia, sin que eso cierre la distribución global de calibre
  de la población mundial ni los campos de potencial, que siguen
  abiertos.
- El presupuesto numérico del mapa local (construcciones, red viaria,
  agua, cobertura de terreno, puntos de interés y amenaza zombi) queda
  fijado como horizonte funcional máximo del escenario en `WLD-009`, sin
  aprobar por sí solo ningún subconjunto técnico de implementación (ver
  [DEC-0006](DEC-0006_maximum-envelope-vs-delivery-scope.md)).
- Toda futura variación de este escenario (otro bioma, otro tamaño de
  grupo, otra estación) requiere una decisión o escenario nuevo; no se
  modifica en silencio el contrato aquí cerrado.
- `CAT-004` continúa `draft`: este contrato no lo aprueba como alcance de
  implementación.
- Ningún documento de esta entrega pasa a `implemented`; la nueva línea
  de código sigue sin generador, personajes, mapa, inventario ni zombis
  reales.

## Aspectos que siguen abiertos

- Algoritmo exacto de generación y validación de semillas.
- Distribución global de calibre de la población mundial, campos de
  potencial y catálogo de rasgos (ver `CHR-007 §7`).
- Subconjunto técnico exacto que una futura entrega de implementación
  elegirá dentro de este horizonte máximo.
