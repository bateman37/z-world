---
id: ARC-008
title: Resultados, conocimiento imperfecto, eventos y validación del motor
status: approved
canonical_for:
  - separación entre error, fallo, incidencia, peligro y gravedad
  - cuatro capas de existencia, percepción, comprensión y aprovechamiento
  - familias de eventos y su relación con el mundo persistente
  - casos de validación documental del motor
  - cierre de las decisiones P01–P22 del motor de resolución
  - persistencia aleatoria y equivalencia entre velocidades de simulación
  - presentación visible del nivel actual y del potencial oculto
depends_on:
  - ARC-006
  - ARC-007
related:
  - CHR-006
  - CHR-007
  - SET-008
  - SET-009
  - WLD-002
  - WLD-004
  - UI-004
  - UI-006
  - WLD-010
  - WLD-011
  - SET-010
  - SET-011
  - DEC-0011
---

## 1. Propósito

Cerrar el motor de acciones, trabajos y eventos ([ARC-006](ARC-006_action-and-event-resolution-model.md),
[ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md)) con las capas de
**qué produce una resolución**, cómo se representa el conocimiento
imperfecto, cómo se resuelven eventos y consecuencias sistémicas, cómo se
aplica el procedimiento a las distintas familias de acciones del juego, qué
invariantes de persistencia y rendimiento conceptual deben respetarse, y qué
debe mostrarse a quien juega. Mediante `DESIGN-006`, este documento cierra
las últimas ocho decisiones de calibración del motor (`P15`–`P22`:
resultados multidimensionales y críticos, conocimiento imperfecto,
reintentos, oposición, aprendizaje, eventos, persistencia aleatoria y
presentación visible), completando junto con
[ARC-006](ARC-006_action-and-event-resolution-model.md) y
[ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md) el cierre
íntegro de las 22 decisiones `P01`–`P22`, y amplía los casos de validación
documental de 19 a 24 o más.

## 2. Principios que no deben romperse

- Error de ejecución, fallo del objetivo, incidencia, peligro y gravedad no
  son sinónimos (R17).
- Quien juega comprende las causas principales sin gestionar dados visibles
  ni recibir un aviso por cada cálculo (R18).
- Progreso, gastos, daños, inspecciones y conocimiento son persistentes
  (R15); reintentar exige esfuerzo o cambios pertinentes, nunca lotería
  gratuita ni bloqueo eterno (R16).
- El mismo trabajo y exposición no deben volverse más peligrosos solo
  porque la simulación se actualiza más veces o a mayor velocidad.

## 3. Modelo funcional

### 3.1 Resultados, incidencias, conocimiento y reintentos

**Resultado multidimensional, no diez tiradas obligatorias.** Un resultado
puede modificar estado del objetivo, progreso, calidad, conservación,
consumo, ruido, desgaste, fatiga, información, duración o daño. No todos los
ejes son pertinentes en todas las acciones; un resultado coherente puede
producir varios efectos vinculados sin sortearlos independientemente, y no
se aplican todas las penalizaciones posibles a la vez por un mal resultado.

**Separaciones esenciales (R17):**

| Concepto | Significado |
|---|---|
| Error de ejecución | La persona no realiza bien una parte. |
| Fallo del objetivo | No se alcanza lo pretendido. |
| Incidencia | Ocurre algo durante el proceso. |
| Peligro | Existe una condición con capacidad de causar consecuencias. |
| Gravedad | Magnitud de lo ocurrido. |

Una pieza dañada no equivale a una lesión; un trabajo bien ejecutado no
elimina amenazas externas; un equipo de protección puede mitigar
consecuencias sin mejorar la calidad técnica. No se inventa una amenaza
equivalente para compensar una buena planificación: si se reduce un riesgo
real, la mejora se conserva.

**Grados de resultado, adaptados por familia.** No existe una tabla
universal única de éxito excepcional / éxito / parcial / con coste / fallo
recuperable / fallo grave / retraso / progreso parcial. Los resultados se
adaptan a la tarea, por ejemplo: en reparación, funcional / provisional /
pendiente de repuesto / intervención incompleta / daño localizado; en
comprensión, conclusión / hipótesis parcial / incertidumbre / error
plausible; en recuperación, material conservado / deteriorado / inaccesible
(ver
[SET-009](../40-settlement/SET-009_disassembly-and-world-transformation.md));
en trabajo rutinario, avance y resultado esperado, sin dramatización
obligatoria.

