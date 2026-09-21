# Estado del proyecto

Este documento es breve y se actualiza en cada entrega que cambie el estado
real del proyecto. No sustituye a las fuentes canónicas: para reglas, consulta
[docs/INDEX.md](INDEX.md).

## Fase actual

`DESIGN-004` reinicia la **línea técnica activa** de Z-World: de un
prototipo 3D en Godot a un laboratorio de simulación web centrado en
mecánicas (Node.js, TypeScript, Next.js, PostgreSQL; ver
[DEC-0008](decisions/DEC-0008_simulation-first-web-architecture.md)). Esta
entrega es **exclusivamente documental**: no existe todavía ninguna
aplicación Node.js/Next.js inicializada, ni código, ni pruebas ejecutables
de la nueva línea. La hoja de ruta activa de implementación es
[RDM-003](roadmap/RDM-003_simulation-first-playable-roadmap.md).

El prototipo histórico Godot queda preservado íntegro, sin más desarrollo
activo. Su historial de entregas de código:

- `IMPLEMENTATION-001` (vertical slice visual): **aceptada manualmente por
  Dennis el 18 de septiembre de 2026**.
- `IMPLEMENTATION-002` (trabajo y personas) e `IMPLEMENTATION-003`
  (exploración y subsistencia): técnicamente implementadas; la aceptación
  manual de `IMPLEMENTATION-003` seguía **pendiente** en el momento del
  reinicio de línea de código y no se declara superada por este cambio de
  arquitectura.
- `IMPLEMENTATION-004` («Defensa y vida propia»): **completada técnicamente**
  en la rama `claude/docs-foundation-setup-94xtnn` y el PR #10 de GitHub
  («IMPLEMENTATION-004: Defensa y vida propia»), **no fusionada en `main`**
  y **no aceptada manualmente** por Dennis. No fue adoptada como parte de
  la línea activa antes del cambio de arquitectura de `DESIGN-004`. Su rama
  y su PR se conservan como referencia histórica del prototipo Godot, sin
  continuarse ni fusionarse.

## Última corrección técnica

`HOTFIX-001` — corrige el error de compilación en
`ResourceRegistry.reserve()` (`src/resources/resource_registry.gd`) que
impedía abrir y ejecutar `IMPLEMENTATION-003` en Godot 4.7.2: `get_stack()`
usaba `Dictionary.get(id, null)` para devolver un `ResourceStack`
tipado, lo que el analizador estático rechazaba; ahora comprueba
`Dictionary.has()` antes de indexar. También añade `.gitattributes` para
fijar finales de línea LF en los archivos de texto del proyecto (`.gd`,
`.tscn`, `.tres`, `.godot`, `.import`, `.cfg`, `.md`) y evitar que Godot en
Windows genere diffs de línea completa por CRLF. No cambia comportamiento
de juego ni contenido: es una corrección técnica acotada, no una entrega de
`RDM-001`. `godot --headless` sigue sin estar disponible en este entorno
(ver «Validaciones automatizadas» más abajo); `git diff --check` no
informó errores.

## Última entrega documental completada

`DESIGN-006` — **cierre del motor de simulación, resolución y presentación
de capacidades** (21 de septiembre de 2026). Entrega **exclusivamente
documental**: no se ha implementado código, no se ha inicializado la
aplicación web, y no se ha tocado `src/`, `scenes/`, `tests/` ni
`project.godot`. Convierte en decisiones canónicas las veintidós
cuestiones `P01`–`P22` de `ARC-008`, incorporando las correcciones finales
de Dennis: escala real `0–10` con media humana `4` y `0` como valor real
distinto de dato desconocido; tres perfiles cerrados de ponderación entre
característica y habilidad (70/30, 50/50, 30/70); modelo híbrido de
ejecución directa, progreso continuo `D` (variación de hasta `±8 %`) y
comprobaciones significativas `B` (margen, variación acotada `[-4,+4]` y
cinco bandas internas); umbral de **tres puntos**, no dos, para tarea
básica; cooperación por funciones reales con rendimientos decrecientes
(`100 %/60 %/35 %/20 %`), responsable/ejecutor/supervisor y sustitución;
dos dimensiones combinables de modo (ritmo y atención); resultados
multidimensionales, conocimiento imperfecto, reintentos, oposición
activa, aprendizaje y eventos con niveles de atención y pausa crítica;
persistencia determinista del azar con equivalencia entre velocidades de
simulación; y nivel actual numérico `0–10` visible en la ficha del
personaje, con potencial real, calibre oculto y máximo numérico siempre
ocultos, comunicados mediante un catálogo cerrado de frases cualitativas.

Documento nuevo:
[DEC-0011](decisions/DEC-0011_hybrid-resolution-engine-and-capability-presentation.md)
(`approved`, decisión transversal que respalda el cierre) y
[DISC-0005](discovery/DISC-0005_resolution-engine-closure-traceability.md)
(`draft`, trazabilidad completa de `P01`–`P22`).

