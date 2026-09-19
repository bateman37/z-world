# Z-World — DESIGN-004: reinicio centrado en simulación y generador semántico de lugares

## 1. Identificador y naturaleza de la entrega

Esta es una entrega **exclusivamente documental**. Su identificador es
`DESIGN-004`.

Debe formalizar simultáneamente, sin programar:

1. el cambio de la línea técnica activa desde el prototipo 3D en Godot hacia
   un laboratorio de simulación web centrado en mecánicas;
2. el modelo de reloj continuo, trabajo por fases y representación funcional
   del estado de cada persona;
3. el mapa local 2D cenital sencillo, con niebla y exploración progresiva;
4. el generador procedural semántico de lugares y edificios;
5. el catálogo máximo de lugares, estancias, instalaciones, ocupantes,
   profesiones, aficiones y modificadores;
6. la presión histórica de saqueo, los corredores de saqueo, las bolsas
   olvidadas, el descubrimiento dependiente de la persona y las distintas
   vidas útiles de un edificio.

No escribas código de aplicación, scripts, migraciones, esquemas ejecutables,
pruebas de código ni configuración del nuevo stack. Esta entrega decide y
organiza; una entrega posterior inicializará la nueva aplicación.

Toda la prosa dirigida a personas, incluidas fuentes canónicas, índices,
changelog, README, informe y descripción de PR, se redacta en español. Código,
IDs, rutas, claves y nombres oficiales de tecnologías conservan su forma
técnica.

Guarda una copia **literal e íntegra** de este encargo en:

```text
prompts/DESIGN-004_simulation-first-reboot-and-procedural-places.md
```

Regístralo en `prompts/INDEX.md`. No reescribas el prompt después para hacerlo
coincidir con el resultado final: debe permanecer como contrato histórico.

## 2. Situación de partida y seguridad del trabajo

**Corrección respecto a la redacción original de este encargo:**
`IMPLEMENTATION-004` fue completada técnicamente en una rama/PR, pero no fue
aceptada manualmente ni adoptada como parte de la línea activa antes del
cambio de arquitectura: existe como rama `claude/docs-foundation-setup-94xtnn`
y PR #10 («IMPLEMENTATION-004: Defensa y vida propia»,
https://github.com/bateman37/z-world/pull/10) abierto y sin fusionar en
`main`. No debe continuarse, redirigirse ni fusionarse como parte de esta
entrega documental. No mezcles sus cambios, no los borres, no los termines y
no uses esa rama como base de esta entrega; su rama y su PR se conservan
intactos como referencia histórica del prototipo Godot.

Antes de modificar documentación:

1. Lee `AGENTS.md` y `CLAUDE.md`.
2. Ejecuta `git status --short` e identifica la rama actual.
3. Ejecuta `git fetch origin`.
4. Trabaja desde un `origin/main` actualizado y limpio.
5. Si el árbol actual contiene trabajo parcial de `IMPLEMENTATION-004`, crea
   un **worktree limpio y separado** o un entorno equivalente desde
   `origin/main`; no uses comandos destructivos para limpiar el árbol
   existente.
6. Crea una rama exclusiva llamada, si está disponible:

   ```text
   docs/simulation-first-procedural-places
   ```

7. Si el nombre ya existe, usa un sufijo claro, sin reutilizar una rama
   anterior.

No modifiques ni elimines el código Godot existente. Se conserva como
prototipo histórico y como aprendizaje técnico, aunque deje de ser la línea
activa de desarrollo.

## 3. Lecturas obligatorias y límite de contexto

Lee en este orden, sin abrir todo `docs/` por defecto:

1. `AGENTS.md`, `CLAUDE.md`, `docs/INDEX.md`, `docs/STATUS.md`,
   `docs/OPEN-QUESTIONS.md` y `prompts/README.md`.
2. `docs/00-governance/DOC-001_documentation-system.md` y los índices de los
   dominios que vayas a modificar.
3. `docs/10-vision/VIS-001_game-vision.md`,
   `docs/10-vision/VIS-002_design-pillars.md` y
   `docs/10-vision/VIS-003_maximum-design-envelope.md`.
4. `docs/20-world/WLD-001_world-scales.md`,
   `docs/20-world/WLD-002_local-exploration-and-information.md`,
   `docs/20-world/WLD-003_strategic-world-and-regional-simulation.md` y
   `docs/20-world/WLD-004_expertise-dependent-recovery.md`.
5. `docs/30-characters/CHR-001_character-model.md`,
   `docs/30-characters/CHR-002_knowledge-and-learning.md` y
   `docs/30-characters/CHR-003_autonomy-intentions-and-behavior.md`.
6. `docs/40-settlement/SET-001_settlement-growth.md`,
   `docs/40-settlement/SET-003_resources-logistics-and-condition.md`,
   `docs/40-settlement/SET-005_production-web-and-infrastructure.md` y
   `docs/40-settlement/SET-006_knowledge-assets-and-capability.md`.
7. `docs/70-narrative/NAR-001_emergent-narrative.md` y
   `docs/70-narrative/NAR-002_memory-and-causal-world-history.md`.
8. `docs/80-interface/UI-001_interaction-and-command-model.md`,
   `docs/80-interface/UI-002_management-at-community-scale.md`,
   `docs/80-interface/UI-003_work-priority-taxonomy.md` y
   `docs/80-interface/UI-004_qualitative-capability-presentation.md`.
9. `docs/90-architecture/ARC-001_technical-direction.md`,
   `docs/90-architecture/ARC-002_procedural-generation-and-persistence.md` y
   `docs/90-architecture/ARC-003_multiscale-simulation-principles.md`.
10. `docs/decisions/DEC-0001_godot-4.md`,
    `docs/decisions/DEC-0002_two-world-scales.md`,
    `docs/decisions/DEC-0003_data-driven-design.md`,
    `docs/decisions/DEC-0004_mouse-strategic-control.md`,
    `docs/decisions/DEC-0005_reproducible-lazy-generation.md`,
    `docs/decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md` y
    `docs/decisions/DEC-0007_layered-work-and-priorities.md`.
11. `docs/roadmap/RDM-001_first-playable-slice.md`,
    `docs/roadmap/RDM-002_long-term-capability-horizon.md` y
    `docs/scenarios/SCN-001_mountain-village-arrival.md`.
12. El Anexo A de este mismo prompt, completo. No lo resumas antes de haberlo
    leído entero.

Usa `rg` por identificador antes de ampliar la lectura. Si el repositorio
actual contiene documentos nuevos no presentes en esta lista, incorpora solo
los que el índice vigente declare dependencias directas de los dominios
afectados.

## 4. Decisiones ya cerradas por Dennis

Estas decisiones no son preguntas para el agente y deben quedar canónicas.

### 4.1 Reinicio de la línea de código

- Se conserva la visión, el diseño y la documentación funcional existentes.
- Se reinicia la **línea activa de código** porque construir primero una capa
  3D está ralentizando la validación de las mecánicas y haciendo costosa la
  prueba manual.
- El prototipo Godot no se borra ni se presenta como fracaso: queda como
  prototipo histórico cerrado y referencia de aprendizaje.
- `IMPLEMENTATION-004` de Godot fue completada técnicamente en una rama/PR,
  pero no fue aceptada manualmente ni adoptada como parte de la línea activa
  antes del cambio de arquitectura; no debe completarse más, redirigirse ni
  fusionarse como parte de esta entrega documental (ver la corrección de la
  sección 2).
- No se promete todavía cuál será el motor visual final. Godot, Unity u otra
  tecnología podrán evaluarse cuando el juego tenga mecánicas validadas.
- La futura capa visual no debe obligar a rediseñar el modelo semántico del
  mundo.
- No se promete una migración automática del código TypeScript a un motor 3D.
  Se preservarán reglas, contratos, IDs, datos, seeds, escenarios y pruebas;
  la integración o portado del código se decidirá cuando exista una necesidad
  real y medible.

### 4.2 Stack activo para el laboratorio de simulación

La dirección aprobada para la siguiente línea de implementación es:

| Capa | Decisión |
|---|---|
| Ejecución | Node.js en una versión LTS, fijada cuando se inicialice el código. |
| Lenguaje | TypeScript estricto. |
| Aplicación web | Next.js + React, con una única puesta en marcha local sencilla. |
| Simulación | Núcleo TypeScript puro, sin dependencias de React, Next.js, Prisma, Canvas ni PostgreSQL. |
| Persistencia | PostgreSQL desde el inicio de la nueva línea de código. |
| Acceso a datos | Prisma, aislado detrás de la capa de persistencia. |
| Validación | Zod para contratos en las fronteras de entrada/salida cuando se implemente. |
| Pruebas | Vitest para pruebas automáticas pequeñas de reglas del motor. |
| Mapa funcional | Canvas 2D del navegador, cenital y deliberadamente sencillo. |
| Contenedores | Sin Docker de inicio. |
| Red | Aplicación local y de un solo jugador; sin cuentas, multijugador ni servicios públicos. |

Vitest debe explicarse en la documentación en lenguaje accesible: es la
herramienta que comprobará reglas concretas del motor, no una interfaz para
Dennis ni una sustitución de sus pruebas manuales. Las pruebas automáticas
seguirán siendo acotadas; Dennis valida la experiencia funcional.

### 4.3 Separación obligatoria

La arquitectura debe distinguir, al menos:

- **núcleo de simulación**: estado, tiempo, reglas, órdenes, trabajos,
  decisiones y eventos causales;
- **catálogos y contratos**: definiciones con IDs estables y datos
  validables;
- **persistencia**: repositorios PostgreSQL/Prisma, snapshots, eventos y
  versiones;
- **aplicación/orquestación**: inicio, pausa, velocidad, comandos y ciclo de
  ejecución;
- **presentación web**: paneles, mapa Canvas, barras y registro narrativo.

El núcleo recibe estado y comandos/tiempo simulado y produce un nuevo estado
más eventos. No importa Prisma, React, Next.js ni API del navegador. La base
de datos guarda el mundo: no toma decisiones por los personajes y no alberga
la lógica del juego.

La interfaz nunca debe ser la fuente de verdad. Cerrar o recargar la vista no
puede cambiar reglas ni volver a sortear el mundo.

### 4.4 PostgreSQL sin convertir cada fotograma en SQL

PostgreSQL se adopta porque el proyecto aspira a conservar un mundo grande,
consultable y persistente, con personajes, lugares, estados, historia y
sucesos. Sin embargo:

- no se escribe una fila por cada fotograma visual;
- no se ejecuta una consulta por cada pequeño movimiento de cada personaje;
- el estado activo puede evolucionar en memoria dentro del proceso de
  simulación;
- se persiste mediante límites causales, transacciones, eventos y snapshots
  con una cadencia que se decidirá y medirá en implementación;
- la reconstrucción de una partida debe preservar hechos y no depender de la
  capa visual;
- el esquema debe ser versionable, pero esta entrega no diseña migraciones
  ejecutables ni tablas definitivas.

La documentación debe distinguir con claridad qué está aprobado como
principio y qué cadencias, particiones o tablas siguen abiertas.

### 4.5 Tiempo continuo

El jugador no pulsa «avanzar diez minutos». El juego conserva un reloj
continuo:

```text
Día 1 · 08:37
Pausa · ×1 · ×2 · ×4 · ×10
```

- Un día completo mantiene la decisión actual de 20 minutos reales a ×1.
- Pausa congela toda evolución dependiente del tiempo simulado.
- ×2, ×4 y ×10 multiplican tiempo simulado, no número de tiradas ni
  resultados por fotograma.
- El motor avanza mediante ticks internos deterministas o un acumulador de
  tiempo simulado; la frecuencia exacta se decidirá al implementar y medir.
- La representación puede interpolar movimientos con más frecuencia que la
  lógica, sin alterar resultados.
- Ningún sistema usa el framerate como regla de juego.

### 4.6 Acciones y trabajos visibles por fases

Cada persona debe tener siempre un estado operativo comprensible. Un trabajo
no se resuelve de golpe. Como mínimo, el modelo debe poder expresar:

```text
seleccionando o reservando trabajo
→ desplazándose al origen o destino
→ recogiendo o preparando
→ realizando la acción
→ transportando o regresando
→ depositando o completando
```

No todas las acciones usarán todas las fases, pero no se inventarán fases
aisladas por pantalla. Para cada persona, la futura interfaz debe poder
mostrar:

