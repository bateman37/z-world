---
id: UI-006
title: Interacción contextual con lugares y equipos locales
status: approved
canonical_for:
  - ficha contextual de un lugar
  - evolución de las acciones disponibles según el conocimiento
  - acción contextual frente a designación por área
  - regla de visibilidad de acciones conocidas, bloqueadas y no reconocidas
  - reconocimiento exterior como vía normal no obligatoria
  - selector de tamaño de equipo local Auto / 1 / 2 / 3 / 4
  - modos de asignación Comunidad y Equipo seleccionado
depends_on:
  - UI-001
  - UI-003
related:
  - UI-004
  - UI-005
  - WLD-002
  - WLD-004
  - WLD-008
  - ARC-007
  - ARC-008
  - CHR-003
  - DEC-0010
---

## 1. Propósito

Definir cómo el jugador interactúa con un lugar concreto del mapa local:
qué muestra su ficha contextual, cómo evolucionan las acciones disponibles
según lo que la comunidad sabe, qué se ve y qué no se ve, cómo se recorre
un edificio desconocido, y cómo se compone el **equipo operativo local** que
ejecuta una orden.

Este documento no crea un planificador de misiones nuevo ni una segunda
taxonomía de trabajo: se apoya en la cadena de control ya cerrada en
[UI-003](UI-003_work-priority-taxonomy.md) y en el modelo de cooperación de
[ARC-007](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md).

## 2. Principios que no deben romperse

- **Dos gramáticas complementarias, no una sustituyendo a la otra**: acción
  contextual sobre un objetivo incierto o singular, y designación por área u
  objetivo ya conocido (sección 3.1).
- **La interfaz no filtra información oculta.** Una acción que la comunidad
  todavía no ha reconocido no aparece, ni siquiera en gris (sección 3.4).
- **Reconocer el exterior es la vía normal, no una prohibición absoluta**
  (sección 3.6).
- **Más personas no es más calidad.** El tamaño del equipo expresa cuántas
  personas se desean o permiten; no concede bonificaciones por acumulación
  (sección 3.9).
- **`Auto / 1 / 2 / 3 / 4` es la interfaz habitual de un equipo operativo
  local.** No es una escala de prioridad, no es un límite de población, no
  es un límite de respuesta a una emergencia y no es el tamaño máximo de una
  expedición regional (sección 3.7 y
  [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md)).
- El jugador expresa una intención; el sistema genera los trabajos y
  microacciones. No se obliga a programar cada paso ni a escribir órdenes en
  lenguaje natural (ver
  [UI-001](UI-001_interaction-and-command-model.md), sección 2).

## 3. Modelo funcional

### 3.1 Acción contextual y designación por área

| Gramática | Cuándo es adecuada | Ejemplos |
|---|---|---|
| Acción contextual sobre un objetivo | El objetivo es incierto o singular: un edificio desconocido, un acceso, una habitación, un equipo, una persona, una amenaza, un objeto concreto. | Reconocer el exterior de una casa; inspeccionar una bomba; hablar con un desconocido. |
| Designación por área u objetivo conocido | El trabajo es repetitivo sobre terreno o elementos ya comprendidos. | Talar, recolectar, pescar, recoger, transportar, construir, desmontar, patrullar, aplicar una zona. |

Las herramientas de área son válidas para trabajo conocido y repetible. **No
deben permitir** pintar diez edificios desconocidos y ordenar «saquear» como
si la comunidad ya conociera sus accesos, ocupantes y contenido.

### 3.2 Cadena de control heredada

Este documento no inventa una cadena nueva. Conserva la de
[UI-003](UI-003_work-priority-taxonomy.md), sección 3.1:

> Necesidad o intención → orden, zona, política o evento → trabajo concreto
> → prioridad → elegibilidad → habilidad y conocimiento → herramientas,
> materiales e infraestructura → ejecución → resultado, experiencia e
> información nueva.

La orden contextual de este documento ocupa el eslabón «orden»; el resto de
la cadena permanece intacto.

### 3.3 Ficha contextual de un lugar

Al seleccionar un lugar, la interfaz debe poder mostrar:

- identidad conocida o descripción provisional;
- estado de información (los cinco estados de
  [WLD-002](../20-world/WLD-002_local-exploration-and-information.md));
- indicios conocidos;
- incógnitas relevantes;
- confianza y antigüedad de la información cuando proceda;
- riesgos conocidos, nunca riesgos omniscientes;
- accesos conocidos;
- trabajos en curso o pendientes;
- personas o equipo asignados;
- acciones disponibles;
- acciones conocidas pero bloqueadas, con su motivo;
- progreso, fases e interrupciones.

