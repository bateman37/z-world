---
id: WLD-010
title: Entorno mutable y construcción espacial
status: approved
canonical_for:
  - primitivas espaciales nodo, línea, área y estructura
  - capas semánticas de una zona de terreno
  - libertad física de transformación del terreno
  - transformaciones iniciales soportadas
  - construcción lineal, anclajes y red de perímetro
  - carretera y camino como elementos transformables
  - horizonte de terraformación y construcción libre
depends_on:
  - WLD-005
  - WLD-008
related:
  - WLD-002
  - WLD-004
  - WLD-011
  - SET-001
  - SET-005
  - SET-009
  - SET-011
  - CAT-004
  - ARC-005
  - ARC-006
  - DEC-0013
  - DISC-0007
---

## 1. Propósito

Cerrar el principio de que el entorno completo del mapa local —terreno,
agua, vegetación, carreteras, parcelas y estructuras lineales— es materia
jugable de primera clase, tan transformable y persistente como un
edificio. Define el modelo conceptual de nodo, línea, área y estructura,
las capas semánticas de una zona de terreno, la libertad física de
transformación, las transformaciones iniciales soportadas por el primer
catálogo, la construcción lineal entre anclajes, la red de perímetro y la
carretera transformable, junto con su horizonte máximo de terraformación
y construcción libre.

## 2. Principios que no deben romperse

> El mapa local no es un fondo sobre el que se colocan edificios. Terreno,
> agua, vegetación, carreteras, parcelas, edificios, estructuras lineales,
> instalaciones y objetos forman una realidad física persistente que puede
> conocerse, utilizarse, conectarse, degradarse, repararse, explotarse y
> transformarse mediante el mismo motor de acciones y trabajos.

- `Place` o «lugar» no equivale a `Building`. Un edificio es una estructura
  situada sobre terreno, no el contenedor universal de toda interacción.
- Un campo, una zona de bosque, una carretera, un pozo, un muro o un patio
  pueden ser objetivos significativos aunque no tengan habitaciones.
