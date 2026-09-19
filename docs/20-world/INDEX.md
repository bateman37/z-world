# 20-world — Mundo

## Responsabilidad

Define las escalas de representación del mundo (mapa local y mapa
estratégico) y sus reglas de relación.

## Qué pertenece aquí

- Escalas del mundo y su transición.
- Geografía y representación general del mundo (futuro).
- Exploración local e información sobre lugares y objetos.

## Qué no pertenece aquí

- Gestión concreta del asentamiento: `docs/40-settlement/`.
- Comunidades externas y sociedad: `docs/50-society/`.
- Amenazas y peligros: `docs/60-threats/`.

## Documentos

| ID | Estado | Propósito |
|---|---|---|
| [WLD-001](WLD-001_world-scales.md) | `approved` | Mapa local y mapa estratégico: definición y relación. |
| [WLD-002](WLD-002_local-exploration-and-information.md) | `approved` | Exploración local: estados de información y familias de acciones de descubrimiento. |
| [WLD-003](WLD-003_strategic-world-and-regional-simulation.md) | `approved` | Mapa estratégico, exploración regional y simulación distante. |
| [WLD-004](WLD-004_expertise-dependent-recovery.md) | `approved` | Inspección, saqueo, reconocimiento experto, revisitas y recuperación dependientes de la persona, con contenido base estable. |
| [WLD-005](WLD-005_semantic-place-and-building-generation.md) | `approved` | Generación semántica de lugares y edificios: cadena generativa, programa de estancias, grafo funcional y coherencia de contenido. |
| [WLD-006](WLD-006_historical-looting-pressure-and-routes.md) | `approved` | Presión histórica de saqueo por zona, correlación local, rutas/corredores y bolsas olvidadas. |
| [WLD-007](WLD-007_place-history-and-environmental-storytelling.md) | `approved` | Historia del apocalipsis por lugar, rastro ambiental y edificios memorables. |

## Dependencias con otros dominios

- `10-vision` (pilares que motivan las dos escalas).
- `catalogs` (`CAT-001` a `CAT-003`, fuente de contenido para `WLD-005`).
- Relacionado con `40-settlement`, `50-society` y `80-interface`.
