# Z-World — IMPLEMENTATION-001: vertical slice visual

## 1. Contexto y precondiciones

Esta es la **primera entrega de código ejecutable** de Z-World. `DESIGN-001`
y `DESIGN-002` ya están completados y fusionados. El repositorio contiene la
visión y las reglas canónicas, pero en el punto de partida de esta entrega no
existen `project.godot`, escenas, scripts, recursos del juego ni pruebas
ejecutables.

Implementa exclusivamente la primera de las cinco entregas fijadas en
`RDM-001`: el vertical slice visual. Debe permitir a Dennis abrir el proyecto,
pulsar **Ejecutar proyecto** y reconocer por primera vez Z-World como un juego
de estrategia 3D, aunque todavía no haya trabajos, necesidades ni amenazas.

No conviertas esta entrega en un framework general ni anticipes los sistemas
de las cuatro entregas posteriores. Inspecciona el repositorio real antes de
crear archivos. Conserva cualquier cambio ajeno que encuentres.

## 2. Lecturas obligatorias y límite de contexto

Lee, en este orden:

1. `AGENTS.md`, `CLAUDE.md`, `docs/INDEX.md`, `docs/STATUS.md` y
   `prompts/README.md`.
2. `docs/roadmap/RDM-001_first-playable-slice.md`.
3. `docs/90-architecture/ARC-001_technical-direction.md` y
   `docs/90-architecture/ARC-002_procedural-generation-and-persistence.md`.
4. `docs/80-interface/UI-001_interaction-and-command-model.md`, solo las
   reglas de selección, control con ratón y tiempo relevantes para esta
   entrega.
5. `docs/scenarios/SCN-001_mountain-village-arrival.md`, solo como dirección
   visual del escenario.
6. `docs/decisions/DEC-0001_godot-4.md` y
   `docs/decisions/DEC-0004_mouse-strategic-control.md`.

No leas por defecto el horizonte máximo completo, catálogos en borrador ni
todos los documentos de personajes, recursos o amenazas. Esta entrega no los
implementa. Usa `rg` por identificador si necesitas resolver una referencia
concreta.

## 3. Objetivo verificable

Al terminar, una persona sin conocimientos de programación debe poder:

1. Clonar o actualizar el repositorio.
2. Importar `project.godot` con la versión documentada de Godot.
3. Ejecutar la escena principal sin configurar nada adicional.
4. Ver un pequeño pueblo de montaña 3D con un refugio candidato y seis
   supervivientes claramente distinguibles.
5. Desplazar y acercar la cámara usando solo el ratón.
6. Seleccionar individualmente a las seis personas y edificios visibles.
7. Pausar y cambiar entre ×1, ×2, ×4 y ×10, viendo avanzar el reloj del juego.

El resultado es una base visual funcional, no todavía una demo de
supervivencia.

## 4. Base técnica cerrada para esta entrega

### 4.1 Motor y renderizado

- Usa **Godot 4.7.2-stable**, edición estándar, no .NET.
- Usa exclusivamente **GDScript**.
- Usa el renderizador **Forward+** como configuración de escritorio inicial.
- El proyecto debe abrirse desde el `project.godot` situado en la raíz del
  repositorio.
- Ventana inicial: `1600 × 900`, redimensionable.
- No instales complementos, paquetes, SDK adicionales ni recursos externos.
- No incorpores C#, SQLite, PostgreSQL, Docker, servidor ni servicios online.

Documenta esa versión como baseline reproducible. No uses Godot 4.8 de
desarrollo ni selecciones otra versión por estar instalada localmente. Si el
ejecutable exacto no está disponible en el entorno de Claude, crea el proyecto
para 4.7.2 y declara qué validaciones no pudieron ejecutarse; no instales el
motor por tu cuenta.

### 4.2 Estructura mínima

Usa esta separación de primer nivel:

```text
project.godot
scenes/
src/
tests/
docs/
prompts/
```

Dentro de `scenes/` y `src/`, separa únicamente estas responsabilidades:

- Escena principal y composición.
- Mundo local de prototipo.
- Cámara estratégica.
- Superviviente visual reutilizable.
- Selección/interacción.
- Reloj de simulación.
- HUD.

