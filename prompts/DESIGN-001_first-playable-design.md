# Z-World — DESIGN-001: especificación funcional cerrada y primera versión jugable

## Autoridad de este encargo

Este prompt recoge decisiones funcionales ya tomadas con el propietario del
proyecto. Claude Code **no debe reinterpretarlas, sustituirlas por sistemas
propios, ni convertirlas en opciones de diseño**. Su trabajo consiste en
documentarlas en las rutas indicadas, mantener la coherencia entre fuentes
canónicas y dejar una hoja de ruta concreta para implementarlas después.

Cuando el prompt use «debe», es una decisión cerrada. Cuando use
«queda abierto», debe registrarse como pregunta abierta y no completarse con
una decisión arbitraria. No crear una alternativa «por si acaso».

La entrega es exclusivamente documental. Al acabar seguirá sin existir código
de juego, proyecto Godot, escenas ni pruebas ejecutables.

## 1. Precondiciones y lectura mínima

Trabaja sobre la rama actual del repositorio. No crees otra rama, no cambies a
una rama distinta y no fusiones nada automáticamente. Conserva cambios ajenos.

Lee, en este orden:

1. `AGENTS.md` y `CLAUDE.md`.
2. `docs/INDEX.md`, `docs/STATUS.md`, `docs/OPEN-QUESTIONS.md` y
   `docs/00-governance/DOC-001_documentation-system.md`.
3. Los documentos indicados en la tabla del apartado 3.
4. `prompts/README.md` e `prompts/INDEX.md`.

No leas todo `docs/` recursivamente. Usa los índices y las dependencias
declaradas. Toda la prosa para personas se escribe en español; conserva IDs,
rutas, nombres técnicos, código y claves de contratos en su forma original.

No hagas investigación adicional, no instales herramientas y no consultes
servicios externos. Los referentes se registran solo como antecedentes en el
documento indicado.

## 2. Objetivo

Cerrar la especificación funcional de cómo se juega minuto a minuto en el
mapa local y definir exactamente la primera versión visual que permitirá
probarla.

Z-World es una estrategia de comunidad superviviente: el jugador organiza un
asentamiento en 3D, conoce a sus habitantes y observa las consecuencias. No
maneja un avatar en primera persona. Puede intervenir temporalmente sobre una
persona, pero el juego sigue siendo de gestión.

La identidad del juego es que descubrir el territorio y conocer a las personas
cambia de forma real las soluciones disponibles. El refugio inicial no es una
meta final ni un guion de primer año: es el primer lugar desde el que puede
nacer una historia distinta en cada partida.

## 3. Archivos obligatorios y responsabilidades cerradas

Crea exactamente los siguientes documentos nuevos, con cabecera YAML conforme
a `DOC-001`. Usa los IDs y nombres indicados. Añádelos a los índices de sus
dominios y enlázalos solo desde los documentos existentes que correspondan.

| Archivo nuevo | ID | Responsabilidad exclusiva |
|---|---|---|
| `docs/80-interface/UI-001_interaction-and-command-model.md` | `UI-001` | Selección, prioridades, designaciones, zonas, control puntual con ratón e información operativa. |
| `docs/30-characters/CHR-003_autonomy-intentions-and-behavior.md` | `CHR-003` | Cómo una persona elige, rechaza o inicia acciones y cómo evoluciona su comportamiento. |
| `docs/20-world/WLD-002_local-exploration-and-information.md` | `WLD-002` | Estado real de lugares, información descubierta, observar, inspeccionar y aprovechar. |
| `docs/40-settlement/SET-003_resources-logistics-and-condition.md` | `SET-003` | Recursos localizados, reservas, transporte, condición, almacenamiento y deterioro. |
| `docs/60-threats/THR-001_zombie-threat-model.md` | `THR-001` | Zombi estándar, ruido, riesgo, combate y configuración futura de amenaza. |
| `docs/90-architecture/ARC-002_procedural-generation-and-persistence.md` | `ARC-002` | Generación bajo demanda reproducible, simulación, descarga visual y persistencia. |
| `docs/roadmap/RDM-001_first-playable-slice.md` | `RDM-001` | Alcance cerrado de la primera prueba visual y entregas de implementación posteriores. |
| `docs/discovery/DISC-0002_design-references.md` | `DISC-0002` | Antecedentes de diseño, sin reglas canónicas. |
| `docs/decisions/DEC-0004_mouse-strategic-control.md` | `DEC-0004` | Control individual con ratón dentro de un juego de gestión. |
| `docs/decisions/DEC-0005_reproducible-lazy-generation.md` | `DEC-0005` | Generación bajo demanda estable y reproducible. |

Actualiza además, sin duplicar reglas:

| Archivo existente | Actualización obligatoria |
|---|---|
| `docs/10-vision/VIS-001_game-vision.md` y `VIS-002_design-pillars.md` | Añadir gestión con intervención puntual, exploración de personas/lugares y progreso sin escalada militar obligatoria. |
| `docs/20-world/WLD-001_world-scales.md` | Enlazar `WLD-002`; mantener abierto el mapa estratégico jugable. |
| `docs/30-characters/CHR-001_character-model.md` y `CHR-002_knowledge-and-learning.md` | Enlazar y delimitar `CHR-003`; separar persona, habilidad, conocimiento, aptitud y estado. |
| `docs/40-settlement/SET-001_settlement-growth.md` y `SET-002_production-and-solutions.md` | Enlazar `SET-003`; reflejar soluciones alternativas y el refugio como inicio. |
| `docs/50-society/SOC-001_living-community.md` y `docs/70-narrative/NAR-001_emergent-narrative.md` | Enlazar autonomía, memoria y consecuencias sin rehacer esos sistemas completos. |
| `docs/90-architecture/ARC-001_technical-direction.md` | Enlazar `ARC-002`; conservar Godot 4, GDScript, guardado local y separación simulación/datos/presentación. |
| `docs/scenarios/SCN-001_mountain-village-arrival.md` | Referenciar el alcance del mapa local y aclarar que seis personas es solo el inicio del primer escenario. |
| Índices, `docs/OPEN-QUESTIONS.md`, `docs/STATUS.md`, `README.md`, `CHANGELOG.md` y `prompts/INDEX.md` | Actualizaciones descritas en los apartados 9 y 10. |

No crees un documento GDD general adicional. No renombres ningún archivo,
dominio o ID preexistente.

## 4. Especificación funcional cerrada

### 4.1 Punto de partida y estructura del mundo

La primera versión empieza en un pueblo de montaña con seis supervivientes que
han escapado juntos de su pueblo original. Llegan cansados, con pocas
pertenencias, y deciden establecerse en un edificio existente que parece
defendible. El edificio puede ser una casa grande, una pequeña nave, una
granja o un local equivalente según la semilla de partida; no es una
construcción vacía creada por el jugador.

El mapa local es un espacio 3D de gestión con edificios existentes, terreno,
caminos, recursos naturales, puntos de agua y zonas peligrosas. Su distribución
varía entre partidas de forma coherente: puede haber más bosque, viviendas,
campo, un arroyo, un lago, talleres u otros elementos. El primer escenario
mantiene el tema de pueblo de montaña; otros biomas, tamaños de grupo y tipos de
inicio son extensiones futuras.

La comunidad puede admitir personas, rechazarles, perder miembros, sufrir una
separación o abandonar el lugar desde el principio. Seis no es un límite de
población, una estructura familiar fija ni una promesa de que todos sobreviven.

Las presiones iniciales son asegurar un edificio, reunir y organizar recursos,
descansar, obtener agua, conseguir alimento, cerrar accesos, explorar y crear
defensas básicas. No existe un orden obligatorio ni un calendario narrativo del
primer año.

El mundo exterior y el mapa estratégico hexagonal siguen siendo una dirección
aprobada, pero no son parte de la primera versión visual. La documentación debe
preservar la conexión futura sin fingir que ya existe transición entre escalas.

### 4.2 Bucle jugable local

El bucle jugable local queda definido así:

1. El jugador observa el asentamiento, personas, necesidades, avisos y mapa.
2. Ajusta prioridades por persona y designa acciones sobre objetivos o zonas.
3. Los trabajos se generan a partir de esas designaciones y de necesidades
   existentes, como transportar agua al almacén o descansar.
4. Las personas eligen trabajos factibles dentro de sus prioridades y reglas,
   los realizan, interrumpen o terminan.
5. El jugador interviene con el ratón cuando quiere dirigir una acción concreta.
6. La exploración, el trabajo, las relaciones y las amenazas cambian el estado
   real del mundo y la información conocida.
7. El asentamiento obtiene nuevas opciones, riesgos y decisiones.

No hay una interfaz de órdenes escritas en lenguaje natural. No hay un
planificador que obligue al jugador a configurar cada viaje con hora de regreso,
ruta, riesgo y método. Las normas reutilizables y las zonas hacen ese papel de
forma sencilla.

### 4.3 Prioridades, trabajos y designaciones

Cada superviviente tiene una tabla individual de diez familias de trabajo con
cinco valores: `0` desactivado, `1` bajo, `2` normal, `3` alto y
`4` crítico. El jugador puede modificarla desde la ficha o un panel de
trabajo. Las familias iniciales son:

1. Necesidades personales y cuidado.
2. Transporte y almacenamiento.
3. Construcción y reparación.
4. Búsqueda y recuperación en edificios.
5. Exploración y reconocimiento.
6. Obtención de agua.
7. Obtención de alimento.
8. Preparación, conservación y remiendo.
9. Atención sanitaria.
10. Guardia y defensa.

