# PROMPT PARA CLAUDE CODE — DESIGN-005: mapas local y regional, generación procedural, equipos e interacción contextual

## 0. Encargo

Realiza una entrega **exclusivamente documental** en el repositorio `bateman37/z-world` para consolidar con máxima precisión el diseño aprobado de:

1. Las dos escalas espaciales de Z-World: mapa local y mapa regional futuro.
2. El mapa local 2D cenital, procedural, visualmente continuo y con estructura técnica invisible.
3. La generación procedural controlada del primer escenario: un pueblo pequeño de montaña ficticio, nunca una gran ciudad accidental.
4. La interacción contextual y progresiva con edificios, lugares, terreno, objetos, personas y amenazas.
5. La composición de equipos locales mediante `Auto / 1 / 2 / 3 / 4`, con asignación automática o manual, responsable y aportaciones reales.
6. El horizonte futuro del mapa regional: niebla, red creciente de puntos de interés y expediciones de `1 a X` supervivientes que viajan por el mapa.
7. La corrección de las fuentes canónicas que todavía presentan el mapa local 3D del prototipo Godot o `RDM-001` como dirección activa.

No programes nada. No inicialices todavía Next.js, Node.js, TypeScript, Prisma o PostgreSQL. No modifiques código Godot, escenas, pruebas ni configuración ejecutable. Esta entrega debe ordenar, reconciliar, indexar y dejar cerradas las decisiones funcionales indicadas aquí para que una implementación posterior no tenga que inventarlas.

La calidad documental es prioritaria. No reduzcas este encargo a un resumen breve ni a un único documento genérico. Todo lo acordado debe quedar ubicado en su fuente canónica, con trazabilidad, enlaces y estados documentales correctos.

---

## 1. Reglas obligatorias de trabajo y Git

### 1.1 Punto de partida

Antes de editar:

1. Lee completos `AGENTS.md` y `CLAUDE.md`.
2. Lee `docs/INDEX.md`, `docs/STATUS.md` y `docs/OPEN-QUESTIONS.md`.
3. Lee los índices de los dominios afectados.
4. Lee completos los documentos canónicos y dependencias indicados en la sección 2 de este prompt.
5. Comprueba el estado real de `main` y no confíes en una rama antigua o en memoria de trabajos anteriores.

Trabaja en una **rama documental nueva creada desde el `main` remoto actualizado**. No reutilices ninguna rama de Godot, `IMPLEMENTATION-004`, `claude/docs-foundation-setup-94xtnn` ni otra rama previa. Si el entorno no permite partir del `main` remoto vigente sin destruir cambios ajenos, detente e informa; no resuelvas el problema con `reset --hard`, borrados o sobrescrituras.

Nombre de rama sugerido:

```text
docs/design-005-local-regional-maps
```

### 1.2 Pull request

Al terminar:

1. Guarda este prompt literal en `prompts/DESIGN-005_local-regional-maps-and-contextual-interaction.md`.
2. Actualiza `prompts/INDEX.md` y cualquier índice de prompts pertinente.
3. Haz commit de la entrega documental.
4. Publica la rama.
5. **Crea la pull request, pero no la fusiones.**

Título sugerido de la PR:

```text
DESIGN-005: mapas local y regional e interacción contextual
```

La descripción de la PR debe enumerar los documentos creados y modificados, las decisiones cerradas, lo que permanece abierto y las validaciones documentales ejecutadas. Debe indicar expresamente que no se ha implementado código.

### 1.3 Alcance técnico prohibido

No debes:

- modificar `src/`, `scenes/`, `tests/`, `project.godot` ni ningún archivo del prototipo Godot;
- crear todavía la nueva aplicación web;
- añadir dependencias, paquetes, migraciones o esquemas de base de datos;
- implementar Canvas, pathfinding, niebla, generadores, trabajos o interfaz;
- ejecutar suites globales no relacionadas;
- fusionar la PR;
- convertir preguntas numéricas abiertas en decisiones inventadas;
- presentar como `implemented` ninguna capacidad descrita aquí.

---

## 2. Lectura obligatoria y reconciliación previa

Lee completos, como mínimo:

### Gobierno y estado

- `AGENTS.md`
- `CLAUDE.md`
- `docs/INDEX.md`
- `docs/STATUS.md`
- `docs/OPEN-QUESTIONS.md`
- `docs/00-governance/DOC-001_documentation-system.md`
- `docs/00-governance/GLOSSARY.md`

### Mundo y exploración

- `docs/20-world/INDEX.md`
- `docs/20-world/WLD-001_world-scales.md`
- `docs/20-world/WLD-002_local-exploration-and-information.md`
- `docs/20-world/WLD-003_strategic-world-and-regional-simulation.md`
- `docs/20-world/WLD-004_expertise-dependent-recovery.md`
- `docs/20-world/WLD-005_semantic-place-and-building-generation.md`
- `docs/20-world/WLD-006_historical-looting-pressure-and-routes.md`
- `docs/20-world/WLD-007_place-history-and-environmental-storytelling.md`

### Interfaz y trabajo

- `docs/80-interface/INDEX.md`
- `docs/80-interface/UI-001_interaction-and-command-model.md`
- `docs/80-interface/UI-002_management-at-community-scale.md`
- `docs/80-interface/UI-003_work-priority-taxonomy.md`
- `docs/80-interface/UI-004_qualitative-capability-presentation.md`
- `docs/80-interface/UI-005_top-down-simulation-workbench.md`

### Arquitectura y motor de resolución

- `docs/90-architecture/INDEX.md`
- `docs/90-architecture/ARC-001_technical-direction.md`
- `docs/90-architecture/ARC-002_procedural-generation-and-persistence.md`
- `docs/90-architecture/ARC-003_multiscale-simulation-principles.md`
- `docs/90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md`
- `docs/90-architecture/ARC-005_semantic-world-data-model.md`
- `docs/90-architecture/ARC-006_action-and-event-resolution-model.md`
- `docs/90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md`
- `docs/90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md`

### Escenario, decisiones, catálogos y roadmap

