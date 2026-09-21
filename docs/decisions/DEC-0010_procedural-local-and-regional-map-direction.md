---
id: DEC-0010
title: Dirección procedural de los mapas local y regional
status: approved
canonical_for:
  - dirección de representación y generación de las dos escalas espaciales
depends_on: []
related:
  - DEC-0002
  - DEC-0004
  - DEC-0005
  - DEC-0008
  - WLD-001
  - WLD-003
  - WLD-008
  - UI-005
  - UI-006
  - ARC-003
---

## Contexto

[DEC-0002](DEC-0002_two-world-scales.md) cerró la convivencia de dos escalas
de mundo, pero lo hizo describiendo el mapa local como un espacio 3D, porque
la línea de código activa en ese momento era el prototipo Godot. Desde
[DEC-0008](DEC-0008_simulation-first-web-architecture.md) la línea activa es
un laboratorio de simulación web cuyo mapa local es un Canvas 2D cenital
([UI-005](../80-interface/UI-005_top-down-simulation-workbench.md)).

Además quedaban sin cerrar tres cuestiones que la documentación existente
permitía interpretar de formas contradictorias: si el mapa local debía
presentarse como una cuadrícula visible, si la geografía del primer
escenario sería real o ficticia, y si «materializar» detalle semántico
implicaba abrir un mapa local nuevo en cada punto regional visitado.

## Decisión

Se fija la dirección de las dos escalas espaciales de Z-World:

1. **Mapa local activo**: 2D cenital sobre Canvas del navegador,
   visualmente continuo y orgánico, controlado exclusivamente con ratón, con
   una **estructura espacial técnica invisible** que puede sostener
   navegación, colisiones, costes, línea de visión, niebla, zonas,
   designaciones, sectores y carga diferida. La cuadrícula no es la estética
   del mapa. Detalle en
   [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md) y
   [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md).
2. **Mapa regional futuro**: 2D, visualmente geográfico, topográfico y
   continuo, cubierto por niebla e información incompleta, apoyado
   internamente en regiones, celdas o hexágonos invisibles y una red de
   rutas. No se impone una cuadrícula hexagonal como estética dominante.
   Detalle en
   [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md).
3. **Geografía procedural controlada y ficticia** en ambas escalas. El
   primer escenario es un pueblo de montaña ficticio dentro de un perfil
   acotado; no es la reproducción literal de Sort ni de ningún otro
   municipio real. Sort, Cataluña, Aragón, Andorra o Francia solo fueron
   referencias de ambiente y escala durante el diseño.
4. **El mapa local 3D es un antecedente histórico** del prototipo Godot. Se
   conserva como aprendizaje y no se presenta como arquitectura o
   representación activa (ver
   [DEC-0008](DEC-0008_simulation-first-web-architecture.md) y
   [DEC-0001](DEC-0001_godot-4.md), `deprecated`).
5. **No existe materialización obligatoria de un mapa local por cada punto
   regional.** La generación diferida de detalle semántico sigue aprobada
   ([ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md),
   [DEC-0005](DEC-0005_reproducible-lazy-generation.md),
   [ARC-003](../90-architecture/ARC-003_multiscale-simulation-principles.md));
   abrir automáticamente un escenario local detallado al llegar a un punto
   regional **no** lo está.
6. **La semántica es independiente de la presentación.** El modelo
   semántico del mundo
   ([WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md),
   [ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md)) no
   cambia si algún día llega una capa visual más avanzada.

## Consecuencias

- [DEC-0002](DEC-0002_two-world-scales.md) conserva su decisión de fondo
  (dos escalas conviven) y se aclara: la representación activa de la escala
  local es 2D cenital, no 3D.
- [WLD-001](../20-world/WLD-001_world-scales.md),
  [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md)
  y [SCN-001](../scenarios/SCN-001_mountain-village-arrival.md) dejan de
  describir el mapa local como espacio 3D activo.
- Se crea
  [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md) como
  fuente canónica de la generación espacial del mapa local, distinta de la
  generación semántica de
  [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md).
- Se crea
  [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md)
  como fuente canónica de la interacción contextual con lugares y de la
  composición de equipos locales.
- El mapa regional **no entra** en el roadmap activo
  ([RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md)): se
  documenta como horizonte, y el trabajo inmediato sigue centrado en el mapa
  local y el laboratorio de simulación.
- Quedan descartados para la línea actual: el mapa local 3D como
  implementación activa; primera persona, WASD o control de avatar;
  perspectiva isométrica o 2.5D; la cuadrícula visible como estética
  obligatoria; copiar visualmente RimWorld; reducir el mapa local a nodos o
  pantallas de misión; reducir el mapa regional a una lista de misiones; la
  geografía real como contenido comprometido; que una semilla inicial genere
  una gran ciudad no soportada; y abrir obligatoriamente un mapa local al
  llegar a cada punto regional.
- No se retracta
  [DEC-0004](DEC-0004_mouse-strategic-control.md): el control puntual con
  ratón sigue siendo el único método de intervención directa, ahora sobre la
  superficie de mapa vigente.

## Aspectos que siguen abiertos

- Dimensiones exactas de ambos mapas y unidades empleadas.
- Forma, resolución, escala y visibilidad de la estructura interna de cada
  escala (celdas, sectores, polígonos, grafos, hexágonos).
- Algoritmos geométricos de generación y de pathfinding.
- Número de puntos regionales iniciales y máximos, y tamaño máximo `X` de
  una expedición.
- Si algunos lugares regionales excepcionales llegarán a resolverse de forma
  regional, mostrar detalle contextual, usar una vista específica, reutilizar
  el mapa local o generar otra representación. Ninguna de esas opciones se
  elige aquí.
- Fecha de implementación del mapa regional.
