# Changelog

Registra entregas documentales y de diseño de Z-World. No atribuye código ni
funcionalidad implementada salvo que se indique explícitamente como
`implemented` en la documentación afectada.

## DESIGN-005 — Mapas local y regional, generación procedural, equipos e interacción contextual

Entrega **exclusivamente documental** que consolida el diseño aprobado de
las dos escalas espaciales de Z-World, la generación procedural controlada
del mapa local, la interacción contextual con lugares y la composición de
equipos operativos locales. No implementa código, no inicializa la
aplicación web y no toca `src/`, `scenes/`, `tests/` ni `project.godot`.

- **Generación espacial del mapa local**: perfil procedural controlado de
  pueblo pequeño de montaña, doce capas de perfil a representación Canvas,
  variación permitida por semilla, presupuesto de complejidad con exclusión
  expresa de grandes ciudades, estructura espacial técnica invisible y
  conceptos de territorio conocido, usado y controlado sin crear estados de
  zona nuevos
  ([WLD-008](docs/20-world/WLD-008_local-procedural-map-generation.md),
  `approved`).
- **Interacción contextual y equipos**: ficha contextual de lugar, evolución
  de las acciones según el conocimiento, regla «conocida pero no disponible
  = gris con motivo; no reconocida = ausente», reconocimiento exterior como
  barrera blanda, revelado parcial de interiores, diez familias de acción
  contextual, selector `Auto / 1 / 2 / 3 / 4`, modos de asignación
  `Comunidad`/`Equipo seleccionado` y descomposición de operaciones mayores
  en varios equipos
  ([UI-006](docs/80-interface/UI-006_contextual-place-interaction-and-teams.md),
  `approved`).
- **Decisión de dirección**: mapa local 2D cenital continuo con estructura
  técnica invisible, mapa regional futuro geográfico con regiones internas,
  geografía procedural ficticia, 3D Godot como antecedente histórico,
  ausencia de materialización obligatoria de mapa local por punto regional y
  semántica independiente de la presentación
  ([DEC-0010](docs/decisions/DEC-0010_procedural-local-and-regional-map-direction.md),
  `approved`).
- **Trazabilidad**: matriz compacta de decisiones cerradas, aclaraciones,
  opciones descartadas, ejemplos no normativos, preguntas abiertas y
  contradicciones corregidas
  ([DISC-0004](docs/discovery/DISC-0004_local-regional-maps-and-contextual-actions-traceability.md),
  `draft`).
- **Mapa regional**: documentado como horizonte futuro coherente en
  [WLD-003](docs/20-world/WLD-003_strategic-world-and-regional-simulation.md)
  (representación 2D geográfica, mundo conocido creciente, expediciones de
  `1 a X` supervivientes, geografía procedural ficticia) y **expresamente
  excluido** del roadmap activo
  ([RDM-003](docs/roadmap/RDM-003_simulation-first-playable-roadmap.md),
  sección 3.3).
- **Contradicciones corregidas**: `WLD-001`, `WLD-003`, `SCN-001`,
  `DEC-0002` y `GLOSSARY.md` dejan de presentar el mapa local 3D como
  representación activa; `docs/INDEX.md`, `docs/OPEN-QUESTIONS.md`,
  `WLD-001`, `WLD-003`, `SCN-001` y `UI-001` dejan de dirigir el alcance
  activo a `RDM-001`, que permanece `deprecated` como historia del prototipo
  Godot; `ARC-003`, `WLD-001`, `WLD-003` y `GLOSSARY.md` aclaran que
  «materialización» es generación diferida de detalle semántico y no implica
  abrir un mapa local.
- **Estados documentales**: `ARC-007` y `ARC-008` siguen `draft` —se cierra
  la interfaz de tamaño y asignación, no las fórmulas del motor: `P09`
  distingue lo cerrado de lo pendiente y `P10` sigue abierto—; `DISC-0004`
  sigue `draft`; ningún documento pasa a `implemented`.
