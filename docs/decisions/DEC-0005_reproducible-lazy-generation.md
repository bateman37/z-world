---
id: DEC-0005
title: Generación bajo demanda estable y reproducible
status: approved
canonical_for:
  - política única de generación procedural y persistencia
depends_on: []
related:
  - ARC-002
  - WLD-005
  - DEC-0008
---

## Contexto

El mapa local puede contener muchos interiores, contenedores y detalles.
Cargarlos todos al iniciar la partida es costoso; generarlos de forma no
reproducible al visitarlos rompería la coherencia entre partidas guardadas y
cargadas.

## Decisión

Los detalles se generan bajo demanda a partir de semilla de partida, ID
estable del lugar o contenedor, versión del generador y contexto persistente
ya consolidado. Son reproducibles al cargar una misma partida: si se guarda
antes de abrir un lugar y se recarga, su contenido base es el mismo. Los
cambios causales (saqueo, destrucción, construcción, deterioro) persisten. No
existe una opción de volver a sortear contenido desconocido al cargar. Ver el
modelo completo en
[ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md).

## Consecuencias

- La generación no depende de quién visita un lugar, del orden de visitas, de
  la velocidad de juego ni de fotogramas.
- Descargar visualmente una zona de la memoria no puede borrar el estado
  persistente ya consolidado.

## Aspectos que siguen abiertos

- Formato de archivo, base de datos y estrategia de migración de guardado.

## Nota de `DESIGN-004`

Este principio sigue vigente sin cambios para la nueva línea de código
Node.js/TypeScript/PostgreSQL adoptada en
[DEC-0008](DEC-0008_simulation-first-web-architecture.md): la generación
semántica de lugares y edificios de
[WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md) es
igualmente determinista por semilla, ID y versión del generador.
