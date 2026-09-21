---
id: DISC-0004
title: Trazabilidad de mapas local y regional e interacción contextual
status: draft
canonical_for: []
depends_on: []
related:
  - WLD-001
  - WLD-002
  - WLD-003
  - WLD-005
  - WLD-008
  - UI-001
  - UI-003
  - UI-005
  - UI-006
  - ARC-002
  - ARC-003
  - ARC-005
  - ARC-007
  - ARC-008
  - SCN-001
  - DEC-0002
  - DEC-0010
  - RDM-003
---

## 1. Propósito

Demostrar que ninguna decisión, aclaración, exclusión o pregunta abierta del
prompt
[prompts/DESIGN-005_local-regional-maps-and-contextual-interaction.md](../../prompts/DESIGN-005_local-regional-maps-and-contextual-interaction.md)
se perdió al formalizarlo en documentación canónica, y registrar dónde vive
cada regla. Sigue el patrón de
[DISC-0003](DISC-0003_procedural-place-generator-traceability.md).

## 2. Principios que no deben romperse

- Este documento es `draft`: es una síntesis de trazabilidad, **no** una
  fuente canónica de reglas. Las reglas viven en los documentos de destino.
- No duplica páginas enteras de las fuentes canónicas: enlaza por ID y
  sección.
- Ninguna fila puede quedar sin destino: toda decisión tiene documento
  canónico, pregunta abierta registrada, o ambos.

## 3. Decisiones cerradas