Estas familias sirven para priorizar, filtrar y presentar tareas. No otorgan
competencias. Una persona puede tener prioridad alta en alimento y no ser
capaz de pescar, cazar o identificar hongos; buscará un trabajo elegible dentro
de esa familia o quedará sin una tarea de esa familia.

Una designación se crea seleccionando con ratón un objetivo o una zona y
eligiendo una acción contextual. Ejemplos: inspeccionar una casa, buscar en un
armario, recoger objetos, transportar al almacén, tapiar una ventana, reparar
un cierre, pescar en un tramo de agua, recolectar hongos, cortar un árbol,
construir un muro o vigilar un acceso.

Cada trabajo generado contiene: acción, objetivo, ubicación, familia de
prioridad, requisitos, recursos reservados, estado, progreso, resultado y
motivo de bloqueo. Un trabajo se ejecuta solo si hay una persona elegible.

Una persona es elegible cuando cumple todos los requisitos obligatorios de la
acción: permiso de zona, acceso físico, herramienta si es imprescindible,
capacidad mínima cuando exista, estado físico suficiente y materiales
reservados. Una prioridad alta no permite ignorar requisitos ni atravesar una
barrera física.

Cuando varias tareas son elegibles, la selección ocurre en este orden:

1. Acciones directas activas del jugador.
2. Supervivencia inmediata: huir de peligro inmediato, recibir atención
   urgente, beber, comer o descansar si el estado ya impide trabajar.
3. Trabajos de prioridad `4`, luego `3`, `2` y `1`.
4. Dentro de la misma prioridad: urgencia del trabajo, proximidad, tiempo en
   espera y adecuación de la persona a la acción.
5. Si siguen empatados, elección estable basada en el ID de la persona y del
   trabajo; no una tirada repetida cada fotograma.

El sistema debe informar de forma operativa por qué una persona está inactiva,
ha abandonado un trabajo o no puede tomarlo: por ejemplo «sin martillo»,
«zona prohibida», «cansada», «no reconoce hongos seguros» o «otro
superviviente reservó el depósito». No puede esconder un error de rutas bajo
una explicación de personalidad.

### 4.4 Zonas, normas y barreras

El jugador delimita zonas con el ratón. Cada zona tiene uno de estos estados:

- **Habitual**: permite trabajar y circular de forma ordinaria.
- **Precaución**: permite entrar solo a trabajos con riesgo aceptado o cuando
  no exista una alternativa habitual equivalente.
- **Prohibida**: no se generan trabajos ordinarios ni se autoriza el tránsito
  autónomo hacia ella.

Una zona delimitada no se explora, inspecciona, limpia ni asegura por el mero
hecho de pintarla. Solo define dónde pueden plantearse trabajos. Descubrir
información, reclamar un lugar, poner vigilancia y construir una defensa son
procesos distintos.

Las zonas expresan una norma social. Una puerta cerrada, una valla, un muro, un
desnivel imposible o un edificio bloqueado son barreras físicas. La autonomía
puede transgredir una norma; no atraviesa una barrera física sin realizar la
acción necesaria.

Las normas reutilizables iniciales son globales y no requieren formularios por
expedición:

- La zona prohibida se evita.
- La zona de precaución se considera menos deseable que una alternativa
  habitual.
- El uso de armas de fuego incrementa ruido y se reserva para defensa o acción
  directa del jugador.
- Las personas regresan a una zona habitual para descansar cuando pueden
  hacerlo sin peligro inmediato.

No documentar reglas de regreso por horario, rutas preferidas, porcentajes de
riesgo o planes de misión. Esas opciones solo podrán añadirse más adelante si
una prueba real demuestra que hacen falta.

### 4.5 Control individual con ratón

El jugador puede seleccionar una persona y tomar control puntual. El control
puntual usa la misma cámara estratégica inclinada que la gestión general y
solo ratón:

1. Selecciona a la persona.
2. Hace clic en un destino, objeto, persona o elemento del entorno.
3. Elige una acción contextual disponible.
4. La persona realiza esa acción hasta completarla, cancelarla, quedar
   bloqueada o verse interrumpida por una necesidad o amenaza crítica.

Puede usarse para desplazarse a un punto, observar, inspeccionar, abrir,
recoger, transportar, reparar, ayudar, curar, pescar, recoger, ocultarse,
atacar, retirarse o realizar otras acciones que el objetivo permita. No se
limita al combate.

No existe primera persona, movimiento WASD, puntería manual, disparo manual ni
un avatar de acción. Tomar control no elimina tiempo, cansancio, miedo,
heridas, herramientas, conocimientos, riesgo ni requisitos. Tampoco congela al
resto de la comunidad: los demás continúan simulándose con sus prioridades.

Al concluir la acción, la persona vuelve a seleccionar trabajo con las reglas
de prioridades. El progreso completado, objetos consumidos y cambios del mundo
se conservan una sola vez; cancelar no duplica recursos ni resetea efectos ya
ocurridos.

