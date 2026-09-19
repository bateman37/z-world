---
id: CAT-004
title: Propuesta inicial de subconjunto semántico de lugares
status: draft
canonical_for: []
depends_on:
  - CAT-001
  - CAT-002
  - CAT-003
related:
  - WLD-005
  - RDM-003
---

## 1. Propósito

Proponer, sin aprobar, un primer subconjunto pequeño y manejable del
catálogo máximo de [CAT-001](CAT-001_maximum-place-catalog.md) que una
futura entrega de implementación web podría usar como alcance inicial del
generador semántico. Esta propuesta no autoriza programación: requiere una
decisión adicional de Dennis antes de convertirse en alcance de una entrega
concreta (ver [RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md)).

## 2. Principios que no deben romperse

- Este documento es `draft`. No debe citarse como alcance aprobado de
  ninguna entrega.
- La propuesta debe mantenerse deliberadamente pequeña: suficiente para
  validar el modelo semántico completo (arquetipo → programa → grafo →
  instalaciones → ocupantes → contenido → historia → saqueo → estado) sin
  intentar cubrir el catálogo máximo.
- Elegir esta lista como alcance real de una entrega es una decisión de
  Dennis, no una consecuencia automática de este documento.

## 3. Modelo funcional

### 3.1 Subconjunto propuesto (draft, no aprobado)

| ID | Nombre | Por qué se propone |
|---|---|---|
| `RES-10` | Casa familiar mediana | Caso central del ejemplo del Anexo A; cubre programa residencial completo con variación de dormitorios. |
| `RES-17` | Cabaña | Vivienda pequeña de bajo coste generativo, útil para probar el modelo con pocas estancias. |
| `COM-02` | Supermercado pequeño | Ejemplo central de comercio alimentario, ya usado como referencia de saqueo con prioridades (Anexo A, sección 37). |
| `TAL-01` | Taller mecánico | Ejemplo central de perfil profesional coherente (mecánico) y de instalaciones desmontables (Anexo A, sección 52). |
| `AGU-01` | Pozo | Lugar de terreno mínimo, sin programa de estancias complejo, útil para probar instalaciones de agua fuera de un edificio. |

Esta selección prioriza cobertura del modelo conceptual (residencial simple,
residencial con variación, comercio con presión de saqueo, taller con
conocimiento especializado, e instalación de terreno) sobre amplitud de
catálogo.

### 3.2 Qué debería demostrar este subconjunto

- Generación semántica antes que geométrica para al menos dos tipos de
  edificio con programas de estancias distintos.
- Coherencia de contenido por ocupante y profesión en al menos un caso
  (`TAL-01`).
- Presión de saqueo zonal con al menos un caso de alto valor percibido
  (`COM-02`).
- Una instalación de terreno sin edificio (`AGU-01`) para no acoplar el
  modelo semántico exclusivamente a edificios con paredes.
- Las cinco capas de aprovechamiento y las tres vidas de
  [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md)
  en al menos un edificio (`RES-10` o `TAL-01`).

## 4. Reglas aprobadas

Ninguna: este documento es `draft` y no fija alcance ni reglas aprobadas.

## 5. Interacciones con otros sistemas

- Este subconjunto se elige a partir de
  [CAT-001](CAT-001_maximum-place-catalog.md),
  [CAT-002](CAT-002_rooms-modules-and-building-systems.md) y
  [CAT-003](CAT-003_occupants-professions-hobbies-and-traits.md).
- Si Dennis aprueba este subconjunto o uno equivalente, la entrega
  «Generador semántico inicial y explotación de lugares» de
  [RDM-003](../roadmap/RDM-003_simulation-first-playable-roadmap.md) lo
  usaría como punto de partida, con su propio prompt de programación.

## 6. Casos límite o riesgos

- Confundir esta propuesta con alcance aprobado rompería
  [DEC-0006](../decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md).

## 7. Preguntas abiertas

- Si Dennis aprueba esta selección, una selección distinta, o prefiere
  decidirla en el momento de escribir el prompt de la entrega
  correspondiente.
- Si el subconjunto inicial debe incluir explícitamente un caso de
  localización especial (`ESP-*`) o posponerlo a una entrega posterior.

## 8. Ejemplos no normativos

Ninguno adicional a la tabla de la sección 3.1.
