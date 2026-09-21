---
id: DEC-0002
title: Dos escalas de mundo
status: approved
canonical_for:
  - convivencia de mapa local y mapa estratégico
depends_on: []
related:
  - WLD-001
  - WLD-003
  - DEC-0008
  - DEC-0010
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

## Nota de `DESIGN-005`

La decisión de fondo —dos escalas conviven, con detalle profundo en la local
y abstracción en la regional— sigue vigente sin cambios. Lo que sí queda
reconciliado es su **representación**: cuando se escribió esta decisión, la
línea activa de código era el prototipo Godot y el mapa local se describía
como 3D. Desde
[DEC-0008](DEC-0008_simulation-first-web-architecture.md) la línea activa es
el laboratorio de simulación web, y
[DEC-0010](DEC-0010_procedural-local-and-regional-map-direction.md) fija que
la representación activa de la escala local es un mapa **2D cenital sobre
Canvas** y que la regional será un mapa 2D geográfico con regiones internas,
sin una cuadrícula hexagonal como estética obligatoria. Las menciones a «3D»
de este documento describen el prototipo histórico.

## Aspectos que siguen abiertos

- Forma exacta de conexión y transición entre ambas escalas.
- Escala, tamaño, resolución y geometría exactas de la estructura interna
  del mapa regional.