Documentos modificados a `approved`:
[ARC-006](90-architecture/ARC-006_action-and-event-resolution-model.md),
[ARC-007](90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md) y
[ARC-008](90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md)
(antes `draft`), que dejan de presentar `P01`–`P22` como abiertas.
[CHR-006](30-characters/CHR-006_characteristics-and-skill-catalog.md) se
actualiza sin cambiar de estado (`approved`) a la escala real `0–10`, la
media humana `4` y el nivel actual visible.
[UI-004](80-interface/UI-004_qualitative-capability-presentation.md) se
actualiza sin cambiar de estado (`approved`) para corregir su prohibición
absoluta de cifras de capacidad: el nivel actual `0–10` de la ficha es
visible; las cifras internas de una acción concreta siguen ocultas.
[CHR-007](30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md)
**permanece `draft`**: incorpora el catálogo de frases de potencial y la
visibilidad del nivel actual, pero conserva abiertas la distribución de
estrellas del calibre, los campos de potencial, la adaptación al
apocalipsis, los dominios de habilidad y el catálogo de rasgos.

**Contradicciones corregidas.** Referencias activas a la escala `1–10` en
`CHR-006` se corrigen a `0–10`; el umbral de tarea básica se fija en `+3`,
no `+2`; los cuatro modos de trabajo se formalizan como dos dimensiones
combinables (ritmo y atención), no como categorías mutuamente excluyentes;
la fórmula antigua `(característica + 2 × habilidad) / 3` y la función
logística candidata de B quedan descartadas como universales, sustituidas
por los tres perfiles de ponderación y el margen con bandas internas; la
prohibición absoluta de cifras de `UI-004` se corrige para permitir el
nivel actual visible sin abrir umbrales de acción.

**Estados.** `ARC-006`, `ARC-007` y `ARC-008` pasan de `draft` a
`approved`. `CHR-006` y `UI-004` permanecen `approved`. `CHR-007` permanece
`draft` por las razones anteriores. `DISC-0005` permanece `draft`.
**Ningún documento pasa a `implemented`.** El motor de resolución sigue sin
existir en código: la nueva línea Node.js/TypeScript continúa sin
inicializar y el prototipo histórico Godot conserva su propia lógica ya
descrita en las entregas de código previas.

Ver la trazabilidad completa en
[DISC-0005](discovery/DISC-0005_resolution-engine-closure-traceability.md).

## Entrega documental previa

`DESIGN-005` — **mapas local y regional, generación procedural, equipos e
interacción contextual** (21 de septiembre de 2026). Entrega
**exclusivamente documental**: no se ha implementado código, no se ha
inicializado la aplicación web, y no se ha tocado `src/`, `scenes/`,
`tests/` ni `project.godot`. No amplía `RDM-003` ni reabre `RDM-001`.

Cuatro documentos nuevos:

- [WLD-008](20-world/WLD-008_local-procedural-map-generation.md)
  (`approved`): generación **espacial** del mapa local, perfil procedural
  controlado de pueblo pequeño de montaña, doce capas de perfil a
  representación Canvas, presupuesto de complejidad con exclusión expresa de
  grandes ciudades, estructura espacial técnica invisible y conceptos de
  territorio conocido/usado/controlado sin crear estados de zona nuevos.
- [UI-006](80-interface/UI-006_contextual-place-interaction-and-teams.md)
  (`approved`): ficha contextual de lugar, evolución de acciones según el
  conocimiento, regla «conocida pero no disponible = gris con motivo; no
  reconocida = ausente», reconocimiento exterior como barrera blanda,
  revelado parcial de interiores, diez familias de acción contextual y
  selector de equipo operativo local `Auto / 1 / 2 / 3 / 4` con asignación
  `Comunidad` o `Equipo seleccionado`.
- [DEC-0010](decisions/DEC-0010_procedural-local-and-regional-map-direction.md)
  (`approved`): dirección de las dos escalas espaciales; mapa local 2D
  cenital continuo, mapa regional futuro geográfico con regiones internas,
  geografía procedural ficticia, 3D Godot como antecedente histórico y
  ausencia de mapa local automático por punto regional.
- [DISC-0004](discovery/DISC-0004_local-regional-maps-and-contextual-actions-traceability.md)
  (`draft`): trazabilidad completa del encargo —decisiones cerradas,
  aclaraciones, opciones descartadas, ejemplos no normativos, preguntas
  abiertas y contradicciones corregidas.

**Contradicciones corregidas.** `WLD-001`, `WLD-003`, `SCN-001`, `DEC-0002`
y `GLOSSARY.md` describían el mapa local como espacio 3D activo; ahora
declaran su representación 2D cenital y sitúan el 3D en el prototipo
histórico Godot. `docs/INDEX.md`, `docs/OPEN-QUESTIONS.md`, `WLD-001`,
`WLD-003`, `SCN-001` y `UI-001` dejaban leer `RDM-001` como roadmap
vigente; ahora remiten a `RDM-003`, con `RDM-001` conservada `deprecated`
como historia del prototipo. Se aclara en `ARC-003`, `WLD-001`, `WLD-003` y
`GLOSSARY.md` que «materialización» es generación diferida de detalle
semántico y **no** implica abrir un mapa local nuevo.

