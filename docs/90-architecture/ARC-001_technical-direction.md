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
  - DEC-0008
  - ARC-002
  - ARC-003
  - ARC-004
---

## 1. Propósito

Fijar la dirección técnica de la línea activa de código sin cerrar
decisiones de implementación que todavía no son necesarias.

## 2. Principios que no deben romperse

- El proyecto debe separar simulación, datos y presentación para reducir el
  acoplamiento al motor o framework visual.
- Contenido y reglas deben ser configurables mediante datos con
  identificadores estables.

## 3. Modelo funcional

Desde `DESIGN-004`, la **línea técnica activa** es el laboratorio de
simulación web aprobado en
[DEC-0008](../decisions/DEC-0008_simulation-first-web-architecture.md):
Node.js LTS, TypeScript estricto, Next.js + React para la aplicación web,
un núcleo de simulación TypeScript puro, PostgreSQL desde el inicio con
Prisma aislado detrás de la capa de persistencia, Zod para contratos de
frontera y Vitest para pruebas acotadas del motor. El detalle de capas y
fronteras técnicas de este núcleo vive en
[ARC-004](ARC-004_simulation-core-runtime-and-boundaries.md), que este
documento no repite.

El prototipo Godot 4 (**Godot 4.7.2-stable, edición estándar**, no .NET,
GDScript, renderizador Forward+) fue el motor de la primera línea de código
(`IMPLEMENTATION-001` a `IMPLEMENTATION-004`, ver
[DEC-0001](../decisions/DEC-0001_godot-4.md), ahora `deprecated`). Se
conserva íntegro como prototipo histórico cerrado y referencia de
aprendizaje; no es la base activa y no se continúa.

No se promete todavía cuál será el motor visual final a largo plazo: Godot,
Unity u otra tecnología podrán evaluarse cuando el laboratorio de
simulación tenga mecánicas validadas. La futura capa visual no debe
obligar a rediseñar el modelo semántico del mundo (ver
[WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md)).

## 4. Reglas aprobadas

- La línea activa de código es Node.js/TypeScript/Next.js/PostgreSQL según
  [DEC-0008](../decisions/DEC-0008_simulation-first-web-architecture.md);
  el prototipo Godot no recibe más desarrollo activo.
- PostgreSQL se usa desde el inicio de la nueva línea de código, con la
  cadencia de persistencia descrita en
  [ARC-002](ARC-002_procedural-generation-and-persistence.md) (no una fila
  por fotograma).
- No se planifica una migración automática de código GDScript a
  TypeScript. Se conservan principalmente diseño, datos, IDs, seeds y
  escenarios documentales reutilizables; el código específico de cada
  línea requiere trabajo nuevo.
- No se introduce multijugador, cuentas o servicios online sin una decisión
  futura explícita.
- La futura separación de responsabilidades por carpeta de la nueva línea
  de código es la descrita en la sección 5; no se fija todavía una
  estructura ejecutable de carpetas.

## 5. Interacciones con otros sistemas

Ver decisiones asociadas: [DEC-0001](../decisions/DEC-0001_godot-4.md)
(`deprecated`, sustituida por
[DEC-0008](../decisions/DEC-0008_simulation-first-web-architecture.md)),
[DEC-0002](../decisions/DEC-0002_two-world-scales.md),
[DEC-0003](../decisions/DEC-0003_data-driven-design.md). La generación
procedural bajo demanda, el modelo de tiempo y la persistencia se detallan en
[ARC-002](ARC-002_procedural-generation-and-persistence.md), sin sustituir
las reglas de esta sección. Los principios de simulación multiescala entre
detalle local y abstracción regional se desarrollan en
[ARC-003](ARC-003_multiscale-simulation-principles.md). Las cinco capas
técnicas obligatorias del núcleo de simulación se definen en
[ARC-004](ARC-004_simulation-core-runtime-and-boundaries.md), sin cerrar
todavía la estructura de carpetas ni el formato de datos, que siguen
abiertos.

### Separación de carpetas del prototipo histórico (Godot)

| Tipo | Responsabilidad | Estado |
|---|---|---|
| `docs/` | Reglas, decisiones, contexto y diseño canónico | Existe; compartida con la nueva línea de código |
| `scenes/` | Composición visual y escenas de Godot | Prototipo histórico; no se toca en `DESIGN-004` |
| `src/` | Implementación del prototipo en GDScript | Prototipo histórico; no se toca en `DESIGN-004` |
| `game_data/` | Datos de contenido del prototipo Godot | Sin crear en el prototipo; no se toca en `DESIGN-004` |
| `schemas/` | Contratos y validaciones de datos del prototipo Godot | Sin crear en el prototipo; no se toca en `DESIGN-004` |
| `tests/` | Pruebas del prototipo Godot (smoke test) | Prototipo histórico; no se toca en `DESIGN-004` |

Estas carpetas pertenecen exclusivamente al prototipo Godot y se conservan
sin modificar. La nueva línea de código Node.js/TypeScript definirá su
propia estructura de carpetas en su entrega de inicialización técnica, sin
reutilizar estos nombres para fines distintos.

## 6. Casos límite o riesgos

- Tratar la existencia de código Godot en el repositorio como indicio de
  que sigue siendo la línea activa contradice
  [DEC-0008](../decisions/DEC-0008_simulation-first-web-architecture.md).

## 7. Preguntas abiertas

- Estructura interna definitiva de carpetas para la nueva línea de código
  Node.js/TypeScript, que se fijará en su entrega de inicialización
  técnica.
- Formato definitivo de datos de contenido y de guardado sobre PostgreSQL.

Ver también `docs/OPEN-QUESTIONS.md`.

## 8. Ejemplos no normativos

Ejemplos de identificadores futuros, solo como convención y sin que
constituyan un catálogo oficial:

- `skill.production.agriculture`
- `knowledge.irrigation.basic`
- `building.water.rain_collector`
- `situation.social.group_schism`
- `scenario.mountain_village.arrival`
