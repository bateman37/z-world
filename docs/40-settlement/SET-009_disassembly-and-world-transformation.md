---
id: SET-009
title: Reconocimiento, desmontaje y transformación permanente del mundo
status: draft
canonical_for:
  - estados funcionales y acciones sobre un objeto completo
  - flujo conceptual de desmontaje en nueve pasos
  - diferencia entre desmontaje selectivo, desguace destructivo y demolición
  - persistencia y determinismo de la transformación de objetos
depends_on:
  - SET-008
related:
  - SET-007
  - WLD-004
  - CHR-006
  - ARC-006
  - ARC-002
---

## 1. Propósito

Definir cómo un objeto completo, ya modelado en
[SET-008](SET-008_object-model-and-logistics-families.md), se reconoce,
evalúa y transforma mediante desmontaje, desguace o demolición, y cómo esa
transformación queda permanentemente reflejada en el mundo persistente. No
redefine el motor de resolución ni sus modelos B/D (ver
[ARC-006](../90-architecture/ARC-006_action-and-event-resolution-model.md));
solo define qué se transforma y con qué reglas de coherencia.

## 2. Principios que no deben romperse

- Registrar/saquear, desmontar, desguazar y demoler son acciones diferentes
  que no deben confundirse entre sí.
- Desmontar es una decisión irreversible o parcialmente irreversible sobre
  un objeto que existía de forma estable en el mundo.
- Habilidad, conocimiento, herramientas y estado del objeto modifican el
  resultado del desmontaje; la identidad del objeto nunca la modifica el
  azar (R01 de
  [ARC-006](../90-architecture/ARC-006_action-and-event-resolution-model.md)).
- La existencia de los objetos es estable; los personajes cambian su
  reconocimiento y aprovechamiento, nunca lo que siempre existió (ver
  [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md)).

## 3. Modelo funcional

### 3.1 Estados funcionales de los objetos completos

Los objetos pueden encontrarse en estados como funcional, degradado,
averiado, incompleto, reparable, irreparable o útil únicamente para piezas.
Estos estados no constituyen una secuencia lineal única: un aparato puede
estar incompleto pero ser reparable, o estar aparentemente intacto y
resultar irreparable tras evaluarlo. El estado influye en si puede usarse,
cuánto cuesta trasladarlo y repararlo, qué conocimiento requiere, qué
componentes faltan, qué rendimiento tendrá su desmontaje y qué riesgos
presenta.

### 3.2 Reconocimiento e información mostrada

**Existencia estable.** El objeto y su estado real existen con
independencia de quién lo observe; el conocimiento del personaje modifica
la información disponible, no la realidad material, para no favorecer ni
perjudicar arbitrariamente a quien juega.

**Niveles conceptuales de reconocimiento** (no necesariamente mostrados
literalmente en interfaz): no observado, observado superficialmente,
identificado de forma genérica, identificado con precisión, evaluado
funcionalmente, evaluado para reparación, evaluado para desmontaje.

**Ejemplo, ante un equipo averiado:**

| Persona | Información posible |
|---|---|
| Sin conocimientos relevantes | «Máquina vieja; quizá tenga piezas». |
| Con experiencia básica | «Motor recuperable y algo de cableado». |
| Especialista | «Motor eléctrico II degradado; desmontable con herramientas de mecánica y electricidad». |

La inspección especializada puede justificar regresar a un lugar ya
registrado. Este modelo es coherente con y se apoya en el sistema de
reconocimiento dependiente de la persona ya cerrado en
[WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md).

### 3.3 Acciones sobre un objeto completo

Según el objeto, la persona y el contexto: observar, inspeccionar, evaluar
funcionamiento, probar, utilizar en el lugar, reservar, trasladar, instalar,
reparar, mantener, limpiar o acondicionar, comerciar, desmontar
selectivamente, desguazar de forma destructiva o abandonar. No todos los
objetos admiten todas las acciones; la interfaz solo muestra las
pertinentes para el objeto, el conocimiento disponible y las órdenes
permitidas.

### 3.4 Desmontaje de objetos

