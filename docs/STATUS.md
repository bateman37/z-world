# Estado del proyecto

Este documento es breve y se actualiza en cada entrega que cambie el estado
real del proyecto. No sustituye a las fuentes canónicas: para reglas, consulta
[docs/INDEX.md](INDEX.md).

## Fase actual

`DESIGN-004` reinició la **línea técnica activa** de Z-World: de un
prototipo 3D en Godot a un laboratorio de simulación web centrado en
mecánicas (Node.js, TypeScript, Next.js, PostgreSQL; ver
[DEC-0008](decisions/DEC-0008_simulation-first-web-architecture.md)).
`WEB-001` es la **primera entrega ejecutable** de esa línea: existe una
aplicación Next.js real, con núcleo de simulación TypeScript, persistencia
PostgreSQL/Prisma real y un Web Worker que ejecuta la simulación, probada
en navegador (Chromium) contra un servidor de producción real. Ver
[DEC-0014](decisions/DEC-0014_web-runtime-foundation-and-initial-simulation-contracts.md)
y la sección «Última entrega de código (línea activa)» más abajo. La hoja
de ruta activa de implementación es
[RDM-003](roadmap/RDM-003_simulation-first-playable-roadmap.md). `WEB-002`
extiende esa fundación con trabajos/necesidades y el generador semántico
del pueblo (incrementos 4+5), ejecutado por subhitos verificables. S1
(esqueleto de `SimulationStateV2` y migración V1→V2,
[DEC-0015](decisions/DEC-0015_simulation-state-v2-skeleton-and-v1-migration.md))
S2 (generador semántico determinista del pueblo,
[DEC-0016](decisions/DEC-0016_semantic-village-generator.md)) y S3
(runtime jugable V2, navegación y descubrimiento progresivo,
[DEC-0017](decisions/DEC-0017_v2-playable-runtime-navigation-and-discovery.md))
están completados técnicamente; quedan S4 a S11 sin fecha.

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

`DESIGN-008` — **catálogo implementable y mundo local moldeable** (22 de
septiembre de 2026). Entrega **exclusivamente documental**: no se ha
implementado código, no se ha inicializado la aplicación web, y no se ha
tocado `src/`, `scenes/`, `tests/` ni `project.godot`. No existe todavía
mapa, lugares, objetos, agricultura, accesos, transporte, construcción ni
inventario reales en la nueva línea web. Aprueba el primer catálogo
implementable del mundo local y cierra el marco funcional de un entorno
moldeable:

- **Ocho perfiles iniciales aprobados**: casa familiar mediana (`RES-10`),
  cabaña (`RES-17`), supermercado pequeño (`COM-02`), taller mecánico
  (`TAL-01`), fuente local de agua (`ENV-01`), campo o parcela abierta
  (`ENV-02`), zona de bosque o matorral (`ENV-03`) y tramo de carretera o
  camino (`ENV-04`). [CAT-004](catalogs/CAT-004_initial-semantic-place-slice.md)
  pasa de `draft` a `approved` por decisión expresa de Dennis, nunca
  `implemented`.
- **Cuatro programas iniciales de edificio**, con estancias obligatorias
  y opcionales, límite de una planta activa y sin editor arquitectónico
  (ver [CAT-002](catalogs/CAT-002_rooms-modules-and-building-systems.md)).
- **Entorno mutable de primera clase**: modelo de nodo, línea, área y
  estructura, capas semánticas de terreno, libertad de transformación con
  causalidad (no «parcelas autorizadas»), barrera lineal entre anclajes,
  red de perímetro derivada de cierres físicos reales, y carretera
  transformable (despejar frente a retirar su función viaria) (ver
  [WLD-010](20-world/WLD-010_mutable-terrain-and-spatial-construction.md)).
- **Aberturas, cierres y conectividad**: abertura, cierre instalado y
  modificación/obstrucción como conceptos separados; colocación
  procedural coherente de accesos; tapiado con consecuencias reales;
  ventanas y brechas como accesos potenciales; compatibilidad de accesos
  con carga y transporte (ver
  [WLD-011](20-world/WLD-011_openings-access-and-connectivity.md)).
- **Agricultura básica sin estaciones**: cadena de estados causal desde
  terreno no preparado hasta cosechado, rendimiento causal y producción
  localizada, primera ruta renovable de alimento sin resolver la primera
  noche (ver [SET-011](40-settlement/SET-011_initial-agriculture-loop.md)).
- **Objetos y materiales iniciales**: catorce familias de comportamiento,
  cuatro objetos demostradores profundos (armario, frigorífico, bomba de
  agua, carretilla/carro), subconjunto inicial de materiales, y fin del
  recurso mágico «materiales de reparación» como pila universal (ver
  [CAT-005](catalogs/CAT-005_initial-object-resource-and-transport-slice.md)).
- **Transporte local por porte manual**: cinco métodos activos (a pulso,
  recipiente/equipamiento personal, porte coordinado, carretilla, carro),
  modelo de carga por peso/bulto/etiquetas, fases logísticas, puntos de
  transferencia y selector `Auto`/método; vehículos y animales quedan
  como horizonte documentado, no activo (ver
  [SET-010](40-settlement/SET-010_local-hauling-and-transport.md)).
- **Decisión y trazabilidad**: decisión transversal
  ([DEC-0013](decisions/DEC-0013_implementable-catalog-and-mutable-world.md),
  `approved`) y trazabilidad completa de las veinticuatro decisiones
  `P01`–`P24`
  ([DISC-0007](discovery/DISC-0007_implementable-catalog-and-mutable-world-traceability.md),
  `draft`).
- **Ampliación conceptual de `ARC-005`**: nuevas entidades candidatas
  (`TerrainArea`, `LinearFeature`, `NaturalOrTechnicalNode`, `Anchor`,
  `Opening`, `InstalledClosure`, `Obstruction`, `CultivationPlot`,
  `TransportMeans`, `LoadBundle`, `TransferPoint`,
  `PersistentTerrainChange`), sin fijar tablas ni clases finales.
- **Estados documentales**: `CAT-005`, `WLD-010`, `WLD-011`, `SET-010`,
  `SET-011` y `DEC-0013` nacen `approved`. `DISC-0007` nace `draft`.
  `SET-008` y `SET-009` permanecen `draft` en su horizonte máximo
  todavía abierto, con el recorte aprobado enlazado desde `CAT-005`.
  `RDM-003` permanece `approved` y no ejecutado, con su incremento 5
  precisado sin crear un incremento nuevo. `RDM-001` permanece
  `deprecated`. **Ningún documento pasa a `implemented`.**

## Entrega documental previa

`DESIGN-007` — **primer escenario real, cohorte protagonista y pueblo de
llegada** (22 de septiembre de 2026). Entrega **exclusivamente
documental**: no se ha implementado código, no se ha inicializado la
aplicación web, y no se ha tocado `src/`, `scenes/`, `tests/` ni
`project.godot`. Convierte el escenario inicial de referencia en un
escenario real, concreto y reproducible:

- **Momento exacto de llegada**: Día 1, 17:30, aproximadamente seis
  semanas tras el colapso general, primera mitad de abril, cuatro días de
  marcha previa, banda meteorológica templada-fría de montaña sin
  fenómenos letales.
