---
id: VIS-001
title: Visión del juego
status: approved
canonical_for:
  - visión general de Z-World
  - referencias de intención
depends_on: []
related:
  - VIS-002
---

## 1. Propósito

Fijar qué es Z-World y qué lo diferencia, como marco general para el resto de
la documentación.

## 2. Principios que no deben romperse

- Cada partida debe generar una historia propia mediante sistemas conectados,
  no mediante una secuencia fija de misiones.
- El jugador dirige una comunidad y un asentamiento; no controla manualmente a
  cada superviviente como personaje de acción.

## 3. Modelo funcional

Z-World es un videojuego de estrategia, supervivencia y construcción de una
comunidad tras un apocalipsis zombi. El jugador define prioridades, roles,
equipos, políticas, permisos, planes y respuestas ante situaciones
importantes; los habitantes ejecutan esas decisiones dentro de su propia
autonomía.

## 4. Reglas aprobadas

- Gestión indirecta: el jugador gobierna y organiza; no opera cada personaje
  directamente. Puede tomar control puntual con ratón sobre una persona
  concreta sin que el juego deje de ser de gestión (ver
  `docs/80-interface/UI-001_interaction-and-command-model.md`).
- Descubrir el territorio y conocer a las personas cambia de forma real las
  soluciones disponibles: la exploración de lugares y personas es parte del
  progreso (ver `docs/20-world/WLD-002_local-exploration-and-information.md`).
- El progreso no depende de una escalada militar obligatoria: sigilo,
  retirada, barreras y evitar un lugar son alternativas tan válidas como el
  combate (ver `docs/60-threats/THR-001_zombie-threat-model.md`).
- El objetivo diferencial es la narrativa procedural emergente, desarrollada
  en `docs/70-narrative/NAR-001_emergent-narrative.md`.

## 5. Interacciones con otros sistemas

Esta visión enmarca todos los dominios: mundo, personajes, asentamiento,
sociedad, amenazas, narrativa, interfaz y arquitectura.

## 6. Casos límite o riesgos

Ninguno específico a este documento.

## 7. Preguntas abiertas

Ninguna en esta entrega.

## 8. Ejemplos no normativos

Referencias de intención, citadas para transmitir sensación de juego. No
prometen ni especifican por sí solas ninguna funcionalidad concreta:

- `RimWorld`: apego a personajes, relaciones, pérdidas e historias emergentes.
- `Project Zomboid`: credibilidad material, peligro, escasez y consecuencias.
- `Timberborn`: claridad de gestión, automatización y facilidad de lectura.
- `Frostpunk`: presión social, liderazgo, políticas y decisiones colectivas.