**Definición.** El desmontaje transforma un objeto completo en uno o varios
elementos: componentes reutilizables, materiales, residuos, objetos
secundarios que conservan identidad, o conocimiento práctico obtenido
durante el proceso cuando el diseño lo permita. El resultado depende
causalmente de lo que se desmonta, su estado y cómo se realiza el trabajo;
no es una tirada desconectada del mundo.

**Flujo conceptual en nueve pasos:**

1. **Identificar el objeto.** Saber qué es o, al menos, que puede contener
   algo útil.
2. **Evaluarlo.** Decidir si conviene usarlo, repararlo, trasladarlo o
   desmontarlo.
3. **Definir el objetivo.** Recuperar el objeto entero, una parte valiosa o
   materiales generales.
4. **Asignar persona y herramientas.** La capacidad disponible condiciona el
   trabajo.
5. **Preparar y desconectar.** Puede requerir cortar energía, vaciar
   fluidos, liberar anclajes o despejar el entorno.
6. **Desmontar.** Consume tiempo y puede producir ruido, riesgos o daños.
7. **Clasificar lo recuperado.** El conocimiento determina qué se reconoce y
   cómo se registra.
8. **Transportar.** Los componentes no llegan automáticamente al almacén.
9. **Actualizar el objeto y el lugar.** El objeto desaparece, queda
   parcialmente desmontado o conserva funciones reducidas.

