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
  resultados, conocimiento imperfecto y eventos (`ARC-004` a `ARC-006`).

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
| [ARC-001](ARC-001_technical-direction.md) | `approved` | Motor, lenguaje, separación técnica y persistencia. |
| [ARC-002](ARC-002_procedural-generation-and-persistence.md) | `approved` | Generación bajo demanda reproducible, tiempo y persistencia. |
| [ARC-003](ARC-003_multiscale-simulation-principles.md) | `approved` | Principios para simular detalle local y abstracción regional. |
| [ARC-004](ARC-004_action-and-event-resolution-model.md) | `draft` | Procedimiento común de resolución, capacidades efectivas y modelos B (porcentual) y D (trabajo continuo). |
| [ARC-005](ARC-005_teamwork-orders-modes-and-conditions.md) | `draft` | Cooperación con líder, órdenes del lugar, modos de ejecución, tiempo, estado, herramientas y entorno. |
| [ARC-006](ARC-006_outcomes-knowledge-events-and-validation.md) | `draft` | Resultados, conocimiento imperfecto, eventos, aplicación por familias, persistencia, casos de validación y decisiones pendientes del motor. |

## Dependencias con otros dominios

- `docs/decisions/` (DEC-0001 a DEC-0005 respaldan estas reglas).
- `20-world` (información que depende de la generación bajo demanda).
- `30-characters` (catálogo de características y habilidades que consume el
  motor de resolución).
- `40-settlement` (modelo de objeto, familias logísticas y desmontaje que
  consume el motor de resolución).
- `80-interface` (taxonomía de trabajo y prioridades que consume el motor
  de resolución).
