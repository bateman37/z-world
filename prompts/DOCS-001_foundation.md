# Z-World — DOCS-001: base documental e instrucciones permanentes

## Contexto

Trabaja sobre `main` actualizado del repositorio `bateman37/z-world`.

El repositorio se encuentra prácticamente vacío. Esta primera entrega es
exclusivamente documental y debe establecer una base de conocimiento escalable
para un videojuego de estrategia, supervivencia y construcción de asentamientos
con narrativa procedural emergente.

Z-World puede alcanzar un nivel de detalle muy alto. La documentación no puede
depender de un GDD monolítico ni obligar a Claude Code, Codex u otros agentes a
leer todo el proyecto en cada cambio. Debe permitir localizar y cargar solamente
el contexto pertinente para cada entrega.

## Objetivo

Crear la arquitectura documental inicial de Z-World y trasladar a ella las
decisiones, propuestas y preguntas abiertas que ya existen.

La entrega debe dejar preparado el repositorio para que:

1. Cada regla tenga una única fuente de verdad.
2. La documentación se pueda ampliar por dominios sin crear archivos gigantes.
3. Los agentes sepan qué leer antes de modificar cada sistema.
4. Las propuestas no se confundan con decisiones aprobadas.
5. El estado real de implementación pueda conocerse sin leer el historial
   completo ni todos los prompts.
6. Todos los prompts futuros se entreguen como Markdown y queden guardados en
   `prompts/`.

## Alcance estricto

Esta entrega debe:

- Crear la estructura documental descrita en este prompt.
- Crear instrucciones permanentes para Claude Code, Codex y futuros agentes.
- Actualizar el `README.md` raíz para presentar correctamente el proyecto y
  enlazar su documentación.
- Documentar de forma concisa lo que ya está aprobado.
- Separar claramente decisiones, hipótesis, ejemplos y preguntas abiertas.
- Registrar el primer escenario como una condición inicial, nunca como un guion.
- Crear un estado breve y fiable del proyecto.
- Dejar índices por dominio y rutas de lectura explícitas.

## Fuera de alcance

No realices en esta entrega:

- Código de juego o escenas de Godot.
- Prototipos, interfaces, modelos 3D o recursos visuales.
- Generación procedural implementada.
- Definiciones masivas de habilidades, objetos, edificios o eventos.
- Base de datos, SQLite, PostgreSQL, Docker o servicios online.
- Instalación de dependencias.
- Decisiones nuevas de diseño no contenidas en este prompt.
- Un calendario obligatorio del primer año.
- Un GDD monolítico que replique toda la información.

Si detectas una decisión imprescindible que no está cerrada, regístrala como
pregunta abierta. No la resuelvas silenciosamente.

---

## 1. Principios obligatorios de documentación

### 1.1 Fuente única de verdad

Cada regla funcional se explica en un único documento canónico. Otros archivos
deben enlazarla por ruta e identificador, sin copiarla ni reinterpretarla.

Los prompts históricos, documentos de descubrimiento y ejemplos no son fuentes
canónicas.

### 1.2 Documentación jerárquica

Debe existir:

- Un índice maestro pequeño.
- Un índice dentro de cada dominio.
- Documentos centrados en una única responsabilidad.
- Referencias explícitas entre documentos relacionados.

No es necesario leer recursivamente todo el árbol documental para realizar una
entrega concreta.

### 1.3 Tamaño controlado

- Evita documentos gigantes.
- Como regla de mantenimiento, revisa la división de un documento cuando se
  acerque a 300–500 líneas o contenga responsabilidades independientes.
- Un índice debe orientar, no convertirse en un segundo GDD.
- Los ejemplos deben ser breves y estar marcados como no normativos.

### 1.4 Estados documentales

Usa estos estados:

- `draft`: propuesta en definición; no autoriza implementación completa.
- `approved`: decisión funcional cerrada y canónica.
- `implemented`: además de aprobada, existe y está verificada en el juego.
- `deprecated`: sustituida; debe indicar su reemplazo.

No marques nada como `implemented` en esta entrega.

### 1.5 Identificadores estables

Utiliza prefijos estables para poder localizar información con búsquedas
textuales:

| Dominio | Prefijo |
|---|---|
| Gobierno documental | `DOC` |
| Visión | `VIS` |
| Mundo | `WLD` |
| Personajes | `CHR` |
| Asentamiento | `SET` |
| Sociedad | `SOC` |
| Amenazas | `THR` |
| Narrativa procedural | `NAR` |
| Interfaz | `UI` |
| Arquitectura técnica | `ARC` |
| Escenarios | `SCN` |
| Decisiones | `DEC` |
| Descubrimiento | `DISC` |