- `docs/scenarios/SCN-001_mountain-village-arrival.md`
- `docs/decisions/INDEX.md`
- `docs/decisions/DEC-0002_two-world-scales.md`
- `docs/decisions/DEC-0003_data-driven-design.md`
- `docs/decisions/DEC-0004_mouse-strategic-control.md`
- `docs/decisions/DEC-0005_reproducible-lazy-generation.md`
- `docs/decisions/DEC-0007_layered-work-and-priorities.md`
- `docs/decisions/DEC-0008_simulation-first-web-architecture.md`
- `docs/roadmap/INDEX.md`
- `docs/roadmap/RDM-003_simulation-first-playable-roadmap.md`
- `docs/catalogs/INDEX.md`
- `docs/catalogs/CAT-001_maximum-place-catalog.md`
- `docs/catalogs/CAT-002_rooms-modules-and-building-systems.md`
- `docs/catalogs/CAT-004_initial-semantic-place-slice.md`
- `docs/discovery/INDEX.md`
- `docs/discovery/DISC-0003_procedural-place-generator-traceability.md`

Antes de escribir, construye para tu propio trabajo una matriz de reconciliación con estas columnas:

| Decisión de este prompt | Fuente canónica destino | Documentos relacionados que deben enlazarla | Estado | Contradicciones encontradas |
|---|---|---|---|---|

No es obligatorio publicar esa tabla como un documento independiente si la trazabilidad queda completa en `DISC-0004`, pero debes utilizarla para no perder ninguna decisión.

Si encuentras una contradicción no resuelta por este prompt, no elijas en silencio. Regístrala como abierta y explica su impacto. Este prompt sí resuelve expresamente las contradicciones de representación 3D/2D, materialización regional, equipos locales y geografía procedural que aparecen en las secciones siguientes.

---

## 3. Modelo espacial aprobado: dos mapas jugables diferentes

### 3.1 Dos escalas, no un único mapa infinito

Z-World mantiene dos escalas funcionales separadas:

1. **Mapa local de la comunidad**: simulación detallada y continua de personas, trabajos, edificios, terreno, recursos, necesidades, amenazas, construcción y vida cotidiana.
2. **Mapa regional futuro**: territorio mucho mayor, exploración estratégica, rutas, puntos de interés, comunidades y expediciones.

No deben mezclarse como si fueran el mismo nivel de detalle ni obligar a simular cada persona, edificio y objeto regional con fidelidad local.

La frontera entre escalas es principalmente funcional, no una cifra cerrada de kilómetros:

- Si se observa a la persona desplazarse y actuar minuto a minuto, ocurre en el mapa local.
- Si el desplazamiento requiere horas o días, suministros, ruta y una expedición, pertenece al mapa regional.

No fijes todavía dimensiones exactas en metros, kilómetros, casillas o hexágonos.

### 3.2 Interior de edificios

El interior de un edificio no constituye por defecto un tercer mapa separado ni una pantalla de misión. Forma parte del detalle del mapa local:

- el edificio aparece inicialmente como volumen, huella o tejado;
- su interior se revela progresivamente mediante observación, accesos y entrada;
- habitaciones, puertas, mobiliario, instalaciones y contenedores se representan por capas cuando corresponda;
- varias plantas pueden resolverse mediante capas o planta activa, sin decidir todavía su interfaz visual definitiva.

No diseñes un cambio obligatorio a otra escena cada vez que alguien entra en una casa.

### 3.3 Materialización: aclaración terminológica obligatoria

La arquitectura actual utiliza «materialización» para la generación diferida y reproducible de **detalle semántico**. Debe conservarse ese concepto.

Sin embargo, materializar detalle semántico no significa automáticamente:

- abrir un mapa local nuevo;
- cambiar de pantalla;
- generar una misión táctica independiente;
- crear un escenario detallado por cada punto regional visitado.

Audita `WLD-001`, `WLD-003`, `ARC-003`, `SOC-003` y cualquier otra referencia pertinente para que el término no confunda ambos conceptos. La generación diferida continúa aprobada; la creación automática de mapas locales al llegar a un punto regional **no está aprobada**.

---

## 4. Mapa local 2D aprobado

### 4.1 Representación visible

El mapa local activo es:

- 2D;
- cenital o completamente visto desde arriba;
- dibujado inicialmente con Canvas 2D del navegador;
- controlado exclusivamente con ratón;
- visualmente continuo y orgánico, no presentado como una cuadrícula rígida;
- deliberadamente funcional y sencillo en esta etapa, sin arte final;
- compatible conceptualmente con una futura capa visual más avanzada, sin depender de ella.

La referencia estética funcional es la claridad de un plano vivo cenital, no la copia visual de RimWorld ni un juego isométrico. Debe poder representar:

- carreteras y caminos curvos o irregulares;
- ríos, arroyos, estanques y relieve legible;
- parcelas de formas diferentes;
- edificios con tamaños y orientaciones coherentes con calles y terreno;
- bosques, campos, claros y masas de vegetación no cuadradas visualmente;
- personas, amenazas y trayectorias;
- tejados e interiores por capas;
- zonas y designaciones dibujadas con ratón;
- niebla de guerra y estados de conocimiento.

No se introduce ahora una perspectiva isométrica, 2.5D, primera persona, WASD, puntería manual, Phaser, PixiJS ni otro motor 2D. `UI-005` mantiene la regla de que Canvas 2D basta hasta que una necesidad medida demuestre lo contrario.

### 4.2 Estructura técnica invisible

Aunque visualmente el mapa sea continuo, puede y debe apoyarse internamente en una estructura espacial invisible. Documenta conceptualmente, sin fijar algoritmos ni tamaños exactos, que esta estructura puede servir para:

- navegación y cálculo de rutas;
- ocupación física y colisiones;
- costes de terreno y pendientes;
- línea de visión y ocultación;
- niebla de guerra;
- zonas habituales, de precaución y prohibidas;
- selección y designación de áreas;
- puntos de interacción;
- división en sectores o `chunks`;
- generación y carga diferida;
- consultas espaciales y rendimiento.

La cuadrícula, celdas, sectores o estructura equivalente no deben imponerse visualmente al jugador salvo en herramientas de depuración o capas funcionales justificadas. No fijes todavía si la implementación final usa casillas cuadradas, polígonos, navegación por grafos, una combinación u otra estructura técnica concreta.

