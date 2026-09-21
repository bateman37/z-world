---
id: CHR-007
title: Potencial oculto, calibre oculto y adaptación al apocalipsis
status: draft
canonical_for:
  - potencial oculto y su comunicación cualitativa
  - calibre oculto de 1 a 5 estrellas
  - adaptación al apocalipsis como sistema separado del calibre
  - generación conceptual de un superviviente y procesado diario
depends_on:
  - CHR-001
  - CHR-006
related:
  - CHR-002
  - CHR-003
  - CHR-004
  - UI-004
---

## 1. Propósito

Definir el sistema, todavía en calibración, de **potencial oculto**,
**calibre oculto** y **adaptación al apocalipsis** de un superviviente: qué
margen real de desarrollo tiene, cómo se genera antes que el resto de la
persona, cómo se descubre progresivamente sin exponer cifras, y cómo se
procesa sin recalcular la ficha completa cada día. Complementa el catálogo
cerrado de características y habilidades de
[CHR-006](CHR-006_characteristics-and-skill-catalog.md); no lo modifica.

## 2. Principios que no deben romperse

- Nivel actual, potencial real y velocidad de aprendizaje son tres variables
  distintas; ninguna se deduce automáticamente de otra.
- El potencial real nunca se muestra como cifra, fracción, cociente ni rango
  numérico al jugador.
- Todo superviviente tiene un suelo mínimo de aprendizaje: un potencial bajo
  reduce el margen de crecimiento, no la capacidad de aprender tareas
  básicas.
- El calibre oculto no es un modificador directo a las acciones: solo
  condiciona la distribución de los potenciales generados.
- El potencial no mejora la ejecución de una acción actual.

## 3. Modelo funcional

### 3.1 Potencial oculto y desarrollo

Inspirado conceptualmente en la separación entre capacidad actual,
potencial real y conocimiento de ese potencial usada en juegos de gestión
deportiva, sin copiar una escala concreta.

- **Nivel actual**: lo que la persona puede hacer hoy (por ejemplo,
  Conducción 3); es el único valor que forma parte de la ficha funcional
  del catálogo de [CHR-006](CHR-006_characteristics-and-skill-catalog.md).
- **Potencial real**: el margen real que posee la persona. Está oculto y
  nunca se presenta como `3/8`, `5/9`, «potencial 177» ni cifra equivalente.
- **Potencial estimado**: la opinión que la comunidad puede construir sobre
  ese margen, comunicada mediante frases cualitativas no cerradas
  todavía, por ejemplo: «todavía no conocemos bien sus posibilidades»,
  «da señales de tener bastante recorrido», «parece tener mucho margen
  para seguir mejorando», «todavía puede progresar, aunque el margen
  parece más limitado», «su evolución empieza a estabilizarse», «parece
  estar cerca de su límite», «todo indica que ha alcanzado el máximo que
  puede desarrollar en este ámbito» (EJEMPLO, catálogo de frases
  pendiente, ver §7).

El mensaje mostrado cambia por dos motivos distintos: **(A)** se conoce
mejor a la persona (de «no tenemos referencias suficientes» a «empieza a
mostrar una facilidad poco habitual», sin que el potencial real haya
cambiado) o **(B)** la persona ha desarrollado parte de su potencial (de
«tiene mucho recorrido» a «todavía puede progresar algo más», años después,
sin haber cambiado la cifra oculta pero sí cuánto queda por desarrollar).

