# PROMPT PARA CLAUDE CODE — DESIGN-007: primer escenario real, cohorte protagonista y pueblo de llegada

## 0. Encargo

Realiza una entrega **exclusivamente documental** en el repositorio `bateman37/z-world` para convertir el escenario inicial de referencia en un escenario real, concreto, reproducible y plenamente conectado con el resto del diseño.

La entrega debe cerrar documentalmente:

1. El momento exacto de llegada y el estado del mundo.
2. La generación de los seis supervivientes protagonistas.
3. Su distribución mínima de calibre oculto, sus perfiles útiles y sus carencias.
4. La red procedural de relaciones con la que empieza el grupo.
5. La diferencia entre refugio provisional y asentamiento elegido.
6. La descomposición semántica de cualquier edificio en estancias con funciones y posibilidades de adaptación.
7. El presupuesto numérico del primer mapa local.
8. La amenaza zombi inicial, deliberadamente contenida y limpiable.
9. El estado físico, pertenencias, armas cuerpo a cuerpo y carencias iniciales.
10. Las garantías internas que debe cumplir toda semilla válida.
11. La presencia humana regional incierta.
12. La identidad jugable de las primeras horas sin convertirlas en una misión lineal.

No programes nada. No inicialices ni modifiques la aplicación web. No crees generadores, datos, componentes, esquemas, migraciones ni pruebas ejecutables. Esta entrega debe documentar el **horizonte funcional máximo del escenario inicial**, dejando que una entrega posterior decida qué subconjunto se implementa primero.

La calidad documental es prioritaria. No reduzcas este encargo a un resumen breve ni lo concentres todo en una ampliación desordenada de `SCN-001`. Distribuye cada responsabilidad en la fuente canónica adecuada, conserva trazabilidad y evita duplicar reglas ya existentes.

---

## 1. Precondición obligatoria: no apilar esta entrega sobre DESIGN-006

Ya verificado por el orquestador: DESIGN-006 está fusionado en `main`. Crea tu rama documental nueva desde el `main` remoto actualizado.

Nombre de rama:

```text
docs/design-007-first-arrival-scenario
```

No reutilices ramas anteriores, ramas de Godot ni ramas de implementación. No uses `reset --hard`, no sobrescribas trabajo ajeno y no cierres o fusiones otras PR.

---

## 2. Reglas obligatorias de Git y entrega

### 2.1 Prompt e índices

Guarda este prompt literal en:

```text
prompts/DESIGN-007_first-arrival-scenario.md
```

Actualiza `prompts/INDEX.md` y cualquier índice de prompts pertinente.

### 2.2 Commit, publicación y pull request

Al terminar:

1. Haz commit de la entrega documental.
2. Publica la rama.
3. Crea la pull request.
4. **No fusiones la PR.**

Título sugerido:

```text
DESIGN-007: primer escenario real y cohorte protagonista
```

La descripción de la PR debe enumerar:

- documentos creados y modificados;
- decisiones cerradas;
- contradicciones corregidas;
- preguntas retiradas de `OPEN-QUESTIONS.md`;
- cuestiones que permanecen abiertas deliberadamente;
- estados documentales finales;
- validaciones ejecutadas;
- confirmación expresa de que no se ha implementado código.

### 2.3 Alcance técnico prohibido

No debes:

- modificar `src/`, `scenes/`, `tests/`, `project.godot` ni el prototipo Godot;
- crear o modificar código Node.js, TypeScript, Next.js, React, Canvas, Prisma o PostgreSQL;
- añadir dependencias, paquetes, esquemas o migraciones;
- crear JSON, semillas, personajes o edificios ejecutables;
- implementar combate, IA, pathfinding, inventario, habitaciones o generadores;
- ejecutar suites globales o instalar herramientas;
- marcar nada como `implemented`;
- ampliar silenciosamente el alcance de `RDM-003`;
- aprobar automáticamente `CAT-004` como subconjunto de implementación;
- fusionar la PR.

---

## 3. Lectura obligatoria y matriz de reconciliación

Lee completos, como mínimo:

### Gobierno, estado y roadmap

- `AGENTS.md`
- `CLAUDE.md`
- `README.md`
- `CHANGELOG.md`
- `docs/INDEX.md`
- `docs/STATUS.md`
- `docs/OPEN-QUESTIONS.md`
- `docs/00-governance/DOC-001_documentation-system.md`
- `docs/00-governance/GLOSSARY.md`
- `docs/roadmap/RDM-003_simulation-first-playable-roadmap.md`

### Escenario

- `docs/scenarios/INDEX.md`
- `docs/scenarios/SCN-001_mountain-village-arrival.md`

### Mundo, exploración y generación

- `docs/20-world/INDEX.md`
- `docs/20-world/WLD-001_world-scales.md`
- `docs/20-world/WLD-002_local-exploration-and-information.md`
- `docs/20-world/WLD-004_expertise-dependent-recovery.md`
- `docs/20-world/WLD-005_semantic-place-and-building-generation.md`
- `docs/20-world/WLD-006_historical-looting-pressure-and-routes.md`
- `docs/20-world/WLD-007_place-history-and-environmental-storytelling.md`
- `docs/20-world/WLD-008_local-procedural-map-generation.md`

### Personajes y sociedad

- `docs/30-characters/INDEX.md`
- `docs/30-characters/CHR-001_character-model.md`
- `docs/30-characters/CHR-002_knowledge-and-learning.md`
- `docs/30-characters/CHR-003_autonomy-intentions-and-behavior.md`
- `docs/30-characters/CHR-004_life-history-and-personal-arcs.md`
- `docs/30-characters/CHR-006_characteristics-and-skill-catalog.md`
- `docs/30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md`
- `docs/50-society/SOC-001_living-community.md`
- `docs/50-society/SOC-002_internal-politics-and-leadership.md`
- `docs/50-society/SOC-003_external-communities-and-regional-history.md`

### Asentamiento, edificios, objetos y recursos

- `docs/40-settlement/INDEX.md`
- `docs/40-settlement/SET-001_settlement-growth.md`
- `docs/40-settlement/SET-003_resources-logistics-and-condition.md`
- `docs/40-settlement/SET-007_building-exploitation-reuse-and-demolition.md`
- `docs/40-settlement/SET-008_object-model-and-logistics-families.md`
- `docs/40-settlement/SET-009_disassembly-and-world-transformation.md`
- `docs/catalogs/INDEX.md`
- `docs/catalogs/CAT-001_maximum-place-catalog.md`
- `docs/catalogs/CAT-002_rooms-modules-and-building-systems.md`
- `docs/catalogs/CAT-003_occupants-professions-hobbies-and-traits.md`
- `docs/catalogs/CAT-004_initial-semantic-place-slice.md`

