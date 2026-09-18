# Estado del proyecto

Este documento es breve y se actualiza en cada entrega que cambie el estado
real del proyecto. No sustituye a las fuentes canónicas: para reglas, consulta
[docs/INDEX.md](INDEX.md).

## Fase actual

Tercera implementación de código ejecutable: **exploración y subsistencia**
(`IMPLEMENTATION-003`), tercera de las cinco entregas fijadas en
[RDM-001](roadmap/RDM-001_first-playable-slice.md). La primera entrega
(`IMPLEMENTATION-001`) fue **aceptada manualmente por Dennis el 18 de
septiembre de 2026**. La aceptación manual de `IMPLEMENTATION-003` sigue
**pendiente** de que Dennis la ejecute (ver [README.md](../README.md)); esta
entrega documental (`DESIGN-003`) no la declara superada ni cambia el juego
ejecutable.

## Última entrega documental completada

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

## Última entrega de código

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
  la persona (`WLD-004`), modelo de personaje, aprendizaje, autonomía e
  historia vital (`CHR-001`, `CHR-002`, `CHR-003`, `CHR-004`), crecimiento,
  producción, recursos, transición tecnológica, red productiva y activos de
  conocimiento del asentamiento (`SET-001` a `SET-006`), comunidad viva,
  política interna y comunidades externas (`SOC-001`, `SOC-002`, `SOC-003`),
  narrativa emergente y memoria causal (`NAR-001`, `NAR-002`), interacción,
  control, gestión a escala, taxonomía de trabajo y presentación cualitativa
  de capacidad (`UI-001`, `UI-002`, `UI-003`, `UI-004`), amenaza zombi
  (`THR-001`), dirección técnica, generación procedural y simulación
  multiescala (`ARC-001`, `ARC-002`, `ARC-003`), escenario inicial
  (`SCN-001`), alcance del primer corte jugable (`RDM-001`), decisiones
  `DEC-0001` a `DEC-0007`, sistema documental (`DOC-001`).
- **Borrador (`draft`)**: síntesis de descubrimiento (`DISC-0001`,
  `DISC-0002`), taxonomía extendida de habilidades (`CHR-005`), horizonte
  configurable de amenazas (`THR-002`) y horizonte de capacidades a largo
  plazo (`RDM-002`).
- **Implementado (`implemented`)**: no se usa todavía en ningún documento de
  dominio. `IMPLEMENTATION-001`, `IMPLEMENTATION-002` e
  `IMPLEMENTATION-003` son entregas de código, no un cambio de estado
  documental de `WLD-002`, `SET-003`, `CHR-001`, `UI-001`, `CHR-003`,
  `SCN-001`, `ARC-002` ni del resto de `RDM-001`, que siguen siendo
  `approved` a la espera de sus entregas correspondientes: esta entrega
  implementa solo el subconjunto de exploración y subsistencia descrito en
  su prompt.

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

## Bloqueos o contradicciones conocidos

Ninguno detectado en esta entrega, más allá de la imposibilidad de ejecutar
Godot en el entorno de implementación (ver sección anterior).

## Aceptación manual pendiente

`IMPLEMENTATION-001` fue aceptada manualmente por Dennis el 18 de septiembre
de 2026. La aceptación manual de `IMPLEMENTATION-003` (lista de dieciocho
pasos en [README.md](../README.md)) está pendiente de que Dennis la
ejecute. No se declara superada por el agente que implementó la entrega.
La lista de aceptación de `IMPLEMENTATION-002` queda absorbida por esta: sus
objetivos demostradores ya no existen.

## Próximo candidato de trabajo (no es un compromiso)

La siguiente entrega de implementación candidata es **«Defensa y vida
propia»**, descrita en
[RDM-001](roadmap/RDM-001_first-playable-slice.md): cierre de accesos,
zombis elementales, ruido, guardia, retirada, aprendizaje e iniciativa
autónoma acotada. No se ha iniciado y requerirá su propio prompt de
programación.
