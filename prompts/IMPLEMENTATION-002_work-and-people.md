# Z-World — IMPLEMENTATION-002: trabajo y personas

## 1. Contexto y precondiciones

`IMPLEMENTATION-001` está fusionada y Dennis ha completado correctamente toda
su prueba manual el 18 de septiembre de 2026. El proyecto Godot abre, muestra
el pueblo de montaña y seis supervivientes, y funcionan cámara, selección,
HUD, reloj, pausa y velocidades.

Esta entrega implementa exclusivamente la segunda etapa de `RDM-001`:
**Trabajo y personas**. Debe convertir las seis figuras quietas en personas
que pueden recibir prioridades, elegir trabajos factibles, desplazarse,
reservar un objetivo y ejecutarlo; además, el jugador podrá intervenir con el
ratón sobre una persona concreta.

No implementes aún supervivencia, recursos, interiores, zombis ni autonomía
narrativa. Inspecciona primero el código real de `IMPLEMENTATION-001` y
extiéndelo; no reemplaces sistemas que ya funcionan ni rehagas la maqueta.

Dennis prefiere realizar las pruebas funcionales manuales. Las pruebas
automatizadas de Claude deben limitarse al smoke test pequeño indicado en la
sección 16. No crees suites extensas ni pruebas de cada botón o detalle visual.

## 2. Lecturas obligatorias y límite de contexto

Lee, en este orden:

1. `AGENTS.md`, `CLAUDE.md`, `docs/INDEX.md`, `docs/STATUS.md` y
   `prompts/README.md`.
2. `docs/roadmap/RDM-001_first-playable-slice.md`, especialmente la segunda
   entrega.
3. `docs/80-interface/UI-001_interaction-and-command-model.md`.
4. `docs/30-characters/CHR-001_character-model.md` y
   `docs/30-characters/CHR-003_autonomy-intentions-and-behavior.md`.
5. `docs/40-settlement/SET-003_resources-logistics-and-condition.md`, solo la
   regla conceptual de reserva; no implementes recursos.
6. `docs/90-architecture/ARC-001_technical-direction.md` y
   `docs/90-architecture/ARC-002_procedural-generation-and-persistence.md`,
   únicamente para respetar la separación existente y el tiempo simulado.
7. Los scripts y escenas creados por `IMPLEMENTATION-001` que vayas a
   modificar.

No leas el horizonte máximo, la taxonomía extendida, amenazas, sociedad o
narrativa salvo que una referencia concreta revele una contradicción. Usa
`rg` por ID antes de ampliar contexto.

## 3. Objetivo verificable

Al terminar, Dennis debe poder:

1. Abrir un panel de prioridades con las seis personas y las diez familias de
   trabajo.
2. Cambiar cualquier prioridad entre `0` y `4` usando solo el ratón.
3. Designar trabajos sobre elementos visibles del mapa.
4. Ver cómo una persona elegible reserva el objetivo, se desplaza hasta él,
   trabaja y lo completa.
5. Entender quién hace qué y por qué un trabajo no puede empezar.
6. Abrir la ficha básica de cada persona y ver estado, actividad y las once
   habilidades iniciales.
7. Dar una orden puntual de movimiento o trabajo a una persona con clic
   derecho y comprobar que después vuelve a la gestión automática.
8. Pausar o acelerar sin romper movimiento, progreso, reservas ni interfaz.

## 4. Alcance funcional exacto

### 4.1 Personas: identidad, habilidades y estado de trabajo

Conserva los IDs y nombres provisionales existentes:

- `person.initial.01` — «Superviviente 1».
- `person.initial.02` — «Superviviente 2».
- `person.initial.03` — «Superviviente 3».
- `person.initial.04` — «Superviviente 4».
- `person.initial.05` — «Superviviente 5».
- `person.initial.06` — «Superviviente 6».

No inventes todavía nombres propios, profesiones, historias, relaciones,
rasgos, necesidades o motivaciones.

Cada persona incorpora un estado de trabajo separado de su representación
visual:

- ID y nombre.
- Las diez prioridades de trabajo.
- Las once habilidades iniciales.
- Estado operativo actual.
- Trabajo actual, si existe.
- Orden directa actual, si existe.
- Motivo operativo cuando está inactiva o no puede actuar.

Los estados operativos de esta entrega son exactamente:

- `idle`: libre, buscando trabajo o sin trabajo elegible.
- `moving`: desplazándose hacia un destino.
- `working`: ejecutando un trabajo.
- `direct_order`: cumpliendo una intervención puntual del jugador.

`blocked` es un estado del trabajo, no una personalidad ni una etiqueta
permanente de la persona. No implementes hambre, sed, cansancio, salud, miedo,
estrés, heridas ni muerte.

### 4.2 Habilidades provisionales

Incluye las once habilidades exactas de `CHR-001` con IDs técnicos estables:

| ID | Nombre visible |
|---|---|
| `observation_inspection` | Observación e inspección |
| `search_recovery` | Búsqueda y recuperación |
| `fishing` | Pesca |
| `mushroom_foraging` | Identificación y recolección de hongos |
| `tracking_hunting` | Rastreo y caza |
| `cooking` | Cocina |
| `food_preservation` | Conservación de alimentos |
| `mending_sewing` | Remiendo y costura |
| `construction_carpentry` | Construcción y carpintería |
| `plumbing_water` | Fontanería y conducción de agua |
| `first_aid` | Primeros auxilios |

Usa temporalmente una escala entera `0–4`: sin experiencia, principiante,
funcional, competente y especialista. Es una escala de implementación para
probar elegibilidad y no una fórmula final de progreso.

Los perfiles provisionales son:

| Persona | Fortalezas | Resto de habilidades |
|---|---|---|
| 1 | Construcción `4`, fontanería `2`, remiendo `2` | `1` |
| 2 | Observación `4`, rastreo `3`, búsqueda `2` | `1` |
| 3 | Primeros auxilios `4`, observación `2` | `1` |
| 4 | Cocina `4`, conservación `3`, hongos `2` | `1` |
| 5 | Pesca `4`, hongos `3`, rastreo `2` | `1` |
| 6 | Búsqueda `4`, remiendo `3`, construcción `2` | `1` |

No deduzcas profesiones ni historias a partir de estos valores. No
implementes aprendizaje, experiencia, calidad, accidentes o cambios de nivel.

### 4.3 Prioridades de trabajo

Implementa las diez familias exactas de `UI-001`:

| ID | Nombre visible |
|---|---|
| `needs_care` | Necesidades y cuidado |
| `haul_storage` | Transporte y almacenamiento |
| `build_repair` | Construcción y reparación |
| `search_recover` | Búsqueda y recuperación |
| `explore_recon` | Exploración y reconocimiento |
| `water` | Obtención de agua |
| `food` | Obtención de alimento |
| `prepare_preserve_mend` | Preparación, conservación y remiendo |
| `healthcare` | Atención sanitaria |
| `guard_defense` | Guardia y defensa |

Todas comienzan en nivel `2` para las seis personas. Una prioridad representa
preferencia, no competencia. Nivel `0` excluye los trabajos automáticos de esa
familia; niveles `1–4` se ordenan de menor a mayor prioridad.

El panel **«Prioridades»** muestra una matriz con familias en filas y las seis
personas en columnas. Cada celda muestra siempre el número:

- Clic izquierdo: aumenta `0 → 1 → 2 → 3 → 4 → 0`.
- Clic derecho: reduce `4 → 3 → 2 → 1 → 0 → 4`.
- Color y número comunican el valor; nunca dependas solo del color.
- El tooltip muestra nombre completo de persona, familia y valor.

La tabla debe caber mediante scroll si es necesario. No implementes copiar,
pegar, presets, multiselección ni prioridades por turno.

## 5. Trabajos y designaciones

### 5.1 Tipos de trabajo demostrables

Añade al mapa ocho objetivos de trabajo simples, situados en zonas abiertas y
alcanzables:

- Cuatro pilas de escombros: **«Despejar escombros»**.
  - Familia: `build_repair`.
  - Habilidad requerida: `construction_carpentry >= 2`.
  - Duración base visible: 8 segundos a ×1 después de llegar.
  - Al completarse, la pila desaparece y queda registrada como completada.
- Cuatro puntos de reconocimiento: **«Reconocer punto»**.
  - Familia: `explore_recon`.
  - Habilidad requerida: `observation_inspection >= 2`.
  - Duración base visible: 6 segundos a ×1 después de llegar.
  - Al completarse, el marcador cambia a estado reconocido y deja de ofrecer
    el trabajo.

Son demostradores del sistema de trabajo. No revelan interiores, recursos,
niebla de guerra ni información procedural.

