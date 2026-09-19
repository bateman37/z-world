---
id: WLD-006
title: Presión histórica de saqueo y rutas
status: approved
canonical_for:
  - mapa conceptual de presión histórica de saqueo por zona
  - correlación local entre edificios vecinos
  - rutas o corredores de saqueo y bolsas olvidadas
  - diferencia entre valor percibido y valor real
  - saqueo dinámico futuro durante la partida
depends_on:
  - WLD-005
related:
  - WLD-007
  - SET-007
  - WLD-003
  - ARC-002
---

## 1. Propósito

Definir cómo se genera el estado histórico de saqueo de un asentamiento
antes de que el jugador llegue: mediante presión zonal correlacionada
espacialmente, rutas o corredores de grupos saqueadores y bolsas olvidadas
entre zonas muy explotadas, nunca mediante una tirada aislada por edificio.
Desarrolla las secciones 33, 37–49, 79–80 del Anexo A de `DESIGN-004`.

## 2. Principios que no deben romperse

- **El saqueo histórico es espacialmente correlacionado**: el estado de
  saqueo de un edificio no se decide con una tirada aislada. Depende de la
  presión de su zona y de la influencia de los edificios vecinos.
- **La zona influye, nunca impone un resultado absoluto**: todo edificio
  conserva atractivo, accesibilidad, visibilidad, resistencia, valor
  percibido, riesgo, ocultación, historia individual y variación propios,
  de forma que siempre puede existir una excepción dentro de una zona muy
  saqueada.
- **Valor percibido y valor real son conceptos distintos**: los grupos
  saqueadores históricos no fueron omniscientes. Un lugar de alto valor
  percibido (farmacia) probablemente fue saqueado; un lugar de alto valor
  real pero bajo valor percibido para la población general (un centro de
  datos) puede seguir bastante intacto.
- Esta entrega no convierte el modelo conceptual de puntuación en una
  fórmula numérica cerrada. El pseudocódigo de la sección 3.4 es
  orientativo, no un contrato de implementación.

## 3. Modelo funcional

### 3.1 Mapa de presión histórica de saqueo

Cada asentamiento genera conceptualmente un mapa de presión de saqueo, no
necesariamente visible al jugador, con zonas que van de casi intactas a
exhaustas: casi intacta, saqueo ligero, saqueo moderado, saqueo alto,
saqueo extremo, exhausta. Este mapa es un dato de generación histórica, no
un valor que el jugador consulte directamente como número.

### 3.2 Factores que modifican la presión

**Aumentan la presión**: centro del asentamiento, calles principales, zonas
comerciales, proximidad a supermercado, farmacia, gasolinera, ferretería,
hospital, estación, carretera principal, ruta de evacuación, accesibilidad
fácil, visibilidad, densidad de población, cercanía a antiguos refugios o a
comunidades posteriores.

**Reducen la presión**: calles secundarias, callejones, viviendas
escondidas, zonas de montaña, edificios aislados, accesos difíciles,
puertas cerradas, edificios peligrosos, inundaciones, incendios,
derrumbes, zonas infestadas, plantas superiores, sótanos y edificios que
desde fuera parecen poco útiles.

### 3.3 Correlación local

El estado de un edificio influye en sus vecinos inmediatos: si un
supermercado está en saqueo extremo, aumenta la probabilidad de que el
comercio contiguo también lo esté, con una influencia decreciente según la
distancia y las barreras físicas o de visibilidad entre ambos.

### 3.4 Modelo interno conceptual (no una fórmula cerrada)

```text
finalLootingScore =
    zoneLootPressure
  + roadAccessibility
  + perceivedValue
  + localNeighborInfluence
  + evacuationRouteInfluence
  + priorGroupRoutes
  + buildingVisibility
  - danger
  - concealment
  - accessDifficulty
  + randomVariation
```

Este pseudocódigo fija qué factores participan y en qué sentido (positivo o
negativo), no sus pesos, escalas ni unidades. Ninguna implementación puede
presentarlo como fórmula numérica definitiva sin una decisión adicional.

### 3.5 Rutas o corredores históricos de saqueo

Además del mapa de presión por zona, el asentamiento puede simular
recorridos históricos de grupos saqueadores concretos, por ejemplo: refugio
temporal → supermercado → farmacia → gasolinera → ferretería → salida del
asentamiento; o barrio residencial → vehículos → tienda de camping →
carretera. Estos corredores explican por qué una secuencia de edificios
alineados con una ruta de salida está más agotada que edificios
equivalentes fuera de esa ruta.

