---
id: CAT-002
title: Módulos funcionales, estancias e instalaciones de edificio
status: approved
canonical_for:
  - catálogo máximo de módulos funcionales reutilizables
  - catálogo máximo de estancias potenciales
  - jerarquía habitación → mobiliario → contenedor → contenido
  - catálogo conceptual de instalaciones, acabados y estructura
  - variación por época constructiva
depends_on: []
related:
  - CAT-001
  - CAT-003
  - WLD-005
  - SET-007
  - ARC-005
---

## 1. Propósito

Conservar, como horizonte máximo de referencia, el catálogo de módulos
funcionales reutilizables, el catálogo máximo de estancias, la jerarquía de
contenido y el catálogo conceptual de instalaciones, acabados y estructura
del Anexo A de `DESIGN-004` (secciones 8–15, 19, 21–24 y 64–67). No fija
todavía un formato de datos ejecutable ni valores numéricos de deterioro o
capacidad.

## 2. Principios que no deben romperse

- Un edificio no se diseña habitación por habitación desde cero: se compone
  a partir de módulos funcionales reutilizables (sección 3.1), que pueden
  combinarse en edificios mixtos.
- El contenido no se genera directamente desde el edificio: sigue la
  jerarquía **habitación → mobiliario/contenedor → contenido** (sección
  3.3); un edificio nunca asigna objetos sueltos sin pasar por esa cadena.
- Las instalaciones (electricidad, agua, ACS, calefacción, climatización,
  telecomunicaciones, ventilación) son una capa de recuperación distinta del
  contenido suelto y del mobiliario (capa 3 de las cinco capas de
  [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md));
  no aparecen simplemente al registrar el edificio, se recuperan mediante
  desmontaje selectivo.
- La época constructiva modifica qué materiales e instalaciones son
  plausibles (sección 3.5); no existe un edificio genérico sin época.

## 3. Modelo funcional

### 3.1 Módulos funcionales reutilizables

Cada módulo declara un conjunto habitual de estancias que puede aparecer,
total o parcialmente, según dimensiones, subtipo, época y nivel económico.
Un edificio puede combinar más de un módulo (ver sección 3.2 y
[WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md),
sección sobre módulos mixtos).

| Módulo | Estancias habituales |
|---|---|
| Residencial | Recibidor, salón, comedor, cocina, dormitorio, baño, despensa, lavadero, garaje, trastero, estudio, sótano, terraza. |
| Comercial | Área pública, exposición, caja, almacén, oficina, WC, carga/descarga. |
| Industrial | Zona de trabajo, maquinaria, almacén, mantenimiento, vestuario, oficina, servicios. |
| Hostelería | Recepción, comedor, bar, cocina profesional, almacén, cámara frigorífica, habitaciones, lavandería. |
| Sanitario | Recepción, espera, consulta, enfermería, tratamiento, almacén, farmacia, aseos. |
| Educativo | Aulas, despachos, biblioteca, talleres, laboratorio, almacenes, comedor. |
| Logístico | Muelle, carga/descarga, almacén, frío, oficina, mantenimiento. |

### 3.2 Edificios mixtos

Los módulos se combinan para representar usos reales frecuentes: tienda +
vivienda, taller + vivienda, bar + vivienda, farmacia + vivienda,
restaurante + hostal, explotación agrícola + vivienda, almacén + oficina,
comercio + taller, entre otras combinaciones plausibles. Un edificio mixto
declara qué módulos aporta cada planta o zona, sin que las dimensiones
totales por sí solas determinen la combinación (ver sección 3 del Anexo A y
[WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md)).

### 3.3 Jerarquía habitación → mobiliario → contenedor → contenido

```text
Edificio
→ Estancia (p. ej. cocina)
→ Mobiliario/instalación de la estancia (p. ej. armario superior)
→ Contenedor (p. ej. cajón, estante)
→ Contenido (objetos concretos)
```

Ejemplo de referencia (cocina, no normativo en cantidades exactas):

- **Frigorífico**: perecederos, bebidas, condimentos, medicamentos
  refrigerados raros.
- **Armario**: pasta, arroz, conservas, vasos, platos, recipientes.
- **Cajón**: cubiertos, cuchillos, herramientas pequeñas.

Esta jerarquía es obligatoria para cualquier estancia con contenido: el
generador nunca asigna objetos sueltos directamente a un edificio o a una
estancia sin pasar por mobiliario/instalación y contenedor.

### 3.4 Catálogo máximo de estancias potenciales

| Grupo | Estancias |
|---|---|
| Residenciales | Recibidor, salón, comedor, cocina, dormitorio, baño, aseo, despacho, biblioteca, lavadero, despensa, trastero, vestidor, sótano, garaje, buhardilla, terraza. |
| Comerciales | Sala de venta, caja, escaparate, almacén, oficina, cámara, carga/descarga. |
| Industriales | Producción, mantenimiento, maquinaria, control, almacén, vestuario, sala eléctrica, sala mecánica. |
| Sanitarias | Recepción, espera, consulta, tratamiento, quirófano, enfermería, farmacia, laboratorio. |

