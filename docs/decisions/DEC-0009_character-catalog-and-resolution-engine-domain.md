---
id: DEC-0009
title: Catálogo de personaje de horizonte máximo y dominio del motor de resolución
status: approved
canonical_for:
  - decisión transversal de cerrar el catálogo de nueve características y 34 habilidades
  - decisión transversal de ubicar el motor de resolución en 90-architecture
depends_on: []
related:
  - CHR-006
  - CHR-005
  - ARC-006
  - ARC-007
  - ARC-008
  - SET-008
  - SET-009
  - DEC-0006
  - DEC-0007
  - DEC-0008
---

## Contexto

La consolidación documental de motor, personaje y objetos (ver
`docs/discovery/` para la síntesis de origen si aplica) requería resolver
dos huecos estructurales detectados en el repositorio: (1) no existía un
catálogo cerrado de características y habilidades más allá de las once
habilidades específicas del primer corte jugable (`CHR-001` §3.1) y de la
taxonomía candidata todavía `draft` de `CHR-005`; (2) no existía ningún
documento canónico para el motor que resuelve acciones, trabajos y eventos,
pese a que `UI-003` ya tipifica el vocabulario de trabajo que ese motor
debe ejecutar.

## Decisión

1. Se aprueba el catálogo de horizonte máximo de **nueve características y
   34 habilidades base**, con su arquitectura de característica/habilidad/
   dominio/conocimiento/trabajo, en
   [CHR-006](../30-characters/CHR-006_characteristics-and-skill-catalog.md).
   [CHR-005](../30-characters/CHR-005_extended-skill-taxonomy.md) queda
   `deprecated`, sustituido por CHR-006, y se conserva como antecedente
   histórico sin destruir su contenido.
2. Se crea el dominio del **motor de resolución de acciones, trabajos y
   eventos** dentro de `90-architecture` (prefijo `ARC`, coherente con
   `ARC-002`/`ARC-003` como mecánica de simulación, no de interfaz), en tres
   documentos:
   [ARC-006](../90-architecture/ARC-006_action-and-event-resolution-model.md)
   (procedimiento común, capacidades efectivas, modelos B/D),
   [ARC-007](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md)
   (cooperación, órdenes, modos, tiempo, estado/herramientas/entorno) y
   [ARC-008](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md)
   (resultados, eventos, conexiones, persistencia, casos de validación y
   decisiones pendientes).
3. Se aprueba el modelo de objeto y el catálogo de horizonte máximo de
   familias logísticas en
   [SET-008](../40-settlement/SET-008_object-model-and-logistics-families.md),
   y el modelo de desmontaje y transformación permanente del mundo en
   [SET-009](../40-settlement/SET-009_disassembly-and-world-transformation.md).

## Razones

- **Cierre real, no otro borrador.** El catálogo de personaje llevaba dos
  fuentes en tensión (`CHR-001` limitado al primer corte, `CHR-005`
  candidato sin cerrar); mantenerlas indefinidamente impedía documentar
  trabajos compuestos, potencial y calibre con un vocabulario estable.
- **Coherencia de prefijos.** `ARC` ya aloja mecánica de simulación
  (`ARC-002`, `ARC-003`), mientras `UI` aloja interacción y presentación
  (`UI-001`, `UI-003`, `UI-004`); el motor de resolución es mecánica, no
  presentación, y depende de `UI-003` sin redefinirlo.
- **Trazabilidad completa.** El motor conserva los identificadores locales
  de su consolidación de origen (`R01`–`R20`, `P01`–`P22`, 19 casos de
  validación); el personaje conserva sus 42 reglas invariantes y sus seis
  casos; los objetos conservan sus 20 decisiones cerradas.

## Consecuencias

- Todo contenido futuro de habilidades, dominios o técnicas debe partir del
  catálogo de `CHR-006`, no de `CHR-005`.
- Todo contenido futuro de resolución de acciones (comprobaciones,
  incidencias, cooperación) debe enlazar `ARC-006`–`ARC-008` en lugar de
  duplicar su vocabulario.
- Existe, sin fecha fijada por esta decisión, la necesidad de migrar el
  alcance ya implementado (once habilidades de `CHR-001`, nueve recursos
  agregados de `SET-003`, diez familias de prioridad) hacia estos
  catálogos de horizonte máximo; esta decisión no diseña ni fecha esas
  migraciones, igual que `DEC-0007` no fechó la migración de prioridades.
- La calibración numérica de escalas, medias entre grupos, modelo B, modelo
  D, potencial y calibre sigue abierta y documentada como tal en cada
  documento (`ARC-008` §4, `CHR-007` §7, `SET-008`/`SET-009` §7/§5).

## Alternativas descartadas

- Ampliar `CHR-005` en lugar de crear `CHR-006`: se descarta porque
  `CHR-005` es una lista candidata de ~90 habilidades sin arquitectura de
  dominios/conocimientos/trabajos y sin las nueve características; forzar
  su contenido a coincidir habría mezclado un antecedente exploratorio con
  una decisión cerrada.
- Ubicar el motor de resolución en `80-interface` como `UI-005`: se
  descarta porque su contenido (comprobaciones, incidencias, modelos B/D)
  es mecánica de simulación consumida por la interfaz, no presentación ni
  interacción; se mantiene la dependencia expresa hacia `UI-003` en lugar
  de fusionar los dominios.
- Fusionar personaje y objetos en un único documento de horizonte máximo:
  se descarta porque violaría el límite de tamaño de `DOC-001` y mezclaría
  responsabilidades de dominios ya separados (`30-characters` y
  `40-settlement`).

## No decisión

Esta entrega no implementa código, no amplía `RDM-001` y no fija ninguna
fórmula de calibración (medias entre grupos, modelo B, modelo D, potencial,
calibre, cantidades de desmontaje) como balance aprobado; todas quedan
explícitamente pendientes en los documentos referenciados.

## Nota de reconciliación con `DEC-0008`

Esta decisión y [DEC-0008](DEC-0008_simulation-first-web-architecture.md)
son compatibles y no se solapan: `DEC-0008` decide la línea de código activa
(Node.js/TypeScript/Next.js/PostgreSQL) y reinicia la implementación;
`ARC-006`–`ARC-008` documentan un modelo de reglas de diseño (qué se
resuelve y cómo), agnóstico de motor, que esa línea de código deberá
implementar en su momento sobre el núcleo de simulación ya aprobado en
`ARC-004`. Ninguno de los tres documentos del motor de resolución reintroduce
Godot como arquitectura activa ni como implementación a retomar.