- **Cohorte protagonista procedural**: seis adultos sin elenco fijo, con
  distribución mínima obligatoria de calibre oculto `5/4+/4+/3+/3+/3+`
  específica de este escenario (nunca visible al jugador, sin
  bonificador directo ni protección narrativa), cobertura funcional
  colectiva mínima y una red de relaciones conectada con al menos un
  acontecimiento compartido durante la huida.
- **Refugio por estancias**: el refugio provisional garantizado (100–250
  m del punto de llegada) y cualquier otro edificio del escenario se
  generan siempre como composición de estancias, accesos, instalaciones y
  sistemas mediante el modelo ya aprobado de `WLD-005`/`CAT-002`, nunca
  como excepción hecha a mano; se formaliza la diferencia entre refugio
  provisional y asentamiento elegido en `SET-001`.
- **Presupuesto del mapa**: huella aproximada `3×3 km`, `55–85`
  construcciones, red viaria, dos rutas de agua garantizadas, cobertura
  de terreno y `12–18` puntos de interés, de los que solo `3–6` se
  conocen al llegar.
- **Amenaza inicial contenida**: `12–30` zombis, sin horda inicial ni
  respawn de lo limpiado, aplicando sin ampliar el zombi estándar de
  `THR-001`.
- **Pertenencias y carencias**: presupuesto garantizado de agua, comida,
  encendido, luz, primeros auxilios y un arma cuerpo a cuerpo o
  improvisada por protagonista, junto a carencias obligatorias (agua
  sostenible, camas, almacén, electricidad, defensas).
- **Validación de semillas**: nueve garantías internas que toda semilla
  válida debe cumplir antes de empezar, sin informar al jugador de dónde
  está la solución.
- **Comunidades inciertas**: ninguna comunidad local obligatoria, señales
  humanas siempre presentes pero ambiguas, y entre cero y dos comunidades
  regionales posibles, sin abrir el mapa regional.

Documentos nuevos:
[SCN-002](scenarios/SCN-002_initial-survivor-cohort.md) y
[SCN-003](scenarios/SCN-003_first-day-starting-state.md) (`approved`,
cohorte protagonista y estado de llegada/primera noche);
[WLD-009](20-world/WLD-009_initial-mountain-village-profile.md)
(`approved`, presupuesto numérico del mapa local inicial);
[DEC-0012](decisions/DEC-0012_first-arrival-scenario-contract.md)
(`approved`, contrato transversal del escenario) y
[DISC-0006](discovery/DISC-0006_first-arrival-scenario-traceability.md)
(`draft`, trazabilidad completa del encargo).

Documentos modificados:
[SCN-001](scenarios/SCN-001_mountain-village-arrival.md) (permanece
`approved`, pasa a ser punto de entrada y síntesis, retira sus preguntas
abiertas ya cerradas);
[CHR-007](30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md)
(permanece `draft`, añade únicamente la distribución mínima de calibre
de la cohorte protagonista como regla de escenario, sin cerrar la
distribución global de calibre ni los campos de potencial);
[SET-001](40-settlement/SET-001_settlement-growth.md) (permanece
`approved`, añade la diferencia formal entre refugio provisional y
asentamiento elegido);
[THR-001](60-threats/THR-001_zombie-threat-model.md) y
[CAT-004](catalogs/CAT-004_initial-semantic-place-slice.md) (permanecen
`approved`/`draft` respectivamente, solo enlaces y aclaraciones de
alcance);
[RDM-003](roadmap/RDM-003_simulation-first-playable-roadmap.md)
(permanece `approved`, solo enlaces informativos, sin ampliar sus
incrementos).

**Contradicciones corregidas.** `SCN-001` dejaba abiertas la estación, la
cohorte, el edificio inicial, las dimensiones del mapa, la amenaza y la
disponibilidad de recursos; ahora remite a `SCN-002`, `SCN-003` y
`WLD-009`, que las cierran. `CAT-004` sigue `draft`: el presupuesto de
`55–85` construcciones de `WLD-009` no lo aprueba como alcance de
implementación.

**Estados.** `SCN-002`, `SCN-003`, `WLD-009` y `DEC-0012` nacen
`approved`. `DISC-0006` nace `draft`. `SCN-001` permanece `approved`.
`CHR-007` permanece `draft` por las razones ya registradas en
`DESIGN-006` más la nueva regla de escenario. `CAT-004` permanece
`draft`. **Ningún documento pasa a `implemented`.** No se ha implementado
generación, personajes, mapa, inventario, zombis ni escenario web; la
nueva línea Node.js/TypeScript sigue sin inicializar.

Ver la trazabilidad completa en
[DISC-0006](discovery/DISC-0006_first-arrival-scenario-traceability.md).

## Entrega documental anterior

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

## Entrega documental precedente

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

## Entrega documental previa a `DESIGN-005`

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

## Entrega documental previa a `DESIGN-004`

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

## Última entrega de código (línea activa Node.js/TypeScript)

`WEB-002` (subhito S3) — runtime jugable V2, navegación y descubrimiento
progresivo (23 de septiembre de 2026): tercer subhito de `WEB-002`, sobre
el generador semántico aceptado en S2 (ver
[DEC-0017](decisions/DEC-0017_v2-playable-runtime-navigation-and-discovery.md)).
**Completado técnicamente.** Elimina la fractura entre `/game/[id]` (Worker
real, pero sobre `SimulationStateV1`/fixture) y `/village/[id]` (visor de
solo lectura de `SimulationStateV2`): una partida generada por S2 se abre
ahora como una simulación V2 realmente activa.

- Protocolo Worker V2 versionado (`WORKER_PROTOCOL_VERSION_V2 = 2`,
  `packages/contracts/src/worker-protocol-v2.ts`), variante discriminada
  de la de V1, nunca confundible en silencio con ella;
  `WorkerSessionV2` (`packages/application/`) es una clase separada,
  estructuralmente análoga a `WorkerSession` de V1 sin modificarla.
- `location: EntityLocation` es la única autoridad de posición;
  `public.position` (heredado de V1) es una proyección derivada
  sincronizada en una sola frontera dentro de `advanceSimulationV2`;
  `MovementOrder` gana el campo aditivo opcional `locationCheckpoints`.
- Navegación híbrida: rejilla exterior de 600×600 celdas con cajas
  delimitadoras por entidad y A* con montículo binario
  (`navigation-v2.ts`, `pathfinding-v2.ts`), más un grafo de accesos por
  edificio (`room-graph.ts`) para interiores — sin rejilla de alta
  resolución sobre los ~9 km². Corrige un defecto real de S2 (el
  generador nunca rellenaba `Building.activeFloorId`, dejando cualquier
  edificio generado inaccesible sin este arreglo).
- Descubrimiento progresivo comunitario (`discovery.ts`): silueta,
  exterior reconocido, estructura de edificio, aberturas y estancias se
  descubren de forma causal por proximidad o presencia física real, nunca
  por la cámara ni de golpe; conocimiento monótono.
