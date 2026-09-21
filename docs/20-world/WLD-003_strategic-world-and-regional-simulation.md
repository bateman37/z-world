---
id: WLD-003
title: Mundo estratégico y simulación regional
status: approved
canonical_for:
  - horizonte máximo del mapa regional y su representación 2D geográfica
  - expediciones y materialización de detalle semántico de una zona
  - ausencia de mapa local automático por punto regional
  - simulación de comunidades y amenazas lejanas
depends_on:
  - WLD-001
related:
  - VIS-003
  - SOC-003
  - ARC-003
  - NAR-002
  - WLD-008
  - UI-006
  - RDM-003
  - DEC-0010
---

## 1. Propósito

Definir el horizonte máximo del mundo estratégico regional: sus dos escalas
conectadas, su representación 2D geográfica bajo niebla, las expediciones,
la materialización de detalle **semántico** de una zona y la simulación de
lo que ocurre lejos del asentamiento.

## 2. Principios que no deben romperse

- El mundo lejano no se congela. Comunidades, amenazas y rutas cambian.
- El estado regional inicial es posterior a un colapso plausible; no
  aparecen comunidades estables de decenas de miles de personas sin
  historia.
- [SCN-001](../scenarios/SCN-001_mountain-village-arrival.md) sigue siendo
  el primer inicio; este documento no lo sustituye.
- Este documento describe un **horizonte futuro coherente**, no una entrega
  de implementación inmediata: el mapa regional no forma parte del roadmap
  activo (ver
  [RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md)).

## 3. Modelo funcional

El mundo completo tiene dos escalas conectadas (ver
[WLD-001](WLD-001_world-scales.md)):

- **Mapa local de la comunidad**, con personas, edificios, trabajo,
  producción, defensas y amenazas inmediatas. Su representación activa es 2D
  cenital sobre Canvas (ver
  [UI-005](../80-interface/UI-005_top-down-simulation-workbench.md)) y su
  geografía se genera según
  [WLD-008](WLD-008_local-procedural-map-generation.md).
- **Mapa regional**, con niebla de guerra, rutas, comunidades, expediciones,
  puestos y cambios regionales.

### 3.0 Representación aprobada del mapa regional

La dirección aceptada es un mapa regional:

- 2D;
- visualmente geográfico, topográfico y continuo;
- procedural y ficticio;
- cubierto por niebla e información incompleta;
- apoyado **internamente** en regiones, celdas o hexágonos invisibles y una
  red de rutas;
- capaz de mostrar carreteras, caminos, ríos, relieve, poblaciones,
  comunidades, señales y puntos de interés.

Una región interna puede representar una zona geográfica —bosque, valle
agrícola, carretera, suburbio, pueblo, instalación, río, montaña o área
urbana— y puede existir una capa o superposición técnica cuando sea útil
para planificar. **No se impone una cuadrícula hexagonal como estética
dominante.** Forma, resolución, escala, visibilidad definitiva y tamaño
total siguen abiertos.

### 3.1 Niebla de guerra e información

La niebla tiene niveles de conocimiento. Antes de visitar pueden conocerse
terreno aproximado, humo, ruido, radio, carreteras, rumores o movimientos.
La información puede ser incompleta, antigua o falsa según
[NAR-002](../70-narrative/NAR-002_memory-and-causal-world-history.md).

### 3.2 Expediciones

Una expedición es un grupo de `1 a X` supervivientes que abandona la zona de
confort y se desplaza realmente por el mapa regional. **No** es solamente
pulsar un destino y recibir una recompensa, ni una lista desconectada de
misiones.

El jugador forma expediciones con destino, integrantes, recursos y
orientación general de riesgo. El viaje se simula estratégicamente y
presenta decisiones relevantes; puede llegar a incluir ruta, duración,
suministros, campamentos, desvíos, caminos bloqueados, descubrimientos,
cambios de plan, encuentros, pérdida o mantenimiento de comunicación, y
regreso, demora o desaparición. No crea una campaña paralela de control
manual constante. El flujo exacto queda abierto y no contradice que
[UI-001](../80-interface/UI-001_interaction-and-command-model.md) evite
formularios para cada tarea local.

El selector local `Auto / 1 / 2 / 3 / 4` de
[UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md)
**no** limita el tamaño de una expedición: es la interfaz de un equipo
operativo local. Dentro de una expedición grande, una acción concreta podría
ser realizada por un equipo local menor cuando ese sistema se diseñe. El
valor máximo de `X`, la interfaz, las fórmulas, la frecuencia de eventos, la
composición exacta y el control durante el viaje siguen abiertos.

### 3.3 Detalle regional y materialización semántica

Una zona puede revelar recursos, amenazas, rutas, comunidades y lugares
especiales. Puede convertirse en puesto, colonia, aliado, ruta comercial u
objetivo de recuperación. Al volverse relevante, una zona gana detalle
**semántico** respetando su historia resumida (ver
[ARC-003](../90-architecture/ARC-003_multiscale-simulation-principles.md)).

**Materializar detalle semántico no equivale a abrir un mapa local.** Queda
expresamente descartado como decisión actual que cada punto regional
visitado deba generar o abrir automáticamente un mapa local detallado. Sigue
abierto, para el futuro, si ciertos lugares excepcionales podrán resolverse
de forma regional, mostrar detalle contextual, usar una vista específica,
reutilizar el mapa local o generar otra representación; esta entrega no
elige ninguna de esas posibilidades (ver
[DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md)).

