# Preguntas abiertas

Agrupadas por dominio. Cada pregunta enlaza el documento canónico afectado.
No se repite aquí la discusión completa; ver el documento enlazado.

Cuando una pregunta se cierre:

1. Actualiza la fuente canónica correspondiente.
2. Crea una decisión en `docs/decisions/` si tiene impacto relevante.
3. Retira la pregunta de esta lista.

## Mundo (`20-world`)

- Escala, tamaño, resolución y geometría exactas de la estructura interna
  del mapa regional (regiones, celdas o hexágonos). Que el mapa regional sea
  2D, geográfico y continuo, con esa estructura **invisible**, ya está
  cerrado. Ver [WLD-001](20-world/WLD-001_world-scales.md) y
  [WLD-003](20-world/WLD-003_strategic-world-and-regional-simulation.md).
- Mecanismo exacto de transición entre el mapa regional y el mapa local.
  Ver [WLD-001](20-world/WLD-001_world-scales.md). El mapa regional no es
  jugable todavía y no forma parte de la hoja de ruta activa (ver
  [RDM-003](roadmap/RDM-003_simulation-first-playable-roadmap.md);
  [RDM-001](roadmap/RDM-001_first-playable-slice.md) es `deprecated` e
  histórica).
- Catálogo concreto de qué edificios y recursos declaran qué acciones de
  descubrimiento. Ver
  [WLD-002](20-world/WLD-002_local-exploration-and-information.md) y las
  familias de
  [UI-006](80-interface/UI-006_contextual-place-interaction-and-teams.md).
- Revelado exacto de niebla de guerra regional y transición entre mapa local
  y regional. Ver
  [WLD-003](20-world/WLD-003_strategic-world-and-regional-simulation.md).
- Tamaño regional exacto, número de puntos de interés iniciales y máximos,
  valor máximo de `X` en una expedición, flujo exacto de viaje, frecuencia y
  catálogo de eventos, comunicaciones, puestos, colonias y control
  territorial. Que una expedición sea un grupo de `1 a X` supervivientes que
  viaja realmente por el mapa ya está cerrado. Ver
  [WLD-003](20-world/WLD-003_strategic-world-and-regional-simulation.md).
- Si algunos lugares regionales excepcionales llegarán a resolverse de forma
  regional, mostrar detalle contextual, usar una vista específica, reutilizar
  el mapa local o generar otra representación. Que **ningún** punto regional
  obligue a abrir un mapa local ya está cerrado. Ver
  [WLD-003](20-world/WLD-003_strategic-world-and-regional-simulation.md),
  sección 3.3, y
  [DEC-0010](decisions/DEC-0010_procedural-local-and-regional-map-direction.md).
- Fecha de implementación del mapa regional. Ver
  [RDM-003](roadmap/RDM-003_simulation-first-playable-roadmap.md), sección
  3.3.
- Dimensiones exactas del mapa local, tamaño de celdas o sectores internos,
  algoritmo de pathfinding, algoritmo geométrico exacto de terreno, agua,
  calles y parcelas, cantidades exactas de edificios o lugares, cifras del
  presupuesto de complejidad y nombres técnicos definitivos del perfil de
  escenario. Ver
  [WLD-008](20-world/WLD-008_local-procedural-map-generation.md).
- Catálogo exhaustivo de acciones, herramientas de diagnóstico y objetos
  declarables por categoría de reconocimiento dependiente de la persona, y
  fórmulas numéricas exactas de calidad de reconocimiento según persona,
  herramienta y tiempo. Ver
  [WLD-004](20-world/WLD-004_expertise-dependent-recovery.md).

## Personajes (`30-characters`)

