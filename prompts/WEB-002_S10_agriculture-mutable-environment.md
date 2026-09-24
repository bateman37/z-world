# Prompt de implementación — WEB-002 · Subhito S10

## Entorno mutable inicial y ciclo agrícola jugable

Quiero que implementes por completo el **Subhito S10 de WEB-002** en el repositorio de Z-World.

Esta es una entrega de implementación real, no una propuesta, un prototipo aislado ni una ronda de documentación. Al terminar debe existir un bucle jugable y persistente que permita transformar una parte del entorno, preparar tierra físicamente adecuada, sembrar, cuidar, esperar mediante el reloj de simulación, cosechar y trasladar la producción usando los sistemas ya existentes.

S10 debe cerrarse con código, pruebas, persistencia, interfaz funcional, documentación y una única PR lista para revisión. **No empieces S11.**

---

## 0. Estado conocido y autoridad de esta entrega

- La PR de S7–S9 ya ha sido fusionada en `main`.
- El usuario ya ejecutó personalmente la aceptación manual de esa entrega. No vuelvas a pedirle que repita la aceptación de S7–S9 ni conviertas su deuda explícita en un bloqueo de S10.
- Antes de modificar nada, actualiza referencias remotas y confirma que tu base contiene el merge de S7–S9.
- Parte de `main` limpio y actualizado.
- Crea una sola rama:

  `feat/web-002-s10-agriculture-mutable-environment`

- No continúes una rama antigua de WEB-002.
- No reescribas historial compartido, no hagas force-push y no fusiones la PR.
- Abre **una única PR contra `main`** cuando todas las puertas de aceptación de S10 estén cerradas.

Si la rama ya existe porque estás retomando una sesión anterior, comprueba primero su relación exacta con `origin/main`, el árbol de trabajo y los commits existentes. Continúa sobre ella sin duplicar trabajo.

### Fuentes canónicas que debes leer antes de diseñar

Lee completas, no solo mediante búsquedas parciales, las secciones y documentos relevantes:

1. `prompts/WEB-002_jobs-needs-semantic-world-exploitation.md`, especialmente sus apartados de:
   - entorno mutable y construcción espacial;
   - agricultura básica;
   - pruebas y criterios de aceptación;
   - alcance máximo y exclusiones.
2. `docs/20-world/WLD-010_mutable-terrain-and-spatial-construction.md`.
3. `docs/40-settlement/SET-011_initial-agriculture-loop.md`.
4. `docs/STATUS.md`.
5. `CHANGELOG.md`.
6. `docs/decisions/DEC-0019*` y las decisiones previas que gobiernen estado V2, trabajos, necesidades, generación, logística, objetos, navegación y explotación.
7. `docs/discovery/DISC-0008_web-002-implementation-traceability.md`, si mantiene la deuda y los descubrimientos activos de WEB-002.
8. Los contratos, motores, pruebas y UI fusionados de S1–S9. En particular, localiza y comprende antes de extender:
   - `SimulationStateV2` y su persistencia/migraciones;
   - `agriculture-v2.ts`;
   - entidades espaciales: `TerrainArea`, `LinearFeature`, `Anchor`, `BarrierSegment` y `PerimeterNetwork`;
   - catálogo de métodos y motor de resolución/avance de trabajos;
   - designaciones, prioridades, reservas y planificador;
   - logística, transporte, puntos de transferencia y almacenamiento;
   - objetos, recursos, herramientas, contenedores y procedencia;
   - explotación de edificios y accesos;
   - navegación e invalidación dirigida;
   - reloj, velocidades, pausa y persistencia;
   - visor Canvas y paneles operativos existentes;
   - pruebas unitarias, PostgreSQL real y Playwright existentes.

La documentación de producto manda sobre este prompt si detectas una contradicción real. Si hay una ambigüedad no resuelta, toma la decisión mínima que preserve el horizonte documentado, regístrala en la decisión de arquitectura de S10 y continúa. No detengas el trabajo por preguntas que puedas resolver examinando el repositorio.

---

## 1. Objetivo jugable de S10

Al terminar, desde una partida WEB-002 válida, el jugador debe poder completar sin trampas internas este recorrido:

1. Explorar o conocer una zona del mapa.
2. Seleccionar terreno real, no una ranura agrícola prefijada.
3. Evaluar si una superficie es físicamente apta para la transformación pretendida.
4. Designar y ejecutar una limpieza de vegetación o escombros con progreso real.
5. Ver persistir el cambio espacial y, cuando corresponda, los productos retirados localizados en el mundo.
6. Preparar parcialmente un terreno cultivable, interrumpirlo y reanudarlo sin perder progreso válido.
7. Llevar hasta allí semillas, herramienta y, cuando sea necesario, agua mediante S8.
8. Sembrar consumiendo semillas localizadas.
9. Cuidar o regar el cultivo mediante trabajos reales.
10. Observar que el crecimiento depende exclusivamente del tiempo simulado y de su estado, incluidas pausa y velocidad ×10.
11. Llegar a una cosecha cuyo rendimiento derive de condiciones causales documentadas.
12. Crear la producción físicamente en el campo o en un contenedor presente, nunca teletransportarla al almacén.
13. Recoger, transportar y almacenar esa cosecha con el motor logístico existente.
14. Ver la nueva comida reflejada en el inventario/asignación de recursos que alimenta el sistema de necesidades existente.

Además, el mismo sistema de transformación debe permitir demostrar de extremo a extremo:

- limpiar un tramo de carretera obstruido conservando su función de carretera;
- retirar la función de carretera de otro tramo y observar el cambio persistente en ruta o coste de navegación;
- construir una barrera lineal sencilla entre anclajes válidos;
- resolver explícitamente cómo cruza esa barrera una vía;
- derivar la continuidad o los huecos de un perímetro desde su geometría física, sin declarar seguridad por una simple bandera.

