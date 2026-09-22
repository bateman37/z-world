# WEB-001 — Fundación web, cohorte protagonista y mapa local operativo

> Este archivo es un **prompt de ejecución para Claude Code**. Debes seguirlo completo, no resumirlo ni convertirlo en una mera propuesta. La entrega solicitada incluye conjuntamente los bloques 1A, 1B, 2, 3A y 3B definidos aquí.

## 0. Mandato principal

Construye la primera entrega ejecutable de la nueva línea web de **Z-World** desde cero, usando exclusivamente la documentación canónica vigente como especificación funcional y arquitectónica.

Esta entrega debe producir, en una sola integración coherente y realmente verificable en navegador:

- **1A — Base técnica web y fronteras de arquitectura**.
- **1B — Runtime, reloj continuo y persistencia real**.
- **2 — Seis protagonistas procedurales con ficha y estado operativo**.
- **3A — Mapa local Canvas 2D, cámara, representación y niebla**.
- **3B — Navegación, órdenes directas y movimiento visible**.

No entregues solo una estructura, una maqueta, un documento, datos hardcodeados sin motor, componentes aislados ni una demostración no persistente. El resultado debe arrancar localmente, crear o cargar una partida, evolucionar de forma determinista, guardar su estado en PostgreSQL y permitir manejar a los seis protagonistas sobre el mapa.

La decisión de agrupar estos cinco bloques es deliberada. No reduzcas el alcance por la división anterior del roadmap. Organiza el trabajo internamente en hitos pequeños y comprobables, pero entrega el conjunto completo.

---

## 1. Decisiones innegociables de esta entrega

### 1.1 Reinicio limpio: prohibido portar Godot

La nueva implementación web **no es una migración del prototipo Godot**.

Queda expresamente prohibido:

- copiar, traducir, adaptar o envolver código GDScript;
- portar escenas, nodos, señales, recursos, autoloads, estructuras de carpetas o patrones de Godot;
- reutilizar constantes, valores de equilibrio, fixtures, datos de prueba o algoritmos extraídos del prototipo;
- utilizar las pruebas de Godot como oráculo de comportamiento;
- reconstruir en TypeScript clases o módulos por analogía con los antiguos archivos de Godot;
- recuperar funcionalidades desde ramas o commits históricos del prototipo;
- conservar compatibilidad con partidas guardadas, formatos o identificadores de Godot;
- afirmar que algo está validado porque existió o funcionó en Godot.

No inspecciones `src/`, `scenes/`, `tests/`, `project.godot` ni otros artefactos del prototipo como fuente de implementación. Puedes inventariar nombres de primer nivel para evitar colisiones y debes preservar esos archivos históricos, pero no debes minarlos en busca de soluciones.

La única herencia permitida es la **documentación canónica vigente**. Si un documento menciona Godot, extrae únicamente la regla de diseño que el propio documento declara vigente; nunca uses el código anterior para completar lo que el documento no especifica.

No borres ni reescribas el prototipo histórico salvo los cambios documentales concretos pedidos más adelante. La convivencia física temporal de archivos antiguos y nuevos no convierte al código antiguo en una dependencia.

### 1.2 Fuente de verdad

Aplica esta precedencia:

1. este prompt y las decisiones expresas que contiene;
2. documentos canónicos `approved` de la rama principal actual;
3. secciones ya cerradas de documentos `draft`, solo cuando otro documento aprobado las adopte expresamente;
4. ejemplos no normativos, únicamente como inspiración;
5. nunca el prototipo Godot.

Si detectas una contradicción material que no puede resolverse con esta precedencia, no inventes una decisión de diseño: documenta el conflicto y detén únicamente la parte afectada. No uses esta cláusula para aplazar ajustes técnicos ordinarios.

### 1.3 Qué significa “terminado”

La entrega solo está terminada cuando:

- existe una aplicación web funcional que puede probarse manualmente en navegador;
- el núcleo es TypeScript puro y está separado de UI, persistencia y framework;
- PostgreSQL es la persistencia real, sin fallback silencioso en memoria;
- una partida puede crearse por semilla, guardarse, recargarse y continuar sin regenerarse;
- aparecen exactamente seis protagonistas válidos y reproducibles;
- la UI nunca revela calibre ni potenciales numéricos ocultos;
- el reloj ofrece pausa, ×1, ×2, ×4 y ×10;
- existe un mapa Canvas navegable con niebla y conocimiento progresivo;
- puede darse una orden directa de movimiento, verla progresar, cancelarla o recibir un bloqueo comprensible;
- guardar y recargar a mitad de un desplazamiento conserva el estado causal;
- las pruebas automáticas y las comprobaciones manuales definidas en este prompt se han ejecutado o, si el entorno impide alguna, se informa con precisión y sin fingir éxito;
- la documentación refleja exactamente lo implementado y lo que aún no existe.

---

## 2. Protocolo previo obligatorio

Antes de modificar nada:

1. Confirma la rama y el commit de partida.
2. Ejecuta `git status --short --branch` y conserva cualquier cambio ajeno del usuario.
3. Comprueba que estás trabajando sobre la versión más reciente disponible de la rama activa. No hagas `reset --hard`, `checkout --`, limpieza destructiva ni reescritura de cambios del usuario.
4. Lee `AGENTS.md` y `CLAUDE.md` completos si existen, incluidos los que gobiernen subdirectorios concretos.
5. Revisa el inventario del repositorio sin estudiar el código Godot como referencia.
6. Guarda una copia íntegra de este prompt en:
   `prompts/WEB-001_web-foundation-cohort-local-map.md`
7. Añade esa entrada a `prompts/INDEX.md` conforme al protocolo vigente del repositorio.
8. Formula un plan de ejecución interno que mantenga siempre el repositorio construible al cerrar cada bloque. No te detengas tras mostrar el plan: ejecútalo.

Si el árbol ya contiene trabajo web posterior o parcialmente coincidente, primero determina su procedencia y calidad. No lo destruyas; intégralo solo si cumple este contrato y no procede de un port de Godot. Explica cualquier solapamiento en el informe final.

---

## 3. Lecturas obligatorias

Lee completos los documentos siguientes antes de cerrar la arquitectura o escribir reglas. Usa las rutas reales presentes en la rama; si un nombre ha cambiado, localiza el documento por su ID.

### 3.1 Gobierno, estado y trazabilidad

- `README.md`
- `docs/INDEX.md`
- `docs/STATUS.md`
- `docs/OPEN-QUESTIONS.md`
- `docs/00-governance/DOC-001_documentation-system.md`
- `prompts/README.md`
- `prompts/INDEX.md`
- `CHANGELOG.md`

### 3.2 Arquitectura, tiempo, persistencia y modelo semántico

- `DEC-0008` — reinicio simulation-first y stack web.
- `ARC-001` — arquitectura técnica general.
- `ARC-002` — generación procedural y persistencia.
- `ARC-004` — núcleo, runtime, reloj y fronteras.
- `ARC-005` — modelo semántico del mundo.
- `ARC-006`, `ARC-007` y `ARC-008` — únicamente para respetar sus invariantes sobre acciones, órdenes, estados, resultados y visibilidad; **no implementes aún el motor completo de resolución de tareas**.

### 3.3 Personajes y escenario inicial

- `CHR-001` — modelo de personaje.
- `CHR-004` — historia vital, relaciones y arcos personales.
- `CHR-006` — nueve características, 34 habilidades y escala real 0–10.
- `CHR-007` — potencial oculto, calibre y presentación cualitativa; respeta las partes cerradas y no cierres sus preguntas todavía abiertas.
- `DEC-0011` — decisiones del núcleo jugable relativas a personas y resolución.
- `SCN-001` — llegada al pueblo de montaña.
- `SCN-002` — cohorte de seis protagonistas.
- `SCN-003` — estado de llegada del primer día.
- `DEC-0012` — decisiones del escenario inicial.

### 3.4 Interfaz, mapa y movimiento

