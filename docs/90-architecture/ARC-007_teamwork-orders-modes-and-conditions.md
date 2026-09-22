---
id: ARC-007
title: Cooperación con líder, órdenes del lugar, modos de ejecución y condiciones
status: approved
canonical_for:
  - trabajo en equipo con un responsable
  - información conceptual de una orden ligada al lugar
  - significado de relajado, exhaustivo/cuidadoso, normal y rápido
  - estado de la persona, herramientas, entorno y dificultad en la resolución
  - fórmula de cooperación y rendimientos decrecientes
  - responsable, ejecutor, supervisor y sustitución
  - dos dimensiones combinables de ritmo y atención
  - límites temporales, herencia del lugar y respuesta ante cambios
depends_on:
  - ARC-006
related:
  - ARC-008
  - CHR-001
  - CHR-003
  - UI-003
  - UI-006
  - SET-010
  - DEC-0011
---

## 1. Propósito

Continuar [ARC-006](ARC-006_action-and-event-resolution-model.md) con las
capas del motor que dependen de **quién trabaja con quién, dónde, con qué
intención y en qué condiciones**: cooperación con un responsable, la
información que necesita una orden vinculada al lugar, el significado
corregido de los modos de ejecución, el tiempo dedicado y el estado de la
persona, las herramientas y el entorno como moduladores de la resolución.

## 2. Principios que no deben romperse

- La cooperación busca hacer interesante elegir quién trabaja con quién y
  qué aporta cada persona; no asegura el éxito por sumar trabajadores
  (R10, corrección expresa sobre la lectura inicial de *Robinson Crusoe*:
  el interés reside en la cooperación con un líder, no en garantizar
  resultados añadiendo personas).
- El modo y la dedicación se configuran en el trabajo u orden del lugar, no
  como ajuste global de personalidad del personaje (R11).
- Relajado no significa exhaustivo/cuidadoso (R12).

## 3. Modelo funcional

### 3.1 Trabajo en equipo con un líder

**Responsable y funciones útiles (BASE PROPUESTA).** Cada trabajo colectivo
puede tener un responsable y aportaciones concretas; no son profesiones
rígidas:

| Función ilustrativa | Aportación |
|---|---|
| Responsable técnico | Decide o ejecuta el procedimiento que exige conocimiento. |
| Ayudante operativo | Prepara, sostiene o ejecuta pasos accesibles bajo indicaciones. |
| Apoyo logístico | Transporta, abastece, organiza herramientas o retira material. |
| Revisor | Aporta otra inspección o perspectiva cuando existe una necesidad real. |
| Vigilancia | Observa amenazas; no añade por ello habilidad técnica al trabajo. |

No todas las tareas necesitan estos puestos; una actividad individual no
exige nombrar artificialmente un líder. Las contribuciones pueden cambiar
tiempo, esperas, esfuerzo, conservación, observación, coordinación o
exposición; no todas modifican una probabilidad.

