---
id: UI-001
title: Modelo de interacción y órdenes
status: approved
canonical_for:
  - selección y prioridades
  - designaciones
  - zonas
  - control puntual con ratón
  - información operativa de bloqueo
depends_on: []
related:
  - CHR-003
  - WLD-002
  - SET-003
  - ARC-001
  - UI-002
  - UI-003
  - UI-005
---

## 1. Propósito

Definir cómo el jugador percibe y controla el asentamiento en el mapa local:
selección, prioridades, designaciones, zonas y control puntual con ratón, sin
interfaz de órdenes en lenguaje natural ni planificador de expediciones
detallado.

## 2. Principios que no deben romperse

- El jugador no maneja un avatar en primera persona. Puede intervenir
  temporalmente sobre una persona, pero el juego sigue siendo de gestión.
- No hay una interfaz de órdenes escritas en lenguaje natural ni un
  planificador que obligue a configurar cada viaje con hora de regreso, ruta,
  riesgo y método. Las normas reutilizables y las zonas cumplen ese papel de
  forma sencilla.
- Una prioridad alta no permite ignorar requisitos ni atravesar una barrera
  física.

## 3. Modelo funcional

### 3.1 Bucle jugable local

1. El jugador observa el asentamiento, personas, necesidades, avisos y mapa.
2. Ajusta prioridades por persona y designa acciones sobre objetivos o zonas.
3. Los trabajos se generan a partir de esas designaciones y de necesidades
   existentes (por ejemplo, transportar agua al almacén o descansar).
4. Las personas eligen trabajos factibles dentro de sus prioridades y reglas,
   los realizan, interrumpen o terminan (ver
   [CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md)).
5. El jugador interviene con el ratón cuando quiere dirigir una acción
   concreta (ver sección 3.4).
6. La exploración, el trabajo, las relaciones y las amenazas cambian el
   estado real del mundo y la información conocida.
7. El asentamiento obtiene nuevas opciones, riesgos y decisiones.

### 3.2 Prioridades y familias de trabajo

Cada superviviente tiene una tabla individual de diez familias de trabajo con
cinco valores: `0` desactivado, `1` bajo, `2` normal, `3` alto y `4` crítico.
El jugador la modifica desde la ficha o un panel de trabajo. Estas diez
familias y esta escala `0–4` son el **subconjunto implementado del primer
corte** (ver [RDM-001](../roadmap/RDM-001_first-playable-slice.md)), no el
modelo final del horizonte completo. El horizonte aprobado de nueve bloques,
34 prioridades y escala `Nunca/1–5` vive en
[UI-003](UI-003_work-priority-taxonomy.md), que no se reescribe aquí; esta
entrega no migra datos, interfaz ni código. Las familias iniciales
implementadas son:

1. Necesidades personales y cuidado.
2. Transporte y almacenamiento.
3. Construcción y reparación.
4. Búsqueda y recuperación en edificios.
5. Exploración y reconocimiento.
6. Obtención de agua.
7. Obtención de alimento.
8. Preparación, conservación y remiendo.
9. Atención sanitaria.
10. Guardia y defensa.

Estas familias sirven para priorizar, filtrar y presentar tareas. No otorgan
competencias: una persona puede tener prioridad alta en alimento y no ser
capaz de pescar, cazar o identificar hongos; buscará un trabajo elegible
dentro de esa familia o quedará sin una tarea de esa familia (ver
habilidades en
[CHR-001](../30-characters/CHR-001_character-model.md)).

### 3.3 Designaciones y trabajos

Una designación se crea seleccionando con ratón un objetivo o una zona y
eligiendo una acción contextual: inspeccionar una casa, buscar en un armario,
recoger objetos, transportar al almacén, tapiar una ventana, reparar un
cierre, pescar en un tramo de agua, recolectar hongos, cortar un árbol,
construir un muro o vigilar un acceso, entre otras.

Cada trabajo generado contiene: acción, objetivo, ubicación, familia de
prioridad, requisitos, recursos reservados, estado, progreso, resultado y
motivo de bloqueo. Un trabajo se ejecuta solo si hay una persona elegible.

Una persona es elegible cuando cumple todos los requisitos obligatorios de la
acción: permiso de zona, acceso físico, herramienta si es imprescindible,
capacidad mínima cuando exista, estado físico suficiente y materiales
reservados (ver [SET-003](../40-settlement/SET-003_resources-logistics-and-condition.md)
para reservas de recursos).

Cuando varias tareas son elegibles, la selección ocurre en este orden:

1. Acciones directas activas del jugador.
2. Supervivencia inmediata: huir de peligro inmediato, recibir atención
   urgente, beber, comer o descansar si el estado ya impide trabajar.
3. Trabajos de prioridad `4`, luego `3`, `2` y `1`.
4. Dentro de la misma prioridad: urgencia del trabajo, proximidad, tiempo en
   espera y adecuación de la persona a la acción.
5. Si siguen empatados, elección estable basada en el ID de la persona y del
   trabajo; no una tirada repetida cada fotograma.

El sistema debe informar de forma operativa por qué una persona está
inactiva, ha abandonado un trabajo o no puede tomarlo (por ejemplo «sin
martillo», «zona prohibida», «cansada», «no reconoce hongos seguros» o «otro
superviviente reservó el depósito»). No puede esconder un error de rutas bajo
una explicación de personalidad.

### 3.4 Zonas y normas