El resultado debe sentirse como la primera capa de un mundo transformable, no como un minijuego agrícola separado.

---

## 2. Principios no negociables

### 2.1 Un solo mundo, un solo motor

No crees motores paralelos para agricultura, desbroce, carreteras o barreras. Todas las actividades deben utilizar, según corresponda:

- el mismo estado autoritativo;
- la misma gramática de acciones/métodos;
- el mismo motor de trabajos y avance temporal;
- las mismas prioridades y designaciones;
- las mismas reservas de personas, herramientas, objetos y lotes;
- la misma logística y localización física;
- las mismas reglas de capacidad, habilidad, estado, herramienta, situación y azar ya cerradas;
- el mismo sistema de eventos, causalidad y persistencia.

No introduzcas una barra de progreso agrícola especial que ignore trabajos, tiempos, participantes, herramientas o interrupciones.

### 2.2 Libertad física, no ranuras autorizadas

Una parcela de cultivo se crea sobre **cualquier superficie físicamente válida**. No puede depender de “casillas de granja”, edificios preautorizados ni puntos de construcción únicos generados por el escenario.

El generador puede señalar candidatos o suelos recomendables para que la primera partida sea legible, pero esas sugerencias no son permisos exclusivos. La validez se deriva del estado real del terreno.

### 2.3 Transformaciones persistentes y causales

Cada transformación debe:

- tener un objetivo espacial inequívoco;
- validar requisitos antes de empezar y al reanudar;
- acumular progreso persistente cuando tenga sentido;
- admitir interrupción y sustitución de trabajadores;
- consumir tiempo, materiales o recursos cuando corresponda;
- producir consecuencias y objetos localizados;
- cambiar solo las capas afectadas;
- emitir eventos explicables;
- sobrevivir a guardado, recarga y conflicto de versión.

No sustituyas el estado real con texto decorativo o flags de UI sin efecto sistémico.

### 2.4 Sin omnisciencia

El jugador solo puede designar con precisión aquello que conoce suficientemente. La interfaz puede mostrar que existe una zona desconocida, pero no debe revelar composición del suelo, obstáculos ocultos, cosecha exacta o rendimiento futuro no observado.

### 2.5 Sin porcentajes ni dados en la presentación

Mantén el criterio del núcleo de simulación: la UI explica aptitud, avance, problemas y resultado con estados cualitativos y causas concretas. No muestra porcentajes de éxito ni tiradas.

### 2.6 Determinismo y tiempo simulado

- Ningún resultado depende de `Math.random`, `Date.now`, UUID aleatorio u hora de pared.
- Usa las primitivas deterministas/versionadas existentes.
- Pausar congela crecimiento, deterioro relacionado y trabajos.
- ×10 acelera exactamente el tiempo de simulación; no usa temporizadores especiales de agricultura.
- Guardar y recargar no cambia resultados futuros con el mismo estado y las mismas órdenes.

---

## 3. Modelo espacial y capas del terreno

Extiende el modelo existente sin reemplazarlo. La solución debe representar de forma separada, como mínimo:

1. **Terreno base**: naturaleza física relativamente estable de la superficie.
2. **Cobertura**: vegetación, matorral, escombros u otros elementos removibles.
3. **Elementos existentes**: vías, agua, edificios, árboles reconocidos, obstáculos y estructuras.
4. **Uso actual**: sin uso, zona de trabajo, parcela agrícola, vía funcional, perímetro, etc.
5. **Transformaciones persistentes**: qué cambió, dónde, cuándo y por qué trabajo.
6. **Condición real**: transitabilidad, preparación, drenaje, obstrucción, integridad y demás propiedades relevantes.
7. **Conocimiento**: qué ha observado o inspeccionado el grupo y con qué precisión.

Respeta las primitivas espaciales canónicas:

- **nodo** para anclajes, puertas, portones, extremos o puntos singulares;
- **línea** para vías, barreras y trazados;
- **área** para terrenos, coberturas, designaciones y parcelas;
- **estructura** para edificios y construcciones con identidad propia.

No conviertas todo en rectángulos de UI ni en una cuadrícula oculta si el modelo actual usa geometría continua. Reutiliza las utilidades geométricas existentes y añade solo las operaciones robustas necesarias.

### 3.1 Aptitud física

Implementa una evaluación común y explicable de aptitud por método. Debe poder considerar, según la acción:

- pendiente o relieve disponible en el modelo actual;
- tipo de superficie o suelo y presencia de roca;
- humedad y drenaje cuando estén representados;
- cobertura y obstáculos;
- espacio, forma mínima y colisiones;
- acceso físico de personas, herramientas y carga;
- estabilidad y anclajes;
- conocimiento disponible;
- herramientas, materiales, mano de obra y tiempo;
- necesidad futura de mantenimiento.

No inventes precisión que los datos actuales no sostienen. Cuando una dimensión aún no esté modelada, usa una aproximación explícita, determinista y conservadora; documéntala y deja el contrato preparado para ampliarla.

La evaluación debe devolver razones estructuradas, no solo `true/false`, y clasificarlas al menos como:

- válida;
- válida con limitaciones o preparación previa;
- desconocida por falta de observación;
- bloqueada físicamente;
- bloqueada por falta de acceso;
- bloqueada por requisitos de trabajo/herramienta/material.

No confundas una incompatibilidad física permanente con una carencia logística temporal.

### 3.2 Compatibilidad y migración

El contrato agrícola actual es un esqueleto y puede evolucionar, pero debes conservar la carga de snapshots producidos por S1–S9.