- qué está haciendo;
- dónde va y hacia qué objetivo;
- fase actual;
- progreso porcentual del desplazamiento o de la fase cuando sea medible;
- carga transportada;
- origen de la acción: orden puntual, prioridad, necesidad, emergencia o
  iniciativa propia;
- motivo de espera, bloqueo, cancelación o interrupción;
- consecuencia al terminar.

Ejemplos de presentación:

| Persona | Estado visible |
|---|---|
| Marta | «Caminando al almacén · 65 %» |
| Raúl | «Pescando en el estanque · 30 %» |
| Lucía | «Descansando · recuperación 80 %» |
| Ana | «En camino para inspeccionar la casa · 42 %» |
| Sergio | «Esperando trabajo: no hay tarea elegible» |

El porcentaje es una proyección operativa, no una promesa de que toda acción
tenga un tiempo exacto conocido por el jugador. Los bloqueos y cambios
causales pueden alterar la duración.

### 4.7 Mapa local 2D funcional

El nuevo laboratorio no será una terminal ni un juego puramente textual.
Tendrá un mapa local 2D cenital muy sencillo, inspirado únicamente en la
legibilidad de los juegos cenitales antiguos:

- Canvas del navegador;
- terreno plano, caminos, agua y vegetación mediante colores o formas
  simples;
- edificios como huellas o bloques coherentes con su modelo semántico;
- supervivientes y amenazas como marcadores o sprites provisionales;
- movimiento visible entre posiciones;
- cámara con desplazamiento y zoom mediante ratón;
- selección y acciones contextuales con ratón;
- sin arte final, modelos 3D, primera persona, WASD ni puntería manual;
- sin introducir Phaser, PixiJS u otro motor 2D hasta que una necesidad
  medida lo justifique.

El mapa es una herramienta de juego y observación, no una maqueta decorativa.
Los paneles de personas, trabajos, recursos y sucesos convivirán con él.

### 4.8 Niebla, exploración y control puntual

- El primer mapa no aparece completo ni revela todas sus posibilidades.
- Al comenzar solo se conoce el grupo inicial, el punto de llegada/refugio y
  una cercanía razonable.
- El resto queda oculto o incierto mediante niebla de guerra e información
  incompleta.
- El jugador puede seleccionar una persona y darle una orden puntual para
  moverse, observar o explorar una zona accesible.
- No controla cada paso: la persona calcula la ruta, se desplaza, reacciona a
  necesidades y peligro y vuelve después al sistema de prioridades.
- Avistar una forma, reconocer un lugar, observarlo, inspeccionarlo,
  registrarlo y explotarlo son conceptos relacionados pero no equivalentes.
- No sustituyas en silencio los estados aprobados de `WLD-002` por las
  etiquetas informales usadas en conversación. Distingue, si hace falta,
  **visibilidad espacial** de **conocimiento del lugar**, y documenta la
  relación sin duplicar una fuente canónica.
- Pintar o revelar terreno no crea recursos, no inspecciona interiores y no
  asegura el lugar.

## 5. Principios cerrados del generador de lugares

El Anexo A es fuente de requisitos de esta entrega. Los siguientes principios
son obligatorios y deben quedar localizados en fuentes canónicas, no
simplemente resumidos en el changelog.

### 5.1 Semántica antes que geometría

Un lugar existe como realidad lógica antes de su Canvas 2D y de cualquier
futuro 3D. La cadena conceptual mínima es:

```text
mundo
→ región
→ asentamiento
→ distrito o zona
→ calles y rutas
→ parcelas
→ dimensiones posibles
→ arquetipos compatibles
→ tipo y subtipo
→ programa de estancias
→ grafo funcional
→ instalaciones
→ ocupantes, hogar o negocio
→ mobiliario, contenedores y objetos
→ conocimiento recuperable
→ historia del apocalipsis
→ presión y rutas históricas de saqueo
→ saqueos concretos
→ deterioro y estado actual
→ capacidad de quien explora
→ información comunicada al jugador
```

Las dimensiones limitan usos posibles, pero no determinan por sí solas el
tipo. Calle, distrito, densidad, contexto rural/urbano, parcela, época,
accesibilidad, vecinos, tamaño y altura influyen conjuntamente.

### 5.2 El edificio no es un cofre de loot

Todo lugar relevante debe poder representar:

- función anterior;
- dimensiones y plantas;
- programa y grafo de estancias;
- instalaciones, mobiliario, contenedores y objetos;
- hogar, negocio, trabajadores, profesiones, aficiones y nivel económico;
- historia durante y después del colapso;
- presión de saqueo zonal y saqueos concretos;
- deterioro, riesgos y funcionalidad parcial;
- recursos obvios, ocultos, no reconocidos e integrados;
- conocimiento recuperable;
- valor futuro como edificio aunque el contenido suelto se agote.

### 5.3 Cinco capas de aprovechamiento

Conserva las cinco capas distintas del Anexo A:

1. contenido suelto;
2. mobiliario y equipamiento;
3. instalaciones desmontables;
4. acabados recuperables;
5. estructura.

Saqueo/registro, recuperación, traslado, reparación, desmontaje selectivo,
desmantelamiento y demolición son acciones distintas. No colapses las cinco
capas en una única cifra de recursos.

### 5.4 Tres vidas y decisiones irreversibles

Un edificio puede saquearse, desmontarse y finalmente desmantelarse o
demolerse. También puede conservarse, rehabilitarse y reutilizarse. Demoler
produce materiales masivos pero destruye componentes y capacidad futura.
Incluso una vivienda sin objetos sueltos puede seguir siendo valiosa por sus
instalaciones, acabados, estructura, alojamiento, defensa o almacenamiento.

### 5.5 Coherencia por ocupantes y actividad

El contenido no se genera como objetos independientes. Debe derivar de
habitaciones, mobiliario/contenedores, perfiles de hogar o negocio,
profesiones, aficiones, rasgos raros, nivel económico, época constructiva e
historia. El nivel económico modifica cantidad, calidad, espacio,
redundancia, vehículos y tecnología; no equivale linealmente a «mejor loot».

### 5.6 Historia causal del apocalipsis

Evacuación ordenada, huida precipitada, ocupantes que no salieron, refugio
posterior, ataque, incendio, inundación, cuarentena, saqueos u ocupación
reciente deben modificar estado, riesgos, distribución y contenido. La
historia ambiental debe poder inferirse en el espacio y tener consecuencias;
no es decoración textual independiente.

### 5.7 Saqueo espacialmente correlacionado

El saqueo histórico se genera por zonas y recorridos, no mediante tiradas
aisladas por edificio. Debe contemplar:

- mapa de presión histórica;
- factores de accesibilidad, visibilidad, densidad, valor percibido, riesgo,
  ocultación y dificultad;
- influencia local entre edificios;
- rutas o corredores recorridos por grupos;
- bolsas olvidadas entre áreas muy explotadas;
- diferencia entre valor percibido y valor real;
- excepciones individuales: la zona influye, nunca impone un resultado
  absoluto;
- posibilidad futura de saqueo dinámico por comunidades, separada de la
  generación histórica inicial y condicionada al coste de simulación.

No conviertas el modelo conceptual de puntuación del anexo en una fórmula
numérica cerrada.

### 5.8 Contenido estable y descubrimiento dependiente de la persona

El contenido base existe de manera determinista por semilla, IDs, versión y
contexto persistente. No se vuelve a tirar al abrir un armario ni al cargar
una partida. La persona cambia qué reconoce, interpreta, alcanza, puede
extraer y puede desmontar sin destruir.

Debe ser posible:

- registrar un lugar más de una vez con capacidades diferentes;
- conservar elementos identificados, parcialmente identificados,
  desconocidos, potencialmente útiles o no evaluados;
- agotar comida sin agotar componentes técnicos;
- volver con un mecánico, sanitario, electricista, informático, fontanero u
  otro especialista;
- encontrar indicios sobre qué experiencia sería útil;
- sufrir pérdidas causales persistentes por un desmontaje torpe.

### 5.9 Instalaciones, edad y condición

Representa conceptualmente electricidad, agua, ACS, calefacción,
climatización, telecomunicaciones y ventilación, con los componentes del
anexo. La época constructiva afecta materiales e instalaciones. Edificios,
sistemas, máquinas y objetos pueden estar funcionales, degradados,
averiados, incompletos, reparables, irreparables o ser útiles solo como
piezas.

### 5.10 Conocimiento y mapa

Libros, manuales, mapas, planos, documentación, cintas, soportes digitales,
servidores y procedimientos forman parte del contenido. Un lugar puede
revelar otros lugares o infraestructura: un ayuntamiento puede revelar redes
de agua; una cooperativa, pozos, parcelas o silos; archivos profesionales,
ubicaciones técnicas. Esto debe integrarse con conocimiento individual,
conocimiento comunitario, mapa local y futuro mapamundi.

### 5.11 Determinismo y materialización diferida

Mundo, región, asentamiento, parcela, edificio y contenedores utilizan seeds
o corrientes derivadas estables. La materialización visual o tardía no cambia
los hechos semánticos. Registrar una versión del generador es obligatorio
como principio de persistencia. La estructura exacta de RNG queda para la
implementación.

### 5.12 Catálogo máximo frente a alcance implementable

El catálogo completo del Anexo A se conserva como horizonte máximo
indexado. No es una promesa de que la primera implementación incluya todos
los lugares. Debe existir una separación explícita entre:

- catálogo máximo aprobado como referencia de expansión;
- subconjunto inicial implementable, que en esta entrega puede quedar
  `draft` si elegir sus miembros exige una decisión adicional de Dennis;
- contenido realmente implementado, que por ahora es ninguno en la nueva
  arquitectura.

No elimines duplicados aparentes como gasolinera, camping, cine, refugio o
aserradero sin analizarlos: pueden representar clasificación contextual,
subtipos o alias. Documenta una estrategia de IDs/alias o registra la
pregunta; no cambies silenciosamente los IDs del anexo.

Las localizaciones especiales/narrativas se modelan principalmente como
modificadores, historia, ocupación o rasgos aplicados a tipos base; no todas
son arquetipos base independientes.

## 6. Estructura documental que debe producirse

Respeta `DOC-001`: una regla tiene una sola fuente canónica, los documentos
se dividen al acercarse a 300–500 líneas y los índices no se convierten en
otro GDD. Puedes ajustar títulos o distribuir una responsabilidad si los
documentos actuales ya cubren exactamente el asunto, pero debes conservar
los IDs propuestos cuando estén libres y explicar cualquier desviación.

### 6.1 Nuevo dominio de catálogos

Crea `docs/catalogs/` y añade el prefijo `CAT` al sistema documental. Actualiza
`DOC-001` y `docs/INDEX.md` para declararlo como catálogo de referencia y
contenido, diferenciado de reglas funcionales y decisiones.

Crea:

1. `docs/catalogs/INDEX.md`.
2. `CAT-001_maximum-place-catalog.md`: las 22 familias A–V y **todos los IDs
   y nombres** del catálogo máximo del Anexo A. Conserva el orden y registra
   duplicados/solapamientos sin borrarlos.
3. `CAT-002_rooms-modules-and-building-systems.md`: módulos funcionales,
   catálogo máximo de estancias, jerarquía habitación → mobiliario →
   contenedor → contenido, instalaciones, acabados, estructura y variación
   por época.
4. `CAT-003_occupants-professions-hobbies-and-traits.md`: composiciones de
   hogar, estratos económicos, profesiones, aficiones y rasgos especiales.
5. `CAT-004_initial-semantic-place-slice.md`: propuesta pequeña de primer
   subconjunto para la futura implementación web. Déjalo `draft`; no lo
   presentes como aprobado por Dennis ni empieces a programarlo.

`CAT-001`, `CAT-002` y `CAT-003` pueden marcarse `approved` como catálogos de
horizonte y referencia, no como alcance de implementación. Su cabecera y su
introducción deben decirlo expresamente.

### 6.2 Mundo y lugares

Crea:

- `WLD-005_semantic-place-and-building-generation.md`: jerarquía generativa,
  contexto, parcela, arquetipo, subtipo, módulos mixtos, programa de
  estancias, grafo, jerarquía de contenido y semántica independiente de 2D/3D.
- `WLD-006_historical-looting-pressure-and-routes.md`: presión zonal,
  correlación local, accesibilidad, valor percibido/real, rutas, bolsas
  olvidadas, historia individual y saqueo dinámico futuro.
