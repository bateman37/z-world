---
id: DEC-0016
title: Generador semántico determinista del pueblo (WEB-002 S2)
status: approved
canonical_for:
  - interpretación de conteo del presupuesto obligatorio de §7.2 de WEB-002 (total de construcciones derivado conjuntamente de vivienda/anexos/comercial, no muestreado de forma independiente)
  - reconciliación operativa de los ocho perfiles frente al catálogo máximo (anexos como subestructura, colapso como historia, franja comercial/técnica cubierta repitiendo COM-02/TAL-01)
  - extensiones aditivas al esqueleto de contratos de S1 (TerrainArea.placeId, LinearFeature.placeId, Opening.connectsOtherRoomId, SimulationStateV2.generationDegradations, PrngStateByDomainV2)
  - redondeo determinista de coordenadas antes de validar/persistir, para que la recarga desde PostgreSQL nunca difiera del estado generado
depends_on:
  - DEC-0015
related:
  - WLD-008
  - WLD-009
  - RDM-003
---

## Contexto

`WEB-002` §7-§9 exige un generador semántico determinista del pueblo
inicial que sustituya el fixture provisional de `WEB-001`, con un
presupuesto de construcciones y perfiles obligatorio por semilla válida.
Este es el subhito S2, sobre el esqueleto de `SimulationStateV2` aceptado
en S1 (`DEC-0015`). El presupuesto y la reconciliación de §7.2/§8.1 dejan
varias interpretaciones operativas abiertas que un generador y sus
pruebas necesitan compartir; esta decisión las cierra.

## Decisión

1. **El total de construcciones (55-85) es una derivación conjunta, no
   tres presupuestos independientes.** Muestrear vivienda (28-42),
   anexos (10-18) y comercial/técnico (6-10) de forma completamente
   independiente puede sumar tan poco como 44, por debajo del mínimo
   total. El generador elige primero un total objetivo dentro de
   `[55,85]`, deriva anexos y comercial/técnico dentro de sus propios
   rangos, y ajusta vivienda por resta (recortada a `[28,42]`), de modo
   que la suma real de construcciones generadas siempre cae dentro de
   `[55,85]` sin que ninguna categoría individual salga de su propio
   rango. `validateGeneratedVillage` recuenta los perfiles realmente
   generados (nunca confía en el objetivo interno) antes de aceptar la
   partida.
2. **Los cobertizos/garajes/anexos nunca son un `Place` propio.** Son
   `Building` adicionales que comparten el `placeId` de la vivienda a la
   que pertenecen físicamente (`interiorGenerated: false`, sin programa
   de estancias): cuentan hacia el total de construcciones, nunca hacia
   el recuento de perfiles.
3. **"Colapsada" es una condición de `PlaceHistory` (`historyKinds`
   incluye `collapse`) sobre una instancia ya soportada de `RES-10`,
   `RES-17`, `COM-02` o `TAL-01`**, nunca un arquetipo nuevo: el edificio
   colapsado conserva su huella y su perfil, pero no recibe programa de
   estancias (`interiorGenerated: false`).
4. **La franja "comercial/comunitaria/técnica" (6-10 construcciones) se
   cubre exclusivamente repitiendo instancias de `COM-02` y `TAL-01`**
   (con `BusinessProfile` distinto por instancia: tipo de negocio,
   estrato económico), tal como exige la reconciliación de §7.2. Ningún
   ayuntamiento, iglesia, farmacia, hospital, gasolinera, granja
   ganadera ni comisaría existe como lugar jugable en esta entrega.
