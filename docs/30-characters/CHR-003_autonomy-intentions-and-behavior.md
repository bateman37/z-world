---
id: CHR-003
title: Autonomía, intenciones y comportamiento
status: approved
canonical_for:
  - momentos de decisión autónoma
  - transgresión de normas sociales
  - información visible sobre comportamiento
depends_on:
  - CHR-001
related:
  - UI-001
  - SOC-001
  - NAR-001
  - CHR-004
---

## 1. Propósito

Definir cómo una persona elige, rechaza o inicia acciones fuera del control
directo del jugador, y cómo evoluciona su comportamiento con el tiempo.

## 2. Principios que no deben romperse

- Una persona no es un robot de prioridades. Fuera del control directo puede
  aceptar un trabajo, dejarlo, pedir ayuda, elegir una alternativa, atender
  una necesidad personal o iniciar una acción propia.
- La autonomía se evalúa en momentos de decisión, nunca como una tirada
  continua.
- La iniciativa también debe producir resultados positivos. Si la autonomía
  solo genera castigos, el jugador querrá desactivarla y se rompe el pilar de
  personas importantes (ver
  [VIS-002](../10-vision/VIS-002_design-pillars.md)).

## 3. Modelo funcional

### 3.1 Momentos de decisión

La autonomía se evalúa: al quedar libre, al descubrir una oportunidad, al
detectar peligro, al cambiar su estado crítico, al recibir una orden
incompatible con un valor importante, o al activarse un recuerdo o relación
relevante.

Las posibles salidas son: seguir el trabajo, escoger otro trabajo permitido,
pedir ayuda, posponer, retirarse, iniciar una acción personal o transgredir
una norma social (ver zonas en
[UI-001](../80-interface/UI-001_interaction-and-command-model.md)).

### 3.2 Transgresión de normas

La transgresión exige una causa concreta registrada, como hambre, protección
de una persona, promesa, curiosidad, conflicto, confianza excesiva, miedo o
interpretación errónea del peligro. No se activa por una probabilidad
genérica de «locura».

### 3.3 Conceptos distintos de comportamiento

Valentía, prudencia, miedo, confianza, experiencia y lealtad son conceptos
distintos. Una persona valiente puede retirarse con criterio; una persona
temerosa puede actuar por alguien importante. Experiencias, aprendizaje y
relaciones modifican comportamientos con el tiempo; hay progresos y
retrocesos, no un interruptor permanente «cobarde/valiente».

## 4. Reglas aprobadas

- La interfaz no muestra todos los valores internos. Sí muestra: estado
  operativo visible (cansancio, heridas, hambre, miedo percibido y acción
  actual); razón relevante cuando afecta a la gestión (por ejemplo, «ha
  dejado la búsqueda para ayudar a Lara», «rechaza entrar por miedo», «ha
  cruzado el límite siguiendo un rastro»); evidencia acumulada sobre rasgos y
  aptitudes, expresada con incertidumbre; y consecuencias y recuerdos después
  de acciones relevantes.
- Las aptitudes personales no se exponen como una lista de números absolutos
  al iniciar la partida. La comunidad descubre indicios por trabajo,
  convivencia y enseñanza. Tres resultados malos no revelan un límite
  definitivo.

## 5. Interacciones con otros sistemas

- El horizonte máximo de historia vital y arcos personales que amplía las
  motivaciones y relaciones descritas aquí se desarrolla en
  [CHR-004](CHR-004_life-history-and-personal-arcs.md), sin reformular esta
  autonomía.
- El estado operativo y las capas de personaje se definen en
  [CHR-001](CHR-001_character-model.md) y
  [CHR-002](CHR-002_knowledge-and-learning.md).
- Las transgresiones y consecuencias pueden alimentar tensiones sociales
  ([SOC-001](../50-society/SOC-001_living-community.md)) y narrativas
  ([NAR-001](../70-narrative/NAR-001_emergent-narrative.md)).
- Las decisiones autónomas se ejecutan dentro de las zonas y trabajos
  definidos en [UI-001](../80-interface/UI-001_interaction-and-command-model.md).

## 6. Casos límite o riesgos

- Si la autonomía transgresora siempre termina mal, el jugador perderá
  confianza en la simulación; toda transgresión debe tener una probabilidad
  real de salir bien.

## 7. Preguntas abiertas

- Valores y fórmulas exactos de características, aptitudes y comportamiento.
  Ver `docs/OPEN-QUESTIONS.md`.

## 8. Ejemplos no normativos

Un cazador puede seguir un ciervo hacia zona prohibida porque cree que
alimentar al grupo compensa el riesgo. Puede tener éxito, perderse, regresar
herido o morir. Otra persona puede negarse a acompañarlo. La misma situación
no exige el mismo resultado en todas las partidas.
