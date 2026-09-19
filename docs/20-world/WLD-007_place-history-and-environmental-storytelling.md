---
id: WLD-007
title: Historia del lugar y narrativa ambiental
status: approved
canonical_for:
  - catálogo conceptual de historias del apocalipsis de un edificio
  - conexión causal entre historia y contenido
  - rastro ambiental legible sin texto explícito
  - edificios memorables
depends_on:
  - WLD-005
related:
  - WLD-006
  - SET-007
  - NAR-001
  - NAR-002
---

## 1. Propósito

Definir cómo se aplica a cada edificio o lugar una historia durante y
después del colapso, cómo esa historia debe tener consecuencias causales
sobre estado, riesgos, distribución y contenido, y cómo el rastro ambiental
permite reconstruir pequeñas historias sin texto explícito. Desarrolla las
secciones 33–36, 73–75 y 82–83 del Anexo A de `DESIGN-004`.

## 2. Principios que no deben romperse

- La historia ambiental de un lugar debe poder inferirse en el espacio y
  tener consecuencias; no es decoración textual independiente sin efecto en
  estado, riesgos o contenido.
- Historia y loot deben estar conectados: una evacuación implica ausencia
  de recursos de viaje; un refugio posterior implica consumibles añadidos;
  un saqueo implica ausencia de loot evidente. Ninguna historia puede
  aplicarse sin modificar el estado real del lugar.
- Un edificio memorable se define por lo que contuvo, quién lo ocupó y qué
  le pasó, no por un número de serie; el sistema debe conservar los datos
  necesarios para que la comunidad pueda recordarlo como «la casa del
  radioaficionado», no solo como «Casa #42».

## 3. Modelo funcional

### 3.1 Catálogo conceptual de historias del apocalipsis

Cada edificio recibe, tras generarse su estado normal, una historia
compatible con su tipo, ocupantes y contexto de entre: abandono normal,
evacuación ordenada, huida precipitada, ocupantes que nunca salieron,
primer saqueo, múltiples saqueos, uso como refugio, ocupación temporal,
defensa, ataque, incendio, inundación, derrumbe, cuarentena, centro
improvisado, presencia reciente.

### 3.2 Consecuencias causales por historia (ejemplos de referencia)

- **Evacuación ordenada**: los ocupantes tuvieron tiempo de llevarse
  documentación, medicamentos personales, ropa, comida, combustible,
  vehículo y objetos de valor. Quedan muebles, instalaciones, libros,
  objetos pesados y herramientas menos prioritarias.
- **Huida precipitada**: pueden quedar comida, coches, mochilas,
  medicación, puertas abiertas, objetos tirados y recursos preparados pero
  abandonados.
- **Ocupantes que no salieron**: puede implicar contenido elevado,
  vehículos presentes, peligro, cadáveres, amenazas y puertas cerradas con
  recursos intactos.
- **Edificio saqueado**: no se aplica como un recorte lineal de objetos.
  Los saqueadores tuvieron prioridades: primero alimentos, agua,
  medicamentos, armas, combustible, herramientas obvias, baterías y ropa
  útil; pudieron ignorar manuales, libros, documentación, cableado,
  maquinaria desconocida, piezas, semillas poco identificables, bombas y
  motores (ver también
  [WLD-006](WLD-006_historical-looting-pressure-and-routes.md)).

Estos ejemplos fijan el principio de causalidad, no una tabla cerrada de
porcentajes o probabilidades.

### 3.3 Rastro ambiental legible

El lugar debe poder comunicar su historia mediante señales espaciales sin
texto explícito. Ejemplos de referencia: maletas junto a la puerta, coche
cargado, comida preparada, cama deshecha y puerta rota sugieren un intento
de evacuación; barricadas, latas, colchones, radio y restos recientes
sugieren un refugio posterior. Estas señales pueden cambiar riesgos y
decisiones del jugador; no son decoración sin consecuencia (ver también
[WLD-002](WLD-002_local-exploration-and-information.md), sección 4, sobre
pistas coherentes con el pasado del lugar).

### 3.4 Edificios memorables

El sistema debe conservar suficiente identidad y causalidad para que un
edificio se recuerde por lo que significó, no por su ID interno: «la casa
del radioaficionado», «el chalet donde encontramos los libros de
agricultura», «el taller que tenía el generador», «la vivienda de la que
sacamos todo el cableado», «la calle que estaba completamente saqueada
excepto una casa». Estos apodos surgen de la combinación de arquetipo,
rasgos, historia y descubrimiento efectivo del jugador; no se generan como
texto fijo independiente del contenido real.

## 4. Reglas aprobadas

- Ninguna historia del apocalipsis puede aplicarse a un edificio sin
  modificar causalmente su contenido, estado o riesgos (sección 3.2).
- El rastro ambiental de un lugar debe ser coherente con su historia
  asignada; no se colocan señales decorativas contradictorias con el estado
  real.
- El sistema debe conservar los datos de identidad (tipo, rasgos, historia,
  descubrimientos) necesarios para que un lugar pueda volverse memorable
  para la comunidad.

## 5. Interacciones con otros sistemas

- El estado de saqueo que interactúa con esta historia se define en
  [WLD-006](WLD-006_historical-looting-pressure-and-routes.md).
- El deterioro y estado de explotación resultante se define en
  [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md).
- La memoria significativa persistente que puede registrar un lugar
  memorable como hito se rige por
  [NAR-002](../70-narrative/NAR-002_memory-and-causal-world-history.md), sin
  que este documento repita su modelo de memoria.
- El flujo causal general de la narrativa emergente sigue definido en
  [NAR-001](../70-narrative/NAR-001_emergent-narrative.md).
- La entidad conceptual `BuildingHistory` se define en
  [ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md).

## 6. Casos límite o riesgos

- Aplicar una historia como texto decorativo sin modificar contenido o
  estado contradice el principio de la sección 2.
- Generar rastro ambiental incoherente con la historia asignada rompería la
  credibilidad exigida por
  [WLD-005](WLD-005_semantic-place-and-building-generation.md).

## 7. Preguntas abiertas

- Catálogo exhaustivo de señales ambientales por historia, más allá de los
  ejemplos de la sección 3.3.
- Mecanismo exacto por el que un lugar memorable recibe un nombre o apodo
  visible en la interfaz.
- Frecuencia relativa de cada historia del apocalipsis por tipo de edificio
  y contexto.

## 8. Ejemplos no normativos

Los ejemplos de la sección 3.2 y 3.3 son ilustrativos del principio causal;
no son un catálogo cerrado ni un evento garantizado en ninguna semilla.
