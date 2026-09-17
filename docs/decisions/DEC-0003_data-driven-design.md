---
id: DEC-0003
title: Diseño dirigido por datos
status: approved
canonical_for:
  - desacoplamiento entre sistemas, datos y presentación
depends_on: []
related:
  - ARC-001
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
