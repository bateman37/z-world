# 80-interface — Interfaz

## Responsabilidad

Define cómo el jugador percibe y controla la comunidad y el asentamiento:
paneles, cámara, información mostrada y flujos de interacción.

## Qué pertenece aquí

- Reglas de interfaz y experiencia de usuario cuando se documenten.

## Qué no pertenece aquí

- Dirección visual o técnica del motor: `docs/90-architecture/`.
- Reglas de simulación subyacentes: dominios 20 a 70.

## Documentos

| ID | Estado | Propósito |
|---|---|---|
| [UI-001](UI-001_interaction-and-command-model.md) | `approved` | Selección, prioridades, designaciones, zonas, control puntual con ratón e información operativa. |
| [UI-002](UI-002_management-at-community-scale.md) | `approved` | Gestión legible al crecer población, territorio y sistemas. |

## Dependencias con otros dominios

- `90-architecture` (separación entre simulación y presentación).
- `30-characters` (elegibilidad y autonomía de las personas).
- `20-world`, `40-settlement` (información y recursos sobre los que se
  designan trabajos).