- Proyecciones V2 filtradas por descubrimiento
  (`build-projections-v2.ts`): un lugar solo observado (no aún
  "reconocido") aparece sin perfil; estancias/aberturas/edificios exigen
  su propio descubrimiento. Nunca se envía `SimulationStateV2` íntegro a
  React.
- `/village/[gameSaveId]` (`VillageScreen`) es ahora el laboratorio
  jugable real: reloj/pausa/velocidades, selección, movimiento con
  ratón, cancelación, niebla, entrada/salida de edificios, registro
  operacional — reutilizando sin cambios `TopBar`/`PersonList`/
  `PersonSheetPanel`/`OperationalLog` de WEB-001.
- Dos defectos reales encontrados y corregidos por las propias pruebas
  E2E de este subhito: el límite de cuerpo de 1 MB de las Server Actions
  de Next.js rechazaba en silencio todo guardado V2 (snapshot ~1,2 MB;
  ahora 10 MB), y `WorkerSessionV2` podía disparar dos guardados
  solapados con la misma revisión esperada (ahora se coalescen).
- `validateSimulationStateV2Invariants` ampliado con seis comprobaciones
  nuevas (posición dentro de límites, coherencia posición/ubicación,
  coherencia de órdenes activas, aberturas exteriores con estancia real,
  descubrimientos válidos, forma de la niebla).
- 28 pruebas unitarias nuevas, 3 de integración PostgreSQL nuevas y 1 E2E
  nueva, sumadas a las 113 pruebas unitarias, 15 de integración y 3 E2E
  ya existentes (141 unitarias, 18 de integración y 4 E2E en total),
  todas en verde.

No implementa: fórmula común de resolución directa/D/B, acciones activas
de reconocer/observar/inspeccionar/registrar, trabajos/designaciones/
planificador, necesidades causales, objetos profundos/saqueo/transporte,
explotación de edificios, agricultura ni terreno mutable (deliberadamente
fuera de alcance de S3) — todo ello permanece en los subhitos S4 a S11,
sin fecha, según
[RDM-003](roadmap/RDM-003_simulation-first-playable-roadmap.md). Los
detalles técnicos completos están en
[DEC-0017](decisions/DEC-0017_v2-playable-runtime-navigation-and-discovery.md).

`WEB-002` (subhito S2) — generador semántico determinista del pueblo (23
de septiembre de 2026): segundo subhito de `WEB-002`, sobre el esqueleto
de `SimulationStateV2` aceptado en S1 (ver
[DEC-0016](decisions/DEC-0016_semantic-village-generator.md)).
**Completado técnicamente.**

- Sustituye el fixture de `WEB-001` como generador activo de partidas
  nuevas: `createInitialStateV2` (`packages/simulation-core/src/v2/`)
  produce directamente un `SimulationStateV2` válido (nunca un V1
  intermedio), determinista por semilla + `VILLAGE_GENERATOR_VERSION`
  (`web-002-semantic-v1`) + configuración.
- Generador separado en configuración, terreno/hidrología/vías,
  asentamiento, programa/contenido de edificios, lugares no edificados y
  garantías del escenario (`packages/simulation-core/src/v2/generator/`),
  con catálogo de perfiles/programas/presupuesto versionado en
  `packages/catalogs/src/place-profiles.ts`.
- Presupuesto obligatorio de §7.2 de `WEB-002` cumplido y verificado por
  recuento real (no solo por el objetivo interno): `55-85` construcciones,
  `28-42` viviendas, `10-18` anexos, `6-10` comercial/técnico, `3-7`
  colapsadas, red de vías e hidrología completas, cobertura de terreno
  orgánica calculada de forma cerrada.
- Los ocho perfiles de `CAT-004` existen como `Place` generados con
  contenido: los cuatro programas de edificio (§8.2) con estancias
  obligatorias, conectividad interior verificada, mobiliario/
  contenedores/objetos/recursos; `ENV-01`-`ENV-04` enlazados a su
  geometría real.
- Escenario inicial materializado: llegada Día 1 · 17:30, seis
  protagonistas ubicados en el punto de llegada, refugio provisional
  dentro de 100-250 m, medio de transporte, parcela de cultivo candidata,
  dos fuentes de agua, pertenencias reales como `WorldObject`.
- `validateSimulationStateV2Invariants` ampliado (integridad referencial
  de ubicaciones, jerarquía espacial, unicidad global de ID) y nueva
  `validateGeneratedVillage` (presupuesto, coherencia de edificios,
  conectividad); se ejecutan siempre antes de exponer una partida.
- Persistencia real (`createGameV2`/`loadGameV2`/`saveSnapshotV2`,
  `packages/persistence/src/repository.ts`): una partida V2 nueva
  conserva semilla/versión/resultado y la recarga recupera exactamente
  el mismo mundo (verificado con PostgreSQL real); la migración V1→V2 y
  los snapshots de S1 quedan intactos.
- Integración mínima con la app: `createGameV2Action` desde la pantalla
  de inicio (botón «Generar pueblo (WEB-002 S2)») y un visor de solo
  lectura en `/village/[gameSaveId]` (`VillageScreen`/
  `VillageMapCanvas`) que consume el `SimulationStateV2` real.
- 44 pruebas unitarias nuevas, 5 de integración PostgreSQL nuevas y 1 E2E
  nueva, sumadas a las 69 pruebas unitarias, 15 de integración y 2 E2E ya
  existentes, todas en verde.

No implementa: motor de resolución directa/D/B, trabajos/designaciones/
planificador, necesidades causales evolutivas, transporte operativo,
explotación progresiva de edificios, desmontaje, ciclo agrícola jugable,
ni amenazas/autonomía/narrativa (deliberadamente fuera de alcance de S2)
— todo ello permanece en los subhitos S3 a S11, sin fecha, según
[RDM-003](roadmap/RDM-003_simulation-first-playable-roadmap.md). Los
detalles de interpretación del presupuesto y las extensiones aditivas al
esqueleto de contratos de S1 están documentados en
[DEC-0016](decisions/DEC-0016_semantic-village-generator.md).

`WEB-002` (subhito S1) — esqueleto de `SimulationStateV2` y migración
V1→V2 (23 de septiembre de 2026): primer subhito de `WEB-002`
(incrementos 4+5 de `RDM-003`), ejecutado por instrucción expresa de
Dennis de dividir la especificación maestra en subhitos verificables en
vez de implementarla de una sola vez (ver
[DEC-0015](decisions/DEC-0015_simulation-state-v2-skeleton-and-v1-migration.md)).
**Completado técnicamente.**

- Forma completa de `SimulationStateV2` en `packages/contracts`
  (`location-v2.ts`, `spatial-entities-v2.ts`, `objects-v2.ts`,
  `agriculture-v2.ts`, `place-history-v2.ts`, `work-v2.ts`,
  `needs-v2.ts`, `state-v2.ts`), validada con Zod: todas las entidades
  nuevas de §6.3 de `WEB-002` existen como tipos reales, aunque la
  mayoría de sus colecciones nacen vacías hasta que los subhitos que las
  pueblan (S2 en adelante) se completen.