### 4.3 Territorio conocido, utilizado y controlado

El refugio inicial ocupa una parte pequeña del mapa local. El mapa debe permitir distinguir conceptualmente:

- núcleo comunitario;
- entorno usado habitualmente;
- frontera operativa conocida pero insegura;
- territorio descubierto sin visión directa actual;
- territorio todavía oculto;
- áreas sobre las que el jugador aplica una norma espacial.

No conviertas estos conceptos descriptivos en nuevos estados de zona. Los únicos estados normativos de zona ya aprobados en `UI-001` siguen siendo:

- **Habitual**;
- **Precaución**;
- **Prohibida**.

Descubrir, observar, asegurar, reclamar y controlar territorio siguen siendo procesos diferentes. Pintar una zona no la explora, no la limpia y no la hace segura.

### 4.4 Niebla e información

Mantén la separación ya aprobada:

- la niebla responde a la visibilidad espacial;
- los estados de `WLD-002` responden a lo que la comunidad sabe de un lugar;
- revelar terreno no genera contenido, no registra habitaciones y no asegura edificios;
- un lugar puede permanecer conocido aunque no esté actualmente a la vista;
- la información puede quedar anticuada si el mundo cambia.

El conocimiento local debe poder guardar, como mínimo, cuándo y con qué confianza se conoció algo cuando esa diferencia sea relevante. No fijes fórmulas de deterioro de información en esta entrega.

---

## 5. Generación procedural controlada del mapa local

### 5.1 Principio general

La geografía del primer escenario es procedural, reproducible y derivada de semilla. No debe utilizar una reproducción literal de Sort ni otro municipio real. Sort, Cataluña, Aragón, Andorra o Francia pueden aparecer en la documentación únicamente como referencias de escala o ambiente utilizadas durante el debate, nunca como contenido prometido del primer escenario.

El primer escenario debe ser un **pueblo de montaña ficticio**, generado dentro de un perfil controlado. Si en el futuro se desea una geografía real, será otro modo de generación o fuente de datos, no una consecuencia implícita de esta entrega.

### 5.2 Perfil inicial de generación

Documenta un perfil conceptual inicial equivalente a:

```text
Perfil: pueblo pequeño de montaña
Entorno dominante: valle, bosque, montaña, campos y agua posible
Tamaño: pequeño y acotado
Densidad: baja o media
Alturas ordinarias: una a tres plantas
Red viaria: carretera principal, calles limitadas y caminos secundarios
Catálogo permitido: subconjunto inicial soportado de lugares y edificios
Complejidad: limitada por presupuesto de generación y simulación
```

Los nombres técnicos definitivos del perfil o sus campos pueden quedar abiertos; no conviertas el ejemplo anterior en un esquema TypeScript o Prisma.

### 5.3 Variación permitida por semilla

La semilla puede variar de forma coherente:

- relieve, pendientes y forma del valle;
- cursos y puntos de agua;
- vegetación, masas forestales y claros;
- campos y terrenos abiertos;
- carretera principal, calles y caminos;
- forma y distribución del asentamiento;
- zonas, distritos o agrupaciones funcionales;
- parcelas;
- cantidad, tipo, tamaño, orientación y estado de edificios;
- posición del grupo inicial y candidatos a refugio;
- accesos bloqueados o deteriorados;
- historia del colapso;
- presión y rutas de saqueo;
- ocupantes anteriores y actuales;
- amenazas;
- recursos y conocimiento recuperable;
- información inicial conocida por la comunidad.

La semilla no puede romper el perfil ni producir contenido que el juego todavía no soporte.

### 5.4 Complejidad prohibida en el perfil inicial

El generador inicial no puede producir accidentalmente:

- una gran ciudad;
- cientos o miles de bloques urbanos detallados;
- rascacielos;
- grandes autopistas urbanas;
- un puerto marítimo;
- un aeropuerto internacional;
- redes de metro;
- distritos de alta densidad;
- miles de interiores activos;
- arquetipos no incluidos en el subconjunto soportado.

Las grandes ciudades requerirán en el futuro perfiles, presupuestos, abstracciones y reglas propias. No deben aparecer por una tirada extrema de la semilla.

### 5.5 Cadena generativa local

Crea un documento canónico específico para la generación espacial del mapa local y conecta, sin duplicar, estas capas conceptuales:

1. Perfil de escenario o región.
2. Terreno, relieve y pendientes.
3. Agua e hidrología relevante.
4. Vegetación y usos generales del suelo.
5. Red de carreteras, calles y caminos.
6. Huella del asentamiento y zonas funcionales.
7. Parcelas y espacios no edificados.
8. Lugares y edificios semánticos de `WLD-005`.
9. Historia ambiental, deterioro y saqueo de `WLD-006`/`WLD-007`.
10. Estado actual, amenazas y ocupación.
11. Información inicial, niebla y conocimiento comunitario.
12. Representación Canvas de `UI-005`.

La realidad semántica precede a la representación visual. El generador espacial no debe convertir el Canvas en fuente de verdad.

La generación mantiene las reglas de `ARC-002` y `DEC-0005`: semilla, IDs estables, versión de generador, generación diferida reproducible y persistencia de todo cambio ya causado o conocido. No inventes todavía hashes, fórmulas, formatos de guardado ni tamaños de `chunk`.

---

## 6. Interacción contextual con el mapa y los lugares

### 6.1 Dos gramáticas complementarias

La interacción local combina dos modelos; no debe obligarse a uno a sustituir al otro:

1. **Acción contextual sobre objetivo incierto o singular**: edificios desconocidos, accesos, habitaciones, equipos, personas, amenazas y objetos concretos.
2. **Designación por área u objetivo conocido**: trabajos repetitivos sobre terreno o elementos ya comprendidos, como talar, recolectar, pescar, recoger, transportar, construir, desmontar, patrullar o aplicar zonas.

Las herramientas de área inspiradas en juegos de gestión son válidas para trabajo conocido y repetible. No deben permitir pintar diez edificios desconocidos y ordenar «saquear» como si la comunidad conociera ya sus accesos, ocupantes y contenido.

### 6.2 Cadena de control ya aprobada

No inventes un nuevo planificador de misiones. Conserva y enlaza la cadena aprobada de `UI-003`:

> Necesidad o intención → orden, zona, política o evento → trabajo concreto → prioridad → elegibilidad → habilidad y conocimiento → herramientas, materiales e infraestructura → ejecución → resultado, experiencia e información nueva.

El jugador expresa una intención. El sistema genera los trabajos y microacciones necesarios. Las personas ejecutan esos pasos según sus capacidades, estado, autonomía, entorno y reglas. No se obliga al jugador a programar manualmente cada paso ni a escribir órdenes en lenguaje natural.

### 6.3 Ficha contextual de un lugar

Al seleccionar un lugar, la interfaz debe poder mostrar una ficha contextual con:

- identidad conocida o descripción provisional;
- estado de información;
- indicios conocidos;
- incógnitas relevantes;
- confianza y antigüedad cuando proceda;
- riesgos conocidos, no riesgos omniscientes;
- accesos conocidos;
- trabajos en curso o pendientes;
- personas/equipo asignados;
- acciones disponibles;
- acciones conocidas pero bloqueadas, con motivo;
- progreso, fases e interrupciones.

No fijes todavía el diseño gráfico exacto, la posición del panel ni la iconografía final.

### 6.4 Regla de visibilidad de acciones

Esta regla queda aprobada y debe aparecer con claridad:

- Si la comunidad conoce una posibilidad pero la persona o equipo seleccionado no puede ejecutarla, la acción aparece deshabilitada o en gris y explica el motivo.
- Si la comunidad todavía no ha reconocido esa posibilidad, la acción no aparece y no filtra información oculta.

Ejemplo: alguien sin conocimiento técnico puede ver «equipo desconocido». Cuando una persona adecuada identifica una bomba de agua averiada, la comunidad ya puede conocer la acción «Reparar bomba», aunque para muchas personas aparezca bloqueada por habilidad, conocimiento, herramienta o material.

### 6.5 Estados progresivos de interacción con un edificio

No reduzcas un edificio a «explorado X %». Conserva los estados generales de `WLD-002`, pero documenta que el conocimiento de un edificio tiene facetas independientes, como:

- exterior;
- accesos;
- amenazas;
- posibles ocupantes;
- habitaciones;
- contenido suelto;
- mobiliario y equipamiento;
- instalaciones;
- estructura;
- cambios posteriores;
- momento y confianza de la última información.

La ficha y las acciones evolucionan según lo conocido. Flujo de referencia aprobado:

| Situación conocida | Intenciones o acciones que pueden resultar pertinentes |
|---|---|
| Lugar solamente avistado | Reconocer exterior, observar, vigilar, evitar o marcar |
| Exterior reconocido | Acercarse, inspeccionar un acceso, llamar, mantener vigilancia, retirarse o plantear entrada |
| Acceso examinado | Abrir, despejar, forzar, trepar, preparar entrada o abandonar |
| Interior parcialmente conocido | Explorar otra estancia, asegurar la zona inmediata, buscar, contactar, auxiliar, combatir o retirarse |
| Lugar asegurado | Registrar, recuperar, trasladar, inspeccionar equipos, reparar, utilizar o reclamar |
| Lugar aprovechado | Mantener, adaptar, reforzar, conectar, desmontar, demoler o abandonar según corresponda |

La tabla no obliga a mostrar todas las acciones en todos los lugares. Cada objetivo declara posibilidades o `affordances`; el estado real, la información, el acceso, la persona, el equipo, las herramientas, las normas y el riesgo filtran lo que tiene sentido.

### 6.6 Reconocimiento exterior como barrera blanda

Para un edificio desconocido, el recorrido autónomo y normal comienza por **reconocer el exterior**, no por «saquear».

Reconocer exterior es una acción física y temporal. Puede implicar:

- buscar posiciones desde las que observar;
- revisar puertas y ventanas;
- escuchar;
- buscar huellas, sangre, humo, daños o movimiento;
- localizar accesos;
- estimar riesgos visibles;
- identificar la función anterior del edificio;
- buscar rutas de retirada;
- comunicar indicios.

Depende de luz, clima, posición, sentidos, habilidades, miedo, fatiga y otros factores pertinentes. «No se oyó nada» no equivale a «está vacío».

No conviertas el reconocimiento exterior en una prohibición absoluta. El jugador puede ordenar una entrada sin reconocimiento cuando la situación lo permita, pero debe ser una decisión explícita con riesgo cualitativo y sin información gratuita. La personalidad, autonomía, miedo, urgencia o desesperación pueden influir en que una persona acepte, rechace, dude o se extralimite según `CHR-003`.

### 6.7 Familias de acciones contextuales

Integra y amplía sin contradecir las familias ya existentes en `WLD-002`. Deben quedar cubiertas, como verbos de diseño y no como botones universales:

| Familia funcional | Ejemplos |
|---|---|
| Percibir y reconocer | Observar, escuchar, rastrear, vigilar, reconocer exterior |
| Posicionarse | Acercarse, esperar, seguir, evitar, ocultarse, retirarse |
| Acceder | Abrir, llamar, despejar, forzar, trepar |
| Asegurar y responder | Contener, neutralizar, custodiar, rescatar, proteger, retirarse |
| Examinar y comprender | Inspeccionar, buscar, analizar, diagnosticar, registrar |
| Comprobar | Probar, medir, tomar muestra, verificar funcionamiento |
| Recuperar y trasladar | Recoger, transportar, vaciar, copiar información, marcar para traslado |
| Utilizar | Consumir, activar, equipar, instalar o poner en servicio cuando proceda |
| Transformar | Limpiar, reparar, adaptar, reforzar, conectar, desmontar, demoler, reclamar |
| Relacionarse | Llamar, hablar, ayudar, comerciar, intimidar, detener, atacar |

No conviertas esta lista en una botonera completa. Los documentos deben explicar qué familias corresponden a cada tipo de objetivo:

- terreno o zona natural;
- edificio o lugar;
- acceso, habitación o estructura;
- objeto, mobiliario, instalación o equipo;
- persona, animal o amenaza;
- recurso o fuente natural.

### 6.8 Interior y revelado progresivo

Entrar no revela mágicamente todo el edificio. El interior se descubre de manera parcial:

- por línea de visión, luz, aberturas y posición;
- habitación por habitación o zona por zona;
- mediante acciones de observación, acceso, aseguramiento, inspección y registro;
- conservando diferencias entre «visible», «observado», «inspeccionado» y «registrado»;
- sin generar objetos nuevos por llevar a una persona más experta.

El contenido estable y el reconocimiento dependiente de la persona siguen gobernados por `WLD-004`, `WLD-005`, `ARC-002` y `DEC-0005`.

### 6.9 Interrupciones

Las microacciones rutinarias pueden continuar autónomamente. La interfaz debe elevar o interrumpir por hechos significativos, por ejemplo:

- amenaza detectada;
- persona desconocida;
- acceso bloqueado inesperado;
- peligro estructural;
- objeto o instalación extraordinaria;
- herida;
- cambio material del entorno;
- decisión social o moral;
- pérdida de medios esenciales.

No fijes una lista exhaustiva ni la política exacta de pausa automática; registra esa calibración como abierta si no está ya cubierta por `ARC-008`.

---

## 7. Equipos locales y asignación de personas

### 7.1 Lo que ya existe y no debe rediseñarse

Z-World ya tiene:

- prioridades individuales;
- órdenes y designaciones;
- trabajos generados;
- selección automática por prioridad y elegibilidad;
- control puntual con ratón;
- asignación manual de personas;
- responsable y aportaciones funcionales en `ARC-007`.

No crees un sistema alternativo que compita con esas capas.

### 7.2 Tamaño visible aprobado para una orden local

Una orden local contextual permite escoger:

```text
Personas: Auto / 1 / 2 / 3 / 4
```

Este rango es la interfaz habitual de un **equipo operativo local**, no un límite universal de población, emergencia o expedición regional.

### 7.3 Modos de asignación

La orden debe poder expresar conceptualmente:

| Asignación | Comportamiento |
|---|---|
| Comunidad + Auto | El sistema decide cuántas personas son útiles y elige personas elegibles |
| Comunidad + 1/2/3/4 | El jugador fija la cantidad y el sistema elige a las personas elegibles |
| Equipo seleccionado | El jugador escoge las personas concretas; puede dejar el responsable en automático o elegirlo |

No fijes todavía la disposición gráfica exacta del selector.

### 7.4 Responsable y funciones útiles

Mantén el modelo de `ARC-007`: un trabajo colectivo puede tener responsable y aportaciones concretas, sin profesiones rígidas. Funciones posibles cuando aportan algo real:

- responsable técnico u operativo;
- ayudante operativo;
- apoyo logístico;
- revisor;
- vigilancia o retaguardia.

No todas las órdenes necesitan todas las funciones. Una actividad individual no debe inventar un líder artificial.

### 7.5 Capacidad y límites propios de cada acción

Cada tipo de acción debe poder declarar conceptualmente:

- mínimo de personas;
- cantidad recomendada;
- máximo útil simultáneo;
- funciones disponibles;
- requisitos individuales o compartidos;
- limitaciones físicas del lugar;
- posibilidad de repartir el trabajo en objetivos o fases paralelas.

No fijes todavía valores para todo el catálogo ni fórmulas de cooperación.

Añadir personas no otorga un bono genérico ni garantiza éxito. No se permite:

- sumar un porcentaje universal por cada integrante;
- promediar indiscriminadamente al especialista con quien solo transporta;
- combinar la mejor habilidad de cada persona como si pertenecieran a un individuo perfecto;
- convertir a un novato en experto por acompañar al responsable;
- añadir ayudantes ilimitados en un espacio pequeño;
- conceder una bonificación remota a alguien que no participa.

Las personas adicionales pueden modificar, según la función real:

- tiempo;
- capacidad de carga;
- cobertura;
- vigilancia;
- fatiga;
- coordinación;
- ruido;
- exposición;
- conservación de piezas;
- posibilidad de trabajar en paralelo;
- aprendizaje por participación.

### 7.6 Operaciones de más de cuatro personas

Una operación local mayor no se representa necesariamente como un único trabajo con veinte integrantes. Puede descomponerse en trabajos o equipos relacionados:

- combatir un incendio;
- levantar una muralla;
- evacuar un edificio;
- defender un perímetro;
- trasladar grandes cantidades de recursos.

El evento u objetivo común puede movilizar a muchas personas, pero cada equipo conserva una aportación comprensible. No conviertas `4` en un límite del motor ni en el máximo de personas que pueden reaccionar a una emergencia.

### 7.7 Ejemplos orientativos, no valores cerrados

Documenta como ejemplos no normativos:

| Operación | Equipo razonable ilustrativo | Aportaciones posibles |
|---|---:|---|
| Reconocer exterior | 1–2 | Observación y vigilancia |
| Entrar en edificio desconocido | 2–4 | Responsable, apoyo, vigilancia y retaguardia |
| Registrar una habitación | 1–2 | Registro y segunda revisión |
| Trasladar objeto voluminoso | 2–4 | Manipulación y apoyo logístico |
| Desmontar instalación | 1–3 | Especialista, ayudante y logística |
| Vigilar acceso | 1–2 | Guardia y relevo |

No conviertas estos intervalos en reglas universales ni en datos implementados.

### 7.8 Prioridad, modo y cantidad son conceptos distintos

Mantén las distinciones de `UI-003` y `ARC-007`:

- la prioridad decide qué trabajo se atiende antes;
- el modo expresa cómo se aborda;
- el método define el procedimiento;
- el tamaño del equipo define cuántas personas se desean o permiten;
- la asignación indica quién las elige;
- la elegibilidad determina quién puede participar;
- más personas no implica automáticamente mayor calidad.

`ARC-007` y `ARC-008` deben conservar estado `draft` mientras sigan abiertas las fórmulas y calibraciones del motor. Actualiza `P09` para distinguir:

- decisión cerrada: selector local `Auto / 1 / 2 / 3 / 4` y aportaciones funcionales;
- decisión abierta: fórmula de cooperación, coordinación, rendimientos decrecientes y máximo útil concreto por familia de acción.

`P10` puede seguir abierto en lo relativo a sustitución del responsable, supervisión y reasignación automática. No declares esas cuestiones resueltas.

