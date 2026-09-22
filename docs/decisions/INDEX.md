# decisions — Decisiones

## Responsabilidad

Registra decisiones relevantes ya adoptadas, con su contexto, motivo y
consecuencias. No repite las reglas funcionales completas: enlaza al
documento canónico de dominio correspondiente.

## Qué pertenece aquí

- Decisiones de alcance transversal o arquitectónico ya cerradas.

## Qué no pertenece aquí

- Propuestas o alternativas todavía no cerradas: `docs/discovery/`.
- El detalle funcional completo de una regla: vive en su dominio canónico.

## Documentos

| ID | Estado | Propósito |
|---|---|---|
| [DEC-0001](DEC-0001_godot-4.md) | `deprecated` | Godot 4 como motor del prototipo histórico; sustituida por `DEC-0008`. |
| [DEC-0002](DEC-0002_two-world-scales.md) | `approved` | Convivencia de mapa local y mapa regional; su representación se reconcilia en `DEC-0010`. |
| [DEC-0003](DEC-0003_data-driven-design.md) | `approved` | Desacoplamiento entre sistemas, datos y presentación. |
| [DEC-0004](DEC-0004_mouse-strategic-control.md) | `approved` | Control individual con ratón dentro de un juego de gestión. |
| [DEC-0005](DEC-0005_reproducible-lazy-generation.md) | `approved` | Generación bajo demanda estable y reproducible. |
| [DEC-0006](DEC-0006_maximum-envelope-vs-delivery-scope.md) | `approved` | Separar visión máxima, alcance de entrega y estado implementado. |
| [DEC-0007](DEC-0007_layered-work-and-priorities.md) | `approved` | Conservar 34 prioridades jerárquicas, separadas de habilidades y del alcance implementado. |
| [DEC-0008](DEC-0008_simulation-first-web-architecture.md) | `approved` | Reinicio de la línea activa de código a Node.js/TypeScript/Next.js/PostgreSQL; Godot preservado como prototipo histórico. |
| [DEC-0009](DEC-0009_character-catalog-and-resolution-engine-domain.md) | `approved` | Cerrar el catálogo de nueve características/34 habilidades y crear el dominio del motor de resolución en `90-architecture`. |
| [DEC-0010](DEC-0010_procedural-local-and-regional-map-direction.md) | `approved` | Mapa local 2D cenital continuo con estructura técnica invisible, mapa regional futuro geográfico, geografía procedural ficticia y ausencia de mapa local automático por punto regional. |
| [DEC-0011](DEC-0011_hybrid-resolution-engine-and-capability-presentation.md) | `approved` | Cierre transversal del motor híbrido de resolución (directo/D/B), escala real `0–10`, cooperación, modos en dos dimensiones y presentación de nivel actual/potencial oculto; cierra `P01`–`P22`. |
| [DEC-0012](DEC-0012_first-arrival-scenario-contract.md) | `approved` | Contrato del primer escenario de llegada: por qué combina una situación fija con personas y mundo procedurales, calibre alto de la cohorte protagonista y garantías de semilla, sin guion lineal. |
| [DEC-0013](DEC-0013_implementable-catalog-and-mutable-world.md) | `approved` | Catálogo implementable pequeño y profundo (`CAT-004`/`CAT-005`) y mundo local como realidad transformable de primera clase (`WLD-010`/`WLD-011`/`SET-010`/`SET-011`), separando alcance inicial y horizonte máximo. |

## Dependencias con otros dominios

- `90-architecture`, `20-world`, `80-interface`, `catalogs`, `roadmap`,
  `30-characters`, `40-settlement`, `scenarios`.
