---
id: UI-003
title: Taxonomía de trabajo y prioridades
status: approved
canonical_for:
  - arquitectura conceptual de necesidad, orden, zona, política, evento, trabajo y prioridad
  - nueve bloques y 34 prioridades del horizonte completo
  - escala de prioridad Nunca/1-5
  - selección, urgencia y autonomía entre trabajos
  - funcionamiento de Emergencias como prioridad real
  - matriz plegable de gestión a escala
depends_on:
  - UI-001
related:
  - UI-002
  - UI-004
  - CHR-001
  - CHR-003
  - WLD-004
  - SET-006
  - UI-006
  - ARC-007
  - DEC-0007
---

## 1. Propósito

Fijar la arquitectura conceptual completa de trabajo y prioridad del horizonte
máximo de Z-World: los nueve bloques desplegables y las 34 prioridades
aprobadas, su escala visible, sus tres orígenes de trabajo y las reglas de
selección, urgencia y autonomía que deciden qué hace cada persona. Este
documento no implementa las 34 prioridades ni sustituye las diez familias y la
escala `0–4` de la implementación actual (ver
[UI-001](UI-001_interaction-and-command-model.md), sección 3.2).

## 2. Principios que no deben romperse

- Prioridad, orden, zona, política, evento y trabajo son capas distintas que
  no deben colapsarse ni confundirse entre sí.
- Una prioridad alta nunca crea trabajo, no concede una habilidad, no revela
  una tecnología, no atraviesa una barrera y no sustituye herramientas.
- Cada trabajo tiene una sola familia de prioridad efectiva, aunque pueda
  llevar varias etiquetas de disciplina, habilidad, riesgo, conocimiento o
  emergencia.
- La lista de 34 prioridades de la sección 3.3 es exacta y final: no se
  renombra, fusiona, divide, añade ni elimina ninguna prioridad en esta
  entrega ni en revisiones futuras sin evidencia de juego que lo justifique.
- Los IDs de la sección 3.3 son contratos candidatos estables (ver
  [DEC-0003](../decisions/DEC-0003_data-driven-design.md)): se conservan
  salvo colisión técnica demostrada, que debe señalarse, nunca resolverse en
  silencio.

## 3. Modelo funcional

### 3.1 Cadena conceptual

El horizonte completo encadena estas capas sin colapsarlas:

> **Necesidad o intención → orden, zona, política o evento → trabajo
> concreto → prioridad de trabajo → elegibilidad → habilidad y conocimiento →
> herramienta, material e infraestructura → ejecución → resultado,
> experiencia e información nueva.**

| Capa | Responsabilidad |
|---|---|
| Necesidad o intención | El problema o propósito: alimentarse, asegurar un acceso, responder a fuego, recuperar una bomba. |
| Orden | Instrucción concreta del jugador sobre objetivo o área. |
| Zona | Regla espacial persistente que permite generar trabajos cuando corresponde. |
| Política | Regla persistente no necesariamente espacial, como mantener una reserva. |
| Evento o estado | Cambio del mundo que genera trabajos sin una orden manual, como incendio, herida o avería. |
| Trabajo | Unidad ejecutable con acción, objetivo, ubicación, familia, urgencia, requisitos, reservas, estado, progreso y resultado. |
| Prioridad | Disposición relativa de una persona a atender esa familia de trabajos. No concede capacidad. |
| Habilidad | Competencia práctica general o específica que afecta ejecución. |
| Conocimiento | Lo que la persona o comunidad reconoce, comprende y sabe aplicar (ver [SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md) y [CHR-002](../30-characters/CHR-002_knowledge-and-learning.md)). |
| Aptitud | Ritmo, techo, constancia o facilidad personal, parcialmente oculta. |
| Medios | Herramientas, materiales, energía, instalación, acceso, tiempo y ayuda. |
| Autonomía | Posibilidad causal de aceptar, posponer, abandonar, pedir ayuda o transgredir una norma según [CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md). |

Una persona sin trabajos válidos en su máxima prioridad continúa evaluando
las siguientes. La presentación cualitativa de capacidad, dificultad e
incertidumbre que combina prioridad con capacidad real se define en
[UI-004](UI-004_qualitative-capability-presentation.md), sin repetirse aquí.

### 3.2 Escala de prioridad aprobada

