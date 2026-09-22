# 90-architecture — Arquitectura técnica

## Responsabilidad

Define la dirección técnica del proyecto: motor, lenguaje, separación entre
simulación, datos y presentación, y persistencia.

## Qué pertenece aquí

- Elección de motor, lenguaje y dirección visual de alto nivel.
- Principios de separación de responsabilidades técnicas.
- Persistencia y alcance de red.
- El modelo de resolución de acciones, trabajos y eventos: procedimiento
  común, capacidades efectivas, modelos B/D, cooperación, órdenes, modos,
  resultados, conocimiento imperfecto y eventos (`ARC-006` a `ARC-008`).
  Este modelo es una capa de reglas de diseño consumida por el núcleo de
  simulación de `ARC-004`; no redefine su reloj continuo ni sus fronteras
  técnicas.

## Qué no pertenece aquí

- Contenido de diseño de juego (habilidades, edificios, situaciones): vive en
  su dominio y, en el futuro, en `game_data/`.
- Interfaz de usuario detallada: `docs/80-interface/`.
- El catálogo de características y habilidades (`docs/30-characters/`) ni el
  catálogo de objetos y familias logísticas (`docs/40-settlement/`); el
  motor de resolución solo los consume.

## Documentos

| ID | Estado | Propósito |
|---|---|---|
| [ARC-001](ARC-001_technical-direction.md) | `approved` | Motor/stack, lenguaje, separación técnica y persistencia. |
| [ARC-002](ARC-002_procedural-generation-and-persistence.md) | `approved` | Generación bajo demanda reproducible, tiempo y persistencia sobre PostgreSQL. |
| [ARC-003](ARC-003_multiscale-simulation-principles.md) | `approved` | Principios para simular detalle local y abstracción regional. |
| [ARC-004](ARC-004_simulation-core-runtime-and-boundaries.md) | `approved` | Núcleo de simulación puro, reloj continuo, fases visibles y fronteras técnicas. |
| [ARC-005](ARC-005_semantic-world-data-model.md) | `approved` (entidades conceptuales) | Modelo conceptual de datos del mundo semántico (`Building`, `Room`, etc.). |
| [ARC-006](ARC-006_action-and-event-resolution-model.md) | `approved` | Procedimiento común de resolución, capacidades efectivas, perfiles de ponderación y modelos B (margen) y D (trabajo continuo). |
| [ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md) | `approved` | Cooperación con rendimientos decrecientes, responsable/ejecutor/supervisor, modos en dos dimensiones, tiempo, estado, herramientas y entorno. |
| [ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md) | `approved` | Resultados, conocimiento imperfecto, eventos, aplicación por familias, persistencia aleatoria, presentación visible, casos de validación y cierre de las 22 decisiones del motor. |

## Dependencias con otros dominios

- `docs/decisions/` (`DEC-0001` a `DEC-0011` respaldan estas reglas;
  `DEC-0008` fija el stack activo; `DEC-0009` crea el dominio del motor de
  resolución y el catálogo de personaje; `DEC-0011` cierra las 22
  decisiones de calibración del motor de resolución, `P01`–`P22`).
- `20-world` (información que depende de la generación bajo demanda;
  `WLD-005` a `WLD-007` alimentan `ARC-005`).
- `catalogs` (fuente de contenido para `ARC-005`).
- `30-characters` (catálogo de características y habilidades que consume el
  motor de resolución de `ARC-006`–`ARC-008`).
- `40-settlement` (modelo de objeto, familias logísticas y desmontaje que
  consume el motor de resolución).
- `80-interface` (taxonomía de trabajo y prioridades que consume el motor
  de resolución; `UI-006` cierra la interfaz de tamaño y asignación de un
  equipo local, mientras `ARC-007`/`ARC-008` conservan las fórmulas de
  cooperación todavía pendientes).
- `20-world` (`WLD-008` define la generación espacial del mapa local que
  `ARC-002` deriva y persiste).
