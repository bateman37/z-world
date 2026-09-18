# Z-World — IMPLEMENTATION-004: defensa y vida propia

## 1. Contexto y precondiciones

Trabaja sobre la rama principal actualizada del repositorio
`bateman37/z-world`. Antes de modificar nada, sincroniza `main`, crea una rama
de trabajo para esta entrega e inspecciona el estado real del proyecto.

`IMPLEMENTATION-003` está fusionada y técnicamente completada. El proyecto ya
dispone de mapa 3D fijo, seis supervivientes, cámara y control solo con ratón,
reloj y velocidades, prioridades provisionales, designaciones, tablón de
trabajos, movimiento, reservas, lugares explorables, recursos localizados,
almacén, necesidades, agua, alimento y conservación. Según la documentación
actual del repositorio, su aceptación manual sigue pendiente; **no la marques
como aceptada en nombre de Dennis**.

Esta entrega implementa exclusivamente la cuarta etapa de `RDM-001`:
**Defensa y vida propia**. Debe añadir zonas territoriales, cierres básicos,
amenaza zombi local, ruido, guardia, combate y retirada elementales,
aprendizaje observable en dos habilidades y dos decisiones autónomas
acotadas con causa visible.

`DESIGN-003` se fusionó entre las implementaciones 003 y 004 para documentar
el horizonte futuro. **No migres en esta entrega** las diez familias y la
escala `0–4` existentes al horizonte de nueve bloques, 34 prioridades y
escala `Nunca/1–5`; tampoco implementes recuperación experta, conocimientos
fragmentarios ni presentación cualitativa. Ese trabajo documental no cambió
el alcance del primer corte.

Guarda una copia literal de este encargo en
`prompts/IMPLEMENTATION-004_defense-and-autonomy.md` y registra el archivo en
`prompts/INDEX.md`. No reescribas el prompt después para hacerlo coincidir con
lo que finalmente hayas programado: es el contrato histórico de la entrega.

Dennis prefiere ejecutar las pruebas funcionales manuales. Conserva un único
smoke test pequeño y añade solo las comprobaciones lógicas imprescindibles de
la sección 18; no construyas una suite exhaustiva ni automatices la prueba
visual.

## 2. Lecturas obligatorias y límite de contexto

Lee, en este orden:

1. `AGENTS.md`, `CLAUDE.md`, `docs/INDEX.md`, `docs/STATUS.md` y
   `prompts/README.md`.
2. `docs/roadmap/RDM-001_first-playable-slice.md`, especialmente la cuarta
   entrega y la distinción entre el demostrador actual y `UI-003`.
3. `docs/60-threats/INDEX.md` y
   `docs/60-threats/THR-001_zombie-threat-model.md`.
4. `docs/80-interface/INDEX.md` y
   `docs/80-interface/UI-001_interaction-and-command-model.md`, sobre todo
   zonas, elegibilidad, control puntual y motivos de bloqueo.
5. `docs/30-characters/INDEX.md`,
   `docs/30-characters/CHR-001_character-model.md`,
   `docs/30-characters/CHR-002_knowledge-and-learning.md` y
   `docs/30-characters/CHR-003_autonomy-intentions-and-behavior.md`.
6. `docs/40-settlement/SET-001_settlement-growth.md` y
   `docs/40-settlement/SET-003_resources-logistics-and-condition.md`.
7. `docs/20-world/WLD-002_local-exploration-and-information.md`, solo para
   no confundir pintar una zona con explorar, asegurar o transformar un
   lugar.
8. `docs/90-architecture/ARC-001_technical-direction.md` y
   `docs/90-architecture/ARC-002_procedural-generation-and-persistence.md`,
   para respetar la separación existente y el tiempo simulado.
9. `docs/scenarios/SCN-001_mountain-village-arrival.md` y
   `docs/decisions/DEC-0004_mouse-strategic-control.md`.
10. `prompts/IMPLEMENTATION-003_exploration-and-subsistence.md` y los
    scripts, escenas y pruebas reales que vayas a extender.

No leas por defecto `VIS-003`, `RDM-002`, `UI-002`, `UI-003`, `UI-004`,
`WLD-004`, `SET-004`, `SET-005`, `SET-006`, `CHR-004` ni `CHR-005`. Son
horizontes que no se implementan aquí. Si una referencia concreta parece
contradecir este encargo, localízala primero con `rg` por identificador y
detén solo esa parte si la contradicción es real; no amplíes contexto ni
decidas en silencio.

## 3. Resultado jugable verificable

Al terminar, Dennis debe poder completar este bucle en el mapa actual:

1. Establecer el refugio y transportar materiales como en
   `IMPLEMENTATION-003`.
2. Abrir una herramienta de zonas, ver el área habitual inicial y pintar con
   el ratón terreno habitual, de precaución o prohibido.
3. Ver que una zona regula trabajos y rutas sin revelar, limpiar ni asegurar
   mágicamente el terreno.
4. Tapiar una ventana, reforzar la puerta o construir el único tramo de muro
   básico previsto, consumiendo materiales reales una sola vez.
5. Designar a una persona en un puesto de guardia permanente.
6. Ver que una construcción genera un ruido visible y registrado que atrae
   solo a los zombis locales dentro de su alcance.
7. Ver a zombis lentos acercarse, golpear una defensa o amenazar a una
   persona; recibir un aviso y entender qué está pasando.
8. Defenderse con combate cuerpo a cuerpo mediante guardia automática o una
   orden puntual con ratón, sin puntería manual ni modo de acción separado.
9. Ordenar una retirada y ver que una persona también se retira sola ante
   peligro crítico.
10. Observar una iniciativa útil no ordenada y una posible transgresión de
    zona, ambas con una causa concreta en español.
11. Hacer que una persona principiante mejore practicando pesca y remiendo, y
    ver el progreso y el cambio de resultado.

Este es un demostrador integrado, no el sistema final de fortificaciones,
combate, personalidad o aprendizaje.