El diseño gráfico exacto, la posición del panel y la iconografía final
**quedan abiertos**. La presentación cualitativa de capacidad y dificultad
sigue rigiéndose por
[UI-004](UI-004_qualitative-capability-presentation.md), sin repetirse aquí.

### 3.4 Regla de visibilidad de acciones

| Situación | Presentación |
|---|---|
| La comunidad conoce la posibilidad y la persona o equipo puede ejecutarla | La acción aparece disponible. |
| La comunidad conoce la posibilidad pero la persona o equipo seleccionado no puede ejecutarla | La acción aparece deshabilitada o en gris, **con el motivo explicado** (habilidad, conocimiento, herramienta, material, acceso, zona o estado). |
| La comunidad todavía no ha reconocido esa posibilidad | La acción **no aparece**. No se muestra un botón gris que revele un secreto. |

Ejemplo de referencia: alguien sin conocimiento técnico puede ver «equipo
desconocido». Cuando una persona adecuada identifica una bomba de agua
averiada, la comunidad ya conoce la acción «Reparar bomba», aunque para
muchas personas aparezca bloqueada por habilidad, conocimiento, herramienta
o material.

Los motivos de bloqueo se comunican con la explicación causal ya exigida en
[UI-001](UI-001_interaction-and-command-model.md), sección 3.3, y con los
descriptores cualitativos de
[UI-004](UI-004_qualitative-capability-presentation.md).

### 3.5 Estados progresivos de interacción con un edificio

Un edificio no se reduce a «explorado X %». Sobre los cinco estados
generales de
[WLD-002](../20-world/WLD-002_local-exploration-and-information.md) y las
capas de evidencia de
[WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md), el
conocimiento de un edificio tiene facetas independientes:

- exterior;
- accesos;
- amenazas;
- posibles ocupantes;
- habitaciones;
- contenido suelto;
- mobiliario y equipamiento;
- instalaciones;
- estructura;
- cambios posteriores;
- momento y confianza de la última información.

Flujo de referencia aprobado de cómo evolucionan las intenciones
pertinentes:

| Situación conocida | Intenciones o acciones que pueden resultar pertinentes |
|---|---|
| Lugar solamente avistado | Reconocer exterior, observar, vigilar, evitar o marcar |
| Exterior reconocido | Acercarse, inspeccionar un acceso, llamar, mantener vigilancia, retirarse o plantear entrada |
| Acceso examinado | Abrir, despejar, forzar, trepar, preparar entrada o abandonar |
| Interior parcialmente conocido | Explorar otra estancia, asegurar la zona inmediata, buscar, contactar, auxiliar, combatir o retirarse |
| Lugar asegurado | Registrar, recuperar, trasladar, inspeccionar equipos, reparar, utilizar o reclamar |
| Lugar aprovechado | Mantener, adaptar, reforzar, conectar, desmontar, demoler o abandonar según corresponda |

Esta tabla **no obliga** a mostrar todas las acciones en todos los lugares.
Cada objetivo declara sus posibilidades o `affordances`; el estado real, la
información, el acceso, la persona, el equipo, las herramientas, las normas
y el riesgo filtran lo que tiene sentido.

### 3.6 Reconocimiento exterior como barrera blanda

Para un edificio desconocido, el recorrido autónomo y normal comienza por
**reconocer el exterior**, no por «saquear».

Reconocer el exterior es una acción física y temporal. Puede implicar buscar
posiciones desde las que observar, revisar puertas y ventanas, escuchar,
buscar huellas, sangre, humo, daños o movimiento, localizar accesos, estimar
riesgos visibles, identificar la función anterior del edificio, buscar rutas
de retirada y comunicar indicios. Depende de luz, clima, posición, sentidos,
habilidades, miedo, fatiga y otros factores pertinentes. «No se oyó nada» no
equivale a «está vacío».

No es una prohibición absoluta: el jugador puede ordenar una entrada sin
reconocimiento previo cuando la situación lo permita físicamente, como
**decisión explícita** con riesgo cualitativo y sin información gratuita. La
personalidad, autonomía, miedo, urgencia o desesperación pueden hacer que
una persona acepte, rechace, dude o se extralimite conforme a
[CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md).

### 3.7 Familias de acciones contextuales