- `WLD-007_place-history-and-environmental-storytelling.md`: estados durante
  el colapso, rastros ambientales, causalidad con contenido y lugares
  memorables.

Actualiza `WLD-002` y `WLD-004` solo donde haga falta para integrar niebla,
visibilidad espacial, catálogo concreto de acciones, revisitas,
instalaciones y nuevas fuentes. No copies en ellos reglas cuyo hogar sea
`WLD-005`, `WLD-006` o `WLD-007`.

### 6.3 Asentamiento y explotación física

Crea:

- `SET-007_building-exploitation-reuse-and-demolition.md`: cinco capas,
  tres vidas, estados de explotación, saqueo/recuperación/desmontaje/
  desmantelamiento/demolición, costes conceptuales, pérdidas, habitabilidad,
  rehabilitación, reutilización y decisión irreversible.

Integra mediante enlaces con `SET-003`, `SET-005`, `SET-006` y `UI-003`. No
dupliques la taxonomía de prioridades: documenta qué prioridades intervienen
y enlaza su fuente canónica.

### 6.4 Arquitectura y persistencia

Crea:

- `DEC-0008_simulation-first-web-architecture.md`, decisión aprobada que
  sustituye a Godot como línea activa pero preserva el prototipo histórico.
- `ARC-004_simulation-core-runtime-and-boundaries.md`, fuente canónica para
  núcleo puro, comandos, ticks, eventos, fases de trabajo, lectura de estado,
  fronteras de persistencia y presentación.
- `ARC-005_semantic-world-data-model.md`, modelo conceptual y todavía no
  ejecutable para `Building`, `Room`, `BuildingSystem`, `Fixture`,
  `Furniture`, `Container`, `Item`, `StructuralComponent`,
  `OccupantProfile`, `Household`, `BusinessProfile`, `BuildingHistory`,
  `LootPressureZone`, `LootingRoute`, `LootingEvent`, `KnowledgeSource`,
  `DiscoveryState` y `BuildingCondition`. Define responsabilidades,
  identidades, relaciones y límites; no escribas Prisma ni SQL.

Actualiza:

- `ARC-001` para el nuevo stack y separación de capas;
- `ARC-002` para PostgreSQL, snapshots/eventos, tiempo continuo y generación
  reproducible;
- `ARC-003` para retirar afirmaciones que mantengan Godot/GDScript como línea
  activa y expresar simulación multiescala independiente de presentación;
- `DEC-0001` a `deprecated`, indicando que documenta el prototipo histórico y
  que ha sido sustituida por `DEC-0008`; no borres sus hechos históricos;
- `DEC-0003` y `DEC-0005` solo si necesitan nuevas relaciones o consecuencias,
  sin reescribir sus principios ya válidos.

No fijes tablas, endpoints, clases o carpetas ejecutables definitivas. Puedes
proponer un mapa lógico de módulos, claramente conceptual.

### 6.5 Interfaz de laboratorio

Crea:

- `UI-005_top-down-simulation-workbench.md`, fuente canónica para el mapa
  Canvas 2D, reloj, velocidades, selección con ratón, niebla, órdenes
  puntuales, movimiento visible, barras/fases, paneles operativos y diario de
  sucesos.

Actualiza `UI-001` para retirar dependencias exclusivas de la cámara 3D
inclinada y enlazar el nuevo laboratorio, manteniendo control estratégico con
ratón y sin avatar de acción. No cambies las 34 prioridades ni la separación
entre prioridades y habilidades.

### 6.6 Roadmap, visión y estado

Crea:

- `RDM-003_simulation-first-playable-roadmap.md`, `approved`, que sustituya
  la secuencia Godot como hoja de ruta activa y divida futuras entregas en
  incrementos pequeños, funcionales y manualmente probables.

El roadmap debe incluir, sin programar ahora:

1. inicialización técnica y primer estado visible;
2. reloj continuo, seis personas y estado operativo;
3. mapa cenital, niebla, movimiento y exploración;
4. trabajos, prioridades, recursos y necesidades;
5. generador semántico inicial y explotación de lugares;
6. autonomía, relaciones, amenazas y narrativa emergente en incrementos
   separados, no en una entrega monolítica;
7. ampliación progresiva del catálogo y eventual evaluación de capa visual
   avanzada.

Cada futura entrega debe terminar en algo que Dennis pueda probar en el
navegador. No repitas el error de agrupar zonas, defensa, amenaza,
aprendizaje y autonomía en un solo bloque enorme.

Actualiza:

- `RDM-001` a `deprecated`, preservándolo como hoja histórica del prototipo
  Godot y enlazando `RDM-003`;
- `RDM-002` para depender del roadmap activo sin perder el horizonte máximo;
- `README.md`, dejando claro que la nueva aplicación todavía no se ha
  inicializado y que el código Godot es legado de prototipo;
- `docs/STATUS.md`, reflejando que `DESIGN-004` cambia la arquitectura y que
  no existe todavía implementación web;
- `CHANGELOG.md`, con entrada documental en español;
- `docs/OPEN-QUESTIONS.md`, retirando preguntas cerradas y registrando solo
  decisiones realmente abiertas;
- todos los índices de dominio afectados y el índice maestro.

No marques como `implemented` ninguna regla nueva. Esta entrega no cambia el
estado ejecutable del juego.

### 6.7 Trazabilidad del documento de traspaso

Crea `docs/discovery/DISC-0003_procedural-place-generator-traceability.md`.
Debe incluir una matriz compacta que mapee **cada sección 0–85 del Anexo A** a
su documento canónico de destino o a una pregunta abierta concreta. Su
objetivo es demostrar que no se perdió contenido, no duplicar el catálogo.

Incluye además una lista explícita de:

- decisiones aprobadas;
- propuestas `draft`;
- fórmulas o equilibrios deliberadamente abiertos;
- elementos de horizonte que no entran en el primer subconjunto.

## 7. Reglas de estados y conflictos

- `DEC-0008`, `ARC-001` actualizado, `ARC-002` actualizado, `ARC-003`
  actualizado, `ARC-004`, `WLD-005`, `WLD-006`, `WLD-007`, `SET-007` y
  `UI-005` pueden ser `approved` porque formalizan decisiones expresas de
  Dennis.
- `ARC-005` puede ser `approved` para entidades y responsabilidades
  conceptuales, pero cualquier forma concreta de tabla/ORM queda `draft` o
  fuera.
- `CAT-001`–`CAT-003` son `approved` como horizonte catalogado, no como
  contenido implementado.
- `CAT-004` queda `draft`.
- `DEC-0001` y `RDM-001` pasan a `deprecated`, con sustituto explícito y
  manteniendo historia.
- Ningún documento pasa a `implemented`.
- No resuelvas fórmulas numéricas, frecuencias exactas, rendimiento,
  equilibrio ni catálogo inicial mediante preferencias inventadas.
- Si un ID propuesto ya está ocupado en `main`, no lo reutilices. Localiza el
  siguiente ID libre, actualiza todas las referencias e informa del cambio.
- Si una regla existente contradice de verdad una decisión nueva, la decisión
  nueva prevalece solo porque esta entrega la registra explícitamente; deja
  rastro de sustitución y no borres el contexto histórico.

## 8. Fuera de alcance absoluto

No hagas nada de lo siguiente:

- no modifiques `src/`, `scenes/`, `tests/`, `game_data/`, `schemas/` ni
  archivos Godot;
- no borres, muevas ni archive físicamente el prototipo Godot;
- no inicialices Node.js, Next.js, React, TypeScript, Prisma, PostgreSQL,
  Zod, Vitest ni Canvas;
- no crees `package.json`, migraciones, variables de entorno, base de datos,
  APIs, componentes o pruebas ejecutables;
- no continúes `IMPLEMENTATION-004`;
- no diseñes arte final, sprites definitivos ni futura geometría 3D;
- no elijas motor 3D final;
- no conviertas todos los catálogos máximos en alcance inmediato;
- no inventes fórmulas cerradas de loot, deterioro, aprendizaje, ticks o
  rendimiento;
- no fusiones la PR.

## 9. Validación documental acotada

No ejecutes pruebas de Godot ni suites de código. Realiza únicamente
validaciones documentales y de Git:

1. `git diff --check`.
2. Comprobar que solo se modifican archivos Markdown y, si el repositorio lo
   usa, metadatos estrictamente documentales.
3. Verificar IDs YAML únicos y estados válidos.
4. Verificar enlaces Markdown locales de los archivos creados/modificados.
5. Confirmar que todos los nuevos documentos aparecen en su índice de dominio
   y que `docs/INDEX.md`, `docs/decisions/INDEX.md`, `docs/roadmap/INDEX.md`,
   `docs/discovery/INDEX.md` y `prompts/INDEX.md` están coherentes.
6. Verificar mediante la matriz de `DISC-0003` que existen filas para todas
   las secciones `0` a `85`, sin huecos.
7. Ejecutar búsquedas y registrar sus resultados:

   ```bash
   rg -n "Godot|GDScript|Forward\+|SQLite|PostgreSQL|Node\.js|TypeScript|Canvas|Vitest" README.md docs prompts
   rg -n "status: implemented" docs
   rg -n "IMPLEMENTATION-004" README.md docs prompts
   ```

   Usa los resultados para detectar afirmaciones activas obsoletas; no
   reemplaces menciones históricas válidas.
8. Confirmar que no se tocó código con `git diff --name-only`.

No generes documentación automática masiva ni ejecutes validaciones ajenas al
cambio.

## 10. Criterios de aceptación

La entrega está lista cuando:

1. la línea técnica activa es inequívocamente Node.js/TypeScript/web, con
   núcleo puro, PostgreSQL/Prisma, Canvas y pruebas Vitest acotadas;
2. Godot queda preservado como prototipo histórico, no como base activa ni
   como contenido borrado;
3. el reloj continuo, las velocidades y las fases/progresos visibles están
   documentados sin convertir el juego en turnos o saltos manuales;
4. el mapa inicial es cenital, simple, con niebla y exploración progresiva,
   sin revelar todo el escenario;
5. el modelo semantic-first funciona igual para Canvas y para un posible 3D
   futuro;
6. las cinco capas de recursos, tres vidas del edificio, reutilización,
   desmontaje y demolición están separadas;
7. ocupantes, negocio, profesión, aficiones, época, historia, presión zonal y
   rutas de saqueo explican causalmente el contenido;
8. el descubrimiento depende de la persona sin crear ni resortear objetos;
9. el catálogo máximo completo A–V y todos sus IDs están conservados e
   indexados;
10. las 86 secciones numeradas `0–85` del anexo tienen trazabilidad;
11. no se tomó ninguna decisión numérica arbitraria ni se presentó el
    catálogo completo como alcance inicial;
12. roadmap, estado, decisiones, arquitectura, interfaz e índices no se
    contradicen;
13. el diff no contiene código ni configuración ejecutable;
14. el PR queda abierto para revisión de Dennis.

## 11. Flujo de Git, commit y Pull Request

Antes del commit:

1. ejecuta `git fetch origin`;
2. comprueba si `origin/main` avanzó;
3. integra el `main` actual en la rama documental antes de abrir la PR;
4. resuelve conflictos preservando el contenido más reciente y sin sustituir
   índices actuales por versiones antiguas;
5. vuelve a ejecutar las validaciones de la sección 9.

Crea un único commit coherente o, si el tamaño exige varios, una serie corta
de commits documentales claramente nombrados. Crea el Pull Request en GitHub
con este título:

```text
docs: adopta arquitectura simulation-first y formaliza lugares procedurales
```

La descripción debe resumir:

- cambio arquitectónico;
- reloj y mapa funcional;
- documentos canónicos y catálogos creados;
- decisiones sustituidas;
- trazabilidad del anexo;
- validaciones ejecutadas;
- ausencia total de cambios de código;
- preguntas que siguen abiertas.

**No fusiones el PR, no hagas merge y no modifiques `main` después de abrirlo.**
Dennis revisa y fusiona manualmente.

## 12. Formato obligatorio del informe final

Responde en español y en este orden:

1. Resultado documental conseguido.
2. Nueva arquitectura activa y decisiones sustituidas.
3. Modelo de tiempo, trabajo visible y mapa cenital documentado.
4. Modelo procedural y capas de edificio formalizadas.
5. Catálogos creados y diferencia entre máximo, inicial e implementado.
6. Lista de documentos creados, actualizados y deprecados.
7. Tabla breve de estados (`approved`, `draft`, `deprecated`).
8. Preguntas abiertas conservadas.
9. Validaciones ejecutadas con resultado literal.
10. Confirmación de que no se modificó código.
11. Enlace del Pull Request abierto.
12. Frase explícita: «El PR no se ha fusionado; queda pendiente de Dennis».

No digas que la nueva aplicación existe, arranca o está probada. Después de
esta entrega solo habrá una arquitectura y un diseño formalizados.

---

# ANEXO A — DOCUMENTO DE TRASPASO ÍNTEGRO

El contenido situado a continuación forma parte vinculante del encargo. Debe
leerse completo y reflejarse mediante la trazabilidad exigida. Sus ejemplos
conceptuales no se convierten automáticamente en contratos técnicos ni en
fórmulas cerradas.

# Z-WORLD — CATÁLOGO MÁXIMO DE LUGARES Y GENERADOR PROCEDURAL DE EDIFICIOS
## Documento de traspaso para generar la documentación formal del sistema

---

# 0. PROPÓSITO

Este documento consolida todas las decisiones e ideas trabajadas sobre el sistema procedural de lugares y edificios de Z-World.

Su objetivo es servir como documento de traspaso para que otra conversación genere la documentación formal completa del sistema, sin simplificar los conceptos aquí recogidos.

La documentación futura debe conservar:

- generación semántica antes que geométrica;
- edificios como lugares coherentes, no cofres de loot;
- múltiples capas de recursos;
- saqueo, desmontaje y demolición como acciones distintas;
- ocupantes y profesiones como origen de contenido;
- historia del apocalipsis;
- presión de saqueo por zonas;
- rutas históricas de saqueo;
- edificios parcialmente intactos dentro de áreas muy saqueadas;
- descubrimiento dependiente del superviviente;
- integración con conocimiento, prioridades, mapa local y futuro mapamundi.

---

# 1. VISIÓN GENERAL

Z-World no debe generar edificios como simples contenedores aleatorios de loot.

Cada lugar debe tener:

- una función anterior al apocalipsis;
- unas dimensiones coherentes;
- unas estancias propias de esa función;
- instalaciones;
- mobiliario;
- objetos;
- antiguos ocupantes o trabajadores;
- profesiones y aficiones;
- nivel económico;
- una historia durante el apocalipsis;
- deterioro;
- posible historial de saqueos;
- recursos visibles;
- recursos no identificados;
- instalaciones desmontables;
- materiales estructurales;
- conocimiento potencial;
- utilidad futura aunque ya haya sido saqueado.

La filosofía base es:

> Un edificio no es un cofre de loot. Es el resto físico de una vida, una actividad económica o un servicio anterior al apocalipsis.

---

# 2. PRINCIPIO FUNDAMENTAL: EL EDIFICIO SEMÁNTICO EXISTE ANTES QUE EL 3D

El sistema debe separar:

1. qué ES el edificio;
2. qué FUNCIONES tenía;
3. qué ESTANCIAS necesita;
4. qué OBJETOS e INSTALACIONES contiene;
5. cómo se REPRESENTA físicamente.

Por tanto:

> primero se genera el edificio lógico o semántico;
> después se transforma en geometría.

Ejemplo:

```text
Building #0274

Tipo:
Vivienda familiar grande

Dimensiones:
12 x 12 m

Plantas:
2

Superficie bruta aproximada:
288 m²

Programa funcional:
- entrada
- salón
- cocina
- comedor
- baño PB
- garaje
- dormitorio principal
- dormitorio 2
- dormitorio 3
- dormitorio 4
- baño P1
- distribuidor
- posible despacho/trastero

Antiguos ocupantes:
4 personas

Instalaciones:
- electricidad doméstica
- agua
- ACS
- calefacción
- comunicaciones

Historia:
evacuación precipitada

Estado:
ligero saqueo posterior
```

Nada de esto necesita todavía paredes 3D.

Más adelante:

> Edificio lógico → grafo de estancias → geometría → paredes → puertas → muebles → objetos físicos.

---

# 3. LAS DIMENSIONES NO DETERMINAN POR SÍ SOLAS EL TIPO DE EDIFICIO

Un edificio de:

> 12 x 12 metros y 2 plantas

NO debe convertirse automáticamente en una vivienda.

Puede ser:

- vivienda familiar;
- dos apartamentos;
- tienda en planta baja + vivienda superior;
- restaurante + vivienda;
- pequeño hostal;
- consulta;
- oficinas;
- pequeño taller;
- edificio mixto.

Las dimensiones establecen qué usos son físicamente posibles.

La probabilidad real debe depender además de:

- posición en el asentamiento;
- tipo de calle;
- densidad;
- contexto rural/urbano;
- parcela;
- época;
- edificios cercanos;
- uso del barrio;
- accesibilidad;
- tamaño;
- altura.

Ejemplos:

## Calle principal

Más probabilidad de:

- tienda;
- bar;
- farmacia;
- restaurante;
- comercio con vivienda superior;
- pequeño hotel.

## Zona residencial

Más probabilidad de:

- casas;
- adosados;
- apartamentos.

## Periferia

Más probabilidad de:

- talleres;
- naves;
- viviendas con terreno;
- pequeñas explotaciones;
- almacenes.

---

# 4. ESTRUCTURA PROCEDURAL GENERAL

El generador debería seguir aproximadamente esta cadena:

```text
MUNDO
↓
REGIÓN
↓
ASENTAMIENTO
↓
DISTRITOS / ZONAS
↓
CALLES / RUTAS
↓
PARCELAS
↓
DIMENSIONES POSIBLES
↓
ARQUETIPOS COMPATIBLES
↓
TIPO DE EDIFICIO
↓
SUBTIPO
↓
PROGRAMA DE ESTANCIAS
↓
GRAFO FUNCIONAL
↓
INSTALACIONES
↓
PERFIL DE OCUPANTES / NEGOCIO
↓
MOBILIARIO
↓
OBJETOS
↓
CONOCIMIENTO
↓
HISTORIA DEL APOCALIPSIS
↓
PRESIÓN DE SAQUEO DE LA ZONA
↓
RUTAS HISTÓRICAS DE SAQUEO
↓
SAQUEOS PREVIOS DEL EDIFICIO
↓
DETERIORO
↓
ESTADO ACTUAL
↓
CAPACIDAD DEL SUPERVIVIENTE QUE LO EXPLORA
↓
INFORMACIÓN QUE RECIBE EL JUGADOR
```

---

# 5. EL EDIFICIO TIENE VARIAS CAPAS DE RECURSOS

Un edificio no deja de tener valor cuando se vacían sus armarios.

Debe contener, al menos, cinco capas diferentes de aprovechamiento.

---

# 6. CAPA 1 — CONTENIDO SUELTO

Objetos almacenados, utilizados o abandonados por los antiguos ocupantes.

Ejemplos:

- alimentos;
- ropa;
- medicación;
- libros;
- herramientas;
- documentación;
- piezas;
- armas;
- recipientes;
- objetos personales;
- juguetes;
- productos de higiene;
- baterías;
- dispositivos;
- material escolar;
- semillas.

Se obtiene principalmente mediante:

> SAQUEO / REGISTRO.

---

# 7. CAPA 2 — MOBILIARIO Y EQUIPAMIENTO

Elementos grandes o funcionales del edificio.

Ejemplos:

- camas;
- mesas;
- armarios;
- estanterías;
- sillas;
- frigoríficos;
- hornos;
- lavadoras;
- secadoras;
- ordenadores;
- televisores;
- bancos de trabajo;
- maquinaria;
- congeladores;
- mostradores.

Pueden:

- seguir utilizándose allí;
- trasladarse;
- desmontarse;
- reutilizarse;
- convertirse en piezas;
- repararse.

---

# 8. CAPA 3 — INSTALACIONES DESMONTABLES

Esta capa es clave.

Una vivienda o edificio contiene recursos integrados físicamente.

NO aparecen simplemente al registrar la casa.

Deben recuperarse mediante:

> DESMONTAJE SELECTIVO.

---

# 9. INSTALACIÓN ELÉCTRICA

Puede contener:

- cableado de cobre;
- enchufes;
- interruptores;
- cajas;
- fusibles;
- magnetotérmicos;
- diferenciales;
- cuadros eléctricos;
- luminarias;
- sensores;
- relés;
- contactores;
- transformadores;
- fuentes;
- baterías;
- inversores;
- cable de tierra.

---

# 10. INSTALACIÓN DE AGUA

Puede contener:

- tuberías;
- grifos;
- válvulas;
- sifones;
- cisternas;
- depósitos;
- bombas;
- filtros;
- calentadores;
- termos;
- acumuladores;
- calderas;
- sanitarios;
- duchas;
- bañeras.

---

# 11. CALEFACCIÓN Y CLIMATIZACIÓN

Puede contener:

- radiadores;
- tuberías;
- calderas;
- estufas;
- bombas de calor;
- unidades de aire acondicionado;
- termostatos;
- ventiladores;
- intercambiadores;
- conductos.

---

# 12. TELECOMUNICACIONES

Puede contener:

- cable Ethernet;
- cable telefónico;
- coaxial;
- fibra;
- routers;
- switches;
- antenas;
- repetidores;
- puntos de acceso;
- centralitas;
- conectores.

---

# 13. VENTILACIÓN

Puede contener:

- conductos;
- extractores;
- ventiladores;
- motores;
- filtros;
- rejillas.

---

# 14. CAPA 4 — ACABADOS RECUPERABLES

Un nivel más profundo de desmontaje.

Puede recuperar:

- puertas;
- marcos;
- ventanas;
- cristales;
- persianas;
- sanitarios;
- muebles de cocina;
- encimeras;
- armarios empotrados;
- parquet;
- tablones;
- baldosas;
- azulejos;
- chapa;
- aislamiento;
- canalones;
- escaleras;
- barandillas.

En este punto el edificio empieza a perder habitabilidad.

---

# 15. CAPA 5 — ESTRUCTURA

Finalmente el edificio puede:

- desmantelarse profundamente;
- demolerse.

Puede producir:

- madera;
- vigas;
- perfiles;
- ladrillos;
- bloques;
- piedra;
- acero;
- ferralla;
- tejas;
- chapa;
- paneles;
- elementos de cubierta;
- hormigón reutilizable en ciertos contextos;
- escombros.

---

# 16. DESMONTAR NO ES DEMOLER

Debe existir una decisión estratégica clara.

## Desmontaje selectivo

Ventajas:

- lento;
- requiere especialistas;
- requiere herramientas;
- permite recuperar componentes enteros;
- preserva parcialmente el edificio.

Ejemplo:

Desmontar correctamente un cuadro eléctrico puede recuperar:

- diferenciales;
- magnetotérmicos;
- cableado;
- caja;
- conexiones.

## Demolición

Ventajas:

- más rápida;
- produce materiales masivos.

Desventajas:

- destruye elementos valiosos;
- genera escombros;
- pierde componentes;
- elimina un edificio potencialmente reutilizable.

Una casa derribada podría proporcionar:

- madera;
- metal;
- ladrillo;
- piedra;
- escombros;
- algo de cable.

Pero destruir:

- ventanas;
- sanitarios;
- mecanismos;
- componentes eléctricos;
- tuberías;
- mobiliario;
- aparatos.

---

# 17. TRES VIDAS DE UN EDIFICIO

## Primera vida

> SAQUEARLO.

Buscar objetos.

## Segunda vida

> DESMONTARLO.

Recuperar equipamiento e instalaciones.

## Tercera vida

> DESMANTELARLO / DEMOLERLO.

Convertirlo en materiales.

Esto debe permitir volver meses después a un edificio que parecía agotado.

---

# 18. ESTADOS DE EXPLOTACIÓN DE UN EDIFICIO

Posible modelo conceptual:

### DESCONOCIDO

↓

### RECONOCIDO

Sabemos aproximadamente el tipo.

↓

### EXPLORADO

Conocemos accesos, habitaciones generales y amenazas visibles.

↓

### REGISTRADO

Se ha realizado un saqueo convencional.

↓

### REGISTRADO POR ESPECIALISTA

Un personaje experto ha identificado recursos que otros no reconocían.

↓

### VACIADO

Prácticamente no quedan objetos accesibles.

↓

### DESMONTANDO

Se extraen muebles, sistemas e instalaciones.

↓

### DESMANTELADO

