# Changelog

Registra entregas documentales y de diseño de Z-World. No atribuye código ni
funcionalidad implementada salvo que se indique explícitamente como
`implemented` en la documentación afectada.

## WEB-002 (subhito S10) — Entorno mutable y agricultura

En `feat/web-002-s10-agriculture-mutable-environment`, sin fusionar contra
`main`. Cerrado con limitaciones explícitas (detalle en `docs/STATUS.md`
§«S10 — entorno mutable y agricultura»), y se crea
[DEC-0020](docs/decisions/DEC-0020_mutable-environment-and-agriculture.md).
Resumen:

- Tres capas mutables sobre la geometría ya generada: cobertura de terreno
  (`none`/`vegetation`/`debris`), estado de vía
  (`transitable`/`obstructed`/`cleared`/`function_removed`) y barrera
  lineal entre anclajes, con perímetro **derivado** por unión-búsqueda
  (nunca un booleano guardado).
- Nueve métodos nuevos (`clear_vegetation`, `clear_debris`, `clear_road`,
  `remove_way_function`, `build_barrier`, `prepare_soil`, `sow`,
  `tend_crop`, `harvest`) en el mismo motor de trabajos/planificador/
  prioridades de S4–S9, sin ningún motor paralelo.
- Geometría de parcela libre: cualquier polígono dibujado por el jugador
  puede prepararse, con un veredicto de aptitud causal explícito
  (`evaluateCultivationSuitability`), no solo las parcelas de ejemplo del
  generador.
- Progreso parcial persistente de preparación de suelo/limpieza de
  cobertura a través de pausa/reanudación e interrupción por
  autoprotección.
- Vías tratadas con causalidad: obstruida sigue siendo transitable (más
  lenta, nunca bloqueada); despejar conserva la función viaria; retirar la
  función es irreversible en este alcance y exige confirmación informada.
- Ciclo agrícola completo y determinista (preparar → sembrar → crecer →
  cosechable → cosechar) sobre el reloj real, sin botón de "crecer ahora";
  sembrar deriva la superficie de la semilla realmente disponible, nunca
  exige la cantidad nominal del campo entero; daño por abandono derivado
  (nunca acumulado por tick) con pérdida real del cultivo si se abandona.
- Rendimiento causal explícitamente provisional (SET-011 §7 deja abierto
  el catálogo/fórmulas/tiempos); un solo cultivo real jugable
  (`garden_vegetables`) y un perfil de ciclo abreviado exclusivo de las
  pruebas (`test_fast_vegetables`).
- Interfaz: panel «Parcelas de cultivo» (estado/progreso/daño observables
  sin depender del lienzo), selector real de cultivo al sembrar,
  designación de entorno mutable/agricultura con geometría por
  coordenadas y modo de cruce con vía para barreras.
- Correcciones reales encontradas por las pruebas (detalle en DEC-0020
  §9): geometría de parcela nueva que copiaba el terreno de fondo entero
  en vez del polígono dibujado; marca de "escombros" del generador que
  etiquetaba por error el único terreno de fondo transitable del mapa
  entero; `locationWorldPoint` no resolvía el borde de un campo
  (`field_edge`), así que una cosecha real nunca podía elegirse como
  objetivo de traslado; un traslado interrumpido por autoprotección no se
  retoma solo, a diferencia de una orden directa.
- Pruebas: 305 unitarias (8 nuevas), 33 de integración PostgreSQL (3
  nuevas) y 14 E2E en Chromium real (2 nuevas) en verde sobre el árbol
  final de la rama, contra `next dev` y contra `next start` (producción);
  guion manual en `docs/STATUS.md` (aceptación manual pendiente).
- Límites conscientes explícitos: perímetro sin paredes de edificio como
  arista implícita; reconstrucción completa de navegación en vez de
  parcheo dirigido para cambios de terreno/vía/barrera; catálogo de
  cultivos mínimo; sin estaciones ni clima; E2E de barrera/perímetro
  (cruce con vía, cerrar/reabrir un lazo) cubierta por pruebas unitarias
  reales pero no por un recorrido en Chromium.

## WEB-002 (subhito S9, Puerta C) — Explotación progresiva de edificios y cierre de S7–S9

En `feat/web-002-s7-s9-objects-logistics-exploitation`, con una única PR
contra `main` que agrupa S7, S8 y S9. Los dieciséis puntos de S9 quedan
implementados y probados, con limitaciones explícitas (detalle en
`docs/STATUS.md` §«S9 — Puerta C»), y se crea
[DEC-0019](docs/decisions/DEC-0019_deep-objects-physical-logistics-and-building-exploitation.md).
Resumen:

- Cinco capas de edificio independientes (contenido suelto, mobiliario,
  instalaciones, acabados, estructura), cada una con estado físico y de
  conocimiento propios, y tres vidas persistentes (saqueo, desmontaje,
  desmantelamiento o demolición) en `BuildingFabric`.
- Catálogo `building-exploitation.ts` (`s9-v1`): 12 variantes de
  instalación, 20 de acabado, 8 perfiles estructurales y el tuning de
  accesos; 7 familias de recurso nuevas (tuberías, vidrio, cerámica,
  mampostería, tejas, acero estructural, escombros).
