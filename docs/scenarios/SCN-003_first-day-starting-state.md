---
id: SCN-003
title: Estado de llegada y primera noche
status: approved
canonical_for:
  - momento exacto de llegada y banda meteorológica inicial
  - estado físico tras la marcha de cuatro días
  - refugio provisional garantizado y candidatos a asentamiento
  - pertenencias, armas cuerpo a cuerpo y carencias iniciales del grupo
  - garantías internas de una semilla válida
  - amenaza zombi inicial contenida y presencia humana incierta
  - presiones simultáneas de las primeras horas
depends_on:
  - SCN-001
  - SCN-002
related:
  - WLD-009
  - WLD-002
  - WLD-005
  - SET-001
  - SET-003
  - THR-001
  - SOC-003
  - ARC-002
---

## 1. Propósito

Fijar el estado concreto y reproducible en el que empieza cada partida de
[SCN-001](SCN-001_mountain-village-arrival.md): el momento exacto de
llegada, el estado físico de la cohorte de
[SCN-002](SCN-002_initial-survivor-cohort.md), sus pertenencias y armas,
el refugio provisional garantizado, las carencias iniciales, las
garantías que toda semilla válida debe cumplir, la amenaza zombi inicial
contenida y limpiable, la presencia humana regional incierta, y las
presiones simultáneas de las primeras horas sin convertirlas en misión
lineal.

## 2. Principios que no deben romperse

- Este documento fija **condiciones iniciales y garantías**, nunca una
  secuencia obligatoria de tareas, un orden óptimo o una lista de
  objetivos que el jugador deba completar.
- Ninguna garantía de esta entrega equivale a información gratuita para
  el grupo: el mundo cumple un contrato mínimo, pero los personajes no
  reciben conocimiento omnisciente sobre dónde está cada solución (ver
  sección 3.7).
- El fracaso parcial de la primera noche no implica automáticamente
  «game over»: genera consecuencias persistentes, coherente con
  [WLD-002](../20-world/WLD-002_local-exploration-and-information.md) y
  [NAR-001](../70-narrative/NAR-001_emergent-narrative.md).
- La amenaza inicial debe ser real y detectable, nunca instantánea o
  imposible de evitar antes de la primera decisión (sección 3.6).

## 3. Modelo funcional

### 3.1 Momento exacto de llegada

Fijo para este escenario:

```text
Momento de llegada respecto al colapso: aproximadamente seis semanas después del colapso general
Estación: inicio de primavera
Periodo: primera mitad de abril
Día de juego: Día 1
Hora de llegada: 17:30
Desplazamiento previo a pie: cuatro días
Luz útil restante: aproximadamente dos horas, condicionada por valle, relieve y tiempo
```