- Se actualizan los índices de `20-world`, `80-interface`,
  `90-architecture`, `decisions` y `discovery`, además de
  `docs/00-governance/GLOSSARY.md`, `docs/INDEX.md`,
  `docs/OPEN-QUESTIONS.md`, `docs/STATUS.md` y `prompts/INDEX.md`. Las 34
  prioridades de `UI-003` no se modifican.

## Rescate documental — Motor de acciones, catálogo de personaje y objetos

Consolidación documental del motor de acciones/trabajos/eventos, el
catálogo de horizonte máximo de personaje y el modelo de objeto y familias
logísticas del asentamiento, rescatada de la rama
`claude/docs-foundation-setup-94xtnn` y el PR #10 de GitHub
(«IMPLEMENTATION-004: Defensa y vida propia»), que quedó obsoleto por el
reinicio de línea técnica de `DESIGN-004` y se cierra sin fusionarse. Solo
se transfiere documentación; no se incluye código, escenas ni recursos de
Godot.

- **Motor de resolución**: procedimiento común de resolución, capacidades
  efectivas, modelos B (porcentual) y D (trabajo continuo), cooperación con
  líder, órdenes del lugar, modos de ejecución, resultados, conocimiento
  imperfecto, eventos, 19 casos de validación y 22 decisiones pendientes
  `P01`–`P22`, conservando los 20 principios `R01`–`R20`
  ([ARC-006](docs/90-architecture/ARC-006_action-and-event-resolution-model.md),
  [ARC-007](docs/90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md),
  [ARC-008](docs/90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md),
  `draft`).
- **Catálogo de personaje**: nueve características y catálogo cerrado de 34
  habilidades base, con arquitectura característica/habilidad/dominio/
  conocimiento/trabajo
  ([CHR-006](docs/30-characters/CHR-006_characteristics-and-skill-catalog.md),
  `approved`); potencial oculto, calibre oculto de 1 a 5 estrellas,
  adaptación al apocalipsis, generación en ocho pasos, procesado diario y
  42 reglas invariantes
  ([CHR-007](docs/30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md),
  `draft`). `CHR-005` queda `deprecated`, sustituida por `CHR-006`.
- **Objetos y familias logísticas**: modelo de objeto completo y catálogo
  de horizonte máximo de familias logísticas
  ([SET-008](docs/40-settlement/SET-008_object-model-and-logistics-families.md),
  `draft`); reconocimiento, desmontaje y transformación permanente de
  objetos completos, con 20 decisiones cerradas
  ([SET-009](docs/40-settlement/SET-009_disassembly-and-world-transformation.md),
  `draft`). Desarrolla las capas 1–3 de las cinco capas de aprovechamiento
  ya canónicas de `SET-007`; no las redefine ni afecta a la demolición
  estructural de edificios (capa 5), que sigue siendo responsabilidad
  exclusiva de `SET-007`.
- **Decisión de cierre**:
  [DEC-0009](docs/decisions/DEC-0009_character-catalog-and-resolution-engine-domain.md)
  registra el cierre del catálogo de personaje y la creación del dominio
  del motor de resolución en `90-architecture`; es compatible con
  `DEC-0008` (reinicio de línea de código) y no la sustituye.
- **Reconciliación de identificadores**: el contenido original usaba
  `ARC-004`/`ARC-005`/`ARC-006`, `SET-007`/`SET-008` y `DEC-0008`, slots ya
  ocupados por `DESIGN-004` con documentos no relacionados; se renumeraron
  a `ARC-006`/`ARC-007`/`ARC-008`, `SET-008`/`SET-009` y `DEC-0009`.
- Se actualizan `docs/00-governance/GLOSSARY.md`, los índices de
  `30-characters`, `40-settlement`, `90-architecture` y `decisions`,
  `docs/OPEN-QUESTIONS.md` y `docs/STATUS.md`. No modifica código, escenas,
  `game_data/` ni `tests/`, y no amplía `RDM-001` ni `RDM-003`.

