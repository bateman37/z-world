---
id: DEC-0014
title: Fundación del runtime web y contratos iniciales de simulación
status: approved
canonical_for:
  - prohibición expresa de portar código, datos o pruebas del prototipo Godot
  - estructura de paquetes de la línea web y sus fronteras de dependencia
  - Web Worker como runtime activo del núcleo de simulación
  - modelo de comandos/eventos/proyecciones del núcleo
  - estrategia híbrida de persistencia (snapshot + eventos, sin event sourcing integral)
  - estrategia de determinismo y PRNG del núcleo
  - valores técnicos provisionales del primer incremento (paso de simulación, radio de observación, velocidad de desplazamiento, resolución de niebla y de navegación)
depends_on:
  - DEC-0008
  - DEC-0009
  - DEC-0011
related:
  - ARC-001
  - ARC-002
  - ARC-004
  - CHR-006
  - UI-003
  - RDM-003
---

## Contexto

`DEC-0008` decidió el reinicio de la línea activa de código a
Node.js/TypeScript/Next.js/PostgreSQL. `DESIGN-005` a `DESIGN-008`
cerraron después el mapa local, el motor híbrido de resolución
(`DEC-0011`), el primer escenario de llegada (`DEC-0012`) y el catálogo
implementable (`DEC-0013`), pero ninguna decisión anterior fijaba todavía
cómo se organiza el código de la nueva línea, cómo se ejecuta el núcleo de
simulación en el navegador, ni cómo persiste una partida real. `WEB-001`
construye la primera entrega ejecutable de esa línea —fundación técnica,
runtime, cohorte protagonista y mapa local operativo— y esta decisión
registra las elecciones técnicas transversales que esa construcción
necesitó cerrar para no dejarlas implícitas en el código.

## Decisión

1. **Prohibición expresa de portar Godot.** La implementación web es un
   reinicio limpio, no una migración: no se copió, tradujo, adaptó ni
   envolvió código GDScript; no se reutilizaron escenas, nodos, señales,
   autoloads, constantes, valores de equilibrio, fixtures ni algoritmos del
   prototipo; no se usaron sus pruebas como oráculo de comportamiento. La
   única herencia permitida fue la documentación canónica vigente. El
   prototipo histórico (`src/`, `scenes/`, `tests/`, `project.godot`) se
   conserva íntegro como referencia histórica, sin minarse en busca de
   soluciones.
2. **Estructura de paquetes y fronteras.** `npm workspaces` con
   `apps/web` (Next.js/React/Canvas) y cinco paquetes con dependencias
   unidireccionales: `packages/contracts` (tipos y esquemas Zod
   compartidos), `packages/catalogs` (datos versionados de característica/
   habilidad/prioridad/frase de potencial/textos de interfaz),
   `packages/simulation-core` (TypeScript puro: PRNG, reloj, generación de
   cohorte, fixture espacial, navegación, niebla, reductor de comandos),
   `packages/persistence` (Prisma/PostgreSQL) y `packages/application`
   (protocolo y sesión del Worker). El núcleo no importa Next.js, React,
   Prisma ni APIs de navegador; la persistencia no contiene reglas de
   juego; la presentación nunca modifica directamente el estado canónico.
3. **Web Worker como runtime activo.** El Worker posee el estado
   `SimulationStateV1` autoritativo de la sesión; React solo emite
   comandos tipados y consume proyecciones de solo lectura. El protocolo
   (`packages/contracts/worker-protocol.ts`) declara versión explícita y
   distingue payload inválido de versión incompatible con mensajes de
   error tipados, nunca con excepciones no controladas.
4. **Modelo de comandos, eventos y proyecciones.** Los comandos son una
   unión discriminada validada (`initialize_scenario`, `set_pause`,
   `set_speed`, `order_direct_move`, `cancel_direct_order`,
   `update_priority`); los eventos de dominio representan límites
   causales auditables, nunca telemetría por fotograma. Las proyecciones
   (`WorkerProjections`) excluyen explícitamente calibre oculto, potencial
   numérico real y cualquier campo que permita inferirlos.
5. **Paso de simulación y relación con el render.** El núcleo avanza en
   pasos de un segundo simulado; el Worker calcula cuánto tiempo real
   transcurrió (mediante `Date.now()`, nunca dentro del núcleo) y se lo
   pasa como segundos ya acumulados. El Canvas interpola visualmente sin
   escribir estado canónico. Un día completo sigue equivaliendo a 20
   minutos reales a ×1 (`ARC-004`).
6. **Estrategia híbrida de persistencia.** `SimulationSnapshot` es la
   fuente autoritativa de carga; `DomainEventRecord` es auditoría causal.
   No se implementa event sourcing integral en esta entrega. El Worker
   nunca escribe en base de datos: emite `snapshot_ready` y la
   orquestación (server actions de Next.js) confirma con
   `snapshot_persisted` o informa `snapshot_persist_failed`.