---

## 8. Mapa regional futuro

### 8.1 Alcance documental, no de implementación inmediata

El mapa regional debe quedar documentado como horizonte futuro coherente, pero **no se incorpora como nueva implementación inmediata al roadmap activo**. La atención de las próximas entregas sigue en el mapa local y el laboratorio de simulación.

No programes ni diseñes exhaustivamente el mapa regional en esta entrega.

### 8.2 Representación aprobada

La dirección aceptada es un mapa regional:

- 2D;
- visualmente geográfico, topográfico y continuo;
- procedural y ficticio;
- cubierto por niebla e información incompleta;
- apoyado internamente en regiones, celdas o hexágonos invisibles y una red de rutas;
- capaz de mostrar carreteras, caminos, ríos, relieve, poblaciones, comunidades, señales y puntos de interés;
- sin obligar a mostrar una cuadrícula hexagonal dominante como estética principal.

Puede existir una capa o superposición técnica de regiones/hexágonos cuando sea útil para planificar, pero no fijes todavía su forma, resolución, escala o visibilidad definitiva.

### 8.3 Mundo conocido creciente

El mapa regional comienza con una fracción mínima de información:

- asentamiento propio;
- algunas rutas o referencias cercanas;
- lugares recordados, observados, documentados o mencionados;
- indicios como humo, radio, señales, sonidos o rumores;
- grandes zonas desconocidas.

La exploración amplía progresivamente la red conocida. Los números «unos veinte puntos iniciales» y «hasta mil puntos con el tiempo» son ejemplos de escala mental, no contratos numéricos. Documenta la intención de poder crecer desde pocos destinos conocidos hasta cientos o potencialmente muchos más, usando abstracción regional y sin simular cada punto con detalle local.

Un punto regional puede representar, por ejemplo:

- pueblo o núcleo urbano;
- granja o instalación aislada;
- puente o paso de montaña;
- gasolinera;
- hospital;
- torre o repetidor;
- comunidad;
- campamento;
- área de caza;
- concentración de amenazas;
- señal todavía sin identificar.

No conviertas esta lista en un catálogo cerrado.

### 8.4 Expediciones regionales

Una expedición futura es un grupo de `1 a X` supervivientes que abandona la zona de confort y se desplaza realmente por el mapa regional. No es solamente pulsar un destino y recibir una recompensa, ni una lista desconectada de misiones.

El viaje puede llegar a incluir:

- ruta;
- duración;
- suministros;
- campamentos;
- desvíos;
- caminos bloqueados;
- descubrimientos;
- cambios de plan;
- encuentros;
- pérdida o mantenimiento de comunicación;
- regreso, demora o desaparición.

Son capacidades futuras. No cierres ahora interfaz, fórmulas, frecuencia de eventos, tamaño máximo `X`, composición exacta ni control durante el viaje.

El selector local `Auto / 1 / 2 / 3 / 4` no limita el tamaño de una expedición. Dentro de una expedición grande, una acción concreta podría ser realizada por un equipo local menor cuando ese sistema se diseñe.

### 8.5 Sin mapa local automático por punto

Queda expresamente descartado como decisión actual que cada punto regional visitado deba generar o abrir automáticamente un mapa local detallado.

Permanece abierto para el futuro si ciertos lugares excepcionales podrán:

- resolverse de forma regional;
- mostrar detalle contextual;
- usar una vista específica;
- reutilizar el mapa local;
- generar otra representación.

No elijas una de esas posibilidades en esta entrega.

### 8.6 Geografía regional procedural

El mapa regional inicial también se concibe como geografía procedural controlada, no como una reproducción literal de Cataluña, Aragón, Andorra o Francia. Esos territorios solo ilustran la magnitud imaginada durante el debate.

El generador regional futuro deberá impedir que una semilla cree complejidad no soportada. Las grandes ciudades requerirán perfiles y soluciones específicas, igual que en el mapa local.

---

## 9. Corrección del legado Godot y del roadmap anterior

### 9.1 Regla canónica actual

La línea activa es la arquitectura `simulation-first` de `DEC-0008`:

- Node.js;
- TypeScript;
- Next.js/React;
- PostgreSQL/Prisma;
- núcleo de simulación puro;
- mapa local Canvas 2D cenital.

El mapa local 3D pertenece al prototipo histórico Godot. Puede conservarse como antecedente y aprendizaje, pero no debe presentarse como arquitectura o representación activa.

### 9.2 Documentos que requieren revisión expresa

Revisa y corrige, como mínimo:

- `WLD-001`, que todavía define «Mapa local 3D»;
- `WLD-003`, que repite «Mapa local 3D», hexágonos visibles como única presentación y materialización susceptible de confundirse con otro mapa local;
- `DEC-0002`, que liga la decisión de dos escalas a un mapa local 3D;
- `SCN-001`, que todavía presenta el escenario como espacio 3D y remite al alcance activo de `RDM-001`;
- `docs/INDEX.md`, si todavía dirige cambios del primer corte activo a `RDM-001`;
- `docs/OPEN-QUESTIONS.md`, si presenta `RDM-001` como roadmap activo o mantiene preguntas ya resueltas por esta entrega;
- `UI-001`, `UI-005`, `RDM-003`, `ARC-003` y otros documentos relacionados, para asegurar enlaces y terminología coherentes.

No hagas una sustitución ciega de todas las menciones a `RDM-001` o Godot:

- `RDM-001` debe conservarse como documento `deprecated` e histórico;
- las referencias que describen deliberadamente el antiguo prototipo pueden permanecer;
- las referencias que lo usan como fuente activa deben apuntar a `RDM-003` o aclarar su condición histórica;
- `DEC-0001` y las entregas Godot no se borran.

### 9.3 Formulación que debe quedar clara

La documentación canónica debe expresar una idea equivalente a:

> La escala local detallada sigue vigente. Su representación activa es un mapa 2D cenital sobre Canvas. Las referencias al mapa local 3D describen el prototipo histórico Godot. Una posible presentación 3D futura no forma parte del alcance actual y no altera el modelo semántico.

---

## 10. Documentos a crear y actualizar

Respeta la responsabilidad de cada dominio y evita duplicar reglas completas. Usa enlaces por ID cuando una regla ya tenga fuente canónica.

