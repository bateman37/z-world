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
| [ARC-001](ARC-001_technical-direction.md) | `approved` | Motor, lenguaje, separación técnica y persistencia. |
| [ARC-002](ARC-002_procedural-generation-and-persistence.md) | `approved` | Generación bajo demanda reproducible, tiempo y persistencia. |

## Dependencias con otros dominios

- `docs/decisions/` (DEC-0001 a DEC-0005 respaldan estas reglas).
- `20-world` (información que depende de la generación bajo demanda).