- Migración determinista V1→V2 (`migrateV1ToV2`,
  `packages/simulation-core/src/v2/migrate-v1-to-v2.ts`): traducción
  estructural del fixture y la cohorte existentes, nunca invocación del
  generador semántico real; toda aproximación queda registrada de forma
  explícita en `migration.degradations`.
- Validador de invariantes relacionales
  (`validateSimulationStateV2Invariants`,
  `packages/simulation-core/src/v2/invariants.ts`) adicional a Zod:
  cantidades no negativas, ausencia de contención circular/orfandad entre
  contenedores, exclusividad de reserva y referencias de reserva a
  trabajos reales.
- Persistencia no destructiva (`saveMigratedV2Snapshot`,
  `packages/persistence/src/repository.ts`): el snapshot V2 migrado se
  guarda como fila adicional, transaccional e idempotente, sin tocar el
  snapshot V1 vigente ni la revisión de la partida. Ningún flujo de la
  aplicación web la invoca todavía de forma automática.
- 18 pruebas unitarias nuevas (migración e invariantes) y 3 pruebas de
  integración PostgreSQL nuevas (no destrucción, idempotencia, rollback),
  sumadas a las 45 pruebas Vitest y 2 E2E de `WEB-001`, todas en verde.

No implementa: generador semántico del pueblo, edificios/estancias
reales, motor de resolución directa/D/B, trabajos/designaciones/
planificador, necesidades causales, objetos/recursos/transporte reales,
explotación de edificios, terreno mutable ni agricultura — todo ello
permanece en los subhitos S2 a S11, sin fecha, según
[RDM-003](roadmap/RDM-003_simulation-first-playable-roadmap.md).

`WEB-001` — fundación web, cohorte protagonista y mapa local operativo (22
de septiembre de 2026): primera entrega ejecutable de la línea activa,
agrupando deliberadamente base técnica, runtime/reloj/persistencia real,
cohorte procedural y mapa local Canvas 2D en una sola entrega coherente
(ver
[DEC-0014](decisions/DEC-0014_web-runtime-foundation-and-initial-simulation-contracts.md)).
**Completada técnicamente y probada en navegador real**; pendiente de
aceptación manual por Dennis (ver «Aceptación manual pendiente»).

- Monorepo `npm workspaces` con cinco capas (`packages/contracts`,
  `packages/catalogs`, `packages/simulation-core`, `packages/persistence`,
  `packages/application`) y `apps/web` (Next.js/React/Canvas).
- Núcleo TypeScript puro: PRNG `mulberry32` determinista con streams por
  dominio, reloj continuo (Día 1 · 17:30, pausa/×1/×2/×4/×10, un día =
  20 min reales a ×1), generación determinista de seis protagonistas
  (calibre oculto 5/4+/4+/3+/3+/3+, cobertura colectiva estructural, red
  de relaciones de `SCN-002`), fixture procedural determinista del sector
  de llegada, rejilla de navegación con A* determinista y niebla de tres
  estados.
- Persistencia PostgreSQL/Prisma real desde el primer arranque:
  `GameSave`/`SimulationSnapshot`/`DomainEventRecord`, creación atómica de
  partida, revisión optimista (rechazo explícito de revisión obsoleta,
  sin fusión silenciosa), carga con validación de esquema (error
  explícito ante snapshot corrupto/incompatible, nunca regeneración por
  semilla).
- Web Worker real como runtime activo: posee el estado autoritativo,
  aplica comandos mediante el núcleo puro, emite proyecciones sin datos
  ocultos (nunca calibre ni potencial numérico real) y pide a la
  orquestación que persista sin importar Prisma.
- Next.js: inicio con crear/continuar partida, pantalla de juego con
  reloj, seis fichas de protagonista completas (características,
  habilidades, frase cualitativa de potencial, prioridades editables,
  biografía, relaciones, pertenencias), Canvas con cámara (pan/zoom
  centrado en cursor, HiDPI), niebla, movimiento directo con «Moverse
  aquí», registro operacional y estados de guardado visibles
  (guardado/pendiente/guardando/error/conflicto de revisión).
- 45 pruebas unitarias/integración (vitest, las de integración contra
  PostgreSQL real) y 2 pruebas E2E (Playwright, Chromium real, servidor de
  producción real) en verde. Detalle completo en «Validaciones de
  `WEB-001`» más abajo.

No implementa: el primer bucle causal completo (explorar → descubrir →
trabajar → recoger → transportar → cubrir una necesidad), designaciones de
trabajo, necesidades que decaigan, sistema general de objetos, transporte
de cargas, generación semántica completa, interiores/edificios editables,
agricultura, amenazas, autonomía, aprendizaje ni narrativa dinámica; todo
ello permanece fuera de alcance y sin fecha, según
[RDM-003](roadmap/RDM-003_simulation-first-playable-roadmap.md).

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

### Línea activa (laboratorio de simulación, inicializada desde `WEB-001`)

Node.js LTS (probado en Node 22), TypeScript estricto, Next.js 14 (App
Router) + React 18, núcleo de simulación TypeScript puro, PostgreSQL desde
el inicio con Prisma 5 aislado detrás de la persistencia, Zod para
contratos de frontera, Vitest para pruebas unitarias/integración y
Playwright para el recorrido E2E (ver
[DEC-0008](decisions/DEC-0008_simulation-first-web-architecture.md) y
[DEC-0014](decisions/DEC-0014_web-runtime-foundation-and-initial-simulation-contracts.md)).
Versiones exactas fijadas en `package-lock.json`.

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

Desde `WEB-001`:

- Monorepo `npm workspaces` (`apps/web`, `packages/contracts`,
  `packages/catalogs`, `packages/simulation-core`, `packages/persistence`,
  `packages/application`), con importaciones prohibidas hacia el núcleo
  verificadas por la propia estructura de dependencias del build.
- Aplicación Next.js (App Router) real: `npm run dev` la arranca; `npm run
  build` compila y tipa las cinco capas.
- Núcleo de simulación TypeScript puro con PRNG determinista, reloj
  continuo, generación de cohorte, reductor de comandos, avance de
  movimiento, fixture espacial, navegación A* y niebla.
- Esquema PostgreSQL/Prisma real, con una migración inicial versionada y
  repositorio con revisión optimista.
- Web Worker real (`apps/web/workers/simulation.worker.ts`) ejecutando el
  protocolo de `packages/application`.
- Mapa Canvas 2D con cámara, niebla y movimiento directo; ficha de persona
  completa; registro operacional; estados de guardado visibles.
- 45 pruebas Vitest (unitarias e integración real contra PostgreSQL) y 2
  pruebas Playwright E2E, todas en verde en la última ejecución registrada
  (ver «Validaciones de `WEB-001`»).

No implementa todavía: generador semántico completo (sigue usando el
fixture determinista del sector de llegada), selector de equipo/trabajo
contextual de `UI-006`, sistema de objetos, trabajos designables ni
ninguna de las capacidades listadas como fuera de alcance en
[RDM-003](roadmap/RDM-003_simulation-first-playable-roadmap.md).

Desde `WEB-002` S1, además: forma completa (tipos y esquemas Zod) de
`SimulationStateV2`, migración determinista V1→V2 por traducción
estructural, validador de invariantes relacionales y persistencia no
destructiva del snapshot migrado — ver «Última entrega de código» más
arriba.