| Valor visible | Significado |
|---|---|
| `Nunca` | La persona no acepta autónomamente trabajos de esa prioridad. El control puntual tampoco la fuerza en silencio: el jugador debe cambiar expresamente el valor. No impide huir o protegerse a sí misma. |
| `1` | Máxima prioridad. Busca primero cualquier trabajo válido de esta familia. |
| `2` | Prioridad alta. |
| `3` | Prioridad normal. |
| `4` | Prioridad baja. |
| `5` | Prioridad residual. Solo la realizará cuando no exista trabajo válido más prioritario. |

Los números son visibles porque representan una regla elegida por el
jugador, no un atributo secreto del personaje. No se usa `0` como etiqueta
final: el estado visible es `Nunca`.

La implementación actual `0–4`, con `4` como máxima prioridad, permanece
registrada como sistema **provisional del primer corte** (ver
[UI-001](UI-001_interaction-and-command-model.md), sección 3.2). Esta
entrega no migra datos, interfaz ni código y no decide todavía cómo se
convertirán partidas antiguas a la escala `Nunca/1–5`.

### 3.3 Nueve bloques y 34 prioridades

Los bloques organizan la interfaz; no son habilidades y no sustituyen las
prioridades hijas. La lista es exacta y `approved`.

| Nº | Bloque | ID de bloque | Prioridades incluidas |
|---:|---|---|---|
| 1 | Respuesta vital y cuidados | `vital_response_care` | 1–5 |
| 2 | Seguridad y convivencia | `security_coexistence` | 6–9 |
| 3 | Abastecimiento básico | `basic_supply` | 10–13 |
| 4 | Exploración y recuperación | `exploration_recovery` | 14–16 |
| 5 | Materias primas | `raw_materials` | 17–18 |
| 6 | Producción alimentaria | `food_production` | 19–21 |
| 7 | Construcción e infraestructura | `construction_infrastructure` | 22–24 |
| 8 | Oficios y logística | `trades_logistics` | 25–30 |
| 9 | Conocimiento | `knowledge` | 31–34 |

#### Bloque 1 — Respuesta vital y cuidados (`vital_response_care`)

| Nº | Prioridad | ID |
|---:|---|---|
| 1 | Emergencias | `emergency_response` |
| 2 | Medicina | `medicine` |
| 3 | Rescate | `rescue` |
| 4 | Recuperación y cuidados | `recovery_care` |
| 5 | Higiene y saneamiento | `hygiene_sanitation` |

#### Bloque 2 — Seguridad y convivencia (`security_coexistence`)

| Nº | Prioridad | ID |
|---:|---|---|
| 6 | Vigilancia y patrulla | `watch_patrol` |
| 7 | Combate y limpieza de amenazas | `combat_threat_clearance` |
| 8 | Prisioneros | `prisoner_management` |
| 9 | Comunidad y diplomacia | `community_diplomacy` |

#### Bloque 3 — Abastecimiento básico (`basic_supply`)

| Nº | Prioridad | ID |
|---:|---|---|
| 10 | Agua | `water_supply` |
| 11 | Recolección | `foraging` |
| 12 | Caza | `hunting` |
| 13 | Pesca | `fishing` |

#### Bloque 4 — Exploración y recuperación (`exploration_recovery`)

| Nº | Prioridad | ID |
|---:|---|---|
| 14 | Saqueo y recuperación | `scavenge_recovery` |
| 15 | Exploración y expediciones | `exploration_expeditions` |
| 16 | Desmontaje y reciclaje | `dismantling_recycling` |

#### Bloque 5 — Materias primas (`raw_materials`)

| Nº | Prioridad | ID |
|---:|---|---|
| 17 | Tala | `logging` |
| 18 | Extracción | `extraction` |

#### Bloque 6 — Producción alimentaria (`food_production`)

| Nº | Prioridad | ID |
|---:|---|---|
| 19 | Agricultura | `agriculture` |
| 20 | Ganadería | `animal_husbandry` |
| 21 | Cocina y conservación | `cooking_preservation` |

#### Bloque 7 — Construcción e infraestructura (`construction_infrastructure`)

| Nº | Prioridad | ID |
|---:|---|---|
| 22 | Construcción y fortificación | `construction_fortification` |
| 23 | Reparación | `repair` |
| 24 | Mantenimiento | `maintenance` |

#### Bloque 8 — Oficios y logística (`trades_logistics`)

