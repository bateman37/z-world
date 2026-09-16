# Estado del proyecto

Este documento es breve y se actualiza en cada entrega que cambie el estado
real del proyecto. No sustituye a las fuentes canónicas: para reglas, consulta
[docs/INDEX.md](INDEX.md).

## Fase actual

Diseño y arquitectura documental. **No existe todavía ninguna implementación
del juego** (ni código, ni escenas de Godot, ni prototipos).

## Última entrega completada

`DOCS-001` — base documental e instrucciones permanentes para agentes.

## Tecnología aprobada

- Motor: Godot 4.
- Lenguaje inicial preferido: GDScript.
- Guardado local; sin PostgreSQL ni servicios online.

Detalle en [ARC-001](90-architecture/ARC-001_technical-direction.md).

## Funcionalidad realmente implementada

Ninguna. `implemented` no se usa todavía en ningún documento de este
repositorio.

## Documentación

- **Aprobada (`approved`)**: visión y pilares (`10-vision`), escalas del
  mundo (`WLD-001`), modelo de personaje y aprendizaje (`CHR-001`,
  `CHR-002`), crecimiento y producción del asentamiento (`SET-001`,
  `SET-002`), comunidad viva (`SOC-001`), narrativa emergente (`NAR-001`),
  dirección técnica (`ARC-001`), escenario inicial (`SCN-001`), decisiones
  `DEC-0001` a `DEC-0003`, sistema documental (`DOC-001`).
- **Borrador (`draft`)**: síntesis de descubrimiento (`DISC-0001`).
- **Sin documentos aprobados todavía**: amenazas (`60-threats`), interfaz
  (`80-interface`).

## Bloqueos o contradicciones conocidos

Ninguno detectado en esta entrega.

## Próximo candidato de trabajo (no es un compromiso)

Podría continuarse con el diseño detallado de amenazas (`60-threats`) o con
la primera decisión técnica sobre estructura de carpetas de un futuro
proyecto Godot. Esto no es una hoja de ruta comprometida.
