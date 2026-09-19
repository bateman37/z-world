---
id: UI-005
title: Laboratorio de simulación cenital
status: approved
canonical_for:
  - mapa Canvas 2D cenital del laboratorio de simulación
  - niebla de guerra y exploración progresiva del mapa local
  - reloj continuo y velocidades en la interfaz
  - control puntual con ratón sobre el mapa 2D
  - relación entre visibilidad espacial y estados de información
depends_on:
  - UI-001
related:
  - WLD-002
  - ARC-004
  - DEC-0008
  - UI-003
---

## 1. Propósito

Definir el mapa local 2D cenital del laboratorio de simulación
Node.js/TypeScript/Next.js: su niebla de guerra, exploración progresiva,
reloj y velocidades, selección y órdenes puntuales con ratón, movimiento
visible y barras/fases, y su relación con los paneles operativos. Sustituye
funcionalmente, para la nueva línea de código, a la cámara 3D inclinada
usada por el prototipo Godot, sin alterar el modelo de interacción,
prioridades, zonas y control puntual ya cerrado en
[UI-001](UI-001_interaction-and-command-model.md).

## 2. Principios que no deben romperse

- El laboratorio de simulación no es una terminal ni un juego puramente
  textual: tiene un mapa 2D cenital, deliberadamente sencillo, inspirado
  únicamente en la legibilidad de los juegos cenitales antiguos.
- El primer mapa no aparece completo ni revela todas sus posibilidades: al
  comenzar solo se conoce el grupo inicial, el punto de llegada/refugio y
  una cercanía razonable. El resto queda oculto o incierto mediante niebla
  de guerra e información incompleta.
- Pintar o revelar terreno no crea recursos, no inspecciona interiores y no
  asegura el lugar por sí solo.
- No hay arte final, modelos 3D, primera persona, WASD ni puntería manual
  en este mapa. No se introduce Phaser, PixiJS u otro motor 2D hasta que
  una necesidad medida lo justifique: basta Canvas 2D del navegador.
- El mapa es una herramienta de juego y observación, no una maqueta
  decorativa; convive con paneles de personas, trabajos, recursos y
  sucesos, sin sustituirlos.

## 3. Modelo funcional

### 3.1 Representación del mapa

- Canvas 2D del navegador.
- Terreno plano, caminos, agua y vegetación mediante colores o formas
  simples.
- Edificios como huellas o bloques coherentes con su modelo semántico (ver
  [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md));
  la huella 2D es una representación del edificio lógico, no su fuente de
  verdad.
- Supervivientes y amenazas como marcadores o sprites provisionales.
- Movimiento visible entre posiciones, gobernado por el avance de
  simulación del reloj, nunca por el framerate (ver
  [ARC-004](../90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md)).
- Cámara con desplazamiento y zoom mediante ratón.
- Selección y acciones contextuales con ratón, coherentes con el modelo ya
  aprobado en
  [UI-001](UI-001_interaction-and-command-model.md).

### 3.2 Reloj y velocidades en la interfaz

La interfaz muestra el reloj continuo y sus controles:

```text
Día 1 · 08:37
Pausa · ×1 · ×2 · ×4 · ×10
```

El modelo de tiempo (día de 20 minutos reales a ×1, pausa que congela toda
evolución dependiente del tiempo simulado, multiplicadores de tiempo
simulado nunca de resultados por fotograma) se rige por
[ARC-004](../90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md)
y [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md);
este documento solo fija que la interfaz debe representarlo con claridad.

### 3.3 Niebla de guerra y exploración progresiva

Al comenzar la partida, la niebla del mapa local distingue como mínimo:

- **Oculto**: el jugador no conoce esa parte del mapa.
- **Conocido sin visión directa**: una zona ya descubierta, pero sin
  observación en este momento.
- **Observable**: el jugador ve la zona ahora mismo, con la fidelidad que
  permita la posición de sus personas o puntos de observación.

Esta niebla controla **visibilidad espacial**, distinta de los cinco
estados de información de un lugar u objeto concreto definidos en
[WLD-002](../20-world/WLD-002_local-exploration-and-information.md), sección
3.1 (no conocido, avistado, observado, inspeccionado, aprovechado o
transformado). Un lugar puede estar en una zona actualmente sin visión
directa y conservar su estado de información alcanzado en una visita
anterior; la niebla no lo hace retroceder y revelar terreno no equivale a
observar, inspeccionar o registrar un lugar concreto (ver
[WLD-002](../20-world/WLD-002_local-exploration-and-information.md), sección
3.3, que remite aquí para el modelo funcional completo de niebla).