### 4.6 Autonomía, motivos y evolución

Una persona no es un robot de prioridades. Fuera del control directo, puede
aceptar un trabajo, dejarlo, pedir ayuda, elegir una alternativa, atender una
necesidad personal o iniciar una acción propia.

La autonomía se evalúa en momentos de decisión, nunca como una tirada continua:
al quedar libre, al descubrir una oportunidad, al detectar peligro, al cambiar
su estado crítico, al recibir una orden incompatible con un valor importante o
al activarse un recuerdo/relación relevante.

Las posibles salidas son: seguir el trabajo, escoger otro trabajo permitido,
pedir ayuda, posponer, retirarse, iniciar una acción personal o transgredir una
norma social. La transgresión exige una causa concreta registrada, como hambre,
protección de una persona, promesa, curiosidad, conflicto, confianza excesiva,
miedo o interpretación errónea del peligro. No se activa por una probabilidad
genérica de «locura».

Ejemplo no normativo: un cazador puede seguir un ciervo hacia zona prohibida
porque cree que alimentar al grupo compensa el riesgo. Puede tener éxito,
perderse, regresar herido o morir. Otra persona puede negarse a acompañarlo.
La misma situación no exige el mismo resultado en todas las partidas.

La interfaz no muestra todos los valores internos. Sí muestra:

- Estado operativo visible: cansancio, heridas, hambre, miedo percibido y
  acción actual.
- Razón relevante cuando afecta a la gestión: «ha dejado la búsqueda para
  ayudar a Lara», «rechaza entrar por miedo», «ha cruzado el límite siguiendo
  un rastro».
- Evidencia acumulada sobre rasgos y aptitudes, expresada con incertidumbre.
- Consecuencias y recuerdos después de acciones relevantes.

La iniciativa también debe producir resultados positivos: ayudar, detectar un
peligro, descubrir un atajo, proponer un uso para un objeto o cuidar a alguien.
Si la autonomía solo genera castigos, el jugador querrá desactivarla y se
rompe el pilar de personas vivas.

Valentía, prudencia, miedo, confianza, experiencia y lealtad son conceptos
distintos. Una persona valiente puede retirarse con criterio; una persona
temerosa puede actuar por alguien importante. Experiencias, aprendizaje y
relaciones modifican comportamientos con el tiempo; hay progresos y
retrocesos, no un interruptor permanente «cobarde/valiente».

### 4.7 Modelo de persona, habilidad y conocimiento

Cada persona tiene estas capas, con responsabilidades separadas:

| Capa | Qué determina |
|---|---|
| Historia previa | Profesión, experiencias, relaciones y conocimientos con los que llega. No es una clase cerrada. |
| Características generales | Capacidades físicas y cognitivas que influyen en actividades, sin sustituir las habilidades. |
| Habilidades específicas | Capacidad práctica en una disciplina concreta. |
| Técnicas y conocimientos | Lo que sabe reconocer, interpretar o ejecutar. |
| Aptitudes de aprendizaje | Ritmo, mesetas y dificultades personales para habilidades concretas. |
| Estado actual | Cansancio, hambre, sed, salud, lesión, miedo, estrés y condiciones relevantes. |
| Motivaciones y valores | Lo que desea, protege, rechaza o considera aceptable. |
| Relaciones y memoria | Vínculos y experiencias que afectan a decisiones futuras. |

Una profesión inicial da historia, algunas habilidades y conocimientos de
partida, pero no bloquea el aprendizaje posterior. Un informático puede
aprender pesca y una persona pescadora puede aprender tecnología; tendrán
tiempos, apoyos y dificultades distintas.

La primera versión visual utiliza este conjunto exacto y limitado de
habilidades específicas para demostrar el modelo:

1. Observación e inspección.
2. Búsqueda y recuperación.
3. Pesca.
4. Identificación y recolección de hongos.
5. Rastreo y caza.
6. Cocina.
7. Conservación de alimentos.
8. Remiendo y costura.
9. Construcción y carpintería.
10. Fontanería y conducción de agua.
11. Primeros auxilios.

No existe en la primera versión una habilidad genérica de «supervivencia» que
otorgue resultados en pesca, setas, caza, costura o medicina. Las familias de
prioridad no alteran esta regla.

La transferencia es parcial y explícita. Ejemplos: construcción y carpintería
pueden ayudar a aprender una conducción de agua; remiendo ayuda a aprender
otras técnicas de costura. Pesca no ayuda a identificar hongos, y cocinar no
otorga rastreo. No crear una matriz completa de transferencias en esta entrega:
registrar que cada técnica futura declarará sus prerrequisitos y transferencias
de forma explícita.

Aprender requiere práctica útil, enseñanza, observación o consulta de
conocimiento comunitario. Una persona que enseña necesita conocimiento
pertinente y tiempo para transmitirlo. Herramientas, instalaciones, descanso y
materiales pueden limitar la práctica.

