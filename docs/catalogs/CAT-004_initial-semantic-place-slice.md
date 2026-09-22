---
id: CAT-004
title: Primer catálogo implementable del mundo local
status: approved
canonical_for:
  - ocho perfiles iniciales del primer catálogo implementable
  - distinción entre perfil catalogado (CAT-001) y perfil ambiental de interacción
  - diferencia entre perfil soportado, variante e instancia
  - relación entre este catálogo y el catálogo máximo
  - declaración expresa de approved ≠ implemented
depends_on:
  - CAT-001
  - CAT-002
  - CAT-003
related:
  - WLD-005
  - WLD-008
  - WLD-009
  - WLD-010
  - CAT-005
  - RDM-003
  - DEC-0013
  - DISC-0007
---

## 1. Propósito

Aprobar, por decisión expresa de Dennis (`DESIGN-008`), el primer catálogo
implementable del mundo local de Z-World: exactamente ocho perfiles
iniciales —cuatro edificios y cuatro perfiles no exclusivamente
edificatorios— que una futura entrega de implementación web podrá usar
como alcance concreto de programación. Este documento reemplaza la
propuesta `draft` anterior (un subconjunto de cinco lugares) y cierra la
pregunta «si se aprueba `CAT-004`» de `docs/OPEN-QUESTIONS.md`.

`approved` en este documento significa **contrato de contenido aprobado
para futuras entregas de implementación**, nunca `implemented`: no existe
todavía generador, mapa, edificio, objeto, agricultura, acceso ni
transporte reales (ver [DEC-0006](../decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md)
y [DEC-0013](../decisions/DEC-0013_implementable-catalog-and-mutable-world.md)).
Una entrega de implementación futura seguirá necesitando su propio prompt
de programación.

## 2. Principios que no deben romperse

- Este catálogo es deliberadamente pequeño y profundo: demuestra el modelo
  semántico completo (arquetipo → programa → grafo → instalaciones →
  ocupantes → contenido → historia → saqueo → estado) y el modelo de
  entorno moldeable (nodo, línea, área y estructura) sin intentar cubrir el
  catálogo máximo de [CAT-001](CAT-001_maximum-place-catalog.md).
- «Lugar» no equivale a «edificio»: cuatro de los ocho perfiles son áreas,
  líneas o nodos de terreno, no edificaciones (ver
  [WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md)).
- Un perfil **soportado** (esta tabla) es distinto de una **variante**
  concreta de ese perfil (por ejemplo, una casa mediana con tres
  dormitorios frente a otra con dos) y de una **instancia** generada en una
  semilla concreta (una casa mediana concreta con su historia, contenido y
  estado). El catálogo aprueba perfiles, no instancias.
