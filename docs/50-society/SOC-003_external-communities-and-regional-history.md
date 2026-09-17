---
id: SOC-003
title: Comunidades externas e historia regional
status: approved
canonical_for:
  - crecimiento autónomo de comunidades externas
  - relaciones causales entre comunidades
depends_on:
  - SOC-001
related:
  - WLD-003
  - SOC-002
  - NAR-002
---

## 1. Propósito

Definir el horizonte máximo del crecimiento autónomo de comunidades externas
y de sus relaciones regionales, ampliando
[SOC-001](SOC-001_living-community.md).

## 2. Principios que no deben romperse

- Las comunidades externas nacen pequeñas, cambian, crecen, se dividen,
  comercian, luchan o desaparecen aunque el jugador no las controle (regla
  ya vigente en [SOC-001](SOC-001_living-community.md)).
- No hace falta simular cada individuo lejano.

## 3. Modelo funcional

Las comunidades externas conservan identidad y, al menos abstractamente,
población, recursos, territorio, necesidades, conocimientos, liderazgo,
cohesión, objetivos, relaciones y memoria.

Empiezan con tamaños plausibles. Pueden atraer refugiados, perder
población, absorber grupos, fundar puestos, abandonar lugares, comerciar,
dividirse, aliarse, someter, luchar o desaparecer sin esperar al jugador.

Sí se conservan líderes, contactos, familiares, rivales o especialistas
causalmente relevantes. Al materializarse, el detalle respeta estado e
historia anteriores (ver
[ARC-003](../90-architecture/ARC-003_multiscale-simulation-principles.md)).

### 3.1 Relaciones causales

Las relaciones guardan causas: ayuda, deuda, comercio, engaño, violencia,
refugio, abandono, parentesco, amenaza común o territorio. Una cifra puede
resumir, pero no sustituye los hechos.

## 4. Reglas aprobadas

- Ninguna comunidad externa cambia de estado (fundación, absorción,
  desaparición) sin una causa registrada equivalente a la sección 3.1.
- El detalle de una comunidad materializada nunca puede contradecir su
  historia resumida previa.

## 5. Interacciones con otros sistemas

- Las comunidades externas existen y se materializan en el mapa estratégico
  definido en
  [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md).
- Sus relaciones con la política interna de la comunidad del jugador se
  rigen también por
  [SOC-002](SOC-002_internal-politics-and-leadership.md).
- Los hechos y su memoria alimentan
  [NAR-002](../70-narrative/NAR-002_memory-and-causal-world-history.md).

## 6. Casos límite o riesgos

- Presuponer una comunidad estable de decenas de miles de habitantes sin
  historia rompería la plausibilidad del colapso regional (ver
  [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md)).

## 7. Preguntas abiertas

- Población, territorio, comercio, guerra y absorción externa. Ver
  `docs/OPEN-QUESTIONS.md`.
- Ritmo y reglas de evolución de comunidades externas (heredada de
  [SOC-001](SOC-001_living-community.md)).

## 8. Ejemplos no normativos

Ayudar con semillas puede permitir una comunidad agrícola; rechazar
soldados puede contribuir a que controlen una carretera; abandonar un
pueblo a una horda puede cambiar su uso regional. Son ejemplos, no eventos
garantizados.