Los identificadores no se reutilizan aunque un documento quede obsoleto.

### 1.6 Cabecera común

Los documentos canónicos deben comenzar con una cabecera YAML como esta:

```yaml
---
id: CHR-005
title: Aprendizaje y enseñanza
status: draft
canonical_for:
  - aprendizaje individual
  - enseñanza
depends_on:
  - CHR-003
  - CHR-004
related:
  - SOC-002
---
```

No inventes dependencias para rellenar la cabecera. Una lista puede quedar vacía.

### 1.7 Estructura interna de los documentos canónicos

Cuando aplique, utiliza estas secciones:

1. Propósito.
2. Principios que no deben romperse.
3. Modelo funcional.
4. Reglas aprobadas.
5. Interacciones con otros sistemas.
6. Casos límite o riesgos.
7. Preguntas abiertas.
8. Ejemplos no normativos.

No añadas secciones vacías solo para cumplir una plantilla.

### 1.8 Decisiones frente a descubrimiento

- `docs/discovery/` conserva síntesis de conversaciones, alternativas e ideas
  todavía no cerradas.
- `docs/decisions/` conserva decisiones relevantes ya adoptadas, su motivo y
  consecuencias.
- Los documentos canónicos contienen las reglas vigentes.
- Las conversaciones completas no deben copiarse al repositorio. Deben
  sintetizarse.

---

## 2. Estructura que debe crearse

Crea como mínimo esta estructura. Las carpetas de dominio deben quedar
representadas por su propio `INDEX.md`; no crees archivos vacíos.

```text
AGENTS.md
CLAUDE.md
README.md
docs/
  INDEX.md
  STATUS.md
  OPEN-QUESTIONS.md
  00-governance/
    INDEX.md
    DOC-001_documentation-system.md
    GLOSSARY.md
  10-vision/
    INDEX.md
    VIS-001_game-vision.md
    VIS-002_design-pillars.md
  20-world/
    INDEX.md
    WLD-001_world-scales.md
  30-characters/
    INDEX.md
    CHR-001_character-model.md
    CHR-002_knowledge-and-learning.md
  40-settlement/
    INDEX.md
    SET-001_settlement-growth.md
    SET-002_production-and-solutions.md
  50-society/
    INDEX.md
    SOC-001_living-community.md
  60-threats/
    INDEX.md
  70-narrative/
    INDEX.md
    NAR-001_emergent-narrative.md
  80-interface/
    INDEX.md
  90-architecture/
    INDEX.md
    ARC-001_technical-direction.md
  scenarios/
    INDEX.md
    SCN-001_mountain-village-arrival.md
  decisions/
    INDEX.md
    DEC-0001_godot-4.md
    DEC-0002_two-world-scales.md
    DEC-0003_data-driven-design.md
  discovery/
    INDEX.md
    DISC-0001_foundational-design.md
  roadmap/
    INDEX.md
prompts/
  README.md
  INDEX.md
  DOCS-001_foundation.md
```

El prompt actual ya puede existir en `prompts/`; consérvalo. Añade el índice y
ajusta `prompts/README.md` solo si es necesario para alinearlo con estas reglas.

No crees todavía `game_data/`, `src/`, `tests/` ni un proyecto Godot vacío. Se
incorporarán cuando una entrega técnica lo requiera.

---

## 3. Instrucciones permanentes para agentes

### 3.1 `AGENTS.md`

Debe ser breve y operativo. Incluye como mínimo:

- `docs/INDEX.md` es el punto de entrada documental.
- `docs/STATUS.md` describe el estado actual, pero no sustituye a las fuentes
  canónicas.
- Antes de cambiar un sistema, el agente debe leer su índice de dominio, los
  documentos canónicos afectados y las dependencias expresamente relevantes.
- No debe leer todo `docs/` por defecto.
- Debe buscar por identificador con una herramienta textual antes de ampliar el
  contexto.
- No debe duplicar reglas canónicas en prompts, código u otros documentos.
- Debe distinguir `draft`, `approved` e `implemented`.
- No debe implementar una pregunta abierta como si fuese una decisión.
- Toda entrega debe actualizar los documentos afectados y `docs/STATUS.md` si
  cambia el estado real del proyecto.
