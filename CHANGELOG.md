# Changelog

Registra entregas documentales y de diseño de Z-World. No atribuye código ni
funcionalidad implementada salvo que se indique explícitamente como
`implemented` en la documentación afectada.

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