Cada objetivo puede estar en uno de estos estados:

- `available`.
- `designated`.
- `in_progress`.
- `completed`.

Al seleccionarlo con clic izquierdo, el panel contextual muestra nombre,
estado y una única acción coherente:

- **«Designar trabajo»** cuando está disponible.
- **«Cancelar designación»** cuando está designado o en curso.
- Ninguna acción cuando está completado.

Cancelar un trabajo en curso conserva el progreso ya realizado, libera
persona y reserva, y devuelve el objetivo a `available`. Volver a designarlo
reanuda el progreso restante. No hay materiales que devolver en esta entrega.

### 5.2 Modelo de trabajo

Cada trabajo contiene como mínimo:

- ID estable y único.
- Tipo de acción.
- Objetivo y posición.
- Familia de prioridad.
- Habilidad y nivel mínimo.
- Estado.
- Progreso y duración.
- Persona asignada, si existe.
- Reserva del objetivo.
- Momento de creación para desempate.
- Resultado o motivo de bloqueo.

Los estados del trabajo son:

- `pending`.
- `reserved`.
- `moving`.
- `working`.
- `completed`.
- `cancelled`.
- `blocked`.

Un objetivo admite como máximo una reserva simultánea. Nunca pueden caminar
dos personas hacia la misma pila o punto para ejecutar el mismo trabajo. La
reserva se libera al cancelar, quedar inalcanzable o ser sustituido por una
orden directa; al completar, el objetivo queda consumido y no genera otro
trabajo.

En esta entrega solo se reserva el objetivo del trabajo. No simules objetos,
inventarios ni reservas de recursos de `SET-003`.

## 6. Elección automática de trabajo

La asignación se evalúa en momentos concretos: cuando una persona queda libre,
se crea o cancela un trabajo, cambia una prioridad o termina una orden directa.
No recalcules decisiones aleatorias cada fotograma.

Una persona es elegible cuando:

- Su prioridad para la familia es mayor que `0`.
- Cumple la habilidad mínima.
- El objetivo está disponible o designado, no completado.
- No existe otra reserva sobre el objetivo.
- Existe una ruta válida.

Para cada persona libre, ordena los trabajos elegibles así:

1. Mayor prioridad individual (`4` a `1`).
2. Mayor urgencia del trabajo; en esta entrega todos usan urgencia normal.
3. Menor distancia de ruta.
4. Mayor tiempo de espera.
5. Mayor nivel de la habilidad requerida.
6. ID estable de persona y trabajo como desempate final.

No añadas tiradas aleatorias. La misma situación debe producir la misma
asignación.

Si un trabajo no tiene ninguna persona elegible, permanece visible como
`blocked` y muestra una razón operativa concreta. Usa solo estas razones:

- «Prioridad desactivada para todas las personas».
- «Nadie tiene la habilidad mínima».
- «Objetivo sin ruta disponible».
- «Objetivo reservado por otra persona».

Cuando cambie la condición que lo bloquea, debe volver automáticamente a
`pending` y poder asignarse. No uses personalidad para ocultar un error de
ruta o configuración.

Una persona sin trabajo muestra una razón útil: «No hay trabajos
designados», «No hay trabajos elegibles según sus prioridades» o «Los
trabajos compatibles ya están reservados».

## 7. Movimiento

Implementa navegación 3D local para las seis personas:

- Usa `NavigationAgent3D` y la navegación nativa de Godot, salvo que el
  código existente revele una incompatibilidad concreta que debas justificar.
- El proyecto debe incluir o generar automáticamente toda la navegación
  necesaria; Dennis no debe hornear una malla manualmente en el editor.
- Las rutas no pueden atravesar edificios, agua ni salir de los límites del
  terreno útil.
- Si el destino exacto no es transitable, usa el punto navegable válido más
  próximo o informa de que no hay ruta.
- La persona gira hacia la dirección de avance y se mueve de forma continua,
  sin teletransportarse.
- Las seis personas pueden moverse simultáneamente sin ocupar exactamente la
  misma posición final.

A ×1, cruzar una distancia corta del asentamiento debe resultar observable,
no instantáneo. ×2, ×4 y ×10 multiplican de forma coherente movimiento y
trabajo. Pausa detiene ambos de inmediato. No uses `Engine.time_scale`: amplía
el reloj existente con una señal o servicio pequeño de avance de simulación y
mantén cámara/HUD activos durante la pausa.

