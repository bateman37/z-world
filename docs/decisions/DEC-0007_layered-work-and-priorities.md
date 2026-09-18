---
id: DEC-0007
title: 34 prioridades por capas, separadas de habilidad y alcance implementado
status: approved
canonical_for:
  - decisión transversal de conservar 34 prioridades jerárquicas
depends_on: []
related:
  - UI-003
  - UI-001
  - CHR-005
  - RDM-001
---

## Contexto

Las diez familias de prioridad de `IMPLEMENTATION-002`/`IMPLEMENTATION-003`
sirven bien al primer corte jugable, pero el horizonte completo de Z-World
requiere un control más granular: distinguir Medicina de Rescate, separar
Caza de Combate, dar entidad propia a Emergencias como respuesta a
desastres y reconocer Conocimiento como bloque de trabajo por derecho
propio.

## Decisión

Se aprueban 34 prioridades organizadas en nueve bloques desplegables, con
IDs candidatos estables, separadas conceptualmente de habilidad y
conocimiento, y con escala visible `Nunca`, `1`, `2`, `3`, `4`, `5` (`1`
como máxima prioridad). El catálogo completo, sus límites de
responsabilidad y su escala viven en
[UI-003](../80-interface/UI-003_work-priority-taxonomy.md); esta decisión no
los repite.

Dentro de esa lista:

- **Emergencias** se conserva como prioridad real y exclusiva de respuesta
  a desastres, sin sustituir a Medicina, Rescate, Combate y limpieza de
  amenazas o Reparación en la actividad cotidiana.
- **Caza** se separa definitivamente de **Combate y limpieza de amenazas**
  por intención, disposición moral, sigilo y habilidades diferentes.

## Razones

- **Profundidad**: diez familias colapsan disciplinas con requisitos,
  riesgos y disposición moral muy distintos entre sí.
- **Asignación humana significativa**: permite que el jugador exprese
  preferencias reales de cada persona sin forzar categorías demasiado
  amplias.
- **Crecimiento**: da espacio a Conocimiento, Oficios y Exploración como
  bloques con peso propio, coherentes con la identidad de recuperación y
  conocimiento aplicado de Z-World.
- **Claridad**: evita que un trabajo quede ambiguamente asignado a dos
  filas del panel, exigiendo una única familia efectiva por trabajo.

## Consecuencias

- La interfaz de horizonte completo necesita una matriz jerárquica
  plegable de nueve bloques y 34 prioridades hijas, definida en
  [UI-003](../80-interface/UI-003_work-priority-taxonomy.md) y su gestión a
  escala en
  [UI-002](../80-interface/UI-002_management-at-community-scale.md).
- Existirá, en algún momento futuro no fechado por esta decisión, la
  necesidad de migrar datos y código desde las diez familias y escala
  `0–4` actuales hacia las 34 prioridades y escala `Nunca/1–5`. Esta
  decisión no diseña ni fecha esa migración.
- El contenido futuro de prioridades y trabajos deberá dirigirse por los
  IDs candidatos de
  [UI-003](../80-interface/UI-003_work-priority-taxonomy.md#33-nueve-bloques-y-34-prioridades),
  consistente con [DEC-0003](DEC-0003_data-driven-design.md).

## Alternativas descartadas

- Mantener diez categorías como lista definitiva del horizonte completo:
  insuficiente para separar Medicina de Rescate, Caza de Combate y dar
  entidad a Conocimiento.
- Quince categorías planas, sin bloques desplegables: reduce la
  granularidad necesaria y no resuelve la presentación a escala con
  población grande.
- 33 o 34 columnas sin bloques desplegables: hace ilegible el panel al
  crecer la comunidad, contradiciendo los principios de
  [UI-002](../80-interface/UI-002_management-at-community-scale.md).
- Fusionar Caza con Combate y limpieza de amenazas: pierde la distinción de
  intención, disposición moral, sigilo y habilidades que el propietario del
  proyecto consideró relevante.

## No decisión

Esta entrega no implementa las 34 prioridades ni fecha su migración desde
el sistema actual de diez familias y escala `0–4`. `RDM-001` no se amplía
por esta decisión (ver
[RDM-001](../roadmap/RDM-001_first-playable-slice.md)).
