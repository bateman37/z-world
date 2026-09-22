# 40-settlement — Asentamiento

## Responsabilidad

Define el crecimiento físico del asentamiento y las soluciones de producción
que sostienen a la comunidad.

## Qué pertenece aquí

- Expansión y transformación del territorio.
- Producción, recursos y soluciones múltiples a necesidades materiales.
- El modelo de objeto completo, las familias logísticas de recursos y el
  desmontaje de objetos como transformación permanente (`SET-008`,
  `SET-009`), complementarios a las capas de aprovechamiento y la
  demolición de edificios ya cerradas en `SET-007`.

## Qué no pertenece aquí

- Dinámica social y política de la comunidad: `docs/50-society/`.
- Habilidades y conocimiento individual: `docs/30-characters/`.

## Documentos

| ID | Estado | Propósito |
|---|---|---|
| [SET-001](SET-001_settlement-growth.md) | `approved` | Crecimiento y costes del asentamiento; diferencia entre refugio provisional y asentamiento elegido. |
| [SET-002](SET-002_production-and-solutions.md) | `approved` | Producción y ausencia de ruta tecnológica única. |
| [SET-003](SET-003_resources-logistics-and-condition.md) | `approved` | Recursos, logística, condición y rutas alternativas iniciales. |
| [SET-004](SET-004_technological-transition-and-knowledge-economy.md) | `approved` | Del aprovechamiento del mundo anterior a la reconstrucción local. |
| [SET-005](SET-005_production-web-and-infrastructure.md) | `approved` | Red de soluciones, mantenimiento e infraestructuras. |
| [SET-006](SET-006_knowledge-assets-and-capability.md) | `approved` | Fuentes de conocimiento, estados comunitarios, acceso físico/digital y conversión en capacidad real. |
| [SET-007](SET-007_building-exploitation-reuse-and-demolition.md) | `approved` | Cinco capas de aprovechamiento, tres vidas del edificio, desmontaje, desmantelamiento y demolición irreversible. |
| [SET-008](SET-008_object-model-and-logistics-families.md) | `draft` | Modelo de objeto completo y catálogo de horizonte máximo de familias logísticas (capas 1–3 de `SET-007`). |
| [SET-009](SET-009_disassembly-and-world-transformation.md) | `draft` | Reconocimiento, desmontaje y transformación permanente de objetos completos. |

## Dependencias con otros dominios

- `20-world` (mapa local como escenario del asentamiento; `WLD-005` a
  `WLD-007` generan el edificio que `SET-007` explota; reconocimiento
  dependiente de la persona de `WLD-004`, que `SET-009` desarrolla en
  detalle para el desmontaje de objetos).
- `catalogs` (`CAT-002`, catálogo de instalaciones y acabados desmontables).
- `30-characters` (habilidades y conocimiento que habilitan la producción y
  el desmontaje).
- `80-interface` (reservas y designaciones sobre recursos).
- `90-architecture` (el motor de resolución de `ARC-006`–`ARC-008` ejecuta
  el desmontaje y la reparación que consumen las familias logísticas de
  `SET-008`).