### Amenazas, narrativa e interfaz

- `docs/60-threats/INDEX.md`
- `docs/60-threats/THR-001_zombie-threat-model.md`
- `docs/60-threats/THR-002_configurable-threat-horizon.md`
- `docs/70-narrative/NAR-001_emergent-narrative.md`
- `docs/70-narrative/NAR-002_memory-and-causal-world-history.md`
- `docs/80-interface/UI-001_interaction-and-command-model.md`
- `docs/80-interface/UI-003_work-priority-taxonomy.md`
- `docs/80-interface/UI-004_qualitative-capability-presentation.md`
- `docs/80-interface/UI-005_top-down-simulation-workbench.md`
- `docs/80-interface/UI-006_contextual-place-interaction-and-teams.md`

### Arquitectura y decisiones

- `docs/90-architecture/ARC-002_procedural-generation-and-persistence.md`
- `docs/90-architecture/ARC-003_multiscale-simulation-principles.md`
- `docs/90-architecture/ARC-005_semantic-world-data-model.md`
- `docs/90-architecture/ARC-006_action-and-event-resolution-model.md`
- `docs/90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md`
- `docs/90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md`
- `docs/decisions/INDEX.md`
- `docs/decisions/DEC-0005_reproducible-lazy-generation.md`
- `docs/decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md`
- `docs/decisions/DEC-0008_simulation-first-web-architecture.md`
- `docs/decisions/DEC-0009_character-catalog-and-resolution-engine-domain.md`
- `docs/decisions/DEC-0010_procedural-local-and-regional-map-direction.md`
- `docs/decisions/DEC-0011_hybrid-resolution-engine-and-capability-presentation.md`
- `docs/discovery/INDEX.md`
- `docs/discovery/DISC-0004_local-regional-maps-and-contextual-actions-traceability.md`
- `docs/discovery/DISC-0005_resolution-engine-closure-traceability.md`

Antes de editar, crea para tu propio trabajo una matriz:

| Decisión del encargo | Fuente canónica destino | Documentos relacionados | Estado anterior | Estado final | Contradicciones o preguntas retiradas |
|---|---|---|---|---|---|

No es obligatorio publicar esa matriz separadamente si toda la trazabilidad queda recogida en el documento de discovery de esta entrega.

---

## 4. Filosofía del escenario

El primer escenario debe ser reconocible entre partidas sin convertirse en una campaña guionizada.

### 4.1 Elementos fijos

- Seis supervivientes adultos.
- Han huido juntos y llegan tras varios días a pie.
- Primera mitad de abril.
- Llegada a las `17:30` del Día 1.
- Aproximadamente seis semanas después del colapso general.
- Pueblo pequeño de montaña, ficticio y procedural.
- Grupo cansado, con recursos escasos y sin asentamiento.
- Refugio provisional cercano, pero no entregado como seguro ni definitivo.
- Dos horas aproximadas de luz útil por delante debido al valle y a la época.
- Amenaza zombi local baja, real y finita.
- Varias necesidades incompatibles con el tiempo y la capacidad disponibles.

### 4.2 Elementos procedurales

- Identidades, edades adultas, género, apariencia y biografías.
- Capacidades actuales, potenciales, adaptación y rasgos.
- Relaciones concretas y acontecimiento compartido reciente.
- Tiempo meteorológico dentro de la banda permitida.
- Geografía, edificios, estancias, ocupantes anteriores, contenido e historia.
- Posición del grupo y candidatos a refugio.
- Distribución exacta de zombis.
- Pertenencias variables y estado de conservación.
- Saqueo, señales humanas y comunidades regionales.

### 4.3 Elementos que no son fijos

- No existe una secuencia obligatoria de tareas.
- No existe una misión «haz A, después B y después C».
- No existe un líder predeterminado.
- No existe un refugio definitivo correcto.
- No existe una garantía de que los seis permanezcan juntos o sobrevivan.
- No existe una configuración fija de profesiones.
- No existe una pelea tutorial forzada.

El escenario define condiciones iniciales y restricciones del generador. La historia posterior emerge de las personas, el mundo, las decisiones y los eventos.

---

## 5. Tiempo, estación y estado del mundo

### 5.1 Momento exacto

Fija como canónico para este escenario:

```text
Momento de llegada respecto al colapso: aproximadamente seis semanas después del colapso general
Estación: inicio de primavera
Periodo: primera mitad de abril
Día de juego: Día 1
Hora de llegada: 17:30
Desplazamiento previo a pie: cuatro días
Luz útil restante: aproximadamente dos horas, condicionada por valle, relieve y tiempo
```

No fijes un año, una localidad real ni una fecha de calendario real. El perfil es ficticio.

### 5.2 Banda meteorológica inicial

El generador puede escoger dentro de una banda templada-fría de montaña:

- temperatura diurna aproximada `8–12 °C`;
- descenso nocturno aproximado hacia `2–5 °C`;
- suelo húmedo o lluvia reciente como estado habitual;
- variantes posibles: frío y seco, nubosidad, llovizna, niebla ligera o lluvia reciente.

No puede comenzar este escenario estándar con:

- tormenta extrema;
- nevada intensa;
- inundación súbita inevitable;
- temperatura letal inmediata;
- fenómeno capaz de convertir la primera decisión en irrelevante.

Estas situaciones podrán existir en configuraciones futuras, otros escenarios o eventos posteriores.

### 5.3 Estado temporal del colapso

Seis semanas deben reflejarse causalmente:

- redes y servicios degradados o caídos;
- parte de la comida fresca ya perdida;
- vehículos abandonados y rutas alteradas;
- saqueo desigual y espacialmente correlacionado;
- edificios cerrados, forzados, vacíos, ocupados o parcialmente utilizados;
- rastros humanos posteriores al colapso;
- todavía existen objetos y recursos urbanos relevantes;
- la transición completa a soluciones rurales todavía no está resuelta.

No conviertas «seis semanas» en una cronología universal rígida para todos los lugares: el estado concreto depende de la historia generada.

---

## 6. Los seis protagonistas: generación y calibre oculto

### 6.1 No son un elenco fijo

Los seis supervivientes iniciales no tienen nombres, profesiones, apariencia ni estadísticas fijas. Se generan proceduralmente mediante el modelo biográfico de personajes.