## 4. Reglas de alcance que no se pueden reinterpretar

- Conserva Godot 4.7.2 Standard, GDScript, Forward+, el mapa fijo, los seis
  IDs de persona y la cámara estratégica existente.
- Conserva exactamente las diez familias actuales, las once habilidades
  actuales y sus escalas provisionales `0–4`. Esta entrega da contenido real
  a `guard_defense` y aprendizaje a dos habilidades; no cambia la taxonomía.
- `WorkBoard` sigue siendo el único selector de trabajos comunitarios. Las
  nuevas construcciones, reparaciones, el remiendo y la guardia son trabajos
  del mismo tablón, con sus reservas, fases y bloqueos.
- Combate y retirada son estados de amenaza y extensiones de la orden
  puntual de una persona, no un segundo planificador general de trabajos.
- Ninguna decisión depende de una tirada por fotograma. Movimiento, daño,
  ruido, aprendizaje y decisiones usan `gameplay_delta` o momentos causales
  discretos y quedan congelados en pausa.
- Toda interacción nueva usa ratón. No añadas WASD, primera persona,
  puntería, disparo manual ni control directo continuo de un avatar.
- Todos los textos visibles, documentación, changelog e informe final se
  escriben en español. IDs, rutas, clases y contratos técnicos pueden estar
  en inglés.
- Los valores de este prompt son provisionales para el primer corte. No los
  conviertas en fórmulas canónicas definitivas ni marques documentos de
  dominio como `implemented`.

## 5. Zonas territoriales

### 5.1 Modelo exacto

Crea un modelo de datos independiente de la representación visual, con una
rejilla cuadrada de **2 metros** dentro de `GameConstants.MAP_BOUNDS_MIN` y
`GameConstants.MAP_BOUNDS_MAX`.

Estados exactos e IDs:

| Estado | ID | Regla operativa |
|---|---|---|
| Habitual | `habitual` | Trabajo y circulación ordinarios. |
| Precaución | `caution` | Requiere una designación o intervención explícita, una política activada por el jugador o una necesidad de supervivencia sin alternativa habitual. |
| Prohibida | `forbidden` | Bloquea trabajos y tránsito autónomo ordinarios. Solo puede cruzarse para salir, huir de peligro inmediato o mediante la transgresión causal de la sección 14. |

Estado inicial determinista:

- La rejilla usa `caution` como valor por defecto.
- Las celdas cuyo centro esté en el rectángulo mundial
  `x = -14…14`, `z = -2…22` comienzan como `habitual`.
- No comienza ninguna celda como `forbidden`.
- Los edificios, fuentes y recursos no cambian de información ni de estado
  al pintar una zona.

El modelo debe ofrecer como mínimo: consultar una posición, pintar una celda,
pintar un trazo continuo sin huecos aunque el ratón se mueva rápido,
comprobar si una ruta cruza celdas prohibidas y localizar una celda habitual
cercana para salir de una zona recién prohibida.

### 5.2 Reglas sobre trabajos y rutas

- Un trabajo con destino habitual conserva las reglas actuales.
- Un trabajo comunitario designado expresamente, una orden puntual o una
  política que el jugador haya activado cuentan como aceptación del riesgo
  para un destino de precaución.
- Una iniciativa autónoma ordinaria prefiere una alternativa habitual
  equivalente. Si no existe, puede usar precaución solo si sus condiciones
  concretas lo permiten.
- Un destino o una ruta que atraviesa `forbidden` queda bloqueado con el
  texto exacto **«Zona prohibida»**. Amplía `NavigationService` para validar
  los puntos de la ruta y segmentos muestreados como máximo cada 1 metro; no
  basta con comprobar únicamente la celda del destino.
- Una orden puntual de movimiento a precaución está permitida porque es una
  intervención explícita. A una celda prohibida aparece deshabilitada con
  **«Zona prohibida»**; no añadas un botón genérico «ignorar zona».
- Si el jugador pinta como prohibida la ruta de un trabajo ordinario ya en
  curso, interrúmpelo en el siguiente momento seguro, conserva su progreso,
  libera reservas y deja el trabajo bloqueado con su razón. No consumas dos
  veces materiales.
- Una persona que ya esté dentro de una celda recién prohibida puede salir
  hacia la celda habitual accesible más cercana. La norma nunca debe
  atraparla de forma artificial.
- Zombis no obedecen zonas sociales.

### 5.3 Herramienta de interfaz

Añade un botón superior **«Zonas»**. Al abrirlo aparece una barra compacta
con:

- **«Habitual»**, **«Precaución»** y **«Prohibida»**; una queda activa y se
  distingue por texto, borde y color, no solo por color.
- **«Ocultar/mostrar zonas»**.
- **«Terminar»**, que sale del modo de pintura.

En modo de zonas, clic izquierdo y arrastre pintan; el botón central sigue
moviendo la cámara y la rueda sigue controlando el zoom. El clic de pintura
no selecciona entidades ni abre acciones. Fuera de este modo, selección y
menús contextuales funcionan como antes.

La superposición aparece unos centímetros sobre el terreno, sin bloquear
raycasts ni navegación: verde translúcido para habitual, ámbar para
precaución y rojo para prohibida. Evita cientos de nodos independientes si
un `MultiMesh` u otra representación agrupada resuelve el mismo resultado.
La superposición se muestra al entrar en el modo y puede ocultarse sin
cambiar datos.

## 6. Puntos de defensa y cierre del refugio

### 6.1 Cuatro puntos fijos

No implementes construcción libre ni un editor de muros. Añade cuatro
objetivos seleccionables y visuales alrededor del refugio actual:

