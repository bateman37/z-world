---
id: DEC-0015
title: Esqueleto de SimulationStateV2 y migración V1→V2
status: approved
canonical_for:
  - forma completa de las entidades nuevas de WEB-002 dentro de SimulationStateV2, aunque la mayoría de sus colecciones empiecen vacías
  - estrategia de migración V1→V2 como traducción estructural del fixture existente, no como invocación del generador semántico
  - capa de invariantes relacionales adicional a la validación Zod
  - no destrucción del snapshot V1 al migrar
depends_on:
  - DEC-0014
related:
  - ARC-004
  - WLD-005
  - RDM-003
---

## Contexto

`WEB-002` es la especificación maestra del incremento 4+5 de `RDM-003`:
trabajos, necesidades, generador semántico del pueblo, edificios,
objetos, transporte, explotación de edificios, entorno mutable y
agricultura básica, todo como un sistema causal único. Dennis instruyó
expresamente ejecutar `WEB-002` por subhitos, en varias sesiones, sin
reducir ni reinterpretar la especificación maestra, pero también sin
fingir que puede implementarse correctamente de una sola vez. Esta
decisión registra el primer subhito (S1): la evolución determinista a
`SimulationStateV2` y la migración V1→V2, en su forma esquelética.

## Decisión

1. **`SimulationStateV2` es una forma completa desde S1, no un
   subconjunto.** Todas las entidades nuevas de §6.3 de `WEB-002`
   (lugares, edificios, plantas, estancias, aberturas, cierres,
   obstrucciones, anclajes, perímetros, mobiliario, contenedores,
   objetos de mundo, lotes de recursos, medios de transporte, cargas,
   puntos de transferencia, parcelas de cultivo, ciclos de cosecha,
   cambios de terreno, zonas de trabajo, designaciones, trabajos, fases,
   asignaciones, reservas, necesidades, historial de lugares, presión de
   saqueo y descubrimientos) existen como tipos y esquemas Zod reales en
   `packages/contracts` (`location-v2.ts`, `spatial-entities-v2.ts`,
   `objects-v2.ts`, `agriculture-v2.ts`, `place-history-v2.ts`,
   `work-v2.ts`, `needs-v2.ts`, `state-v2.ts`). Ninguna se pospone como
   tipo pendiente. Lo que sí se pospone es su población: la mayoría de
   las colecciones nacen vacías en S1, porque el generador semántico real
   (`WLD-005`) y el motor de trabajos/necesidades llegan en subhitos
   posteriores (S2 en adelante).
2. **Ubicación única por entidad (`EntityLocation`).** Toda entidad
   portátil o posicionable declara su ubicación mediante una única unión
   discriminada de diez variantes (§6.4 de `WEB-002`), nunca coordenadas
   sueltas y un campo de contenedor en paralelo que pudieran
   desincronizarse.
3. **La migración V1→V2 es traducción estructural, no generación.**
   `migrateV1ToV2` (`packages/simulation-core/src/v2/migrate-v1-to-v2.ts`)
   traduce el fixture y la cohorte de una partida `SimulationStateV1` ya
   existente a las formas V2 equivalentes: copia áreas/líneas/nodos con
   forma compatible, crea un `Place`+`Building` por estructura (perfil
   `RES-10` asumido, `interiorGenerated: false`), migra cada pertenencia a
   un `WorldObject` portado por su dueño y deriva necesidades iniciales
   heurísticamente del estado descriptivo de llegada. No invoca el
   generador semántico real: ese generador solo se usa al crear partidas
   nuevas después de S2, nunca en esta ruta de migración. Cada
   aproximación queda registrada en `migration.degradations`
   (`readonly string[]`), nunca de forma silenciosa.
4. **Capa de invariantes relacionales adicional a Zod.**
   `validateSimulationStateV2Invariants`
   (`packages/simulation-core/src/v2/invariants.ts`) comprueba lo que un
   esquema estructural no puede garantizar por sí solo: cantidades no
   negativas, ausencia de contención circular u orfandad entre
   contenedores, exclusividad de reserva de objetos/medios de transporte,
   que toda reserva referencie un trabajo real, y que ningún cierre
   instalado coincida con un objeto portátil. Se ejecuta tras la
   validación Zod, tanto al migrar como al cargar un snapshot V2.
