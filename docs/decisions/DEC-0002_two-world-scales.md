---
id: DEC-0002
title: Dos escalas de mundo
status: approved
canonical_for:
  - convivencia de mapa local y mapa estratégico
depends_on: []
related:
  - WLD-001
---

## Contexto

Z-World necesita representar tanto la gestión detallada de un asentamiento
como un mundo exterior amplio con comunidades, exploración y rutas.

## Decisión

Se adopta la convivencia entre un mapa local 3D profundo, para la gestión
del asentamiento, y un mapa estratégico global más abstracto (concebido
actualmente como cuadrícula hexagonal con niebla de guerra), para
exploración y comunidades externas. Ver detalle funcional en
[WLD-001](../20-world/WLD-001_world-scales.md).

## Consecuencias

- El detalle profundo se concentra en el mapa local; el mapa estratégico
  puede simularse de forma más abstracta y materializar detalle cuando se
  vuelve relevante.

## Aspectos que siguen abiertos

- Forma exacta de conexión y transición entre ambas escalas.
- Escala, tamaño y representación exacta de la cuadrícula hexagonal.
