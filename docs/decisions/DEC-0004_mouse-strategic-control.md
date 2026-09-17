---
id: DEC-0004
title: Control individual con ratón dentro de un juego de gestión
status: approved
canonical_for:
  - control puntual con ratón como único método de intervención directa
depends_on: []
related:
  - UI-001
---

## Contexto

Z-World es un juego de gestión indirecta: el jugador organiza una comunidad,
no maneja un avatar de acción. Sin embargo, se necesitaba decidir si existiría
algún modo de intervención directa sobre una persona concreta, y de qué tipo.

## Decisión

El control puntual usa ratón y la misma cámara estratégica inclinada que la
gestión general. Sirve para cualquier acción contextual disponible (moverse,
observar, inspeccionar, abrir, recoger, transportar, reparar, ayudar, curar,
pescar, ocultarse, atacar, retirarse, entre otras), conserva todos los
límites del personaje (tiempo, cansancio, miedo, heridas, herramientas,
conocimientos, riesgo y requisitos) y no convierte el juego en primera
persona ni hace obligatorio su uso. Ver el modelo completo en
[UI-001](../80-interface/UI-001_interaction-and-command-model.md).

## Consecuencias

- No se implementarán primera persona, movimiento WASD, puntería manual ni
  disparo manual.
- Tomar control de una persona no congela al resto de la comunidad, que sigue
  simulándose con sus prioridades.

## Aspectos que siguen abiertos

- Catálogo completo de acciones contextuales disponibles según el objetivo.