- Registro técnico de instalaciones (`d_then_b`), desconectar, desmontar y
  desinstalar instalaciones (la bomba ENV-01 se retira entera), retirar
  acabados, desmantelar por etapas y demoler con confirmación informada y
  el edificio vacío; la demolición destruye lo que queda, deja escombros
  transitables y es irreversible también tras recargar.
- Accesos mutables: abrir, cerrar, bloquear, desbloquear, forzar, despejar,
  atrancar, tapiar con madera concreta, reforzar, reparar, retirar
  conservando la puerta (el hueco sigue transitable), destruir e instalar;
  destinos de traslado «instalar en abertura» e «instalar en lugar».
- Invalidación dirigida de navegación (`navigationRevision` por edificio,
  `ensureNavigationCurrent`) y revalidación de movimientos en curso; los
  cambios de acceso alteran también la compatibilidad logística de S8.
- Habitabilidad por edificio integrada con el descanso de S6.
- Generador `web-002-semantic-v4` (tejido de edificio con stream PRNG
  derivado, sin alterar trazado ni IDs de v3).
- Interfaz: sección «Edificios conocidos» con capas, accesos,
  habitabilidad y previsualización irreversible; confirmación explícita de
  toda acción irreversible; el mapa marca edificios terminales y accesos
  no transitables.
- Correcciones: inspeccionar un edificio en pie ahora lleva a su estancia
  de entrada (la posición de su lugar cae dentro de la huella y no tenía
  ruta); y, defecto previo de S4–S6, una orden directa interrumpida por
  autoprotección ya no deja a su persona enganchada sin descansar y con toda
  orden posterior «propuesta» para siempre: la persona descansa y la retoma
  sola al recuperarse, conservando el trabajo hecho, sin remuestrear su
  episodio ni duplicar la orden; defecto previo de S6/S7, la autoprotección ya reconoce el agua y
  la comida que cada persona lleva en su mochila y no hace que todas se
  disputen el mismo lote; y el material para tapiar una puerta interior vale
  desde cualquiera de sus dos lados.
- Autoprotección (defectos previos de S6 destapados por los E2E largos):
  una persona con un trabajo bloqueado se desengancha para atender una
  necesidad crítica; agua y comida solo se eligen con ruta conocida; sin
  solución para la peor necesidad se atiende la siguiente y no se abandona
  el trabajo para quedar ociosa; un solo aviso «sin solución» por episodio
  (`NeedState.noSolutionReported`, aditivo); y un bloqueo por ruta ya no se
  reanuda y rebloquea en cada tick.
- Pruebas: 297 unitarias, 30 de integración PostgreSQL y 12 E2E en
  Chromium real en verde sobre el árbol final de la rama; guion manual de
  diecisiete puntos para Dennis en `docs/STATUS.md` (aceptación manual
  pendiente).

## WEB-002 (subhito S8, Puerta B) — Transporte y logística local

En `feat/web-002-s7-s9-objects-logistics-exploitation`, sin PR todavía
(S9 no ha empezado; `DEC-0019` se creará al completar S7+S8+S9). Los quince
puntos de cierre de S8 quedan implementados y probados, con limitaciones
explícitas (detalle en `docs/STATUS.md` §«S8 — Puerta B»). Resumen:

- Los cinco métodos activos de SET-010 §3.2 (a pulso, recipiente personal,
  porte coordinado, carretilla, carro de mano) en el catálogo versionado
  `transport-methods.ts` (`s8-v1`) y un único motor de transporte;
  carretilla y carro solo difieren en datos.
- Carga física real (peso con contenido, volumen, bulto, mínimo de personas
  y etiquetas de manipulación heredadas del contenido), medios localizados,
  selector `Auto`/método impuesto con motivo de inviabilidad y cooperación
  con topes 100/60/35/20 limitada por bulto y accesos.
- Nueve fases logísticas reales dentro de `advance-jobs.ts`, con reservas de
  carga, medio y porteadoras; rutas por anchura de accesos, superficie,
  niebla y zonas; puntos de transferencia con el caso obligatorio carro →
  acceso → porte manual → puerta estrecha → contenedor.
- Cancelar, interrumpir o bloquear deja carga y medio en su posición
  causal; fatiga del porte sobre las necesidades reales y ruido registrado
  por tramos de ruta; desgaste por uso del medio.
- Generador `web-002-semantic-v3` (carro ante el supermercado y carretilla
  junto al refugio, sin alterar el trazado).
- Interfaz: controles de traslado y ficha logística en el panel de trabajos;
  el objetivo elegido se recuerda por clave estable.
- Correcciones: llegada dentro de la estancia de destino cuando el
  checkpoint final quedaba por encima del total redondeado, y accesos
  cruzados conservados al replantear una ruta.
- Pruebas: 267 unitarias, 27 de integración PostgreSQL y 10 E2E en verde.

## WEB-002 (subhito S7, Puerta A) — Objetos profundos, inventarios y transformaciones

En `feat/web-002-s7-s9-objects-logistics-exploitation`, sin PR todavía
(S8 y S9 no han empezado). La lista de deuda auditada de la Puerta A queda
cerrada con pruebas en verde, con limitaciones explícitas (detalle en
`docs/STATUS.md` §«S7 — Puerta A»). Resumen:

- Catálogo completo de las catorce familias de CAT-005 §3.1 con sus
  variantes mínimas (`object-catalog.ts` `s7-v2`, `RESOURCE_CATALOG`) y
  validación de cifras, perfiles y conservación de masa.
- Los cuatro demostradores profundos de CAT-005 §3.2: armario/estantería
  y frigorífico (ya parciales) más bomba de agua manual (instalada sobre
  la fuente comunal, prueba/diagnóstico, avería por desgaste determinista,
  reparación con piezas concretas, extracción de agua en recipientes
  reales, desmontaje) y carretilla/carro como objeto completo (reparación
  y desmontaje con perfiles propios).
- `store`/`retrieve_from_storage` reales sobre contenedores con capacidad
  y compatibilidad; división y fusión de lotes; recoger lotes sueltos;
  vaciar antes de desmontar.
- Deterioro determinista del alimento fresco (función cerrada del tiempo
  simulado, sin doble contabilización); alimento echado a perder no
  consumible.
- Pertenencias iniciales de SCN-003 por persona, sin duplicar lo que v1
  dejaba en el refugio; generador `web-002-semantic-v2` con trazado
  espacial idéntico a v1.
- Reservas profundas exclusivas de objeto/mueble/contenedor/medio.
- Inventario localizado conocido en la interfaz y acciones de objetos en
  el panel de trabajos.
- Correcciones de determinismo tras recargar (IDs con contador global,
  orden de iteración, precisión de `jsonb`) y de otros defectos previos
  destapados por las nuevas pruebas.
- Pruebas: 237 unitarias, 23 de integración PostgreSQL y 6 E2E en verde.

## WEB-002 (subhitos S4-S6) — Motor de resolución, trabajos planificados y necesidades causales

Tres subhitos entregados juntos, por decisión expresa de Dennis, sobre el
runtime jugable aceptado en S3 (ver
[DEC-0018](docs/decisions/DEC-0018_resolution-engine-planned-work-and-causal-needs.md)).
Cierra el primer bucle causal completo de la entrega: explorar → crear un
trabajo → viajar → resolver por el motor común (directo/D/B) → consecuencia
persistente → necesidad cubierta.

- **Motor común de resolución** (`packages/simulation-core/src/v2/resolution/`):
  una sola tubería (`advance-jobs.ts`) para las siete acciones activas
  mínimas — reconocer, observar, inspeccionar, registrar, beber, comer,
  descansar —, capacidad efectiva exacta (medias de característica/
  habilidad, perfiles `70/30`/`50/50`/`30/70`, capacidad "universal" para
  métodos sin ninguna declarada), modelo D (`±8 %`, muestra única
  persistente) y modelo B (campana truncada determinista, bandas exactas
  `excepcional`/`favorable`/`incierto`/`deficiente recuperable`/`grave`).
  Catálogo activo versionado en `packages/catalogs/src/action-methods.ts`.
- **Trabajos, planificador y zonas** (`packages/simulation-core/src/v2/jobs/`):
  máquina de estados de `Job` con transiciones legales explícitas,
  planificador determinista (prioridad personal → urgencia → zona →
  distancia → antigüedad → ID estable, sin azar ni información oculta),
  reservas de lote de recurso, zonas `habitual`/`precaution`/`forbidden`,
  y designación por área ejecutable (`systematic_recon`, reconocimiento
  sistemático de lugares ya avistados dentro de un polígono).
- **Necesidades causales** (`packages/simulation-core/src/v2/needs/`,
  `packages/catalogs/src/needs-tuning.ts`): hidratación/nutrición/descanso
  evolucionan por tiempo, movimiento y trabajo activo (sin doble
  contabilización), se recuperan bebiendo/comiendo/descansando
  físicamente desde un recurso real y localizado, y una necesidad crítica
  interrumpe de forma segura un trabajo incompatible y genera una
  intención sistémica solo si existe una solución ya conocida y
  accesible — nunca materializa un recurso.
- **Proyecciones e interfaz**: `WorkerProjectionsV2` gana necesidades,
  trabajos, zonas, designaciones y acciones contextuales legítimamente
  disponibles (nunca un secreto no descubierto); `WorkPanel` en
  `/village/[gameSaveId]` permite ordenar una acción contextual, pausar/
  reanudar/cancelar un trabajo y crear/borrar zonas y designaciones.
- **Tres defectos reales corregidos**, encontrados por las propias
  pruebas de este subhito: beber/comer/descansar sufrían además el coste
  genérico de "trabajo activo" sobre sí mismos (doble contabilización);
  los valores de necesidad acumulaban ruido de coma flotante que rompía
  la igualdad exacta tras un guardado/recarga real en PostgreSQL; y la
  etiqueta de un blanco de reconocer/observar filtraba el perfil real de
  un lugar solo avistado, no observado (detectado por el E2E de S3 ya
  existente). Además, los catorce eventos causales nuevos no disparaban
  guardado automático hasta corregirlo explícitamente.
- 50 pruebas unitarias/integración nuevas del motor y 1 E2E nueva, todas
  en verde junto con las 141 pruebas unitarias, 18 de integración
  PostgreSQL real y 4 E2E ya existentes de S1-S3/`WEB-001` (total 191
  unitarias, 18 integración, 5 E2E).