### 10.1 Documentos nuevos obligatorios

#### `WLD-008` — generación procedural del mapa local

Crea un documento con ID siguiente libre, esperado:

```text
docs/20-world/WLD-008_local-procedural-map-generation.md
```

Estado esperado: `approved` para los principios cerrados; algoritmos y cifras exactas permanecen abiertos.

Debe ser canónico para:

- generación espacial del mapa local;
- perfil procedural controlado de pueblo pequeño de montaña;
- capas terreno → agua → vegetación → rutas → asentamiento → parcelas → lugares;
- presupuesto de complejidad y exclusión de grandes ciudades;
- relación con `WLD-005`, `ARC-002`, `UI-005` y `SCN-001`;
- separación entre realidad semántica y representación Canvas.

#### `UI-006` — interacción contextual con lugares y equipos

Crea un documento con ID siguiente libre, esperado:

```text
docs/80-interface/UI-006_contextual-place-interaction-and-teams.md
```

Estado esperado: `approved` para el flujo de interacción, visibilidad de acciones, reconocimiento exterior blando y selector de equipos; fórmulas de cooperación y diseño gráfico exacto permanecen abiertos.

Debe ser canónico para:

- ficha contextual de lugar;
- evolución de acciones según conocimiento;
- acción contextual frente a designación repetitiva;
- regla «conocida pero no disponible = gris con motivo; no reconocida = ausente»;
- reconocimiento exterior como vía normal pero no bloqueo absoluto;
- interacción parcial con interiores;
- asignación `Comunidad/Equipo seleccionado`;
- selector `Auto / 1 / 2 / 3 / 4`;
- responsable y funciones útiles;
- operaciones mayores mediante varios trabajos/equipos.

#### `DEC-0010` — dirección procedural de mapas y escalas

Crea la siguiente decisión libre, esperada:

```text
docs/decisions/DEC-0010_procedural-local-and-regional-map-direction.md
```

Estado: `approved`.

Debe registrar sin repetir todo el detalle:

- mapa local cenital continuo con estructura técnica invisible;
- mapa regional futuro geográfico con regiones internas;
- geografía procedural controlada y ficticia;
- 3D Godot como antecedente histórico;
- ausencia de materialización obligatoria de mapa local por cada punto regional;
- semántica independiente de la presentación.

#### `DISC-0004` — trazabilidad del diseño

Siguiendo el patrón de `DISC-0003`, crea:

```text
docs/discovery/DISC-0004_local-regional-maps-and-contextual-actions-traceability.md
```

Estado: `draft`, por su función de trazabilidad y síntesis, no de fuente normativa.

Debe contener una matriz compacta que distinga:

- decisiones cerradas;
- aclaraciones;
- opciones descartadas;
- ejemplos no normativos;
- preguntas que siguen abiertas;
- documento canónico donde vive cada regla.

No debe duplicar páginas enteras de las fuentes canónicas.

Si los IDs indicados ya estuvieran ocupados en el `main` real en el momento de trabajar, usa los siguientes IDs libres, actualiza todas las referencias y explica la renumeración en la PR. No sobrescribas documentos ajenos.

### 10.2 Documentos existentes que deben actualizarse

Como mínimo:

- `docs/20-world/INDEX.md`
- `docs/20-world/WLD-001_world-scales.md`
- `docs/20-world/WLD-002_local-exploration-and-information.md`
- `docs/20-world/WLD-003_strategic-world-and-regional-simulation.md`
- `docs/20-world/WLD-005_semantic-place-and-building-generation.md`
- `docs/80-interface/INDEX.md`
- `docs/80-interface/UI-001_interaction-and-command-model.md`
- `docs/80-interface/UI-003_work-priority-taxonomy.md` solo donde deba enlazar equipos/acciones sin repetir la taxonomía
- `docs/80-interface/UI-005_top-down-simulation-workbench.md`
- `docs/90-architecture/INDEX.md`
- `docs/90-architecture/ARC-002_procedural-generation-and-persistence.md` solo para aclarar derivación/persistencia sin duplicar `WLD-008`
- `docs/90-architecture/ARC-003_multiscale-simulation-principles.md`
- `docs/90-architecture/ARC-005_semantic-world-data-model.md` si necesita relaciones conceptuales con mapa/POI/equipo, sin diseñar tablas
- `docs/90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md`
- `docs/90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md`
- `docs/scenarios/SCN-001_mountain-village-arrival.md`
- `docs/decisions/INDEX.md`
- `docs/decisions/DEC-0002_two-world-scales.md`
- `docs/discovery/INDEX.md`
- `docs/roadmap/RDM-003_simulation-first-playable-roadmap.md`
- `docs/INDEX.md`
- `docs/OPEN-QUESTIONS.md`
- `docs/STATUS.md`
- `docs/00-governance/GLOSSARY.md`
- `CHANGELOG.md`
- `prompts/INDEX.md`

Modifica `README.md` únicamente si contiene una afirmación activa que quede desactualizada; no lo infles con el diseño completo.

### 10.3 Estados documentales

- Los principios cerrados de `WLD-008`, `UI-006` y `DEC-0010` pueden quedar `approved`.
- `WLD-001`, `WLD-002`, `WLD-003`, `UI-001`, `UI-005`, `SCN-001` y las decisiones existentes conservan su estado aprobado salvo contradicción metodológica real.
- `ARC-007` y `ARC-008` permanecen `draft`: esta entrega cierra la interfaz de tamaño/asignación local, no las fórmulas del motor.
- `DISC-0004` permanece `draft` y no sustituye a las fuentes canónicas.
- Ningún documento pasa a `implemented`.
- `RDM-001` permanece `deprecated` como historia del prototipo Godot.

---

## 11. Decisiones descartadas o que no deben reaparecer como aprobadas

Registra en trazabilidad, sin convertirlo en un ensayo, que se descartan para la línea actual:

- mapa local 3D como implementación activa;
- primera persona, WASD o control de avatar;
- perspectiva isométrica o 2.5D en el laboratorio actual;
- cuadrícula visible como estética obligatoria del mapa local;
- copiar visualmente RimWorld;
- mapa local reducido a nodos o pantallas de misión;
- mapa regional reducido a una lista de misiones;
- geografía real de Sort/Cataluña/Aragón/Francia como contenido comprometido;
- posibilidad de que la semilla inicial genere una gran ciudad no soportada;
- abrir obligatoriamente un mapa local al llegar a cada punto regional;
- «saquear» edificios desconocidos sin conocimiento, acceso ni reconocimiento;
- reconocimiento exterior obligatorio e infranqueable en toda circunstancia;
- mostrar acciones desconocidas como botones grises que filtren secretos;
- bonificación genérica por acumular integrantes;
- límite universal de cuatro personas para emergencias o expediciones;
- planificador en lenguaje natural o formulario exhaustivo por tarea;
- resolver el regional en esta entrega de código.

---

## 12. Preguntas que deben permanecer abiertas

No inventes respuesta para:

### Mapa local

- dimensiones exactas;
- tamaño de celdas o sectores internos;
- algoritmo de pathfinding;
- algoritmo geométrico exacto de terreno, agua, calles y parcelas;
- radio, línea de visión y oclusión exactos;
- paleta, iconos, sprites y arte final;
- interfaz exacta para múltiples plantas;
- cantidades exactas de edificios o lugares;
- rendimiento y presupuestos numéricos;
- catálogo inicial definitivo si `CAT-004` sigue pendiente de aprobación.

### Acciones y equipos

- duración exacta de cada acción;
- fórmulas de idoneidad, cooperación y coordinación;
- rendimientos decrecientes;
- mínimo/recomendado/máximo concreto para todo el catálogo;
- reglas exactas de sustitución del responsable;
- política final de pausas e interrupciones;
- todos los costes y efectos de modos por familia;
- interfaz gráfica final.

### Mapa regional

- tamaño regional exacto;
- número de puntos iniciales o máximos;
- valor máximo de `X` en expediciones;
- resolución y geometría de regiones internas;
- flujo exacto de viaje;
- frecuencia y catálogo de eventos;
- comunicaciones;
- materialización o representación detallada de lugares excepcionales;
- puestos, colonias y control territorial;
- fecha de implementación.

Una pregunta puede reformularse para reflejar lo que ya está cerrado, pero no debe desaparecer si su parte numérica o funcional sigue pendiente.

---

## 13. Ejemplos de aceptación documental

La documentación resultante debe permitir responder sin contradicciones:

1. ¿Cuál es la representación activa del mapa local? 2D cenital Canvas, no el antiguo 3D Godot.
2. ¿El mapa local parece una cuadrícula? No necesariamente: es continuo visualmente y puede usar celdas invisibles internamente.
3. ¿Puede una semilla inicial generar Barcelona o una metrópolis? No: el perfil inicial limita el mundo a un pueblo pequeño de montaña.
4. ¿Sort forma parte del juego? No como promesa geográfica; fue referencia de ambiente y escala.
5. ¿Revelar niebla registra una vivienda? No.
6. ¿Pulsar un edificio desconocido ofrece directamente «saquear»? No como vía normal; primero aparecen acciones coherentes con lo conocido.
7. ¿Es obligatorio reconocer exterior? Es la vía normal y autónoma, pero puede saltarse mediante una orden explícita arriesgada cuando sea físicamente posible.
8. ¿Una persona sin mecánica ve siempre «reparar bomba»? Solo si la comunidad ya reconoció que existe una bomba reparable; entonces puede verla bloqueada con motivo.
9. ¿Cómo se elige equipo local? `Auto / 1 / 2 / 3 / 4`, con asignación comunitaria o personas seleccionadas.
10. ¿Cuatro es el máximo de una expedición? No.
11. ¿Cuatro personas garantizan más éxito que una? No; deben aportar funciones reales y pueden generar coordinación, ruido o exposición.
12. ¿Una muralla con doce personas es un único trabajo con doce bonos? No; puede descomponerse en trabajos/equipos relacionados.
13. ¿El regional es una lista de misiones? No; es un mapa persistente bajo niebla, recorrido por expediciones.
14. ¿Cada destino regional abre un mapa táctico? No está decidido y no es obligatorio.
15. ¿La generación diferida sigue existiendo? Sí; materialización semántica no equivale a abrir otro mapa.
16. ¿El regional se implementa ahora? No; se documenta el horizonte y el trabajo inmediato sigue centrado en el mapa local.

Incluye ejemplos o casos límite suficientes para que futuros agentes no reinterpreten estas respuestas.

---

## 14. Auditoría, validaciones y cierre

Antes del commit:

1. Revisa todos los enlaces y cabeceras `depends_on`/`related` tocados.
2. Comprueba que los índices incluyan cada documento nuevo con ID, estado y propósito correctos.
3. Comprueba que `docs/STATUS.md` describa esta entrega como documental y no implementada.
4. Comprueba que `docs/OPEN-QUESTIONS.md` retire únicamente preguntas cerradas y conserve las calibraciones pendientes.
5. Busca referencias activas que todavía describan el mapa local 3D o `RDM-001` como roadmap vigente.
6. Distingue las referencias históricas legítimas de las contradicciones activas; no borres historia.
7. Busca usos de «materializar» para que no impliquen automáticamente «abrir un mapa local».
8. Comprueba que `Auto / 1 / 2 / 3 / 4` no se confunda con escala de prioridad ni con tamaño de expedición.
9. Comprueba que las 34 prioridades de `UI-003` no se renombren, añadan, eliminen o mezclen con habilidades.
10. Comprueba que toda la prosa dirigida a personas esté en español.
11. Ejecuta `git diff --check`.
12. Si el repositorio ya dispone de una validación documental pequeña y directamente aplicable, ejecútala; no instales herramientas ni ejecutes una suite global para esta entrega.

El informe final de Claude Code debe incluir:

- rama creada;
- commit realizado;
- URL o número de la PR creada;
- archivos creados;
- archivos modificados;
- decisiones cerradas;
- preguntas preservadas;
- contradicciones corregidas;
- validaciones ejecutadas y resultado;
- confirmación expresa de que no se modificó código ni se fusionó la PR.

No termines limitándote a explicar qué harías: realiza la edición documental completa, publica la rama y crea la pull request sin fusionarla.