## DESIGN-004 — Reinicio centrado en simulación y generador semántico de lugares

Entrega exclusivamente documental que reinicia la línea técnica activa de
Z-World de un prototipo 3D en Godot a un laboratorio de simulación web
centrado en mecánicas, y formaliza el generador procedural semántico de
lugares y edificios:

- **Cambio de arquitectura**: la nueva línea activa es
  Node.js/TypeScript/Next.js/PostgreSQL, con núcleo de simulación puro,
  Prisma aislado tras la persistencia, Zod y Vitest
  ([DEC-0008](docs/decisions/DEC-0008_simulation-first-web-architecture.md),
  [ARC-004](docs/90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md)).
  El prototipo Godot se conserva íntegro como prototipo histórico; `DEC-0001`
  pasa a `deprecated`. `IMPLEMENTATION-004` («Defensa y vida propia») queda
  registrada como completada técnicamente en su rama y PR #10 de GitHub, sin
  aceptación manual ni fusión, y sin adoptarse como parte de la línea activa.
- **Reloj continuo, trabajo por fases y mapa cenital**: se documentan el
  reloj con pausa y velocidades ×1/×2/×4/×10 y el modelo mínimo de fases
  visibles de un trabajo
  ([ARC-004](docs/90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md)),
  y el mapa Canvas 2D cenital con niebla de guerra y exploración progresiva,
  distinguiendo visibilidad espacial de estado de información
  ([UI-005](docs/80-interface/UI-005_top-down-simulation-workbench.md),
  `WLD-002` actualizado).
- **Generador procedural semántico**: cadena generativa completa de mundo a
  edificio, programa de estancias, grafo funcional y coherencia de
  contenido por ocupante
  ([WLD-005](docs/20-world/WLD-005_semantic-place-and-building-generation.md));
  presión histórica de saqueo, correlación local, rutas y bolsas olvidadas
  ([WLD-006](docs/20-world/WLD-006_historical-looting-pressure-and-routes.md));
  historia del apocalipsis y narrativa ambiental conectada causalmente al
  contenido
  ([WLD-007](docs/20-world/WLD-007_place-history-and-environmental-storytelling.md));
  cinco capas de aprovechamiento, tres vidas irreversibles del edificio y
  diferencia entre saqueo, desmontaje, desmantelamiento y demolición
  ([SET-007](docs/40-settlement/SET-007_building-exploitation-reuse-and-demolition.md));
  y el modelo conceptual de datos del mundo semántico
  ([ARC-005](docs/90-architecture/ARC-005_semantic-world-data-model.md)).
- **Nuevo dominio de catálogos** (`docs/catalogs/`, prefijo `CAT`): catálogo
  máximo de 22 familias A–V de lugares
  ([CAT-001](docs/catalogs/CAT-001_maximum-place-catalog.md)), módulos,
  estancias e instalaciones
  ([CAT-002](docs/catalogs/CAT-002_rooms-modules-and-building-systems.md)),
  ocupantes, profesiones, aficiones y rasgos
  ([CAT-003](docs/catalogs/CAT-003_occupants-professions-hobbies-and-traits.md))
  y una propuesta `draft` de subconjunto inicial implementable
  ([CAT-004](docs/catalogs/CAT-004_initial-semantic-place-slice.md)), sin
  presentar el catálogo completo como alcance inmediato.
- **Nuevo roadmap activo**:
  [RDM-003](docs/roadmap/RDM-003_simulation-first-playable-roadmap.md)
  divide la implementación futura en incrementos pequeños y probables en el
  navegador; `RDM-001` pasa a `deprecated` como referencia histórica del
  prototipo Godot.
- **Trazabilidad completa**: `docs/discovery/DISC-0003` mapea las 86
  secciones (`0`–`85`) del Anexo A del prompt a su documento canónico de
  destino o a una pregunta abierta concreta.