El jugador delimita zonas con el ratón. Cada zona tiene uno de estos estados:

- **Habitual**: permite trabajar y circular de forma ordinaria.
- **Precaución**: permite entrar solo a trabajos con riesgo aceptado o cuando
  no exista una alternativa habitual equivalente.
- **Prohibida**: no se generan trabajos ordinarios ni se autoriza el tránsito
  autónomo hacia ella.

Una zona delimitada no se explora, inspecciona, limpia ni asegura por el mero
hecho de pintarla: solo define dónde pueden plantearse trabajos. Descubrir
información (ver
[WLD-002](../20-world/WLD-002_local-exploration-and-information.md)),
reclamar un lugar, poner vigilancia y construir una defensa son procesos
distintos.

Las zonas expresan una norma social. Una puerta cerrada, una valla, un muro,
un desnivel imposible o un edificio bloqueado son barreras físicas. La
autonomía puede transgredir una norma; no atraviesa una barrera física sin
realizar la acción necesaria.

Las normas reutilizables iniciales son globales y no requieren formularios
por expedición:

- La zona prohibida se evita.
- La zona de precaución se considera menos deseable que una alternativa
  habitual.
- El uso de armas de fuego incrementa ruido y se reserva para defensa o
  acción directa del jugador (ver
  [THR-001](../60-threats/THR-001_zombie-threat-model.md)).
- Las personas regresan a una zona habitual para descansar cuando pueden
  hacerlo sin peligro inmediato.

### 3.5 Control puntual con ratón

El jugador puede seleccionar una persona y tomar control puntual, con solo
ratón, sobre la superficie de mapa vigente en cada línea de código: la
cámara estratégica inclinada 3D del prototipo histórico Godot, o el mapa
Canvas 2D cenital del laboratorio de simulación activo (ver
[UI-005](UI-005_top-down-simulation-workbench.md)). El mecanismo de control
puntual es el mismo con independencia de la superficie de mapa:

1. Selecciona a la persona.
2. Hace clic en un destino, objeto, persona o elemento del entorno.
3. Elige una acción contextual disponible.
4. La persona realiza esa acción hasta completarla, cancelarla, quedar
   bloqueada o verse interrumpida por una necesidad o amenaza crítica.

Puede usarse para desplazarse, observar, inspeccionar, abrir, recoger,
transportar, reparar, ayudar, curar, pescar, ocultarse, atacar, retirarse o
realizar otras acciones que el objetivo permita; no se limita al combate.

Al concluir la acción, la persona vuelve a seleccionar trabajo con las reglas
de prioridades. El progreso completado, objetos consumidos y cambios del
mundo se conservan una sola vez; cancelar no duplica recursos ni resetea
efectos ya ocurridos.

## 4. Reglas aprobadas

- No existe primera persona, movimiento WASD, puntería manual, disparo manual
  ni un avatar de acción (ver
  [DEC-0004](../decisions/DEC-0004_mouse-strategic-control.md)).
- Tomar control no elimina tiempo, cansancio, miedo, heridas, herramientas,
  conocimientos, riesgo ni requisitos. Tampoco congela al resto de la
  comunidad: los demás continúan simulándose con sus prioridades.
- No documentar reglas de regreso por horario, rutas preferidas, porcentajes
  de riesgo o planes de misión en esta entrega. Esas opciones solo podrán
  añadirse más adelante si una prueba real demuestra que hacen falta.

## 5. Interacciones con otros sistemas

- La elegibilidad de un trabajo depende de las capas de personaje descritas
  en [CHR-001](../30-characters/CHR-001_character-model.md) y de la
  autonomía descrita en
  [CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md).
- La información descubierta que habilita designaciones se rige por
  [WLD-002](../20-world/WLD-002_local-exploration-and-information.md).
- Las reservas de recursos usadas por un trabajo se rigen por
  [SET-003](../40-settlement/SET-003_resources-logistics-and-condition.md).
- El horizonte máximo de gestión a escala comunitaria se desarrolla en
  [UI-002](UI-002_management-at-community-scale.md), sin alterar las reglas
  ya cerradas en este documento por `DESIGN-001`.
- El horizonte aprobado de prioridades, órdenes, zonas, políticas, eventos y
  trabajos, con nueve bloques y 34 prioridades, se desarrolla en
  [UI-003](UI-003_work-priority-taxonomy.md), sin sustituir las diez
  familias implementadas de la sección 3.2.
- El mapa Canvas 2D cenital, su niebla y su reloj para el laboratorio de
  simulación activo se desarrollan en
  [UI-005](UI-005_top-down-simulation-workbench.md), que adapta la
  superficie de mapa de la sección 3.5 sin reabrir estas reglas cerradas
  por `DESIGN-001`.

## 6. Casos límite o riesgos

- Un trabajo puede quedar bloqueado por falta de una persona elegible sin que
  eso sea un error del sistema; debe comunicarse con un motivo operativo.

## 7. Preguntas abiertas

Ninguna adicional a las ya registradas en `docs/OPEN-QUESTIONS.md` para otros
dominios relacionados (fórmulas de idoneidad exactas, catálogo completo de
acciones contextuales).

## 8. Ejemplos no normativos

Los ejemplos de acciones contextuales de la sección 3.3 (inspeccionar,
buscar, recoger, transportar, tapiar, reparar, pescar, recolectar, cortar,
construir, vigilar) ilustran el modelo; no son un catálogo cerrado de
acciones.
