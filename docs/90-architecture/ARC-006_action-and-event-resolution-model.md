---
id: ARC-006
title: Modelo de resolución de acciones, capacidades y ejecución directa/D/B
status: draft
canonical_for:
  - procedimiento común de resolución de un trabajo
  - medias de características y habilidades efectivas
  - acciones básicas sin tirada
  - modelo B (resolución porcentual) y modelo D (trabajo continuo)
depends_on:
  - CHR-006
  - UI-003
related:
  - ARC-007
  - ARC-008
  - CHR-001
  - CHR-007
  - SET-008
  - SET-009
  - WLD-002
  - WLD-004
  - DEC-0007
---

## 1. Propósito

Definir cómo Z-World resuelve lo que una persona hace: qué capas intervienen
entre «alguien intenta algo» y «el mundo persistente cambia», sin convertir
cada tarea en una tirada, sin inventar resultados imposibles y sin perder
continuidad ni claridad para quien juega. Responde a la pregunta:

> ¿Cómo resuelve Z-World las acciones y los eventos de una comunidad con
> capacidades distintas, trabajando sola o en equipo y bajo diferentes modos
> y condiciones?

Este documento y sus capítulos [ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md)
y [ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md) forman el
punto de entrada canónico del **motor de acciones, trabajos y eventos**.
Este documento cubre el procedimiento común, las capacidades efectivas y los
dos modelos de resolución (B y D). ARC-007 cubre cooperación, órdenes,
modos, tiempo, estado, herramientas y entorno. ARC-008 cubre resultados,
incidencias, conocimiento imperfecto, eventos, conexión con otros módulos,
persistencia, experiencia de juego, casos de validación y la lista completa
de decisiones pendientes de calibración.

### 1.1 Alcance

Este ámbito resuelve **acciones, trabajos y eventos**: qué determina si algo
sucede, cómo progresa, qué incertidumbre es pertinente y qué persiste. No
define:

- el catálogo de características y habilidades (ver
  [CHR-006](../30-characters/CHR-006_characteristics-and-skill-catalog.md));
- el potencial oculto, el calibre oculto ni la adaptación al apocalipsis
  (ver [CHR-007](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md));
- el catálogo de objetos, familias logísticas ni el desmontaje como
  transformación del mundo (ver
  [SET-008](../40-settlement/SET-008_object-model-and-logistics-families.md)
  y
  [SET-009](../40-settlement/SET-009_disassembly-and-world-transformation.md));
- la taxonomía de trabajo, prioridades, zonas, políticas ni la matriz de
  gestión a escala (ver
  [UI-003](../80-interface/UI-003_work-priority-taxonomy.md));
- la presentación cualitativa de capacidad en la interfaz (ver
  [UI-004](../80-interface/UI-004_qualitative-capability-presentation.md));
- el sistema de amenazas, combate detallado, IA de planificación completa,
  generación de lugares o narrativa; solo describe sus conexiones.

Este documento es **diseño conceptual**, no una especificación técnica ni
una prueba de implementación. Debe funcionar tanto con la representación
local simple del primer corte jugable como con una evolución visual futura,
con cámara visible o con simulación fuera de pantalla.

## 2. Principios que no deben romperse

Estos principios provienen de la consolidación del motor (identificadores
locales `R01`–`R20`, sin numeración oficial de módulos):