Esta tabla es la base heredada del Anexo A (sección 64), que el propio
anexo marca como ampliable: una futura entrega puede añadir estancias para
los módulos de hostelería, sanitario avanzado, educativo, logístico,
agrícola y ganadero sin contradecir esta entrega, siempre que registre la
ampliación como cambio explícito de este documento.

### 3.5 Instalaciones según edad del edificio

| Época | Instalaciones plausibles |
|---|---|
| Antigua | Tubería metálica, cableado antiguo, chimenea, muros de piedra, pocos circuitos eléctricos. |
| Moderna | PEX/PVC, cableado abundante, cuadro eléctrico moderno, aire acondicionado, red Ethernet, placas solares. |

La época constructiva no es binaria en la implementación futura (puede
admitir más de dos franjas), pero el principio de que la época condiciona
materiales e instalaciones recuperables es aprobado y obligatorio.

### 3.6 Catálogo conceptual de instalaciones (capa 3 de recuperación)

Estos catálogos son conceptuales: enumeran qué puede recuperarse mediante
desmontaje selectivo, sin fijar cantidades ni probabilidades.

**Instalación eléctrica**: cableado de cobre, enchufes, interruptores,
cajas, fusibles, magnetotérmicos, diferenciales, cuadros eléctricos,
luminarias, sensores, relés, contactores, transformadores, fuentes,
baterías, inversores, cable de tierra.

**Instalación de agua**: tuberías, grifos, válvulas, sifones, cisternas,
depósitos, bombas, filtros, calentadores, termos, acumuladores, calderas,
sanitarios, duchas, bañeras.

**Calefacción y climatización**: radiadores, tuberías, calderas, estufas,
bombas de calor, unidades de aire acondicionado, termostatos, ventiladores,
intercambiadores, conductos.

**Telecomunicaciones**: cable Ethernet, cable telefónico, coaxial, fibra,
routers, switches, antenas, repetidores, puntos de acceso, centralitas,
conectores.

**Ventilación**: conductos, extractores, ventiladores, motores, filtros,
rejillas.

### 3.7 Acabados recuperables (capa 4)

Puertas, marcos, ventanas, cristales, persianas, sanitarios, muebles de
cocina, encimeras, armarios empotrados, parquet, tablones, baldosas,
azulejos, chapa, aislamiento, canalones, escaleras, barandillas. Recuperar
acabados reduce la habitabilidad del edificio (ver
[SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md)).

### 3.8 Materiales estructurales (capa 5)

Madera, vigas, perfiles, ladrillos, bloques, piedra, acero, ferralla, tejas,
chapa, paneles, elementos de cubierta, hormigón reutilizable en ciertos
contextos, escombros. Obtenerlos exige desmantelamiento profundo o
demolición (ver
[SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md)).

## 4. Reglas aprobadas

- Todo contenido de una estancia sigue la jerarquía de la sección 3.3; no
  existen objetos sueltos asignados directamente a un edificio.
- Las instalaciones, acabados y estructura son catálogos conceptuales de
  qué puede existir y recuperarse, nunca una lista con cantidades fijas o
  probabilidades cerradas.
- La época constructiva condiciona materiales e instalaciones disponibles
  para desmontaje; ninguna implementación puede ignorar la época al generar
  instalaciones.
- Un edificio mixto declara qué módulo aporta cada zona o planta; no se
  mezcla contenido de módulos distintos sin una asignación explícita de
  estancia.

## 5. Interacciones con otros sistemas

- Los arquetipos y familias que usan estos módulos se definen en
  [CAT-001](CAT-001_maximum-place-catalog.md).
- Los ocupantes y perfiles de negocio que determinan qué contenido concreto
  aparece en cada estancia se definen en
  [CAT-003](CAT-003_occupants-professions-hobbies-and-traits.md).
- La cadena generativa completa (parcela, arquetipo, programa, grafo) se
  define en
  [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md).
- Las cinco capas de aprovechamiento y las acciones de saqueo, desmontaje,
  desmantelamiento y demolición se definen en
  [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md).
- Las entidades conceptuales `Room`, `BuildingSystem`, `Fixture`,
  `Furniture`, `Container`, `Item` y `StructuralComponent` que representan
  esta jerarquía se definen en
  [ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md).

## 6. Casos límite o riesgos

- Generar contenido sin pasar por mobiliario/contenedor rompería la
  coherencia por ocupante y actividad exigida en
  [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md).
- Tratar las instalaciones como aparecidas automáticamente al registrar el
  edificio contradice el principio de desmontaje selectivo (sección 8 del
  Anexo A).

## 7. Preguntas abiertas

- Ampliación del catálogo de estancias de la sección 3.4 para hostelería,
  sanidad avanzada, educación, logística, agricultura y ganadería.
- Número exacto de franjas de época constructiva y sus fechas de corte.
- Catálogo exhaustivo de mobiliario y contenedores por estancia más allá de
  los ejemplos de la sección 3.3.

## 8. Ejemplos no normativos

Los ejemplos de cocina de la sección 3.3 y de instalaciones de la sección
3.6 son ilustrativos; no constituyen un contrato de datos cerrado.
