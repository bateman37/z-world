---
id: SCN-001
title: Llegada al pueblo de montaña
status: approved
canonical_for:
  - condición inicial de partida del primer escenario
depends_on: []
related:
  - VIS-001
  - SET-001
  - NAR-001
  - RDM-001
  - RDM-003
  - WLD-003
  - WLD-008
  - UI-005
---

## 1. Propósito

Registrar el primer escenario de Z-World como una **condición inicial**
plausible, no como una historia o campaña obligatoria.

## 2. Principios que no deben romperse

- Este escenario define un punto de partida, no una secuencia de eventos
  garantizada. El resultado debe proceder de la simulación, las decisiones
  del jugador y las condiciones concretas de la partida.
- El grupo inicial de seis no debe tratarse como una población fija: la
  comunidad puede crecer, reducirse, dividirse o transformarse desde el
  primer momento.

## 3. Modelo funcional

La primera versión puede comenzar siempre con seis supervivientes que han
huido de su lugar de origen ayudándose entre ellos. Llegan cansados, con
pocas pertenencias, a un pueblo de montaña aparentemente deshabitado y
deciden dejar de moverse.

El primer problema sugerido es convertir un edificio existente en un refugio
básico: inspeccionarlo, reunir allí los recursos, descansar, conseguir agua,
buscar comida, cerrar accesos y explorar el mapa local (ver
[SET-001](../40-settlement/SET-001_settlement-growth.md)). El edificio puede
ser una casa grande, una pequeña nave, una granja o un local equivalente
según la semilla de partida; no es una construcción vacía creada por el
jugador.

El mapa local es un espacio de gestión con edificios existentes, terreno,
caminos, recursos naturales, puntos de agua y zonas peligrosas. Su
representación activa es 2D cenital sobre Canvas (ver
[UI-005](../80-interface/UI-005_top-down-simulation-workbench.md)); las
descripciones históricas de este escenario como «espacio 3D» corresponden al
prototipo Godot (ver
[DEC-0008](../decisions/DEC-0008_simulation-first-web-architecture.md) y
[DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md)).

La geografía es **procedural y ficticia**: un pueblo de montaña generado
dentro del perfil controlado de
[WLD-008](../20-world/WLD-008_local-procedural-map-generation.md), nunca la
reproducción literal de un municipio real. Su distribución varía entre
partidas de forma coherente: puede haber más bosque, viviendas, campo, un
arroyo, un lago, talleres u otros elementos, sin que una semilla pueda
producir una gran ciudad ni los arquetipos excluidos en `WLD-008`, sección
3.5. El primer escenario mantiene el tema de pueblo de montaña; otros
biomas, tamaños de grupo y tipos de inicio son extensiones futuras.

El alcance de implementación vigente se consulta en la hoja de ruta activa
[RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md); el
alcance histórico del prototipo Godot se conserva en
[RDM-001](../roadmap/RDM-001_first-playable-slice.md) (`deprecated`).
Futuros escenarios podrán variar población, lugar, relaciones, pertenencias
y condiciones (ver
[WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md),
sección 3.4), sin diseñarse en esta entrega.

## 4. Reglas aprobadas

Esta condición inicial no define una campaña lineal ni obliga a que el grupo
siga teniendo seis personas:

- Pueden admitir supervivientes y convertirse pronto en una comunidad mayor.
- Pueden rechazar gente.
- Una disputa puede provocar expulsiones o abandonos.
- Una expedición puede salir del mapa local o no regresar.
- Con cazadores, armas o capacidades diferentes pueden asumir riesgos
  distintos.
- Pueden permanecer como una comunidad pequeña o crecer con rapidez.
- El orden y la forma de resolver agua, comida, defensa, descanso y
  producción deben variar según la partida.

Seis no es un límite de población, una estructura familiar fija ni una
promesa de que todos sobreviven: es el punto de partida narrativo de la
primera versión, no un elenco de personajes ya diseñado.

El planteamiento del "primer año" solo identifica presiones plausibles como
refugio, agua, alimento, defensa, producción, invierno, relaciones y
exploración. **No constituye un calendario de hitos obligatorio.**

## 5. Interacciones con otros sistemas

- El flujo narrativo que da forma a los acontecimientos derivados de este
  punto de partida se rige por
  [NAR-001](../70-narrative/NAR-001_emergent-narrative.md).
- El crecimiento del refugio se rige por
  [SET-001](../40-settlement/SET-001_settlement-growth.md).
- La geografía procedural del mapa local de este escenario se rige por
  [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md); su
  representación, por
  [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md).

## 6. Casos límite o riesgos

Ninguno específico a este documento más allá de las preguntas abiertas.

## 7. Preguntas abiertas

Salvo que ya se deduzca lo contrario de este documento, quedan abiertas:

- La estación exacta de llegada.
- Los seis personajes concretos y sus relaciones iniciales.
- El edificio inicial y el grado de elección disponible.
- Las dimensiones y cantidades exactas del mapa local; su carácter
  procedural y ficticio de pueblo de montaña ya está cerrado en
  [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md).
- La población zombi inicial.
- La disponibilidad inicial de armas, agua, alimento y electricidad.
- La existencia y proximidad de otras comunidades.

Ver también `docs/OPEN-QUESTIONS.md`.

## 8. Ejemplos no normativos

Las presiones citadas en la sección 4 (refugio, agua, alimento, defensa,
producción, invierno, relaciones, exploración) son ejemplos de tensiones
plausibles, no un guion ni un calendario del primer año.
