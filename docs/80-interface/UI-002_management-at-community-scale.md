---
id: UI-002
title: Gestión a escala comunitaria
status: approved
canonical_for:
  - gestión legible al crecer población y territorio
  - capas de información y alertas
  - descubrimiento progresivo de la ficha personal
depends_on:
  - UI-001
related:
  - CHR-004
  - SOC-002
  - UI-003
  - UI-004
---

## 1. Propósito

Definir cómo la interfaz conserva claridad al pasar de seis personas a
decenas y al manejar varias zonas, instalaciones y grupos, ampliando
[UI-001](UI-001_interaction-and-command-model.md).

## 2. Principios que no deben romperse

- El jugador no repite órdenes individuales para sostener tareas
  ordinarias.
- [UI-001](UI-001_interaction-and-command-model.md) sigue siendo la base
  local; el control con ratón continúa disponible y esta entrega no altera
  sus reglas cerradas.

## 3. Modelo funcional

La gestión escala con prioridades, roles, equipos, políticas, turnos cuando
sean necesarios, zonas, plantillas y excepciones.

### 3.1 Capas de información

1. Estado general y alertas que requieren atención.
2. Paneles de personas, recursos, producción, territorio y sociedad.
3. Causas y dependencias de un problema concreto.
4. Detalle personal o técnico para investigar.

Una alerta conduce a su causa y a acciones posibles. No se ocultan fallos
tras estados genéricos ni se satura con cada pensamiento cotidiano.

### 3.2 Gestión a escala de la matriz de prioridades

Cuando la matriz de prioridades crece hasta los nueve bloques y 34
prioridades del horizonte aprobado (ver
[UI-003](UI-003_work-priority-taxonomy.md)), la gestión a escala se apoya
en:

- **Bloques plegables**: vista plegada con resumen por persona y vista
  desplegada con las prioridades hijas del bloque.
- **Filtros**: por equipo, rol, turno, zona o selección, sin alterar la
  simulación.
- **Edición por grupo**: cambiar un bloque completo aplica un mismo valor a
  todas sus prioridades hijas mediante una acción explícita del jugador; no
  borra después los ajustes individuales salvo nueva acción.
- **Plantillas reutilizables**: una plantilla propone valores, pero cada
  persona conserva sus ajustes.

Un bloque con valores distintos entre sus prioridades hijas muestra estado
«Mixto», sin inventar una media que cambie el comportamiento. No se oculta
una prioridad porque todavía no exista una persona capaz: puede resultar
importante al planificar formación o incorporar especialistas. El panel
debe permitir comparar personas sin obligar a abrir 34 fichas. La
presentación cualitativa de capacidad, dificultad e incertidumbre por celda
se rige por
[UI-004](UI-004_qualitative-capability-presentation.md), sin repetirse
aquí.

### 3.3 Ficha personal progresiva

La ficha muestra lo necesario para trabajar y cuidar a alguien. Historia,
relaciones, deseos, recuerdos y aptitudes se descubren progresivamente
mediante indicios, rangos o confianza, no números secretos sin contexto
(ver [CHR-004](../30-characters/CHR-004_life-history-and-personal-arcs.md)).

## 4. Reglas aprobadas

- Automatizar no borra personalidad. Equipos y roles definen
  responsabilidades; las personas conservan capacidad, estado, motivación y
  autonomía. El control puntual no es la única forma eficiente de jugar.
- Toda alerta debe permitir llegar a su causa y a acciones posibles; el
  sistema no puede esconder un error de rutas bajo un estado genérico
  (principio ya vigente en
  [UI-001](UI-001_interaction-and-command-model.md)).

## 5. Interacciones con otros sistemas

- La ficha por capas presenta la profundidad de persona definida en
  [CHR-004](../30-characters/CHR-004_life-history-and-personal-arcs.md).
- Los paneles de sociedad presentan la política interna de
  [SOC-002](../50-society/SOC-002_internal-politics-and-leadership.md).
- La matriz de bloques y prioridades gestionada a escala en la sección 3.2
  se define en [UI-003](UI-003_work-priority-taxonomy.md); la presentación
  cualitativa de sus celdas se define en
  [UI-004](UI-004_qualitative-capability-presentation.md).
- No repite las reglas de selección, prioridades, designaciones, zonas y
  control puntual ya cerradas en
  [UI-001](UI-001_interaction-and-command-model.md).

## 6. Casos límite o riesgos

- Saturar la interfaz con cada pensamiento cotidiano rompería la claridad
  exigida en la sección 3.1.

## 7. Preguntas abiertas

- Flujos visuales de gestión a escala. Ver `docs/OPEN-QUESTIONS.md`.
- Diseño visual y flujos exactos quedan para prototipo; la dirección
  aprobada es gestión clara, menús comprensibles y explicación causal.

## 8. Ejemplos no normativos

Ninguno.
