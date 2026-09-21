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

- Valores y fórmulas exactos de características, habilidades, aptitudes,
  progreso y calidad. Ver
  [CHR-001](30-characters/CHR-001_character-model.md) y
  [CHR-003](30-characters/CHR-003_autonomy-intentions-and-behavior.md). El
  catálogo en sí (nueve características, 34 habilidades) ya está cerrado en
  [CHR-006](30-characters/CHR-006_characteristics-and-skill-catalog.md); lo
  pendiente es su calibración numérica.
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
- Escalas exactas de la habilidad 1–10, campos de potencial, distribución
  de estrellas del calibre oculto, catálogo de frases de potencial,
  escala y dimensiones de la adaptación al apocalipsis, y catálogo de
  rasgos/beneficios/aflicciones. Ver
  [CHR-007](30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md).
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
- Duración de estaciones, número de días por estación, año completo y
  fórmulas de agricultura (no implementadas en la primera versión). Ver
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
  peligrosos y de residuos/escombros; estrategia y momento de migrar los 9
  recursos agregados de `SET-003` hacia las 12 familias logísticas de
  horizonte máximo. Ver
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
- Las 22 decisiones pendientes de calibración del motor de resolución de
  acciones, trabajos y eventos (`P01`–`P22`): peso entre característica y
  habilidad efectivas, tabla o función del modelo B, tamaño de la
  variación del modelo D, requisitos duros por método, fórmula de
  cooperación y número útil de ayudantes, lista final de modos y sus
  costes, críticos e incidencias, distribución de conocimiento imperfecto,
  reintento automático, oposición activa/pasiva, esquema de eventos,
  persistencia aleatoria y presentación de probabilidades al jugador. Ver
  [ARC-008](90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas).
  `P09` conserva su parte pendiente (fórmula de cooperación, coordinación,
  rendimientos decrecientes y máximo útil por familia) aunque el selector
  local `Auto / 1 / 2 / 3 / 4` y las aportaciones funcionales ya estén
  cerrados en
  [UI-006](80-interface/UI-006_contextual-place-interaction-and-teams.md);
  `P10` sigue íntegramente abierto (sustitución del responsable, supervisión
  y reasignación automática), y `P14`/`P20` conservan la política final de
  pausas e interrupciones.

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
- Si Dennis aprueba el subconjunto inicial propuesto en
  [CAT-004](catalogs/CAT-004_initial-semantic-place-slice.md) o uno
  distinto.

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

Salvo que ya se deduzca lo contrario de
[SCN-001](scenarios/SCN-001_mountain-village-arrival.md):

- La estación exacta de llegada.
- Los seis personajes concretos y sus relaciones iniciales.
- El edificio inicial y el grado de elección disponible.
- Las dimensiones y cantidades exactas del mapa local. Su carácter
  procedural, ficticio y de pueblo pequeño de montaña ya está cerrado en
  [WLD-008](20-world/WLD-008_local-procedural-map-generation.md).
- La población zombi inicial.
- La disponibilidad inicial de armas, agua, alimento y electricidad.
- La existencia y proximidad de otras comunidades.

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
