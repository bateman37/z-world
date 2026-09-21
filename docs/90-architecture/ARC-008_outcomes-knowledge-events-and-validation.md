---
id: ARC-008
title: Resultados, conocimiento imperfecto, eventos y validación del motor
status: draft
canonical_for:
  - separación entre error, fallo, incidencia, peligro y gravedad
  - cuatro capas de existencia, percepción, comprensión y aprovechamiento
  - familias de eventos y su relación con el mundo persistente
  - casos de validación documental del motor
  - decisiones pendientes P01–P22 del motor de resolución
depends_on:
  - ARC-006
  - ARC-007
related:
  - CHR-006
  - SET-008
  - SET-009
  - WLD-002
  - WLD-004
  - UI-004
  - UI-006
---

## 1. Propósito

Cerrar el motor de acciones, trabajos y eventos ([ARC-006](ARC-006_action-and-event-resolution-model.md),
[ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md)) con las capas de
**qué produce una resolución**, cómo se representa el conocimiento
imperfecto, cómo se resuelven eventos y consecuencias sistémicas, cómo se
aplica el procedimiento a las distintas familias de acciones del juego, qué
invariantes de persistencia y rendimiento conceptual deben respetarse, y qué
debe mostrarse a quien juega. Cierra también con los 19 casos de validación
documental y la lista completa de decisiones pendientes de calibración
(`P01`–`P22`).

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

**Críticos y pifias (PENDIENTE, P15).** Interesa que mayor competencia eleve
resultados excepcionales y reduzca fallos graves. Como ejemplo ilustrativo,
no aprobado, dividir una probabilidad de éxito `p`:

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

**Información y confianza (BASE PROPUESTA).** Se distinguen observaciones,
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
consumo máximo y petición de ayuda siguen pendientes (P17).

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
mensaje a quien juega; la frecuencia narrativa, la agrupación de avisos y la
gestión de grandes cadenas quedan pendientes (P20).

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

**Oposición activa y pasiva (PENDIENTE, P18).** Para sigilo frente a
observación, ataque frente a defensa o engaño frente a lectura de
intenciones, puede existir oposición; no se ha elegido entre dos
comprobaciones, defensa pasiva, diferencia de capacidades o márgenes
relativos, y ninguna es una sustitución matemática neutra. La resolución
respeta oportunidades significativas: no se compara a cada personaje con
todos los demás en cada paso del mapa.

**Caza y pesca no generan existencias retrospectivas.** Se distingue
localizar una oportunidad, acceder, ejecutar y recuperar lo obtenido: una
buena ejecución no aumenta retrospectivamente la población ni coloca una
presa donde no podía estar. Si el sistema ecológico o el generador crea
oportunidades a lo largo del tiempo, esa es una regla del mundo
independiente de premiar la habilidad con existencias inventadas.

### 3.4 Aprendizaje y conexión con otros módulos

**BASE PROPUESTA.** Se aprende por participación real: un aprendiz que
ayuda de forma pertinente puede progresar; estar cerca sin intervenir no
equivale a practicar todos los conocimientos del especialista (ver
[CHR-002](../30-characters/CHR-002_knowledge-and-learning.md)). Quedan
pendientes la cantidad de aprendizaje, el reparto entre dos habilidades, la
supervisión, el aprendizaje por fallos y el rendimiento de repetir rutinas
(P19). No se duplica automáticamente la experiencia porque una acción use
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
legítimamente lo que aún no se ha resuelto. La política técnica exacta
queda pendiente (P21).

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
opcionales; si se presenta un porcentaje exacto, una banda orientativa o
solo una valoración cualitativa sigue pendiente (P22, ver también
[UI-004](../80-interface/UI-004_qualitative-capability-presentation.md), que
ya cierra los cinco estados cualitativos de capacidad para la matriz de
prioridades). No se producen avisos por cada cálculo; las notificaciones se
reservan para consecuencias relevantes, bloqueos, descubrimientos o
decisiones que necesiten atención. Un mismo modo tiene una explicación
estable aunque sus efectos dependan de la tarea: «relajado» no aparece unas
veces como descanso, otras como búsqueda exhaustiva y otras como inmunidad
al peligro.

