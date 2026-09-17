---
id: DOC-001
title: Sistema documental de Z-World
status: approved
canonical_for:
  - organización de la documentación
  - estados documentales
  - identificadores estables
  - cabecera de documentos canónicos
  - idioma de la documentación
depends_on: []
related: []
---

## 1. Propósito

Definir cómo se organiza, identifica y mantiene la documentación de Z-World
para que escale por dominios sin depender de un documento monolítico y sin
obligar a los agentes a leer todo el repositorio en cada entrega.

## 2. Principios que no deben romperse

- Cada regla funcional tiene una única fuente de verdad canónica.
- Los prompts históricos, `docs/discovery/` y los ejemplos no son fuentes
  canónicas: sintetizan o proponen, no fijan reglas.
- Ningún documento debe copiar reglas de otro; debe enlazarlas por ruta e
  identificador.
- La lectura de un dominio no exige leer el árbol documental completo.

## 3. Modelo funcional

### 3.1 Jerarquía

- Un índice maestro pequeño: `docs/INDEX.md`.
- Un índice por dominio: `docs/<dominio>/INDEX.md`.
- Documentos canónicos centrados en una única responsabilidad, identificados
  con un prefijo de dominio.
- Referencias explícitas (`depends_on`, `related`) entre documentos.

### 3.2 Tamaño controlado

- Evitar documentos gigantes. Revisar la división de un documento cuando se
  acerque a 300–500 líneas o mezcle responsabilidades independientes.
- Un índice orienta; no debe convertirse en un segundo GDD.
- Los ejemplos deben ser breves y estar marcados explícitamente como no
  normativos.

### 3.3 Estados documentales

| Estado | Significado |
|---|---|
| `draft` | Propuesta en definición. No autoriza implementación completa. |
| `approved` | Decisión funcional cerrada y canónica. |
| `implemented` | Además de aprobada, existe y está verificada en el juego. |
| `deprecated` | Sustituida; debe indicar su reemplazo. |

### 3.4 Identificadores estables

| Dominio | Prefijo |
|---|---|
| Gobierno documental | `DOC` |
| Visión | `VIS` |
| Mundo | `WLD` |
| Personajes | `CHR` |
| Asentamiento | `SET` |
| Sociedad | `SOC` |
| Amenazas | `THR` |
| Narrativa procedural | `NAR` |
| Interfaz | `UI` |
| Arquitectura técnica | `ARC` |
| Escenarios | `SCN` |
| Decisiones | `DEC` |
| Descubrimiento | `DISC` |

Los identificadores no se reutilizan aunque un documento quede obsoleto.

### 3.5 Cabecera común

Todo documento canónico comienza con una cabecera YAML:

```yaml
---
id: CHR-005
title: Aprendizaje y enseñanza
status: draft
canonical_for:
  - aprendizaje individual
  - enseñanza
depends_on:
  - CHR-003
  - CHR-004
related:
  - SOC-002
---
```

No se inventan dependencias para rellenar la cabecera; una lista puede quedar
vacía.

### 3.6 Estructura interna

Cuando aplique, los documentos canónicos usan estas secciones, sin añadir
secciones vacías solo por plantilla:

1. Propósito.
2. Principios que no deben romperse.
3. Modelo funcional.
4. Reglas aprobadas.
5. Interacciones con otros sistemas.
6. Casos límite o riesgos.
7. Preguntas abiertas.
8. Ejemplos no normativos.

### 3.7 Idioma de la documentación

La prosa de documentación, `README.md`, changelogs, prompts, informes de
entrega e instrucciones para agentes se redacta en español por defecto. Se
mantienen en su forma original (normalmente en inglés) los identificadores,
rutas, código, nombres de variables, claves de datos, APIs y términos
técnicos cuando traducirlos reduzca precisión o rompa un contrato, por
ejemplo:

- Rutas, nombres de archivo y enlaces Markdown.
- Identificadores estables (`DOC-001`, `WLD-001`, `SCN-001`, etc.).
- Nombres de variables, clases, métodos, APIs, comandos, bloques de código y
  fragmentos JSON/YAML que sean contratos técnicos.
- Claves de YAML como `id`, `title`, `status`, `canonical_for`, `depends_on`
  y `related`.
- Valores controlados de estado: `draft`, `approved`, `implemented` y
  `deprecated`.
- Ejemplos de IDs de datos, como `skill.production.agriculture`.
- Términos técnicos en inglés cuando sean el nombre preciso de una
  tecnología, producto o contrato (por ejemplo Godot, GDScript, SQLite,
  JSON, GitHub, `game_data/`, `src/` o `tests/`).

Cuando un término técnico pueda expresarse cómodamente en español, se
prioriza una frase natural en español y se conserva el nombre técnico entre
paréntesis solo si aporta claridad.

### 3.8 Decisiones frente a descubrimiento

- `docs/discovery/`: síntesis de conversaciones, alternativas e ideas todavía
  no cerradas.
- `docs/decisions/`: decisiones relevantes ya adoptadas, su motivo y
  consecuencias.
- Los documentos canónicos por dominio contienen las reglas vigentes.
- Las conversaciones completas no se copian al repositorio; se sintetizan.

## 4. Reglas aprobadas

- Todo documento canónico debe llevar cabecera YAML y estado.
- Ningún documento puede marcarse `implemented` sin verificación real en el
  juego.
- Los prompts se guardan como Markdown en `prompts/` (ver
  `prompts/README.md`).
- Toda prosa dirigida a personas se redacta en español por defecto, con las
  excepciones técnicas descritas en la sección 3.7.

## 5. Preguntas abiertas

Ninguna en esta entrega.
