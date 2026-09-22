---
id: DISC-0007
title: Trazabilidad del catálogo implementable y el mundo local moldeable
status: draft
canonical_for:
  - trazabilidad de las decisiones P01–P24 de DESIGN-008
  - matriz de reconciliación de documentos afectados por DESIGN-008
  - interpretaciones descartadas de DESIGN-008
  - registro de los casos de validación documental de DESIGN-008
depends_on:
  - CAT-004
  - CAT-005
  - WLD-010
  - WLD-011
  - SET-010
  - SET-011
  - DEC-0013
related:
  - DISC-0003
  - DISC-0006
  - DEC-0006
---

## 1. Propósito

Sintetizar la trazabilidad completa del encargo `DESIGN-008`: las
decisiones `P01`–`P24` cerradas, la matriz de reconciliación de
documentos existentes, las interpretaciones descartadas y el registro de
que los casos de validación documental exigidos se satisfacen sin
contradicción. No es una fuente canónica de reglas: cada regla vive en su
documento de dominio; este documento solo traza y conecta.

## 2. Decisiones P01–P24 cerradas

Estas veinticuatro decisiones quedan cerradas por `DESIGN-008` y no deben
reabrirse como preguntas:

| ID | Decisión cerrada | Fuente canónica principal |
|---|---|---|
| P01 | Todo el entorno interactuable es parte persistente y transformable del mundo. | [WLD-010 §2](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md#2-principios-que-no-deben-romperse) |
| P02 | El catálogo inicial contiene exactamente ocho perfiles: cuatro edificios, agua, campo, bosque/matorral y carretera/camino. | [CAT-004 §3.1](../catalogs/CAT-004_initial-semantic-place-slice.md#31-los-ocho-perfiles-iniciales-aprobados) |
| P03 | Los edificios usan programas variables; primera versión de una planta y sin editor arquitectónico; futuro menú funcional sencillo. | [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md), [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) |
| P04 | Cualquier terreno físicamente adecuado puede transformarse o construirse; no hay ranuras exclusivas. | [WLD-010 §3.4](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md#34-libertad-de-transformación-con-causalidad) |
| P05 | La primera versión incluye campo de cultivo, no solo preparación de terreno. | [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md) |
| P06 | La primera construcción espacial es una barrera lineal sencilla entre anclajes. | [WLD-010 §3.6](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md#36-construcción-lineal-anclajes-y-red-de-perímetro) |
| P07 | El horizonte permite construcción libre y terraformación causal, incluidas nivelación, rampas y escaleras. | [WLD-010 §3.8](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md#38-horizonte-máximo) |
| P08 | El perímetro se deriva de cierres físicos reales; cerrado no equivale automáticamente a seguro. | [WLD-010 §3.6](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md#36-construcción-lineal-anclajes-y-red-de-perímetro) |
| P09 | La carretera es transformable; el primer corte admite despeje y conversión básica a terreno despejado. | [WLD-010 §3.7](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md#37-carretera-y-camino-como-elementos-transformables) |
| P10 | El catálogo de objetos comienza pequeño y profundo y se amplía después. | [CAT-005 §3](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md#3-modelo-funcional) |
| P11 | El recorte no sustituye el sistema de objetos/materiales máximo por un recurso mágico; converge hacia él. | [CAT-005 §4](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md#4-subconjunto-inicial-de-recursos-y-materiales) |
| P12 | Todos los objetivos utilizan una sola gramática de acciones y muestran únicamente posibilidades pertinentes y conocidas. | [WLD-010 §5](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md#5-una-sola-gramática-de-acciones) |
| P13 | Se conserva el mapa lógico completo y el detalle se materializa bajo demanda. | [WLD-009 §3.7](../20-world/WLD-009_initial-mountain-village-profile.md#37-relación-con-cat-004) |
| P14 | Entran agricultura y rendimiento básico sin estaciones, carretera básica y transporte local manual; vehículos quedan fuera de la primera implementación. | [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md), [SET-010 §3.3](../40-settlement/SET-010_local-hauling-and-transport.md#33-horizonte-máximo-de-métodos) |
| P15 | Abertura, cierre y modificaciones forman un modelo común para puertas, ventanas, portones, trampillas y brechas. | [WLD-011 §3.1](../20-world/WLD-011_openings-access-and-connectivity.md#31-tres-conceptos-separados) |
| P16 | La posición de los accesos es real, procedural y afecta circulación, defensa y logística. | [WLD-011 §3.3](../20-world/WLD-011_openings-access-and-connectivity.md#33-colocación-procedural-coherente) |
| P17 | El primer corte actúa sobre accesos existentes: abrir, cerrar, bloquear, reparar, reforzar, barricadar y tapiar. | [WLD-011 §3.4](../20-world/WLD-011_openings-access-and-connectivity.md#34-estados-y-acciones-iniciales) |
| P18 | Crear, ampliar o trasladar huecos queda aprobado como horizonte mediante una acción contextual, no un CAD obligatorio. | [WLD-011 §3.8](../20-world/WLD-011_openings-access-and-connectivity.md#38-horizonte-futuro-crear-o-modificar-huecos) |
| P19 | Ventanas y brechas son accesos potenciales, no decoración. | [WLD-011 §3.6](../20-world/WLD-011_openings-access-and-connectivity.md#36-ventanas-brechas-y-accesos-no-convencionales) |
| P20 | Ruta, carga y medio deben caber realmente por los accesos. | [WLD-011 §3.7](../20-world/WLD-011_openings-access-and-connectivity.md#37-compatibilidad-de-accesos-y-transporte) |
| P21 | Métodos iniciales: a pulso, recipiente/equipamiento personal, porte coordinado, carretilla y carro manual. | [SET-010 §3.2](../40-settlement/SET-010_local-hauling-and-transport.md#32-métodos-activos-en-el-primer-recorte) |
| P22 | El horizonte incluye otros medios humanos, ayudas mecánicas, animales de carga/tiro y vehículos. | [SET-010 §3.3](../40-settlement/SET-010_local-hauling-and-transport.md#33-horizonte-máximo-de-métodos) |
| P23 | La carga se resume por peso, bulto y etiquetas pertinentes, no solo peso ni geometría milimétrica. | [SET-010 §3.5](../40-settlement/SET-010_local-hauling-and-transport.md#35-modelo-mínimo-de-carga) |
| P24 | La logística admite etapas y transferencias; el método puede ser `Auto` o específico y nunca teletransporta recursos. | [SET-010 §3.8](../40-settlement/SET-010_local-hauling-and-transport.md#38-logística-por-etapas-y-puntos-de-transferencia) |

## 3. Interpretaciones descartadas

Quedan explícitamente descartadas y no deben reaparecer como reglas
vigentes: lugar = edificio; terreno como fondo visual inmutable; objetos
y edificios como únicos objetivos interactivos; agricultura limitada a
casillas prefijadas; construcción limitada a solares autorizados; cambiar
una etiqueta para transformar físicamente una zona; campo que produce
alimento instantáneamente; cosecha teletransportada al almacén; carretera
como textura imposible de modificar; despejar y retirar una carretera
como la misma acción sin consecuencias; muro que cruza una carretera sin
bloquearla ni crear acceso; recinto dibujado que se vuelve seguro
automáticamente; muro cerrado invulnerable; editor CAD completo en la
primera versión; planos fijos idénticos para todas las casas; puertas
colocadas aleatoriamente sin relación con estancias y calle; puerta como
simple sprite sin topología; retirar la puerta y hacer desaparecer
también el hueco; puerta cerrada equivalente a hueco tapiado; ventanas y
brechas puramente decorativas; objeto voluminoso atravesando cualquier
puerta; transporte como bonificación abstracta o teletransporte;
carretilla o carro funcionando igual en cualquier terreno; peso como
única propiedad de carga; simulación milimétrica innecesaria de cada
forma; cualquier número de ayudantes sumando una bonificación universal;
método `Auto` omnisciente; animales o vehículos funcionales en el primer
recorte; combustible, electricidad o motor gratuitos; almacenamiento como
cifra sin contenedores ni espacio; «materiales de reparación» como
recurso universal independiente; desmontar sin trasladar lo recuperado;
duplicar el motor para edificios, campos, carreteras y objetos; mostrar
acciones desconocidas en gris revelando secretos; mantener `CAT-004` en
`draft` después de esta aprobación expresa; marcar el catálogo como
`implemented` por estar aprobado; mantener `55–85` interiores activos
simultáneamente; ampliar o reactivar el roadmap Godot.

## 4. Registro de los casos de validación documental

Los 76 casos de validación exigidos por el encargo (catálogo y mapa;
terreno y construcción; perímetro y accesos; agricultura; objetos,
recursos y desmontaje; transporte y logística; acciones, alcance y
estados) se satisfacen sin contradicción mediante las reglas ya citadas
en las secciones 2 y 3, y en particular:

- **Catálogo y mapa** (casos 1–7): [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md)
  fija exactamente ocho perfiles `approved`; [WLD-009 §3.2](../20-world/WLD-009_initial-mountain-village-profile.md#32-presupuesto-de-construcciones)
  conserva `3×3 km`/`55–85`; [WLD-010 §3.3](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md#33-identidad-estable-y-persistencia)
  cierra la materialización diferida sin perder identidad.
- **Terreno y construcción** (casos 8–17): [WLD-010 §3.4](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md#34-libertad-de-transformación-con-causalidad)
  a [§3.7](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md#37-carretera-y-camino-como-elementos-transformables)
  cierran libertad de transformación, barrera entre anclajes y la
  diferencia entre despejar y retirar una carretera.
- **Perímetro y accesos** (casos 18–32): [WLD-010 §3.6](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md#36-construcción-lineal-anclajes-y-red-de-perímetro)
  y [WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md)
  cierran red de perímetro, colocación procedural de accesos y el modelo
  abertura/cierre/modificación.
- **Agricultura** (casos 33–40): [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md)
  cierra la cadena de estados, requisitos, rendimiento causal y
  producción localizada.
- **Objetos, recursos y desmontaje** (casos 41–50): [CAT-005](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md)
  cierra los cuatro objetos demostradores y la reconciliación de
  «materiales de reparación»; [SET-008](../40-settlement/SET-008_object-model-and-logistics-families.md)
  y [SET-009](../40-settlement/SET-009_disassembly-and-world-transformation.md)
  conservan sus reglas de desmontaje ya cerradas.
- **Transporte y logística** (casos 51–68): [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md)
  cierra los cinco métodos activos, el modelo de carga, las fases, las
  transferencias y el selector `Auto`/método.
- **Acciones, alcance y estados** (casos 69–76): [WLD-010 §5](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md#5-una-sola-gramática-de-acciones)
  cierra la gramática única de acciones y la regla
  visible/gris/ausente; la sección 5 de este documento registra los
  estados documentales finales exigidos por el caso 73; el caso 76 se
  confirma en la sección 7.

Ningún caso de validación queda sin fuente canónica que lo satisfaga.

## 5. Estados documentales finales

| Documento | Estado anterior | Estado final |
|---|---|---|
| `CAT-004` | `draft` | `approved` |
| `CAT-005` | (nuevo) | `approved` |
| `WLD-010` | (nuevo) | `approved` |
| `WLD-011` | (nuevo) | `approved` |
| `SET-010` | (nuevo) | `approved` |
| `SET-011` | (nuevo) | `approved` |
| `DEC-0013` | (nuevo) | `approved` |
| `DISC-0007` | (nuevo) | `draft` |
| `SET-008` | `draft` | `draft` (conserva su horizonte máximo abierto) |
| `SET-009` | `draft` | `draft` (conserva su horizonte máximo abierto) |
| `RDM-003` | `approved` | `approved`, sin incremento nuevo |
| `WLD-005`, `WLD-008`, `WLD-009` | `approved` | `approved`, con enlaces añadidos |
| `SCN-001`, `SCN-002`, `SCN-003` | `approved` | `approved`, sin cambios de estado |
| `RDM-001` | `deprecated` | `deprecated`, sin reactivarse |

Ningún documento de esta entrega pasa a `implemented`.

## 6. Matriz de reconciliación (síntesis)

| Documento existente | Reconciliación aplicada |
|---|---|
| `WLD-005` | Enlaza el modelo de entorno de `WLD-010`/`WLD-011`; aclara que la cadena generativa semántica se aplica a lugares edificados. |
| `WLD-008` | Enlaza la transformación persistente de terreno de `WLD-010`; conserva su estructura espacial técnica invisible. |
| `WLD-009` | Registra la relación con `CAT-004` ya `approved` y la profundidad diferida, conservando `3×3 km`/`55–85`. |
| `SET-001` | Conecta crecimiento con áreas, líneas, perímetros y accesos de `WLD-010`/`WLD-011`. |
| `SET-002` | Incorpora la agricultura de `SET-011` como ruta renovable inicial adicional. |
| `SET-003` | Reconcilia «materiales de reparación» con las familias concretas de `CAT-005`. |
| `SET-004` | Mantiene vehículos y animales como transición futura, coherente con `SET-010 §3.3`. |
| `SET-005` | Enlaza campos, carreteras, barreras y logística. |
| `SET-007` | Relaciona puertas, ventanas y cierres con `WLD-011`, sin redefinir sus cinco capas. |
| `SET-008` | Añade el enlace al recorte aprobado de `CAT-005`, conserva su horizonte `draft`. |
| `SET-009` | Aclara que su alcance es la transformación de objetos completos, enlaza terreno y estructuras a `WLD-010`/`WLD-011`. |
| `CAT-001` | Aclara que lugar no equivale a edificio y que su catálogo no agota coberturas ni elementos lineales. |
| `CAT-002` | Incorpora los cuatro programas iniciales de edificio y sus accesos. |
| `UI-001` | Enlaza designaciones sobre áreas, líneas, accesos y transporte. |
| `UI-003` | Ubica agricultura, construcción y logística en sus familias ya existentes, sin nuevas prioridades. |
| `UI-006` | Amplía tipos de objetivo, ficha contextual y selector de método sin duplicar el motor. |
| `ARC-002` | Enlaza persistencia de transformaciones y materialización diferida de `WLD-010`. |
| `ARC-005` | Amplía entidades conceptuales de área, línea, nodo, estructura, anclaje, abertura, cierre y transporte. |
| `THR-001` | Aclara que medios y trabajos producen ruido causal, sin diseñar vehículos ni reabrir zombis. |
| `SCN-003` | Enlaza sin garantizar carretilla, carro, semillas, cultivo ni vehículo en las pertenencias iniciales. |
| `RDM-003` | Precisa el incremento «Generador semántico inicial y explotación de lugares» con el alcance aprobado por `CAT-004`/`CAT-005`. |

## 7. Confirmación de separación diseño/código

Esta entrega es exclusivamente documental. No se modificó `src/`,
`scenes/`, `tests/`, `project.godot`, ni se inicializó Node.js, TypeScript,
Next.js, React, Prisma o PostgreSQL. No se creó ningún dato ejecutable,
esquema, migración, endpoint ni prueba. Ningún documento de esta entrega
se marca `implemented`. `RDM-001` permanece `deprecated` sin reactivarse.

## 8. Preguntas abiertas

Ninguna propia de este documento: las preguntas abiertas que sobreviven a
`DESIGN-008` se registran en `docs/OPEN-QUESTIONS.md` y en la sección 7
de cada documento nuevo citado en la sección 2.