- Inspecciona el mecanismo vigente de versión y migración antes de elegir estrategia.
- Si una extensión aditiva con valores derivados/por defecto mantiene invariantes fuertes, úsala.
- Si hace falta una nueva versión de estado, impleméntala y migra de forma determinista; no la introduzcas solo por estética.
- Toda pérdida o degradación de información durante una migración debe registrarse explícitamente, nunca en silencio.
- Valida Zod y también invariantes relacionales tras migrar y tras recargar desde PostgreSQL.
- No alteres ni sobrescribas destructivamente snapshots históricos vigentes.

---

## 4. Puerta A — Entorno mutable inicial

Esta puerta debe quedar completa antes de considerar cerrado S10.

### 4.1 Gramática común de transformación

Añade o completa métodos reales para las operaciones iniciales, usando los nombres del catálogo vigente y evitando duplicados semánticos:

- observar o inspeccionar aptitud del terreno;
- despejar vegetación baja;
- cortar o retirar vegetación reconocida;
- retirar escombros ligeros;
- preparar suelo;
- despejar una vía obstruida;
- retirar la función de una vía;
- construir una barrera lineal sencilla.

Cada método debe definir de forma versionada:

- objetivos espaciales admitidos;
- conocimiento mínimo;
- requisitos duros y alternativas permitidas;
- herramientas y materiales;
- participantes y cooperación aplicable;
- fases del trabajo;
- unidad de progreso y duración;
- reservas necesarias;
- consumo y productos;
- cambios de capas espaciales;
- ruido/esfuerzo/riesgo aunque todavía no exista quien reaccione al ruido;
- invalidaciones derivadas;
- eventos de inicio, interrupción, reanudación, bloqueo, finalización y fallo relevante.

No introduzcas un material universal ni rendimientos arbitrarios desconectados del objetivo.

### 4.2 Limpiar vegetación y escombros

El jugador debe poder dibujar o seleccionar un área válida, confirmarla y crear una designación ejecutable.

Al completarse:

- cambia la cobertura solo en la superficie realmente trabajada;
- la transitabilidad o coste local se actualiza cuando corresponda;
- los restos aprovechables se materializan como objetos o lotes de recursos con procedencia;
- esos productos permanecen en la zona de trabajo o en un contenedor físicamente presente;
- la masa o cantidad producida debe ser causal y conservar las reglas del sistema de objetos;
- la limpieza parcial sobrevive a interrupción/recarga;
- el área no aparece mágicamente terminada si una parte no se trabajó.

Cortar vegetación reconocida y retirar escombros pueden compartir infraestructura, pero deben conservar requisitos, productos y consecuencias distintos.

### 4.3 Carreteras: despejar no es destruir

Implementa y prueba la diferencia semántica entre:

1. **Vía obstruida/degradada**: conserva identidad de vía, pero restringe o encarece el paso.
2. **Vía despejada**: recupera su ventaja de circulación sin cambiar su función.
3. **Función retirada**: deja de actuar como vía; la superficie pasa a terreno despejado coherente con su base y navegación.

Retirar la función debe ser una acción deliberada, confirmada si es irreversible con los sistemas actuales, y nunca el efecto accidental de limpiar.

Tras cualquiera de estos cambios:

- invalida únicamente las rutas o cachés afectadas;
- recalcula accesibilidad y costes pertinentes;
- no reconstruyas todo el mundo si existe invalidación dirigida;
- las órdenes dependientes deben revalidarse y quedar bloqueadas con causa si pierden acceso;
- guardado y recarga deben conservar el resultado exacto.

### 4.4 Barreras entre anclajes

Permite trazar una barrera lineal sencilla entre anclajes físicamente válidos. Como mínimo pueden servir de anclaje, si el modelo ya los soporta:

- esquina, punto o muro adecuado de un edificio;
- poste construido;
- extremo de otra barrera;
- puerta, portón o control de acceso;
- elemento natural admitido expresamente por el método.

La construcción debe:

- previsualizar el trazado;
- detectar colisiones e intersecciones relevantes;
- comprobar acceso de trabajo a lo largo del trazado;
- requerir y transportar materiales reales;
- permitir avance parcial por segmentos;
- mantener procedencia y consumo de materiales;
- producir geometría autoritativa, no solo una línea dibujada;
- afectar navegación cuando el tramo correspondiente sea físicamente efectivo;
- soportar interrupción, reanudación y recarga.

Una barrera incompleta no puede cerrar un perímetro por anticipado.

### 4.5 Cruce de una vía

Cuando el trazado cruce una carretera o camino, exige una decisión explícita compatible con las opciones activas del contrato:

- bloqueo completo;
- hueco peatonal;
- portón o paso apto para carretilla/carro de mano.

No actives todavía puertas para vehículos, animales u otras modalidades futuras si no están dentro del catálogo implementado.

La elección debe tener consecuencias reales sobre:

- quién puede cruzar;
- qué métodos de transporte pueden cruzar;
- ruta y coste;
- estado abierto/cerrado si el elemento elegido lo admite;
- continuidad topológica del perímetro.

El caso obligatorio de aceptación es demostrar que un carro o carretilla no atraviesa un hueco exclusivamente peatonal, pero sí un paso compatible abierto; el transporte manual puede usar el hueco peatonal si las demás condiciones lo permiten.

### 4.6 Perímetros derivados, no declarados

La continuidad de un perímetro se deriva de la topología efectiva de:

- edificios;
- muros y barreras;
- vallas;
- puertas y portones;
- otros cierres físicos compatibles.

Un perímetro solo está cerrado si existe un lazo físico continuo. Debe abrirse inmediatamente, con invalidación dirigida, si:

- un portón relevante queda abierto;
- se rompe o retira un segmento;
- se demuele un anclaje;
- cambia un acceso de modo que aparece un hueco.

No conviertas `PerimeterNetwork.closed` en una verdad editable independiente. Si el campo existe, debe ser resultado derivado/verificable.

La UI debe distinguir expresamente:

- perímetro abierto o cerrado;
- puntos de acceso;
- huecos conocidos;
- tramos incompletos;

sin afirmar que “cerrado” equivale a seguro, limpio, vigilado o inexpugnable. Las amenazas siguen fuera de S10.

### 4.7 Qué no entra en esta puerta

Documenta como horizonte, pero no implementes ahora:

- terraformación general mediante relleno, arena o excavación;
- nivelación de pendientes;
- escaleras, rampas, terrazas o muros de contención;
- redes libres completas de carreteras, electricidad, tuberías o saneamiento;
- extracción profunda por capas de una carretera;
- construcción libre de edificios, graneros o casas;
- editor arquitectónico o de interiores;
- formas arbitrarias complejas de edificios;
- defensas avanzadas o simulación de asedio.

El modelo no debe cerrar la puerta a ese horizonte.

---

## 5. Puerta B — Ciclo agrícola inicial completo

Esta puerta debe usar la infraestructura de la Puerta A; no puede apoyarse en excepciones o scripts de escenario.

### 5.1 Parcela agrícola espacial

Una parcela es un área persistente trazada sobre terreno apto, con geometría y relación espacial inequívocas. Debe poder solaparse conceptualmente con un área de terreno, pero no con superficies físicamente incompatibles.

Implementa validaciones para impedir, como mínimo:

- geometría degenerada o fuera del mapa;
- solape inválido con edificios, agua profunda, barreras u otras parcelas activas;
- acceso imposible conocido;
- superficie no despejada cuando el método exige despejar;
- condiciones físicas incompatibles que no puedan corregirse en S10.

La selección puede aceptar un área parcialmente válida, pero debe recortarla de forma transparente o exigir que el jugador corrija el trazado. Nunca debe modificar silenciosamente una zona distinta de la elegida.

### 5.2 Máquina de estados y progreso

Implementa la cadena canónica:

`sin preparar → despejada → preparada → sembrada → creciendo → cosechable → cosechada`

La máquina debe soportar:

- progreso parcial dentro de limpiar y preparar;
- interrupción y reanudación;
- sustitución de trabajadores;
- pérdida de requisitos durante una fase;
- cuidado suficiente o insuficiente;
- daño, abandono o pérdida cuando sean consecuencias ya modelables;
- reinicio coherente hacia nueva preparación, mantenimiento o siembra tras cosechar.

No reduzcas todo el cultivo a un único número opaco. Conserva hitos, trabajos y causas. Si mantienes un progreso numérico interno, la UI debe presentarlo mediante estado, avance cualitativo, trabajo restante comprensible y bloqueos concretos.

### 5.3 Catálogo mínimo de cultivos

Implementa un catálogo versionado pequeño y profundo, no un catálogo masivo superficial.

Incluye solo los cultivos necesarios para demostrar diferencias causales razonables en el escenario actual. Uno puede bastar si cubre realmente el bucle completo; dos son preferibles solo si aportan una diferencia funcional comprobable y no duplican contenido.

Cada perfil debe definir, como mínimo:

- identificador estable;
- recurso de semilla compatible;
- producto de cosecha;
- superficie o condiciones admitidas;
- esfuerzo de preparación;
- necesidades de agua/cuidado dentro del alcance disponible;
- duración por tiempo simulado;
- umbrales de estado;
- rendimiento base causal y modificadores admitidos;
- herramientas o método de cosecha;
- productos secundarios si existen y se conservan físicamente.

No implementes todavía estaciones, calendario anual realista, rotación, fertilidad profunda, plagas, fertilizantes, preservación avanzada de semillas ni un catálogo enciclopédico.

### 5.4 Semillas, herramientas y agua son físicas

- Sembrar consume un lote de semillas localizado y reservado.
- La cantidad sembrada debe corresponder de forma causal con el área efectivamente sembrada.
- Las herramientas deben llegar al lugar y quedar reservadas/ocupadas según las reglas existentes.
- Si el cultivo requiere riego, el agua debe proceder de recursos reales y ser transportada o estar accesible desde una fuente funcional.
- La bomba manual de S7/S9 puede participar si su estado y conexión lo permiten, pero S10 no debe reabrir su deuda ajena ni convertirla en una fuente infinita.
- No descuentas recursos globales abstractos ni teletransportas suministros desde el refugio.

Si una herramienta se rompe, un acceso cambia o el recurso reservado desaparece legítimamente, el trabajo debe bloquearse o replantearse con una causa visible.

### 5.5 Siembra, cuidado y crecimiento

La siembra debe ser un trabajo real por área, admitir progreso parcial y consumir semillas en proporción a lo completado sin duplicación al cancelar o recargar.

El crecimiento:

- comienza únicamente tras una siembra válida;
- deriva del reloj autoritativo de simulación;
- no avanza en pausa;
- avanza correctamente a ×1 y ×10;
- produce los mismos resultados al avanzar el mismo tiempo mediante distintos tamaños de tick;
- no depende de tener abierta la pantalla de la parcela;
- conserva el estado exacto al guardar y recargar;
- no puede resolver la necesidad alimentaria de la primera noche.

El cuidado o riego debe crear consecuencias reales y explicables. No hace falta una agronomía exhaustiva, pero sí diferenciar al menos entre cuidado suficiente, insuficiente y ausencia grave cuando el perfil lo requiera.