**Estados.** `ARC-007` y `ARC-008` permanecen `draft`: esta entrega cierra
la **interfaz** de tamaño y asignación de un equipo local, no las fórmulas
del motor; `P09` distingue ahora lo cerrado de lo pendiente y `P10` sigue
íntegramente abierto. `DISC-0004` permanece `draft`. `RDM-001` permanece
`deprecated`. **Ningún documento pasa a `implemented`.** Las 34 prioridades
de `UI-003` no se renombran, añaden, eliminan ni mezclan con habilidades: el
selector `Auto / 1 / 2 / 3 / 4` no es la escala `Nunca/1–5`.

**El mapa regional no entra en el roadmap activo**: `RDM-003` gana una
sección 3.3 que lo declara horizonte futuro sin fecha.

## Entrega documental anterior

Consolidación documental del **motor de acciones/trabajos/eventos**, el
**catálogo de horizonte máximo de personaje** (nueve características, 34
habilidades, potencial oculto, calibre oculto y adaptación al apocalipsis)
y el **modelo de objeto y familias logísticas del asentamiento** (21 de
septiembre de 2026): rescate documental de contenido creado originalmente
en la rama `claude/docs-foundation-setup-94xtnn` y el PR #10 de GitHub
(«IMPLEMENTATION-004: Defensa y vida propia»), cuando esa rama todavía
partía de `main` anterior a `DESIGN-004`. El PR #10 quedó obsoleto por el
reinicio de línea técnica de `DESIGN-004` y se cierra sin fusionarse; esta
entrega recupera únicamente su documentación válida, la reconcilia contra
el `main` actual y la integra en una rama y un PR exclusivamente
documentales nuevos, partiendo de `main` con `DESIGN-004` ya incorporado.
No se transfiere código, escenas, recursos ni tests de Godot.

Seis documentos nuevos —
[ARC-006](90-architecture/ARC-006_action-and-event-resolution-model.md),
[ARC-007](90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md),
[ARC-008](90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md)
(`draft`, motor de resolución: procedimiento común, medias de
características/habilidades, modelos B y D, cooperación, órdenes, modos,
resultados, conocimiento imperfecto, eventos, 19 casos de validación y 22
decisiones pendientes `P01`–`P22`),
[CHR-006](30-characters/CHR-006_characteristics-and-skill-catalog.md)
(`approved`, nueve características y catálogo cerrado de 34 habilidades
base),
[CHR-007](30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md)
(`draft`, potencial oculto, calibre oculto de 1 a 5 estrellas, adaptación
al apocalipsis, generación en ocho pasos, procesado diario y 42 reglas
invariantes),
[SET-008](40-settlement/SET-008_object-model-and-logistics-families.md) y
[SET-009](40-settlement/SET-009_disassembly-and-world-transformation.md)
(`draft`, modelo de objeto, 12 familias logísticas de horizonte máximo,
flujo de desmontaje en nueve pasos y 20 decisiones cerradas) — respaldados
por
[DEC-0009](decisions/DEC-0009_character-catalog-and-resolution-engine-domain.md).
[CHR-005](30-characters/CHR-005_extended-skill-taxonomy.md) queda
`deprecated`, sustituido por `CHR-006`, conservado como antecedente.

**Reconciliación de identificadores contra `DESIGN-004`.** El contenido
original de este rescate usaba `ARC-004`/`ARC-005`/`ARC-006`, `SET-007`/
`SET-008` y `DEC-0008`, slots que `DESIGN-004` ya ocupa con documentos no
relacionados (núcleo de simulación, modelo de datos semántico, explotación
de edificios y el propio reinicio de arquitectura). Se renumeraron a los
siguientes IDs libres: `ARC-004`→`ARC-006`, `ARC-005`→`ARC-007`,
`ARC-006`→`ARC-008`, `SET-007`→`SET-008`, `SET-008`→`SET-009`,
`DEC-0008`→`DEC-0009`; `CHR-006` y `CHR-007` no colisionaban y conservan su
numeración original. El modelo de objeto de `SET-008` se ajustó para no
redeclarar las cinco capas de aprovechamiento de un edificio, ya canónicas
de `SET-007` (`DESIGN-004`): `SET-008`/`SET-009` desarrollan en detalle
solo las capas 1 a 3 (contenido suelto, mobiliario/equipamiento e
instalaciones) desde el punto de vista del objeto individual y sus
familias logísticas; la estructura y demolición de un edificio (capa 5)
siguen siendo responsabilidad exclusiva de `SET-007`. El motor de
resolución de `ARC-006`–`ARC-008` es un modelo de reglas de diseño,
agnóstico de motor, que la línea activa de código deberá implementar sobre
el núcleo de simulación ya aprobado en `ARC-004`; no reintroduce Godot como
arquitectura activa.

No cambia el juego ejecutable: no se tocó código, escenas, `game_data/` ni
`tests/`, y no se amplió `RDM-001` ni `RDM-003`. Los nueve recursos
agregados de `SET-003` y las once habilidades del primer corte de `CHR-001`
§3.1 siguen siendo el alcance realmente implementado; su migración hacia
estos catálogos de horizonte máximo queda pendiente, sin fecha, igual que
la ya reconocida entre las diez familias de prioridad y las 34 de
`UI-003`.