Queda sobre todo estructura.

↓

### DEMOLIDO

Deja de existir como edificio funcional.

Estos nombres son conceptuales y no necesariamente deben mostrarse así al jugador.

---

# 19. MÓDULOS FUNCIONALES REUTILIZABLES

No conviene diseñar cada edificio desde cero.

Deben existir módulos semánticos reutilizables.

## MÓDULO RESIDENCIAL

- recibidor;
- salón;
- comedor;
- cocina;
- dormitorio;
- baño;
- despensa;
- lavadero;
- garaje;
- trastero;
- estudio;
- sótano;
- terraza.

## MÓDULO COMERCIAL

- área pública;
- exposición;
- caja;
- almacén;
- oficina;
- WC;
- carga/descarga.

## MÓDULO INDUSTRIAL

- zona de trabajo;
- maquinaria;
- almacén;
- mantenimiento;
- vestuario;
- oficina;
- servicios.

## MÓDULO HOSTELERÍA

- recepción;
- comedor;
- bar;
- cocina profesional;
- almacén;
- cámara frigorífica;
- habitaciones;
- lavandería.

## MÓDULO SANITARIO

- recepción;
- espera;
- consulta;
- enfermería;
- tratamiento;
- almacén;
- farmacia;
- aseos.

## MÓDULO EDUCATIVO

- aulas;
- despachos;
- biblioteca;
- talleres;
- laboratorio;
- almacenes;
- comedor.

## MÓDULO LOGÍSTICO

- muelle;
- carga/descarga;
- almacén;
- frío;
- oficina;
- mantenimiento.

---

# 20. EDIFICIOS MIXTOS

Los módulos deben poder combinarse.

Ejemplos:

- tienda + vivienda;
- taller + vivienda;
- bar + vivienda;
- farmacia + vivienda;
- restaurante + hostal;
- explotación agrícola + vivienda;
- almacén + oficina;
- comercio + taller.

---

# 21. PROGRAMA DE ESTANCIAS

Una vez elegido el tipo, el sistema genera las habitaciones necesarias.

Ejemplo:

## Vivienda grande 12 x 12 x 2 plantas

### Planta baja

- recibidor;
- cocina;
- salón;
- comedor;
- baño;
- despensa/lavadero;
- garaje;
- distribuidor.

### Planta superior

- dormitorio principal;
- dormitorio 2;
- dormitorio 3;
- dormitorio 4;
- baño;
- posible estudio;
- distribuidor.

Otra semilla compatible podría generar:

- 3 dormitorios;
- despacho;
- vestidor;
- 2 baños.

La geometría final debe responder al programa, no al revés.

---

# 22. GRAFO DE ESTANCIAS

Antes del 3D puede generarse una red lógica:

```text
Entrada
  ↓
Salón ↔ Comedor ↔ Cocina
  ↓             ↓
Escalera      Despensa
  ↓
Distribuidor
 ↙ ↓  ↓  ↘
D1 D2 D3 Baño
```

El futuro generador físico utilizará esta información para:

- paredes;
- puertas;
- escaleras;
- pasillos;
- accesibilidad;
- muebles.

---

# 23. HABITACIÓN → MOBILIARIO → CONTENIDO

No generar objetos directamente desde el edificio.

Ejemplo:

```text
Vivienda
↓
Cocina
↓
Muebles de cocina
↓
Armario superior
↓
Objetos
```

---

# 24. EJEMPLO: COCINA

Puede generar:

- frigorífico;
- congelador opcional;
- cocina;
- horno;
- microondas;
- fregadero;
- armarios;
- cajones;
- despensa;
- mesa.

## Frigorífico

- perecederos;
- bebidas;
- condimentos;
- medicamentos refrigerados raros.

## Armario

- pasta;
- arroz;
- conservas;
- vasos;
- platos;
- recipientes.

## Cajón

- cubiertos;
- cuchillos;
- herramientas pequeñas.

---

# 25. PERFIL DE LOS ANTIGUOS OCUPANTES

Una vivienda NO debe contener objetos completamente independientes entre sí.

Debe generarse quién vivía allí.

Ejemplo:

```text
Adulto 1:
46 años
administrativo

Adulto 2:
44 años
mecánica

Adolescente:
15 años

Niño:
9 años

Nivel económico:
medio

Aficiones:
senderismo
jardinería

Mascota:
perro
```

Esto modifica probabilidades.

---

# 26. EJEMPLO DE COHERENCIA

## Garaje

Mayor probabilidad de:

- herramientas;
- repuestos;
- aceite;
- cargadores;
- manuales mecánicos;
- ropa de trabajo.

## Jardín

Mayor probabilidad de:

- herramientas;
- semillas;
- sustrato;
- fertilizante;
- mangueras.

## Dormitorio adolescente

- ordenador;
- auriculares;
- mochila;
- libros;
- ropa.

---

# 27. COMPOSICIÓN DEL HOGAR

Posibles configuraciones:

- una persona;
- pareja;
- pareja con hijos;
- familia numerosa;
- varias generaciones;
- compañeros de piso;
- anciano solo;
- segunda residencia;
- vivienda vacacional;
- alquiler temporal.

---

# 28. NIVEL ECONÓMICO

Posibles estratos:

- muy bajo;
- bajo;
- medio-bajo;
- medio;
- medio-alto;
- alto;
- muy alto.

No debe significar simplemente:

> mayor nivel económico = mejor loot.

Debe modificar:

- cantidad;
- calidad;
- tamaño;
- tecnología;
- vehículos;
- redundancia;
- espacio.

---

# 29. PROFESIONES DE OCUPANTES

Catálogo máximo inicial:

- médico;
- enfermero;
- auxiliar sanitario;
- veterinario;
- farmacéutico;
- mecánico;
- electricista;
- electrónico;
- informático;
- técnico de redes;
- fontanero;
- carpintero;
- albañil;
- soldador;
- agricultor;
- ganadero;
- forestal;
- cazador;
- pescador;
- cocinero;
- panadero;
- profesor;
- científico;
- químico;
- policía;
- militar;
- bombero;
- conductor;
- camionero;
- trabajador industrial;
- administrativo;
- técnico municipal;
- constructor;
- cerrajero;
- técnico de climatización.

---

# 30. AFICIONES

- radioafición;
- senderismo;
- escalada;
- camping;
- ciclismo;
- pesca;
- caza;
- jardinería;
- horticultura;
- electrónica;
- informática;
- fotografía;
- música;
- cocina;
- carpintería;
- bricolaje;
- restauración;
- coleccionismo;
- automoción;
- preparación/supervivencia.

---

# 31. TRAITS ESPECIALES

Algunos hogares pueden recibir características raras.

Ejemplos:

- preparacionista;
- radioaficionado;
- acumulador;
- coleccionista;
- mecánico aficionado;
- jardinero intensivo;
- enfermero;
- informático;
- supervivencialista;
- cazador;
- deportista de montaña.

---

# 32. EJEMPLO: RADIOAFICIONADO

Vivienda normal.

Trait:

> Radioaficionado.

Puede generar:

- emisora;
- antena;
- fuentes;
- baterías;
- coaxial;
- mapas;
- manuales;
- componentes;
- contactos escritos;
- registros.

---

# 33. HISTORIA DEL EDIFICIO DURANTE EL APOCALIPSIS

Después de generar su estado normal, debe aplicarse una historia.

Posibles situaciones:

- abandono normal;
- evacuación ordenada;
- huida precipitada;
- ocupantes nunca salieron;
- primer saqueo;
- múltiples saqueos;
- utilizado como refugio;
- ocupado temporalmente;
- defendido;
- atacado;
- incendio;
- inundación;
- derrumbe;
- cuarentena;
- centro improvisado;
- presencia reciente.

---

# 34. EVACUACIÓN ORDENADA

Los ocupantes tuvieron tiempo para llevarse:

- documentación;
- medicamentos personales;
- ropa;
- comida;
- combustible;
- vehículo;
- objetos de valor.

Quedan:

- muebles;
- instalaciones;
- libros;
- objetos pesados;
- herramientas menos prioritarias.

---

# 35. HUIDA PRECIPITADA

Pueden quedar:

- comida;
- coches;
- mochilas;
- medicación;
- puertas abiertas;
- objetos tirados;
- recursos preparados pero abandonados.

---

# 36. FAMILIA QUE NO SALIÓ

Puede implicar:

- contenido elevado;
- vehículos;
- peligro;
- cadáveres;
- zombis;
- puertas cerradas;
- recursos intactos.

---

# 37. EDIFICIO SAQUEADO

NO aplicar únicamente:

> -70 % objetos aleatorios.

Los saqueadores tienen prioridades.

Normalmente buscarían:

1. alimentos;
2. agua;
3. medicamentos;
4. armas;
5. combustible;
6. herramientas obvias;
7. baterías;
8. ropa útil.

Y pueden ignorar:

- manuales;
- libros;
- documentación;
- componentes;
- cableado;
- maquinaria desconocida;
- piezas;
- semillas poco identificables;
- bombas;
- motores.

---

# 38. PRINCIPIO FUNDAMENTAL NUEVO: EL SAQUEO ES ESPACIALMENTE CORRELACIONADO

El estado de saqueo NO debe decidirse edificio por edificio mediante tiradas aisladas.

Si una farmacia está totalmente saqueada:

> aumenta mucho la probabilidad de que los comercios cercanos también lo estén.

Los saqueos históricos deben existir:

> POR ZONAS.

---

# 39. MAPA DE PRESIÓN HISTÓRICA DE SAQUEO

Cada asentamiento debe generar una especie de:

> mapa de presión de saqueo.

No necesariamente visible al jugador.

Puede tener zonas:

- casi intactas;
- saqueo ligero;
- saqueo moderado;
- saqueo alto;
- saqueo extremo;
- exhaustas.

---

# 40. FACTORES QUE AUMENTAN LA PRESIÓN DE SAQUEO

- centro del pueblo;
- calles principales;
- zonas comerciales;
- proximidad a supermercado;
- farmacia;
- gasolinera;
- ferretería;
- hospital;
- estación;
- carretera principal;
- ruta de evacuación;
- edificios fácilmente accesibles;
- lugares visibles;
- áreas densamente pobladas;
- cercanía a antiguos refugios;
- proximidad a comunidades posteriores.

---

# 41. FACTORES QUE REDUCEN LA PRESIÓN

- calles secundarias;
- callejones;
- viviendas escondidas;
- zonas de montaña;
- edificios aislados;
- accesos difíciles;
- puertas cerradas;
- edificios peligrosos;
- inundaciones;
- incendios;
- derrumbes;
- zonas infestadas;
- plantas superiores;
- sótanos;
- edificios que desde fuera parecen poco útiles.

---

# 42. CORRELACIÓN LOCAL

El estado de edificios próximos debe influirse mutuamente.

Ejemplo:

```text
Supermercado: saqueo extremo
Farmacia contigua: saqueo extremo
Bar: saqueo alto
Ferretería a 30 m: saqueo alto
Casas detrás: saqueo medio
Casa en calle secundaria: saqueo bajo
Sótano oculto: intacto
```

---

# 43. RUTAS HISTÓRICAS DE SAQUEO

Además del mapa de presión, el mundo puede simular recorridos históricos de grupos saqueadores.

Ejemplo:

```text
Refugio temporal
↓
Supermercado
↓
Farmacia
↓
Gasolinera
↓
Ferretería
↓
Salida del pueblo
```

Otro grupo:

```text
Barrio residencial
↓
Vehículos
↓
Tienda de camping
↓
Carretera norte
```

Esto crea:

> corredores de saqueo.

---

# 44. BOLSAS OLVIDADAS

Entre corredores muy explotados deben existir áreas poco tocadas.

Ejemplo:

Una calle secundaria:

- supermercado cercano destruido;
- casas principales saqueadas;

pero detrás:

> una pequeña vivienda prácticamente intacta.

Esto recompensa:

- explorar;
- desviarse;
- observar;
- investigar lugares menos evidentes.

---

# 45. LA ZONA NO DEBE IMPONER UN RESULTADO ABSOLUTO

La presión zonal es una influencia.

No una regla total.

Cada edificio recibe además:

- atractivo;
- accesibilidad;
- visibilidad;
- resistencia;
- valor percibido;
- riesgo;
- ocultación;
- aleatoriedad;
- historia individual.

---

# 46. POSIBLE MODELO INTERNO

Conceptualmente:

```text
finalLootingScore =
    zoneLootPressure
  + roadAccessibility
  + perceivedValue
  + localNeighborInfluence
  + evacuationRouteInfluence
  + priorGroupRoutes
  + buildingVisibility
  - danger
  - concealment
  - accessDifficulty
  + randomVariation
```

No es una fórmula cerrada.

Sirve para fijar la arquitectura.

---

# 47. VALOR PERCIBIDO VS VALOR REAL

Los saqueadores previos no son omniscientes.

Ejemplo:

## Farmacia

Valor percibido:
muy alto.

Resultado:
probablemente saqueada.

## Centro de datos

Valor percibido para población general:
medio o bajo.

Valor real para nuestra comunidad:
enorme.

Puede quedar bastante intacto.

---

# 48. EDIFICIOS ESPECIALIZADOS PUEDEN SOBREVIVIR AL SAQUEO

Ejemplos:

- estación de bombeo;
- transformador;
- archivo municipal;
- laboratorio;
- sala técnica;
- servidor;
- sala de calderas.

La gente común podría ignorarlos.

Para un especialista pueden ser extremadamente valiosos.

---

# 49. SAQUEO DINÁMICO DURANTE LA PARTIDA

El mapa de saqueo no tiene por qué quedar congelado.

Otras comunidades pueden:

- explorar;
- saquear;
- recuperar vehículos;
- vaciar supermercados;
- desmontar instalaciones;
- ocupar edificios.

Por tanto:

> el mundo puede seguir perdiendo recursos aunque el jugador no esté presente.

Este punto debe evaluarse más adelante según coste de simulación.

---

# 50. LA EXPLORACIÓN DE UN LUGAR NO ES BINARIA

No:

> sin explorar / explorado.

Puede existir:

- reconocido;
- visitado;
- registrado;
- registrado profundamente;
- evaluado por especialista.

---

# 51. QUIÉN REGISTRA CAMBIA QUÉ SE DESCUBRE

Los objetos EXISTEN.

El personaje:

> los interpreta.

---

# 52. EJEMPLO DE GARAJE

Contenido real:

- caja de tornillos;
- alternador;
- bomba rota;
- correas;
- manual técnico;
- motor.

Persona normal:

```text
Herramientas
Piezas metálicas
Máquina rota
Libro técnico
Chatarra
```

Mecánico:

```text
Juego de tornillería
Alternador recuperable
Bomba reparable
Correas compatibles
Manual de bombas
Motor funcional
```

---

# 53. EJEMPLO MÉDICO

Persona corriente:

> medicamentos.

Sanitario:

- antibiótico;
- analgésico;
- anticoagulante;
- material estéril;
- medicamento caducado;
- medicamento que necesita refrigeración.

---

# 54. EJEMPLO ELÉCTRICO

Persona normal:

> caja eléctrica.

Electricista:

> variador de frecuencia posiblemente funcional.

---

# 55. EJEMPLO INFORMÁTICO

Persona normal:

> tres PCs rotos.

Informático:

- fuente aprovechable;
- RAM compatible;
- disco SATA posiblemente funcional;
- placa dañada;
- ventiladores recuperables.

---

# 56. REGISTRAR DOS VECES PUEDE TENER SENTIDO

Una primera visita puede producir:

> "hay equipamiento mecánico que no sabemos evaluar."

Meses después:

> enviamos un especialista.

Esto debe ser válido.

---

# 57. LOOT DESCONOCIDO

El sistema podría mantener categorías conceptuales como:

- objeto identificado;
- objeto parcialmente identificado;
- objeto desconocido;
- potencialmente útil;
- no evaluado.

---

# 58. DESMONTAJE TAMBIÉN DEPENDE DEL CONOCIMIENTO

Ejemplo:

Una persona cualquiera ve:

> calentador viejo.

Fontanero:

- termo de 100 L;
- válvula;
- depósito;
- conexiones;
- resistencia.

Electricista:

- termostato;
- cableado;
- resistencia;
- protección.

Por tanto:

> incluso las instalaciones poseen conocimiento oculto.

---

# 59. RECURSOS DE UNA VIVIENDA VACÍA

Incluso completamente saqueada puede conservar:

## Electricidad

- cable;
- cuadros;
- mecanismos;
- luminarias.

## Agua

- tuberías;
- sanitarios;
- válvulas;
- calentador.

## Calefacción

- radiadores;
- caldera;
- estufa.

## Carpintería

- puertas;
- ventanas;
- armarios.

## Estructura

- vigas;
- ladrillo;
- piedra;
- madera;
- metal.

Una vivienda vacía NO debe ser inútil.

---

# 60. DECISIÓN ESTRATÉGICA SOBRE EDIFICIOS VECINOS

Ejemplo:

Nuestra base tiene cinco viviendas próximas.

Podemos:

### Conservar

Para:

- alojar;
- expandir;
- almacenar;
- defender.

### Desmontar parcialmente

Recuperar:

- cable;
- calentadores;
- tuberías;
- puertas;
- ventanas.

### Desmantelar

Recuperar muchos materiales.

### Demoler

Obtener recursos rápidamente.

Pero destruimos capacidad futura.

---

# 61. CONOCIMIENTO COMO PARTE DEL CONTENIDO

Los edificios pueden contener:

- libros;
- manuales;
- documentos;
- cintas;
- DVD;
- pendrives;
- discos;
- servidores;
- planos;
- mapas;
- procedimientos.

Esto conecta con el sistema de conocimiento ya diseñado.

---

# 62. UN EDIFICIO PUEDE DESBLOQUEAR INFORMACIÓN SOBRE OTROS LUGARES

Ejemplo:

## Ayuntamiento

Contiene:

- planos de agua;
- contratos;
- cartografía;
- mantenimiento;
- censos.

Puede descubrir:

> depósito de agua en montaña.

## Cooperativa agrícola

Puede revelar:

- pozos;
- parcelas;
- silos;
- granjas;
- almacenes.

## Ordenador doméstico

Puede contener:

- mapas;
- documentación;
- archivos profesionales.

Por tanto:

> saquear conocimiento también modifica el mapamundi.

---

# 63. CATÁLOGO MÁXIMO DE LUGARES

La filosofía es crear primero un catálogo enorme y reducir después.

NO limitar ahora por coste.

## A. RESIDENCIAL

RES-01 — Apartamento estudio  
RES-02 — Apartamento pequeño  
RES-03 — Apartamento familiar  
RES-04 — Apartamento grande  
RES-05 — Bloque pequeño de apartamentos  
RES-06 — Bloque residencial grande  
RES-07 — Casa adosada  
RES-08 — Casa pareada  
RES-09 — Casa familiar pequeña  
RES-10 — Casa familiar mediana  
RES-11 — Casa familiar grande  
RES-12 — Chalet  
RES-13 — Villa  
RES-14 — Mansión  
RES-15 — Casa de pueblo antigua  
RES-16 — Casa de montaña  
RES-17 — Cabaña  
RES-18 — Refugio particular  
RES-19 — Vivienda con garaje/taller  
RES-20 — Vivienda con negocio  
RES-21 — Vivienda con huerto  
RES-22 — Vivienda con corral  
RES-23 — Casa en construcción  
RES-24 — Casa en reforma  
RES-25 — Vivienda abandonada  
RES-26 — Segunda residencia  
RES-27 — Casa rural  
RES-28 — Masía / finca rural  
RES-29 — Vivienda sobre comercio  
RES-30 — Complejo residencial cerrado  

## B. COMERCIO ALIMENTARIO

COM-01 — Tienda de alimentación  
COM-02 — Supermercado pequeño  
COM-03 — Supermercado grande  
COM-04 — Hipermercado  
COM-05 — Frutería  
COM-06 — Carnicería  
COM-07 — Pescadería  
COM-08 — Panadería  
COM-09 — Pastelería  
COM-10 — Tienda gourmet  
COM-11 — Tienda de congelados  
COM-12 — Mayorista alimentario  
COM-13 — Mercado municipal  
COM-14 — Puesto de mercado  
COM-15 — Tienda ecológica  
COM-16 — Almacén de bebidas  

## C. COMERCIO GENERAL

COM-17 — Ferretería  
COM-18 — Tienda de bricolaje  
COM-19 — Materiales de construcción  
COM-20 — Tienda eléctrica  
COM-21 — Tienda de fontanería  
COM-22 — Electrodomésticos  
COM-23 — Informática  
COM-24 — Electrónica  
COM-25 — Telefonía  
COM-26 — Librería  
COM-27 — Papelería  
COM-28 — Quiosco  
COM-29 — Tienda de ropa  
COM-30 — Zapatería  
COM-31 — Tienda deportiva  
COM-32 — Tienda de montaña/camping  
COM-33 — Tienda de bicicletas  
COM-34 — Recambios de automóvil  
COM-35 — Mueblería  
COM-36 — Segunda mano  
COM-37 — Anticuario  
COM-38 — Joyería  
COM-39 — Floristería  
COM-40 — Tienda agrícola  
COM-41 — Tienda para animales  
COM-42 — Armería / caza  
COM-43 — Tienda multiprecio  
COM-44 — Tienda de pintura  
COM-45 — Tienda de herramientas profesionales  
COM-46 — Venta de maquinaria  

## D. HOSTELERÍA Y ALOJAMIENTO

HOS-01 — Bar  
HOS-02 — Cafetería  
HOS-03 — Restaurante pequeño  
HOS-04 — Restaurante grande  
HOS-05 — Restaurante de carretera  
HOS-06 — Pizzería  
HOS-07 — Comida rápida  
HOS-08 — Comedor colectivo  
HOS-09 — Hotel pequeño  
HOS-10 — Hotel grande  
HOS-11 — Hostal  
HOS-12 — Pensión  
HOS-13 — Albergue  
HOS-14 — Refugio de montaña  
HOS-15 — Camping  
HOS-16 — Área de autocaravanas  
HOS-17 — Motel  
HOS-18 — Casa rural  
HOS-19 — Restaurante con vivienda  
HOS-20 — Bar con vivienda  

## E. SANIDAD Y ASISTENCIA

SAN-01 — Consulta médica  
SAN-02 — Centro de salud  
SAN-03 — Hospital pequeño  
SAN-04 — Hospital grande  
SAN-05 — Clínica privada  
SAN-06 — Clínica dental  
SAN-07 — Fisioterapia  
SAN-08 — Farmacia  
SAN-09 — Laboratorio clínico  
SAN-10 — Clínica veterinaria  
SAN-11 — Residencia de ancianos  
SAN-12 — Centro de día  
SAN-13 — Guardería  
SAN-14 — Centro social  
SAN-15 — Refugio asistencial  
SAN-16 — Centro de rehabilitación  
SAN-17 — Banco de sangre  
SAN-18 — Almacén sanitario  
SAN-19 — Consultorio rural  
SAN-20 — Centro de emergencias médicas  

## F. EDUCACIÓN

EDU-01 — Escuela infantil  
EDU-02 — Escuela primaria  
EDU-03 — Instituto  
EDU-04 — Formación profesional  
EDU-05 — Escuela agrícola  
EDU-06 — Escuela técnica  
EDU-07 — Universidad  
EDU-08 — Laboratorio universitario  
EDU-09 — Biblioteca escolar  
EDU-10 — Academia privada  
EDU-11 — Autoescuela  
EDU-12 — Escuela de idiomas  
EDU-13 — Taller educativo  
EDU-14 — Residencia de estudiantes  
EDU-15 — Centro de formación empresarial  

## G. CULTURA Y CONOCIMIENTO

CUL-01 — Biblioteca pública  
CUL-02 — Archivo municipal  
CUL-03 — Museo  
CUL-04 — Centro cultural  
CUL-05 — Teatro  
CUL-06 — Cine  
CUL-07 — Sala de exposiciones  
CUL-08 — Editorial  
CUL-09 — Imprenta  
CUL-10 — Periódico local  
CUL-11 — Radio local  
CUL-12 — Televisión local  
CUL-13 — Archivo histórico  
CUL-14 — Biblioteca especializada  
CUL-15 — Centro documental  

## H. ADMINISTRACIÓN