Los principiantes pueden ser útiles. Una acción puede producir un resultado
lento, de menor calidad, con desperdicio o menos duradero sin que sea
automáticamente imposible. Las tareas peligrosas o que requieren una técnica
concreta pueden exigir un mínimo y explicar por qué no se pueden intentar.

La calidad puede afectar tiempo, desperdicio, durabilidad, comodidad,
aislamiento, seguridad o rendimiento según la actividad. El remiendo es el
ejemplo de referencia: primero tapa un roto de manera lenta y frágil; después
produce un parche resistente; más tarde puede adaptar prendas. No asumir que
todas las personas alcanzarán la excelencia en todo.

Las aptitudes personales no se exponen como una lista de números absolutos al
iniciar la partida. La comunidad descubre indicios por trabajo, convivencia y
enseñanza. Tres resultados malos no revelan un límite definitivo. La ficha
muestra lo que se sabe operativamente y el grado de confianza de esa
información.

El conocimiento comunitario existe en personas, manuales, notas, planos,
biblioteca, talleres y otras formas futuras de conservación. Conocer un plano
no instala por sí solo el sistema que describe. La muerte o marcha de alguien
puede hacer perder capacidad si esa persona no ha enseñado o documentado lo
que sabía.

### 4.8 Explorar, observar, inspeccionar y reconocer

Todo lugar tiene un estado real y persistente, independiente de quién lo
visita. La información conocida no es ese estado real: es evidencia ligada a
la comunidad y, cuando importa, a la persona que la obtuvo.

Para cada lugar u objeto relevante, la información pasa por estos estados:

1. **No conocido**: no existe información operativa.
2. **Avistado**: se conoce su presencia o una característica exterior.
3. **Observado**: se obtienen indicios visibles, sonidos, rastros o riesgos
   desde una posición segura.
4. **Inspeccionado**: alguien accede o estudia suficientemente el objetivo y
   descubre detalles internos o técnicos.
5. **Aprovechado o transformado**: se han extraído recursos, reparado,
   conectado, asegurado o alterado elementos; cada cambio queda en el estado
   real.

Los estados no siempre se recorren de forma lineal. Una ventana permite
observar un interior; forzar una puerta permite inspeccionar; una herramienta
o técnica puede abrir una vía diferente. La interfaz solo ofrece acciones que
tengan sentido para el objetivo, el acceso y el conocimiento actual.

Las familias de acciones reutilizables son:

- Obtener indicios: observar, escuchar, rastrear.
- Comprender: inspeccionar, diagnosticar, analizar.
- Comprobar: probar, medir, tomar una muestra.
- Acceder: abrir, despejar, forzar, trepar.
- Recuperar: recoger, desmontar, copiar, trasladar.
- Transformar: reparar, adaptar, reforzar, conectar.

Son verbos de diseño, no un conjunto de botones que deba aparecer en todos los
objetos. Los edificios, recursos y elementos de contenido declararán cuáles
pueden aplicar.

Una habilidad o conocimiento puede permitir reconocer una oportunidad que
siempre estaba allí: una bomba reparable, una especie segura, una tubería
aprovechable o una señal de ocupación reciente. No modifica el contenido del
lugar ni reabastece un armario ya saqueado.

«No queda nada» significa que los recursos extraíbles conocidos se agotaron.
«No reconocemos nada más útil» significa que puede existir algo sin descubrir.
Volver con un especialista puede cambiar la segunda situación, nunca crear de
nuevo comida, materiales o herramientas ya consumidos.

Los lugares pueden contener pistas coherentes sobre su pasado: cierres
improvisados, huellas, daños, notas, herramientas abandonadas o señales de
actividad. Esas pistas pueden cambiar riesgos y decisiones; no son decoración
sin consecuencia.

### 4.9 Recursos, almacenamiento, condiciones y soluciones

Todo recurso relevante tiene como mínimo: tipo, cantidad, ubicación,
condición, accesibilidad, propietario si aplica y estado de reserva. Los
estados visibles de logística son disponible, reservado, en transporte,
almacenado, perdido o consumido.

Una reserva impide que varios trabajos usen el mismo objeto exclusivo al mismo
tiempo. Si una persona abandona o falla un trabajo, la reserva se libera o se
transforma según el resultado real. No duplicar objetos, no consumir recursos
que no se pueden alcanzar y no fabricar desde inventarios abstractos.

La primera versión rastrea de forma concreta:

- Agua.
- Alimento fresco.
- Alimento conservado.
- Madera y tablones.
- Tela y prendas.
- Herramientas básicas.
- Materiales de reparación.
- Medicinas básicas.
- Munición inicial, si existe en esa semilla.