Evita castigos sorpresa sin señal previa. La UI debe mostrar necesidades conocidas del cultivo y por qué un ciclo está sano, limitado, detenido o en riesgo.

### 5.6 Rendimiento causal

El rendimiento final debe derivarse, en una fórmula versionada y probada, de las dimensiones que S10 conozca realmente. Como mínimo evalúa:

- aptitud del terreno;
- grado y calidad de preparación;
- semillas efectivamente consumidas;
- superficie sembrada;
- capacidad y habilidad de los participantes cuando corresponda;
- herramienta y método;
- disponibilidad de agua y cuidado;
- daño o abandono acumulado;
- capacidad real de cosechar lo producido.

No uses una tirada desnuda ni un porcentaje mostrado al jugador. La variación determinista, si existe, debe ser secundaria frente a estas causas y usar el RNG/versionado oficial.

Registra en el evento de cosecha un desglose causal suficiente para depuración y explicación, sin llenar la interfaz ordinaria de números internos.

### 5.7 Cosecha localizada y logística

Al cosechar:

- crea lotes de producto con cantidad, masa, volumen, calidad/estado aplicable, procedencia y ubicación válidas;
- sitúalos sobre la parcela o en un contenedor compatible que esté físicamente presente y tenga capacidad;
- si el contenedor se llena, deja el resto de forma válida o bloquea la porción correspondiente; no destruyas ni teletransportes excedente;
- reutiliza `collect`, almacenamiento, reservas, porte manual, recipiente, porte coordinado, carretilla y carro según admita cada carga;
- respeta puntos de transferencia y accesos construidos;
- permite llevar la cosecha al almacén y recuperarla después;
- integra el alimento resultante con los recursos que el sistema de necesidades puede asignar o consumir.

La cosecha no cuenta como “guardada” hasta completar el transporte y almacenamiento.

### 5.8 Fracaso y recuperación

Cubre explícitamente:

- parcela parcialmente preparada;
- trabajo cancelado y retomado;
- falta temporal de semillas;
- falta de agua o herramienta;
- trabajador sustituido;
- ruta invalidada durante una tarea;
- cultivo descuidado;
- parcela conocida pero inaccesible;
- contenedor de cosecha sin capacidad;
- guardado y recarga en cada fase crítica.

Los bloqueos recuperables no deben destruir el trabajo ni el cultivo. Los fallos irreversibles deben requerir una causa real y emitir un evento claro.

---

## 6. Integración con trabajos, prioridades y designaciones

No basta con botones que muten directamente el estado.

### 6.1 Acciones contextuales

Cada selección de mapa debe mostrar solo las posibilidades válidas para ese lugar y conocimiento:

- terreno: observar, inspeccionar, despejar, preparar, delimitar parcela;
- cobertura vegetal: reconocer, cortar o despejar según corresponda;
- carretera: despejar obstrucción o retirar función;
- anclajes: iniciar o prolongar barrera;
- parcela: preparar, llevar recursos, sembrar, cuidar/regar, cosechar;
- productos: recoger, cargar, transportar y almacenar.

Una acción no disponible debe ocultarse o mostrarse deshabilitada con causa, siguiendo el patrón ya establecido. No presentes el catálogo entero en todos los lugares.

### 6.2 Designaciones de área y línea

Completa las designaciones ya previstas para que sean ejecutables, persistentes y cancelables:

- limpiar/despejar área;
- cortar vegetación;
- preparar suelo;
- sembrar o cosechar una parcela;
- despejar vía;
- construir barrera.

Las designaciones deben generar trabajos mediante el planificador existente. No deben ejecutar transformaciones instantáneas al confirmar el dibujo.

### 6.3 Prioridades

Conecta cada trabajo con la prioridad canónica correspondiente, reutilizando las existentes, por ejemplo agricultura, tala/obtención, construcción/fortificación, mantenimiento y logística según el catálogo real.

No inventes una prioridad por cada verbo. El planificador debe poder:

- elegir una persona elegible;
- reservar recursos y herramientas;
- encadenar abastecimiento y ejecución;
- usar ayudantes cuando el método lo admita;
- suspenderse por necesidades críticas conforme a las reglas ya cerradas;
- reanudar trabajo parcial;
- evitar que dos trabajos consuman la misma semilla, herramienta o superficie.

### 6.4 Dependencias y cadenas

Una orden agrícola puede generar una cadena visible, por ejemplo:

`despejar → transportar herramienta → preparar → transportar semillas → sembrar`

No hace falta automatizar toda la cadena con autonomía avanzada, pero sí representar dependencias de forma que el jugador pueda entender qué falta y que el sistema no ejecute fases imposibles fuera de orden.

---

## 7. Interfaz funcional de S10

No hagas todavía el gran pase artístico o visual. Sí entrega una interfaz clara, usable y comprobable sobre el Canvas actual.

### 7.1 Herramientas espaciales mínimas

Implementa la interacción necesaria para:

- seleccionar un área de terreno;
- dibujar/ajustar una designación de área sencilla;
- elegir dos anclajes y previsualizar una línea de barrera;
- visualizar intersecciones con vías;
- elegir el tratamiento del cruce;
- confirmar o cancelar antes de crear la designación;
- distinguir zona válida, condicionada, desconocida y bloqueada;
- inspeccionar una parcela o transformación persistente.

Puedes limitar la edición a una geometría sencilla y robusta —por ejemplo, polígono convexo o trazado lineal entre anclajes— si lo documentas. No conviertas este subhito en una herramienta CAD.

### 7.2 Lectura visual mínima

El mapa debe diferenciar de manera sobria pero inequívoca:

- cobertura sin limpiar y limpiada;
- suelo preparado;
- parcela sembrada, creciendo, cosechable y cosechada;
- vía obstruida, despejada y sin función;
- barrera planificada, parcial y terminada;
- portón/paso y su compatibilidad;
- perímetro abierto/cerrado y huecos conocidos;
- productos cosechados o retirados que siguen en el terreno.

Usa formas, patrones o iconografía además de color cuando sea razonable. Mantén etiquetas y leyenda suficientes para que la aceptación no dependa de adivinar colores.

### 7.3 Panel operativo

Al seleccionar una parcela muestra, sin revelar números ocultos innecesarios:

- estado actual;
- cultivo, si lo hay;
- tamaño aproximado y aptitud conocida;
- preparación pendiente;
- semillas/herramientas/agua requeridas y su disponibilidad/localización conocida;
- cuidado conocido;
- avance cualitativo y siguiente hito;
- trabajo activo, participantes y bloqueos;
- cosecha disponible y ubicación cuando proceda.

El tiempo restante puede expresarse de forma aproximada coherente con el conocimiento del grupo. No muestres la cantidad final exacta antes de que sea razonablemente conocida.

### 7.4 Accesibilidad y feedback

- Todos los controles deben tener nombre accesible y foco visible.
- Las acciones irreversibles, especialmente retirar la función de una vía, requieren confirmación clara.
- Errores de geometría o requisitos deben aparecer junto a la acción, no solo en consola.
- Las mutaciones deben impedir dobles envíos y reflejar conflicto de versión/pestaña siguiendo el patrón existente.
- La UI debe seguir siendo operable en el viewport que ya cubren los E2E.

---

## 8. Persistencia, concurrencia e invariantes

### 8.1 Persistencia autoritativa

Todo lo siguiente debe sobrevivir a recarga desde PostgreSQL real:

- geometría de designaciones, parcelas, barreras y transformaciones;
- estado y progreso parcial de trabajos;
- reservas;
- semillas, agua, herramientas, materiales y cosechas localizadas;
- estado de vías;
- segmentos construidos y cruces;
- topología derivada del perímetro;
- estado, tiempo y cuidado de cada ciclo agrícola;
- eventos y procedencia necesarios para auditoría.

Mantén el control de concurrencia optimista existente. Una pestaña obsoleta no puede duplicar semillas, cosecha, materiales o progreso.

### 8.2 Invariantes mínimas

Añade validación relacional para impedir, al menos:

- parcelas con geometría inválida o sin terreno asociado;
- ciclos activos huérfanos o más de un ciclo activo incompatible por parcela;
- estados agrícolas imposibles respecto al ciclo;
- semillas consumidas dos veces;
- producción sin ubicación única;
- superficie activa asignada simultáneamente a parcelas incompatibles;
- progreso fuera de rango o no monotónico salvo transición explícita;
- transformaciones que referencian áreas/líneas inexistentes;
- barreras sin anclajes válidos;
- cruces de vía sin modo cuando el trazado realmente la cruza;
- perímetro marcado cerrado sin lazo físico válido;
- rutas o trabajos que conserven dependencias invalidadas sin bloquearse/replanificarse;
- recursos negativos o creación de masa no justificada;
- avance agrícola mientras la simulación está pausada.

Prueba también que las invariantes no rechazan estados anteriores válidos migrados.

### 8.3 Idempotencia

Reintentar una mutación tras fallo de red o conflicto no puede:

- consumir de nuevo semillas o materiales;
- duplicar productos;
- completar dos veces un segmento;
- aplicar dos veces la misma transformación;
- cosechar dos veces el mismo ciclo.

Usa los mecanismos de comando/evento/idempotencia ya existentes en lugar de añadir una segunda solución.

---

## 9. Rendimiento y robustez

No optimices prematuramente, pero evita algoritmos evidentemente globales para cambios locales.

- Indexa o acota consultas espaciales con las utilidades existentes.
- Una pequeña transformación no debe recalcular toda la generación semántica.
- Invalida navegación, perímetros y trabajos de forma dirigida.
- El crecimiento de cultivos no debe requerir un temporizador por planta o por celda.
- Procesa hitos temporales de manera determinista y agregada.
- Evita renders completos del Canvas por cambios no espaciales si la arquitectura permite actualización selectiva.

Añade pruebas de regresión razonables para lotes, áreas y ticks grandes sin convertir S10 en un proyecto de optimización general.

---

## 10. Pruebas obligatorias

No cierres S10 con mocks que omitan el motor real. Sigue las convenciones del repositorio y conserva todas las suites anteriores.

### 10.1 Unitarias

Cubre como mínimo:

- validación geométrica y aptitud con razones;
- evaluación de áreas válidas, condicionadas, desconocidas y bloqueadas;
- progreso parcial/interrupción/reanudación de cada transformación inicial;
- productos causales de vegetación/escombros y conservación de cantidades;
- transición de vía obstruida → despejada;
- transición deliberada a función retirada;
- cambio de coste/ruta tras mutar vía;
- anclajes, segmentos, intersección con vías y modos de cruce;
- compatibilidad peatonal frente a carretilla/carro;
- derivación de perímetro cerrado y apertura por hueco/portón/segmento/anclaje;
- máquina de estados agrícola completa;
- consumo proporcional e idempotente de semillas;
- crecimiento por tiempo simulado, pausa, ×1/×10 y diferentes tamaños de tick;
- cuidado/agua y rendimiento causal;
- cosecha localizada y capacidad de contenedor;
- migración/compatibilidad con estados anteriores;
- invariantes relacionales y casos negativos;
- RNG determinista, si se usa, sin fuentes de entropía prohibidas.