| Nº | Prioridad | ID |
|---:|---|---|
| 25 | Carpintería | `carpentry` |
| 26 | Metalurgia | `metalworking` |
| 27 | Mecánica | `mechanics` |
| 28 | Electricidad y electrónica | `electrical_electronics` |
| 29 | Textil | `textiles` |
| 30 | Logística | `logistics` |

#### Bloque 9 — Conocimiento (`knowledge`)

| Nº | Prioridad | ID |
|---:|---|---|
| 31 | Catalogar conocimiento | `knowledge_cataloguing` |
| 32 | Estudiar e interpretar | `study_interpretation` |
| 33 | Experimentar, aplicar y cacharrear | `experimentation_tinkering` |
| 34 | Enseñar y transmitir | `teaching_transmission` |

#### Decisiones que forman esta lista

Registro de consolidación para que futuras revisiones no lo reabran sin
evidencia de juego:

- Guardia y Patrulla se fusionan en Vigilancia y patrulla: cambia la orden
  concreta, no la disposición general.
- Agricultura, Cosecha y Semillas se fusionan en Agricultura; la urgencia de
  cosechar pertenece al trabajo y al cultivo.
- Cocina y Conservación se fusionan como prioridad, aunque exijan
  habilidades y conocimientos distintos.
- Construcción y Fortificación se fusionan; fortificar es una finalidad de
  construcción.
- Higiene/saneamiento y Limpieza/orden se fusionan; organización de almacén
  se traslada a Logística.
- Fabricación general se elimina porque los objetos deben pertenecer a un
  oficio o familia material real.
- Reparación y Mantenimiento permanecen separadas: una restaura algo roto y
  la otra evita el fallo de algo funcional.
- Emergencias se mantiene como prioridad porque permite movilización masiva
  y configurable ante desastres en la zona habitada.
- Caza se separa finalmente de Combate y limpieza de amenazas por
  intención, disposición moral, sigilo y habilidades diferentes.
- Pesca, Agua, Prisioneros, oficios y las cuatro prioridades de Conocimiento
  permanecen separadas para permitir asignación significativa.

### 3.4 Responsabilidad y límites de cada prioridad

#### Respuesta vital y cuidados

**Emergencias.** Solo atiende trabajos nacidos de un **desastre activo** que
afecta una zona habitada, reclamada u operativa, o a personas y activos que
una política haya declarado protegidos: contención de incendios,
inundaciones, fugas, derrumbes, brechas, evacuaciones, cierre urgente de
válvulas, retirada de material peligroso y apoyo general a la respuesta. No
genera tareas cotidianas y no sustituye la huida personal. Ver su
funcionamiento especial completo en la sección 3.6.

**Medicina.** Diagnóstico, primeros auxilios, tratamiento, cirugía futura,
administración de medicación y atención sanitaria activa. No incluye
trasladar a alguien desde una zona peligrosa ni el apoyo cotidiano de una
convalecencia.

**Rescate.** Localizar, liberar, estabilizar para traslado y sacar personas
o animales de un peligro, derrumbe, incendio, aislamiento o zona hostil.
Puede exigir fuerza, seguridad, navegación o primeros auxilios, pero la
acción principal es poner a salvo, no completar el tratamiento.

**Recuperación y cuidados.** Atención no urgente de personas heridas,
enfermas, exhaustas, discapacitadas o en recuperación: acompañar, alimentar,
asear, ayudar a desplazarse, cambiar vendajes simples autorizados, preparar
descanso y sostener rehabilitación. Una necesidad personal automática no se
convierte por sí sola en trabajo de cuidado para otra persona.

**Higiene y saneamiento.** Limpieza de espacios, sangre y suciedad; gestión
de basura, cadáveres, letrinas, aguas residuales, desinfección, lavandería y
prevención de focos insalubres. Ordenar inventario o mover mercancía
pertenece a Logística.

#### Seguridad y convivencia

**Vigilancia y patrulla.** Guardia fija, patrulla, observación del
perímetro, control de accesos, alerta temprana y vigilancia nocturna o de
instalaciones. Puesto y recorrido son órdenes distintas dentro de una misma
prioridad.

**Combate y limpieza de amenazas.** Defender, atacar, contener o eliminar
zombis, humanos hostiles y animales peligrosos cuando el propósito sea
neutralizar una amenaza. Incluye limpiar una zona y escolta armada cuando
exista peligro real. No incluye cazar para obtener alimento.

