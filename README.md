# Z-World

Videojuego de estrategia, supervivencia y construcción de un asentamiento
tras un apocalipsis zombi, con narrativa procedural emergente: cada partida
genera su propia historia a partir de sistemas conectados, no de una
secuencia fija de misiones.

## Estado actual

Cuarta entrega de código ejecutable: **defensa y vida propia**
(`IMPLEMENTATION-004`). Sobre el bucle de exploración y subsistencia
anterior, el asentamiento ahora puede protegerse y las personas tienen
salud y decisiones propias: se pintan zonas de territorio (habitual,
precaución, prohibida), se cierran cuatro accesos del refugio, aparecen
cinco zombis lentos que reaccionan al ruido y a la vista, dos puestos de
guardia enganchan a las amenazas automáticamente, una persona puede atacar
cuerpo a cuerpo o retirarse al refugio, y la pesca y el remiendo mejoran
con la práctica. Sigue **sin** generación procedural, semillas ni guardado.
Ver el estado detallado en [docs/STATUS.md](docs/STATUS.md) y el alcance
exacto en
[docs/roadmap/RDM-001_first-playable-slice.md](docs/roadmap/RDM-001_first-playable-slice.md).

`IMPLEMENTATION-001` fue **aceptada manualmente por Dennis el 18 de
septiembre de 2026**. La aceptación manual de `IMPLEMENTATION-003` e
`IMPLEMENTATION-004` (listas de pasos más abajo) está **pendiente** de que
Dennis las ejecute.

## Tecnología

- Motor: **Godot 4.7.2-stable**, edición estándar (no .NET).
- Lenguaje: **GDScript** exclusivamente.
- Renderizador: **Forward+** (escritorio).

## Requisitos e instalación (Windows)

1. Descarga **Godot 4.7.2-stable Standard para Windows x86_64** desde
   `https://godotengine.org/download/archive/4.7.2-stable/`. No descargues
   la edición .NET ni las plantillas de exportación: no son necesarias para
   esta entrega.
2. Clona o actualiza este repositorio.
3. Abre Godot y usa **Importar**, seleccionando el archivo `project.godot`
   situado en la raíz del repositorio.
4. Pulsa **Ejecutar proyecto** (o F5). La escena principal se abre
   automáticamente; no hace falta elegir ninguna escena manualmente.

## Controles (solo ratón)

- **Botón central + arrastrar**: desplaza la cámara sobre el plano
  horizontal.
- **Rueda del ratón**: acerca y aleja la cámara, con límites y transición
  suave.
- **Clic izquierdo**: selecciona una persona, un edificio, un lugar de
  trabajo, un punto de defensa, un puesto de guardia, un zombi o limpia la
  selección al hacer clic en terreno vacío. En modo «Zonas» pinta en su
  lugar (ver más abajo).
- **Clic derecho con una persona seleccionada**: abre un menú contextual
  junto al cursor con «Mover aquí» sobre terreno transitable, «Atacar
  cuerpo a cuerpo» sobre un zombi vivo, o sobre un lugar «Hacer ahora …»,
  «Designar …», «Cancelar designación …», las políticas de obtención y
  «Transportar todo lo accesible». Las opciones imposibles aparecen
  deshabilitadas con su razón (zona prohibida, refugio sin registrar,
  materiales insuficientes, habilidad insuficiente, defensa intacta,
  objetivo muerto o ruta física inexistente).
- **Botón «Retirarse al refugio»**: aparece en la ficha de una persona viva
  seleccionada; la envía al punto de reunión, cancelando su trabajo u orden
  actual sin duplicar recursos.
- **Botón «Zonas»**: abre una barra con «Habitual», «Precaución»,
  «Prohibida», «Ocultar/mostrar zonas» y «Terminar». Con el modo activo,
  clic izquierdo y arrastre pintan zonas; el botón central sigue moviendo
  la cámara y la rueda sigue haciendo zoom. Pintar una zona no explora,
  limpia ni asegura el terreno por sí sola.
- **Botón «Sucesos»**: panel con los doce hechos más recientes (ruido,
  detecciones, ataques, daño relevante, heridas, muertes, iniciativas,
  transgresiones y subidas de nivel), con día y hora del reloj.
- **Indicador de amenaza**: «Amenaza: tranquila», «alerta» o «contacto»,
  junto al reloj.
