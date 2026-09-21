---
id: WLD-001
title: Escalas del mundo
status: approved
canonical_for:
  - mapa local
  - mapa estratégico
  - relación entre escalas
depends_on: []
related:
  - VIS-002
  - SET-001
  - SOC-001
  - WLD-002
  - WLD-003
  - WLD-008
  - UI-005
  - UI-006
  - DEC-0010
---

## 1. Propósito

Definir las escalas de representación del mundo de Z-World y su relación.

## 2. Principios que no deben romperse

- El detalle de lo cercano es profundo; lo lejano puede simularse de forma
  más abstracta y materializar mayor detalle cuando se vuelve relevante.
- Las dos escalas no se mezclan como si tuvieran el mismo nivel de detalle:
  el mapa regional no obliga a simular cada persona, edificio y objeto con
  fidelidad local.

## 3. Modelo funcional

Existen dos escalas complementarias:

1. **Mapa local de la comunidad**: escala detallada donde se observa y
   gestiona el asentamiento, sus habitantes, edificios, terrenos cercanos,
   defensas, producción y amenazas inmediatas. Su **representación activa**
   es un mapa 2D cenital sobre Canvas del navegador (ver
   [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md)); su
   geografía se genera según
   [WLD-008](WLD-008_local-procedural-map-generation.md). Las referencias a
   un «mapa local 3D» en documentos históricos describen el prototipo Godot
   (ver [DEC-0008](../decisions/DEC-0008_simulation-first-web-architecture.md)),
   no la representación activa. Una posible presentación 3D futura no forma
   parte del alcance actual y no altera el modelo semántico.
2. **Mapa regional (estratégico)**: mucho mayor, para exploración, rutas,
   comunidades, expediciones, puestos y cambios regionales. Se desarrolla en
   [WLD-003](WLD-003_strategic-world-and-regional-simulation.md) y es un
   horizonte futuro, no una implementación inmediata.

### 3.1 Frontera funcional entre escalas

La frontera es principalmente funcional, no una cifra cerrada de kilómetros:

- si se observa a la persona desplazarse y actuar minuto a minuto, ocurre en
  el mapa local;
- si el desplazamiento requiere horas o días, suministros, ruta y una
  expedición, pertenece al mapa regional.

Las dimensiones exactas en metros, kilómetros, casillas o hexágonos siguen
abiertas.

### 3.2 Interior de edificios

El interior de un edificio **no** constituye por defecto un tercer mapa
separado ni una pantalla de misión: forma parte del detalle del mapa local.

- El edificio aparece inicialmente como volumen, huella o tejado.
- Su interior se revela progresivamente mediante observación, accesos y
  entrada (ver
  [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md),
  sección 3.8).
- Habitaciones, puertas, mobiliario, instalaciones y contenedores se
  representan por capas cuando corresponda.
- Varias plantas pueden resolverse mediante capas o planta activa; su
  interfaz visual definitiva sigue abierta.

No se diseña un cambio obligatorio de escena cada vez que alguien entra en
una casa.

## 4. Reglas aprobadas

- La escala local detallada sigue vigente y su representación activa es un
  mapa 2D cenital sobre Canvas; las referencias al mapa local 3D describen
  el prototipo histórico Godot (ver
  [DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md)).
- La estructura interna del mapa regional (regiones, celdas o hexágonos) es
  una dirección de diseño aprobada para documentar y explorar, no una
  implementación cerrada ni una estética obligatoria. **El mapa regional no
  es jugable todavía** y no forma parte del roadmap activo (ver
  [RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md)); el
  alcance histórico del prototipo Godot se conserva en
  [RDM-001](../roadmap/RDM-001_first-playable-slice.md), `deprecated`. Su
  exploración, información y transición de escala siguen abiertas.
- El mapa local es donde ocurre la gestión detallada del asentamiento (ver
  [SET-001](../40-settlement/SET-001_settlement-growth.md)) y donde se aplica
  el modelo de exploración e información de
  [WLD-002](WLD-002_local-exploration-and-information.md).
- El mapa regional es donde otras comunidades y el mundo exterior viven de
  forma más abstracta (ver
  [SOC-001](../50-society/SOC-001_living-community.md)).
- El horizonte máximo del mapa regional (representación 2D geográfica,
  regiones internas, niebla de guerra, expediciones, materialización de
  detalle semántico y simulación regional) se desarrolla en
  [WLD-003](WLD-003_strategic-world-and-regional-simulation.md), sin cerrar
  todavía la escala numérica y el tamaño total, que siguen abiertos.

## 5. Interacciones con otros sistemas

- El asentamiento (dominio 40) existe dentro del mapa local.
- Las comunidades externas (dominio 50) existen principalmente en el mapa
  regional, con posible materialización de detalle **semántico** cuando el
  jugador se acerca o interactúa. Materializar detalle semántico no
  significa abrir un mapa local nuevo, cambiar de pantalla ni generar una
  misión táctica independiente (ver
  [ARC-003](../90-architecture/ARC-003_multiscale-simulation-principles.md)
  y [WLD-003](WLD-003_strategic-world-and-regional-simulation.md), sección
  3.3).
- La generación espacial del mapa local se rige por
  [WLD-008](WLD-008_local-procedural-map-generation.md); su representación,
  por [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md); la
  interacción contextual con sus lugares, por
  [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md).

## 6. Casos límite o riesgos

- Presentar el mapa local 3D del prototipo Godot como representación activa
  contradiría la sección 3 y
  [DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md).
- Tratar el interior de un edificio como una escena aparte contradiría la
  sección 3.2.

## 7. Preguntas abiertas

- Escala, tamaño y resolución exactas de la estructura interna del mapa
  regional (regiones, celdas o hexágonos).
- Mecanismo exacto de transición entre el mapa regional y el mapa local.
- Dimensiones exactas del mapa local (ver
  [WLD-008](WLD-008_local-procedural-map-generation.md), sección 7).

Ver también `docs/OPEN-QUESTIONS.md`.

## 8. Ejemplos no normativos

Ninguno.