- Una parcela histórica limita y contextualiza la generación (ver
  [WLD-008 §3.2](WLD-008_local-procedural-map-generation.md#32-cadena-generativa-espacial)),
  pero no es una ranura de construcción que encierre al jugador. El
  jugador puede transformar y construir fuera de parcelas edificadas
  cuando la realidad física lo permita.
- Las etiquetas no conceden funciones: denominar «campo» a una zona no la
  cultiva; denominar «enfermería» a una habitación no la equipa (ver
  [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md)).
- Todo cambio material persiste, altera el mundo y puede generar efectos
  sobre circulación, uso, mantenimiento, defensa, producción, visibilidad,
  ruido, drenaje o riesgo cuando corresponda.
- La riqueza y complejidad pertenecen al mundo; la interfaz y los
  inventarios deben resumirla sin borrarla (ver
  [UI-004](../80-interface/UI-004_qualitative-capability-presentation.md)).

## 3. Modelo funcional

### 3.1 Primitivas espaciales

El modelo conceptual soporta, sin fijar nombres de clases ejecutables,
cuatro formas de entidad espacial interactuable:

| Forma conceptual | Ejemplos | Capacidades generales |
|---|---|---|
| Nodo o punto | Pozo, bomba, poste, árbol singular, depósito | Usar, inspeccionar, conectar, reparar, desmontar. |
| Línea o corredor | Muro, valla, carretera, camino, acequia, tubería | Recorrer, construir, bloquear, abrir, reparar, retirar, conectar. |
| Área | Campo, bosque, matorral, patio, parcela, zona de almacenamiento | Despejar, cultivar, explotar, excavar, asignar, construir sobre ella. |
| Estructura con huella | Casa, cabaña, taller, cobertizo, torre | Entrar, adaptar, ampliar, conectar, explotar, desmantelar. |

No se fija aquí si la implementación usa polígonos, polilíneas, grafos,
celdas o una combinación: la estructura espacial técnica sigue siendo
invisible y responsabilidad de
[WLD-008 §3.6](WLD-008_local-procedural-map-generation.md#36-estructura-espacial-técnica-invisible),
que este documento no duplica.

### 3.2 Capas semánticas de una zona de terreno

Una zona representa conceptualmente:

1. **Base física**: relieve, pendiente, suelo, roca, humedad y drenaje
   relevantes.
2. **Cobertura**: hierba, matorral, bosque, cultivo, asfalto, grava,
   barro, agua o escombros.
3. **Elementos existentes**: árboles, cercas, edificios, carreteras,
   canalizaciones, postes e instalaciones.
4. **Uso previo o actual**: campo, patio, camino, explotación, solar,
   almacenamiento o abandono.
5. **Transformaciones persistentes**: despejado, excavado, rellenado,
   nivelado, cultivado, fortificado o construido.
6. **Condición real**: estado físico independiente de lo que la
   comunidad sabe.
7. **Conocimiento**: información observada, inspeccionada, evaluada o
   desconocida, según los cinco estados de
   [WLD-002](WLD-002_local-exploration-and-information.md) y el
   `DiscoveryState` de [ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md).

Estas capas son responsabilidades conceptuales, no siete paneles
obligatorios ni un esquema técnico prematuro.

### 3.3 Identidad estable y persistencia

- Cada zona, elemento o estructura relevante conserva identidad estable.
- La generación diferida no vuelve a sortear el terreno ni su contenido.
- Despejar, cultivar, cortar, excavar, construir, desmontar o tapiar
  modifica permanentemente el estado causal (ver
  [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md)
  y [DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md)).
- La comunidad puede conocer mal una zona sin que la zona cambie para
  adaptarse a su conocimiento.
- Cargar partida, cambiar velocidad o descargar visualmente un sector no
  restaura el estado anterior.

### 3.4 Libertad de transformación con causalidad

El jugador puede intentar transformar cualquier terreno físicamente
adecuado. No existen «casillas de granja» ni «ranuras de construcción»
exclusivas. La libertad está condicionada por: pendiente; suelo y roca;
humedad y drenaje; espacio y colisiones; acceso de trabajadores y
materiales; estabilidad; herramientas; conocimientos; mano de obra y
tiempo; seguridad; mantenimiento posterior. El motor no responde «no
porque no es una parcela autorizada», sino «posible, imposible o todavía
no reconocido por estas causas», siguiendo el marco de posibilidad de
[ARC-006](../90-architecture/ARC-006_action-and-event-resolution-model.md).

### 3.5 Transformaciones iniciales soportadas

El primer catálogo (ver [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md))
contempla, como mínimo:

- despejar una pequeña área de matorral o residuos (`ENV-03`);
- preparar una parcela para cultivo (`ENV-02`, ver
  [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md));
- cortar o retirar recursos vegetales reconocidos;
- despejar un tramo de carretera bloqueado (`ENV-04`, ver sección 3.7);
- retirar de forma básica la función viaria de un tramo y convertirlo en
  terreno despejado (`ENV-04`, ver sección 3.7);
- construir un tramo sencillo de barrera lineal (ver sección 3.6).

Este documento no cierra cantidades, tiempos ni algoritmos exactos.

### 3.6 Construcción lineal, anclajes y red de perímetro

**Primer corte implementable**: una barrera sencilla, preferentemente de
madera, definida por una línea entre anclajes válidos. Un anclaje puede
ser: un punto estructural de un edificio; una esquina o tramo compatible
de muro; un poste construido; el extremo de otra barrera; un portón u
otro elemento de acceso; un accidente natural válido cuando el sistema
futuro lo admita. El trabajo requiere trazado válido, acceso, materiales,
herramientas, personas y tiempo; esta entrega no fija longitud máxima ni
costes exactos.

**Red de cierre, no rectángulo mágico**: edificios, muros, vallas,
puertas, portones y posibles barreras naturales forman una red
topológica. Un recinto existe cuando la red produce un cierre físico
real; los muros exteriores de una casa pueden formar parte del perímetro.
Un hueco, portón abierto, puerta destruida o tramo roto conserva
vulnerabilidad. Dibujar una zona no construye ni cierra el perímetro;
cerrar el perímetro no lo limpia, vigila ni hace invulnerable. Las
amenazas pueden dañar cierres y crear brechas; demoler un edificio
utilizado como anclaje puede romper el perímetro. Un campo dentro del
recinto no se vuelve seguro si todavía contiene amenazas o accesos sin
controlar.

**Cruce con carreteras y caminos**: cuando una barrera cruza un corredor
existente, debe resolverse explícitamente una de estas opciones:
bloquearlo por completo; incorporar paso peatonal; incorporar portón para
carretillas o carros; incorporar portón para futuros animales o
vehículos; dejar paso vigilado; cambiar el trazado. Una muralla no
atraviesa visualmente una carretera manteniendo ambos usos sin abertura ni
consecuencia.

### 3.7 Carretera y camino como elementos transformables

La carretera no es una textura inmutable. El primer catálogo distingue al
menos: carretera o camino transitable; carretera obstaculizada o
degradada; carretera despejada de obstáculos; y un tramo cuya función
viaria se ha retirado de forma básica y queda como terreno despejado.
Acciones pertinentes: observar; inspeccionar superficie, bloqueo o
estado; despejar; reparar de manera básica cuando exista solución
soportada; bloquear deliberadamente; retirar o transformar de forma
básica el tramo.

Despejar un tramo bloqueado y retirar su función viaria son acciones
**distintas**: la primera conserva la carretera como carretera; la
segunda la elimina o degrada como ventaja de movimiento y la convierte en
terreno despejado.

### 3.8 Horizonte máximo

Debe documentarse, sin implementarse ahora, que en versiones posteriores
el jugador podrá: construir libremente graneros, carreteras, granjas,
campos y otros edificios; transformar cualquier terreno físicamente
adecuado; terraformar mediante excavación, aporte de tierra, arena u
otros materiales; nivelar pendientes; construir escaleras, rampas,
terrazas y muros de contención; levantar redes completas de perímetro;
definir líneas para muros, vallas, tuberías y caminos; definir áreas para
campos, patios o almacenamiento; definir huellas para edificios y
ampliaciones; y conectar funcionalmente construcciones entre sí. Las
plantillas serán ayudas opcionales, no los únicos lugares donde se puede
construir. La carretera podrá, en el futuro, excavarse, levantarse por
capas (superficie, base, drenaje, bordes, señales, barreras,
canalizaciones asociadas), repararse, ampliarse, estrecharse o
sustituirse, modificando movilidad, drenaje, ruido, trabajo, mantenimiento
y materiales recuperados. Documentar este horizonte no lo introduce en el
primer código.

## 4. Reglas aprobadas

- Terreno, agua, vegetación y carreteras son objetivos jugables de primera
  clase, nunca un fondo visual inmutable.
- Ninguna implementación puede exigir una «parcela autorizada» para
  permitir una transformación físicamente posible.
- Un recinto cerrado nunca implica automáticamente seguridad, limpieza ni
  vigilancia.
- Una barrera que cruza un corredor existente debe resolver
  explícitamente el cruce (sección 3.6); nunca queda como intersección
  visual sin consecuencia.
- Despejar una carretera y retirar su función viaria son acciones
  distintas con resultados distintos (sección 3.7).
- Las siete capas semánticas de la sección 3.2 son responsabilidades
  conceptuales, no un esquema técnico obligatorio.

## 5. Una sola gramática de acciones

Registra como principio obligatorio, compartido con
[WLD-011](WLD-011_openings-access-and-connectivity.md) y
[CAT-005](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md):

> Edificios, terreno, agua, carreteras, accesos, instalaciones y objetos
> declaran posibilidades contextuales sobre el mismo motor de órdenes,
> trabajos, requisitos, cooperación, resolución, resultados y
> persistencia. No existen motores paralelos por tipo de objetivo.

El recorte inicial declara objetivos concretos para: reconocer, observar,
inspeccionar, registrar/buscar, recoger, transportar, usar, reparar,
desmontar, despejar, preparar terreno, sembrar, cuidar, cosechar,
construir barrera, y abrir/cerrar/bloquear/reforzar/tapiar un acceso
cuando proceda. La regla de visibilidad ya aprobada por `UI-006` se
aplica sin excepción: posibilidad reconocida y ejecutable → disponible;
reconocida pero bloqueada → gris con motivo; no reconocida → ausente. No
redeclara las fórmulas de `ARC-006`–`ARC-008`: las enlaza y aplica sus
invariantes.

## 6. Interacciones con otros sistemas

- La generación espacial de terreno, agua, vegetación y red viaria que
  produce estas zonas se define en
  [WLD-008](WLD-008_local-procedural-map-generation.md).
- La generación semántica de edificios sobre estas zonas se define en
  [WLD-005](WLD-005_semantic-place-and-building-generation.md).
- El modelo de abertura, cierre y conectividad de las estructuras con
  huella se define en
  [WLD-011](WLD-011_openings-access-and-connectivity.md).
- El crecimiento del asentamiento sobre áreas, líneas, perímetros y
  accesos se define en
  [SET-001](../40-settlement/SET-001_settlement-growth.md).
- El ciclo agrícola básico sobre `ENV-02` se define en
  [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md).
- Los ocho perfiles iniciales que instancian estas primitivas se definen
  en [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md).
- Las entidades conceptuales de área, cobertura, elemento lineal, nodo,
  estructura, anclaje y transformación persistente se definen en
  [ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md).
- El procedimiento de resolución que ejecuta cada transformación se define
  en [ARC-006](../90-architecture/ARC-006_action-and-event-resolution-model.md).

## 7. Casos límite o riesgos

- Tratar una parcela histórica como ranura exclusiva de construcción
  contradice la sección 2.
- Permitir que un recinto «dibujado» se considere cerrado sin una red
  física real contradice la sección 3.6.
- Confundir despejar una carretera con retirar su función viaria
  contradice la sección 3.7.
- Cambiar una etiqueta («campo», «enfermería») sin transformar la realidad
  física contradice el principio central de la sección 2.

## 8. Preguntas abiertas

- Algoritmos geométricos exactos de trazado, excavación, nivelación y
  detección de recintos.
- Longitud máxima, costes exactos y tiempos de una barrera lineal.
- Anchuras métricas exactas de accesos y cruces con carreteras (ver
  [WLD-011](WLD-011_openings-access-and-connectivity.md)).
- Catálogo completo de cultivos, estaciones, fertilidad y rotación (ver
  [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md)).
- Catálogo y uso activo de animales de carga/tiro y vehículos.
- Extracción profunda por capas de carreteras.
- Editor funcional final de interiores y construcción completa de
  edificios nuevos.

## 9. Ejemplos no normativos

- Una barrera de madera construida entre dos esquinas de la casa mediana
  y un poste nuevo cierra parcialmente el patio trasero; si un portón
  queda abierto, el perímetro no se considera controlado aunque la
  geometría exterior forme un bucle cerrado.
- Un tramo de `ENV-04` bloqueado por un vehículo volcado puede despejarse
  sin perder su función viaria; el mismo tramo, si se decide levantar por
  completo, se convierte en terreno despejado y pierde su ventaja de
  movimiento.