## Entrega documental precedente

`DESIGN-004` — reinicio centrado en simulación y generador semántico de
lugares: cambia la línea técnica activa de Godot 3D a un laboratorio de
simulación web (Node.js/TypeScript/Next.js/PostgreSQL,
[DEC-0008](decisions/DEC-0008_simulation-first-web-architecture.md));
documenta el reloj continuo, las velocidades y el modelo mínimo de fases
visibles de un trabajo
([ARC-004](90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md));
documenta el mapa local 2D cenital con niebla y exploración progresiva
([UI-005](80-interface/UI-005_top-down-simulation-workbench.md)); formaliza
el generador procedural semántico de lugares y edificios, con cinco capas
de aprovechamiento y tres vidas irreversibles
([WLD-005](20-world/WLD-005_semantic-place-and-building-generation.md),
[SET-007](40-settlement/SET-007_building-exploitation-reuse-and-demolition.md));
formaliza la presión histórica de saqueo, correlación local, rutas y
bolsas olvidadas
([WLD-006](20-world/WLD-006_historical-looting-pressure-and-routes.md)) y
la historia del apocalipsis con narrativa ambiental
([WLD-007](20-world/WLD-007_place-history-and-environmental-storytelling.md));
crea el catálogo máximo de 22 familias de lugares, estancias/instalaciones
y ocupantes/profesiones/aficiones/rasgos como horizonte de referencia
([CAT-001](catalogs/CAT-001_maximum-place-catalog.md)–[CAT-004](catalogs/CAT-004_initial-semantic-place-slice.md));
define el modelo conceptual de datos del mundo semántico
([ARC-005](90-architecture/ARC-005_semantic-world-data-model.md)); y
sustituye el roadmap activo
([RDM-003](roadmap/RDM-003_simulation-first-playable-roadmap.md)). No
inicializa Node.js, Next.js, Prisma ni PostgreSQL, no toca `src/`,
`scenes/`, `game_data/`, `schemas/` ni `tests/` de Godot, y no marca ningún
documento nuevo como `implemented`. Ver
[docs/discovery/DISC-0003](discovery/DISC-0003_procedural-place-generator-traceability.md)
para la trazabilidad completa del encargo.

## Entregas documentales previas a `DESIGN-004`

`DESIGN-003` — trabajo, recuperación y conocimiento aplicado: horizonte
máximo documental de prioridades, órdenes, zonas, políticas, eventos y
trabajos (nueve bloques y 34 prioridades con escala `Nunca/1–5`,
`UI-003`); presentación cualitativa de capacidad sin números internos
(`UI-004`); inspección, saqueo, reconocimiento experto y revisitas
dependientes de la persona con contenido base estable (`WLD-004`); fuentes
de conocimiento físicas, humanas y digitales, estados comunitarios de un
fragmento y capacidad real (`SET-006`); y la decisión transversal que
respalda las 34 prioridades separadas de habilidad y del alcance
implementado (`DEC-0007`). Los cinco documentos son `approved`. No cambia
el juego ejecutable: no se tocó código, escenas, `game_data/` ni `tests/`,
no se amplió `RDM-001` y `CHR-005`/`RDM-002` siguen `draft`. Ver
[UI-003](80-interface/UI-003_work-priority-taxonomy.md),
[UI-004](80-interface/UI-004_qualitative-capability-presentation.md),
[WLD-004](20-world/WLD-004_expertise-dependent-recovery.md),
[SET-006](40-settlement/SET-006_knowledge-assets-and-capability.md) y
[DEC-0007](decisions/DEC-0007_layered-work-and-priorities.md).

## Última entrega de código (prototipo histórico Godot)

Estas entregas pertenecen al prototipo Godot, ya no es la línea activa de
código (ver [DEC-0008](decisions/DEC-0008_simulation-first-web-architecture.md)).
Se conservan íntegras como referencia histórica.

`IMPLEMENTATION-004` — defensa y vida propia: cierre de accesos, zombis
elementales, ruido, guardia, retirada, aprendizaje e iniciativa autónoma
acotada sobre el prototipo Godot. **Completada técnicamente** en la rama
`claude/docs-foundation-setup-94xtnn` y el PR #10 de GitHub, **sin fusionar
en `main`** y **sin aceptación manual** de Dennis. No fue adoptada como
parte de la línea activa antes del cambio de arquitectura de `DESIGN-004`;
no se continúa ni se fusiona.

`IMPLEMENTATION-003` — exploración y subsistencia: información de lugares
con los cinco niveles de `WLD-002` y acciones de observar, inspeccionar y
registrar; sustitución de los ocho objetivos demostradores por ocho lugares
reales (tres edificios explorables y cinco lugares del terreno); catálogo de
diez tipos de recurso con pilas localizadas y seis estados logísticos;
pertenencias de llegada; almacén de capacidad 50 y depósito de agua de
capacidad 12 con transporte en lotes de hasta 5; necesidades de hidratación,
alimentación y descanso con acciones automáticas y cadena de supervivencia;
alimento por registro, pesca y hongos; agua por acarreo y por conducción de
gravedad; deterioro del alimento fresco y secado; ejecución de trabajo por
fases dentro del mismo tablón; franja de almacenados, panel «Recursos»,
acciones por lugar y ficha de persona con necesidades y carga. No implementa
defensa, zombis, autonomía, aprendizaje, zonas, generación procedural ni
guardado. Técnicamente implementado; **aceptación manual pendiente**.