| ID | Principio |
|---|---|
| R01 | El azar no crea objetos, recursos, pistas ni capacidades imposibles. |
| R02 | Existencia, percepción, comprensión y aprovechamiento son capas distintas que no deben fusionarse. |
| R03 | La competencia importa: un experto no equivale a un novato con más suerte. |
| R04 | En acciones inciertas y accesibles, un novato puede superar ocasionalmente a un experto, incluso en condiciones comparables. |
| R05 | La variación también puede ser un error propio del experto; no explicarla siempre por una amenaza externa. |
| R06 | Conocimiento y medios indispensables delimitan qué métodos son posibles. |
| R07 | Las acciones básicas se ejecutan sin tirada si la persona tiene capacidad y medios reales. |
| R08 | Características, habilidades, estado, herramientas, entorno, tiempo y azar intervienen solo cuando son pertinentes. |
| R09 | Dos habilidades requeridas se combinan mediante media aritmética; lo mismo con dos características. |
| R10 | La cooperación se articula mediante un responsable y aportaciones reales, no por acumulación automática de personas. |
| R11 | El modo y la dedicación se configuran en el trabajo u orden del lugar, no globalmente en el personaje. |
| R12 | Exhaustivo/cuidadoso expresa atención y trabajo a fondo; relajado expresa ausencia de peligro y urgencia. No son sinónimos. |
| R13 | Trabajo continuo (progreso) y comprobaciones puntuales (incertidumbre) conviven bajo un procedimiento común. |
| R14 | El progreso continuo (D) sirve de base; la resolución porcentual (B) resuelve incertidumbres pertinentes, además de la ejecución directa. |
| R15 | Progreso, gastos, daños, inspecciones y conocimiento son persistentes. |
| R16 | Reintentar puede tener sentido, pero no como lotería gratuita ni como bloqueo eterno por un primer fallo. |
| R17 | Error de ejecución, fallo del objetivo, incidencia, peligro y gravedad no son sinónimos. |
| R18 | Quien juega debe comprender las causas principales sin gestionar dados visibles. |
| R19 | La profundidad del sistema debe ser compatible con muchos agentes y distintas velocidades de simulación (validación técnica pendiente). |
| R20 | Este ámbito es documentación de diseño, no una entrega de programación. |

## 3. Modelo funcional

### 3.1 Lenguaje común y procedimiento de resolución