- **Ausencia total de implementación**: no se tocó `src/`, `scenes/`,
  `tests/`, `game_data/`, `schemas/` ni ningún archivo Godot; no se
  inicializó Node.js, Next.js, React, Prisma, PostgreSQL, Zod, Vitest ni
  Canvas; no se creó `package.json` ni ninguna configuración ejecutable del
  nuevo stack. Ningún documento nuevo se marca `implemented`.

Ver [docs/STATUS.md](docs/STATUS.md) y
[prompts/DESIGN-004_simulation-first-reboot-and-procedural-places.md](prompts/DESIGN-004_simulation-first-reboot-and-procedural-places.md).

## DESIGN-003 — Trabajo, recuperación y conocimiento aplicado

Entrega exclusivamente documental que formaliza el horizonte máximo de tres
sistemas conectados: prioridades y trabajo, recuperación dependiente de la
persona y conocimiento individual/comunitario. Crea cinco documentos nuevos,
todos `approved`, sin implementar nada:

- **Cinco documentos nuevos**: `UI-003` (taxonomía de trabajo y
  prioridades), `UI-004` (presentación cualitativa de capacidad), `WLD-004`
  (recuperación dependiente de la persona), `SET-006` (activos de
  conocimiento y capacidad) y `DEC-0007` (decisión transversal de 34
  prioridades por capas).
- **34 prioridades en nueve bloques desplegables**, con IDs candidatos
  estables, organizando trabajo desde Emergencias hasta Enseñar y
  transmitir (ver `UI-003`).
- **Escala `Nunca`, `1`–`5`** con `1` como máxima prioridad y capacidad
  presentada como una dimensión cualitativa separada, sin umbrales
  numéricos en la experiencia normal (ver `UI-003` y `UI-004`).
- **Emergencias** como prioridad real y exclusiva de respuesta a
  desastres, que no sustituye a Medicina, Rescate, Combate ni Reparación
  en la actividad cotidiana; **Caza** se separa definitivamente de
  **Combate y limpieza de amenazas**.
- **Recuperación dependiente de la persona** sobre un contenido base
  siempre estable: la persona cambia lo reconocido, accedido y extraído,
  nunca el contenido derivado de la semilla; revisitas, agotamiento por
  categoría y diferencia entre registrar, recuperar, desmontar y catalogar
  (ver `WLD-004`).
- **Conocimiento físico, digital, humano, individual y comunitario**: el
  modelo de fuente, fragmento, conocimiento individual, conocimiento
  comunitario y capacidad real, con seis estados comunitarios de un
  fragmento (Desconocido, Indicado, Disponible, Parcialmente comprendido,
  Operativo, Resiliente) (ver `SET-006`).
- **Aprendizaje, enseñanza, experimentación y pérdida**: práctica, libros,
  material audiovisual, documentación, enseñanza, mentoría, experimentación,
  desmontaje, reparación, intercambio y observación como vías válidas y
  distintas; pérdida de capacidad por muerte, abandono, deterioro de
  soportes o falta de hardware (ver `CHR-002` ampliado).
- **Ausencia total de implementación**: no se modificó ningún `.gd`,
  `.tscn`, `project.godot`, archivo de `game_data/` ni de `tests/`. Las diez
  familias y escala `0–4` de `IMPLEMENTATION-002`/`IMPLEMENTATION-003`
  siguen siendo el sistema real del juego ejecutable y quedan explícitamente
  como provisionales del primer corte, no como modelo final.
  `IMPLEMENTATION-003` continúa con aceptación manual **pendiente**;
  `RDM-001` no se amplía y `CHR-005`/`RDM-002` continúan `draft`.

Ver [docs/STATUS.md](docs/STATUS.md) y
[prompts/DESIGN-003_work-recovery-and-knowledge.md](prompts/DESIGN-003_work-recovery-and-knowledge.md).

## IMPLEMENTATION-003 — Exploración y subsistencia

