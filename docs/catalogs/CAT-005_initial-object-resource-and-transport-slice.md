---
id: CAT-005
title: Primer catálogo de objetos, recursos y transporte
status: approved
canonical_for:
  - familias de comportamiento de objeto iniciales y variantes aprobadas
  - objetos demostradores profundos (armario, frigorífico, bomba de agua, carretilla/carro)
  - subconjunto inicial de recursos y materiales
  - medios de transporte activos en el primer catálogo
  - relación entre este recorte y el horizonte máximo de SET-008
depends_on:
  - SET-008
  - SET-009
  - CAT-004
related:
  - SET-003
  - SET-007
  - SET-010
  - WLD-011
  - ARC-006
  - DEC-0013
  - DISC-0007
---

## 1. Propósito

Aprobar el primer catálogo implementable de objetos completos, familias
logísticas de recursos y medios de transporte de Z-World, como
complemento de [CAT-004](CAT-004_initial-semantic-place-slice.md): un
recorte pequeño en mecánicas y rico en variantes, que converge hacia el
horizonte máximo de [SET-008](../40-settlement/SET-008_object-model-and-logistics-families.md)
sin sustituirlo por una bolsa universal de recursos. `approved` significa
contrato de contenido aprobado para futuras entregas de implementación,
nunca `implemented` (ver
[DEC-0013](../decisions/DEC-0013_implementable-catalog-and-mutable-world.md)).

## 2. Principios que no deben romperse

- No se programa un sistema distinto por objeto: cada objeto pertenece a
  una familia de comportamiento con una sola gramática de acciones (ver
  [WLD-010 §5](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md)
  y [ARC-006](../90-architecture/ARC-006_action-and-event-resolution-model.md)).
- El objeto existe antes que su recurso (ver
  [SET-008 §2](../40-settlement/SET-008_object-model-and-logistics-families.md)):
  este documento no invierte esa regla.
- «Materiales de reparación» deja de ser una pila universal capaz de
  reparar indistintamente cualquier cosa; se reconcilia con
  [SET-003](../40-settlement/SET-003_resources-logistics-and-condition.md)
  en la sección 5.
- Este recorte no elimina ninguna familia del horizonte máximo de
  [SET-008](../40-settlement/SET-008_object-model-and-logistics-families.md);
  simplemente no todas necesitan comportamiento activo en el primer
  catálogo.
- Animales de carga/tiro y vehículos no se activan en este catálogo; se
  documentan como horizonte en [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md).

## 3. Modelo funcional

### 3.1 Familias de comportamiento iniciales

| Familia funcional | Variantes iniciales aprobadas |
|---|---|
| Recipiente personal de líquido | Botella, cantimplora. |
| Recipiente de trabajo | Cubo, bidón o garrafa. |
| Contenedor de transporte | Mochila, saco, caja. |
| Contenedor/mobiliario de almacenamiento | Armario, estantería, caja de almacén. |
| Consumible localizado | Agua, alimento fresco, alimento conservado, material de cura, semillas. |
| Fuente portátil de luz | Linterna o farol. |
| Herramienta/arma improvisada | Cuchillo, martillo, palanca, hacha de mano, sierra, pala o azada. |
| Conjunto de herramientas | Básicas, carpintería, mecánica o agricultura, dentro del recorte soportado. |
| Descanso | Colchón o cama sencilla. |
| Puesto de trabajo | Banco de trabajo. |
| Aparato técnico completo | Frigorífico. |
| Instalación técnica | Bomba de agua. |
| Cierre instalado | Puerta o portón (ver [WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md)). |
| Transporte humano | Carretilla y carro de compra/mano. |

Cada familia comparte una sola gramática de acciones y posibilidades (ver
sección 3.4); los nombres exactos de variantes pueden ajustarse en una
entrega técnica sin eliminar ninguna conducta cubierta por esta tabla.

### 3.2 Objetos demostradores profundos

