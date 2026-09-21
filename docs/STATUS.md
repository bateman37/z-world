# Estado del proyecto

Este documento es breve y se actualiza en cada entrega que cambie el estado
real del proyecto. No sustituye a las fuentes canónicas: para reglas, consulta
[docs/INDEX.md](INDEX.md).

## Fase actual

Cuarta implementación de código ejecutable: **defensa y vida propia**
(`IMPLEMENTATION-004`), cuarta de las cinco entregas fijadas en
[RDM-001](roadmap/RDM-001_first-playable-slice.md). `IMPLEMENTATION-001` fue
**aceptada manualmente por Dennis el 18 de septiembre de 2026**. La
aceptación manual de `IMPLEMENTATION-003` e `IMPLEMENTATION-004` (listas en
[README.md](../README.md)) sigue **pendiente** de que Dennis las ejecute.
`DESIGN-003`, fusionada entre las implementaciones 003 y 004, es solo
documentación de horizonte máximo: no cambió el juego ejecutable ni amplió
`RDM-001`.

## Última entrega documental completada

Consolidación documental del **motor de acciones/trabajos/eventos**, el
**catálogo de horizonte máximo de personaje** (nueve características, 34
habilidades, potencial oculto, calibre oculto y adaptación al apocalipsis)
y los **objetos del mundo, familias logísticas y desmontaje** (21 de
septiembre de 2026): seis documentos nuevos —
[ARC-004](90-architecture/ARC-004_action-and-event-resolution-model.md),
[ARC-005](90-architecture/ARC-005_teamwork-orders-modes-and-conditions.md),
[ARC-006](90-architecture/ARC-006_outcomes-knowledge-events-and-validation.md)
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
[SET-007](40-settlement/SET-007_object-model-and-logistics-families.md) y
[SET-008](40-settlement/SET-008_disassembly-and-world-transformation.md)
(`draft`, modelo de objeto, 12 familias logísticas de horizonte máximo,
flujo de desmontaje en nueve pasos y 20 decisiones cerradas) — respaldados
por [DEC-0008](decisions/DEC-0008_character-catalog-and-resolution-engine-domain.md).
[CHR-005](30-characters/CHR-005_extended-skill-taxonomy.md) queda
`deprecated`, sustituido por `CHR-006`, conservado como antecedente. No
cambia el juego ejecutable: no se tocó código, escenas, `game_data/` ni
`tests/`, y no se amplió `RDM-001`. Los nueve recursos agregados de
`SET-003` y las once habilidades del primer corte de `CHR-001` §3.1 siguen
siendo el alcance realmente implementado; su migración hacia estos
catálogos de horizonte máximo queda pendiente, sin fecha, igual que la ya
reconocida entre las diez familias de prioridad y las 34 de `UI-003`.

Entrega previa: `DESIGN-003` — trabajo, recuperación y conocimiento
aplicado: horizonte máximo documental de prioridades, órdenes, zonas,
políticas, eventos y trabajos (nueve bloques y 34 prioridades con escala
`Nunca/1–5`, `UI-003`); presentación cualitativa de capacidad sin números
internos (`UI-004`); inspección, saqueo, reconocimiento experto y
revisitas dependientes de la persona con contenido base estable
(`WLD-004`); fuentes de conocimiento físicas, humanas y digitales, estados
comunitarios de un fragmento y capacidad real (`SET-006`); y la decisión
transversal que respalda las 34 prioridades separadas de habilidad y del
alcance implementado (`DEC-0007`). Los cinco documentos son `approved`. No
cambió el juego ejecutable ni se amplió `RDM-001`. Ver
[UI-003](80-interface/UI-003_work-priority-taxonomy.md),
[UI-004](80-interface/UI-004_qualitative-capability-presentation.md),
[WLD-004](20-world/WLD-004_expertise-dependent-recovery.md),
[SET-006](40-settlement/SET-006_knowledge-assets-and-capability.md) y
[DEC-0007](decisions/DEC-0007_layered-work-and-priorities.md).

