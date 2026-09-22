---
id: SCN-001
title: Llegada al pueblo de montaña
status: approved
canonical_for:
  - punto de entrada y síntesis del primer escenario
  - filosofía general del escenario y elementos fijos frente a procedurales
depends_on:
  - SCN-002
  - SCN-003
related:
  - VIS-001
  - SET-001
  - NAR-001
  - RDM-003
  - WLD-003
  - WLD-008
  - WLD-009
  - UI-005
  - DEC-0012
---

## 1. Propósito

Registrar el primer escenario de Z-World como una **condición inicial**
concreta, reconocible entre partidas y plenamente reproducible, sin
convertirse en una historia o campaña obligatoria. Este documento es el
**punto de entrada y síntesis** del escenario: enlaza las fuentes
detalladas que cierran cada responsabilidad concreta sin duplicarlas.

- La cohorte de seis protagonistas, su distribución mínima de calibre
  oculto, su cobertura funcional y su red de relaciones se definen en
  [SCN-002](SCN-002_initial-survivor-cohort.md).
- El momento exacto de llegada, el estado físico, las pertenencias, el
  refugio provisional, las carencias, las garantías de semilla, la
  amenaza inicial y la presencia humana incierta se definen en
  [SCN-003](SCN-003_first-day-starting-state.md).
- El presupuesto numérico del mapa local (construcciones, red viaria,
  agua, cobertura de terreno y puntos de interés) se define en
  [WLD-009](../20-world/WLD-009_initial-mountain-village-profile.md).
- El contrato transversal que explica por qué el escenario combina una
  situación fija con personas y mundo procedurales se registra en
  [DEC-0012](../decisions/DEC-0012_first-arrival-scenario-contract.md).

## 2. Principios que no deben romperse

- Este escenario define un punto de partida, no una secuencia de eventos
  garantizada. El resultado debe proceder de la simulación, las
  decisiones del jugador y las condiciones concretas de la partida.
- El grupo inicial de seis no debe tratarse como una población fija: la
  comunidad puede crecer, reducirse, dividirse o transformarse desde el
  primer momento.
- El escenario debe ser reconocible entre partidas (mismo momento,
  mismo tono, mismas garantías) sin convertirse en una campaña
  guionizada: no existe secuencia obligatoria de tareas, misión lineal,
  líder predeterminado, refugio definitivo correcto, ni garantía de que
  los seis permanezcan juntos o sobrevivan (ver
  [DEC-0012](../decisions/DEC-0012_first-arrival-scenario-contract.md)).

## 3. Modelo funcional

### 3.1 Síntesis narrativa

Seis supervivientes adultos han huido juntos de su lugar de origen
ayudándose entre ellos y llegan, tras cuatro días de marcha, a un pueblo
de montaña ficticio y procedural, aparentemente deshabitado, a las 17:30
del Día 1, aproximadamente seis semanas después del colapso general, con
unas dos horas de luz útil por delante. Llegan cansados, con recursos
escasos y sin asentamiento. El detalle completo de este momento y del
estado del grupo es responsabilidad de
[SCN-003](SCN-003_first-day-starting-state.md).

El primer problema plausible es convertir un edificio existente en un
refugio provisional: inspeccionarlo, reunir allí las pertenencias,
descansar, conseguir agua, buscar comida, cerrar accesos y explorar el
mapa local (ver [SET-001](../40-settlement/SET-001_settlement-growth.md)
para la diferencia entre refugio provisional y asentamiento elegido). El
edificio no es una construcción vacía creada por el jugador: como
cualquier edificio de este escenario, se genera como composición de
estancias, accesos, instalaciones y sistemas mediante
[WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md)
y [CAT-002](../catalogs/CAT-002_rooms-modules-and-building-systems.md).

### 3.2 Mapa local