## WEB-002 (subhito S3) — Runtime jugable V2, navegación y descubrimiento progresivo

Tercer subhito de `WEB-002`, sobre el generador semántico aceptado en S2
(ver [DEC-0017](docs/decisions/DEC-0017_v2-playable-runtime-navigation-and-discovery.md)).
Elimina la fractura entre `/game/[id]` (Worker real, pero sobre
`SimulationStateV1`) y `/village/[id]` (visor de solo lectura de
`SimulationStateV2`): una partida generada por S2 se abre ahora como una
simulación V2 realmente activa — reloj, movimiento, navegación, niebla y
descubrimiento reales, no una imagen estática del mundo.

- **Protocolo Worker V2 versionado**
  (`packages/contracts/src/worker-protocol-v2.ts`,
  `WORKER_PROTOCOL_VERSION_V2 = 2`): variante discriminada de la de V1,
  nunca una mutación; un mensaje de la versión equivocada se rechaza
  explícitamente. `WorkerSessionV2`
  (`packages/application/src/worker-session-v2.ts`) es una clase separada,
  estructuralmente análoga a `WorkerSession` de V1, sin modificarla.
- **`location: EntityLocation` como autoridad única de posición**:
  `public.position` (heredado de V1) pasa a ser una proyección derivada,
  sincronizada en una sola frontera dentro de `advanceSimulationV2`.
  `MovementOrder` gana el campo aditivo opcional `locationCheckpoints`.
- **Navegación híbrida exterior/interior**
  (`packages/simulation-core/src/v2/{navigation-v2,pathfinding-v2,room-graph}.ts`):
  rejilla exterior de 600×600 celdas con cajas delimitadoras por entidad
  y A* con montículo binario, más un grafo de accesos por edificio para
  interiores — sin rejilla de alta resolución sobre los ~9 km². Corrige
  un defecto real de S2: el generador nunca rellenaba
  `Building.activeFloorId`, dejando cualquier edificio generado
  inaccesible.
- **Descubrimiento progresivo comunitario**
  (`packages/simulation-core/src/v2/discovery.ts`): silueta, exterior
  reconocido, estructura de edificio, aberturas y estancias se descubren
  de forma causal por proximidad o presencia física real, nunca por la
  cámara ni de golpe; conocimiento monótono.
- **Proyecciones V2 filtradas por descubrimiento**
  (`packages/application/src/build-projections-v2.ts`): un lugar solo
  observado (no aún "reconocido") aparece sin perfil; estancias/
  aberturas/edificios exigen su propio descubrimiento. Nunca se envía
  `SimulationStateV2` íntegro a React.
- **`/village/[gameSaveId]` es ahora el laboratorio jugable real**
  (`VillageScreen`/`VillageMapCanvas`), reutilizando sin cambios
  `TopBar`/`PersonList`/`PersonSheetPanel`/`OperationalLog` de `WEB-001`.
- **Seis invariantes nuevas** en `validateSimulationStateV2Invariants`
  (posición dentro de límites, coherencia posición/ubicación, coherencia
  de órdenes activas, aberturas exteriores con estancia real,
  descubrimientos válidos, forma de la niebla).
- **Dos defectos reales corregidos**, encontrados por las propias
  pruebas E2E de este subhito: el límite de 1 MB de las Server Actions
  de Next.js rechazaba en silencio todo guardado V2 (snapshot ~1,2 MB;
  ahora 10 MB), y `WorkerSessionV2` podía disparar guardados solapados
  con la misma revisión esperada (ahora se coalescen).
- 28 pruebas unitarias nuevas, 3 de integración PostgreSQL nuevas y 1
  E2E nueva, todas en verde junto con las 113 pruebas unitarias, 15 de
  integración y 3 E2E ya existentes de S1/S2/`WEB-001`.

## WEB-002 (subhito S2) — Generador semántico determinista del pueblo

Segundo subhito de `WEB-002`, sobre el esqueleto aceptado de S1 (ver
[DEC-0015](docs/decisions/DEC-0015_simulation-state-v2-skeleton-and-v1-migration.md)).
Sustituye el fixture provisional de `300 × 300 m` de `WEB-001` como
generador activo de partidas nuevas por un generador semántico,
determinista, versionado y persistible que produce directamente un
`SimulationStateV2` válido y jugable como escenario inicial completo. No
introduce todavía el motor de resolución de acciones, el planificador de
trabajos ni las necesidades causales (S4 en adelante); ver
[DEC-0016](docs/decisions/DEC-0016_semantic-village-generator.md) para las
decisiones de interpretación del presupuesto y las extensiones aditivas
al esqueleto de contratos de S1.

- **Generador semántico** (`packages/simulation-core/src/v2/generator/`,
  `packages/catalogs/src/place-profiles.ts`): separado en configuración
  (`config.ts`), terreno/hidrología/vías (`terrain.ts`), huella del
  asentamiento (`settlement.ts`), programa/estancias/contenido de
  edificios (`buildings.ts`), lugares no edificados y saqueo
  (`environment-places.ts`), garantías del escenario inicial
  (`scenario.ts`) y validación de generación (`validate-generation.ts`).
  Determinista por semilla, `VILLAGE_GENERATOR_VERSION`
  (`web-002-semantic-v1`) y configuración; sin `Math.random()`, reloj del
  sistema, UUID aleatorio ni locale.