## Última entrega de código

`IMPLEMENTATION-004` — defensa y vida propia: zonas territoriales
(habitual/precaución/prohibida) con rejilla de 2 m, herramienta de pintura
con arrastre y bloqueo de trabajos y rutas por «Zona prohibida»; cuatro
puntos de defensa fijos del refugio (puerta sur, dos ventanas, hueco norte
del perímetro) con estados abierto/intacto/dañado/destruido, coste,
reparación y bloqueo de sector; cinco zombis lentos de población fija con
estados `idle`/`investigating_noise`/`pursuing`/`attacking_defense`/
`attacking_person`/`dead`, visión, memoria de ruido y de objetivo perdido;
servicio de ruido causal con diez causas y radios distintos, emitido una
sola vez al empezar la fase «act»; salud de persona (`0–100`, sana/herida/
crítica/fallecida) y reglas de baja; dos puestos de guardia con detección,
enganche y desenganche automáticos; combate cuerpo a cuerpo por clic
derecho con intervalos de golpe basados en tiempo simulado; retirada
ordenada y automática al punto de reunión; indicador de amenaza (tranquila/
alerta/contacto) y panel de sucesos acotado a 50 entradas; aprendizaje
observable limitado a pesca (mínimo bajado a `fishing >= 1`) y remiendo
(nuevo recurso «prendas dañadas» y acción «Remendar una prenda»); una
iniciativa autónoma causal (reparar una defensa dañada al 50 % o menos) y
una transgresión de zona acotada a `person.initial.02` en su puesto de
guardia. No migra a las 34 prioridades de `DESIGN-003`, no implementa
generación procedural ni guardado, y conserva las diez familias y once
habilidades existentes con su escala `0–4`. Técnicamente implementada;
**aceptación manual pendiente**.

Entrega previa: `IMPLEMENTATION-003` — exploración y subsistencia:
información de lugares con los cinco niveles de `WLD-002` y acciones de
observar, inspeccionar y registrar; sustitución de los ocho objetivos
demostradores por ocho lugares reales (tres edificios explorables y cinco
lugares del terreno); catálogo de diez tipos de recurso con pilas
localizadas y seis estados logísticos; pertenencias de llegada; almacén de
capacidad 50 y depósito de agua de capacidad 12 con transporte en lotes de
hasta 5; necesidades de hidratación, alimentación y descanso con acciones
automáticas y cadena de supervivencia; alimento por registro, pesca y
hongos; agua por acarreo y por conducción de gravedad; deterioro del
alimento fresco y secado; ejecución de trabajo por fases dentro del mismo
tablón; franja de almacenados, panel «Recursos», acciones por lugar y ficha
de persona con necesidades y carga. **Aceptación manual pendiente.**

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

Heredado de `IMPLEMENTATION-001`, `002` y `003` (proyecto Godot, mapa local
fijo, seis supervivientes, cámara, reloj y velocidades, prioridades,
designaciones, tablón de trabajos con navegación, lugares reales,
recursos, almacén, necesidades, agua, alimento y conservación); ver los
detalles ya registrados en las entregas previas de esta sección más abajo.
Añadido por `IMPLEMENTATION-004`:

- Zonas territoriales: rejilla de 2 m con estados `habitual`/`caution`/
  `forbidden`, rectángulo habitual inicial alrededor del asentamiento,
  herramienta «Zonas» con pintura por arrastre, superposición visual con
  `MultiMesh` y bloqueo de trabajos y rutas físicas por «Zona prohibida»
  (muestreo cada 1 m), incluida la salida garantizada desde una celda
  recién prohibida.
- Cuatro puntos de defensa fijos del refugio (puerta sur, dos ventanas,
  hueco norte del perímetro) con estados abierto/intacto/dañado/destruido,
  coste y duración propios, reparación con 1 material de reparación,
  bloqueo del sector correspondiente a los zombis que se acercan al
  asentamiento y panel con estado, durabilidad, sector, trabajo activo y
  bloqueo.