Entrega previa: `IMPLEMENTATION-002` — trabajo y personas: estado de trabajo
por persona (diez prioridades y once habilidades), ocho objetivos de trabajo
demostradores en el mapa, tablón de trabajos con reservas y selector
determinista, navegación 3D generada en código, ejecución con progreso,
menú contextual de clic derecho y paneles de «Prioridades», «Trabajos» y
ficha de persona. **Aceptación manual pendiente** en su momento; sus ocho
demostradores han sido retirados por `IMPLEMENTATION-003`.

Entrega previa: `IMPLEMENTATION-001` — vertical slice visual: proyecto Godot
4.7.2 importable desde la raíz, mapa local fijo de pueblo de montaña, seis
supervivientes visuales seleccionables, cámara estratégica cenital
controlada solo con ratón, selección con panel de información en español y
reloj de simulación con pausa y velocidades ×1, ×2, ×4 y ×10. **Aceptada
manualmente el 18 de septiembre de 2026.**

Entrega previa: `DESIGN-002` — horizonte máximo de diseño documentado, sin
ampliar el primer corte jugable. Ver
[VIS-003](10-vision/VIS-003_maximum-design-envelope.md) y
[DEC-0006](decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md).

Entrega anterior: `DESIGN-001` — especificación funcional cerrada de cómo se
juega minuto a minuto en el mapa local y alcance exacto del primer corte
jugable. Ver
[RDM-001](roadmap/RDM-001_first-playable-slice.md).

## Tecnología aprobada

### Línea activa (laboratorio de simulación, sin inicializar todavía)

Node.js LTS, TypeScript estricto, Next.js + React, núcleo de simulación
TypeScript puro, PostgreSQL desde el inicio con Prisma aislado detrás de la
persistencia, Zod para contratos de frontera y Vitest para pruebas
acotadas del motor (ver
[DEC-0008](decisions/DEC-0008_simulation-first-web-architecture.md)).
Ningún archivo de este stack existe todavía en el repositorio.

### Prototipo histórico (Godot, ya no es la línea activa)

- Motor: Godot 4. Baseline concreto de las cuatro entregas del prototipo:
  **Godot 4.7.2-stable, edición estándar**, no .NET (ver
  [DEC-0001](decisions/DEC-0001_godot-4.md), `deprecated`, sustituida por
  [DEC-0008](decisions/DEC-0008_simulation-first-web-architecture.md)).
- Lenguaje: GDScript, usado exclusivamente en el prototipo.
- Renderizador: Forward+ (escritorio).
- Guardado local; sin PostgreSQL ni servicios online. No implementado en el
  prototipo.

Detalle en [ARC-001](90-architecture/ARC-001_technical-direction.md) y
[ARC-004](90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md).

## Funcionalidad realmente implementada en la línea activa (Node.js/TypeScript)

Ninguna. `DESIGN-004` y `DESIGN-005` son exclusivamente documentales: no
existe aplicación Next.js, núcleo de simulación TypeScript, esquema
PostgreSQL/Prisma, mapa Canvas 2D, generador espacial, pathfinding, niebla,
ficha contextual, selector de equipo ni prueba Vitest en el repositorio.

## Funcionalidad realmente implementada en el prototipo histórico Godot

- Proyecto Godot 4.7.2 importable desde la raíz (`project.godot`), escena
  principal configurada en `run/main_scene`.
- Mapa local fijo (maqueta determinista, sin generación procedural) con
  pueblo de montaña: terreno, siluetas de montaña, camino principal con un
  desvío, agua, bosque, campo abierto y seis edificios (uno marcado como
  refugio candidato).
- Seis supervivientes con ID estable (`person.initial.01`–`06`), nombre
  provisional y una diferencia visual de color, que ahora se desplazan por
  el mapa mediante navegación.
- Selección con clic izquierdo de las seis personas, el refugio, los demás
  edificios y los objetivos de trabajo, con indicador visual y panel en
  español (ID, tipo, nombre, descripción).
- Cámara estratégica cenital inclinada, controlada solo con ratón
  (desplazamiento con botón central, zoom con rueda, botón «Centrar
  cámara»), con límites de mapa y zoom.
- Reloj de simulación independiente de `Engine.time_scale`, con pausa y
  velocidades ×1, ×2, ×4 y ×10, iniciando en Día 1, 08:00.
- HUD mínimo en español con nombre del escenario, reloj, controles de
  velocidad, botón de centrar cámara, panel de selección, ayuda compacta y
  aviso de prototipo.