| ID | Nombre | Posición mundial | Acción inicial | Coste almacenado | Duración ×1 | Habilidad mínima | Durabilidad máxima | Sector |
|---|---|---:|---|---|---:|---|---:|---|
| `defense.shelter.south_door` | Puerta sur del refugio | `(0, 0, 4.2)` | `reinforce_door` — Reforzar puerta | 2 `wood_planks` + 1 `repair_materials` | 10 s | `construction_carpentry >= 2` | 80 | sur |
| `defense.shelter.east_window` | Ventana este del refugio | `(4.2, 0, 8)` | `barricade_window` — Tapiar ventana | 2 `wood_planks` | 8 s | `construction_carpentry >= 1` | 60 | este |
| `defense.shelter.west_window` | Ventana oeste del refugio | `(-4.2, 0, 8)` | `barricade_window` — Tapiar ventana | 2 `wood_planks` | 8 s | `construction_carpentry >= 1` | 60 | oeste |
| `defense.perimeter.north_gap` | Hueco norte del perímetro | `(0, 0, 12.2)` | `build_basic_wall` — Construir muro básico | 3 `wood_planks` + 1 `repair_materials` | 12 s | `construction_carpentry >= 2` | 100 | norte |

Son puntos concretos del primer escenario, no un catálogo final. Ajusta solo
unos decímetros una posición si la malla real la hace inalcanzable; conserva
el ID, el sector y la relación visual con el refugio, y documenta el ajuste
en el informe final.

### 6.2 Estados, recursos y reparación

Estados exactos del punto:

- `open`: sin cierre construido.
- `intact`: durabilidad máxima.
- `damaged`: entre 1 y el máximo menos 1.
- `destroyed`: durabilidad 0 después de haber sido construido.

Reglas:

- Las acciones de construcción solo se habilitan después de registrar el
  refugio y establecer el almacén. Antes muestran **«Primero hay que
  registrar el refugio y establecer el almacén»**.
- Solo cuentan materiales almacenados y alcanzables. Se reservan con el
  mecanismo existente al asignar el trabajo, se liberan al cancelar y se
  consumen exactamente una vez al completarlo.
- Un punto `damaged` ofrece `repair_defense` — **«Reparar defensa»**:
  `build_repair`, `construction_carpentry >= 1`, 4 segundos, coste de
  1 `repair_materials` y recuperación de 30 puntos sin superar el máximo.
- Un punto `destroyed` no se repara por 1 material: vuelve a ofrecer su
  acción inicial y su coste completo.
- Completar la construcción fija la durabilidad máxima. Designar, cancelar o
  repetir no puede duplicar el cierre ni consumir otra vez el coste.
- El panel del punto muestra estado, durabilidad actual/máxima, sector,
  trabajo activo y bloqueo. Visualmente debe distinguir abierto, construido,
  dañado y destruido mediante geometría sencilla de tablas o barrera y color;
  no hacen falta modelos artísticos.
- Un zombi que entra hacia el centro del asentamiento por un sector con una
  defensa construida y no destruida se detiene y la ataca. Usa un radio de
  defensa del asentamiento de **8 metros** alrededor de
  `GameConstants.SHELTER_FOCUS_POSITION` y el ángulo de aproximación para
  elegir norte, este, sur u oeste. Si el punto de ese sector está abierto o
  destruido, no bloquea el paso.
- Estas defensas bloquean la aproximación simulada de los zombis al refugio;
  no pretenden ser todavía obstáculos dinámicos universales para toda ruta
  de navegación.

## 7. Amenaza zombi local

### 7.1 Población fija de demostración

Añade cinco zombis lentos ya presentes en el mapa. No aparecen por un evento
aleatorio ni se regeneran:

| ID | Posición inicial |
|---|---:|
| `zombie.local.01` | `(4, 0, -14)` |
| `zombie.local.02` | `(11, 0, -16)` |
| `zombie.local.03` | `(21, 0, 0)` |
| `zombie.local.04` | `(22, 0, 14)` |
| `zombie.local.05` | `(18, 0, -20)` |

Si una posición cae fuera de la malla de navegación real, muévela al punto
navegable más cercano manteniendo el grupo y registra el ajuste. No cambies
la cantidad.

Representación mínima: silueta humanoide verdosa/gris, aro de selección y
un elemento visual que permita distinguirla de una persona a la escala
normal de cámara. Son seleccionables cuando están visibles.

Estados lógicos exactos:

- `idle`: quieto en su presencia local, sin estímulo.
- `investigating_noise`: se dirige al origen de un ruido oído.
- `pursuing`: persigue a una persona detectada.
- `attacking_defense`: golpea un cierre.
- `attacking_person`: golpea a una persona.
- `dead`: neutralizado; ya no se mueve, detecta ni ataca.

No añadas patrulla aleatoria. Un zombi `idle` solo cambia por ruido o por una
persona viva a la vista. Eso hace que la prueba sea reproducible.

### 7.2 Valores provisionales

| Parámetro | Valor |
|---|---:|
| Velocidad | 0,75 m/s de tiempo de juego |
| Salud | 30 |
| Detección visual | 8 m por distancia; no hace falta oclusión avanzada en este corte |
| Alcance de ataque | 1,4 m |
| Intervalo de ataque | 2 s de tiempo de juego |
| Daño a persona por golpe | 15 |
| Daño a defensa por golpe | 10 |
| Memoria al llegar a un ruido sin encontrar objetivo | 15 s de tiempo de juego |

El zombi investiga la posición exacta del último ruido que haya oído. Si oye
otro, elige el estímulo con mayor margen `radio - distancia`; en empate gana
el más reciente. Al detectar varias personas vivas, persigue la más cercana
y desempata por ID estable. Conserva durante 10 segundos la última posición
conocida si la persona sale del radio; al agotarse ese tiempo llega hasta esa
posición y vuelve a `idle` si no encuentra otro estímulo. Una persona que
está fuera del radio defensivo puede ser perseguida directamente. Si el
zombi intenta entrar en ese radio hacia una persona o el centro, una defensa
válida de su sector se interpone y tiene prioridad hasta destruirse; no puede
atravesarla por haber visto a alguien detrás. Al morir, queda como cuerpo
visual oscuro durante el resto de la sesión; no reaparece ni bloquea la
navegación.

## 8. Ruido causal y visible

