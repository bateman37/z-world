---
id: ARC-003
title: Principios de simulación multiescala
status: approved
canonical_for:
  - fidelidad variable entre detalle local y abstracción regional
  - materialización sin reescritura de hechos
  - frecuencias de actualización por relevancia
depends_on:
  - ARC-001
  - ARC-002
related:
  - WLD-003
  - SOC-003
---

## 1. Propósito

Fijar los principios técnicos para simular detalle local y abstracción
regional sin crear mundos incoherentes, ampliando
[ARC-001](ARC-001_technical-direction.md) y
[ARC-002](ARC-002_procedural-generation-and-persistence.md).

## 2. Principios que no deben romperse

- Materializar no reescribe hechos; abstraer no borra consecuencias.
- Godot 4 y GDScript siguen aprobados. No se abre migración a Unity,
  servidor, clases, carpetas o base de datos.

## 3. Modelo funcional

La fidelidad cambia según relevancia:

- Personas, trabajos, recursos y amenazas cercanos se simulan con detalle.
- Zonas y comunidades lejanas se actualizan de forma resumida.
- Entidades relevantes mantienen IDs, estado e historia suficientes para
  aumentar o reducir detalle.

### 3.1 Frecuencias de actualización

Los sistemas se actualizan con frecuencias adecuadas. Movimiento visible
puede ser frecuente; deterioro, cultivos, relaciones o población pueden
evaluarse en intervalos mayores. La velocidad afecta tiempo simulado, no
fuerza todo en cada fotograma (ver modelo de tiempo en
[ARC-002](ARC-002_procedural-generation-and-persistence.md)).

### 3.2 Separación de responsabilidades

Simulación, datos y presentación siguen separados (ver
[ARC-001](ARC-001_technical-direction.md)). Habilidades, técnicas,
recursos, edificios, soluciones, situaciones y amenazas deben definirse con
datos e IDs estables cuando se implementen, sin fijar ahora el formato.

### 3.3 Guardado y generación

El guardado conserva estado semántico y cambios; no cada elemento visual. La
generación reproducible de [ARC-002](ARC-002_procedural-generation-and-persistence.md)
cubre detalles no materializados.

## 4. Reglas aprobadas

- Ninguna materialización de una zona lejana puede contradecir su historia
  resumida previa (ver
  [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md)
  y
  [SOC-003](../50-society/SOC-003_external-communities-and-regional-history.md)).
- El rendimiento se mide con escenarios reales. No se simula cada
  ciudadano, objeto, relación y ruta distante a máximo detalle cada
  fotograma, pero tampoco se elimina identidad o causalidad necesaria para
  la visión.

## 5. Interacciones con otros sistemas

- El mapa estratégico y sus zonas materializables se rigen por
  [WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md).
- Las comunidades externas lejanas se rigen por
  [SOC-003](../50-society/SOC-003_external-communities-and-regional-history.md).
- No repite las reglas ya aprobadas de generación bajo demanda y modelo de
  tiempo de [ARC-002](ARC-002_procedural-generation-and-persistence.md).

## 6. Casos límite o riesgos

- Prometer rendimiento sin medir rompería el principio ya vigente en
  [ARC-002](ARC-002_procedural-generation-and-persistence.md).

## 7. Preguntas abiertas

- Presupuestos, frecuencias, materialización y rendimiento. Ver
  `docs/OPEN-QUESTIONS.md`.
- Formato definitivo de datos de contenido y de guardado (heredadas de
  [ARC-001](ARC-001_technical-direction.md) y
  [ARC-002](ARC-002_procedural-generation-and-persistence.md)).

## 8. Ejemplos no normativos

Ninguno.