Puedes elegir nombres de subcarpetas y clases claros en inglés. No construyas
un sistema de módulos, contenedor de dependencias, bus global de eventos,
ECS, framework de estados, repositorios, serialización ni capas abstractas que
esta entrega no necesita. Evita también un único script que construya todo el
juego: la escena, cámara, reloj, selección, persona y HUD deben mantener
responsabilidades separadas.

Añade un `.gitignore` apropiado para Godot que excluya como mínimo `.godot/`,
archivos temporales del editor y builds exportadas, sin ignorar escenas,
scripts ni recursos fuente necesarios.

## 5. Escena principal y mundo local

### 5.1 Composición visible

Crea una escena 3D sencilla, legible y coherente con un pueblo de montaña.
Debe contener como mínimo:

- Terreno transitable visualmente delimitado.
- Relieve o siluetas de montaña en los bordes.
- Un camino principal y al menos un desvío.
- Un cauce, arroyo o pequeña zona de agua.
- Un grupo de árboles o bosque.
- Una zona abierta que sugiera campo o prado.
- Entre cinco y ocho edificios simples.
- Un edificio diferenciado como **«Refugio candidato»**.
- Seis supervivientes reunidos cerca del refugio.

Usa primitivas, materiales planos, iluminación, niebla ambiental moderada y
sombras sencillas del propio Godot. La escena debe ser agradable y fácil de
leer, pero no requiere modelos artísticos, texturas, animaciones, vegetación
avanzada ni realismo. No descargues assets ni generes arte definitivo.

La paleta debe distinguir claramente terreno, agua, caminos, vegetación,
edificios, refugio y personas. Evita que todo se vea como cubos grises sin
jerarquía visual.

### 5.2 Naturaleza del mapa

El mapa de esta entrega es una **maqueta fija y determinista** de la dirección
visual. No implementes generación procedural, semillas configurables,
interiores, navegación, niebla de guerra ni carga por sectores. Eso no cambia
la dirección procedural aprobada; simplemente queda fuera del primer paso del
roadmap.

No añadas objetos interactivos que prometan mecánicas inexistentes. El agua,
bosque, caminos y edificios solo comunican la futura estructura espacial.

## 6. Cámara estratégica controlada con ratón

Implementa una cámara 3D cenital inclinada con estas reglas exactas:

- Perspectiva estratégica inclinada, no primera ni tercera persona.
- Mantener pulsado el botón central y arrastrar desplaza la cámara sobre el
  plano horizontal.
- La rueda acerca y aleja con transición suave.
- El zoom tiene límites que permiten ver personas de cerca y el conjunto del
  mapa sin perderse fuera de él.
- El desplazamiento queda limitado a los bordes útiles de la maqueta.
- Un botón visible **«Centrar cámara»** devuelve la vista al refugio.
- La cámara y el HUD siguen respondiendo cuando el reloj está pausado.
- No es necesario rotar la cámara en esta entrega.
- No implementes controles WASD ni hagas que usar teclado sea necesario para
  ninguna prueba de aceptación.

La selección con clic izquierdo no debe dispararse al pulsar botones del HUD.
El arrastre central no debe seleccionar accidentalmente objetos.

## 7. Seis supervivientes visibles

Crea una escena reutilizable de superviviente usando geometría provisional.
Cada persona debe tener:

- ID estable desde `person.initial.01` hasta `person.initial.06`.
- Nombre provisional visible en el panel, desde «Superviviente 1» hasta
  «Superviviente 6».
- Silueta legible desde la cámara estratégica.
- Una pequeña diferencia visual de color o accesorio geométrico para poder
  distinguirla del resto.
- Colisión o mecanismo equivalente para selección fiable con ratón.
- Indicador visual de selección a sus pies.

No inventes todavía nombres propios, biografías, características,
habilidades, relaciones, necesidades, inventarios, movimiento autónomo ni
animaciones. Esas decisiones pertenecen a entregas posteriores o siguen
abiertas.

Las seis personas permanecen quietas en esta entrega. No introduzcas
`NavigationAgent3D`, pathfinding, trabajos ni comportamientos falsos solo para
dar sensación de actividad.

## 8. Selección e información contextual

El clic izquierdo selecciona una sola entidad. Deben poder seleccionarse:

- Las seis personas individualmente.
- El refugio candidato.
- Al menos otros dos edificios.

La selección anterior se limpia al seleccionar otra entidad o al hacer clic
en terreno vacío. La entidad seleccionada presenta un aro, contorno, cambio de
material o indicador inequívoco. No dependas solo del panel textual.

