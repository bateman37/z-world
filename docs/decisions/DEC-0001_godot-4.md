---
id: DEC-0001
title: Godot 4 como motor inicial
status: approved
canonical_for:
  - elección de motor
depends_on: []
related:
  - ARC-001
---

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