Para movimiento y duraciones de trabajo, ese avance utiliza
`gameplay_delta = real_delta × multiplier` y vale `0` en pausa. No uses los
72 segundos del calendario por segundo real como delta de trabajo: las
duraciones de 6 y 8 segundos indicadas arriba son segundos observables a ×1.
El calendario conserva por separado su conversión aprobada de 20 minutos por
día.

No implementes colisiones físicas complejas entre personas, formación,
empujones, puertas, interiores, animaciones artísticas ni transporte de
objetos.

## 8. Ejecución y feedback del trabajo

Al llegar al radio válido del objetivo:

1. La persona pasa de `moving` a `working`.
2. El objetivo pasa a `in_progress`.
3. El progreso avanza conforme al tiempo del juego y a su velocidad.
4. Un indicador sencillo muestra el progreso cuando el objetivo o la persona
   están seleccionados.
5. Al completar, se aplica una sola vez el cambio visual definido en 5.1.
6. Se libera la reserva y la persona vuelve a buscar trabajo.

La habilidad solo determina elegibilidad y desempate en esta entrega; no
modifica duración, calidad ni resultado.

El panel **«Trabajos»** muestra trabajos activos y los últimos completados con:
acción, objetivo, persona, estado, progreso o motivo de bloqueo. No construyas
historial ilimitado, filtros, estadísticas ni registro narrativo.

## 9. Ficha básica de persona

Al seleccionar una persona, el panel existente se amplía con:

- Nombre e ID.
- Estado operativo visible.
- Acción o trabajo actual.
- Motivo operativo si está inactiva.
- Progreso cuando trabaja.
- Las once habilidades con número y etiqueta cualitativa.
- Botón **«Cancelar orden directa»** solo cuando exista una.

Las prioridades se editan en la matriz general, no dupliques diez controles
en cada ficha. No muestres profesión, rasgos, valores, relaciones, salud,
hambre o aptitudes ocultas.

## 10. Control puntual con ratón

No crees un modo permanente «manual/automático». Usa acciones contextuales:

### Movimiento directo

1. El jugador selecciona una persona con clic izquierdo.
2. Hace clic derecho sobre terreno transitable.
3. Aparece un menú pequeño junto al cursor con **«Mover aquí»** y
   **«Cancelar»**.
4. Al elegir «Mover aquí», la persona ejecuta ese desplazamiento como orden
   directa.
5. Al llegar, vuelve automáticamente a elegir trabajo.

### Trabajo directo

Con una persona seleccionada, clic derecho sobre un objetivo no completado
muestra:

- **«Hacer ahora: Despejar escombros/Reconocer punto»**.
- **«Designar para la comunidad»**, si todavía no está designado.
- **«Cancelar»**.

La acción directa tiene prioridad sobre el trabajo automático, pero respeta
habilidad, ruta y reserva. Si no es posible, la opción aparece deshabilitada
con la razón concreta.

Si una persona abandona temporalmente un trabajo automático para cumplir una
orden directa:

- El trabajo automático vuelve a `pending`.
- Su progreso se conserva.
- Su reserva se libera.
- Al concluir o cancelar la orden directa, la persona vuelve al selector
  automático.

El resto de la comunidad continúa trabajando. Clic derecho no cambia la
selección actual y el menú contextual no activa acciones del mundo al pulsar
su interfaz.

No implementes cola de órdenes, teclas modificadoras, movimiento WASD,
posesión del personaje, combate ni puntería.

## 11. Integración con selección, cámara y tiempo

- Conserva todos los controles y criterios aceptados de
  `IMPLEMENTATION-001`.
- Amplía el contrato `Selectable` para admitir `work_target` sin romper
  `person` y `building`.
- Clic izquierdo en terreno vacío sigue limpiando la selección.
- Clic derecho solo ofrece acciones si hay una persona seleccionada.
- La cámara con botón central y rueda no debe emitir órdenes ni designaciones.
- Paneles y menús deben consumir sus eventos y no hacer clic a través del HUD.
- Pausa permite seleccionar, cambiar prioridades, designar, cancelar y dar
  órdenes; movimiento y progreso solo continúan al reanudar.
- Cambiar de velocidad no duplica finalizaciones ni reservas.

## 12. Organización técnica mínima

Extiende la estructura existente con responsabilidades claras para:

- Definiciones estables de habilidades y familias de trabajo.
- Estado de trabajo de una persona.
- Trabajo y objetivo de trabajo.
- Registro/tablón de trabajos y reservas.
- Selector determinista de trabajos.
- Navegación y ejecución de la persona.
- Menú contextual.
- Paneles de prioridades, trabajos y ficha.

Puedes elegir nombres técnicos claros en inglés. No introduzcas autoloads
globales si la escena principal puede cablear las dependencias, ni ECS, base
de datos, JSON, event bus general, máquina de comportamiento extensible,
árbol de IA, sistema de mods o serialización.

Separa reglas de elección y estado de la representación visual para poder
probarlas sin renderizado. Reutiliza el reloj, selección, escenas y HUD
existentes en vez de crear versiones paralelas.

## 13. Fuera de alcance estricto

No implementes:

- Zonas habitual, precaución o prohibida; entrarán junto con el uso funcional
  del territorio en una entrega posterior.
- Hambre, sed, cansancio, descanso, salud, miedo, heridas o muerte.
- Inventarios, objetos transportables, almacenes o recursos.
- Inspección de edificios, búsqueda, acceso, interiores o botín.
- Agua, comida, pesca, setas, caza, cocina o conservación funcional.
- Construcción real, herramientas, materiales o reparación de edificios.
- Aprendizaje, enseñanza, experiencia o cambio de habilidades.
- Iniciativas personales, transgresiones, relaciones o memoria.
- Zombis, combate, guardia funcional, ruido o retirada.
- Generación procedural, guardado o carga.
- Nuevos personajes, abandonos, llegadas o fallecimientos.
- Sonido, arte externo, animaciones complejas o rediseño global del mapa.

Los escombros y puntos de reconocimiento son objetivos de prueba del sistema,
no una implementación encubierta de recursos, exploración o construcción.

## 14. Interfaz y legibilidad

Mantén el HUD en español y utilizable a `1600 × 900`:

- Añade botones **«Prioridades»** y **«Trabajos»**.
- Los paneles grandes se abren y cierran sin pausar automáticamente.
- Solo un panel grande puede ocupar el centro a la vez.
- El reloj y las velocidades siguen visibles con esos paneles abiertos.
- La ficha lateral no tapa el menú contextual ni los controles de tiempo.
- Estados y prioridades usan texto/número además de color.
- Evita fuentes diminutas, tablas que desborden sin scroll y paneles
  transparentes difíciles de leer.
- Actualiza la ayuda compacta para incluir clic derecho contextual.

No rediseñes el estilo visual completo ni añadas menús de configuración.

## 15. Aceptación de la entrega anterior y documentación

Antes de registrar esta entrega:

- Actualiza `README.md`, `docs/STATUS.md` y `RDM-001` para indicar que Dennis
  superó manualmente `IMPLEMENTATION-001` el 18 de septiembre de 2026.
- Elimina únicamente las menciones de «aceptación manual pendiente» de esa
  entrega; no cambies su alcance.

Después actualiza:

- `README.md`: estado actual, controles nuevos y prueba manual de esta
  entrega.
- `docs/STATUS.md`: funcionalidad realmente presente, validaciones ejecutadas
  y aceptación manual de `IMPLEMENTATION-002` pendiente.
- `docs/roadmap/RDM-001_first-playable-slice.md`: primera entrega aceptada;
  segunda implementada técnicamente y pendiente de prueba manual; etapas 3–5
  no iniciadas.
- `CHANGELOG.md`: funcionalidad añadida, límites y validaciones reales.
- `prompts/INDEX.md`: registrar `IMPLEMENTATION-002`.

No marques documentos completos de personaje o interfaz como `implemented`:
esta entrega implementa solo el subconjunto descrito. No cierres preguntas
abiertas sobre fórmulas definitivas, aprendizaje o personajes concretos.

Guarda este encargo sin cambios sustantivos en
`prompts/IMPLEMENTATION-002_work-and-people.md`.

## 16. Pruebas automatizadas mínimas

Dennis hará la validación funcional. Mantén un único smoke test, sin plugins
ni framework externo. Actualiza `tests/smoke_test.gd` para conservar las
comprobaciones básicas anteriores y añadir solo estas cinco:

1. Existen seis estados de persona, cada uno con diez prioridades y once
   habilidades.
