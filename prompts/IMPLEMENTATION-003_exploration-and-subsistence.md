# Z-World — IMPLEMENTATION-003: exploración y subsistencia

## 1. Contexto y precondiciones

`IMPLEMENTATION-002` está fusionada y aceptada manualmente. El proyecto Godot
abre, muestra el pueblo de montaña y seis supervivientes, y funcionan cámara,
selección, HUD, reloj, pausa, velocidades, prioridades, designaciones,
trabajos, reservas, navegación y control puntual con ratón.

Esta entrega implementa exclusivamente la tercera etapa de `RDM-001`:
**Exploración y subsistencia**. Debe convertir el mapa en un lugar del que la
comunidad obtiene información, agua, alimento, materiales y descanso, y en el
que esas cosas se transportan, se almacenan, se consumen y se estropean.

No implementes todavía defensa, zombis, autonomía, aprendizaje, guardado ni
generación procedural. Inspecciona primero el código real de
`IMPLEMENTATION-002` y extiéndelo; no crees un segundo sistema de trabajos ni
rehagas la maqueta del mapa.

Dennis prefiere realizar las pruebas funcionales manuales. Las pruebas
automatizadas deben limitarse al smoke test pequeño de la sección 19.

## 2. Lecturas obligatorias y límite de contexto

Lee, en este orden:

1. `AGENTS.md`, `CLAUDE.md`, `docs/INDEX.md`, `docs/STATUS.md` y
   `prompts/README.md`.
2. `docs/roadmap/RDM-001_first-playable-slice.md`, especialmente la tercera
   entrega.
3. `docs/20-world/WLD-001_world-scales.md` y
   `docs/20-world/WLD-002_local-exploration-and-information.md`.
4. `docs/40-settlement/SET-001_settlement-growth.md`,
   `docs/40-settlement/SET-002_production-and-solutions.md` y
   `docs/40-settlement/SET-003_resources-logistics-and-condition.md`.
5. `docs/80-interface/UI-001_interaction-and-command-model.md`.
6. `docs/30-characters/CHR-001_character-model.md` y
   `docs/30-characters/CHR-002_knowledge-and-learning.md`, solo para los
   requisitos de habilidad; no implementes aprendizaje.
7. `docs/90-architecture/ARC-001_technical-direction.md` y
   `docs/90-architecture/ARC-002_procedural-generation-and-persistence.md`,
   únicamente para la dirección técnica y el tiempo simulado.
8. Los scripts y escenas reales de `IMPLEMENTATION-002` que vayas a
   modificar.

No leas el horizonte máximo, la taxonomía extendida, amenazas, sociedad o
narrativa salvo que una referencia concreta revele una contradicción. Usa
`rg` por identificador antes de ampliar contexto.

## 3. Objetivo verificable

Al terminar, Dennis debe poder completar un bucle de exploración y
subsistencia:

1. Observar, inspeccionar y registrar el refugio candidato y otros dos
   edificios, y ver cómo cambia la información conocida sobre cada lugar.
2. Establecer un almacén y un depósito de agua localizados.
3. Acondicionar una zona de descanso y ver a las personas descansar en ella.
4. Ver recursos concretos aparecer en el mapa, reservarse, transportarse y
   quedar almacenados, sin que se dupliquen ni desaparezcan.
5. Ver las necesidades de hidratación, alimentación y descanso bajar con el
   tiempo y resolverse con acciones automáticas.
6. Obtener agua por **dos rutas distintas**: acarreo desde un punto de agua y
   conducción por gravedad desde un manantial elevado.
7. Obtener alimento por **más de una ruta**: registro de edificios, pesca en
   el estanque y recolección de hongos.
8. Ver el alimento fresco deteriorarse y poder conservarlo secándolo.
9. Leer siempre por qué algo no se puede hacer, en español y en términos
   operativos.

## 4. Información de lugares

Cada lugar relevante del mapa tiene un **nivel de información** conocida por
la comunidad, distinto de su estado real (WLD-002, sección 3.1):

