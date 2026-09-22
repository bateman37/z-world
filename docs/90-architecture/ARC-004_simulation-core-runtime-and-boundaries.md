---
id: ARC-004
title: Núcleo de simulación, tiempo continuo y fronteras técnicas
status: approved
canonical_for:
  - separación entre núcleo de simulación, catálogos, persistencia, orquestación y presentación
  - modelo de reloj continuo y velocidades
  - modelo mínimo de fases visibles de un trabajo
  - fronteras de lo que el núcleo puede y no puede importar
depends_on:
  - DEC-0008
related:
  - ARC-001
  - ARC-002
  - ARC-005
  - UI-005
  - UI-003
  - CHR-003
---

## 1. Propósito

Fijar, para la nueva línea de código simulation-first, la separación
obligatoria entre núcleo de simulación, catálogos y contratos,
persistencia, aplicación/orquestación y presentación web; el modelo de
reloj continuo con pausa y velocidades; y el modelo mínimo de fases
visibles que debe poder expresar cualquier trabajo de una persona. No fija
clases, módulos, carpetas ni tipos concretos de TypeScript: es la fuente
canónica conceptual que una futura entrega de inicialización técnica deberá
respetar.

## 2. Principios que no deben romperse

- El núcleo de simulación recibe estado y comandos/tiempo simulado y
  produce un nuevo estado más eventos. No importa Prisma, React, Next.js ni
  ninguna API del navegador.
- La base de datos guarda el mundo: no toma decisiones por los personajes y
  no alberga la lógica del juego.
- La interfaz nunca es la fuente de verdad. Cerrar o recargar la vista no
  puede cambiar reglas ni volver a sortear el mundo.
- El jugador no pulsa «avanzar diez minutos»: el reloj es continuo, con
  pausa y multiplicadores de tiempo simulado, nunca de resultados por
  fotograma.
- Ningún sistema usa el framerate como regla de juego.
- Un trabajo no se resuelve de golpe: debe poder expresarse mediante fases
  visibles, aunque no todas las acciones usen todas las fases.

## 3. Modelo funcional

### 3.1 Cinco capas obligatorias

| Capa | Responsabilidad | Puede importar |
|---|---|---|
| Núcleo de simulación | Estado, tiempo, reglas, órdenes, trabajos, decisiones y eventos causales. | Solo TypeScript puro y los catálogos/contratos de la capa siguiente. |
| Catálogos y contratos | Definiciones con IDs estables y datos validables (lugares, prioridades, recursos, etc.). | TypeScript puro; puede usar Zod para validar en sus fronteras cuando se implemente. |
| Persistencia | Repositorios PostgreSQL/Prisma, snapshots, eventos y versiones. | Prisma, PostgreSQL. Traduce entre el modelo del núcleo y el esquema de base de datos; el núcleo no conoce su existencia. |
| Aplicación/orquestación | Inicio, pausa, velocidad, comandos y ciclo de ejecución. | Núcleo, catálogos, persistencia. Coordina sin implementar reglas de juego propias. |
| Presentación web | Paneles, mapa Canvas, barras y registro narrativo (Next.js/React). | Llama a la orquestación mediante comandos y lee estado; nunca decide reglas ni genera el mundo. |

Estas cinco capas son obligatorias desde el inicio de la nueva línea de
código (ver [DEC-0008](../decisions/DEC-0008_simulation-first-web-architecture.md)).
Esta entrega no fija nombres de paquete, carpetas ni módulos concretos.

### 3.2 Modelo de tiempo continuo

```text
Día 1 · 08:37
Pausa · ×1 · ×2 · ×4 · ×10
```

- Un día completo mantiene la decisión ya vigente de 20 minutos reales a
  ×1 (heredada de
  [ARC-002](ARC-002_procedural-generation-and-persistence.md), sección
  3.3, y aplicable igualmente a la nueva línea de código).
- Pausa congela toda evolución dependiente del tiempo simulado.
- ×2, ×4 y ×10 multiplican tiempo simulado, nunca el número de tiradas ni
  de resultados por fotograma.
- El motor avanza mediante ticks internos deterministas o un acumulador de
  tiempo simulado; la frecuencia exacta se decide y mide al implementar.
- La representación puede interpolar movimientos con más frecuencia que la
  lógica, sin alterar resultados.

### 3.3 Fases visibles de un trabajo

Cada persona tiene siempre un estado operativo comprensible. Como mínimo,
el modelo debe poder expresar esta cadena de fases, sin obligar a usarlas
todas en cada acción:

```text
seleccionando o reservando trabajo
→ desplazándose al origen o destino
→ recogiendo o preparando
→ realizando la acción
→ transportando o regresando
→ depositando o completando
```