Desde `WEB-002` S2, además: generador semántico determinista del pueblo
que produce directamente un `SimulationStateV2` jugable (terreno, vías,
hidrología, ocho perfiles de lugar con contenido, escenario inicial
completo); persistencia real de partidas V2
(`createGameV2`/`loadGameV2`/`saveSnapshotV2`); botón «Generar pueblo
(WEB-002 S2)» en la pantalla de inicio.

Desde `WEB-002` S3, además: `/village/[gameSaveId]` dejó de ser un visor
de solo lectura — un Web Worker real (`WorkerSessionV2`) posee el estado
`SimulationStateV2` autoritativo de la sesión, igual que V1 posee el
suyo en `/game/[gameSaveId]`. Reloj/pausa/velocidades, selección,
movimiento directo con ruta real (navegación híbrida exterior/interior),
cancelación, niebla causada por la posición real, descubrimiento
progresivo comunitario, entrada/salida de estancias y guardado real
funcionan sobre el pueblo generado — ver «Cómo jugar el runtime V2
manualmente» más abajo. El motor común de resolución directa/D/B, los
trabajos y las necesidades causales siguen sin implementarse sobre
`SimulationStateV2`: eso es responsabilidad de S4 en adelante, no de S3.

## Cómo jugar el runtime V2 manualmente (`WEB-002` S3)

Guion exacto para que Dennis compruebe en navegador el runtime jugable
real sobre el pueblo generado (sustituye y amplía la comprobación de
solo generación de S2; esa comprobación sigue siendo válida como pasos
1-2 de esta misma lista).

1. **Actualizar, instalar y arrancar**: `git pull`, `npm install` desde
   la raíz del repositorio, y con PostgreSQL accesible según
   `DATABASE_URL` (ver `.env.example`), `npm run dev` (o `npm run build
   && npm start --workspace apps/web`).
2. **Base de datos**: si ya existe una instancia de PostgreSQL con la
   base de datos creada, solo hace falta aplicar migraciones pendientes
   (`npx prisma migrate deploy` dentro de `packages/persistence`, o `npm
   run db:migrate --workspace packages/persistence`); si no existe la
   base de datos todavía, créala primero (`createdb zworld` o
   equivalente) y luego aplica las migraciones. El esquema de tablas no
   cambió en S3 (mismo `GameSave`/`SimulationSnapshot`/`DomainEventRecord`
   genéricos en JSON que S1/S2).
3. **Generar una partida V2**: en la pantalla de inicio
   (`http://localhost:3000`), escribe una semilla (o déjala vacía) y
   pulsa «Generar pueblo (WEB-002 S2)». Navega automáticamente a
   `/village/[gameSaveId]`.
4. **URL que debe abrirse**: `/village/[gameSaveId]` — ya no es un
   visor de solo lectura: es el mismo tipo de pantalla jugable que
   `/game/[gameSaveId]` (reloj, lista de protagonistas, mapa Canvas,
   ficha de persona, registro operacional), pero sobre el pueblo
   semántico completo.
5. **Controles de cámara**: rueda del ratón para zoom (centrado en el
   cursor), arrastrar con el botón central para desplazar la vista. La
   cámara nunca revela nada por sí sola: lo que se ve oscurecido sigue
   oculto aunque la cámara pase por encima.
6. **Selección y movimiento**: clic izquierdo sobre una persona (en el
   panel lateral o en el mapa) para seleccionarla; clic derecho sobre un
   punto del mapa abre «Moverse aquí». Si el punto es válido y conocido,
   la persona calcula una ruta real y empieza a desplazarse (visible como
   una línea discontinua y el estado «Desplazándose» en su tarjeta).
   Mientras se desplaza, aparece un botón «Cancelar orden de movimiento»
   junto a su ficha.
7. **Pausa y velocidades**: los botones «Pausa», «×1», «×2», «×4» y
   «×10» de la barra superior cambian la velocidad del reloj en
   cualquier momento; en pausa, las órdenes se aceptan pero no avanzan
   hasta reanudar.
8. **Comportamiento de la niebla**: solo se revela alrededor de la
   posición real de los protagonistas (radio ~25 m), nunca por mover la
   cámara. Intentar mover a alguien hacia un punto todavía oculto se
   rechaza con «Orden de movimiento rechazada» en el registro
   operacional, sin revelar qué hay allí.
9. **Entrada a edificio**: al ordenar movimiento hacia el interior de un
   edificio cuyo acceso ya se conoce (una vez la niebla ha revelado su
   entorno), la persona atraviesa la puerta y aparece «Entró en una
   estancia» en el registro operacional; su marcador en el mapa cambia
   de color. No todos los edificios están igual de cerca del punto de
   llegada en toda semilla: si el primero que se prueba está lejos,
   aproxima primero a la persona caminando y vuelve a intentarlo una vez
   el edificio se haya revelado.
10. **Guardado y recarga**: cualquier orden aceptada, cancelación,
    cambio de prioridad, entrada/salida de estancia o cambio de
    velocidad dispara un guardado automático (insignia «Guardando…» →
    «Guardado» en la esquina superior derecha); también existe un botón
    «Guardar» manual. Recargar la página (`F5`) recupera exactamente la
    misma partida desde PostgreSQL: reloj, posiciones, niebla,
    descubrimientos y órdenes activas se conservan tal cual, sin
    regenerar el pueblo.
11. **Resultado esperado en cada paso**: seis protagonistas visibles
    desde el arranque; reloj en Día 1 · 17:30 al crear la partida; el
    reloj avanza solo con velocidad > 0; una orden válida siempre
    produce una ruta visible y progreso real; un destino oculto se
    rechaza sin revelarlo; la niebla y los descubrimientos solo crecen
    con el movimiento real, nunca con la cámara; tras recargar, nada de
    lo anterior se pierde ni se repite ni se regenera.

Para verificar por código en vez de a ojo: `packages/simulation-core/
src/v2/{navigation-v2,pathfinding-v2,apply-command-v2,
advance-simulation-v2,discovery}.test.ts` cubren navegación/movimiento/
descubrimiento; `packages/application/src/{worker-session-v2,
build-projections-v2}.test.ts` cubren el protocolo y el filtrado de
proyecciones; `packages/persistence/src/worker-runtime-v2.integration.test.ts`
cubre la persistencia real del runtime; `e2e/village-runtime.spec.ts`
cubre el recorrido jugable completo en navegador (Chromium real).

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
  eventos (`ARC-001` a `ARC-008`), escenario inicial y primer escenario
  real de llegada
  (`SCN-001`, `SCN-002`, `SCN-003`), perfil numérico inicial del pueblo de
  montaña (`WLD-009`), hoja de ruta activa (`RDM-003`), catálogo máximo de
  lugares, estancias/instalaciones y ocupantes/profesiones/aficiones/rasgos
  como horizonte de referencia (`CAT-001` a `CAT-003`), primer catálogo
  implementable de lugares y de objetos/recursos/transporte (`CAT-004`,
  `CAT-005`), entorno mutable, aberturas/conectividad, transporte local y
  ciclo agrícola inicial (`WLD-010`, `WLD-011`, `SET-010`, `SET-011`),
  decisiones `DEC-0002` a `DEC-0014` (`DEC-0001` es `deprecated`), sistema
  documental (`DOC-001`).