7. **Esquema, versiones y revisión optimista.** `GameSave.revision` es
   monotónica; cada guardado exige la revisión esperada y el servidor
   rechaza una revisión obsoleta (`RevisionConflictError`) en vez de
   fusionar o sobrescribir en silencio. Cargar valida siempre esquema y
   contenido (`parseSimulationStateV1`); un snapshot corrupto o
   incompatible produce un error explícito, nunca una regeneración por
   semilla.
8. **Determinismo y PRNG.** PRNG determinista `mulberry32` con streams
   independientes por dominio (`cohort`, `fixture`, `navigation`),
   derivados de la semilla mediante un hash `xmur3`. Prohibido
   `Math.random()` en núcleo, catálogos generativos y Worker. La misma
   semilla, versión y secuencia de comandos produce siempre el mismo
   resultado, con independencia de la cadencia de llamada o la velocidad
   del reloj.
9. **Catálogo final desde el primer día.** La nueva línea web usa
   directamente las nueve características y las 34 habilidades cerradas
   en `CHR-006` (escala real `0–10`, media humana `4`) y las 34
   prioridades en nueve bloques cerradas en `UI-003`, no los recortes de
   once habilidades o diez prioridades del prototipo Godot.
10. **Fixture de llegada como soporte técnico temporal.** El sector de
    llegada (300 × 300 m) es un fixture procedural determinista dentro de
    los contratos definitivos del mundo (puntos, líneas, áreas,
    estructuras), preparado para escalar hacia el presupuesto futuro de
    ~3 × 3 km sin cambiar contratos. No es el generador semántico completo
    de `WLD-008`/`WLD-009`, que sigue pendiente.
11. **Algoritmos provisionales de navegación y niebla.** Rejilla técnica
    de 5 m de resolución derivada de la geometría semántica, con
    búsqueda de ruta A* determinista; niebla en rejilla separada, también
    de 5 m, con radio de observación provisional de 25 m común a todos
    los protagonistas. Velocidad base de desplazamiento provisional de
    1,4 m/s. Ninguno de estos valores es una regla de diseño canónica:
    son parámetros técnicos centralizados, medidos y reemplazables sin
    reescribir la interfaz.
12. **Sin compatibilidad con guardados de Godot.** El esquema de
    persistencia es exclusivo de la nueva línea; no existe ni se planea
    conversión desde partidas guardadas del prototipo.

## Razones

- **Honestidad de alcance.** Cerrar estos valores como "provisionales,
  documentados y centralizados" evita que decisiones técnicas ordinarias
  se disfracen de reglas de diseño, y evita igualmente que se repita la
  ambigüedad ya vivida entre el alcance implementado y el horizonte
  máximo en la línea Godot.
- **Coherencia arquitectónica.** Las cinco capas con dependencias
  unidireccionales permiten añadir el primer bucle causal completo
  (explorar → descubrir → trabajar → recoger → transportar → cubrir una
  necesidad) sin romper contratos ya probados.
- **Trazabilidad.** El fixture, la rejilla de navegación y la niebla usan
  ya el formato de datos definitivo del mundo semántico, de modo que el
  generador completo de `WLD-008` podrá sustituir al fixture sin migrar
  el núcleo ni la persistencia.

## Consecuencias

- Todo incremento futuro que necesite ajustar radio de observación,
  resolución de niebla/navegación o velocidad base debe hacerlo en los
  puntos centralizados que esta decisión referencia
  (`packages/simulation-core/src/fog.ts`,
  `packages/simulation-core/src/navigation-grid.ts`,
  `packages/simulation-core/src/advance-simulation.ts`), no dispersarlo
  en la interfaz.
- El primer bucle causal completo, el motor general de resolución
  (`ARC-006`–`ARC-008`), el generador semántico completo y el mundo
  mutable siguen fuera de esta entrega y no deben marcarse como
  implementados.
- Esta decisión no fija ninguna fórmula de calibración final del motor de
  resolución: `ARC-006`–`ARC-008` conservan sus preguntas abiertas.

## Alternativas descartadas

- **Ejecutar la simulación en el hilo principal de React**: se descarta
  porque acoplaría el ritmo del núcleo al de re-render de React,
  contradiciendo la separación de capas exigida por `ARC-004`.
- **Event sourcing integral** (reconstruir el estado completo reproduciendo
  todos los eventos): se descarta para esta entrega por complejidad
  desproporcionada frente al beneficio; el snapshot ya cubre la carga
  real y los eventos bastan como auditoría causal.
- **Persistir la rejilla de navegación como parte de `SimulationStateV1`**:
  se descarta porque es una derivación técnica reconstruible de forma
  determinista a partir del fixture ya persistido (`world`), y persistirla
  directamente habría exigido codificar estructuras no representables de
  forma inequívoca en JSON (`Uint8Array`/`Float32Array`).

## No decisión

Esta entrega no cierra la fórmula final de ninguna de las 22 decisiones
pendientes de calibración del motor de resolución (`P01`–`P22` ya
cerradas conceptualmente en `DEC-0011`, pero con constantes numéricas
todavía abiertas en `ARC-006`–`ARC-008`), no amplía `RDM-001` ni el
horizonte de `RDM-002`, y no implementa el generador semántico completo,
el sistema de objetos, el entorno mutable ni ninguna amenaza.