Crea un servicio pequeño de ruido, no un mapa acústico definitivo. Cada
emisión registra: ID, causa visible, posición, radio en metros y momento de
simulación. La atracción se evalúa **una vez al emitirse**, no cada
fotograma. Muestra durante 1,5 segundos de tiempo de juego un aro
translúcido aproximado y añade el hecho al registro de sucesos.

Ruidos exactos del primer corte:

| Causa | Radio |
|---|---:|
| `inspect_place` | 4 m |
| `register_place` | 8 m |
| `prepare_rest_area` | 12 m |
| `build_conduction` | 22 m |
| `reinforce_door` | 22 m |
| `barricade_window` | 22 m |
| `build_basic_wall` | 22 m |
| `repair_defense` | 12 m |
| Cada impacto cuerpo a cuerpo de una persona | 6 m |
| Cada impacto zombi contra una defensa | 8 m |

Las demás acciones actuales, incluido pescar y remendar, tienen radio 0. El
ruido de un trabajo se emite una sola vez al comenzar su fase `act`, no al
designar, por fotograma ni al terminar. Añade estos datos al catálogo de
acciones o a una tabla única equivalente; no repartas números mágicos por
varios scripts.

Los impactos sucesivos sí emiten sus pulsos mecánicos para que otros zombis
puedan oírlos, pero el registro agrupa causas iguales en la misma zona durante
5 segundos y no añade una línea por golpe. El agrupado afecta solo a la
presentación, nunca a quién oye el ruido.

No añadas armas de fuego, munición ni audio grabado en esta semilla. La regla
documental de armas de fuego se conserva para el futuro; este corte demuestra
ruido mediante construcción e impactos.

## 9. Estado físico, contacto y muerte

Añade a cada `PersonWorkState` un objeto de condición separado de necesidades
y de la escena visual:

- `health`: `0–100`, empieza en 100.
- `alive`: verdadero mientras `health > 0`.
- Etiquetas visibles: **Sana** (`61–100`), **Herida** (`26–60`),
  **Crítica** (`1–25`) y **Fallecida** (`0`).

No implementes infección, mordeduras diferenciadas, hemorragias,
enfermedades ni curación. El daño de contacto representa una herida básica
provisional.

Reglas al morir:

- Interrumpe movimiento, combate y trabajo; libera reservas mediante las
  mismas rutas existentes.
- Deja en su posición cualquier pila que llevara, sin duplicarla ni
  consumirla.
- Se excluye de nuevas asignaciones, guardias e iniciativas, pero su fila y
  su ficha permanecen deshabilitadas para que la consecuencia sea visible.
- El cuerpo queda visualmente apagado en el mapa durante la sesión.
- No sustituye automáticamente a la persona ni genera un nuevo superviviente.

El proyecto debe soportar funcionalmente una muerte, pero la prueba manual
no obliga a matar a nadie.

## 10. Guardia, combate y retirada

### 10.1 Puestos de guardia

Añade dos objetivos seleccionables:

| ID | Nombre | Posición |
|---|---|---:|
| `guard.post.south` | Puesto de guardia sur | `(0, 0, 0)` |
| `guard.post.east` | Puesto de guardia este | `(8, 0, 8)` |

Ajusta una posición solo si no es navegable, conservando ID y orientación.

`guard_access` — **«Vigilar acceso»** pertenece a `guard_defense`, no exige
una de las once habilidades y es un trabajo continuo y exclusivo. Tras la
fase de desplazamiento, la persona permanece **En guardia** hasta cancelar,
ser relevada por una necesidad crítica, retirarse o morir. Al interrumpirse
por una necesidad, el puesto sigue designado y puede ocuparlo otra persona.

Una guardia:

- Detecta zombis a 14 m alrededor del puesto y genera la primera alerta solo
  una vez por contacto.
- Enfrenta automáticamente a un zombi detectado que entre a 8 m del puesto.
- No lo persigue normalmente a más de 10 m del puesto y regresa después del
  contacto.
- Usa las zonas como cualquier otra persona salvo la transgresión concreta
  de la sección 14.2.

Debe poder designarse para la comunidad o asignarse a una persona concreta
con **«Hacer ahora: vigilar acceso»**. No implementes turnos, horarios,
patrullas ni relevos configurables.

### 10.2 Combate cuerpo a cuerpo

Para este demostrador, toda persona viva dispone de un arma improvisada
abstracta; no crees inventario o equipamiento de armas todavía.

| Parámetro | Valor |
|---|---:|
| Alcance | 1,5 m |
| Intervalo de golpe | 1,2 s de tiempo de juego |
| Daño al zombi | 10 |
| Ruido por impacto | 6 m |

Con una persona seleccionada, clic derecho sobre un zombi vivo ofrece
**«Atacar cuerpo a cuerpo»**. Es una orden puntual: la persona se aproxima,
golpea por intervalos y termina si el zombi muere, se cancela, la persona se
retira, queda crítica o pierde una ruta válida. No existe puntería manual.

Las personas que no están de guardia no buscan combate. Si un zombi entra a
4 m, interrumpen un trabajo ordinario e intentan retirarse; solo golpean para
defenderse si el contacto les impide alejarse.

Los intervalos de ataque usan acumuladores de tiempo de simulación. A ×10
deben producir el mismo número de golpes por segundo simulado que a ×1, no
uno por fotograma ni un único golpe gigante.

### 10.3 Retirada

Define `RALLY_POINT = Vector3(0, 0, 3)` como punto exterior de reunión junto
al refugio. Si la posición exacta no es navegable, usa el punto navegable más
cercano hacia el sur y documenta el valor final.

Una persona viva seleccionada muestra **«Retirarse al refugio»**. La orden:

1. Cancela su ataque u orden puntual.
2. Interrumpe el trabajo actual conservando progreso y liberando reservas.
3. La mueve al punto de reunión con estado **Retirándose**.
4. Al llegar, vuelve a la asignación automática si ya no existe peligro
   inmediato.

