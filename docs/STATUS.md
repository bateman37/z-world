# Estado del proyecto

Este documento es breve y se actualiza en cada entrega que cambie el estado
real del proyecto. No sustituye a las fuentes canónicas: para reglas, consulta
[docs/INDEX.md](INDEX.md).

## Fase actual

Primera implementación de código ejecutable: el **vertical slice visual**
(`IMPLEMENTATION-001`), primera de las cinco entregas fijadas en
[RDM-001](roadmap/RDM-001_first-playable-slice.md). Existe ya un proyecto
Godot importable, pero su **aceptación manual sigue pendiente** de que
Dennis la ejecute (ver [README.md](../README.md)).

## Última entrega completada

`IMPLEMENTATION-001` — vertical slice visual: proyecto Godot 4.7.2
importable desde la raíz, mapa local fijo de pueblo de montaña (terreno,
montañas, camino y desvío, agua, bosque, campo, seis edificios incluyendo un
refugio candidato), seis supervivientes visuales seleccionables, cámara
estratégica cenital controlada solo con ratón (desplazamiento, zoom y
centrado), selección con panel de información en español y reloj de
simulación con pausa y velocidades ×1, ×2, ×4 y ×10. No implementa trabajos,
prioridades, designaciones, recursos, necesidades, amenazas, autonomía,
generación procedural, guardado ni ninguna de las cuatro entregas
posteriores de `RDM-001`. Técnicamente implementado; **aceptación manual
pendiente**.

Entrega previa: `DESIGN-002` — horizonte máximo de diseño documentado, sin
ampliar el primer corte jugable. Ver
[VIS-003](10-vision/VIS-003_maximum-design-envelope.md) y
[DEC-0006](decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md).

Entrega anterior: `DESIGN-001` — especificación funcional cerrada de cómo se
juega minuto a minuto en el mapa local y alcance exacto del primer corte
jugable. Ver
[RDM-001](roadmap/RDM-001_first-playable-slice.md).

## Tecnología aprobada

- Motor: Godot 4. Baseline concreto de la primera implementación: **Godot
  4.7.2-stable, edición estándar**, no .NET (ver
  [DEC-0001](decisions/DEC-0001_godot-4.md)). Esto no es una promesa de que
  la versión no podrá actualizarse en entregas futuras.
- Lenguaje: GDScript, usado exclusivamente en esta primera implementación.
- Renderizador: Forward+ (escritorio).
- Guardado local; sin PostgreSQL ni servicios online. No implementado
  todavía (ver `RDM-001`, quinta entrega).

Detalle en [ARC-001](90-architecture/ARC-001_technical-direction.md).

## Funcionalidad realmente implementada

- Proyecto Godot 4.7.2 importable desde la raíz (`project.godot`), escena
  principal configurada en `run/main_scene`.
- Mapa local fijo (maqueta determinista, sin generación procedural) con
  pueblo de montaña: terreno, siluetas de montaña, camino principal con un
  desvío, agua, bosque, campo abierto y seis edificios (uno marcado como
  refugio candidato).
- Seis supervivientes visuales quietos, con ID estable
  (`person.initial.01`–`06`), nombre provisional y una diferencia visual de
  color.
- Selección con clic izquierdo de las seis personas, el refugio y los demás
  edificios, con indicador visual y panel en español (ID, tipo, nombre,
  descripción).
- Cámara estratégica cenital inclinada, controlada solo con ratón
  (desplazamiento con botón central, zoom con rueda, botón «Centrar
  cámara»), con límites de mapa y zoom.
- Reloj de simulación independiente de `Engine.time_scale`, con pausa y
  velocidades ×1, ×2, ×4 y ×10, iniciando en Día 1, 08:00.
- HUD mínimo en español con nombre del escenario, reloj, controles de
  velocidad, botón de centrar cámara, panel de selección, ayuda compacta y
  aviso de prototipo.
- Smoke test headless en `tests/smoke_test.gd` (ver validaciones ejecutadas
  o no ejecutadas más abajo).

No implementa trabajos, prioridades, designaciones, movimiento, estado,
ficha completa, exploración, recursos, agua, comida, defensa, zombis,
autonomía, aprendizaje, generación procedural, guardado ni carga: quedan
para las cuatro entregas posteriores de `RDM-001`.

## Documentación

- **Aprobada (`approved`)**: visión, pilares y horizonte máximo
  (`10-vision`, incluyendo `VIS-003`), escalas, exploración y mundo
  estratégico (`WLD-001`, `WLD-002`, `WLD-003`), modelo de personaje,
  aprendizaje, autonomía e historia vital (`CHR-001`, `CHR-002`, `CHR-003`,
  `CHR-004`), crecimiento, producción, recursos, transición tecnológica y
  red productiva del asentamiento (`SET-001` a `SET-005`), comunidad viva,
  política interna y comunidades externas (`SOC-001`, `SOC-002`, `SOC-003`),
  narrativa emergente y memoria causal (`NAR-001`, `NAR-002`), interacción,
  control y gestión a escala (`UI-001`, `UI-002`), amenaza zombi (`THR-001`),
  dirección técnica, generación procedural y simulación multiescala
  (`ARC-001`, `ARC-002`, `ARC-003`), escenario inicial (`SCN-001`), alcance
  del primer corte jugable (`RDM-001`), decisiones `DEC-0001` a `DEC-0006`,
  sistema documental (`DOC-001`).
- **Borrador (`draft`)**: síntesis de descubrimiento (`DISC-0001`,
  `DISC-0002`), taxonomía extendida de habilidades (`CHR-005`), horizonte
  configurable de amenazas (`THR-002`) y horizonte de capacidades a largo
  plazo (`RDM-002`).
- **Implementado (`implemented`)**: no se usa todavía en ningún documento de
  dominio. `IMPLEMENTATION-001` es una entrega de código, no un cambio de
  estado documental de `UI-001`, `SCN-001`, `ARC-002` ni del resto de
  `RDM-001`, que siguen siendo `approved` a la espera de sus entregas
  correspondientes.

## Validaciones automatizadas de `IMPLEMENTATION-001`

`godot --headless` no está disponible en el entorno donde se implementó esta
entrega: los comandos de la sección 13 del prompt (`godot --headless --path
. --editor --quit` y `godot --headless --path . --script
res://tests/smoke_test.gd`) quedan como **NOT RUN** por ausencia del motor.
No se instaló Godot para forzar su ejecución. `git diff --check` sí se
ejecutó y no informó errores.

## Bloqueos o contradicciones conocidos

Ninguno detectado en esta entrega, más allá de la imposibilidad de ejecutar
Godot en el entorno de implementación (ver sección anterior).

## Aceptación manual pendiente

La aceptación manual de `IMPLEMENTATION-001` (lista de pasos en
[README.md](../README.md)) está pendiente de que Dennis la ejecute. No se
declara superada por el agente que implementó la entrega.

## Próximo candidato de trabajo (no es un compromiso)

La siguiente entrega de implementación candidata es **«Trabajo y
personas»**, descrita en
[RDM-001](roadmap/RDM-001_first-playable-slice.md): prioridades,
designaciones, trabajos, movimiento, reservas, estado básico, ficha y
control puntual con ratón. No se ha iniciado y requerirá su propio prompt de
programación.
