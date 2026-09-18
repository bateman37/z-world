# Z-World — DESIGN-003: trabajo, recuperación y conocimiento aplicado

## 1. Autoridad, contexto y naturaleza de la entrega

Esta es una entrega **exclusivamente documental**. Debe formalizar con máximo
detalle tres sistemas conectados que constituyen una parte central de la
identidad futura de Z-World:

1. prioridades, órdenes, zonas, trabajos y respuesta a emergencias;
2. exploración local, saqueo y recuperación dependientes de quién interviene;
3. conocimiento individual y comunitario recuperado del mundo anterior.

La rama principal de partida ya contiene `IMPLEMENTATION-003` fusionada. Su
aceptación manual sigue pendiente y esta entrega no puede declararla superada.
No escribas ni modifiques código, escenas, datos ejecutables o pruebas. No
implementes las 34 prioridades, aprendizaje, mapamundi ni conocimiento: solo
deja su diseño canónico preparado y correctamente indexado.

Las decisiones funcionales contenidas en este prompt proceden del propietario
del proyecto y están cerradas. Claude Code actúa como documentalista: debe
repartirlas entre fuentes canónicas sin reinterpretarlas, simplificarlas ni
rellenar con preferencias propias los aspectos que se mantienen abiertos.

Los estados documentales significan:

- `approved`: regla funcional aprobada para el horizonte del juego; no implica
  que esté implementada ni incluida completa en el primer corte.
- `draft`: catálogo, fórmula o espacio todavía susceptible de cambiar.
- `implemented`: no debe asignarse a ningún documento nuevo ni existente en
  esta entrega.

Esta entrega desarrolla el horizonte máximo sin ampliar
`RDM-001_first-playable-slice.md`. La implementación actual de diez familias y
escala `0–4` continúa siendo verdad histórica y técnica del primer corte, pero
no es el modelo final aprobado para el juego completo.

## 2. Lecturas obligatorias y límite de contexto

Lee en este orden:

1. `AGENTS.md`, `CLAUDE.md`, `docs/INDEX.md`, `docs/STATUS.md`,
   `docs/OPEN-QUESTIONS.md` y `prompts/README.md`.
2. `docs/00-governance/DOC-001_documentation-system.md`.
3. Los índices `docs/20-world/INDEX.md`, `docs/30-characters/INDEX.md`,
   `docs/40-settlement/INDEX.md`, `docs/80-interface/INDEX.md`,
   `docs/90-architecture/INDEX.md`, `docs/decisions/INDEX.md` y
   `docs/roadmap/INDEX.md`.
4. `UI-001`, `UI-002`, `WLD-001`, `WLD-002`, `WLD-003`, `CHR-001`,
   `CHR-002`, `CHR-003`, `CHR-004`, `CHR-005`, `SET-002`, `SET-003`,
   `SET-004`, `SET-005`, `ARC-001`, `ARC-002`, `ARC-003`, `RDM-001`,
   `RDM-002`, `DEC-0003`, `DEC-0005` y `DEC-0006`.
5. `README.md` y `CHANGELOG.md` únicamente para conservar fielmente el estado
   de implementación y aceptación.
6. El código real de prioridades y trabajos solo si necesitas comprobar un
   nombre o distinguir lo implementado de lo diseñado. No lo modifiques.

Usa `rg` por identificador antes de abrir fuentes adicionales. No releas todos
los prompts históricos, no investigues fuentes externas, no instales
dependencias y no ejecutes Godot. Toda la información normativa necesaria
está en este prompt y en las fuentes citadas.

## 3. Objetivo verificable

Al terminar, una persona o agente debe poder responder desde `docs/`, sin
recuperar esta conversación:

- Qué diferencia una prioridad, una orden, una zona, una política, un trabajo,
  una habilidad, un conocimiento y un requisito material.
- Cuáles son los nueve bloques y las 34 prioridades aprobadas del horizonte
  completo.
- Qué significa `Nunca`, `1`, `2`, `3`, `4` y `5` y cómo se combina la
  prioridad con la capacidad de la persona.
- Por qué una celda puede aparecer gris sin impedir que el jugador configure
  una prioridad futura.
- Cómo se generan trabajos por orden, regla persistente o estado del mundo.
- Cómo funciona Emergencias como prioridad real ante un desastre sin
  reemplazar Medicina, Rescate, Combate o Reparación en la actividad normal.
- Por qué dos supervivientes pueden obtener información diferente del mismo
  taller sin que el contenido base se vuelva a sortear.
- Cuándo una localización está agotada, cuándo queda valor no reconocido y
  cuándo conviene volver con un especialista.
- Cómo el conocimiento existe en personas, soportes físicos y digitales,
  máquinas, lugares y comunidades.
- Qué separa información disponible, comprensión, conocimiento individual,
  conocimiento comunitario y capacidad material real.
- Cómo se aprende mediante práctica, estudio, observación, mentoría,
  enseñanza, desmontaje, reparación, experimentación y cacharreo.
- Cómo la muerte, el abandono, el deterioro de soportes o la falta de hardware
  pueden reducir la capacidad real de la comunidad.
- Cómo se presenta dificultad y aptitud sin mostrar umbrales numéricos de
  habilidad al jugador.
- Qué pertenece al horizonte máximo y qué sigue limitado al primer corte.

## 4. Resultado documental obligatorio

### 4.1 Documentos nuevos

Crea exactamente estos cinco documentos, con cabecera YAML conforme a
`DOC-001`:

| Ruta | ID | Estado | Responsabilidad canónica |
|---|---|---|---|
| `docs/80-interface/UI-003_work-priority-taxonomy.md` | `UI-003` | `approved` | Arquitectura de prioridad, orden y trabajo; nueve bloques, 34 prioridades y escala `Nunca/1–5`. |
| `docs/80-interface/UI-004_qualitative-capability-presentation.md` | `UI-004` | `approved` | Presentación cualitativa de capacidad, dificultad, incertidumbre y bloqueos sin números internos. |
| `docs/20-world/WLD-004_expertise-dependent-recovery.md` | `WLD-004` | `approved` | Inspección, saqueo, reconocimiento experto, revisitas, recuperación y desmontaje con contenido estable. |
| `docs/40-settlement/SET-006_knowledge-assets-and-capability.md` | `SET-006` | `approved` | Fuentes de conocimiento, estados comunitarios, acceso físico/digital y conversión en capacidad real. |
| `docs/decisions/DEC-0007_layered-work-and-priorities.md` | `DEC-0007` | `approved` | Decisión transversal de conservar 34 prioridades jerárquicas separadas de habilidades y del alcance implementado. |

No crees un GDD monolítico ni un documento que duplique las cinco
responsabilidades anteriores.

### 4.2 Documentos existentes que deben actualizarse

Actualiza de forma acotada:

- `UI-001`: mantener como base de interacción y explicar que sus diez familias
  `0–4` son el subconjunto implementado del primer corte; enlazar `UI-003` como
  horizonte aprobado sin reescribir allí las 34 prioridades.
- `UI-002`: añadir la gestión a escala mediante bloques plegables, filtros,
  edición por grupo y plantillas, enlazando `UI-003` y `UI-004`.
- `WLD-002`: conservar sus estados generales y enlazar `WLD-004` para
  reconocimiento dependiente de la persona y revisitas.
- `CHR-001`: reforzar la separación entre prioridad, habilidad, técnica,
  conocimiento, aptitud y medios materiales; enlazar las nuevas fuentes.
- `CHR-002`: desarrollar aprendizaje individual, práctica, estudio, mentoría,
  enseñanza, conocimiento tácito, pérdida y recuperación, sin copiar el
  catálogo físico de `SET-006`.
- `CHR-005`: aclarar que su taxonomía de habilidades sigue `draft` y no es la
  lista aprobada de prioridades de `UI-003`.
- `SET-004`: enlazar `SET-006` y conservar la investigación como recuperación,
  comprensión y aplicación, no árbol tecnológico.
- `SET-005`: hacer que cada solución declare también los fragmentos de
  conocimiento o técnicas requeridos, enlazando `SET-006`.
- `ARC-002`: hacer explícito, sin duplicar `WLD-004`, que la persona cambia lo
  reconocido o recuperado causalmente, nunca el contenido base derivado de la
  semilla.
- `RDM-002`: situar estas capacidades en el horizonte posterior sin fechas.
- `RDM-001`: no ampliar su alcance. Como máximo, añade una nota breve que
  distinga su demostrador de diez familias del horizonte de 34; no cambies las
  entregas 4 y 5.
- `docs/OPEN-QUESTIONS.md`: retirar únicamente las preguntas cerradas por esta
  entrega y formular con precisión las que continúen abiertas.
