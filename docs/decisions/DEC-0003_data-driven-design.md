---
id: DEC-0003
title: Diseño dirigido por datos
status: approved
canonical_for:
  - desacoplamiento entre sistemas, datos y presentación
depends_on: []
related:
  - ARC-001
  - ARC-005
  - DEC-0008
---

## Contexto

Z-World puede alcanzar un nivel de detalle de contenido muy alto (habilidades,
conocimientos, edificios, situaciones). Acoplar ese contenido directamente al
código dificultaría su mantenimiento y escalado.

## Decisión

Sistemas, datos y presentación deben quedar desacoplados. El contenido futuro
utilizará identificadores estables y contratos validables, en lugar de
valores embebidos en el código. Ver
[ARC-001](../90-architecture/ARC-001_technical-direction.md) para la
separación de carpetas prevista (`docs/`, `game_data/`, `schemas/`, `src/`,
`tests/`).

## Consecuencias

- El contenido de diseño se podrá ampliar sin modificar el código de
  simulación.
- Los contratos de datos (`schemas/`) permitirán validar el contenido antes
  de su uso en el juego.

## Aspectos que siguen abiertos

- Formato definitivo de los archivos de datos.
- Herramientas de validación de contratos.

## Nota de `DESIGN-004`

Este desacoplamiento sigue vigente para la nueva línea de código
Node.js/TypeScript adoptada en
[DEC-0008](DEC-0008_simulation-first-web-architecture.md): el modelo
conceptual de datos del mundo semántico
([ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md)) usa
identificadores estables candidatos, validables en el futuro con Zod en
las fronteras de entrada/salida, sin acoplar el catálogo de contenido al
código del núcleo de simulación.