La retirada automática se activa si la salud llega a 25 o menos, o si hay al
menos dos zombis vivos a 3,5 m. Tiene la prioridad de supervivencia de
`UI-001` y puede interrumpir incluso una orden directa. Si la persona ya está
en zona prohibida, puede salir. Si la única ruta física de huida cruza una
norma prohibida, registra **«ha cruzado el límite para huir de un peligro
inmediato»**; una barrera física real sigue sin poder atravesarse.

El punto de reunión no da invulnerabilidad y no simula un interior. Defender
los accesos sigue siendo necesario.

## 11. Información de amenaza y sucesos

Añade junto a la franja superior un indicador textual:

- **«Amenaza: tranquila»**: no hay contacto conocido.
- **«Amenaza: alerta»**: una persona o guardia ha detectado un zombi vivo.
- **«Amenaza: contacto»**: un zombi está atacando a una persona o defensa.

No reveles como «alerta» a un zombi lejano que nadie ha detectado. Un ruido
propio sí es un hecho conocido y aparece en sucesos, aunque el jugador no sepa
si algo lo oyó. `contacto` prevalece sobre `alerta`. Cuando ya no exista un
zombi vivo detectado, persiguiendo a alguien o atacando, conserva `alerta`
durante 10 segundos de simulación y después vuelve a `tranquila`; un nuevo
contacto reinicia ese margen.

Añade un botón **«Sucesos»** con un panel de los doce hechos más recientes;
el modelo conserva como máximo 50 durante la sesión. Cada línea lleva día y
hora del reloj y una frase en español. Registra solo cambios relevantes:

- ruido y causa;
- primera detección de cada contacto;
- comienzo de ataque a defensa o persona;
- defensa dañada al 50 % o destruida;
- herida crítica o muerte;
- iniciativa y transgresión autónomas;
- subida de habilidad.

No registres cada paso, cada fotograma ni cada golpe ordinario. Evita un
`event bus` universal: un modelo pequeño de sucesos y señales concretas son
suficientes.

La ficha de persona añade salud, estado de combate/retirada, progreso de las
dos habilidades aprendibles y **«Decisión reciente»** cuando exista. No
muestres números internos de personalidad ni las condiciones booleanas de la
autonomía.

La ficha del zombi muestra salud y estado. Si está investigando, puede decir
**«Investiga un ruido»**, pero no revela datos ocultos adicionales.

## 12. Aprendizaje observable y limitado

No implementes el sistema completo de conocimiento de `DESIGN-003`.
Mantén la escala provisional de habilidad `0–4` y añade un contador de
práctica únicamente a `fishing` y `mending_sewing`.

Umbrales exactos de resultados útiles completados:

| Nivel actual | Resultados necesarios para el siguiente |
|---|---:|
| 0 | No aprende con estas acciones; necesita una futura vía de enseñanza. |
| 1 | 2 |
| 2 | 4 |
| 3 | 6 |
| 4 | Máximo provisional |

Al subir un nivel, el contador de ese nivel vuelve a 0. Solo se concede un
punto si la acción produjo realmente su resultado y consumió o extrajo lo
correspondiente. Cancelar, quedar bloqueado, repetir sobre una fuente agotada
o carecer de materiales no enseña. No añadas aptitudes ocultas, profesores,
libros, transferencia entre habilidades ni pérdida de conocimiento.

### 12.1 Pesca

Cambia el mínimo de `fish_pond` de `fishing >= 2` a `fishing >= 1` para que
un principiante pueda intentarlo. Conserva una unidad de alimento fresco por
resultado y la disponibilidad total de 12; solo varía el tiempo de la fase
`act`:

| Nivel al empezar el intento | Duración ×1 |
|---|---:|
| 1 | 14 s |
| 2 | 10 s |
| 3 | 8 s |
| 4 | 6 s |

La duración se fija al asignar el intento y no cambia a mitad de la acción.
Al terminar con éxito, concede un punto de práctica de pesca.

### 12.2 Remiendo

Añade un undécimo tipo de recurso a la implementación actual:

- ID `damaged_clothing`.
- Nombre **«Prendas dañadas»**.
- No perecedero, almacén general, no comestible.

La primera inspección del refugio materializa, además de su contenido actual,
**4 prendas dañadas**. Respeta la materialización única de
`IMPLEMENTATION-003`.

El refugio ofrece `mend_clothing` — **«Remendar una prenda»** después de
estar inspeccionado y de existir almacén. Pertenece a
`prepare_preserve_mend`, exige `mending_sewing >= 1`, reserva y consume una
unidad almacenada de `damaged_clothing` y produce exactamente una unidad de
`cloth` almacenada. La suma de unidades se conserva.

| Nivel al empezar | Duración ×1 | Condición de la unidad `cloth` producida | Resultado visible |
|---|---:|---:|---|
| 1 | 14 s | 40 | Parche frágil |
| 2 | 11 s | 65 | Remiendo funcional |
| 3 | 8 s | 85 | Remiendo resistente |
| 4 | 6 s | 100 | Prenda bien restaurada |

Concede un punto de práctica de remiendo solo tras la transformación
correcta. El resultado del trabajo y el suceso indican texto y condición. El
panel de recursos debe permitir ver el rango de condición de `cloth`
almacenada cuando no todas las pilas tengan la misma; no hace falta una
pantalla de inventario nueva.

## 13. Iniciativa autónoma útil

Implementa una sola iniciativa positiva general y causal: **reparar una
defensa dañada**.

Se evalúa únicamente al recibir un evento nuevo de daño que deje una defensa
con vida al 50 % o menos, no en cada fotograma. Se crea como trabajo normal
del mismo `WorkBoard`, con origen `initiative`, si se cumplen todas estas
condiciones:

1. No existe ya un trabajo de reparación para ese punto.
2. Hay 1 `repair_materials` almacenado y reservable.
3. La defensa y la ruta no están en zona prohibida.
4. Existe una persona viva, libre, sin necesidad crítica, con
   `construction_carpentry >= 2` y prioridad `build_repair > 0`.