- Estado de trabajo por persona, separado de su representación visual: diez
  familias de prioridad (todas en `2` al inicio, escala `0–4`) y once
  habilidades iniciales con escala provisional `0–4`, más estado operativo
  (`idle`, `moving`, `working`, `direct_order`), trabajo actual, orden
  directa y motivo operativo.
- Ocho lugares reales seleccionables y designables, que sustituyen a los
  ocho objetivos demostradores de `IMPLEMENTATION-002`: tres edificios
  explorables (`building.shelter_candidate`, `building.house_a`,
  `building.workshop`) con contenido fijo, y cinco lugares del terreno
  (`site.stream_water`, `site.pond_fishing`, `site.forest_mushrooms`,
  `site.highland_spring`, `site.water_deposit`).
- Información de lugares con los cinco niveles de `WLD-002` (`unknown`,
  `sighted`, `observed`, `inspected`, `exploited`), que nunca retrocede, y
  tres acciones que la hacen avanzar: observar (5 s a ×1), inspeccionar
  (10 s) y registrar (12 s). El contenido fijo se materializa exactamente
  una vez.
- Catálogo de diez tipos de recurso con identificador estable y pilas
  localizadas con tipo, cantidad, ubicación, condición, accesibilidad,
  portador y reserva, con los seis estados logísticos de `SET-003`.
- Pertenencias de llegada por persona, como pilas reales que hay que
  depositar.
- Almacén de capacidad 50 y depósito de agua localizado de capacidad 12,
  establecidos al registrar el refugio candidato, con transporte en lotes de
  hasta 5 unidades y acción «Transportar todo lo accesible».
- Necesidades de hidratación, alimentación y descanso en escala `0–100`,
  con pérdidas de 40, 30 y 25 puntos por día simulado, umbrales en 50 y 20,
  acciones automáticas de beber, comer y descansar, y cadena de
  supervivencia que rompe el bloqueo circular.
- Alimento por tres rutas: registro de edificios, pesca en el estanque (12
  unidades) y recolección de hongos (8 unidades), con política de obtención
  continua y distinción entre «no reconocido» y «agotado».
- Agua por dos rutas: acarreo con recipientes reutilizables (2 unidades por
  viaje) con política «Mantener 12 de agua», y conducción por gravedad que
  consume 4 tablones y 2 materiales de reparación una sola vez y produce 1
  unidad de agua cada 10 s a ×1 sin superar la capacidad del depósito.
- Deterioro del alimento fresco (60, 45 o 25 puntos de condición por día
  simulado en terreno, transporte o almacén), transformación en alimento
  echado a perder al llegar a 0 y secado de 3 frescos en 2 conservados.
- Ejecución de trabajo por fases (`travel`, `act`, `return`, `deliver`) con
  recursos reservados y destino de entrega, dentro del mismo tablón.
- Tablón de trabajos con estados `pending`, `reserved`, `moving`, `working`,
  `completed`, `cancelled` y `blocked`, una única reserva por objetivo,
  progreso conservado al cancelar y selector determinista por prioridad,
  urgencia, distancia de ruta, espera, nivel de habilidad e ID.
- Cuatro razones de bloqueo y tres razones de «sin trabajo» concretas, que
  se recuperan automáticamente al cambiar la causa.
- Navegación 3D local con malla generada en código al cargar la escena
  (`NavigationRegion3D` + `NavigationAgent3D`): las rutas no atraviesan
  edificios, agua, arbolado ni salen del terreno útil, y Dennis no hornea
  nada a mano.
- Movimiento y progreso gobernados por el avance de simulación del reloj
  (`gameplay_delta = delta real × multiplicador`, `0` en pausa), sin usar
  `Engine.time_scale` y sin alterar la conversión de calendario.
- Órdenes puntuales con clic derecho: «Mover aquí», «Hacer ahora …» y
  «Designar para la comunidad», con opciones deshabilitadas y su razón
  cuando no son posibles.
- Paneles de HUD «Prioridades» (matriz 10 × 6 con clic izquierdo/derecho,
  número, color y tooltip), «Trabajos» (activos y últimos completados, con
  fase y resultado) y «Recursos» (cantidad por tipo y estado logístico),
  franja de almacenados, panel de selección de lugar con un botón por
  acción y su motivo de bloqueo, y ficha de persona con estado, actividad,
  fase, motivo, progreso, necesidades, carga y las once habilidades.
- Smoke test headless en `tests/smoke_test.gd` (ver validaciones ejecutadas
  o no ejecutadas más abajo).

No implementa defensa, cierre de accesos, zombis, combate, ruido, guardia,
retirada, autonomía, iniciativas, aprendizaje, relaciones, salud,
enfermedad, muerte, zonas de territorio, interiores 3D, agricultura,
animales, combustible, electricidad, potabilización, cocina, recetas,
generación procedural, guardado ni carga: quedan para las dos entregas
posteriores de `RDM-001`.

## Documentación