- `UI-001` — estructura general de interfaz.
- `UI-003` — taxonomía de prioridades de trabajo.
- `UI-004` — presentación cualitativa de capacidades.
- `UI-005` — mesa de simulación cenital.
- `UI-006` — interacción contextual; úsalo para la forma futura de los contratos, no para adelantar trabajos o equipos.
- `WLD-001` y `WLD-002` — escalas y espacio local.
- `WLD-008` — dirección de generación procedural local.
- `WLD-009` — perfil máximo del pueblo inicial; úsalo como horizonte, no como obligación de generar todo ahora.
- `WLD-010` y `WLD-011` — entorno mutable, construcción espacial, aberturas y conectividad; conserva compatibilidad conceptual sin implementar aún el editor de terreno o edificios.
- `DEC-0010` — dirección procedural local y regional.

### 3.5 Catálogos y roadmap

- `CAT-004` y `CAT-005` — forma futura de lugares, objetos, recursos y transporte; no adelantes su comportamiento en este hito.
- `DEC-0013` — catálogo implementable y mundo mutable.
- `RDM-003` — roadmap activo que esta decisión de alcance deberá actualizar.
- `RDM-002` — horizonte, únicamente para no bloquear capacidades futuras.

No conviertas esta lista en una excusa para expandir el alcance. Su función es que la base no nazca incompatible con el diseño aprobado.

---

## 4. Resultado jugable esperado

Al abrir la aplicación, el jugador debe poder:

1. ver una pantalla de inicio local con opción de crear una partida mediante semilla y continuar una partida existente;
2. crear el escenario del pueblo de llegada a las **17:30 del Día 1**, en abril, con la cohorte tras cuatro días de marcha y unas dos horas de luz restantes;
3. ver seis protagonistas procedurales coherentes, con identidades, biografías resumidas, capacidades actuales y estado operativo;
4. consultar el reloj, pausar y cambiar entre ×1, ×2, ×4 y ×10;
5. observar un mapa local cenital continuo y orgánico dentro de Canvas 2D;
6. desplazar y ampliar la cámara sin revelar información por mover la vista;
7. distinguir terreno oculto, terreno conocido pero no visible y terreno actualmente observable;
8. seleccionar una persona y un destino permitido con el ratón;
9. ver una ruta, el desplazamiento continuo, su fase y progreso;
10. cancelar una orden o entender por qué no puede ejecutarse;
11. ver cómo el movimiento descubre el entorno dentro de las reglas de observación;
12. guardar, recargar y continuar exactamente desde el estado persistido;
13. repetir una semilla y obtener el mismo estado inicial, o usar otra y obtener variación válida.

La experiencia debe sentirse como el primer laboratorio real del juego, no como un panel CRUD ni como una prueba aislada de Canvas.

---

## 5. Alcance funcional exacto

### 5.1 Incluido

- Inicialización del monorepo o estructura equivalente con las cinco capas obligatorias.
- Next.js/React como aplicación web local.
- TypeScript estricto en todo el código nuevo.
- Núcleo de simulación puro y determinista.
- Catálogos versionados y contratos validados.
- Runtime de simulación separado del renderizado, ejecutado en Web Worker.
- Reloj continuo, pausa y velocidades.
- PostgreSQL y Prisma desde esta primera entrega.
- Creación, listado mínimo, carga y guardado de partidas.
- Snapshots versionados y eventos causales significativos.
- Control de revisión para evitar sobrescrituras silenciosas.
- Generación reproducible de seis protagonistas.
- Nueve características y catálogo final de 34 habilidades como datos reales del nuevo modelo.
- Niveles actuales visibles 0–10.
- Calibre oculto y garantía de cohorte `5 / 4+ / 4+ / 3+ / 3+ / 3+`, barajada y sin pistas visuales.
- Frases cualitativas de potencial sin cifras, empezando por evidencia insuficiente.
- Prioridades `Nunca` y `1–5` para las 34 habilidades/trabajos que defina el documento canónico, editables y persistentes aunque el planificador automático llegue más tarde.
- Red inicial conectada de relaciones y acontecimiento compartido como datos del escenario, sin simulación relacional dinámica.
- Estado operativo mínimo de cada persona.
- Fixture procedural determinista del sector de llegada sobre el espacio lógico del mapa local.
- Canvas 2D, cámara, conversión de coordenadas, niebla y proyección de conocimiento.
- Navegación derivada, órdenes directas y movimiento determinista.
- Interfaz en español y registro operacional.
- Pruebas unitarias, de integración y una cobertura E2E mínima de los caminos críticos.
- Actualización documental precisa.

### 5.2 Deliberadamente fuera de alcance

No implementes todavía:

- el bucle completo explorar → descubrir → trabajar → recoger → transportar → cubrir una necesidad;
- designaciones de trabajos productivos;
- selección automática de trabajo por prioridades;
- necesidades que decaigan con el tiempo o puedan satisfacerse;
- sistema general de objetos interactivos;
- inventario completo, reparación, uso, desmontaje o transformación de objetos;
- transporte de cargas, porte a pulso, carretillas, carros, animales o vehículos;
- generación semántica completa de los ocho tipos de lugar;
- interiores, habitaciones, puertas editables, tapiado, aperturas o editor de edificios;
- agricultura, crecimiento de cultivos o cosechas;
- construcción de muros, graneros, carreteras, rampas, escaleras o terraformación;
- amenazas, zombis, combate, heridas, persecución o ruido;
- autonomía, toma de decisiones propia o desobediencia;
- evolución dinámica de relaciones, recuerdos o narrativa emergente;
- aprendizaje, mentoría, evidencias de potencial o procesamiento diario;
- motor general de resolución de acciones de `ARC-006` a `ARC-008`;
- mapa regional, expediciones o simulación a otras escalas;
- multijugador, autenticación, servicios remotos o despliegue productivo;
- modo offline o progreso mientras la aplicación está cerrada;
- una capa gráfica final, 2.5D, isométrica, WebGL, Phaser, Pixi o motor 3D;
- compatibilidad con guardados de Godot.

No crees implementaciones ficticias, botones deshabilitados o sistemas vacíos para simular estas capacidades. Deja contratos extensibles únicamente donde tengan un consumidor real en esta entrega.

---

## 6. Arquitectura obligatoria

### 6.1 Cinco capas con dependencias unidireccionales

Materializa desde el inicio las cinco capas de `ARC-004`:

1. **Núcleo de simulación**: estado, comandos, tiempo, movimiento, reglas y eventos. TypeScript puro.
2. **Catálogos y contratos**: IDs estables, definiciones versionadas, DTO y validación Zod.
3. **Persistencia**: Prisma/PostgreSQL, transacciones, snapshots, eventos y repositorios.
4. **Aplicación/orquestación**: ciclo de simulación, Worker, comandos, carga y guardado.
5. **Presentación web**: Next.js/React, Canvas, paneles y adaptadores de interacción.

Dependencias permitidas:

- el núcleo puede depender solo de TypeScript estándar y contratos/catálogos puros;
- catálogos y contratos no dependen de Next.js, React, Prisma ni APIs del navegador;
- persistencia traduce modelos serializables y no contiene reglas de juego;
- orquestación coordina, pero no decide resultados de dominio;
- presentación emite comandos y consume proyecciones; nunca modifica directamente el estado canónico.

Añade una prueba o regla automática que impida importaciones prohibidas hacia el núcleo.

### 6.2 Estructura recomendada

Usa una estructura clara de workspaces, equivalente a:

```text
apps/
  web/
packages/
  contracts/
  catalogs/
  simulation-core/
  application/
  persistence/
```

Puedes ajustar nombres si una alternativa mejora claramente el repositorio, pero conserva las fronteras y documenta el motivo en la decisión técnica. No mezcles el nuevo código con las carpetas históricas de Godot.

La aplicación debe arrancar con una secuencia corta y documentada, idealmente:

```text
npm install
npm run db:migrate
npm run dev
```

Expón además scripts raíz coherentes para `lint`, `typecheck`, `test`, pruebas de integración, E2E y `build`.

### 6.3 Stack