| Decisión | Documento canónico |
|---|---|
| Dos escalas espaciales separadas; frontera funcional, no una cifra de kilómetros. | [WLD-001](../20-world/WLD-001_world-scales.md) §3, [DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md) |
| El interior de un edificio es detalle del mapa local, no un tercer mapa ni una pantalla de misión. | [WLD-001](../20-world/WLD-001_world-scales.md) §3.2, [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.8 |
| La representación activa del mapa local es 2D cenital sobre Canvas, continua y orgánica, solo con ratón. | [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md) §3.1, §4; [DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md) |
| El mapa local se apoya en una estructura espacial técnica invisible; la cuadrícula no es la estética. | [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md) §3.6 |
| Los seis conceptos de territorio (núcleo, entorno usado, frontera, descubierto, oculto, normado) no crean estados de zona nuevos. | [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md) §3.7; tres zonas en [UI-001](../80-interface/UI-001_interaction-and-command-model.md) §3.4 |
| Niebla (visibilidad espacial) y estados de información de un lugar siguen separados. | [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md) §3.3, [WLD-002](../20-world/WLD-002_local-exploration-and-information.md) §3.3 |
| La geografía del primer escenario es procedural, reproducible y ficticia: pueblo pequeño de montaña. | [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md) §2, §3.1; [SCN-001](../scenarios/SCN-001_mountain-village-arrival.md) §3 |
| Perfil inicial de generación con entorno, tamaño, densidad, alturas, red viaria, catálogo y presupuesto. | [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md) §3.1 |
| Cadena generativa espacial de doce capas, de perfil a representación Canvas. | [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md) §3.2 |
| El generador inicial no puede producir gran ciudad, rascacielos, puerto, aeropuerto, metro ni alta densidad. | [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md) §3.5 |
| La realidad semántica precede a la representación; el Canvas no es fuente de verdad. | [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md) §2; [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) §3.8 |
| Acción contextual y designación por área conviven; el área no ordena trabajo sobre objetivos desconocidos. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.1 |
| Ficha contextual de un lugar con identidad, estado, indicios, incógnitas, confianza, riesgos, accesos, trabajos, equipo y acciones. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.3 |
| Acción conocida no ejecutable = gris con motivo; acción no reconocida = ausente. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.4 |
| Facetas independientes de conocimiento de un edificio y flujo de referencia de intenciones por situación. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.5 |
| Reconocer el exterior es la vía normal y autónoma, saltable por orden explícita arriesgada. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.6 |
| Diez familias de acciones contextuales y su correspondencia con tipos de objetivo. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.7 |
| Entrar no revela todo el interior; revelado parcial por visión, posición y acción. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.8 |
| Selector de equipo local `Auto / 1 / 2 / 3 / 4` con asignación `Comunidad` o `Equipo seleccionado`. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.9 |
| Responsable y aportaciones funcionales reales, sin profesiones rígidas ni líder artificial. | [ARC-007](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md) §3.1; [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.10 |
| Añadir integrantes no concede bonificación genérica; solo la función real modifica el resultado. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.11; [ARC-007](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md) §3.1 |
| Una operación mayor se descompone en trabajos o equipos relacionados; `4` no es límite del motor. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.12 |
| Prioridad, modo, método, tamaño de equipo, asignación y elegibilidad son conceptos distintos. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.13 |
| El mapa regional futuro es geográfico, topográfico, continuo, procedural, ficticio y bajo niebla, con regiones internas. | [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md) §3, §3.2; [DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md) |
| El mundo regional conocido crece desde pocos destinos; no se simula cada punto con detalle local. | [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md) §3.3 |
| Una expedición es un grupo de `1 a X` supervivientes que viaja realmente por el mapa, no una recompensa por pulsar un destino. | [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md) §3.2 |
| Ningún punto regional obliga a generar o abrir un mapa local detallado. | [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md) §3.3 y §3.5; [DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md) |
| El mapa regional no entra en el roadmap activo de implementación. | [RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md) §3.3 |
| El mapa local 3D es antecedente histórico del prototipo Godot, no representación activa. | [DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md); [DEC-0008](../decisions/DEC-0008_simulation-first-web-architecture.md) |

## 4. Aclaraciones

| Aclaración | Dónde queda |
|---|---|
| «Materialización» significa generación diferida de detalle **semántico**; no implica abrir un mapa local, cambiar de pantalla ni crear una misión táctica. | [ARC-003](../90-architecture/ARC-003_multiscale-simulation-principles.md) §2; [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md) §3.3; [WLD-001](../20-world/WLD-001_world-scales.md) §5; [SOC-003](../50-society/SOC-003_external-communities-and-regional-history.md) §5; `GLOSSARY.md` |
| «Mapa local» pasa de definirse como escala 3D a escala detallada con representación activa 2D cenital. | `GLOSSARY.md`; [WLD-001](../20-world/WLD-001_world-scales.md) §3 |
| `RDM-001` es histórico y `deprecated`; el alcance activo se consulta en `RDM-003`. | [docs/INDEX.md](../INDEX.md); [docs/OPEN-QUESTIONS.md](../OPEN-QUESTIONS.md); [WLD-001](../20-world/WLD-001_world-scales.md); [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md); [SCN-001](../scenarios/SCN-001_mountain-village-arrival.md) |
| El selector `Auto / 1 / 2 / 3 / 4` no es la escala de prioridad `Nunca/1–5` ni el tamaño de una expedición. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.13; [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md) §3.2 |
| Sort, Cataluña, Aragón, Andorra y Francia fueron referencias de ambiente y escala, nunca contenido comprometido. | [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md) §2; [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md) §3.6 |
| `WLD-008` cubre la generación **espacial**; `WLD-005` sigue cubriendo la generación **semántica** del lugar. | [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md) §1 |
| `ARC-007` y `ARC-008` siguen `draft`: esta entrega cierra la interfaz de tamaño y asignación, no las fórmulas del motor. | [ARC-007](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md); [ARC-008](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md) §4 (`P09`, `P10`) |

## 5. Opciones descartadas para la línea actual

Registro compacto, no un ensayo:

- mapa local 3D como implementación activa;
- primera persona, WASD o control de avatar;
- perspectiva isométrica o 2.5D en el laboratorio actual;
- cuadrícula visible como estética obligatoria del mapa local;
- copiar visualmente RimWorld;
- introducir Phaser, PixiJS u otro motor 2D sin una necesidad medida;
- mapa local reducido a nodos o pantallas de misión;
- mapa regional reducido a una lista de misiones;
- geografía real de Sort, Cataluña, Aragón o Francia como contenido
  comprometido;
- que la semilla inicial genere una gran ciudad no soportada;
- abrir obligatoriamente un mapa local al llegar a cada punto regional;
- «saquear» edificios desconocidos sin conocimiento, acceso ni
  reconocimiento;
- reconocimiento exterior obligatorio e infranqueable en toda circunstancia;
- mostrar acciones no reconocidas como botones grises que filtren secretos;
- bonificación genérica por acumular integrantes;
- límite universal de cuatro personas para emergencias o expediciones;
- planificador en lenguaje natural o formulario exhaustivo por tarea;
- resolver el mapa regional como entrega de código en esta etapa.

## 6. Ejemplos no normativos registrados

| Ejemplo | Dónde vive | Condición |
|---|---|---|
| Equipos razonables por operación (1–2, 2–4, 1–3…). | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §8 | Ilustrativo; no es dato implementado ni regla universal. |
| Bloque de texto del perfil «pueblo pequeño de montaña». | [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md) §3.1 | Conceptual; no es esquema TypeScript ni Prisma. |
| «Unos veinte puntos iniciales» y «hasta mil puntos con el tiempo». | [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md) §3.3 | Escala mental, no contrato numérico. |
| Lista de tipos de punto regional (pueblo, granja, puente, gasolinera…). | [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md) §3.3 | No es un catálogo cerrado. |
| Valle con carretera junto al río y núcleo en la ladera. | [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md) §8 | Salida plausible de una semilla, no garantizada. |
| Ejemplo de la bomba de agua reparable. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §3.4, §8 | Ilustra la regla de visibilidad, no un catálogo de acciones. |

## 7. Preguntas que siguen abiertas

Todas permanecen registradas en `docs/OPEN-QUESTIONS.md` y en la sección 7
del documento canónico correspondiente.

| Ámbito | Pregunta abierta | Donde vive |
|---|---|---|
| Mapa local | Dimensiones exactas; tamaño de celdas o sectores; algoritmo de pathfinding; algoritmo geométrico de terreno, agua, calles y parcelas; cantidades exactas de edificios; presupuestos numéricos de rendimiento; nombres técnicos del perfil. | [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md) §7 |
| Mapa local | Radio de visión, línea de visión y oclusión exactos; paleta, iconos, sprites y arte final. | [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md) §7 |
| Mapa local | Interfaz exacta para varias plantas de un edificio. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §7 |
| Mapa local | Catálogo inicial definitivo mientras `CAT-004` siga `draft`. | [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md) §7 |
| Acciones y equipos | Duración exacta de cada acción; interfaz gráfica final. | [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md) §7 |
| Acciones y equipos | Fórmulas de idoneidad, cooperación y coordinación; rendimientos decrecientes; mínimo/recomendado/máximo por familia. | `P09` en [ARC-008](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas) |
| Acciones y equipos | Reglas exactas de sustitución del responsable y trabajo supervisado. | `P10` en [ARC-008](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas) |
| Acciones y equipos | Política final de pausas e interrupciones; costes y efectos de los modos por familia. | `P11`, `P12`, `P14`, `P20` en [ARC-008](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#4-preguntas-abiertas) |
| Mapa regional | Tamaño regional exacto; número de puntos iniciales o máximos; valor máximo de `X` en expediciones; resolución y geometría de las regiones internas. | [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md) §7 |
| Mapa regional | Flujo exacto de viaje; frecuencia y catálogo de eventos; comunicaciones; puestos, colonias y control territorial. | [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md) §7 |
| Mapa regional | Si algunos lugares excepcionales tendrán representación detallada, y de qué tipo. | [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md) §3.5; [DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md) |
| Mapa regional | Fecha de implementación. | [RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md) §3.3 |

## 8. Contradicciones corregidas por esta entrega

| Contradicción encontrada | Corrección aplicada |
|---|---|
| `WLD-001` §3 definía «Mapa local 3D». | Se reformula como escala local detallada con representación activa 2D cenital y nota histórica del prototipo Godot. |
| `WLD-003` §3 repetía «Mapa local 3D» y presentaba los hexágonos como única presentación. | Se reformula la escala local y se aclara que las regiones o hexágonos son estructura interna, no estética obligatoria. |
| `WLD-003` §3.3 permitía leer «área local materializada» como apertura automática de un mapa local. | Se aclara el término y se registra expresamente que no está aprobada esa materialización automática. |
| `DEC-0002` ligaba la decisión de dos escalas a un mapa local 3D. | Se conserva la decisión y se añade la nota de reconciliación con `DEC-0010`. |
| `SCN-001` describía el mapa local como «espacio 3D» y remitía al alcance activo de `RDM-001`. | Se reformula a mapa local 2D cenital procedural y se remite a `RDM-003`, dejando `RDM-001` como histórico. |
| `docs/INDEX.md` dirigía los cambios del primer corte activo a `RDM-001`. | Se redirige a `RDM-003` y se marca `RDM-001` como consolidado histórico. |
| `docs/OPEN-QUESTIONS.md` citaba `RDM-001` como roadmap vigente y mantenía preguntas cerradas por esta entrega. | Se actualizan las referencias y se reformulan las preguntas conservando su parte numérica pendiente. |
| `GLOSSARY.md` definía «Mapa local» como escala 3D y «Alcance de entrega» mediante `RDM-001`. | Se actualizan ambas entradas y se precisa «Materialización». |

## 9. Qué no hace este documento

- No sustituye a ninguna fuente canónica.
- No fija reglas, cifras ni algoritmos.
- No autoriza implementación: `docs/STATUS.md` sigue siendo la única fuente
  de qué existe realmente en el juego ejecutable.
