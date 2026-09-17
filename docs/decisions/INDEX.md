# decisions — Decisiones

## Responsabilidad

Registra decisiones relevantes ya adoptadas, con su contexto, motivo y
consecuencias. No repite las reglas funcionales completas: enlaza al
documento canónico de dominio correspondiente.

## Qué pertenece aquí

- Decisiones de alcance transversal o arquitectónico ya cerradas.

## Qué no pertenece aquí

- Propuestas o alternativas todavía no cerradas: `docs/discovery/`.
- El detalle funcional completo de una regla: vive en su dominio canónico.

## Documentos

| ID | Estado | Propósito |
|---|---|---|
| [DEC-0001](DEC-0001_godot-4.md) | `approved` | Godot 4 como motor inicial; sin migración automática a Unity. |
| [DEC-0002](DEC-0002_two-world-scales.md) | `approved` | Convivencia de mapa local y mapa estratégico. |
| [DEC-0003](DEC-0003_data-driven-design.md) | `approved` | Desacoplamiento entre sistemas, datos y presentación. |

## Dependencias con otros dominios

- `90-architecture`, `20-world`.
