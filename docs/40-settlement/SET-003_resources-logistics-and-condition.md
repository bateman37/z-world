---
id: SET-003
title: Recursos, logística y condición
status: approved
canonical_for:
  - reservas de recursos
  - estados de logística
  - condición y deterioro
  - rutas alternativas iniciales de agua y alimento
depends_on:
  - SET-001
  - SET-002
related:
  - UI-001
  - WLD-002
  - SET-004
  - SET-005
  - SET-008
  - CAT-005
  - SET-010
---

## 1. Propósito

Definir cómo se representan los recursos localizados, su transporte, su
condición y las rutas alternativas iniciales para resolver agua y alimento,
sin una cadena tecnológica única.

## 2. Principios que no deben romperse

- Todo recurso relevante tiene como mínimo: tipo, cantidad, ubicación,
  condición, accesibilidad, propietario si aplica y estado de reserva.
- No se duplican objetos, no se consumen recursos que no se pueden alcanzar
  y no se fabrica desde inventarios abstractos.

## 3. Modelo funcional

### 3.1 Estados de logística

Disponible, reservado, en transporte, almacenado, perdido o consumido.

Una reserva impide que varios trabajos usen el mismo objeto exclusivo al
mismo tiempo. Si una persona abandona o falla un trabajo, la reserva se
libera o se transforma según el resultado real.

### 3.2 Recursos rastreados en la primera versión

- Agua.
- Alimento fresco.
- Alimento conservado.
- Madera y tablones.
- Tela y prendas.
- Herramientas básicas.
- Materiales de reparación.
- Medicinas básicas.
- Munición inicial, si existe en esa semilla.

Agua y alimentos se transportan al almacén o a una instalación pertinente; no
se convierten automáticamente en una cifra global al ser descubiertos.

Esta lista de nueve recursos agregados procede del prototipo histórico
Godot (`IMPLEMENTATION-003`) y todavía no existe en la nueva línea web.
`DESIGN-008` reconcilia expresamente el recurso «Materiales de
reparación»: deja de ser una pila universal capaz de reparar
indistintamente cualquier cosa y pasa a ser, como mucho, un filtro o
resumen visible de existencias compatibles concretas (chapa, madera y
tablones, cableado, componentes eléctricos I, piezas mecánicas I, etc.),
cuya fuente real son las familias logísticas de
[SET-008](SET-008_object-model-and-logistics-families.md) y el catálogo
inicial aprobado de
[CAT-005](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md).
Cada solución de reparación debe declarar sus materiales y componentes
concretos; ninguna implementación futura puede volver a tratar
«materiales de reparación» como un recurso agregado independiente que se
consume igual para reparar una puerta, una bomba, un frigorífico o una
carretera.

### 3.3 Condición y deterioro

La comida fresca se deteriora; la conservación, el entorno y el
almacenamiento pueden modificar su condición. Los valores y curvas exactos
quedan abiertos, pero la condición no puede ser puramente cosmética.

A largo plazo, combustible, piezas, electricidad y medicamentos pueden
degradarse; esto empuja a soluciones locales, pero no obliga a todas las
partidas a seguir una secuencia de eras idéntica (ver
[SET-002](SET-002_production-and-solutions.md)).

## 4. Reglas aprobadas

Cada necesidad admite rutas alternativas. Para la primera prueba:

- El agua se puede resolver por **acarreo desde un punto de agua** o por
  **conducción por gravedad desde un punto elevado**. La conducción por
  gravedad requiere reconocer una fuente adecuada, acceso, materiales,
  construcción/carpintería y fontanería; no necesita implementar
  electricidad. El acarreo requiere recipientes, trayectos seguros y trabajo
  repetido. Ambas son viables, tienen consecuencias distintas y ninguna está
  garantizada en cada semilla.
- El alimento se puede obtener mediante búsqueda, pesca, recolección de
  hongos o caza cuando la geografía y las personas lo permitan.
- El descanso comienza acondicionando el edificio existente.
- La defensa empieza cerrando accesos, tapiando y construyendo barreras
  simples con recursos disponibles.

Vehículos, animales, electricidad y producción industrial avanzada quedan
fuera de la primera versión.

## 5. Interacciones con otros sistemas

- Las reservas se crean y liberan según los trabajos definidos en
  [UI-001](../80-interface/UI-001_interaction-and-command-model.md).
- Los recursos se descubren mediante las acciones de
  [WLD-002](../20-world/WLD-002_local-exploration-and-information.md).
- Las habilidades que habilitan cada ruta se definen en
  [CHR-001](../30-characters/CHR-001_character-model.md).
- El horizonte máximo de catálogos, mantenimiento y red productiva se
  desarrolla en
  [SET-004](SET-004_technological-transition-and-knowledge-economy.md) y
  [SET-005](SET-005_production-web-and-infrastructure.md).
- El modelo de objeto completo y las familias logísticas de horizonte
  máximo se definen en
  [SET-008](SET-008_object-model-and-logistics-families.md); el primer
  catálogo aprobado de objetos, materiales y transporte se define en
  [CAT-005](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md).
- El transporte local que traslada estos recursos entre origen, destino y
  almacén se define en
  [SET-010](SET-010_local-hauling-and-transport.md).

## 6. Casos límite o riesgos

- Ninguna ruta debe quedar garantizada en toda semilla: si una partida carece
  de fuente elevada, la conducción por gravedad no es viable y debe
  comunicarse como tal, no fallar en silencio.

## 7. Preguntas abiertas

- Catálogo concreto de recursos, edificios, recetas y herramientas más allá
  de la lista de la sección 3.2. Ver `docs/OPEN-QUESTIONS.md`.
- Valores y curvas exactos de deterioro y condición.

## 8. Ejemplos no normativos

Ninguno.
