# docs/ — Índice maestro

Este índice es el punto de entrada a la documentación de Z-World.
**No leas todo `docs/` por defecto.** Localiza el dominio y el identificador
que necesitas y lee solo eso y sus dependencias declaradas.

## Cómo está organizada la documentación

- Un índice maestro pequeño (este archivo).
- Un `INDEX.md` dentro de cada dominio, con sus documentos, estado y
  dependencias.
- Documentos canónicos centrados en una única responsabilidad, identificados
  con un prefijo estable (ver
  [DOC-001](00-governance/DOC-001_documentation-system.md)).
- `docs/decisions/` para decisiones ya cerradas y `docs/discovery/` para
  síntesis de ideas todavía no cerradas.

## Dominios

| Carpeta | Prefijo | Responsabilidad |
|---|---|---|
| [00-governance](00-governance/INDEX.md) | `DOC` | Cómo se organiza y mantiene la documentación. |
| [10-vision](10-vision/INDEX.md) | `VIS` | Visión del juego y pilares de diseño. |
| [20-world](20-world/INDEX.md) | `WLD` | Escalas del mundo (mapa local y estratégico). |
| [30-characters](30-characters/INDEX.md) | `CHR` | Modelo de personaje, habilidades y conocimiento. |
| [40-settlement](40-settlement/INDEX.md) | `SET` | Crecimiento del asentamiento y producción. |
| [50-society](50-society/INDEX.md) | `SOC` | Dinámica social, facciones y comunidades externas. |
| [60-threats](60-threats/INDEX.md) | `THR` | Amenazas: modelo de zombis y defensa. |
| [70-narrative](70-narrative/INDEX.md) | `NAR` | Narrativa procedural emergente. |
| [80-interface](80-interface/INDEX.md) | `UI` | Interfaz: interacción, prioridades, designaciones y control puntual. |
| [90-architecture](90-architecture/INDEX.md) | `ARC` | Dirección técnica, generación procedural y persistencia. |
| [scenarios](scenarios/INDEX.md) | `SCN` | Condiciones iniciales de partida. |
| [decisions](decisions/INDEX.md) | `DEC` | Decisiones ya cerradas. |
| [discovery](discovery/INDEX.md) | `DISC` | Síntesis de ideas todavía no cerradas. |
| [roadmap](roadmap/INDEX.md) | `RDM` | Alcance del primer corte jugable y secuencia de entregas. |

## Ruta de lectura recomendada según el cambio

- **Cambio de visión o pilares**: lee `10-vision/`.
- **Cambio de mundo/escalas**: lee `20-world/`, revisa relación con
  `40-settlement/` y `50-society/`.
- **Cambio de personajes/habilidades/conocimiento**: lee `30-characters/`.
- **Cambio de asentamiento/producción**: lee `40-settlement/`, revisa
  `30-characters/` para habilidades relevantes.
- **Cambio de sociedad/facciones**: lee `50-society/`.
- **Cambio de narrativa**: lee `70-narrative/`, revisa `scenarios/` si afecta
  al arranque de partida.
- **Cambio de interfaz/control/designaciones**: lee `80-interface/`, revisa
  `30-characters/` (autonomía y habilidades).
- **Cambio de amenazas**: lee `60-threats/`.
- **Cambio de alcance del primer corte jugable**: lee `roadmap/RDM-001`.
- **Cambio técnico/arquitectura**: lee `90-architecture/` y las decisiones en
  `decisions/`.
- **Cualquier cambio**: revisa `docs/OPEN-QUESTIONS.md` para no resolver en
  silencio una pregunta todavía abierta.

## Estados documentales

- `draft`: propuesta en definición; no autoriza implementación completa.
- `approved`: decisión funcional cerrada y canónica.
- `implemented`: además de aprobada, existe y está verificada en el juego.
- `deprecated`: sustituida; debe indicar su reemplazo.

Detalle completo en
[DOC-001](00-governance/DOC-001_documentation-system.md).

## Estado del proyecto

Ver [docs/STATUS.md](STATUS.md) para el estado real y actualizado. No
sustituye a las fuentes canónicas de cada dominio.