- Índices de los dominios 20, 30, 40, 80 y decisiones.
- `docs/STATUS.md`, `CHANGELOG.md` y `prompts/INDEX.md`.

Conserva `CHR-005` y `RDM-002` como `draft`. No marques ningún documento como
`implemented`. No alteres el estado pendiente de aceptación manual de
`IMPLEMENTATION-003`.

## 5. Arquitectura conceptual obligatoria

Documenta esta cadena sin colapsar sus capas:

> **Necesidad o intención → orden, zona, política o evento → trabajo concreto
> → prioridad de trabajo → elegibilidad → habilidad y conocimiento →
> herramienta, material e infraestructura → ejecución → resultado, experiencia
> e información nueva.**

Las responsabilidades son:

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
| Conocimiento | Lo que la persona o comunidad reconoce, comprende y sabe aplicar. |
| Aptitud | Ritmo, techo, constancia o facilidad personal, parcialmente oculta. |
| Medios | Herramientas, materiales, energía, instalación, acceso, tiempo y ayuda. |
| Autonomía | Posibilidad causal de aceptar, posponer, abandonar, pedir ayuda o transgredir una norma según `CHR-003`. |

Una prioridad alta nunca crea trabajo, no concede una habilidad, no revela una
tecnología, no atraviesa una barrera y no sustituye herramientas. Una persona
sin trabajos válidos en su máxima prioridad continúa evaluando las siguientes.

Cada trabajo tiene una sola familia de prioridad efectiva. Puede llevar varias
etiquetas de disciplina, habilidad, riesgo, conocimiento o emergencia, pero no
debe quedar ambiguamente asignado a dos filas del panel.

## 6. Escala de prioridad aprobada

El horizonte completo usa exactamente:

| Valor visible | Significado |
|---|---|
| `Nunca` | La persona no acepta autónomamente trabajos de esa prioridad. El control puntual tampoco la fuerza en silencio: el jugador debe cambiar expresamente el valor. No impide huir o protegerse a sí misma. |
| `1` | Máxima prioridad. Busca primero cualquier trabajo válido de esta familia. |
| `2` | Prioridad alta. |
| `3` | Prioridad normal. |
| `4` | Prioridad baja. |
| `5` | Prioridad residual. Solo la realizará cuando no exista trabajo válido más prioritario. |

Los números son visibles porque representan una regla elegida por el jugador,
no un atributo secreto del personaje. No uses `0` como etiqueta final: el
estado visible es `Nunca`.

La implementación actual `0–4`, con `4` como máxima prioridad, permanece
registrada como sistema provisional del primer corte. Esta entrega no migra
datos, interfaz ni código y no decide todavía cómo se convertirán partidas
antiguas.

## 7. Nueve bloques desplegables y 34 prioridades

La lista siguiente es exacta y `approved`. Los bloques organizan la interfaz;
no son habilidades y no sustituyen las prioridades hijas.

| Nº | Bloque | ID sugerido | Prioridades incluidas |
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

### 7.1 Respuesta vital y cuidados

1. **Emergencias** — `emergency_response`.
2. **Medicina** — `medicine`.
3. **Rescate** — `rescue`.
4. **Recuperación y cuidados** — `recovery_care`.
5. **Higiene y saneamiento** — `hygiene_sanitation`.

### 7.2 Seguridad y convivencia

6. **Vigilancia y patrulla** — `watch_patrol`.
7. **Combate y limpieza de amenazas** — `combat_threat_clearance`.
8. **Prisioneros** — `prisoner_management`.
9. **Comunidad y diplomacia** — `community_diplomacy`.

### 7.3 Abastecimiento básico

10. **Agua** — `water_supply`.
11. **Recolección** — `foraging`.
12. **Caza** — `hunting`.
13. **Pesca** — `fishing`.

### 7.4 Exploración y recuperación

14. **Saqueo y recuperación** — `scavenge_recovery`.
15. **Exploración y expediciones** — `exploration_expeditions`.
16. **Desmontaje y reciclaje** — `dismantling_recycling`.

### 7.5 Materias primas

17. **Tala** — `logging`.
18. **Extracción** — `extraction`.

### 7.6 Producción alimentaria

19. **Agricultura** — `agriculture`.
20. **Ganadería** — `animal_husbandry`.
21. **Cocina y conservación** — `cooking_preservation`.

### 7.7 Construcción e infraestructura

22. **Construcción y fortificación** — `construction_fortification`.
23. **Reparación** — `repair`.
24. **Mantenimiento** — `maintenance`.

### 7.8 Oficios y logística

25. **Carpintería** — `carpentry`.
26. **Metalurgia** — `metalworking`.
27. **Mecánica** — `mechanics`.
28. **Electricidad y electrónica** — `electrical_electronics`.
29. **Textil** — `textiles`.
30. **Logística** — `logistics`.

### 7.9 Conocimiento

31. **Catalogar conocimiento** — `knowledge_cataloguing`.
32. **Estudiar e interpretar** — `study_interpretation`.
33. **Experimentar, aplicar y cacharrear** — `experimentation_tinkering`.
34. **Enseñar y transmitir** — `teaching_transmission`.

### 7.10 Decisiones que forman esta lista

Registra el historial de consolidación para que futuras revisiones no vuelvan
a abrirlo sin evidencia de juego:

- Guardia y Patrulla se fusionan en Vigilancia y patrulla: cambia la orden
  concreta, no la disposición general.
- Agricultura, Cosecha y Semillas se fusionan en Agricultura; la urgencia de
  cosechar pertenece al trabajo y al cultivo.
- Cocina y Conservación se fusionan como prioridad, aunque exijan habilidades
  y conocimientos distintos.
- Construcción y Fortificación se fusionan; fortificar es una finalidad de
  construcción.
- Higiene/saneamiento y Limpieza/orden se fusionan; organización de almacén se
  traslada a Logística.
- Fabricación general se elimina porque los objetos deben pertenecer a un
  oficio o familia material real.
- Reparación y Mantenimiento permanecen separadas: una restaura algo roto y la
  otra evita el fallo de algo funcional.
- Emergencias se mantiene como prioridad porque permite movilización masiva y
  configurable ante desastres en la zona habitada.
- Caza se separa finalmente de Combate y limpieza de amenazas por intención,
  disposición moral, sigilo y habilidades diferentes.
- Pesca, Agua, Prisioneros, oficios y las cuatro prioridades de Conocimiento
  permanecen separadas para permitir asignación significativa.

No renombres, fusiones, dividas, añadas ni elimines prioridades. Los IDs son
contratos candidatos estables: consérvalos salvo colisión técnica demostrada,
que deberá señalarse en vez de resolverse en silencio.

## 8. Responsabilidad exacta de cada prioridad

`UI-003` debe definir límites operativos suficientes para que un trabajo no se
clasifique arbitrariamente.

### 8.1 Respuesta vital y cuidados

#### Emergencias

Solo atiende trabajos nacidos de un **desastre activo** que afecta una zona
habitada, reclamada u operativa, o a personas y activos que una política haya
declarado protegidos. Incluye contención de incendios, inundaciones, fugas,
derrumbes, brechas, evacuaciones, cierre urgente de válvulas, retirada de
material peligroso y apoyo general a la respuesta.

No genera tareas cotidianas y no sustituye la huida personal. Su finalidad es
permitir que el jugador configure a muchas personas con Emergencias en `1` o
`2` para que abandonen trabajos menos prioritarios y se movilicen ante un
desastre, cada una solo hacia acciones para las que sea elegible.

Un desastre puede generar además acciones que requieren Medicina, Rescate,
Combate o Reparación. Esos trabajos conservan sus requisitos técnicos. Para
la selección durante el desastre reciben una etiqueta de respuesta y usan la
prioridad **Emergencias** como preferencia efectiva; sus etiquetas de
disciplina determinan quién puede tratar, rescatar, combatir o reparar. Así se
evita que una persona sin conocimientos médicos cure por tener Emergencias en
`1`.

La cantidad de personas movilizadas depende de trabajos y plazas reales de
respuesta, no de enviar toda la comunidad al mismo objetivo. `Nunca` significa
que esa persona no se ofrece para respuesta comunitaria, aunque sigue huyendo
de un peligro inmediato.

#### Medicina

Diagnóstico, primeros auxilios, tratamiento, cirugía futura, administración
de medicación y atención sanitaria activa. No incluye trasladar a alguien
desde una zona peligrosa ni el apoyo cotidiano de una convalecencia.

#### Rescate

Localizar, liberar, estabilizar para traslado y sacar personas o animales de
un peligro, derrumbe, incendio, aislamiento o zona hostil. Puede exigir fuerza,
seguridad, navegación o primeros auxilios, pero la acción principal es poner a
salvo, no completar el tratamiento.

#### Recuperación y cuidados