El mapa local es un espacio de gestión con edificios existentes,
terreno, caminos, recursos naturales, puntos de agua y zonas peligrosas.
Su representación activa es 2D cenital sobre Canvas (ver
[UI-005](../80-interface/UI-005_top-down-simulation-workbench.md)); las
descripciones históricas de este escenario como «espacio 3D» corresponden
al prototipo Godot (ver
[DEC-0008](../decisions/DEC-0008_simulation-first-web-architecture.md) y
[DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md)).

La geografía es **procedural y ficticia**: un pueblo de montaña generado
dentro del perfil controlado de
[WLD-008](../20-world/WLD-008_local-procedural-map-generation.md), con el
presupuesto numérico concreto de
[WLD-009](../20-world/WLD-009_initial-mountain-village-profile.md), nunca
la reproducción literal de un municipio real. Su distribución varía
entre partidas de forma coherente, sin que una semilla pueda producir una
gran ciudad ni los arquetipos excluidos en `WLD-008`, sección 3.5. El
primer escenario mantiene el tema de pueblo de montaña; otros biomas,
tamaños de grupo y tipos de inicio son extensiones futuras.

El alcance de implementación vigente se consulta en la hoja de ruta
activa [RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md);
el alcance histórico del prototipo Godot se conserva en
[RDM-001](../roadmap/RDM-001_first-playable-slice.md) (`deprecated`).
Futuros escenarios podrán variar población, lugar, relaciones,
pertenencias y condiciones (ver
[WLD-003](../20-world/WLD-003_strategic-world-and-regional-simulation.md),
sección 3.4), sin diseñarse en esta entrega.

### 3.3 Cohorte protagonista

Los seis supervivientes iniciales son protagonistas de esta partida, no
población corriente elegida sin restricciones: aplican la distribución
mínima de calibre oculto, la cobertura funcional colectiva y la red de
relaciones cerradas en
[SCN-002](SCN-002_initial-survivor-cohort.md). El calibre oculto
permanece totalmente invisible al jugador, exactamente igual que en el
resto del mundo (ver
[CHR-007](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md)).

## 4. Elementos fijos frente a procedurales

### 4.1 Elementos fijos

- Seis supervivientes adultos que han huido juntos.
- Llegada a las 17:30 del Día 1, tras cuatro días de marcha.
- Primera mitad de abril, aproximadamente seis semanas después del
  colapso general.
- Pueblo pequeño de montaña, ficticio y procedural.
- Grupo cansado, con recursos escasos y sin asentamiento.
- Refugio provisional garantizado cerca del punto de llegada, pero nunca
  entregado como seguro ni definitivo.
- Aproximadamente dos horas de luz útil por delante.
- Amenaza zombi local baja, real y finita.
- Varias necesidades incompatibles con el tiempo y la capacidad
  disponibles.

Detalle completo en
[SCN-003](SCN-003_first-day-starting-state.md).

### 4.2 Elementos procedurales

- Identidades, edades adultas, género, apariencia y biografías de los
  seis protagonistas.
- Capacidades actuales, potenciales, adaptación y rasgos, dentro de la
  distribución mínima de calibre de
  [SCN-002](SCN-002_initial-survivor-cohort.md).
- Relaciones concretas y acontecimiento compartido reciente.
- Tiempo meteorológico dentro de la banda permitida.
- Geografía, edificios, estancias, ocupantes anteriores, contenido e
  historia, dentro del presupuesto de
  [WLD-009](../20-world/WLD-009_initial-mountain-village-profile.md).
- Posición del grupo y candidatos a refugio.
- Distribución exacta de zombis dentro del presupuesto de `12–30`.
- Pertenencias variables y estado de conservación.
- Saqueo, señales humanas y comunidades regionales.

### 4.3 Elementos que no son fijos

- No existe una secuencia obligatoria de tareas.
- No existe una misión «haz A, después B y después C».
- No existe un líder predeterminado.
- No existe un refugio definitivo correcto.
- No existe una garantía de que los seis permanezcan juntos o sobrevivan.
- No existe una configuración fija de profesiones.
- No existe una pelea tutorial forzada.