### 10.2 Integración con PostgreSQL real

Añade pruebas reales, no solo repositorios en memoria, para:

1. Guardar y recargar una limpieza parcial y después completarla.
2. Persistir una vía despejada y otra con función retirada, verificando navegación tras recarga.
3. Persistir barrera, cruce de vía y perímetro derivado.
4. Guardar durante preparación, siembra, crecimiento y estado cosechable.
5. Avanzar tiempo, recargar y comprobar el mismo estado determinista.
6. Cosechar, transportar/almacenar y recuperar el lote sin duplicación.
7. Provocar conflicto optimista entre dos clientes sobre semillas, cosecha o materiales y confirmar que uno falla limpiamente.
8. Cargar al menos un snapshot anterior a S10 y migrarlo sin regresión.

### 10.3 E2E en Chromium real

Incluye recorridos estables que utilicen la UI real y no muten la base de datos por atajos:

#### E2E A — Transformación agrícola completa

- crear/cargar partida determinista;
- descubrir o seleccionar terreno adecuado;
- delimitar y confirmar el área;
- despejar y preparar mediante trabajos;
- verificar progreso parcial y reanudación;
- llevar semillas/herramienta/agua;
- sembrar;
- pausar y demostrar que no crece;
- usar ×10 y alcanzar los hitos previstos;
- cuidar o regar;
- cosechar;
- trasladar la producción a almacenamiento;
- recargar página y comprobar persistencia y disponibilidad del alimento.

#### E2E B — Carretera mutable

- partir de una vía obstruida;
- registrar ruta o coste relevante;
- despejarla y observar mejora conservando función;
- retirar la función en otro tramo con confirmación;
- observar el cambio de ruta/coste;
- recargar y confirmar ambos estados.

#### E2E C — Barrera y perímetro

- seleccionar anclajes;
- trazar barrera que cruce una vía;
- elegir hueco peatonal o portón compatible;
- aportar materiales y completar el trabajo;
- confirmar compatibilidad de paso manual frente a carretilla/carro;
- cerrar un lazo y observar perímetro cerrado;
- abrir portón o retirar/romper un tramo y observar el hueco y perímetro abierto;
- recargar y confirmar topología.

Los tiempos agrícolas de la fixture E2E pueden estar ajustados para una prueba razonable, pero deben usar el mismo motor y un perfil versionado explícito. No añadas un botón o ruta de “crecer ahora”. El cultivo tampoco puede madurar durante la primera noche en la configuración jugable normal.

### 10.4 Regresión completa

Ejecuta desde limpio, usando los comandos canónicos del repositorio:

- typecheck de todos los workspaces;
- lint;
- todas las unitarias;
- integración completa contra PostgreSQL real;
- build de producción;
- toda la suite E2E en Chromium real.

No rebajes, saltes ni marques como flaky pruebas existentes para conseguir verde. Si una prueba histórica ya no corresponde por una decisión legítima, actualízala con justificación concreta en la PR.

---

## 11. Guion manual de aceptación de S10

Entrega en la PR y en la documentación de estado un guion manual breve pero completo, con semilla e identificadores reproducibles. Debe poder ejecutarse sin herramientas de desarrollo y cubrir:

1. Abrir una partida y localizar una zona candidata.
2. Inspeccionarla y leer aptitud/restricciones.
3. Dibujar una zona parcialmente inválida y comprobar el feedback.
4. Corregirla y designar limpieza.
5. Avanzar hasta progreso parcial, interrumpir, recargar y reanudar.
6. Ver productos retirados localizados.
7. Preparar la parcela.
8. Intentar sembrar sin semillas presentes y ver el bloqueo.
9. Transportar semillas y herramienta; sembrar consumiendo la cantidad correcta.
10. Pausar y confirmar ausencia de crecimiento.
11. Avanzar a ×10, cuidar/regar y llegar a cosechable.
12. Cosechar en el campo o contenedor local.
13. Transportar y almacenar la cosecha; comprobar que ya puede abastecer necesidades.
14. Despejar una vía obstruida sin eliminar su función.
15. Retirar la función de otra vía y observar navegación distinta.
16. Trazar una barrera entre anclajes cruzando una vía y elegir el tipo de paso.
17. Verificar el paso permitido/prohibido por modalidad de transporte.
18. Cerrar un perímetro y volverlo a abrir mediante un acceso o hueco.
19. Guardar/recargar y verificar que todo persiste.

El usuario ya realizó las pruebas manuales de S7–S9; este guion es únicamente para las capacidades nuevas de S10 y sus integraciones directas.

---

## 12. Documentación obligatoria

### 12.1 Decisión de arquitectura

Crea `DEC-0020` —o el siguiente número libre si ya estuviera ocupado— con un título equivalente a:

**Entorno mutable y ciclo agrícola inicial de WEB-002 S10**

Debe registrar, como mínimo:

- relación entre terreno base, cobertura, uso, condición, transformación y conocimiento;
- por qué agricultura usa el mismo motor de trabajos;
- geometría y aptitud de parcelas libres;
- modelo de progreso parcial;
- tratamiento de carreteras;
- anclajes, cruces y topología de perímetros;
- tiempo y crecimiento determinista;
- semillas, agua, herramientas, cosecha y conservación física;
- fórmula/rúbrica causal de rendimiento y qué queda provisional;
- compatibilidad/migración de snapshots;
- estrategia de invalidación dirigida;
- decisiones de UI espacial mínima;
- alternativas descartadas;
- límites conscientes y horizonte posterior.

### 12.2 Estado y changelog

Actualiza:

- `docs/STATUS.md`;
- `CHANGELOG.md`;
- `DISC-0008` o el registro vivo equivalente si corresponde;
- trazabilidad de WEB-002/RDM-003 que use el repositorio.

Marca S10 como cerrado solo si todas sus puertas están realmente en verde. Separa con honestidad:

- cerrado;
- cerrado con limitación explícita;
- deuda de ajuste;
- fuera de alcance para S11 o posteriores.

No escondas una carencia funcional bajo “pulido futuro”. Una limitación compatible con el alcance puede documentarse; la ausencia de uno de los recorridos obligatorios impide cerrar S10.

### 12.3 Comentarios y nombres

Documenta en código únicamente decisiones no obvias, invariantes y aproximaciones. Mantén nombres del dominio coherentes con la documentación y evita traducir el mismo concepto de varias maneras entre contratos, núcleo, persistencia y UI.

---

## 13. Fuera de alcance

No implementes en esta entrega:

- S11;
- pase visual/artístico general del mapa;
- amenazas, zombis, combate o consumidores de ruido;
- autonomía avanzada;
- relaciones, narrativa o aprendizaje/potencial;
- estaciones y meteorología profunda;
- catálogo agrícola masivo;
- plagas, fertilidad avanzada, rotación o fertilizantes;
- vehículos, animales de tiro o logística regional;
- electricidad o redes técnicas generales;
- terraformación libre, relleno, excavación o nivelado;
- escaleras, rampas, terrazas y muros de contención;
- construcción libre de edificios o editor de interiores;
- rehabilitación completa de carreteras por capas;
- cerrar toda la deuda histórica de S7–S9 que no bloquee directamente S10.

Si una deuda previa impide un criterio obligatorio de S10, resuelve el mínimo causal y documenta por qué. No uses S10 como excusa para reescribir subsistemas ya estabilizados.

---

## 14. Secuencia de ejecución recomendada

Organiza internamente el trabajo en checkpoints verificables, todos sobre la misma rama:

1. **Inspección y diseño mínimo**: mapa de contratos, invariantes, migración y puntos de extensión.
2. **Base espacial**: capas, aptitud, geometría y transformaciones persistentes.
3. **Acciones de entorno**: limpieza, vegetación, escombros y carreteras.
4. **Barreras y perímetros**: anclajes, cruces, navegación y topología.
5. **Agricultura**: parcela, ciclo, suministros, crecimiento, rendimiento y cosecha.
6. **Integración**: trabajos, prioridades, logística, necesidades, persistencia y concurrencia.
7. **UI funcional**: selección/dibujo, lectura, paneles y feedback.
8. **Pruebas y documentación**: unitarias, PostgreSQL, E2E, build, DEC y estado.

Haz commits coherentes y revisables por checkpoint. No abras varias PR y no fusiones nada.

Si alcanzas un límite de sesión:

- deja el árbol limpio o con un checkpoint claramente descrito;
- ejecuta la validación proporcional al cambio;
- commitea y pushea el avance seguro en la misma rama;
- registra exactamente qué puerta y casos faltan;
- en la siguiente sesión continúa automáticamente desde ahí;
- no presentes S10 como cerrado y no abras la PR final hasta completar todas las puertas.

No vuelvas a preguntarme si prefiero que sigas tras cada checkpoint: debes continuar hasta cerrar S10, salvo bloqueo que requiera una decisión genuina del producto o permiso destructivo.

---

## 15. Puertas de cierre

S10 solo puede declararse terminado si se cumplen simultáneamente:

### Puerta A — Entorno mutable

- limpieza de vegetación/escombros real y persistente;
- productos localizados cuando corresponda;
- vía despejada distinta de vía sin función;
- navegación actualizada;
- barrera entre anclajes con materiales y progreso;
- cruce de vía explícito y operativo;
- perímetro derivado físicamente y huecos reactivos.

### Puerta B — Agricultura

- parcela libre sobre terreno físicamente válido;
- preparación parcial, interrupción y reanudación;
- semillas, herramientas y agua físicas;
- siembra con consumo idempotente;
- crecimiento por reloj, pausa y ×10;
- cuidado y rendimiento causal;
- cosecha localizada;
- transporte, almacenamiento e integración con alimento/necesidades.

### Puerta C — Calidad de entrega

- snapshots previos compatibles o migrados;
- persistencia PostgreSQL y concurrencia probadas;
- invariantes completas;
- UI funcional accesible;
- unitarias, integración, build y E2E en verde;
- `DEC-0020`, `STATUS`, `CHANGELOG` y trazabilidad actualizados;
- guion manual de S10 reproducible;
- rama limpia y al día con `origin`;
- una única PR abierta contra `main`, sin fusionar;
- ninguna implementación de S11 mezclada.

---

## 16. Informe final que debes devolver

Cuando termines, responde con un informe conciso pero verificable que incluya:

1. Rama y hash de los commits de S10.
2. Enlace a la única PR.
3. Resultado de cada puerta A, B y C.
4. Arquitectura implementada y decisiones relevantes.
5. Recorrido jugable exacto que ya funciona.
6. Migración y compatibilidad con partidas anteriores.
7. Pruebas ejecutadas, comandos y conteos/resultados reales.
8. Resultado de build y E2E.
9. Documentación creada o modificada.
10. Limitaciones explícitas y deuda honesta, separando ajuste de funcionalidad ausente.
11. Confirmación de que S11 no se inició.
12. Confirmación de árbol limpio, push realizado y PR no fusionada.

No uses expresiones como “completo” o “cerrado” si falta alguna puerta obligatoria. No simules pruebas, no omitas fallos y no presentes como implementación lo que solo esté documentado.

Empieza ahora leyendo las fuentes canónicas y verificando el estado exacto de `main`.