- Cinco zombis lentos de población fija (`zombie.local.01`–`05`) con
  velocidad, salud, alcance y daño provisionales, estados lógicos
  (`idle`, `investigating_noise`, `pursuing`, `attacking_defense`,
  `attacking_person`, `dead`), visión de 8 m, memoria de ruido de 15 s y de
  objetivo perdido de 10 s, y desempate estable por ID.
- Servicio de ruido causal con diez causas y radios de la sección 8 del
  prompt, emitido una sola vez al empezar la fase «act» de cada trabajo (o
  por cada impacto), con aro visual de 1,5 s y agrupado de 5 s solo en la
  presentación de sucesos.
- Salud de persona (`0–100`, etiquetas Sana/Herida/Crítica/Fallecida) y
  reglas de baja: interrumpe movimiento/combate/trabajo, libera reservas,
  deja la carga en el sitio y excluye a la persona de nuevas asignaciones
  sin borrarla de la partida.
- Dos puestos de guardia (`guard.post.south`, `guard.post.east`) con el
  trabajo continuo «Vigilar acceso» (`guard_defense`), detección a 14 m,
  enganche automático a 8 m y desenganche por encima de 10 m.
- Combate cuerpo a cuerpo por clic derecho («Atacar cuerpo a cuerpo») con
  intervalos de golpe por tiempo simulado, sin puntería manual ni modo de
  acción separado; las personas sin guardia se retiran de un zombi cercano
  en vez de buscar combate.
- Retirada ordenada («Retirarse al refugio», botón persistente en la ficha)
  y automática por salud crítica o varios zombis cercanos, hacia
  `RALLY_POINT`, con prioridad de supervivencia y conservación de progreso.
- Indicador de amenaza (tranquila/alerta/contacto) con margen de 10 s tras
  perder el contacto, y panel «Sucesos» con las doce entradas más recientes
  (máximo 50 en memoria), con día y hora del reloj.
- Aprendizaje observable limitado a `fishing` (mínimo bajado a `>= 1` para
  principiantes, duración según nivel) y `mending_sewing` (nuevo recurso
  `damaged_clothing`, cuatro unidades materializadas al inspeccionar el
  refugio, acción «Remendar una prenda» que produce `cloth` con la
  condición de la tabla del prompt), con contador de práctica y subida de
  nivel exactamente al alcanzar el umbral.
- Una iniciativa autónoma causal (reparar una defensa dañada al 50 % o
  menos, evaluada solo al cruzar ese umbral) y una transgresión de zona
  acotada a `person.initial.02` desde un puesto de guardia, ambas con causa
  y mensaje en español registrados en la ficha y en «Sucesos».
- Smoke test headless ampliado con cuatro pruebas nuevas (zonas, defensa,
  ruido, aprendizaje); ver «Validaciones automatizadas» más abajo.

No implementa las 34 prioridades ni la escala `Nunca/1–5` de `DESIGN-003`,
generación procedural, semillas, guardado ni carga (quedan para
`IMPLEMENTATION-005`), mapa estratégico, construcción libre, armas de
fuego, infección, medicina, relaciones persistentes, ni ningún otro
elemento listado como fuera de alcance en el prompt de la entrega.

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
  (`THR-001`), dirección técnica, generación procedural, simulación
  multiescala y catálogo de nueve características/34 habilidades
  (`ARC-001`, `ARC-002`, `ARC-003`, `CHR-006`), escenario inicial
  (`SCN-001`), alcance del primer corte jugable (`RDM-001`), decisiones
  `DEC-0001` a `DEC-0008`, sistema documental (`DOC-001`).
- **Borrador (`draft`)**: síntesis de descubrimiento (`DISC-0001`,
  `DISC-0002`), horizonte configurable de amenazas (`THR-002`), horizonte de
  capacidades a largo plazo (`RDM-002`), motor de resolución de acciones,
  trabajos y eventos (`ARC-004`, `ARC-005`, `ARC-006`), potencial oculto,
  calibre oculto y adaptación al apocalipsis (`CHR-007`), y modelo de
  objeto, familias logísticas y desmontaje del mundo (`SET-007`,
  `SET-008`).
