---
id: CAT-003
title: Ocupantes, profesiones, aficiones y rasgos de un lugar
status: approved
canonical_for:
  - catálogo máximo de composiciones de hogar
  - catálogo máximo de estratos económicos
  - catálogo máximo de profesiones y aficiones de antiguos ocupantes
  - catálogo máximo de rasgos especiales de hogar/negocio
depends_on: []
related:
  - CAT-001
  - CAT-002
  - WLD-005
  - CHR-001
---

## 1. Propósito

Conservar, como horizonte máximo de referencia, el catálogo de
composiciones de hogar, estratos económicos, profesiones, aficiones y
rasgos especiales que el Anexo A de `DESIGN-004` usa para dar coherencia al
contenido de un lugar (secciones 25–32). Este catálogo describe **antiguos
ocupantes o trabajadores previos al apocalipsis**: no crea personajes
jugables de la comunidad ni sustituye el modelo de personaje de
[CHR-001](../30-characters/CHR-001_character-model.md).

## 2. Principios que no deben romperse

- Un hogar o negocio no genera contenido como objetos independientes: el
  contenido deriva de quién vivía o trabajaba allí, su profesión, aficiones,
  rasgos y nivel económico (ver
  [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md)).
- El nivel económico modifica cantidad, calidad, espacio, redundancia,
  vehículos y tecnología; nunca equivale linealmente a «mejor loot» (sección
  5.5 de `DESIGN-004`).
- Las profesiones y aficiones de este catálogo describen antiguos
  ocupantes del mundo anterior al apocalipsis, un concepto distinto de la
  profesión de origen de un superviviente jugable definida en
  [CHR-001](../30-characters/CHR-001_character-model.md); ambos catálogos
  pueden compartir nombres sin ser la misma entidad de datos.

## 3. Modelo funcional

### 3.1 Composiciones de hogar

Una persona sola; pareja; pareja con hijos; familia numerosa; varias
generaciones bajo el mismo techo; compañeros de piso; anciano solo; segunda
residencia; vivienda vacacional; alquiler temporal.

### 3.2 Estratos económicos

Muy bajo; bajo; medio-bajo; medio; medio-alto; alto; muy alto. Cada estrato
modifica conjuntamente cantidad, calidad, tamaño, tecnología, vehículos,
redundancia y espacio del hogar o negocio; ninguna implementación debe
resumirlo en un único multiplicador de valor de loot.

### 3.3 Catálogo máximo de profesiones de antiguos ocupantes

Médico, enfermero, auxiliar sanitario, veterinario, farmacéutico, mecánico,
electricista, electrónico, informático, técnico de redes, fontanero,
carpintero, albañil, soldador, agricultor, ganadero, forestal, cazador,
pescador, cocinero, panadero, profesor, científico, químico, policía,
militar, bombero, conductor, camionero, trabajador industrial,
administrativo, técnico municipal, constructor, cerrajero, técnico de
climatización.

### 3.4 Catálogo máximo de aficiones

Radioafición, senderismo, escalada, camping, ciclismo, pesca, caza,
jardinería, horticultura, electrónica, informática, fotografía, música,
cocina, carpintería, bricolaje, restauración, coleccionismo, automoción,
preparación/supervivencia.

### 3.5 Rasgos especiales de hogar o negocio

Preparacionista, radioaficionado, acumulador, coleccionista, mecánico
aficionado, jardinero intensivo, enfermero, informático, supervivencialista,
cazador, deportista de montaña.

Un rasgo especial modifica probabilidades de contenido coherente sin crear
un arquetipo base nuevo (ver
[CAT-001](CAT-001_maximum-place-catalog.md), sección 4.2, sobre
localizaciones especiales como modificadores). Ejemplo de referencia: una
vivienda `RES-*` normal con rasgo «radioaficionado» puede generar emisora,
antena, fuentes, baterías, coaxial, mapas, manuales, componentes, contactos
escritos y registros — sin que esto sea una lista cerrada de cantidades.

### 3.6 Coherencia por estancia y actividad

El nivel de coherencia debe reflejarse por estancia, no solo por hogar
completo. Ejemplos de referencia (no normativos en probabilidad exacta):

- **Garaje**: herramientas, repuestos, aceite, cargadores, manuales
  mecánicos, ropa de trabajo.
- **Jardín**: herramientas, semillas, sustrato, fertilizante, mangueras.
- **Dormitorio adolescente**: ordenador, auriculares, mochila, libros, ropa.

## 4. Reglas aprobadas

- Todo hogar o negocio generado con contenido relevante debe declarar su
  composición, estrato económico y, cuando aplique, profesiones, aficiones
  y rasgos, antes de generar contenido derivado.
- El estrato económico nunca se traduce en una única cifra de «calidad de
  loot»: debe modificar conjuntamente las dimensiones de la sección 3.2.
- Un rasgo especial no crea un arquetipo base nuevo del catálogo de
  [CAT-001](CAT-001_maximum-place-catalog.md); se aplica como modificador
  sobre un tipo base existente.

## 5. Interacciones con otros sistemas

- Los arquetipos base sobre los que se aplican estos perfiles se definen en
  [CAT-001](CAT-001_maximum-place-catalog.md).
- Las estancias y mobiliario que reciben este contenido coherente se
  definen en [CAT-002](CAT-002_rooms-modules-and-building-systems.md).
- Los objetos concretos que un perfil de taller mecánico (`TAL-01`) hace
  coherentes se aprueban en
  [CAT-005](CAT-005_initial-object-resource-and-transport-slice.md), sin
  que este documento redefina esos objetos.
- La cadena generativa completa que sitúa el perfil de ocupantes entre
  subtipo y programa de estancias se define en
  [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md).
- El modelo de personaje jugable, sus capas y su profesión de origen se
  definen en
  [CHR-001](../30-characters/CHR-001_character-model.md), sin confundirse
  con este catálogo de antiguos ocupantes.
- La entidad conceptual `OccupantProfile`, `Household` y `BusinessProfile`
  se define en
  [ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md).

## 6. Casos límite o riesgos

- Confundir la profesión de un antiguo ocupante (este documento) con la
  profesión de origen de un superviviente jugable
  ([CHR-001](../30-characters/CHR-001_character-model.md)) generaría
  contradicciones de diseño; deben tratarse como catálogos distintos aunque
  compartan nombres de oficio.
- Tratar el nivel económico como un multiplicador lineal de valor
  contradice la sección 5.5 de `DESIGN-004`.

## 7. Preguntas abiertas

- Catálogo exhaustivo de coherencia por estancia más allá de los ejemplos
  de la sección 3.6.
- Relación exacta y probabilidad de aparición de rasgos especiales por
  estrato económico y contexto.
- Si el catálogo de profesiones de antiguos ocupantes y el catálogo de
  profesiones de personajes jugables ([CHR-001](../30-characters/CHR-001_character-model.md))
  deben unificarse en una única lista de datos o mantenerse como catálogos
  formalmente separados con nombres coincidentes.

## 8. Ejemplos no normativos

El ejemplo de vivienda con adulto administrativo, adulto mecánico,
adolescente, niño, nivel económico medio, aficiones de senderismo y
jardinería, y mascota perro (Anexo A, sección 25) ilustra cómo una
composición de hogar completa modifica probabilidades; no es un hogar
garantizado en ninguna semilla.