**Críticos y pifias (cierra P15, cierre completo en §3.7).** Interesa que
mayor competencia eleve resultados excepcionales y reduzca fallos graves.
El mecanismo cerrado es el margen y las cinco bandas del modelo B de
[ARC-006 §3.9](ARC-006_action-and-event-resolution-model.md#39-modelo-b-margen-azar-acotado-y-bandas-cierra-p04),
no el reparto porcentual siguiente, que queda como ejemplo ilustrativo
descartado, no aprobado, de dividir una probabilidad de éxito `p`:

> `Excepcional = 0,10 × p` · `Éxito normal = 0,90 × p` ·
> `Fallo normal = 0,90 × (1 − p)` · `Fallo grave = 0,10 × (1 − p)`

Con éxito efectivo del 90 %, produce 9 %/81 %/9 %/1 %; con 80 %, produce
8 %/72 %/18 %/2 %. No se fija esta regla por defecto: implica que el total
de resultados extremos permanece en el 10 % y que un 10 % de los fallos
serían graves, lo cual debe decidirse por tarea. Un fallo grave de calidad
no se traduce siempre en accidente: bajo independencia, un 1 % de accidente
por acción produce aproximadamente un 63,4 % de probabilidad de al menos uno
en cien acciones; esto es una advertencia matemática, no una tasa propuesta.

**Cuatro capas que nunca deben fusionarse (R02):**

1. Lo que existe realmente.
2. Lo que se percibe.
3. Lo que se comprende o se cree comprender.
4. Lo que puede aprovecharse.

Una caja puede existir sin que nadie la haya visto; alguien puede observar
una instalación sin comprenderla; comprender un fallo no implica disponer de
la herramienta necesaria para repararlo. Estas capas son la base de la
recuperación dependiente de la persona ya definida en
[WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md).

**Registro y descubrimiento.** El tiempo de inspección, el método y el modo
exhaustivo (ver
[ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#33-modos-de-ejecución-significado-corregido))
determinan qué se revisa y con qué profundidad; B puede resolver
oportunidades significativas de detección, D puede representar el trabajo de
inspeccionar. Completar una inspección no garantiza descubrir todo lo que
existe fuera de su alcance: «registro exhaustivo» tiene un alcance físico y
metodológico, no omnisciencia. Un resultado excelente puede mejorar la
interpretación o conservación de lo existente; no añade botín, habitaciones,
cables ni averías que no estuvieran ya generados (R01; ver
[ARC-002](ARC-002_procedural-generation-and-persistence.md) para generación
diferida reproducible).

**El ejemplo del Excel.** Se conserva expresamente esta intención de
diseño: una persona competente revisa un documento y no detecta un
problema; más tarde, con calma, descanso, otro enfoque o nueva evidencia,
puede comprenderlo. El modelo permite esa variación sin cambiar
retrospectivamente la verdad, sin hacer incompetente al personaje y sin
resolverlo mediante intentos gratuitos.

**Información y confianza (cierra P16, desarrollo completo en §3.8).** Se distinguen observaciones,
hipótesis, grado de confianza y autoría de la interpretación: la interfaz
puede decir «cree que la avería está en este componente; falta comprobarlo»
en lugar de afirmar como verdad omnisciente un diagnóstico que después
cambia. El conocimiento puede ser individual y compartirse según los
mecanismos ya definidos en
[CHR-002](../30-characters/CHR-002_knowledge-and-learning.md); un
descubrimiento no se teletransporta a toda la comunidad. La información
equivocada debe ser plausible y comunicable; su frecuencia y efectos siguen
pendientes, sin introducir errores permanentes por mantener drama.

**Reintentos, interrupciones y memoria.** Un intento es un episodio con
objetivo, método, participantes, condiciones y trabajo comprometido, no
solo un número aleatorio. Persisten zonas revisadas, profundidad, indicios,
materiales utilizados, piezas dañadas, progreso y conclusiones
provisionales. Una nueva inspección tiene sentido por más dedicación real,
una nueva zona, otra perspectiva, herramientas distintas, descanso o
información añadida; no es obligatorio que cambie una condición externa cada
vez, pero sí que exista un nuevo esfuerzo o procedimiento significativo. No
se permite bloqueo arbitrario («falló una vez, nunca puede volver a
entenderlo») ni lotería gratuita («pulsar de nuevo hasta obtener el
resultado, sin tiempo ni memoria»). Cancelar, guardar/cargar, cambiar de
trabajador o alternar modo no regenera materiales ni borra costes; las
condiciones relevantes que cambian pueden influir en lo pendiente, pero
persistencia no significa congelar al inicio todo el resultado de un
trabajo de varios días. Si una pieza se deterioró, rehacer o reparar es
otro trabajo real; si solo falta terminar una inspección, continuar no
exige volver a empezar. Las políticas concretas de reintento automático,
consumo máximo y petición de ayuda quedan cerradas en §3.9 (cierra P17).

### 3.2 Eventos y consecuencias sistémicas

**BASE PROPUESTA.** No todo evento es una acción de una persona ni necesita
una comprobación de habilidad: el cambio de una condición ambiental, la
llegada de una amenaza o el agotamiento de un recurso pueden tener causas
propias. Se distingue el suceso real, la reacción del equipo y lo que las
personas llegan a saber de él.

**Familias conceptuales, no un catálogo cerrado de sucesos:**

| Familia de evento | Ejemplo de juego | Relación con la resolución |
|---|---|---|
| Consecuencia de una acción | Una sección queda desmontada o una reparación queda provisional. | Aplica lo resuelto por la acción; no vuelve a sortear el mismo resultado. |
| Cambio de condición | Empeora la luz, aumenta la fatiga o una herramienta deja de estar disponible. | Actualiza fases pendientes y capacidades pertinentes. |
| Descubrimiento o interpretación | Se detecta una pista o se reconoce una avería. | Actualiza conocimiento sin generar retroactivamente el contenido. |
| Interrupción o amenaza | El equipo detecta peligro durante el trabajo. | Abre una decisión o reacción según órdenes, capacidades y política de autonomía (ver [CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md)). |
| Hito o límite | Termina una fase o se alcanza el tiempo autorizado. | Conserva progreso y determina continuidad, pausa o finalización. |
| Incidencia contextual | Se deteriora una pieza durante una intervención. | Necesita causa, exposición y consecuencias coherentes. |
| Consecuencia social o narrativa | Alguien reacciona a una decisión o recuerda lo ocurrido. | Conecta con relaciones y memoria; no obliga a un conflicto aleatorio. |

Para cada familia se documenta qué la desencadena, qué condiciones requiere,
qué entidades afecta, qué cambia, quién puede conocerlo y si necesita
reacción; también si el resultado ya está determinado por una acción
anterior, si depende de incertidumbre nueva o si es una evolución prevista
del mundo. No se resuelve de nuevo una consecuencia ya establecida: si un
material se rompió durante la extracción, el evento informa y actualiza ese
daño, sin ofrecer otra oportunidad de decidir que salió intacto.

**Ejemplo de cadena causal.** Un equipo trabaja en una vivienda; una
herramienta o método produce ruido; el sistema del mundo determina si hay
una amenaza en condiciones de reaccionar; el equipo puede detectarla según
visibilidad, atención y vigilancia; la orden y la autonomía determinan la
respuesta. No se crea automáticamente un zombi por cada fallo de
carpintería, ni se equipara ruido con aparición instantánea de un enemigo;
tampoco se impiden sucesos propios de exploración o llegada de grupos
cuando correspondan al generador y al estado del mundo. Lo prohibido es
inventarlos como compensación arbitraria de una buena o mala ejecución. El
detalle del sistema de ruido, la conducta de amenazas y el director
narrativo pertenece a sus propios módulos; aquí solo se describen las
conexiones.

**Cadenas, coherencia y repetición.** Una consecuencia no debe aplicarse
varias veces por recibir repetidamente la misma notificación; no se inician
bucles de «cambia el estado → repite la comprobación → vuelve a cambiar el
estado» sin avance ni tiempo. No se convierte cada evento interno en un
mensaje a quien juega; la cadena causal, los niveles de atención y la
agrupación de avisos quedan cerrados en §3.12 (cierra P20).

### 3.3 Aplicación a las familias de acciones

No se diseñan aquí todas las reglas específicas de cada familia, pero el
procedimiento común debe servir sin forzar la misma fórmula:

| Familia | Qué resuelve | Capacidades, equipo y modo | Límite esencial |
|---|---|---|---|
| Percepción y búsqueda | Cobertura, señales detectadas y evidencia accesible. | Combinación de características/habilidades pertinentes; el modo exhaustivo y la revisión tienen coste. | No crea objetos ni revela lo que el método no alcanza. |
| Comprensión y diagnóstico | Interpretación de evidencias y confianza. | Medias cuando se requieren dos competencias; aportaciones de especialistas según participación. | No sustituye conocimiento indispensable por suerte o por horas acumuladas. |
| Construcción y desmontaje | Progreso, conservación y estado físico. | D para trabajo, B para pasos inciertos, funciones útiles del equipo. | No genera más materiales que los existentes ni los duplica al terminar (ver [SET-009](../40-settlement/SET-009_disassembly-and-world-transformation.md)). |
| Producción y cocina | Trabajo, transformación y resultados pertinentes. | Rutinas directas, herramientas y capacidades según receta o método. | No impone fallos dramáticos a toda actividad básica. |
| Supervivencia y rastreo | Búsqueda de recursos existentes, lectura de señales y desplazamiento. | Atención, conocimientos, entorno y ayuda real. | No convierte un rastro destruido en uno recuperable por un crítico. |
| Movimiento y escalada | Viabilidad del recorrido, esfuerzo y tramos inciertos. | Método y equipo funcional separan acceso, ejecución y protección. | No reduce toda la seguridad a una bonificación universal. |
| Combate y oposición | Contacto, evasión, efecto, posición o detección. | Capacidad efectiva, herramientas, condiciones y ventanas de resolución. | No garantiza un impacto por llenar una barra; el combate detallado se diseña en su propio módulo. |
| Investigación y aprendizaje | Trabajo de estudio, evidencias y comprensión. | Capacidades, materiales de conocimiento y mentores (ver [CHR-002](../30-characters/CHR-002_knowledge-and-learning.md)). | No desbloquea tecnología solo por acumular progreso. |
| Interacción social | Respuestas plausibles, acuerdos, información o cambios limitados. | Capacidades pertinentes, contexto, relaciones y preparación. | No controla mentalmente a otro personaje mediante una puntuación alta. |

**Oposición activa y pasiva (cierra P18, desarrollo completo en §3.10).**
Para sigilo frente a observación, ataque frente a defensa o engaño frente a
lectura de intenciones, existe oposición activa resuelta mediante una única
comprobación de margen relativo, no dos comprobaciones independientes. La
resolución respeta oportunidades significativas: no se compara a cada
personaje con todos los demás en cada paso del mapa.

**Caza y pesca no generan existencias retrospectivas.** Se distingue
localizar una oportunidad, acceder, ejecutar y recuperar lo obtenido: una
buena ejecución no aumenta retrospectivamente la población ni coloca una
presa donde no podía estar. Si el sistema ecológico o el generador crea
oportunidades a lo largo del tiempo, esa es una regla del mundo
independiente de premiar la habilidad con existencias inventadas.

### 3.4 Aprendizaje y conexión con otros módulos

**Cierra P19 (fórmula conceptual completa en §3.11).** Se aprende por
participación real: un aprendiz que ayuda de forma pertinente puede
progresar; estar cerca sin intervenir no equivale a practicar todos los
conocimientos del especialista (ver
[CHR-002](../30-characters/CHR-002_knowledge-and-learning.md)). No se
duplica automáticamente la experiencia porque una acción use
dos habilidades, ni se aplica la media de ejecución como regla de reparto de
experiencia sin haberlo decidido. Se distingue información compartida de
habilidad práctica transferida: leer un manual puede habilitar estudio o un
procedimiento guiado, no otorgar dominio instantáneo.

**Conexiones que la documentación debe describir:**

| Módulo relacionado | Qué necesita el motor | Qué devuelve |
|---|---|---|
| Personajes y capacidades | Características, habilidades, conocimientos y estado pertinente ([CHR-006](../30-characters/CHR-006_characteristics-and-skill-catalog.md), [CHR-007](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md)). | Trabajo realizado, consecuencias y oportunidades de aprendizaje. |
| Prioridades y autonomía | Objetivo, asignación, límites y posibilidad de reasignación ([UI-003](../80-interface/UI-003_work-priority-taxonomy.md), [CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md)). | Bloqueos, progreso, necesidad de ayuda o cambios de situación. |
| Mundo, lugares y edificios | Estado real, accesos, instalaciones, materiales y pistas ([WLD-002](../20-world/WLD-002_local-exploration-and-information.md), [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md)). | Transformaciones y conocimiento adquirido. |
| Objetos y herramientas | Capacidades habilitadas, condición, disponibilidad y consumo ([SET-008](../40-settlement/SET-008_object-model-and-logistics-families.md)). | Uso, desgaste, reserva o liberación cuando corresponda. |
| Construcción y producción | Métodos, fases, insumos y resultados posibles ([SET-005](../40-settlement/SET-005_production-web-and-infrastructure.md)). | Avance, productos, conservación y residuos coherentes. |
| Necesidades y salud | Limitaciones y cambios relevantes. | Esfuerzo y consecuencias pertinentes, sin reglas clínicas nuevas. |
| Combate y amenazas | Oposición y condiciones de peligro ([THR-001](../60-threats/THR-001_zombie-threat-model.md)). | Reacciones o resultados según sus reglas específicas. |
| Relaciones y narrativa | Actores, recuerdos e intereses pertinentes ([NAR-002](../70-narrative/NAR-002_memory-and-causal-world-history.md)). | Sucesos que puedan ser recordados o interpretados. |
| Guardado y representación | Persistencia y visualización del estado. | Datos suficientes para continuar y explicar, sin depender de una vista gráfica concreta. |

Esta tabla no define APIs ni clases de software; si la documentación real
usa otros nombres, se conservan esos nombres y se señalan equivalencias. El
sistema de saqueo, generación de lugares y estado previo de edificios
alimenta lo existente y no se redefine dentro de una comprobación de
búsqueda.

### 3.5 Persistencia, invariantes y rendimiento conceptual

**Invariantes del mundo:** lo existente limita lo recuperable, y una
transformación puede cambiar materiales pero debe tener una procedencia; un
recurso no se entrega dos veces por progreso parcial y finalización; cambiar
de orden, persona, cámara o velocidad no restaura una pieza gastada; lo ya
observado o realizado conserva su historia salvo cambios reales
posteriores; el estado y el conocimiento del personaje no se confunden; una
habilidad más alta no empeora por accidente el mismo resultado en
condiciones iguales; los requisitos siguen siendo requisitos aunque una
media o bonificación sea alta.

**Tiempo y riesgo.** El mismo trabajo y exposición no deben volverse más
peligrosos solo porque la simulación se actualiza más veces o se juega a
velocidad alta. Agrupar o dividir intervalos requiere conservar el
comportamiento previsto; no se aplica una probabilidad fija de accidente por
fotograma. Una tasa por exposición (`P(incidente durante Δt) = 1 −
exp(−λ × Δt)`) es una posibilidad matemática documentada, no un modelo
universal aprobado (ver §5). Más tiempo empleado también puede significar
más exposición a un peligro externo: reducir errores técnicos mediante
cuidado no implica siempre reducir todo riesgo total.

**Cuándo evaluar (orientación conceptual):**

| Momento | Qué puede requerir evaluación |
|---|---|
| Inicio de una acción o método | Requisitos, medios, alcance y episodio. |
| Fase significativa | Incertidumbre o resultados propios de esa fase. |
| Cambio relevante | Efectos sobre capacidad, ritmo, acceso o riesgo pendiente. |
| Evidencia nueva | Oportunidad de percepción o comprensión. |
| Interrupción | Estado que queda, recursos y posibilidad de continuar. |
| Finalización | Salida pendiente y actualización sin duplicaciones. |

El movimiento, la visualización de progreso y el cálculo de una resolución
completa no necesitan compartir frecuencia.

**Escalabilidad y representación.** El cálculo debe poder organizarse sin
revisar todas las capacidades y todos los objetos cada fotograma; reutilizar
valores mientras no cambien sus causas es una opción conceptual, no un
diseño técnico cerrado (ver
[ARC-003](ARC-003_multiscale-simulation-principles.md) para los principios
de simulación multiescala ya aprobados). La simulación fuera de pantalla o
agrupada no debe eliminar gastos ni riesgos relevantes; la evolución visual
futura no obliga a redefinir las reglas de existencia, conocimiento o
resolución. No se prometen números de agentes, latencia ni fotogramas por
segundo: no se han medido.

**Persistencia del azar.** Se distingue reproducibilidad, no recargar de
forma oportunista y suavizar rachas; una semilla por sí sola no resuelve
los tres problemas a la vez (ver
[ARC-002](ARC-002_procedural-generation-and-persistence.md) y
[DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md)). Se
conserva el episodio y lo ya resuelto cuando corresponde, a la vez que
heridas, herramientas o condiciones posteriores pueden cambiar
legítimamente lo que aún no se ha resuelto. El comportamiento exigido
queda cerrado en §3.13 (cierra P21).

### 3.6 Experiencia del jugador e información visible

La interfaz ayuda a decidir a quién mandar, con quién, a hacer qué y bajo
qué intención, sin exigir estudiar la fórmula. Se muestran causas
comprensibles: falta una herramienta, necesita ayuda, revisión incompleta,
sin urgencia, intervención delicada o progreso detenido. Ejemplo orientativo,
no maqueta definitiva:

> **Vivienda norte — Recuperar instalación**
> Responsable y equipo asignados. Modo: cuidadoso. Estado: se está
> preparando la extracción. Información: se desconoce todavía si la pieza
> funciona. Necesidad: falta una herramienta para la siguiente fase.

No se muestra «100 % de éxito» como garantía global si existen partes
desconocidas, ni se revelan objetos ocultos mediante indicadores exactos de
cobertura total sin fundamento en el conocimiento disponible. Los detalles
de medias y modificadores pueden estar disponibles en explicaciones
opcionales; la presentación **cierra en §3.14 (cierra P22)** como
valoración cualitativa, nunca como porcentaje exacto o banda orientativa
numérica (ver también
[UI-004](../80-interface/UI-004_qualitative-capability-presentation.md), que
ya cierra los cinco estados cualitativos de capacidad para la matriz de
prioridades). No se producen avisos por cada cálculo; las notificaciones se
reservan para consecuencias relevantes, bloqueos, descubrimientos o
decisiones que necesiten atención. Un mismo modo tiene una explicación
estable aunque sus efectos dependan de la tarea: «relajado» no aparece unas
veces como descanso, otras como búsqueda exhaustiva y otras como inmunidad
al peligro.

### 3.7 Resultados multidimensionales, críticos e incidencias (cierra P15)

Un resultado puede afectar, cuando corresponda, a: cumplimiento del
objetivo, progreso, calidad, conservación, duración, consumo, ruido,
desgaste, fatiga, información, exposición, daño, relaciones o memoria. Las
dimensiones deben derivarse de una causa coherente y pueden quedar
vinculadas por una única resolución; no se realizan tiradas independientes
para cada eje salvo que representen incertidumbres realmente diferentes.

El mecanismo cerrado es el margen y las cinco bandas de
[ARC-006 §3.9](ARC-006_action-and-event-resolution-model.md#39-modelo-b-margen-azar-acotado-y-bandas-cierra-p04),
no un reparto porcentual de «crítico»/«pifia» como capa universal
generadora de sucesos. Reglas de cierre:

- un resultado excepcional permanece dentro de los límites del mundo (R01);
- un resultado técnico deficiente no lesiona automáticamente; una lesión
  necesita un peligro capaz de causarla (R17);
- protección puede reducir consecuencias sin mejorar la calidad técnica;
- una buena planificación conserva la reducción de riesgo obtenida: el
  motor no inventa otra amenaza para compensarla;
- la exposición se acumula según tiempo y condiciones, nunca mediante una
  probabilidad fija por fotograma (§3.5);
- un peligro puede programar una oportunidad causal de incidencia dentro
  del episodio; el momento y el resultado quedan sujetos a la persistencia
  aleatoria de §3.13 (P21);
- **una banda grave de B se traduce al peor resultado coherente que esa
  acción permita, no a una catástrofe universal**: la traducción de banda a
  lenguaje causal es responsabilidad de cada familia de acción (§3.3).

### 3.8 Conocimiento imperfecto y comunicación (cierra P16)

Se conservan cuatro capas: realidad existente, percepción, interpretación o
creencia, y capacidad de aprovechamiento (R02, §3.1). Una interpretación
puede registrar conceptualmente: autor; evidencia usada; conclusión o
hipótesis; confianza cualitativa; fecha; método; personas a quienes se
comunicó; revisiones posteriores.

Intensidad cerrada:

- incertidumbre frecuente cuando faltan pruebas;
- errores plausibles ocasionales;
- errores firmes poco habituales en especialistas, salvo evidencia pobre,
  estado adverso o casos extraordinarios;
- nada de producir continuamente información falsa por drama;
- una nueva revisión puede confirmar, matizar o corregir una interpretación
  anterior sin reescribir lo que la comunidad creyó antes de esa evidencia
  (ver
  [NAR-002](../70-narrative/NAR-002_memory-and-causal-world-history.md));
- dos personas pueden discrepar legítimamente;
- el conocimiento no se teletransporta a toda la comunidad (ver
  [CHR-002](../30-characters/CHR-002_knowledge-and-learning.md) y
  [SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md));
- una actuación aislada no revela el techo de una persona (ver
  [CHR-007 §3.4](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#34-descubrimiento-progresivo-del-personaje));
- el fallo de un experto puede ser propio (R05) y no necesita justificarse
  siempre mediante un peligro externo.

La interfaz debe poder expresar autoría y confianza: «Marta cree que…»,
«faltan comprobaciones», «la última revisión fue…» (ver también §3.14).

### 3.9 Reintentos y presupuestos de autonomía (cierra P17)

Un intento idéntico no genera otra resolución gratuita (§3.1). Puede
existir un nuevo intento por: nuevo trabajo o mayor profundidad; método
diferente; otra persona; herramienta distinta; nueva evidencia; descanso o
cambio real de estado; aceptación de mayor consumo, daño o riesgo;
reparación o repetición física de una parte deteriorada.

Cada orden puede definir: tiempo máximo; presupuesto de materiales; riesgo
máximo; repeticiones automáticas; cuándo solicitar ayuda; cuándo cambiar de
método; cuándo detenerse; si admite improvisación (ver la clasificación de
métodos de
[ARC-006 §3.11](ARC-006_action-and-event-resolution-model.md#311-requisitos-duros-e-improvisación-por-método-cierra-p06)).

El motor puede repetir automáticamente tareas seguras dentro del
presupuesto. Debe detenerse o elevar una decisión al jugador antes de
cruzar un coste irreversible no autorizado, un riesgo superior al
autorizado o un cambio de método.

Cancelar, reasignar, guardar/cargar o alternar modos no restaura
materiales, no elimina daños ni vuelve a sortear el mismo episodio (ver
persistencia en §3.13).

### 3.10 Oposición activa y pasiva (cierra P18)

- **Pasiva:** dificultad del entorno, objeto o condición sin voluntad
  propia.
- **Activa:** capacidad pertinente de un actor comparada con la de un
  oponente.

La oposición activa utiliza **una única resolución relativa de margen**,
reutilizando el modelo B de
[ARC-006 §3.9](ARC-006_action-and-event-resolution-model.md#39-modelo-b-margen-azar-acotado-y-bandas-cierra-p04)
con `capacidad_efectiva` y `dificultad_efectiva` sustituidas por las
capacidades comparadas de ambos actores; no se usan dos tiradas
independientes que dupliquen la variabilidad sin causa.

Aplicaciones: sigilo frente a percepción, engaño frente a lectura social,
ataque frente a defensa, inmovilización frente a resistencia, persecución
frente a huida.

Las situaciones prolongadas se dividen en oportunidades significativas:
contacto, aproximación, maniobra, cambio de cobertura, pérdida de visión,
nueva evidencia o retirada (coherente con la delimitación de episodios de
[ARC-006 §3.12](ARC-006_action-and-event-resolution-model.md#312-umbral-de-tarea-básica-y-episodios-comprobables-cierra-p07–p08)).
No se compara a todos los agentes entre sí a cada paso ni se hace una
comprobación global constante.

El sistema de combate podrá añadir reglas propias en su entrega futura,
pero deberá respetar este marco y no reemplazarlo silenciosamente.

### 3.11 Aprendizaje por participación (cierra P19)

Fórmula conceptual:

```text
aprendizaje = práctica significativa
            × desafío pertinente
            × participación real
            × retroalimentación
            × mentoría
            × facilidad personal
```

Reglas de cierre:

- una rutina trivial ya dominada aporta muy poco;
- el aprendizaje máximo aparece cerca del límite actual cuando la persona
  puede comprender y practicar;
- una tarea totalmente incomprensible aporta poco sin guía;
- estar presente no equivale a practicar;
- transportar herramientas no enseña Mecánica; puede enseñar logística,
  carga o el trabajo realmente realizado;
- un aprendiz debe ejecutar pasos pertinentes para desarrollar una
  habilidad práctica;
- un error enseña si se identifica, comprende, revisa o recibe explicación;
  un error mal interpretado puede no enseñar o consolidar una mala
  práctica;
- si intervienen dos habilidades, el aprendizaje se reparte según
  participación y fases; no se otorga el total a ambas;
- la media usada para ejecutar (§3.7 de
  [ARC-006](ARC-006_action-and-event-resolution-model.md#37-perfiles-de-ponderación-entre-característica-y-habilidad-cierra-p03))
  no es automáticamente el reparto de experiencia;
- las características cambian mucho más lentamente mediante exposición
  sostenida, no XP puntual;
- el potencial condiciona desarrollo futuro y velocidad, nunca mejora la
  acción actual (ver
  [CHR-007 §3.1](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#31-potencial-oculto-y-desarrollo));
- mentores y equipos aceleran aprendizaje y conocimiento del potencial solo
  con interacción real (ver
  [CHR-007 §3.5](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#35-aprendizaje-práctica-y-mentoría)).

Esta fórmula conceptual se reconcilia con
[CHR-002](../30-characters/CHR-002_knowledge-and-learning.md) y
[CHR-007](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md)
sin cerrar aquí las curvas completas de potencial, la distribución de
calibre ni el catálogo de dominios, que siguen perteneciendo a sus propios
documentos.

### 3.12 Eventos, causalidad, avisos y pausa (cierra P20)

Cadena cerrada:

1. ocurre una causa real;
2. se registra el evento de dominio;
3. se aplican cambios persistentes;
4. se generan consecuencias derivadas sin duplicar la causa;
5. cada persona percibe lo que pueda percibir;
6. se actualiza su conocimiento;
7. se agrupan notificaciones relacionadas;
8. se aplica la política de atención.

Cada evento debe poder identificar conceptualmente: momento simulado,
lugar, actores, causa, efectos, visibilidad, gravedad, cadena causal y
necesidad de reacción. Esto no diseña un esquema de base de datos.

**Niveles de atención:**

| Nivel | Tratamiento |
|---|---|
| Registro | Persiste en historial; no interrumpe. |
| Aviso | Notificación agrupada. |
| Importante | Aviso destacado y posibilidad de reducir automáticamente a `×1`. |
| Crítico | Pausa automática porque existe peligro inmediato o una decisión necesaria. |

**Valores predeterminados de pausa crítica:** persona incapacitada o en
peligro inmediato; incendio, derrumbe o amenaza no controlada; primer
contacto humano relevante; decisión moral o social que requiere respuesta;
pérdida de un medio indispensable que bloquea una cadena relevante;
situación donde continuar unos segundos puede causar una pérdida grave.
Coherente con la lista de hechos que pueden interrumpir una rutina de
[UI-006 §3.14](../80-interface/UI-006_contextual-place-interaction-and-teams.md#314-interrupciones)
y con la respuesta ante amenazas de
[ARC-007 §3.11](ARC-007_teamwork-orders-modes-and-conditions.md#311-respuesta-ante-cambios-pérdida-de-medios-y-amenazas-cierra-p14).

Las categorías son configurables por el jugador sin eliminar valores
predeterminados razonables. Las notificaciones repetidas por la misma causa
se agrupan. **Un evento y su notificación no son la misma entidad**: veinte
personas que perciben el mismo incendio generan un único evento de dominio
y, como mucho, avisos agrupados, no veinte pausas independientes.

### 3.13 Persistencia aleatoria y equivalencia temporal (cierra P21)

Invariante fuerte:

> **Misma semilla + mismo estado + mismas órdenes = mismos resultados
> relevantes, con independencia de cámara, FPS, pausa, guardado/carga o
> velocidad `×1/×2/×4/×10`.**

Cada oportunidad incierta debe poder derivarse conceptualmente de: semilla
del mundo; identificador estable del episodio (§3.12 de
[ARC-006](ARC-006_action-and-event-resolution-model.md#312-umbral-de-tarea-básica-y-episodios-comprobables-cierra-p07–p08));
entidad o acción; propósito de la resolución; ordinal estable de la
oportunidad.

Reglas de cierre:

- el resultado se genera una vez y se conserva;
- guardar/cargar no lo rerrollea;
- el tiempo de simulación, no los fotogramas, determina exposición, plazos
  y eventos;
- dividir o agrupar intervalos no multiplica peligros ni consumos;
- la simulación fuera de pantalla conserva causas, gastos, riesgos,
  aprendizaje y consecuencias relevantes;
- cambiar legítimamente el estado, método u orden puede cambiar lo que aún
  no se ha resuelto, nunca lo ya ocurrido;
- la semilla por sí sola no sustituye el identificador persistente del
  episodio.

Esta sección cierra el comportamiento exigido; no diseña la API del
generador aleatorio ni el formato final de persistencia, que siguen
correspondiendo a una futura entrega técnica sobre
[ARC-002](ARC-002_procedural-generation-and-persistence.md).

### 3.14 Presentación visible y potencial oculto (cierra P22)

**Nivel actual visible.** La ficha del personaje muestra el nivel actual
numérico `0–10` de características y habilidades, cerrado en
[CHR-006 §3.6](../30-characters/CHR-006_characteristics-and-skill-catalog.md#36-escala-real-0–10-y-calibración-canónica).
Este valor expresa lo que la persona puede hacer hoy. Se corrige la
contradicción histórica con `UI-004`:

- la prohibición de cifras se mantiene para umbrales de trabajo,
  dificultad, fórmula, modificadores y probabilidades (ver
  [UI-004 §3.5](../80-interface/UI-004_qualitative-capability-presentation.md#35-descriptores-en-lugar-de-cifras));
- no se aplica al nivel actual de características y habilidades dentro de
  la ficha del personaje;
- una evaluación operativa no muestra «requiere Electricidad 6», «43 % de
  éxito» ni el margen matemático de §3.9 de
  [ARC-006](ARC-006_action-and-event-resolution-model.md#39-modelo-b-margen-azar-acotado-y-bandas-cierra-p04);
- una herramienta de depuración puede mostrar cálculos internos, pero queda
  fuera de la experiencia normal.

**Capas de potencial**, coherentes con
[CHR-007](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md):

1. **Nivel actual:** visible como `0–10`.
2. **Potencial real:** máximo interno oculto; nunca se muestra como número,
   fracción, rango o barra exacta.
3. **Potencial estimado:** opinión cualitativa basada en evidencias.
4. **Confianza de la estimación:** cuánto fundamento tiene la comunidad.
5. **Velocidad de aprendizaje:** variable distinta del potencial restante.
6. **Calibre oculto `1–5` estrellas:** nunca visible y nunca bonificador
   directo.
7. **Adaptación al apocalipsis:** sistema separado de calibre y potencial.

Quedan expresamente prohibidos: `Conducción 3/8`; `potencial 177`;
`potencial 8–10`; estrellas visibles; porcentaje de potencial consumido;
barra que revele el techo real; frases que se presenten como certeza
cuando falta evidencia. El catálogo canónico de frases de potencial, su
modulación por confianza y sus reglas de actualización viven en
[CHR-007 §3.1](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#31-potencial-oculto-y-desarrollo)
y
[CHR-007 §3.9](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#39-catálogo-y-actualización-de-frases-de-potencial-cierra-parte-de-p22),
sin repetirse aquí.

**Presentación de acciones y resultados.** En la orden o acción no se
muestra: porcentaje de éxito; tirada; dificultad numérica; modificadores
internos; umbral requerido; probabilidad de crítico; contenido o peligro
que la comunidad todavía desconoce. Se muestra: posible o bloqueado;
adecuación cualitativa; dificultad relativa conocida; riesgos conocidos;
confianza; causas principales; qué falta o qué podría mejorar el método;
fase, progreso, consumo y motivo de interrupción; resultado causal y estado
persistente final. Ejemplos válidos:

> «Luis parece adecuado para la reparación. Conoce el tipo de instalación,
> pero carece de una herramienta específica. El trabajo sería lento y
> existe riesgo de deteriorar componentes.»

> «La reparación ha quedado provisional. Luis identificó correctamente la
> avería, pero el aislamiento disponible no permite una solución
> permanente.»

Se conservan en `UI-004` los estados cualitativos `Gris`, `Advertencia`,
`Adecuada`, `Familiar` e `Incierta` para prioridades y evaluación
operativa; no se sustituyen por el número visible de la ficha (ver la
reconciliación completa en
[UI-004 §3.8](../80-interface/UI-004_qualitative-capability-presentation.md#38-nivel-actual-visible-en-la-ficha-reconciliado-con-p22)).

### 3.15 Aplicación al entorno moldeable (`DESIGN-008`)

Los resultados multidimensionales, el ruido causal y las presentaciones de
esta sección se aplican sin excepción al despeje de terreno, la
construcción de barreras, el ciclo agrícola, las acciones sobre accesos y
el transporte local aprobados por
[WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md),
[WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md),
[SET-010](../40-settlement/SET-010_local-hauling-and-transport.md) y
[SET-011](../40-settlement/SET-011_initial-agriculture-loop.md). Ninguno
de esos documentos redefine resultados, eventos ni persistencia aleatoria;
solo declaran qué se transforma y con qué causas.

## 4. Preguntas abiertas

**Las veintidós decisiones `P01`–`P22` quedan cerradas por `DESIGN-006`.**
Ya no son preguntas abiertas del motor de resolución: cada una tiene una
decisión canónica y un documento de destino. Esta tabla se conserva como
registro histórico de cierre y trazabilidad, no como lista de pendientes;
el mismo mapeo se repite, con más detalle, en
[DISC-0005](../discovery/DISC-0005_resolution-engine-closure-traceability.md).

| ID | Decisión cerrada | Documento canónico y sección |
|---|---|---|
| P01 | Escala real `0–10`, calibración de nivel y media humana `4`. | [CHR-006 §3.6](../30-characters/CHR-006_characteristics-and-skill-catalog.md#36-escala-real-0–10-y-calibración-canónica) |
| P02 | Representación del desconocimiento: `0` es un valor real, distinto de dato ausente; precisión interna sin redondeo intermedio. | [ARC-006 §3.8](ARC-006_action-and-event-resolution-model.md#38-cero-dato-desconocido-y-precisión-cierra-p02) |
| P03 | Tres perfiles cerrados de ponderación entre característica y habilidad efectivas (70/30, 50/50, 30/70). | [ARC-006 §3.7](ARC-006_action-and-event-resolution-model.md#37-perfiles-de-ponderación-entre-característica-y-habilidad-cierra-p03) |
| P04 | Modelo B: margen, variación acotada `[-4,+4]` y cinco bandas internas. | [ARC-006 §3.9](ARC-006_action-and-event-resolution-model.md#39-modelo-b-margen-azar-acotado-y-bandas-cierra-p04) |
| P05 | Modelo D: variación acotada de hasta `±8 %` por fase o sesión. | [ARC-006 §3.10](ARC-006_action-and-event-resolution-model.md#310-modelo-d-tamaño-y-persistencia-de-la-variación-cierra-p05) |
| P06 | Requisitos duros por método: clasificación abierto/improvisable/guiado/restringido. | [ARC-006 §3.11](ARC-006_action-and-event-resolution-model.md#311-requisitos-duros-e-improvisación-por-método-cierra-p06) |
| P07 | Umbral de tarea básica: `+3` puntos de capacidad efectiva sobre dificultad efectiva, no `+2`. | [ARC-006 §3.12](ARC-006_action-and-event-resolution-model.md#312-umbral-de-tarea-básica-y-episodios-comprobables-cierra-p07–p08) |
| P08 | Delimitación de episodios y fases comprobables. | [ARC-006 §3.12](ARC-006_action-and-event-resolution-model.md#312-umbral-de-tarea-básica-y-episodios-comprobables-cierra-p07–p08) |
| P09 | Fórmula de cooperación con rendimientos decrecientes (100 %/60 %/35 %/20 %) y funciones reales en B. | [ARC-007 §3.6](ARC-007_teamwork-orders-modes-and-conditions.md#36-cooperación-por-funciones-y-rendimientos-decrecientes-cierra-p09) |
| P10 | Responsable, ejecutor, supervisor y reglas de sustitución. | [ARC-007 §3.7](ARC-007_teamwork-orders-modes-and-conditions.md#37-responsable-ejecutor-supervisor-y-sustitución-cierra-p10) |
| P11 | Dos dimensiones combinables de modo: ritmo y atención, no cuatro modos excluyentes. | [ARC-007 §3.8](ARC-007_teamwork-orders-modes-and-conditions.md#38-modos-en-dos-dimensiones-combinables-cierra-p11) |
| P12 | Rangos conceptuales de efectos y costes de ritmo y atención. | [ARC-007 §3.9](ARC-007_teamwork-orders-modes-and-conditions.md#39-efectos-y-costes-de-ritmo-y-atención-cierra-p12) |
| P13 | Límites temporales, herencia de política del lugar y prioridad. | [ARC-007 §3.10](ARC-007_teamwork-orders-modes-and-conditions.md#310-límites-temporales-prioridad-e-herencia-cierra-p13) |
| P14 | Cuatro políticas cualitativas de respuesta ante cambios y amenazas. | [ARC-007 §3.11](ARC-007_teamwork-orders-modes-and-conditions.md#311-respuesta-ante-cambios-pérdida-de-medios-y-amenazas-cierra-p14) |
| P15 | Resultados multidimensionales, críticos e incidencias mediante el margen de B. | §3.7 de este documento |
| P16 | Distribución y comunicación de conocimiento imperfecto en cuatro capas. | §3.8 de este documento |
| P17 | Reintentos y presupuestos de autonomía de la orden. | §3.9 de este documento |
| P18 | Oposición activa mediante una única resolución de margen relativo. | §3.10 de este documento |
| P19 | Aprendizaje por participación, fórmula conceptual y reparto entre habilidades. | §3.11 de este documento |
| P20 | Cadena de eventos, niveles de atención y pausa crítica predeterminada. | §3.12 de este documento |
| P21 | Persistencia aleatoria y equivalencia entre velocidades de simulación. | §3.13 de este documento |
| P22 | Nivel actual visible y potencial oculto comunicado mediante frases cualitativas. | §3.14 de este documento; [CHR-007 §3.9](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#39-catálogo-y-actualización-de-frases-de-potencial-cierra-parte-de-p22); [UI-004 §3.8](../80-interface/UI-004_qualitative-capability-presentation.md#38-nivel-actual-visible-en-la-ficha-reconciliado-con-p22) |

Cualquier calibración futura de valores concretos por acción, objeto,
familia de contenido o dominio (por ejemplo, la dificultad efectiva exacta
de una acción concreta, o el catálogo completo de dominios de habilidad)
es **parametrización de contenido**, no una reapertura de este modelo base.
Las preguntas de otros sistemas que siguen realmente abiertas —campos de
potencial, distribución de estrellas del calibre, adaptación al
apocalipsis, dominios de habilidad, catálogos de combate, umbrales exactos
de dificultad por familia— se conservan en `docs/OPEN-QUESTIONS.md` y en
sus documentos canónicos.

## 5. Ejemplos no normativos

### 5.1 Fórmulas aprobadas del motor cerrado

Quedan aprobadas, con esta entrega, cinco fórmulas conceptuales: la media
aritmética dentro de una pareja de características o de habilidades
requeridas (ver
[ARC-006 §3.2](ARC-006_action-and-event-resolution-model.md#32-características-habilidades-y-medias));
los tres perfiles de ponderación entre grupos
([ARC-006 §3.7](ARC-006_action-and-event-resolution-model.md#37-perfiles-de-ponderación-entre-característica-y-habilidad-cierra-p03));
el margen y la variación acotada del modelo B
([ARC-006 §3.9](ARC-006_action-and-event-resolution-model.md#39-modelo-b-margen-azar-acotado-y-bandas-cierra-p04));
la variación acotada de hasta `±8 %` del modelo D
([ARC-006 §3.10](ARC-006_action-and-event-resolution-model.md#310-modelo-d-tamaño-y-persistencia-de-la-variación-cierra-p05));
y la fórmula conceptual de aprendizaje por participación (§3.11 de este
documento). Ninguna otra fórmula de este anexo queda aprobada por su
aparición aquí.

### 5.2 Ponderación general antigua (descartada)

`Capacidad base = (característica efectiva + 2 × habilidad efectiva) / 3`

Punto de partida ilustrativo de una conversación anterior, conservado como
antecedente histórico. Queda descartada como fórmula universal: el peso
entre característica y habilidad efectivas se resuelve mediante los tres
perfiles cerrados de
[ARC-006 §3.7](ARC-006_action-and-event-resolution-model.md#37-perfiles-de-ponderación-entre-característica-y-habilidad-cierra-p03),
nunca mediante un peso fijo `2` aplicado a toda acción.

### 5.3 Probabilidad del candidato B (descartada)

`p = 1 / (1 + exp(−(Capacidad − Dificultad) / s))`

`s` controla la sensibilidad de la probabilidad a la diferencia. Esta forma
logística y la tabla calibrada que se barajó como alternativa quedan
descartadas: el modelo B cerrado usa margen, variación acotada `[-4, +4]` y
cinco bandas internas (§3.9 de
[ARC-006](ARC-006_action-and-event-resolution-model.md#39-modelo-b-margen-azar-acotado-y-bandas-cierra-p04)),
que sí alcanza límites reales y no depende de las colas de una función
continua.

### 5.4 Progreso del candidato D (cerrado)

La idea matemática es acumular el ritmo efectivo a lo largo del tiempo
trabajado, con una variación acotada **de hasta `±8 %` por fase o sesión
significativa**, cerrada en
[ARC-006 §3.10](ARC-006_action-and-event-resolution-model.md#310-modelo-d-tamaño-y-persistencia-de-la-variación-cierra-p05).
No se resamplea por fotograma ni por tick, porque cambiaría el
comportamiento al cambiar la frecuencia de actualización (P21, §3.13).

### 5.5 Críticos e incidencias (cerrado mediante bandas de B)

Las bandas `0,10p` y `0,10(1 − p)` que aparecían en versiones anteriores de
este documento quedan descartadas como reparto porcentual universal: el
mecanismo cerrado son las cinco bandas internas del modelo B (§3.9 de
[ARC-006](ARC-006_action-and-event-resolution-model.md#39-modelo-b-margen-azar-acotado-y-bandas-cierra-p04)),
traducidas por cada familia de acción a su propio lenguaje causal (§3.7 de
este documento). La tasa constante de incidencia por exposición del
antiguo §3.5 sigue sin elegirse como fórmula numérica de contenido; solo
queda cerrado que la exposición se acumula por tiempo y condiciones, nunca
por una probabilidad fija por fotograma.

### 5.6 Candidatos de resolución descartados como antecedentes

Se estudiaron otras alternativas de resolución antes de esta dirección
híbrida: margen con azar acotado, recuento de éxitos, y episodios con
riesgo/efecto/etapas. Se conservan como antecedentes históricos; esta
documentación no repite la comparación completa ni los mezcla con el
híbrido B+D. La separación conceptual entre efecto y peligro puede
utilizarse sin importar toda la matemática o frecuencia de complicaciones de
esas alternativas.

### 5.7 Treinta y un casos de validación documental

Ejemplos de la especificación, no pruebas ejecutadas ni programadas. Para
cada caso se identifica realidad existente, objetivo, método, capacidades,
medias posibles, requisitos, equipo, modo, resolución, resultado,
persistencia e información visible; no se inventan números salvo que se
marquen como ilustrativos. Los diecinueve primeros casos son la
consolidación original del motor; los casos 20 a 31 se añaden con
`DESIGN-006` para cubrir de forma explícita escala y potencial,
cooperación, oposición, eventos, aprendizaje, protección, exposición y
presupuesto de reintentos, y responden además a los 24 casos de validación
exigidos por el prompt de cierre (ver
[DISC-0005](../discovery/DISC-0005_resolution-engine-closure-traceability.md)).

1. **Buscar en una vivienda.** Existe un objeto oculto en una zona
   concreta. Comparar registro habitual, relajado y exhaustivo sin alterar
   el contenido; mostrar qué puede descubrirse y qué queda fuera del
   alcance del método (§3.1, [ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#33-modos-de-ejecución-significado-corregido)).
2. **Desmontar una pared.** Comparar novato con herramienta improvisada,
   albañil con equipo adecuado y experto agotado o herido; separar
   posibilidad, ritmo, conservación y peligro. Incluir dos personas en
   condiciones comparables para demostrar que el solapamiento puede
   deberse a ejecución, no siempre a una herida previa (modelo D,
   [ARC-006](ARC-006_action-and-event-resolution-model.md#35-modelo-d-trabajo-continuo)).
3. **Seguir un rastro.** El mismo rastreador descansado o fatigado; después,
   cambios por lluvia. Distinguir penalización de lectura de destrucción
   real de evidencia (§3.5, entorno).
4. **Reparar un generador con capacidades combinadas.** Dos habilidades y
   dos características; calcular sus medias sin fijar automáticamente la
   probabilidad final. Diagnóstico, intervención y prueba pueden requerir
   capacidades distintas
   ([ARC-006](ARC-006_action-and-event-resolution-model.md#36-base-híbrida-ejecución-directa-d-y-comprobaciones-b)).
5. **Escalada.** Comparar método sin equipo, disponibilidad de cuerda,
   arnés aislado y conjunto utilizable; explicar acceso, ejecución y
   consecuencias como cosas distintas, sin dar instrucciones reales de
   escalada ([ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#35-estado-herramientas-y-entorno)).
6. **Tiro u otra acción de combate.** Comparar experto cansado, persona
   intermedia descansada y novato, sin decidir por intuición una
   probabilidad concreta; explicar por qué un impacto no se obtiene
   únicamente completando una barra de trabajo (modelo B,
   [ARC-006](ARC-006_action-and-event-resolution-model.md#34-modelo-b-resolución-porcentual)).
7. **Diagnóstico.** Representar conocimiento mínimo, evidencia parcial,
   hipótesis y revisión posterior; usar una avería o un caso médico
   abstracto, sin introducir consejos clínicos reales (§3.1, información y
   confianza).
8. **Tarea rutinaria dominada.** Persona con capacidad y medios realiza un
   trabajo sencillo; no hay tirada de fracaso obligatoria, pero sí tiempo,
   recursos, progreso e interrupciones posibles
   ([ARC-006](ARC-006_action-and-event-resolution-model.md#33-posibilidad-requisitos-y-acciones-básicas-sin-tirada)).
9. **Equipo con responsable, aprendiz y logística.** Mostrar contribuciones
   diferentes, límites de espacio y herramientas, aprendizaje posible y
   ausencia temporal del responsable; no sumar tres bonificaciones
   idénticas ni promediar indiscriminadamente a los miembros
   ([ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#31-trabajo-en-equipo-con-un-líder)).
10. **Dos especialistas complementarios.** Uno domina Mecánica y otro
    Electricidad; explicar qué pueden repartirse y qué exige una
    intervención conjunta, sin fabricar un personaje con lo mejor de
    ambos ([ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#31-trabajo-en-equipo-con-un-líder)).
11. **Relajado frente a exhaustivo/cuidadoso.** Misma tarea y equipo; en
    relajado no hay peligro ni urgencia, en exhaustivo/cuidadoso se
    invierte trabajo en profundidad o preservación; no son dos escalones
    de «más lento» ([ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#33-modos-de-ejecución-significado-corregido)).
12. **Amenaza durante un trabajo relajado.** Cambian las condiciones; el
    equipo solo reacciona a lo que puede conocer; se conserva el trabajo y
    se aplica una de las cuatro políticas cualitativas cerradas de
    [ARC-007 §3.11](ARC-007_teamwork-orders-modes-and-conditions.md#311-respuesta-ante-cambios-pérdida-de-medios-y-amenazas-cierra-p14).
13. **Límite de dedicación.** Una orden autoriza treinta minutos y no
    termina; quedan avance e inspección persistentes, sin fracaso ficticio
    ni éxito gratuito ([ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#34-tiempo-dedicación-método-y-prioridad)).
14. **Revisión posterior del mismo problema.** El equivalente al Excel: una
    persona no comprende algo y vuelve a estudiarlo después; nueva
    dedicación, conocimiento previo y una oportunidad legítima, no
    pulsaciones ilimitadas (§3.1).
15. **Requisito indispensable y media alta.** La media parece suficiente
    pero falta un conocimiento obligatorio; el método sigue bloqueado,
    aunque puede haber otro procedimiento viable. Comparar con una tarea
    básica que no exige ese conocimiento
    ([ARC-006](ARC-006_action-and-event-resolution-model.md#32-características-habilidades-y-medias)).
16. **Cambio tardío de modo y continuidad.** Tras deteriorar una pieza, se
    cambia a cuidadoso; el daño no se revierte; se interrumpe y reanuda con
    otra persona sin resetear trabajo ni regenerar materiales
    ([ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#34-tiempo-dedicación-método-y-prioridad)).
17. **Misma tarea a distintas velocidades y fuera de cámara.** Qué debe
    mantenerse coherente en recursos, progreso y exposición, sin afirmar
    que esta equivalencia ya esté verificada en software (§3.5).
18. **Evento y notificación.** Una consecuencia de una fase produce un
    cambio real; se comunica una vez cuando corresponde y no vuelve a
    sortearse ni aplicarse por cada aviso (§3.2).
19. **Acción social.** Una buena capacidad mejora una oportunidad plausible,
    pero no obliga a otro personaje a actuar contra cualquier interés o
    límite; se separa respuesta, conocimiento y memoria social (§3.3,
    interacción social).
20. **Referencia humana media.** Una persona con Fuerza `4` representa la
    referencia humana media de esa característica; no implica nivel `4` en
    ninguna habilidad especializada ([CHR-006 §3.6](../30-characters/CHR-006_characteristics-and-skill-catalog.md#36-escala-real-0–10-y-calibración-canónica)).
21. **Cero real frente a dato desconocido.** Una persona con Electricidad
    `0` carece de competencia práctica, pero puede tener potencial y
    aprender lo básico; Electricidad `0` no significa «dato desconocido»
    (§3.8 de este documento; [CHR-006 §3.6](../30-characters/CHR-006_characteristics-and-skill-catalog.md#36-escala-real-0–10-y-calibración-canónica)).
22. **Nivel alto cerca del máximo oculto.** Una persona con Mecánica `8`
    puede estar cerca de su máximo oculto; la ficha muestra `8` y una frase
    de potencial estimado, nunca `8/9` (§3.14 de este documento;
    [CHR-007 §3.9](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#39-catálogo-y-actualización-de-frases-de-potencial-cierra-parte-de-p22)).
23. **Potencial bajo nivel actual mínimo.** Una persona con Conducción `1`
    puede tener un potencial enorme; ese potencial no mejora cómo conduce
    hoy, solo su desarrollo futuro ([CHR-007 §3.1](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#31-potencial-oculto-y-desarrollo)).
24. **Umbral de tarea básica frente a diferencia menor.** Una capacidad
    efectiva `3` puntos sobre la dificultad efectiva y sin incertidumbre
    pertinente se ejecuta directamente; una diferencia de solo dos puntos
    no activa por sí sola esa regla ([ARC-006 §3.12](ARC-006_action-and-event-resolution-model.md#312-umbral-de-tarea-básica-y-episodios-comprobables-cierra-p07–p08)).
25. **Cooperación con rendimientos decrecientes.** Añadir tres ayudantes a
    un trabajo compartido no transfiere sus habilidades al ejecutor
    principal ni multiplica automáticamente la velocidad por cuatro: la
    contribución sigue la referencia `100 %/60 %/35 %/20 %`
    ([ARC-007 §3.6](ARC-007_teamwork-orders-modes-and-conditions.md#36-cooperación-por-funciones-y-rendimientos-decrecientes-cierra-p09)).
26. **Solapamiento ocasional en oposición activa.** Un experto suele
    superar a un principiante en sigilo frente a percepción, resuelto
    mediante la única comprobación de margen relativo de
    [ARC-008 §3.10](ARC-008_outcomes-knowledge-events-and-validation.md#310-oposición-activa-y-pasiva-cierra-p18);
    existe solapamiento ocasional en acciones realmente accesibles (R04).
27. **Protección sin mejorar la calidad técnica.** Un equipo de protección
    puede reducir la gravedad de una consecuencia sin mejorar el resultado
    técnico de la acción; ambos efectos se resuelven por separado
    (§3.7 de este documento).
28. **Evento agrupado frente a pausas independientes.** Veinte personas que
    detectan el mismo incendio generan un único evento de dominio y, como
    mucho, avisos agrupados y una sola pausa crítica, no veinte pausas
    independientes (§3.12 de este documento).
29. **Presupuesto de reintentos agotado.** Una orden con presupuesto de
    materiales y riesgo máximo definidos detiene la repetición automática y
    eleva una decisión al jugador antes de cruzar un coste irreversible no
    autorizado; cancelar o recargar no restaura el presupuesto ya
    consumido (§3.9 de este documento).
30. **Aprendiz que solo transporta.** Un aprendiz que únicamente transporta
    herramientas para un mecánico no obtiene Mecánica: el aprendizaje exige
    participación real en pasos pertinentes (§3.11 de este documento;
    [CHR-002 §3.1](../30-characters/CHR-002_knowledge-and-learning.md#31-vías-aprobadas-de-adquisición)).
31. **Exposición acumulada, no probabilidad por fotograma.** Un trabajo
    prolongado junto a una amenaza acumula exposición según el tiempo de
    simulación real, nunca mediante una probabilidad fija evaluada cada
    fotograma; ejecutar a `×10`, mirar otra zona o recargar la partida no
    cambia el resultado ya generado del episodio (§3.13 de este documento).
