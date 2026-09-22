---
id: DEC-0013
title: Catálogo implementable pequeño y mundo local como realidad transformable de primera clase
status: approved
canonical_for:
  - por qué se aprueba un catálogo inicial pequeño con profundidad
  - por qué el entorno es una realidad transformable de primera clase, no un fondo
  - por qué accesos y transporte son topología física, no decoración ni bonos abstractos
  - separación entre alcance inicial aprobado y horizonte máximo documentado
depends_on: []
related:
  - CAT-004
  - CAT-005
  - WLD-010
  - WLD-011
  - SET-010
  - SET-011
  - DEC-0006
  - DISC-0007
---

## Contexto

`DESIGN-004` a `DESIGN-007` cerraron el reinicio de línea técnica, las dos
escalas de mundo, el motor de resolución y el primer escenario de llegada,
pero [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md)
seguía `draft` y el mundo local corría el riesgo de diseñarse, en
implementación, como un tablero de edificios con terreno decorativo entre
ellos. `DESIGN-008` cierra ambas cuestiones a la vez: elige el primer
catálogo implementable de contenido y asegura que la caja de juguetes del
vertical slice nazca sobre un mundo local explotable, conectable y
transformable, no limitado a edificios y objetos sueltos.

## Decisión

Se adoptan cuatro decisiones transversales:

1. **Catálogo inicial pequeño y profundo.**
   [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md) pasa de
   `draft` a `approved` con exactamente ocho perfiles (cuatro edificios y
   cuatro perfiles no exclusivamente edificatorios), y
   [CAT-005](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md)
   aprueba el catálogo inicial de objetos, recursos y transporte que los
   equipa. La profundidad de sistemas demostrados prevalece sobre la
   amplitud de arquetipos.
2. **El entorno es una realidad transformable de primera clase.**
   [WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md)
   cierra el modelo de nodo, línea, área y estructura, las capas
   semánticas de terreno y la libertad física de transformación con
   causalidad, no con parcelas autorizadas. `Place` deja de equivaler a
   `Building`.
3. **Accesos y transporte son topología física, no decoración ni bonos
   abstractos.**
   [WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md) y
   [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md)
   cierran el modelo de abertura/cierre/modificación y el sistema físico
   de transporte local, ambos integrados en el mismo grafo de
   circulación, defensa y logística que el resto del mundo.
4. **Separación estricta entre alcance inicial y horizonte máximo.** Cada
   documento nuevo distingue explícitamente lo que este catálogo aprueba
   para una futura entrega de programación de lo que queda documentado
   como horizonte máximo sin activarse todavía (terraformación libre,
   construcción libre, animales de carga/tiro, vehículos, extracción
   profunda de carreteras, edición funcional de interiores). Ningún
   documento de esta entrega pasa a `implemented`.

## Consecuencias

- [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md),
  [CAT-005](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md),
  [WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md),
  [WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md),
  [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md) y
  [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md) nacen o
  pasan a `approved` como contrato de contenido y reglas funcionales,
  nunca como implementación (ver
  [DEC-0006](DEC-0006_maximum-envelope-vs-delivery-scope.md)).
- [RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md)
  precisa su incremento «Generador semántico inicial y explotación de
  lugares» con este alcance aprobado, sin añadir un incremento nuevo ni
  comprometer fecha.
- «Materiales de reparación» deja de poder implementarse como pila
  universal; toda reparación futura debe declarar sus familias concretas
  (ver [SET-003](../40-settlement/SET-003_resources-logistics-and-condition.md)
  y [CAT-005 §4.3](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md#43-fin-del-recurso-mágico-materiales-de-reparación)).
- Toda entrega de código futura que implemente este catálogo debe seguir
  citando este contrato y no reducir en silencio ninguna de sus ocho
  perfiles, cuatro familias de objetos demostradores o cinco métodos de
  transporte sin una nueva decisión.
- La trazabilidad completa de las decisiones `P01`–`P24` que sustentan
  esta decisión vive en
  [DISC-0007](../discovery/DISC-0007_implementable-catalog-and-mutable-world-traceability.md).

## Aspectos que siguen abiertos

- Cuándo se escribe el prompt de programación que consume este catálogo
  aprobado.
- Cifras, fórmulas, algoritmos geométricos y estructura de datos exactos:
  permanecen como parametrización abierta en cada documento afectado.