- **Presupuesto obligatorio por semilla** (§7.2 de `WEB-002`): `55-85`
  construcciones totales, `28-42` viviendas (`RES-10`/`RES-17`, con
  subconjunto rural/aislado), `10-18` anexos/cobertizos ligados a una
  vivienda, `6-10` construcciones comerciales/técnicas (`COM-02`/`TAL-01`
  repetidos, nunca un noveno perfil), `3-7` colapsadas, red de vías
  (principal, secundarias, rurales, accesos bloqueados), hidrología (una
  fuente principal + 1-3 secundarias), cobertura de terreno orgánica
  (bosque/matorral, campo, resto) calculada de forma cerrada por área.
- **Ocho perfiles de `CAT-004` implementados**: los cuatro programas de
  edificio de §8.2 con estancias obligatorias, conectividad interior real
  (estancias encadenadas por aberturas, salida exterior garantizada),
  mobiliario, contenedores y contenido (jerarquía `Building → Room →
  Furniture → Container → Content`); `ENV-01` a `ENV-04` como lugares
  enlazados a su geometría real (nodo/área/línea).
- **Escenario inicial materializado**: llegada Día 1 · 17:30, seis
  protagonistas ubicados en el punto de llegada (reutiliza
  `generateCohort` de `WEB-001` sin cambios), refugio provisional
  dentro de 100-250 m (con degradación explícita si una semilla no
  encuentra candidato, nunca en silencio), medio de transporte
  recuperable, parcela de cultivo candidata con semillas/herramienta,
  dos fuentes de agua, y pertenencias de los protagonistas materializadas
  como `WorldObject` reales.
- **Integración con `SimulationStateV2`**: produce el V2 directamente
  (nunca genera primero un V1 para migrarlo); ejecuta Zod,
  `validateSimulationStateV2Invariants` (ampliado con integridad
  referencial de ubicaciones, jerarquía espacial y unicidad global de ID)
  y una validación propia de generación
  (`validateGeneratedVillage`) antes de exponer la partida.
- **Persistencia** (`createGameV2`/`loadGameV2`/`saveSnapshotV2` en
  `packages/persistence`): una partida V2 nueva conserva semilla,
  versión de generador y resultado generado; la recarga recupera
  exactamente el mismo mundo (se corrigió una pérdida de precisión de
  punto flotante en el redondeo JSONB de PostgreSQL, documentada en
  `round-state.ts`); la migración V1→V2 y la preservación de snapshots de
  S1 quedan intactas.
- **Integración mínima con la aplicación**: `createGameV2Action` conecta
  el generador al flujo real de creación de partida; un visor de solo
  lectura (`/village/[gameSaveId]`, `VillageScreen`/`VillageMapCanvas`)
  demuestra que el mapa consume el nuevo estado, sin adelantar la
  interfaz completa de explotación/trabajos/necesidades.
- 44 pruebas unitarias nuevas (generador, estado inicial, invariantes
  ampliados) y 5 de integración PostgreSQL nuevas, más 1 E2E nueva
  (`village-generation.spec.ts`), todas en verde junto con las 69 pruebas
  unitarias, 15 de integración y 2 E2E ya existentes.

## WEB-002 (subhito S1) — Esqueleto de SimulationStateV2 y migración V1→V2

Primer subhito de `WEB-002` (incrementos 4+5 de `RDM-003`, agrupados por
decisión expresa), ejecutado por instrucción de Dennis de dividir la
especificación maestra en subhitos verificables en varias sesiones (ver
[DEC-0015](docs/decisions/DEC-0015_simulation-state-v2-skeleton-and-v1-migration.md)).
No es una regeneración desde el prototipo Godot ni introduce ningún
cambio visible en la aplicación jugable.

- **Forma completa de `SimulationStateV2`** en `packages/contracts`:
  ubicación única por entidad (`EntityLocation`), entidades espaciales
  (lugares, edificios, plantas, estancias, aberturas, cierres,
  obstrucciones, anclajes, perímetros), objetos/contenedores/recursos/
  transporte, agricultura, historial de lugares, trabajos/designaciones/
  reservas y necesidades — todas validadas con Zod, la mayoría con
  colecciones vacías hasta los subhitos que las pueblan.
- **Migración determinista V1→V2** (`migrateV1ToV2`): traducción
  estructural del fixture y la cohorte existentes, con toda aproximación
  registrada explícitamente en `migration.degradations`; nunca invoca el
  generador semántico real.
- **Invariantes relacionales** (`validateSimulationStateV2Invariants`)
  adicionales a Zod: cantidades no negativas, contención sin ciclos ni
  huérfanos, exclusividad de reserva, reservas referenciando trabajos
  reales.
- **Persistencia no destructiva** (`saveMigratedV2Snapshot`): el
  snapshot V2 migrado se guarda como fila adicional, transaccional e
  idempotente, sin tocar el snapshot V1 vigente.
- 18 pruebas unitarias y 3 de integración PostgreSQL nuevas, todas en
  verde junto con las 45 pruebas y 2 E2E ya existentes de `WEB-001`.

## WEB-001 — Fundación web, cohorte protagonista y mapa local operativo

