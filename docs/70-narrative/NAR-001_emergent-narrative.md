---
id: NAR-001
title: Narrativa procedural emergente
status: approved
canonical_for:
  - flujo causal de la narrativa
  - diferenciación entre hechos, rumores e información falsa
depends_on: []
related:
  - SOC-001
  - CHR-001
  - CHR-003
  - SET-001
  - NAR-002
---

## 1. Propósito

Definir cómo debe surgir la narrativa de Z-World a partir del estado real del
mundo, en lugar de eventos aleatorios desconectados.

## 2. Principios que no deben romperse

- La narrativa debe surgir del estado real del mundo, no de una tabla de
  eventos aleatorios independiente de la simulación.
- Las situaciones narrativas seleccionan y presentan momentos importantes; no
  deben sustituir la simulación con guiones disfrazados de azar.

## 3. Modelo funcional

Flujo causal aprobado:

```text
estado del mundo y de las personas
  -> tensiones, necesidades y oportunidades
  -> situación relevante
  -> decisión del jugador o reacción autónoma
  -> consecuencias
  -> memoria persistente y nuevo estado
```

Ejemplo del principio (no normativo, no es una regla de contenido): un grupo
de refugiados no aparece simplemente porque corresponda un evento. Puede
haber perdido su refugio, haber conocido la ubicación del jugador, disponer
de una ruta viable y llegar con relaciones, necesidades y consecuencias
propias.

## 4. Reglas aprobadas

- El juego debe diferenciar hechos observados, rumores, información antigua e
  información posiblemente falsa.

## 5. Interacciones con otros sistemas

- Las tensiones y oportunidades surgen del estado de la comunidad (dominio
  30), del asentamiento (dominio 40) y de la sociedad (dominio 50).
- Las decisiones autónomas y sus consecuencias registradas en
  [CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md)
  son una fuente de tensiones y situaciones, sin que este documento rehaga
  ese modelo de autonomía.
- La memoria persistente alimenta futuras situaciones narrativas. El
  horizonte máximo de esa memoria significativa y de la historia causal
  reconstruible se desarrolla en
  [NAR-002](NAR-002_memory-and-causal-world-history.md), conservando esta
  causalidad sin reformularla.

## 6. Casos límite o riesgos

Ninguno específico a este documento más allá de las preguntas abiertas.

## 7. Preguntas abiertas

- Modelo exacto de memoria persistente.
- Diseño del director narrativo (cómo se seleccionan y priorizan
  situaciones).
- Frecuencia de situaciones narrativas.
- Formato concreto de los eventos.

Ver también `docs/OPEN-QUESTIONS.md`.

## 8. Ejemplos no normativos

El ejemplo del grupo de refugiados en la sección 3 es ilustrativo del
principio causal, no una mecánica de contenido definida.