Todas las entidades seleccionables exponen un contrato pequeño y común con:

- ID estable.
- Tipo: `person` o `building`.
- Nombre mostrado.
- Descripción breve.

El panel de selección, en español, muestra esos cuatro datos. Para elementos
sin mecánica, la descripción debe decir de forma natural que su interacción
llegará en otra entrega; no muestres botones deshabilitados para trabajos que
no existen.

No implementes selección múltiple, caja de arrastre, menús contextuales,
órdenes, movimiento por clic, prioridades ni fichas completas.

## 9. Reloj y velocidades

Implementa un reloj de simulación independiente del `Engine.time_scale`:

- Inicio: **Día 1, 08:00**.
- A velocidad ×1, un día completo equivale a 20 minutos reales.
- Controles visibles: pausa, ×1, ×2, ×4 y ×10.
- Solo un estado de velocidad puede aparecer activo.
- El reloj muestra día, hora y minutos.
- Al superar las 24:00 incrementa el día sin perder tiempo acumulado.
- Pausar detiene exclusivamente el tiempo simulado; selección, cámara y HUD
  continúan funcionando.
- Cambiar de velocidad no salta, duplica ni descarta tiempo.

Centraliza la conversión de tiempo en un componente pequeño que emita el
estado actualizado. No conectes futuros sistemas inexistentes ni diseñes el
calendario, estaciones o guardado.

Como referencia matemática para las pruebas: a ×1 avanzan 72 segundos
simulados por cada segundo real; durante 10 segundos reales deben transcurrir
aproximadamente 12 minutos simulados. A ×10, 10 segundos reales equivalen a
aproximadamente 2 horas simuladas.

## 10. HUD mínimo

El HUD debe ser funcional a `1600 × 900` y seguir siendo utilizable al
redimensionar la ventana. Incluye únicamente:

- Nombre del escenario: **«Llegada al pueblo de montaña»**.
- Día y hora actuales.
- Botones de pausa, ×1, ×2, ×4 y ×10.
- Botón **«Centrar cámara»**.
- Panel de entidad seleccionada.
- Ayuda compacta: **«Clic: seleccionar · Botón central: mover · Rueda:
  zoom»**.
- Una indicación discreta y permanente: **«Prototipo visual — sin
  simulación de supervivencia»**.

No muestres recursos, minimapa, tabla de trabajos, alertas, estaciones,
objetivos, FPS, consola de depuración ni barras falsas.

Toda la prosa visible debe estar en español. Identificadores internos y código
se mantienen en inglés.

## 11. Reglas técnicas de calidad

- La escena principal se configura como `run/main_scene` y no exige elegir
  una escena manualmente.
- Usa nodos y recursos nativos de Godot 4.7.2.
- No generes errores ni avisos evitables en el panel de salida al ejecutar.
- No hagas trabajo de simulación cada fotograma salvo cámara, input y reloj.
- Evita valores mágicos duplicados: límites de cámara, velocidad y escala de
  tiempo deben tener una única fuente clara.
- Separa estado del reloj, selección y representación visual para que las
  siguientes entregas puedan extenderlos sin reescribir la escena completa.
- No conviertas todavía personas o edificios en datos JSON; el formato de
  contenido definitivo sigue abierto.
- No añadas compatibilidad preventiva con Unity ni una capa de motor propia.
- Usa comentarios solo donde expliquen una decisión no evidente.

## 12. Fuera de alcance estricto

No implementes en esta entrega:

- Movimiento, rutas o animación funcional de supervivientes.
- Prioridades, designaciones, trabajos, reservas o autonomía.
- Características, habilidades, aprendizaje, relaciones o necesidades.
- Recursos, inventarios, almacenamiento, agua, comida o deterioro.
- Inspección, búsqueda, interiores o información parcial.
- Construcción, reparación, barricadas o refugio funcional.
- Zombis, combate, ruido, guardia, heridas o muerte.
- Generación procedural, selector de semilla o nueva partida.
- Guardado, carga o base de datos.
- Mapa estratégico, hexágonos, expediciones o comunidades externas.
- Menú principal, opciones, sonido, música, localización o exportación final.
- Arte descargado, shaders complejos o optimización prematura.

Si una mejora no es necesaria para cumplir los criterios de esta entrega,
déjala fuera y menciónala solo si constituye un bloqueo real.

## 13. Validaciones automatizadas acotadas

