---
id: WLD-003
title: Mundo estratégico y simulación regional
status: approved
canonical_for:
  - horizonte máximo del mapa estratégico
  - expediciones y materialización de zonas
  - simulación de comunidades y amenazas lejanas
depends_on:
  - WLD-001
related:
  - VIS-003
  - SOC-003
  - ARC-003
  - NAR-002
---

## 1. Propósito

Definir el horizonte máximo del mundo estratégico regional: sus dos escalas
conectadas, la niebla de guerra, las expediciones, la materialización de
zonas y la simulación de lo que ocurre lejos del asentamiento.

## 2. Principios que no deben romperse

- El mundo lejano no se congela. Comunidades, amenazas y rutas cambian.
- El estado regional inicial es posterior a un colapso plausible; no
  aparecen comunidades estables de decenas de miles de personas sin
  historia.
- [SCN-001](../scenarios/SCN-001_mountain-village-arrival.md) sigue siendo
  el primer inicio; este documento no lo sustituye.

## 3. Modelo funcional

El mundo completo tiene dos escalas conectadas (ver
[WLD-001](WLD-001_world-scales.md)):

- Mapa local 3D con personas, edificios, trabajo, producción, defensas y
  amenazas inmediatas.
- Mapa estratégico regional mediante hexágonos, niebla de guerra, rutas,
  comunidades, expediciones, puestos y cambios regionales.

Cada hexágono representa una zona geográfica: bosque, valle agrícola,
carretera, suburbio, pueblo, instalación, río, montaña o área urbana. Escala
numérica y tamaño total siguen abiertos.

### 3.1 Niebla de guerra e información

La niebla tiene niveles de conocimiento. Antes de visitar pueden conocerse
terreno aproximado, humo, ruido, radio, carreteras, rumores o movimientos.
La información puede ser incompleta, antigua o falsa según
[NAR-002](../70-narrative/NAR-002_memory-and-causal-world-history.md).

### 3.2 Expediciones

El jugador forma expediciones con destino, integrantes, recursos y
orientación general de riesgo. El viaje se simula estratégicamente y
presenta decisiones relevantes. No crea una campaña paralela de control
manual constante. El flujo exacto queda abierto y no contradice que
[UI-001](../80-interface/UI-001_interaction-and-command-model.md) evite
formularios para cada tarea local.

### 3.3 Materialización de zonas

Una zona puede revelar recursos, amenazas, rutas, comunidades y lugares
especiales. Puede convertirse en puesto, colonia, aliado, ruta comercial,
objetivo de recuperación o área local materializada. Al volverse relevante,
una zona gana detalle respetando su historia resumida (ver
[ARC-003](../90-architecture/ARC-003_multiscale-simulation-principles.md)).

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

## 5. Interacciones con otros sistemas

- Las comunidades externas que habitan el mapa estratégico se rigen por
  [SOC-003](../50-society/SOC-003_external-communities-and-regional-history.md).
- Los principios de fidelidad variable entre mapa local y mapa estratégico
  se rigen por
  [ARC-003](../90-architecture/ARC-003_multiscale-simulation-principles.md).
- La información incompleta o falsa sobre el mapa estratégico se rige por
  [NAR-002](../70-narrative/NAR-002_memory-and-causal-world-history.md).
- El mapa estratégico no es jugable en la primera versión visual (ver
  [RDM-001](../roadmap/RDM-001_first-playable-slice.md)).

## 6. Casos límite o riesgos

- Tratar el mapa estratégico como una campaña de control manual constante
  rompería el principio de gestión indirecta (ver
  [VIS-002](../10-vision/VIS-002_design-pillars.md)).

## 7. Preguntas abiertas

- Escala hexagonal, tamaño regional, revelado y transición entre mapas. Ver
  `docs/OPEN-QUESTIONS.md` y [WLD-001](WLD-001_world-scales.md).
- Flujo exacto de expediciones, puestos, colonias y materialización de
  zonas.

## 8. Ejemplos no normativos

Ayudar con semillas puede permitir una comunidad agrícola; rechazar
soldados puede contribuir a que controlen una carretera; abandonar un
pueblo a una horda puede cambiar su uso regional. Son ejemplos, no eventos
garantizados.