**Prisioneros.** Ingreso, custodia, recuento, escolta bajo custodia,
registro, supervisión, entrega de raciones bajo régimen y cumplimiento de
políticas penitenciarias. El tratamiento médico sigue siendo Medicina y una
negociación diplomática extraordinaria pertenece a Comunidad y diplomacia.

**Comunidad y diplomacia.** Acogida, mediación, negociación, reuniones,
representación, comercio social, resolución de conflictos, comunicación
colectiva y tareas derivadas de cargos o políticas. No concede liderazgo,
carisma ni habilidad diplomática.

#### Abastecimiento básico

**Agua.** Localizar, recoger, transportar en el circuito específico,
filtrar, hervir, potabilizar, operar distribución y controlar reservas de
agua. Construir una infraestructura nueva pertenece a Construcción;
arreglarla, a Reparación; su revisión preventiva, a Mantenimiento.

**Recolección.** Obtener recursos silvestres o dispersos sin cultivar ni
perseguir animales: frutos, hongos, plantas, hierbas, fibras, huevos
abandonados, piedra suelta y otros elementos declarados recolectables.
Reconocer que algo es seguro o útil depende de habilidades y conocimiento.

**Caza.** Rastrear, acechar, abatir, recuperar y realizar el tratamiento de
campo mínimo de animales buscados por alimento o materiales. Se separa de
Combate porque la motivación, la disposición moral, el sigilo y las
habilidades son diferentes. Si un animal se elimina porque amenaza a la
comunidad, el trabajo pertenece a Combate y limpieza de amenazas.

**Pesca.** Preparar y usar caña, red, trampa u otro método conocido;
capturar y retirar peces o recursos acuáticos. Fabricar el equipo pertenece
al oficio adecuado y procesar el alimento pertenece a Cocina y
conservación.

#### Exploración y recuperación

**Saqueo y recuperación.** Registrar lugares ya accesibles, reconocer
bienes, recoger objetos portátiles e intactos y recuperar componentes sin
desmantelar una instalación completa. La calidad de reconocimiento depende
de la persona según
[WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md).

**Exploración y expediciones.** Reconocer terreno desconocido, obtener
indicios, cartografiar, abrir información local y, en el futuro, participar
en expediciones del mapa estratégico. No convierte el mapa mundial en parte
del primer corte ni define ahora su planificador completo.

**Desmontaje y reciclaje.** Desarmar deliberadamente un objeto, máquina o
parte de una estructura para obtener componentes o materiales, normalmente
sacrificando o alterando el original. Clasificar residuos aprovechables y
transformar chatarra para su reutilización también pertenece aquí. Mover lo
obtenido es Logística.

#### Materias primas

**Tala.** Seleccionar, cortar, derribar, desramar y preparar árboles o
madera bruta para su transporte. Fabricar tablones o piezas acabadas puede
requerir Carpintería.

**Extracción.** Excavar, minar, cantear, extraer arcilla, arena, piedra,
mineral u otros recursos del terreno. Recoger piedras superficiales simples
puede ser Recolección; explotar un frente o depósito es Extracción.

#### Producción alimentaria

**Agricultura.** Preparar suelo, sembrar, plantar, regar, fertilizar,
quitar malas hierbas, tratar plagas, cosechar, seleccionar, secar y guardar
semillas y preparar la siguiente campaña. La urgencia de una cosecha se
expresa en el trabajo, no en otra fila de prioridad.

**Ganadería.** Alimentar, alojar, criar, manejar, ordeñar, esquilar, domar,
atender de forma básica, reproducir y sacrificar animales domésticos cuando
corresponda. La medicina veterinaria especializada puede exigir
conocimiento adicional sin crear otra prioridad por defecto.

**Cocina y conservación.** Preparar ingredientes, cocinar, despiezar,
secar, salar, ahumar, fermentar, envasar y preparar reservas. Compartir
prioridad no implica compartir habilidad: saber cocinar un guiso no concede
conservación segura.

#### Construcción e infraestructura

**Construcción y fortificación.** Levantar, montar o adaptar edificios,
muros, cubiertas, caminos, mobiliario estructural, barricadas, vallas,
torres, puertas reforzadas, obstáculos y posiciones defensivas. Los planos,
materiales, habilidades y conocimientos siguen siendo específicos.

**Reparación.** Diagnosticar en la medida necesaria y devolver a
funcionamiento algo ya roto o dañado: máquina, vehículo, tejado, cierre,
bomba, ventana o herramienta. No se fusiona conceptualmente con
Mantenimiento.

