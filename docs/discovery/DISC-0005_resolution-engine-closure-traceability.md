---
id: DISC-0005
title: Trazabilidad del cierre del motor de resolución y capacidades
status: draft
canonical_for: []
depends_on: []
related:
  - CHR-006
  - CHR-007
  - ARC-006
  - ARC-007
  - ARC-008
  - UI-004
  - UI-006
  - DEC-0009
  - DEC-0011
---

## 1. Propósito

Demostrar que ninguna de las veintidós decisiones `P01`–`P22`, ni las
correcciones finales de Dennis sobre escala, umbral de tarea básica y
presentación de capacidades, se perdieron al formalizarlas en
documentación canónica, y registrar dónde vive cada regla. Sigue el patrón
de
[DISC-0004](DISC-0004_local-regional-maps-and-contextual-actions-traceability.md).

## 2. Principios que no deben romperse

- Este documento es `draft`: es una síntesis de trazabilidad, **no** una
  fuente canónica de reglas. Las reglas viven en los documentos de destino.
- No duplica páginas enteras de las fuentes canónicas: enlaza por ID y
  sección.
- Ninguna fila puede quedar sin destino: toda decisión `P01`–`P22` tiene
  documento canónico.

## 3. Decisiones finales de P01–P22

| ID | Decisión final | Documento canónico |
|---|---|---|
| P01 | Escala real `0–10`, calibración de nivel y media humana `4`. | [CHR-006 §3.6](../30-characters/CHR-006_characteristics-and-skill-catalog.md#36-escala-real-0–10-y-calibración-canónica) |
| P02 | `0` es un valor real distinto de dato desconocido; precisión interna sin redondeo intermedio. | [ARC-006 §3.8](../90-architecture/ARC-006_action-and-event-resolution-model.md#38-cero-dato-desconocido-y-precisión-cierra-p02) |
| P03 | Tres perfiles cerrados de ponderación (70/30, 50/50, 30/70) entre característica y habilidad efectivas. | [ARC-006 §3.7](../90-architecture/ARC-006_action-and-event-resolution-model.md#37-perfiles-de-ponderación-entre-característica-y-habilidad-cierra-p03) |
| P04 | Modelo B: margen, variación acotada `[-4,+4]`, desviación orientativa `1,15`, cinco bandas internas. | [ARC-006 §3.9](../90-architecture/ARC-006_action-and-event-resolution-model.md#39-modelo-b-margen-azar-acotado-y-bandas-cierra-p04) |
| P05 | Modelo D: variación acotada de hasta `±8 %` por fase o sesión significativa, persistente. | [ARC-006 §3.10](../90-architecture/ARC-006_action-and-event-resolution-model.md#310-modelo-d-tamaño-y-persistencia-de-la-variación-cierra-p05) |
| P06 | Requisitos duros por método: abierto / improvisable / guiado / restringido. | [ARC-006 §3.11](../90-architecture/ARC-006_action-and-event-resolution-model.md#311-requisitos-duros-e-improvisación-por-método-cierra-p06) |
| P07 | Umbral de tarea básica: `+3` puntos de capacidad efectiva sobre dificultad efectiva. | [ARC-006 §3.12](../90-architecture/ARC-006_action-and-event-resolution-model.md#312-umbral-de-tarea-básica-y-episodios-comprobables-cierra-p07–p08) |
| P08 | Delimitación de episodios y fases comprobables. | [ARC-006 §3.12](../90-architecture/ARC-006_action-and-event-resolution-model.md#312-umbral-de-tarea-básica-y-episodios-comprobables-cierra-p07–p08) |
| P09 | Cooperación por funciones con rendimientos decrecientes (`100 %/60 %/35 %/20 %`). | [ARC-007 §3.6](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md#36-cooperación-por-funciones-y-rendimientos-decrecientes-cierra-p09) |
| P10 | Responsable, ejecutor principal y supervisor; selección automática y sustitución. | [ARC-007 §3.7](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md#37-responsable-ejecutor-supervisor-y-sustitución-cierra-p10) |
| P11 | Dos dimensiones combinables de modo: ritmo y atención, no cuatro modos excluyentes. | [ARC-007 §3.8](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md#38-modos-en-dos-dimensiones-combinables-cierra-p11) |
| P12 | Rangos conceptuales de efectos y costes por opción de ritmo/atención. | [ARC-007 §3.9](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md#39-efectos-y-costes-de-ritmo-y-atención-cierra-p12) |
| P13 | Límites temporales, herencia de política del lugar y prioridad. | [ARC-007 §3.10](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md#310-límites-temporales-prioridad-e-herencia-cierra-p13) |
| P14 | Cuatro políticas cualitativas de respuesta ante amenazas y pérdida de medios. | [ARC-007 §3.11](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md#311-respuesta-ante-cambios-pérdida-de-medios-y-amenazas-cierra-p14) |
| P15 | Resultados multidimensionales y bandas de B en lugar de crítico/pifia universal. | [ARC-008 §3.7](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#37-resultados-multidimensionales-críticos-e-incidencias-cierra-p15) |
| P16 | Cuatro capas de conocimiento imperfecto y campos de una interpretación. | [ARC-008 §3.8](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#38-conocimiento-imperfecto-y-comunicación-cierra-p16) |
| P17 | Reintentos por causa legítima y presupuestos de autonomía por orden. | [ARC-008 §3.9](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#39-reintentos-y-presupuestos-de-autonomía-cierra-p17) |
| P18 | Oposición activa mediante una única resolución de margen relativo. | [ARC-008 §3.10](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#310-oposición-activa-y-pasiva-cierra-p18) |
| P19 | Fórmula conceptual de aprendizaje por participación. | [ARC-008 §3.11](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#311-aprendizaje-por-participación-cierra-p19) |
| P20 | Cadena de eventos en ocho pasos, cuatro niveles de atención, pausa crítica predeterminada. | [ARC-008 §3.12](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#312-eventos-causalidad-avisos-y-pausa-cierra-p20) |
| P21 | Determinismo temporal: misma semilla/estado/órdenes = mismos resultados, con independencia de velocidad. | [ARC-008 §3.13](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#313-persistencia-aleatoria-y-equivalencia-temporal-cierra-p21) |
| P22 | Nivel actual visible `0–10`; potencial oculto comunicado con frases cualitativas. | [ARC-008 §3.14](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#314-presentación-visible-y-potencial-oculto-cierra-p22); [CHR-007 §3.9](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#39-catálogo-y-actualización-de-frases-de-potencial-cierra-parte-de-p22); [UI-004 §3.8](../80-interface/UI-004_qualitative-capability-presentation.md#38-nivel-actual-visible-en-la-ficha-reconciliado-con-p22) |

## 4. Acuerdos previos preservados

| Acuerdo previo | Sigue vigente en |
|---|---|
| Media aritmética dentro de una pareja de características o habilidades requeridas. | [ARC-006 §3.2](../90-architecture/ARC-006_action-and-event-resolution-model.md#32-características-habilidades-y-medias) |
| Acciones básicas viables se ejecutan sin tirada artificial. | [ARC-006 §3.3](../90-architecture/ARC-006_action-and-event-resolution-model.md#33-posibilidad-requisitos-y-acciones-básicas-sin-tirada) |
| El azar nunca crea objetos, recursos, pistas ni capacidades imposibles (R01). | [ARC-006 §2](../90-architecture/ARC-006_action-and-event-resolution-model.md#2-principios-que-no-deben-romperse) |
| Selector de equipo local `Auto / 1 / 2 / 3 / 4` con asignación `Comunidad`/`Equipo seleccionado`. | [UI-006 §3.9](../80-interface/UI-006_contextual-place-interaction-and-teams.md#39-equipo-operativo-local-tamaño-y-asignación) |
| `4` no es un límite del motor; una operación mayor se descompone en trabajos o equipos relacionados. | [UI-006 §3.12](../80-interface/UI-006_contextual-place-interaction-and-teams.md#312-operaciones-de-más-de-cuatro-personas) |
| Nueve características y 34 habilidades base cerradas. | [CHR-006 §3.2–§3.3](../30-characters/CHR-006_characteristics-and-skill-catalog.md#32-nueve-características) |
| Cinco estados cualitativos de capacidad (`Gris`/`Advertencia`/`Adecuada`/`Familiar`/`Incierta`). | [UI-004 §3.2](../80-interface/UI-004_qualitative-capability-presentation.md#32-estados-cualitativos-de-capacidad) |

## 5. Correcciones introducidas en esta entrega

| Corrección | Antes | Después |
|---|---|---|
| Escala de característica/habilidad. | `1–10` en varias menciones de `CHR-006`. | `0–10` real, con `0` como valor real distinto de dato desconocido (§3.6 de `CHR-006`). |
| Media humana de referencia. | Nunca se fijó explícitamente; riesgo de leerse como `5` (punto medio de `1–10`). | `4` es la referencia humana media de una característica (`CHR-006 §3.6`). |
| Umbral de tarea básica. | Sin cifra cerrada; riesgo de asumir `+2`. | `+3` puntos de capacidad efectiva sobre dificultad efectiva (`ARC-006 §3.12`). |
| Peso entre característica y habilidad. | «Sigue sin fijarse» (`ARC-006`, versión previa); fórmula antigua `(característica + 2 × habilidad) / 3` circulaba como candidata. | Tres perfiles cerrados (70/30, 50/50, 30/70) según la fase o el método (`ARC-006 §3.7`); la fórmula antigua queda descartada como universal. |
| Modelo B. | Candidatos sin elegir: función logística o tabla calibrada. | Margen + variación acotada `[-4,+4]` + cinco bandas internas (`ARC-006 §3.9`). |
| Modos de ejecución. | Tabla de cuatro modos (`Exhaustivo/cuidadoso`, `Relajado`, `Normal`, `Rápido`) con riesgo de leerse como excluyentes. | Dos dimensiones combinables: ritmo y atención (`ARC-007 §3.8`). |
| Prohibición de cifras en `UI-004`. | Prohibición absoluta, incompatible con mostrar el nivel actual. | Prohibición mantenida para umbrales de una acción concreta; el nivel actual `0–10` de la ficha es visible (`UI-004 §3.8`). |
| Estados de `ARC-006`–`ARC-008`. | `draft`, con `P01`–`P22` como preguntas abiertas. | `approved`, con las 22 decisiones cerradas y registradas en la tabla de la sección 3. |

## 6. Fórmulas descartadas o sustituidas

| Fórmula | Estado |
|---|---|
| `Capacidad base = (característica efectiva + 2 × habilidad efectiva) / 3` | Descartada como fórmula universal; conservada como antecedente histórico en [ARC-008 §5.2](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#52-ponderación-general-antigua-descartada). |
| `p = 1 / (1 + exp(−(Capacidad − Dificultad) / s))` | Descartada; conservada como antecedente en [ARC-008 §5.3](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#53-probabilidad-del-candidato-b-descartada). |
| Reparto porcentual `0,10p`/`0,90p`/`0,90(1−p)`/`0,10(1−p)` de críticos/fallos graves. | Descartado como reparto universal; sustituido por las cinco bandas del margen de B ([ARC-008 §5.5](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#55-críticos-e-incidencias-cerrado-mediante-bandas-de-b)). |
| Umbral `+2` de tarea básica. | Descartado; el umbral cerrado es `+3` ([ARC-006 §3.12](../90-architecture/ARC-006_action-and-event-resolution-model.md#312-umbral-de-tarea-básica-y-episodios-comprobables-cierra-p07–p08)). |
| Cuatro modos mutuamente excluyentes. | Descartado como lectura; sustituido por dos dimensiones combinables ([ARC-007 §3.8](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md#38-modos-en-dos-dimensiones-combinables-cierra-p11)). |

## 7. Ejemplos no normativos registrados

| Ejemplo | Dónde vive | Condición |
|---|---|---|
| Diagnóstico de instalación con Mecánica 8, Electricidad 4, Razonamiento 7, Percepción 9. | [ARC-006 §3.2](../90-architecture/ARC-006_action-and-event-resolution-model.md#32-características-habilidades-y-medias) | Ilustra la media por pareja, no un catálogo cerrado. |
| Trepar muro (instintivo), reparar cuadro (técnico), negociar intercambio (equilibrado). | [ARC-006 §3.7](../90-architecture/ARC-006_action-and-event-resolution-model.md#37-perfiles-de-ponderación-entre-característica-y-habilidad-cierra-p03) | Ilustrativo; no fija el perfil definitivo de ninguna acción de contenido. |
| «Vivienda norte — Recuperar instalación», ficha de orden sin porcentajes. | [ARC-008 §3.6](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#36-experiencia-del-jugador-e-información-visible) | Orientativo, no maqueta definitiva. |
| «Luis parece adecuado para la reparación…» y «La reparación ha quedado provisional…». | [ARC-008 §3.14](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#314-presentación-visible-y-potencial-oculto-cierra-p22) | Ejemplos válidos de presentación, no textos finales de interfaz. |
| Catálogo de ocho frases de potencial estimado. | [CHR-007 §3.9](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#39-catálogo-y-actualización-de-frases-de-potencial-cierra-parte-de-p22) | Redacción ajustable por naturalidad; significado y ausencia de cifras son obligatorios. |
| Treinta y un casos de validación documental. | [ARC-008 §5.7](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#57-treinta-y-un-casos-de-validación-documental) | Ejemplos de especificación, no pruebas ejecutadas ni programadas. |

## 8. Preguntas de otros sistemas que siguen realmente abiertas

Ninguna de estas pertenece a `P01`–`P22`; permanecen registradas en
`docs/OPEN-QUESTIONS.md` y en sus documentos canónicos:

| Ámbito | Pregunta abierta | Dónde vive |
|---|---|---|
| Personajes | Velocidad de aprendizaje, curvas de progreso y dificultad de alcanzar niveles altos. | [CHR-007 §7.1](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#71-velocidad-de-aprendizaje-y-curvas-de-progreso) |
| Personajes | Campos de potencial: nombres finales, fronteras, desviación por habilidad. | [CHR-007 §7.2](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#72-campos-de-potencial) |
| Personajes | Distribución de estrellas del calibre oculto y curvas temporales de la población mundial. | [CHR-007 §7.3](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#73-distribución-de-estrellas) |
| Personajes | Escala, dimensiones, visibilidad y progreso de la adaptación al apocalipsis. | [CHR-007 §7.5](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#75-adaptación-al-apocalipsis) |
| Personajes | Dominios definitivos de cada habilidad. | [CHR-006 §7](../30-characters/CHR-006_characteristics-and-skill-catalog.md#7-preguntas-abiertas) |
| Personajes | Catálogo de rasgos, beneficios y aflicciones. | [CHR-007 §7.7](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#77-rasgos-beneficios-y-aflicciones) |
| Motor | Umbrales exactos de dificultad (trivial/normal/difícil/extrema) por familia de acción. | [ARC-007 §3.5](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md#35-estado-herramientas-y-entorno) |
| Motor | Política exacta de abandono seguro de una fase delicada en tiempo cero. | [ARC-007 §3.4](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md#34-tiempo-dedicación-método-y-prioridad) |
| Motor | Mínimo, recomendado y máximo útil concretos por familia de acción. | [UI-006 §7](../80-interface/UI-006_contextual-place-interaction-and-teams.md#7-preguntas-abiertas) |
| Interfaz | Fórmulas numéricas exactas de idoneidad, dificultad, riesgo y confianza por familia de acción. | [UI-004 §7](../80-interface/UI-004_qualitative-capability-presentation.md#7-preguntas-abiertas) |
| Interfaz | Color, iconografía y disposición visual final de los estados y de la ficha. | [UI-004 §7](../80-interface/UI-004_qualitative-capability-presentation.md#7-preguntas-abiertas); [CHR-007 §7.8](../30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md#78-interfaz-final) |
| Combate | Fórmulas específicas de combate, más allá del marco de oposición activa. | [ARC-008 §3.10](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md#310-oposición-activa-y-pasiva-cierra-p18) |
| Objetos | Cantidades exactas recuperadas al desmontar y probabilidades/tiempos concretos. | [SET-009 §5](../40-settlement/SET-009_disassembly-and-world-transformation.md#5-interacciones-con-otros-sistemas-y-preguntas-abiertas) |

## 9. Qué no hace este documento

- No sustituye a ninguna fuente canónica.
- No fija reglas, cifras o algoritmos por sí mismo: solo enlaza a donde ya
  quedaron fijados.
- No autoriza implementación: `docs/STATUS.md` sigue siendo la única
  fuente de qué existe realmente en el juego ejecutable.