### 3.6 Bolsas olvidadas

Entre corredores muy explotados deben poder existir áreas poco tocadas: por
ejemplo, una calle secundaria con el supermercado cercano destruido y las
casas principales saqueadas, pero con una vivienda trasera prácticamente
intacta. Estas bolsas recompensan explorar, desviarse, observar e
investigar lugares menos evidentes; no son opcionales como principio, deben
poder aparecer en cualquier asentamiento generado.

### 3.7 Edificios especializados que pueden sobrevivir al saqueo

Una estación de bombeo, un transformador, un archivo municipal, un
laboratorio, una sala técnica, un servidor o una sala de calderas pueden
tener valor percibido bajo o medio para la población general y quedar
relativamente intactos, aunque su valor real para una comunidad
especializada sea enorme (ver el ejemplo del centro de datos en la sección
3.8).

### 3.8 Saqueo dinámico futuro

Más allá de la generación histórica inicial, el mundo puede seguir
perdiendo recursos aunque el jugador no esté presente: otras comunidades
pueden explorar, saquear, recuperar vehículos, vaciar comercios, desmontar
instalaciones u ocupar edificios con el tiempo. Este saqueo dinámico es un
horizonte futuro separado de la generación histórica inicial de este
documento y queda condicionado al coste de simulación que se mida al
implementarlo (ver
[ARC-003](../90-architecture/ARC-003_multiscale-simulation-principles.md)).
Esta entrega no lo diseña ni lo activa.

## 4. Reglas aprobadas

- El estado de saqueo de un edificio nunca se decide con una tirada
  aislada; debe derivarse de presión zonal, correlación local, rutas
  históricas y variación individual.
- Valor percibido y valor real son conceptos distintos y deben poder
  divergir: ningún edificio queda «obligatoriamente saqueado» solo por
  pertenecer a una categoría de alto valor real.
- Toda zona de saqueo alto o extremo debe admitir la posibilidad de bolsas
  olvidadas; ninguna implementación puede tratar una zona como
  completamente vaciada de forma determinista.
- El pseudocódigo de la sección 3.4 no se convierte en fórmula numérica
  cerrada sin una decisión adicional que fije pesos y escalas.
- El saqueo dinámico durante la partida (sección 3.8) es un horizonte
  futuro separado de la generación histórica inicial; no se activa por esta
  entrega.

## 5. Interacciones con otros sistemas

- El estado de saqueo modifica el deterioro y estado de explotación
  definidos en
  [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md).
- La historia del apocalipsis que da contexto causal a cada saqueo concreto
  se define en
  [WLD-007](WLD-007_place-history-and-environmental-storytelling.md).
- El mapa estratégico regional y sus zonas devastadas de más alto nivel se
  relacionan con
  [WLD-003](WLD-003_strategic-world-and-regional-simulation.md), sin que
  este documento diseñe su planificador.
- La generación determinista por semilla que produce este mapa de presión
  sigue definida en
  [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md).
- La entidad conceptual `LootPressureZone`, `LootingRoute` y `LootingEvent`
  se define en
  [ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md).

## 6. Casos límite o riesgos

- Convertir la presión zonal en una regla absoluta («toda la zona está
  vacía») contradice la sección 2 y la sección 80 del Anexo A.
- Aplicar un recorte lineal de objetos (por ejemplo «−70 % de objetos
  aleatorios») en vez de un saqueo con prioridades de saqueador (alimentos,
  agua, medicamentos, armas, combustible, herramientas obvias, baterías,
  ropa útil, ignorando manuales, libros, documentación, cableado,
  maquinaria desconocida, piezas, semillas poco identificables, bombas y
  motores) pierde la lógica causal exigida por
  [WLD-005](WLD-005_semantic-place-and-building-generation.md).

## 7. Preguntas abiertas

- Pesos, escalas y unidades exactos del modelo interno de la sección 3.4.
- Algoritmo exacto de generación de rutas o corredores y de bolsas
  olvidadas.
- Condiciones exactas de activación y coste de simulación del saqueo
  dinámico de la sección 3.8.
- Cómo y cuándo se revela al jugador información sobre la presión zonal sin
  romper la niebla y el descubrimiento progresivo de
  [WLD-002](WLD-002_local-exploration-and-information.md).

## 8. Ejemplos no normativos

El ejemplo de zona comercial principal en saqueo extremo (Anexo A, sección
79) frente a una calle secundaria en saqueo bajo a 150 metros ilustra el
principio; no son valores garantizados en ninguna semilla concreta.