Primera **entrega ejecutable** de la línea activa de código
(Node.js/TypeScript/Next.js/PostgreSQL), agrupando deliberadamente base
técnica, runtime/reloj/persistencia real, cohorte procedural y mapa local
Canvas 2D en una sola entrega coherente y verificable en navegador (ver
[DEC-0014](docs/decisions/DEC-0014_web-runtime-foundation-and-initial-simulation-contracts.md)).
Reinicio limpio: no se copió, adaptó ni usó código, datos, constantes ni
pruebas del prototipo Godot como fuente de implementación.

- **Monorepo** `npm workspaces`: `apps/web` (Next.js/React/Canvas) y cinco
  paquetes con dependencias unidireccionales (`contracts`, `catalogs`,
  `simulation-core`, `persistence`, `application`).
- **Núcleo determinista**: PRNG `mulberry32` con streams por dominio, sin
  `Math.random`; reloj continuo (Día 1 · 17:30, pausa/×1/×2/×4/×10, un día
  = 20 min reales a ×1); generación de seis protagonistas con calibre
  oculto `5/4+/4+/3+/3+/3+`, cobertura colectiva estructural y red de
  relaciones de `SCN-002`; fixture procedural determinista del sector de
  llegada; navegación A* determinista; niebla de tres estados.
- **Persistencia real**: PostgreSQL/Prisma desde el primer arranque,
  snapshot versionado como fuente autoritativa, revisión optimista, sin
  event sourcing integral.
- **Web Worker real** como runtime activo, con protocolo tipado y
  validado; React solo emite comandos y consume proyecciones sin datos
  ocultos (nunca calibre ni potencial numérico real).
- **Interfaz**: inicio con crear/continuar partida, pantalla de juego con
  ficha completa de persona, Canvas con cámara/niebla/movimiento directo
  («Moverse aquí»), registro operacional y estados de guardado visibles.
- **Validación real**: 45 pruebas unitarias/integración (Vitest, las de
  integración contra PostgreSQL real) y 2 pruebas E2E (Playwright,
  Chromium real, servidor de producción real) en verde; `next build`,
  `next lint` y `tsc --noEmit` en las seis partes del monorepo sin
  errores.
- Actualiza `docs/STATUS.md`, `docs/OPEN-QUESTIONS.md`,
  `docs/roadmap/RDM-003`, `README.md`, `docs/20-world/WLD-008` (cierra la
  contradicción sobre el estado de `CAT-004`) y crea
  [DEC-0014](docs/decisions/DEC-0014_web-runtime-foundation-and-initial-simulation-contracts.md).

No implementa el primer bucle causal completo, designaciones de trabajo,
sistema de objetos, generador semántico completo, entorno mutable,
amenazas, autonomía ni narrativa dinámica: todo permanece fuera de alcance
según `RDM-003`.

## DESIGN-008 — Catálogo implementable y mundo local moldeable

Entrega **exclusivamente documental** que convierte `CAT-004`, hasta ahora
`draft`, en el primer catálogo implementable del mundo local, y cierra el
marco funcional de un entorno moldeable donde terreno, agua, vegetación,
carreteras, accesos y objetos son materia jugable de primera clase, no un
fondo sobre el que se colocan edificios. No implementa código, no
inicializa la aplicación web y no toca `src/`, `scenes/`, `tests/` ni
`project.godot`.

- **Ocho perfiles iniciales aprobados**: casa familiar mediana (`RES-10`),
  cabaña (`RES-17`), supermercado pequeño (`COM-02`), taller mecánico
  (`TAL-01`), fuente local de agua (`ENV-01`), campo o parcela abierta
  (`ENV-02`), zona de bosque o matorral (`ENV-03`) y tramo de carretera o
  camino (`ENV-04`)
  ([CAT-004](docs/catalogs/CAT-004_initial-semantic-place-slice.md),
  `approved` por decisión expresa de Dennis).
- **Cuatro programas iniciales de edificio**, con estancias obligatorias y
  opcionales, límite de una planta activa y sin editor arquitectónico
  ([CAT-002](docs/catalogs/CAT-002_rooms-modules-and-building-systems.md),
  ampliado).
- **Entorno mutable y construcción espacial**: modelo de nodo, línea, área
  y estructura; capas semánticas de terreno; libertad de transformación
  con causalidad; barrera lineal entre anclajes; red de perímetro
  derivada de cierres físicos reales; carretera transformable
  ([WLD-010](docs/20-world/WLD-010_mutable-terrain-and-spatial-construction.md),
  `approved`).
- **Aberturas, cierres y conectividad**: abertura, cierre instalado y
  modificación/obstrucción como conceptos separados; colocación
  procedural coherente de accesos; tapiado con consecuencias reales;
  ventanas y brechas como accesos potenciales
  ([WLD-011](docs/20-world/WLD-011_openings-access-and-connectivity.md),
  `approved`).
- **Primer catálogo de objetos, recursos y transporte**: catorce familias
  de comportamiento, cuatro objetos demostradores profundos (armario,
  frigorífico, bomba de agua, carretilla/carro), subconjunto inicial de
  materiales y fin de «materiales de reparación» como pila universal
  ([CAT-005](docs/catalogs/CAT-005_initial-object-resource-and-transport-slice.md),
  `approved`).