Amplían, sin contradecirlas, las familias de descubrimiento de
[WLD-002](../20-world/WLD-002_local-exploration-and-information.md), sección
3.2. Son **verbos de diseño**, no una botonera universal:

| Familia funcional | Ejemplos |
|---|---|
| Percibir y reconocer | Observar, escuchar, rastrear, vigilar, reconocer exterior |
| Posicionarse | Acercarse, esperar, seguir, evitar, ocultarse, retirarse |
| Acceder | Abrir, llamar, despejar, forzar, trepar |
| Asegurar y responder | Contener, neutralizar, custodiar, rescatar, proteger, retirarse |
| Examinar y comprender | Inspeccionar, buscar, analizar, diagnosticar, registrar |
| Comprobar | Probar, medir, tomar muestra, verificar funcionamiento |
| Recuperar y trasladar | Recoger, transportar, vaciar, copiar información, marcar para traslado |
| Utilizar | Consumir, activar, equipar, instalar o poner en servicio cuando proceda |
| Transformar | Limpiar, reparar, adaptar, reforzar, conectar, desmontar, demoler, reclamar |
| Relacionarse | Llamar, hablar, ayudar, comerciar, intimidar, detener, atacar |

Qué familias corresponden a cada tipo de objetivo:

| Tipo de objetivo | Familias habitualmente pertinentes |
|---|---|
| Terreno o zona natural | Percibir, posicionarse, recuperar y trasladar, transformar |
| Edificio o lugar | Todas, según el estado de conocimiento de la sección 3.5 |
| Acceso, habitación o estructura | Percibir, acceder, asegurar, examinar, transformar |
| Objeto, mobiliario, instalación o equipo | Examinar, comprobar, recuperar y trasladar, utilizar, transformar |
| Persona, animal o amenaza | Percibir, posicionarse, asegurar y responder, relacionarse |
| Recurso o fuente natural | Percibir, comprobar, recuperar y trasladar, utilizar |

Esta correspondencia es orientativa: no autoriza mostrar una familia cuando
el conocimiento actual no la justifica (sección 3.4).

### 3.8 Interior y revelado progresivo

Entrar no revela mágicamente todo el edificio. El interior se descubre de
forma parcial:

- por línea de visión, luz, aberturas y posición;
- habitación por habitación o zona por zona;
- mediante acciones de observación, acceso, aseguramiento, inspección y
  registro;
- conservando las diferencias entre «visible», «observado», «inspeccionado»
  y «registrado»;
- **sin generar objetos nuevos** por llevar a una persona más experta.

El interior de un edificio no es un tercer mapa ni una pantalla de misión:
forma parte del detalle del mapa local (ver
[WLD-001](../20-world/WLD-001_world-scales.md), sección 3.2). Varias plantas
pueden resolverse mediante capas o planta activa; su interfaz visual
definitiva queda abierta.

El contenido estable y el reconocimiento dependiente de la persona siguen
gobernados por
[WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md),
[WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md),
[ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md)
y [DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md).

### 3.9 Equipo operativo local: tamaño y asignación

Una orden local contextual permite escoger el tamaño del equipo:

```text
Personas: Auto / 1 / 2 / 3 / 4
```

Modos de asignación que la orden debe poder expresar:

| Asignación | Comportamiento |
|---|---|
| Comunidad + `Auto` | El sistema decide cuántas personas son útiles y elige entre las elegibles. |
| Comunidad + `1`/`2`/`3`/`4` | El jugador fija la cantidad y el sistema elige a las personas elegibles. |
| Equipo seleccionado | El jugador escoge las personas concretas; el responsable puede quedar en automático o elegirse. |

La elegibilidad sigue siendo la de
[UI-001](UI-001_interaction-and-command-model.md), sección 3.3: permiso de
zona, acceso físico, herramienta imprescindible, capacidad mínima, estado
físico suficiente y materiales reservados. Fijar un tamaño de equipo no
convierte a nadie en elegible.

La disposición gráfica exacta del selector queda **abierta**.

### 3.10 Responsable y funciones útiles

Se conserva sin cambios el modelo de
[ARC-007](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md),
sección 3.1: un trabajo colectivo puede tener responsable y aportaciones
concretas, sin profesiones rígidas. Funciones posibles cuando aportan algo
real: responsable técnico u operativo, ayudante operativo, apoyo logístico,
revisor, y vigilancia o retaguardia.

No todas las órdenes necesitan todas las funciones. **Una actividad
individual no inventa un líder artificial.**