Tercera entrega de código ejecutable de Z-World: la tercera de las cinco
entregas fijadas en
[RDM-001](docs/roadmap/RDM-001_first-playable-slice.md). Cierra el primer
bucle completo de subsistencia sobre el sistema de trabajo existente:

- **Información de lugares** con los cinco niveles de `WLD-002`
  (`unknown`, `sighted`, `observed`, `inspected`, `exploited`) y tres
  acciones que la hacen avanzar: «Observar el lugar»
  (`observation_inspection >= 1`, 5 s a ×1), «Inspeccionar el lugar»
  (`observation_inspection >= 2`, 10 s) y «Registrar el lugar»
  (`search_recovery >= 2`, 12 s). El nivel nunca retrocede y el contenido
  fijo se materializa exactamente una vez.
- **Sustitución de los ocho demostradores** de `IMPLEMENTATION-002` (cuatro
  pilas de escombros y cuatro puntos de reconocimiento) por ocho lugares
  reales: tres edificios explorables (refugio candidato, Casa 1 y taller)
  con contenido fijo, y cinco lugares del terreno (orilla del arroyo,
  estanque de pesca, claro de hongos, manantial elevado y depósito de agua).
- **Catálogo de diez tipos de recurso** con identificador estable y pilas
  localizadas con tipo, cantidad, ubicación, condición, accesibilidad,
  portador y reserva, más los seis estados logísticos de `SET-003`
  (`available`, `reserved`, `in_transport`, `stored`, `consumed`, `lost`).
- **Pertenencias de llegada** por persona, como pilas reales que hay que
  depositar en el almacén.
- **Almacén** de capacidad 50 y **depósito de agua** localizado de capacidad
  12, establecidos al registrar el refugio candidato, con transporte
  (`haul_storage`) en lotes de hasta 5 unidades y acción «Transportar todo
  lo accesible».
- **Necesidades básicas** de hidratación, alimentación y descanso en escala
  `0–100`, con pérdidas de 40, 30 y 25 puntos por día simulado, umbrales
  normal/advertida/crítica (50 y 20), acciones automáticas de beber (1
  agua, +40), comer (1 alimento comestible, +45) y descansar (+60), y una
  cadena de supervivencia que rompe el bloqueo circular ignorando las
  prioridades desactivadas.
- **Alimento por varias rutas**: registro de edificios, pesca en el
  estanque (`fishing >= 2`, 12 unidades) y recolección de hongos
  (`mushroom_foraging >= 2`, 8 unidades), con política de obtención
  continua y distinción explícita entre «no reconocido» y «agotado».
- **Agua por dos rutas**: acarreo desde la orilla del arroyo con recipientes
  reutilizables (2 unidades por viaje) y política «Mantener 12 de agua», y
  conducción por gravedad desde el manantial elevado (planificar con
  `plumbing_water >= 2`, construir con `construction_carpentry >= 2`
  consumiendo 4 tablones y 2 materiales de reparación una sola vez), que
  produce 1 unidad de agua cada 10 s observables a ×1 sin superar la
  capacidad del depósito.
- **Condición y conservación**: el alimento fresco pierde 60, 45 o 25 puntos
  de condición por día simulado según esté en el terreno, en transporte o
  almacenado, y al llegar a 0 se transforma una sola vez en alimento echado
  a perder; el secado convierte 3 frescos en 2 conservados.
- **Ejecución por fases** en el mismo tablón de trabajos (`travel`, `act`,
  `return`, `deliver`), con recursos reservados y destino de entrega, sin
  crear un segundo sistema de trabajos.
- **Interfaz**: franja de almacenados, panel «Recursos» con estados por
  tipo, panel de selección de lugar con acciones y bloqueos explicados, menú
  contextual con múltiples acciones y políticas, y ficha de persona con
  necesidades y carga.

No implementa defensa, cierre de accesos, zombis, combate, ruido, guardia,
autonomía, iniciativas, aprendizaje, relaciones, salud, enfermedad, muerte,
zonas de territorio, interiores 3D, agricultura, animales, combustible,
electricidad, potabilización, cocina, recetas, generación procedural,
guardado ni carga: quedan para las dos entregas posteriores de `RDM-001`.
`WLD-002`, `SET-003`, `CHR-001` y `UI-001` siguen siendo `approved`: esta
entrega solo implementa su subconjunto.