Atención no urgente de personas heridas, enfermas, exhaustas, discapacitadas o
en recuperación: acompañar, alimentar, asear, ayudar a desplazarse, cambiar
vendajes simples autorizados, preparar descanso y sostener rehabilitación.
Una necesidad personal automática no se convierte por sí sola en trabajo de
cuidado para otra persona.

#### Higiene y saneamiento

Limpieza de espacios, sangre y suciedad; gestión de basura, cadáveres, letrinas,
aguas residuales, desinfección, lavandería y prevención de focos insalubres.
Ordenar inventario o mover mercancía pertenece a Logística.

### 8.2 Seguridad y convivencia

#### Vigilancia y patrulla

Guardia fija, patrulla, observación del perímetro, control de accesos, alerta
temprana y vigilancia nocturna o de instalaciones. Puesto y recorrido son
órdenes distintas dentro de una misma prioridad.

#### Combate y limpieza de amenazas

Defender, atacar, contener o eliminar zombis, humanos hostiles y animales
peligrosos cuando el propósito sea neutralizar una amenaza. Incluye limpiar
una zona y escolta armada cuando exista peligro real. No incluye cazar para
obtener alimento.

#### Prisioneros

Ingreso, custodia, recuento, escolta bajo custodia, registro, supervisión,
entrega de raciones bajo régimen y cumplimiento de políticas penitenciarias.
El tratamiento médico sigue siendo Medicina y una negociación diplomática
extraordinaria pertenece a Comunidad y diplomacia.

#### Comunidad y diplomacia

Acogida, mediación, negociación, reuniones, representación, comercio social,
resolución de conflictos, comunicación colectiva y tareas derivadas de cargos
o políticas. No concede liderazgo, carisma ni habilidad diplomática.

### 8.3 Abastecimiento básico

#### Agua

Localizar, recoger, transportar en el circuito específico, filtrar, hervir,
potabilizar, operar distribución y controlar reservas de agua. Construir una
infraestructura nueva pertenece a Construcción; arreglarla, a Reparación; su
revisión preventiva, a Mantenimiento.

#### Recolección

Obtener recursos silvestres o dispersos sin cultivar ni perseguir animales:
frutos, hongos, plantas, hierbas, fibras, huevos abandonados, piedra suelta y
otros elementos declarados recolectables. Reconocer que algo es seguro o útil
depende de habilidades y conocimiento.

#### Caza

Rastrear, acechar, abatir, recuperar y realizar el tratamiento de campo mínimo
de animales buscados por alimento o materiales. Se separa de Combate porque la
motivación, la disposición moral, el sigilo y las habilidades son diferentes.
Si un animal se elimina porque amenaza a la comunidad, el trabajo pertenece a
Combate y limpieza de amenazas.

#### Pesca

Preparar y usar caña, red, trampa u otro método conocido; capturar y retirar
peces o recursos acuáticos. Fabricar el equipo pertenece al oficio adecuado y
procesar el alimento pertenece a Cocina y conservación.

### 8.4 Exploración y recuperación

#### Saqueo y recuperación

Registrar lugares ya accesibles, reconocer bienes, recoger objetos portátiles
e intactos y recuperar componentes sin desmantelar una instalación completa.
La calidad de reconocimiento depende de la persona según `WLD-004`.

#### Exploración y expediciones

Reconocer terreno desconocido, obtener indicios, cartografiar, abrir
información local y, en el futuro, participar en expediciones del mapa
estratégico. No convierte el mapa mundial en parte del primer corte ni define
ahora su planificador completo.

#### Desmontaje y reciclaje

Desarmar deliberadamente un objeto, máquina o parte de una estructura para
obtener componentes o materiales, normalmente sacrificando o alterando el
original. Clasificar residuos aprovechables y transformar chatarra para su
reutilización también pertenece aquí. Mover lo obtenido es Logística.

### 8.5 Materias primas

#### Tala

Seleccionar, cortar, derribar, desramar y preparar árboles o madera bruta para
su transporte. Fabricar tablones o piezas acabadas puede requerir Carpintería.

#### Extracción

Excavar, minar, cantear, extraer arcilla, arena, piedra, mineral u otros
recursos del terreno. Recoger piedras superficiales simples puede ser
Recolección; explotar un frente o depósito es Extracción.

### 8.6 Producción alimentaria

#### Agricultura

Preparar suelo, sembrar, plantar, regar, fertilizar, quitar malas hierbas,
tratar plagas, cosechar, seleccionar, secar y guardar semillas y preparar la
siguiente campaña. La urgencia de una cosecha se expresa en el trabajo, no en
otra fila de prioridad.

#### Ganadería

Alimentar, alojar, criar, manejar, ordeñar, esquilar, domar, atender de forma
básica, reproducir y sacrificar animales domésticos cuando corresponda. La
medicina veterinaria especializada puede exigir conocimiento adicional sin
crear otra prioridad por defecto.

#### Cocina y conservación

Preparar ingredientes, cocinar, despiezar, secar, salar, ahumar, fermentar,
envasar y preparar reservas. Compartir prioridad no implica compartir
habilidad: saber cocinar un guiso no concede conservación segura.

### 8.7 Construcción e infraestructura

#### Construcción y fortificación

Levantar, montar o adaptar edificios, muros, cubiertas, caminos, mobiliario
estructural, barricadas, vallas, torres, puertas reforzadas, obstáculos y
posiciones defensivas. Los planos, materiales, habilidades y conocimientos
siguen siendo específicos.

#### Reparación

Diagnosticar en la medida necesaria y devolver a funcionamiento algo ya roto
o dañado: máquina, vehículo, tejado, cierre, bomba, ventana o herramienta. No
se fusiona conceptualmente con Mantenimiento.

#### Mantenimiento

Atender algo que todavía funciona para reducir degradación y evitar averías:
limpiar filtros, lubricar, cambiar aceite, revisar baterías, tensar correas,
limpiar paneles, calibrar y sustituir consumibles. Mantener lo heredado del
mundo anterior es una parte central de la economía.

### 8.8 Oficios y logística

#### Carpintería

Transformar madera y fabricar o adaptar piezas, muebles, recipientes,
componentes y productos propios del oficio. Una construcción de madera sigue
usando Construcción como prioridad y carpintería como habilidad o disciplina.

#### Metalurgia

Fundir, forjar, soldar, mecanizar y fabricar o adaptar piezas y herramientas
metálicas. Reparar un objeto metálico roto continúa siendo Reparación.

#### Mecánica

Fabricar, montar, adaptar o modificar mecanismos, motores, transmisiones,
vehículos y sistemas mecánicos. Diagnosticar y restaurar un mecanismo roto
puede requerir habilidad mecánica, pero pertenece a Reparación.

#### Electricidad y electrónica

Montar, instalar, adaptar o fabricar cableado, cuadros, circuitos, radios,
sensores, ordenadores y sistemas eléctricos o electrónicos. Restaurar un
equipo averiado pertenece a Reparación; revisarlo preventivamente, a
Mantenimiento.

#### Textil

Hilar, tejer, cortar, coser, remendar, fabricar prendas, mantas, mochilas,
correas, protecciones y otros productos textiles o de cuero cuando proceda.

#### Logística

Recoger para transporte, cargar, acarrear, descargar, distribuir, almacenar,
ordenar inventarios, reabastecer puntos y gestionar flujos internos. No decide
qué recurso debe producirse ni sustituye la prioridad de su obtención.

No existe una prioridad adicional de **Fabricación general**. Todo trabajo de
fabricación debe pertenecer al oficio o familia material que realmente lo
describe. Si un producto combina disciplinas, declara requisitos y ayudas
secundarias, pero conserva una única familia efectiva. No añadas una categoría
comodín para evitar diseñar esa responsabilidad.

### 8.9 Conocimiento

#### Catalogar conocimiento

Identificar, clasificar, describir, etiquetar, conservar y relacionar fuentes
recuperadas. Convierte «cosas encontradas» en información localizable sin
implicar comprensión profunda.

#### Estudiar e interpretar

Leer, observar material audiovisual, consultar, traducir, interpretar planos,
analizar documentación y comprender archivos accesibles. La dificultad
depende de conocimientos previos, idioma, estado, complejidad y medios.

#### Experimentar, aplicar y cacharrear

Probar hipótesis, desmontar para aprender, comparar piezas, montar prototipos,
diagnosticar mediante ensayo, adaptar sistemas y aprender por prueba y error.
Puede producir capacidad, información parcial, fallos y pérdidas.

#### Enseñar y transmitir

Dar formación, tutorizar práctica, supervisar aprendices, documentar técnicas
con intención pedagógica y repartir saber para reducir dependencia de una
única persona.

## 9. Matriz de prioridades y bloques desplegables

