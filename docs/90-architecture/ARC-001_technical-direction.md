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

- **Motor**: Godot 4.
- **Dirección visual inicial**: 3D sencillo y legible, con cámara
  estratégica inclinada; los detalles exactos de cámara y arte siguen
  abiertos.
- **Lenguaje inicial preferido**: GDScript, sujeto a revisión si una
  necesidad técnica concreta justifica C#.

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
[DEC-0003](../decisions/DEC-0003_data-driven-design.md).

### Separación futura de carpetas (principio, sin crear aún)

| Tipo | Responsabilidad futura |
|---|---|
| `docs/` | Reglas, decisiones, contexto y diseño canónico |
| `game_data/` | Habilidades, conocimientos, edificios, recursos, situaciones y escenarios concretos |
| `schemas/` | Contratos y validaciones de datos |
| `src/` | Implementación del juego |
| `tests/` | Pruebas acotadas de reglas, integración y regresión |

## 6. Casos límite o riesgos

Ninguno específico a este documento.

## 7. Preguntas abiertas

- Estructura de carpetas definitiva del proyecto Godot.
- Formato definitivo de datos de contenido.
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
