---
id: ARC-001
title: Dirección técnica
status: approved
canonical_for:
  - motor y lenguaje
  - separación simulación/datos/presentación
  - persistencia y alcance de red
depends_on: []
related:
  - DEC-0001
  - DEC-0002
  - DEC-0003
  - ARC-002
  - ARC-003
---

## 1. Propósito

Fijar la dirección técnica inicial del proyecto sin cerrar decisiones de
implementación que todavía no son necesarias.

## 2. Principios que no deben romperse

- El proyecto debe separar simulación, datos y presentación para reducir el
  acoplamiento al motor.
- Contenido y reglas deben ser configurables mediante datos con
  identificadores estables.

## 3. Modelo funcional

- **Motor**: Godot 4. Baseline reproducible de la primera implementación
  (`IMPLEMENTATION-001`): **Godot 4.7.2-stable, edición estándar**, no
  .NET, con renderizador Forward+ para escritorio. Este baseline concreto
  no es una promesa permanente de versión: entregas futuras podrán
  actualizarla si hace falta (ver
  [DEC-0001](../decisions/DEC-0001_godot-4.md)).
- **Dirección visual inicial**: 3D sencillo y legible, con cámara
  estratégica inclinada; los detalles exactos de arte siguen abiertos más
  allá de las primitivas usadas en `IMPLEMENTATION-001`.
- **Lenguaje inicial preferido**: GDScript, sujeto a revisión si una
  necesidad técnica concreta justifica C#. `IMPLEMENTATION-001` usa
  GDScript exclusivamente.

## 4. Reglas aprobadas

- Guardado local. No se usa PostgreSQL para el juego local inicial.
- SQLite puede evaluarse cuando exista una necesidad de persistencia
  compleja; no se incorpora todavía.
- No se planifica una migración automática a Unity. Si algún día se cambia
  de motor, se conservarán principalmente diseño, datos y recursos
  reutilizables; escenas, interfaz y código específico requerirían trabajo
  nuevo.
- No se introduce multijugador, cuentas o servicios online sin una decisión
  futura explícita.
- La futura separación de responsabilidades por carpeta es la descrita en
  la sección 5.

## 5. Interacciones con otros sistemas

Ver decisiones asociadas: [DEC-0001](../decisions/DEC-0001_godot-4.md),
[DEC-0002](../decisions/DEC-0002_two-world-scales.md),
[DEC-0003](../decisions/DEC-0003_data-driven-design.md). La generación
procedural bajo demanda, el modelo de tiempo y la persistencia se detallan en
[ARC-002](ARC-002_procedural-generation-and-persistence.md), sin sustituir
las reglas de esta sección. Los principios de simulación multiescala entre
detalle local y abstracción regional se desarrollan en
[ARC-003](ARC-003_multiscale-simulation-principles.md), sin cerrar todavía
la estructura de carpetas ni el formato de datos, que siguen abiertos.

### Separación de carpetas

| Tipo | Responsabilidad | Estado |
|---|---|---|
| `docs/` | Reglas, decisiones, contexto y diseño canónico | Existe |
| `scenes/` | Composición visual y escenas de Godot | Creada en `IMPLEMENTATION-001` |
| `src/` | Implementación del juego en GDScript | Creada en `IMPLEMENTATION-001` |
| `game_data/` | Habilidades, conocimientos, edificios, recursos, situaciones y escenarios concretos | Sin crear todavía |
| `schemas/` | Contratos y validaciones de datos | Sin crear todavía |
| `tests/` | Pruebas acotadas de reglas, integración y regresión | Creada en `IMPLEMENTATION-001` (smoke test) |

`IMPLEMENTATION-001` no convierte personas ni edificios en datos JSON: el
formato de contenido definitivo (`game_data/`, `schemas/`) sigue abierto.

## 6. Casos límite o riesgos

Ninguno específico a este documento.

## 7. Preguntas abiertas

- Estructura interna definitiva de `scenes/` y `src/` para las entregas
  posteriores a `IMPLEMENTATION-001` (esta entrega solo fija la separación
  mínima descrita en su prompt).
- Formato definitivo de datos de contenido (`game_data/`, `schemas/`).
- Formato de guardado.

Ver también `docs/OPEN-QUESTIONS.md`.

## 8. Ejemplos no normativos

Ejemplos de identificadores futuros, solo como convención y sin que
constituyan un catálogo oficial:

- `skill.production.agriculture`
- `knowledge.irrigation.basic`
- `building.water.rain_collector`
- `situation.social.group_schism`
- `scenario.mountain_village.arrival`