- **Aprobada (`approved`)**: visión, pilares y horizonte máximo
  (`10-vision`, incluyendo `VIS-003`), escalas, exploración y mundo
  estratégico (`WLD-001`, `WLD-002`, `WLD-003`), recuperación dependiente de
  la persona (`WLD-004`), generación semántica de lugares, presión histórica
  de saqueo, historia del apocalipsis y generación espacial procedural del
  mapa local (`WLD-005`, `WLD-006`, `WLD-007`, `WLD-008`),
  modelo de personaje, aprendizaje, autonomía, historia vital y catálogo
  cerrado de nueve características/34 habilidades (`CHR-001`, `CHR-002`,
  `CHR-003`, `CHR-004`, `CHR-006`), crecimiento, producción, recursos,
  transición tecnológica, red productiva, activos de conocimiento y
  explotación/reutilización/demolición de edificios del asentamiento
  (`SET-001` a `SET-007`), comunidad viva, política interna y comunidades
  externas (`SOC-001`, `SOC-002`, `SOC-003`), narrativa emergente y memoria
  causal (`NAR-001`, `NAR-002`), interacción, control, gestión a escala,
  taxonomía de trabajo, presentación cualitativa de capacidad, laboratorio
  de simulación cenital e interacción contextual con lugares y equipos
  locales (`UI-001` a `UI-006`),
  amenaza zombi (`THR-001`), dirección técnica, generación procedural,
  simulación multiescala, núcleo de simulación, modelo conceptual de datos
  del mundo semántico y motor de resolución de acciones, trabajos y
  eventos (`ARC-001` a `ARC-008`), escenario inicial
  (`SCN-001`), hoja de ruta activa (`RDM-003`), catálogo máximo de lugares,
  estancias/instalaciones y ocupantes/profesiones/aficiones/rasgos como
  horizonte de referencia (`CAT-001` a `CAT-003`), decisiones `DEC-0002` a
  `DEC-0011` (`DEC-0001` es `deprecated`), sistema documental (`DOC-001`).
- **Borrador (`draft`)**: síntesis de descubrimiento (`DISC-0001`,
  `DISC-0002`), trazabilidad del generador procedural de lugares
  (`DISC-0003`), trazabilidad de mapas local y regional e interacción
  contextual (`DISC-0004`), trazabilidad del cierre del motor de
  resolución y capacidades (`DISC-0005`), horizonte configurable de
  amenazas (`THR-002`), horizonte de capacidades a largo plazo
  (`RDM-002`), propuesta de subconjunto inicial de lugares (`CAT-004`),
  potencial oculto, calibre oculto y adaptación al apocalipsis (`CHR-007`,
  con el catálogo de frases de potencial y el nivel actual visible ya
  cerrados), y modelo de objeto, familias logísticas y desmontaje de
  objetos (`SET-008`, `SET-009`).
- **Sustituido (`deprecated`)**: motor Godot 4 como línea inicial
  (`DEC-0001`, sustituida por `DEC-0008`), alcance del primer corte
  jugable del prototipo Godot (`RDM-001`, sustituida por `RDM-003`) y
  taxonomía extendida de habilidades (`CHR-005`, sustituida por `CHR-006`);
  las tres se conservan como referencia histórica.
- **Implementado (`implemented`)**: no se usa todavía en ningún documento de
  dominio. `IMPLEMENTATION-001` a `IMPLEMENTATION-004` son entregas de
  código del prototipo histórico Godot, no un cambio de estado documental
  de `WLD-002`, `SET-003`, `CHR-001`, `UI-001`, `CHR-003`, `SCN-001`,
  `ARC-002` ni del resto de `RDM-001`. `DESIGN-004` no marca ningún
  documento nuevo como `implemented`: la nueva línea de código
  Node.js/TypeScript no tiene todavía ninguna entrega. El motor de
  resolución ahora cerrado y `approved` en `ARC-006`–`ARC-008` tampoco está
  implementado: el prototipo Godot histórico resolvía trabajos con su
  propia lógica ya descrita en las entregas de código de la sección
  anterior, y la nueva línea activa todavía no implementa ningún motor de
  resolución. `DESIGN-005` y `DESIGN-006` tampoco marcan nada como
  `implemented`: ni el generador espacial de `WLD-008`, ni la ficha
  contextual y el selector de equipo de `UI-006`, ni la escala `0–10`, los
  perfiles de ponderación, los modelos B/D, la cooperación, los modos ni
  la presentación de potencial de `DESIGN-006` existen en código.

## Validaciones automatizadas de `IMPLEMENTATION-003`

`godot --headless` tampoco está disponible en el entorno donde se implementó
esta entrega: los dos comandos del prompt (`godot --headless --path .
--editor --quit` y `godot --headless --path . --script
res://tests/smoke_test.gd`) quedan como **NOT RUN** por ausencia del motor.
No se instaló Godot para forzar su ejecución. `git diff --check` sí se
ejecutó y no informó errores.

El smoke test conserva las comprobaciones de `IMPLEMENTATION-001` y las de
`IMPLEMENTATION-002` que siguen siendo válidas (retirando las ligadas a los
ocho demostradores desaparecidos) y añade seis:

1. Niveles de información y materialización única del contenido fijo.
2. Reservar, recoger y depositar conserva la cantidad exacta.
3. Una necesidad crítica consume exactamente una unidad y el valor nunca
   sale de `0–100`.