- Los cambios arquitectónicos relevantes requieren una decisión en
  `docs/decisions/`.
- Los datos futuros utilizarán identificadores estables y contratos validados.
- Todos los prompts se guardan como Markdown en `prompts/`.
- Las pruebas deben ser acotadas al cambio; no ejecutar suites globales sin
  necesidad concreta.
- El agente debe inspeccionar el código y los datos reales antes de asumir su
  estructura.
- Debe preservar cambios ajenos y evitar reescrituras masivas no solicitadas.
- Si existe una contradicción entre documentos canónicos, debe detener esa parte
  de la implementación, señalarla y no escoger silenciosamente una versión.

### 3.2 `CLAUDE.md`

Debe permanecer deliberadamente corto. No dupliques todo `AGENTS.md`.

Indica a Claude Code que:

1. Lea `AGENTS.md`.
2. Consulte `docs/INDEX.md` y `docs/STATUS.md`.
3. Lea únicamente el contexto obligatorio declarado por el prompt y sus
   dependencias relevantes.
4. Use búsquedas por identificador para localizar referencias.
5. Actualice documentación y estado al completar una entrega.

### 3.3 Protocolo de prompts futuros

Documenta en `prompts/README.md` y referencia desde `AGENTS.md` que cada prompt
futuro debe incluir:

1. Identificador y título.
2. Contexto y precondiciones.
3. Lecturas obligatorias concretas por ruta o identificador.
4. Objetivo.
5. Alcance.
6. Fuera de alcance.
7. Reglas funcionales o técnicas específicas.
8. Documentación que debe actualizarse.
9. Validaciones y pruebas acotadas.
10. Criterios de aceptación.
11. Formato del informe final.

Los prompts deben enlazar las fuentes canónicas en lugar de copiar toda su
información. Un prompt representa una entrega coherente; no debe expandirse con
mejoras oportunistas.

---

## 4. Contenido funcional que debe trasladarse

### 4.1 Visión aprobada

Z-World es un videojuego de estrategia, supervivencia y construcción de una
comunidad tras un apocalipsis zombi. Su objetivo diferencial es que cada partida
genere una historia propia mediante sistemas conectados, no mediante una
secuencia fija de misiones.

El jugador dirige una comunidad y un asentamiento. No controla manualmente a
cada superviviente como personaje de acción. Define prioridades, roles, equipos,
políticas, permisos, planes y respuestas ante situaciones importantes.

Referencias de intención, sin copiar ni prometer todas sus mecánicas:

- `RimWorld`: apego a personajes, relaciones, pérdidas e historias emergentes.
- `Project Zomboid`: credibilidad material, peligro, escasez y consecuencias.
- `Timberborn`: claridad de gestión, automatización y facilidad de lectura.
- `Frostpunk`: presión social, liderazgo, políticas y decisiones colectivas.

Registra expresamente que estas referencias son orientativas y no especifican
por sí solas ninguna funcionalidad.

### 4.2 Pilares aprobados

- Narrativa procedural causal: el mundo genera causas y consecuencias; no se
  limita a lanzar eventos aleatorios.
- Mundo persistente con memoria: personas y comunidades recuerdan acciones y
  resultados relevantes.
- Personas importantes: habilidades, relaciones, aprendizaje, lesiones,
  ambiciones, conflictos, pérdidas y muerte permanente pueden transformar la
  comunidad.
- Gestión indirecta: el jugador gobierna y organiza; los habitantes ejecutan.
- Múltiples soluciones: los objetivos no dependen de una cadena tecnológica
  única.
- Profesiones vivas: el pasado profesional influye en el inicio, pero no encierra
  a nadie en una clase permanente.
- Conocimiento individual y comunitario: saber, conservar, enseñar y documentar
  forman parte de la supervivencia.
- Transformación del territorio: el asentamiento crece desde un edificio hacia
  sus alrededores y convierte lugares existentes en infraestructura útil.
- Mundo exterior vivo: otras comunidades nacen pequeñas, cambian, crecen, se
  dividen, comercian, luchan o desaparecen aunque el jugador no las controle.
- Transición del mundo muerto a la reconstrucción: los restos industriales
  permiten sobrevivir al principio, pero combustible, piezas e infraestructuras
  pueden degradarse y forzar alternativas locales.

### 4.3 Escalas del mundo aprobadas

Existen dos escalas complementarias:

1. Un mapa local 3D donde se observa y gestiona el asentamiento, sus habitantes,
   edificios, terrenos cercanos, defensas, producción y amenazas inmediatas.
2. Un mapa estratégico mucho mayor, concebido actualmente como una cuadrícula
   hexagonal con niebla de guerra, para exploración, rutas, comunidades,
   expediciones, puestos y cambios regionales.

El detalle de lo cercano es profundo; lo lejano puede simularse de forma más
abstracta y materializar mayor detalle cuando se vuelve relevante.

La cuadrícula hexagonal es una dirección de diseño aprobada para documentar, pero
su escala, tamaño, representación exacta y transición con el mapa local siguen
abiertos.

### 4.4 Personajes, habilidades y conocimiento aprobados

Una profesión representa principalmente experiencia previa, no una clase
cerrada. Un informático puede aprender a pescar y un pescador puede aprender
electricidad, aunque el ritmo y la dificultad dependan de sus aptitudes,
conocimientos previos, enseñanza, práctica y medios.

Se distinguen al menos estas capas conceptuales:

- Aptitudes personales.
- Habilidades individuales.
- Conocimiento individual.
- Conocimiento comunitario conservado en personas, libros, planos, archivos,
  escuelas, bibliotecas y talleres.
- Medios materiales: herramientas, instalaciones, componentes, energía y
  materias primas.

Una acción compleja puede exigir una combinación de varias habilidades,
conocimiento disponible, personas, herramientas, tiempo y materiales.

La práctica permite aprender. La enseñanza puede acelerar el proceso. Un
profesor o una persona con capacidad para transmitir conocimientos puede ser muy
valioso. Si una persona muere o abandona antes de transmitir un conocimiento, la
comunidad puede perder capacidad real.

No cierres todavía la lista de atributos, habilidades, especialidades, niveles o
fórmulas. Regístralos como diseño pendiente.

### 4.5 Asentamiento y producción aprobados

El refugio no es solo un conjunto de habitaciones. Comienza ocupando y adaptando
un edificio existente, pero puede reclamar, conectar y transformar su entorno:
casas, talleres, huertos, caminos, depósitos, bosques, campos y otras
infraestructuras.

Cada ampliación ofrece capacidad y también costes de vigilancia, mantenimiento,
logística, ruido, defensa y trabajo.

No existe una ruta de producción universal. La misma necesidad puede resolverse
de formas diferentes según las personas, el entorno y los recursos. La comida,
por ejemplo, puede proceder temporalmente de saqueo, cultivo, caza, pesca,
ganadería, comercio o combinaciones de estas opciones.

Las profesiones y habilidades abren posibilidades reales. Un grupo con
conocimiento técnico puede mantener bombas, vehículos o energía durante más
tiempo; otro puede desarrollar antes una economía rural robusta.

Los libros y la investigación deben responder a problemas concretos, no actuar
como una barra tecnológica abstracta que desbloquea automáticamente edificios.

### 4.6 Sociedad y política aprobadas

Al crecer una comunidad aparecen liderazgo, prestigio, grupos de interés,
conflictos, políticas y posibles facciones internas.

Las facciones no deben aparecer únicamente al alcanzar una cifra arbitraria de
población. Deben emerger de relaciones, procedencia, experiencias, intereses,
ideas, reparto de recursos, estatus y acontecimientos compartidos.

El jugador puede influir mediante cargos, normas, reparto de recursos,
negociación, concesiones y coerción, pero no controla de forma absoluta lo que
cada persona piensa.

Otras comunidades comienzan de manera plausible y evolucionan. No se presupone
una ciudad de decenas de miles de habitantes al principio de la partida.

### 4.7 Narrativa emergente aprobada

La narrativa debe surgir del estado real del mundo:

```text
estado del mundo y de las personas
  -> tensiones, necesidades y oportunidades
  -> situación relevante
  -> decisión del jugador o reacción autónoma
  -> consecuencias
  -> memoria persistente y nuevo estado
```

Un grupo de refugiados no aparece simplemente porque corresponda un evento. Puede
haber perdido su refugio, haber conocido la ubicación del jugador, disponer de
una ruta viable y llegar con relaciones, necesidades y consecuencias propias.

El juego debe diferenciar hechos observados, rumores, información antigua e
información posiblemente falsa.

Las situaciones narrativas seleccionan y presentan momentos importantes; no
deben sustituir la simulación con guiones disfrazados de azar.