**Competencia técnica y coordinación son capacidades diferentes.** Un buen
coordinador no reemplaza conocimientos técnicos inexistentes. Este documento
no fija una característica o habilidad de «Liderazgo»: esa competencia
social vive en el catálogo de
[CHR-006](../30-characters/CHR-006_characteristics-and-skill-catalog.md#33-catálogo-completo-de-34-habilidades-base)
(habilidad 30, Liderazgo) como habilidad, no como característica. Para grupos pequeños no hay dos
cargos obligatorios (uno técnico y otro organizativo); el responsable puede
integrar ambas funciones, y su formalización sigue abierta.

**Interfaz de tamaño y asignación del equipo (cerrada en `UI-006`).** La
forma en que quien juega expresa cuántas personas participan en una orden
local y quién las elige está cerrada en
[UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md),
sección 3.9: selector `Auto / 1 / 2 / 3 / 4` con asignación `Comunidad` o
`Equipo seleccionado`, y responsable automático o elegido. La fórmula de
cooperación, la capacidad de coordinación, los rendimientos decrecientes y
el número útil de ayudantes quedan cerrados por `DESIGN-006` en §3.6
(`P09`), igual que la sustitución del responsable y el trabajo supervisado
en §3.7 (`P10`).

`4` es el tamaño habitual de un equipo operativo local, **no un límite del
motor**: una operación mayor se descompone en trabajos o equipos
relacionados (ver
[UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md),
sección 3.12).

**Límites de la cooperación.** No se permite:

- bonificación remota solo por figurar como responsable;
- sumar ayudantes ilimitados;
- promediar a todas las personas del grupo y penalizar al especialista por
  quien solo transporta;
- usar la mejor puntuación de cada miembro como si perteneciera a una sola
  persona;
- convertir al novato en experto temporal por acompañar al responsable;
- obtener revisiones completas e independientes sin dedicar tiempo real a
  realizarlas.

Si el responsable se ausenta o queda incapacitado, el progreso se conserva:
los pasos que otras personas pueden ejecutar continúan según la orden y su
capacidad; los que requieren al responsable pueden quedar pendientes. La
sustitución y la reasignación automática quedan cerradas en §3.7 (`P10`).

**Aprendices y especialistas complementarios.** Debe existir espacio para
que un aprendiz contribuya de forma útil sin dominar la parte técnica,
conectando con el aprendizaje por participación real (ver
[CHR-002](../30-characters/CHR-002_knowledge-and-learning.md)); no se fijan
aquí multiplicadores de experiencia. Un mecánico y un electricista pueden
repartirse fases o colaborar en una intervención si el procedimiento lo
permite, sin eliminar un requisito individual cuando una misma persona debe
ejecutar una operación que exige ambos conocimientos.

### 3.2 Órdenes de trabajo vinculadas al lugar

**ACORDADO.** La dedicación o modo de ejecución se decide en el trabajo
donde sucede, no como ajuste global del personaje. La misma persona puede
participar en un trabajo relajado en el taller y, después, en uno rápido en
otra localización, siguiendo cada orden por separado.

Información conceptual que una orden puede necesitar (no un esquema de base
de datos ni una pantalla definitiva; el vocabulario de trabajo, campos y
orígenes de trabajo vive en
[UI-003](../80-interface/UI-003_work-priority-taxonomy.md)):

| Información | Para qué sirve | Estado |
|---|---|---|
| Lugar y objetivo | Identifica dónde y sobre qué se actúa. | Esencial |
| Resultado buscado o método | Distingue, por ejemplo, recuperar materiales de despejar un acceso. | BASE PROPUESTA |
| Responsable y equipo | Organiza la cooperación (§3.1). | Interfaz cerrada en [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.9; fórmula de cooperación cerrada en §3.6 (`P09`) |
| Modo de ejecución | Expresa la intención con la que se aborda el trabajo (§3.3, §3.8). | Cerrado: dos dimensiones combinables de ritmo y atención |
| Dedicación o límite temporal | Permite fijar esfuerzo o momento de terminar/interrumpir. | Cerrado en §3.10 (`P13`) |
| Prioridad | Ordena la atención frente a otros trabajos, según la taxonomía de UI-003. | Conexión con prioridades existentes |
| Medios disponibles o asignados | Determina qué métodos son viables y evita usos incompatibles. | BASE PROPUESTA |
| Límites de riesgo o consumo | Evita decisiones autónomas que excedan la intención de quien juega. | BASE PROPUESTA |
| Progreso, fases y revisión pendiente | Conserva lo realizado e informa de lo que falta. | BASE PROPUESTA |

No se exige rellenar todos los campos en cada orden; se usan valores
habituales y opciones relevantes según el trabajo. Se ha propuesto que un
taller tenga valores predeterminados y una orden concreta pueda
modificarlos; esa herencia es una propuesta de interfaz, no una decisión
cerrada.

**Distinciones que no deben perderse.** Prioridad no es rapidez: un trabajo
prioritario puede requerir ejecución cuidadosa. Modo no es una característica
del personaje: sus necesidades y capacidades personales siguen influyendo,
pero no sustituyen la intención de la orden. Tiempo disponible no es trabajo
completado: una ventana de treinta minutos puede terminar con progreso
parcial.

### 3.3 Modos de ejecución: significado corregido

La primera propuesta de «ritmos» fue corregida: no es una escala
puramente mecánica de intensidad.

| Modo de trabajo | Intención | Lo que no significa |
|---|---|---|
| Exhaustivo / cuidadoso | Dedicar atención y trabajo a revisar, comprobar, preservar o cubrir en profundidad, según la tarea. | Simplemente reducir velocidad; garantizar éxito; obtener recursos nuevos. |
| Relajado | Trabajar sin apremio en una situación sin peligro ni urgencia temporal. | Registro más profundo por defecto; protección adicional; más habilidad. |
| Normal | Procedimiento y ritmo habituales para esa actividad. | Un multiplicador idéntico para todas las tareas. |
| Rápido | Priorizar terminar pronto en los pasos que admiten aceleración. | Convertir toda tarea básica en una tirada o ignorar límites físicos. |

Esta tabla queda formalizada como **dos dimensiones combinables** en §3.8
(cierra P11): ritmo (relajado/normal/rápido) y atención o alcance
(estándar/cuidadoso/exhaustivo), en lugar de cuatro modos mutuamente
excluyentes. No hace falta que «exhaustivo» y «cuidadoso» sean dos opciones
diferentes: pueden ser la misma intención con la etiqueta adaptada al
trabajo (exhaustivo al registrar, cuidadoso al desmontar).

**Registrar una vivienda.** Relajado: el lugar se considera seguro y no
urge terminar; se sigue el registro indicado con calma, sin añadir
automáticamente más zonas, más profundidad ni acceso a espacios cerrados.
Exhaustivo: se dedica trabajo a comprobar indicios y revisar más a fondo las
partes incluidas, reduciendo omisiones reales, no solo alargando una barra.
Ninguno de los dos implica atravesar paredes con percepción, abrir todo sin
autorización, ni hallar cualquier objeto por agotar tiempo.

**Desmontar una instalación.** Relajado: se trabaja sin presión, siguiendo
el procedimiento correspondiente. Cuidadoso: se presta atención adicional a
conservar piezas, preparar pasos delicados y comprobar antes de intervenir
(ver
[SET-009](../40-settlement/SET-009_disassembly-and-world-transformation.md)
para el modelo de desmontaje en sí). Ambos pueden tardar más que una
ejecución apresurada, pero por causas distintas: cuidadoso exige
concentración; relajado no implica mayor calidad.

**Selección y contexto real.** Elegir relajado no vuelve seguro el mundo:
debe distinguirse el peligro real de lo que el equipo conoce. Si aparece
una amenaza, el motor debe permitir reacción según la política cerrada en
§3.11 (`P14`). No se bloquea relajado mediante conocimiento omnisciente de
un peligro oculto: la disponibilidad visible y la conducta deben ser
coherentes con la información real del personaje y de quien juega.

**Interfaz y costes.** No se obliga a manejar dos dimensiones
independientes para una tarea sencilla; un modo puede agrupar
comportamientos internos pertinentes. No se imponen bonos universales del
tipo «exhaustivo = +20 % a todo»; cuidadoso no es la mejor opción sin
coste, ni relajado una opción deliberadamente inútil. Los rangos
conceptuales de efectos y costes por opción quedan cerrados en §3.9
(`P12`); su calibración exacta por familia de trabajo sigue siendo
parametrización de contenido.

### 3.4 Tiempo, dedicación, método y prioridad

Conceptos separados, sin convertir necesariamente cada uno en un menú:

- **Modo:** intención con la que se trabaja (§3.3).
- **Método:** procedimiento y alcance material de la intervención.
- **Tiempo dedicado:** trabajo efectivamente invertido.
- **Límite temporal:** hasta cuándo se autoriza continuar («hasta terminar»,
  «dedicar treinta minutos», «hasta el anochecer» son ejemplos, no un
  catálogo obligatorio).
- **Prioridad:** posición del trabajo frente a otras necesidades, según la
  taxonomía de [UI-003](../80-interface/UI-003_work-priority-taxonomy.md).

Al alcanzar el límite se registra lo realizado y lo pendiente; no se
completa artificialmente el trabajo ni se declara fracasado por no haberse
autorizado más tiempo. Más tiempo puede aumentar cobertura, permitir
comprobar, reducir prisas o producir información nueva; también consume
capacidad de la comunidad y puede prolongar exposición. No sustituye
componentes, conocimientos ni evidencia desaparecida.

Si el modo cambia durante la tarea, los efectos se aplican al trabajo
pertinente que todavía queda: cambiar a cuidadoso en el último instante no
mejora retroactivamente piezas ya dañadas. La política exacta de abandono
seguro de una fase delicada queda pendiente: detener una orden y detener
físicamente cualquier maniobra en cero tiempo no son necesariamente lo
mismo.

### 3.5 Estado, herramientas y entorno

**Estado de la persona.** Incluye descanso, fatiga, hambre, sed, dolor,
heridas, enfermedad, temperatura corporal, estrés, miedo, moral,
intoxicación, concentración, carga, postura y tiempo trabajando. No todos
afectan a todas las acciones ni todos requieren un modificador visible. Un
estado temporal cambia el rendimiento pertinente, no borra conocimientos:
una lesión de mano y una pérdida de concentración pueden afectar a tareas
distintas.

**BASE PROPUESTA.** Las condiciones normales se toman como referencia, sin
acumular bonificaciones permanentes por estar alimentado, hidratado y
descansado, y sin contar una misma causa varias veces por caminos derivados.
Con dos características o dos habilidades, no se duplica el cansancio
aplicándolo a cada valor y volviendo a restarlo en el resultado global sin
una decisión expresa.

**Herramientas y equipamiento.** Un objeto puede: habilitar un método;
aumentar ritmo o reducir esfuerzo; mejorar precisión, conservación o
información; cambiar ruido, desgaste y consumo; reducir consecuencias de un
incidente. Estas funciones no se tratan como un mismo «+2»: una herramienta
improvisada puede permitir un trabajo más lento, y otra puede hacer viable
un procedimiento antes imposible. Una herramienta potente no conserva mejor
los materiales si se usa de forma destructiva. En escalada, se distingue
capacidad de movimiento, acceso mediante un sistema utilizable y protección
frente a consecuencias; un arnés aislado no otorga protección autónoma, y un
equipo solo cuenta como funcional si realmente puede usarse. Estas
distinciones son abstracciones del videojuego, no instrucciones de
seguridad real. El modelo de objeto y de herramienta como recurso vive en
[SET-008](../40-settlement/SET-008_object-model-and-logistics-families.md#5-herramientas);
este documento solo define cómo una herramienta modula la resolución.

**Entorno.** Incluye iluminación, clima, temperatura, terreno, altura,
espacio, obstáculos, humo, ruido, superficies, contaminación y amenazas
cuando sean pertinentes. Se distinguen dos efectos: la condición dificulta
observar o actuar, o la condición cambia físicamente el mundo. La lluvia
puede dificultar leer un rastro y también destruirlo; una buena comprobación
no recupera una pista que ya no existe. La luz mejora lo observable, no el
contenido de la vivienda.

**Dificultad.** Corresponde a un objetivo y un método en unas condiciones:
«despejar un acceso» y «retirar una pared conservando materiales» no
comparten necesariamente requisitos ni consecuencias. En B puede influir en
la probabilidad; en D puede intervenir en trabajo necesario, ritmo,
precisión y fases. No se duplica accidentalmente la misma dificultad en
todos los ejes. Los umbrales y la clasificación (trivial, normal, difícil,
extrema) siguen pendientes (PENDIENTE).

### 3.6 Cooperación por funciones y rendimientos decrecientes (cierra P09)

No existe una «habilidad media del equipo» ni un superpersonaje formado con
el mejor valor de cada integrante (§3.1). Cada acción puede declarar:
mínimo de personas; número recomendado; máximo útil simultáneo; funciones
posibles; requisitos individuales o compartidos; limitaciones de espacio,
acceso y herramientas; partes paralelizables (ver también
[UI-006 §3.11](../80-interface/UI-006_contextual-place-interaction-and-teams.md#311-capacidad-y-límites-propios-de-cada-acción)).

Funciones aprobadas cuando aporten algo real: responsable; ejecutor técnico
o principal; ayudante operativo; apoyo logístico; revisor; vigilancia o
retaguardia (coherente con §3.1).

**Contribución al progreso D.** Para una tarea compartida no plenamente
paralelizable, la referencia cerrada de contribución máxima adicional al
ritmo principal es:

| Participación | Contribución máxima adicional al ritmo principal |
|---|---:|
| Ejecutor principal | 100 % de su ritmo |
| Primer ayudante útil | hasta 60 % |
| Segundo ayudante útil | hasta 35 % |
| Tercer ayudante útil | hasta 20 % |

La contribución real depende de idoneidad, función, espacio, medios y
coordinación: no es una bonificación garantizada, y estos porcentajes son
un techo, no una entrega automática.

**Contribución a B.** Para calidad o incertidumbre resuelta mediante
[ARC-006 §3.9](ARC-006_action-and-event-resolution-model.md#39-modelo-b-margen-azar-acotado-y-bandas-cierra-p04):

- se usa la capacidad de quien ejecuta la fase, no una media del grupo;
- un ayudante puede habilitar el método, eliminar una penalización causal,
  reducir dificultad, aportar una revisión o asumir otra fase, pero no
  transfiere su habilidad completa al ejecutor;
- un especialista complementario resuelve su aportación real (por ejemplo,
  una fase distinta que exige su conocimiento), no fusiona puntuaciones con
  el resto del equipo;
- Liderazgo (ver
  [CHR-006 §3.3.30](../30-characters/CHR-006_characteristics-and-skill-catalog.md#33-catálogo-completo-de-34-habilidades-base))
  mejora coordinación y traspasos cuando sea pertinente, pero no sustituye
  conocimientos técnicos;
- una tarea verdaderamente paralela se divide en trabajos o frentes
  relacionados en lugar de acumular ayudantes ilimitados (ver
  [UI-006 §3.12](../80-interface/UI-006_contextual-place-interaction-and-teams.md#312-operaciones-de-más-de-cuatro-personas)).

Se conserva sin cambios el selector `Auto / 1 / 2 / 3 / 4`, la asignación
`Comunidad` o `Equipo seleccionado` y el hecho de que `4` no es un límite
del motor, ya cerrados en
[UI-006 §3.9](../80-interface/UI-006_contextual-place-interaction-and-teams.md#39-equipo-operativo-local-tamaño-y-asignación)
y
[§3.12](../80-interface/UI-006_contextual-place-interaction-and-teams.md#312-operaciones-de-más-de-cuatro-personas).

### 3.7 Responsable, ejecutor, supervisor y sustitución (cierra P10)

Estas funciones son separables, aunque una misma persona pueda ocuparlas
todas cuando la escala lo permita:

- **Responsable:** mantiene el objetivo, coordina y toma decisiones del
  trabajo.
- **Ejecutor principal:** realiza la fase técnica o material principal.
- **Supervisor:** habilita o guía pasos que otras personas pueden realizar.

**Selección automática**, en este orden: (1) requisitos y conocimiento del
método; (2) capacidad pertinente; (3) estado y disponibilidad; (4)
experiencia con el objetivo o procedimiento; (5) Liderazgo como criterio de
coordinación, nunca como sustituto técnico. El jugador puede elegir
manualmente responsable y equipo en cualquier momento.

**Si el responsable deja de participar:**

- continúan las tareas auxiliares seguras y autorizadas;
- se detienen las fases que necesiten su presencia, decisión o
  conocimiento;
- una persona cualificada puede asumir el rol;
- el progreso se conserva (R15);
- el relevo necesita tiempo de puesta al día proporcional a registros,
  complejidad y comunicación;
- nadie recibe mágicamente el conocimiento tácito del responsable.

**Supervisión.** Exige presencia, atención o comunicación realmente
utilizable; en tareas delicadas o de riesgo suele ser `1:1`; en rutinas
guiadas puede cubrir a dos o más personas si el método lo permite; consume
parte de la atención y tiempo del supervisor; no concede bonificación
remota por figurar en la orden; permite ejecutar pasos transferibles del
método (§3.11 de
[ARC-006](ARC-006_action-and-event-resolution-model.md#311-requisitos-duros-e-improvisación-por-método-cierra-p06)),
no delegar técnicas intransferibles.

### 3.8 Modos en dos dimensiones combinables (cierra P11)

Se sustituye la lectura de cuatro modos mutuamente excluyentes por **dos
dimensiones internas**, que reemplazan a la tabla de §3.3 como modelo
cerrado:

**Ritmo:**

| Opción | Significado |
|---|---|
| Relajado | Sin apremio, con pausas naturales y dentro de una situación que el equipo considera segura. |
| Normal | Ritmo habitual del procedimiento. |
| Rápido | Prioriza terminar antes en los pasos que admiten aceleración. |

**Atención o alcance:**

| Opción | Significado |
|---|---|
| Estándar | Profundidad normal del método. |
| Cuidadoso | Prioriza precisión, conservación, preparación y reducción de errores evitables dentro del alcance elegido. |
| Exhaustivo | Amplía cobertura, comprobaciones o profundidad de búsqueda dentro del alcance físico y metodológico posible. |

Las dimensiones son combinables cuando tengan sentido: relajado y
exhaustivo, normal y cuidadoso, rápido y estándar, o incluso rápido y
cuidadoso en una urgencia que requiera ambas intenciones. La interfaz
puede ofrecer presets contextuales y ocultar opciones irrelevantes; no se
obliga al jugador a gestionar controles sin efecto en una tarea simple.

`Relajado` no significa exhaustivo, cuidadoso, seguro de forma omnisciente
ni mejor calidad. `Exhaustivo` no significa omnisciencia. `Cuidadoso` no
garantiza éxito. Esta separación corrige de forma definitiva cualquier
lectura de los cuatro modos de §3.3 como categorías mutuamente excluyentes.

### 3.9 Efectos y costes de ritmo y atención (cierra P12)

Rangos cerrados como **marco de diseño**, no como multiplicadores
universales aplicados a toda acción; cada familia declara qué ejes son
pertinentes:

| Opción | Efectos y costes posibles |
|---|---|
| Relajado | Pausas naturales, menor presión y menor acumulación de estrés/fatiga en trabajos largos seguros; no mejora cobertura ni calidad por sí mismo. |
| Normal | Referencia de la familia de trabajo. |
| Rápido | Reducción aproximada del tiempo de `20–35 %` donde se pueda acelerar; puede aumentar fatiga, ruido, desgaste, omisiones, consumo o exposición. |
| Cuidadoso | Aumento aproximado del tiempo de `25–50 %`; puede mejorar conservación, precisión, calidad o reducción de errores evitables. |
| Exhaustivo | Aumento aproximado del trabajo de `50–200 %` según alcance; mejora cobertura y oportunidades de detectar o comprobar, pero alarga fatiga y exposición. |

No se aplican todos los efectos a la vez ni se convierte una opción en
universalmente óptima. El cambio de modo afecta solo al trabajo pendiente:
no repara retroactivamente una pieza, no mejora una zona ya revisada y no
devuelve recursos consumidos (§3.4).

### 3.10 Límites temporales, prioridad e herencia (cierra P13)

Un taller, edificio, zona o tipo de trabajo puede conservar políticas
predeterminadas de: equipo habitual; ritmo y atención; horario; prioridad;
riesgo admitido; herramientas preferidas; reglas de repetición.

Al crear una orden, esta **copia** los valores vigentes. Cambiar después el
lugar no modifica silenciosamente una orden ya iniciada; debe existir una
acción explícita para aplicar la nueva política.

Límites posibles, mostrados solo cuando sean pertinentes: hasta completar;
hasta una hora o momento; durante una cantidad de trabajo; hasta el
anochecer; hasta producir, recuperar o almacenar una cantidad; hasta
gastar un presupuesto; hasta alcanzar un punto seguro.

Al alcanzar el límite: se conserva todo el progreso; se completa
únicamente el paso mínimo necesario para detenerse con seguridad; se
actualizan y liberan reservas según corresponda; se informa de lo
realizado y lo pendiente; no se declara fracaso por no haber autorizado
más tiempo.

Prioridad decide qué se atiende antes; no equivale a rapidez, riesgo,
método ni calidad, coherente con la taxonomía de
[UI-003](../80-interface/UI-003_work-priority-taxonomy.md).

### 3.11 Respuesta ante cambios, pérdida de medios y amenazas (cierra P14)

Políticas cualitativas cerradas:

| Política | Conducta general |
|---|---|
| Prudente | Se detiene y reevalúa ante cualquier riesgo nuevo relevante. |
| Estándar | Continúa ante cambios menores; pausa si el método deja de ser válido o aparece peligro real. |
| Decidida | Acepta riesgos conocidos dentro del límite autorizado de la orden. |
| Emergencia | Prioriza salvar vidas o contener el desastre sin ignorar límites físicos. |

Reglas de cierre:

- perder un requisito imprescindible bloquea únicamente la fase afectada;
- un peligro inmediato permite autoprotección o retirada sin esperar una
  orden;
- un cambio menor recalcula lo pendiente, no el pasado;
- personalidad, miedo, disciplina, lealtad, autonomía y relación con el
  responsable pueden modificar la reacción (ver
  [CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md));
- una orden no convierte a la persona en un dron suicida;
- elegir relajado no vuelve seguro un peligro oculto;
- una persona puede malinterpretar el riesgo por conocimiento imperfecto
  (ver
  [ARC-008 §3.8](ARC-008_outcomes-knowledge-events-and-validation.md#38-conocimiento-imperfecto-y-comunicación-cierra-p16));
  toda interrupción conserva progreso, estado, consumo y conocimiento.

Coherente con
[CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md),
[UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md#314-interrupciones),
[THR-001](../60-threats/THR-001_zombie-threat-model.md) y con la cadena de
eventos y pausa de
[ARC-008 §3.12](ARC-008_outcomes-knowledge-events-and-validation.md#312-eventos-causalidad-avisos-y-pausa-cierra-p20)
(`P20`).

## 4. Reglas aprobadas

- Un responsable y aportaciones reales, no la acumulación de personas,
  determinan el resultado de un trabajo en equipo (R10, §3.1).
- El modo y la dedicación se configuran en la orden del lugar, nunca como
  rasgo permanente del personaje (R11, §3.2–§3.3).
- Relajado expresa ausencia de peligro y urgencia; exhaustivo/cuidadoso
  expresa profundidad, atención o conservación; no son la misma escala
  (R12, §3.3).
- Un cambio de modo o de responsable no revierte retroactivamente daño,
  progreso o gasto ya ocurrido (§3.3–§3.4).
- La contribución máxima de ayudantes al progreso D sigue rendimientos
  decrecientes (100 %/60 %/35 %/20 %) y nunca transfiere habilidad completa
  en B (§3.6).
- Responsable, ejecutor principal y supervisor son funciones separables con
  selección automática y sustitución cerradas (§3.7).
- El modo se expresa mediante dos dimensiones combinables, ritmo y
  atención, nunca como cuatro opciones mutuamente excluyentes (§3.8).
- Los efectos y costes de cada opción de ritmo y atención son un marco de
  diseño, no multiplicadores universales por acción (§3.9).
- Una orden copia las políticas vigentes del lugar al crearse; cambiar el
  lugar después no altera silenciosamente una orden ya iniciada (§3.10).
- La respuesta ante amenazas y pérdida de medios sigue una de cuatro
  políticas cualitativas cerradas, sin convertir a nadie en un dron
  suicida (§3.11).

## 5. Interacciones con otros sistemas

- Depende del procedimiento común, las capacidades efectivas y los modelos
  B/D de [ARC-006](ARC-006_action-and-event-resolution-model.md).
- La función de Liderazgo como habilidad social, no como característica, se
  define en
  [CHR-006](../30-characters/CHR-006_characteristics-and-skill-catalog.md#33-catálogo-completo-de-34-habilidades-base)
  (habilidad 30, Liderazgo).
- Las decisiones autónomas de una persona ante una amenaza durante un
  trabajo relajado dependen de
  [CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md).
- El vocabulario de trabajo, campos, prioridad y orígenes de trabajo es
  propiedad de [UI-003](../80-interface/UI-003_work-priority-taxonomy.md).
- La interfaz de interacción contextual con un lugar, el selector
  `Auto / 1 / 2 / 3 / 4` y los modos de asignación son propiedad de
  [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md);
  este documento conserva la cooperación, el responsable, los modos y las
  condiciones del motor.
- Continúa en
  [ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md) para
  resultados, incidencias y eventos derivados de estas condiciones.
- La decisión transversal que respalda el cierre de este documento es
  [DEC-0011](../decisions/DEC-0011_hybrid-resolution-engine-and-capability-presentation.md);
  la trazabilidad completa vive en
  [DISC-0005](../discovery/DISC-0005_resolution-engine-closure-traceability.md).
- La cooperación por porte coordinado de un traslado, y las políticas de
  respuesta a amenaza que pueden dejar carga abandonada, se aplican según
  [SET-010 §3.10](../40-settlement/SET-010_local-hauling-and-transport.md#310-cooperación-y-seguridad),
  sin que ese documento redefina esta sección.

## 6. Casos límite o riesgos

- «El personaje tiene un ritmo global para todas sus actividades» queda
  corregido: se configura la orden de trabajo en el lugar (§3.2).
- «Relajado equivale a más lento y, por eso, más minucioso» queda
  corregido: relajado responde a falta de peligro y urgencia, no a
  profundidad adicional (§3.3).
- «Exhaustivo es el extremo lento de una escala de velocidad» queda
  corregido: expresa trabajo a fondo, atención y comprobación pertinente
  (§3.3).
- «Un ayudante aporta siempre el mismo bono» queda corregido: la
  contribución depende de lo que hace, puede hacer y permite el trabajo
  (§3.1, §3.6).
- «Cuatro modos mutuamente excluyentes» queda corregido: dos dimensiones
  combinables de ritmo y atención (§3.8).
- «El responsable ausente sigue mejorando el trabajo a distancia» queda
  corregido: sin presencia o aportación efectiva no hay bonificación
  remota (§3.7).

## 7. Preguntas abiertas

**`P09`–`P14` quedan cerradas por `DESIGN-006`**: fórmula de cooperación y
rendimientos decrecientes por número de ayudantes (§3.6); elección,
sustitución y supervisión del responsable (§3.7); dos dimensiones
combinables de modo, sin cuatro opciones excluyentes (§3.8); efectos y
costes conceptuales de cada opción de ritmo y atención (§3.9); límites de
tiempo, herencia del lugar y prioridad (§3.10); respuesta ante amenazas,
pérdida de medios y cambio de condiciones (§3.11). Quedan abiertas, como
parametrización de contenido y no como reapertura del modelo: los
umbrales exactos de dificultad (trivial/normal/difícil/extrema, §3.5), la
política exacta de abandono seguro de una fase delicada en tiempo cero
(§3.4) y el máximo útil concreto por familia de acción (ver
[UI-006 §7](../80-interface/UI-006_contextual-place-interaction-and-teams.md#7-preguntas-abiertas)).
El estado final de todo el motor vive en
[ARC-008 §4](ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas).

## 8. Ejemplos no normativos

Ninguno adicional a los incluidos en el modelo funcional (§3), ya marcados
como EJEMPLO en su contexto.
