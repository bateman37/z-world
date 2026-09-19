---
id: DEC-0008
title: Arquitectura simulation-first en Node.js/TypeScript/Next.js/PostgreSQL
status: approved
canonical_for:
  - cambio de línea técnica activa de Godot 3D a un laboratorio de simulación web
  - stack aprobado para la nueva línea de código
  - preservación del prototipo Godot como referencia histórica
depends_on: []
related:
  - DEC-0001
  - DEC-0002
  - DEC-0003
  - DEC-0005
  - ARC-001
  - ARC-004
  - RDM-003
---

## Contexto

El prototipo Godot 3D (`IMPLEMENTATION-001` a `IMPLEMENTATION-003`, todas
técnicamente implementadas, con `IMPLEMENTATION-001` aceptada manualmente el
18 de septiembre de 2026 y `IMPLEMENTATION-003` pendiente de aceptación
manual) validó cámara, selección, prioridades, trabajo por fases,
exploración e información de lugares. Construir primero una capa 3D estaba
ralentizando la validación de las mecánicas de simulación y encareciendo la
prueba manual de Dennis. Existe además una entrega técnicamente completa,
`IMPLEMENTATION-004` («Defensa y vida propia»), en la rama
`claude/docs-foundation-setup-94xtnn` y PR #10, que añadía cierre de
accesos, zombis elementales, ruido, guardia, retirada y autonomía acotada
sobre el prototipo Godot.

## Decisión

Se reinicia la **línea activa de código** hacia un laboratorio de
simulación web centrado en mecánicas, con este stack aprobado:

| Capa | Decisión |
|---|---|
| Ejecución | Node.js en una versión LTS, fijada cuando se inicialice el código. |
| Lenguaje | TypeScript estricto. |
| Aplicación web | Next.js + React, con una única puesta en marcha local sencilla. |
| Simulación | Núcleo TypeScript puro, sin dependencias de React, Next.js, Prisma, Canvas ni PostgreSQL (ver [ARC-004](../90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md)). |
| Persistencia | PostgreSQL desde el inicio de la nueva línea de código. |
| Acceso a datos | Prisma, aislado detrás de la capa de persistencia. |
| Validación | Zod para contratos en las fronteras de entrada/salida cuando se implemente. |
| Pruebas | Vitest para pruebas automáticas pequeñas de reglas del motor; herramienta de verificación técnica, no sustituye la validación manual de Dennis. |
| Mapa funcional | Canvas 2D del navegador, cenital y deliberadamente sencillo (ver [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md)). |
| Contenedores | Sin Docker de inicio. |
| Red | Aplicación local y de un solo jugador; sin cuentas, multijugador ni servicios públicos. |

Esta decisión sustituye a Godot como línea activa de implementación, pero no
retracta ni invalida [DEC-0001](DEC-0001_godot-4.md), que se marca
`deprecated` con este documento como sustituto explícito.

## Consecuencias

- El prototipo Godot (código en `src/`, `scenes/`, `project.godot`,
  `tests/`, `game_data/`) se conserva íntegro como prototipo histórico
  cerrado y referencia de aprendizaje. No se borra, no se mueve, no se
  archiva físicamente.
- `IMPLEMENTATION-004` («Defensa y vida propia») queda completada
  técnicamente en su rama y PR #10, pero **no** se fusiona ni se acepta
  manualmente como parte de esta decisión. Se conserva como referencia
  histórica del prototipo Godot, en la misma condición que
  `IMPLEMENTATION-001` a `IMPLEMENTATION-003`.
- Ninguna aceptación manual pendiente del prototipo Godot
  (`IMPLEMENTATION-003`) se da por superada por este cambio de arquitectura.
- Se preservan reglas, contratos, IDs, datos, seeds, escenarios y pruebas
  documentales del prototipo Godot como referencia; no se promete una
  migración automática de código GDScript a TypeScript.
- No se promete todavía cuál será el motor visual final a largo plazo:
  Godot, Unity u otra tecnología podrán evaluarse cuando el juego tenga
  mecánicas validadas en el laboratorio de simulación. La futura capa
  visual no debe obligar a rediseñar el modelo semántico del mundo (ver
  [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md)).
- La separación entre núcleo de simulación, catálogos/contratos,
  persistencia, aplicación/orquestación y presentación web es obligatoria
  desde el inicio de la nueva línea de código (ver
  [ARC-004](../90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md)).
- El nuevo roadmap activo es
  [RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md), que
  sustituye a [RDM-001](../roadmap/RDM-001_first-playable-slice.md) como
  hoja de ruta de implementación.
- Esta entrega es exclusivamente documental: no se inicializa Node.js,
  Next.js, React, TypeScript, Prisma, PostgreSQL, Zod, Vitest ni Canvas, y
  no se crea `package.json` ni ningún archivo ejecutable del nuevo stack.

## Aspectos que siguen abiertos

- Versión LTS exacta de Node.js y versión exacta de cada dependencia,
  fijadas cuando se inicialice el código.
- Cadencia exacta de persistencia (transacciones, eventos, snapshots) sobre
  PostgreSQL, que sigue abierta en
  [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md).
- Si y cuándo se evaluará una capa visual 3D avanzada sobre el modelo
  semántico ya validado.
- Estrategia concreta de portado o reintegración de reglas y datos del
  prototipo Godot si en el futuro se decide reutilizar parte de su
  contenido de diseño.