ADM-01 — Ayuntamiento  
ADM-02 — Oficina municipal  
ADM-03 — Correos  
ADM-04 — Banco  
ADM-05 — Notaría  
ADM-06 — Registro  
ADM-07 — Juzgado  
ADM-08 — Oficina de empleo  
ADM-09 — Oficina turística  
ADM-10 — Oficina forestal  
ADM-11 — Oficina agrícola  
ADM-12 — Centro comunitario  
ADM-13 — Hacienda / administración tributaria  
ADM-14 — Servicios técnicos municipales  
ADM-15 — Obras públicas  
ADM-16 — Almacén municipal  

## I. EMERGENCIA Y SEGURIDAD

SEG-01 — Policía  
SEG-02 — Guardia Civil / puesto rural  
SEG-03 — Bomberos  
SEG-04 — Protección Civil  
SEG-05 — Base de ambulancias  
SEG-06 — Seguridad privada  
SEG-07 — Centro de emergencias  
SEG-08 — Cárcel  
SEG-09 — Depósito de vehículos  
SEG-10 — Campo de tiro  
SEG-11 — Cuartel militar  
SEG-12 — Búnker militar  
SEG-13 — Almacén militar  
SEG-14 — Puesto de control  
SEG-15 — Centro de coordinación  
SEG-16 — Refugio civil  

## J. TALLERES Y OFICIOS

TAL-01 — Taller mecánico  
TAL-02 — Taller de motocicletas  
TAL-03 — Taller de bicicletas  
TAL-04 — Taller de camiones  
TAL-05 — Taller agrícola  
TAL-06 — Chapa y pintura  
TAL-07 — Neumáticos  
TAL-08 — Carpintería  
TAL-09 — Ebanistería  
TAL-10 — Herrería  
TAL-11 — Soldadura  
TAL-12 — Cerrajería  
TAL-13 — Electricista  
TAL-14 — Fontanero  
TAL-15 — Climatización  
TAL-16 — Electrodomésticos  
TAL-17 — Reparación electrónica  
TAL-18 — Reparación informática  
TAL-19 — Taller textil  
TAL-20 — Zapatero  
TAL-21 — Vidrio  
TAL-22 — Cantería  
TAL-23 — Pintura  
TAL-24 — Empresa de construcción  
TAL-25 — Reparación de maquinaria  
TAL-26 — Bobinado de motores  
TAL-27 — Taller hidráulico  
TAL-28 — Taller de herramientas  

## K. INDUSTRIA

IND-01 — Fábrica genérica  
IND-02 — Metalúrgica  
IND-03 — Planta de mecanizado  
IND-04 — Fábrica electrónica  
IND-05 — Industria alimentaria  
IND-06 — Embotelladora  
IND-07 — Cervecería  
IND-08 — Bodega  
IND-09 — Industria láctea  
IND-10 — Matadero  
IND-11 — Aserradero  
IND-12 — Fábrica de muebles  
IND-13 — Fábrica textil  
IND-14 — Industria química  
IND-15 — Cementera  
IND-16 — Prefabricados  
IND-17 — Ladrillera  
IND-18 — Planta de reciclaje  
IND-19 — Fábrica de plástico  
IND-20 — Taller industrial  
IND-21 — Planta de envases  
IND-22 — Fundición  
IND-23 — Planta de tratamiento de madera  

## L. LOGÍSTICA Y ALMACENAMIENTO

LOG-01 — Almacén pequeño  
LOG-02 — Almacén industrial  
LOG-03 — Centro logístico  
LOG-04 — Nave de distribución  
LOG-05 — Cámara frigorífica  
LOG-06 — Almacén alimentario  
LOG-07 — Almacén farmacéutico  
LOG-08 — Almacén agrícola  
LOG-09 — Almacén de materiales  
LOG-10 — Depósito de combustible  
LOG-11 — Desguace  
LOG-12 — Chatarrería  
LOG-13 — Vertedero  
LOG-14 — Punto limpio  
LOG-15 — Almacén de repuestos  
LOG-16 — Patio logístico  
LOG-17 — Centro de distribución postal  
LOG-18 — Depósito municipal  

## M. AGRICULTURA

AGR-01 — Pequeña granja familiar  
AGR-02 — Explotación agrícola grande  
AGR-03 — Huerto profesional  
AGR-04 — Invernadero  
AGR-05 — Vivero vegetal  
AGR-06 — Frutales  
AGR-07 — Viñedo  
AGR-08 — Olivar  
AGR-09 — Campo cerealista  
AGR-10 — Plantación especializada  
AGR-11 — Cobertizo agrícola  
AGR-12 — Almacén de semillas  
AGR-13 — Almacén de fertilizantes  
AGR-14 — Taller agrícola  
AGR-15 — Sistema de irrigación  
AGR-16 — Molino  
AGR-17 — Silo  
AGR-18 — Cooperativa agrícola  
AGR-19 — Secadero  
AGR-20 — Almacén de maquinaria  
AGR-21 — Planta de selección de semillas  
AGR-22 — Centro de empaquetado agrícola  

## N. GANADERÍA

GAN-01 — Granja bovina  
GAN-02 — Granja ovina  
GAN-03 — Granja caprina  
GAN-04 — Granja porcina  
GAN-05 — Granja avícola  
GAN-06 — Granja lechera  
GAN-07 — Establo  
GAN-08 — Picadero  
GAN-09 — Criadero  
GAN-10 — Colmenar  
GAN-11 — Almacén de pienso  
GAN-12 — Matadero rural  
GAN-13 — Quesería  
GAN-14 — Sala de ordeño  
GAN-15 — Centro veterinario rural  
GAN-16 — Pastizal cercado  

## O. FORESTAL

FOR-01 — Caseta forestal  
FOR-02 — Base de brigada  
FOR-03 — Almacén forestal  
FOR-04 — Aserradero  
FOR-05 — Vivero forestal  
FOR-06 — Torre de vigilancia  
FOR-07 — Refugio forestal  
FOR-08 — Parque de maquinaria forestal  
FOR-09 — Centro de prevención de incendios  

## P. AGUA

AGU-01 — Pozo  
AGU-02 — Manantial acondicionado  
AGU-03 — Depósito de agua  
AGU-04 — Torre de agua  
AGU-05 — Estación de bombeo  
AGU-06 — Potabilizadora  
AGU-07 — Planta de tratamiento  
AGU-08 — Depuradora  
AGU-09 — Embalse  
AGU-10 — Presa  
AGU-11 — Canalización principal  
AGU-12 — Sistema de riego  
AGU-13 — Cámara de válvulas  
AGU-14 — Estación de control  
AGU-15 — Captación de agua  
AGU-16 — Depósito contra incendios  

## Q. ENERGÍA

ENE-01 — Centro de transformación  
ENE-02 — Subestación  
ENE-03 — Central eléctrica  
ENE-04 — Hidroeléctrica  
ENE-05 — Parque solar  
ENE-06 — Instalación eólica  
ENE-07 — Generador de emergencia  
ENE-08 — Planta de biomasa  
ENE-09 — Almacén de baterías  
ENE-10 — Depósito de combustible  
ENE-11 — Gasolinera  
ENE-12 — Planta de gas  
ENE-13 — Sala de calderas  
ENE-14 — Parque de generadores  
ENE-15 — Instalación fotovoltaica doméstica  
ENE-16 — Microcentral hidroeléctrica  

## R. TELECOMUNICACIONES

TEL-01 — Antena de telefonía  
TEL-02 — Central telefónica  
TEL-03 — Repetidor  
TEL-04 — Emisora de radio  
TEL-05 — Centro de comunicaciones  
TEL-06 — Estación meteorológica  
TEL-07 — Centro de datos  
TEL-08 — Sala de servidores  
TEL-09 — Radioaficionado particular  
TEL-10 — Nodo de fibra  
TEL-11 — Torre de comunicaciones  
TEL-12 — Centro de control  

## S. TRANSPORTE

TRA-01 — Gasolinera  
TRA-02 — Taller de carretera  
TRA-03 — Parking  
TRA-04 — Parking subterráneo  
TRA-05 — Estación de autobuses  
TRA-06 — Cochera de autobuses  
TRA-07 — Estación ferroviaria  
TRA-08 — Depósito ferroviario  
TRA-09 — Taller ferroviario  
TRA-10 — Mantenimiento de carreteras  
TRA-11 — Almacén de vialidad  
TRA-12 — Peaje  
TRA-13 — Túnel / mantenimiento  
TRA-14 — Estación de servicio  
TRA-15 — Concesionario  
TRA-16 — Alquiler de vehículos  
TRA-17 — Helipuerto  
TRA-18 — Aeródromo  
TRA-19 — Aeropuerto  
TRA-20 — Aparcamiento de camiones  
TRA-21 — Báscula / control logístico  
TRA-22 — Centro de quitanieves  

## T. TURISMO Y OCIO

OCI-01 — Oficina turística  
OCI-02 — Centro de visitantes  
OCI-03 — Refugio de montaña  
OCI-04 — Estación de esquí  
OCI-05 — Remonte  
OCI-06 — Teleférico  
OCI-07 — Alquiler de montaña  
OCI-08 — Gimnasio  
OCI-09 — Polideportivo  
OCI-10 — Piscina  
OCI-11 — Campo deportivo  
OCI-12 — Club deportivo  
OCI-13 — Centro ecuestre  
OCI-14 — Parque de aventuras  
OCI-15 — Área recreativa  
OCI-16 — Camping  
OCI-17 — Spa  
OCI-18 — Discoteca  
OCI-19 — Sala de juegos  
OCI-20 — Cine  
OCI-21 — Centro de escalada  
OCI-22 — Alquiler de bicicletas  
OCI-23 — Parque natural / centro de interpretación  

## U. RELIGIOSO Y FUNERARIO

REL-01 — Iglesia  
REL-02 — Capilla  
REL-03 — Monasterio  
REL-04 — Convento  
REL-05 — Cementerio  
REL-06 — Tanatorio  
REL-07 — Funeraria  
REL-08 — Casa parroquial  
REL-09 — Almacén parroquial  
REL-10 — Refugio religioso  

## V. LOCALIZACIONES ESPECIALES / NARRATIVAS

ESP-01 — Refugio preparacionista  
ESP-02 — Búnker civil  
ESP-03 — Casa de radioaficionado  
ESP-04 — Casa de mecánico  
ESP-05 — Casa de sanitario  
ESP-06 — Casa de agricultor  
ESP-07 — Casa de informático  
ESP-08 — Casa de coleccionista  
ESP-09 — Taller clandestino  
ESP-10 — Laboratorio clandestino  
ESP-11 — Escondite criminal  
ESP-12 — Refugio de supervivientes  
ESP-13 — Campamento abandonado  
ESP-14 — Hospital improvisado  
ESP-15 — Centro de evacuación  
ESP-16 — Centro de cuarentena  
ESP-17 — Puesto militar improvisado  
ESP-18 — Comunidad abandonada  
ESP-19 — Edificio fortificado  
ESP-20 — Edificio incendiado  
ESP-21 — Edificio inundado  
ESP-22 — Edificio derrumbado  
ESP-23 — Edificio saqueado  
ESP-24 — Edificio ocupado recientemente  
ESP-25 — Taller improvisado  
ESP-26 — Almacén secreto  
ESP-27 — Refugio subterráneo  
ESP-28 — Vivienda tapiada  
ESP-29 — Edificio trampa  
ESP-30 — Almacén oculto  

Muchos de estos NO deben ser edificios base.

Deben generarse como modificadores.

Ejemplo:

```text
RES-10 Casa familiar mediana
+
Trait Radioaficionado
+
Historia Huida precipitada
+
Zona de saqueo bajo
```

---

# 64. CATÁLOGO DE ESTANCIAS POTENCIALES

La documentación final debe crear también un catálogo máximo de habitaciones.

## Residenciales

- recibidor;
- salón;
- comedor;
- cocina;
- dormitorio;
- baño;
- aseo;
- despacho;
- biblioteca;
- lavadero;
- despensa;
- trastero;
- vestidor;
- sótano;
- garaje;
- buhardilla;
- terraza.

## Comerciales

- sala de venta;
- caja;
- escaparate;
- almacén;
- oficina;
- cámara;
- carga/descarga.

## Industriales

- producción;
- mantenimiento;
- maquinaria;
- control;
- almacén;
- vestuario;
- sala eléctrica;
- sala mecánica.

## Sanitarias

- recepción;
- espera;
- consulta;
- tratamiento;
- quirófano;
- enfermería;
- farmacia;
- laboratorio.

La especificación formal debe ampliar esta taxonomía.

---

# 65. INSTALACIONES SEGÚN EDAD DEL EDIFICIO