- **Botón «Centrar cámara»**: devuelve la vista al refugio candidato.
- **Botón «Prioridades»**: matriz de diez familias de trabajo × seis
  personas. Clic izquierdo sube `0→1→2→3→4→0`; clic derecho baja
  `4→3→2→1→0→4`.
- **Botón «Trabajos»**: trabajos activos y últimos completados, con persona,
  estado, fase, progreso, motivo de bloqueo y resultado.
- **Botón «Recursos»**: cantidad de cada uno de los diez tipos de recurso
  por estado logístico (disponible, reservado, en transporte, almacenado,
  consumido y perdido).
- **Franja bajo los botones**: qué hay almacenado y cuánto ocupan el almacén
  (50) y el depósito de agua (12).
- **Botones de velocidad**: Pausa, ×1, ×2, ×4 y ×10.

El panel de selección muestra, para una persona, su estado operativo,
actividad y fase actual, motivo cuando está inactiva, progreso cuando
trabaja, carga que lleva encima, las tres necesidades con su valor y nivel,
las once habilidades, salud y decisión reciente cuando exista, progreso de
aprendizaje de pesca y remiendo, un botón «Cancelar orden directa» cuando
procede y «Retirarse al refugio» mientras esté viva. Para un lugar muestra
su nivel de información, los indicios conocidos, el contenido pendiente, el
estado de la fuente o de la conducción, y un botón por cada acción
disponible con su motivo cuando no es posible; un punto de defensa muestra
además su estado, durabilidad, sector y trabajo activo, y un puesto de
guardia quién lo ocupa. Para un zombi muestra su salud y su estado.

## Bucle de exploración y subsistencia

1. Observar, inspeccionar y **registrar** el refugio candidato: eso
   establece el almacén (50) y el depósito de agua (12).
2. Transportar al almacén las pertenencias de llegada y el contenido de los
   edificios inspeccionados.
3. Observar la orilla del arroyo y acarrear agua con un recipiente, o
   activar la política «Mantener 12 de agua».
4. Inspeccionar el manantial elevado, planificar y construir la conducción
   por gravedad: después produce agua sola.
5. Inspeccionar el estanque o el claro de hongos y obtener alimento fresco,
   transportarlo y secarlo en el taller antes de que se estropee.
6. Acondicionar la zona de descanso del refugio para que las personas puedan
   descansar.

## Bucle de defensa y vida propia

1. Abrir «Zonas» y pintar terreno habitual, de precaución o prohibido; una
   zona prohibida bloquea trabajos y rutas con el mensaje «Zona prohibida»,
   sin explorar ni asegurar nada por sí sola.
2. Tapiar una ventana, reforzar la puerta sur o construir el muro básico
   del hueco norte, consumiendo materiales reales una sola vez.
3. Designar a una persona en un puesto de guardia («Vigilar acceso»); se
   mantiene «En guardia» hasta cancelar, ser relevada, retirarse o morir.
4. Generar ruido con una construcción o reparación cercana: solo los
   zombis dentro de su radio empiezan a investigar.
5. Ver a un zombi acercarse, golpear una defensa o amenazar a una persona;
   el indicador de amenaza cambia y aparece en «Sucesos».
6. Defenderse con «Atacar cuerpo a cuerpo» o dejar que la guardia combata
   automáticamente; ordenar «Retirarse al refugio» y comprobar la retirada
   automática por salud crítica o varios zombis cercanos.
7. Observar la iniciativa de reparar una defensa dañada al 50 % y, con
   `person.initial.02` de guardia, la transgresión de zona para interceptar
   un zombi que amenaza su puesto.
8. Hacer que una persona mejore pescando o remendando, y ver el progreso y
   el cambio de resultado en su ficha.

## Prueba manual de aceptación de `IMPLEMENTATION-003` (pendiente — la ejecuta Dennis)

Esta lista **no** se declara superada por el agente que implementó la
entrega; debe ejecutarla Dennis después de recibirla. La prueba manual de
`IMPLEMENTATION-001` ya fue superada el 18 de septiembre de 2026.

1. Ejecutar el proyecto y confirmar que cámara, selección, reloj,
   velocidades, prioridades y ficha de persona siguen funcionando.