**Potenciales de características.** Las nueve características de
[CHR-006 §3.2](CHR-006_characteristics-and-skill-catalog.md#32-nueve-características)
pueden tener potencial individual, dentro de los límites que finalmente
defina el sistema.

**Potenciales por campos de habilidad.** Para evitar 34 techos
completamente independientes y arbitrarios, las habilidades se agrupan en
**campos de potencial**, con la base conceptual: `potencial del campo +
particularidad de habilidad concreta`. Ejemplo: un potencial técnico alto
puede combinarse con Mecánica especialmente alta, Electricidad dentro de lo
esperado y Electrónica algo más limitada, generando perfiles coherentes sin
un mismo techo para todas las habilidades del campo. La agrupación inicial
puede seguir familias como Movimiento, Combate, Atención y exploración,
Supervivencia y naturaleza, Construcción/oficios/recursos, Tecnología,
Transporte, Producción, Salud, Ciencias, Social, Personal y Creatividad; sus
nombres y fronteras exactos se refinan cuando se diseñen dominios y
profesiones (PENDIENTE, ver §7). La decisión ya cerrada es que **el
potencial de habilidad no se genera como 34 números totalmente
independientes sin relación**.

**Mínimo de potencial.** Todo personaje tiene un suelo de desarrollo
suficiente para aprender competencias básicas: una persona con poco
potencial en Electricidad puede llegar a conexiones sencillas, sustituir
elementos básicos, seguir procedimientos simples y trabajar bajo
instrucciones, sin convertirse en especialista en redes complejas. Este
suelo evita que el generador cree personas incapaces de aprender tareas
humanas básicas solo por azar.

**El potencial no mejora la acción actual.** Tener un enorme futuro en
Mecánica no ayuda mágicamente a reparar un motor hoy: en la resolución de
la acción intervienen nivel actual, conocimientos, características,
herramientas, estado, entorno y contexto (ver
[ARC-004](../90-architecture/ARC-004_action-and-event-resolution-model.md)).
El potencial solo condiciona el desarrollo futuro.

### 3.2 Calibre oculto del superviviente

Tipo de superviviente oculto, conceptualmente de 1 a 5 estrellas, nunca
mostrado al jugador.

**Orden de generación (BASE PROPUESTA):**

> 1. calibre oculto del superviviente
> 2. potenciales de características
> 3. potenciales de campos
> 4. particularidades de habilidades
> 5. pasado / profesión / aficiones
> 6. habilidades actuales y conocimientos
> 7. adaptación al apocalipsis

El calibre condiciona cómo se genera el potencial de la persona; se genera
antes que el resto del personaje.

**Las estrellas no son un modificador.** Un superviviente de 5 estrellas no
obtiene «+20 % a todo». El calibre afecta a la distribución de potenciales:
un perfil superior tiene más probabilidad de presentar varios potenciales
altos, mayor versatilidad, uno o varios talentos excepcionales y
combinaciones especialmente favorables, pero puede seguir teniendo
debilidades, habilidades actuales bajas, mala adaptación, problemas
sociales, aflicciones o desconocimiento total de ciertas áreas.

**Significado conceptual:**

| Estrellas | Significado |
|---|---|
| 1 | No es inútil: menor potencial global medio. Puede aprender, ser competente, tener experiencia, poseer un talento concreto o resultar imprescindible para la comunidad. |
| 2 | Perfil corriente con varios márgenes de desarrollo útiles. |
| 3 | Buena capacidad global y posibilidad de destacar en varios ámbitos. |
| 4 | Excepcionalmente capaz, con varios campos de gran potencial o alguna capacidad sobresaliente. |
| 5 | Muy raro: perfil humano extraordinario, comparable narrativamente a personajes extremadamente capaces de ficción de supervivencia. No significa perfección ni invulnerabilidad: puede ser pésimo en relaciones, inexperto, tener miedo, desconocer medicina, estar lesionado o tener conflictos importantes. |

**El calibre global no equivale a utilidad concreta.** Ejemplo: un
superviviente interno de 1 estrella con Agricultura 7 y gran experiencia en
cultivo puede ser mucho más valioso para un asentamiento agrícola que un
superviviente interno de 5 estrellas con Agricultura 0 y sin experiencia. El
calibre nunca sustituye el análisis del personaje real.

### 3.3 Adaptación al apocalipsis

El calibre y la adaptación se separan de forma deliberada; esta decisión es
importante.

- **Calibre**: potencial global, capacidad futura, perfil de desarrollo;
  relativamente estable (§3.2).
- **Adaptación al apocalipsis**: cuánto ha aprendido la persona a
  desenvolverse en el nuevo mundo. Puede crecer mediante exposición a
  zombis, escasez, expediciones, vida fuera de refugios, pérdidas,
  violencia, improvisación, saqueos, viajes, situaciones de riesgo, vida
  comunitaria inestable y supervivencia práctica.

**Combinaciones ilustrativas:**

- **5 estrellas + adaptación baja**: persona extraordinaria que ha
  permanecido protegida; mucho potencial, pero todavía no sabe
  desenvolverse bien fuera.
- **2 estrellas + adaptación muy alta**: potencial global moderado, mucho
  tiempo sobreviviendo en condiciones extremas; puede ser una elección
  mucho mejor para una expedición peligrosa.

**Evolución de la población mundial.** A medida que avanza el apocalipsis,
debe ser más difícil encontrar supervivientes de bajo calibre viviendo de
forma independiente, no porque el juego deje de generarlos, sino por
**selección de supervivencia**. Nunca desaparecen: un superviviente de 1
estrella puede seguir vivo porque pertenecía a una comunidad fuerte, alguien
lo protegía, estaba aislado, tenía recursos, tuvo suerte o acaba de perder a
su grupo; el contexto explica cómo ha sobrevivido. Los perfiles de 4 y 5
estrellas siguen siendo poco frecuentes en cualquier momento de la partida.

### 3.4 Descubrimiento progresivo del personaje

El potencial y otros aspectos de la persona se revelan gradualmente
mediante trabajo, práctica, situaciones nuevas, convivencia, relaciones,
mentoría, conversaciones, participación comunitaria, paso del tiempo y
acontecimientos.

**No se revela todo trabajando.** Convivir con alguien revela personalidad,
valores, hábitos, historia y relaciones, pero no necesariamente su potencial
en Electrónica. Trabajar con alguien revela capacidad, aprendizaje,
disciplina y especialización, pero no necesariamente toda su biografía.

**Una gran actuación no revela el techo.** El motor permite que un novato
tenga una actuación excepcional (R04 de
[ARC-004](../90-architecture/ARC-004_action-and-event-resolution-model.md#2-principios-que-no-deben-romperse));
por tanto, una actuación extraordinaria es un indicio, no una confirmación
del potencial máximo. La valoración necesita repetición, diversidad de
situaciones, tiempo y contexto.

**Fallar tampoco demuestra falta de potencial.** Un mal día puede deberse a
cansancio, hambre, herramientas, mala enseñanza, presión, lesión, contexto o
dificultad; la evaluación separa rendimiento puntual de capacidad de
desarrollo.

### 3.5 Aprendizaje, práctica y mentoría

**Aprender requiere oportunidades.** El potencial no se desarrolla solo:
puede requerir práctica, formación, un mentor, lectura, herramientas, tareas
progresivamente más exigentes, tiempo y conocimientos (ver
[CHR-002](CHR-002_knowledge-and-learning.md)).

**Aprender rápido y tener techo alto son cosas distintas.** Se distinguen
nivel actual, velocidad de aprendizaje y potencial final: una persona puede
progresar muy rápido y estabilizarse antes, progresar lentamente y llegar
muy lejos, o aprender bien con mentor y peor en solitario.

**Mentoría, dos funciones diferentes:**

- **Acelerar aprendizaje**: un buen formador ayuda a aprender; la habilidad
  Enseñanza
  ([CHR-006 §3.3.31](CHR-006_characteristics-and-skill-catalog.md#33-catálogo-completo-de-34-habilidades-base))
  influye especialmente aquí.
- **Acelerar el conocimiento del potencial**: un especialista que trabaja
  directamente con un aprendiz puede identificar antes facilidad, errores
  recurrentes, capacidad de adaptación, velocidad de progreso y límites
  aparentes; influye la experiencia pertinente del mentor, no solo su
  Enseñanza.

**Estar cerca no equivale a aprender.** Se aprende por participación
pertinente: transportar herramientas para un mecánico no concede
automáticamente Mecánica; ayudar a desmontar, seguir indicaciones y
ejecutar pasos reales sí puede generar aprendizaje.

### 3.6 Presentación por capas de la ficha

**Vista rápida.** Debe responder quién es, qué puede aportar, qué le
ocurre, qué está haciendo y qué necesitamos saber ahora. Ejemplo
conceptual:

> Álex Romero — antiguo dependiente — responsabilidad actual: transporte.
> Conducción 4, parece tener bastante recorrido. Mecánica 1, todavía
> conocemos poco sus posibilidades. Estado: descansado. Relación destacada:
> aprende bien trabajando con Marta.

**Vista de capacidades.** Puede incluir características, habilidades,
dominios, conocimientos, evolución y valoraciones de potencial; nunca
muestra estrellas, potencial real ni el máximo numérico oculto (coherente
con la prohibición de mostrar umbrales numéricos ya cerrada en
[UI-004](../80-interface/UI-004_qualitative-capability-presentation.md)).

**Vista personal.** Rasgos, personalidad, valores, objetivos y
preferencias (ver [CHR-004](CHR-004_life-history-and-personal-arcs.md)).

**Vista social.** Relaciones relevantes, mentores, aprendices, confianza,
conflictos y vínculos (ver
[CHR-003](CHR-003_autonomy-intentions-and-behavior.md) y
[SOC-001](../50-society/SOC-001_living-community.md)).

**Vista biográfica.** Las tres etapas ya definidas en
[CHR-004](CHR-004_life-history-and-personal-arcs.md): antes del apocalipsis,
comienzo del apocalipsis y evolución durante la partida.

### 3.7 Generación conceptual de un superviviente

Orden de generación acordado a nivel conceptual, coherente con §3.2:

1. **Calibre oculto**: se genera el tipo de superviviente de 1 a 5
   estrellas.
2. **Potenciales de características**: se generan los márgenes ocultos de
   las nueve características; el calibre condiciona la distribución, no
   fija valores iguales.
3. **Potenciales de campos de habilidad**: se genera la base de potencial
   de los distintos campos.
4. **Particularidades**: se introducen desviaciones individuales para
   evitar perfiles uniformes (ejemplo: campo técnico alto, Mecánica
   excepcional, Electricidad normal dentro de ese campo, Electrónica más
   limitada).
5. **Trayectoria**: se genera una historia coherente (edad, formación,
   trabajos, aficiones, oportunidades, relaciones, acontecimientos),
   compatible con el tiempo real disponible en la vida del personaje; ver
   las tres etapas biográficas de
   [CHR-004](CHR-004_life-history-and-personal-arcs.md).
6. **Capacidad actual**: el pasado convierte oportunidades vividas en
   niveles de habilidad, dominios y conocimientos; el nivel actual no puede
   superar incoherentemente el potencial generado.
7. **Experiencia del apocalipsis**: se genera adaptación, aprendizajes,
   pérdidas, contactos, supervivencia y experiencias (§3.3).
8. **Estado actual**: se determina salud, equipo, necesidades, relaciones,
   objetivos y posición en el mundo.

### 3.8 Procesado diario y coste de simulación

El sistema de potencial no se recalcula continuamente.

**Durante el día**, las actividades generan **evidencias ligeras**:
condujo, resolvió un problema nuevo, aprendió rápido, trabajó con mentor,
falló en determinada situación, participó en un nuevo tipo de tarea,
colaboró con alguien o mostró una reacción relevante.

**Al final del día**, se ejecuta un procesamiento agrupado que puede
actualizar aprendizaje, estimación del potencial, confianza de la
estimación, relación mentor/aprendiz, descubrimiento de rasgos y elementos
biográficos determinados.

**Solo se procesa lo relevante.** No se recalculan todos los personajes por
todas las habilidades y características. Si una persona hoy condujo, ayudó
en una reparación y trabajó con otra persona, el cierre diario revisa
Conducción, el campo relacionado, Mecánica si realmente participó, Técnica
si existe evidencia pertinente, la relación con esa persona y el aprendizaje
asociado; el resto de la ficha no se procesa.

**El potencial real no se rerrollea.** El cierre diario actualiza
aprendizaje, evidencia y la valoración de la comunidad; no vuelve a generar
el potencial de la persona. Permitir cambios extraordinarios del potencial
real por acontecimientos excepcionales requeriría un diseño expreso futuro.

## 4. Reglas aprobadas

- El potencial real está oculto y nunca se muestra como cifra al jugador
  (§3.1).
- El calibre oculto se genera antes que el resto del personaje y condiciona
  la distribución de potenciales, sin ser un bonificador directo (§3.2).
- Calibre y adaptación al apocalipsis son sistemas distintos (§3.3).
- Todo superviviente conserva un mínimo de potencial que permite aprender
  competencias básicas (§3.1).
- El sistema acumula evidencias ligeras durante el día y procesa la
  valoración de potencial principalmente al cierre diario, sin recalcular
  toda la ficha de todos los personajes (§3.8).

## 5. Interacciones con otros sistemas

- Consume el catálogo cerrado de características y habilidades de
  [CHR-006](CHR-006_characteristics-and-skill-catalog.md); no lo redefine.
- La mentoría y la transferencia de conocimiento consultan
  [CHR-002](CHR-002_knowledge-and-learning.md).
- Las decisiones autónomas relacionadas con objetivos, valores y presión se
  desarrollan en
  [CHR-003](CHR-003_autonomy-intentions-and-behavior.md).
- La trayectoria biográfica en tres etapas es propiedad de
  [CHR-004](CHR-004_life-history-and-personal-arcs.md); este documento solo
  ordena su generación dentro del proceso de §3.7.
- La prohibición de mostrar umbrales numéricos de capacidad en interfaz
  normal ya está cerrada en
  [UI-004](../80-interface/UI-004_qualitative-capability-presentation.md).
- El motor de resolución de acciones ([ARC-004](../90-architecture/ARC-004_action-and-event-resolution-model.md))
  usa el nivel actual de una habilidad, no su potencial.

## 6. Casos límite o riesgos

1. **Bajo nivel actual y enorme potencial.** Una persona con Conducción 1 y
   calibre oculto alto puede pasar de «tiene muy poca experiencia
   conduciendo» a «está asimilando las indicaciones con rapidez» y luego a
   «parece tener un margen de desarrollo poco habitual», sin mostrar nunca
   una cifra de potencial.
2. **Especialista veterano con margen limitado.** Una persona con Mecánica
   8, muchos años de oficio, calibre global moderado y potencial casi
   desarrollado puede ser mucho más útil hoy que alguien joven de gran
   potencial; la ficha puede terminar mostrando «su nivel ya está muy cerca
   de todo lo que parece poder desarrollar en esta disciplina», sin que eso
   reduzca su valor.
3. **Superviviente de 5 estrellas poco adaptado.** Grandes potenciales
   (Razonamiento alto, Técnica alta, varios campos prometedores) con
   experiencia apocalíptica mínima puede bloquearse en situaciones que
   otro superviviente más corriente afronta mejor por haberlas vivido
   muchas veces.
4. **Superviviente de 1 estrella imprescindible.** Calibre oculto bajo,
   Agricultura 8 por una vida de experiencia, conocimiento local y gran
   relación con la comunidad puede ser esencial durante años: las
   estrellas no deciden quién merece quedarse.
5. **Herbolaria sin crear otra habilidad.** Localizar y utilizar una planta
   medicinal puede implicar Advertir/Forrajeo (encontrarla), Ciencias/
   Botánica (identificarla), conocimiento (propiedades), Medicina (uso
   terapéutico) y Ciencias/Química o dominio adecuado (preparar un extracto
   complejo); no existe una única barra «Herbolaria 8» que lo resuelva
   todo.
6. **Horda aproximándose.** Un personaje puede oír sonidos, ver movimiento,
   detectar vibraciones o notar comportamiento animal extraño; la
   habilidad relevante es Advertir, no una «Observación» genérica, porque
   todos los sentidos pueden participar; Percepción aporta la capacidad
   sensorial y Advertir determina cómo se utiliza esa información (ver
   [CHR-006 §3.3.5](CHR-006_characteristics-and-skill-catalog.md#33-catálogo-completo-de-34-habilidades-base)).

### Reglas invariantes del sistema de personaje (42)

Deben preservarse en futuras entregas:

1. La ficha es modular y biográfica.
2. El jugador no conoce todo el personaje inmediatamente.
3. Las nueve características son Fuerza, Resistencia, Agilidad, Destreza,
   Percepción, Técnica, Razonamiento, Carisma y Empatía.
4. Agilidad y Destreza son diferentes.
5. Percepción y Advertir son diferentes.
6. Carisma y Empatía son diferentes.
7. Técnica no sustituye habilidades técnicas.
8. Razonamiento no se aplica por defecto a toda acción compleja.
9. Existen habilidades base, dominios, conocimientos y trabajos.
10. Un trabajo no es automáticamente una habilidad.
11. Las tareas básicas pueden ejecutarse sin tirada.
12. Una acción puede combinar varias habilidades o características.
13. Advertir puede utilizar todos los sentidos.
14. Advertir participa en el vistazo inicial al entrar en un lugar.
15. Orientación se mantiene independiente de Supervivencia.
16. Supervivencia es deliberadamente una habilidad amplia y central.
17. Caza no es habilidad; es trabajo compuesto.
18. Trampeo pasa a Supervivencia.
19. Fontanería pasa a Obra.
20. Informática y Comunicaciones se unifican en Sistemas y Comunicaciones.
21. Persuasión y Engaño se unifican en Influencia.
22. Organización queda fuera como habilidad base.
23. Memoria queda fuera como habilidad base.
24. Investigación no es habilidad.
25. Ciencias vuelve como habilidad con dominios.
26. Excavación y Extracción sustituye a Minería.
27. El potencial real está oculto.
28. El jugador nunca ve el máximo numérico del potencial.
29. El potencial se comunica mediante frases y evidencia.
30. Todos tienen un mínimo de potencial que permite aprender lo básico.
31. El calibre oculto 1–5 se genera antes que el resto del personaje.
32. El calibre condiciona potenciales; no da bonificadores directos.
33. Un 1 estrella no es inútil.
34. Un 5 estrellas no es perfecto.
35. Calibre y adaptación al apocalipsis son sistemas diferentes.
36. Conforme pasa el tiempo, es menos frecuente encontrar supervivientes de
    bajo calibre viviendo de forma independiente, pero nunca imposible.
37. El sistema acumula evidencias durante el día.
38. La valoración de potencial se procesa principalmente al cierre diario.
39. Mentores y equipos aceleran aprendizaje y descubrimiento de potencial
    cuando existe interacción real.
40. La profesión anterior explica capacidades; no añade bonos redundantes.
41. La biografía continúa durante toda la partida.
42. El personaje puede cambiar de función y especialización a lo largo de
    su vida.

## 7. Preguntas abiertas

### 7.1 Escalas exactas

Qué significa cada punto de 1 a 10, velocidad media de aprendizaje, curvas
de progreso y dificultad de alcanzar niveles altos.

### 7.2 Campos de potencial

La existencia de potencial por campos está acordada (§3.1); faltan nombres
finales, fronteras, qué habilidades comparten campo y cuánto puede
desviarse una habilidad respecto a su campo.

### 7.3 Distribución de estrellas

No se han fijado porcentajes de aparición de 1 a 5 estrellas ni las curvas
temporales exactas de la evolución de la población mundial (§3.2, §3.3).

### 7.4 Frases de potencial

Se ha decidido utilizar lenguaje cualitativo (§3.1); falta el catálogo de
frases, niveles de confianza, reglas para actualizar mensajes y cómo evitar
cambios demasiado frecuentes o contradictorios.

### 7.5 Adaptación al apocalipsis

Está separada del calibre (§3.3); faltan su escala, dimensiones,
visibilidad, cómo progresa y cómo afecta a acciones concretas.

### 7.6 Dominios de cada habilidad

Ver
[CHR-006 §7](CHR-006_characteristics-and-skill-catalog.md#7-preguntas-abiertas):
los dominios listados son ejemplos, no el catálogo máximo definitivo de
especializaciones, proficiencias, conocimientos o profesiones.

### 7.7 Rasgos, beneficios y aflicciones

La arquitectura general de rasgos, beneficios y particularidades vive en
[CHR-004](CHR-004_life-history-and-personal-arcs.md); el catálogo concreto
se diseñará en entregas posteriores.

### 7.8 Interfaz final

Se ha fijado la filosofía por capas (§3.6); quedan pendientes distribución
visual, navegación, tooltips, alertas, comparación de supervivientes e
información mostrada en asignación de trabajos.

## 8. Ejemplos no normativos

Los casos de §6 (1 a 6) y las frases de potencial de §3.1 son EJEMPLOS que
ilustran el sistema; no fijan catálogo, fórmula, cantidad, duración ni
balance definitivo.
