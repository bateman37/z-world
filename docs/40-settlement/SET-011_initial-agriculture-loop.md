---
id: SET-011
title: Ciclo agrícola inicial
status: approved
canonical_for:
  - estados funcionales de una parcela cultivable
  - acciones mínimas del ciclo agrícola
  - requisitos y rendimiento causal de la cosecha
  - ausencia de estaciones en el primer catálogo
  - producción agrícola localizada
depends_on:
  - SET-003
  - WLD-010
related:
  - CAT-004
  - CAT-005
  - SET-010
  - UI-003
  - ARC-006
  - DEC-0013
  - DISC-0007
---

## 1. Propósito

Cerrar la agricultura básica como primera ruta renovable de alimento del
primer catálogo implementable, sobre el perfil «Campo o parcela abierta»
(`ENV-02` de [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md)):
sus estados funcionales, acciones mínimas, requisitos, rendimiento causal,
producción localizada y el límite explícito de no simular todavía
estaciones.

## 2. Principios que no deben romperse

- La agricultura es renovable, pero no resuelve automáticamente el hambre
  de la primera noche del escenario (ver
  [SCN-003](../scenarios/SCN-003_first-day-starting-state.md)).
- El paso del tiempo sin trabajo previo no crea cultivo: la cadena de
  estados exige causas, no solo esperar.
- La cosecha aparece en el campo o en recipientes de recolección; no se
  suma automáticamente al almacén.
- El primer catálogo no simula el ciclo completo de estaciones ni
  introduce un calendario estacional universal o bonificaciones
  invisibles.
- Preparar el suelo no garantiza una cosecha.

## 3. Modelo funcional

### 3.1 Estados funcionales mínimos

Una parcela cultivable evoluciona conceptualmente:

```text
Terreno no preparado
→ despejado
→ preparado
→ sembrado
→ en crecimiento
→ cosechable
→ cosechado
→ requiere nueva preparación, mantenimiento o siembra
```

Esta cadena admite progreso parcial, interrupción, daño, abandono o
pérdida; no es una única barra de progreso sin causas.

### 3.2 Acciones mínimas

Observar la parcela; inspeccionar aptitud conocida; despejar; preparar el
suelo; aportar semillas; sembrar; cuidar, regar o mantener cuando
corresponda; esperar crecimiento mediante tiempo de simulación; cosechar;
agrupar, cargar, transportar y almacenar la producción (ver
[SET-010](SET-010_local-hauling-and-transport.md)).

### 3.3 Requisitos y rendimiento

La solución agrícola declara, como mínimo: terreno adecuado; superficie
preparada; semillas localizadas; herramientas agrícolas básicas; trabajo;
conocimiento y habilidades pertinentes (prioridad Agricultura de
[UI-003](../80-interface/UI-003_work-priority-taxonomy.md)); agua o
cuidados cuando el perfil de cultivo lo requiera; tiempo de crecimiento;
estado y riesgos conocidos.

El rendimiento cuantificable depende causalmente de: aptitud del terreno;
preparación; semillas; trabajo realizado; disponibilidad de agua;
cuidados; daños, abandono o incidentes; método y capacidad reales. No se
cierran cifras, fórmulas ni probabilidades; sí queda cerrado que el
rendimiento existe, varía y se explica, siguiendo el marco de resultados
multidimensionales de
[ARC-008](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md).

### 3.4 Sin estaciones todavía

El primer catálogo no simula el ciclo completo de estaciones; trabaja
dentro de la situación inicial ya fijada del escenario
([SCN-003](../scenarios/SCN-003_first-day-starting-state.md)); no
introduce un calendario estacional universal ni bonificaciones invisibles.
El catálogo de cultivos, duraciones reales, rotación, fertilidad
avanzada, plagas, fertilizantes y conservación de semillas queda para
ampliaciones futuras; la arquitectura no debe impedir esos sistemas
futuros.

### 3.5 Producción localizada

La cosecha aparece en el campo o en recipientes utilizados durante la
recolección; no se suma automáticamente al almacén. Debe cargarse,
transportarse, atravesar accesos y descargarse (ver
[SET-010](SET-010_local-hauling-and-transport.md) y
[WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md)). Un
campo exterior al perímetro puede requerir vigilancia y una ruta
logística propia.

## 4. Reglas aprobadas

- Toda parcela cultivable del primer catálogo sigue la cadena de estados
  de la sección 3.1; ninguna implementación la colapsa en una barra sin
  causas.
- Sembrar requiere semillas localizadas y medios pertinentes; el paso del
  tiempo por sí solo nunca crea cultivo.
- El rendimiento varía causalmente según la sección 3.3; ninguna
  implementación puede mostrarlo como una probabilidad desnuda sin
  explicación.
- El primer catálogo agrícola funciona sin sistema de estaciones (sección
  3.4).
- La cosecha permanece localizada hasta transportarse (sección 3.5).

## 5. Interacciones con otros sistemas

- El perfil ambiental `ENV-02` sobre el que se cultiva se define en
  [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md) y
  [WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md).
- Las semillas y herramientas agrícolas se definen en
  [CAT-005](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md).
- El transporte de la cosecha se define en
  [SET-010](SET-010_local-hauling-and-transport.md).
- La prioridad de trabajo Agricultura se define en
  [UI-003](../80-interface/UI-003_work-priority-taxonomy.md).
- El procedimiento de resolución que ejecuta cada acción (Modelo D de
  crecimiento continuo) se define en
  [ARC-006](../90-architecture/ARC-006_action-and-event-resolution-model.md).
- La ruta alternativa de alimento que este ciclo complementa, sin
  sustituir, se define en
  [SET-003 §4](SET-003_resources-logistics-and-condition.md#4-reglas-aprobadas).

## 6. Casos límite o riesgos

- Presentar la agricultura como solución garantizada de la primera noche
  contradice la sección 2 y [SCN-003](../scenarios/SCN-003_first-day-starting-state.md).
- Sumar la cosecha automáticamente al almacén contradice la sección 3.5.
- Introducir un calendario estacional o bonificaciones invisibles
  contradice la sección 3.4.
- Abandonar la parcela sin consecuencia persistente contradice la sección
  3.1.

## 7. Preguntas abiertas

- Catálogo completo de cultivos y estaciones.
- Fórmulas de fertilidad, riego, deterioro y rendimiento.
- Tiempos de cultivo y cantidades de cosecha exactos.
- Plagas, fertilizantes y conservación de semillas.

## 8. Ejemplos no normativos

- Despejar y preparar una parcela junto al arroyo sin sembrar no produce
  cultivo alguno; sembrar sin agua cercana puede reducir el rendimiento
  incluso si el resto de pasos se completan correctamente.
- Una cosecha de hortalizas recogida en cestas en el borde del campo debe
  transportarse hasta la despensa del refugio antes de contar como
  almacenada.