La interfaz de horizonte completo usa una matriz de personas y prioridades:

- Vista plegada: nueve bloques, con resumen por persona.
- Vista desplegada: las prioridades hijas del bloque, hasta las 34.
- Un bloque con valores distintos muestra estado «Mixto», no inventa una
  media que cambie el comportamiento.
- Cambiar un bloque completo aplica un mismo valor a todas sus prioridades
  hijas mediante una acción explícita; no borra después los ajustes
  individuales salvo nueva acción del jugador.
- Las filas pueden plegarse, filtrarse y buscarse sin alterar la simulación.
- Con población grande se permiten filtros por equipo, rol, turno, zona o
  selección y plantillas reutilizables; una plantilla propone valores, pero
  cada persona conserva sus ajustes.
- El panel debe permitir comparar personas sin obligar a abrir 34 fichas.
- No ocultes una prioridad porque todavía no exista una persona capaz. Puede
  resultar importante al planificar formación o incorporar especialistas.

El panel puede presentar las 34 prioridades sin simplificar el sistema. La
complejidad se gestiona con jerarquía, plegado, filtros, plantillas y
explicación causal, no eliminando categorías aprobadas.

### 9.1 Menú inferior de acciones y órdenes

La tabla de prioridades no sustituye al menú inferior del mapa. Documenta una
paleta de herramientas agrupada por intención, extensible mediante contenido,
con este mínimo aprobado:

- **Información**: observar, inspeccionar, registrar, diagnosticar, analizar,
  probar o tomar muestra cuando el objetivo lo permita.
- **Recuperación**: recoger, recuperar, transportar, desmontar, reciclar y
  marcar para vaciado.
- **Medio natural**: delimitar tala, extracción, recolección, caza, pesca y
  futuras parcelas o áreas ganaderas.
- **Construcción**: colocar plano, adaptar, construir, fortificar, tapiar,
  reparar, mantener y demoler.
- **Seguridad**: marcar amenaza, limpiar zona, puesto de vigilancia, recorrido
  de patrulla, posición defensiva y puntos de retirada o reunión cuando se
  incorporen.
- **Territorio y logística**: zonas habitual, precaución y prohibida;
  almacenes, destinos, rutas o puntos de reabastecimiento cuando existan.
- **Producción**: órdenes y políticas de talleres, cocina, conservación,
  oficios y niveles de reserva.
- **Conocimiento**: catalogar una fuente, estudiar, experimentar, asignar
  enseñanza y conservar o copiar cuando los medios lo permitan.

El objetivo o área determina qué verbos son válidos. No presentes todos los
botones sobre todo elemento ni conviertas la lista en un menú textual de planes
complejos. Una orden puede aplicarse a un objeto, conjunto, trazo, zona,
edificio, persona o política según su naturaleza.

Las acciones contextuales del control puntual reutilizan los mismos verbos y
requisitos. La diferencia es la persona explícitamente seleccionada, no un
sistema de acciones paralelo.

## 10. Tres orígenes de trabajo y reglas persistentes

Documenta tres fuentes principales. Un trabajo conserva su origen para poder
explicar por qué existe.

### 10.1 Orden o designación del jugador

El jugador selecciona objetivo o pinta un área y elige una acción concreta:
talar, desmontar, construir, registrar, reparar, fortificar, atacar o retirar,
entre otras. La orden crea uno o más trabajos definidos; no asigna de forma
permanente una persona salvo control puntual.

### 10.2 Zona, puesto o política persistente

La regla crea y retira trabajos conforme cambia el mundo:

- parcela agrícola;
- área de tala, recolección, caza o pesca;
- almacén y puntos de reabastecimiento;
- puesto de vigilancia y recorrido de patrulla;
- área habitual, de precaución o prohibida;
- mantener una cantidad de agua o recurso;
- mantenimiento periódico de una instalación.

Pintar una zona no explora, limpia, asegura ni cosecha por sí mismo. Solo
declara dónde y bajo qué condiciones pueden nacer trabajos.

### 10.3 Evento, necesidad o cambio del mundo

El mundo genera trabajo al existir una causa:

- incendio, fuga, inundación, derrumbe o brecha;
- persona herida o atrapada;
- hambre, sed, cansancio o necesidad de cuidados;
- instalación averiada o mantenimiento vencido;
- cadáver, suciedad o foco insalubre;
- combustible o consumible agotado;
- herramienta rota;
- aparición de amenaza.

No se requiere que el jugador marque cada llama, herida o filtro. La acción
solo aparece si existen objetivo, acceso y dependencias suficientes, y puede
quedar bloqueada con causa visible.

## 11. Selección, urgencia y autonomía

Conserva el orden conceptual de `UI-001`, adaptado al horizonte:

1. control puntual activo del jugador, sin saltarse prohibiciones físicas;
2. autoprotección y supervivencia inmediata;
3. todos los trabajos válidos por prioridad `1`, `2`, `3`, `4` y `5`,
   incluida la familia Emergencias cuando existe un desastre;
4. dentro del mismo valor: urgencia del trabajo, política de zona, ruta y
   distancia, espera acumulada, adecuación, herramientas disponibles y un
   desempate estable;
5. autonomía causal según `CHR-003`: aceptar, pedir ayuda, posponer, abandonar,
   escoger alternativa o transgredir una norma.

Un desastre no salta automáticamente un valor elegido por el jugador. La
movilización masiva ocurre porque varias personas tienen Emergencias en `1` o
`2` y aparecen suficientes trabajos válidos. Si una persona la tiene en `5`,
continuará antes con familias configuradas en valores superiores salvo
autoprotección inmediata. Dentro del mismo valor, la urgencia del desastre
adelanta el trabajo de emergencia.

La urgencia pertenece al trabajo, no crea una prioridad adicional. Una
cosecha a punto de perderse, una herida que empeora o una reparación que
amenaza la reserva de agua pueden adelantarse a otro trabajo de la misma
familia.

`Nunca` excluye la asignación autónoma de esa familia. Una orden puntual no lo
anula silenciosamente; la interfaz explica la negativa y permite que el
jugador cambie la prioridad. Valores, recuerdos, miedo, lesiones y relaciones
pueden causar además una negativa o transgresión conforme a `CHR-003`.

La autonomía se evalúa en momentos de decisión, no mediante tiradas constantes
por fotograma. La interfaz debe separar una decisión personal de un error de
ruta o una dependencia material ausente.

## 12. Prioridad y capacidad deben verse por separado

Una celda de la matriz combina dos dimensiones sin mezclarlas:

1. **Valor de prioridad elegido**: `Nunca` o `1–5`.
2. **Indicador cualitativo de capacidad actual**.

La celda siempre conserva y permite editar la prioridad, incluso si aparece
gris. Una persona puede recibir prioridad `1` en Electricidad antes de
aprender, para expresar una intención futura. No se generan trabajos
imposibles por ello.

Estados visuales mínimos:

| Estado | Significado funcional |
|---|---|
| Gris | No existe ahora ninguna acción conocida y elegible de esa familia para la persona, o no se ha demostrado capacidad suficiente. No significa incapacidad permanente. |
| Advertencia | Existe alguna acción intentable, pero sería difícil, lenta, insegura o con riesgo relevante de desperdicio. |
| Adecuada | La persona puede realizar al menos trabajos habituales de la familia en condiciones razonables. |
| Familiar | Existen evidencias de dominio considerable en acciones conocidas. |
| Incierta | La comunidad carece de evidencia para valorar con confianza; no debe presentarse como una cifra falsa. |

No conviertas automáticamente toda una fila en gris porque una acción avanzada
esté bloqueada: basta con que exista una acción básica elegible para que la
familia tenga capacidad operativa. El detalle de cada trabajo muestra su propia
dificultad y dependencias.

El estado `Nunca` necesita representación distinta del gris de capacidad: por
ejemplo texto o símbolo de prioridad separado del color/indicador de aptitud.
No fijes colores hexadecimales ni un diseño gráfico definitivo.

## 13. Presentación cualitativa y números internos

El backend futuro puede usar niveles, umbrales, porcentajes, probabilidades,
progreso y modificadores. La interfaz normal no muestra:

- «Mecánica 5/10»;
- «Requiere Electricidad 6»;
- «43 % de comprender»;
- límites personales secretos como cifras absolutas.

Muestra descriptores y causas comprensibles, por ejemplo:

- «No sabemos si Marta podría hacerlo».
- «Muy por encima de su experiencia conocida».
- «Difícil; podría desperdiciar componentes».
- «Exigente, pero parece capaz de intentarlo».
- «Trabajo adecuado para Luis».
- «Muy familiar para Ana».
- «Conoce la teoría, pero carece de práctica».
- «Falta un adaptador compatible».
- «Nadie reconoce estos componentes».