- Node.js LTS compatible con el ecosistema seleccionado.
- npm workspaces salvo que el repositorio ya haya adoptado otra opción documentada.
- Next.js con App Router.
- React.
- TypeScript con `strict: true` y sin erosión mediante `any` indiscriminado.
- PostgreSQL.
- Prisma como adaptador de persistencia.
- Zod en todas las fronteras externas y de deserialización.
- Vitest para unidades e integración de paquetes.
- Playwright para el mínimo recorrido E2E de navegador, si el entorno permite instalarlo y ejecutarlo.
- Canvas 2D nativo.
- CSS mantenible y suficiente para una interfaz limpia; no añadas un framework visual pesado sin necesidad.

Fija versiones exactas compatibles en el lockfile. No uses dependencias abandonadas ni incorpores librerías que dupliquen una función sencilla del navegador.

### 6.4 Configuración local

- No uses Docker.
- Añade `.env.example` sin secretos.
- Usa `DATABASE_URL` y, si las pruebas de integración lo requieren, `TEST_DATABASE_URL`.
- Documenta cómo preparar una base PostgreSQL local existente.
- Si PostgreSQL no está disponible, la aplicación debe mostrar un error de configuración explícito; no debe crear una partida volátil fingiendo persistencia.
- No envíes credenciales al cliente.

---

## 7. Contratos del núcleo y determinismo

### 7.1 Estado canónico serializable

Define un `SimulationStateV1` o nombre equivalente, validado y totalmente serializable. Debe contener como mínimo:

- versión de esquema del estado;
- semilla normalizada;
- versión del generador;
- metadatos del escenario;
- reloj de simulación;
- seis personas por ID estable;
- estado operativo y órdenes activas;
- mundo local canónico;
- estado de navegación derivado o los datos necesarios para reconstruirlo;
- niebla, conocimiento y descubrimientos;
- estado determinista del generador aleatorio o contadores deterministas equivalentes;
- secuencia causal necesaria para emitir IDs y eventos estables.

No guardes instancias de clase, funciones, `Map`, `Set`, `Date` ni valores que JSON no represente de manera inequívoca, salvo que exista una codificación explícita y validada. Emplea unidades canónicas:

- metros para espacio;
- segundos simulados para tiempo;
- enteros o redondeos explícitos donde la coma flotante pueda romper repetibilidad.

### 7.2 Comandos y eventos

Modela comandos como una unión discriminada validada. Como mínimo:

- crear/inicializar escenario;
- pausar/reanudar o fijar estado de pausa;
- cambiar velocidad;
- ordenar movimiento directo a una persona;
- cancelar una orden directa;
- actualizar una prioridad de persona.

La selección visual, el hover y la cámara son estado de presentación, no comandos de simulación.

Modela eventos de dominio significativos, por ejemplo:

- partida creada;
- velocidad o pausa cambiada;
- orden de movimiento aceptada;
- orden rechazada con código y explicación;
- movimiento iniciado;
- movimiento completado;
- movimiento bloqueado;
- movimiento cancelado;
- prioridad cambiada.

No generes ni persistas un evento por fotograma, por píxel ni por tick. Los eventos deben representar límites causales auditables, no telemetría visual.

### 7.3 Aleatoriedad

- Prohíbe `Math.random()` dentro de núcleo, catálogos generativos y Worker.
- Usa un PRNG determinista con algoritmo y versión explícitos.
- Separa streams o claves de generación por dominio cuando sea útil para que añadir una tirada visual futura no rerrollee personajes.
- Genera IDs estables de entidades a partir de semilla/contexto o desde una secuencia persistida.
- La misma semilla, versión, estado y secuencia de comandos debe producir el mismo resultado.
- Velocidad, pausa, frecuencia de render y guardado/recarga no pueden modificar resultados.

### 7.4 Reloj

Respeta la escala canónica: un día de juego completo equivale a 20 minutos reales a ×1.

Estados visibles:

- pausa;
- ×1;
- ×2;
- ×4;
- ×10.

El reloj comienza en **Día 1 · 17:30**. Usa pasos fijos o acumulador determinista en el núcleo y `performance.now()` únicamente en la orquestación para calcular cuánto tiempo real debe convertirse en tiempo simulado. No uses `requestAnimationFrame` como regla de juego.

Parte de un paso lógico provisional de un segundo simulado o de otro valor medido y justificado. Centralízalo, pruébalo en todas las velocidades y registra la decisión en `DEC-0014`. La interpolación visual puede ser más frecuente, pero no puede escribir estado canónico.

La aplicación no simula el tiempo transcurrido mientras estuvo cerrada. Al cargar, continúa desde el instante persistido y conserva de manera explícita el estado de pausa/velocidad guardado. No uses la hora del sistema para avanzar el mundo.

---

## 8. Runtime y Web Worker

### 8.1 Separación

Ejecuta el bucle de simulación en un Web Worker dedicado:

- React envía comandos tipados;
- el Worker posee el estado activo autoritativo de la sesión;
- el núcleo puro avanza el estado;
- el Worker emite proyecciones de lectura y lotes de eventos;
- la presentación interpola y dibuja, sin decidir reglas;
- las llamadas a persistencia pasan por endpoints/acciones de servidor y nunca importan Prisma en el Worker o en componentes cliente.

Define y valida ambos sentidos del protocolo. Maneja versión incompatible, payload inválido, Worker caído y desincronización de revisión con mensajes visibles.

### 8.2 Proyecciones, no filtraciones

No envíes a React el estado interno completo. Crea proyecciones específicas:

- resumen de partida;
- reloj y estado de guardado;
- ficha visible de persona;
- estado operativo;
- entidades conocidas/observables del mapa;
- máscara o datos de niebla;
- ruta y movimiento visibles;
- eventos operacionales aptos para el jugador.

La proyección de persona debe excluir calibre, plazas garantizadas, potenciales reales, máximos ocultos, confianza interna no observable y cualquier etiqueta que permita inferirlos. Estos datos tampoco deben aparecer en HTML, atributos, logs del navegador, nombres de clases CSS, orden fijo de tarjetas ni mensajes de depuración activados por defecto.

### 8.3 Rendimiento y estabilidad

- Renderiza Canvas con `requestAnimationFrame`.
- Usa `ResizeObserver` y escala para `devicePixelRatio` sin distorsionar coordenadas.
- Evita rerenderizar todo React en cada frame.
- Limita la frecuencia de proyecciones completas y permite actualizaciones incrementales cuando aporten claridad.
- Pausa o reduce trabajo visual en pestaña no visible, sin alterar causalmente el tiempo simulado ya decidido por el runtime.
- Si el Worker falla, detén la sesión, muestra el error y evita seguir dibujando como si el estado fuera válido.

---

## 9. Persistencia PostgreSQL/Prisma

### 9.1 Modelo mínimo

Implementa, como mínimo conceptual, estas entidades o equivalentes:

**GameSave**

- ID estable;
- nombre visible opcional;
- semilla;
- versión de generador;
- versión de esquema;
- revisión actual;
- fechas de creación, actualización y último uso como metadatos de persistencia;
- referencia inequívoca al snapshot vigente.

**SimulationSnapshot**

- ID;
- partida;
- revisión;
- versión de esquema;
- motivo del snapshot;
- estado JSONB validable;
- instante simulado;
- fecha de escritura;
- unicidad por partida y revisión.

**DomainEvent**

- ID;
- partida;
- secuencia monotónica;
- tipo;
- instante simulado;
- ID del comando causante cuando exista;
- payload JSONB validado;
- fecha de persistencia;
- índice por partida/secuencia.

El snapshot es la fuente autoritativa de carga y los eventos son auditoría causal útil. **No implementes event sourcing integral** en esta entrega.

### 9.2 Escritura y carga

- Crea partida, primer snapshot y eventos iniciales dentro de una transacción.
- Al guardar, escribe snapshot, eventos pendientes y revisión de partida atómicamente.
- Usa control optimista de revisión: un cliente con revisión obsoleta no sobrescribe silenciosamente otro estado.
- Cargar siempre valida esquema, versión y contenido antes de entregarlos al Worker.
- Un estado corrupto o incompatible produce un error explícito y no una regeneración por semilla.
- Nunca rerrollees personas o mapa al recargar.
- No escribas SQL por tick o por movimiento interpolado.

