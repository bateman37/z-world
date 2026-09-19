# 90-architecture — Arquitectura técnica

## Responsabilidad

Define la dirección técnica del proyecto: motor, lenguaje, separación entre
simulación, datos y presentación, y persistencia.

## Qué pertenece aquí

- Elección de motor, lenguaje y dirección visual de alto nivel.
- Principios de separación de responsabilidades técnicas.
- Persistencia y alcance de red.

## Qué no pertenece aquí

- Contenido de diseño de juego (habilidades, edificios, situaciones): vive en
  su dominio y, en el futuro, en `game_data/`.
- Interfaz de usuario detallada: `docs/80-interface/`.

## Documentos

| ID | Estado | Propósito |
|---|---|---|
| [ARC-001](ARC-001_technical-direction.md) | `approved` | Motor/stack, lenguaje, separación técnica y persistencia. |
| [ARC-002](ARC-002_procedural-generation-and-persistence.md) | `approved` | Generación bajo demanda reproducible, tiempo y persistencia sobre PostgreSQL. |
| [ARC-003](ARC-003_multiscale-simulation-principles.md) | `approved` | Principios para simular detalle local y abstracción regional. |
| [ARC-004](ARC-004_simulation-core-runtime-and-boundaries.md) | `approved` | Núcleo de simulación puro, reloj continuo, fases visibles y fronteras técnicas. |
| [ARC-005](ARC-005_semantic-world-data-model.md) | `approved` (entidades conceptuales) | Modelo conceptual de datos del mundo semántico (`Building`, `Room`, etc.). |

## Dependencias con otros dominios

- `docs/decisions/` (`DEC-0001` a `DEC-0008` respaldan estas reglas;
  `DEC-0008` fija el stack activo).
- `20-world` (información que depende de la generación bajo demanda;
  `WLD-005` a `WLD-007` alimentan `ARC-005`).
- `catalogs` (fuente de contenido para `ARC-005`).
