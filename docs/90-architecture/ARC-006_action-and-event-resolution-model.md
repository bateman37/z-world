---
id: ARC-006
title: Modelo de resolución de acciones, capacidades y ejecución directa/D/B
status: approved
canonical_for:
  - procedimiento común de resolución de un trabajo
  - medias de características y habilidades efectivas
  - acciones básicas sin tirada
  - modelo B (resolución porcentual) y modelo D (trabajo continuo)
  - perfiles de ponderación entre característica y habilidad
  - representación de cero, dato desconocido y precisión interna
  - requisitos duros y clasificación de tareas básicas
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
  - WLD-010
  - WLD-011
  - SET-010
  - SET-011
  - DEC-0007
  - DEC-0011
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
obtener una capacidad final queda cerrado mediante tres perfiles de
ponderación** (`DESIGN-006`, cierra P03; ver §3.7). La fórmula antigua
`(característica efectiva + 2 × habilidad efectiva) / 3` queda descartada
como fórmula universal (ver anexo de fórmulas no aprobadas en
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
duros se justifican por método, clasificado según §3.11 (cierra P06).

**Valores ausentes y precisión (cierra P02, ver §3.8).** No tener
experiencia práctica en una habilidad se representa con el valor real `0`
de la escala `0–10` de
[CHR-006 §3.6](../30-characters/CHR-006_characteristics-and-skill-catalog.md#36-escala-real-0–10-y-calibración-canónica),
nunca con un dato ausente ni con `null`. Un método puede seguir siendo
intentable sin entrenamiento cuando su clasificación lo permita (§3.11). No
se ignora una habilidad requerida por falta de dato, no se interpreta
ausencia como un valor inventado y no se redondea dos veces generando
ventajas por orden de cálculo; las medias y modificadores conservan
precisión interna y solo se redondean al presentarse.

**La media individual no es la fórmula de cooperación.** Esta regla
promedia capacidades de **una persona**. No decide cómo combinar personas:
un mecánico y un electricista no transfieren automáticamente sus mejores
puntuaciones a un superpersonaje colectivo (ver
[ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md#31-trabajo-en-equipo-con-un-líder)).

### 3.3 Posibilidad, requisitos y acciones básicas sin tirada

**ACORDADO (cierra P07, condiciones exactas en §3.12).** Para acciones
sencillas o básicas, si la persona tiene capacidad y posibilidad real de
hacerlas, las realiza sin conservar artificialmente un porcentaje mínimo de
fracaso. La clasificación depende de persona, tarea, método y contexto:
algo rutinario para un especialista puede no serlo para alguien sin
formación. El umbral numérico de superioridad de capacidad que activa esta
regla es **tres puntos o más** sobre la dificultad efectiva, no dos (§3.12);
una diferencia de solo dos puntos no basta por sí sola.

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

**Cerrado (`DESIGN-006`, cierra P04; forma matemática completa en §3.9).**
B se resuelve mediante un margen entre capacidad efectiva y dificultad
efectiva, modulado por una variación aleatoria acotada y persistente, y
traducido a cinco bandas internas de resultado (§3.9). Esta forma sustituye
tanto la función logística como la tabla calibrada que se barajaron como
candidatas sin elegirse (ver antecedentes descartados en
[ARC-008 §5.3](ARC-008_outcomes-knowledge-events-and-validation.md#53-probabilidad-del-candidato-b-descartada)).

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
realmente trabajado y del rendimiento pertinente, y **incluye una variación
acotada de ejecución de hasta `±8 %`** respecto al ritmo calculado (`DESIGN-006`,
cierra P05; tamaño y persistencia exactos en §3.10). Las fases delicadas y
las incidencias no se confunden con el avance rutinario: no se sortea cada
golpe ni se decide al final, retrospectivamente, que todo el trabajo
correcto desaparece.

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

### 3.7 Perfiles de ponderación entre característica y habilidad (cierra P03)

Tras obtener la característica efectiva y la habilidad efectiva (§3.2), la
fase o el método elige uno de estos tres perfiles cerrados de ponderación:

| Perfil | Característica | Habilidad | Uso conceptual |
|---|---:|---:|---|
| Instintivo o físico | 70 % | 30 % | Predominio corporal, sensorial o inmediato. |
| Equilibrado | 50 % | 50 % | La aptitud general y la experiencia importan de forma similar. |
| Técnico o aprendido | 30 % | 70 % | Predominio del dominio adquirido y el procedimiento. |

Fórmula conceptual:

```text
capacidad = característica_efectiva × peso_característica
          + habilidad_efectiva × peso_habilidad
```

El perfil pertenece a la fase o al método, nunca a la persona: la misma
persona puede resolver una fase instintiva y, después, una fase técnica de
la misma acción compuesta con perfiles distintos. No se crean porcentajes
artesanales adicionales por objeto o por familia de contenido; toda
ponderación debe encajar en uno de estos tres perfiles.

Casos permitidos y excepcionales, sin que ninguno invente un cuarto perfil:

- una acción cotidiana puede no necesitar habilidad y depender solo de
  característica;
- una fase puramente aprendida puede depender solo de habilidad efectiva y
  de los requisitos de conocimiento del método (§3.11);
- la media dentro de una pareja de características o de habilidades (§3.2)
  se calcula primero; el perfil de esta sección solo pondera después entre
  los dos grupos ya agrupados;
- la media de una persona nunca es una fórmula de cooperación entre varias
  personas (ver
  [ARC-007 §3.1](ARC-007_teamwork-orders-modes-and-conditions.md#31-trabajo-en-equipo-con-un-líder)).

**EJEMPLO, ilustrativo, no catálogo exhaustivo.** Trepar un muro liso bajo
presión usa un perfil instintivo o físico (Fuerza y Agilidad dominan sobre
Escalada); reparar un cuadro eléctrico complejo usa un perfil técnico o
aprendido (Electricidad domina sobre Técnica); negociar un intercambio con
otra comunidad usa un perfil equilibrado (Carisma/Empatía e Influencia
pesan de forma similar). Estos tres ejemplos no fijan el perfil definitivo
de ninguna acción de contenido futura.

### 3.8 Cero, dato desconocido y precisión (cierra P02)

Se documentan como cuatro capas separadas, sin fusionarlas:

1. **Nivel real actual:** el número `0–10` de característica o habilidad de
   [CHR-006 §3.6](../30-characters/CHR-006_characteristics-and-skill-catalog.md#36-escala-real-0–10-y-calibración-canónica).
2. **Conocimiento o técnica:** información o procedimiento concreto que
   puede estar presente o ausente (ver
   [CHR-002](../30-characters/CHR-002_knowledge-and-learning.md) y
   [SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md)).
3. **Información de la comunidad:** lo que se sabe sobre la persona, el
   método o el mundo (ver §3.13 de
   [ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md#38-conocimiento-imperfecto-y-comunicación-cierra-p16)).
4. **Confianza:** solidez de esa información.

Reglas de cierre:

- No conocer un procedimiento eléctrico concreto no equivale
  automáticamente a Electricidad `0`; una persona puede tener Electricidad
  alta y desconocer un procedimiento específico, o Electricidad baja y
  conocerlo de memoria por una experiencia puntual.
- Electricidad `0` no significa que el dato sea desconocido: es un nivel
  real de competencia práctica nula, coherente con
  [CHR-006 §3.6](../30-characters/CHR-006_characteristics-and-skill-catalog.md#36-escala-real-0–10-y-calibración-canónica).
- Un valor desconocido (por ejemplo, una habilidad que la comunidad nunca
  ha observado en una persona) no se sustituye silenciosamente por `4`, no
  se elimina de una media y no se inventa; se representa como incertidumbre
  de la comunidad (capa 3), nunca como el nivel real de la persona.
- La ausencia de un conocimiento indispensable puede bloquear un método
  aunque la habilidad general de la persona sea alta (§3.11).
- La falta de práctica puede permitir métodos básicos o guiados cuando el
  método lo declare (§3.11), incluso con habilidad `0`.
- Las medias y modificadores se conservan con precisión interna; no se
  redondea en cada paso intermedio, solo al presentar el resultado final.
- No se aplica dos veces una misma causa: por ejemplo, el cansancio no se
  aplica sobre cada capacidad agrupada y de nuevo sobre el resultado global
  sin una decisión expresa de la familia de acción (ver también
  [ARC-007 §3.5](ARC-007_teamwork-orders-modes-and-conditions.md#35-estado-herramientas-y-entorno)).

El nivel actual numérico de la ficha es visible según P22 (ver
[ARC-008 §3.14](ARC-008_outcomes-knowledge-events-and-validation.md#314-presentación-visible-y-potencial-oculto-cierra-p22)
y
[CHR-006 §3.6](../30-characters/CHR-006_characteristics-and-skill-catalog.md#36-escala-real-0–10-y-calibración-canónica)).
La incertidumbre sobre potencial, resultados y conocimiento del mundo
permanece separada de ese nivel actual.

### 3.9 Modelo B: margen, azar acotado y bandas (cierra P04)

**Función conceptual aprobada.** Para una incertidumbre significativa y
accesible (§3.8 de este documento identifica cuándo procede una
comprobación; ver también
[ARC-008 §3.1](ARC-008_outcomes-knowledge-events-and-validation.md#31-resultados-incidencias-conocimiento-y-reintentos)):

```text
margen_previo = capacidad_efectiva - dificultad_efectiva
margen_final = margen_previo + variación_B
```

`capacidad_efectiva` es el resultado del perfil de ponderación de §3.7.
`dificultad_efectiva` incorpora método y condiciones pertinentes (entorno,
herramienta, estado; ver
[ARC-007 §3.5](ARC-007_teamwork-orders-modes-and-conditions.md#35-estado-herramientas-y-entorno))
sin contabilizar dos veces una misma causa.

**Distribución del azar.** `variación_B`:

- está centrada en `0`;
- usa una distribución de campana, no uniforme (documentalmente, una normal
  truncada);
- tiene desviación orientativa `1,15`;
- queda limitada al intervalo `[-4, +4]`;
- hace habituales las variaciones pequeñas y muy raras las extremas;
- se genera de forma determinista y persistente según
  [ARC-008 §3.13](ARC-008_outcomes-knowledge-events-and-validation.md#313-persistencia-aleatoria-y-equivalencia-temporal-cierra-p21).

Esta especificación es conceptual; no elige una librería ni un algoritmo de
muestreo concreto.

**Cinco bandas internas.**

| Margen final | Banda interna | Interpretación |
|---:|---|---|
| `>= 3` | Excepcional | Resultado especialmente favorable dentro de lo físicamente posible. |
| `>= 1` y `< 3` | Favorable | Se alcanza bien el resultado buscado. |
| `>= -1` y `< 1` | Parcial o incierto | Avance, resultado mixto, provisional o información incompleta según la acción. |
| `> -3` y `< -1` | Deficiente recuperable | No se alcanza plenamente; persisten consecuencias, costes o trabajo aprovechable. |
| `<= -3` | Grave potencial | Solo produce gravedad si la acción contenía un peligro o una consecuencia grave plausible. |

Las bandas son internas y nunca se muestran al jugador (ver
[ARC-008 §3.14](ARC-008_outcomes-knowledge-events-and-validation.md#314-presentación-visible-y-potencial-oculto-cierra-p22)).
Cada familia de acción traduce el resultado a lenguaje causal propio: una
reparación puede quedar provisional; una inspección, incompleta; una pieza,
dañada; una negociación, estancada (ver la aplicación por familia en
[ARC-008 §3.3](ARC-008_outcomes-knowledge-events-and-validation.md#33-aplicación-a-las-familias-de-acciones)).

Reglas de cierre:

- Una banda grave no crea una lesión si la acción no contenía un peligro
  capaz de causarla (ver R17 y
  [ARC-008 §3.7](ARC-008_outcomes-knowledge-events-and-validation.md#37-resultados-multidimensionales-críticos-e-incidencias-cierra-p15)).
- Una banda excepcional no crea recursos ni evidencia inexistentes (R01).
- Los requisitos imposibles se bloquean antes de B, no mediante una
  probabilidad diminuta (§3.11).
- B no se usa en toda rutina: solo ante una oportunidad significativa
  (§3.6, y
  [ARC-008 §3.1](ARC-008_outcomes-knowledge-events-and-validation.md#31-resultados-incidencias-conocimiento-y-reintentos)).
- Una resolución coherente puede producir varios efectos relacionados; no
  se sortean diez consecuencias independientes sin necesidad causal.
- El jugador no ve el margen, la variación, los umbrales ni un porcentaje
  exacto (§3.14 de
  [ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md#314-presentación-visible-y-potencial-oculto-cierra-p22)).

Esta forma sustituye definitivamente a la función logística y a la tabla
calibrada barajadas sin elegirse (ver antecedentes en
[ARC-008 §5.3](ARC-008_outcomes-knowledge-events-and-validation.md#53-probabilidad-del-candidato-b-descartada)).

### 3.10 Modelo D: tamaño y persistencia de la variación (cierra P05)

El progreso `D` representa trabajo prolongado y conocido. Decisiones de
cierre:

- La variación aleatoria de rendimiento es pequeña: **hasta `±8 %`**
  respecto al ritmo calculado a partir de la capacidad efectiva (§3.7) y de
  las condiciones pertinentes.
- Se genera **por fase o sesión significativa**, no por tick ni por
  segundo, con la misma persistencia determinista de
  [ARC-008 §3.13](ARC-008_outcomes-knowledge-events-and-validation.md#313-persistencia-aleatoria-y-equivalencia-temporal-cierra-p21).
- Se mantiene estable al pausar, guardar, cargar o cambiar de velocidad de
  simulación.
- Una interrupción que reanuda la misma fase conserva la variación ya
  fijada; no se resamplea al continuar.
- Un cambio real de persona, método, herramienta, estado o fase puede
  recalcular el rendimiento **futuro**, nunca el progreso ya realizado.
- Fatiga, heridas, entorno, herramienta y coordinación son causas distintas
  y pueden tener efectos mayores que el `±8 %`; no forman parte del ruido
  aleatorio de D, sino de los moduladores causales de
  [ARC-007 §3.5](ARC-007_teamwork-orders-modes-and-conditions.md#35-estado-herramientas-y-entorno).
- D no necesita permitir que un principiante supere en velocidad a un
  experto: las sorpresas pertinentes de R04 viven en B (§3.9), no en la
  variación de D.
- No existe una tirada final que pueda borrar horas de trabajo correcto.

### 3.11 Requisitos duros e improvisación por método (cierra P06)

Los requisitos pertenecen al **método**, no al objetivo abstracto. Un
objetivo puede admitir métodos diferentes: reparación profesional,
sustitución, arreglo provisional, adaptación improvisada, desmontaje o
abandono (ver
[SET-009](../40-settlement/SET-009_disassembly-and-world-transformation.md)
para el caso del desmontaje).

Cada método puede declarar: conocimientos o técnicas indispensables;
herramientas; materiales; energía o infraestructura; acceso físico; número
mínimo de personas; funciones necesarias (ver
[ARC-007 §3.1](ARC-007_teamwork-orders-modes-and-conditions.md#31-trabajo-en-equipo-con-un-líder));
estado mínimo de la persona; condiciones ambientales; riesgos y
consecuencias posibles.

**Clasificación cerrada de un método:**

| Clase | Significado |
|---|---|
| Abierto | Cualquiera físicamente capaz puede intentarlo. |
| Improvisable | Admite una alternativa real más lenta, costosa, frágil o arriesgada. |
| Guiado o supervisado | Una persona sin dominio completo puede ejecutar pasos permitidos con manual, instrucciones o supervisión efectiva (ver [ARC-007 §3.1](ARC-007_teamwork-orders-modes-and-conditions.md#31-trabajo-en-equipo-con-un-líder)). |
| Restringido | Sin el conocimiento, medio o condición indispensable, ese método no puede intentarse. |

La improvisación debe ser un método descrito y causal, no una probabilidad
residual de realizar lo imposible mediante una tirada de B con capacidad
insuficiente. Bloquear un método no bloquea otros métodos posibles ni otras
interacciones con el objetivo: no saber desmontar correctamente una
instalación no elimina el resto de interacciones posibles con el edificio
(§3.1).

### 3.12 Umbral de tarea básica y episodios comprobables (cierra P07–P08)

**Clasificación dinámica de tareas básicas (cierra P07).** Una tarea es
básica **para una persona, un método y una situación concretos**, nunca
universalmente. Se ejecuta directamente (§3.3) cuando se cumplen a la vez:

1. cumple todos los requisitos duros del método (§3.11);
2. el método es conocido o suficientemente familiar;
3. la capacidad efectiva supera la dificultad efectiva en **tres puntos o
   más** (`+3`, no `+2`);
4. las condiciones son estables;
5. no existe oposición activa (ver
   [ARC-008 §3.10](ARC-008_outcomes-knowledge-events-and-validation.md#310-oposición-activa-y-pasiva-cierra-p18));
6. no queda una incertidumbre significativa de descubrimiento, diagnóstico,
   persuasión o resultado;
7. un pequeño error no puede producir una consecuencia grave pertinente.

Cualquier propuesta anterior que use una diferencia de dos puntos queda
corregida: el umbral acordado es `+3`. Ejecución directa no significa
instantánea, gratuita o inmune a interrupciones: puede consumir tiempo,
materiales, esfuerzo, herramienta y energía; dos personas pueden completar
directamente el mismo trabajo a ritmos distintos gobernados por D (§3.10).

**Fases comprobables y episodio persistente (cierra P08).** Una
comprobación B (§3.9) solo aparece ante una oportunidad significativa, por
ejemplo: descubrir o interpretar información; comprometer material
irreversible; manipular un elemento delicado; entrar en oposición con otro
agente; exponerse a un peligro; verificar un resultado genuinamente
incierto; cambiar de método de forma significativa.

Un episodio queda definido conceptualmente por:

```text
objetivo + método + blanco + participantes + condiciones relevantes + esfuerzo comprometido
```

Reglas de cierre:

- No se comprueba por fotograma, animación, golpe, paso ni unidad
  transportada.
- Interrumpir y continuar el **mismo** episodio no genera otra oportunidad
  aleatoria.
- Guardar/cargar no genera otra oportunidad (ver
  [ARC-008 §3.13](ARC-008_outcomes-knowledge-events-and-validation.md#313-persistencia-aleatoria-y-equivalencia-temporal-cierra-p21)).
- Cambiar solo el nombre de la orden o alternar un modo sin trabajo real no
  genera otra oportunidad.
- Otra persona, nueva evidencia, descanso, herramienta diferente, método
  distinto, mayor profundidad o cambio real de condiciones pueden
  justificar un nuevo episodio o una nueva fase.
- Una semana de trabajo no puede quedar resumida arbitrariamente en una
  única tirada final si contiene fases físicamente separables.

## 4. Reglas aprobadas

- Las medias aritméticas de igual peso dentro de una pareja de
  características requeridas, y dentro de una pareja de habilidades
  requeridas, son la única regla de combinación aprobada (§3.2).
- Tras agrupar por pareja, la capacidad final pondera característica y
  habilidad efectivas mediante uno de los tres perfiles cerrados de §3.7:
  instintivo/físico (70/30), equilibrado (50/50) o técnico/aprendido
  (30/70).
- Las acciones básicas viables se ejecutan sin tirada si la persona tiene
  capacidad y medios reales, con un umbral de superioridad de capacidad de
  `+3` puntos sobre la dificultad efectiva cuando ese umbral sea pertinente
  para la clasificación (§3.3, §3.12, R07).
- El azar nunca crea objetos, recursos, pistas o capacidades imposibles
  (R01); nunca sustituye un conocimiento o medio indispensable (§3.2,
  §3.11).
- `0` es un valor real de nivel actual, distinto de dato desconocido o de
  falta de conocimiento; las medias y modificadores conservan precisión
  interna y solo redondean al presentarse (§3.8).
- B y D son modelos complementarios, no alternativos: D resuelve avance con
  una variación acotada de hasta `±8 %` por fase o sesión (§3.10); B
  resuelve incertidumbre pertinente mediante margen, variación acotada
  `[-4, +4]` y cinco bandas internas (§3.9).
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
- La decisión transversal que respalda el cierre de este documento junto
  con `ARC-007` y `ARC-008` es
  [DEC-0011](../decisions/DEC-0011_hybrid-resolution-engine-and-capability-presentation.md);
  la trazabilidad completa del cierre vive en
  [DISC-0005](../discovery/DISC-0005_resolution-engine-closure-traceability.md).
- Este procedimiento común es también el que ejecuta la transformación de
  terreno, la construcción lineal, las acciones sobre accesos, el
  transporte local y el ciclo agrícola aprobados por `DESIGN-008` (ver
  [WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md),
  [WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md),
  [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md) y
  [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md)); ninguno
  de esos documentos redefine este procedimiento ni sus modelos B/D.

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
| «El umbral de tarea básica es una diferencia de dos puntos.» | El umbral cerrado es `+3` (§3.12, P07). |
| «No tener una habilidad es un dato ausente, como `null`.» | `0` es un valor real de nivel actual, distinto de dato desconocido (§3.8, P02). |

## 7. Preguntas abiertas

**`P01`–`P08` quedan cerradas por `DESIGN-006`** y ya no figuran como
decisiones pendientes: escala y catálogo de características/habilidades
(cerrados en
[CHR-006](../30-characters/CHR-006_characteristics-and-skill-catalog.md));
representación de cero, dato desconocido y precisión (§3.8); peso entre
característica y habilidad efectivas mediante tres perfiles (§3.7); modelo
B con margen, variación acotada y cinco bandas (§3.9); tamaño y
persistencia de la variación de D (§3.10); requisitos duros y clasificación
de métodos (§3.11); umbral `+3` de tarea básica y delimitación de episodios
y fases (§3.12). La lista completa de decisiones de calibración del motor
(`P09`–`P22`), que pertenecen a
[ARC-007](ARC-007_teamwork-orders-modes-and-conditions.md) y
[ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md), también
queda cerrada; el estado y la trazabilidad final viven en
[ARC-008 §4](ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas)
y en
[DISC-0005](../discovery/DISC-0005_resolution-engine-closure-traceability.md).
Cualquier calibración futura de valores concretos por acción, objeto o
familia de contenido (por ejemplo, la dificultad efectiva exacta de una
reparación concreta) es parametrización de contenido, no una reapertura del
modelo base cerrado en este documento.

## 8. Ejemplos no normativos

Ver el anexo de fórmulas y ejemplos no aprobados como balance en
[ARC-008](ARC-008_outcomes-knowledge-events-and-validation.md#5-ejemplos-no-normativos),
que conserva también los antecedentes de candidatos de resolución (A, C, E)
descartados o guardados como referencia histórica.