- **Sustituido (`deprecated`)**: taxonomía extendida de habilidades
  (`CHR-005`), sustituida por `CHR-006`.
- **Implementado (`implemented`)**: no se usa todavía en ningún documento de
  dominio. `IMPLEMENTATION-001` a `IMPLEMENTATION-004` son entregas de
  código, no un cambio de estado documental de `WLD-002`, `SET-003`,
  `CHR-001`, `UI-001`, `CHR-003`, `SCN-001`, `ARC-002`, `THR-001` ni del
  resto de `RDM-001`, que siguen siendo `approved` a la espera de sus
  entregas correspondientes: esta entrega implementa solo el subconjunto de
  defensa y vida propia descrito en su prompt. El motor de resolución
  documentado en `ARC-004`–`ARC-006` tampoco está implementado: el juego
  ejecutable sigue resolviendo trabajos con la lógica ya descrita en las
  entregas de código anteriores de esta misma sección.

## Validaciones automatizadas de `IMPLEMENTATION-004`

`godot --headless` tampoco está disponible en el entorno donde se
implementó esta entrega: los dos comandos del prompt (`godot --headless
--path . --editor --quit` y `godot --headless --path . --script
res://tests/smoke_test.gd`) quedan como **NOT RUN** por ausencia del motor.
No se instaló Godot para forzar su ejecución. `git diff --check` sí se
ejecutó y no informó errores.

El smoke test conserva las comprobaciones de `IMPLEMENTATION-001`, `002` y
`003` que siguen siendo válidas y añade cuatro:

1. Preset inicial de zonas, pintura de una celda, ruta muestreada que cruza
   «prohibida» rechazada y salida garantizada desde dentro de una zona
   prohibida.
2. Reservar y completar una construcción de defensa consume su coste
   exactamente una vez; daño y reparación respetan `0…máximo`; repetir no
   duplica ni vuelve a consumir.
3. Una emisión de ruido selecciona un zombi dentro del radio y no uno
   fuera; el agrupado de sucesos no repite la misma causa dentro de su
   ventana y vuelve a registrar pasada esa ventana.
4. Dos resultados útiles suben de nivel 1 a 2; el remiendo transforma una
   prenda dañada en una unidad de tela con la condición correcta sin
   cambiar el total de unidades.

Las validaciones de `IMPLEMENTATION-001`, `002` y `003` quedaron en su
momento como **NOT RUN** por la misma razón.

## Bloqueos o contradicciones conocidos

Ninguno detectado en esta entrega, más allá de la imposibilidad de ejecutar
Godot en el entorno de implementación (ver sección anterior). Las
posiciones exactas de los cuatro puntos de defensa, los dos puestos de
guardia y los cinco zombis se tomaron literalmente del prompt; no se pudo
confirmar visualmente en el editor que caigan sobre la malla de navegación
real por la misma ausencia de Godot, aunque el cálculo de distancias a las
montañas del mapa no sugiere solapamiento.

## Aceptación manual pendiente

`IMPLEMENTATION-001` fue aceptada manualmente por Dennis el 18 de septiembre
de 2026. La aceptación manual de `IMPLEMENTATION-003` y de
`IMPLEMENTATION-004` (listas en [README.md](../README.md)) está pendiente
de que Dennis las ejecute. No se declaran superadas por el agente que
implementó las entregas. La lista de aceptación de `IMPLEMENTATION-002`
queda absorbida por la de `IMPLEMENTATION-003`: sus objetivos demostradores
ya no existen.

## Próximo candidato de trabajo (no es un compromiso)

La siguiente entrega de implementación candidata es **«Persistencia y
prueba integrada»** (`IMPLEMENTATION-005`), descrita en
[RDM-001](roadmap/RDM-001_first-playable-slice.md): generación reproducible,
guardado, carga y los casos manuales de aceptación del primer corte
completo. No se ha iniciado y requerirá su propio prompt de programación.