`UI-004` debe distinguir:

- dificultad relativa de la acción;
- confianza de la comunidad en la valoración;
- riesgo previsto;
- dependencia física dura;
- disposición personal;
- prioridad configurada.

No mezcles estos conceptos en un único semáforo. Color, icono, texto y tooltip
pueden combinarse, pero siempre debe existir una explicación textual.

Los requisitos duros provienen de la realidad: no se reproduce un DVD sin
lector, no se accede a un disco sin interfaz compatible, no se suelda sin un
medio válido y una máquina que necesita energía no funciona sin ella. La falta
de habilidad, por el contrario, puede permitir un intento lento, arriesgado o
imperfecto cuando la acción lo admita.

Las tareas peligrosas, médicas, estructurales o que exijan una técnica
irremplazable sí pueden imponer un mínimo duro. Deben explicar la causa en
lenguaje del mundo, no mostrar solo el umbral numérico.

La interfaz de desarrollo puede conservar números bajo un modo de depuración.
No los presentes como experiencia final ni ordenes en esta entrega retirar los
números del prototipo ya implementado.

## 14. Estado real, contenido base e información obtenida

`WLD-004` debe respetar simultáneamente `WLD-002`, `ARC-002` y `DEC-0005`:

- El contenido físico base de cada lugar o contenedor se deriva de semilla,
  ID, versión y cambios persistentes.
- No depende de quién entra, del orden de visitas, de recargar una partida ni
  de una tirada nueva al abrir.
- La persona sí cambia qué observa, reconoce, interpreta, alcanza y puede
  extraer sin dañarlo.
- Una extracción torpe puede causar pérdida, rotura o desperdicio, pero esa
  consecuencia es un cambio causal persistente, no otro sorteo del contenido.
- Una comunidad externa puede llevarse o destruir bienes por simulación; ese
  cambio también persiste.

Por tanto, «quién va» importa mucho sin convertir al especialista en un bonus
que hace aparecer objetos inexistentes.

## 15. Inspección, reconocimiento y saqueo dependiente de la persona

### 15.1 Capas de descubrimiento

Sobre los estados generales de `WLD-002`, registra evidencia separada por
aspecto o categoría. Una localización puede estar inspeccionada en general y
seguir conteniendo maquinaria, documentos o materiales mal comprendidos.

Una visita puede producir:

- objetos obvios reconocidos por casi cualquiera;
- recursos identificados con tipo y uso;
- indicios vagos: «equipamiento mecánico», «archivadores técnicos», «varios
  sistemas electrónicos»;
- elementos portátiles no identificados;
- instalaciones integradas que requieren un especialista;
- accesos, contenedores o compartimentos todavía no abiertos;
- riesgos y señales sobre habitantes anteriores o actividad reciente.

La evidencia debe registrar quién la obtuvo, con qué confianza y en qué
momento cuando resulte relevante. La comunidad comparte la información de
esta entrega según sus reglas de comunicación, sin asumir telepatía futura.

### 15.2 Influencia de la persona

El resultado informativo depende de una combinación de:

- observación y búsqueda;
- habilidad técnica relacionada;
- conocimiento de objetos, modelos y compatibilidades;
- experiencia previa y profesión de origen;
- herramientas de diagnóstico o acceso;
- tiempo dedicado;
- iluminación, peligro, estrés y estado físico;
- ayuda de otra persona o consulta de documentación.

Una persona sin mecánica puede reconocer herramientas, combustible y piezas
obvias. Un mecánico puede distinguir alternadores, correas, compatibilidades,
motores reparables, herramientas especializadas y maquinaria aprovechable.
No conviertas este ejemplo en un catálogo exhaustivo.

### 15.3 Pistas y decisión de volver

La primera visita debe poder indicar qué tipo de especialista aportaría valor:

- «Hay maquinaria que nadie del grupo sabe valorar».
- «Parece haber documentación técnica».
- «Los equipos podrían contener componentes electrónicos».
- «El estado de esta instalación requiere diagnóstico».

El jugador decide entre:

- enviar inmediatamente a alguien más adecuado;
- llevar objetos no identificados a la base;
- recuperar solo lo evidente;
- dedicar más tiempo a registrar;
- desmontar con riesgo;
- dejar el lugar para más adelante.

### 15.4 Objetos no identificados

Un elemento portátil puede recuperarse como lote o artefacto no identificado,
con procedencia, peso, condición y descripción aproximada. Catalogarlo o
estudiarlo más adelante puede revelar su naturaleza. No lo conviertas en una
bolsa abstracta que vuelve a tirar su contenido al abrirla: el contenido ya
está fijado.

Una instalación integrada, vehículo, máquina pesada o componente conectado
puede permanecer en el lugar hasta que exista conocimiento, herramienta o
capacidad de transporte. El jugador también puede ordenar llevar «todo lo
posible», asumiendo tiempo, peso, espacio y riesgo de transportar chatarra.

### 15.5 Revisitas y agotamiento

Volver con otra persona puede descubrir valor no reconocido, un acceso o una
forma de recuperación distinta. Nunca repone recursos retirados.

La interfaz distingue al menos:

- recursos conocidos pendientes de retirar;
- recursos conocidos agotados;
- elementos presentes pero no identificados;
- indicios de valor que requieren otro conocimiento;
- registro incompleto por acceso, tiempo o riesgo;
- localización físicamente vaciada o destruida.

«No queda nada» solo se usa cuando el estado físico permite afirmarlo. «No
reconocemos nada más útil» mantiene incertidumbre. Una localización puede
quedar agotada respecto a comida conocida y no respecto a componentes
técnicos.

### 15.6 Recuperar frente a desmontar

- **Recuperar** preserva, en lo posible, un objeto portátil o componente
  extraíble para usarlo, almacenarlo, estudiarlo o repararlo.
- **Desmontar** altera o sacrifica el original para obtener piezas, materiales
  o conocimiento estructural.
- **Registrar** obtiene información y localiza oportunidades; no transporta
  automáticamente.
- **Catalogar** organiza una fuente ya recuperada; no sustituye el registro
  físico del lugar.

Un desmontaje puede mejorar conocimiento, dañar piezas, consumir herramienta
y cerrar la posibilidad de reparar el conjunto original. Sus consecuencias
persisten.

## 16. El conocimiento como recurso del mundo

La premisa central debe quedar expresada de forma inequívoca:

> La humanidad ya descubrió la tecnología. El reto es encontrar el
> conocimiento, acceder a él, entenderlo, conservarlo y volver a hacerlo útil.

Z-World no usa como modelo principal una mesa de investigación que genera
puntos abstractos para comprar tecnologías de un árbol universal. El mundo
ofrece personas, documentos, objetos, instalaciones y problemas. El jugador
decide qué recuperar, proteger, estudiar, probar, aplicar y transmitir.

El conocimiento es una categoría de botín por derecho propio y puede resultar
más decisivo que comida, combustible o un arma. La identidad perseguida es que
recuperar, reparar y mantener los restos del mundo anterior tenga tanto o más
peso que fabricar siempre desde cero. El valor persiste en herramientas,
máquinas, infraestructura, documentación, experiencia y personas.

La secuencia conceptual es:

> **Recuperar → identificar → acceder → comprender → experimentar o practicar
> → aplicar → documentar y transmitir.**

No todos los conocimientos recorren todos los pasos ni en el mismo orden. Una
persona puede llegar sabiendo una técnica; otra puede aprender observando; un
manual accesible puede aplicarse directamente por un experto; un objeto puede
comprenderse tras varios desmontajes.

## 17. Entidades conceptuales del conocimiento

`SET-006` debe definir el modelo funcional sin cerrar todavía un esquema de
base de datos:

### 17.1 Fuente de conocimiento

Objeto, persona, máquina, instalación, comunidad o experiencia que contiene o
permite inferir conocimiento. Conserva identidad, procedencia, condición,
medio, accesibilidad, fragmentos potenciales y dependencias para consultarla.

### 17.2 Fragmento de conocimiento

Unidad específica y reutilizable de comprensión, por ejemplo diagnóstico de
bombas centrífugas, seguridad eléctrica doméstica, secado de semillas o
acceso a discos SATA. No equivale necesariamente a una habilidad completa ni
a una tecnología desbloqueada.

Un fragmento puede contener:

- dominio y tema;
- alcance;
- profundidad o cobertura interna;
- prerrequisitos conceptuales;
- técnicas relacionadas;
- acciones que ayuda a reconocer o ejecutar;
- fuentes y personas que lo portan;
- confianza y evidencia;
- necesidades de práctica o validación.

No fijes ahora una ontología completa ni miles de IDs. Documenta el contrato
que permitirá datos dirigidos por contenido según `DEC-0003`.

### 17.3 Conocimiento individual