5. No hay un zombi a 4 m de esa persona.

Elige mayor habilidad de construcción, luego menor longitud de ruta y, en
empate, ID estable. Registra y muestra en su ficha:

**«Ha decidido reparar la defensa dañada antes de que ceda.»**

Si Dennis cancela esa iniciativa, no la recrees por el mismo evento de daño;
solo un daño posterior puede volver a evaluarla. La iniciativa puede quedar
bloqueada o fracasar por cambios reales del mundo y debe explicar la causa.

## 14. Transgresión autónoma acotada

### 14.1 Perfil mínimo del escenario

No construyas un sistema completo de rasgos. Añade un conjunto mínimo de
tendencias de demostración, separado de las habilidades y no visible como
números:

- `person.initial.02` posee la etiqueta interna
  `pursue_immediate_threat`.
- Las otras cinco personas no la poseen.

La etiqueta no significa «valiente» en todas las situaciones, no modifica
habilidades y no autoriza otras transgresiones.

### 14.2 Única transgresión permitida

`person.initial.02` puede cruzar temporalmente una zona prohibida desde un
puesto de guardia para interceptar un zombi que amenaza ese acceso, solo si:

1. Está viva y asignada activamente a `guard_access`.
2. El zombi ha sido detectado, está a 6 m o menos del puesto y su celda es
   `forbidden`.
3. No hay otro zombi vivo a 6 m del objetivo.
4. La guardia tiene salud mayor de 60 y ninguna necesidad crítica.
5. La ruta física existe y la persecución no entra más de 4 m en terreno
   prohibido.
6. No se ha registrado ya esta decisión durante el contacto actual.

Al activarse, registra y muestra:

**«Ha cruzado el límite para interceptar un zombi que amenazaba el acceso.»**

Tras neutralizarlo, perderlo, alcanzar el límite de 4 m o quedar herida, la
persona regresa al puesto o se retira. Las demás guardias obedecen la zona.
Esta excepción ignora una norma social, nunca una pared, agua, edificio u
otra barrera física.

No añadas probabilidad genérica de locura ni más iniciativas. Las dos
conductas de las secciones 13 y 14 bastan para esta entrega.

## 15. Integración técnica obligatoria

### 15.1 Separación de responsabilidades

`src/work/work_board.gd` ya es grande. No vuelques dentro de él todas las
reglas nuevas. Mantén el tablón como coordinador y crea módulos pequeños con
responsabilidad clara. La organización esperada es:

- `src/territory/zone_definitions.gd`, `zone_grid.gd` y
  `zone_overlay.gd` para datos, reglas y representación de zonas.
- `src/defense/defense_point.gd` y `defense_service.gd` para cierres,
  durabilidad y sectores.
- `src/threat/noise_service.gd`, `zombie_state.gd`, `zombie_agent.gd` y
  `threat_service.gd` para estímulos y amenaza.
- `src/person/person_condition.gd` y `learning_progress.gd` para salud y
  práctica.
- `src/autonomy/autonomy_service.gd` para las dos evaluaciones causales, sin
  convertirse en un planificador alternativo.
- `src/events/game_event_log.gd` para el historial acotado.
- Escenas reutilizables bajo `scenes/defense/`, `scenes/threat/` y, si hace
  falta, `scenes/territory/`.

Puedes ajustar nombres menores si una convención real del repositorio lo
exige, pero conserva la separación. Explica cualquier diferencia en el
informe.

### 15.2 Extensión de sistemas existentes

- Amplía `WorkActions` con las acciones de defensa, guardia y remiendo; no
  crees otro catálogo.
- Amplía `WorkOrder` solo con metadatos que realmente necesite, como origen
  de iniciativa, riesgo aceptado o continuidad. No conviertas cada amenaza
  en un trabajo comunitario.
- Amplía `WorkExecution` para reservar y aplicar costes de defensa y
  remiendo usando `ResourceRegistry` y `StorageStore` actuales.
- `WorkBoard` debe ofrecer puntos de integración pequeños: interrupción
  segura, creación de iniciativa, guardia continua, baja de una persona y
  señales de comienzo de fase. Recursos, reservas y progreso siguen pasando
  por sus rutas existentes.
- Extiende `PersonWorkState.direct_order` con combate y retirada en vez de
  introducir un segundo sistema general de órdenes.
- `Main.gd` cablea servicios y señales como hasta ahora; no añadas autoloads,
  singletons globales ni un bus de eventos universal.
- Conserva IDs estables y evita referencias por nombre visual de nodo cuando
  exista un ID de dominio.

### 15.3 Tiempo, pausa y determinismo

- Todos los sistemas reciben el mismo `gameplay_delta` que ya emite el reloj.
- Con pausa, zombis, ruido, daño, guardia, trabajos, necesidades y aprendizaje
  quedan inmóviles.
- Cambiar ×1/×2/×4/×10 no cambia resultados lógicos para el mismo tiempo
  simulado.
- No uses `Engine.time_scale`, temporizadores de tiempo real ni `randf()` por
  fotograma.
- Mantén desempates estables por ID cuando este prompt no indique otro orden.

## 16. Interfaz y motivos operativos

Además de lo descrito en cada sección:

- Conserva los paneles existentes y añade `Zonas` y `Sucesos` sin tapar el
  reloj ni la selección a 1280×720. Usa scroll donde haga falta.
- Actualiza la ayuda inferior para incluir pintura de zonas, ataque
  contextual y retirada, sin convertirla en un párrafo ilegible.
- Actualiza el aviso de prototipo: ya incluye defensa y vida propia, pero no
  guardado.
- El panel `Trabajos` distingue guardias continuas e iniciativas; una línea
  de iniciativa lleva una marca textual, por ejemplo **«Iniciativa»**.
