# Z-World

Videojuego de estrategia, supervivencia y construcción de un asentamiento
tras un apocalipsis zombi, con narrativa procedural emergente: cada partida
genera su propia historia a partir de sistemas conectados, no de una
secuencia fija de misiones.

## Estado actual (`DESIGN-004`)

`DESIGN-004` reinicia la **línea técnica activa** de Z-World: pasa del
prototipo 3D en Godot a un laboratorio de simulación web centrado en
mecánicas (Node.js, TypeScript, Next.js, PostgreSQL). Esta entrega es
**exclusivamente documental**: formaliza arquitectura, reloj continuo,
trabajo por fases, mapa 2D cenital con niebla, generador procedural
semántico de lugares y catálogo máximo de contenido. **Todavía no existe
ninguna aplicación Node.js/Next.js inicializada, ni código, ni pruebas
ejecutables de esta nueva línea.** Ver el estado detallado en
[docs/STATUS.md](docs/STATUS.md) y la hoja de ruta activa en
[docs/roadmap/RDM-003_simulation-first-playable-roadmap.md](docs/roadmap/RDM-003_simulation-first-playable-roadmap.md).

`DESIGN-005`, también exclusivamente documental, consolida sobre esa línea
las dos escalas espaciales: el mapa local es **2D cenital sobre Canvas**,
visualmente continuo y generado de forma procedural dentro de un perfil de
pueblo pequeño de montaña ficticio
([WLD-008](docs/20-world/WLD-008_local-procedural-map-generation.md)), con
interacción contextual por lugar y equipos locales
([UI-006](docs/80-interface/UI-006_contextual-place-interaction-and-teams.md));
el mapa regional queda documentado como horizonte futuro, fuera del roadmap
activo
([DEC-0010](docs/decisions/DEC-0010_procedural-local-and-regional-map-direction.md)).

El prototipo Godot descrito más abajo (`IMPLEMENTATION-001` a
`IMPLEMENTATION-004`) queda preservado íntegro como **prototipo histórico y
aprendizaje técnico**: no se borra, no se mueve y no recibe más desarrollo
activo. `IMPLEMENTATION-004` («Defensa y vida propia») fue completada
técnicamente en la rama `claude/docs-foundation-setup-94xtnn` y el PR #10
de GitHub, pero no fue aceptada manualmente por Dennis ni fusionada a
`main`; permanece abierta como referencia histórica, sin continuarse.

## Tecnología

### Línea activa (laboratorio de simulación, todavía sin inicializar)

Node.js LTS, TypeScript estricto, Next.js + React, núcleo de simulación
TypeScript puro, PostgreSQL con Prisma, Zod y Vitest. Ver
[DEC-0008](docs/decisions/DEC-0008_simulation-first-web-architecture.md) y
[ARC-004](docs/90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md).
Ningún archivo de este stack (`package.json`, configuración de Next.js,
esquema de Prisma, etc.) existe todavía en el repositorio.

### Prototipo histórico (Godot, ya no es la línea activa)

- Motor: **Godot 4.7.2-stable**, edición estándar (no .NET).
- Lenguaje: **GDScript** exclusivamente.
- Renderizador: **Forward+** (escritorio).

## Requisitos e instalación del prototipo histórico Godot (Windows)

Estas instrucciones ejecutan el **prototipo histórico**, no la nueva línea
de código. Se conservan porque el prototipo sigue siendo un artefacto válido
de referencia y aprendizaje técnico.

1. Descarga **Godot 4.7.2-stable Standard para Windows x86_64** desde
   `https://godotengine.org/download/archive/4.7.2-stable/`. No descargues
   la edición .NET ni las plantillas de exportación: no son necesarias para
   esta entrega.
2. Clona o actualiza este repositorio.
3. Abre Godot y usa **Importar**, seleccionando el archivo `project.godot`
   situado en la raíz del repositorio.
4. Pulsa **Ejecutar proyecto** (o F5). La escena principal se abre
   automáticamente; no hace falta elegir ninguna escena manualmente.

## Controles del prototipo histórico Godot (solo ratón)

- **Botón central + arrastrar**: desplaza la cámara sobre el plano
  horizontal.
- **Rueda del ratón**: acerca y aleja la cámara, con límites y transición
  suave.
- **Clic izquierdo**: selecciona una persona, un edificio, un lugar de
  trabajo o limpia la selección al hacer clic en terreno vacío.
- **Clic derecho con una persona seleccionada**: abre un menú contextual
  junto al cursor con «Mover aquí» sobre terreno transitable o, sobre un
  lugar, con «Hacer ahora …», «Designar …», «Cancelar designación …», las
  políticas de obtención y «Transportar todo lo accesible». Las opciones
  imposibles aparecen deshabilitadas con su razón.
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
las once habilidades y un botón «Cancelar orden directa» cuando procede.
Para un lugar muestra su nivel de información, los indicios conocidos, el
contenido pendiente, el estado de la fuente o de la conducción y un botón
por cada acción disponible, con su motivo cuando no es posible.

## Bucle de exploración y subsistencia del prototipo histórico Godot

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

## Prueba manual de aceptación de `IMPLEMENTATION-003` (pendiente — la ejecuta Dennis)

Esta lista **no** se declara superada por el agente que implementó la
entrega; debe ejecutarla Dennis después de recibirla. La prueba manual de
`IMPLEMENTATION-001` ya fue superada el 18 de septiembre de 2026. Esta
prueba corresponde al **prototipo histórico Godot**, no a la nueva línea de
código, que todavía no existe.

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

`IMPLEMENTATION-004` («Defensa y vida propia») está completada técnicamente
en su rama y PR #10, pero no está aceptada manualmente por Dennis ni forma
parte de esta lista: al no fusionarse ni adoptarse antes del cambio de
arquitectura, su prueba de aceptación queda igualmente pendiente y sin
efecto sobre la línea activa.

## Documentación

- [docs/INDEX.md](docs/INDEX.md) — punto de entrada a toda la documentación.
- [docs/STATUS.md](docs/STATUS.md) — estado actual del proyecto.
- [prompts/INDEX.md](prompts/INDEX.md) — historial de prompts de entrega.

## Próximo trabajo de implementación

La hoja de ruta activa tras `DESIGN-004` es
[docs/roadmap/RDM-003_simulation-first-playable-roadmap.md](docs/roadmap/RDM-003_simulation-first-playable-roadmap.md):
inicialización técnica del laboratorio de simulación web, reloj continuo
con seis personas, mapa cenital con niebla, trabajos y recursos, generador
semántico inicial, y ampliación progresiva en incrementos pequeños. No se
ha iniciado ninguna de sus entregas de implementación.

El roadmap histórico del prototipo Godot,
[docs/roadmap/RDM-001_first-playable-slice.md](docs/roadmap/RDM-001_first-playable-slice.md),
queda `deprecated` y preservado como referencia.

Las instrucciones para agentes (Claude Code, Codex y otros) están en
[AGENTS.md](AGENTS.md).