Lo que una persona comprende y puede recordar, interpretar o aplicar. Debe
distinguir teoría, familiaridad práctica y capacidad para enseñar cuando sean
relevantes. La habilidad general y el conocimiento de una técnica cooperan,
pero no son la misma cifra.

### 17.4 Conocimiento comunitario

No es una mente colectiva ni un bonus global. Es el conjunto trazable de:

- personas portadoras;
- fuentes accesibles;
- materiales catalogados;
- procedimientos documentados;
- lugares de consulta;
- talleres, escuelas y prácticas que permiten reproducirlo;
- aprendices y redundancia.

La comunidad puede «tener» un manual y carecer de alguien capaz de entenderlo.
Puede entender una técnica y carecer de medios para ejecutarla. Puede ejecutar
algo gracias a una única persona sin haberlo preservado de forma resiliente.

### 17.5 Capacidad real

Una acción compleja evalúa conjuntamente:

> conocimiento pertinente + persona capaz + habilidades + herramientas +
> materiales + energía + instalación + acceso + tiempo + estado físico y
> mental + condiciones del entorno.

Ningún elemento aislado concede capacidad automática.

## 18. Estados comunitarios de un fragmento

Usa estados cualitativos que no sean una barra tecnológica universal:

1. **Desconocido**: la comunidad no reconoce la existencia del fragmento.
2. **Indicado**: existen pistas o referencias, pero no una fuente utilizable.
3. **Disponible**: existe una persona o fuente identificada, aunque pueda
   seguir inaccesible o sin comprender.
4. **Parcialmente comprendido**: se entienden partes o usos limitados.
5. **Operativo**: al menos una persona puede aplicarlo en condiciones
   concretas con medios adecuados.
6. **Resiliente**: se ha documentado o distribuido entre suficientes fuentes
   y personas para que una sola pérdida no lo elimine.

Estos estados resumen una red de portadores y evidencias; no sustituyen sus
causas. `Disponible` debe indicar además si el soporte está accesible.
`Operativo` no significa que todas las personas sepan aplicarlo. `Resiliente`
no significa inmortal: pueden perderse personas, biblioteca, taller y copias.

La simulación puede conservar progreso interno continuo, cobertura y
confianza. La interfaz muestra estados, lagunas y causas, no un porcentaje
universal de «investigación».

## 19. Fuentes físicas, humanas y digitales

Documenta como mínimo estas familias, sin crear un catálogo exhaustivo:

### 19.1 Escritas y gráficas

Libros, manuales, enciclopedias, revistas, material escolar o universitario,
cuadernos, diarios, planos, mapas, esquemas, catálogos, instrucciones,
procedimientos de empresa y documentación técnica.

### 19.2 Audiovisuales y analógicas

VHS, casetes, cintas, fotografías, microformas, CD, DVD, grabaciones y
material formativo. Su acceso puede depender de lector, energía y estado.

### 19.3 Digitales

Pendrives, tarjetas, discos duros, SSD, teléfonos, tabletas, portátiles, PCs,
NAS, servidores y sistemas industriales. «Tenemos el soporte» no significa
«podemos acceder al contenido».

### 19.4 Personas

Experiencia profesional, práctica vital, memoria, técnicas tácitas y
capacidad pedagógica de agricultores, enfermeros, electricistas, mecánicos,
docentes, informáticos, fontaneros, veterinarios, carpinteros y cualquier otro
trasfondo generado.

### 19.5 Objetos, máquinas e instalaciones

Una bomba, motor, ordenador, cultivo, taller o red municipal permite observar,
medir, desmontar, reparar y experimentar. El objeto puede enseñar aunque no
exista manual.

### 19.6 Otras comunidades

Comercio de documentos, formación, demostraciones, especialistas, acuerdos,
aprendices, espionaje o conocimiento compartido. No diseñes aquí la diplomacia
regional completa.

### 19.7 Experiencia y acontecimientos

Práctica, éxito, error, accidente, observación de otra persona, diagnóstico,
reparación y resolución de un problema pueden producir conocimiento
individual o evidencia comunitaria.

## 20. Acceso a conocimiento digital y obsoleto

Una fuente digital puede requerir una cadena causal:

- energía;
- dispositivo funcional;
- puerto, lector, cable o adaptador compatible;
- pantalla, periférico o almacenamiento suficiente;
- sistema operativo, controlador, aplicación o códec;
- contraseña, clave o recuperación de datos cuando proceda;
- persona con conocimientos informáticos;
- tiempo y un entorno que no destruya el soporte.

No conviertas cada punto en requisito universal: cada fuente declara los que
le corresponden.

Ejemplo normativo de estructura, no de contenido garantizado: un disco duro
municipal puede estar catalogado y seguir inaccesible hasta conseguir
electricidad, PC, adaptador y una persona capaz. Al acceder puede revelar
planos de agua, inventarios, saneamiento, edificios o mantenimiento. El objeto
encontrado meses antes adquiere utilidad sin cambiar retroactivamente su
contenido.

La tecnología obsoleta no desaparece de un árbol. Tiene compatibilidades,
lectores, formatos, condición y cadenas de acceso. Un soporte puede degradarse,
copiarse, repararse o quedar temporalmente inutilizable.

## 21. Fragmentación, redundancia y consulta posterior

Una fuente aporta fragmentos y profundidad, nunca necesariamente una
tecnología completa. Un manual de electricidad doméstica puede cubrir
seguridad, cableado y diagnóstico básico sin enseñar electrónica industrial.

Una segunda fuente relacionada puede:

- cubrir lagunas;
- aportar otro método;
- aumentar confianza mediante contraste;
- permitir estudio paralelo;
- facilitar enseñanza;
- servir de copia de seguridad;
- conservarse en otro lugar;
- intercambiarse.

Una fuente no se consume por estudiarla. Una persona puede comprender solo una
parte, conservarla y volver meses después con más base. La condición del
soporte sí puede degradarse por tiempo, uso, accidente o ambiente si el sistema
correspondiente lo modela.

## 22. Formas aprobadas de adquirir conocimiento

`CHR-002` debe desarrollar estas vías distintas:

1. **Práctica útil**: ejecutar una acción real y recibir experiencia ligada a
   lo que ocurrió.
2. **Libros y manuales**: información estructurada que exige acceso,
   comprensión y, a menudo, práctica.
3. **Material audiovisual**: especialmente útil para secuencias y técnicas
   prácticas si existe equipo para reproducirlo.
4. **Documentación técnica**: precisa y especializada; puede exigir base
   previa.
5. **Enseñanza**: una persona dedica tiempo a transmitir conocimiento.
6. **Mentoría**: aprender trabajando con alguien más competente que guía,
   corrige y supervisa.
7. **Experimentación**: formular y probar una solución con resultado
   incierto pero causal.
8. **Desmontaje**: aprender estructura, componentes y relaciones al desarmar.
9. **Reparación**: aprender diagnóstico y funcionamiento al restaurar.
10. **Intercambio con otras comunidades**: recibir formación, documentos o
    demostraciones.
11. **Observación**: ver a una persona, animal, máquina o proceso actuar.

No todas las vías producen el mismo tipo, velocidad, profundidad o seguridad.
La transferencia entre habilidades sigue siendo parcial y explícita según
`CHR-002`; pescar no enseña hongos y cocinar no concede rastreo.

Una acción difícil puede enseñar incluso si el resultado material es parcial,
pero no debe premiar el fracaso absurdo ni permitir aprendizaje infinito
repitiendo una acción sin información nueva.

## 23. Aprendizaje individual, enseñanza y mentoría

Cada persona combina:

- conocimiento previo;
- habilidad práctica;
- aptitud y ritmo de aprendizaje;
- interés, motivación y valores;
- estado físico y mental;
- calidad de fuente o docente;
- medios y tiempo de práctica;
- resultados y correcciones recibidas.

Dos personas expuestas al mismo manual no tienen por qué aprender al mismo
ritmo ni alcanzar la misma profundidad. Nadie queda encerrado para siempre por
su profesión inicial, pero no todas las personas alcanzarán excelencia en
todo.

Enseñar requiere conocimiento pertinente, capacidad o disposición pedagógica,
tiempo, alumno, medio y oportunidad. Saber hacer no garantiza enseñar bien.
Mentoría y supervisión pueden:

- permitir que un principiante participe de forma segura;
- reducir fallos y desperdicio;
- acelerar comprensión práctica;
- repartir conocimiento tácito;
- revelar aptitudes e intereses.

El docente deja de producir o descansa menos durante el tiempo dedicado; la
enseñanza no genera saber sin coste.

## 24. Experimentar, aplicar y cacharrear

El cacharreo es una vía legítima y diferenciadora, no un botón gratuito de
investigación. Puede consistir en comparar aparatos, intercambiar piezas,
medir, desmontar, montar, adaptar, probar, diagnosticar y documentar.

