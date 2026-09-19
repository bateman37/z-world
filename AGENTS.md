# Instrucciones permanentes para agentes

Estas instrucciones aplican a Claude Code, Codex y cualquier otro agente que
trabaje en este repositorio.

## Punto de entrada

- `docs/INDEX.md` es el punto de entrada documental. Empieza siempre ahí.
- `docs/STATUS.md` describe el estado actual del proyecto, pero no sustituye a
  las fuentes canónicas de cada dominio.

## Qué leer antes de cambiar algo

- No leas todo `docs/` por defecto.
- Antes de modificar un sistema, lee: el `INDEX.md` del dominio afectado, los
  documentos canónicos que ese índice señale como relevantes, y las
  dependencias (`depends_on` / `related`) expresamente citadas en su cabecera.
- Busca por identificador (`DOC-`, `VIS-`, `WLD-`, `CHR-`, `SET-`, `SOC-`,
  `THR-`, `NAR-`, `UI-`, `ARC-`, `SCN-`, `DEC-`, `DISC-`, `RDM-`, `CAT-`) con
  una herramienta de búsqueda textual antes de ampliar el contexto a otros
  documentos.

## Reglas de edición

- Toda prosa dirigida a personas (documentación, `README.md`, changelogs,
  prompts, informes de entrega e instrucciones para agentes) se redacta en
  español por defecto; identificadores, rutas, código y contratos técnicos
  conservan su forma original (ver
  `docs/00-governance/DOC-001_documentation-system.md`, sección 3.7).
- No dupliques reglas canónicas en prompts, código u otros documentos. Enlaza
  por ruta e identificador.
- Distingue siempre `draft`, `approved`, `implemented` y `deprecated`
  (ver `docs/00-governance/DOC-001_documentation-system.md`).
- Nunca implementes una pregunta abierta (`docs/OPEN-QUESTIONS.md`) como si
  fuese una decisión cerrada.
- Los cambios arquitectónicos relevantes requieren una decisión nueva en
  `docs/decisions/`.
- Toda entrega que cambie el estado real del proyecto debe actualizar los
  documentos afectados y `docs/STATUS.md`.
- Los datos de contenido futuros usarán identificadores estables y contratos
  validables (ver `docs/90-architecture/ARC-001_technical-direction.md`).
- Todos los prompts, pasados y futuros, se guardan como Markdown en
  `prompts/` (ver `prompts/README.md`).

## Ejecución del trabajo

- Las pruebas deben acotarse al cambio realizado; no ejecutes suites globales
  sin una necesidad concreta.
- Inspecciona el código y los datos reales antes de asumir su estructura.
- Preserva los cambios ajenos y evita reescrituras masivas no solicitadas.
- Si detectas una contradicción entre documentos canónicos, detén esa parte de
  la implementación, señálala explícitamente y no elijas en silencio una de
  las versiones.