| Nivel | Id | Qué significa |
|---|---|---|
| No conocido | `unknown` | No hay información operativa. |
| Avistado | `sighted` | Se conoce su presencia y su exterior. |
| Observado | `observed` | Se han obtenido indicios desde fuera. |
| Inspeccionado | `inspected` | Se conoce su contenido y se puede recoger. |
| Aprovechado | `exploited` | Registrado por completo: no queda nada. |

Acciones que hacen avanzar la información:

| Acción | Id | Familia | Habilidad mínima | Duración a ×1 |
|---|---|---|---|---|
| Observar el lugar | `observe_place` | `explore_recon` | `observation_inspection >= 1` | 5 s |
| Inspeccionar el lugar | `inspect_place` | `search_recover` | `observation_inspection >= 2` | 10 s |
| Registrar el lugar | `register_place` | `search_recover` | `search_recovery >= 2` | 12 s |

El nivel de información nunca retrocede. El contenido fijo de un lugar se
**materializa exactamente una vez**, al inspeccionarlo; registrar de nuevo no
puede duplicarlo. La interfaz debe distinguir siempre «no reconocemos nada
más útil» de «no queda nada» (WLD-002, sección 4).

### Contenido fijo

| Lugar | Contenido |
|---|---|
| `building.shelter_candidate` | 4 madera y tablones, 2 materiales de reparación, 3 tela, 1 herramientas básicas |
| `building.house_a` | 2 alimento conservado, 2 recipientes de agua, 3 tela, 1 medicinas básicas |
| `building.workshop` | 2 herramientas básicas, 4 materiales de reparación, 3 madera y tablones, 1 recipientes de agua |

Registrar el refugio candidato establece el almacén y el depósito de agua.

## 5. Catálogo de recursos y estados logísticos

Diez tipos rastreados, con identificador estable:

| Id | Nombre | Notas |
|---|---|---|
| `water` | Agua | Se almacena en el depósito localizado. |
| `food_fresh` | Alimento fresco | Perecedero. |
| `food_preserved` | Alimento conservado | Estable. |
| `food_spoiled` | Alimento echado a perder | No comestible. |
| `wood_planks` | Madera y tablones | |
| `cloth` | Tela y prendas | |
| `basic_tools` | Herramientas básicas | |
| `repair_materials` | Materiales de reparación | |
| `basic_medicine` | Medicinas básicas | |
| `water_container` | Recipientes de agua | Reutilizables. |

Cubren la lista de SET-003 sección 3.2 salvo la munición inicial, que esta
semilla no contiene.

Cada pila de recurso tiene tipo, cantidad, ubicación, posición, condición,
accesibilidad, portador si aplica y estado de reserva, y uno de estos
**estados logísticos**: `available`, `reserved`, `in_transport`, `stored`,
`consumed`, `lost`. Ninguna operación puede duplicar ni perder cantidad.

## 6. Pertenencias de llegada

Cada superviviente llega con algo encima, como pilas reales que hay que
depositar en el almacén cuando exista:

| Persona | Pertenencia |
|---|---|
| `person.initial.01` | 1 herramientas básicas |
| `person.initial.02` | 1 recipientes de agua |
| `person.initial.03` | 1 medicinas básicas |
| `person.initial.04` | 1 alimento conservado |
| `person.initial.05` | 1 recipientes de agua |
| `person.initial.06` | 1 tela |

## 7. Almacén, depósito y transporte

- **Almacén** general: capacidad **50** unidades, localizado en el refugio
  candidato. No existe hasta registrar el refugio; antes, cualquier
  transporte queda bloqueado con un motivo explícito.
- **Depósito de agua**: capacidad **12** unidades, localizado junto al
  refugio.
- **Transporte** (`haul_storage`, familia «Transporte y almacenamiento»):
  lotes de hasta **5** unidades por viaje, con fases de ida, recogida,
  retorno y depósito. Un lote no mezcla destinos.
- Acción **«Transportar todo lo accesible»**: designa un transporte por cada
  lugar con pilas sin recoger.

## 8. Necesidades básicas

Tres necesidades por persona, en escala `0–100` (100 = cubierta):

| Necesidad | Id | Pérdida por día simulado | Acción automática | Recuperación |
|---|---|---|---|---|
| Hidratación | `hydration` | 40 | Beber (1 agua) | +40 |
| Alimentación | `nutrition` | 30 | Comer (1 alimento comestible) | +45 |
| Descanso | `rest` | 25 | Descansar en zona acondicionada | +60 |