Para cada persona, la futura interfaz debe poder mostrar: qué está
haciendo, dónde va y hacia qué objetivo, la fase actual, el progreso
porcentual del desplazamiento o de la fase cuando sea medible, la carga
transportada, el origen de la acción (orden puntual, prioridad, necesidad,
emergencia o iniciativa propia) y el motivo de espera, bloqueo, cancelación
o interrupción, y la consecuencia al terminar. El porcentaje es una
proyección operativa, no una promesa de tiempo exacto: bloqueos y cambios
causales pueden alterar la duración. Este modelo de fases es coherente con
el ya usado por el prototipo Godot (`travel`, `act`, `return`, `deliver` en
`IMPLEMENTATION-003`) y con la cadena conceptual de
[UI-003](../80-interface/UI-003_work-priority-taxonomy.md); no lo sustituye,
lo generaliza para la nueva línea de código.

### 3.4 PostgreSQL sin convertir cada fotograma en SQL

PostgreSQL se adopta porque el proyecto aspira a conservar un mundo grande,
consultable y persistente. Sin embargo:

- No se escribe una fila por cada fotograma visual.
- No se ejecuta una consulta por cada pequeño movimiento de cada persona.
- El estado activo puede evolucionar en memoria dentro del proceso de
  simulación.
- Se persiste mediante límites causales, transacciones, eventos y
  snapshots, con una cadencia que se decide y mide en implementación (ver
  también [ARC-002](ARC-002_procedural-generation-and-persistence.md)).
- La reconstrucción de una partida debe preservar hechos y no depender de
  la capa visual.

## 4. Reglas aprobadas

- El núcleo de simulación no importa Prisma, React, Next.js ni API del
  navegador, sin excepción.
- Ningún cierre o recarga de la interfaz puede alterar reglas o regenerar
  el mundo.
- El reloj es siempre continuo con pausa y multiplicadores de tiempo
  simulado; no se introduce un modo de turnos o saltos manuales.
- Toda persona con un trabajo en curso debe poder exponer al menos fase
  actual y motivo de bloqueo cuando corresponda, incluso si su acción no
  usa todas las fases de la sección 3.3.
- Esta entrega no fija tablas, endpoints, clases o carpetas ejecutables
  definitivas; solo el mapa lógico de capas y responsabilidades de la
  sección 3.1.

## 5. Interacciones con otros sistemas

- El stack y la decisión de reinicio de línea activa se registran en
  [DEC-0008](../decisions/DEC-0008_simulation-first-web-architecture.md).
- El modelo de datos semántico que vive dentro del núcleo y de los
  catálogos se define en
  [ARC-005](ARC-005_semantic-world-data-model.md). Las entidades de
  entorno moldeable, accesos y transporte que `DESIGN-008` añade a
  `ARC-005` conservan las mismas fronteras técnicas de esta sección: no
  las amplía ni las relaja.
- El mapa Canvas 2D, la niebla y el control puntual con ratón que consumen
  este núcleo desde la capa de presentación se definen en
  [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md).
- La cadena conceptual de necesidad, orden, zona, política, evento,
  trabajo y prioridad que las fases de la sección 3.3 ejecutan sigue
  definida en
  [UI-003](../80-interface/UI-003_work-priority-taxonomy.md).
- Los momentos de decisión autónoma que pueden interrumpir una fase se
  rigen por
  [CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md).
- Los principios de generación reproducible y separación entre generación,
  simulación, representación y guardado siguen definidos en
  [ARC-002](ARC-002_procedural-generation-and-persistence.md), que esta
  entrega actualiza para el nuevo stack sin reformular sus principios ya
  válidos.

## 6. Casos límite o riesgos

- Permitir que la capa de presentación web decida una regla de juego
  directamente (por ejemplo, calcular un resultado en un componente React)
  rompería la separación de la sección 3.1.
- Acelerar la velocidad de simulación y multiplicar tiradas o resultados
  por fotograma contradice el principio de tiempo continuo de la sección
  3.2.
- Inventar frecuencias de tick o cadencias de persistencia como si fueran
  cifras cerradas contradice la sección 4 de `DESIGN-004` y las preguntas
  abiertas de la sección 7.

## 7. Preguntas abiertas

- Frecuencia exacta de ticks internos o tamaño del acumulador de tiempo
  simulado.
- Cadencia exacta de snapshots y eventos persistidos en PostgreSQL.
- Estructura interna definitiva de paquetes/carpetas para las cinco capas
  de la sección 3.1, que se fijará en la entrega de inicialización técnica.

## 8. Ejemplos no normativos

Los ejemplos de estado visible de persona («Caminando al almacén · 65 %»,
«Pescando en el estanque · 30 %», «Descansando · recuperación 80 %», «En
camino para inspeccionar la casa · 42 %», «Esperando trabajo: no hay tarea
elegible») del Anexo A de `DESIGN-004` ilustran la sección 3.3; no fijan un
formato de texto final de interfaz.
