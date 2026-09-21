---
id: ARC-007
title: Cooperación con líder, órdenes del lugar, modos de ejecución y condiciones
status: draft
canonical_for:
  - trabajo en equipo con un responsable
  - información conceptual de una orden ligada al lugar
  - significado de relajado, exhaustivo/cuidadoso, normal y rápido
  - estado de la persona, herramientas, entorno y dificultad en la resolución
depends_on:
  - ARC-006
related:
  - ARC-008
  - CHR-001
  - CHR-003
  - UI-003
  - UI-006
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
`Equipo seleccionado`, y responsable automático o elegido. Ese cierre es de
**interfaz**, no de motor: la fórmula de cooperación, la capacidad de
coordinación, los rendimientos decrecientes y el número útil de ayudantes
siguen pendientes (`P09`), igual que la sustitución del responsable y el
trabajo supervisado (`P10`). Este documento permanece `draft` por esa razón.

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
sustitución o reasignación automática es una decisión por documentar, no una
regla cerrada (PENDIENTE, ver P10 en
[ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas)).

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
| Responsable y equipo | Organiza la cooperación (§3.1). | Interfaz de tamaño y asignación cerrada en [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.9; fórmula de cooperación pendiente (`P09`) |
| Modo de ejecución | Expresa la intención con la que se aborda el trabajo (§3.3). | Configuración en la orden, acordada |
| Dedicación o límite temporal | Permite fijar esfuerzo o momento de terminar/interrumpir. | Idea planteada; opciones pendientes |
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

Normal y rápido siguen sujetos a cierre y calibración (PENDIENTE, P11–P12).
No hace falta que «exhaustivo» y «cuidadoso» sean dos opciones diferentes:
pueden ser la misma intención con la etiqueta adaptada al trabajo (exhaustivo
al registrar, cuidadoso al desmontar).

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
una amenaza, el motor debe permitir reacción; sigue pendiente si el
responsable cambia temporalmente de modo, interrumpe, solicita instrucciones
o aplica una política previamente fijada (PENDIENTE, P14). No se bloquea
relajado mediante conocimiento omnisciente de un peligro oculto: la
disponibilidad visible y la conducta deben ser coherentes con la
información real del personaje y de quien juega.

**Interfaz y costes.** No se obliga a manejar cuatro ejes independientes
para una tarea sencilla; un modo puede agrupar comportamientos internos
pertinentes. No se imponen bonos universales del tipo «exhaustivo = +20 % a
todo»; cuidadoso no es la mejor opción sin coste, ni relajado una opción
deliberadamente inútil. Los efectos concretos sobre tiempo, concentración,
esfuerzo, conservación y exposición requieren diseño posterior por familia
de trabajo.

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
  (§3.1).

## 7. Preguntas abiertas

Ver la lista completa `P01`–`P22` en
[ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas).
Las que afectan directamente a este documento son `P09`–`P14` (fórmula de
cooperación y número útil de ayudantes; elección y sustitución del
responsable; lista final de modos y su denominación por tarea; efectos y
costes de cada modo por familia; límites de tiempo, herencia del lugar y
prioridad; respuesta ante amenazas o cambio de condiciones durante un modo
relajado).

## 8. Ejemplos no normativos

Ninguno adicional a los incluidos en el modelo funcional (§3), ya marcados
como EJEMPLO en su contexto.