- **Borrador (`draft`)**: síntesis de descubrimiento (`DISC-0001`,
  `DISC-0002`), trazabilidad del generador procedural de lugares
  (`DISC-0003`), trazabilidad de mapas local y regional e interacción
  contextual (`DISC-0004`), trazabilidad del cierre del motor de
  resolución y capacidades (`DISC-0005`), trazabilidad del primer
  escenario de llegada (`DISC-0006`), horizonte configurable de
  amenazas (`THR-002`), horizonte de capacidades a largo plazo
  (`RDM-002`),
  potencial oculto, calibre oculto y adaptación al apocalipsis (`CHR-007`,
  con el catálogo de frases de potencial, el nivel actual visible y la
  distribución mínima de calibre de la cohorte protagonista de `SCN-001`
  ya cerrados), y modelo de objeto, familias logísticas y desmontaje de
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
  `DESIGN-007` tampoco marca nada como `implemented`: la cohorte
  protagonista, el refugio provisional, el presupuesto del mapa, la
  amenaza inicial y las garantías de semilla de `SCN-002`, `SCN-003` y
  `WLD-009` son diseño documental, sin generador, personajes, mapa,
  inventario ni zombis reales en código. `WEB-001` es la primera entrega
  con código real de la línea activa, pero tampoco marca ningún documento
  de dominio como `implemented`: construye solo el subconjunto descrito en
  «Última entrega de código (línea activa)» de `CHR-006`, `UI-003`,
  `UI-005`, `ARC-004` y `SCN-001`/`SCN-002`/`SCN-003`, no su alcance
  íntegro (el generador semántico completo, el motor de resolución de
  `ARC-006`–`ARC-008`, el sistema de objetos y el primer bucle causal
  siguen sin implementar).

## Validaciones de `WEB-002` (subhito S3)

Validación completa desde el estado limpio del monorepo (23 de
septiembre de 2026), tras el runtime jugable V2, ejecutada realmente en
el entorno de implementación:

- `npm run typecheck` (las seis capas): sin errores.
- `npm run lint` (`lint:packages` + `lint --workspace apps/web`): sin
  advertencias ni errores.
- `npx vitest run` (raíz del monorepo): **141 pruebas unitarias en
  verde** — las 113 de S1/S2/`WEB-001` sin modificar más 28 nuevas:
  `navigation-v2.test.ts` (4: transitabilidad de terreno/edificios,
  bloqueo de agua y coste reducido de carretera, tamaño de rejilla
  acotado sobre ~9 km²), `pathfinding-v2.test.ts` (8: ruta directa
  exterior, destino no transitable, resolución de ancla exterior/
  interior, ruta híbrida exterior→estancia, estancia→estancia,
  estancia→exterior, determinismo), `apply-command-v2.test.ts` (9:
  aceptación/rechazo de movimiento exterior e interior, límites del
  mundo, niebla oculta, orden duplicada, ausencia de ruta, cancelación,
  pausa/velocidad, prioridad), `advance-simulation-v2.test.ts` (6:
  avance nulo en pausa, sincronía `location`/`position`, finalización de
  orden, entrada a estancia con `room_entered`, ausencia de niebla desde
  el interior, determinismo), `discovery.test.ts` (6: silueta/observado
  por distancia, acceso por proximidad, estancia por presencia física,
  monotonicidad), `invariants.test.ts` (7 nuevas: posición dentro de
  límites, coherencia posición/ubicación, coherencia de orden activa,
  abertura exterior sin estancia, descubrimiento duplicado/huérfano,
  forma de la niebla) y `worker-session-v2.test.ts`/
  `build-projections-v2.test.ts` en `packages/application` (protocolo
  V2, coalescencia de guardados, filtrado de proyecciones por
  descubrimiento, ausencia de `caliberTier`).
- `npm run test:integration` (PostgreSQL real, `zworld_test`): **18
  pruebas en verde** — las 15 de S1/S2/`WEB-001` sin modificar más 3
  nuevas (`worker-runtime-v2.integration.test.ts`): guardado/recarga
  exacta tras una orden de movimiento y avance real producidos por el
  reductor/avance puro (no un estado editado a mano), control optimista
  de revisión, y conservación de semilla/`generatorVersion` a través de
  varios guardados sucesivos.
- `npm run build`: compila y tipa correctamente.
- `npm run test:e2e` (Playwright, Chromium real, `next start` real,
  PostgreSQL real): **4 pruebas en verde** — las 3 ya existentes sin
  modificación funcional (`village-generation.spec.ts` se actualizó
  para reflejar que `/village/[id]` ya no es un visor de solo lectura,
  sin cambiar lo que verifica) más 1 nueva
  (`village-runtime.spec.ts`): reloj/pausa/velocidades, selección,
  movimiento válido con ruta real, cancelación, bloqueo por destino
  oculto, entrada a un edificio real (semilla `probe-seed-92`,
  verificada de antemano para tener un edificio navegable a ~16 m del
  punto de llegada — ver DEC-0017), guardado/recarga sin regenerar, y
  ausencia de texto de perfiles de lugar no descubiertos en la interfaz.
  Repetida tres veces seguidas sin fallos para descartar inestabilidad.
- Dos defectos reales de la propia entrega, encontrados por estas
  mismas pruebas E2E y corregidos antes de cerrar el subhito (detalle en
  DEC-0017): el límite de 1 MB de las Server Actions de Next.js
  bloqueaba en silencio todo guardado V2, y `WorkerSessionV2` podía
  disparar guardados solapados con revisión obsoleta.

No se ejecutó ninguna aceptación manual nueva por parte de Dennis para
S3 (ver «Aceptación manual pendiente» y el guion «Cómo jugar el runtime
V2 manualmente» más arriba, escrito para que la ejecute).

## Validaciones de `WEB-002` (subhito S2)

Validación completa desde el estado limpio del monorepo (23 de
septiembre de 2026), tras el generador semántico determinista del
pueblo, ejecutada realmente en el entorno de implementación:

- `npm run typecheck` (las seis capas): sin errores.
- `npm run lint` (`lint:packages` + `lint --workspace apps/web`): sin
  advertencias ni errores.
- `npx vitest run` (raíz del monorepo): **69 pruebas unitarias en
  verde** — las 25 de S1/`WEB-001` sin modificar (salvo una aserción de
  `migrate-v1-to-v2.test.ts` actualizada al nuevo stream `world` del
  PRNG, sin cambiar su intención) más 44 nuevas: 25 de
  `create-initial-state-v2.test.ts` (determinismo, variación por
  semilla, validez Zod, invariantes, IDs estables/únicos, ausencia de
  huérfanos, ubicación única, presencia y cantidades de los ocho
  perfiles, coherencia de edificios/estancias/aberturas, conectividad
  mínima, escenario inicial, garantías, sellado de versión, y una
  regresión de robustez sobre 12 semillas adicionales) y 5 de
  `generator/index.test.ts` (dependencia de configuración, aislamiento
  de versión, ausencia de dependencia del reloj del sistema, detección
  explícita de violaciones en `validateGeneratedVillage`). Verificado
  además, fuera de la suite permanente, con una tanda de 80 semillas
  adicionales sin ningún fallo.
