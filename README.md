# Z-World

Videojuego de estrategia, supervivencia y construcción de un asentamiento
tras un apocalipsis zombi, con narrativa procedural emergente: cada partida
genera su propia historia a partir de sistemas conectados, no de una
secuencia fija de misiones.

## Estado actual

Primera entrega de código ejecutable: el **vertical slice visual**
(`IMPLEMENTATION-001`). El repositorio contiene ya un proyecto Godot
importable con un pueblo de montaña 3D, seis supervivientes, cámara
estratégica, selección y reloj de simulación. Es una base visual, **no**
todavía una demo de supervivencia: no hay trabajos, necesidades, recursos ni
amenazas. Ver el estado detallado en [docs/STATUS.md](docs/STATUS.md) y el
alcance exacto en
[docs/roadmap/RDM-001_first-playable-slice.md](docs/roadmap/RDM-001_first-playable-slice.md).

La aceptación manual de esta entrega (sección siguiente) está **pendiente**
de que Dennis la ejecute.

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
- **Clic izquierdo**: selecciona una persona, un edificio o limpia la
  selección al hacer clic en terreno vacío.
- **Botón «Centrar cámara»**: devuelve la vista al refugio candidato.
- **Botones de velocidad**: Pausa, ×1, ×2, ×4 y ×10.

## Prueba manual de aceptación (pendiente — la ejecuta Dennis)

Esta lista **no** se declara superada por el agente que implementó la
entrega; debe ejecutarla Dennis después de recibirla.

1. Descargar **Godot 4.7.2-stable Standard para Windows x86_64** desde
   `https://godotengine.org/download/archive/4.7.2-stable/`; no descargar la
   edición .NET ni las plantillas de exportación.
2. Importar el `project.godot` de la raíz.
3. Pulsar **Ejecutar proyecto**.
4. Confirmar que aparece el pueblo, el refugio y exactamente seis personas.
5. Mover la cámara manteniendo el botón central y hacer zoom con la rueda.
6. Seleccionar por separado las seis personas, el refugio y otros dos
   edificios; comprobar indicador y panel.
7. Probar pausa y todas las velocidades; confirmar que la cámara y la
   selección funcionan en pausa.
8. Pulsar «Centrar cámara».
9. Redimensionar la ventana y comprobar que el HUD sigue siendo utilizable.
10. Confirmar que no aparecen errores en el depurador de Godot.

## Documentación

- [docs/INDEX.md](docs/INDEX.md) — punto de entrada a toda la documentación.
- [docs/STATUS.md](docs/STATUS.md) — estado actual del proyecto.
- [prompts/INDEX.md](prompts/INDEX.md) — historial de prompts de entrega.

## Próximo trabajo de implementación

El alcance del primer corte jugable y la secuencia de entregas de
implementación están en
[docs/roadmap/RDM-001_first-playable-slice.md](docs/roadmap/RDM-001_first-playable-slice.md).
La siguiente entrega prevista es **«Trabajo y personas»**; no se ha
iniciado.

Las instrucciones para agentes (Claude Code, Codex y otros) están en
[AGENTS.md](AGENTS.md).