- Curvas exactas de progreso, dificultad de alcanzar niveles altos y
  fórmulas de aptitud/calidad más allá de la escala real `0–10` ya cerrada.
  Ver [CHR-001](30-characters/CHR-001_character-model.md),
  [CHR-003](30-characters/CHR-003_autonomy-intentions-and-behavior.md) y
  [CHR-007 §7.1](30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#71-velocidad-de-aprendizaje-y-curvas-de-progreso).
  El catálogo (nueve características, 34 habilidades), la escala `0–10` con
  media humana `4` y la visibilidad del nivel actual ya están cerrados en
  [CHR-006](30-characters/CHR-006_characteristics-and-skill-catalog.md).
- Técnicas exactas, prerrequisitos y transferencia completa entre
  habilidades más allá de los ejemplos registrados. Ver
  [CHR-002](30-characters/CHR-002_knowledge-and-learning.md).
- Fórmulas exactas de velocidad de aprendizaje, enseñanza, olvido, fallo y
  desperdicio, y qué conocimientos concretos puede olvidar una persona. Ver
  [CHR-002](30-characters/CHR-002_knowledge-and-learning.md).
- Duración y profundidad exactas de cursos o mentorías. Ver
  [CHR-002](30-characters/CHR-002_knowledge-and-learning.md).
- Valores y curvas del modelo profundo de personas. Ver
  [CHR-004](30-characters/CHR-004_life-history-and-personal-arcs.md).
- Dominios definitivos de cada habilidad del catálogo. Ver
  [CHR-006](30-characters/CHR-006_characteristics-and-skill-catalog.md).
  [CHR-005](30-characters/CHR-005_extended-skill-taxonomy.md) queda
  `deprecated` en favor de `CHR-006`.
- Campos de potencial, distribución de estrellas del calibre oculto, escala
  y dimensiones de la adaptación al apocalipsis, y catálogo de
  rasgos/beneficios/aflicciones. Ver
  [CHR-007](30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md).
  La escala real `0–10` y el catálogo de frases de potencial ya están
  cerrados en
  [CHR-006 §3.6](30-characters/CHR-006_characteristics-and-skill-catalog.md#36-escala-real-0–10-y-calibración-canónica)
  y
  [CHR-007 §3.9](30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#39-catálogo-y-actualización-de-frases-de-potencial-cierra-parte-de-p22).
- Estrategia y momento de migrar el alcance implementado de habilidades
  (`CHR-001` §3.1, once habilidades) hacia el catálogo de horizonte máximo
  de 34 habilidades. Ver
  [CHR-006](30-characters/CHR-006_characteristics-and-skill-catalog.md#7-preguntas-abiertas).

## Asentamiento (`40-settlement`)

- Fórmulas exactas de coste y capacidad por tipo de ampliación. Ver
  [SET-001](40-settlement/SET-001_settlement-growth.md).
- Catálogo concreto de soluciones de producción por necesidad, más allá de
  la primera versión. Ver
  [SET-002](40-settlement/SET-002_production-and-solutions.md).
- Catálogos de recursos, edificios, recetas y herramientas más allá de la
  lista inicial. Ver
  [SET-003](40-settlement/SET-003_resources-logistics-and-condition.md).
- Valores y curvas exactos de deterioro y condición. Ver
  [SET-003](40-settlement/SET-003_resources-logistics-and-condition.md).
- Duración de estaciones, número de días por estación, año completo,
  catálogo completo de cultivos, fertilidad, rotación, plagas,
  fertilizantes y conservación de semillas. El ciclo agrícola básico sin
  estaciones ya está cerrado en
  [SET-011](40-settlement/SET-011_initial-agriculture-loop.md). Ver
  [ARC-002](90-architecture/ARC-002_procedural-generation-and-persistence.md).
- Catálogos de producción, mantenimiento, energía, transporte, animales y
  agricultura. Ver
  [SET-004](40-settlement/SET-004_technological-transition-and-knowledge-economy.md)
  y
  [SET-005](40-settlement/SET-005_production-web-and-infrastructure.md).
- Nombres definitivos de los niveles de calidad aprovechable de materiales;
  número final de conjuntos de herramientas y qué equipos conservan
  identidad individual; catálogo completo de prendas y protecciones;
  catálogo completo de especies vegetales; tratamiento de materiales
  peligrosos y de residuos/escombros; migración completa del resto de las
  12 familias logísticas de horizonte máximo hacia objetos individuales.
  Un primer subconjunto concreto de estas familias, y la reconciliación de
  «materiales de reparación», ya están cerrados en
  [CAT-005](catalogs/CAT-005_initial-object-resource-and-transport-slice.md).
  Ver
  [SET-008](40-settlement/SET-008_object-model-and-logistics-families.md).
- Cantidades exactas recuperadas por objeto al desmontar, probabilidades y
  tiempos de desmontaje, interfaz definitiva de desmontaje, estructura
  técnica de datos de objetos, y alcance exacto de una primera versión
  jugable de este sistema. Ver
  [SET-009](40-settlement/SET-009_disassembly-and-world-transformation.md).
- Fórmulas numéricas exactas de cobertura, confianza, dificultad y progreso
  interno de un fragmento de conocimiento; catálogo exhaustivo de
  fragmentos, dominios y técnicas; frecuencia y equilibrio de aparición de
  fuentes de conocimiento por semilla; número de personas o copias
  necesarias para considerar un fragmento `Resiliente`; reglas completas de
  idiomas, cifrado, contraseñas y recuperación forense de fuentes
  digitales. Ver
  [SET-006](40-settlement/SET-006_knowledge-assets-and-capability.md).

## Sociedad (`50-society`)

- Modelo exacto de formación y disolución de facciones. Ver
  [SOC-001](50-society/SOC-001_living-community.md) y
  [SOC-002](50-society/SOC-002_internal-politics-and-leadership.md).
- Ritmo y reglas de evolución de comunidades externas, política, comercio y
  narrativa de gran escala.
- Política, legitimidad, ciudadanía, castigo y coerción concretos. Ver
  [SOC-002](50-society/SOC-002_internal-politics-and-leadership.md).
- Población, territorio, comercio, guerra y absorción externa. Ver
  [SOC-003](50-society/SOC-003_external-communities-and-regional-history.md).

## Amenazas (`60-threats`)

- Lista exacta de configuraciones, infección, sentidos, abundancia y
  dificultad del modelo de amenazas. Ver
  [THR-001](60-threats/THR-001_zombie-threat-model.md).
- Alcance, intensidad y fórmulas exactas de ruido, combate e infección. Ver
  [THR-001](60-threats/THR-001_zombie-threat-model.md).
- Configuración concreta de amenazas al iniciar partida.
- Opciones y fórmulas de amenazas. Ver
  [THR-002](60-threats/THR-002_configurable-threat-horizon.md).

## Narrativa (`70-narrative`)

- Modelo exacto de memoria persistente. Ver
  [NAR-001](70-narrative/NAR-001_emergent-narrative.md).
- Diseño del director narrativo (selección y priorización de situaciones).
  Ver [NAR-001](70-narrative/NAR-001_emergent-narrative.md).
- Frecuencia de situaciones narrativas. Ver
  [NAR-001](70-narrative/NAR-001_emergent-narrative.md).
- Formato concreto de los eventos. Ver
  [NAR-001](70-narrative/NAR-001_emergent-narrative.md).
- Memorias, interpretaciones, diario y director narrativo. Ver
  [NAR-002](70-narrative/NAR-002_memory-and-causal-world-history.md).

## Interfaz (`80-interface`)

- Catálogo completo de acciones contextuales disponibles según el objetivo.
  Ver [UI-001](80-interface/UI-001_interaction-and-command-model.md). Las
  diez familias de acción y su correspondencia con tipos de objetivo ya
  están cerradas en
  [UI-006](80-interface/UI-006_contextual-place-interaction-and-teams.md),
  sección 3.7; lo pendiente es el catálogo declarado por cada objetivo
  concreto.
- Duración exacta de cada acción contextual, interfaz gráfica final de la
  ficha de lugar y del selector de equipo, e interfaz exacta para edificios
  de varias plantas. Ver
  [UI-006](80-interface/UI-006_contextual-place-interaction-and-teams.md).
- Flujos visuales de gestión a escala. Ver
  [UI-002](80-interface/UI-002_management-at-community-scale.md).
- Estrategia de migración técnica desde las diez familias y escala `0–4`
  implementadas hacia el horizonte de nueve bloques, 34 prioridades y
  escala `Nunca/1–5`; valores iniciales por personaje y plantillas
  definitivas de prioridad. Ver
  [UI-003](80-interface/UI-003_work-priority-taxonomy.md).
- Color, iconografía y disposición visual final de la matriz de prioridades
  y de los estados cualitativos de capacidad. Ver
  [UI-003](80-interface/UI-003_work-priority-taxonomy.md) y
  [UI-004](80-interface/UI-004_qualitative-capability-presentation.md).
- Fórmulas numéricas exactas de idoneidad, dificultad, riesgo y confianza
  que alimentan los estados cualitativos de capacidad. Ver
  [UI-004](80-interface/UI-004_qualitative-capability-presentation.md).

## Arquitectura técnica (`90-architecture`)

- Estructura interna definitiva de carpetas para la nueva línea de código
  Node.js/TypeScript, que se fijará en su entrega de inicialización
  técnica. Ver [ARC-001](90-architecture/ARC-001_technical-direction.md).
- Formato definitivo de datos de contenido y de esquema PostgreSQL/Prisma.
  Ver [ARC-001](90-architecture/ARC-001_technical-direction.md) y
  [ARC-002](90-architecture/ARC-002_procedural-generation-and-persistence.md).
- Formato de guardado, compatibilidad entre versiones y representación de
  datos final. Ver
  [ARC-002](90-architecture/ARC-002_procedural-generation-and-persistence.md).
- Presupuestos, frecuencias, materialización y rendimiento de la
  simulación multiescala. Ver
  [ARC-003](90-architecture/ARC-003_multiscale-simulation-principles.md).
- Frecuencia exacta de ticks internos o tamaño del acumulador de tiempo
  simulado, y cadencia exacta de snapshots/eventos sobre PostgreSQL. Ver
  [ARC-004](90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md).
- Forma concreta de persistencia (tablas, documentos, JSON estructurado)
  para cada entidad conceptual del mundo semántico. Ver
  [ARC-005](90-architecture/ARC-005_semantic-world-data-model.md).
- **Cerradas por `DESIGN-006`:** las 22 decisiones de calibración del motor
  de resolución de acciones, trabajos y eventos (`P01`–`P22`) —escala real
  `0–10` y media humana `4`, representación de cero y dato desconocido,
  tres perfiles de ponderación entre característica y habilidad, modelo B
  (margen, variación acotada y cinco bandas), modelo D (variación de hasta
  `±8 %`), requisitos duros por método, umbral `+3` de tarea básica,
  episodios comprobables, cooperación con rendimientos decrecientes,
  responsable/ejecutor/supervisor, modos en dos dimensiones (ritmo y
  atención) con sus costes conceptuales, límites temporales, respuesta ante
  amenazas, resultados multidimensionales y críticos, conocimiento
  imperfecto, reintentos, oposición activa/pasiva, aprendizaje por
  participación, esquema de eventos y niveles de atención, persistencia
  aleatoria, y presentación del nivel actual visible frente al potencial
  oculto— ya no son preguntas abiertas. Ver
  [ARC-006](90-architecture/ARC-006_action-and-event-resolution-model.md),
  [ARC-007](90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md),
  [ARC-008](90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas),
  [DEC-0011](decisions/DEC-0011_hybrid-resolution-engine-and-capability-presentation.md)
  y
  [DISC-0005](discovery/DISC-0005_resolution-engine-closure-traceability.md).
  Sigue abierta, como **parametrización de contenido** y no como
  reapertura del modelo: la dificultad efectiva exacta, el mínimo/
  recomendado/máximo útil y los umbrales de dificultad concretos por cada
  familia de acción real. Ver
  [ARC-007 §3.5](90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md#35-estado-herramientas-y-entorno)
  y
  [UI-006 §7](80-interface/UI-006_contextual-place-interaction-and-teams.md#7-preguntas-abiertas).

## Lugares y edificios procedurales (`20-world`, `40-settlement`, `catalogs`)

- Algoritmo exacto de trazado de calles, distritos y parcelas, y fórmulas
  exactas de probabilidad de arquetipo según contexto. Ver
  [WLD-005](20-world/WLD-005_semantic-place-and-building-generation.md) y
  [WLD-008](20-world/WLD-008_local-procedural-map-generation.md).
- Pesos, escalas y unidades exactos del modelo interno de presión de
  saqueo, y algoritmo exacto de rutas y bolsas olvidadas. Ver
  [WLD-006](20-world/WLD-006_historical-looting-pressure-and-routes.md).
- Condiciones exactas de activación y coste de simulación del saqueo
  dinámico durante la partida. Ver
  [WLD-006](20-world/WLD-006_historical-looting-pressure-and-routes.md).
- Catálogo exhaustivo de señales ambientales por historia del apocalipsis.
  Ver [WLD-007](20-world/WLD-007_place-history-and-environmental-storytelling.md).
- Tiempos, requisitos exactos y cantidades producidas por cada acción de
  desmontaje, desmantelamiento y demolición; umbral exacto de pérdida de
  habitabilidad. Ver
  [SET-007](40-settlement/SET-007_building-exploitation-reuse-and-demolition.md).
- Qué localizaciones especiales de la familia V requieren programa de
  estancias propio frente a ser puramente modificadores; estrategia
  definitiva de alias entre IDs aparentemente duplicados. Ver
  [CAT-001](catalogs/CAT-001_maximum-place-catalog.md).
- Ampliación del catálogo de estancias más allá de la base heredada del
  Anexo A. Ver [CAT-002](catalogs/CAT-002_rooms-modules-and-building-systems.md).

## Entorno mutable, accesos, transporte y agricultura (`20-world`, `40-settlement`, `catalogs`)

Cerradas por `DESIGN-008` (ver sección dedicada más abajo): que el entorno
completo es materia jugable de primera clase, los ocho perfiles iniciales,
la libertad de transformación con causalidad, la barrera lineal entre
anclajes, la red de perímetro, la carretera transformable, el modelo
abertura/cierre/modificación, los cinco métodos de transporte activos y el
ciclo agrícola básico sin estaciones.

Quedan abiertas, por pertenecer a la parametrización numérica y técnica:

- Algoritmos geométricos exactos de trazado, excavación, nivelación y
  detección de recintos. Ver
  [WLD-010](20-world/WLD-010_mutable-terrain-and-spatial-construction.md).
- Longitud máxima, costes exactos y tiempos de una barrera lineal; daño y
  asalto detallado contra perímetros y cierres. Ver
  [WLD-010](20-world/WLD-010_mutable-terrain-and-spatial-construction.md)
  y [WLD-011](20-world/WLD-011_openings-access-and-connectivity.md).
- Anchuras y alturas métricas exactas por clase cualitativa de acceso;
  ingeniería estructural detallada de huecos nuevos. Ver
  [WLD-011](20-world/WLD-011_openings-access-and-connectivity.md).
- Construcción libre completa de edificios nuevos, terraformación
  (excavación, aporte de tierra, nivelación, rampas, escaleras, terrazas,
  muros de contención) y editor funcional final de interiores y de varias
  plantas. Ver
  [WLD-010](20-world/WLD-010_mutable-terrain-and-spatial-construction.md)
  y [CAT-002](catalogs/CAT-002_rooms-modules-and-building-systems.md).
- Extracción profunda por capas de carreteras. Ver
  [WLD-010 §3.8](20-world/WLD-010_mutable-terrain-and-spatial-construction.md#38-horizonte-máximo).
- Cifras exactas de peso, capacidad, velocidad, pendiente y anchura por
  método de transporte; fórmulas exactas de ruido y fatiga; catálogo y
  activación de animales de carga/tiro y vehículos. Ver
  [SET-010](40-settlement/SET-010_local-hauling-and-transport.md).
- Catálogo completo de cultivos y estaciones, fórmulas de fertilidad,
  riego, deterioro y rendimiento, tiempos de cultivo y cantidades de
  cosecha. Ver [SET-011](40-settlement/SET-011_initial-agriculture-loop.md).
- Interfaz gráfica definitiva de la ficha de acceso, de traslado y de
  parcela cultivable.

## Interfaz de laboratorio de simulación (`80-interface`)

- Alcance exacto de visión de una persona o punto de observación (radio,
  línea de visión, obstáculos) en la niebla del mapa 2D. Ver
  [UI-005](80-interface/UI-005_top-down-simulation-workbench.md).
- Representación visual exacta (colores, formas, paleta, iconos, sprites y
  arte final) del mapa Canvas 2D. Que el mapa sea 2D cenital, continuo y
  orgánico ya está cerrado. Ver
  [UI-005](80-interface/UI-005_top-down-simulation-workbench.md) y
  [DEC-0010](decisions/DEC-0010_procedural-local-and-regional-map-direction.md).

## Escenario inicial (`scenarios`)

Cerradas por `DESIGN-007` (ver sección dedicada más abajo): estación y
hora exactas de llegada, composición y distribución mínima de calibre de
la cohorte, red de relaciones iniciales, edificio provisional y grado de
elección, dimensiones y presupuesto del mapa local, población zombi
inicial, disponibilidad inicial de armas/agua/alimento/electricidad, y
existencia posible de otras comunidades. Ver
[SCN-001](scenarios/SCN-001_mountain-village-arrival.md),
[SCN-002](scenarios/SCN-002_initial-survivor-cohort.md),
[SCN-003](scenarios/SCN-003_first-day-starting-state.md) y
[WLD-009](20-world/WLD-009_initial-mountain-village-profile.md).

Quedan abiertas, por pertenecer a otros sistemas:

- Algoritmo exacto de generación y validación de semillas (ver
  [SCN-003 §3.7](scenarios/SCN-003_first-day-starting-state.md#37-garantías-de-una-semilla-válida)).
- Distribución global de calibre de la población mundial más allá de la
  cohorte protagonista de este escenario. Ver
  [CHR-007](30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md).

## Cerradas por `DESIGN-008`

`DESIGN-008` cerró las veinticuatro decisiones `P01`–`P24` del primer
catálogo implementable y el mundo local moldeable, antes abiertas: si se
aprueba `CAT-004` (aprobado, ocho perfiles: cuatro edificios más agua,
campo, bosque/matorral y carretera); los cuatro programas iniciales de
edificio; la inclusión de perfiles no edificatorios; el entorno como
realidad transformable de primera clase; las primitivas espaciales
conceptuales (nodo, línea, área, estructura); la agricultura básica
dentro del primer catálogo; la carretera despejable y transformable de
forma básica; la barrera lineal sencilla; la naturaleza topológica de
perímetros y accesos; la distinción abertura/cierre/modificación; la
posición funcional de puertas; las acciones iniciales sobre accesos
existentes; ventanas y brechas como accesos; la compatibilidad entre
carga, ruta y abertura; las familias iniciales de objetos; el subconjunto
material inicial; el fin de «materiales de reparación» como pila
universal; los métodos iniciales de transporte local; el modelo de carga
por peso, bulto y etiquetas; la logística por fases, transferencias y
selección de método; el marco común de posibilidades para todos los
objetivos; y la materialización diferida del detalle. Ver
[CAT-004](catalogs/CAT-004_initial-semantic-place-slice.md),
[CAT-005](catalogs/CAT-005_initial-object-resource-and-transport-slice.md),
[WLD-010](20-world/WLD-010_mutable-terrain-and-spatial-construction.md),
[WLD-011](20-world/WLD-011_openings-access-and-connectivity.md),
[SET-010](40-settlement/SET-010_local-hauling-and-transport.md),
[SET-011](40-settlement/SET-011_initial-agriculture-loop.md),
[DEC-0013](decisions/DEC-0013_implementable-catalog-and-mutable-world.md)
y la trazabilidad completa en
[DISC-0007](discovery/DISC-0007_implementable-catalog-and-mutable-world-traceability.md).

## Cerradas por `DESIGN-007`

`DESIGN-007` cerró estas decisiones del primer escenario, antes abiertas
en `SCN-001` y en esta lista: momento exacto de llegada (Día 1, 17:30,
seis semanas tras el colapso, primera mitad de abril, cuatro días de
marcha) y banda meteorológica inicial sin fenómenos letales; seis adultos
protagonistas procedurales con distribución mínima de calibre oculto
`5/4+/4+/3+/3+/3+` (específica de este escenario, sin alterar la
distribución global de calibre), cobertura funcional colectiva mínima y
red de relaciones conectada con al menos un acontecimiento compartido
reciente; refugio provisional garantizado a 100–250 m del punto de
llegada, generado siempre por el modelo de estancias de `WLD-005`, y
candidatos a asentamiento sin mudanza obligatoria; presupuesto numérico
del mapa local (huella ≈3×3 km, 55–85 construcciones, red viaria, agua,
cobertura de terreno y 12–18 puntos de interés, con solo 3–6 indicios
conocidos al llegar); amenaza zombi inicial contenida y limpiable
(12–30 zombis, sin horda inicial ni respawn); estado físico tras la
marcha, pertenencias, arma cuerpo a cuerpo por protagonista y carencias
obligatorias; nueve garantías internas de semilla válida sin información
gratuita; y presencia humana local y regional incierta, sin encuentro
forzado en las primeras 48 horas. Ver
[SCN-001](scenarios/SCN-001_mountain-village-arrival.md),
[SCN-002](scenarios/SCN-002_initial-survivor-cohort.md),
[SCN-003](scenarios/SCN-003_first-day-starting-state.md),
[WLD-009](20-world/WLD-009_initial-mountain-village-profile.md),
[DEC-0012](decisions/DEC-0012_first-arrival-scenario-contract.md) y la
trazabilidad completa en
[DISC-0006](discovery/DISC-0006_first-arrival-scenario-traceability.md).

## Cerradas por `DESIGN-006`

`DESIGN-006` cerró las veintidós decisiones `P01`–`P22` del motor de
resolución, antes pendientes de calibración: escala real `0–10` con media
humana `4` y `0` como valor real distinto de dato desconocido; tres
perfiles cerrados de ponderación entre característica y habilidad
efectivas (70/30, 50/50, 30/70); modelo B mediante margen, variación
acotada `[-4,+4]` y cinco bandas internas; modelo D con variación acotada
de hasta `±8 %` por fase o sesión; requisitos duros por método
(abierto/improvisable/guiado/restringido); umbral de tarea básica de `+3`
puntos, no `+2`; delimitación de episodios comprobables; cooperación por
funciones reales con rendimientos decrecientes (`100 %/60 %/35 %/20 %`);
responsable, ejecutor principal y supervisor separables, con sustitución;
modo de trabajo expresado en dos dimensiones combinables (ritmo y
atención), no cuatro modos excluyentes, con rangos conceptuales de efectos
y costes; límites temporales heredados del lugar; cuatro políticas
cualitativas de respuesta ante amenazas; resultados multidimensionales y
críticos resueltos mediante las bandas de B, no un reparto porcentual
universal; cuatro capas de conocimiento imperfecto; reintentos por causa
legítima con presupuestos de autonomía por orden; oposición activa mediante
una única resolución de margen relativo; aprendizaje por participación con
fórmula conceptual; cadena de eventos con ocho pasos y cuatro niveles de
atención, con pausa crítica predeterminada; determinismo temporal fuerte
entre velocidades de simulación; y nivel actual numérico `0–10` visible en
la ficha del personaje, con potencial real, calibre oculto y máximo
numérico siempre ocultos y comunicados mediante un catálogo cerrado de
frases cualitativas. Ver
[CHR-006](30-characters/CHR-006_characteristics-and-skill-catalog.md),
[CHR-007](30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md),
[ARC-006](90-architecture/ARC-006_action-and-event-resolution-model.md),
[ARC-007](90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md),
[ARC-008](90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md),
[UI-004](80-interface/UI-004_qualitative-capability-presentation.md),
[DEC-0011](decisions/DEC-0011_hybrid-resolution-engine-and-capability-presentation.md)
y la trazabilidad completa en
[DISC-0005](discovery/DISC-0005_resolution-engine-closure-traceability.md).

## Cerradas por `DESIGN-005`

`DESIGN-005` cerró estas decisiones, antes abiertas o contradictorias: la
representación activa del mapa local es 2D cenital sobre Canvas, visualmente
continua y orgánica, con una estructura espacial técnica invisible, y el
mapa local 3D queda como antecedente histórico del prototipo Godot; el mapa
regional futuro será 2D, geográfico, topográfico, continuo, procedural,
ficticio y bajo niebla, con regiones internas no impuestas como estética; la
geografía del primer escenario es procedural y ficticia dentro de un perfil
de pueblo pequeño de montaña, y una semilla no puede producir una gran
ciudad; materializar detalle semántico no equivale a abrir un mapa local, y
ningún punto regional obliga a generar uno; la interacción con un lugar usa
una ficha contextual cuyas acciones evolucionan con el conocimiento, con la
regla «conocida pero no disponible = gris con motivo; no reconocida =
ausente»; reconocer el exterior es la vía normal y autónoma ante un edificio
desconocido, saltable por orden explícita arriesgada; el equipo operativo
local se compone con `Auto / 1 / 2 / 3 / 4` y asignación `Comunidad` o
`Equipo seleccionado`, sin bonificación genérica por acumular integrantes y
sin que `4` sea un límite del motor. Ver
[WLD-008](20-world/WLD-008_local-procedural-map-generation.md),
[UI-006](80-interface/UI-006_contextual-place-interaction-and-teams.md),
[DEC-0010](decisions/DEC-0010_procedural-local-and-regional-map-direction.md)
y la trazabilidad completa en
[DISC-0004](discovery/DISC-0004_local-regional-maps-and-contextual-actions-traceability.md).

## Cerradas por `DESIGN-004`

`DESIGN-004` cerró estas decisiones, antes abiertas o no registradas: la
línea técnica activa de código es Node.js/TypeScript/Next.js/PostgreSQL, no
Godot (ver [DEC-0008](decisions/DEC-0008_simulation-first-web-architecture.md));
Godot y `IMPLEMENTATION-004` («Defensa y vida propia», rama
`claude/docs-foundation-setup-94xtnn`, PR #10) quedan preservados como
prototipo histórico, completado técnicamente pero sin aceptación manual ni
fusión; los lugares y edificios se generan semánticamente antes que
geométricamente, con cinco capas de aprovechamiento y tres vidas
irreversibles ([WLD-005](20-world/WLD-005_semantic-place-and-building-generation.md),
[SET-007](40-settlement/SET-007_building-exploitation-reuse-and-demolition.md));
el saqueo histórico es espacialmente correlacionado, nunca una tirada
aislada por edificio
([WLD-006](20-world/WLD-006_historical-looting-pressure-and-routes.md));
existe un catálogo máximo de 22 familias de lugares como horizonte de
referencia, distinto del subconjunto inicial `draft`
([CAT-001](catalogs/CAT-001_maximum-place-catalog.md)–[CAT-004](catalogs/CAT-004_initial-semantic-place-slice.md)).

## Cerradas por `DESIGN-001`

`DESIGN-001` cerró estas decisiones, antes abiertas o no registradas: control
con ratón como método de intervención directa (sin primera persona ni WASD),
prioridades como base de interacción, tres estados de zona (habitual,
precaución, prohibida), día de 20 minutos con cinco velocidades incluida la
pausa, zombi estándar lento tipo Romero, y generación bajo demanda
reproducible sin resorteo al cargar. Ver
[DEC-0004](decisions/DEC-0004_mouse-strategic-control.md) y
[DEC-0005](decisions/DEC-0005_reproducible-lazy-generation.md).