- Opciones imposibles permanecen visibles deshabilitadas cuando ayudan a
  comprender el sistema y muestran una causa concreta: zona prohibida,
  refugio sin registrar, materiales insuficientes, habilidad insuficiente,
  defensa intacta, objetivo muerto o ruta física inexistente.
- No uses «la IA no puede», «error» o explicaciones de personalidad para
  ocultar un bloqueo técnico.
- Seleccionar un cuerpo o una persona fallecida informa su estado y no ofrece
  acciones inválidas.

## 17. Fuera de alcance estricto

No implementes en esta entrega:

- Las 34 prioridades, nueve bloques, escala `Nunca/1–5`, prioridades en gris
  por conocimiento, recuperación experta o capacidad cualitativa de
  `DESIGN-003`.
- Generación procedural, semillas, guardado, carga o migración de partidas;
  corresponden a `IMPLEMENTATION-005`.
- Mapa estratégico, hexágonos, expediciones regionales o comunidades
  externas.
- Construcción libre, colocación arbitraria de muros, interiores 3D,
  puertas transitables completas o simulación física estructural.
- Armas de fuego, munición, equipamiento, armaduras, sigilo, caza, animales,
  vehículos, electricidad, cultivos o trampas.
- Infección, mordeduras diferenciadas, medicina, curación, cadáveres
  sanitarios, zombis especiales, hordas, asedios o director de dificultad.
- Relaciones, recuerdos persistentes, nombres e historias definitivas,
  llegadas, abandonos, disputas o política.
- Profesores, mentoría, libros, aptitudes de aprendizaje, techos personales,
  conocimiento comunitario, olvido o transferencia entre habilidades.
- Sonido de audio, animaciones complejas, arte final, balance final o
  rendimiento para miles de agentes.
- PostgreSQL, SQLite, JSON de contenido, Docker, servicios online, C#,
  autoloads, ECS o un framework genérico de IA.

Si detectas una mejora atractiva fuera de esta lista, descríbela como trabajo
futuro; no la incorpores oportunistamente.

## 18. Pruebas automatizadas mínimas

Conserva `tests/smoke_test.gd` como único archivo de prueba. Mantén las
comprobaciones anteriores que sigan siendo válidas y añade solo estas cuatro
pruebas lógicas, sin simular toda una partida ni probar cada botón:

1. **Zonas**: preset inicial correcto; pintar cambia una celda; una ruta
   muestreada que cruza `forbidden` se rechaza y una persona situada dentro
   puede encontrar salida habitual.
2. **Defensa**: reservar y completar una construcción consume exactamente su
   coste una vez; daño y reparación respetan `0…máximo`; repetir no duplica
   ni vuelve a consumir.
3. **Ruido**: una emisión selecciona un zombi dentro del radio y no uno fuera;
   repetir avance de fotogramas sin una nueva emisión no vuelve a disparar el
   estímulo.
4. **Aprendizaje**: dos resultados útiles hacen subir de 1 a 2, una acción
   cancelada o sin resultado no concede práctica, y el remiendo transforma
   una prenda dañada en una unidad de tela con la condición correcta sin
   cambiar el total de unidades.

No automatices combate visual, pintura con arrastre, comportamiento del HUD,
la iniciativa ni la transgresión: Dennis los probará manualmente.

Ejecuta, si Godot 4.7.2 está disponible:

```bash
godot --headless --path . --editor --quit
godot --headless --path . --script res://tests/smoke_test.gd
git diff --check
```

Si el ejecutable se llama `godot4`, usa ese nombre. Si Godot no está
disponible, no lo instales: registra ambos comandos como `NOT RUN` y su causa,
pero ejecuta `git diff --check`. No afirmes que una prueba pasó si no la
ejecutaste.

## 19. Prueba manual de aceptación para Dennis

Incluye en `README.md` esta prueba, adaptando únicamente nombres de botones
si su texto final conserva exactamente el significado. El agente no la marca
como superada.

### Preparación y regresión

1. Abrir el proyecto con Godot 4.7.2 Standard, pulsar F5 y confirmar que no
   aparecen errores rojos; cámara, selección, reloj, pausa, velocidades,
   prioridades, trabajos y recursos siguen funcionando.
2. Observar, inspeccionar y registrar el refugio; transportar sus materiales
   y las pertenencias. Confirmar que el almacén y el depósito se establecen
   como antes y que aparecen cuatro prendas dañadas una sola vez.
3. Inspeccionar el taller y transportar sus tablones y materiales de
   reparación para disponer de más de una alternativa de defensa.

### Zonas

4. Abrir `Zonas`: comprobar el rectángulo habitual verde alrededor del
   asentamiento y la precaución ámbar exterior; pintar con arrastre celdas de
   los tres tipos y ocultar/mostrar la capa.
5. Pintar una franja prohibida entre una persona y un objetivo exterior.
   Confirmar que una designación o movimiento que la cruce queda bloqueado
   con «Zona prohibida»; devolver una celda a precaución y comprobar que se
   recupera sin reiniciar.

### Defensa, ruido y amenaza

6. Seleccionar una ventana y tapiarla. Ver la reserva y consumo exactos de 2
   tablones, su durabilidad 60/60, el aro de ruido de 22 m y el suceso con la
   causa. Cancelar otra construcción a mitad y confirmar que conserva
   progreso y devuelve reservas.
7. Construir el muro norte o reforzar la puerta sur; confirmar que usa su
   coste distinto y que no puede completarse dos veces.
8. Asignar directamente `person.initial.02` al puesto de guardia sur y
   comprobar que permanece «En guardia». Antes de atraer zombis, pintar dos
   o tres celdas inmediatamente al sur del puesto como prohibidas.
9. Generar ruido construyendo o reparando cerca del refugio, pausar y
   localizar qué zombis quedaron dentro del aro. Reanudar a ×1: solo esos
   deben investigar; los lejanos permanecen quietos.
10. Ver al guardia detectar el contacto, cambiar el indicador de amenaza y
    combatir sin control individual continuo. Cuando el zombi esté al otro
    lado de la franja prohibida y se cumplan las condiciones, comprobar el
    mensaje «Ha cruzado el límite para interceptar un zombi que amenazaba el
    acceso» y su regreso o retirada posterior.