Son los protagonistas de esta partida, no seis supervivientes corrientes elegidos sin restricciones. El generador del escenario aplica una distribución mínima de calibre oculto deliberadamente alta.

### 6.2 Distribución mínima obligatoria de calibre

Interpreta las «estrellas de potencial» expresadas durante el diseño mediante el término canónico **calibre oculto** de `CHR-007`.

Para los seis integrantes:

| Plaza lógica | Calibre mínimo |
|---|---:|
| 1 protagonista | `5` estrellas (máximo del sistema) |
| 2 protagonistas adicionales | al menos `4` estrellas cada uno |
| 3 protagonistas restantes | al menos `3` estrellas cada uno |

Reglas obligatorias:

- La distribución mínima equivalente es `5 / 4+ / 4+ / 3+ / 3+ / 3+`.
- Cualquier plaza puede superar su mínimo.
- Los seis pueden resultar de `5` estrellas en una semilla válida.
- Ninguno de los seis puede quedar por debajo de `3` estrellas.
- Las plazas se barajan; no existe una posición visible que revele quién ocupa cada suelo.
- El calibre permanece totalmente oculto al jugador.
- Las estrellas no aparecen en la ficha, creación, selección, mensajes ni interfaz.
- Esta regla es específica del escenario protagonista y no altera la distribución global de la población mundial.
- No implica protección narrativa, inmunidad, obediencia, moral alta ni supervivencia garantizada.
- No concede bonificadores directos a acciones.
- No obliga a empezar con niveles actuales altos.
- Un personaje de calibre 5 puede empezar inexperto, herido, poco adaptado, con miedo, conflictos o conocimientos inútiles para la crisis inmediata.
- Calibre, potenciales concretos, velocidad de aprendizaje y adaptación al apocalipsis permanecen separados.

Actualiza `CHR-007` únicamente para registrar esta regla de generación de la cohorte inicial; no conviertas el escenario en la regla general de todos los supervivientes.

### 6.3 Cobertura funcional colectiva

El generador garantiza que el conjunto ofrece al menos:

1. Primeros auxilios básicos o capacidad sanitaria equivalente.
2. Experiencia práctica en alguna combinación de Obra, Mecánica, Electricidad, Carpintería, herramientas o reparación.
3. Alguna capacidad útil de Supervivencia, Orientación, Forrajeo o vida rural.
4. Capacidad de logística, transporte, cocina, almacenamiento o conducción.
5. Alguna aportación relevante de cuidado, enseñanza, Influencia, cohesión o gestión social.
6. Capacidad útil de Advertir, vigilancia, movimiento o respuesta inmediata ante peligro.

No asignes automáticamente una función a cada persona. Una puede cubrir varios bloques; otra puede no cubrir ninguno de los críticos al comienzo.

Restricciones de diversidad:

- al menos dos personas carecen de especialización crítica destacada en el presente;
- existe al menos una carencia avanzada relevante elegida proceduralmente, por ejemplo Medicina, Agricultura, Electricidad, Combate, Sistemas y Comunicaciones o construcción estructural;
- como máximo uno o dos comienzan como especialistas realmente sobresalientes en su campo;
- no se garantiza experiencia militar, policial ni con armas de fuego;
- todos poseen fortalezas, debilidades, estados, motivaciones y posibilidades de aprendizaje;
- las capacidades derivan de biografía, profesión, aficiones y experiencia, nunca de clases rígidas.

### 6.4 Adultos en este escenario

Los seis protagonistas del escenario inicial son adultos. Esto no elimina menores, familias o dependientes del mundo de Z-World: pueden aparecer mediante encuentros, comunidades y otros escenarios. Simplemente evita introducir en el primer minuto todas las reglas específicas de cuidados y trabajo de menores.

---

## 7. Red procedural de relaciones

La cohorte no debe ser seis desconocidos independientes ni seis amigos sin conflicto.

### 7.1 Restricciones del grafo inicial

Genera una red conectada que contenga, como mínimo:

- dos pares de relación previa al apocalipsis;
- al menos un vínculo fuerte positivo;
- al menos una relación nacida durante el desastre, por rescate, protección, dependencia o deuda;
- al menos una relación deteriorada por una decisión reciente;
- una persona incorporada durante los últimos días con confianza limitada;
- al menos una persona que confía o responde por ese recién llegado;
- ningún integrante completamente desconectado;
- ningún líder oficial impuesto por el escenario.

Las relaciones pueden ser asimétricas. A puede confiar en B más de lo que B confía en A. Gratitud, miedo, dependencia, culpa, afecto y resentimiento no se reducen a una única puntuación.

### 7.2 Tipos de relación previa

El generador puede utilizar, de manera coherente con edades y biografías:

- pareja sentimental;
- hermanos u otros familiares;
- amistades;
- vecinos;
- compañeros de trabajo;
- relación de cuidado;
- conocidos de una comunidad anterior.

No fuerces siempre una familia nuclear ni una composición equivalente.

### 7.3 Acontecimiento compartido reciente

La cohorte empieza con al menos un acontecimiento relevante vivido durante la huida. Ejemplos de familia, no catálogo cerrado:

- abandonaron a una persona;
- perdieron un vehículo;
- discutieron por suministros;
- alguien ocultó una herida o información;
- una elección de ruta salió mal;
- rescataron al recién llegado;
- huyeron de un refugio atacado;
- una decisión salvó a unos y perjudicó a otros.

El evento:

- debe dejar recuerdos e interpretaciones personales;
- puede producir confianza, deuda, culpa o resentimiento;
- no obliga a una pelea inmediata;
- no fija un arco narrativo futuro;
- no revela potenciales ocultos;
- queda integrado en la biografía dinámica de `CHR-004` y la memoria causal de `NAR-002`.

---

## 8. Llegada, refugio provisional y asentamiento

### 8.1 Punto de llegada

El grupo aparece en el borde operativo del mapa o en un acceso coherente con sus cuatro días de marcha. Conoce:

- su posición inmediata;
- el trayecto visible por el que llega;
- algunas siluetas o indicios cercanos;
- la existencia aparente de un edificio que podría servir esa noche.

No conoce automáticamente el pueblo, los interiores, los zombis, las fuentes de agua segura ni los mejores refugios.

### 8.2 Refugio provisional garantizado

Entre aproximadamente `100` y `250` metros del punto de llegada, el generador garantiza un edificio que **puede llegar a servir** como refugio provisional tras reconocimiento y trabajo razonables.

Puede ser una casa pequeña, cabaña, vivienda rural, local o edificio equivalente soportado por el catálogo. Debe cumplir causalmente:

- seco o parcialmente seco;
- al menos un acceso que pueda cerrarse o bloquearse;
- una salida secundaria posible o creable con trabajo razonable;
- espacio mínimo para que seis personas sobrevivan una noche;
- ninguna amenaza inevitable imposible de detectar o evitar;
- al menos una carencia significativa.

Carencias posibles:

- ventana rota;
- puerta débil;
- suciedad o humedad;
- mobiliario bloqueando;
- falta de camas;
- frío;
- poco almacenamiento;
- olor, rastro o señal inquietante;
- instalación inutilizada;
- interior parcialmente desconocido.

El edificio no se entrega como «seguro». Debe poder reconocerse, inspeccionarse, abrirse, limpiarse, cerrarse y organizarse mediante las reglas normales.

El jugador puede ignorarlo, dormir fuera, buscar otro o asumir más riesgo. La garantía asegura una opción razonable, no una obligación.

### 8.3 Candidatos a asentamiento

Durante los primeros uno a tres días pueden descubrirse entre tres y cinco candidatos con ventajas y costes diferentes, por ejemplo:

- casa grande;
- taller o nave pequeña;
- granja o vivienda periférica;
- edificio comunitario;
- edificio elevado o bien situado.

Ninguno es universalmente mejor. Evalúa:

- superficie y distribución;
- accesos;
- visibilidad y retirada;
- cercanía al agua;
- terreno productivo;
- almacenamiento;
- talleres e instalaciones;
- confort;
- saneamiento;
- perímetro;
- daños;
- amenazas y desconocimiento;
- coste de traslado y adaptación.

El grupo puede permanecer indefinidamente en el refugio provisional si decide transformarlo. No impongas una misión de mudanza.

---

## 9. Edificios formados por estancias funcionales

Esta decisión es transversal y debe quedar reconciliada con `WLD-005`, `CAT-002`, `SET-001` y `SET-007`.

### 9.1 Regla central

> Cualquier edificio del escenario, incluido el refugio provisional, se genera como una composición coherente de estancias, accesos, instalaciones y sistemas; no como un bloque indivisible ni como una excepción diseñada a mano para el inicio.

Cadena semántica:

```text
tipo e historia del edificio
→ programa de estancias
→ grafo de accesos y adyacencias
→ uso original de cada estancia
→ instalaciones y mobiliario
→ estado actual y ocupación
→ funciones posibles para la comunidad
→ adaptación, mantenimiento o transformación
```

### 9.2 Información funcional de una estancia

Cada estancia debe poder representar conceptualmente:

- identidad o descripción conocida;
- función original;
- tamaño y geometría útil;
- accesos, ventanas y conexión con otras estancias;
- condición estructural y ambiental;
- luz, ventilación, temperatura y humedad cuando importen;
- instalaciones;
- mobiliario y objetos;
- capacidad de almacenamiento;
- privacidad y ruido;
- higiene y riesgo;
- facilidad de vigilancia o defensa;
- funciones actuales posibles;
- trabajos necesarios para acondicionarla;
- información conocida y todavía oculta.

No conviertas todos estos campos en interfaz obligatoria ni en un esquema técnico dentro de esta entrega.

### 9.3 Funciones y adaptación

Una estancia puede ser adecuada o adaptable para:

- dormir;
- almacenar;
- cocinar;
- comer o reunirse;
- atender heridos;
- higiene y saneamiento;
- taller;
- estudio o conocimiento;
- vigilancia;
- cuarentena;
- producción;
- cuidado de animales;
- otros usos coherentes.

La etiqueta no concede mágicamente la función. Una habitación puede servir para dormir porque tiene espacio, protección y condiciones; un garaje puede convertirse en dormitorio, pero requerir limpieza, aislamiento y mobiliario.

La adaptación:

- consume trabajo y materiales;
- puede conservar o destruir usos anteriores;
- no borra instalaciones ni daños;
- puede ser provisional o permanente;
- queda reflejada en el mundo persistente;
- puede afectar habitabilidad, circulación, privacidad, defensa y productividad.

### 9.4 Conocimiento y aseguramiento parcial

Entrar en un edificio no revela todas sus estancias. Un grupo puede:

- conocer el exterior;
- revisar un acceso;
- asegurar una habitación;
- utilizar una parte;
- mantener otras zonas cerradas o desconocidas;
- reclamar progresivamente el edificio.

No es necesario asegurar completamente un edificio enorme para descansar en una zona realmente inspeccionada, pero las zonas no revisadas conservan incertidumbre y riesgo.

### 9.5 Garantía sin edificio artificial

El generador no fabrica una «starter house» incoherentemente perfecta. Genera el mundo normalmente y valida que, dadas las personas, distancias, accesos y condiciones, exista al menos un edificio real que cumpla el contrato de refugio provisional.

Si una semilla no lo cumple, se corrige o regenera antes de iniciar la partida; no se teletransportan recursos ni se cambia el contenido después de que el mundo exista.

---

## 10. Perfil numérico del mapa local inicial

### 10.1 Extensión y forma

El mapa ocupa una huella funcional irregular contenida aproximadamente en:

```text
3 km × 3 km
```

No se muestra como un cuadrado artificial. Relieve, bosque, cauces, carreteras y zonas inaccesibles forman límites naturales.

Referencias temporales:

- cruzar de extremo a extremo por una ruta favorable: aproximadamente `45–60` minutos simulados;
- ruta montañosa, cargada o degradada: puede superar `90` minutos;
- los trayectos de horas o días fuera de este espacio pertenecen al futuro mapa regional.

### 10.2 Presupuesto de construcciones

El escenario genera entre `55` y `85` construcciones, incluyendo:

| Familia | Rango orientativo |
|---|---:|
| Viviendas | 28–42 |
| Garajes, cobertizos, graneros y anexos | 10–18 |
| Lugares comerciales, comunitarios o técnicos | 6–10 |
| Construcciones rurales o aisladas | 4–8 |
| Construcciones colapsadas o parcialmente inutilizables | 3–7 |

Las categorías pueden solaparse conceptualmente si un edificio cumple varias funciones, pero el total no se cuenta dos veces.

No todos los interiores permanecen activos simultáneamente. Conserva la generación diferida reproducible y la realidad semántica previa a la representación.

### 10.3 Red viaria

- una carretera principal que atraviesa o bordea el asentamiento;
- entre dos y cuatro calles secundarias;
- entre cinco y nueve caminos rurales, senderos o pistas;
- uno o dos accesos regionales bloqueados, peligrosos o inicialmente desconocidos;
- al menos una ruta alternativa descubrible.