- `npm run test:integration` (PostgreSQL real, `zworld_test`): **15
  pruebas en verde** — las 10 de S1/`WEB-001` sin modificar más 5 nuevas
  (`repository-v2.integration.test.ts`): creación atómica de partida V2,
  `generatorVersion` persistido en el registro de la partida, guardado
  con control optimista, rechazo explícito de revisión obsoleta, y
  recarga byte a byte idéntica al estado generado (esta prueba detectó
  en el propio desarrollo una pérdida de precisión de punto flotante en
  el redondeo JSONB de PostgreSQL, corregida y documentada en
  `DEC-0016`).
- `npm run build`: compila y tipa correctamente; genera la ruta nueva
  `/village/[gameSaveId]` además de las cuatro ya existentes.
- `npm run test:e2e` (Playwright, Chromium real, `next start` real,
  PostgreSQL real): **3 pruebas en verde** — las 2 de `WEB-001` sin
  modificación (confirmando ausencia de regresión) más 1 nueva
  (`village-generation.spec.ts`): crear un pueblo desde la pantalla de
  inicio, ver el mapa semántico con los ocho perfiles listados y
  recargar sin regenerar.

No se ejecutó ninguna aceptación manual nueva por parte de Dennis para
S2 (ver «Aceptación manual pendiente»).

## Validaciones de `WEB-002` (subhito S1)

Validación completa desde el estado limpio del monorepo (23 de
septiembre de 2026), tras el esqueleto de `SimulationStateV2` y la
migración V1→V2:

- `npm run typecheck` (las seis capas, incluidas `packages/contracts`,
  `packages/simulation-core` y `packages/persistence` con los nuevos
  módulos `v2/`): sin errores.
- `npm run lint:packages`: sin advertencias ni errores sobre los archivos
  nuevos o modificados.
- `npx vitest run` (raíz del monorepo): 56 pruebas unitarias en verde —
  las 38 de `WEB-001` sin modificar más 18 nuevas (11 de
  `migrate-v1-to-v2.test.ts`, 7 de `invariants.test.ts`).
- `npm run test:integration` (PostgreSQL real,
  `zworld_test`): 10 pruebas en verde — las 7 de `WEB-001` sin modificar
  más 3 nuevas (`migrate-v2.integration.test.ts`): persistencia del
  snapshot V2 migrado sin alterar el V1 vigente, idempotencia y rollback
  transaccional ante partida inexistente.
- `npm run build`: compila y tipa correctamente, sin cambios de
  comportamiento visibles en la aplicación (S1 no añade ninguna pantalla
  ni flujo nuevo; `SimulationStateV2` no tiene todavía ningún consumidor
  en `apps/web`).
- `npm run test:e2e` (Playwright, Chromium real, servidor Next.js real):
  las 2 pruebas de `WEB-001` (`first-arrival.spec.ts`,
  `multi-tab-conflict.spec.ts`) siguen en verde sin modificación, lo que
  confirma que S1 no introdujo ninguna regresión visible en el flujo
  jugable existente.

No se ejecutó ninguna aceptación manual nueva por parte de Dennis para
S1: no hay ninguna capacidad nueva visible en el navegador que aceptar
(ver «Aceptación manual pendiente»).

## Validaciones de `WEB-001`

Todas ejecutadas realmente en el entorno de implementación, no simuladas:

- `npm install` — resuelve el monorepo completo (`apps/web` + 5 paquetes).
- `npm run typecheck` — `tsc --noEmit` en las 6 partes del monorepo: **sin
  errores**.
- `npm run lint` — ESLint (paquetes) + `next lint` (apps/web): **sin
  avisos**.
- `npm test` (vitest, unidad) — **45 pruebas, 45 en verde**: PRNG/reloj,
  garantías de cohorte (calibre, cobertura, relaciones) en 50 semillas,
  movimiento/pathfinding/fog, protocolo de Worker.
- `npm run test:integration` (vitest contra PostgreSQL real, base
  `zworld_test`) — **7 pruebas, 7 en verde**: creación atómica, carga,
  revisión optimista, conflicto de revisión, movimiento persistido a
  mitad de ruta, snapshot corrupto/incompatible, rollback transaccional.
- `npx prisma migrate deploy` — aplica la migración inicial desde base
  vacía, tanto en `zworld` como en `zworld_test`.
- `npm run build` (`next build`) — compila y tipa `apps/web`: **éxito**,
  4 páginas generadas.
- `npx playwright test` (Chromium real, preinstalado en el entorno,
  contra `next start` real y PostgreSQL real) — **2 pruebas E2E, 2 en
  verde**: recorrido crítico completo (crear partida con semilla fija,
  seis tarjetas, reloj en Día 1 · 17:30, ficha sin calibre/potencial
  numérico visible, pausa/×2, movimiento directo con «Moverse aquí»,
  cambio de prioridad, guardado, recarga con continuidad exacta de
  cohorte y prioridad) y conflicto de revisión entre dos pestañas sobre
  la misma partida.
- `git diff --check` — sin errores de espacio en blanco.
- Búsqueda de `Math.random` en `packages/simulation-core` y
  `packages/catalogs`: sin resultados.
- Búsqueda de referencias a `src/`, `scenes/`, `project.godot` o
  extensiones `.gd`/`.tscn`/`.tres` en `apps/` y `packages/`: sin
  resultados (ninguna importación cruza hacia el prototipo Godot).

No se pudo ejecutar en este entorno: comprobación manual en un segundo
navegador/sistema operativo distinto del Chromium preinstalado (fuera del
alcance de esta entrega; el guion de aceptación manual completo queda
documentado en `prompts/WEB-001_web-foundation-cohort-local-map.md` §21
para que Dennis lo repita).

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

## Validaciones documentales de `DESIGN-008`

Entrega documental: no hay suite ejecutable aplicable y no se instalaron
herramientas. Se ejecutaron comprobaciones acotadas:

- confirmación de que `DESIGN-007` estaba fusionado en `main` antes de
  crear la rama, y de que `CAT-004` seguía `draft` y `RDM-003` seguía
  siendo la hoja de ruta activa;
- recuento y verificación de los ocho perfiles exactos de `CAT-004`, con
  solo cuatro programas de edificio;
- búsqueda de usos de «lugar» como sinónimo universal de edificio en los
  documentos nuevos y modificados;
- verificación de que terreno, carretera y bosque declaran acciones
  propias en `WLD-010` y no aparecen como fondo visual en ningún ejemplo;
- verificación de que la agricultura básica queda dentro del recorte y
  las estaciones fuera, y de que la cosecha permanece localizada hasta
  transportarse;
- verificación de que despejar una carretera y retirar su función viaria
  se documentan como acciones distintas;
- revisión de barrera, anclajes, perímetro y cruce de carretera, y de que
  «cerrado» nunca se presenta como sinónimo de «seguro»;