Usa límites causales y una cadencia debounced para estado sucio. Fuerza persistencia en, al menos:

- creación de partida;
- pausa o cambio relevante de sesión;
- aceptación, cancelación, bloqueo o finalización de una orden;
- cambio de prioridad;
- solicitud manual de guardado;
- pérdida de visibilidad/cierre como intento de mejor esfuerzo, sin prometer que `beforeunload` siempre finalice una petición.

Centraliza y documenta el intervalo técnico de autosave. No lo presentes como regla de diseño del juego.

### 9.3 Concurrencia local

Aunque no exista multijugador, trata dos pestañas como dos escritores posibles:

- la revisión esperada viaja en la solicitud;
- el servidor rechaza conflictos;
- el cliente afectado pausa y explica que la partida cambió en otra sesión;
- no intentes fusionar dos estados de simulación.

### 9.4 Estado visible de guardado

La UI debe distinguir al menos:

- guardado;
- cambios pendientes;
- guardando;
- error de guardado;
- conflicto de revisión.

No muestres “guardado” antes de la confirmación del servidor.

---

## 10. Generación de los seis protagonistas

### 10.1 Reglas generales

Genera exactamente seis adultos procedurales a partir de la semilla. No uses un elenco fijo. Cada persona necesita:

- ID estable no revelador;
- nombre y apellidos coherentes;
- edad adulta;
- identidad y presentación no estereotipada;
- procedencia o contexto vital breve;
- profesión, experiencias y aficiones plausibles;
- fortalezas y limitaciones presentes;
- nueve características actuales;
- 34 habilidades actuales;
- prioridades completas;
- resumen biográfico de las etapas exigidas por el modelo vigente, con el nivel de detalle razonable para este hito;
- vínculos iniciales estructurados;
- interpretación propia del acontecimiento compartido;
- estado de llegada y estado operativo;
- pertenencias iniciales resumidas conforme a `SCN-003`.

Las capacidades deben derivarse de biografía, profesión, aficiones y experiencia; no uses clases rígidas ni arquetipos que asignen automáticamente toda la ficha.

### 10.2 Catálogo vigente desde el primer día

La nueva línea web debe usar directamente:

- las **nueve características** canónicas de `CHR-006`;
- las **34 habilidades** canónicas de `CHR-006`;
- la escala real visible `0–10`;
- los nueve bloques de prioridad y sus 34 entradas finales según `UI-003` y las decisiones posteriores que los hayan cerrado;
- `Nunca` y niveles `1–5`, donde `1` es máxima prioridad.

No reproduzcas los antiguos subconjuntos de 11 habilidades o 10 prioridades del prototipo. Si un documento histórico todavía los presenta como alcance activo de la nueva web, reconcílialo documentalmente mediante `DEC-0014` y enlaces canónicos, sin borrar la historia.

Valida automáticamente el número exacto de características, habilidades, bloques y prioridades, así como IDs duplicados o referencias rotas.

### 10.3 Nivel actual y media humana

- El nivel actual de características y habilidades es visible y se expresa de `0` a `10`.
- En características, la media humana de referencia es `4`.
- `0` es un valor real y no significa “desconocido”.
- La falta de información de la comunidad se representa aparte, nunca falsificando el nivel como cero.
- Los niveles iniciales deben producir perfiles humanos plausibles, con fortalezas y debilidades, no seis hojas uniformes ni especialistas omnipotentes.
- Como máximo uno o dos protagonistas empiezan como especialistas realmente sobresalientes en un campo actual.
- Al menos dos carecen de especialización crítica destacada en el presente.

### 10.4 Cobertura colectiva obligatoria

Entre los seis, garantiza de forma procedural y validada al menos:

1. capacidad sanitaria básica o primeros auxilios dentro de Medicina;
2. capacidad práctica en alguna combinación de Obra, Mecánica, Electricidad, Carpintería, herramientas o reparación;
3. aportación útil en Supervivencia, Orientación, Forrajeo o vida rural;
4. capacidad de logística, transporte, Cocina, almacenamiento o Conducción;
5. aportación relevante de cuidado, Enseñanza, Influencia, cohesión o gestión social;
6. capacidad útil de Advertir, vigilancia, movimiento o respuesta inmediata ante peligro.

Incluye además al menos una carencia avanzada relevante generada proceduralmente. No garantices pasado militar, policial ni dominio de armas de fuego.

### 10.5 Calibre protagonista oculto

La cohorte usa seis plazas mínimas barajadas:

```text
5 / 4+ / 4+ / 3+ / 3+ / 3+
```

Interpretación:

- una persona tiene calibre 5 asegurado;
- dos tienen al menos 4;
- tres tienen al menos 3;
- cualquier plaza puede superar su mínimo;
- las seis pueden terminar siendo calibre 5;
- la distribución es específica de esta cohorte protagonista y no altera una futura población mundial.

El calibre:

- se genera antes de las capacidades actuales;
- condiciona el futuro perfil oculto, no añade bonificadores a acciones presentes;
- no obliga a que el personaje más prometedor sea hoy el más competente;
- no protege de debilidades, miedo, mala adaptación o conflicto;
- nunca se muestra ni se sugiere mediante estrellas, colores, orden, rareza, texto o metadatos visibles.

`CHR-007` conserva preguntas abiertas sobre los campos exactos de potencial. Por ello, en esta entrega implementa únicamente la mínima representación interna necesaria para la garantía de calibre y para una futura migración de esquema; no inventes 34 techos independientes ni cierres sus fronteras como decisión canónica.

### 10.6 Presentación del potencial

El valor numérico real del potencial, el máximo oculto y el calibre no son visibles. En esta primera llegada no existe evidencia suficiente para valorar ámbitos concretos, por lo que la frase por defecto es exactamente:

> «Todavía no conocemos bien sus posibilidades en este ámbito.»

Prepara el catálogo cerrado de frases de `CHR-007 §3.9` como datos versionados para uso futuro, incluyendo los estados “puede mejorar muchísimo”, “mucho margen”, “margen notable”, “margen moderado”, “evolución estabilizándose”, “cerca de su máximo” y “prácticamente todo desarrollado”. No actives transiciones de frase porque aprendizaje y evidencias están fuera de alcance.

La UI nunca debe mostrar una falsa precisión como `3/8`, porcentajes, estrellas, barras de techo o tooltips numéricos.

### 10.7 Relaciones y acontecimiento compartido

Genera una red conectada que cumpla `SCN-002`:

- al menos dos pares con relación previa;
- un vínculo fuerte positivo;
- un vínculo nacido durante el desastre;
- una relación deteriorada por una decisión reciente;
- una persona incorporada en los últimos días con confianza limitada;
- alguien que responde por esa persona;
- ningún integrante aislado;
- ningún líder oficial impuesto.

Las relaciones pueden ser asimétricas y no se reducen a una única barra. Genera también al menos un acontecimiento compartido reciente durante los cuatro días de marcha y una interpretación breve distinta por persona.

En este hito estos datos son **estado inicial consultable**, no un motor dinámico: no cambian con el tiempo, no influyen en órdenes y no generan narrativa autónoma. La UI debe etiquetarlos con naturalidad, sin prometer efectos todavía inexistentes.

### 10.8 Estado de llegada y pertenencias

Representa de manera honesta el estado inicial de `SCN-003`:

- cuatro días de desplazamiento;
- cansancio y descanso insuficiente;
- recursos escasos;
- luz restante aproximada;
- carencias iniciales relevantes;
- pertenencias personales básicas;
- todas las personas poseen al menos un arma cuerpo a cuerpo o improvisada coherente con el viaje.

Como necesidades, combate y objetos completos llegan después:

- muestra estos datos como condiciones iniciales descriptivas o snapshot de llegada;
- no hagas decaer hambre, sed o fatiga mientras todavía no existe forma de resolverlas;
- no conviertas armas y pertenencias en el sistema final de objetos;
- usa referencias/identidades mínimas, estables y extensibles, sin pilas de “recursos universales” ni acciones ficticias;
- documenta con claridad que aún no existe consumo, equipamiento, reparación, desmontaje ni combate.

