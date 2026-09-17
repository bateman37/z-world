---
id: VIS-003
title: Horizonte máximo de diseño
status: approved
canonical_for:
  - horizonte completo de experiencia de Z-World
  - relación entre horizonte máximo y entregas pequeñas
depends_on:
  - VIS-001
  - VIS-002
related:
  - RDM-002
  - DEC-0006
---

## 1. Propósito

Fijar el horizonte máximo conocido de Z-World: aquello que el juego completo
debe poder llegar a representar si el desarrollo avanza por las direcciones
ya acordadas en [VIS-001](VIS-001_game-vision.md) y
[VIS-002](VIS-002_design-pillars.md). No amplía el primer corte jugable
([RDM-001](../roadmap/RDM-001_first-playable-slice.md)) y no encarga código.

## 2. Principios que no deben romperse

- El jugador siempre dirige una comunidad de personas concretas, no una
  nación abstracta ni unidades intercambiables.
- El horizonte guía arquitectura y documentación, pero no amplía
  [RDM-001](../roadmap/RDM-001_first-playable-slice.md). Una capacidad solo
  existe cuando una entrega la incluye y está implementada y verificada.
- Una dirección `approved` en este horizonte es obligatoria para el diseño
  futuro; no significa implementada ni incluida en la primera versión (ver
  [DEC-0006](../decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md)).

## 3. Modelo funcional

Z-World debe poder crecer desde un grupo que busca agua y refugio hasta una
sociedad local conectada con una región. El horizonte combina:

- Gestión de asentamiento y transformación del entorno cercano (ver
  [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md)
  y [SET-004](../40-settlement/SET-004_technological-transition-and-knowledge-economy.md)).
- Supervivencia material creíble y dependiente del entorno (ver
  [SET-005](../40-settlement/SET-005_production-web-and-infrastructure.md)).
- Personas con historia, capacidades, relaciones, objetivos y evolución (ver
  [CHR-004](../30-characters/CHR-004_life-history-and-personal-arcs.md)).
- Conocimiento individual y colectivo que se aprende, transmite o pierde (ver
  [SET-004](../40-settlement/SET-004_technological-transition-and-knowledge-economy.md)).
- Política interna, liderazgo y conflicto social emergente (ver
  [SOC-002](../50-society/SOC-002_internal-politics-and-leadership.md)).
- Comunidades externas que crecen sin esperar al jugador (ver
  [SOC-003](../50-society/SOC-003_external-communities-and-regional-history.md)).
- Región extensa con información incompleta y exploración indirecta (ver
  [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md)).
- Narrativa emergente con causas, consecuencias y memoria (ver
  [NAR-002](../70-narrative/NAR-002_memory-and-causal-world-history.md)).

La variación procedural no consiste solo en recolocar edificios o botín.
Cambian personas, entorno, hallazgos, comunidades, amenazas y decisiones.

## 4. Reglas aprobadas

- No existe una escalera única que termine en armas y defensas que anulen el
  juego. La seguridad aporta ventajas y calma reales; la profundidad
  posterior puede venir de mantenimiento, especialistas, educación,
  relaciones, legitimidad, expansión, comercio y proyectos colectivos.
- Supervivencia pacífica, evasión, negociación, sigilo, especialización
  rural y recuperación técnica son estrategias posibles. Ninguna es
  universal.

## 5. Interacciones con otros sistemas

Este documento enmarca los horizontes de largo plazo de todos los dominios
enlazados en la sección 3. No repite sus reglas; cada dominio desarrolla su
propia extensión. La relación entre este horizonte, el alcance de entrega y
el estado implementado se registra en
[DEC-0006](../decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md).

## 6. Casos límite o riesgos

- Confundir una dirección `approved` de este horizonte con una capacidad ya
  disponible en el juego rompería la distinción entre visión y alcance real
  (ver `docs/STATUS.md`).

## 7. Preguntas abiertas

Ver `docs/OPEN-QUESTIONS.md` para las preguntas heredadas de cada dominio
enlazado en la sección 3.

## 8. Ejemplos no normativos

Ninguno.