### 3.4 Control puntual y exploración con ratón

El jugador puede seleccionar una persona y darle una orden puntual para
moverse, observar o explorar una zona ya accesible, con las mismas reglas
generales de control puntual de
[UI-001](UI-001_interaction-and-command-model.md), sección 3.5, adaptadas a
la cámara cenital 2D en lugar de la cámara 3D inclinada:

1. El jugador selecciona a la persona.
2. Hace clic en un destino, objeto, persona o elemento del entorno visible
   u observable.
3. Elige una acción contextual disponible.
4. La persona calcula la ruta, se desplaza, reacciona a necesidades y
   peligro, y realiza la acción hasta completarla, cancelarla, quedar
   bloqueada o verse interrumpida.

El jugador no controla cada paso de la persona. Avistar una forma,
reconocer un lugar, observarlo, inspeccionarlo, registrarlo y explotarlo
siguen siendo conceptos relacionados pero no equivalentes (ver
[WLD-002](../20-world/WLD-002_local-exploration-and-information.md) y
[WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md)).

### 3.5 Movimiento visible, barras y fases

El mapa muestra movimiento visible entre posiciones y, junto a él o en un
panel asociado, la fase actual y el progreso de cada persona con trabajo en
curso, según el modelo mínimo de fases de
[ARC-004](../90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md),
sección 3.3. Los paneles de personas, trabajos, recursos y sucesos conviven
con el mapa sin duplicar su información innecesariamente.

## 4. Reglas aprobadas

- El mapa local del laboratorio de simulación es 2D cenital sobre Canvas
  del navegador; no se introduce 3D, primera persona, WASD ni puntería
  manual.
- No se introduce Phaser, PixiJS ni otro motor 2D hasta que una necesidad
  medida lo justifique.
- El primer mapa nunca revela todo el escenario: la niebla y el
  descubrimiento progresivo son obligatorios desde el inicio de la partida.
- Visibilidad espacial (niebla) y estado de información de un lugar son
  conceptos distintos que nunca se sustituyen entre sí en la interfaz.
- El control puntual con ratón sobre este mapa hereda, sin contradecirlas,
  las reglas ya cerradas en
  [UI-001](UI-001_interaction-and-command-model.md).

## 5. Interacciones con otros sistemas

- El modelo de interacción, prioridades, designaciones, zonas y control
  puntual base sigue siendo
  [UI-001](UI-001_interaction-and-command-model.md); este documento adapta
  su cámara y su superficie de mapa a Canvas 2D sin reabrir sus reglas
  cerradas por `DESIGN-001`.
- Los estados de información y las familias de acciones de descubrimiento
  se rigen por
  [WLD-002](../20-world/WLD-002_local-exploration-and-information.md).
- El reloj continuo, las fases visibles de trabajo y las fronteras técnicas
  del núcleo de simulación se rigen por
  [ARC-004](../90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md).
- El stack aprobado (Next.js/React, Canvas del navegador) se registra en
  [DEC-0008](../decisions/DEC-0008_simulation-first-web-architecture.md).
- La representación de edificios como huellas coherentes con su modelo
  semántico se rige por
  [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md).
- La matriz de prioridades y trabajos que puede convivir con este mapa se
  rige por [UI-003](UI-003_work-priority-taxonomy.md), sin repetirse aquí.

## 6. Casos límite o riesgos

- Revelar niebla como efecto colateral de otra acción (por ejemplo, un
  cálculo de ruta) sin que exista una razón de visibilidad real rompería el
  principio de exploración progresiva de la sección 2.
- Confundir «zona visible ahora» con «lugar ya registrado» llevaría a
  mostrar información que la comunidad no debería conocer todavía; deben
  distinguirse siempre (sección 3.3).

## 7. Preguntas abiertas

- Alcance exacto de visión de una persona o punto de observación (radio,
  línea de visión, obstáculos).
- Representación visual exacta (colores, formas, iconografía) del terreno,
  edificios, personas y amenazas; esta entrega no fija arte ni paleta.
- Mecanismo exacto de transición cuando una zona pasa de «conocida sin
  visión directa» a «observable» y viceversa.

## 8. Ejemplos no normativos

Los ejemplos de estado visible de persona de
[ARC-004](../90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md),
sección 8, ilustran qué información puede mostrarse junto al mapa; no fijan
un formato de texto final.