| Concepto | Significado |
|---|---|
| Orden o trabajo | Compromiso de realizar una actividad en un lugar, con objetivo, recursos y límites (taxonomía completa en [UI-003](../80-interface/UI-003_work-priority-taxonomy.md)). |
| Acción | Interacción concreta que produce un avance o resultado. |
| Fase | Parte significativa de un trabajo; puede tener requisitos y capacidades propios. |
| Comprobación | Resolución de una incertidumbre pertinente, no de cada movimiento ni cada fotograma. |
| Incidencia | Suceso durante la actividad cuya causa y efectos se representan por separado cuando corresponde. |
| Evento | Cambio significativo que puede afectar al mundo, a un trabajo o al conocimiento (ver [ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md#32-eventos-y-consecuencias-sistémicas)). |
| Notificación | Información que se muestra; no todo evento necesita una. |

Flujo conceptual compartido, sin que todos los trabajos atraviesen todas sus
capas:

> **Estado real → objetivo y método → requisitos → responsable y equipo →
> capacidades pertinentes → modo y condiciones → ejecución directa,
> progreso o comprobación → consecuencias → actualización persistente.**

Una tarea simple no se burocratiza: transportar una caja accesible no
necesita diagnóstico, comprobación ni fases administrativas. Cuando un
método resulta imposible, se distingue si existe otro método viable; no
saber desmontar correctamente una instalación no elimina el resto de
interacciones posibles con el edificio. Cuando cambian las condiciones se
revisa lo pendiente y pertinente, sin borrar lo ya ocurrido.

### 3.2 Características, habilidades y medias

El catálogo de nueve características y 34 habilidades base es propiedad de
[CHR-006](../30-characters/CHR-006_characteristics-and-skill-catalog.md);
este documento solo define cómo se combinan cuando una fase o método
requiere más de un valor del mismo grupo.

**Fórmulas de agrupación (ACORDADO):**

- Una única característica: `Característica efectiva = característica requerida`.
- Dos características: `Característica efectiva = (característica 1 + característica 2) / 2`.
- Una única habilidad: `Habilidad efectiva = habilidad requerida`.
- Dos habilidades: `Habilidad efectiva = (habilidad 1 + habilidad 2) / 2`.

La media es aritmética y de igual peso dentro de cada pareja. No se
sustituye silenciosamente por suma, máximo, mínimo, media geométrica ni
ponderación desigual. Primero se forma el grupo de características y el
grupo de habilidades por separado; **el peso entre ambos grupos para
obtener una capacidad final sigue sin fijarse** (ver P03 en
[ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas)).
La fórmula antigua `(característica efectiva + 2 × habilidad efectiva) / 3`
no queda aprobada por este documento (ver anexo de fórmulas no aprobadas en
[ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md#5-ejemplos-no-normativos)).

**EJEMPLO, no catálogo definitivo.** Una fase de diagnóstico de una
instalación requiere Mecánica y Electricidad, además de Razonamiento y
Percepción:

| Grupo | Valores de la persona | Media |
|---|---|---:|
| Habilidades | Mecánica 8 y Electricidad 4 | 6 |
| Características | Razonamiento 7 y Percepción 9 | 8 |

La fase aporta una habilidad efectiva de 6 y una característica efectiva de
8 al procedimiento posterior. No significa «6 + 8 %» ni una probabilidad
automática del 80 %. La misma persona, en otra fase que solo requiera
Mecánica, utiliza su valor de Mecánica directamente, no la media de otra
fase.

**Pertinencia, no selección oportunista.** El método o la fase determinan
qué capacidades intervienen; no se eligen las dos habilidades más altas del
personaje para cualquier actividad, ni se agregan habilidades accesorias
para mejorar una media favorable. Debe distinguirse:

- una acción que necesita utilizar dos capacidades conjuntamente;
- un trabajo con varias fases que exigen capacidades distintas en momentos
  diferentes.

Ambos modelos coexisten; ningún trabajo, búsqueda o reparación está
obligado a resolverse con una única media global.

**La media no sustituye los requisitos.** Una aptitud agregada alta no
equivale a disponer de un conocimiento indispensable: si un método exige un
conocimiento concreto, se comprueba antes, y una Mecánica alta no autoriza
por sí sola un procedimiento eléctrico desconocido porque la media resulte
aceptable. Al mismo tiempo, no toda habilidad baja bloquea: existen tareas
improvisables, básicas y aprendibles mediante práctica; los requisitos
duros deben justificarse por método (ver PENDIENTE en
[ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas),
P06).

**Valores ausentes y precisión (PENDIENTE).** No está decidido cómo se
representa no tener una habilidad (cero, ausencia u otra categoría), si se
puede intentar un método sin entrenamiento, cómo se muestran y conservan
medias fraccionarias, ni cómo se aplican modificadores sin duplicar una
causa. No se ignora una habilidad requerida por falta de dato, no se
interpreta ausencia como un valor inventado y no se redondea dos veces
generando ventajas por orden de cálculo.

**La media individual no es la fórmula de cooperación.** Esta regla
promedia capacidades de **una persona**. No decide cómo combinar personas:
un mecánico y un electricista no transfieren automáticamente sus mejores
puntuaciones a un superpersonaje colectivo (ver
[ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#31-trabajo-en-equipo-con-un-líder)).

### 3.3 Posibilidad, requisitos y acciones básicas sin tirada

**ACORDADO.** Para acciones sencillas o básicas, si la persona tiene
capacidad y posibilidad real de hacerlas, las realiza sin conservar
artificialmente un porcentaje mínimo de fracaso. La clasificación depende de
persona, tarea, método y contexto: algo rutinario para un especialista puede
no serlo para alguien sin formación.

| Situación | Tratamiento conceptual |
|---|---|
| Método inaccesible por requisitos reales | No se ejecuta ese método; se comunica el impedimento conocido y las vías alternativas disponibles. |
| Acción básica y viable | Ejecución directa, con tiempo y recursos cuando correspondan. |
| Trabajo prolongado con pasos conocidos | Progreso continuo (modelo D); no hay fracaso dramático obligatorio al terminar. |
| Resultado incierto y pertinente | Comprobación apropiada (modelo B), antes o después del esfuerzo según la acción. |
| Cambio relevante durante el trabajo | Se revisa la parte afectada sin resetear todo. |

Directo no significa instantáneo, gratuito, sin esfuerzo ni inmune a
interrupciones: dos personas pueden completar sin tirada el mismo trabajo y
tardar distinto. Esta regla no equivale a «muchos ayudantes garantizan
éxito» ni a «dedicar suficientes horas permite cualquier resultado»: una
acción básica se resuelve por su naturaleza y las capacidades disponibles,
no porque se haya comprado una garantía. No se introduce azar decorativo en
cada paso rutinario.

### 3.4 Modelo B: resolución porcentual

**Qué aporta.** B responde: «dadas estas capacidades y condiciones, ¿qué
resultado puede obtenerse en este intento significativo?». La probabilidad
se determina después de comprobar requisitos, y puede representar detectar
una señal, interpretar una avería, conservar una pieza delicada o realizar
una maniobra. No equivale a un juego por turnos: la comprobación puede
ocurrir durante una acción continua sin mostrarse como dado.

**PENDIENTE.** La forma matemática exacta (función logística, tabla
calibrada u otra) no está elegida; debe permitir calibrar el peso de la
competencia, la dificultad y el solapamiento entre perfiles sin una fórmula
artesanal por objeto (ver P04 en
[ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas)).

**EJEMPLO EXPLICATIVO, NO BALANCE.** Un panel contiene diez tablas
potencialmente reutilizables; la parte incierta es cuántas conserva intactas
quien lo desmonta:

| Resultado | Experto | Principiante |
|---|---:|---:|
| Excelente: conserva diez | 8 % | 4 % |
| Bueno: conserva ocho | 72 % | 36 % |
| Deficiente: conserva cinco | 18 % | 54 % |
| Malo: conserva dos | 2 % | 6 % |

El experto obtiene un resultado bueno o excelente el 80 % de las veces; el
principiante, el 40 %. En una ocasión el principiante puede conservar diez y
el experto cinco; no se crea material nuevo: lo no conservado íntegro se
deteriora, se transforma en restos o queda pendiente según la intervención.
No se permite recuperar de nuevo tablas ya contabilizadas. El ejemplo
demuestra el tipo de solapamiento buscado; no obliga a aplicar cuatro bandas
a toda tarea ni a resolver un trabajo largo con una única tirada final.

**Equipo y tiempo en B.** Un ayudante que sostiene un elemento durante una
fase delicada puede contribuir a la ejecución si el método lo permite; quien
transporta lo ya retirado puede ahorrar tiempo sin mejorar directamente la
probabilidad de extracción. Dedicar trabajo a revisar puede cambiar las
condiciones o abrir nuevas oportunidades; no equivale a repetir el mismo
porcentaje gratuitamente.

**Límites.** B no debe: ofrecer una probabilidad diminuta para métodos que
la persona no puede realizar; mantener un 1 % de fracaso en todas las
rutinas; decidir si existe el objeto buscado; usar probabilidades
incompatibles para conclusiones que se excluyen entre sí; ni ocultar falta
de criterio detrás de porcentajes con muchos decimales.

### 3.5 Modelo D: trabajo continuo

**Qué aporta.** D responde: «¿cómo avanza este trabajo con las personas, los
medios y las condiciones actuales?». El progreso depende del tiempo
realmente trabajado y del rendimiento pertinente, y puede incluir una
variación acotada de ejecución cuyo tamaño no está fijado. Las fases
delicadas y las incidencias no se confunden con el avance rutinario: no se
sortea cada golpe ni se decide al final, retrospectivamente, que todo el
trabajo correcto desaparece.

**EJEMPLO EXPLICATIVO, NO BALANCE NI DURACIONES DEFINITIVAS.** Un trabajo
requiere 120 unidades internas de esfuerzo (no necesariamente visibles):

| Persona | Ritmo por minuto | Tiempo nominal |
|---|---:|---:|
| Principiante | 0,8 | 150 minutos |
| Experimentada | 1,5 | 80 minutos |
| Experta | 2,5 | 48 minutos |

Con una variación de ejecución de −4 %, la experta trabaja a 2,4
unidades/minuto y termina en 50 minutos. Una interrupción a los veinte
minutos deja 48 unidades completadas y 72 pendientes; cambiar de persona o
herramienta puede cambiar el ritmo futuro, pero no devuelve el trabajo al
inicio. El ejemplo no obliga a acumular todo como una única barra: las fases
físicas pueden tener materiales, requisitos y resultados propios.

**Equipo y recursos en D.** El responsable realiza o supervisa los pasos
técnicos; un ayudante prepara y sostiene; otro transporta y despeja. Pueden
mejorar el avance porque reducen esperas o permiten colaboración real; tres
personas no se convierten automáticamente en triple velocidad, porque
espacio, acceso, puestos útiles y herramientas limitan el trabajo
simultáneo. La calidad y la conservación derivan de lo hecho en cada fase;
no se contabilizan dos veces los recursos por combinar salida continua con
recompensa final.

**Límite explícito de solapamiento.** Si la diferencia de ritmo es muy
grande y la variación muy pequeña, los resultados de novato y experto no se
solapan (con los ritmos del ejemplo, el principiante tarda entre 125 y
187,5 minutos; el experto, entre 44,44 y 52,17; no hay inversión posible).
Por tanto, **D por sí solo no garantiza la sorpresa ocasional del novato**
(R04); tampoco se fuerza a que un novato supere a un experto en todos los
ejes de cualquier trabajo. La intención es permitir inversiones ocasionales
en **resultados pertinentes de tareas inciertas**, conservando la ventaja
global del experto: el híbrido puede combinar progreso D bastante estable
con conservación o diagnóstico B variable. Percepción, impacto de un disparo
o decisiones de otro personaje tampoco se resuelven adecuadamente llenando
solo una barra.

### 3.6 Base híbrida: ejecución directa, D y comprobaciones B

**BASE PROPUESTA**, no una fórmula validada ni cinco motores
independientes:

1. Ejecución directa cuando la acción es básica y viable (§3.3).
2. Progreso D cuando existe trabajo prolongado (§3.5).
3. Resolución B cuando queda una incertidumbre significativa (§3.4).
4. Incidencias y eventos con causas y consecuencias pertinentes (ver
   [ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md)).
5. Persistencia común del resultado.

Las mismas características, habilidades, medias, requisitos y condiciones
alimentan la resolución que corresponda; no se crean fichas distintas del
personaje para cada modelo.

**EJEMPLO ilustrativo de trabajo compuesto: reparar un generador.**

| Fase conceptual | Qué debe resolverse |
|---|---|
| Acceder e inspeccionar | Posibilidad física, observaciones y trabajo de inspección. |
| Interpretar la avería | Conocimientos y, si procede, incertidumbre de diagnóstico (B). |
| Preparar medios | Trabajo y disponibilidad de herramientas o repuestos. |
| Intervenir en pasos conocidos | Progreso (D); acciones básicas directas dentro de la fase. |
| Ejecutar un paso delicado | B solo si hay una incertidumbre pertinente. |
| Comprobar el resultado | Trabajo de verificación e información sobre el estado real. |

No se imponen estas seis fases a toda reparación; son una descomposición
ilustrativa. Si falta una pieza, acumular trabajo no la sustituye. Si se
completa una reparación provisional, se registra ese estado; no se etiqueta
como definitiva con una penalización oculta.

**Unidad significativa.** Se definen episodios y fases con sentido físico o
informativo: una sección desmontada, una zona inspeccionada, un diagnóstico,
un intento de maniobra. No se hace una comprobación completa por cada
animación, ni se agrupa tanto que un único fallo decida arbitrariamente el
destino de una semana de trabajo. No se aplican a la vez un fracaso B y una
penalización D independientes para castigar dos veces la misma ejecución sin
justificación causal explícita.

## 4. Reglas aprobadas

- Las medias aritméticas de igual peso dentro de una pareja de
  características requeridas, y dentro de una pareja de habilidades
  requeridas, son la única regla de combinación aprobada (§3.2).
- Las acciones básicas viables se ejecutan sin tirada si la persona tiene
  capacidad y medios reales (§3.3, R07).
- El azar nunca crea objetos, recursos, pistas o capacidades imposibles
  (R01); nunca sustituye un conocimiento o medio indispensable (§3.2).
- B y D son modelos complementarios, no alternativos: D resuelve avance;
  B resuelve incertidumbre pertinente (§3.4–§3.6).
- Ningún resultado se resuelve dos veces: el progreso, el gasto, el daño,
  la inspección y el conocimiento persisten (R15).

## 5. Interacciones con otros sistemas

- Consume el catálogo de características, habilidades, dominios y
  conocimientos de
  [CHR-006](../30-characters/CHR-006_characteristics-and-skill-catalog.md).
- Consume la taxonomía de trabajo, prioridades y orígenes de trabajo de
  [UI-003](../80-interface/UI-003_work-priority-taxonomy.md), sin
  redefinirla.
- Continúa en
  [ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md) para
  cooperación, órdenes, modos, tiempo, estado, herramientas y entorno.
- Continúa en
  [ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md) para
  resultados, eventos, conexión con otros módulos, persistencia, casos de
  validación y decisiones pendientes.
- El objeto que se desmonta o repara con este procedimiento es propiedad de
  [SET-008](../40-settlement/SET-008_object-model-and-logistics-families.md)
  y
  [SET-009](../40-settlement/SET-009_disassembly-and-world-transformation.md);
  este documento no redefine familias logísticas ni resultados de
  desmontaje.
- El reconocimiento y la recuperación dependientes de la persona ya
  definidos en
  [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md) usan este
  procedimiento como mecanismo de resolución subyacente.

## 6. Casos límite o riesgos

Interpretaciones que no deben reaparecer, porque ya fueron corregidas
durante la consolidación de este diseño:

| Riesgo de interpretación | Tratamiento correcto |
|---|---|
| «Preparación suficiente garantiza cualquier tarea.» | Los requisitos y límites del mundo permanecen; las rutinas directas son otra regla distinta (§3.3). |
| «Todo se resuelve con una única fórmula y una tirada final.» | Procedimiento común con ejecución directa, progreso y comprobaciones pertinentes (§3.1, §3.6). |
| «Cada tarea sencilla conserva una pequeña posibilidad de pifia.» | No se exige incertidumbre artificial cuando corresponde ejecución directa (§3.3). |
| «Dos habilidades se suman y hacen más potente una tarea por tener dos requisitos.» | Media aritmética dentro de la pareja, no suma (§3.2). |
| «La media permite saltarse cualquier carencia de conocimiento.» | Requisitos y capacidad de ejecución son capas diferentes (§3.2). |
| «Un experto solo falla si el mundo le provoca un incidente externo.» | También puede cometer errores propios en acciones inciertas (R05). |
| «Un crítico genera un objeto mejor o más recursos de los que existían.» | Solo cambia descubrimiento o aprovechamiento dentro de existencias y transformaciones válidas (R01). |
| «Por haber estudiado muchos sistemas ya existe un motor validado.» | Hay una dirección de diseño; falta calibración y validación (R20). |

## 7. Preguntas abiertas

La lista completa de decisiones pendientes de calibración (`P01`–`P22`) vive
en
[ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas)
para no duplicarla. Las que afectan directamente a este documento son
`P01`–`P08` (escala y catálogo de características/habilidades remitido a
CHR-006; representación del desconocimiento; peso entre característica y
habilidad efectivas; tabla o función de B; tamaño y persistencia de la
variación de D; requisitos duros por método; condiciones para clasificar una
tarea como básica; delimitación de episodios y fases).

## 8. Ejemplos no normativos

Ver el anexo de fórmulas y ejemplos no aprobados como balance en
[ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md#5-ejemplos-no-normativos),
que conserva también los antecedentes de candidatos de resolución (A, C, E)
descartados o guardados como referencia histórica.
