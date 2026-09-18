# Estado del proyecto

Este documento es breve y se actualiza en cada entrega que cambie el estado
real del proyecto. No sustituye a las fuentes canónicas: para reglas, consulta
[docs/INDEX.md](INDEX.md).

## Fase actual

Segunda implementación de código ejecutable: **trabajo y personas**
(`IMPLEMENTATION-002`), segunda de las cinco entregas fijadas en
[RDM-001](roadmap/RDM-001_first-playable-slice.md). La primera entrega
(`IMPLEMENTATION-001`) fue **aceptada manualmente por Dennis el 18 de
septiembre de 2026**. La aceptación manual de `IMPLEMENTATION-002` sigue
**pendiente** de que Dennis la ejecute (ver [README.md](../README.md)).

## Última entrega completada

`IMPLEMENTATION-002` — trabajo y personas: estado de trabajo por persona
(diez prioridades y once habilidades), ocho objetivos de trabajo
demostradores en el mapa (cuatro pilas de escombros y cuatro puntos de
reconocimiento), tablón de trabajos con reservas de objetivo y selector
determinista, navegación 3D generada en código con `NavigationAgent3D`,
ejecución de trabajo con progreso visible, menú contextual de clic derecho
para órdenes puntuales y paneles de «Prioridades», «Trabajos» y ficha de
persona. No implementa necesidades, recursos, inventarios, interiores,
exploración funcional, aprendizaje, autonomía, zombis, generación procedural
ni guardado. Técnicamente implementado; **aceptación manual pendiente**.

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
- Ocho objetivos de trabajo demostradores en el mapa: cuatro pilas de
  escombros («Despejar escombros», `build_repair`,
  `construction_carpentry >= 2`, 8 s a ×1) y cuatro puntos de
  reconocimiento («Reconocer punto», `explore_recon`,
  `observation_inspection >= 2`, 6 s a ×1), seleccionables y designables.
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
  número, color y tooltip) y «Trabajos» (activos y últimos completados), y
  ficha de persona ampliada con estado, actividad, motivo, progreso y las
  once habilidades.
- Smoke test headless en `tests/smoke_test.gd` (ver validaciones ejecutadas
  o no ejecutadas más abajo).

No implementa necesidades, hambre, sed, cansancio, salud, inventarios,
objetos, almacenes, recursos, interiores, inspección de edificios, agua,
comida, construcción real, aprendizaje, autonomía, iniciativas, zonas,
zombis, combate, generación procedural, guardado ni carga: quedan para las
tres entregas posteriores de `RDM-001`.

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
  dominio. `IMPLEMENTATION-001` e `IMPLEMENTATION-002` son entregas de
  código, no un cambio de estado documental de `UI-001`, `CHR-001`,
  `CHR-003`, `SCN-001`, `ARC-002` ni del resto de `RDM-001`, que siguen
  siendo `approved` a la espera de sus entregas correspondientes: esta
  entrega implementa solo el subconjunto de trabajo y personas descrito en
  su prompt.

## Validaciones automatizadas de `IMPLEMENTATION-002`

`godot --headless` tampoco está disponible en el entorno donde se implementó
esta entrega: los dos comandos de la sección 16 del prompt (`godot
--headless --path . --editor --quit` y `godot --headless --path . --script
res://tests/smoke_test.gd`) quedan como **NOT RUN** por ausencia del motor.
No se instaló Godot para forzar su ejecución. `git diff --check` sí se
ejecutó y no informó errores. El smoke test conserva las siete
comprobaciones de `IMPLEMENTATION-001` y añade cinco: estados de persona con
diez prioridades y once habilidades, límites `0–4` de las prioridades, un
solo trabajo y una sola reserva por objetivo, preferencia del selector por
prioridad `4` y exclusión por habilidad mínima, y pausa/×10 sin doble
finalización.

Las mismas validaciones de `IMPLEMENTATION-001` quedaron en su momento como
**NOT RUN** por la misma razón.

## Bloqueos o contradicciones conocidos

Ninguno detectado en esta entrega, más allá de la imposibilidad de ejecutar
Godot en el entorno de implementación (ver sección anterior).

## Aceptación manual pendiente

`IMPLEMENTATION-001` fue aceptada manualmente por Dennis el 18 de septiembre
de 2026. La aceptación manual de `IMPLEMENTATION-002` (lista de catorce
pasos en [README.md](../README.md)) está pendiente de que Dennis la
ejecute. No se declara superada por el agente que implementó la entrega.

## Próximo candidato de trabajo (no es un compromiso)

La siguiente entrega de implementación candidata es **«Exploración y
subsistencia»**, descrita en
[RDM-001](roadmap/RDM-001_first-playable-slice.md): estado de información,
edificios, recursos, transporte, almacén, descanso, agua y alimento
alternativo. No se ha iniciado y requerirá su propio prompt de
programación.