Ejemplo no normativo: tres PCs averiados pueden aportar placa, RAM, disco,
fuente, cables y experiencia suficiente para montar uno funcional. El
resultado material y el aprendizaje son consecuencias distintas.

Una experimentación declara:

- pregunta u objetivo;
- objetos y recursos expuestos;
- herramientas e instalación;
- persona o equipo;
- conocimiento previo;
- tiempo;
- riesgos conocidos y desconocidos;
- posibles evidencias y resultados.

Puede producir:

- éxito completo o parcial;
- reparación temporal;
- prototipo imperfecto;
- identificación de un componente;
- descarte de una hipótesis;
- fragmento de conocimiento;
- desperdicio;
- daño o destrucción;
- accidente, lesión, incendio, ruido o contaminación cuando sea causalmente
  plausible.

No todas las acciones necesitan todas estas salidas. Los riesgos dependen del
objeto y método, no de una tabla universal de castigo. Un fallo conserva lo
aprendido cuando hubo evidencia interpretable; destruir al azar materiales no
enseña automáticamente.

## 25. Aplicación, documentación, pérdida y resiliencia

Aplicar conocimiento valida o corrige comprensión y puede crear un
procedimiento reproducible. Documentar requiere tiempo, soporte, lenguaje y
capacidad de expresar lo aprendido.

Si una única persona conoce una técnica de forma tácita y muere, abandona o
queda incapaz, la comunidad puede perder la capacidad operativa. Si permanece
un manual accesible, no conserva automáticamente la práctica, pero permite
reaprender. Si existen varios practicantes, notas claras, fuentes independientes
y un lugar de enseñanza, el conocimiento es más resiliente.

La pérdida puede proceder de:

- muerte, marcha, trauma o deterioro cognitivo;
- olvido por falta de uso cuando se modele;
- incendio, agua, moho o destrucción de soportes;
- avería o falta de energía y lectores;
- robo, censura, ocultación o conflicto;
- pérdida del taller necesario para practicar;
- dispersión de la comunidad.

No implementes ahora fórmulas de olvido. Registra su posibilidad como pregunta
abierta si no estaba cerrada.

## 26. Progresión guiada por el mundo sin bloqueo injusto

El mundo influye en el desarrollo porque cada partida ofrece distintas
personas, lugares, manuales, máquinas, comunidades y problemas. Encontrar un
manual de apicultura puede abrir una estrategia que no estaba planificada;
hallar documentación agrícola puede orientar otra partida.

Esto no elimina agencia. El jugador decide qué conservar, quién estudia, qué
riesgo asumir, qué enseñar y qué solución material perseguir.

Evita dependencia absoluta de una única tirada:

- Una capacidad esencial de supervivencia debe admitir varias rutas o una
  alternativa material más básica.
- Un mismo fragmento puede provenir de persona, manual, vídeo, comunidad,
  práctica, reparación, desmontaje o experimento, con cobertura y dificultad
  distintas.
- El hallazgo raro puede acelerar o especializar, no bloquear para siempre
  todas las soluciones a una necesidad esencial.
- Una técnica avanzada concreta sí puede ser rara, pero la necesidad que
  resuelve debe admitir otras estrategias plausibles cuando el diseño las
  contemple.
- No garantices que todas las partidas alcancen todas las tecnologías.

La variedad procede de oportunidades y costes distintos, no de partidas
inviables por faltar un único libro obligatorio.

## 27. Conocimiento que revela acciones y lugares

Aprender no cambia mágicamente el objeto. Cambia lo que la comunidad reconoce
y puede intentar:

- antes: «bomba desconocida»; opciones de observar o desmontar a ciegas;
- después de diagnóstico básico: inspeccionar y probar;
- con comprensión y medios: reparar, adaptar, instalar o reconstruir.

Mapas, diarios, contratos, archivos municipales, catálogos o comunicaciones
pueden revelar:

- depósitos, pozos, granjas y talleres;
- direcciones de proveedores;
- redes de agua, saneamiento o energía;
- carreteras, refugios y rutas;
- comunidades, riesgos y lugares del mapa estratégico.

El conocimiento puede crear **información o una pista de localización**, nunca
teletransportar un lugar ni garantizar que su estado actual coincida con un
documento antiguo. `WLD-003` y `NAR-002` gobiernan antigüedad, rumor y cambio
regional.

## 28. Relación entre exploración local y mapamundi

La prioridad Exploración y expediciones existe en el panel general, pero
admite dos contextos:

- **Local**: reconocer límites, edificios, caminos, accesos, riesgos e indicios
  del mapa 3D cercano.
- **Estratégico futuro**: preparar o participar en expediciones que revelan
  hexágonos, rutas, lugares y comunidades.

El mapa estratégico se sentirá como un subsistema con viaje, logística,
peligro, niebla, acontecimientos y decisiones, pero sigue conectado con las
mismas personas y conocimientos. Esta entrega no fija tamaño de hexágonos,
interfaz de expedición ni transición de escala; siguen abiertas en `WLD-003`.

### 28.1 Ejemplo transversal que debe conservarse

Incluye, como ejemplo no normativo repartido o enlazado desde las fuentes
adecuadas, esta secuencia causal:

1. Una exploración preliminar detecta una posible estación municipal de
   bombeo.
2. Ana, sin conocimientos técnicos, la registra y recupera herramientas,
   bidones, metal y documentación; deja constancia de maquinaria que no sabe
   identificar.
3. Marcos, con experiencia mecánica, vuelve y reconoce dos bombas, una
   probablemente reparable, un motor compatible, piezas aprovechables y un
   manual técnico. Nada de eso apareció por llevar a Marcos: ya estaba allí.
4. Logística traslada el manual y los recursos portátiles.
5. Catalogar conocimiento lo identifica como manual de bombas centrífugas con
   fragmentos de mantenimiento, diagnóstico, desmontaje e instalación.
6. Luis intenta estudiarlo. La interfaz indica «Difícil» y explica la base que
   le falta, sin mostrar `Mecánica 5 / dificultad 6`.
7. Luis intenta una reparación con medios imperfectos: tarda, consume una
   junta, obtiene una reparación parcial y aprende del resultado.
8. Tras más práctica y estudio, vuelve al mismo manual y comprende apartados
   que antes no podía aprovechar.

Este ejemplo demuestra conjuntamente contenido estable, información
dependiente de la persona, logística física, conocimiento fragmentario,
consulta posterior, aplicación imperfecta y desarrollo del personaje. No lo
conviertas en evento garantizado ni en contenido obligatorio del primer mapa.

## 29. Reglas de alcance y compatibilidad con el juego actual

- Las 34 prioridades son horizonte aprobado, no encargo de implementación
  inmediata.
- Las diez familias y escala `0–4` de `IMPLEMENTATION-002/003` permanecen en
  el código y en el registro histórico.
- No conviertas `IMPLEMENTATION-004` en la implementación íntegra de este
  diseño. `RDM-001` solo exige aprendizaje observable acotado, defensa y vida
  propia.
- No diseñes migraciones de guardado antes de que exista el guardado.
- No cierres balance, tiempos, probabilidades, colores, fórmulas de aprendizaje
  ni catálogo completo de técnicas.
- No promociones `CHR-005` a `approved`: habilidades y prioridades son
  taxonomías diferentes.
- No elimines el control puntual con ratón, la autonomía ni las zonas de
  `UI-001`.
- No cambies la generación reproducible: conocimiento y pericia modifican
  descubrimiento y resultados causales, no la tirada base.

## 30. Contenido mínimo de los nuevos documentos

### 30.1 `UI-003_work-priority-taxonomy.md`

Debe contener:

- definición separada de prioridad, orden, zona, política, evento y trabajo;
- escala `Nunca/1–5`;
- nueve bloques y tabla completa de 34 prioridades con IDs;
- responsabilidad y límites de cada prioridad;
- los tres orígenes de trabajo;
- regla de una familia efectiva por trabajo;
- selección, urgencia y autonomía;
- funcionamiento especial de Emergencias;
- matriz plegable, edición de bloque, estado Mixto, filtros y plantillas;
- ejemplos breves y no normativos de clasificación ambigua resuelta.

### 30.2 `UI-004_qualitative-capability-presentation.md`

Debe contener:

- separación entre prioridad visible y capacidad estimada;
- celda gris configurable;
- estados cualitativos, incertidumbre y confianza;
- diferencia entre dificultad, riesgo y bloqueo físico;
- prohibición de mostrar umbrales internos como UX normal;
- explicación causal y tooltips;
- compatibilidad temporal con números de depuración del prototipo;
- gestión progresiva sin revelar de inicio todos los límites personales.