11. Dejar que otro zombi alcance un sector cerrado: debe detenerse, golpear
    la defensa y reducir su durabilidad; un sector abierto no debe bloquearlo.
    Confirmar estados visuales dañado/destruido y ruido de los impactos.
12. Mantener libre a una persona con construcción `>= 2`, prioridad de
    construcción mayor que 0 y un material de reparación almacenado. Al
    quedar una defensa viva al 50 % o menos, comprobar que crea una reparación
    de iniciativa y muestra «Ha decidido reparar la defensa dañada antes de
    que ceda». Cancelarla y confirmar que no reaparece hasta un daño nuevo.

### Control puntual, daño y retirada

13. Seleccionar una persona y usar clic derecho sobre un zombi para
    «Atacar cuerpo a cuerpo». Ver aproximación y golpes por intervalos, sin
    WASD ni puntería; cancelar o neutralizar el objetivo y confirmar que la
    persona vuelve a la gestión automática.
14. Con una persona amenazada, pulsar «Retirarse al refugio» y comprobar que
    abandona su trabajo sin duplicar recursos, va al punto de reunión y
    conserva salud y consecuencias. Observar también una retirada automática
    por salud crítica o dos zombis cercanos si surge durante la prueba.
15. Confirmar que la ficha refleja salud y que un zombi muerto no vuelve a
    actuar. No es necesario provocar la muerte de una persona; si ocurre,
    comprobar que libera trabajo, deja su carga y queda excluida sin
    desaparecer de la historia de la sesión.

### Aprendizaje

16. Inspeccionar el estanque y asignar dos pescas útiles a una persona con
    pesca nivel 1. Ver `0/2 → 1/2 → nivel 2, 0/4`, una unidad de alimento por
    resultado y el cambio de duración en el siguiente intento.
17. Almacenar las prendas dañadas y hacer que una persona con remiendo nivel
    1 remiende dos. Comprobar dos transformaciones uno a uno, condición 40 en
    esos resultados, subida a nivel 2 y que el siguiente remiendo produce
    condición 65 y tarda menos.

### Integridad temporal

18. Durante amenaza, guardia y trabajo, alternar pausa, ×1, ×2, ×4 y ×10.
    Confirmar que en pausa nada avanza, que no hay ataques por fotograma,
    que recursos y práctica no se duplican y que el depurador sigue sin
    errores rojos.

## 20. Documentación que debe actualizarse

Actualiza en la misma entrega:

- `README.md`: estado actual, controles, bucle nuevo, límites y prueba manual
  completa de la sección 19.
- `docs/STATUS.md`: `IMPLEMENTATION-004` técnicamente completada y aceptación
  manual pendiente, con resumen real y validaciones ejecutadas o `NOT RUN`.
- `docs/roadmap/RDM-001_first-playable-slice.md`: estado factual de la cuarta
  entrega y siguiente candidata `IMPLEMENTATION-005`, sin ampliar su alcance.
- `CHANGELOG.md`: entrada en español de la entrega.
- `prompts/INDEX.md`: fila del prompt.
- Este archivo, guardado literalmente en `prompts/`.

No marques `THR-001`, `CHR-002`, `CHR-003`, `UI-001`, `SET-003` ni otro
documento de dominio como `implemented`: solo existe el subconjunto de este
prompt. No declares aceptada manualmente `IMPLEMENTATION-003` ni
`IMPLEMENTATION-004` salvo confirmación explícita posterior de Dennis. La
posibilidad general de llegadas y abandonos citada por `RDM-001` tampoco queda
implementada aquí: no presentes el primer corte completo antes de resolverla
en una entrega posterior.

## 21. Criterios de aceptación de la entrega técnica

La implementación está lista para PR cuando:

1. El bucle de la sección 3 funciona de extremo a extremo en la escena real.
2. Zonas, defensa, guardia, amenaza, retirada, aprendizaje y autonomía están
   conectados al tiempo y sistemas existentes, no son botones de demostración
   aislados.
3. Costes, reservas, daño, práctica y resultados se aplican exactamente una
   vez y soportan cancelación, pausa y cambio de velocidad.
4. La iniciativa y la transgresión solo aparecen por sus causas documentadas
   y muestran una razón comprensible.
5. No se ha migrado al horizonte de 34 prioridades ni se ha incorporado
   contenido fuera de alcance.
6. Los bloqueos nuevos se explican en español y no se ocultan fallos de ruta
   o código como conducta humana.
7. El smoke test y `git diff --check` tienen resultado real documentado, y la
   prueba manual queda pendiente de Dennis.
8. El proyecto importa y arranca sin errores de parseo cuando Godot está
   disponible en el entorno.

## 22. Forma de trabajar y formato del informe final

Antes de programar, responde con un plan breve basado en los archivos reales
que has inspeccionado. Después implementa sin pedir decisiones funcionales
que este prompt ya cierra. Si encuentras una contradicción canónica real,
detén esa parte y señala archivo, sección e impacto; no inventes una tercera
regla.

El informe final se entrega en español e incluye, en este orden:

1. Resultado jugable conseguido.
2. Zonas y reglas de ruta implementadas.
3. Defensas, amenaza, ruido, guardia, combate y retirada implementados.
4. Aprendizaje e iniciativas autónomas implementados, con sus disparadores.
5. Cómo se integró con `WorkBoard` sin crear sistemas generales duplicados.
6. Archivos principales creados o modificados.
7. Validaciones ejecutadas y resultado literal; `NOT RUN` cuando corresponda.
8. Prueba manual exacta que debe ejecutar Dennis y riesgos concretos a
   observar.
9. Elementos deliberadamente fuera de alcance y siguiente entrega prevista:
   `IMPLEMENTATION-005`, persistencia y prueba integrada.

No presentes la PR como manualmente aceptada. No hagas merge por Dennis.