Umbrales: **normal** por encima de 50, **advertida** en 50 o menos,
**crítica** en 20 o menos. El valor nunca sale del rango `0–100` y beber o
comer consume exactamente una unidad.

**Resolución del bloqueo circular**: si una necesidad crítica no se puede
resolver porque no hay recurso, el tablón abre automáticamente un trabajo de
supervivencia (transportar lo que ya esté en el suelo, u observar,
inspeccionar, registrar, acarrear agua, pescar o recolectar según el caso).
Esos trabajos ignoran una prioridad desactivada e interrumpen el trabajo en
curso, conservando su progreso y sus reservas.

## 9. Fuentes de alimento

| Fuente | Lugar | Habilidad mínima | Duración a ×1 | Disponibilidad |
|---|---|---|---|---|
| Pescar en el estanque | `site.pond_fishing` | `fishing >= 2` | 10 s | 12 unidades |
| Recolectar hongos | `site.forest_mushrooms` | `mushroom_foraging >= 2` | 8 s | 8 unidades |

Ambas exigen inspeccionar antes el lugar. Cada fuente admite una **política**
de obtención continua (activar/detener) que regenera el trabajo mientras
quede disponibilidad. Una fuente sin inspeccionar informa «no reconocemos
nada más útil aquí todavía»; una agotada informa «no queda nada: la fuente
está agotada». Reconocer una fuente nunca reabastece lo ya consumido.

## 10. Agua por dos rutas y conservación

- **Acarreo**: `fetch_water` en `site.stream_water`, tras observarlo. Usa un
  **recipiente reutilizable** que vuelve al almacén, trae **2** unidades de
  agua por viaje y admite la política **«Mantener 12 de agua»**, que repite
  el viaje hasta llenar el depósito.
- **Conducción por gravedad**: `plan_conduction` en `site.highland_spring`
  (`plumbing_water >= 2`, 12 s, requiere inspección) y `build_conduction` en
  `site.water_deposit` (`construction_carpentry >= 2`, 20 s), que consume
  **4 madera y tablones** y **2 materiales de reparación** exactamente una
  vez. Una vez construida produce **1 unidad de agua cada 10 s** observables
  a ×1, sin superar nunca la capacidad de 12 del depósito y sin ocupar a
  nadie.
- **Deterioro**: el alimento fresco pierde condición por día simulado según
  dónde esté: **60** en el terreno, **45** en transporte y **25**
  almacenado. Al llegar a 0 se transforma, una sola vez, en alimento echado a
  perder. El alimento conservado es estable.
- **Secado** (`dry_food`, taller, `food_preservation >= 2`, 14 s):
  **3** unidades de alimento fresco almacenado producen **2** de alimento
  conservado.

## 11. Integración con el sistema de trabajo existente

No se crea un segundo sistema de trabajos. Se amplía el `WorkOrder`
existente con **fases** (`travel`, `act`, `return`, `deliver`), **recursos
requeridos y reservados** y **destino de entrega**, y el `WorkBoard` sigue
siendo el único que decide quién hace qué. Las diez familias de prioridad de
`UI-001` y las once habilidades de `CHR-001` se conservan sin cambios; esta
entrega da acciones reales a ocho de las diez familias (quedan sin acciones
«Atención sanitaria» y «Guardia y defensa»).

Las reservas pasan a ser por lugar **y** acción: un mismo lugar admite varias
acciones distintas, pero nunca dos veces la misma a la vez.

## 12. Sustitución de los demostradores de IMPLEMENTATION-002

Los ocho objetivos demostradores (cuatro pilas de escombros y cuatro puntos
de reconocimiento) se retiran y se sustituyen por ocho lugares reales: los
tres edificios explorables (`building.shelter_candidate`,
`building.house_a`, `building.workshop`) y cinco lugares del terreno
(`site.stream_water`, `site.pond_fishing`, `site.forest_mushrooms`,
`site.highland_spring`, `site.water_deposit`).

## 13. Interfaz

