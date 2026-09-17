# Changelog

Registra entregas documentales y de diseño de Z-World. No atribuye código ni
funcionalidad implementada salvo que se indique explícitamente como
`implemented` en la documentación afectada.

## DESIGN-002 — Horizonte máximo de diseño

Documenta el horizonte máximo conocido de Z-World: mundo estratégico y
simulación regional, historia vital y arcos personales, transición
tecnológica y red productiva, política interna y comunidades externas,
memoria e historia causal, gestión a escala comunitaria y principios de
simulación multiescala. Añade catorce documentos nuevos:

- **Aprobados (`approved`)**: `VIS-003`, `WLD-003`, `CHR-004`, `SET-004`,
  `SET-005`, `SOC-002`, `SOC-003`, `NAR-002`, `UI-002`, `ARC-003` y
  `DEC-0006`.
- **Borrador (`draft`)**: `CHR-005`, `THR-002` y `RDM-002`.

No amplía el primer corte jugable ni el alcance de
[RDM-001](docs/roadmap/RDM-001_first-playable-slice.md), no crea código,
escenas, proyecto Godot ni datos ejecutables, y no existe todavía ninguna
implementación del juego. Ver
[DEC-0006](docs/decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md)
para la separación entre horizonte máximo, alcance de entrega y estado
implementado.

## DESIGN-001 — Especificación funcional cerrada y primera versión jugable

Cierra la especificación funcional de cómo se juega minuto a minuto en el
mapa local (interacción, prioridades, autonomía, exploración, recursos,
amenazas, tiempo y persistencia) y define el alcance exacto de la primera
versión visual como documentación de diseño aprobada, sin crear código de
juego, proyecto Godot, escenas ni pruebas ejecutables. Ver
[docs/roadmap/RDM-001_first-playable-slice.md](docs/roadmap/RDM-001_first-playable-slice.md).

## DOCS-002 — Español como idioma documental

Formaliza el español como idioma documental por defecto para toda la prosa
dirigida a personas, preservando identificadores, rutas y contratos
técnicos. Ver
[docs/00-governance/DOC-001_documentation-system.md, sección 3.7](docs/00-governance/DOC-001_documentation-system.md).

## DOCS-001 — Base documental de Z-World

Establece la arquitectura documental inicial por dominios, con instrucciones
permanentes para agentes, decisiones iniciales (Godot 4, dos escalas de
mundo, diseño dirigido por datos) y el primer escenario como condición
inicial de partida.