Los dos comandos de Godot quedan como `NOT RUN` porque `godot --headless`
no estaba disponible en el entorno de implementación; no se instaló Godot
para forzar su ejecución. `git diff --check` sí se ejecutó y no informó
errores. La aceptación manual descrita en [README.md](README.md) queda
pendiente de que Dennis la ejecute.

## IMPLEMENTATION-002 — Trabajo y personas

Segunda entrega de código ejecutable de Z-World: la segunda de las cinco
entregas fijadas en
[RDM-001](docs/roadmap/RDM-001_first-playable-slice.md). Convierte las seis
figuras quietas en personas que reciben prioridades, eligen trabajos
factibles, se desplazan, reservan su objetivo y lo ejecutan:

- Estado de trabajo por persona, separado de su representación visual, con
  las diez familias de prioridad de `UI-001` (todas en `2` al inicio, escala
  `0–4`), las once habilidades iniciales de `CHR-001` (escala provisional
  `0–4`), estado operativo (`idle`, `moving`, `working`, `direct_order`),
  trabajo actual, orden directa y motivo operativo.
- Ocho objetivos de trabajo demostradores en el mapa local: cuatro pilas de
  escombros («Despejar escombros», `build_repair`,
  `construction_carpentry >= 2`, 8 s a ×1) y cuatro puntos de reconocimiento
  («Reconocer punto», `explore_recon`, `observation_inspection >= 2`, 6 s a
  ×1), con estados `available`, `designated`, `in_progress` y `completed`.
- Tablón de trabajos con reservas (máximo una por objetivo), estados
  `pending`, `reserved`, `moving`, `working`, `completed`, `cancelled` y
  `blocked`, progreso conservado al cancelar y selector determinista según
  el orden aprobado (prioridad, urgencia, distancia de ruta, espera, nivel
  de habilidad exigido e ID estable).
- Cuatro razones de bloqueo y tres razones de «sin trabajo» concretas, que
  se recuperan automáticamente al cambiar la causa.
- Navegación 3D local con malla generada en código al cargar la escena y
  `NavigationAgent3D` por persona: las rutas no atraviesan edificios, agua
  ni arbolado, ni salen del terreno útil, y no hay que hornear nada a mano.
- Avance de simulación propio del reloj
  (`gameplay_delta = delta real × multiplicador`, `0` en pausa) para
  movimiento y progreso, sin `Engine.time_scale` y sin tocar la conversión
  de calendario de 20 minutos por día.
- Control puntual con ratón mediante menú contextual de clic derecho («Mover
  aquí», «Hacer ahora …», «Designar para la comunidad»), con opciones
  deshabilitadas y su razón concreta cuando no son posibles.
- Paneles de HUD «Prioridades» (matriz de diez familias × seis personas con
  clic izquierdo y derecho, número, color y tooltip) y «Trabajos» (activos y
  últimos completados), y ficha de persona ampliada.

No implementa necesidades, hambre, sed, cansancio, salud, inventarios,
objetos, almacenes, recursos, interiores, inspección de edificios, agua,
comida, construcción real, aprendizaje, autonomía, iniciativas, zonas,
zombis, combate, generación procedural, guardado ni carga: quedan para las
tres entregas posteriores de `RDM-001`. Los escombros y los puntos de
reconocimiento son demostradores del sistema de trabajo, no un adelanto de
recursos, exploración o construcción.

Los dos comandos de Godot de la sección 16 del prompt quedan como `NOT RUN`
porque `godot --headless` no estaba disponible en el entorno de
implementación; no se instaló Godot para forzar su ejecución.
`git diff --check` sí se ejecutó y no informó errores. La aceptación manual
descrita en [README.md](README.md) queda pendiente de que Dennis la ejecute.

