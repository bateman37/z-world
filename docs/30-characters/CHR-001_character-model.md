---
id: CHR-001
title: Modelo de personaje
status: approved
canonical_for:
  - profesiones como experiencia previa
  - capas conceptuales de habilidad y conocimiento
depends_on: []
related:
  - CHR-002
  - CHR-003
  - CHR-004
  - CHR-006
  - CHR-007
  - VIS-002
  - UI-003
  - SET-006
---

## 1. Propósito

Definir cómo se modelan las personas de la comunidad: qué representa una
profesión y qué capas conceptuales existen entre aptitud y medios materiales.

## 2. Principios que no deben romperse

- Una profesión representa principalmente experiencia previa, no una clase
  cerrada. Un informático puede aprender a pescar y un pescador puede
  aprender electricidad, aunque el ritmo y la dificultad dependan de sus
  aptitudes, conocimientos previos, enseñanza, práctica y medios.

## 3. Modelo funcional

Cada persona tiene estas capas, con responsabilidades separadas:

| Capa | Qué determina |
|---|---|
| Historia previa | Profesión, experiencias, relaciones y conocimientos con los que llega. No es una clase cerrada. |
| Características generales | Capacidades físicas y cognitivas que influyen en actividades, sin sustituir las habilidades. |
| Habilidades específicas | Capacidad práctica en una disciplina concreta. |
| Técnicas y conocimientos | Lo que sabe reconocer, interpretar o ejecutar (ver [CHR-002](CHR-002_knowledge-and-learning.md)). |
| Aptitudes de aprendizaje | Ritmo, mesetas y dificultades personales para habilidades concretas (ver [CHR-002](CHR-002_knowledge-and-learning.md)). |
| Estado actual | Cansancio, hambre, sed, salud, lesión, miedo, estrés y condiciones relevantes. |
| Motivaciones y valores | Lo que desea, protege, rechaza o considera aceptable (ver [CHR-003](CHR-003_autonomy-intentions-and-behavior.md)). |
| Relaciones y memoria | Vínculos y experiencias que afectan a decisiones futuras (ver [CHR-003](CHR-003_autonomy-intentions-and-behavior.md)). |

A nivel comunitario existe además conocimiento comunitario conservado en
personas, libros, planos, archivos, escuelas, bibliotecas y talleres (ver
[CHR-002](CHR-002_knowledge-and-learning.md)), y medios materiales:
herramientas, instalaciones, componentes, energía y materias primas.

Una acción compleja puede exigir una combinación de varias habilidades,
conocimiento disponible, personas, herramientas, tiempo y materiales.

### 3.1.1 Prioridad, habilidad, técnica, conocimiento, aptitud y medios

Estos seis conceptos no deben confundirse entre sí:

- **Prioridad** es la disposición relativa de una persona a atender una
  familia de trabajos; no concede ninguna capacidad por sí sola (ver el
  horizonte aprobado de nueve bloques y 34 prioridades en
  [UI-003](../80-interface/UI-003_work-priority-taxonomy.md)).
- **Habilidad** es la competencia práctica general o específica en una
  disciplina.
- **Técnica** es un procedimiento concreto dentro de una habilidad.
- **Conocimiento** es lo que la persona o la comunidad reconoce, comprende
  y sabe aplicar, incluidos los fragmentos recuperados de fuentes del mundo
  anterior (ver
  [SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md)).
- **Aptitud** es el ritmo, techo, constancia o facilidad personal para
  progresar, parcialmente oculta.
- **Medios materiales** son las herramientas, materiales, energía,
  instalación, acceso, tiempo y ayuda necesarios para ejecutar.

Una persona puede tener prioridad máxima en una familia sin habilidad
alguna, o habilidad y conocimiento sin medios materiales disponibles.
Ninguna de estas capas sustituye a otra.

### 3.1 Habilidades específicas iniciales

