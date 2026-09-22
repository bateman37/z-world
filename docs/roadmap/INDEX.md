# roadmap — Hoja de ruta

## Responsabilidad

Reservado para una futura secuenciación de trabajo por fases o entregas, sin
convertirse en un calendario obligatorio.

## Qué pertenece aquí

- Orden previsto de trabajo futuro, cuando exista una razón concreta para
  documentarlo.

## Qué no pertenece aquí

- Compromisos de contenido o de diseño de juego: viven en su dominio.
- Un calendario obligatorio de hitos (ver advertencia en
  [SCN-001](../scenarios/SCN-001_mountain-village-arrival.md) sobre el
  "primer año").

## Documentos

| ID | Estado | Propósito |
|---|---|---|
| [RDM-001](RDM-001_first-playable-slice.md) | `deprecated` | Alcance histórico del primer corte jugable del prototipo Godot; sustituida por `RDM-003`. |
| [RDM-002](RDM-002_long-term-capability-horizon.md) | `draft` | Mapa de capacidades futuras, sin fechas ni compromiso de versión. |
| [RDM-003](RDM-003_simulation-first-playable-roadmap.md) | `approved` | Hoja de ruta activa de implementación del laboratorio de simulación, en incrementos pequeños y probables. Su incremento 5 precisa, desde `DESIGN-008`, el catálogo implementable aprobado (`CAT-004`/`CAT-005`) y el mundo local moldeable (`WLD-010`/`WLD-011`/`SET-010`/`SET-011`), sin crear un incremento nuevo. |

## Dependencias con otros dominios

- `80-interface`, `30-characters`, `20-world`, `40-settlement`, `60-threats`,
  `90-architecture`, `catalogs`, `decisions` y `scenarios` (`RDM-003`
  consolida el alcance activo de sus documentos sin repetir sus reglas;
  `RDM-001` conserva el consolidado histórico del prototipo Godot).