**Mantenimiento.** Atender algo que todavía funciona para reducir
degradación y evitar averías: limpiar filtros, lubricar, cambiar aceite,
revisar baterías, tensar correas, limpiar paneles, calibrar y sustituir
consumibles. Mantener lo heredado del mundo anterior es una parte central de
la economía.

#### Oficios y logística

**Carpintería.** Transformar madera y fabricar o adaptar piezas, muebles,
recipientes, componentes y productos propios del oficio. Una construcción
de madera sigue usando Construcción como prioridad y carpintería como
habilidad o disciplina.

**Metalurgia.** Fundir, forjar, soldar, mecanizar y fabricar o adaptar
piezas y herramientas metálicas. Reparar un objeto metálico roto continúa
siendo Reparación.

**Mecánica.** Fabricar, montar, adaptar o modificar mecanismos, motores,
transmisiones, vehículos y sistemas mecánicos. Diagnosticar y restaurar un
mecanismo roto puede requerir habilidad mecánica, pero pertenece a
Reparación.

**Electricidad y electrónica.** Montar, instalar, adaptar o fabricar
cableado, cuadros, circuitos, radios, sensores, ordenadores y sistemas
eléctricos o electrónicos. Restaurar un equipo averiado pertenece a
Reparación; revisarlo preventivamente, a Mantenimiento.

**Textil.** Hilar, tejer, cortar, coser, remendar, fabricar prendas,
mantas, mochilas, correas, protecciones y otros productos textiles o de
cuero cuando proceda.

**Logística.** Recoger para transporte, cargar, acarrear, descargar,
distribuir, almacenar, ordenar inventarios, reabastecer puntos y gestionar
flujos internos. No decide qué recurso debe producirse ni sustituye la
prioridad de su obtención.

No existe una prioridad adicional de **Fabricación general**. Todo trabajo
de fabricación debe pertenecer al oficio o familia material que realmente
lo describe. Si un producto combina disciplinas, declara requisitos y
ayudas secundarias, pero conserva una única familia efectiva.

#### Conocimiento

**Catalogar conocimiento.** Identificar, clasificar, describir, etiquetar,
conservar y relacionar fuentes recuperadas. Convierte «cosas encontradas» en
información localizable sin implicar comprensión profunda.

**Estudiar e interpretar.** Leer, observar material audiovisual, consultar,
traducir, interpretar planos, analizar documentación y comprender archivos
accesibles. La dificultad depende de conocimientos previos, idioma, estado,
complejidad y medios.

**Experimentar, aplicar y cacharrear.** Probar hipótesis, desmontar para
aprender, comparar piezas, montar prototipos, diagnosticar mediante ensayo,
adaptar sistemas y aprender por prueba y error. Puede producir capacidad,
información parcial, fallos y pérdidas.

**Enseñar y transmitir.** Dar formación, tutorizar práctica, supervisar
aprendices, documentar técnicas con intención pedagógica y repartir saber
para reducir dependencia de una única persona.

### 3.5 Tres orígenes de trabajo

Un trabajo conserva su origen para poder explicar por qué existe.

**Orden o designación del jugador.** El jugador selecciona objetivo o pinta
un área y elige una acción concreta: talar, desmontar, construir, registrar,
reparar, fortificar, atacar o retirar, entre otras. La orden crea uno o más
trabajos definidos; no asigna de forma permanente una persona salvo control
puntual.

**Zona, puesto o política persistente.** La regla crea y retira trabajos
conforme cambia el mundo: parcela agrícola; área de tala, recolección, caza
o pesca; almacén y puntos de reabastecimiento; puesto de vigilancia y
recorrido de patrulla; área habitual, de precaución o prohibida; mantener
una cantidad de agua o recurso; mantenimiento periódico de una instalación.
Pintar una zona no explora, limpia, asegura ni cosecha por sí mismo: solo
declara dónde y bajo qué condiciones pueden nacer trabajos.

**Evento, necesidad o cambio del mundo.** El mundo genera trabajo al existir
una causa: incendio, fuga, inundación, derrumbe o brecha; persona herida o
atrapada; hambre, sed, cansancio o necesidad de cuidados; instalación
averiada o mantenimiento vencido; cadáver, suciedad o foco insalubre;
combustible o consumible agotado; herramienta rota; aparición de amenaza. No
se requiere que el jugador marque cada llama, herida o filtro: la acción
solo aparece si existen objetivo, acceso y dependencias suficientes, y puede
quedar bloqueada con causa visible.