### 10.4 Agua

Toda semilla válida contiene:

- una fuente natural principal: arroyo, río pequeño, manantial o equivalente;
- entre una y tres fuentes secundarias: pozo, cisterna, depósito, estanque, instalación doméstica o captación;
- al menos dos rutas potenciales distintas para resolver el abastecimiento inicial.

Encontrar agua no garantiza que sea potable, accesible, sostenible ni comprendida. Inspección, recipientes, tratamiento, reparación o conducción pueden seguir siendo necesarios.

### 10.5 Cobertura del terreno

Rangos del perfil:

| Terreno | Cobertura orientativa |
|---|---:|
| Bosque y matorral | 35–55 % |
| Campos, prados y espacios abiertos | 15–30 % |
| Núcleo construido, carreteras y parcelas | 8–15 % |
| Pendientes, roca, agua y terreno difícil | Resto coherente |

No exijas que todas las semillas sumen mediante una elección independiente de porcentajes; el generador debe producir una geografía causal dentro de estas bandas.

### 10.6 Puntos de interés

Genera entre `12` y `18` lugares significativos. Familias posibles:

- comercio alimentario;
- taller;
- punto de agua;
- edificio comunitario;
- recurso sanitario;
- explotación agrícola o ganadera;
- instalación eléctrica o de comunicaciones;
- edificio parcialmente colapsado;
- vehículo o bloqueo;
- lugar con historia del colapso;
- refugio anterior;
- zona con señales humanas o zombis.

Al llegar, la comunidad solo conoce entre tres y seis siluetas, accesos o indicios. Ver un campanario, una nave o humo no revela su interior ni su estado real.

### 10.7 Relación con CAT-004

No interpretes estas cifras como aprobación automática de `CAT-004` para la primera implementación.

- Este escenario describe el mundo funcional máximo.
- `CAT-004` continúa siendo una propuesta de subconjunto técnico inicial hasta que Dennis lo apruebe expresamente para programación.
- Un mapa de 55–85 construcciones puede reutilizar arquetipos y variaciones semánticas sin exigir 55–85 clases de edificio.
- No marques todos los lugares como implementados ni amplíes `RDM-003`.

---

## 11. Amenaza zombi inicial contenida y limpiable

### 11.1 Presupuesto inicial

La población zombi inicial real del mapa local se sitúa entre:

```text
12–30 zombis
```

El grupo y el jugador no conocen la cifra.

Distribución:

- entre cero y dos en la cercanía operativa de llegada;
- mayoría aislada o en grupos de dos o tres;
- parte atrapada, inmóvil, dormida o encerrada en interiores;
- posibles concentraciones evitables de cuatro a seis en un lugar coherente;
- ninguna horda inicial en el mapa;
- ninguna concentración inevitable bloqueando el único refugio o agua viable.

### 11.2 Fácil de limpiar no significa inocuo

La amenaza inicial debe ser suficientemente baja para que el mapa pueda limpiarse progresivamente durante la fase inicial si el grupo actúa bien.

Esto implica:

- población local inicial finita;
- zombis eliminados no reaparecen por respawn;
- encuentros pequeños y comprensibles;
- posibilidad de evitar, atraer, aislar, contener o eliminar;
- ninguna escalada automática porque el jugador todavía no haya desbloqueado combate avanzado.

No implica:

- que todos los combates sean seguros;
- que cualquier persona pueda luchar bien;
- que el mapa quede permanentemente inmune;
- que no puedan llegar zombis desde fuera por migración, ruido, expediciones o eventos sistémicos futuros;
- que limpiar equivalga a controlar, conocer o vigilar todo el territorio.

### 11.3 Comienzo sin combate forzado

La llegada garantiza indicios de amenaza, no una pelea:

- manchas o restos;
- puertas o ventanas forzadas;
- vehículo abandonado;
- ruido distante;
- huellas;
- figura lejana o indicio equivalente.

Una entrada imprudente, ruido, luz, fuego o exploración puede desencadenar el primer encuentro. Un grupo prudente puede pasar la primera noche sin combatir.

Conserva el zombi estándar lento definido en `THR-001`; no cierres aquí infección, variantes o dificultad configurable más allá del contrato inicial.

---

## 12. Estado físico inicial

Los cuatro días de marcha tienen consecuencias reales:

- todos presentan cansancio significativo;
- hambre y sed moderadas;
- al menos una persona tiene una afección menor, como ampollas, corte, torcedura leve, resfriado, dolor o agotamiento;
- otra está especialmente fatigada, mojada, fría o afectada emocionalmente;
- nadie empieza condenado a morir en pocas horas por una condición generada inevitablemente;
- el estado reduce disponibilidad, ritmo o disposición de manera pertinente;
- las relaciones pueden afectar quién acepta separarse, vigilar o entrar primero.

No fijes quién sufre cada estado: debe derivarse de biografía, trayecto y semilla.

---

## 13. Pertenencias, armas y carencias

### 13.1 Presupuesto garantizado del grupo

El conjunto llega con:

- recipientes con capacidad total para `8–12` litros;
- entre `5` y `8` litros de agua disponible;
- aproximadamente seis comidas individuales sencillas;
- al menos un medio de encendido;
- al menos un utensilio de corte;
- una fuente de luz con energía limitada;
- material básico de primeros auxilios;
- una olla o recipiente válido para calentar agua;
- mochilas o bolsas para la mayor parte del grupo;
- ropa normal de primavera, desigual y no siempre suficiente para la noche fría.

La distribución entre personas es física y localizada; no existe un inventario global abstracto que teletransporte las pertenencias.

### 13.2 Arma cuerpo a cuerpo para cada protagonista

Cada uno de los seis porta al llegar al menos un objeto utilizable como arma cuerpo a cuerpo o improvisada.

Ejemplos permitidos según biografía y huida:

- cuchillo;
- martillo;
- palanca;
- hacha pequeña;
- llave pesada;
- tubo;
- bate o palo resistente;
- herramienta agrícola;
- lanza improvisada;
- objeto equivalente coherente.

Reglas:

- No tienen por qué ser armas fabricadas expresamente.
- Una herramienta puede conservar funciones de trabajo además de combate.
- Cada objeto tiene identidad, ubicación, condición, peso, utilidad y desgaste.
- Poseer un arma no concede habilidad para usarla.
- No garantiza que la persona acepte combatir.
- La calidad y estado pueden variar.
- Ninguna arma es invulnerable o infinitamente eficaz.
- No se garantiza arma de fuego.
- Una semilla puede incluir un arma de fuego como pertenencia variable coherente, pero la munición es escasa y no se convierte en requisito del escenario.