**Factores del rendimiento:** composición real del objeto, condición del
objeto, piezas que ya le falten, conocimiento de la persona, habilidades
relevantes, calidad y condición de las herramientas, tiempo dedicado,
método empleado, condiciones ambientales, prisas/cansancio/heridas/estrés,
seguridad del lugar, y errores y accidentes (ver
[ARC-007](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md#35-estado-herramientas-y-entorno)
para cómo estos factores modulan la resolución).

**Resultado comprensible.** Aunque el cálculo interno considere varios
factores, quien juega recibe una explicación clara: qué se esperaba
recuperar, qué se ha recuperado, qué se perdió y por qué, si queda algo por
desmontar, si el objeto todavía puede usarse parcialmente, y si ocurrió un
accidente o se generó un peligro.

### 3.5 Desmontaje selectivo, desguace destructivo y demolición

| Acción | Qué busca | Características |
|---|---|---|
| Desmontaje selectivo | Preservar componentes enteros y valiosos. | Más lento; exige más conocimiento; puede requerir herramientas concretas; produce mejores componentes; genera menos desperdicio; puede conservar parte del objeto o instalación; reduce el riesgo de destruir piezas difíciles de reemplazar. |
| Desguace destructivo | Obtener material rápidamente cuando preservar el objeto no compensa. | Más rápido; exige menos precisión; recupera principalmente materiales genéricos; destruye componentes delicados; puede generar más ruido, residuos y riesgos; elimina la posibilidad de reparar o reutilizar el objeto completo. |
| Demolición | Consumir la estructura de un edificio para recuperar materiales masivos. | Elimina el uso futuro del edificio; pertenece al sistema de edificios, con reglas propias fuera de este alcance (ver [SET-007](SET-007_building-exploitation-reuse-and-demolition.md)). |

Ninguna de estas tres acciones se confunde con registrar o saquear
contenido suelto (§3.3).

### 3.6 Conocimiento, habilidad y herramientas en el desmontaje

El sistema evita dos extremos: que cualquier persona recupere exactamente
lo mismo, y que una persona sin conocimientos sea incapaz de tocar
absolutamente nada. Una persona inexperta puede recuperar materiales
evidentes, pero tiene más probabilidad de no reconocer componentes
valiosos, dañarlos, desmontar en un orden incorrecto, tardar más, sufrir
accidentes o producir principalmente chatarra o materiales de baja calidad
aprovechable. Una persona experimentada puede evaluar antes de destruir,
identificar componentes de grado superior, preservar su condición, separar
materiales contaminantes o peligrosos, usar herramientas adecuadas, enseñar
a otra persona durante el trabajo y documentar el proceso para la
comunidad.

**Ejemplo conceptual, ordenador averiado:**

| Ejecutor | Resultado posible |
|---|---|
| Persona sin experiencia | Chapa o material aprovechable, cableado y electrónica dañada. |
| Persona con conocimientos básicos | Placa electrónica II o III en estado incierto, cableado y componentes eléctricos I. |
| Especialista con buenas herramientas | Placa electrónica III preservada, componentes eléctricos I y diagnóstico de elementos reutilizables. |

Las cantidades exactas y probabilidades se definirán al equilibrar el
sistema mediante el modelo B/D de
[ARC-006](../90-architecture/ARC-006_action-and-event-resolution-model.md#34-modelo-b-resolución-porcentual)
(PENDIENTE, ver §5).

### 3.7 Persistencia y determinismo

El sistema respeta la persistencia causal del mundo: un objeto generado no
cambia de identidad al volver a cargar la partida; el contenido todavía no
materializado puede generarse de manera diferida, pero debe ser reproducible
a partir del estado persistente del mundo (ver
[ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md)
y
[DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md)); desmontar
un objeto modifica permanentemente ese objeto y el lugar; las piezas
recuperadas no pueden reaparecer al volver a inspeccionar; el resultado
puede variar según quién realiza el trabajo y cómo lo hace, porque cambia el
contexto de la acción, no porque el mundo vuelva a sortearse sin memoria.
Esto permite generación procedural sin usar la recarga de partida como
mecanismo para repetir infinitamente el contenido de un mismo objeto.

### 3.8 Ejemplos de transformación

Resultados orientativos que expresan el lenguaje del sistema, no cantidades
definitivas:

| Objeto | Mientras está completo | Recuperación posible al desmontar | Decisión estratégica |
|---|---|---|---|
| Frigorífico | Conservar alimentos si funciona y hay electricidad; almacenamiento sin refrigeración; repararse; trasladarse con capacidad logística suficiente. | Chapa, motor eléctrico II, cableado, componentes eléctricos I, otros materiales según modelo y estado. | Recuperar el motor ahora puede destruir una futura solución de conservación de alimentos. |
| Televisión | Repararse; usarse con una fuente de señal o como parte de un sistema informativo; valor recreativo o comercial. | Placa electrónica II, cableado, vidrio o material genérico, componentes eléctricos I. | — |
| Ordenador | Almacenar información; recuperar conocimiento digital; comunicaciones, administración o automatización; repararse combinando otros equipos. | Placa electrónica III, cableado, componentes eléctricos I, chapa u otros materiales secundarios. | Desmontarlo puede dar electrónica avanzada, pero también destruir un posible acceso a archivos, manuales o datos del mundo anterior. |
| Lavadora | Usarse si hay agua y electricidad; adaptarse a otros usos mecánicos; repararse. | Chapa, motor eléctrico II, piezas mecánicas I, cableado, componentes eléctricos I. | — |
| Tractor | Trabajar campos; transportar cargas; remolcar; proporcionar fuerza mecánica; repararse. | Motor de combustión III, piezas mecánicas II, batería II, chapa, cableado y componentes secundarios. | Desmontarlo puede resolver varias reparaciones inmediatas, pero cerrar una ruta futura hacia la agricultura mecanizada. |
| Calentador o termo eléctrico | Calentar y acumular agua; reutilizarse como depósito si deja de calentar; repararse; integrarse en otra instalación. | Chapa, tuberías, cableado, componentes eléctricos I; el depósito puede preservarse como objeto reutilizable. | — |
| Cuadro eléctrico | Forma parte funcional de la red de un edificio mientras permanece instalado. | Componentes eléctricos I o II según la instalación, cableado, caja o material aprovechable (mediante desmontaje selectivo). | Un electricista puede identificar mejor su capacidad y desmontarlo con menor riesgo. |

### 3.9 Consecuencias estratégicas

El sistema debe producir decisiones como: ¿se usa el frigorífico encontrado
o se desmonta para reparar la bomba?; ¿se gasta una placa III en una
comunicación sencilla o se reserva para recuperar un servidor?; ¿se repara
el tractor, se canibaliza para mantener una furgoneta o se desguaza por
completo?; ¿se retira el cableado de una vivienda vecina aunque eso
dificulte rehabilitarla después?; ¿se envía a una persona inexperta o se
espera a formar a alguien?; ¿se transporta un objeto pesado entero o se
reduce a componentes en el lugar?; ¿se conserva ropa para futuros
habitantes o se transforma en tela?; ¿se usan antibióticos escasos o se
espera una evaluación médica mejor? El interés surge de la oportunidad
perdida y de las capacidades de la comunidad, no del número de referencias
del inventario.

### 3.10 Presentación al jugador

**En el mapa**, objetos concretos: «Frigorífico averiado», «Ordenador sin
evaluar», «Lavadora degradada», «Cuadro eléctrico instalado», «Tractor
incompleto». **En el almacén**, categorías resumidas: chapa, cableado,
placas electrónicas II, motores eléctricos II, piezas mecánicas I, material
de cura. **En la ficha de un trabajo**, se explica qué necesita, qué existe
en el almacén, qué sustituciones son posibles, quién puede hacerlo, qué
herramientas faltan, cuánto tiempo aproximado requiere y qué objeto o
capacidad se perderá si se desmonta otra cosa para obtenerlo. **La
información es progresiva**: no toda propiedad se muestra desde el primer
vistazo; la interfaz diferencia información observada, estimada,
confirmada por una persona competente y desconocida.

### 3.11 Control de complejidad y escalabilidad

**Regla para añadir un objeto nuevo.** Antes de crear una nueva familia
logística: ¿este elemento habilita decisiones que ninguna familia actual
puede representar?, ¿el jugador comprenderá por qué debe gestionarlo por
separado?, ¿aparecerá con suficiente frecuencia?, ¿tiene usos distintos y
reconocibles?, ¿compensa el coste de interfaz, equilibrio, almacenamiento y
aprendizaje? Si la respuesta general es no, el nuevo objeto usa familias
existentes.

**Regla para conservar identidad individual.** Un elemento se mantiene
como objeto separado si puede usarse directamente, equiparse, instalarse,
repararse, trasladarse entero, tiene capacidad propia, contiene
conocimiento, tiene valor narrativo o personal, o genera una decisión
distinta a la de sus materiales.

**Regla para abstraer.** Un elemento se convierte en recurso genérico
cuando su identidad concreta deja de afectar a las decisiones, se combina
habitualmente con otros equivalentes, solo se usa como entrada de
fabricación o reparación, o mostrarlo individualmente añadiría contabilidad
sin aportar estrategia.

### 3.12 Relación con la generación procedural y otros módulos

Cadena causal de coherencia:

> Lugar → estancia → función anterior → antiguos ocupantes o negocio →
> mobiliario e instalaciones → objetos completos → historia del apocalipsis
> → saqueos y deterioro → estado actual → reconocimiento por el personaje →
> posible reutilización o desmontaje → familias recuperadas

Implica: coherencia entre vivienda, taller y actividad anterior; edificios
saqueados que aún conservan instalaciones; presión histórica de saqueo
sobre lo que permanece; valor ignorado por saqueadores anteriores (que
también pudieron ignorar objetos cuyo valor no comprendían); un especialista
no genera más objetos, descubre mejor el valor que ya existía; y el
desmontaje transforma permanentemente el mundo generado.

Las familias de recursos son entradas posibles, no soluciones completas:
construir o reparar algo combina componentes de grados apropiados,
materiales, herramientas, instalaciones, habilidades individuales,
conocimiento individual, conocimiento comunitario, tiempo de trabajo y
condiciones de seguridad. Ejemplo orientativo: automatizar una bomba de
agua puede requerir una bomba recuperable, motor eléctrico II, componentes
eléctricos I, cableado, herramientas de mecánica y electricidad, una
persona capaz de entender el montaje y una fuente de energía. Encontrar los
componentes no sustituye a comprender la solución; tener el conocimiento no
sustituye a disponer de materiales y medios (ver
[SET-005](SET-005_production-web-and-infrastructure.md)).

## 4. Reglas aprobadas

### 4.1 Veinte decisiones cerradas

1. El mundo muestra objetos concretos y reconocibles.
2. El inventario comunitario utiliza un conjunto reducido de familias
   abstractas.
3. Un objeto completo puede usarse, trasladarse, repararse o desmontarse.
4. Desmontar es una decisión irreversible o parcialmente irreversible.
5. Materiales como chapa, madera, vidrio y tela no utilizan grado técnico.
6. Tuberías y cableado permanecen como familias separadas y sencillas.
7. Placas electrónicas, motores eléctricos, motores de combustión y
   baterías usan grados I–III.
8. Piezas mecánicas y componentes eléctricos usan grados I–II.
9. El grado representa capacidad y complejidad abstractas, no condición.
10. Un grado superior puede adaptarse a una necesidad inferior con costes o
    requisitos.
11. Acumular grados inferiores no produce automáticamente un grado
    superior.
12. Las herramientas se organizan por conjuntos funcionales, calidad y
    condición.
13. Los suministros médicos iniciales se dividen en material de cura,
    analgésicos y antibióticos.
14. Las plantas se organizan por utilidad, aunque el reconocimiento de
    especies puede conservar profundidad.
15. La ropa mantiene tipo, protección y condición.
16. Habilidad, conocimiento, herramientas y estado del objeto modifican el
    resultado del desmontaje.
17. Registrar, desmontar, desguazar y demoler son acciones diferentes.
18. Añadir nuevos objetos al catálogo no debe obligar a añadir nuevas
    familias logísticas.
19. La existencia de los objetos es estable; los personajes cambian su
    reconocimiento y aprovechamiento.
20. Los resultados exactos de cantidades y equilibrio no se fijan todavía.

## 5. Interacciones con otros sistemas y preguntas abiertas

- El modelo de objeto, sus atributos y las familias logísticas viven en
  [SET-008](SET-008_object-model-and-logistics-families.md); este documento
  no los redefine.
- El desmontaje se resuelve mediante el procedimiento común y los modelos
  B/D de
  [ARC-006](../90-architecture/ARC-006_action-and-event-resolution-model.md);
  los modos de ejecución (relajado, cuidadoso) que afectan al desmontaje
  viven en
  [ARC-007](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md).
- El reconocimiento dependiente de la persona antes de desmontar vive en
  [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md), que ya
  distingue formalmente recuperar, desmontar, registrar y catalogar como
  cuatro acciones cuyos efectos no se sustituyen entre sí; este documento
  desarrolla en detalle el desmontaje que allí solo se define brevemente.
- Las habilidades y conocimientos que determinan el resultado (§3.6) viven
  en [CHR-006](../30-characters/CHR-006_characteristics-and-skill-catalog.md).

**Preguntas abiertas propias de este ámbito**: cantidades exactas
recuperadas de cada objeto; probabilidades, fórmulas o tiempos concretos de
desmontaje (ver P04–P05 del motor en
[ARC-008](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas));
tratamiento exacto de materiales peligrosos; detalle de residuos y
escombros; interfaz definitiva de desmontaje; estructura técnica de datos;
alcance exacto de la primera versión jugable para este sistema (todavía no
incorporado a `RDM-001`).

## 6. Ejemplos no normativos

### 6.1 Prueba de coherencia del sistema

El diseño cumple su objetivo si permite afirmar simultáneamente:

> «He encontrado un ordenador antiguo en el despacho del ayuntamiento.
> Lucía cree que puede recuperar los archivos, pero necesitamos energía y
> alguien capaz de repararlo.»

y:

> «Si finalmente lo desmontamos, el almacén recibirá una placa electrónica
> III y algunos componentes comprensibles; no veintisiete piezas
> informáticas distintas.»

> **La riqueza pertenece al mundo, a las personas y a las decisiones. La
> simplicidad pertenece al inventario.**

Los ejemplos de transformación de §3.8 y las consecuencias estratégicas de
§3.9 son ilustrativos y no fijan cantidades ni probabilidades definitivas.
