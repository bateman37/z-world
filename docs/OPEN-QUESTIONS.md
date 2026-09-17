# Preguntas abiertas

Agrupadas por dominio. Cada pregunta enlaza el documento canónico afectado.
No se repite aquí la discusión completa; ver el documento enlazado.

Cuando una pregunta se cierre:

1. Actualiza la fuente canónica correspondiente.
2. Crea una decisión en `docs/decisions/` si tiene impacto relevante.
3. Retira la pregunta de esta lista.

## Mundo (`20-world`)

- Escala, tamaño y representación exacta de la cuadrícula hexagonal del mapa
  estratégico. Ver [WLD-001](20-world/WLD-001_world-scales.md).
- Mecanismo exacto de transición entre el mapa estratégico y el mapa local.
  Ver [WLD-001](20-world/WLD-001_world-scales.md). El mapa estratégico no es
  jugable en la primera versión visual (ver
  [RDM-001](roadmap/RDM-001_first-playable-slice.md)).
- Catálogo concreto de qué edificios y recursos declaran qué acciones de
  descubrimiento. Ver
  [WLD-002](20-world/WLD-002_local-exploration-and-information.md).

## Personajes (`30-characters`)

- Valores y fórmulas exactos de características, habilidades, aptitudes,
  progreso y calidad. Ver
  [CHR-001](30-characters/CHR-001_character-model.md) y
  [CHR-003](30-characters/CHR-003_autonomy-intentions-and-behavior.md).
- Técnicas exactas, prerrequisitos y transferencia completa entre
  habilidades más allá de los ejemplos registrados. Ver
  [CHR-002](30-characters/CHR-002_knowledge-and-learning.md).
- Fórmulas exactas de velocidad de aprendizaje y enseñanza. Ver
  [CHR-002](30-characters/CHR-002_knowledge-and-learning.md).

## Asentamiento (`40-settlement`)

- Fórmulas exactas de coste y capacidad por tipo de ampliación. Ver
  [SET-001](40-settlement/SET-001_settlement-growth.md).
- Catálogo concreto de soluciones de producción por necesidad, más allá de
  la primera versión. Ver
  [SET-002](40-settlement/SET-002_production-and-solutions.md).
- Catálogos de recursos, edificios, recetas y herramientas más allá de la
  lista inicial. Ver
  [SET-003](40-settlement/SET-003_resources-logistics-and-condition.md).
- Valores y curvas exactos de deterioro y condición. Ver
  [SET-003](40-settlement/SET-003_resources-logistics-and-condition.md).
- Duración de estaciones, número de días por estación, año completo y
  fórmulas de agricultura (no implementadas en la primera versión). Ver
  [ARC-002](90-architecture/ARC-002_procedural-generation-and-persistence.md).

## Sociedad (`50-society`)

- Modelo exacto de formación y disolución de facciones. Ver
  [SOC-001](50-society/SOC-001_living-community.md).
- Ritmo y reglas de evolución de comunidades externas, política, comercio y
  narrativa de gran escala.

## Amenazas (`60-threats`)

- Lista exacta de configuraciones, infección, sentidos, abundancia y
  dificultad del modelo de amenazas. Ver
  [THR-001](60-threats/THR-001_zombie-threat-model.md).
- Alcance, intensidad y fórmulas exactas de ruido, combate e infección. Ver
  [THR-001](60-threats/THR-001_zombie-threat-model.md).
- Configuración concreta de amenazas al iniciar partida.

## Narrativa (`70-narrative`)

- Modelo exacto de memoria persistente. Ver
  [NAR-001](70-narrative/NAR-001_emergent-narrative.md).
- Diseño del director narrativo (selección y priorización de situaciones).
  Ver [NAR-001](70-narrative/NAR-001_emergent-narrative.md).
- Frecuencia de situaciones narrativas. Ver
  [NAR-001](70-narrative/NAR-001_emergent-narrative.md).
- Formato concreto de los eventos. Ver
  [NAR-001](70-narrative/NAR-001_emergent-narrative.md).

## Interfaz (`80-interface`)

- Catálogo completo de acciones contextuales disponibles según el objetivo.
  Ver [UI-001](80-interface/UI-001_interaction-and-command-model.md).

## Arquitectura técnica (`90-architecture`)

- Estructura de carpetas definitiva del proyecto Godot. Ver
  [ARC-001](90-architecture/ARC-001_technical-direction.md).
- Formato definitivo de datos de contenido. Ver
  [ARC-001](90-architecture/ARC-001_technical-direction.md).
- Formato de guardado, compatibilidad entre versiones y representación de
  datos final. Ver
  [ARC-002](90-architecture/ARC-002_procedural-generation-and-persistence.md).

## Escenario inicial (`scenarios`)

Salvo que ya se deduzca lo contrario de
[SCN-001](scenarios/SCN-001_mountain-village-arrival.md):

- La estación exacta de llegada.
- Los seis personajes concretos y sus relaciones iniciales.
- El edificio inicial y el grado de elección disponible.
- La geografía y tamaño exactos del mapa local.
- La población zombi inicial.
- La disponibilidad inicial de armas, agua, alimento y electricidad.
- La existencia y proximidad de otras comunidades.

## Cerradas por `DESIGN-001`

`DESIGN-001` cerró estas decisiones, antes abiertas o no registradas: control
con ratón como método de intervención directa (sin primera persona ni WASD),
prioridades como base de interacción, tres estados de zona (habitual,
precaución, prohibida), día de 20 minutos con cinco velocidades incluida la
pausa, zombi estándar lento tipo Romero, y generación bajo demanda
reproducible sin resorteo al cargar. Ver
[DEC-0004](decisions/DEC-0004_mouse-strategic-control.md) y
[DEC-0005](decisions/DEC-0005_reproducible-lazy-generation.md).