- verificación de que abertura, cierre y modificación son conceptos
  separados en todos los ejemplos de `WLD-011`, y de que retirar una
  puerta nunca elimina el hueco;
- verificación de que crear nuevos huecos queda como horizonte, no como
  herramienta CAD de esta entrega;
- comprobación de los cinco métodos activos de transporte y de que
  animales y vehículos permanecen en horizonte sin activarse;
- comprobación del modelo de carga por peso, bulto y etiquetas, y de que
  el selector de método nunca se confunde con prioridad, equipo, ritmo ni
  atención;
- verificación de que «materiales de reparación» deja de describirse como
  pila universal en `SET-003` y en `CAT-005`, y de que `SET-008`/`SET-009`
  conservan su horizonte `draft` sin perder contenido;
- verificación de que el mismo procedimiento de `ARC-006`–`ARC-008` queda
  enlazado, sin fórmulas redefinidas, desde `WLD-010`, `WLD-011`,
  `SET-010` y `SET-011`;
- comprobación de que `RDM-003` solo precisa su incremento 5 existente,
  sin incremento nuevo, fecha ni cambio de estado, y de que `RDM-001`
  sigue `deprecated` sin reactivarse;
- comprobación de que `CAT-004`, `CAT-005`, `WLD-010`, `WLD-011`,
  `SET-010`, `SET-011` y `DEC-0013` quedan `approved` y `DISC-0007`
  `draft`, y de que ningún documento pasa a `implemented`;
- revisión de enlaces y cabeceras `depends_on`/`related` de los
  documentos nuevos y modificados, incluida la convención de IDs `ENV-*`;
- comprobación de que los índices de `catalogs`, `20-world`,
  `40-settlement`, `decisions`, `discovery`, `90-architecture`,
  `80-interface` y `roadmap` incluyen los documentos nuevos con ID,
  estado y propósito correctos;
- comprobación de que `docs/OPEN-QUESTIONS.md` retira exactamente las
  preguntas cerradas por esta entrega y conserva explícitamente las de
  parametrización numérica y técnica;
- comprobación de que no se ha modificado código ni configuración
  ejecutable (`src/`, `scenes/`, `tests/`, `project.godot` intactos), ni
  añadido dependencias de Node.js/TypeScript/Next.js/Prisma/PostgreSQL;
- `git diff --check`, sin errores.

## Validaciones documentales de `DESIGN-007`

Entrega documental: no hay suite ejecutable aplicable y no se instalaron
herramientas. Se ejecutaron comprobaciones acotadas:

- confirmación de que `DESIGN-006` estaba fusionado en `main` antes de
  crear la rama;
- revisión de que ninguna cifra de este escenario contradice la escala
  `0–10`, la media humana `4` ni la presentación de potencial oculto ya
  cerradas por `DESIGN-006`;
- búsqueda de referencias activas a seis personajes fijos, estación
  abierta, refugio indefinido, dimensiones abiertas o amenaza inicial sin
  concretar en `SCN-001` y en `docs/OPEN-QUESTIONS.md`;
- verificación de que el calibre alto de la cohorte protagonista nunca se
  traduce en nivel actual, bonificación directa o protección narrativa;
- verificación de que las estrellas de calibre no aparecen en ningún
  ejemplo de interfaz o ficha;
- verificación de que todo edificio del escenario, incluido el refugio
  provisional, depende del modelo de estancias de `WLD-005`/`CAT-002`;
- verificación de que la huella `3×3 km` de `WLD-009` no se presenta como
  cuadrado visual obligatorio;
- verificación de que los zombis iniciales son finitos, sin respawn de lo
  limpiado, y que ningún caso los presenta reapareciendo;
- verificación de que cada uno de los seis protagonistas tiene un arma
  cuerpo a cuerpo o improvisada garantizada;
- comprobación de que `CAT-004` sigue `draft` y de que ningún documento
  nuevo lo aprueba como alcance de implementación;
- comprobación de que `RDM-003` no gana ningún incremento nuevo ni cambia
  de estado;
- comprobación de que no se ha modificado código ni configuración
  ejecutable (`src/`, `scenes/`, `tests/`, `project.godot` intactos);
- revisión de enlaces y cabeceras `depends_on`/`related` de los
  documentos nuevos y modificados;
- comprobación de que los índices de `scenarios`, `20-world`,
  `decisions` y `discovery` incluyen `SCN-002`, `SCN-003`, `WLD-009`,
  `DEC-0012` y `DISC-0006` con ID, estado y propósito correctos;
- comprobación de que `docs/OPEN-QUESTIONS.md` retira exactamente las
  preguntas cerradas por esta entrega y conserva las de otros sistemas;
- comprobación de que ningún documento pasa a `implemented`;
- `git diff --check`, sin errores.

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

`WEB-002` S1, S2 y S3 — completados técnicamente, sin lista de
aceptación manual formal propia todavía; ver «Cómo jugar el runtime V2
manualmente» más arriba para reproducir S3 (incluye reproducir la
generación de S2) a mano. No se declaran superados por el agente que
implementó la entrega.

`WEB-001` — completada técnicamente y probada en navegador (Chromium)
contra un servidor de producción real y PostgreSQL real, pero **la
aceptación manual de Dennis sigue pendiente**. El guion completo de
comprobación manual (instalación, semilla `web-001-acceptance`,
reproducibilidad, cohorte, reloj/persistencia, mapa/niebla, movimiento,
robustez ante fallo de guardado y multi-pestaña) está documentado en
`prompts/WEB-001_web-foundation-cohort-local-map.md` §21. No se declara
superada por el agente que implementó la entrega.

El resto de estas aceptaciones corresponden al prototipo histórico Godot,
ya no es la línea activa de código.

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

`WEB-001` completó los incrementos 1 a 3 de
[RDM-003](roadmap/RDM-003_simulation-first-playable-roadmap.md)
(fundación técnica, reloj/cohorte/estado operativo, y mapa/niebla/
movimiento). `WEB-002` agrupa los incrementos 4 y 5 (trabajos/
necesidades y generador semántico/explotación de lugares) en una única
especificación maestra, por instrucción expresa de Dennis, ejecutada por
subhitos en varias sesiones (ver
[DEC-0015](decisions/DEC-0015_simulation-state-v2-skeleton-and-v1-migration.md)).
S1 (esqueleto de `SimulationStateV2` y migración V1→V2), S2 (generador
semántico reproducible del pueblo) y S3 (runtime jugable V2, navegación
y descubrimiento progresivo) están completados técnicamente. El
siguiente candidato de implementación es S4 — motor común de resolución
directa/D/B—, que sigue sin iniciarse. Cada subhito requiere su propia
sesión y debe dejar el repositorio funcionando, probado y documentado
antes de continuar al siguiente, sin cambiar de stack,
rehacer los seis protagonistas, sustituir el reloj, romper guardados
existentes ni abandonar el modelo espacial ya construido en `WEB-001`.
«Defensa y vida propia» sigue completada técnicamente para el prototipo
Godot en su rama histórica, pero no se retoma ni se porta automáticamente
a la nueva línea de código.