### 3.6 Emergencias como prioridad real

Un desastre puede generar además acciones que requieren Medicina, Rescate,
Combate o Reparación. Esos trabajos conservan sus requisitos técnicos. Para
la selección durante el desastre reciben una etiqueta de respuesta y usan
la prioridad **Emergencias** como preferencia efectiva; sus etiquetas de
disciplina determinan quién puede tratar, rescatar, combatir o reparar. Así
se evita que una persona sin conocimientos médicos cure por tener
Emergencias en `1`.

La cantidad de personas movilizadas depende de trabajos y plazas reales de
respuesta, no de enviar toda la comunidad al mismo objetivo. `Nunca`
significa que esa persona no se ofrece para respuesta comunitaria, aunque
sigue huyendo de un peligro inmediato.

Un desastre no salta automáticamente un valor elegido por el jugador. La
movilización masiva ocurre porque varias personas tienen Emergencias en `1`
o `2` y aparecen suficientes trabajos válidos. Si una persona la tiene en
`5`, continuará antes con familias configuradas en valores superiores salvo
autoprotección inmediata. Dentro del mismo valor, la urgencia del desastre
adelanta el trabajo de emergencia.

### 3.7 Selección, urgencia y autonomía

Conserva el orden conceptual de [UI-001](UI-001_interaction-and-command-model.md),
adaptado al horizonte:

1. Control puntual activo del jugador, sin saltarse prohibiciones físicas.
2. Autoprotección y supervivencia inmediata.
3. Todos los trabajos válidos por prioridad `1`, `2`, `3`, `4` y `5`,
   incluida la familia Emergencias cuando existe un desastre.
4. Dentro del mismo valor: urgencia del trabajo, política de zona, ruta y
   distancia, espera acumulada, adecuación, herramientas disponibles y un
   desempate estable.
5. Autonomía causal según
   [CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md):
   aceptar, pedir ayuda, posponer, abandonar, escoger alternativa o
   transgredir una norma.

La urgencia pertenece al trabajo, no crea una prioridad adicional. Una
cosecha a punto de perderse, una herida que empeora o una reparación que
amenaza la reserva de agua pueden adelantarse a otro trabajo de la misma
familia.

`Nunca` excluye la asignación autónoma de esa familia. Una orden puntual no
lo anula silenciosamente; la interfaz explica la negativa y permite que el
jugador cambie la prioridad. Valores, recuerdos, miedo, lesiones y
relaciones pueden causar además una negativa o transgresión conforme a
`CHR-003`.

La autonomía se evalúa en momentos de decisión, no mediante tiradas
constantes por fotograma. La interfaz debe separar una decisión personal de
un error de ruta o una dependencia material ausente.

### 3.8 Matriz de prioridades y bloques desplegables

La interfaz de horizonte completo usa una matriz de personas y prioridades:

- Vista plegada: nueve bloques, con resumen por persona.
- Vista desplegada: las prioridades hijas del bloque, hasta las 34.
- Un bloque con valores distintos muestra estado «Mixto», no inventa una
  media que cambie el comportamiento.
- Cambiar un bloque completo aplica un mismo valor a todas sus prioridades
  hijas mediante una acción explícita; no borra después los ajustes
  individuales salvo nueva acción del jugador.
- Las filas pueden plegarse, filtrarse y buscarse sin alterar la
  simulación.
- Con población grande se permiten filtros por equipo, rol, turno, zona o
  selección y plantillas reutilizables; una plantilla propone valores, pero
  cada persona conserva sus ajustes.
- El panel debe permitir comparar personas sin obligar a abrir 34 fichas.
- No se oculta una prioridad porque todavía no exista una persona capaz.
  Puede resultar importante al planificar formación o incorporar
  especialistas.

El panel puede presentar las 34 prioridades sin simplificar el sistema. La
complejidad se gestiona con jerarquía, plegado, filtros, plantillas y
explicación causal, no eliminando categorías aprobadas. La gestión concreta
a escala mediante bloques plegables, filtros, edición por grupo y
plantillas se amplía en
[UI-002](UI-002_management-at-community-scale.md).

## 4. Reglas aprobadas

- Cada trabajo tiene una sola familia de prioridad efectiva.
- La escala visible es exactamente `Nunca`, `1`, `2`, `3`, `4` y `5`, con
  `1` como máxima prioridad; no se usa `0` como etiqueta final.