### 13.3 Pertenencias variables

Según las personas y la ruta de huida pueden aparecer:

- cuerda;
- lona;
- radio;
- mapa;
- cinta adhesiva;
- herramientas;
- medicación personal;
- mantas;
- batería externa;
- prismáticos;
- hornillo;
- semillas;
- recuerdos y objetos personales;
- arma de fuego o munición limitada.

No generes objetos por balance sin justificar quién los llevaba y por qué.

### 13.4 Carencias obligatorias

Al llegar carecen de:

- agua suficiente para el día siguiente;
- comida sostenible para varios días;
- camas asignadas para todos;
- almacén comunitario;
- electricidad fiable;
- fuente de calor garantizada;
- defensas preparadas;
- conocimiento completo del refugio;
- ruta de evacuación preparada;
- producción renovable;
- información suficiente sobre el pueblo.

El refugio puede contener soluciones parciales, pero deben descubrirse y ponerse en uso mediante acciones normales.

---

## 14. Garantías de una semilla válida

La dificultad debe proceder del mundo y las decisiones, no de una semilla incapaz de sostener el escenario prometido.

El generador debe validar, antes del inicio, que existe:

1. Un refugio provisional razonable dentro de la distancia definida.
2. Al menos dos rutas potenciales de agua.
3. Al menos una fuente de alimento de corto plazo accesible durante el primer día completo.
4. Algún método básico para asegurar parcialmente un acceso.
5. Materiales u objetos con los que crear almacenamiento inicial.
6. Una salida practicable del área de llegada.
7. Una zona donde descansar sin exposición inmediata inevitable.
8. Ninguna amenaza imposible de detectar y evitar antes de la primera decisión.
9. Al menos una secuencia de acciones viable con las capacidades reales de los seis protagonistas generados.

### 14.1 Garantía no equivale a información gratuita

- El agua puede necesitar tratamiento.
- La comida puede estar oculta, disputada o deteriorada.
- El refugio puede requerir inspección y trabajo.
- La herramienta útil puede tener que localizarse.
- La ruta puede ser arriesgada.
- Los personajes no reciben conocimiento omnisciente de estas soluciones.

### 14.2 Validación causal

La validación comprueba el mundo generado y las capacidades de la cohorte. No añade objetos después de empezar, no altera botín al observarlo y no elimina amenazas retroactivamente.

Si una semilla incumple el contrato:

- se corrige dentro de la fase de generación previa cuando el modelo lo permita;
- o se descarta y regenera de forma determinista;
- nunca se parchea ante los ojos del jugador.

Documenta el comportamiento conceptual, no su algoritmo.

---

## 15. Otras personas y comunidades

### 15.1 Mapa local

- No existe otra comunidad asentada obligatoriamente.
- Puede existir una persona aislada o un grupo pequeño si la semilla y la historia lo justifican.
- No se fuerza un encuentro humano durante las primeras `48` horas.
- Siempre existen señales humanas posteriores al colapso, pero su autor y actualidad pueden ser inciertos.

### 15.2 Horizonte regional

- Pueden existir entre cero y dos comunidades a uno o varios días de viaje regional.
- El grupo inicial desconoce su existencia, estado e intención.
- Esta regla alimenta el mundo futuro; no abre la implementación del mapa regional ni amplía `RDM-003`.

### 15.3 Saqueo e historia

El saqueo y las señales pueden proceder de:

- habitantes anteriores;
- transeúntes;
- una comunidad cercana;
- grupos ya desaparecidos;
- individuos aislados;
- acontecimientos anteriores a la llegada.

Conserva la correlación espacial de `WLD-006`: si un lugar accesible fue saqueado, los lugares cercanos o situados en la misma ruta tienen mayor probabilidad de haber sufrido la misma presión.

---

## 16. Identidad jugable de las primeras horas

La documentación debe transmitir esta situación sin convertirla en guion:

> Seis personas agotadas llegan a las 17:30 a un valle frío y silencioso. Ven un edificio que podría servir esa noche, algunas construcciones entre árboles y señales de actividad posterior al colapso. Tienen poca agua, aproximadamente una comida por persona, armas improvisadas y dos horas de luz. No saben si el pueblo está vacío, si el agua es segura ni si el edificio tiene otra salida. Pueden actuar en varios frentes, pero no resolverlo todo.

Presiones simultáneas posibles:

- evaluar al grupo;
- reconocer el refugio provisional;
- atender una afección;
- conseguir agua;
- preparar descanso;
- organizar pertenencias;
- cerrar accesos;
- reconocer rutas y amenazas;
- decidir si separarse;
- establecer vigilancia o retirada.

No fijes un orden óptimo ni una lista de objetivos obligatorios. Las necesidades, información y circunstancias generan trabajos; el jugador establece prioridades.

La cantidad efectiva de trabajo antes de la noche es inferior a «seis personas durante dos horas» por cansancio, desplazamientos, atención, relaciones, preparación y posibles bloqueos.

El éxito de la primera noche no es una pantalla de victoria. El fracaso parcial tampoco implica automáticamente game over: dormir mal, consumir más agua, dejar un acceso débil o posponer una inspección debe generar consecuencias persistentes.

---

## 17. Organización documental requerida

No cargues todas las reglas en un único documento. Usa la siguiente distribución si los identificadores continúan libres; si `main` ya los ocupa, utiliza los siguientes disponibles y actualiza enlaces.

### 17.1 Entrada general del escenario

Actualiza:

```text
docs/scenarios/SCN-001_mountain-village-arrival.md
```

Debe quedar como punto de entrada y síntesis del escenario, enlazando las fuentes detalladas sin duplicarlas completas.

### 17.2 Cohorte protagonista

Crea:

```text
docs/scenarios/SCN-002_initial-survivor-cohort.md
```

Responsabilidad canónica:

- seis adultos procedurales;
- distribución mínima de calibre;
- cobertura funcional;
- carencias;
- red de relaciones;
- acontecimiento compartido;
- prohibición de convertirlos en clases o personajes fijos.

### 17.3 Estado de llegada y primera noche

Crea:

```text
docs/scenarios/SCN-003_first-day-starting-state.md
```

Responsabilidad canónica:

- tiempo y meteorología;
- cuatro días de marcha;
- estado físico;
- pertenencias y armas;
- refugio provisional;
- carencias;
- garantías de semilla;
- amenaza inicial;
- presencia humana incierta;
- presiones de las primeras horas.