## IMPLEMENTATION-001 — Vertical slice visual

Primera entrega de código ejecutable de Z-World: la primera de las cinco
entregas fijadas en
[RDM-001](docs/roadmap/RDM-001_first-playable-slice.md). Añade un proyecto
Godot 4.7.2-stable (GDScript, Forward+) importable desde la raíz, con:

- Un mapa local fijo de pueblo de montaña (terreno, siluetas de montaña,
  camino con un desvío, agua, bosque, campo abierto y seis edificios,
  incluyendo un refugio candidato).
- Seis supervivientes visuales quietos (`person.initial.01`–`06`),
  seleccionables individualmente.
- Cámara estratégica cenital inclinada controlada solo con ratón
  (desplazamiento, zoom suave y botón «Centrar cámara»), con límites.
- Selección con clic izquierdo, indicador visual y panel en español (ID,
  tipo, nombre, descripción) para personas y edificios.
- Reloj de simulación independiente de `Engine.time_scale`, con pausa y
  velocidades ×1, ×2, ×4 y ×10, iniciando en Día 1, 08:00.
- HUD mínimo en español y un smoke test headless
  (`tests/smoke_test.gd`).

No implementa trabajos, prioridades, designaciones, movimiento, recursos,
necesidades, amenazas, autonomía, generación procedural, guardado ni
ninguna de las cuatro entregas posteriores de `RDM-001`. El smoke test
queda como `NOT RUN` porque `godot --headless` no estaba disponible en el
entorno de implementación; no se instaló Godot para forzar su ejecución.
La aceptación manual descrita en [README.md](README.md) fue superada por
Dennis el 18 de septiembre de 2026.

## DESIGN-002 — Horizonte máximo de diseño

Documenta el horizonte máximo conocido de Z-World: mundo estratégico y
simulación regional, historia vital y arcos personales, transición
tecnológica y red productiva, política interna y comunidades externas,
memoria e historia causal, gestión a escala comunitaria y principios de
simulación multiescala. Añade catorce documentos nuevos:

- **Aprobados (`approved`)**: `VIS-003`, `WLD-003`, `CHR-004`, `SET-004`,
  `SET-005`, `SOC-002`, `SOC-003`, `NAR-002`, `UI-002`, `ARC-003` y
  `DEC-0006`.
- **Borrador (`draft`)**: `CHR-005`, `THR-002` y `RDM-002`.

No amplía el primer corte jugable ni el alcance de
[RDM-001](docs/roadmap/RDM-001_first-playable-slice.md), no crea código,
escenas, proyecto Godot ni datos ejecutables, y no existe todavía ninguna
implementación del juego. Ver
[DEC-0006](docs/decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md)
para la separación entre horizonte máximo, alcance de entrega y estado
implementado.

## DESIGN-001 — Especificación funcional cerrada y primera versión jugable

Cierra la especificación funcional de cómo se juega minuto a minuto en el
mapa local (interacción, prioridades, autonomía, exploración, recursos,
amenazas, tiempo y persistencia) y define el alcance exacto de la primera
versión visual como documentación de diseño aprobada, sin crear código de
juego, proyecto Godot, escenas ni pruebas ejecutables. Ver
[docs/roadmap/RDM-001_first-playable-slice.md](docs/roadmap/RDM-001_first-playable-slice.md).

## DOCS-002 — Español como idioma documental

Formaliza el español como idioma documental por defecto para toda la prosa
dirigida a personas, preservando identificadores, rutas y contratos
técnicos. Ver
[docs/00-governance/DOC-001_documentation-system.md, sección 3.7](docs/00-governance/DOC-001_documentation-system.md).

## DOCS-001 — Base documental de Z-World

Establece la arquitectura documental inicial por dominios, con instrucciones
permanentes para agentes, decisiones iniciales (Godot 4, dos escalas de
mundo, diseño dirigido por datos) y el primer escenario como condición
inicial de partida.
