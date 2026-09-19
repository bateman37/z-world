---
id: DEC-0001
title: Godot 4 como motor inicial
status: deprecated
canonical_for:
  - elección de motor del prototipo histórico Godot
depends_on: []
related:
  - ARC-001
  - DEC-0008
---

## Estado: sustituida por DEC-0008

`DESIGN-004` reinicia la línea activa de código hacia el laboratorio de
simulación web aprobado en
[DEC-0008](DEC-0008_simulation-first-web-architecture.md)
(Node.js/TypeScript/Next.js/PostgreSQL). Esta decisión queda `deprecated`:
documenta el prototipo Godot como **prototipo histórico cerrado**, no como
línea activa. No se borran sus hechos: Godot 4 siguió siendo un motor
válido para las cuatro entregas de código del prototipo
(`IMPLEMENTATION-001` a `IMPLEMENTATION-004`), y el código, escenas y
proyecto Godot se conservan sin modificar como referencia y aprendizaje
técnico.

## Contexto

El proyecto necesita un motor de juego para su primera fase de desarrollo,
con capacidad 3D sencilla y sin dependencia de licencias comerciales
complejas.

## Decisión

Se adopta Godot 4 como motor inicial, con una dirección visual 3D sencilla y
legible. No existe un plan de migración automática a Unity.

## Consecuencias

- El lenguaje inicial preferido es GDScript (ver
  [ARC-001](../90-architecture/ARC-001_technical-direction.md)), sujeto a
  revisión si una necesidad técnica concreta justifica C#.
- Si en el futuro se decide cambiar de motor, se conservarán principalmente
  diseño, datos y recursos reutilizables; escenas, interfaz y código
  específico de Godot requerirían trabajo nuevo.
- `IMPLEMENTATION-001` (vertical slice visual) fija el baseline reproducible
  concreto de esta decisión: **Godot 4.7.2-stable, edición estándar**, no
  .NET, GDScript exclusivamente y renderizador Forward+. Este baseline
  concreto no impide que una entrega futura actualice la versión de Godot 4
  si hace falta; solo documenta con qué versión exacta se validó esta
  primera implementación.

## Aspectos que siguen abiertos

- Detalles exactos de cámara y arte más allá de lo fijado en
  `IMPLEMENTATION-001`.
- Estructura interna definitiva de `scenes/` y `src/` para entregas
  posteriores.
- Si y cuándo se actualizará la versión exacta de Godot 4 usada como
  baseline.