### 3.11 Capacidad y límites propios de cada acción

Cada tipo de acción debe poder declarar conceptualmente:

- mínimo de personas;
- cantidad recomendada;
- máximo útil simultáneo;
- funciones disponibles;
- requisitos individuales o compartidos;
- limitaciones físicas del lugar;
- posibilidad de repartir el trabajo en objetivos o fases paralelas.

Los valores concretos para todo el catálogo y las fórmulas de cooperación
**no se fijan aquí** (ver `P09` en
[ARC-008](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas)).

Añadir personas **no** otorga un bono genérico. No se permite:

- sumar un porcentaje universal por cada integrante;
- promediar indiscriminadamente al especialista con quien solo transporta;
- combinar la mejor habilidad de cada persona como si perteneciera a un
  individuo perfecto;
- convertir a un novato en experto por acompañar al responsable;
- añadir ayudantes ilimitados en un espacio pequeño;
- conceder una bonificación remota a quien no participa.

Las personas adicionales sí pueden modificar, según su función real: tiempo,
capacidad de carga, cobertura, vigilancia, fatiga, coordinación, ruido,
exposición, conservación de piezas, posibilidad de trabajar en paralelo y
aprendizaje por participación.

### 3.12 Operaciones de más de cuatro personas

Una operación local mayor **no** se representa necesariamente como un único
trabajo con veinte integrantes. Puede descomponerse en trabajos o equipos
relacionados en torno a un evento u objetivo común: combatir un incendio,
levantar una muralla, evacuar un edificio, defender un perímetro o trasladar
grandes cantidades de recursos.

El objetivo común puede movilizar a muchas personas, y cada equipo conserva
una aportación comprensible. **`4` no es un límite del motor** ni el máximo
de personas que pueden reaccionar a una emergencia; la movilización ante un
desastre sigue rigiéndose por la prioridad Emergencias de
[UI-003](UI-003_work-priority-taxonomy.md), sección 3.6.

### 3.13 Prioridad, modo, método, tamaño y asignación

Conceptos distintos que no deben confundirse:

| Concepto | Qué decide | Fuente canónica |
|---|---|---|
| Prioridad | Qué trabajo se atiende antes. | [UI-003](UI-003_work-priority-taxonomy.md) §3.2 |
| Modo | Cómo se aborda (relajado, exhaustivo/cuidadoso, normal, rápido). | [ARC-007](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md) §3.3 |
| Método | El procedimiento y alcance material de la intervención. | [ARC-007](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md) §3.4 |
| Tamaño del equipo | Cuántas personas se desean o permiten. | Este documento §3.9 |
| Asignación | Quién elige a esas personas. | Este documento §3.9 |
| Elegibilidad | Quién puede participar. | [UI-001](UI-001_interaction-and-command-model.md) §3.3 |

La escala de prioridad visible sigue siendo exactamente `Nunca` y `1`–`5`.
El selector `Auto / 1 / 2 / 3 / 4` **no** es esa escala y no se muestra con
la misma semántica.

### 3.14 Interrupciones

Las microacciones rutinarias pueden continuar autónomamente. La interfaz
debe poder elevar o interrumpir por hechos significativos, por ejemplo:
amenaza detectada, persona desconocida, acceso bloqueado inesperado, peligro
estructural, objeto o instalación extraordinaria, herida, cambio material
del entorno, decisión social o moral, o pérdida de medios esenciales.

Esta lista no es exhaustiva y **la política exacta de pausa automática no se
fija aquí**: su calibración pertenece a `P14` y `P20` de
[ARC-008](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas).

## 4. Reglas aprobadas

- La acción contextual y la designación por área conviven; ninguna sustituye
  a la otra, y el área no autoriza ordenar trabajo sobre objetivos
  desconocidos.
- Acción conocida pero no ejecutable = visible en gris con motivo; acción no
  reconocida por la comunidad = ausente.
- Reconocer el exterior es la vía normal y autónoma ante un edificio
  desconocido, y puede saltarse mediante una orden explícita arriesgada
  cuando sea físicamente posible.
- Entrar en un edificio no revela su interior completo; el revelado es
  parcial y dependiente de acción, posición e información.
- El selector de equipo local es exactamente `Auto / 1 / 2 / 3 / 4`, con
  asignación `Comunidad` o `Equipo seleccionado`.
- El selector de equipo local no es una escala de prioridad, un límite de
  población, un límite de respuesta a emergencias ni el tamaño máximo de una
  expedición regional.