### 3.3.1 Mundo conocido creciente

El mapa regional comienza con una fracción mínima de información:
asentamiento propio, algunas rutas o referencias cercanas, lugares
recordados, observados, documentados o mencionados, indicios como humo,
radio, señales, sonidos o rumores, y grandes zonas desconocidas.

La exploración amplía progresivamente la red conocida, desde pocos destinos
hasta cientos o potencialmente muchos más, usando abstracción regional y sin
simular cada punto con detalle local. Los números «unos veinte puntos
iniciales» y «hasta mil puntos con el tiempo» son ejemplos de escala mental,
**no contratos numéricos**.

Un punto regional puede representar, por ejemplo: pueblo o núcleo urbano;
granja o instalación aislada; puente o paso de montaña; gasolinera;
hospital; torre o repetidor; comunidad; campamento; área de caza;
concentración de amenazas; o una señal todavía sin identificar. Esta lista
no es un catálogo cerrado.

### 3.3.2 Geografía regional procedural

El mapa regional inicial también se concibe como **geografía procedural
controlada y ficticia**, no como una reproducción literal de Cataluña,
Aragón, Andorra o Francia; esos territorios solo ilustran la magnitud
imaginada durante el diseño. El generador regional futuro deberá impedir que
una semilla cree complejidad no soportada: las grandes ciudades requerirán
perfiles y soluciones específicas, igual que en el mapa local (ver
[WLD-008](WLD-008_local-procedural-map-generation.md), sección 3.5).

### 3.4 Estado regional inicial

Grandes ciudades pudieron intentar ser controladas por autoridades o
ejército y caer de formas distintas. Familias, puestos, trabajadores,
supervivientes y restos militares pueden ser semillas de comunidades
posteriores.

Futuros inicios pueden variar población, lugar, relaciones, pertenencias y
condiciones sin diseñar ahora su generador completo.

## 4. Reglas aprobadas

- El mapa estratégico completo conecta las dos escalas descritas en la
  sección 3, ampliando la relación ya aprobada en
  [WLD-001](WLD-001_world-scales.md).
- La materialización de una zona no reescribe su historia previa (ver
  [ARC-003](../90-architecture/ARC-003_multiscale-simulation-principles.md)).
- Ningún punto regional obliga a generar o abrir automáticamente un mapa
  local detallado (sección 3.3).
- El mapa regional es 2D, geográfico y continuo; su estructura interna de
  regiones o hexágonos no se impone como estética dominante (sección 3.0).
- Una expedición es un desplazamiento real por el mapa regional, no una
  lista de misiones ni una recompensa por pulsar un destino (sección 3.2).
- El mapa regional es un horizonte futuro documentado; su implementación no
  forma parte del roadmap activo
  ([RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md)).

## 5. Interacciones con otros sistemas

- Las comunidades externas que habitan el mapa estratégico se rigen por
  [SOC-003](../50-society/SOC-003_external-communities-and-regional-history.md).
- Los principios de fidelidad variable entre mapa local y mapa estratégico
  se rigen por
  [ARC-003](../90-architecture/ARC-003_multiscale-simulation-principles.md).
- La información incompleta o falsa sobre el mapa estratégico se rige por
  [NAR-002](../70-narrative/NAR-002_memory-and-causal-world-history.md).
- El mapa regional no es jugable todavía y no está en el roadmap activo (ver
  [RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md)); el
  alcance histórico del prototipo Godot, que tampoco lo incluía, se conserva
  en [RDM-001](../roadmap/RDM-001_first-playable-slice.md) (`deprecated`).
- La geografía del mapa local con la que este documento contrasta la escala
  regional se genera según
  [WLD-008](WLD-008_local-procedural-map-generation.md).
- El tamaño de un equipo operativo local, distinto del de una expedición, se
  define en
  [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md).
- La dirección de ambas escalas se registra en
  [DEC-0010](../decisions/DEC-0010_procedural-local-and-regional-map-direction.md).

## 6. Casos límite o riesgos

- Tratar el mapa regional como una campaña de control manual constante
  rompería el principio de gestión indirecta (ver
  [VIS-002](../10-vision/VIS-002_design-pillars.md)).
- Reducir el mapa regional a una lista de misiones contradiría la sección
  3.2.
- Leer «materializar» como «abrir un mapa local» contradiría la sección 3.3.

## 7. Preguntas abiertas

- Tamaño regional exacto, resolución y geometría de las regiones internas,
  revelado y transición entre mapas. Ver `docs/OPEN-QUESTIONS.md` y
  [WLD-001](WLD-001_world-scales.md).
- Número de puntos regionales iniciales y máximos.
- Valor máximo de `X` en una expedición y su composición exacta.
- Flujo exacto de viaje, frecuencia y catálogo de eventos, comunicaciones,
  puestos, colonias y control territorial.
- Si algunos lugares regionales excepcionales tendrán representación
  detallada y de qué tipo (sección 3.3).
- Fecha de implementación del mapa regional.

## 8. Ejemplos no normativos

Ayudar con semillas puede permitir una comunidad agrícola; rechazar
soldados puede contribuir a que controlen una carretera; abandonar un
pueblo a una horda puede cambiar su uso regional. Son ejemplos, no eventos
garantizados.