- **Transporte y logística local**: cinco métodos activos (a pulso,
  recipiente/equipamiento personal, porte coordinado, carretilla, carro),
  modelo de carga, fases logísticas y puntos de transferencia
  ([SET-010](docs/40-settlement/SET-010_local-hauling-and-transport.md),
  `approved`).
- **Ciclo agrícola inicial**: cadena de estados causal, rendimiento
  causal y producción localizada, sin sistema de estaciones
  ([SET-011](docs/40-settlement/SET-011_initial-agriculture-loop.md),
  `approved`).
- **Decisión y trazabilidad**: decisión transversal
  ([DEC-0013](docs/decisions/DEC-0013_implementable-catalog-and-mutable-world.md),
  `approved`) y trazabilidad completa de las decisiones `P01`–`P24`
  ([DISC-0007](docs/discovery/DISC-0007_implementable-catalog-and-mutable-world-traceability.md),
  `draft`).
- **Contradicciones corregidas**: «materiales de reparación» deja de
  poder implementarse como recurso agregado universal; despejar una
  carretera y retirar su función viaria dejan de confundirse; un recinto
  cerrado deja de implicar seguridad automática; retirar una puerta deja
  de implicar eliminar el hueco.
- **Estados documentales**: `CAT-004` pasa de `draft` a `approved`.
  `CAT-005`, `WLD-010`, `WLD-011`, `SET-010`, `SET-011` y `DEC-0013` nacen
  `approved`. `DISC-0007` nace `draft`. `SET-008` y `SET-009` permanecen
  `draft` en su horizonte máximo todavía abierto. `RDM-003` permanece
  `approved` y no ejecutado, con su incremento 5 precisado sin crear un
  incremento nuevo. `RDM-001` permanece `deprecated`. **Ningún documento
  pasa a `implemented`**; la nueva línea web sigue sin mapa, lugares,
  objetos, agricultura, accesos, transporte, construcción, inventario ni
  aplicación web reales.

## DESIGN-007 — Primer escenario real, cohorte protagonista y pueblo de llegada

Entrega **exclusivamente documental** que convierte el escenario inicial
de referencia en un escenario real, concreto y reproducible. No
implementa código, no inicializa la aplicación web y no toca `src/`,
`scenes/`, `tests/` ni `project.godot`.

- **Momento exacto de llegada**: Día 1, 17:30, aproximadamente seis
  semanas tras el colapso general, primera mitad de abril, cuatro días de
  marcha previa, banda meteorológica templada-fría de montaña sin
  fenómenos letales
  ([SCN-003](docs/scenarios/SCN-003_first-day-starting-state.md),
  `approved`).
- **Cohorte protagonista procedural**: seis adultos sin elenco fijo, con
  distribución mínima obligatoria de calibre oculto `5/4+/4+/3+/3+/3+`
  específica de este escenario (siempre oculta, sin bonificador directo
  ni protección narrativa), cobertura funcional colectiva mínima y una
  red de relaciones conectada con al menos un acontecimiento compartido
  durante la huida
  ([SCN-002](docs/scenarios/SCN-002_initial-survivor-cohort.md),
  `approved`;
  [CHR-007](docs/30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md),
  `draft`, registra la regla de escenario sin cerrar la distribución
  global de calibre).
- **Refugio por estancias**: el refugio provisional garantizado y
  cualquier otro edificio del escenario se generan siempre como
  composición de estancias, accesos, instalaciones y sistemas mediante el
  modelo ya aprobado de
  [WLD-005](docs/20-world/WLD-005_semantic-place-and-building-generation.md)/[CAT-002](docs/catalogs/CAT-002_rooms-modules-and-building-systems.md);
  se formaliza la diferencia entre refugio provisional y asentamiento
  elegido en
  [SET-001](docs/40-settlement/SET-001_settlement-growth.md) (`approved`).
- **Presupuesto del mapa local**: huella aproximada `3×3 km`, `55–85`
  construcciones, red viaria, dos rutas de agua garantizadas, cobertura
  de terreno y `12–18` puntos de interés, de los que solo `3–6` se
  conocen al llegar
  ([WLD-009](docs/20-world/WLD-009_initial-mountain-village-profile.md),
  `approved`).
- **Amenaza inicial contenida**: `12–30` zombis, sin horda inicial ni
  respawn de lo limpiado, aplicando sin ampliar el zombi estándar de
  [THR-001](docs/60-threats/THR-001_zombie-threat-model.md).
- **Pertenencias, armas y carencias**: presupuesto garantizado de agua,
  comida, encendido, luz y primeros auxilios, un arma cuerpo a cuerpo o
  improvisada por protagonista, y carencias obligatorias (agua
  sostenible, camas, almacén, electricidad, defensas).
- **Garantías de semilla**: nueve condiciones internas que toda semilla
  válida debe cumplir antes de empezar, sin informar al jugador de dónde
  está la solución.
- **Comunidades inciertas**: ninguna comunidad local obligatoria, señales
  humanas siempre presentes pero ambiguas, y entre cero y dos comunidades
  regionales posibles, sin abrir el mapa regional.