Agua y alimentos se transportan al almacén o a una instalación pertinente;
no se convierten automáticamente en una cifra global al ser descubiertos. La
comida fresca se deteriora; la conservación, el entorno y el almacenamiento
pueden modificar su condición. Los valores y curvas exactos quedan abiertos,
pero la condición no puede ser puramente cosmética.

Cada necesidad admite rutas alternativas. No existe una cadena universal ni
una barra tecnológica que desbloquee edificios automáticamente. Para la
primera prueba:

- El agua se puede resolver por **acarreo desde un punto de agua** o por
  **conducción por gravedad desde un punto elevado**.
- El alimento se puede obtener mediante búsqueda, pesca, recolección de
  hongos o caza cuando la geografía y las personas lo permitan.
- El descanso comienza acondicionando el edificio existente.
- La defensa empieza cerrando accesos, tapiando y construyendo barreras
  simples con recursos disponibles.

La conducción por gravedad requiere reconocer una fuente adecuada, acceso,
materiales, construcción/carpintería y fontanería; no necesita implementar
electricidad. El acarreo requiere recipientes, trayectos seguros y trabajo
repetido. Ambas son viables, tienen consecuencias distintas y ninguna está
garantizada en cada semilla.

A largo plazo, combustible, piezas, electricidad y medicamentos pueden
degradarse; esto empuja a soluciones locales, pero no obliga a todas las
partidas a seguir una secuencia de eras idéntica. Vehículos, animales,
electricidad y producción industrial avanzada quedan fuera de la primera
versión.

### 4.10 Zombis, ruido, defensa y riesgo

El zombi estándar inicial se inspira en George Romero: lento, físico,
peligroso por número, persistencia y cercanía. No corre de forma normal ni
requiere habilidades especiales.

La amenaza zombi tiene cuatro fuentes documentadas: presencia local,
movimiento, ruido y contacto. El ruido puede atraer o despertar actividad
zombi dentro de un alcance y una intensidad que la futura implementación
concretará. Disparar, romper elementos, construir y otras acciones pueden
generar ruido; la causa debe ser visible o explicable.

El cuerpo a cuerpo evita parte del ruido, pero exige cercanía y conlleva riesgo
alto de herida, mordedura o quedar rodeado. Las armas de fuego aumentan
distancia y potencia, pero consumen munición y pueden atraer amenazas. Sigilo,
retirada, barreras, vigilancia y evitar un lugar son alternativas válidas.
Ninguna ruta militar es obligatoria ni vuelve seguro al asentamiento para
siempre.

La primera versión incluye amenaza local elemental, ruido, retirada y una
defensa básica. No incluye un director de hordas completo, tipos de zombi
especiales, epidemias avanzadas, asedios masivos ni equilibrio final.

El modelo futuro de zombis será configurable antes de iniciar una partida. La
lista exacta de configuraciones, infección, sentidos, abundancia y dificultad
queda abierta; no crear esos parámetros ahora.

### 4.11 Tiempo

Un día completo dura 20 minutos a velocidad ×1. El juego tiene pausa y
velocidades ×1, ×2, ×4 y ×10.

Las reglas se calculan por tiempo simulado. Acelerar el juego no multiplica
tiradas, recursos, aprendizaje ni riesgos por el número de fotogramas. Las
acciones en curso conservan progreso coherente al cambiar de velocidad o
pausar.

La duración de estaciones, el número de días por estación, el año completo y
las fórmulas de cultivos quedan abiertos. La primera versión no implementa
cultivo estacional; el calendario debe dejar espacio para añadirlo después.

### 4.12 Generación procedural bajo demanda y guardado

Se adopta una sola política: **generación bajo demanda reproducible y
persistencia estable**.

Generar bajo demanda significa que no se calculan ni se cargan todos los
interiores, contenedores y detalles del mapa al iniciar la partida. Un detalle
se materializa cuando una interacción causal lo necesita: por ejemplo
inspeccionar, acceder, simular una visita de otra comunidad o activar una
amenaza relacionada.

Cada lugar y contenedor posee un ID estable. Su contenido base se deriva de:

- Semilla de la partida.
- ID estable del lugar o contenedor.
- Versión del generador.
- Contexto persistente ya consolidado que afecte a ese lugar.

No depende de quién lo abre, del orden de visitas, de la velocidad de juego,
de fotogramas ni de otras tiradas aleatorias no relacionadas. Se pueden generar
cosas al descubrirlas sin tener que precargarlas.

Si se guarda antes de abrir una casa, se carga esa misma partida y se vuelve a
abrir bajo las mismas condiciones, el contenido base será el mismo. No existe
un modo alternativo que vuelva a sortear lo desconocido al cargar: añade
complejidad, dificulta depurar y no aporta el ahorro de memoria buscado.

La estabilidad no congela el mundo. Saqueos, consumo, destrucción, deterioro,
movimiento de personajes, acción de otra comunidad y paso del tiempo pueden
cambiar el estado que se encuentra. Esos cambios deben tener una causa
persistida.

