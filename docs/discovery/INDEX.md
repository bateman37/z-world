# discovery — Descubrimiento

## Responsabilidad

Conserva síntesis de conversaciones, alternativas e ideas todavía no
cerradas. No es una fuente canónica de reglas.

## Qué pertenece aquí

- Síntesis de discusiones de diseño fundacionales.
- Alternativas exploradas que no se cerraron como decisión.

## Qué no pertenece aquí

- Reglas funcionales vigentes: viven en el dominio canónico correspondiente.
- Decisiones ya cerradas: `docs/decisions/`.
- Transcripciones completas de conversaciones: deben sintetizarse, no
  copiarse.

## Documentos

| ID | Estado | Propósito |
|---|---|---|
| [DISC-0001](DISC-0001_foundational-design.md) | `draft` | Síntesis del diseño fundacional; distingue lo aprobado de lo exploratorio. |
| [DISC-0002](DISC-0002_design-references.md) | `draft` | Referentes de diseño para el modelo funcional cerrado, sin reglas canónicas. |
| [DISC-0003](DISC-0003_procedural-place-generator-traceability.md) | `draft` | Matriz de trazabilidad de las 86 secciones del Anexo A de `DESIGN-004` a su documento canónico. |
| [DISC-0004](DISC-0004_local-regional-maps-and-contextual-actions-traceability.md) | `draft` | Trazabilidad de `DESIGN-005`: decisiones cerradas, aclaraciones, opciones descartadas, ejemplos no normativos, preguntas abiertas y contradicciones corregidas. |
| [DISC-0005](DISC-0005_resolution-engine-closure-traceability.md) | `draft` | Trazabilidad de `DESIGN-006`: cierre de `P01`–`P22`, acuerdos previos preservados, correcciones, fórmulas descartadas, ejemplos no normativos y preguntas de otros sistemas que siguen abiertas. |
| [DISC-0006](DISC-0006_first-arrival-scenario-traceability.md) | `draft` | Trazabilidad de `DESIGN-007`: decisiones cerradas, elementos procedurales, invariantes, cifras de presupuesto, opciones descartadas y preguntas que permanecen abiertas del primer escenario de llegada. |
| [DISC-0007](DISC-0007_implementable-catalog-and-mutable-world-traceability.md) | `draft` | Trazabilidad de `DESIGN-008`: decisiones `P01`–`P24` cerradas, matriz de reconciliación, interpretaciones descartadas y registro de los 76 casos de validación documental del catálogo implementable y el mundo local moldeable. |

## Dependencias con otros dominios

- `10-vision`, `scenarios`, `80-interface`, `30-characters`.
- `20-world`, `40-settlement`, `90-architecture`, `catalogs`, `roadmap`,
  `decisions` (`DISC-0003`, `DISC-0004`, `DISC-0005` y `DISC-0006` trazan
  contenido hacia estos dominios).
