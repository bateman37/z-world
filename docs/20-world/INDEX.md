# 20-world — Mundo

## Responsabilidad

Define las escalas de representación del mundo (mapa local y mapa regional o
estratégico) y sus reglas de relación.

## Qué pertenece aquí

- Escalas del mundo y su transición.
- Geografía, generación espacial y representación general del mundo.
- Exploración local e información sobre lugares y objetos.

## Qué no pertenece aquí

- Gestión concreta del asentamiento: `docs/40-settlement/`.
- Comunidades externas y sociedad: `docs/50-society/`.
- Amenazas y peligros: `docs/60-threats/`.

## Documentos

| ID | Estado | Propósito |
|---|---|---|
| [WLD-001](WLD-001_world-scales.md) | `approved` | Mapa local (2D cenital) y mapa regional: definición, frontera funcional e interior de edificios. |
| [WLD-002](WLD-002_local-exploration-and-information.md) | `approved` | Exploración local: estados de información y familias de acciones de descubrimiento. |
| [WLD-003](WLD-003_strategic-world-and-regional-simulation.md) | `approved` | Mapa regional 2D bajo niebla, expediciones, simulación distante y detalle semántico; horizonte futuro, no roadmap activo. |
| [WLD-004](WLD-004_expertise-dependent-recovery.md) | `approved` | Inspección, saqueo, reconocimiento experto, revisitas y recuperación dependientes de la persona, con contenido base estable. |
| [WLD-005](WLD-005_semantic-place-and-building-generation.md) | `approved` | Generación semántica de lugares y edificios: cadena generativa, programa de estancias, grafo funcional y coherencia de contenido. |
| [WLD-006](WLD-006_historical-looting-pressure-and-routes.md) | `approved` | Presión histórica de saqueo por zona, correlación local, rutas/corredores y bolsas olvidadas. |
| [WLD-007](WLD-007_place-history-and-environmental-storytelling.md) | `approved` | Historia del apocalipsis por lugar, rastro ambiental y edificios memorables. |
| [WLD-008](WLD-008_local-procedural-map-generation.md) | `approved` | Generación espacial del mapa local: perfil de pueblo pequeño de montaña, capas terreno→parcelas, presupuesto de complejidad y estructura técnica invisible. |
| [WLD-009](WLD-009_initial-mountain-village-profile.md) | `approved` | Perfil numérico inicial del pueblo de montaña: huella `3×3 km`, presupuesto de construcciones, red viaria, agua, cobertura de terreno, puntos de interés y amenaza zombi del primer escenario. |

`WLD-005` es canónico desde la parcela hacia el edificio semántico;
`WLD-008` lo es desde el perfil de escenario hasta la parcela. No se
duplican entre sí.

## Dependencias con otros dominios

- `10-vision` (pilares que motivan las dos escalas).
- `catalogs` (`CAT-001` a `CAT-003`, fuente de contenido para `WLD-005`;
  `CAT-004` acota el catálogo permitido del perfil inicial de `WLD-008`).
- `80-interface` (`UI-005` representa el mapa que `WLD-008` genera; `UI-006`
  define la interacción contextual con sus lugares).
- `decisions` (`DEC-0010` fija la dirección de ambas escalas).
- Relacionado con `40-settlement`, `50-society` y `90-architecture`.
- `scenarios` (`WLD-009` instancia, con cifras concretas, el perfil de
  `WLD-008` para el primer escenario documentado en `SCN-001`–`SCN-003`).