- Las 34 prioridades y sus IDs de la sección 3.3 son exactas y finales para
  el horizonte aprobado; no autorizan implementación inmediata (ver
  [DEC-0007](../decisions/DEC-0007_layered-work-and-priorities.md)).
- Emergencias es una prioridad real exclusiva de respuesta a desastres; no
  sustituye a Medicina, Rescate, Combate y limpieza de amenazas ni
  Reparación en la actividad normal.
- Caza y Combate y limpieza de amenazas son prioridades separadas por
  intención, no por especie objetivo.

## 5. Interacciones con otros sistemas

- La base de interacción, selección y control puntual con ratón sigue
  siendo [UI-001](UI-001_interaction-and-command-model.md); este documento
  no reescribe sus reglas cerradas por `DESIGN-001`.
- La gestión a escala mediante bloques plegables, filtros, edición por
  grupo y plantillas se desarrolla en
  [UI-002](UI-002_management-at-community-scale.md).
- La presentación cualitativa de capacidad, dificultad e incertidumbre por
  celda se define en
  [UI-004](UI-004_qualitative-capability-presentation.md).
- La elegibilidad depende de las capas de personaje de
  [CHR-001](../30-characters/CHR-001_character-model.md) y de la autonomía
  de [CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md).
- El reconocimiento y recuperación dependientes de la persona que alimentan
  Saqueo y recuperación se rigen por
  [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md).
- El conocimiento que habilita Conocimiento y otras prioridades se rige por
  [SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md).
- La decisión transversal que respalda mantener 34 prioridades separadas de
  habilidades y del alcance implementado es
  [DEC-0007](../decisions/DEC-0007_layered-work-and-priorities.md).
- La interacción contextual con un lugar y la composición del equipo
  operativo local que ejecuta una orden se definen en
  [UI-006](UI-006_contextual-place-interaction-and-teams.md). Su selector
  `Auto / 1 / 2 / 3 / 4` expresa **cuántas personas** participan en una orden
  local y **no** es la escala de prioridad `Nunca/1–5` de la sección 3.2. La
  movilización ante un desastre sigue rigiéndose por Emergencias (sección
  3.6), sin límite de cuatro personas.
- Agricultura (19), Construcción y fortificación (22), Reparación (23) y
  Logística (30) son las familias ya existentes que ubican el ciclo
  agrícola, la barrera lineal, la reparación de accesos/objetos y el
  transporte local del primer catálogo implementable; `DESIGN-008` no
  crea prioridades nuevas como «Transporte por carretilla» o «Puertas»
  (ver [SET-011](../40-settlement/SET-011_initial-agriculture-loop.md),
  [WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md),
  [WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md) y
  [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md)).

## 6. Casos límite o riesgos

- Un trabajo que combina disciplinas (por ejemplo reparar un sistema
  eléctrico) debe declarar una única familia efectiva y requisitos
  secundarios separados, nunca quedar ambiguamente asignado a dos filas del
  panel.
- Un desastre que genera muchas acciones de disciplina distinta puede
  saturar Emergencias si no se limita a plazas y trabajos reales de
  respuesta; la sección 3.6 evita esto explícitamente.

## 7. Preguntas abiertas

- Estrategia de migración técnica desde las diez familias y escala `0–4`
  implementadas hacia el horizonte de 34 prioridades y escala `Nunca/1–5`.
  Ver `docs/OPEN-QUESTIONS.md`.
- Valores iniciales por personaje y plantillas definitivas de prioridad.
- Color, iconografía y disposición visual final de la matriz.

## 8. Ejemplos no normativos

- Reparar una bomba de agua averiada por un fallo mecánico se clasifica en
  Reparación, con Mecánica como habilidad relacionada, no en Agua ni en
  Mecánica como prioridad efectiva.
- Cortar leña para vender a otra comunidad sigue siendo Tala; el destino
  comercial no crea una prioridad de Comunidad y diplomacia.
- Abatir un jabalí que amenaza el huerto se clasifica en Combate y limpieza
  de amenazas; abatir el mismo jabalí por alimento se clasifica en Caza,
  según la intención declarada en la orden o en la causa del evento.
- Durante un incendio, apagar el fuego usa Emergencias como prioridad
  efectiva; tratar a un herido por quemaduras en el mismo incidente usa
  Medicina, aunque ambos trabajos compartan la etiqueta de respuesta al
  desastre.