**Armario o estantería** (contenedor/mobiliario de almacenamiento):
contiene objetos; puede registrarse; puede utilizarse como almacenamiento;
puede vaciarse; puede trasladarse si tamaño, ruta y equipo lo permiten
(ver [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md));
puede repararse; puede desmontarse en materiales coherentes (ver
[SET-009 §3.4](../40-settlement/SET-009_disassembly-and-world-transformation.md#34-desmontaje-de-objetos)).

**Frigorífico** (aparato técnico completo): puede observarse e
inspeccionarse; conserva identidad y estado; puede usarse como
almacenamiento sin refrigeración; la refrigeración requiere condiciones
reales futuras (electricidad funcional, fuera de este recorte); puede
repararse cuando se reconozcan causa y medios; puede trasladarse mediante
ruta compatible; puede desmontarse selectivamente; puede producir chapa,
cableado, componentes eléctricos I y motor eléctrico II coherentes con su
estado, sin fijar cantidades (ver el ejemplo ya cerrado en
[SET-009 §3.8](../40-settlement/SET-009_disassembly-and-world-transformation.md#38-ejemplos-de-transformación));
desmontarlo elimina su función futura como frigorífico.

**Bomba de agua** (instalación técnica): puede formar parte de una fuente
o instalación (perfil `ENV-01` de
[CAT-004](CAT-004_initial-semantic-place-slice.md)); puede probarse,
diagnosticarse, repararse, desmontarse o sustituirse; conecta objeto,
instalación, agua, herramienta, conocimiento y terreno; no produce agua si
la fuente, la conexión o la energía necesaria no existen.

**Carretilla o carro** (transporte humano): es un objeto completo
localizado; debe recuperarse y llevarse al origen de la carga; tiene
condición, capacidad, compatibilidad de terreno y ruta; puede repararse,
abandonarse o quedar bloqueado; no es una bonificación abstracta a
Logística (ver [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md)).

### 3.3 Identidad, condición y transformación de todo objeto completo

Todo objeto completo relevante de este catálogo conserva, cuando aplique:
ID estable; ubicación; propietario o reserva; peso y volumen/bulto;
condición; calidad; función; capacidad; portabilidad; requisitos de uso;
perfil de reparación; perfil de desmontaje; contenido o capacidad de
contener; valor de conocimiento o narrativo. No todos los campos se
muestran siempre ni todas las variantes necesitan todos los atributos (ver
[SET-008 §3.2](../40-settlement/SET-008_object-model-and-logistics-families.md#32-modelo-conceptual-de-objeto)).

### 3.4 Una sola gramática de acciones

El recorte declara objetivos concretos para: reconocer, observar,
inspeccionar, registrar/buscar, recoger, transportar, usar, reparar,
desmontar, despejar, preparar terreno, sembrar, cuidar, cosechar,
construir barrera, y abrir/cerrar/bloquear/reforzar/tapiar un acceso
cuando proceda (ver [WLD-010 §5](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md)
y [WLD-011 §3.4](../20-world/WLD-011_openings-access-and-connectivity.md)).
La regla de visibilidad ya aprobada se aplica sin excepción: posibilidad
reconocida y ejecutable → disponible; reconocida pero bloqueada → gris con
motivo; no reconocida → ausente (ver
[UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md)).

## 4. Subconjunto inicial de recursos y materiales

### 4.1 Principio de reconciliación

El recorte inicial usa menos familias que el horizonte máximo de
[SET-008 §3.3](../40-settlement/SET-008_object-model-and-logistics-families.md#33-familias-logísticas-de-horizonte-máximo),
pero no reemplaza el sistema profundo por una bolsa universal: conserva
objetos completos en el mundo, familias logísticas comprensibles al
perder relevancia la identidad, grado técnico separado de condición y
calidad, desmontaje como origen causal de componentes, materiales
localizados y herramientas como objetos funcionales.

### 4.2 Subconjunto inicial mínimo

El catálogo inicial representa: agua; alimento fresco; alimento
conservado; semillas; material de cura; madera y tablones; chapa o metal
aprovechable; cableado; componentes eléctricos I; piezas mecánicas I;
motores eléctricos II cuando resulten de los objetos soportados (por
ejemplo, del frigorífico); y herramientas básicas como objetos o
conjuntos con condición.

Tela/prendas, analgésicos, antibióticos, otros grados de placas
electrónicas, motores y baterías, motores de combustión, munición y
demás familias del horizonte de
[SET-008 §3.3](../40-settlement/SET-008_object-model-and-logistics-families.md#33-familias-logísticas-de-horizonte-máximo)
no desaparecen: sencillamente no necesitan comportamiento activo en este
primer recorte.

### 4.3 Fin del recurso mágico «materiales de reparación»

Reconciliación obligatoria con
[SET-003 §3.2](../40-settlement/SET-003_resources-logistics-and-condition.md#32-recursos-rastreados-en-la-primera-versión):

- «Materiales de reparación» puede seguir existiendo como filtro, resumen
  o cálculo contextual de existencias compatibles en la interfaz, nunca
  como una pila universal capaz de reparar indistintamente una puerta, una
  bomba, un frigorífico o una carretera.
- Cada solución de reparación declara sus materiales y componentes
  compatibles concretos (chapa, cableado, madera y tablones, piezas
  mecánicas I, componentes eléctricos I, etc.), según
  [SET-008 §3.8](../40-settlement/SET-008_object-model-and-logistics-families.md#38-reglas-de-sustitución-entre-grados).
- Una primera interfaz puede agrupar estas familias bajo una etiqueta
  legible («materiales de reparación» como resumen visible), pero la
  fuente física que se consume sigue siendo concreta.
- El recurso agregado «materiales de reparación» de los nueve rastreados
  en la primera versión de
  [SET-003 §3.2](../40-settlement/SET-003_resources-logistics-and-condition.md#32-recursos-rastreados-en-la-primera-versión)
  (heredado del prototipo histórico Godot) queda documentado como el
  origen de esta transición, no como el estado real de la nueva línea web,
  que todavía no implementa ningún recurso.

### 4.4 Almacenamiento

La capacidad de almacenamiento procede de contenedores, mobiliario,
estancias y zonas reales (armario, estantería, caja de almacén, despensa,
almacén trasero del supermercado), no de un recurso consumible denominado
«almacenaje». Un almacén comunitario se crea designando y acondicionando
espacios y contenedores reales; los objetos no se teletransportan a una
reserva global al descubrirse (ver [SET-010 §3.8](../40-settlement/SET-010_local-hauling-and-transport.md#38-logística-por-etapas-y-puntos-de-transferencia)).

## 5. Medios de transporte activos

Los cinco métodos activos de transporte del primer recorte (a pulso,
recipiente/equipamiento personal, porte coordinado, carretilla, carro de
compra/mano) y el horizonte de otros métodos, ayudas mecánicas, animales
y vehículos son responsabilidad canónica de
[SET-010](../40-settlement/SET-010_local-hauling-and-transport.md); este
documento solo declara que la carretilla y el carro pertenecen a la
familia «Transporte humano» de la sección 3.1 como objetos completos, no
como bonificaciones abstractas.

## 6. Reglas aprobadas

- Las catorce familias de comportamiento de la sección 3.1 son el
  catálogo inicial aprobado; ninguna implementación puede sustituir una
  familia por un sistema distinto sin una nueva decisión.
- Los cuatro objetos demostradores de la sección 3.2 deben soportar
  íntegramente los recorridos descritos; ninguna implementación puede
  presentarlos como decorativos.
- «Materiales de reparación» nunca vuelve a implementarse como pila
  universal (sección 4.3).
- El almacenamiento siempre procede de contenedores y espacios físicos
  reales (sección 4.4).
- Ningún documento de este catálogo marca un objeto, recurso o medio de
  transporte como `implemented`.

## 7. Interacciones con otros sistemas

- El modelo de objeto completo, sus atributos y el horizonte máximo de
  familias logísticas se definen en
  [SET-008](../40-settlement/SET-008_object-model-and-logistics-families.md),
  que conserva su estado `draft` en lo que respecta a su horizonte máximo
  todavía abierto.
- El desmontaje de objetos completos se define en
  [SET-009](../40-settlement/SET-009_disassembly-and-world-transformation.md).
- El transporte local y la logística por etapas se definen en
  [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md).
- La agricultura básica que produce y consume semillas y alimento fresco
  se define en [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md).
- Las cierres instalados (puerta, portón) y su topología de acceso se
  definen en [WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md).
- Los ocho perfiles de lugar que estos objetos equipan se definen en
  [CAT-004](CAT-004_initial-semantic-place-slice.md).
- El procedimiento de resolución que ejecuta cada acción se define en
  [ARC-006](../90-architecture/ARC-006_action-and-event-resolution-model.md)–[ARC-008](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md).

## 8. Casos límite o riesgos

- Reintroducir «materiales de reparación» como pila universal rompería la
  sección 4.3 y [SET-008 §3.8](../40-settlement/SET-008_object-model-and-logistics-families.md#38-reglas-de-sustitución-entre-grados).
- Tratar la carretilla o el carro como multiplicador abstracto de
  velocidad contradice [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md).
- Presentar un objeto no soportado (por ejemplo una batería o un motor de
  combustión) como disponible en este primer catálogo excede el
  subconjunto de la sección 4.2.

## 9. Preguntas abiertas

- Cifras exactas de peso, volumen, capacidad y condición de cada objeto y
  familia.
- Interfaz definitiva de desmontaje y de resumen de «materiales de
  reparación».
- Si un especialista debe conservar identidad individual para algún
  conjunto de herramientas (ver [SET-008 §5](../40-settlement/SET-008_object-model-and-logistics-families.md#5-herramientas),
  todavía abierta).

## 10. Ejemplos no normativos

- Un armario recuperado de `RES-10` puede trasladarse a la despensa del
  refugio provisional si la ruta y los accesos lo permiten; si no cabe por
  una puerta estrecha, la orden explica el bloqueo sin teletransportarlo.
- Desmontar la bomba de agua de `ENV-01` sin comprender la instalación
  puede dejar la fuente sin poder producir agua hasta que alguien con
  conocimiento la repare o sustituya.