Separar conceptualmente:

- **Generación**: crea detalle base cuando hace falta.
- **Simulación**: cambia el estado por causas del mundo.
- **Representación cargada**: modelos, navegación y elementos visuales
  activos cerca de la cámara o actividad relevante.
- **Guardado**: conserva semilla, versión, cambios persistentes y estado
  simulado necesario.

Descargar visualmente una zona de la memoria no puede borrar recursos
saqueados, construcciones, inventarios, destrucción, trabajos, relaciones,
recuerdos o información descubierta. El formato de archivo, la base de datos y
la estrategia exacta de migración quedan abiertos; no introducir SQLite todavía.

El guardado futuro debe conservar como mínimo reloj, personas, relaciones y
recuerdos relevantes, inventarios, recursos, trabajos, reservas, progreso,
estado de lugares, semilla, versión de generación y estado aleatorio que no se
derive por ID. No prometer rendimiento sin medir: la materialización debe
evitar pausas perceptibles al implementarse.

## 5. Alcance cerrado de la primera versión visual

Documenta exactamente el siguiente alcance en `RDM-001`. Es el primer corte
jugable, no el juego completo.

### Incluye

- Godot 4 con GDScript, 3D sencillo y cámara estratégica inclinada.
- Un único mapa local de pueblo de montaña, con variación procedural
  controlada entre partidas.
- Seis supervivientes iniciales; posibilidad funcional de que una persona
  llegue, se marche o muera, sin construir todavía un sistema completo de
  comunidades externas.
- Un edificio inicial existente que se puede inspeccionar, usar como almacén,
  acondicionar para descanso y cerrar parcialmente.
- Los once conocimientos/habilidades iniciales definidos en 4.7.
- Prioridades individuales de cinco niveles y los diez grupos de trabajo de
  4.3.
- Designaciones con ratón, trabajos, estados, reservas y motivos de bloqueo.
- Zonas habitual, de precaución y prohibida.
- Control puntual con ratón de una persona para acciones de trabajo,
  exploración y defensa.
- Observar, inspeccionar, acceder, buscar, recoger y transportar en una
  selección limitada de edificios y objetos.
- Agua por acarreo y conducción por gravedad.
- Alimento por búsqueda, pesca, hongos y caza cuando proceda.
- Recursos localizados, almacén, condición de alimento fresco y conservación
  elemental.
- Barricadas simples, tapiado, muros básicos, zombis lentos, ruido, retirada y
  combate elemental.
- Autonomía acotada con razones registradas y al menos una iniciativa positiva
  y una posible transgresión de zona.
- Aprendizaje observable en remiendo y una habilidad de obtención de alimento.
- Guardado y carga local estables con generación bajo demanda reproducible.
- Pausa y velocidades acordadas.

### No incluye

- Mapa estratégico jugable, hexágonos explorables o transición de escala.
- Vehículos, animales, electricidad, cultivos estacionales, industria,
  investigación extensa, comercio o rutas regionales.
- Política interna completa, elecciones, facciones formales, clanes completos
  o diplomacia exterior.
- Catálogos grandes de edificios, recetas, recursos, habilidades o biomas.
- Multijugador, cuentas, servicios online, PostgreSQL, Docker o IA generativa.
- Primeras personas, WASD, disparo manual, acción tipo Project Zomboid.
- Director narrativo completo, hordas masivas, tipos especiales de zombi,
  epidemias complejas o equilibrio final.
- Fórmulas definitivas de aprendizaje, deterioro, daño, ruido, estaciones,
  población o economía.

### Entregas de implementación posteriores

El roadmap debe fijar estas cinco entregas, en este orden, sin fechas:

1. **Vertical slice visual**: proyecto Godot, cámara, selección, mapa local
   mínimo, seis personas visibles y reloj/velocidades.
2. **Trabajo y personas**: prioridades, designaciones, trabajos, movimiento,
   reservas, estado básico, ficha y control puntual con ratón.
3. **Exploración y subsistencia**: estado de información, edificios,
   recursos, transporte, almacén, descanso, agua y alimento alternativo.
4. **Defensa y vida propia**: cierre de accesos, zombis elementales, ruido,
   guardia, retirada, aprendizaje e iniciativa autónoma acotada.
5. **Persistencia y prueba integrada**: generación reproducible, guardado,
   carga y los casos manuales de aceptación.

Cada entrega debe indicar qué puede probar Dennis al terminar y qué queda
deliberadamente fuera. No redactar un prompt de programación en esta entrega.

## 6. Preguntas abiertas que deben conservarse

Mantén explícitamente abiertas y enlazadas desde `docs/OPEN-QUESTIONS.md`:

- Valores y fórmulas de características, habilidades, aptitudes, progreso y
  calidad.
