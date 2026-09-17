# Z-World — DOCS-002: español como idioma documental

## Contexto

Trabaja sobre la rama actual de la PR de documentación `DOCS-001`. No cambies de
rama ni crees una nueva.

La base documental se ha creado correctamente, pero la prosa de documentación,
instrucciones y changelog está en inglés. El idioma de trabajo y lectura del
propietario del proyecto es el español.

## Objetivo

Traducir al español toda la documentación e instrucciones redactadas para
personas, y establecer una regla permanente para que las futuras entregas no
vuelvan a crear prosa documental en inglés.

## Alcance

Traduce al español la prosa de todos los archivos de documentación existentes,
incluidos cuando existan:

- `README.md`.
- `AGENTS.md` y `CLAUDE.md`.
- Todo `docs/**/*.md`.
- Todo `prompts/**/*.md`, incluido `DOCS-001_foundation.md`.
- `CHANGELOG.md` o cualquier changelog Markdown presente.

Traduce títulos, subtítulos, explicaciones, tablas documentales, criterios,
estado descrito en prosa y comentarios destinados a lectura humana.

## Excepciones obligatorias: no traducir

Mantén exactamente igual, salvo que exista un error real:

- Rutas, nombres de archivos y enlaces Markdown.
- Identificadores estables: `DOC-001`, `WLD-001`, `SCN-001`, etc.
- Nombres de variables, clases, métodos, APIs, comandos, bloques de código y
  fragmentos JSON/YAML que sean contratos técnicos.
- Claves de YAML como `id`, `title`, `status`, `canonical_for`, `depends_on` y
  `related`.
- Valores controlados de estado: `draft`, `approved`, `implemented` y
  `deprecated`.
- Ejemplos de IDs de datos, como `skill.production.agriculture`.
- Términos técnicos en inglés cuando sean el nombre preciso de una tecnología,
  producto o contrato, por ejemplo Godot, GDScript, SQLite, JSON, GitHub,
  `game_data/`, `src/` o `tests/`.

No renombres archivos, carpetas ni identificadores solo para traducirlos. El
contenido humano debe leerse en español; los contratos técnicos deben conservar
estabilidad.

## Regla permanente de idioma

Actualiza el documento canónico de gobierno documental y las instrucciones de
agentes para que establezcan explícitamente:

> La prosa de documentación, README, changelogs, prompts, informes de entrega e
> instrucciones para agentes se redacta en español por defecto. Se mantienen en
> inglés los identificadores, rutas, código, nombres de variables, claves de
> datos, APIs y términos técnicos cuando traducirlos reduzca precisión o rompa
> un contrato.

Cuando un término técnico pueda expresarse cómodamente en español, prioriza una
frase natural en español y conserva el nombre técnico entre paréntesis solo si
aporta claridad.

## Fuera de alcance

No realices:

- Cambios de diseño funcional.
- Cambios de arquitectura.
- Código de juego, escenas de Godot, datos de juego ni pruebas de gameplay.
- Reestructuración documental o renombrado masivo de rutas.
- Cambios de estado de `draft` a `approved` o `implemented`.
- Traducción de contratos técnicos, código o IDs.

## Actualizaciones requeridas

1. Traduce el contenido humano de los archivos incluidos en alcance.
2. Añade la política de idioma a la fuente canónica apropiada dentro de
   `docs/00-governance/`.
3. Refleja la regla, de forma breve y sin duplicar toda la política, en
   `AGENTS.md` y `CLAUDE.md`.
4. Actualiza `docs/STATUS.md` para registrar `DOCS-002` como última entrega
   documental completada y mencionar la política de idioma.
5. Guarda este prompt como `prompts/DOCS-002_spanish-documentation.md` y añade
   su enlace a `prompts/INDEX.md` y, si corresponde, a `prompts/README.md`.

## Validación

Antes de terminar:

1. Revisa manualmente los índices, la visión, el escenario, decisiones,
   arquitectura y changelog para confirmar que su prosa está en español.
2. Verifica que los enlaces relativos siguen siendo válidos.
3. Verifica que no se han alterado rutas, IDs, claves YAML, comandos ni valores
   de estado controlados.
4. Ejecuta `git diff --check`.

No instales dependencias ni ejecutes suites de pruebas; esta entrega es solo
documental.

## Informe final

Devuelve un resumen conciso con:

1. Archivos traducidos.
2. Dónde quedó registrada la política permanente de idioma.
3. Excepciones técnicas preservadas.
4. Resultado de `git diff --check`.