El escenario define condiciones iniciales y restricciones del generador.
La historia posterior emerge de las personas, el mundo, las decisiones y
los eventos, coherente con
[NAR-001](../70-narrative/NAR-001_emergent-narrative.md). Pueden admitir
supervivientes y convertirse pronto en una comunidad mayor, rechazar
gente, sufrir expulsiones o abandonos por disputas, perder una expedición
que no regresa, asumir riesgos distintos según sus armas o capacidades, y
permanecer pequeños o crecer con rapidez. El orden y la forma de resolver
agua, comida, defensa, descanso y producción debe variar según la
partida. Seis no es un límite de población, una estructura familiar fija
ni una promesa de que todos sobreviven.

## 5. Interacciones con otros sistemas

- La cohorte protagonista, su calibre oculto y su red de relaciones se
  rigen por [SCN-002](SCN-002_initial-survivor-cohort.md).
- El estado de llegada, las pertenencias, el refugio provisional, las
  garantías de semilla y la amenaza inicial se rigen por
  [SCN-003](SCN-003_first-day-starting-state.md).
- El presupuesto numérico del mapa local se rige por
  [WLD-009](../20-world/WLD-009_initial-mountain-village-profile.md); la
  geografía procedural del mapa local de este escenario se rige por
  [WLD-008](../20-world/WLD-008_local-procedural-map-generation.md); su
  representación, por
  [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md).
- El flujo narrativo que da forma a los acontecimientos derivados de este
  punto de partida se rige por
  [NAR-001](../70-narrative/NAR-001_emergent-narrative.md).
- El crecimiento del refugio y la diferencia entre refugio provisional y
  asentamiento elegido se rigen por
  [SET-001](../40-settlement/SET-001_settlement-growth.md).
- El contrato transversal que respalda la combinación de elementos fijos
  y procedurales se registra en
  [DEC-0012](../decisions/DEC-0012_first-arrival-scenario-contract.md).

## 6. Casos límite o riesgos

Ninguno específico a este documento más allá de las preguntas abiertas.
Ver los casos límite propios de
[SCN-002](SCN-002_initial-survivor-cohort.md#6-casos-límite-o-riesgos) y
[SCN-003](SCN-003_first-day-starting-state.md#6-casos-límite-o-riesgos).

## 7. Preguntas abiertas

Las preguntas sobre estación exacta, composición y relaciones de la
cohorte, edificio inicial, dimensiones y presupuesto del mapa local,
población zombi inicial, disponibilidad inicial de armas, agua, alimento
y electricidad, y existencia de otras comunidades, quedan **cerradas por
esta entrega** (`DESIGN-007`); ver el detalle en
[SCN-002](SCN-002_initial-survivor-cohort.md),
[SCN-003](SCN-003_first-day-starting-state.md),
[WLD-009](../20-world/WLD-009_initial-mountain-village-profile.md) y la
trazabilidad completa en
[DISC-0006](../discovery/DISC-0006_first-arrival-scenario-traceability.md).

Quedan abiertas, por pertenecer a otros sistemas: algoritmos geométricos
exactos del mapa (`WLD-008`, `WLD-009`); combate detallado, infección y
variantes de zombis (`THR-001`, `THR-002`); distribución global de
calibre de la población mundial (`CHR-007`); interfaz gráfica concreta;
subconjunto técnico exacto de `CAT-004` para una implementación futura.

Ver también `docs/OPEN-QUESTIONS.md`.

## 8. Ejemplos no normativos

La síntesis narrativa de la sección 3.1 es ilustrativa del tono del
escenario, no un guion ni un calendario del primer año. Ver los ejemplos
concretos y no normativos en
[SCN-002 §8](SCN-002_initial-survivor-cohort.md#8-ejemplos-no-normativos),
[SCN-003 §8](SCN-003_first-day-starting-state.md#8-ejemplos-no-normativos)
y
[WLD-009 §8](../20-world/WLD-009_initial-mountain-village-profile.md#8-ejemplos-no-normativos).
