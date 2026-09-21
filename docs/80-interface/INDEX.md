# 80-interface — Interfaz

## Responsabilidad

Define cómo el jugador percibe y controla la comunidad y el asentamiento:
paneles, cámara, información mostrada y flujos de interacción.

## Qué pertenece aquí

- Reglas de interfaz y experiencia de usuario cuando se documenten.

## Qué no pertenece aquí

- Dirección visual o técnica del motor: `docs/90-architecture/`.
- Reglas de simulación subyacentes: dominios 20 a 70.

## Documentos

| ID | Estado | Propósito |
|---|---|---|
| [UI-001](UI-001_interaction-and-command-model.md) | `approved` | Selección, prioridades, designaciones, zonas, control puntual con ratón e información operativa. |
| [UI-002](UI-002_management-at-community-scale.md) | `approved` | Gestión legible al crecer población, territorio y sistemas. |
| [UI-003](UI-003_work-priority-taxonomy.md) | `approved` | Arquitectura de prioridad, orden y trabajo; nueve bloques, 34 prioridades y escala `Nunca/1–5`. |
| [UI-004](UI-004_qualitative-capability-presentation.md) | `approved` | Presentación cualitativa de capacidad, dificultad, incertidumbre y bloqueos sin números internos. |
| [UI-005](UI-005_top-down-simulation-workbench.md) | `approved` | Mapa Canvas 2D cenital, niebla, reloj continuo y control puntual del laboratorio de simulación. |
| [UI-006](UI-006_contextual-place-interaction-and-teams.md) | `approved` | Ficha contextual de lugar, visibilidad de acciones, reconocimiento exterior, revelado de interiores y equipos locales `Auto / 1 / 2 / 3 / 4`. |

## Dependencias con otros dominios

- `90-architecture` (separación entre simulación y presentación; `ARC-007` y
  `ARC-008` conservan las fórmulas de cooperación que `UI-006` no cierra).
- `30-characters` (elegibilidad y autonomía de las personas).
- `20-world`, `40-settlement` (información y recursos sobre los que se
  designan trabajos; `WLD-008` genera el mapa que `UI-005` representa).
- `decisions` (`DEC-0010` fija la dirección de representación de los mapas).