No se fija un año, una localidad real ni una fecha de calendario real: el
perfil es ficticio, coherente con
[WLD-008 §2](../20-world/WLD-008_local-procedural-map-generation.md#2-principios-que-no-deben-romperse).

**Banda meteorológica inicial.** El generador escoge dentro de una banda
templada-fría de montaña: temperatura diurna aproximada `8–12 °C`,
descenso nocturno aproximado hacia `2–5 °C`, suelo húmedo o lluvia
reciente como estado habitual, con variantes posibles de frío y seco,
nubosidad, llovizna, niebla ligera o lluvia reciente. Este escenario
estándar **no** puede comenzar con tormenta extrema, nevada intensa,
inundación súbita inevitable, temperatura letal inmediata, ni ningún
fenómeno capaz de convertir la primera decisión en irrelevante. Estas
situaciones podrán existir en configuraciones futuras, otros escenarios o
eventos posteriores, sin abrirse en esta entrega.

**Estado temporal del colapso.** Seis semanas se reflejan causalmente,
sin convertirse en una cronología universal rígida para todos los
lugares (el estado concreto depende de la historia generada por
[WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md)
y
[WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md)):
redes y servicios degradados o caídos; parte de la comida fresca ya
perdida; vehículos abandonados y rutas alteradas; saqueo desigual y
espacialmente correlacionado; edificios cerrados, forzados, vacíos,
ocupados o parcialmente utilizados; rastros humanos posteriores al
colapso; todavía existen objetos y recursos urbanos relevantes; la
transición completa a soluciones rurales todavía no está resuelta.

### 3.2 Cuatro días de marcha y estado físico

El desplazamiento previo a pie tiene consecuencias reales sobre los seis
protagonistas de [SCN-002](SCN-002_initial-survivor-cohort.md):

- todos presentan cansancio significativo;
- hambre y sed moderadas;
- al menos una persona tiene una afección menor, como ampollas, corte,
  torcedura leve, resfriado, dolor o agotamiento;
- otra persona está especialmente fatigada, mojada, fría o afectada
  emocionalmente;
- nadie empieza condenado a morir en pocas horas por una condición
  generada inevitablemente;
- el estado reduce disponibilidad, ritmo o disposición de manera
  pertinente, sin ser puramente cosmético (ver
  [CHR-001 §3](../30-characters/CHR-001_character-model.md#3-modelo-funcional),
  fila «Estado actual»);
- las relaciones de
  [SCN-002 §3.4](SCN-002_initial-survivor-cohort.md#34-red-procedural-de-relaciones)
  pueden afectar quién acepta separarse, vigilar o entrar primero.

No se fija quién sufre cada estado: debe derivarse de biografía,
trayecto y semilla, no de una asignación fija por escenario.

### 3.3 Punto de llegada

El grupo aparece en el borde operativo del mapa local (ver
[WLD-009 §3.1](../20-world/WLD-009_initial-mountain-village-profile.md#31-extensión-y-forma))
o en un acceso coherente con sus cuatro días de marcha. Conoce su
posición inmediata, el trayecto visible por el que llega, algunas
siluetas o indicios cercanos, y la existencia aparente de un edificio que
podría servir esa noche. No conoce automáticamente el pueblo, los
interiores, los zombis, las fuentes de agua segura ni los mejores
refugios: la niebla y los cinco estados de información de
[WLD-002](../20-world/WLD-002_local-exploration-and-information.md)
aplican desde el primer instante.

### 3.4 Refugio provisional garantizado

Entre aproximadamente `100` y `250` metros del punto de llegada, el
generador garantiza un edificio que **puede llegar a servir** como
refugio provisional tras reconocimiento y trabajo razonables. Puede ser
una casa pequeña, cabaña, vivienda rural, local o edificio equivalente
soportado por el catálogo de
[CAT-001](../catalogs/CAT-001_maximum-place-catalog.md). Como todo
edificio del escenario, se genera por el modelo de estancias de
[WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md);
no es una excepción diseñada a mano.

Debe cumplir causalmente:

- seco o parcialmente seco;
- al menos un acceso que pueda cerrarse o bloquearse;
- una salida secundaria posible o creable con trabajo razonable;
- espacio mínimo para que seis personas sobrevivan una noche;
- ninguna amenaza inevitable imposible de detectar o evitar;
- al menos una carencia significativa, por ejemplo ventana rota, puerta
  débil, suciedad o humedad, mobiliario bloqueando, falta de camas, frío,
  poco almacenamiento, olor o señal inquietante, instalación inutilizada,
  o interior parcialmente desconocido.

El edificio **no** se entrega como «seguro»: puede y debe reconocerse,
inspeccionarse, abrirse, limpiarse, cerrarse y organizarse mediante las
reglas normales de
[WLD-002](../20-world/WLD-002_local-exploration-and-information.md) y
[UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md).
El jugador puede ignorarlo, dormir fuera, buscar otro o asumir más
riesgo: la garantía asegura una opción razonable, no una obligación.

El generador **no fabrica** una «starter house» incoherentemente
perfecta: genera el mundo normalmente y valida que, dadas las personas,
distancias, accesos y condiciones, exista al menos un edificio real que
cumpla este contrato. Si una semilla no lo cumple, se corrige o
regenera antes de iniciar la partida (ver sección 3.7); no se
teletransportan recursos ni se cambia el contenido después de que el
mundo exista, coherente con
[ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md).

**Candidatos a asentamiento.** Durante los primeros uno a tres días
pueden descubrirse entre tres y cinco candidatos con ventajas y costes
diferentes: casa grande, taller o nave pequeña, granja o vivienda
periférica, edificio comunitario, edificio elevado o bien situado.
Ninguno es universalmente mejor: la diferencia entre refugio provisional
y asentamiento elegido, y los criterios de evaluación de cada candidato,
son responsabilidad canónica de
[SET-001 §3.1](../40-settlement/SET-001_settlement-growth.md#31-refugio-provisional-frente-a-asentamiento-elegido),
que este documento no repite. El grupo puede permanecer indefinidamente
en el refugio provisional si decide transformarlo; no se impone una
misión de mudanza.

### 3.5 Pertenencias, armas y carencias

**Presupuesto garantizado del grupo.** El conjunto llega con: recipientes
con capacidad total para `8–12` litros; entre `5` y `8` litros de agua
disponible; aproximadamente seis comidas individuales sencillas; al
menos un medio de encendido; al menos un utensilio de corte; una fuente
de luz con energía limitada; material básico de primeros auxilios; una
olla o recipiente válido para calentar agua; mochilas o bolsas para la
mayor parte del grupo; ropa normal de primavera, desigual y no siempre
suficiente para la noche fría. La distribución entre personas es física
y localizada; no existe un inventario global abstracto que teletransporte
las pertenencias (coherente con
[SET-003 §3.1](../40-settlement/SET-003_resources-logistics-and-condition.md#31-estados-de-logística)).

**Arma cuerpo a cuerpo para cada protagonista.** Cada uno de los seis
porta al llegar al menos un objeto utilizable como arma cuerpo a cuerpo o
improvisada: cuchillo, martillo, palanca, hacha pequeña, llave pesada,
tubo, bate o palo resistente, herramienta agrícola, lanza improvisada, u
objeto equivalente coherente con su biografía y su huida. No tienen por
qué ser armas fabricadas expresamente; una herramienta puede conservar
funciones de trabajo además de combate. Cada objeto tiene identidad,
ubicación, condición, peso, utilidad y desgaste (ver el modelo de objeto
de
[SET-008 §3.2](../40-settlement/SET-008_object-model-and-logistics-families.md#32-modelo-conceptual-de-objeto)).
Poseer un arma no concede habilidad para usarla ni garantiza que la
persona acepte combatir; ninguna arma es invulnerable o infinitamente
eficaz. No se garantiza arma de fuego: una semilla puede incluir una
como pertenencia variable coherente, pero la munición es escasa y no se
convierte en requisito del escenario (ver
[THR-001 §4](../60-threats/THR-001_zombie-threat-model.md#4-reglas-aprobadas)).

**Pertenencias variables.** Según las personas y la ruta de huida pueden
aparecer: cuerda, lona, radio, mapa, cinta adhesiva, herramientas,
medicación personal, mantas, batería externa, prismáticos, hornillo,
semillas, recuerdos y objetos personales, arma de fuego o munición
limitada. No se generan objetos por balance sin justificar quién los
llevaba y por qué.

**Carencias obligatorias.** Al llegar carecen de: agua suficiente para el
día siguiente; comida sostenible para varios días; camas asignadas para
todos; almacén comunitario; electricidad fiable; fuente de calor
garantizada; defensas preparadas; conocimiento completo del refugio; ruta
de evacuación preparada; producción renovable; información suficiente
sobre el pueblo. El refugio puede contener soluciones parciales, pero
deben descubrirse y ponerse en uso mediante acciones normales.

### 3.6 Amenaza zombi inicial contenida y limpiable

La población zombi inicial real del mapa local se sitúa entre `12` y
`30` zombis (presupuesto detallado en
[WLD-009 §3.6](../20-world/WLD-009_initial-mountain-village-profile.md#36-amenaza-zombi-inicial)).
El grupo y el jugador no conocen la cifra.

Distribución: entre cero y dos zombis en la cercanía operativa de
llegada; mayoría aislada o en grupos de dos o tres; parte atrapada,
inmóvil, dormida o encerrada en interiores; posibles concentraciones
evitables de cuatro a seis en un lugar coherente; ninguna horda inicial
en el mapa; ninguna concentración inevitable bloqueando el único refugio
o agua viable.

Esta amenaza es suficientemente baja para que el mapa pueda limpiarse
progresivamente si el grupo actúa bien: población local inicial finita,
sin respawn de zombis eliminados, encuentros pequeños y comprensibles,
con posibilidad de evitar, atraer, aislar, contener o eliminar. Esto no
implica que todos los combates sean seguros, que cualquier persona pueda
luchar bien, que el mapa quede permanentemente inmune, que no puedan
llegar zombis desde fuera por migración, ruido, expediciones o eventos
sistémicos futuros, ni que limpiar equivalga a controlar, conocer o
vigilar todo el territorio.

La llegada garantiza indicios de amenaza, no una pelea: manchas o
restos, puertas o ventanas forzadas, vehículo abandonado, ruido
distante, huellas, figura lejana o indicio equivalente. Una entrada
imprudente, ruido, luz, fuego o exploración puede desencadenar el primer
encuentro; un grupo prudente puede pasar la primera noche sin combatir.
Este escenario aplica el zombi estándar lento ya cerrado en
[THR-001](../60-threats/THR-001_zombie-threat-model.md) como instancia
concreta de ese contrato; no cierra aquí infección, variantes ni
dificultad configurable más allá de lo ya aprobado en `THR-001`.

### 3.7 Garantías de una semilla válida

La dificultad debe proceder del mundo y las decisiones, no de una semilla
incapaz de sostener el escenario prometido. El generador valida, antes
del inicio, que existe:

1. Un refugio provisional razonable dentro de la distancia definida en la
   sección 3.4.
2. Al menos dos rutas potenciales de agua (ver
   [WLD-009 §3.4](../20-world/WLD-009_initial-mountain-village-profile.md#34-agua)).
3. Al menos una fuente de alimento de corto plazo accesible durante el
   primer día completo.
4. Algún método básico para asegurar parcialmente un acceso.
5. Materiales u objetos con los que crear almacenamiento inicial.
6. Una salida practicable del área de llegada.
7. Una zona donde descansar sin exposición inmediata inevitable.
8. Ninguna amenaza imposible de detectar y evitar antes de la primera
   decisión.
9. Al menos una secuencia de acciones viable con las capacidades reales
   de los seis protagonistas generados en
   [SCN-002](SCN-002_initial-survivor-cohort.md).

**Garantía no equivale a información gratuita.** El agua puede necesitar
tratamiento; la comida puede estar oculta, disputada o deteriorada; el
refugio puede requerir inspección y trabajo; la herramienta útil puede
tener que localizarse; la ruta puede ser arriesgada. Los personajes no
reciben conocimiento omnisciente de estas soluciones.

**Validación causal.** La validación comprueba el mundo generado y las
capacidades de la cohorte; no añade objetos después de empezar, no
altera botín al observarlo y no elimina amenazas retroactivamente. Si
una semilla incumple el contrato, se corrige dentro de la fase de
generación previa cuando el modelo lo permita, o se descarta y regenera
de forma determinista (coherente con
[ARC-002 §3.1](../90-architecture/ARC-002_procedural-generation-and-persistence.md#31-generación-bajo-demanda)
y
[DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md)); nunca
se parchea ante los ojos del jugador. Esta entrega documenta el
comportamiento conceptual, no su algoritmo.

### 3.8 Otras personas y comunidades

**Mapa local.** No existe otra comunidad asentada obligatoriamente. Puede
existir una persona aislada o un grupo pequeño si la semilla y la
historia lo justifican. No se fuerza un encuentro humano durante las
primeras 48 horas. Siempre existen señales humanas posteriores al
colapso (correlacionadas espacialmente según
[WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md)),
pero su autor y actualidad pueden ser inciertos.

**Horizonte regional.** Pueden existir entre cero y dos comunidades a uno
o varios días de viaje regional (ver
[SOC-003](../50-society/SOC-003_external-communities-and-regional-history.md)).
El grupo inicial desconoce su existencia, estado e intención. Esta regla
alimenta el mundo futuro; no abre la implementación del mapa regional ni
amplía
[RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md).

### 3.9 Identidad jugable de las primeras horas

> Seis personas agotadas llegan a las 17:30 a un valle frío y silencioso.
> Ven un edificio que podría servir esa noche, algunas construcciones
> entre árboles y señales de actividad posterior al colapso. Tienen poca
> agua, aproximadamente una comida por persona, armas improvisadas y dos
> horas de luz. No saben si el pueblo está vacío, si el agua es segura ni
> si el edificio tiene otra salida. Pueden actuar en varios frentes, pero
> no resolverlo todo.

Presiones simultáneas posibles: evaluar al grupo; reconocer el refugio
provisional; atender una afección; conseguir agua; preparar descanso;
organizar pertenencias; cerrar accesos; reconocer rutas y amenazas;
decidir si separarse; establecer vigilancia o retirada. No se fija un
orden óptimo ni una lista de objetivos obligatorios: las necesidades, la
información y las circunstancias generan trabajos según
[UI-003](../80-interface/UI-003_work-priority-taxonomy.md); el jugador
establece prioridades.

La cantidad efectiva de trabajo antes de la noche es inferior a «seis
personas durante dos horas» por cansancio, desplazamientos, atención,
relaciones, preparación y posibles bloqueos. El éxito de la primera
noche no es una pantalla de victoria; el fracaso parcial tampoco implica
automáticamente game over: dormir mal, consumir más agua, dejar un
acceso débil o posponer una inspección genera consecuencias persistentes,
coherente con
[NAR-001](../70-narrative/NAR-001_emergent-narrative.md).

## 4. Reglas aprobadas

- El momento de llegada (Día 1, 17:30, aproximadamente seis semanas tras
  el colapso, primera mitad de abril, cuatro días de marcha) es exacto y
  canónico para este escenario.
- La banda meteorológica inicial excluye fenómenos letales o que anulen
  la primera decisión; la variación dentro de la banda es libre.
- El refugio provisional garantizado de la sección 3.4 es obligatorio en
  toda semilla válida, generado siempre por el modelo de estancias de
  `WLD-005`, nunca como excepción hecha a mano.
- El presupuesto de pertenencias, el arma cuerpo a cuerpo de cada
  protagonista y las carencias obligatorias de la sección 3.5 son
  obligatorios en toda semilla válida.
- La amenaza zombi inicial es finita, sin respawn de lo ya limpiado, y
  nunca bloquea de forma inevitable el único refugio o fuente de agua
  viable.
- Las nueve garantías de semilla de la sección 3.7 son obligatorias;
  ninguna implica información gratuita para los personajes.
- La presencia de otras comunidades, locales o regionales, es incierta y
  variable entre semillas; nunca forzada durante las primeras 48 horas.

## 5. Interacciones con otros sistemas

- El perfil numérico completo del mapa local (huella, construcciones,
  red viaria, agua, cobertura de terreno, puntos de interés) se define en
  [WLD-009](../20-world/WLD-009_initial-mountain-village-profile.md).
- Los cinco estados de información y las familias de descubrimiento se
  rigen por
  [WLD-002](../20-world/WLD-002_local-exploration-and-information.md).
- Todo edificio de este escenario, incluido el refugio provisional, se
  genera por la cadena semántica de
  [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md);
  la descomposición de un edificio en estancias funcionales y su
  adaptación es responsabilidad de
  [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md).
- La diferencia entre refugio provisional y asentamiento elegido, y el
  crecimiento posterior del asentamiento, se rigen por
  [SET-001](../40-settlement/SET-001_settlement-growth.md).
- Los recursos rastreados, su logística y condición se rigen por
  [SET-003](../40-settlement/SET-003_resources-logistics-and-condition.md);
  el modelo de objeto de las armas y pertenencias, por
  [SET-008](../40-settlement/SET-008_object-model-and-logistics-families.md).
- La amenaza zombi estándar aplicada aquí como instancia concreta se rige
  por [THR-001](../60-threats/THR-001_zombie-threat-model.md).
- El primer catálogo implementable aprobado por `DESIGN-008`
  ([CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md),
  [CAT-005](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md))
  y el entorno mutable, los accesos y el transporte local
  ([WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md),
  [WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md),
  [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md),
  [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md)) pueden
  aplicarse sobre este escenario en una futura implementación; ninguno de
  ellos garantiza carretilla, carro, semillas, cultivo ya sembrado ni
  vehículo entre las pertenencias iniciales de la sección 3.5, que este
  documento no modifica.
- La validación y regeneración determinista de semillas se rige por
  [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md)
  y
  [DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md).
- Las comunidades regionales inciertas se rigen por
  [SOC-003](../50-society/SOC-003_external-communities-and-regional-history.md).
- La cohorte protagonista que vive este estado inicial se define en
  [SCN-002](SCN-002_initial-survivor-cohort.md).
- El punto de entrada y síntesis del escenario es
  [SCN-001](SCN-001_mountain-village-arrival.md).

## 6. Casos límite o riesgos

- Convertir cualquier garantía de la sección 3.7 en información revelada
  automáticamente al jugador contradice la sección 2 y el principio de
  niebla progresiva de `WLD-002`.
- Generar una amenaza inicial imposible de detectar o evitar antes de la
  primera decisión contradice la sección 3.6.
- Tratar el refugio provisional como definitivo o como el único destino
  válido contradice la sección 3.4 y `SET-001`.
- Fijar quién sufre cada estado físico de la sección 3.2 por escenario en
  vez de por semilla rompería la variación procedural exigida en
  `WLD-008`.

## 7. Preguntas abiertas

- Algoritmo exacto de validación y regeneración de semillas inválidas.
- Fórmulas exactas de deterioro de las pertenencias y del estado físico
  durante la marcha (heredadas de
  [SET-003](../40-settlement/SET-003_resources-logistics-and-condition.md)
  y
  [CHR-001](../30-characters/CHR-001_character-model.md)).
- Interfaz gráfica concreta de la primera noche.
- Equilibrio final de necesidades y consecuencias exactas de una primera
  noche mal gestionada.

Ver también `docs/OPEN-QUESTIONS.md`.

## 8. Ejemplos no normativos

- Una semilla coloca el refugio provisional en una cabaña; otra, en un
  local comercial pequeño con vivienda superior; ninguna de las dos es
  una excepción hecha a mano.
- El grupo dispone de `5–8` litros de agua y seis comidas sencillas, pero
  carece de un suministro sostenible: debe resolverlo mediante acciones
  normales, no mediante un abastecimiento automático.
- Existen entre `12` y `30` zombis en el mapa, pero solo entre cero y dos
  están cerca de la llegada: un grupo prudente puede pasar la primera
  noche sin combatir; otro grupo puede provocar un encuentro temprano por
  ruido, y ambos resultados son válidos.
- Una semilla sin refugio viable dentro de la distancia definida, o sin
  ninguna ruta de agua accesible, se rechaza antes de comenzar la
  partida y se regenera de forma determinista.