5. **El snapshot V1 nunca se destruye ni se sobrescribe al migrar.**
   `saveMigratedV2Snapshot` (`packages/persistence/src/repository.ts`)
   persiste el resultado de la migración como una fila adicional de
   `SimulationSnapshot`, sin tocar `GameSave.currentSnapshotId` ni
   `GameSave.revision`: la partida sigue cargando y funcionando por la
   ruta V1 exactamente igual que antes de S1. Es idempotente (una
   segunda llamada con el mismo `reason` no duplica la fila) y
   transaccional (un fallo no deja filas huérfanas). Ningún flujo de la
   aplicación web invoca todavía esta migración de forma automática:
   sigue sin haber ningún consumidor real de `SimulationStateV2` hasta
   que el Worker y la interfaz lo necesiten (subhitos posteriores).

## Razones

- **Honestidad de alcance frente a la instrucción de Dennis.** Definir la
  forma completa evita que subhitos futuros descubran que faltaba una
  entidad y tengan que romper contratos ya probados; posponer solo la
  *población* (no la *forma*) evita fingir un generador semántico que
  todavía no existe.
- **Migración sin generación evita doble fuente de verdad.** Si la
  migración invocara el generador semántico real, dos partidas con la
  misma semilla —una nueva y otra migrada desde V1— producirían mundos
  distintos sin que ninguna decisión de diseño lo explique.
- **Invariantes relacionales como capa separada.** Zod certifica forma;
  no puede certificar relaciones cruzadas (ciclos, exclusividad). Sin
  esta capa, S3 (reservas) y S5 (trabajos) heredarían corrupción
  silenciosa.
- **No tocar el snapshot vigente.** Ningún sistema de la aplicación web
  sabe todavía leer `SimulationStateV2`; apuntar `currentSnapshotId` a un
  snapshot V2 real rompería la carga de partidas existentes sin ningún
  beneficio a cambio.

## Consecuencias

- S2 (generador semántico del pueblo) debe poblar `SemanticWorldV2` para
  partidas *nuevas* llamando al generador real, no reutilizando
  `migrateV1ToV2`. La migración esquelética de S1 sigue siendo la única
  ruta para partidas V1 preexistentes.
- S3 a S11 deben construir sobre las formas ya cerradas en
  `packages/contracts/src/{location,spatial-entities,objects,
  agriculture,place-history,work,needs,state}-v2.ts` sin renombrar ni
  reinterpretar sus campos; cualquier cambio de forma es una decisión
  nueva, no un ajuste silencioso.
- Ningún subhito puede declarar cerrados los puntos 4 y 5 de la
  instrucción de Dennis (trazabilidad de requisitos y cumplimiento
  completo de `WEB-002`) hasta que exista un consumidor real de
  `SimulationStateV2` en el Worker y en la interfaz, y hasta que todas
  las colecciones que hoy nacen vacías tengan contenido real y probado.
- `RDM-003` conserva sus incrementos 4 y 5 sin marcar `implemented`; solo
  S1 de `WEB-002` está completado técnicamente.

## Alternativas descartadas

- **Migrar invocando el generador semántico real desde S1**: se descarta
  porque el generador todavía no existe (llega en S2) y porque mezclar
  migración con generación produciría mundos no reproducibles para una
  misma semilla migrada dos veces.
- **Añadir las entidades nuevas de forma incremental, subhito a
  subhito, en vez de cerrar la forma completa en S1**: se descarta
  porque WEB-002 exige un sistema causal único; introducir tipos a
  cuentagotas arriesgaría reinterpretaciones de forma no coordinadas
  entre subhitos, exactamente lo que la instrucción de Dennis prohíbe.
- **Sobrescribir el snapshot V1 vigente con el resultado de la
  migración**: se descarta porque ningún consumidor sabe leer V2 todavía;
  hacerlo dejaría partidas existentes sin poder cargar.

## No decisión

Esta decisión no cierra el generador semántico del pueblo (S2), el motor
de resolución directa/D/B (S4), el sistema de trabajos y planificador
(S5), el ciclo causal de necesidades (S6), objetos/recursos/transporte
(S7-S8), explotación de edificios (S9), entorno mutable/agricultura (S10)
ni la persistencia final/interfaz/observabilidad (S11). Ninguno de esos
subhitos se declara completado por este documento.