### 30.3 `WLD-004_expertise-dependent-recovery.md`

Debe contener:

- contenido base estable frente a información obtenida;
- evidencia por aspecto y procedencia;
- influencia de persona, conocimiento, herramienta, tiempo y peligro;
- pistas para enviar especialista;
- objetos no identificados y recuperación de «todo lo posible»;
- revisitas sin regeneración;
- estados claros de agotado, no reconocido, inaccesible y pendiente;
- diferencia entre registrar, recuperar, desmontar y catalogar;
- fallos y pérdidas como cambios causales persistentes;
- conexión limitada con `WLD-003` mediante pistas y localizaciones.

### 30.4 `SET-006_knowledge-assets-and-capability.md`

Debe contener:

- premisa de conocimiento recuperado frente a árbol tecnológico;
- ciclo conceptual completo;
- fuente, fragmento, conocimiento individual, comunitario y capacidad real;
- estados Desconocido, Indicado, Disponible, Parcialmente comprendido,
  Operativo y Resiliente;
- familias de fuentes físicas, humanas, digitales y experimentales;
- acceso digital, compatibilidad y obsolescencia;
- fragmentación, redundancia y consulta posterior;
- anti-bloqueo injusto por RNG;
- conocimiento que revela acciones y localizaciones;
- interacción con `CHR-002`, `SET-004`, `SET-005`, `WLD-004` y `ARC-002`.

### 30.5 `DEC-0007_layered-work-and-priorities.md`

Debe registrar concisamente:

- contexto: diez familias sirven al primer corte, pero el horizonte requiere
  control más granular;
- decisión: 34 prioridades dentro de nueve bloques, separadas de habilidad y
  conocimiento, con escala `Nunca/1–5`;
- Emergencias se conserva y Caza se separa de Combate;
- razones: profundidad, asignación humana, crecimiento y claridad;
- consecuencias: interfaz jerárquica, necesidad de futura migración y datos
  dirigidos por IDs;
- alternativas descartadas: diez categorías definitivas, 15 categorías
  planas, 33/34 columnas sin bloques y fusionar caza con combate;
- no decisión: esta entrega no implementa ni fecha la migración.

## 31. Preguntas que deben quedar abiertas

No inventes respuesta para:

- fórmulas numéricas de idoneidad, dificultad, riesgo, aprendizaje, enseñanza,
  olvido, fallo o desperdicio;
- valores iniciales por personaje y plantillas definitivas;
- color, iconografía y disposición visual final;
- catálogo exhaustivo de acciones, habilidades, técnicas, conocimientos,
  objetos, formatos y herramientas;
- frecuencia y equilibrio de fuentes de conocimiento;
- reglas completas de idiomas, cifrado, contraseñas y recuperación forense;
- número de personas o copias necesarias para considerar algo resiliente;
- duración y profundidad de cursos o mentorías;
- qué conocimientos concretos puede olvidar una persona;
- interfaz y simulación completas del mapamundi;
- estrategia de migración técnica desde las diez familias implementadas;
- formato final de datos y guardado.

Estas preguntas deben ir a la fuente canónica correspondiente y, cuando
proceda, resumirse en `docs/OPEN-QUESTIONS.md`. No conviertas todo el contenido
aprobado en `draft` solo porque sus fórmulas sigan abiertas.

## 32. Fuera de alcance estricto

No hagas en esta entrega:

- cambios en `.gd`, `.tscn`, `project.godot`, `game_data/` o `tests/`;
- migración de la matriz actual;
- implementación de las 34 prioridades;
- nueva interfaz ejecutable;
- IA de asignación nueva;
- aprendizaje, libros, biblioteca, escuela o cacharreo ejecutables;
- mapamundi, hexágonos o expediciones jugables;
- nuevos objetos o recursos del escenario;
- zombis, combate, política, comercio o comunidades externas adicionales;
- generación procedural ni guardado;
- fórmulas o balance fingidos;
- investigación web;
- instalación o ejecución de Godot.

## 33. Actualizaciones de estado e historial

Añade una entrada `DESIGN-003` al principio de `CHANGELOG.md` que resuma:

- cinco documentos nuevos;
- 34 prioridades en nueve bloques;
- escala `Nunca/1–5` y capacidad separada;
- Emergencias y separación Caza/Combate;
- recuperación dependiente de la persona con contenido estable;
- conocimiento físico/digital, individual/comunitario y capacidad real;
- aprendizaje, enseñanza, experimentación y pérdida;
- ausencia total de implementación.

En `docs/STATUS.md`:

- conserva `IMPLEMENTATION-003` como última entrega de código y su aceptación
  manual pendiente;
- registra `DESIGN-003` como última entrega documental completada;
- enumera los nuevos documentos `approved`;
- aclara que no se cambió el juego ejecutable.

Registra este prompt en `prompts/INDEX.md` y conserva el archivo exacto en
`prompts/DESIGN-003_work-recovery-and-knowledge.md`.

## 34. Validaciones documentales acotadas

No ejecutes pruebas de Godot. Realiza únicamente:

1. `git diff --check`.
2. Comprobar con `rg` que existen y están indexados `UI-003`, `UI-004`,
   `WLD-004`, `SET-006` y `DEC-0007`.
3. Contar la tabla de `UI-003` y confirmar exactamente nueve bloques y 34
   prioridades, sin duplicados.
4. Comprobar que todas las prioridades tienen nombre, ID, bloque y límites de
   responsabilidad.
5. Buscar contradicciones residuales que presenten las diez familias `0–4`
   como modelo final en vez de implementación provisional.
6. Comprobar que `IMPLEMENTATION-003` sigue con aceptación manual pendiente.
7. Revisar enlaces Markdown modificados y que cada documento nuevo figure en
   su índice de dominio.

No añadas linters, scripts permanentes ni suites de prueba para esta entrega.

## 35. Criterios de aceptación

- Existen cinco documentos nuevos con los IDs, rutas y estados exactos.
- Prioridad, orden, zona, política, evento, trabajo, habilidad, conocimiento y
  medios materiales no se confunden.
- La lista canónica contiene exactamente 34 prioridades en nueve bloques.
- Emergencias permanece como prioridad real exclusiva de respuesta a
  desastres y moviliza solo trabajos/plazas válidos.
- Caza y Combate y limpieza de amenazas son prioridades separadas.
- La escala final es `Nunca`, `1`, `2`, `3`, `4`, `5`, con `1` como máxima.
- Una celda gris sigue siendo configurable y no comunica incapacidad
  permanente.
- No se muestran umbrales numéricos de habilidad en la UX final.
- Cada trabajo tiene una familia efectiva inequívoca y requisitos separados.
- Las tres fuentes de trabajo están documentadas.
- El contenido base no depende de quién visita ni se resortea al cargar.
- La persona modifica reconocimiento, acceso, calidad y consecuencias causales
  de recuperación.
- Se distinguen agotado, no reconocido, inaccesible y pendiente de retirada.
- El conocimiento se representa mediante fuentes, fragmentos, portadores,
  comprensión y medios, no mediante una barra tecnológica universal.
- Fuentes escritas, audiovisuales, digitales, humanas, materiales y sociales
  están contempladas.
- Información disponible, comprensión y capacidad real son capas distintas.
- Práctica, estudio, mentoría, enseñanza, desmontaje, reparación,
  experimentación, observación e intercambio son vías válidas y diferentes.
- Duplicados y fuentes antiguas mantienen utilidad.
- La pérdida de una persona o soporte puede reducir capacidad de forma causal.
- Se evitan bloqueos esenciales por un único hallazgo RNG sin garantizar todas
  las tecnologías en todas las partidas.
- El conocimiento puede revelar acciones y pistas del mundo sin cambiar
  mágicamente los objetos.
- `RDM-001` no se amplía y no se ha escrito código.
- `CHR-005` y `RDM-002` continúan `draft`; ningún documento pasa a
  `implemented`.
- `IMPLEMENTATION-003` continúa pendiente de aceptación manual.
- Índices, preguntas abiertas, estado, changelog e historial de prompts quedan
  coherentes.

## 36. Informe final

Responde en español con:

1. documentos creados y responsabilidad de cada uno;
2. documentos existentes actualizados;
3. confirmación del recuento de nueve bloques y 34 prioridades;
4. decisiones aprobadas sobre Emergencias, Caza, escala y celdas grises;
5. cómo quedó resuelta la compatibilidad entre contenido estable y saqueo
   dependiente de la persona;
6. resumen del modelo de conocimiento y capacidad;
7. preguntas que permanecen abiertas;
8. validaciones ejecutadas y resultado real;
9. confirmación expresa de que no se modificó código ni se amplió `RDM-001`.

No propongas ni empieces `IMPLEMENTATION-004` en esta entrega.