## 4. Preguntas abiertas

Lista completa de decisiones pendientes de calibración del motor de
resolución (identificadores locales `P01`–`P22`, sin numeración oficial de
entregas). Lo que ya debe preservarse mientras se decide queda indicado en
la tercera columna:

| ID | Decisión pendiente | Lo que ya debe preservarse |
|---|---|---|
| P01 | Escala y catálogo definitivo de características y habilidades. | **Cerrado por [CHR-006](../30-characters/CHR-006_characteristics-and-skill-catalog.md):** nueve características y 34 habilidades base (ver reconciliación en CHR-006 §7). Sigue pendiente la calibración exacta de la escala 1–10. |
| P02 | Representación del desconocimiento, valores ausentes y redondeo. | No se ignoran capacidades requeridas ni se inventan datos ([ARC-006](ARC-006_action-and-event-resolution-model.md#32-características-habilidades-y-medias)). |
| P03 | Peso entre característica efectiva y habilidad efectiva. | La media dentro de cada pareja no decide el peso entre grupos ([ARC-006](ARC-006_action-and-event-resolution-model.md#32-características-habilidades-y-medias)). |
| P04 | Tabla o función de B y distribución de grados. | Competencia relevante, solapamiento razonable, límites reales ([ARC-006](ARC-006_action-and-event-resolution-model.md#34-modelo-b-resolución-porcentual)). |
| P05 | Tamaño y persistencia de la variación de D. | Progreso continuo; el ruido mínimo no permite cualquier inversión ([ARC-006](ARC-006_action-and-event-resolution-model.md#35-modelo-d-trabajo-continuo)). |
| P06 | Requisitos duros por método y posibilidades de improvisación. | La suerte no sustituye conocimientos indispensables ([ARC-006](ARC-006_action-and-event-resolution-model.md#32-características-habilidades-y-medias)). |
| P07 | Condiciones para clasificar una tarea como básica. | Sin porcentaje artificial de fracaso cuando corresponde ejecución directa ([ARC-006](ARC-006_action-and-event-resolution-model.md#33-posibilidad-requisitos-y-acciones-básicas-sin-tirada)). |
| P08 | Qué fases necesitan comprobación y cómo se delimita un episodio. | No se tira por fotograma ni se resetean intentos ([ARC-006](ARC-006_action-and-event-resolution-model.md#36-base-híbrida-ejecución-directa-d-y-comprobaciones-b)). |
| P09 | **Sigue pendiente:** fórmula de cooperación, capacidad de coordinación, rendimientos decrecientes y número útil de ayudantes por familia de acción. | **Ya cerrado:** el selector local `Auto / 1 / 2 / 3 / 4`, los modos de asignación `Comunidad`/`Equipo seleccionado` y las aportaciones funcionales ([UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md#39-equipo-operativo-local-tamaño-y-asignación)). Se conserva además: responsable y funciones reales; no garantías por cantidad ([ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#31-trabajo-en-equipo-con-un-líder)). |
| P10 | **Sigue abierto:** elección y sustitución del responsable, supervisión y reasignación automática. | Presencia o aportación efectiva, progreso persistente ([ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#31-trabajo-en-equipo-con-un-líder)). El cierre del selector de equipo en `UI-006` no resuelve esta cuestión. |
| P11 | Lista final de modos y denominación por tarea. | Relajado no equivale a exhaustivo/cuidadoso ([ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#33-modos-de-ejecución-significado-corregido)). |
| P12 | Efectos y costes de cada modo por familia. | No hay bonos universales ni modo siempre óptimo sin coste ([ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#33-modos-de-ejecución-significado-corregido)). |
| P13 | Límites de tiempo, herencia del lugar y prioridad. | Ajustes en la orden del lugar, no globales en el personaje ([ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#32-órdenes-de-trabajo-vinculadas-al-lugar)). |
| P14 | Respuesta ante amenazas, pérdida de medios o cambio de condiciones. | No se vuelve seguro el mundo por seleccionar relajado ([ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#33-modos-de-ejecución-significado-corregido)). |
| P15 | Críticos, errores, incidencias y exposición acumulada. | Fallo de calidad no equivale a lesión; no dramatización constante (§3.1). |
| P16 | Distribución y comunicación de conocimiento imperfecto. | Verdad y creencia separadas, revisión posible (§3.1). |
| P17 | Reintento automático y autorización de gasto o riesgo. | Nuevo esfuerzo y persistencia, no lotería gratuita (§3.1). |
| P18 | Oposición activa frente a pasiva. | Resolución pertinente, sin comprobaciones globales constantes (§3.3). |
| P19 | Aprendizaje por participación, errores y habilidades combinadas. | No hay habilidad transferida mágicamente ni experiencia duplicada por defecto (§3.4). |
| P20 | Esquema de eventos, orden causal, agrupación de avisos y política exacta de pausa o elevación automática ante un hecho significativo. | No se duplican consecuencias ni se confunde evento con notificación (§3.2). Los tipos de hecho que pueden interrumpir una rutina se enumeran, sin cerrar la política, en [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md#314-interrupciones). |
| P21 | Persistencia aleatoria y equivalencia de escalas temporales. | Sin explotación por reinicio, cámara o frecuencia de actualización (§3.5). |
| P22 | Presentación de probabilidades y explicación al jugador. | Comprensión sin convertir la experiencia en una tabla de fórmulas (§3.6). |

## 5. Ejemplos no normativos

### 5.1 Lo único aprobado como fórmula

La media aritmética dentro de una pareja de habilidades requeridas y dentro
de una pareja de características requeridas (ver
[ARC-006](ARC-006_action-and-event-resolution-model.md#32-características-habilidades-y-medias)).
Ninguna otra fórmula de este anexo queda aprobada por su aparición aquí.

### 5.2 Ponderación general antigua (no aprobada)

`Capacidad base = (característica efectiva + 2 × habilidad efectiva) / 3`

Punto de partida ilustrativo de una conversación anterior; el peso 2 para
habilidad y la forma final de combinación no están fijados.

### 5.3 Probabilidad del candidato B (no elegida)

`p = 1 / (1 + exp(−(Capacidad − Dificultad) / s))`

`s` controla la sensibilidad de la probabilidad a la diferencia. También se
consideró una tabla calibrada como alternativa; ninguna opción está
seleccionada. Esta forma no llega exactamente al 100 % con valores finitos,
por lo que no debe sustituir la resolución directa de tareas básicas: los
requisitos se comprueban antes, no mediante las colas de la función.

### 5.4 Progreso del candidato D (no fijado)

La idea matemática es acumular el ritmo efectivo a lo largo del tiempo
trabajado, con una variación acotada por episodio como ejemplo (ver
[ARC-006](ARC-006_action-and-event-resolution-model.md#35-modelo-d-trabajo-continuo)).
No se han fijado tamaño de variación, duración del episodio ni necesidad de
variación aleatoria en cada rutina; no se resamplea arbitrariamente por
fotograma, porque cambiaría el comportamiento al cambiar la frecuencia de
actualización.

### 5.5 Críticos e incidencias (no fijado)

Las bandas `0,10p` y `0,10(1 − p)` de §3.1 ilustran la intuición de diseño
sobre maestría y resultados extremos; no son tasas universales. La tasa
constante de incidencia por exposición (§3.5) tampoco está elegida.

### 5.6 Candidatos de resolución descartados como antecedentes

Se estudiaron otras alternativas de resolución antes de esta dirección
híbrida: margen con azar acotado, recuento de éxitos, y episodios con
riesgo/efecto/etapas. Se conservan como antecedentes históricos; esta
documentación no repite la comparación completa ni los mezcla con el
híbrido B+D. La separación conceptual entre efecto y peligro puede
utilizarse sin importar toda la matemática o frecuencia de complicaciones de
esas alternativas.

### 5.7 Diecinueve casos de validación documental

Ejemplos de la especificación, no pruebas ejecutadas ni programadas. Para
cada caso se identifica realidad existente, objetivo, método, capacidades,
medias posibles, requisitos, equipo, modo, resolución, resultado,
persistencia, información visible y decisiones aún pendientes; no se
inventan números salvo que se marquen como ilustrativos.

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
    se identifica como pendiente la política exacta de cambio de modo o
    retirada (§3.2, P14).
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