### 10.9 Prioridades

La ficha debe permitir consultar y cambiar las 34 prioridades usando `Nunca` o `1–5`. Los cambios:

- son comandos del núcleo;
- se validan;
- generan evento causal;
- se persisten;
- sobreviven a recarga;
- no asignan trabajo todavía, porque el planificador automático pertenece al siguiente incremento.

La interfaz debe explicar de forma breve: prioridad expresa disposición futura, no capacidad ni una tarea activa.

---

## 11. Estado operativo de las personas

Cada persona expone siempre un estado comprensible. Para este hito basta con el subconjunto real que existe:

- esperando órdenes;
- preparando/aceptando una orden directa;
- desplazándose;
- llegada completada;
- bloqueada;
- orden cancelada.

El contrato debe ser extensible a las fases completas de `ARC-004`, pero no inventes recogida, trabajo, transporte o depósito.

Mientras se mueve, muestra:

- qué hace;
- destino legible;
- origen de la acción: orden puntual del jugador;
- fase actual;
- progreso medible del recorrido;
- distancia restante aproximada;
- motivo de bloqueo/cancelación cuando corresponda;
- consecuencia al terminar.

El porcentaje es una proyección del recorrido planificado y puede recalcularse si aparece un bloqueo futuro; no es una promesa temporal absoluta.

Varias personas pueden tener órdenes de movimiento simultáneas. No implementes colisiones sociales complejas, pero evita que una persona atraviese obstáculos estáticos no transitables.

---

## 12. Mundo local de esta entrega

### 12.1 No es el generador semántico completo

El incremento de generación semántica completa de lugares sigue pendiente. Para probar mapa, niebla y movimiento crea un **fixture procedural determinista del sector de llegada** que use los contratos definitivos del mundo, no un bitmap ni coordenadas ad hoc.

Debe:

- existir dentro de un espacio lógico local preparado para el presupuesto futuro de aproximadamente 3 × 3 km;
- poblar con detalle solo el sector necesario para esta entrega;
- variar de forma reproducible con la semilla;
- usar IDs estables y `generatorVersion`;
- representar geometría semántica básica como puntos, líneas, áreas y estructuras;
- alimentar la misma proyección que podrá consumir en el futuro el generador completo;
- no afirmar que `WLD-008`, `WLD-009`, `CAT-004` o `CAT-005` están implementados.

### 12.2 Contenido mínimo del sector

Incluye una composición legible y coherente, generada sin copiar mapas de Godot:

- zona de llegada y posición inicial del grupo;
- al menos una carretera o camino;
- terreno abierto;
- vegetación densa/bosque o matorral como área;
- agua como cauce o superficie;
- desnivel u obstáculo topográfico simplificado;
- una estructura/refugio candidato situado de forma coherente, idealmente dentro de la distancia de llegada aprobada por el escenario;
- algunos hitos o siluetas que puedan descubrirse;
- zonas transitables y no transitables suficientes para demostrar rutas y bloqueos.

La estructura es en este hito una entidad espacial reconocible con huella y posibles accesos representados si los contratos ya lo exigen, pero **no** tiene todavía interior, estancias, inventario semántico ni acciones de explotación. No simules que el refugio ya satisface el programa completo de `SCN-001`.

### 12.3 Espacio y geometría

- Usa coordenadas de mundo en metros, independientes de píxeles.
- Separa coordenadas de mundo, cámara, viewport y Canvas físico.
- Las entidades espaciales tienen geometría explícita y límites consultables.
- Las etiquetas visuales y estilos viven en presentación, no en el núcleo.
- El grafo o rejilla de navegación es una derivación técnica invisible, no la ontología del mundo.
- Prepara la invalidación/reconstrucción futura de navegación ante cambios del terreno, sin implementar mutación en este hito.

---

## 13. Canvas 2D y cámara

### 13.1 Presentación

Construye una vista cenital clara, continua y orgánica. No muestres la rejilla, nodos o sectores internos. Deben reconocerse por forma y color al menos:

- terreno abierto;
- vías;
- agua;
- vegetación;
- obstáculos/desnivel;
- estructuras conocidas;
- personas;
- rutas y destinos;
- niebla.

No hace falta arte final, pero tampoco uses rectángulos sin jerarquía que parezcan un editor de base de datos. Mantén una paleta sobria y legible, estados de selección claros y contraste suficiente. No dependas solo del color para comunicar selección, bloqueo o visibilidad.

### 13.2 Controles de ratón

Implementa y documenta una convención estable, por ejemplo:

- clic primario: seleccionar persona o entidad conocida;
- rueda: zoom centrado en el cursor;
- arrastre con botón central o gesto inequívoco: desplazar cámara;
- clic secundario sobre un destino permitido: abrir acción contextual mínima “Moverse aquí”;
- `Esc`: cerrar contexto o cancelar la previsualización, sin convertir el juego en control WASD.

Puedes mejorar el detalle si no contradice `UI-005`, pero evita acciones ocultas. El cursor y el panel contextual deben explicar qué ocurrirá antes de emitir una orden.

### 13.3 Cámara

- Paneo suave y acotado al mundo.
- Zoom mínimo y máximo razonables.
- Zoom alrededor del cursor, no del origen del Canvas.
- Transformaciones inversas correctas para hit testing.
- Redimensionado sin cambiar posiciones de mundo.
- Canvas nítido en pantallas HiDPI.
- Opción clara para centrar la cámara en la persona seleccionada.

Mover o ampliar la cámara nunca descubre terreno ni activa observación.

---

## 14. Niebla, visibilidad y conocimiento

Mantén separados tres conceptos:

1. **Oculto**: nunca observado; no se muestra información concreta.
2. **Conocido pero no visible ahora**: conserva la última información legítima con tratamiento visual distinto.
3. **Actualmente observable**: puede actualizarse con el estado presente.

Y mantén esa niebla separada de los cinco estados de conocimiento semántico definidos por la documentación de lugares. Un edificio puede estar espacialmente visible como silueta y seguir sin estar inspeccionado o comprendido.

Requisitos:

- la partida empieza revelando únicamente una zona razonable alrededor de la cohorte;
- todos los protagonistas contribuyen a la observación según una regla provisional común y centralizada;
- desplazarse actualiza la zona observada de forma determinista;
- la cámara no revela nada;
- la UI no muestra nombres, contenidos, accesos ocultos ni obstáculos desconocidos a través de la niebla;
- la ruta no utiliza conocimiento oculto que la comunidad no posea;
- la proyección web recibe solo geometría e información que el jugador puede conocer, más la máscara necesaria para dibujar la niebla;
- cualquier radio, resolución espacial o simplificación de línea de visión es parámetro técnico provisional, se prueba y se documenta sin elevarlo a diseño canónico.

Una primera línea de visión simplificada es aceptable si respeta obstáculos relevantes y no filtra el mundo completo. No etiquetes esta implementación como sistema final de percepción o `Advertir`.

---

## 15. Navegación y movimiento

### 15.1 Modelo

Deriva una estructura de navegación invisible —rejilla, grafo o malla sencilla— desde la geometría semántica. Documenta la elección y sus límites.

Requisitos:

- búsqueda de ruta determinista;
- coste y transitabilidad centralizados y basados en datos;
- obstáculos estáticos respetados;
- ruta expresada en coordenadas de mundo;
- movimiento por distancia y tiempo simulado, nunca por frames;
- interpolación visual sin alterar estado;
- velocidad base y modificadores iniciales parametrizados;
- progreso estable;
- soporte para varias órdenes simultáneas;
- cancelación limpia;
- bloqueo con código de dominio y texto entendible;
- reanudación exacta tras guardar/cargar.

El estado cansado puede alimentar una velocidad provisional únicamente si existe una regla explícita, sencilla y probada. No implementes el sistema completo de estado físico.

### 15.2 Conocimiento y destino

Permite ordenar movimiento únicamente a:

- un punto actualmente observable y transitable; o
- un punto ya conocido cuya ruta conocida sea planificable.

No planifiques de forma omnisciente a través de terreno completamente oculto. Para explorar, el jugador puede mover a una persona hacia el borde conocido; el desplazamiento revelará más espacio y después podrá ordenar un nuevo tramo. El comando de exploración autónoma pertenece al siguiente bucle y no debe fingirse aquí.

### 15.3 Rechazos y bloqueos mínimos

Contempla y muestra, al menos:

- destino fuera del mundo;
- destino oculto no elegible;
- punto no transitable;
- ruta inexistente con el conocimiento actual;
- persona ya ocupada por otra orden directa;
- comando obsoleto o duplicado;
- orden cancelada;
- conflicto de estado tras carga o revisión.

No uses excepciones genéricas para condiciones esperables de juego.

---

## 16. Interfaz de la primera entrega

### 16.1 Composición recomendada

Construye una composición de escritorio funcional:

- **barra superior**: Día/hora, pausa/velocidades, semilla, estado de guardado y acción de guardar;
- **panel izquierdo**: seis protagonistas, estado operativo resumido y selección;
- **centro**: Canvas del mapa;
- **panel derecho**: contexto de persona/lugar/destino y acciones permitidas;
- **zona inferior o cajón**: registro operacional de eventos recientes.

No es obligatorio clavar esta distribución si una alternativa conserva la misma legibilidad, pero el Canvas debe ser la superficie principal y la ficha no puede tapar permanentemente la acción.

### 16.2 Inicio y partidas

Incluye:

- crear partida con semilla opcional;
- normalización y validación visible de semilla;
- nombre de partida opcional;
- listado mínimo de partidas existentes con instante simulado y fecha de último uso;
- continuar partida;
- estado de carga/error;
- sin borrado destructivo en este hito salvo que exista confirmación inequívoca y pruebas.

Una semilla omitida puede generarse fuera del núcleo y mostrarse antes de crear la partida; una vez creada queda persistida e inmutable.

### 16.3 Ficha de persona

Organiza la información sin abrumar:

- resumen e identidad;
- estado operativo;
- condiciones de llegada;
- nueve características;
- 34 habilidades agrupadas como dicta el catálogo;
- valoración cualitativa de posibilidades;
- prioridades editables por bloques;
- biografía resumida;
- relaciones iniciales;
- interpretación del acontecimiento compartido;
- pertenencias resumidas.

Incluye búsqueda o plegado de grupos si hace falta. Repite siempre la distinción:

- nivel actual visible;
- potencial real oculto;
- prioridad no equivale a habilidad;
- una condición inicial no es todavía una necesidad simulada.

### 16.4 Registro operacional

Muestra eventos útiles y breves, con hora simulada:

- creación/carga;
- orden emitida/aceptada/rechazada;
- inicio, cancelación, bloqueo y llegada;
- cambio de prioridad;
- error o conflicto de guardado.

No lo conviertas en narrativa emergente ni vuelques trazas técnicas.

### 16.5 Accesibilidad y calidad web

- Controles HTML reales para botones, selectores y formularios.
- Foco visible y etiquetas accesibles.
- Atajos opcionales complementarios, nunca únicos.
- Mensajes comprensibles en español.
- Estados vacíos y errores diseñados.
- Sin `alert()` como interfaz normal.
- Sin errores o warnings propios en consola durante el recorrido aceptado.
- Diseño útil en un viewport de escritorio habitual; documenta el mínimo soportado.

---

## 17. Valores provisionales y decisiones técnicas

Este hito necesita cerrar cuestiones técnicas que `ARC-004` dejó para implementación:

- estructura exacta de paquetes;
- frecuencia/paso del núcleo;
- protocolo Worker;
- esquema de persistencia;
- cadencia de snapshots;
- algoritmo y granularidad de navegación;
- resolución de niebla;
- radio provisional de observación;
- velocidad provisional de desplazamiento;
- límites de cámara.

Decídelas mediante implementación, pruebas y medición. Deben:

- quedar centralizadas, con unidades;
- ser reemplazables sin reescribir la UI;
- no contradecir cifras canónicas;
- distinguirse expresamente de una regla final de diseño;
- registrarse en `DEC-0014` con alternativas consideradas y consecuencias.

No abras una ronda de preguntas al usuario para cada cifra técnica. Escoge valores conservadores y explícitos. Sí debes detenerte si una elección cambia una regla de diseño, no si solo ajusta resolución o rendimiento.

---

## 18. Cambios documentales obligatorios

Actualiza documentación en la misma entrega; no dejes el código desalineado.

### 18.1 Nueva decisión

Crea el siguiente ID libre —esperado `DEC-0014`— con un título equivalente a:

> Fundación del runtime web y contratos iniciales de simulación

Debe registrar:

- la prohibición expresa de portar Godot;
- la decisión de agrupar 1A, 1B, 2, 3A y 3B, con el motivo;
- estructura de paquetes;
- Web Worker como runtime activo;
- modelo de comandos/proyecciones;
- paso de simulación y relación con el render;
- estrategia híbrida snapshot + eventos, sin event sourcing total;
- esquema/versiones/revisión optimista;
- estrategia de determinismo y PRNG;
- uso inmediato del catálogo final de 9 características, 34 habilidades y 34 prioridades en la nueva web;
- fixture de llegada como soporte técnico temporal y no como generador semántico completo;
- algoritmos provisionales de navegación y niebla;
- ausencia de compatibilidad con guardados Godot;
- consecuencias, riesgos y alternativas descartadas.

Si `DEC-0014` ya existe en el momento de ejecución, usa el siguiente ID libre y actualiza enlaces.

### 18.2 Roadmap

Actualiza `RDM-003` para reflejar la decisión del usuario:

- la primera entrega web agrupa los bloques técnicos, cohorte, mapa, niebla y movimiento;
- la agrupación se divide internamente en subhitos verificables y no incluye trabajos, objetos, necesidades, amenazas o narrativa dinámica;
- elimina cualquier ambigüedad que convierta el prototipo Godot en referencia de código, datos, constantes o pruebas;
- conserva intacta la separación futura del primer bucle, generador semántico, objetos y sistemas avanzados;
- no marques esos incrementos futuros como implementados.

### 18.3 Arquitectura y preguntas abiertas

Actualiza referencias en `ARC-001`, `ARC-002`, `ARC-004`, `DEC-0008` y `docs/OPEN-QUESTIONS.md` solo donde esta implementación cierre realmente:

- estructura de paquetes;
- tick/acumulador;
- persistencia inicial;
- Worker y fronteras;
- catálogo inicial activo de la nueva web.

No cierres preguntas sobre balance final, fórmulas de acción, potenciales por campo, aprendizaje, visión definitiva, mundo completo o amenazas.

### 18.4 Reconciliaciones conocidas

Al revisar la versión efectiva de los documentos, corrige contradicciones activas conocidas si siguen presentes:

- `WLD-008` no debe tratar `CAT-004` como pendiente si `DEC-0013` ya lo aprobó;
- `SCN-001` no debe declarar abierto un subconjunto técnico que las decisiones posteriores cerraron;
- las referencias activas a `RDM-001` no deben presentarlo como roadmap vigente;
- `CHR-001`, `CHR-006`, `UI-001` y `UI-003` deben dejar claro que la nueva línea web usa los catálogos finales, aunque el prototipo histórico usara un recorte;
- `README.md` debe presentar la línea web como activa y Godot como historia preservada, no como base a continuar.

No reescribas documentos históricos o trazas de descubrimiento para fingir que siempre dijeron lo nuevo. Corrige fuentes activas, añade decisiones y conserva la cronología.

### 18.5 Estado, índices y changelog

Actualiza:

- `docs/INDEX.md` y el índice de decisiones;
- `docs/STATUS.md`;
- `docs/OPEN-QUESTIONS.md`;
- `prompts/INDEX.md`;
- `README.md` con instalación y arranque web;
- `CHANGELOG.md`.

En `STATUS.md`, distingue con precisión:

**Implementado en WEB-001**