2. Comprobar que ya no hay pilas de escombros ni puntos de reconocimiento, y
   que en su lugar hay orilla del arroyo, estanque de pesca, claro de
   hongos, manantial elevado y depósito de agua.
3. Seleccionar el refugio candidato y leer su nivel de información
   («Avistado») y sus acciones disponibles.
4. Designar «Observar el lugar» y confirmar que aparecen indicios y que el
   nivel pasa a «Observado».
5. Designar «Inspeccionar el lugar» y comprobar que aparece contenido
   pendiente; repetir la inspección y confirmar que **no** se duplica.
6. Designar «Registrar el lugar» y comprobar que se establecen el almacén y
   el depósito, y que la franja superior deja de decir «sin establecer».
7. Seleccionar el refugio y usar «Transportar todo lo accesible»; seguir en
   «Trabajos» las fases «En camino», «Trabajando», «Llevando la carga» y
   «Depositando», y ver crecer la franja de almacenados.
8. Abrir «Recursos» y comprobar que las cantidades cuadran y que ninguna
   unidad se duplica ni desaparece al cancelar un transporte a medio camino.
9. Inspeccionar y registrar la Casa 1 y el taller, y transportar su
   contenido.
10. Observar la orilla del arroyo, designar «Acarrear agua» y confirmar que
    el recipiente vuelve al almacén y que el depósito sube de 2 en 2.
11. Activar la política «Mantener 12 de agua» con clic derecho y comprobar
    que el depósito se rellena solo y se detiene en 12.
12. Inspeccionar el estanque, activar la obtención continua de pesca y
    confirmar que se agota en 12 unidades y que después informa «agotada».
13. Seleccionar el claro de hongos **sin** inspeccionarlo y leer «no
    reconocemos nada más útil aquí todavía»; inspeccionarlo y comprobar que
    cambia.
14. Transportar alimento fresco al almacén, esperar a ×10 y ver bajar su
    condición; dejar que uno llegue a 0 y comprobar que se convierte en
    alimento echado a perder.
15. Designar «Secar alimento fresco» en el taller con 3 unidades frescas y
    comprobar que aparecen 2 conservadas.
16. Inspeccionar el manantial elevado, designar «Planificar conducción por
    gravedad» y luego «Construir conducción por gravedad» en el depósito;
    comprobar que consume 4 tablones y 2 materiales de reparación una sola
    vez y que después el depósito sube solo, sin pasar de 12.
17. Poner todas las prioridades de una familia a `0`, dejar que una
    necesidad llegue a «crítica» a ×10 y comprobar que la persona
    interrumpe su trabajo, aparece un trabajo de supervivencia marcado con
    «⚠» y la necesidad se resuelve.
18. Acondicionar la zona de descanso, comprobar que las personas descansan,
    y confirmar que en pausa nada avanza y que no aparecen errores rojos en
    el depurador.

## Prueba manual de aceptación de `IMPLEMENTATION-004` (pendiente — la ejecuta Dennis)

Esta lista **no** se declara superada por el agente que implementó la
entrega; debe ejecutarla Dennis después de recibirla.

### Preparación y regresión

1. Abrir el proyecto con Godot 4.7.2 Standard, pulsar F5 y confirmar que no
   aparecen errores rojos; cámara, selección, reloj, pausa, velocidades,
   prioridades, trabajos y recursos siguen funcionando.
2. Observar, inspeccionar y registrar el refugio; transportar sus
   materiales y las pertenencias. Confirmar que el almacén y el depósito
   se establecen como antes y que aparecen cuatro prendas dañadas una sola
   vez.
3. Inspeccionar el taller y transportar sus tablones y materiales de
   reparación para disponer de más de una alternativa de defensa.

### Zonas

4. Abrir «Zonas»: comprobar el rectángulo habitual verde alrededor del
   asentamiento y la precaución ámbar exterior; pintar con arrastre celdas
   de los tres tipos y ocultar/mostrar la capa.
5. Pintar una franja prohibida entre una persona y un objetivo exterior.
   Confirmar que una designación o movimiento que la cruce queda bloqueado
   con «Zona prohibida»; devolver una celda a precaución y comprobar que se
   recupera sin reiniciar.

### Defensa, ruido y amenaza