5. **Extensiones aditivas, nunca disruptivas, al esqueleto de contratos
   de S1** (`packages/contracts`):
   - `TerrainArea.placeId` y `LinearFeature.placeId` (nulables): el
     esqueleto de S1 no preveía cómo un `Place` de perfil `ENV-02`/
     `ENV-03`/`ENV-04` referencia su geometría real (área o línea). Se
     añade el campo en el sentido inverso al ya existente
     `NaturalOrTechnicalNode.placeId`.
   - `Opening.connectsOtherRoomId` (nulable): el esqueleto de S1 solo
     preveía `connectsRoomId` (una estancia) más `connectsToExterior`,
     insuficiente para representar una puerta entre dos estancias
     interiores reales, que WEB-002 §17.1 exige ("hueco y espacios que
     conecta", plural).
   - `SimulationStateV2.generationDegradations` (`readonly string[]`,
     por defecto vacío): canal explícito para que el generador registre
     una degradación real (p. ej. un refugio fuera del rango de
     distancia acordado en una semilla concreta) sin ocultarla, del
     mismo modo que `migration.degradations` ya lo hacía para S1.
   - `PrngStateByDomainV2` (`packages/contracts/src/prng.ts`): la forma
     V1 (`cohort`/`fixture`/`navigation`) se congela explícitamente sin
     tocar, para no invalidar ningún snapshot V1 ya guardado; las
     partidas V2 usan una forma adicional con un cuarto stream `world`
     dedicado a la generación espacial/semántica.
   Todos los campos añadidos son opcionales o tienen valor por defecto:
   ninguna partida V1 ni snapshot migrado deja de validar por esta
   decisión.
6. **Redondeo determinista de coordenadas antes de validar y persistir**
   (`packages/simulation-core/src/v2/generator/round-state.ts`). El
   generador construye posiciones con `Math.cos`/`Math.sin` y divisiones,
   que producen números de 16-17 dígitos significativos; PostgreSQL
   JSONB no garantiza el redondeo IEEE-754 exacto de esos valores al
   recuperarlos (`§9`: "la recarga debe recuperar exactamente el mismo
   mundo"). Se descubrió con una prueba de integración real
   (`repository-v2.integration.test.ts`) que fallaba en el último dígito
   de una coordenada. La solución es redondear todo el estado a 6
   decimales (precisión de micras, irrelevante para un mundo medido en
   metros) antes de validar Zod/invariantes y antes de persistir: lo que
   se valida, lo que se compara en pruebas de determinismo y lo que se
   guarda son siempre la misma forma numérica exacta.
7. **Materialización completa, no solo estructuras espaciales.** S2
   genera programa de estancias, aberturas, mobiliario, contenedores,
   objetos de mundo, lotes de recurso, medios de transporte y una
   parcela de cultivo candidata para el escenario inicial acordado
   (§7.5). No genera todavía: motor de resolución de acciones,
   planificador de trabajos, necesidades causales evolutivas, transporte
   operativo ni explotación progresiva — esas colecciones
   (`workZones`, `designations`, `jobs`, `episodes`, `reservations`,
   `loadBundles`, `transferPoints`, `cropCycles`, `terrainChanges`)
   permanecen vacías, como permite explícitamente §6.2 de `WEB-002` para
   los subhitos que aún no las pueblan.

## Consecuencias

- El generador es determinista, versionado (`VILLAGE_GENERATOR_VERSION =
  "web-002-semantic-v1"`) y produce directamente un `SimulationStateV2`
  válido: nunca genera primero un V1 para migrarlo.
- `validateSimulationStateV2Invariants` se amplía (integridad referencial
  de toda `EntityLocation`, jerarquía espacial `Place → Building → Floor
  → Room`, unicidad global de ID) sin romper ninguna prueba de S1.
- La app web gana un segundo flujo de creación de partida
  (`createGameV2Action` → `/village/[gameSaveId]`) que demuestra el
  generador integrado en el arranque real, deliberadamente de solo
  lectura hasta que exista el motor de resolución (S4 en adelante).
- Fidelidad orgánica simplificada de forma documentada: el terreno usa
  polígonos irregulares deterministas ("blobs") reescalados por área
  exacta en vez de una simulación completa de relieve/hidrología; es
  suficiente para cumplir §7.2/§7.3 de forma verificable, pero no
  pretende ser el algoritmo definitivo de `WLD-008`.

## Alternativas consideradas

- Muestrear vivienda/anexos/comercial de forma totalmente independiente
  dentro de sus rangos: descartado porque, como demuestra el punto 1,
  puede incumplir el total obligatorio; una semilla "inválida" así nunca
  debería llegar a jugarse en silencio.
- Mantener `Opening` con un único `connectsRoomId` y modelar la
  conexión entre dos estancias con dos registros de `Opening` separados
  en la misma posición: descartado por introducir ambigüedad sobre cuál
  de los dos abre/cierra realmente el acceso y duplicar el
  `installedClosureId`.