- base web;
- runtime/reloj;
- persistencia;
- cohorte y ficha inicial;
- mapa de llegada provisional;
- cámara/niebla;
- orden y movimiento directo.

**Parcial o preparado, no implementado por completo**

- escenario `SCN-001`;
- mundo procedural local;
- potencial/aprendizaje;
- relaciones;
- objetos/pertenencias;
- necesidades.

**Pendiente**

- primer bucle de trabajo y recursos;
- generador semántico completo;
- objetos y desmontaje;
- transporte local;
- agricultura;
- entorno mutable;
- amenazas, autonomía y narrativa.

No cambies a `implemented` el estado íntegro de un documento conceptual si solo se ha construido un subconjunto.

---

## 19. Pruebas automáticas obligatorias

### 19.1 Núcleo y tiempo

Prueba como mínimo:

- pausa congela todo estado dependiente del tiempo;
- ×1, ×2, ×4 y ×10 avanzan la cantidad correcta de tiempo simulado;
- distintas cadencias de llamada producen el mismo estado final;
- ningún resultado depende de FPS;
- guardar/cargar en medio de una secuencia produce el mismo resultado que continuar sin recarga;
- serializar y deserializar conserva estado y versión;
- schemas rechazan estados inválidos;
- un día mantiene la equivalencia de 20 minutos reales a ×1.

### 19.2 Determinismo y generación

- misma semilla + versión produce los mismos seis personajes y el mismo fixture;
- distinta semilla produce variación sin violar garantías;
- exactamente seis adultos;
- la distribución oculta satisface `5 / 4+ / 4+ / 3+ / 3+ / 3+` después del barajado;
- es válida una cohorte de seis calibres 5;
- calibre alto no implica nivel actual alto;
- cobertura colectiva y restricciones de diversidad;
- red relacional conectada y cada condición mínima de `SCN-002`;
- acontecimiento compartido e interpretaciones por persona;
- IDs únicos y estables;
- ausencia de `Math.random` en paquetes de dominio;
- hash o snapshot semántico estable del estado inicial para una semilla de prueba.

Las pruebas pueden acceder al estado interno para validar garantías; la UI nunca debe hacerlo.

### 19.3 Catálogos y ocultación

- exactamente nueve características;
- exactamente 34 habilidades;
- escala 0–10 y media humana 4 correctamente representadas;
- exactamente 34 prioridades repartidas en los bloques canónicos;
- valores de prioridad solo `Nunca` o `1–5`;
- IDs y referencias sin duplicados;
- catálogo cualitativo de potencial completo;
- proyección visible sin calibre, estrellas, potencial real o máximo oculto;
- ningún campo oculto queda serializado en DTO de presentación.

### 19.4 Persistencia

Con PostgreSQL de prueba:

- migración desde base vacía;
- creación atómica de partida;
- carga del último snapshot válido;
- secuencia de eventos monotónica;
- actualización atómica de revisión;
- rechazo de revisión obsoleta;
- error ante snapshot corrupto/incompatible;
- cambio de prioridad persistido;
- movimiento a mitad de ruta persistido y reanudado;
- no regeneración tras recarga;
- rollback correcto ante fallo transaccional.

No reemplaces estas pruebas por mocks del repositorio. Los tests unitarios pueden usar adaptadores en memoria, pero debe existir una suite real contra PostgreSQL, ejecutable mediante script separado y documentado.

### 19.5 Mapa, cámara, niebla y navegación

- conversiones mundo ↔ pantalla reversibles dentro de tolerancia;
- zoom centrado en cursor;
- resize no altera posición de mundo;
- pan/zoom no revela niebla;
- movimiento sí revela según la regla;
- estado oculto/conocido/observable se conserva;
- obstáculos bloquean ruta;
- A* o algoritmo elegido devuelve ruta determinista;
- destino oculto o no transitable se rechaza con código correcto;
- movimiento depende de tiempo simulado, no frames;
- velocidad temporal cambia duración real, no trayectoria ni resultado;
- cancelación conserva una posición coherente;
- dos personas pueden moverse simultáneamente;
- guardar/cargar mantiene posición, ruta, destino y progreso.

### 19.6 Protocolo Worker

- acepta mensajes válidos y rechaza versiones/payloads inválidos;
- ordena comandos de manera causal;
- no filtra campos ocultos;
- emite proyecciones coherentes;
- recupera o informa adecuadamente errores;
- no importa Prisma, React o Next.js.

### 19.7 E2E mínimo

Automatiza, cuando el entorno lo permita:

1. abrir aplicación;
2. crear partida con semilla fija;
3. comprobar seis tarjetas;
4. pausar/reanudar y cambiar velocidad;
5. seleccionar persona;
6. emitir movimiento válido;
7. observar cambio operativo y progreso;
8. guardar;
9. recargar;
10. comprobar misma persona, hora, posición y orden;
11. cambiar prioridad y verificar persistencia;
12. comprobar que no aparece ninguna estrella o potencial numérico.

Si Playwright o PostgreSQL no pueden ejecutarse por una limitación real del entorno, deja la suite preparada, ejecuta todo lo posible y reporta exactamente el bloqueo. No marques la prueba como pasada ni sustituyas PostgreSQL por SQLite.

---

## 20. Validaciones de repositorio

Antes de entregar, ejecuta desde una instalación limpia o tan cercana como permita el entorno:

```text
npm install
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build
npm run test:e2e
git diff --check
```

Ajusta nombres si los scripts documentados son equivalentes. Informa comando, resultado y causa de cualquier omisión.

Comprueba además:

- no hay secretos ni `.env` real versionado;
- no hay binarios o artefactos de build añadidos;
- no hay imports cruzando fronteras prohibidas;
- no hay `Math.random` en dominio;
- no hay datos ocultos en las proyecciones cliente;
- no hay código, recursos ni fixtures copiados de Godot;
- el lockfile está actualizado;
- las migraciones Prisma están versionadas;
- README permite a otra persona arrancar sin conocimiento tribal;
- ningún documento exagera el alcance.

---

## 21. Guion de aceptación manual en navegador

Documenta este guion y ejecútalo si dispones de navegador. Dennis debe poder repetirlo:

### Preparación

1. Instalar dependencias.
2. Configurar `DATABASE_URL` a PostgreSQL local.
3. Aplicar migraciones.
4. Arrancar la aplicación con un único comando.

### Partida y reproducibilidad

5. Crear partida con semilla `web-001-acceptance`.
6. Anotar nombres, hora y aspecto básico del sector.
7. Crear otra partida con la misma semilla y comprobar identidad semántica.
8. Crear otra semilla y comprobar variación válida.

### Cohorte

9. Confirmar exactamente seis protagonistas.
10. Abrir cada ficha y comprobar identidad, estado, nueve características y 34 habilidades.
11. Ver niveles actuales 0–10.
12. Confirmar que no hay estrellas, techos, fracciones ni potencial numérico.
13. Confirmar la frase de evidencia insuficiente.
14. Consultar relaciones y acontecimiento compartido.
15. Cambiar una prioridad, guardar y verificarla tras recarga.

No es necesario —ni posible desde la UI— verificar qué persona ocupa cada plaza de calibre. Esa garantía pertenece a tests internos.

### Reloj y persistencia

16. Comprobar pausa, ×1, ×2, ×4 y ×10.
17. Verificar que pausa congela reloj y movimiento.
18. Guardar y observar los estados visible de guardado.
19. Recargar y comprobar que la hora no se ha adelantado por tiempo offline.

### Mapa y niebla

20. Desplazar cámara y hacer zoom alrededor del cursor.
21. Confirmar que la cámara no revela terreno.
22. Distinguir oculto, conocido y observable.
23. Centrar cámara en una persona.
24. Redimensionar ventana sin saltos de mundo o borrosidad grave.

### Movimiento