- Técnicas exactas, prerrequisitos y transferencia entre habilidades.
- Duración de estaciones, año y fórmulas de agricultura.
- Alcance, intensidad y fórmulas de ruido, combate, infección y amenazas.
- Catálogos de recursos, edificios, recetas, herramientas y soluciones.
- Tamaño, escala, revelado y transición del mapa estratégico.
- Formación de facciones, comunidades externas, política, comercio y narrativa
  de gran escala.
- Formato de guardado, compatibilidad entre versiones, representación de datos
  y estructura final de carpetas de Godot.
- Configuración concreta de amenazas al iniciar partida.

Elimina de preguntas abiertas solo lo que este prompt cierre: control con
ratón, no primera persona, prioridades como base de interacción, tres estados
de zona, día de 20 minutos, cinco velocidades incluidas pausa, zombi estándar
lento, generación bajo demanda reproducible y no resorteo al cargar.

## 7. Antecedentes que deben registrarse sin convertirlos en reglas

En `DISC-0002`, crea una tabla corta: referente, mecanismo estudiado,
posible aprendizaje para Z-World y límite. Usa únicamente estas referencias:

- Majesty: voluntad propia e influencia indirecta.
- Against the Storm: soluciones productivas alternativas.
- Burning Wheel: pasado, valores y aspiraciones que impulsan decisiones.
- La llamada de Cthulhu: habilidades concretas y aprendizaje mediante uso.
- Blades in the Dark: procesos, peligros y facciones que avanzan.
- Dead of Winter: situaciones condicionadas y aspiraciones particulares.
- Disco Elysium: experiencias que transforman el personaje.
- Shadows of Doubt: rastros, rutinas y mundo procedural persistente.
- Kenshi: percepción de intención y contexto.
- Football Manager: profundidad de ficha y descubrimiento gradual de personas.

No copies reglas, textos ni fórmulas de esos juegos. No presentes estas
referencias como pruebas de implementación ni como requisitos de licencia.

## 8. Decisiones e índices

En `DEC-0004`, registra que el control puntual usa ratón y cámara
estratégica, sirve para cualquier acción contextual, conserva límites del
personaje y no convierte el juego en primera persona ni control obligatorio.

En `DEC-0005`, registra que los detalles se generan bajo demanda a partir de
semilla, ID, versión y contexto persistente; son reproducibles al cargar una
misma partida; los cambios causales persisten; no habrá resorteo opcional de
contenido desconocido en esta fase.

Actualiza `docs/INDEX.md` solo para que dirija a los nuevos documentos por
dominio. Actualiza todos los índices de dominio afectados.

Crea `CHANGELOG.md` si no existe. Registra `DESIGN-001` como documentación
de diseño aprobada, sin atribuir código o funcionalidad implementada.

Actualiza `README.md` para que permita retomar el proyecto en pocas líneas:
qué es Z-World, fase actual, punto de entrada documental y próximo trabajo de
implementación indicado por `RDM-001`.

Actualiza `docs/STATUS.md` con estos hechos exactos:

- `DESIGN-001` está completado documentalmente.
- La primera versión visual está definida como alcance de roadmap, no creada.
- La tecnología aprobada sigue siendo Godot 4 y GDScript.
- No existe implementación de juego, escenas, prototipos ni pruebas
  ejecutables.

Guarda este prompt como
`prompts/DESIGN-001_first-playable-design.md` y actualiza
`prompts/INDEX.md`. No cambies su contenido sustantivo ni crees otra copia.

## 9. Validación documental acotada

No instales dependencias, no ejecutes Godot ni escribas tests de código.

1. Ejecuta `git diff --check`.
2. Comprueba que todos los archivos de la tabla del apartado 3 existen, tienen
   cabecera YAML, ID correcto, estado `approved` y están indexados.
3. Comprueba que no existen duplicados de IDs ni enlaces relativos rotos en los
   documentos creados o modificados.
4. Busca en la documentación afectada contradicciones con estas frases:
   «seis personas fijas», «primera persona», «WASD», «resorteo al cargar»,
   «habilidad supervivencia universal», «formulario por expedición» o
   «implementado».
5. Comprueba que las cuestiones del apartado 6 siguen abiertas y que ninguna
   se presenta como código existente.
6. Revisa que el alcance de `RDM-001` contiene todo lo incluido y nada de lo
   excluido.

No hagas una batería de validaciones adicional para cambios exclusivamente
documentales.

## 10. Informe final

Devuelve un informe breve en español con:

1. Archivos creados y actualizados, agrupados por dominio.
2. Decisiones funcionales cerradas.
3. Preguntas que siguen abiertas.
4. Resultado de las validaciones documentales.
5. Qué primera entrega de implementación debe ejecutarse después y qué podrá
   probar Dennis.
6. Confirmación explícita de que sigue sin existir código o juego ejecutable.

No pegues el contenido completo de todos los documentos y no continúes por tu
cuenta con la implementación de Godot.