- **Decisión y trazabilidad**: decisión transversal que respalda el
  contrato del escenario
  ([DEC-0012](docs/decisions/DEC-0012_first-arrival-scenario-contract.md),
  `approved`) y trazabilidad completa del encargo
  ([DISC-0006](docs/discovery/DISC-0006_first-arrival-scenario-traceability.md),
  `draft`).
- **Contradicciones corregidas**: `SCN-001` deja de contener preguntas
  abiertas sobre estación, cohorte, refugio, dimensiones, amenaza y
  comunidades, y pasa a ser el punto de entrada y síntesis del escenario.
- **Estados documentales**: `SCN-002`, `SCN-003`, `WLD-009` y `DEC-0012`
  nacen `approved`. `DISC-0006` nace `draft`. `SCN-001` permanece
  `approved`. `CHR-007` permanece `draft`. `CAT-004` permanece `draft`:
  el presupuesto de `55–85` construcciones no lo aprueba como alcance de
  implementación. **Ningún documento pasa a `implemented`**; la nueva
  línea web sigue sin generador, personajes, mapa, inventario ni zombis
  reales.

## DESIGN-006 — Cierre del motor de resolución y capacidades

Entrega **exclusivamente documental** que cierra las veintidós decisiones
`P01`–`P22` del motor de acciones, trabajos y eventos, con las correcciones
finales de Dennis. No implementa código, no inicializa la aplicación web y
no toca `src/`, `scenes/`, `tests/` ni `project.godot`.

- **Escala y capacidad base**: escala real `0–10` para características y
  habilidades, con `4` como media humana de una característica y `0` como
  valor real distinto de dato desconocido; tres perfiles cerrados de
  ponderación entre característica y habilidad efectivas (instintivo/
  físico 70/30, equilibrado 50/50, técnico/aprendido 30/70)
  ([CHR-006](docs/30-characters/CHR-006_characteristics-and-skill-catalog.md),
  [ARC-006](docs/90-architecture/ARC-006_action-and-event-resolution-model.md),
  ambos `approved`).
- **Modelo híbrido de resolución**: ejecución directa con umbral de **tres
  puntos**, no dos, sobre la dificultad efectiva; progreso `D` con
  variación acotada de hasta `±8 %` por fase; comprobaciones `B` mediante
  margen, variación acotada `[-4,+4]` y cinco bandas internas; requisitos
  duros clasificados en abierto/improvisable/guiado/restringido; episodios
  persistentes
  ([ARC-006](docs/90-architecture/ARC-006_action-and-event-resolution-model.md)).
- **Cooperación y modos**: cooperación por funciones reales con
  rendimientos decrecientes (`100 %/60 %/35 %/20 %`), responsable/ejecutor/
  supervisor con reglas de sustitución, dos dimensiones combinables de modo
  (ritmo y atención) en lugar de cuatro categorías excluyentes, límites
  temporales heredados del lugar y cuatro políticas cualitativas de
  respuesta ante amenazas
  ([ARC-007](docs/90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md),
  `approved`).
- **Resultados, conocimiento y eventos**: resultados multidimensionales sin
  «crítico»/«pifia» universal, cuatro capas de conocimiento imperfecto,
  reintentos con presupuesto de autonomía, oposición activa mediante margen
  relativo único, aprendizaje por participación, cadena de eventos con
  ocho pasos y cuatro niveles de atención con pausa crítica predeterminada,
  y determinismo temporal fuerte entre velocidades de simulación
  ([ARC-008](docs/90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md),
  `approved`, con 31 casos de validación documental).
- **Presentación de capacidades**: nivel actual numérico `0–10` visible en
  la ficha del personaje; potencial real, calibre oculto y máximo numérico
  siempre ocultos, comunicados mediante un catálogo cerrado de frases
  cualitativas moduladas por confianza
  ([CHR-007](docs/30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md),
  `draft`; [UI-004](docs/80-interface/UI-004_qualitative-capability-presentation.md),
  `approved`).
- **Decisión y trazabilidad**: decisión transversal que respalda el cierre
  íntegro
  ([DEC-0011](docs/decisions/DEC-0011_hybrid-resolution-engine-and-capability-presentation.md),
  `approved`) y trazabilidad completa de `P01`–`P22`
  ([DISC-0005](docs/discovery/DISC-0005_resolution-engine-closure-traceability.md),
  `draft`).
- **Contradicciones corregidas**: `CHR-006` deja de describir la escala
  como `1–10`; el umbral de tarea básica pasa de una lectura de `+2` a
  `+3`; los cuatro modos de trabajo dejan de leerse como mutuamente
  excluyentes; la fórmula antigua `(característica + 2 × habilidad) / 3` y
  la función logística candidata de B quedan descartadas como universales;
  `UI-004` corrige su prohibición absoluta de cifras para permitir el
  nivel actual visible sin abrir umbrales de una acción concreta.
- **Estados documentales**: `ARC-006`, `ARC-007` y `ARC-008` pasan de
  `draft` a `approved`. `CHR-006` y `UI-004` permanecen `approved`.
  `CHR-007` permanece `draft`: conserva abiertas la distribución de
  estrellas del calibre, los campos de potencial, la adaptación al
  apocalipsis, los dominios de habilidad y el catálogo de rasgos. **Ningún
  documento pasa a `implemented`**; la nueva línea web sigue sin
  implementación del motor.

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