- Añadir integrantes no concede bonificación genérica; solo las funciones
  reales modifican el resultado.
- Una operación mayor puede descomponerse en varios trabajos o equipos
  relacionados.
- Este documento no altera las 34 prioridades ni la escala `Nunca/1–5` de
  [UI-003](UI-003_work-priority-taxonomy.md).

## 5. Interacciones con otros sistemas

- La base de selección, designaciones, zonas, control puntual con ratón y
  explicación de bloqueo sigue siendo
  [UI-001](UI-001_interaction-and-command-model.md).
- La cadena de necesidad → trabajo → prioridad y las 34 prioridades siguen
  siendo propiedad de [UI-003](UI-003_work-priority-taxonomy.md).
- La presentación cualitativa de capacidad, dificultad y bloqueo se rige por
  [UI-004](UI-004_qualitative-capability-presentation.md).
- La superficie de mapa, la niebla y el control con ratón sobre el Canvas 2D
  cenital se rigen por
  [UI-005](UI-005_top-down-simulation-workbench.md).
- Los estados de información y las familias de descubrimiento se rigen por
  [WLD-002](../20-world/WLD-002_local-exploration-and-information.md); el
  reconocimiento dependiente de la persona, por
  [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md).
- La geografía sobre la que se selecciona un lugar se genera según
  [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md).
- La cooperación con responsable, los modos y las condiciones siguen siendo
  propiedad de
  [ARC-007](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md)
  (`draft`); las fórmulas y calibraciones pendientes viven en
  [ARC-008](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md).
- La decisión de dirección que respalda este documento es
  [DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md).

## 6. Casos límite o riesgos

- Mostrar en gris una acción que la comunidad no ha reconocido filtraría
  información oculta y contradiría la sección 3.4.
- Permitir «saquear» por área sobre edificios desconocidos contradiría la
  sección 3.1 y la barrera blanda de la sección 3.6.
- Interpretar `4` como límite del motor impediría representar un incendio o
  una muralla con doce personas (sección 3.12).
- Confundir el selector `Auto / 1 / 2 / 3 / 4` con la escala `Nunca/1–5`
  rompería la separación de la sección 3.13.
- Convertir el interior de un edificio en una escena separada contradiría la
  sección 3.8 y [WLD-001](../20-world/WLD-001_world-scales.md), sección 3.2.

## 7. Preguntas abiertas

- Duración exacta de cada acción contextual.
- Fórmulas de idoneidad, cooperación y coordinación; rendimientos
  decrecientes (ver `P09` en
  [ARC-008](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas)).
- Mínimo, recomendado y máximo útil concretos por familia de acción.
- Reglas exactas de sustitución del responsable y trabajo supervisado (`P10`).
- Política final de pausas e interrupciones (`P14`, `P20`).
- Todos los costes y efectos de los modos por familia (`P11`, `P12`).
- Diseño gráfico, iconografía y disposición final de la ficha y del selector.
- Interfaz exacta para edificios de varias plantas.

Ver también `docs/OPEN-QUESTIONS.md`.

## 8. Ejemplos no normativos

Equipos razonables **ilustrativos**, nunca valores implementados ni reglas
universales:

| Operación | Equipo razonable ilustrativo | Aportaciones posibles |
|---|---:|---|
| Reconocer exterior | 1–2 | Observación y vigilancia |
| Entrar en edificio desconocido | 2–4 | Responsable, apoyo, vigilancia y retaguardia |
| Registrar una habitación | 1–2 | Registro y segunda revisión |
| Trasladar objeto voluminoso | 2–4 | Manipulación y apoyo logístico |
| Desmontar instalación | 1–3 | Especialista, ayudante y logística |
| Vigilar acceso | 1–2 | Guardia y relevo |

Casos límite que la documentación debe poder responder sin contradicción:

- Pulsar un edificio desconocido **no** ofrece directamente «saquear»:
  aparecen primero las acciones coherentes con lo conocido (§3.5).
- Una persona sin mecánica **no** ve siempre «Reparar bomba»: solo si la
  comunidad ya reconoció que existe una bomba reparable, y entonces puede
  verla bloqueada con motivo (§3.4).
- Cuatro personas **no** garantizan más éxito que una: deben aportar
  funciones reales y pueden generar coordinación, ruido o exposición (§3.11).
- Una muralla levantada por doce personas **no** es un trabajo con doce
  bonificaciones: se descompone en trabajos o equipos relacionados (§3.12).