La primera versión visual utiliza este conjunto exacto y limitado de
habilidades específicas para demostrar el modelo (ver
[RDM-001](../roadmap/RDM-001_first-playable-slice.md)):

1. Observación e inspección.
2. Búsqueda y recuperación.
3. Pesca.
4. Identificación y recolección de hongos.
5. Rastreo y caza.
6. Cocina.
7. Conservación de alimentos.
8. Remiendo y costura.
9. Construcción y carpintería.
10. Fontanería y conducción de agua.
11. Primeros auxilios.

No existe en la primera versión una habilidad genérica de «supervivencia»
que otorgue resultados en pesca, setas, caza, costura o medicina. Las
familias de prioridad de
[UI-001](../80-interface/UI-001_interaction-and-command-model.md) no alteran
esta regla: sirven para priorizar tareas, no otorgan competencia en ellas.

## 4. Reglas aprobadas

- El pasado profesional influye en el punto de partida, pero no encierra a
  nadie en una clase permanente (pilar "profesiones vivas", ver
  [VIS-002](../10-vision/VIS-002_design-pillars.md)).
- Personas importantes: habilidades, relaciones, aprendizaje, lesiones,
  ambiciones, conflictos, pérdidas y muerte permanente pueden transformar la
  comunidad.

## 5. Interacciones con otros sistemas

- El horizonte máximo de historia vital, descubrimiento progresivo y arcos
  personales se desarrolla en
  [CHR-004](CHR-004_life-history-and-personal-arcs.md), sin ampliar el
  conjunto exacto de habilidades iniciales de la sección 3.1.
- El catálogo cerrado de horizonte máximo de nueve características y 34
  habilidades base vive en
  [CHR-006](CHR-006_characteristics-and-skill-catalog.md); no se importa al
  primer corte jugable ni sustituye la lista exacta de la sección 3.1. Esa
  sección 3.1 y el catálogo de CHR-006 no coinciden literalmente en
  nombres; ver la reconciliación registrada en
  [CHR-006 §7](CHR-006_characteristics-and-skill-catalog.md#7-preguntas-abiertas).
  El potencial oculto, el calibre oculto y la adaptación al apocalipsis que
  condicionan la evolución de esas habilidades viven en
  [CHR-007](CHR-007_hidden-potential-caliber-and-adaptation.md).
  [CHR-005](CHR-005_extended-skill-taxonomy.md) queda `deprecated` en favor
  de CHR-006.
- El aprendizaje y la enseñanza se desarrollan en
  [CHR-002](CHR-002_knowledge-and-learning.md).
- La autonomía, las motivaciones y la evolución del comportamiento se
  desarrollan en [CHR-003](CHR-003_autonomy-intentions-and-behavior.md).
- La disponibilidad de habilidades condiciona las soluciones de producción en
  [SET-002](../40-settlement/SET-002_production-and-solutions.md).
- Relaciones, prestigio y facciones se desarrollan en
  [SOC-001](../50-society/SOC-001_living-community.md).
- El horizonte aprobado de prioridades, órdenes, zonas, políticas y trabajos
  que usa estas capas sin confundirlas se desarrolla en
  [UI-003](../80-interface/UI-003_work-priority-taxonomy.md).
- El modelo de fuentes, fragmentos y capacidad real que sustenta el
  conocimiento comunitario se desarrolla en
  [SET-006](../40-settlement/SET-006_knowledge-assets-and-capability.md).

## 6. Casos límite o riesgos

- Si una persona muere o abandona antes de transmitir un conocimiento, la
  comunidad puede perder capacidad real (ver
  [CHR-002](CHR-002_knowledge-and-learning.md)).

## 7. Preguntas abiertas

- Lista cerrada de atributos, habilidades, especialidades, niveles o
  fórmulas de progreso. Ver `docs/OPEN-QUESTIONS.md`.

## 8. Ejemplos no normativos

Ninguno.