No cierres todavía el modelo de memoria, el director narrativo, la frecuencia de
situaciones ni el formato de los eventos. Deben quedar como preguntas abiertas.

### 4.8 Primer escenario: condición inicial, no historia obligatoria

La primera versión puede comenzar siempre con seis supervivientes que han huido
de su lugar de origen ayudándose entre ellos. Llegan cansados, con pocas
pertenencias, a un pueblo de montaña aparentemente deshabitado y deciden dejar de
moverse.

El primer problema sugerido es convertir un edificio existente en un refugio
básico: inspeccionarlo, reunir allí los recursos, descansar, conseguir agua,
buscar comida, cerrar accesos y explorar el mapa local.

Esto no define una campaña lineal ni obliga a que el grupo siga teniendo seis
personas:

- Pueden admitir supervivientes y convertirse pronto en una comunidad mayor.
- Pueden rechazar gente.
- Una disputa puede provocar expulsiones o abandonos.
- Una expedición puede salir del mapa local o no regresar.
- Con cazadores, armas o capacidades diferentes pueden asumir riesgos distintos.
- Pueden permanecer como una comunidad pequeña o crecer con rapidez.
- El orden y la forma de resolver agua, comida, defensa, descanso y producción
  deben variar.

El planteamiento del “primer año” solo identifica presiones plausibles como
refugio, agua, alimento, defensa, producción, invierno, relaciones y exploración.
No constituye un calendario de hitos. El resultado debe proceder de la
simulación, las decisiones y las condiciones concretas de la partida.

Marca como abiertas, salvo que ya se deduzca lo contrario de este prompt:

- La estación exacta de llegada.
- Los seis personajes concretos y sus relaciones iniciales.
- El edificio inicial y el grado de elección disponible.
- La geografía y tamaño exactos del mapa local.
- La población zombi inicial.
- La disponibilidad inicial de armas, agua, alimento y electricidad.
- La existencia y proximidad de otras comunidades.

### 4.9 Dirección técnica aprobada

- Motor: Godot 4.
- Primera dirección visual: 3D sencillo y legible, con cámara estratégica
  inclinada; los detalles exactos de cámara y arte siguen abiertos.
- Lenguaje inicial preferido: GDScript, sujeto a revisión si una necesidad
  técnica concreta justifica C#.
- El proyecto debe separar simulación, datos y presentación para reducir
  acoplamiento al motor.
- Contenido y reglas configurables mediante datos con identificadores estables.
- Guardado local. No usar PostgreSQL para el juego local inicial.
- SQLite puede evaluarse cuando exista una necesidad de persistencia compleja;
  no se incorpora todavía.
- No planificar una migración automática a Unity. Si algún día se cambia de
  motor, se conservarán principalmente diseño, datos y recursos reutilizables;
  escenas, interfaz y código específico requerirían trabajo nuevo.
- No introducir multijugador, cuentas o servicios online sin una decisión futura
  explícita.

No decidas todavía la estructura de carpetas del futuro proyecto Godot, el
formato definitivo de datos ni el formato de guardado.

---

## 5. Separación futura entre diseño, contenido y código

Documenta como principio, sin crear todavía estas carpetas, la futura separación:

| Tipo | Responsabilidad futura |
|---|---|
| `docs/` | Reglas, decisiones, contexto y diseño canónico |
| `game_data/` | Habilidades, conocimientos, edificios, recursos, situaciones y escenarios concretos |
| `schemas/` | Contratos y validaciones de datos |
| `src/` | Implementación del juego |
| `tests/` | Pruebas acotadas de reglas, integración y regresión |

Ejemplos de identificadores futuros, solo como convención y sin crear el
contenido:

- `skill.production.agriculture`
- `knowledge.irrigation.basic`
- `building.water.rain_collector`
- `situation.social.group_schism`
- `scenario.mountain_village.arrival`

No conviertas estos ejemplos en un catálogo oficial.

---

## 6. Estado e indexación

### 6.1 `docs/INDEX.md`

Debe contener:

- Explicación breve de la jerarquía.
- Tabla de dominios y responsabilidades.
- Ruta de lectura recomendada según el tipo de cambio.
- Enlaces a todos los índices de dominio.
- Explicación de los estados documentales.
- Aviso claro de que no debe leerse todo el repositorio por defecto.

### 6.2 Índices de dominio

Cada `INDEX.md` de dominio debe contener únicamente:

- Responsabilidad del dominio.
- Qué pertenece y qué no pertenece allí.
- Documentos existentes con ID, estado y propósito.
- Dependencias principales con otros dominios.
- Documentos previstos solo cuando exista una razón ya conocida.

### 6.3 `docs/STATUS.md`

Debe ser corto y actualizarse en cada entrega que cambie el proyecto. Incluye:

- Fase actual.
- Última entrega completada.
- Tecnología aprobada.
- Funcionalidad realmente implementada.
- Documentación aprobada y en borrador.
- Bloqueos o contradicciones conocidos.
- Próximo candidato de trabajo, sin convertirlo en compromiso.

En esta entrega debe indicar claramente que no existe todavía implementación del
juego.

### 6.4 `docs/OPEN-QUESTIONS.md`

Agrupa preguntas por dominio y enlaza el documento canónico afectado. No repitas
allí toda la discusión. Cuando una pregunta se cierre:

1. Actualiza la fuente canónica.
2. Crea una decisión si tiene impacto relevante.
3. Retira la pregunta abierta.

### 6.5 `docs/discovery/DISC-0001_foundational-design.md`

Debe sintetizar las ideas fundacionales y dejar claro qué partes fueron ejemplos
exploratorios, especialmente el posible desarrollo del primer año. No copies
conversaciones completas ni presentes ese ejemplo como secuencia obligatoria.

---

## 7. Decisiones iniciales

Crea decisiones breves para:

### `DEC-0001` — Godot 4

Registrar Godot 4 como motor inicial, 3D sencillo como dirección visual y que no
existe un plan de migración automática a Unity.

### `DEC-0002` — Dos escalas de mundo

Registrar la convivencia entre mapa local 3D profundo y mapa estratégico global
más abstracto. La forma exacta de conexión permanece abierta.

### `DEC-0003` — Diseño dirigido por datos

Registrar que sistemas, datos y presentación deben quedar desacoplados; el
contenido futuro utilizará identificadores estables y contratos validables.

Cada decisión debe incluir contexto, decisión, consecuencias y aspectos que
siguen abiertos.

---

## 8. `README.md` raíz

Sustituye el contenido mínimo actual por una presentación breve que incluya:

- Qué es Z-World.
- Estado actual: fase de diseño y arquitectura documental; sin juego ejecutable.
- Tecnología elegida: Godot 4.
- Enlace a `docs/INDEX.md`.
- Enlace a `docs/STATUS.md`.
- Enlace a `prompts/INDEX.md`.

No lo conviertas en un GDD ni copies allí los pilares completos.

---

## 9. Revisión de coherencia

Antes de terminar:

1. Verifica que todos los enlaces Markdown relativos creados existen.
2. Verifica que no hay identificadores duplicados.
3. Verifica que todos los documentos canónicos tienen cabecera y estado.
4. Verifica que ningún documento figura como `implemented`.
5. Busca repeticiones extensas de reglas y reemplázalas por enlaces.
6. Comprueba que el primer año no se presenta como un calendario obligatorio.
7. Comprueba que el grupo inicial de seis no se trate como población fija.
8. Comprueba que las preguntas no resueltas sigan marcadas como abiertas.
9. Comprueba que `AGENTS.md`, `CLAUDE.md`, `docs/INDEX.md` y `docs/STATUS.md`
   sean breves y operativos.
10. Ejecuta `git diff --check`.

No instales herramientas ni crees un validador automático en esta entrega.

---

## 10. Criterios de aceptación

La entrega estará completa cuando:

- La estructura documental exista y sea navegable desde `docs/INDEX.md`.
- Los agentes tengan instrucciones permanentes y no redundantes.
- La visión actual esté sintetizada sin inventar reglas nuevas.
- Se distinga claramente entre aprobado, borrador, implementado y obsoleto.
- El escenario inicial sea una condición de partida abierta a resultados
  diferentes.
- Sea posible localizar una regla por dominio e identificador.
- `docs/STATUS.md` permita saber que aún no hay juego implementado.
- Todos los prompts futuros deban ser archivos Markdown guardados en `prompts/`.
- Los enlaces relativos sean válidos y `git diff --check` no informe de errores.

## 11. Informe final de Claude Code

Devuelve únicamente un resumen conciso con:

1. Archivos y estructura creados.
2. Decisiones registradas.
3. Qué se dejó como pregunta abierta.
4. Validaciones realizadas y resultado.
5. Cualquier contradicción o limitación encontrada.

No propongas ni implementes la siguiente fase en esta misma entrega.