2. Todas las prioridades aceptan únicamente valores `0–4`.
3. Designar un objetivo crea un solo trabajo y una reserva no puede pertenecer
   a dos personas.
4. El selector elige prioridad `4` antes que `2` y excluye a quien no cumple
   la habilidad mínima.
5. Pausa detiene movimiento/progreso lógico y ×10 no aplica una finalización
   dos veces.

Si Godot 4.7.2 está disponible, ejecuta únicamente:

```bash
godot --headless --path . --editor --quit
godot --headless --path . --script res://tests/smoke_test.gd
git diff --check
```

Si no está disponible, no lo instales: registra los dos primeros comandos de
Godot como `NOT RUN` y ejecuta `git diff --check`. No añadas pruebas de input,
píxeles, navegación visual, cada botón o todos los casos combinatorios; esas
comprobaciones corresponden a la prueba manual.

## 17. Prueba manual para Dennis

Documenta esta lista en `README.md`, sin declararla superada:

1. Ejecutar el proyecto y confirmar que cámara, selección, reloj y velocidades
   de la entrega anterior siguen funcionando.
2. Abrir «Prioridades» y comprobar seis columnas, diez familias y valor `2`
   inicial en todas las celdas.
3. Subir y bajar varias prioridades con clic izquierdo y derecho; confirmar
   número, color y tooltip.
4. Seleccionar una pila de escombros, designarla y comprobar que una persona
   elegible la reserva, camina, trabaja y la hace desaparecer.
5. Designar varios objetivos y confirmar que distintas personas trabajan y
   nunca dos reservan el mismo objetivo.
6. Poner `build_repair` a `0` para todas, designar escombros y comprobar el
   motivo «Prioridad desactivada para todas las personas»; volver a activar
   una prioridad y confirmar que el trabajo arranca.
7. Abrir «Trabajos» y comprobar persona, estado, progreso y bloqueos.
8. Seleccionar cada persona y revisar estado, acción y once habilidades.
9. Seleccionar una persona, hacer clic derecho en terreno y usar «Mover aquí»;
   confirmar que al llegar vuelve a buscar trabajo.
10. Con una persona seleccionada, hacer clic derecho en un objetivo y usar
    «Hacer ahora»; probar también una persona no elegible y leer la razón.
11. Pausar durante movimiento y durante trabajo: ambos deben detenerse, pero
    selección, prioridades y cámara deben seguir funcionando.
12. Probar ×1, ×2, ×4 y ×10 y confirmar aceleración coherente sin saltos,
    duplicaciones ni personas bloqueadas.
13. Cancelar una designación en progreso, volver a designarla y comprobar que
    conserva el progreso y libera correctamente la reserva.
14. Confirmar que las rutas no atraviesan edificios ni agua y que no aparecen
    errores rojos en el depurador.

## 18. Criterios de aceptación

- Los seis supervivientes se mueven mediante navegación y mantienen identidad
  estable.
- La matriz contiene exactamente seis personas, diez familias y cinco niveles.
- Prioridad y habilidad son conceptos distintos y visibles.
- Los ocho objetivos pueden designarse, cancelarse y completarse.
- Cada trabajo tiene estado, progreso, persona asignada, reserva y explicación.
- Ningún objetivo admite dos trabajadores simultáneos.
- La elección automática sigue el orden aprobado de forma determinista.
- Los bloqueos muestran causas operativas y se recuperan al cambiar la causa.
- Las órdenes directas se dan con ratón, respetan requisitos y terminan
  volviendo a la selección automática.
- Movimiento y trabajo obedecen pausa y velocidades sin afectar cámara/HUD.
- No se han adelantado necesidades, recursos, exploración completa, autonomía,
  amenazas ni persistencia.
- El único smoke test sigue siendo pequeño y `git diff --check` no falla.
- La documentación registra `IMPLEMENTATION-001` como aceptada y esta entrega
  como pendiente de prueba manual.

## 19. Informe final

Responde en español:

1. Qué puede hacer Dennis ahora.
2. Cómo funcionan prioridades, trabajos, reservas y órdenes directas.
3. Estructura técnica añadida, sin enumerar cada detalle irrelevante.
4. Comandos de validación y resultado real, incluidos los `NOT RUN`.
5. Pasos de prueba manual y riesgos concretos que deba observar.
6. Qué queda expresamente fuera para `IMPLEMENTATION-003`.

No continúes con exploración y subsistencia ni abras otra entrega.