No añadas un framework de testing externo. Crea un smoke test ejecutable con
Godot en modo headless que compruebe al menos:

1. La escena principal puede cargarse e instanciarse.
2. Existen exactamente seis supervivientes con IDs únicos y esperados.
3. Existe el refugio candidato y al menos tres edificios seleccionables en
   total.
4. El HUD contiene los cinco estados de velocidad y el botón de centrar.
5. El reloj comienza en Día 1, 08:00.
6. La conversión de ×1 y ×10 respeta la duración de día aprobada.
7. La pausa no incrementa el tiempo simulado.

Si Godot 4.7.2 está disponible, ejecuta solamente:

```bash
godot --headless --path . --editor --quit
godot --headless --path . --script res://tests/smoke_test.gd
```

Adapta únicamente el nombre del binario si el entorno proporciona la misma
versión con otro nombre. No ejecutes suites globales, no instales Godot y no
uses una versión de desarrollo para dar las pruebas por válidas.

Ejecuta además:

```bash
git diff --check
```

Si una prueba no puede ejecutarse por ausencia del motor o de renderizado,
informa `NOT RUN` con la causa exacta; no la presentes como superada.

## 14. Prueba manual que debe quedar documentada

Añade al `README.md` instrucciones para Windows y esta lista de aceptación:

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

No declares superada esta prueba manual. Debe ejecutarla Dennis después de
recibir la entrega.

## 15. Documentación y trazabilidad

Actualiza:

- `README.md`: nuevo estado, requisitos, instalación, ejecución, controles y
  prueba manual.
- `docs/STATUS.md`: primera implementación presente, alcance exacto, pruebas
  automatizadas ejecutadas o no ejecutadas y aceptación manual pendiente.
- `docs/90-architecture/ARC-001_technical-direction.md`: baseline inicial
  Godot 4.7.2 Standard, GDScript y Forward+, distinguiéndola de una promesa
  permanente de versión.
- `docs/decisions/DEC-0001_godot-4.md`: reflejar el baseline concreto de la
  primera implementación sin afirmar que la versión nunca podrá actualizarse.
- `docs/roadmap/RDM-001_first-playable-slice.md`: registrar la primera entrega
  como implementada técnicamente pero pendiente de aceptación manual; no
  cambies su alcance ni marques las otras cuatro como iniciadas.
- `CHANGELOG.md`: añadir `IMPLEMENTATION-001`, funcionalidades realmente
  presentes, validaciones y lo que continúa fuera.
- `prompts/INDEX.md`: registrar este prompt.

No marques `UI-001`, `SCN-001`, `ARC-002` ni todo `RDM-001` como
`implemented`: esta entrega solo realiza una fracción concreta. No elimines
preguntas abiertas de sistemas que no se han construido.

Guarda este encargo sin cambios sustantivos en
`prompts/IMPLEMENTATION-001_visual-vertical-slice.md`.

## 16. Criterios de aceptación

La entrega está lista para revisión cuando:

- El repositorio contiene un proyecto Godot importable desde la raíz.
- La ejecución abre directamente la escena principal.
- El mundo transmite visualmente pueblo de montaña usando solo recursos
  propios del proyecto y primitivas.
- Se ven exactamente seis supervivientes y todos se seleccionan por separado.
- El refugio y al menos dos edificios adicionales son seleccionables.
- La selección visual y el panel siempre coinciden.
- Cámara, zoom y centrado funcionan solo con ratón y dentro de límites.
- El reloj comienza en Día 1, 08:00 y responde a pausa, ×1, ×2, ×4 y ×10.
- Pausar no bloquea la interfaz ni la cámara.
- No existen mecánicas ficticias o anticipadas fuera del alcance.
- El smoke test pasa con Godot 4.7.2 o queda honestamente como `NOT RUN`.
- La documentación distingue implementación presente de aceptación manual.
- `git diff --check` no informa errores.

## 17. Informe final

Responde en español y de forma concreta:

1. Qué puede verse y probarse ya.
2. Estructura técnica creada y decisiones mínimas tomadas.
3. Pruebas automatizadas, con comando y resultado real.
4. Pasos exactos de prueba manual para Dennis.
5. Limitaciones deliberadas y aceptación manual pendiente.
6. Archivos principales creados o modificados.

No continúes con «Trabajo y personas», no abras otra entrega y no añadas
mejoras oportunistas.