- Ningún perfil de esta tabla se presenta como plenamente interactuable si
  su comportamiento todavía no está soportado por una entrega de código
  real (ver [WLD-009 §3.7](../20-world/WLD-009_initial-mountain-village-profile.md#37-relación-con-cat-004)).
- Añadir farmacia, iglesia, hospital, gasolinera, granja ganadera,
  comisaría o cualquier otra localización especial a este primer catálogo
  contradice la profundidad-antes-que-amplitud de esta entrega; esos
  arquetipos permanecen en el catálogo máximo.

## 3. Modelo funcional

### 3.1 Los ocho perfiles iniciales aprobados

| Nº | Perfil inicial | Naturaleza | ID | Cobertura sistémica principal |
|---:|---|---|---|---|
| 1 | Casa familiar mediana | Edificio (estructura con huella) | `RES-10` (CAT-001) | Refugio, programa residencial, mobiliario, instalaciones, almacenamiento y múltiples accesos posibles. |
| 2 | Cabaña | Edificio (estructura con huella) | `RES-17` (CAT-001) | Programa pequeño, refugio provisional y pocas estancias. |
| 3 | Supermercado pequeño | Edificio (estructura con huella) | `COM-02` (CAT-001) | Comercio, estanterías, almacén, alimento, saqueo y acceso de carga. |
| 4 | Taller mecánico | Edificio (estructura con huella) | `TAL-01` (CAT-001) | Perfil profesional, herramientas, equipos, reparación, desmontaje y portón ancho. |
| 5 | Fuente local de agua | Nodo (recurso natural/técnico) | `ENV-01` (instancia un arquetipo de CAT-001: `AGU-01`, `AGU-02` o `AGU-15`) | Captación, calidad, recipientes, acarreo, uso e instalación reparable cuando exista. |
| 6 | Campo o parcela abierta | Área | `ENV-02` (perfil ambiental nuevo) | Inspección de suelo, limpieza, preparación, cultivo, cosecha y construcción futura. |
| 7 | Zona de bosque o matorral | Área | `ENV-03` (perfil ambiental nuevo) | Recolección, madera, despeje, visibilidad y transformación de cobertura. |
| 8 | Tramo de carretera o camino | Línea/corredor | `ENV-04` (perfil ambiental nuevo) | Movimiento, obstáculos, despeje, reparación y transformación futura. |

Los perfiles 1–4 usan íntegramente los IDs ya existentes de
[CAT-001](CAT-001_maximum-place-catalog.md): no se renumeran ni se
reutilizan para representar otra cosa.

### 3.2 Convención de IDs para perfiles ambientales (`ENV-*`)

Campo, bosque/matorral y carretera no son arquetipos de edificio de
[CAT-001](CAT-001_maximum-place-catalog.md): son capas o elementos
espaciales de terreno (área y línea) según el modelo de
[WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md).
`CAT-001` no reserva un prefijo para ellos, por lo que este documento
define una convención explícita nueva, sin colisión con los prefijos ya
usados por las 22 familias A–V (`RES`, `COM`, `HOS`, `SAN`, `EDU`, `CUL`,
`ADM`, `SEG`, `TAL`, `IND`, `LOG`, `AGR`, `GAN`, `FOR`, `AGU`, `ENE`,
`TEL`, `TRA`, `OCI`, `REL`, `ESP`):

- Prefijo `ENV` (perfil ambiental de interacción), numeración `NN` de dos
  cifras, IDs estables una vez asignados.
- `ENV-01` es un caso especial: no crea un arquetipo nuevo, sino que
  etiqueta el **perfil funcional** «Fuente local de agua», que instancia
  coherentemente uno de los arquetipos de nodo/instalación de agua ya
  existentes en `CAT-001` (`AGU-01` Pozo, `AGU-02` Manantial acondicionado
  o `AGU-15` Captación de agua), sin multiplicar motores de interacción ni
  crear un ID duplicado para el mismo objeto físico. La instancia concreta
  conserva la identidad y el ID de `CAT-001` que le corresponda; `ENV-01`
  identifica el perfil de interacción común a las tres.
- `ENV-02` (Campo o parcela abierta), `ENV-03` (Zona de bosque o
  matorral) y `ENV-04` (Tramo de carretera o camino) son perfiles
  ambientales genuinamente nuevos: no tienen equivalente de área/línea en
  `CAT-001`, que solo cataloga estructuras con programa de estancias.
  Relación explícita con `CAT-001`: un campo o una zona de bosque pueden
  contener o estar junto a arquetipos catalogados (por ejemplo `AGR-*` o
  `FOR-*`) sin ser ellos mismos ese arquetipo; una zona de bosque sin
  ninguna construcción sigue siendo `ENV-03` y no requiere un ID de
  `CAT-001`.
- Cualquier perfil ambiental adicional que una entrega futura necesite
  continúa esta numeración (`ENV-05`, `ENV-06`, …) sin reutilizar `ENV-01`
  a `ENV-04`.

### 3.3 Perfil catalogado frente a perfil ambiental de interacción

- Un **arquetipo de lugar catalogado** (`RES-10`, `COM-02`, `TAL-01`,
  `AGU-01`, etc.) tiene programa de estancias, grafo funcional y contenido
  generados según [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md)
  y [CAT-002](CAT-002_rooms-modules-and-building-systems.md).
- Un **perfil ambiental de interacción** (`ENV-02`, `ENV-03`, `ENV-04`) es
  una capa o elemento espacial de terreno según
  [WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md):
  tiene capas semánticas de terreno, cobertura y transformación, pero no
  programa de estancias ni grafo funcional de edificio.
- Ambos comparten la misma gramática de acciones y posibilidades (ver
  [WLD-010 §5](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md)
  y [ARC-006](../90-architecture/ARC-006_action-and-event-resolution-model.md)):
  ningún perfil ambiental es un fondo visual inerte.

### 3.4 Profundidad antes que amplitud

Estos ocho perfiles demuestran los sistemas completos: generación
semántica, transformación de terreno, acceso, transporte, agricultura y
desmontaje de objetos. No se añade ningún perfil adicional solo para dar
variedad. El mismo perfil puede producir múltiples instancias mediante
dimensiones, historia, estado, saqueo, contenido, orientación, accesos,
ocupantes anteriores y semilla, sin convertirse en otro tipo de lugar (ver
sección 2).

### 3.5 Relación con el catálogo máximo

- Los perfiles 1–4 son un subconjunto explícito de
  [CAT-001](CAT-001_maximum-place-catalog.md); el resto de las 22 familias
  A–V permanece como horizonte de referencia no implementado.
- Los programas de estancias de los cuatro edificios iniciales se definen
  en [CAT-002 §3.2](CAT-002_rooms-modules-and-building-systems.md), que
  esta entrega amplía con los cuatro programas iniciales concretos (ver
  [CAT-002](CAT-002_rooms-modules-and-building-systems.md), sección
  «Cuatro programas iniciales de edificio»).
- Los objetos, recursos y medios de transporte que equipan estos ocho
  perfiles se aprueban en
  [CAT-005](CAT-005_initial-object-resource-and-transport-slice.md).
- El presupuesto numérico del mapa local (`3 × 3 km`, `55–85`
  construcciones) sigue siendo responsabilidad de
  [WLD-009](../20-world/WLD-009_initial-mountain-village-profile.md) y no
  exige `55–85` clases de edificio distintas: reutiliza estos ocho
  perfiles y sus variaciones.

## 4. Reglas aprobadas

- El primer catálogo implementable contiene exactamente los ocho perfiles
  de la sección 3.1; ninguna entrega de implementación puede añadir un
  noveno perfil sin una nueva decisión documental.
- Los cuatro edificios conservan los IDs `RES-10`, `RES-17`, `COM-02` y
  `TAL-01` de `CAT-001`, sin renumerar.
- Los perfiles ambientales nuevos usan la convención `ENV-NN` de la
  sección 3.2; ningún documento futuro reutiliza `ENV-01` a `ENV-04` para
  otra cosa.
- `CAT-004` pasa de `draft` a `approved` por esta decisión expresa; no pasa
  a `implemented` por esta misma entrega, que es exclusivamente
  documental.
- Un perfil no soportado por una entrega de código concreta no se presenta
  al jugador como interior o entorno plenamente interactuable.

## 5. Interacciones con otros sistemas

- El programa de estancias, mobiliario e instalaciones de los cuatro
  edificios iniciales se definen en
  [CAT-002](CAT-002_rooms-modules-and-building-systems.md).
- Los ocupantes, hogares y perfiles de negocio que dan coherencia al
  contenido de `RES-10`, `RES-17`, `COM-02` y `TAL-01` se definen en
  [CAT-003](CAT-003_occupants-professions-hobbies-and-traits.md).
- El modelo de nodo, línea, área y estructura, las capas semánticas de
  terreno y la transformación persistente de `ENV-01` a `ENV-04` se
  definen en
  [WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md).
- El modelo de abertura, cierre y conectividad de los cuatro edificios se
  define en
  [WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md).
- Los objetos, materiales y medios de transporte que equipan estos ocho
  perfiles se aprueban en
  [CAT-005](CAT-005_initial-object-resource-and-transport-slice.md).
- La cadena generativa que instancia estos perfiles se define en
  [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md)
  y [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md).
- La entrega de implementación que use este catálogo como alcance concreto
  es responsabilidad de
  [RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md),
  incremento «Generador semántico inicial y explotación de lugares», con
  su propio prompt.
- La decisión transversal que respalda esta aprobación es
  [DEC-0013](../decisions/DEC-0013_implementable-catalog-and-mutable-world.md);
  la trazabilidad completa es
  [DISC-0007](../discovery/DISC-0007_implementable-catalog-and-mutable-world-traceability.md).

## 6. Casos límite o riesgos

- Confundir esta aprobación con `implemented` rompería
  [DEC-0006](../decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md) y
  [DEC-0013](../decisions/DEC-0013_implementable-catalog-and-mutable-world.md).
- Tratar `ENV-02`, `ENV-03` o `ENV-04` como fondo visual inerte contradice
  el principio central de [WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md).
- Añadir un noveno perfil (farmacia, iglesia, hospital, gasolinera, granja
  ganadera, comisaría u otra localización especial) sin una nueva decisión
  documental rompe la profundidad-antes-que-amplitud de la sección 3.4.
- Reutilizar `AGU-01`, `AGU-02` o `AGU-15` como si fueran IDs distintos de
  `ENV-01` duplicaría innecesariamente la identidad de la fuente de agua.

## 7. Preguntas abiertas

- Qué arquetipo concreto de agua (`AGU-01`, `AGU-02` o `AGU-15`) instancia
  `ENV-01` en una semilla dada: decisión del generador, no de este
  catálogo.
- Si una futura ampliación del catálogo debe asignar `ENV-05` en adelante
  a otros elementos de terreno (por ejemplo un patio o una zona de
  almacenamiento exterior) o si algunos de esos casos deben tratarse como
  variantes de `ENV-02`.

## 8. Ejemplos no normativos

- Dos casas familiares medianas (`RES-10`) generadas en la misma semilla
  pueden diferir en número de dormitorios, accesos, historia, contenido y
  estado sin dejar de ser el mismo perfil soportado.
- Una `ENV-04` (tramo de carretera) puede cruzar una `ENV-02` (campo)
  sin que eso convierta el campo en carretera ni la carretera en campo:
  cada perfil conserva su propia capa semántica.