- Franja superior con lo **almacenado** por tipo y la ocupación del almacén y
  del depósito.
- Panel **«Recursos»** con cantidad por tipo y estado logístico, y acceso a
  «Transportar todo lo accesible».
- Panel de selección de un lugar con su nivel de información, indicios,
  contenido pendiente, estado de la fuente o de la conducción y **botones por
  acción**, con el motivo cuando una acción no es posible.
- Menú contextual de clic derecho con **múltiples acciones** («Hacer ahora»,
  «Designar», «Cancelar designación», políticas y «Transportar todo lo
  accesible»), con las opciones imposibles deshabilitadas y su razón.
- Ficha de persona con estado, actividad, fase, motivo, progreso,
  **necesidades**, **carga** y las once habilidades.

## 14. Organización técnica

Módulos pequeños y separados, sin duplicar el tablón existente:

- Información de lugares: `place_definitions.gd`, `place_info.gd`,
  `place_registry.gd`.
- Recursos: `resource_definitions.gd`, `resource_stack.gd`,
  `resource_registry.gd`, `spoilage_service.gd`.
- Asentamiento: `storage_store.gd`, `finite_source.gd`,
  `water_conduction.gd`.
- Personas: `person_needs.gd`.
- Trabajo: `work_actions.gd`, `work_execution.gd`, más la ampliación de
  `work_order.gd` y `work_board.gd`.

## 15. Fuera de alcance estricto

Sin generación procedural, sin guardado ni carga, sin interiores 3D, sin
zonas de territorio, sin agricultura, animales, combustible ni electricidad,
sin potabilización, cocina ni recetas, sin salud, enfermedad ni muerte, sin
aprendizaje, sin relaciones, sin zombis ni combate y sin director narrativo.

Arquitecturas explícitamente prohibidas: base de datos, contenido en JSON,
autoload global, ECS, framework de recetas, event bus universal y sistema de
mods.

## 16. Documentación que debe actualizarse

`README.md`, `docs/STATUS.md`,
`docs/roadmap/RDM-001_first-playable-slice.md`, `CHANGELOG.md`,
`prompts/INDEX.md` y este propio archivo. No se marca `WLD-002`, `SET-003`,
`CHR-001` ni `UI-001` como `implemented`: solo existe el subconjunto de esta
entrega.

## 17. Pruebas automatizadas mínimas

Un único archivo, `tests/smoke_test.gd`, con estas seis comprobaciones
lógicas nuevas, además de las anteriores que sigan siendo válidas (se
retiran las ligadas a los ocho demostradores):

1. Niveles de información y materialización única del contenido fijo.
2. Reservar, recoger y depositar conserva la cantidad exacta.
3. Una necesidad crítica consume exactamente una unidad y el valor nunca sale
   de `0–100`.
4. Deterioro del alimento fresco frente a la estabilidad del conservado, con
   transformación en condición 0.
5. Límites de disponibilidad de pesca y hongos, distinguiendo «no
   reconocido» de «agotado».
6. La conducción reserva y consume materiales una sola vez y no supera la
   capacidad de 12 del depósito.

Comandos, si Godot 4.7.2 está disponible en el entorno:
`godot --headless --path . --editor --quit`,
`godot --headless --path . --script res://tests/smoke_test.gd` y
`git diff --check`. Si Godot no está disponible, no se instala: se registra
como `NOT RUN`, pero `git diff --check` sí se ejecuta.

## 18. Prueba manual para Dennis

No se declara superada por el agente. Lista en `README.md`.

## 19. Criterios de aceptación

El bucle de la sección 3 funciona de principio a fin, los demostradores de
`IMPLEMENTATION-002` han desaparecido, ninguna operación duplica o pierde
recursos, todos los bloqueos se explican en español y la documentación queda
actualizada con la entrega marcada como implementada técnicamente y
**pendiente** de la prueba manual de Dennis.

## 20. Informe final

En español, con: bucle disponible; lugares, recursos, necesidades y
alternativas implementadas; cómo se amplió el sistema existente sin
duplicarlo; validaciones ejecutadas con resultado real o `NOT RUN`; prueba
manual exacta y riesgos a observar; y qué queda fuera para
`IMPLEMENTATION-004`.
