# Z-World

Videojuego de estrategia, supervivencia y construcción de un asentamiento
tras un apocalipsis zombi, con narrativa procedural emergente: cada partida
genera su propia historia a partir de sistemas conectados, no de una
secuencia fija de misiones.

## Estado actual

Segunda entrega de código ejecutable: **trabajo y personas**
(`IMPLEMENTATION-002`). Sobre el vertical slice visual anterior, las seis
figuras quietas son ahora personas con prioridades de trabajo, habilidades,
estado operativo y navegación: se les puede designar trabajos sobre el mapa,
reservan su objetivo, se desplazan hasta él, lo ejecutan y lo completan, y
admiten órdenes puntuales con clic derecho. Sigue **sin** haber necesidades,
recursos, exploración funcional, autonomía, amenazas ni guardado. Ver el
estado detallado en [docs/STATUS.md](docs/STATUS.md) y el alcance exacto en
[docs/roadmap/RDM-001_first-playable-slice.md](docs/roadmap/RDM-001_first-playable-slice.md).

`IMPLEMENTATION-001` fue **aceptada manualmente por Dennis el 18 de
septiembre de 2026**. La aceptación manual de `IMPLEMENTATION-002` (lista de
pasos más abajo) está **pendiente** de que Dennis la ejecute.

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
- **Clic izquierdo**: selecciona una persona, un edificio, un objetivo de
  trabajo o limpia la selección al hacer clic en terreno vacío.
- **Clic derecho con una persona seleccionada**: abre un menú contextual
  junto al cursor con «Mover aquí» sobre terreno transitable o con «Hacer
  ahora …» y «Designar para la comunidad» sobre un objetivo de trabajo. Las
  opciones imposibles aparecen deshabilitadas con su razón.
- **Botón «Centrar cámara»**: devuelve la vista al refugio candidato.
- **Botón «Prioridades»**: matriz de diez familias de trabajo × seis
  personas. Clic izquierdo sube `0→1→2→3→4→0`; clic derecho baja
  `4→3→2→1→0→4`.
- **Botón «Trabajos»**: trabajos activos y últimos completados, con persona,
  estado, progreso y motivo de bloqueo.
- **Botones de velocidad**: Pausa, ×1, ×2, ×4 y ×10.

El panel de selección muestra, para una persona, su estado operativo,
actividad actual, motivo cuando está inactiva, progreso cuando trabaja, las
once habilidades con número y etiqueta, y un botón «Cancelar orden directa»
cuando procede. Para un objetivo de trabajo muestra su estado y una única
acción coherente: «Designar trabajo» o «Cancelar designación».

## Prueba manual de aceptación de `IMPLEMENTATION-002` (pendiente — la ejecuta Dennis)

Esta lista **no** se declara superada por el agente que implementó la
entrega; debe ejecutarla Dennis después de recibirla. La prueba manual de
`IMPLEMENTATION-001` ya fue superada el 18 de septiembre de 2026.

1. Ejecutar el proyecto y confirmar que cámara, selección, reloj y
   velocidades de la entrega anterior siguen funcionando.
2. Abrir «Prioridades» y comprobar seis columnas, diez familias y valor `2`
   inicial en todas las celdas.
3. Subir y bajar varias prioridades con clic izquierdo y derecho; confirmar
   número, color y tooltip.
4. Seleccionar una pila de escombros, designarla y comprobar que una persona
   elegible la reserva, camina, trabaja y la hace desaparecer.
5. Designar varios objetivos y confirmar que distintas personas trabajan y
   nunca dos reservan el mismo objetivo.
6. Poner `build_repair` («Construcción y reparación») a `0` para todas,
   designar escombros y comprobar el motivo «Prioridad desactivada para
   todas las personas»; volver a activar una prioridad y confirmar que el
   trabajo arranca.
7. Abrir «Trabajos» y comprobar persona, estado, progreso y bloqueos.
8. Seleccionar cada persona y revisar estado, acción y once habilidades.
9. Seleccionar una persona, hacer clic derecho en terreno y usar «Mover
   aquí»; confirmar que al llegar vuelve a buscar trabajo.
10. Con una persona seleccionada, hacer clic derecho en un objetivo y usar
    «Hacer ahora»; probar también una persona no elegible y leer la razón.
11. Pausar durante movimiento y durante trabajo: ambos deben detenerse, pero
    selección, prioridades y cámara deben seguir funcionando.
12. Probar ×1, ×2, ×4 y ×10 y confirmar aceleración coherente sin saltos,
    duplicaciones ni personas bloqueadas.
13. Cancelar una designación en progreso, volver a designarla y comprobar
    que conserva el progreso y libera correctamente la reserva.
14. Confirmar que las rutas no atraviesan edificios ni agua y que no
    aparecen errores rojos en el depurador.

## Documentación

- [docs/INDEX.md](docs/INDEX.md) — punto de entrada a toda la documentación.
- [docs/STATUS.md](docs/STATUS.md) — estado actual del proyecto.
- [prompts/INDEX.md](prompts/INDEX.md) — historial de prompts de entrega.

## Próximo trabajo de implementación

El alcance del primer corte jugable y la secuencia de entregas de
implementación están en
[docs/roadmap/RDM-001_first-playable-slice.md](docs/roadmap/RDM-001_first-playable-slice.md).
La siguiente entrega prevista es **«Exploración y subsistencia»**; no se ha
iniciado.

Las instrucciones para agentes (Claude Code, Codex y otros) están en
[AGENTS.md](AGENTS.md).
