# Estado del proyecto

Este documento es breve y se actualiza en cada entrega que cambie el estado
real del proyecto. No sustituye a las fuentes canónicas: para reglas, consulta
[docs/INDEX.md](INDEX.md).

## Fase actual

Diseño y arquitectura documental. **No existe todavía ninguna implementación
del juego** (ni código, ni escenas de Godot, ni prototipos).

## Última entrega completada

`DESIGN-002` está completado documentalmente: registra el horizonte máximo
conocido de Z-World (mundo estratégico, historia vital de las personas,
transición tecnológica, red productiva, política interna, comunidades
externas, memoria e historia causal, gestión a escala y simulación
multiescala) como dirección de largo plazo, **sin ampliar el primer corte
jugable ni encargar código**. Ver
[VIS-003](10-vision/VIS-003_maximum-design-envelope.md) para el horizonte
completo y
[DEC-0006](decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md) para
la separación entre horizonte máximo, alcance de entrega y estado
implementado. `RDM-001` no cambia: sigue siendo la única fuente del alcance
real de la primera implementación.

Entrega previa: `DESIGN-001` — especificación funcional cerrada de cómo se
juega minuto a minuto en el mapa local y alcance exacto del primer corte
jugable. Ver
[RDM-001](roadmap/RDM-001_first-playable-slice.md).

## Tecnología aprobada

- Motor: Godot 4.
- Lenguaje inicial preferido: GDScript.
- Guardado local; sin PostgreSQL ni servicios online.

Detalle en [ARC-001](90-architecture/ARC-001_technical-direction.md).

## Funcionalidad realmente implementada

Ninguna. No existe implementación de juego, escenas de Godot, prototipos ni
pruebas ejecutables. `implemented` no se usa todavía en ningún documento de
este repositorio.

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

## Bloqueos o contradicciones conocidos

Ninguno detectado en esta entrega.

## Próximo candidato de trabajo (no es un compromiso)

La primera entrega de implementación candidata es el **vertical slice
visual** descrito en [RDM-001](roadmap/RDM-001_first-playable-slice.md):
proyecto Godot, cámara, selección, mapa local mínimo, seis personas visibles
y reloj/velocidades. Requerirá su propio prompt de programación; esta
entrega documental no lo redacta ni es un compromiso de fecha.
