---
id: DEC-0006
title: Separar visión máxima, alcance de entrega y estado implementado
status: approved
canonical_for:
  - relación entre horizonte máximo, roadmap y estado implementado
depends_on: []
related:
  - VIS-003
  - RDM-001
  - RDM-002
---

## Contexto

`DESIGN-002` documenta el horizonte máximo conocido de Z-World
([VIS-003](../10-vision/VIS-003_maximum-design-envelope.md)) junto a un
mapa de capacidades futuras
([RDM-002](../roadmap/RDM-002_long-term-capability-horizon.md)). Sin una
distinción explícita, esa visión de largo plazo podría confundirse con el
alcance real que se pretende construir a continuación o con
funcionalidad ya existente.

## Decisión

Se distinguen tres niveles:

- El **horizonte máximo** conserva decisiones de producto a largo plazo
  ([VIS-003](../10-vision/VIS-003_maximum-design-envelope.md)).
- Un **roadmap acotado** define qué se pretende construir en una etapa
  concreta ([RDM-001](../roadmap/RDM-001_first-playable-slice.md)).
- `implemented` solo describe algo existente y verificado en el juego (ver
  [DOC-001](../00-governance/DOC-001_documentation-system.md)).

Una capacidad `approved` en el horizonte máximo no entra en
[RDM-001](../roadmap/RDM-001_first-playable-slice.md) ni autoriza
programarla. Una capacidad `draft` no autoriza asumir sus detalles en
código. Una entrega pequeña puede reducir contenido y detalle, pero no
cerrar una dirección aprobada sin registrar una decisión.

## Consecuencias

- `RDM-001` sigue siendo la única fuente del alcance real de la primera
  implementación; `DESIGN-002` no lo modifica.
- Cualquier futura reducción de una dirección aprobada del horizonte máximo
  requiere una nueva decisión en `docs/decisions/`, no un cambio silencioso
  de alcance dentro del código.
- Permite documentar y pensar en grande sin encargar un juego inabarcable
  en la etapa actual.

## Aspectos que siguen abiertos

- Cuándo y cómo una capacidad del horizonte máximo se convierte en una
  futura entrega de roadmap.