25. Seleccionar una persona y previsualizar un destino válido.
26. Dar la orden y observar ruta, fase, porcentaje y distancia.
27. Mover una segunda persona a la vez.
28. Pausar y confirmar que ambas se detienen sin perder orden.
29. Probar ×10 y confirmar que la ruta no cambia.
30. Cancelar una orden y revisar estado final.
31. Intentar un punto no transitable y leer la razón de rechazo.
32. Intentar un destino oculto y confirmar que no usa información omnisciente.
33. Guardar a mitad de ruta, recargar y comprobar continuidad exacta.
34. Llegar al destino y ver el evento y el nuevo terreno observado.

### Robustez

35. Simular temporalmente un fallo de guardado y confirmar que la UI no dice “guardado”.
36. Abrir la misma partida en dos pestañas, modificar una y comprobar el conflicto de revisión en la otra.
37. Revisar consola del navegador y terminal: sin errores propios en el recorrido normal.

---

## 22. Criterios de aceptación trazables

La entrega se acepta solo si se cumplen todos:

### Arquitectura

- [ ] Las cinco capas existen físicamente y sus dependencias son verificables.
- [ ] El núcleo es TypeScript puro.
- [ ] React no contiene reglas de simulación.
- [ ] Prisma solo aparece en persistencia/servidor.
- [ ] El Worker posee la sesión activa y se comunica mediante contratos validados.
- [ ] No se ha portado ni consultado Godot como fuente de código.

### Estado y persistencia

- [ ] PostgreSQL se usa desde el primer arranque real.
- [ ] Snapshot y eventos se escriben atómicamente.
- [ ] Existe versionado de estado y generador.
- [ ] Existe revisión optimista.
- [ ] Recargar no rerrollea el mundo.
- [ ] No existe progreso offline.
- [ ] El estado de guardado es visible y veraz.

### Tiempo

- [ ] Inicio en Día 1 · 17:30.
- [ ] Pausa, ×1, ×2, ×4 y ×10 funcionan.
- [ ] El día equivale a 20 minutos reales a ×1.
- [ ] El framerate no cambia resultados.

### Personas

- [ ] Hay exactamente seis adultos procedurales.
- [ ] Cumplen cobertura y diversidad.
- [ ] La garantía oculta de calibre siempre se cumple.
- [ ] La red de relaciones es válida.
- [ ] Cada persona interpreta el acontecimiento compartido.
- [ ] Se usan 9 características y 34 habilidades finales.
- [ ] Los niveles actuales 0–10 son visibles.
- [ ] El potencial numérico y estrellas nunca son visibles.
- [ ] Se usa la frase cualitativa canónica de evidencia insuficiente.
- [ ] Las 34 prioridades se editan y persisten sin fingir planificación automática.
- [ ] El estado operativo refleja honestamente solo espera y movimiento.

### Mapa y movimiento

- [ ] El Canvas presenta un sector de llegada procedural reproducible.
- [ ] Mundo y pantalla usan sistemas de coordenadas separados.
- [ ] Pan, zoom, resize y centrar funcionan.
- [ ] La niebla distingue oculto, conocido y observable.
- [ ] La cámara no descubre terreno.
- [ ] El movimiento sí puede descubrirlo.
- [ ] Las rutas respetan transitabilidad y conocimiento.
- [ ] Movimiento y progreso son deterministas.
- [ ] Cancelación y bloqueo son comprensibles.
- [ ] Guardar/cargar a mitad de ruta conserva continuidad.

### Honestidad de alcance

- [ ] No existen zombis decorativos, amenazas inertizadas ni combate falso.
- [ ] No decaen necesidades sin una forma de atenderlas.
- [ ] No se finge un sistema de objetos con contadores universales.
- [ ] No se llama “generador semántico completo” al fixture.
- [ ] No se marcan como implementados agricultura, transporte, entorno mutable, autonomía, relaciones dinámicas o narrativa.
- [ ] `STATUS.md`, roadmap y README coinciden con la realidad.

### Calidad

- [ ] Lint, tipos, pruebas y build pasan.
- [ ] Las migraciones parten de base vacía.
- [ ] El recorrido E2E crítico está cubierto o su bloqueo real está documentado.
- [ ] No hay secretos ni artefactos generados versionados.
- [ ] `git diff --check` pasa.

---

## 23. Orden de implementación recomendado

Este orden reduce retrabajo, pero no cambia el alcance final:

1. auditoría, lectura y registro de `DEC-0014`;
2. workspace, herramientas, scripts y contratos base;
3. catálogos versionados y pruebas de integridad;
4. estado `SimulationStateV1`, PRNG y generación de cohorte;
5. reloj/comandos/eventos y pruebas deterministas;
6. Prisma, migración, repositorios, snapshots/revisión y pruebas de integración;
7. protocolo y runtime Worker;
8. fixture espacial, geometría, navegación y niebla en núcleo;
9. órdenes y movimiento;
10. shell de Next.js y flujo de partidas;
11. ficha completa y prioridades;
12. Canvas, cámara, proyecciones y controles;
13. estados de guardado, errores y conflicto multitab;
14. E2E y guion manual;
15. reconciliación documental final;
16. validación completa desde limpio.

Mantén commits o checkpoints lógicos si el flujo de trabajo lo permite. No dejes la integración para el final: cada bloque debe consumir contratos reales del anterior.

---

## 24. Estándar de implementación

- Código y nombres técnicos en inglés coherente; interfaz y documentación para el jugador en español.
- Funciones pequeñas, tipos explícitos y errores de dominio discriminados.
- Sin `any` salvo frontera inevitable, localizada y justificada.
- Sin estados duplicados entre React, Worker y base; define autoridad de cada dato.
- Sin cálculos de reglas dentro de componentes.
- Sin números mágicos: constantes con nombre, unidad y procedencia.
- Sin comentarios que repitan el código; comenta decisiones y restricciones.
- Sin TODO para funcionalidades exigidas por este prompt.
- Sin sobrearquitectura de capacidades futuras que aún no tienen consumidor.
- Con puntos de extensión claros para trabajos, objetos, agricultura y mundo mutable, pero no interfaces vacías infinitas.
- Errores esperables del juego modelados como resultados, no excepciones genéricas.
- Errores técnicos con contexto suficiente y sin exponer secretos.
- Datos ocultos protegidos en la frontera de proyección, no solo mediante CSS.
- Semillas y versiones presentes en informes de error reproducibles.

---

## 25. Informe final obligatorio de Claude Code

Al terminar, responde con un informe breve pero completo, en este orden:

1. **Resultado**: qué puede hacer ya Dennis en el navegador.
2. **Arquitectura**: estructura final y decisiones técnicas clave.
3. **Personajes**: garantías implementadas y cómo se evita filtrar calibre/potencial.
4. **Mapa y movimiento**: fixture, niebla, navegación y límites actuales.
5. **Persistencia**: tablas, estrategia, revisión y conducta de recarga.
6. **Documentación**: documentos creados y actualizados.
7. **Validación**: cada comando ejecutado con resultado real.
8. **Prueba manual**: pasos efectivamente comprobados y los que Dennis debe repetir.
9. **Fuera de alcance**: recordatorio explícito del siguiente incremento, sin presentarlo como defecto accidental.
10. **Riesgos o bloqueos**: únicamente los reales, con evidencia.
11. **Confirmación antiport**: declaración explícita de que no se copió, adaptó ni usó código/datos/tests de Godot como fuente.

No cierres con “todo listo” si falló una prueba, no había PostgreSQL, no se ejecutó el navegador o queda un criterio incumplido. Distingue con precisión entre implementado, probado automáticamente, probado manualmente y preparado pero no ejecutado.

---

## 26. Definición del siguiente paso, sin implementarlo

Al cerrar WEB-001, el siguiente incremento será el primer bucle causal completo:

> explorar → descubrir → trabajar → recoger → transportar → cubrir una necesidad

La base de esta entrega debe permitir añadirlo sin cambiar de stack, rehacer personajes, sustituir el reloj, romper guardados inmediatamente ni abandonar el modelo espacial. Sin embargo, no adelantes ese bucle dentro de WEB-001.

La entrega actual termina cuando el mundo, los seis protagonistas, el tiempo, la persistencia, la niebla y el movimiento directo forman una base integrada, determinista, honesta y agradable de probar.
