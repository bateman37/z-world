# catalogs — Catálogos

## Responsabilidad

Conserva catálogos máximos de contenido (lugares, estancias, instalaciones,
ocupantes, profesiones, aficiones y rasgos) como horizonte de referencia y
expansión, distinguidos siempre de las reglas funcionales que gobiernan cómo
se genera y se usa ese contenido (que viven en `docs/20-world/` y
`docs/40-settlement/`) y del subconjunto realmente implementado (que vive en
`docs/STATUS.md`).

## Qué pertenece aquí

- Listas máximas de IDs y nombres de lugares, estancias, instalaciones,
  ocupantes, profesiones, aficiones y rasgos.
- Propuestas `draft` de subconjuntos iniciales implementables.

## Qué no pertenece aquí

- Reglas de generación procedural, semántica o de saqueo: viven en
  `docs/20-world/WLD-005`, `WLD-006` y `WLD-007`.
- Reglas de explotación física del edificio (capas, vidas, desmontaje,
  demolición): vive en `docs/40-settlement/SET-007`.
- Modelo conceptual de datos (`Building`, `Room`, etc.): vive en
  `docs/90-architecture/ARC-005`.
- Contenido realmente implementado en el juego ejecutable: se declara en
  `docs/STATUS.md`, nunca aquí.

## Documentos

| ID | Estado | Propósito |
|---|---|---|
| [CAT-001](CAT-001_maximum-place-catalog.md) | `approved` (horizonte) | Catálogo máximo de lugares: 22 familias A–V y todos sus IDs. |
| [CAT-002](CAT-002_rooms-modules-and-building-systems.md) | `approved` (horizonte) | Módulos funcionales, catálogo máximo de estancias, instalaciones, acabados y estructura. |
| [CAT-003](CAT-003_occupants-professions-hobbies-and-traits.md) | `approved` (horizonte) | Composiciones de hogar, estratos económicos, profesiones, aficiones y rasgos. |
| [CAT-004](CAT-004_initial-semantic-place-slice.md) | `draft` | Propuesta pequeña de primer subconjunto implementable; no aprobada por Dennis. |

`approved` en `CAT-001`–`CAT-003` significa **catálogo de horizonte aprobado
como referencia**, no contenido implementado ni alcance de una entrega
concreta (ver
[DEC-0006](../decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md)). El
subconjunto que efectivamente se implemente en cada entrega se declara en
`docs/STATUS.md`, nunca reduciendo en silencio este catálogo.

## Dependencias con otros dominios

- `20-world` (`WLD-005`, `WLD-006`, `WLD-007` usan estos catálogos como
  fuente de contenido).
- `40-settlement` (`SET-007` usa estos catálogos al definir explotación
  física).
- `90-architecture` (`ARC-005` define las entidades conceptuales que
  contienen este contenido).
- `docs/discovery/DISC-0003` traza cada sección del Anexo A de `DESIGN-004`
  a su destino canónico, incluidos estos catálogos.