4. Deterioro del alimento fresco frente a la estabilidad del conservado, con
   transformación en condición 0.
5. Límites de disponibilidad de pesca y hongos, distinguiendo «no
   reconocido» de «agotado».
6. La conducción reserva y consume materiales una sola vez y no supera la
   capacidad de 12 del depósito.

Las validaciones de `IMPLEMENTATION-001` e `IMPLEMENTATION-002` quedaron en
su momento como **NOT RUN** por la misma razón.

## Validaciones documentales de `DESIGN-006`

Entrega documental: no hay suite ejecutable aplicable y no se instalaron
herramientas. Se ejecutaron comprobaciones acotadas:

- revisión, una por una, de las 22 decisiones `P01`–`P22` para confirmar
  que ninguna permanece abierta o contradictoria en `ARC-006`, `ARC-007` o
  `ARC-008`;
- búsqueda de referencias activas a la escala `1–10`, «media humana 5»,
  umbral `+2`, la fórmula antigua de ponderación `(característica + 2 ×
  habilidad) / 3`, los cuatro modos como categorías excluyentes y la
  prohibición total de mostrar el nivel actual;
- comprobación de que `0` no se usa como sinónimo de `null`, dato
  desconocido o falta de conocimiento en `CHR-006` y `ARC-006`;
- revisión de enlaces y cabeceras `depends_on`/`related` de los documentos
  tocados, incluidos los nuevos anclajes de sección entre `CHR-006`,
  `CHR-007`, `ARC-006`, `ARC-007`, `ARC-008` y `UI-004`;
- comprobación de que los índices de dominio incluyen `DEC-0011` y
  `DISC-0005` con ID, estado y propósito correctos, y que `ARC-006` a
  `ARC-008` figuran como `approved`;
- comprobación de que `docs/OPEN-QUESTIONS.md` conserva solo preguntas
  realmente abiertas de otros sistemas (campos de potencial, distribución
  de estrellas, adaptación al apocalipsis, dominios de habilidad,
  fórmulas de idoneidad por familia, umbrales exactos de dificultad);
- comprobación de que ningún documento pasa a `implemented`;
- comprobación de que no se ha modificado código ni configuración
  ejecutable (`src/`, `scenes/`, `tests/`, `project.godot` intactos);
- `git diff --check`, sin errores.

## Validaciones documentales de `DESIGN-005`

Entrega documental: no hay suite ejecutable aplicable y no se instalaron
herramientas. Se ejecutaron comprobaciones acotadas:

- revisión de enlaces y cabeceras `depends_on`/`related` de los documentos
  tocados;
- comprobación de que los índices de dominio incluyen `WLD-008`, `UI-006`,
  `DEC-0010` y `DISC-0004` con ID, estado y propósito correctos;
- búsqueda de referencias activas al mapa local 3D y a `RDM-001` como
  roadmap vigente, distinguiendo las menciones históricas legítimas;
- búsqueda de usos de «materializar» que pudieran implicar abrir un mapa
  local;
- comprobación de que `Auto / 1 / 2 / 3 / 4` no se confunde con la escala de
  prioridad `Nunca/1–5` ni con el tamaño de una expedición;
- comprobación de que las 34 prioridades de `UI-003` no se renombran,
  añaden, eliminan ni mezclan con habilidades;
- `git diff --check`, sin errores.

## Bloqueos o contradicciones conocidos

Ninguno detectado en esta entrega, más allá de la imposibilidad de ejecutar
Godot en el entorno de implementación (ver sección de validaciones de
`IMPLEMENTATION-003`).

## Aceptación manual pendiente

Todas estas aceptaciones corresponden al prototipo histórico Godot, ya no
es la línea activa de código.

`IMPLEMENTATION-001` fue aceptada manualmente por Dennis el 18 de septiembre
de 2026. La aceptación manual de `IMPLEMENTATION-003` (lista de dieciocho
pasos en [README.md](../README.md)) está pendiente de que Dennis la
ejecute. No se declara superada por el agente que implementó la entrega.
La lista de aceptación de `IMPLEMENTATION-002` queda absorbida por esta: sus
objetivos demostradores ya no existen. `IMPLEMENTATION-004` está completada
técnicamente en su rama y PR #10, pero no está aceptada manualmente ni fue
adoptada como parte de la línea activa antes del cambio de arquitectura de
`DESIGN-004`; no se abre ninguna lista de aceptación adicional para ella
mientras siga sin fusionarse.

## Próximo candidato de trabajo (no es un compromiso)

Con el reinicio de línea activa de `DESIGN-004`, el siguiente candidato de
implementación es el primer incremento de
[RDM-003](roadmap/RDM-003_simulation-first-playable-roadmap.md):
inicialización técnica del laboratorio de simulación web (proyecto Next.js
local, núcleo de simulación TypeScript mínimo, conexión a PostgreSQL vía
Prisma, reloj continuo y un primer estado visible). No se ha iniciado y
requerirá su propio prompt de programación. «Defensa y vida propia» ya
existe completada técnicamente para el prototipo Godot en el PR #10, pero
no se retoma ni se porta automáticamente a la nueva línea de código.
