---
id: ARC-002
title: Generación procedural bajo demanda, tiempo y persistencia
status: approved
canonical_for:
  - generación bajo demanda reproducible
  - separación entre generación, simulación, representación y guardado
  - modelo de tiempo y velocidades
depends_on:
  - ARC-001
related:
  - DEC-0005
  - WLD-002
---

## 1. Propósito

Fijar la política de generación procedural bajo demanda, el modelo de tiempo
simulado y los requisitos mínimos de persistencia, sin definir todavía el
formato final de guardado.

## 2. Principios que no deben romperse

- Se adopta una sola política: generación bajo demanda reproducible y
  persistencia estable.
- Las reglas se calculan por tiempo simulado. Acelerar el juego no multiplica
  tiradas, recursos, aprendizaje ni riesgos por el número de fotogramas.
- La estabilidad no congela el mundo: saqueos, consumo, destrucción,
  deterioro, movimiento de personajes, acción de otra comunidad y paso del
  tiempo pueden cambiar el estado que se encuentra, siempre con una causa
  persistida.

## 3. Modelo funcional

### 3.1 Generación bajo demanda

Generar bajo demanda significa que no se calculan ni se cargan todos los
interiores, contenedores y detalles del mapa al iniciar la partida. Un
detalle se materializa cuando una interacción causal lo necesita: por
ejemplo inspeccionar, acceder, simular una visita de otra comunidad o activar
una amenaza relacionada (ver
[WLD-002](../20-world/WLD-002_local-exploration-and-information.md)).

Cada lugar y contenedor posee un ID estable. Su contenido base se deriva de:

- Semilla de la partida.
- ID estable del lugar o contenedor.
- Versión del generador.
- Contexto persistente ya consolidado que afecte a ese lugar.

No depende de quién lo abre, del orden de visitas, de la velocidad de juego,
de fotogramas ni de otras tiradas aleatorias no relacionadas.

Si se guarda antes de abrir una casa, se carga esa misma partida y se vuelve
a abrir bajo las mismas condiciones, el contenido base será el mismo. No
existe un modo alternativo que vuelva a sortear lo desconocido al cargar: eso
añade complejidad, dificulta depurar y no aporta el ahorro de memoria
buscado (ver [DEC-0005](../decisions/DEC-0005_reproducible-lazy-generation.md)).

### 3.2 Separación conceptual

- **Generación**: crea detalle base cuando hace falta.
- **Simulación**: cambia el estado por causas del mundo.
- **Representación cargada**: modelos, navegación y elementos visuales
  activos cerca de la cámara o actividad relevante.
- **Guardado**: conserva semilla, versión, cambios persistentes y estado
  simulado necesario.

Descargar visualmente una zona de la memoria no puede borrar recursos
saqueados, construcciones, inventarios, destrucción, trabajos, relaciones,
recuerdos o información descubierta.

### 3.3 Modelo de tiempo

Un día completo dura 20 minutos a velocidad ×1. El juego tiene pausa y
velocidades ×1, ×2, ×4 y ×10. Las acciones en curso conservan progreso
coherente al cambiar de velocidad o pausar.

## 4. Reglas aprobadas

- El formato de archivo, la base de datos y la estrategia exacta de migración
  quedan abiertos; no se introduce SQLite todavía (ver
  [ARC-001](ARC-001_technical-direction.md)).
- El guardado futuro debe conservar como mínimo: reloj, personas, relaciones
  y recuerdos relevantes, inventarios, recursos, trabajos, reservas,
  progreso, estado de lugares, semilla, versión de generación y estado
  aleatorio que no se derive por ID.
- No se promete rendimiento sin medir: la materialización debe evitar pausas
  perceptibles al implementarse.

## 5. Interacciones con otros sistemas

- La información descubierta sobre lugares depende de la generación bajo
  demanda (ver
  [WLD-002](../20-world/WLD-002_local-exploration-and-information.md)).
- Los recursos y su condición dependen del estado simulado, no de la
  representación cargada (ver
  [SET-003](../40-settlement/SET-003_resources-logistics-and-condition.md)).

## 6. Casos límite o riesgos

- Una materialización lenta al inspeccionar un lugar puede percibirse como un
  fallo; debe medirse y optimizarse al implementarse, no antes.

## 7. Preguntas abiertas

- Formato de guardado, compatibilidad entre versiones y representación de
  datos final. Ver `docs/OPEN-QUESTIONS.md` y
  [ARC-001](ARC-001_technical-direction.md).
- Duración de estaciones, número de días por estación, año completo y
  fórmulas de cultivos (no implementados en la primera versión).

## 8. Ejemplos no normativos

Ninguno.
