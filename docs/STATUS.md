# Estado del proyecto

Este documento es breve y se actualiza en cada entrega que cambie el estado
real del proyecto. No sustituye a las fuentes canónicas: para reglas, consulta
[docs/INDEX.md](INDEX.md).

## Fase actual

Diseño y arquitectura documental. **No existe todavía ninguna implementación
del juego** (ni código, ni escenas de Godot, ni prototipos).

## Última entrega completada

`DESIGN-001` está completado documentalmente: cierra la especificación
funcional de cómo se juega minuto a minuto en el mapa local (interacción,
autonomía, exploración, recursos, amenazas, tiempo y persistencia) y define
la primera versión visual **como alcance de roadmap, no como algo creado**.
Ver [RDM-001](roadmap/RDM-001_first-playable-slice.md) para el alcance
exacto y la secuencia de entregas de implementación futuras.

Entrega previa: `DOCS-002` — español como idioma documental por defecto (ver
[DOC-001, sección 3.7](00-governance/DOC-001_documentation-system.md)).

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

- **Aprobada (`approved`)**: visión y pilares (`10-vision`), escalas y
  exploración del mundo (`WLD-001`, `WLD-002`), modelo de personaje,
  aprendizaje y autonomía (`CHR-001`, `CHR-002`, `CHR-003`), crecimiento,
  producción y recursos del asentamiento (`SET-001`, `SET-002`, `SET-003`),
  comunidad viva (`SOC-001`), narrativa emergente (`NAR-001`), interacción y
  control (`UI-001`), amenaza zombi (`THR-001`), dirección técnica y
  generación procedural (`ARC-001`, `ARC-002`), escenario inicial
  (`SCN-001`), alcance del primer corte jugable (`RDM-001`), decisiones
  `DEC-0001` a `DEC-0005`, sistema documental (`DOC-001`).
- **Borrador (`draft`)**: síntesis de descubrimiento (`DISC-0001`,
  `DISC-0002`).

## Bloqueos o contradicciones conocidos

Ninguno detectado en esta entrega.

## Próximo candidato de trabajo (no es un compromiso)

La primera entrega de implementación candidata es el **vertical slice
visual** descrito en [RDM-001](roadmap/RDM-001_first-playable-slice.md):
proyecto Godot, cámara, selección, mapa local mínimo, seis personas visibles
y reloj/velocidades. Requerirá su propio prompt de programación; esta
entrega documental no lo redacta ni es un compromiso de fecha.