6. Seleccionar una ventana y tapiarla. Ver la reserva y consumo exactos de
   2 tablones, su durabilidad 60/60, el aro de ruido de 22 m y el suceso
   con la causa. Cancelar otra construcción a mitad y confirmar que
   conserva progreso y devuelve reservas.
7. Construir el muro norte o reforzar la puerta sur; confirmar que usa su
   coste distinto y que no puede completarse dos veces.
8. Asignar directamente `person.initial.02` al puesto de guardia sur y
   comprobar que permanece «En guardia». Antes de atraer zombis, pintar
   dos o tres celdas inmediatamente al sur del puesto como prohibidas.
9. Generar ruido construyendo o reparando cerca del refugio, pausar y
   localizar qué zombis quedaron dentro del aro. Reanudar a ×1: solo esos
   deben investigar; los lejanos permanecen quietos.
10. Ver al guardia detectar el contacto, cambiar el indicador de amenaza y
    combatir sin control individual continuo. Cuando el zombi esté al otro
    lado de la franja prohibida y se cumplan las condiciones, comprobar el
    mensaje «Ha cruzado el límite para interceptar un zombi que amenazaba
    el acceso» y su regreso o retirada posterior.
11. Dejar que otro zombi alcance un sector cerrado: debe detenerse, golpear
    la defensa y reducir su durabilidad; un sector abierto no debe
    bloquearlo. Confirmar estados visuales dañado/destruido y ruido de los
    impactos.
12. Mantener libre a una persona con construcción `>= 2`, prioridad de
    construcción mayor que 0 y un material de reparación almacenado. Al
    quedar una defensa viva al 50 % o menos, comprobar que crea una
    reparación de iniciativa y muestra «Ha decidido reparar la defensa
    dañada antes de que ceda». Cancelarla y confirmar que no reaparece
    hasta un daño nuevo.

### Control puntual, daño y retirada

13. Seleccionar una persona y usar clic derecho sobre un zombi para
    «Atacar cuerpo a cuerpo». Ver aproximación y golpes por intervalos, sin
    WASD ni puntería; cancelar o neutralizar el objetivo y confirmar que la
    persona vuelve a la gestión automática.
14. Con una persona amenazada, pulsar «Retirarse al refugio» y comprobar
    que abandona su trabajo sin duplicar recursos, va al punto de reunión y
    conserva salud y consecuencias. Observar también una retirada
    automática por salud crítica o dos zombis cercanos si surge durante la
    prueba.
15. Confirmar que la ficha refleja salud y que un zombi muerto no vuelve a
    actuar. No es necesario provocar la muerte de una persona; si ocurre,
    comprobar que libera trabajo, deja su carga y queda excluida sin
    desaparecer de la historia de la sesión.

### Aprendizaje

16. Inspeccionar el estanque y asignar dos pescas útiles a una persona con
    pesca nivel 1. Ver `0/2 → 1/2 → nivel 2, 0/4`, una unidad de alimento
    por resultado y el cambio de duración en el siguiente intento.
17. Almacenar las prendas dañadas y hacer que una persona con remiendo
    nivel 1 remiende dos. Comprobar dos transformaciones uno a uno,
    condición 40 en esos resultados, subida a nivel 2 y que el siguiente
    remiendo produce condición 65 y tarda menos.

### Integridad temporal

18. Durante amenaza, guardia y trabajo, alternar pausa, ×1, ×2, ×4 y ×10.
    Confirmar que en pausa nada avanza, que no hay ataques por fotograma,
    que recursos y práctica no se duplican y que el depurador sigue sin
    errores rojos.

## Documentación

- [docs/INDEX.md](docs/INDEX.md) — punto de entrada a toda la documentación.
- [docs/STATUS.md](docs/STATUS.md) — estado actual del proyecto.
- [prompts/INDEX.md](prompts/INDEX.md) — historial de prompts de entrega.

## Próximo trabajo de implementación

El alcance del primer corte jugable y la secuencia de entregas de
implementación están en
[docs/roadmap/RDM-001_first-playable-slice.md](docs/roadmap/RDM-001_first-playable-slice.md).
La siguiente entrega prevista es **«Persistencia y prueba integrada»**
(`IMPLEMENTATION-005`); no se ha iniciado.

Las instrucciones para agentes (Claude Code, Codex y otros) están en
[AGENTS.md](AGENTS.md).