### 17.4 Perfil numérico espacial

Crea:

```text
docs/20-world/WLD-009_initial-mountain-village-profile.md
```

Responsabilidad canónica:

- huella aproximada `3 × 3 km`;
- presupuestos de construcciones;
- carreteras y caminos;
- cobertura de terreno;
- agua;
- puntos de interés;
- visibilidad inicial;
- tiempos de cruce;
- relación con `WLD-008` y `CAT-004`.

### 17.5 Decisión transversal

Crea, si está libre:

```text
docs/decisions/DEC-0012_first-arrival-scenario-contract.md
```

Debe registrar por qué el escenario combina una situación fija, personas y mundo procedurales, una cohorte de calibre alto, garantías de semilla y ausencia de guion lineal.

### 17.6 Trazabilidad

Crea, si está libre:

```text
docs/discovery/DISC-0006_first-arrival-scenario-traceability.md
```

Debe distinguir:

- decisiones cerradas;
- elementos procedurales;
- invariantes;
- cifras de presupuesto;
- ejemplos no normativos;
- opciones descartadas;
- relaciones con entregas anteriores;
- preguntas que permanecen abiertas fuera de este alcance.

---

## 18. Documentos relacionados que deben reconciliarse

Actualiza solo donde exista una responsabilidad real, evitando duplicación:

- `CHR-007`: regla de calibre específica de la cohorte inicial.
- `CHR-004`: acontecimiento compartido y biografía inicial cuando proceda.
- `WLD-005`: principio de edificios generados por programas de estancias, si necesita aclaración.
- `CAT-002`: estancia, uso original, funciones posibles y adaptación.
- `SET-001`: refugio provisional frente a asentamiento y ocupación progresiva.
- `SET-003`: pertenencias iniciales localizadas y ausencia de almacén global.
- `THR-001`: presupuesto del escenario como aplicación, sin convertirlo en regla universal.
- `WLD-006`: señales humanas y saqueo correlacionado.
- `ARC-002`: validación/rechazo determinista de semillas inválidas.
- `UI-006`: conocimiento progresivo y aseguramiento parcial de edificios, solo si falta la conexión.
- `SOC-003`: comunidades regionales posibles sin abrir el mapa regional.
- `RDM-003`: únicamente enlaces o aclaraciones necesarias; no añadas una entrega de implementación nueva.
- `CAT-004`: aclara que este diseño no constituye su aprobación técnica.

No copies tablas enteras entre documentos. La fuente canónica contiene el detalle; las demás enlazan y explican su relación.

---

## 19. Estados documentales

- `SCN-001` permanece `approved` y deja de contener sus preguntas abiertas sobre estación, cohorte, refugio, dimensiones, amenaza, recursos y comunidades.
- `SCN-002`, `SCN-003`, `WLD-009` y `DEC-0012` deben quedar `approved` si reflejan íntegramente este contrato.
- `DISC-0006` queda `draft` como trazabilidad y registro de exploración.
- `CAT-004` permanece `draft`.
- `CHR-007` conserva el estado que corresponda tras `DESIGN-006`; esta entrega no cierra distribución global de calibre, adaptación, campos de potencial ni rasgos.
- Ningún documento pasa a `implemented`.
- Los prototipos Godot continúan como historia y no se reactivan.

---

## 20. Preguntas que esta entrega sí cierra

Retira de `docs/OPEN-QUESTIONS.md`, `SCN-001` y cualquier duplicado activo las preguntas sobre:

- estación y hora exactas;
- momento relativo del apocalipsis;
- tamaño y composición conceptual de la cohorte;
- distribución mínima de calibre de los seis;
- estructura de relaciones iniciales;
- edificio provisional y grado de elección;
- tamaño y presupuesto del mapa local inicial;
- rango de construcciones;
- agua, bosque, carreteras y puntos de interés;
- población zombi inicial;
- facilidad relativa para limpiar la amenaza local;
- armas cuerpo a cuerpo iniciales;
- agua, comida, descanso, almacenamiento, herramientas y electricidad iniciales;
- garantías mínimas de una semilla válida;
- presencia posible de otras comunidades.

Conserva abiertas, cuando correspondan a otros sistemas:

- algoritmos geométricos exactos;
- combate detallado;
- infección y variantes de zombis;
- equilibrio final de necesidades;
- interfaz gráfica concreta;
- distribución global de calibre en el mundo;
- catálogo completo de estancias, objetos, armas y profesiones;
- implementación del mapa regional;
- configuración avanzada de otros escenarios;
- subconjunto técnico exacto de `CAT-004` para una implementación futura.

---

## 21. Opciones e interpretaciones descartadas

No deben reaparecer como reglas vigentes:

- seis personajes fijos con nombres y estadísticas invariables;
- seis supervivientes generados sin ninguna garantía de composición;
- protagonistas por debajo de calibre 3;
- estrellas visibles;
- calibre convertido en bonificación directa;
- niveles actuales altos garantizados por potencial alto;
- protección narrativa o imposibilidad de muerte;
- líder inicial obligatorio;
- seis amigos sin tensiones;
- seis desconocidos sin vínculos;
- refugio perfecto entregado como seguro;
- refugio definitivo elegido antes de explorar;
- edificio tratado como bloque indivisible;
- estancia que obtiene funciones solo al cambiarle el nombre;
- mapa cuadrado visible o gran ciudad accidental;
- agua segura garantizada sin inspección;
- horda inicial;
- respawn de zombis limpiados;
- combate tutorial obligatorio;
- arma de fuego garantizada;
- personaje sin ningún arma cuerpo a cuerpo o improvisada tras cuatro días de huida;
- inventario global sin ubicación;
- semilla imposible parcheada después de comenzar;
- comunidad aliada o enemiga forzada durante las primeras 48 horas;
- secuencia lineal de objetivos;
- aprobación automática de `CAT-004`;
- reactivación del roadmap de Godot.

---

## 22. Casos de validación documental obligatorios

La documentación final debe responder sin contradicción al menos a estos casos:

1. Los seis personajes de una semilla son de calibre `5/5/5/5/5/5`; es válido y las estrellas siguen ocultas.
2. Otra semilla produce `5/4/4/3/3/3`; cumple el mínimo.
3. Ninguna semilla válida produce un protagonista de calibre 1 o 2.
4. El personaje de calibre 5 empieza con Mecánica 0; sigue siendo válido porque calibre, nivel actual y conocimiento son distintos.
5. Un personaje de calibre 3 es el más útil esa noche por su experiencia actual.
6. Los seis tienen perfiles procedurales y el grupo cubre las capacidades mínimas sin asignar una clase a cada uno.
7. El grupo conserva una carencia avanzada relevante.
8. Dos personajes tienen vínculo previo, existe un recién llegado y el grafo completo permanece conectado.
9. Una deuda de vida no obliga a amistad ni obediencia permanente.
10. Llegan el Día 1 a las 17:30 con aproximadamente dos horas de luz útil.
11. Una variante meteorológica fría y húmeda sigue dentro del escenario; una nevada letal inicial no.
12. El refugio provisional es una cabaña; en otra semilla es un local, sin usar una excepción hecha a mano.
13. Un edificio grande puede asegurarse y utilizarse parcialmente por estancias.
14. Un garaje puede adaptarse para dormir, pero requiere trabajo y no se transforma solo por asignarle el uso.
15. El jugador puede quedarse en el refugio provisional en vez de mudarse.
16. El mapa contiene 55–85 construcciones dentro de un territorio funcional aproximado de 3 × 3 km.
17. La semilla contiene dos rutas de agua, pero ninguna se revela como potable sin fundamento.
18. Solo tres a seis indicios o siluetas son conocidos al llegar aunque existan 12–18 puntos de interés.
19. Existen 12–30 zombis, pero solo cero a dos están cerca de la llegada.
20. La población local puede limpiarse y no reaparece por respawn.
21. Más tarde pueden llegar zombis desde fuera por causas del mundo sin contradecir la limpieza previa.
22. El grupo pasa la primera noche sin combatir porque actuó con prudencia; es válido.
23. Otro grupo provoca un encuentro temprano mediante ruido; también es válido.
24. Cada protagonista posee un arma cuerpo a cuerpo o improvisada real, pero algunos carecen de habilidad de combate.
25. Un martillo conserva utilidad de herramienta y arma, condición y desgaste.
26. No existe arma de fuego en una semilla; sigue siendo válida.
27. El grupo dispone de 5–8 litros de agua y seis comidas, pero carece de suministro sostenible.
28. Las pertenencias siguen en mochilas y manos hasta crear un almacén.
29. Una semilla sin refugio viable o sin ruta de agua accesible se rechaza antes de comenzar.
30. La validación de semilla no informa al jugador de dónde está la solución.
31. No hay comunidad local, pero sí señales humanas ambiguas.
32. Existen cero comunidades regionales en una partida y dos en otra; ambas son válidas.
33. Las primeras horas ofrecen más necesidades que capacidad, pero no presentan una misión lineal.
34. Perder tiempo o tomar malas decisiones genera consecuencias persistentes sin imponer game over automático.
35. `CAT-004` continúa `draft` y nada se declara implementado.

Añade cualquier caso necesario para cubrir IDs, estados, enlaces, generación por estancias, calibre oculto y separación entre escenario máximo e implementación inicial.

---

## 23. Actualizaciones de gobierno e índices

Actualiza como mínimo:

- `docs/STATUS.md`;
- `docs/OPEN-QUESTIONS.md`;
- `docs/INDEX.md` cuando corresponda;
- `docs/scenarios/INDEX.md`;
- `docs/20-world/INDEX.md`;
- índices de personajes, asentamiento, amenazas, decisiones y discovery cuando cambien sus documentos;
- `docs/decisions/INDEX.md`;
- `docs/discovery/INDEX.md`;
- `docs/00-governance/GLOSSARY.md` si introduces términos canónicos;
- `CHANGELOG.md` según las reglas del repositorio;
- `prompts/INDEX.md` y, si corresponde, `prompts/README.md`.

En `STATUS.md` registra `DESIGN-007` como entrega exclusivamente documental. Resume:

- escenario temporal concreto;
- cohorte protagonista procedural y su distribución mínima de calibre;
- red relacional;
- refugio por estancias;
- presupuesto del mapa;
- amenaza inicial;
- pertenencias y carencias;
- validación de semillas;
- comunidades inciertas.

Indica expresamente que no se ha implementado generación, personajes, mapa, inventario, zombis ni escenario web.

---

## 24. Validación final

Antes de terminar:

1. Revisa que `DESIGN-006` estuviera realmente fusionado antes de crear la rama.
2. Confirma que el escenario no contradice escala, potencial ni presentación de `DESIGN-006`.
3. Revisa todas las cifras y rangos de este encargo.
4. Verifica que calibre alto no se haya convertido en nivel actual, bonificación o protección narrativa.
5. Verifica que las estrellas no sean visibles.
6. Busca referencias activas a seis personajes fijos, estación abierta, refugio indefinido, dimensiones abiertas o amenaza inicial sin concretar.
7. Verifica que todos los edificios del escenario dependan del modelo de estancias.
8. Verifica que el mapa de 3 × 3 km no se interprete como cuadrado visual obligatorio.
9. Verifica que los zombis iniciales sean finitos y que no exista respawn.
10. Verifica que cada protagonista tenga un arma cuerpo a cuerpo o improvisada.
11. Verifica que `CAT-004` siga `draft`.
12. Verifica que `RDM-003` no haya sido ampliado silenciosamente.
13. Verifica que no se haya modificado código ni configuración ejecutable.
14. Comprueba front matter, IDs, estados, `depends_on` y `related`.
15. Comprueba enlaces relativos e índices.
16. Ejecuta `git diff --check`.

No instales dependencias ni ejecutes suites de código.

---

## 25. Informe final obligatorio

El informe final de Claude Code debe incluir:

1. Confirmación de que `DESIGN-006` estaba fusionado en `main` antes de comenzar.
2. Rama creada y commit.
3. URL o referencia de la PR, confirmando que no se fusionó.
4. Documentos nuevos.
5. Documentos modificados.
6. Resumen de todas las decisiones cerradas.
7. Distribución mínima de calibre aplicada y confirmación de que permanece oculta.
8. Explicación de cómo se documentó edificio → estancias → funciones → adaptación.
9. Presupuestos de mapa, amenaza y recursos registrados.
10. Preguntas retiradas y cuestiones que permanecen abiertas.
11. Estados documentales resultantes.
12. Confirmación de que `CAT-004` continúa `draft`.
13. Confirmación de que no se implementó código.
14. Resultado de búsqueda de contradicciones, enlaces y `git diff --check`.

No declares la entrega completada si falta alguna decisión de este prompt, si el escenario continúa genérico, si se ha mezclado con `DESIGN-006`, si se ha aprobado alcance de implementación no autorizado o si la PR no ha sido creada.