La época de construcción debe influir.

## Casa antigua

Puede tener:

- tubería metálica;
- cableado antiguo;
- chimenea;
- muros de piedra;
- pocos circuitos.

## Casa moderna

Puede tener:

- PEX/PVC;
- cableado abundante;
- cuadro moderno;
- aire acondicionado;
- red Ethernet;
- placas solares.

Esto cambia qué puede recuperarse.

---

# 66. DETERIORO

El tiempo y el abandono deben afectar:

- tejado;
- humedad;
- corrosión;
- baterías;
- alimentos;
- madera;
- electrónica;
- combustibles;
- vehículos;
- medicamentos;
- documentación.

---

# 67. FUNCIONALIDAD PARCIAL

Los objetos pueden estar:

- funcionales;
- degradados;
- averiados;
- incompletos;
- reparables;
- irreparables;
- útiles solo como piezas.

Lo mismo para:

- edificios;
- instalaciones;
- maquinaria.

---

# 68. UN EDIFICIO PUEDE SER REUTILIZADO

No todo debe desmontarse.

El jugador puede rehabilitar:

- vivienda;
- taller;
- almacén;
- hospital;
- granja;
- instalación de agua.

Por eso destruir debe ser una decisión irreversible importante.

---

# 69. RELACIÓN CON LAS PRIORIDADES DE TRABAJO

Debe integrarse con las prioridades ya diseñadas.

## Saqueo y recuperación

Registrar contenido.

## Desmontaje y reciclaje

Recuperar:

- muebles;
- instalaciones;
- componentes.

## Reparación

Restaurar equipos.

## Mantenimiento

Conservar sistemas.

## Construcción

Rehabilitar o modificar.

## Logística

Transportar lo recuperado.

## Catalogar conocimiento

Clasificar documentación.

## Estudiar

Comprenderla.

## Experimentar / cacharrear

Intentar aprovechar tecnología desconocida.

---

# 70. RELACIÓN CON MAPA LOCAL Y MAPAMUNDI

En mapa local:

- edificio;
- habitaciones;
- saqueo;
- desmontaje;
- reutilización.

En mapamundi:

- edificios pueden ser POIs;
- conocimiento puede revelar ubicaciones;
- rutas de saqueo pueden explicar zonas devastadas;
- otras comunidades pueden competir por localizaciones.

---

# 71. GENERACIÓN DETERMINISTA

Todo edificio debería derivarse de:

> seed.

Así debe poder:

- regenerarse;
- depurarse;
- reproducirse;
- guardarse eficientemente.

Las tiradas importantes deben ser deterministas respecto a:

- seed mundial;
- seed de asentamiento;
- seed de parcela;
- seed de edificio.

---

# 72. NO GENERAR LOOT AL ABRIR UN CONTENEDOR

Idealmente el contenido conceptual debe existir desde la generación del edificio.

Aunque por rendimiento se materialice más tarde, el resultado no debería depender de:

> el momento en el que el jugador abre el armario.

---

# 73. HISTORIA AMBIENTAL

El sistema debe permitir que el jugador reconstruya pequeñas historias sin texto explícito.

Ejemplo:

- maletas junto a puerta;
- coche cargado;
- comida preparada;
- cama deshecha;
- puerta rota.

Sugiere:

> intento de evacuación.

Otro:

- barricadas;
- latas;
- colchones;
- radio;
- restos recientes.

Sugiere:

> refugio posterior.

---

# 74. HISTORIA DEL LUGAR Y LOOT DEBEN ESTAR CONECTADOS

No colocar narrativa decorativa sin consecuencias.

Si hubo evacuación:

> faltan recursos de viaje.

Si hubo refugio:

> aparecen consumibles posteriores.

Si fue saqueado:

> desaparece loot evidente.

---

# 75. EDIFICIOS MEMORABLES

No queremos:

> Casa #42.

Queremos:

> La casa del radioaficionado.

> El chalet donde encontramos los libros de agricultura.

> El taller que tenía el generador.

> La vivienda de la que sacamos todo el cableado.

> La calle que estaba completamente saqueada excepto una casa.

---

# 76. PREGUNTAS QUE LA DOCUMENTACIÓN FORMAL DEBE RESOLVER

## Mundo

1. ¿Cómo se dividen regiones, asentamientos y zonas?
2. ¿Cómo se crean calles?
3. ¿Cómo se asignan usos?
4. ¿Cómo se crean parcelas?
5. ¿Cómo influye el contexto?

## Edificios

6. ¿Qué atributos mínimos tiene Building?
7. ¿Cómo se selecciona arquetipo?
8. ¿Cómo se crean subtipos?
9. ¿Cómo se calcula superficie?
10. ¿Cómo se generan plantas?
11. ¿Cómo se genera el programa?
12. ¿Cómo se genera el grafo?

## Ocupantes

13. ¿Cómo se crean hogares?
14. ¿Cómo se generan profesiones?
15. ¿Aficiones?
16. ¿Nivel económico?
17. ¿Cómo afectan al contenido?

## Loot

18. ¿Cómo se crean contenedores?
19. ¿Cómo se asignan familias de objetos?
20. ¿Qué es contenido visible?
21. ¿Qué es contenido especializado?
22. ¿Cómo afecta la persona que registra?

## Saqueo histórico

23. ¿Cómo se calcula la presión zonal?
24. ¿Cómo se propaga?
25. ¿Cómo se crean corredores?
26. ¿Cómo se generan bolsas intactas?
27. ¿Cómo interactúa edificio y zona?
28. ¿Cómo afectan otras comunidades?
29. ¿Debe cambiar dinámicamente?

## Instalaciones

30. ¿Cómo se representa electricidad?
31. ¿Agua?
32. ¿Calefacción?
33. ¿Comunicaciones?
34. ¿Ventilación?
35. ¿Qué componentes se extraen?

## Desmontaje

36. ¿Qué conocimientos requiere?
37. ¿Qué herramientas?
38. ¿Cuánto tarda?
39. ¿Cuánto se pierde?

## Demolición

40. ¿Qué materiales produce?
41. ¿Cómo afecta al mapa?
42. ¿Cómo se generan escombros?

## Reutilización

43. ¿Cómo se declara edificio propio?
44. ¿Cómo se rehabilita?
45. ¿Cómo se reconecta a servicios?

## 3D

46. ¿Cómo se transforma el programa semántico en geometría?
47. ¿Cómo se sitúan muebles?
48. ¿Cómo se mantienen rutas navegables?
49. ¿Cómo se representan instalaciones?

---

# 77. ESTRUCTURAS DE DATOS QUE DEBERÍAN EXISTIR CONCEPTUALMENTE

La documentación futura debe estudiar algo similar a:

```text
Building
Room
BuildingSystem
Fixture
Furniture
Container
Item
StructuralComponent
OccupantProfile
Household
BusinessProfile
BuildingHistory
LootPressureZone
LootingRoute
LootingEvent
KnowledgeSource
DiscoveryState
BuildingCondition
```

No tomar estos nombres todavía como implementación final.

---

# 78. EJEMPLO DE BUILDING CONCEPTUAL

```json
{
  "type": "RESIDENTIAL",
  "subtype": "FAMILY_HOUSE_LARGE",
  "width": 12,
  "length": 12,
  "floors": 2,
  "district": "RESIDENTIAL_EDGE",
  "constructionEra": "1990_2010",
  "household": {
    "size": 4,
    "economicTier": "MIDDLE",
    "professions": ["OFFICE_WORKER", "MECHANIC"],
    "hobbies": ["HIKING", "GARDENING"]
  },
  "history": {
    "apocalypseEvent": "HASTY_EVACUATION",
    "zoneLootPressure": "MEDIUM",
    "buildingLooting": "LIGHT"
  }
}
```

Ejemplo conceptual únicamente.

---

# 79. EJEMPLO DE PRESIÓN DE SAQUEO

Zona comercial principal:

```text
Loot pressure: VERY HIGH

Supermercado:
EXHAUSTED

Farmacia:
HEAVY

Ferretería:
HEAVY

Bar:
MODERATE

Pisos superiores:
LIGHT/MODERATE
```

Calle secundaria a 150 metros:

```text
Loot pressure: LOW

Casa A:
LIGHT

Casa B:
UNTOUCHED

Casa C:
MODERATE
```

Esto hace que explorar siga siendo interesante incluso dentro de zonas conocidas.

---

# 80. PRINCIPIO FINAL SOBRE EL SAQUEO ZONAL

El jugador debe poder aprender patrones.

Ejemplo:

> Esta carretera parece haber sido muy saqueada.

Eso puede llevar a:

> buscar calles secundarias.

Pero nunca debe permitir concluir:

> toda la zona está vacía.

Debe haber excepciones.

---

# 81. PRINCIPIO FINAL DEL GENERADOR

La localización final debe surgir de:

```text
TIPO BASE
+
DIMENSIONES
+
PLANTAS
+
PARCELA
+
CONTEXTO
+
ÉPOCA
+
NIVEL ECONÓMICO
+
OCUPANTES
+
PROFESIONES
+
AFICIONES
+
INSTALACIONES
+
HISTORIA
+
PRESIÓN DE SAQUEO ZONAL
+
RUTAS DE SAQUEO
+
SAQUEO PARTICULAR
+
DETERIORO
+
AZAR CONTROLADO
=
EDIFICIO ÚNICO
```

---

# 82. FILOSOFÍA FINAL

Z-World no debería generar:

> casas llenas de loot aleatorio.

Debería generar:

> lugares que parecen haber existido antes de que llegáramos.

Una casa contiene cosas porque:

> alguien vivió allí.

Un taller contiene cosas porque:

> alguien trabajó allí.

Una zona está saqueada porque:

> antes pasaron personas por ella.

Un edificio permanece intacto porque:

> nadie lo encontró, nadie pudo entrar o nadie comprendió su valor.

Un aparato aparentemente inútil puede ser:

> un tesoro para la persona adecuada.

Una vivienda vacía todavía puede convertirse en:

> cobre,
> tuberías,
> ventanas,
> calentadores,
> madera,
> piedra,
> alojamiento,
> almacenamiento.

Y destruirla significa:

> renunciar para siempre a su uso como edificio.

---

# 83. IDENTIDAD DEL SISTEMA

La sensación buscada es:

> El mundo no genera loot para el jugador.
> El mundo genera lugares.
> Los lugares contienen lo que tendría sentido que hubiera quedado allí.

Y:

> El valor de un lugar cambia según quién lo observa, qué sabe la comunidad, qué necesita el asentamiento y cuánto estamos dispuestos a desmontar del mundo antiguo para construir el nuevo.

---

# 84. INSTRUCCIÓN PARA LA SIGUIENTE CONVERSACIÓN

A partir de este documento:

Crear la documentación formal completa del:

> Z-WORLD PROCEDURAL PLACE & BUILDING GENERATOR.

No simplificar el contenido.

La documentación deberá:

1. definir arquitectura conceptual;
2. definir generación regional;
3. definir distritos;
4. definir presión histórica de saqueo;
5. definir rutas/corredores de saqueo;
6. definir parcelas;
7. definir edificios;
8. definir programas de estancia;
9. definir grafos;
10. definir ocupantes;
11. definir profesiones y hobbies;
12. definir mobiliario;
13. definir contenedores;
14. definir loot;
15. definir descubrimiento dependiente del superviviente;
16. definir instalaciones;
17. definir desmontaje;
18. definir demolición;
19. definir reutilización de edificios;
20. definir deterioro;
21. definir historias del apocalipsis;
22. definir conocimiento recuperable;
23. definir integración con mapamundi;
24. definir integración con prioridades de trabajo;
25. definir estructuras de datos;
26. definir seeds y determinismo;
27. definir un catálogo inicial implementable;
28. mantener este catálogo máximo como referencia de expansión futura;
29. diferenciar siempre valor real y valor percibido;
30. garantizar que los edificios sean recursos persistentes incluso después del saqueo.

La documentación debe diseñarse pensando tanto en:

> el prototipo sin capa 3D

como en:

> la futura representación 3D.

Nunca debe obligarnos a rehacer el modelo conceptual cuando llegue el 3D.

---

# 85. FRASE RESUMEN

> **Z-World no genera edificios para esconder loot. Genera restos coherentes del mundo anterior, y el jugador decide cuánto de ese mundo quiere comprender, reutilizar, desmontar o destruir para sobrevivir.**
