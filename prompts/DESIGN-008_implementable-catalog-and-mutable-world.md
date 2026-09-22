# PROMPT PARA CLAUDE CODE — DESIGN-008: primer catálogo implementable y mundo local moldeable

## 0. Encargo

Realiza una entrega **exclusivamente documental** en el repositorio `bateman37/z-world` para cerrar el tercer bloque de diseño previo a la implementación:

> **Elegir el primer catálogo implementable y asegurar que la caja de juguetes del vertical slice no quede limitada a edificios y objetos, sino que nazca sobre un mundo local explotable, conectable y transformable.**

Esta entrega debe convertir `CAT-004`, actualmente `draft`, en un contrato de contenido pequeño pero profundo, preparado para una futura entrega de programación. Al mismo tiempo debe cerrar el marco funcional que permite:

1. Tratar edificios, terreno, elementos lineales, instalaciones y objetos como partes persistentes del mismo mundo.
2. Implementar exactamente ocho perfiles iniciales de lugar o entorno, cuatro de ellos edificios con programas de estancias coherentes.
3. Disponer de un conjunto reducido de objetos completos que puedan observarse, utilizarse, contener, trasladarse, repararse o desmontarse.
4. Reconciliar el recorte inicial de materiales con el catálogo máximo de objetos y familias logísticas ya diseñado.
5. Ejecutar mediante el motor común acciones completas de reconocimiento, inspección, registro, recuperación, transporte, uso, reparación y transformación.
6. Cultivar una parcela mediante un ciclo agrícola básico con rendimiento cuantificable, aunque todavía no existan estaciones.
7. Transformar de forma persistente terreno, vegetación y carreteras, incluyendo un primer corte sencillo de carretera bloqueada/despejada y carretera convertida en terreno despejado.
8. Construir al menos un tramo lineal sencillo de barrera entre anclajes válidos, sin introducir todavía un editor arquitectónico complejo.
9. Representar muros, edificios, puertas, portones, ventanas, brechas y huecos como una topología física que condiciona circulación, defensa y logística.
10. Generar las entradas de cada edificio en posiciones coherentes y permitir cerrar, reparar, reforzar, barricadar o tapiar accesos existentes.
11. Transportar físicamente cargas mediante porte individual, porte coordinado, recipientes, carretillas y carros manuales, sin teletransporte al almacén.
12. Documentar el horizonte futuro de terraformación, construcciones libres, animales de tiro y vehículos sin implementarlos ahora.

No programes nada. No inicialices ni modifiques la aplicación web. No crees componentes, esquemas Prisma, migraciones, endpoints, generadores, JSON ejecutable, pruebas de código ni prototipos visuales. Esta entrega selecciona y aprueba el **contenido implementable** y sus contratos funcionales; una entrega posterior decidirá la secuencia técnica y escribirá el código.

La expresión «primer catálogo implementable» significa **alcance funcional aprobado para futuras entregas**, no `implemented`. No confundas:

- horizonte máximo aprobado;
- catálogo inicial aprobado;
- alcance concreto de una futura PR de código;
- estado realmente implementado y verificado.

La calidad documental es prioritaria. Distribuye las responsabilidades en fuentes canónicas pequeñas, enlazadas y coherentes. No conviertas `CAT-004`, `SET-001` ni `WLD-008` en documentos monolíticos.

---

## 1. Precondición obligatoria y base de trabajo

En el momento de redactar este encargo, `origin/main` contiene:

- `DESIGN-006`, cierre del motor de resolución y capacidades;
- `DESIGN-007`, primer escenario real, cohorte protagonista y pueblo de llegada;
- `DEC-0012_first-arrival-scenario-contract.md`;
- `DISC-0006_first-arrival-scenario-traceability.md`;
- `SCN-002_initial-survivor-cohort.md`;
- `SCN-003_first-day-starting-state.md`;
- `WLD-009_initial-mountain-village-profile.md`.

Antes de trabajar:

1. Actualiza las referencias remotas sin sobrescribir cambios ajenos.
2. Comprueba el `main` remoto real.
3. Verifica que `DESIGN-007` está fusionado y que los documentos anteriores existen en `main`.
4. Verifica que `CAT-004` continúa `draft` y que `RDM-003` continúa siendo la hoja de ruta activa.
5. Si falta `DESIGN-007` o existe una entrega posterior que ya ocupa los identificadores sugeridos, detente, informa a Dennis y no apiles esta entrega sobre una rama documental anterior.
6. Solo cuando la base sea válida, crea una rama nueva desde el `main` remoto actualizado.

Nombre sugerido:

```text
docs/design-008-implementable-catalog-mutable-world
```

No reutilices ramas anteriores, ramas de Godot ni ramas de implementación. No uses `reset --hard`, no sobrescribas trabajo ajeno y no cierres o fusiones otras pull requests.

---

## 2. Reglas obligatorias de Git y entrega

### 2.1 Conservación del prompt

Guarda este prompt literal en:

```text
prompts/DESIGN-008_implementable-catalog-and-mutable-world.md
```

Actualiza `prompts/INDEX.md` y cualquier índice de prompts pertinente.

### 2.2 Commit, publicación y pull request

Al terminar:

1. Haz commit de la entrega documental.
2. Publica la rama.
3. Crea la pull request.
4. **No fusiones la PR.**

Título sugerido:

```text
DESIGN-008: catálogo implementable y mundo local moldeable
```

La descripción de la PR debe enumerar:

- documentos nuevos;
- documentos modificados;
- decisiones cerradas;
- alcance exacto del catálogo inicial;
- horizonte máximo documentado pero no incluido en la primera implementación;
- contradicciones reconciliadas;
- preguntas retiradas de `OPEN-QUESTIONS.md`;
- parámetros que permanecen abiertos;
- estados documentales finales;
- validaciones ejecutadas;
- confirmación expresa de que no se ha implementado código.

### 2.3 Alcance técnico prohibido

No debes:

- modificar `src/`, `scenes/`, `tests/`, `project.godot` ni el prototipo histórico Godot;
- inicializar Node.js, TypeScript, Next.js, React, Canvas, PostgreSQL o Prisma;
- añadir dependencias, paquetes, esquemas, migraciones o endpoints;
- crear datos ejecutables, semillas JSON, mapas, cultivos, objetos o recetas en código;
- implementar pathfinding, inventario, agricultura, puertas, transporte, construcción o interfaz;
- ejecutar suites globales o instalar herramientas;
- modificar o reactivar `RDM-001`;
- crear un incremento nuevo de roadmap si basta con precisar el incremento existente de `RDM-003`;
- marcar ningún documento como `implemented`;
- fusionar la PR.

---

## 3. Lectura obligatoria y matriz de reconciliación

Sigue `AGENTS.md`: comienza por los índices y lee completos los documentos canónicos afectados y sus dependencias relevantes. Como mínimo, lee lo siguiente.

### 3.1 Gobierno, estado y roadmap

- `AGENTS.md`
- `CLAUDE.md`
- `README.md`
- `CHANGELOG.md`
- `docs/INDEX.md`
- `docs/STATUS.md`
- `docs/OPEN-QUESTIONS.md`
- `docs/00-governance/DOC-001_documentation-system.md`
- `docs/00-governance/GLOSSARY.md`
- `docs/roadmap/INDEX.md`
- `docs/roadmap/RDM-003_simulation-first-playable-roadmap.md`

### 3.2 Mundo local y escenario

- `docs/20-world/INDEX.md`
- `docs/20-world/WLD-001_world-scales.md`
- `docs/20-world/WLD-002_local-exploration-and-information.md`
- `docs/20-world/WLD-004_expertise-dependent-recovery.md`
- `docs/20-world/WLD-005_semantic-place-and-building-generation.md`
- `docs/20-world/WLD-006_historical-looting-pressure-and-routes.md`
- `docs/20-world/WLD-007_place-history-and-environmental-storytelling.md`
- `docs/20-world/WLD-008_local-procedural-map-generation.md`
- `docs/20-world/WLD-009_initial-mountain-village-profile.md`
- `docs/scenarios/INDEX.md`
- `docs/scenarios/SCN-001_mountain-village-arrival.md`
- `docs/scenarios/SCN-002_initial-survivor-cohort.md`
- `docs/scenarios/SCN-003_first-day-starting-state.md`

### 3.3 Asentamiento, producción, objetos y transformación

- `docs/40-settlement/INDEX.md`
- `docs/40-settlement/SET-001_settlement-growth.md`
- `docs/40-settlement/SET-002_production-and-solutions.md`
- `docs/40-settlement/SET-003_resources-logistics-and-condition.md`
- `docs/40-settlement/SET-004_technological-transition-and-knowledge-economy.md`
- `docs/40-settlement/SET-005_production-web-and-infrastructure.md`
- `docs/40-settlement/SET-006_knowledge-assets-and-capability.md`
- `docs/40-settlement/SET-007_building-exploitation-reuse-and-demolition.md`
- `docs/40-settlement/SET-008_object-model-and-logistics-families.md`
- `docs/40-settlement/SET-009_disassembly-and-world-transformation.md`

### 3.4 Catálogos

- `docs/catalogs/INDEX.md`
- `docs/catalogs/CAT-001_maximum-place-catalog.md`
- `docs/catalogs/CAT-002_rooms-modules-and-building-systems.md`
- `docs/catalogs/CAT-003_occupants-professions-hobbies-and-traits.md`
- `docs/catalogs/CAT-004_initial-semantic-place-slice.md`

### 3.5 Interfaz, trabajo y amenazas

- `docs/80-interface/INDEX.md`
- `docs/80-interface/UI-001_interaction-and-command-model.md`
- `docs/80-interface/UI-002_management-at-community-scale.md`
- `docs/80-interface/UI-003_work-priority-taxonomy.md`
- `docs/80-interface/UI-004_qualitative-capability-presentation.md`
- `docs/80-interface/UI-005_top-down-simulation-workbench.md`
- `docs/80-interface/UI-006_contextual-place-interaction-and-teams.md`
- `docs/60-threats/THR-001_zombie-threat-model.md`

### 3.6 Personajes y resolución

- `docs/30-characters/CHR-001_character-model.md`
- `docs/30-characters/CHR-003_autonomy-intentions-and-behavior.md`
- `docs/30-characters/CHR-006_characteristics-and-skill-catalog.md`
- `docs/90-architecture/INDEX.md`
- `docs/90-architecture/ARC-002_procedural-generation-and-persistence.md`
- `docs/90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md`
- `docs/90-architecture/ARC-005_semantic-world-data-model.md`
- `docs/90-architecture/ARC-006_action-and-event-resolution-model.md`
- `docs/90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md`
- `docs/90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md`

### 3.7 Decisiones y trazabilidad

- `docs/decisions/INDEX.md`
- `docs/decisions/DEC-0003_data-driven-design.md`
- `docs/decisions/DEC-0005_reproducible-lazy-generation.md`
- `docs/decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md`
- `docs/decisions/DEC-0007_layered-work-and-priorities.md`
- `docs/decisions/DEC-0008_simulation-first-web-architecture.md`
- `docs/decisions/DEC-0010_procedural-local-and-regional-map-direction.md`
- `docs/decisions/DEC-0011_hybrid-resolution-engine-and-capability-presentation.md`
- `docs/decisions/DEC-0012_first-arrival-scenario-contract.md`
- `docs/discovery/INDEX.md`
- `docs/discovery/DISC-0003_procedural-place-generator-traceability.md`
- `docs/discovery/DISC-0004_local-regional-maps-and-contextual-actions-traceability.md`
- `docs/discovery/DISC-0005_resolution-engine-closure-traceability.md`
- `docs/discovery/DISC-0006_first-arrival-scenario-traceability.md`

Antes de editar, construye para tu propio trabajo una matriz:

| Decisión o contrato | Fuente canónica destino | Documentos relacionados | Estado anterior | Estado final | Pregunta o contradicción resuelta |
|---|---|---|---|---|---|

No es obligatorio publicar esa matriz separadamente si queda íntegramente sintetizada en el documento de discovery de esta entrega.

---

## 4. Separación obligatoria de alcances

La entrega debe distinguir tres capas sin mezclarlas.

### 4.1 Catálogo implementable aprobado

Es la caja de juguetes concreta del primer vertical slice web:

- ocho perfiles de lugar o entorno;
- cuatro programas de edificio;
- conjunto inicial de objetos, instalaciones, contenedores y medios de transporte;
- subconjunto inicial de recursos y materiales;
- acciones completas y recorridos verificables;
- agricultura básica;
- transformación mínima de terreno y carretera;
- barrera lineal sencilla;
- accesos y logística local.

Queda `approved` como contrato de contenido, pero no `implemented`.

### 4.2 Horizonte máximo aprobado

Debe documentarse para que la arquitectura inicial no lo impida:

- construcción libre de graneros, carreteras, granjas, campos y otros edificios;
- transformación de cualquier terreno físicamente adecuado;
- terraformación mediante excavación, aporte de tierra, arena u otros materiales;
- nivelación de pendientes;
- escaleras, rampas, terrazas y muros de contención;
- redes completas de perímetro;
- edición funcional sencilla de interiores y estancias;
- apertura, ampliación, traslado o cierre de huecos;
- animales de carga y tiro;
- vehículos y remolques;
- extracción por capas de carreteras;
- producción agrícola estacional posterior.

Documentar este horizonte no lo introduce en el primer código.

### 4.3 Parametrización todavía abierta

Permanecen abiertas, salvo que ya exista regla canónica:

- cifras exactas de peso, volumen, capacidad y velocidad;
- anchuras métricas exactas de accesos;
- tiempos de cultivo y cantidades de cosecha;
- fórmulas de fertilidad, riego, deterioro y rendimiento;
- costes y materiales numéricos exactos de cada obra;
- resistencia y daño numérico de puertas, muros y barreras;
- distancias máximas y pendientes exactas de cada transporte;
- algoritmos geométricos, de navegación y detección de recintos;
- interfaz gráfica definitiva;
- estructura SQL, Prisma o TypeScript.

No conviertas un parámetro abierto en una decisión silenciosa. El marco funcional y el contenido inicial sí quedan cerrados.

---

## 5. Principio central: el entorno completo es materia jugable

Registra como principio obligatorio:

> El mapa local no es un fondo sobre el que se colocan edificios. Terreno, agua, vegetación, carreteras, parcelas, edificios, estructuras lineales, instalaciones y objetos forman una realidad física persistente que puede conocerse, utilizarse, conectarse, degradarse, repararse, explotarse y transformarse mediante el mismo motor de acciones y trabajos.

Consecuencias obligatorias:

- `Place` o «lugar» no equivale a `Building`.
- Un edificio es una estructura situada sobre terreno, no el contenedor universal de toda interacción.
- Un campo, una zona de bosque, una carretera, un pozo, un muro o un patio pueden ser objetivos significativos aunque no tengan habitaciones.
- Una parcela histórica limita y contextualiza la generación, pero no es una ranura de construcción que encierre al jugador.
- El jugador puede transformar y construir fuera de parcelas edificadas cuando la realidad física lo permita.
- Las etiquetas no conceden funciones: denominar «campo» a una zona no la cultiva; denominar «enfermería» a una habitación no la equipa.
- Todo cambio material persiste, altera el mundo y puede generar efectos sobre circulación, uso, mantenimiento, defensa, producción, visibilidad, ruido, drenaje o riesgo cuando corresponda.
- La riqueza y complejidad pertenecen al mundo; la interfaz y los inventarios deben resumirla sin borrarla.

---

## 6. Primitivas espaciales y capas del entorno

El modelo conceptual debe soportar, sin fijar nombres de clases ejecutables, cuatro formas de entidad espacial interactuable:

| Forma conceptual | Ejemplos | Capacidades generales |
|---|---|---|
| Nodo o punto | Pozo, bomba, poste, árbol singular, depósito | Usar, inspeccionar, conectar, reparar, desmontar |
| Línea o corredor | Muro, valla, carretera, camino, acequia, tubería | Recorrer, construir, bloquear, abrir, reparar, retirar, conectar |
| Área | Campo, bosque, matorral, patio, parcela, zona de almacenamiento | Despejar, cultivar, explotar, excavar, asignar, construir sobre ella |
| Estructura con huella | Casa, cabaña, taller, cobertizo, torre | Entrar, adaptar, ampliar, conectar, explotar, desmantelar |

No fijes aquí si la implementación utiliza polígonos, polilíneas, grafos, celdas o una combinación. Conserva la estructura espacial técnica invisible aprobada por `WLD-008`.

### 6.1 Capas semánticas de una zona de terreno

Una zona debe poder representar conceptualmente:

1. **Base física:** relieve, pendiente, suelo, roca, humedad y drenaje relevantes.
2. **Cobertura:** hierba, matorral, bosque, cultivo, asfalto, grava, barro, agua o escombros.
3. **Elementos existentes:** árboles, cercas, edificios, carreteras, canalizaciones, postes e instalaciones.
4. **Uso previo o actual:** campo, patio, camino, explotación, solar, almacenamiento o abandono.
5. **Transformaciones persistentes:** despejado, excavado, rellenado, nivelado, cultivado, fortificado o construido.
6. **Condición real:** estado físico independiente de lo que la comunidad sabe.
7. **Conocimiento:** información observada, inspeccionada, evaluada o desconocida.

No conviertas estas capas en siete paneles obligatorios ni en un esquema técnico prematuro. Son responsabilidades conceptuales.

### 6.2 Identidad estable y persistencia

- Cada zona, elemento o estructura relevante conserva identidad estable.
- La generación diferida no vuelve a sortear el terreno o su contenido.
- Despejar, cultivar, cortar, excavar, construir, desmontar o tapiar modifica permanentemente el estado causal.
- La comunidad puede conocer mal una zona sin que la zona cambie para adaptarse a su conocimiento.
- Cargar partida, cambiar velocidad o descargar visualmente un sector no restaura el estado anterior.

---

## 7. Los ocho perfiles iniciales aprobados

Revisa y aprueba `CAT-004` como el primer catálogo implementable del mundo local. Debe contener exactamente estos ocho perfiles funcionales:

| Nº | Perfil inicial | Naturaleza | Cobertura sistémica principal |
|---:|---|---|---|
| 1 | Casa familiar mediana | Edificio | Refugio, programa residencial, mobiliario, instalaciones, almacenamiento y múltiples accesos posibles |
| 2 | Cabaña | Edificio | Programa pequeño, refugio provisional y pocas estancias |
| 3 | Supermercado pequeño | Edificio | Comercio, estanterías, almacén, alimento, saqueo y acceso de carga |
| 4 | Taller mecánico | Edificio | Perfil profesional, herramientas, equipos, reparación, desmontaje y portón ancho |
| 5 | Fuente local de agua | Nodo o recurso natural/técnico | Captación, calidad, recipientes, acarreo, uso e instalación reparable cuando exista |
| 6 | Campo o parcela abierta | Área | Inspección de suelo, limpieza, preparación, cultivo, cosecha y construcción futura |
| 7 | Zona de bosque o matorral | Área | Recolección, madera, despeje, visibilidad y transformación de cobertura |
| 8 | Tramo de carretera o camino | Línea/corredor | Movimiento, obstáculos, despeje, reparación y transformación futura |

### 7.1 IDs y relación con CAT-001

- Conserva los IDs existentes de `CAT-001` cuando la entrada sea exactamente la misma, por ejemplo `RES-10`, `RES-17`, `COM-02` y `TAL-01`.
- No reutilices un ID de `CAT-001` para representar otra cosa.
- Distingue un **arquetipo de lugar catalogado** de un **perfil ambiental de interacción** cuando campo, bosque o carretera sean capas/elementos espaciales y no edificios.
- Si necesitas IDs estables nuevos para perfiles ambientales, define una convención explícita, comprueba que no colisiona y documenta su relación con `CAT-001`; no inventes aliases ambiguos.
- «Fuente local de agua» es un perfil funcional inicial que puede instanciar una fuente coherente —por ejemplo pozo, manantial o tramo de captación— sin multiplicar motores de interacción. Las variantes concretas conservan identidad y diferencias reales.

### 7.2 Profundidad antes que amplitud

Estos ocho perfiles deben demostrar los sistemas completos. No añadas farmacia, iglesia, hospital, gasolinera, granja ganadera, comisaría ni localización especial solo para dar variedad. Permanecen en el catálogo máximo.

El mismo perfil puede producir múltiples instancias mediante dimensiones, historia, estado, saqueo, contenido, orientación, accesos, ocupantes anteriores y semilla, sin convertirse en otro tipo de lugar.

---

## 8. Cuatro programas iniciales de edificio

Los edificios iniciales no utilizan planos totalmente fijos. Cada programa declara:

- estancias obligatorias;
- estancias opcionales;
- rangos o variación razonable;
- relaciones de adyacencia y circulación;
- accesos exteriores compatibles;
- mobiliario, contenedores e instalaciones plausibles;
- historia y condición variables;
- límites físicos de su huella.

### 8.1 Casa familiar mediana

Base obligatoria:

- acceso o distribuidor;
- salón o espacio común;
- cocina;
- baño;
- al menos dos dormitorios;
- almacenamiento doméstico.

Opcionales según huella, época y hogar:

- dormitorio adicional;
- comedor separado;
- despensa;
- lavadero;
- estudio;
- garaje;
- trastero;
- sótano o terraza cuando proceda.

### 8.2 Cabaña

Base obligatoria:

- estancia principal o espacio multifunción;
- solución de cocina;
- espacio de descanso;
- almacenamiento mínimo.

Opcionales:

- pequeño dormitorio separado;
- baño o solución de saneamiento;
- porche;
- cobertizo;
- altillo.

### 8.3 Supermercado pequeño

Base obligatoria:

- zona pública de venta;
- caja o mostrador;
- estanterías o expositores;
- almacén trasero;
- aseo;
- acceso de clientes;
- acceso de carga o servicio.

Opcionales:

- oficina;
- cámara fría;
- pequeño obrador;
- zona de residuos;
- acceso secundario.

### 8.4 Taller mecánico

Base obligatoria:

- zona de trabajo;
- banco y herramientas;
- almacenamiento de piezas o recambios;
- oficina o recepción mínima;
- aseo o vestuario;
- acceso personal;
- portón o acceso de carga ancho.

Opcionales:

- elevador o foso;
- maquinaria adicional;
- patio exterior;
- almacén separado;
- acceso trasero;
- módulo de vivienda si la semilla genera un edificio mixto compatible.

### 8.5 Límite de la primera representación

- El primer slice soporta edificios de una planta activa.
- El modelo conserva desde el principio la noción de planta para no impedir varias alturas posteriormente.
- No se implementa un editor arquitectónico completo.
- En el horizonte futuro, seleccionar un edificio podrá abrir una interfaz sencilla de adaptación interior y asignación funcional: dormitorios, enfermería, almacén, taller u otros usos.
- Asignar una función no crea materiales, instalaciones, saneamiento, mobiliario ni capacidad que no existan.

---

## 9. Aberturas, cierres y topología de acceso

Esta entrega debe cerrar que las entradas no son decoración ni una propiedad booleana del edificio.

### 9.1 Tres conceptos separados

1. **Abertura:** hueco físico que conecta dos espacios.
2. **Cierre instalado:** puerta, portón, ventana, persiana, verja o trampilla que controla ese hueco.
3. **Modificación u obstrucción:** cerradura, bloqueo, barricada, tablones, refuerzo, escombros o tapiado.

Consecuencias:

- retirar una puerta no elimina la abertura;
- destruir el cierre puede dejar el hueco transitable;
- bloquear con muebles no transforma el hueco en pared;
- tapiar sí sustituye funcionalmente la abertura por un tramo cerrado;
- una brecha causada por daño puede crear una abertura donde antes no existía;
- una puerta recuperada puede conservarse como objeto completo reutilizable;
- condición del hueco, condición del cierre y obstrucciones evolucionan de forma separada.

### 9.2 Conexiones posibles

Una abertura puede conectar:

- exterior y estancia;
- dos estancias;
- dos plantas;
- interior y patio;
- interior y garaje;
- interior y exterior de un perímetro;
- carretera y recinto;
- edificio existente y ampliación.

Forma parte del grafo real de circulación, evacuación, defensa y logística.

### 9.3 Colocación procedural coherente

Las entradas se generan según:

- calle o camino;
- orientación y huella de parcela;
- patio y carga/descarga;
- programa de estancias;
- función original del edificio;
- época constructiva;
- accesibilidad;
- edificios y terreno adyacentes.

No coloques puertas aleatoriamente sobre cualquier pared.

Perfiles iniciales:

| Edificio | Accesos plausibles |
|---|---|
| Casa mediana | Entrada principal; posible salida trasera; posible conexión de garaje |
| Cabaña | Entrada principal; salida adicional poco frecuente; ventanas potencialmente utilizables |
| Supermercado | Acceso de clientes; acceso de carga/servicio; posible salida secundaria |
| Taller | Puerta personal; portón ancho; posible acceso trasero o de almacén |

La garantía de `SCN-003` se conserva: el refugio provisional dispone de una salida secundaria existente o razonablemente creable. No conviertas esa garantía del escenario en una obligación de dos puertas para todos los edificios.

### 9.4 Estados y acciones iniciales

El primer catálogo funcional debe permitir declarar, según corresponda:

- abrir y cerrar;
- bloquear y desbloquear;
- forzar;
- despejar una obstrucción;
- reparar cierre, marco o mecanismo;
- reforzar;
- barricadar;
- tapiar;
- desmontar preservando el cierre;
- retirar o destruir de forma destructiva.

Las acciones desconocidas permanecen ausentes; las conocidas pero bloqueadas aparecen deshabilitadas con motivo, conforme a `UI-006`.

### 9.5 Tapiar un acceso

Tapiar no es un bono abstracto de defensa. Puede:

- consumir tiempo, materiales y herramientas;
- generar ruido y escombros;
- recuperar o destruir el cierre anterior según el método;
- eliminar una ruta de evacuación;
- empeorar la circulación o el transporte;
- dejar una estancia como fondo de saco;
- afectar luz, ventilación, temperatura o uso cuando corresponda;
- ser parcial, provisional o profundo.

### 9.6 Crear o modificar huecos: horizonte futuro

Debe quedar documentado, aunque no se incluya en el primer código, que será posible:

- crear un hueco nuevo;
- ampliar o estrechar uno existente;
- trasladar una entrada;
- instalar una puerta o portón;
- añadir escalera o rampa;
- cerrar definitivamente un hueco.

Flujo conceptual:

1. inspeccionar la pared o estructura;
2. reconocer material, instalaciones y función estructural;
3. elegir tipo y dimensiones funcionales del acceso;
4. reservar personas, herramientas y materiales;
5. preparar, apuntalar o colocar dintel cuando proceda;
6. abrir el hueco con ruido, residuos y exposición;
7. instalar cierre o acabado;
8. actualizar navegación, defensa, habitabilidad y logística.

No requiere un editor CAD. En una versión futura puede ser una acción contextual sobre un tramo de pared.

### 9.7 Ventanas, brechas y accesos no convencionales

- Una ventana es un acceso potencial según tamaño, altura, apertura, cristal, persiana y capacidad de la persona.
- Una brecha puede permitir paso, visión, ruido, clima o amenaza sin admitir todas las cargas.
- Trepar o atravesar no equivale a disponer de una ruta logística ordinaria.
- Romper una ventana puede crear acceso y peligro por cristales, ruido o exposición.
- Puertas, ventanas, portones y brechas utilizan el mismo marco de posibilidad, conocimiento, acceso y resultado.

---

## 10. Compatibilidad de accesos y transporte

Cada abertura debe poder expresar conceptualmente:

- anchura y altura útiles;
- umbral, desnivel o escalón;
- estado y obstrucciones;
- dirección o limitaciones de apertura cuando importen;
- superficie inmediata;
- giro y aproximación disponibles;
- qué categorías de persona, carga o medio pueden atravesarla.

Clases cualitativas de presentación inicial:

| Clase | Paso orientativo |
|---|---|
| Estrecho | Una persona sin carga voluminosa |
| Normal | Persona con mochila, caja o recipientes manejables |
| Ancho | Dos porteadores, carretilla o carro manual compatible |
| Portón | Carro grande, animal de tiro o vehículo compatible |

Estas clases no fijan medidas métricas finales. La geometría interna puede conservar precisión suficiente para navegación; la interfaz la resume cualitativamente.

Un acceso viable a pie puede ser inviable para:

- un frigorífico;
- un colchón;
- una puerta recuperada;
- una tubería larga;
- dos porteadores coordinados;
- una carretilla;
- un carro de compra;
- un futuro carro animal o vehículo.

La orden debe explicar el bloqueo. No teletransportes el objeto a través del hueco ni busques otra ruta omnisciente que la comunidad desconozca.

---

## 11. Transformación del terreno

### 11.1 Libertad con causalidad

El jugador puede intentar transformar cualquier terreno físicamente adecuado. No existen «casillas de granja» ni «ranuras de construcción» exclusivas.

Puede, en el horizonte máximo:

- convertir terreno en campo;
- crear graneros, granjas, carreteras u otras estructuras;
- despejar bosque o matorral;
- excavar;
- rellenar con tierra, arena, grava u otros materiales;
- nivelar una pendiente;
- crear terrazas;
- construir escaleras o rampas;
- levantar muros de contención;
- modificar drenaje y accesos;
- reutilizar o eliminar infraestructuras anteriores.

La libertad está condicionada por:

- pendiente;
- suelo y roca;
- humedad y drenaje;
- espacio y colisiones;
- acceso de trabajadores y materiales;
- estabilidad;
- herramientas;
- conocimientos;
- mano de obra y tiempo;
- seguridad;
- mantenimiento posterior.

El motor no responde «no porque no es una parcela autorizada», sino «posible, imposible o todavía no reconocido por estas causas».

### 11.2 Transformaciones iniciales obligatorias

El primer catálogo debe contemplar al menos:

- despejar una pequeña área de matorral o residuos;
- preparar una parcela para cultivo;
- cortar o retirar recursos vegetales reconocidos;
- despejar un tramo de carretera bloqueado;
- retirar de forma básica la función viaria de un tramo y convertirlo en terreno despejado;
- construir un tramo sencillo de barrera lineal.

No cierres cantidades, tiempos o algoritmos exactos.

### 11.3 Persistencia y consecuencias

- Despejar modifica cobertura, visibilidad y transitabilidad.
- Excavar o rellenar modifica terreno real, no solo una etiqueta.
- Convertir carretera en terreno despejado elimina o degrada su ventaja viaria.
- Cortar vegetación elimina esa vegetación hasta que un sistema futuro permita regeneración causal.
- Preparar suelo no garantiza una cosecha.
- Construir crea mantenimiento, obstáculos, rutas y posibles vulnerabilidades.
- Los materiales producidos permanecen localizados y deben transportarse.

---

## 12. Construcción lineal, anclajes y perímetros

### 12.1 Primer corte implementable

Incluye conceptualmente una barrera sencilla, preferentemente de madera, definida por una línea entre anclajes válidos.

Un anclaje puede ser:

- punto estructural de un edificio;
- esquina o tramo compatible de muro;
- poste construido;
- extremo de otra barrera;
- portón o elemento de acceso;
- accidente natural válido cuando el sistema futuro lo admita.

El trabajo requiere trazado válido, acceso, materiales, herramientas, personas y tiempo. No fijes longitud máxima ni costes exactos en esta entrega.

### 12.2 Red de cierre, no rectángulo mágico

Edificios, muros, vallas, puertas, portones y posibles barreras naturales forman una red topológica.

- Un recinto existe cuando la red produce un cierre físico real.
- Los muros exteriores de una casa pueden formar parte del perímetro.
- Un hueco, portón abierto, puerta destruida o tramo roto conserva vulnerabilidad.
- Dibujar una zona no construye ni cierra el perímetro.
- Cerrar el perímetro no lo limpia, vigila ni hace invulnerable.
- Las amenazas pueden dañar cierres y crear brechas.
- Demoler un edificio utilizado como anclaje puede romper el perímetro.
- Un campo dentro del recinto no se vuelve seguro si todavía contiene amenazas o accesos sin controlar.

### 12.3 Cruce con carreteras y caminos

Cuando una barrera cruza un corredor existente, debe resolverse explícitamente:

- bloquearlo por completo;
- incorporar paso peatonal;
- incorporar portón para carretillas o carros;
- incorporar portón para futuros animales o vehículos;
- dejar paso vigilado;
- cambiar el trazado.

Una muralla no atraviesa visualmente una carretera manteniendo ambos usos sin abertura ni consecuencia.

### 12.4 Horizonte de construcción libre

En versiones posteriores, el jugador podrá definir:

- líneas para muros, vallas, tuberías y caminos;
- áreas para campos, patios o almacenamiento;
- huellas para edificios y ampliaciones;
- conexiones funcionales entre construcciones.

Las plantillas serán ayudas opcionales. No deben convertirse en los únicos lugares donde se puede construir.

---

## 13. Ciclo agrícola básico incluido en el primer catálogo

La agricultura entra en el primer vertical slice como primera ruta renovable de alimento, aunque no resuelva el hambre inmediata de la llegada.

### 13.1 Estados funcionales mínimos

Una parcela cultivable debe poder evolucionar conceptualmente:

```text
Terreno no preparado
→ despejado
→ preparado
→ sembrado
→ en crecimiento
→ cosechable
→ cosechado
→ requiere nueva preparación, mantenimiento o siembra
```

No conviertas esta cadena en una única barra sin causas. Puede existir progreso parcial, interrupción, daño, abandono o pérdida.

### 13.2 Acciones mínimas

- observar la parcela;
- inspeccionar aptitud conocida;
- despejar;
- preparar el suelo;
- aportar semillas;
- sembrar;
- cuidar, regar o mantener cuando corresponda;
- esperar crecimiento mediante tiempo de simulación;
- cosechar;
- agrupar, cargar, transportar y almacenar la producción.

### 13.3 Requisitos y rendimiento

La solución agrícola declara, como mínimo:

- terreno adecuado;
- superficie preparada;
- semillas localizadas;
- herramientas agrícolas básicas;
- trabajo;
- conocimiento y habilidades pertinentes;
- agua o cuidados cuando el perfil de cultivo lo requiera;
- tiempo de crecimiento;
- estado y riesgos conocidos.

El rendimiento cuantificable depende causalmente de factores como:

- aptitud del terreno;
- preparación;
- semillas;
- trabajo realizado;
- disponibilidad de agua;
- cuidados;
- daños, abandono o incidentes;
- método y capacidad reales.

No cierres cifras, fórmulas ni probabilidades. Sí debe quedar cerrado que el rendimiento existe, varía y se explica.

### 13.4 Sin estaciones todavía

- El primer slice no simula el ciclo completo de estaciones.
- Trabaja dentro de la situación inicial ya fijada del escenario.
- No introduce un calendario estacional universal ni bonificaciones invisibles.
- El catálogo de cultivos, duraciones reales, rotación, fertilidad avanzada, plagas, fertilizantes y conservación de semillas queda para ampliaciones.
- La arquitectura no debe impedir esos sistemas futuros.

### 13.5 Producción localizada

- La cosecha aparece en el campo o en recipientes utilizados durante la recolección.
- No se suma automáticamente al almacén.
- Debe cargarse, transportarse, atravesar accesos y descargarse.
- Un campo exterior al perímetro puede requerir vigilancia y una ruta logística propia.

---

## 14. Carretera y camino como elementos transformables

La carretera no es una textura inmutable.

### 14.1 Capacidades del primer corte

El primer catálogo distingue al menos:

- carretera o camino transitable;
- carretera obstaculizada o degradada;
- carretera despejada de obstáculos;
- tramo cuya función viaria se ha retirado de forma básica y queda como terreno despejado.

Acciones pertinentes:

- observar;
- inspeccionar superficie, bloqueo o estado;
- despejar;
- reparar de manera básica cuando exista solución soportada;
- bloquear deliberadamente;
- retirar o transformar de forma básica el tramo.

### 14.2 Horizonte máximo

Documenta que una carretera puede contener capas y elementos recuperables:

- superficie;
- base;
- drenaje;
- bordes;
- señales;
- barreras;
- canalizaciones asociadas.

En el futuro podrá excavarse, levantarse por capas, repararse, ampliarse, estrecharse o sustituirse. Esas acciones modificarán movilidad, drenaje, ruido, trabajo, mantenimiento y materiales recuperados. No implementes ni equilibres ahora ese catálogo profundo.

---

## 15. Primer catálogo de objetos completos

El recorte inicial debe ser pequeño en mecánicas y suficientemente rico en variantes. No programes un sistema distinto por objeto.

### 15.1 Familias de comportamiento iniciales

| Familia funcional | Variantes iniciales orientativas y aprobadas |
|---|---|
| Recipiente personal de líquido | Botella, cantimplora |
| Recipiente de trabajo | Cubo, bidón o garrafa |
| Contenedor de transporte | Mochila, saco, caja |
| Contenedor/mobiliario de almacenamiento | Armario, estantería, caja de almacén |
| Consumible localizado | Agua, alimento fresco, alimento conservado, material de cura, semillas |
| Fuente portátil de luz | Linterna o farol |
| Herramienta/arma improvisada | Cuchillo, martillo, palanca, hacha de mano, sierra, pala o azada |
| Conjunto de herramientas | Básicas, carpintería, mecánica o agricultura dentro del recorte soportado |
| Descanso | Colchón o cama sencilla |
| Puesto de trabajo | Banco de trabajo |
| Aparato técnico completo | Frigorífico |
| Instalación técnica | Bomba de agua |
| Cierre instalado | Puerta o portón |
| Transporte humano | Carretilla y carro de compra/mano |

Los nombres exactos de variantes pueden ajustarse para evitar duplicar familias, pero no elimines ninguna conducta cubierta por la tabla.

### 15.2 Objetos demostradores profundos

Documenta al menos estos recorridos:

**Armario o estantería**

- contiene objetos;
- puede registrarse;
- puede utilizarse como almacenamiento;
- puede vaciarse;
- puede trasladarse si tamaño, ruta y equipo lo permiten;
- puede repararse;
- puede desmontarse en materiales coherentes.

**Frigorífico**

- puede observarse e inspeccionarse;
- conserva identidad y estado;
- puede usarse como almacenamiento sin refrigeración;
- la refrigeración requiere condiciones reales futuras;
- puede repararse cuando se reconozcan causa y medios;
- puede trasladarse mediante ruta compatible;
- puede desmontarse selectivamente;
- puede producir chapa, cableado, componentes eléctricos y motor eléctrico coherentes con su estado, sin fijar cantidades;
- desmontarlo elimina su función futura como frigorífico.

**Bomba de agua**

- puede formar parte de una fuente o instalación;
- puede probarse, diagnosticarse, repararse, desmontarse o sustituirse;
- conecta objeto, instalación, agua, herramienta, conocimiento y terreno;
- no produce agua si la fuente, conexión o energía necesaria no existe.

**Carretilla o carro**

- es un objeto completo localizado;
- debe recuperarse y llevarse al origen de la carga;
- tiene condición, capacidad, compatibilidad de terreno y ruta;
- puede repararse, abandonarse o quedar bloqueado;
- no es una bonificación abstracta a Logística.

### 15.3 Identidad, condición y transformación

Todo objeto completo relevante conserva, cuando aplique:

- ID estable;
- ubicación;
- propietario o reserva;
- peso y volumen/bulto;
- condición;
- calidad;
- función;
- capacidad;
- portabilidad;
- requisitos de uso;
- perfil de reparación;
- perfil de desmontaje;
- contenido o capacidad de contener;
- valor de conocimiento o narrativo.

No todos los campos se muestran siempre ni todas las variantes necesitan todos los atributos.

---

## 16. Recursos y materiales del recorte inicial

### 16.1 Principio de reconciliación

El recorte inicial usa menos familias que el horizonte máximo, pero no reemplaza el sistema profundo por una bolsa universal.

Debe converger hacia `SET-008` y conservar:

- objetos completos en el mundo;
- familias logísticas comprensibles al perder relevancia la identidad;
- grado técnico separado de condición y calidad;
- desmontaje como origen causal de componentes;
- materiales localizados;
- herramientas como objetos funcionales, no simples números.

### 16.2 Subconjunto inicial mínimo

El catálogo inicial debe poder representar:

- agua;
- alimento fresco;
- alimento conservado;
- semillas;
- material de cura;
- madera y tablones;
- chapa o metal aprovechable;
- cableado;
- componentes eléctricos I;
- piezas mecánicas I;
- motores eléctricos II cuando resulten de los objetos soportados;
- herramientas básicas como objetos o conjuntos con condición.

Tela/prendas, analgésicos, antibióticos, otros grados, placas, baterías, motores de combustión, munición y demás familias del horizonte no desaparecen; sencillamente no todas necesitan comportamiento activo en el primer recorte.

### 16.3 Fin del recurso mágico «materiales de reparación»

Reconciliación obligatoria con `SET-003`:

- «Materiales de reparación» puede existir como filtro, resumen o cálculo contextual de existencias compatibles.
- No debe coexistir como una pila universal capaz de reparar indistintamente una puerta, bomba, frigorífico o carretera.
- Cada solución declara materiales y componentes compatibles.
- Una primera interfaz puede agruparlos para ser legible, pero la fuente física sigue siendo concreta.
- Documenta claramente la transición desde los nueve recursos agregados del prototipo histórico y evita afirmar que el código web ya la implementa.

### 16.4 Almacenamiento

- La capacidad de almacenamiento procede de contenedores, mobiliario, estancias y zonas reales.
- No es un recurso consumible denominado «almacenaje».
- Un almacén comunitario se crea designando y acondicionando espacios y contenedores.
- Los objetos no se teletransportan a una reserva global al descubrirse.

---

## 17. Una sola gramática de acciones y posibilidades

Registra como principio obligatorio:

> Edificios, terreno, agua, carreteras, accesos, instalaciones y objetos declaran posibilidades contextuales sobre el mismo motor de órdenes, trabajos, requisitos, cooperación, resolución, resultados y persistencia. No existen motores paralelos por tipo de objetivo.

### 17.1 Acciones mínimas completas

El recorte debe declarar objetivos concretos para:

- reconocer;
- observar;
- inspeccionar;
- registrar o buscar;
- recoger;
- transportar;
- usar;
- reparar;
- desmontar;
- despejar;
- preparar terreno;
- sembrar;
- cuidar;
- cosechar;
- construir barrera;
- abrir/cerrar/bloquear/reforzar/tapiar un acceso cuando proceda.

No conviertas esta lista en una botonera universal.

### 17.2 Regla de visibilidad ya aprobada

- Posibilidad reconocida y ejecutable: acción disponible.
- Posibilidad reconocida pero bloqueada: visible en gris con causa.
- Posibilidad todavía no reconocida: ausente.

Ejemplos:

- un campo no inspeccionado no revela todas sus posibilidades agrícolas;
- una persona sin conocimientos no ve necesariamente componentes concretos dentro de una bomba;
- una puerta conocida puede mostrar «Tapiar» bloqueado por materiales;
- una carretera observada puede mostrar «Despejar» si el obstáculo es conocido;
- una pared no inspeccionada no revela gratuitamente instalaciones ocultas al proponer un hueco.

### 17.3 Posibilidad, ejecución y resultado

Cada acción declara mediante fuentes canónicas existentes:

- objetivo físico;
- conocimiento disponible;
- acceso;
- actor o equipo;
- responsable y aportaciones útiles;
- habilidades y conocimientos;
- herramientas;
- materiales;
- método y modo;
- fases y progreso;
- riesgos y ruido;
- resultados multidimensionales;
- información nueva;
- transformaciones persistentes;
- motivo de bloqueo o interrupción.

No redeclares fórmulas de `ARC-006`–`ARC-008`. Enlázalas y aplica sus invariantes.

---

## 18. Transporte local como sistema físico

### 18.1 Composición de un traslado

Todo traslado relevante combina:

```text
carga
+ medio o método
+ personas, animales o conductor
+ ruta físicamente compatible
+ origen
+ destino
+ carga y descarga
+ riesgo, ruido, fatiga y tiempo
```

Un medio de transporte no es un multiplicador universal de velocidad.

### 18.2 Métodos activos en el primer recorte

1. **A pulso por una persona:** manos, brazos u hombro.
2. **Con recipiente o equipamiento personal:** mochila, saco, caja, cubo, bidón.
3. **Porte coordinado:** dos o más personas para una carga voluminosa o pesada.
4. **Carretilla:** adecuada para carga y terreno razonablemente transitable, con límites de escalera, pendiente y anchura.
5. **Carro de compra o carro de mano:** útil sobre superficie firme, más torpe o ruidoso en barro, grava, bosque y escombros.

Carretilla y carro comparten el mismo motor de transporte y se diferencian mediante datos y posibilidades reales.

### 18.3 Horizonte máximo de métodos

Documenta sin activar todavía:

- arrastre directo;
- lona, camilla o arnés;
- cadena humana;
- trineo o plataforma de arrastre;
- carro de plataforma;
- carretilla vertical o diablillo;
- bicicleta con alforjas;
- bicicleta con remolque;
- poleas, cabrestantes, rampas, rodillos y polipastos;
- animal de carga;
- carro o carreta animal;
- motocicleta, quad, coche, furgoneta, pickup, camión y tractor;
- remolques y maquinaria especializada.

Los vehículos y animales no se activan en el primer slice. Pueden existir como restos o entidades del mundo cuando otra regla lo permita, pero no funcionan todavía como solución logística controlable.

### 18.4 Propiedades de un método

Cada método puede declarar conceptualmente:

- capacidad de peso;
- capacidad de volumen;
- tipos de carga compatibles;
- operadores necesarios;
- anchura y giro;
- superficies y pendientes compatibles;
- velocidad cargado y vacío;
- esfuerzo y fatiga;
- ruido;
- tiempo de preparación, carga y descarga;
- condición y averías;
- combustible, energía, alimento o mantenimiento cuando corresponda;
- facilidad de abandono o retirada ante peligro.

No cierres cifras exactas.

### 18.5 Modelo mínimo de carga

Usa conceptualmente:

- peso;
- volumen o bulto;
- etiquetas de manipulación cuando aporten decisiones: líquido, frágil, largo, voluminoso, contaminante o mantener vertical;
- cantidad mínima de personas o medio necesario cuando exista requisito duro.

Evita ambos extremos:

- peso como único factor;
- simulación milimétrica de cada forma.

### 18.6 Ruta completa

La viabilidad considera:

- puertas, ventanas, portones y brechas;
- escaleras, rampas y umbrales;
- anchura y giros;
- pendiente;
- carretera, tierra, barro, bosque, grava, escombros y agua;
- muros, barricadas y cierres;
- zonas habituales, de precaución y prohibidas;
- amenazas e información conocida;
- origen y destino accesibles.

La ruta puede quedar bloqueada antes de empezar o descubrir un obstáculo durante el trabajo si la información era incompleta. Debe producir explicación y evento coherentes.

### 18.7 Fases logísticas

Un trabajo de transporte puede requerir:

1. reservar carga y medio;
2. recuperar o recoger el medio;
3. desplazarse al origen;
4. preparar y cargar;
5. recorrer la ruta;
6. atravesar accesos;
7. descargar;
8. almacenar, entregar o instalar;
9. estacionar, devolver o abandonar el medio según el resultado.

Interrumpir el trabajo no devuelve mágicamente carga y medio a sus posiciones iniciales.

### 18.8 Logística por etapas y puntos de transferencia

Destinos válidos:

- inventario o equipamiento personal;
- mochila, recipiente, carretilla o carro;
- punto de reunión;
- borde de campo;
- zona temporal de carga;
- puerta o portón del perímetro;
- almacén exterior;
- estancia;
- contenedor;
- taller;
- obra;
- instalación productiva.

Ejemplo obligatorio: un carro llega hasta el portón, descarga allí y varias personas llevan la carga a una despensa a través de una puerta más estrecha.

### 18.9 Selección del método

La orden debe poder expresar:

```text
Método de transporte: Auto / método concreto disponible
```

No confundas este selector con:

- prioridad `Nunca/1–5`;
- tamaño de equipo `Auto/1/2/3/4`;
- modo de ritmo o atención;
- asignación de personas.

`Auto` puede valorar, con información conocida:

- viajes necesarios;
- tiempo;
- fatiga;
- ruido;
- riesgo;
- terreno;
- accesos;
- conservación de la carga;
- disponibilidad y condición del medio;
- combustible o recursos futuros cuando existan.

El jugador puede imponer un método específico y recibir el motivo si no es viable.

### 18.10 Cooperación y seguridad

- Dos personas pueden coordinar una carga que una sola no puede mover.
- Un ayudante puede estabilizar, guiar, abrir paso o vigilar.
- Añadir personas no concede bonificación genérica.
- El espacio y los accesos limitan cuántas ayudan realmente.
- Ruido y exposición se producen a lo largo de la ruta, no solo al finalizar.
- Las políticas de respuesta a amenaza, interrupción y retirada se heredan de `ARC-007` y `ARC-008`.
- Ante peligro puede quedar carga abandonada, carro volcado, objeto dañado o trabajo incompleto.

---

## 19. Mapa completo y materialización diferida

Conserva íntegramente el contrato de `WLD-009`:

- huella aproximada `3 × 3 km`;
- `55–85` construcciones;
- red viaria, agua, cobertura de terreno y puntos de interés ya aprobados;
- niebla e información parcial;
- generación procedural y reproducible.

El primer catálogo no obliga a mantener decenas de interiores activos.

### 19.1 Regla de profundidad diferida

- El mapa lógico completo conserva IDs, posición, huella, tipo de alto nivel, estado y relaciones necesarias.
- Interiores, contenedores y objetos se materializan bajo demanda de forma reproducible.
- Los ocho perfiles aprobados son los que reciben comportamiento profundo en el primer recorte.
- La semilla o escenario de validación concentra suficientes instancias soportadas cerca de la llegada para probar todos los recorridos.
- No simules todos los interiores cada fotograma.
- No presentes un edificio como plenamente interactuable si su comportamiento todavía no está soportado.
- No reduzcas silenciosamente el contrato máximo del escenario porque el catálogo técnico sea menor.

### 19.2 Variación con pocos perfiles

La variedad procede de:

- dimensiones;
- orientación;
- programa de estancias;
- accesos;
- ocupantes anteriores;
- contenido;
- historia;
- saqueo;
- deterioro;
- vegetación;
- terreno;
- conexiones con otros lugares.

No exige decenas de clases programadas.

---

## 20. Presentación e interacción

La documentación debe describir capacidad de interfaz, no diseñar píxeles.

### 20.1 Ficha contextual común

Al seleccionar edificio, campo, carretera, acceso, objeto o medio, la ficha puede mostrar según conocimiento:

- identidad conocida o provisional;
- estado y condición conocidos;
- ubicación;
- conexiones o accesos pertinentes;
- contenido o carga conocida;
- posibilidades disponibles;
- posibilidades conocidas pero bloqueadas y motivo;
- trabajos activos;
- progreso y fases;
- personas y medios reservados;
- riesgos conocidos;
- cambios persistentes realizados.

### 20.2 Edificios y estancias

- La primera versión no incluye una herramienta de arquitectura.
- Las estancias proceden del programa generado.
- Pueden asignarse usos cuando sus condiciones los permiten.
- Una versión posterior podrá ofrecer un menú sencillo para adaptar interiores, abrir/cerrar huecos y configurar funciones.
- Nunca se obtiene una enfermería, dormitorio o taller funcional solo seleccionando una etiqueta.

### 20.3 Transporte

Una orden puede explicar:

- qué se mueve;
- desde dónde y hasta dónde;
- método elegido;
- personas necesarias;
- viajes estimados de forma cualitativa o aproximada;
- ruta y obstáculos conocidos;
- ruido, fatiga o riesgo relevante;
- razón de bloqueo.

No muestres probabilidades, dados ni fórmulas internas prohibidas por `UI-004` y `DESIGN-006`.

---

## 21. Organización documental requerida

Respeta el límite de responsabilidad y tamaño de `DOC-001`. Usa los siguientes documentos si los IDs continúan libres; si `main` ya los ocupa, utiliza los siguientes disponibles y actualiza todos los enlaces.

### 21.1 Primer catálogo del mundo local

Actualiza y, por esta decisión expresa de Dennis, pasa a `approved`:

```text
docs/catalogs/CAT-004_initial-semantic-place-slice.md
```

Puede conservar la ruta por estabilidad y actualizar su título a «Primer catálogo implementable del mundo local» o equivalente.

Responsabilidad canónica:

- ocho perfiles iniciales;
- cuatro edificios y cuatro perfiles no exclusivamente edificatorios;
- diferencia entre perfil soportado, variante e instancia;
- relación con catálogo máximo;
- profundidad esperada;
- declaración expresa de `approved` ≠ `implemented`.

### 21.2 Objetos, recursos y transportes iniciales

Crea, si está libre:

```text
docs/catalogs/CAT-005_initial-object-resource-and-transport-slice.md
```

Responsabilidad canónica:

- familias de comportamiento iniciales;
- variantes concretas aprobadas;
- objetos demostradores profundos;
- subconjunto de materiales;
- medios de transporte activos;
- relación con `SET-008` y su horizonte máximo;
- acciones declaradas por cada objetivo sin duplicar reglas del motor.

Estado final esperado: `approved`.

### 21.3 Entorno mutable y construcción espacial

Crea, si está libre:

```text
docs/20-world/WLD-010_mutable-terrain-and-spatial-construction.md
```

Responsabilidad canónica:

- nodo, línea, área y estructura;
- capas semánticas del terreno;
- libertad física de transformación;
- cambios iniciales soportados;
- construcción lineal y anclajes;
- red de perímetro;
- carreteras transformables;
- horizonte de terraformación y construcción libre.

Estado final esperado: `approved`.

### 21.4 Aberturas y conectividad

Crea, si está libre:

```text
docs/20-world/WLD-011_openings-access-and-connectivity.md
```

Responsabilidad canónica:

- abertura, cierre y modificación separados;
- colocación procedural de accesos;
- conexiones entre espacios;
- estados y acciones;
- tapiado;
- ventanas y brechas;
- compatibilidad con cargas y medios;
- horizonte de nuevos huecos, rampas y escaleras.

Estado final esperado: `approved`.

### 21.5 Transporte y logística local

Crea, si está libre:

```text
docs/40-settlement/SET-010_local-hauling-and-transport.md
```

Responsabilidad canónica:

- composición de un traslado;
- métodos iniciales;
- horizonte de medios;
- peso, bulto y etiquetas;
- compatibilidad de ruta;
- fases;
- puntos de transferencia;
- selección `Auto` o método;
- cooperación, ruido, fatiga e interrupciones.

Estado final esperado: `approved`.

### 21.6 Agricultura inicial

Crea, si está libre:

```text
docs/40-settlement/SET-011_initial-agriculture-loop.md
```

Responsabilidad canónica:

- parcela cultivable;
- estados del ciclo;
- acciones y requisitos;
- crecimiento por tiempo de simulación;
- rendimiento causal;
- producción localizada;
- límite sin estaciones;
- parámetros que permanecen abiertos.

Estado final esperado: `approved`.

### 21.7 Decisión transversal

Crea, si está libre:

```text
docs/decisions/DEC-0013_implementable-catalog-and-mutable-world.md
```

Debe registrar por qué se aprueba un catálogo inicial pequeño con profundidad, por qué el entorno es una realidad transformable de primera clase, por qué accesos y transporte forman parte de la topología, y cómo se separan alcance inicial y horizonte máximo.

Estado final esperado: `approved`.

### 21.8 Trazabilidad

Crea, si está libre:

```text
docs/discovery/DISC-0007_implementable-catalog-and-mutable-world-traceability.md
```

Debe distinguir:

- decisiones P01–P24 cerradas;
- reglas aprobadas;
- contenido inicial;
- horizonte futuro;
- parámetros abiertos;
- opciones descartadas;
- contradicciones corregidas;
- documentos afectados;
- separación entre diseño y código.

Estado final esperado: `draft`.

---

## 22. Entidades conceptuales que ARC-005 debe ampliar

Actualiza `ARC-005` sin fijar tablas o clases finales. Debe poder representar conceptualmente, con nombres candidatos coherentes:

- elemento espacial o entidad del mundo común;
- área de terreno;
- cobertura o uso del suelo;
- elemento lineal o corredor;
- nodo o instalación exterior;
- estructura construida no necesariamente edificatoria;
- anclaje;
- abertura;
- cierre instalado;
- obstrucción, barricada o modificación;
- conexión entre espacios;
- parcela de cultivo y estado del cultivo;
- medio de transporte local;
- carga o conjunto de carga;
- punto de transferencia o destino logístico;
- transformación persistente del terreno.

Reglas:

- no todo debe convertirse en una entidad SQL separada;
- no heredes todo de una clase técnica imaginaria;
- registra responsabilidades e identidades conceptuales;
- `DiscoveryState` permanece separado del estado real;
- condición puede aplicarse a cierres, estructuras, medios y objetos;
- un `Building` deja de ser el contenedor universal del mundo;
- una `Room` y una zona exterior pueden participar en conectividad sin ser equivalentes.

---

## 23. Reconciliación obligatoria de documentos existentes

Actualiza solo donde exista responsabilidad real, enlazando sin copiar documentos completos.

### Mundo

- `WLD-005`: aclara que la generación semántica se aplica a lugares edificados y enlaza el modelo de entorno; incorpora accesos coherentes al programa y grafo.
- `WLD-008`: enlaza capas de terreno con su transformación persistente y conserva la estructura espacial invisible.
- `WLD-009`: registra la relación con el catálogo aprobado, la profundidad diferida y la conservación del presupuesto `3 × 3 km` / `55–85` construcciones.
- `WLD-002` y `WLD-004`: solo enlaces o aclaraciones necesarias para terreno, accesos y objetos; no reescribas sus estados.

### Asentamiento

- `SET-001`: conecta crecimiento con áreas, líneas, perímetros, accesos y transformación territorial; no absorbe el detalle de `WLD-010`.
- `SET-002`: incorpora agricultura como una ruta renovable inicial sin convertirla en ruta única.
- `SET-003`: reconcilia recursos agregados, materiales concretos, almacenamiento físico y transporte por etapas.
- `SET-004`: mantiene vehículos y animales como transiciones futuras posibles.
- `SET-005`: enlaza campos, carreteras, barreras, logística y mantenimiento.
- `SET-007`: relaciona puertas, ventanas, cierres y elementos estructurales con recuperación, tapiado y demolición.
- `SET-008`: añade el recorte aprobado y conserva el horizonte máximo; debe seguir distinguiendo objeto, recurso, herramienta y medio de transporte.
- `SET-009`: aclara que su responsabilidad detallada es la transformación de objetos completos, no toda transformación posible del mundo; enlaza terreno y estructuras a sus nuevas fuentes canónicas.

### Catálogos

- `CAT-001`: aclara que lugar no equivale a edificio y que el catálogo de arquetipos no agota las coberturas o elementos lineales del terreno.
- `CAT-002`: incorpora los cuatro programas iniciales, los accesos como parte del grafo y la relación con la adaptación interior.
- `CAT-003`: solo actualiza enlaces si los objetos o contenidos iniciales dependen de ocupantes y profesiones.

### Interfaz y trabajo

- `UI-001`: enlaza designaciones sobre áreas, líneas, accesos y transporte; conserva los tres estados de zona.
- `UI-003`: mantiene las 34 prioridades y ubica agricultura, construcción, reparación y logística en sus familias existentes; no crea una prioridad «Transporte por carretilla» ni «Puertas».
- `UI-004`: conserva presentación cualitativa.
- `UI-005`: aclara que el Canvas representa transformaciones persistentes sin ser fuente de verdad.
- `UI-006`: amplía tipos de objetivo, posibilidades, ficha contextual, acceso y selector de método sin duplicar el motor.

### Arquitectura y amenaza

- `ARC-002`: enlaza persistencia de transformaciones y materialización diferida.
- `ARC-004`: conserva las fronteras del núcleo y estado observable.
- `ARC-005`: amplía entidades según la sección 22.
- `ARC-006`–`ARC-008`: únicamente enlaces y casos de aplicación; no modifiques fórmulas cerradas.
- `THR-001`: solo aclara que medios y trabajos pueden producir ruido causal; no diseña vehículos ni reabre zombis.

### Escenario y roadmap

- `SCN-003`: solo enlaza si es necesario; no garantices carretilla, carro, semillas, cultivo ni vehículo en las pertenencias iniciales.
- `RDM-003`: precisa el contenido aprobado del incremento «Generador semántico inicial y explotación de lugares». No añadas un incremento nuevo, fecha o estado `implemented`.
- `RDM-001`: no se modifica salvo reparación de enlace imprescindible; continúa `deprecated`.

---

## 24. Estados documentales finales

- `CAT-004` pasa de `draft` a `approved` por decisión expresa de Dennis.
- `CAT-005` nace `approved` si contiene íntegramente el recorte aprobado.
- `WLD-010` y `WLD-011` nacen `approved`.
- `SET-010` y `SET-011` nacen `approved`.
- `DEC-0013` nace `approved`.
- `DISC-0007` nace `draft`.
- `SET-008` y `SET-009` conservan `draft` mientras mantengan preguntas abiertas de su horizonte máximo; el recorte inicial aprobado vive en `CAT-005` y documentos funcionales nuevos.
- `RDM-003` permanece `approved` y no ejecutado.
- `WLD-009`, `SCN-001`, `SCN-002` y `SCN-003` conservan `approved`.
- Ningún documento pasa a `implemented`.
- El prototipo Godot continúa histórico y no se reactiva.

Si el estado real de un documento difiere al comenzar, razona el resultado según `DOC-001`; no rebajes silenciosamente una decisión aprobada.

---

## 25. Trazabilidad de las decisiones P01–P24

`DISC-0007` debe registrar explícitamente estas decisiones aceptadas:

| ID | Decisión cerrada |
|---|---|
| P01 | Todo el entorno interactuable es parte persistente y transformable del mundo. |
| P02 | El catálogo inicial contiene exactamente ocho perfiles: cuatro edificios, agua, campo, bosque/matorral y carretera/camino. |
| P03 | Los edificios usan programas variables; primera versión de una planta y sin editor arquitectónico; futuro menú funcional sencillo. |
| P04 | Cualquier terreno físicamente adecuado puede transformarse o construirse; no hay ranuras exclusivas. |
| P05 | La primera versión incluye campo de cultivo, no solo preparación de terreno. |
| P06 | La primera construcción espacial es una barrera lineal sencilla entre anclajes. |
| P07 | El horizonte permite construcción libre y terraformación causal, incluidas nivelación, rampas y escaleras. |
| P08 | El perímetro se deriva de cierres físicos reales; cerrado no equivale automáticamente a seguro. |
| P09 | La carretera es transformable; el primer corte admite despeje y conversión básica a terreno despejado. |
| P10 | El catálogo de objetos comienza pequeño y profundo y se amplía después. |
| P11 | El recorte no sustituye el sistema de objetos/materiales máximo por un recurso mágico; converge hacia él. |
| P12 | Todos los objetivos utilizan una sola gramática de acciones y muestran únicamente posibilidades pertinentes y conocidas. |
| P13 | Se conserva el mapa lógico completo y el detalle se materializa bajo demanda. |
| P14 | Entran agricultura y rendimiento básico sin estaciones, carretera básica y transporte local manual; vehículos quedan fuera de la primera implementación. |
| P15 | Abertura, cierre y modificaciones forman un modelo común para puertas, ventanas, portones, trampillas y brechas. |
| P16 | La posición de los accesos es real, procedural y afecta circulación, defensa y logística. |
| P17 | El primer corte actúa sobre accesos existentes: abrir, cerrar, bloquear, reparar, reforzar, barricadar y tapiar. |
| P18 | Crear, ampliar o trasladar huecos queda aprobado como horizonte mediante una acción contextual, no un CAD obligatorio. |
| P19 | Ventanas y brechas son accesos potenciales, no decoración. |
| P20 | Ruta, carga y medio deben caber realmente por los accesos. |
| P21 | Métodos iniciales: a pulso, recipiente/equipamiento personal, porte coordinado, carretilla y carro manual. |
| P22 | El horizonte incluye otros medios humanos, ayudas mecánicas, animales de carga/tiro y vehículos. |
| P23 | La carga se resume por peso, bulto y etiquetas pertinentes, no solo peso ni geometría milimétrica. |
| P24 | La logística admite etapas y transferencias; el método puede ser `Auto` o específico y nunca teletransporta recursos. |

No reabras estas decisiones como preguntas.

---

## 26. Interpretaciones descartadas

Registra como descartadas y evita que reaparezcan como reglas vigentes:

- lugar = edificio;
- terreno como fondo visual inmutable;
- objetos y edificios como únicos objetivos interactivos;
- agricultura limitada a casillas prefijadas;
- construcción limitada a solares autorizados;
- cambiar una etiqueta para transformar físicamente una zona;
- campo que produce alimento instantáneamente;
- cosecha teletransportada al almacén;
- carretera como textura imposible de modificar;
- despejar y retirar una carretera como la misma acción sin consecuencias;
- muro que cruza una carretera sin bloquearla ni crear acceso;
- recinto dibujado que se vuelve seguro automáticamente;
- muro cerrado invulnerable;
- editor CAD completo en la primera versión;
- planos fijos idénticos para todas las casas;
- puertas colocadas aleatoriamente sin relación con estancias y calle;
- puerta como simple sprite sin topología;
- retirar la puerta y hacer desaparecer también el hueco;
- puerta cerrada equivalente a hueco tapiado;
- ventanas y brechas puramente decorativas;
- objeto voluminoso atravesando cualquier puerta;
- transporte como bonificación abstracta o teletransporte;
- carretilla o carro funcionando igual en cualquier terreno;
- peso como única propiedad de carga;
- simulación milimétrica innecesaria de cada forma;
- cualquier número de ayudantes sumando una bonificación universal;
- método `Auto` omnisciente;
- animales o vehículos funcionales en el primer recorte;
- combustible, electricidad o motor gratuitos;
- almacenamiento como cifra sin contenedores ni espacio;
- «materiales de reparación» como recurso universal independiente;
- desmontar sin trasladar lo recuperado;
- duplicar el motor para edificios, campos, carreteras y objetos;
- mostrar acciones desconocidas en gris revelando secretos;
- mantener `CAT-004` en `draft` después de esta aprobación expresa;
- marcar el catálogo como `implemented` por estar aprobado;
- mantener `55–85` interiores activos simultáneamente;
- ampliar o reactivar el roadmap Godot.

---

## 27. Casos de validación documental obligatorios

La documentación final debe responder sin contradicción, como mínimo, a estos casos.

### Catálogo y mapa

1. `CAT-004` contiene exactamente los ocho perfiles aprobados y está `approved`.
2. Los cuatro edificios iniciales tienen programas distintos y variables.
3. Dos casas del mismo perfil pueden tener estancias, accesos, historia y contenido diferentes.
4. El campo, bosque y carretera son interactuables sin fingir que son edificios.
5. El mapa mantiene `3 × 3 km` y `55–85` construcciones como contrato lógico.
6. Solo el detalle necesario se materializa, sin perder identidad ni reproducibilidad.
7. Un perfil no soportado no se presenta falsamente como interior plenamente jugable.

### Terreno y construcción

8. Un campo histórico cuesta menos preparar que un terreno virgen equivalente, pero no es la única zona cultivable.
9. Una parcela adecuada fuera de un campo preexistente puede transformarse en cultivo.
10. Una pendiente puede nivelarse en el horizonte aportando material y trabajo; no cambia por renombrarla.
11. Una futura rampa modifica acceso; no es decoración.
12. Despejar matorral cambia cobertura, visibilidad y transitabilidad de forma persistente.
13. Una carretera bloqueada puede despejarse sin dejar de ser carretera.
14. Otro trabajo retira su función viaria y la convierte en terreno despejado.
15. Retirar carretera no conserva gratuitamente su ventaja de movimiento.
16. Una barrera de madera se construye entre dos anclajes válidos y consume trabajo/material real.
17. Una barrera no puede atravesar una casa o accidente incompatible sin resolver el trazado.

### Perímetro y accesos

18. Dos casas pueden utilizar sus muros exteriores como parte de un perímetro conectado.
19. Una carretera que cruza el perímetro exige bloqueo, abertura o cambio de trazado.
20. Un portón abierto impide considerar cerrado el control efectivo del acceso aunque la geometría exterior forme un bucle.
21. Un muro roto crea una vulnerabilidad persistente.
22. Demoler una casa usada como anclaje puede abrir el perímetro.
23. Un recinto cerrado no elimina zombis, no explora el interior ni garantiza vigilancia.
24. Una casa genera entrada principal orientada coherentemente con calle o parcela.
25. El supermercado genera acceso público y acceso de carga conectados a estancias pertinentes.
26. El taller genera puerta personal y portón ancho cuando su programa lo requiere.
27. Retirar una puerta deja una abertura.
28. Destruir una puerta puede permitir paso y producir ruido o residuos.
29. Tapiar una entrada transforma el hueco, consume recursos y puede eliminar una evacuación.
30. Una puerta recuperada puede conservar identidad y reutilizarse.
31. Una ventana permite observación o paso solo si posición, tamaño y estado lo permiten.
32. Crear una nueva puerta queda documentado como obra futura con evaluación estructural, no como botón gratuito.

### Agricultura

33. Una parcela pasa por despeje, preparación, siembra, crecimiento y cosecha.
34. Sembrar requiere semillas localizadas y medios pertinentes.
35. El paso del tiempo sin trabajo previo no crea cultivo.
36. El rendimiento puede variar por suelo, agua, cuidados y daño sin mostrar una probabilidad desnuda.
37. El primer loop funciona sin sistema de estaciones.
38. Agricultura es renovable, pero no soluciona automáticamente la comida de la primera noche.
39. La cosecha aparece en el campo y debe transportarse.
40. Abandonar o interrumpir cuidados puede dejar progreso, deterioro o pérdida persistentes.

### Objetos, recursos y desmontaje

41. Un armario puede registrarse, usarse, moverse, repararse o desmontarse según medios.
42. Un frigorífico puede servir de almacenamiento aunque no refrigere.
43. Reparar un frigorífico no garantiza electricidad disponible.
44. Desmontar el frigorífico produce familias coherentes y elimina su identidad funcional.
45. Una bomba reconocida puede estar bloqueada para una persona sin herramienta o conocimiento.
46. Un especialista reconoce mejor el valor; no genera más contenido base.
47. Una puerta completa puede trasladarse; madera genérica no conserva automáticamente función de puerta.
48. «Materiales de reparación» se muestra como resumen, pero la reparación consume familias concretas.
49. Herramientas y carretillas conservan condición y ubicación.
50. El almacenamiento depende de contenedores y espacios físicos.

### Transporte y logística

51. Una persona mueve una caja manejable directamente sin comprobación innecesaria.
52. Un frigorífico exige porte coordinado o medio adecuado.
53. Dos porteadores no pueden atravesar una abertura demasiado estrecha.
54. Una carretilla funciona por un camino compatible y queda bloqueada por una escalera no resuelta.
55. Un carro de compra es eficiente en carretera firme y peor o más ruidoso en grava, barro o escombros.
56. Un objeto ligero pero voluminoso puede fallar por bulto y no por peso.
57. Una tubería larga puede tener problemas de giro.
58. El medio debe encontrarse, reservarse y desplazarse hasta la carga.
59. Cancelar un traslado deja carga y medio donde causalmente corresponda.
60. Un carro llega al portón y la carga se transfiere a porte manual para entrar en una despensa.
61. La cosecha requiere varios viajes si capacidad y volumen lo exigen.
62. `Auto` elige entre medios conocidos y disponibles, no utiliza un vehículo inexistente.
63. El jugador impone carretilla y recibe explicación si la ruta no es viable.
64. Una ruta desconocida puede revelar un bloqueo durante el trabajo.
65. El ruido del transporte puede generar un evento causal sin crear zombis de la nada.
66. Ante amenaza, las personas pueden retirarse dejando carga abandonada según las políticas existentes.
67. Añadir un vigilante aporta vigilancia, no capacidad técnica ficticia.
68. Animales y vehículos aparecen documentados como horizonte, no como métodos activos del primer recorte.

### Acciones, alcance y estados

69. El mismo marco de posibilidad y trabajo resuelve inspeccionar bomba, preparar campo, tapiar puerta y desmontar frigorífico.
70. Una acción no reconocida no aparece.
71. Una acción conocida pero sin materiales aparece bloqueada con causa.
72. El selector de transporte no se confunde con prioridad, equipo, ritmo ni atención.
73. `CAT-005`, `WLD-010`, `WLD-011`, `SET-010`, `SET-011` y `DEC-0013` están `approved` pero no `implemented`.
74. `SET-008` y `SET-009` conservan su horizonte `draft` y enlazan el recorte aprobado.
75. `RDM-003` precisa su incremento existente sin añadir otro ni prometer fecha.
76. Ningún archivo de código o configuración ejecutable cambia.

Añade los casos necesarios para cubrir IDs, enlaces, estados, front matter y cualquier contradicción encontrada durante la reconciliación.

---

## 28. Preguntas que esta entrega cierra y preguntas que conserva

### 28.1 Cierra y retira de OPEN-QUESTIONS

- si se aprueba `CAT-004`;
- composición exacta de los ocho perfiles iniciales;
- cuatro programas iniciales;
- inclusión de perfiles no edificatorios;
- entorno como realidad transformable;
- primitivas espaciales conceptuales;
- agricultura básica dentro del primer catálogo;
- carretera despejable y transformable de forma básica;
- barrera lineal sencilla;
- naturaleza topológica de perímetros y accesos;
- distinción abertura/cierre/modificación;
- posición funcional de puertas;
- acciones iniciales sobre accesos existentes;
- ventanas y brechas como accesos;
- compatibilidad entre carga, ruta y abertura;
- familias iniciales de objetos;
- subconjunto material inicial;
- fin de «materiales de reparación» como pila universal;
- métodos iniciales de transporte local;
- peso + bulto + etiquetas de manipulación;
- logística por fases, transferencias y selección de método;
- marco común de posibilidades para todos los objetivos;
- materialización diferida del detalle.

### 28.2 Mantiene abiertas de forma explícita

- algoritmos geométricos exactos;
- estructura técnica de persistencia;
- valores de equilibrio;
- catálogo completo de cultivos y estaciones;
- fertilidad, rotación, plagas y fertilizantes;
- regeneración ecológica completa;
- catálogo y uso activo de animales;
- catálogo, combustible y uso activo de vehículos;
- extracción profunda por capas de carreteras;
- construcción completa de edificios nuevos;
- editor funcional final de interiores;
- varias plantas y su interfaz;
- ingeniería estructural detallada de huecos;
- daño y asalto detallado contra perímetros;
- fórmulas exactas de ruido;
- capacidades, anchuras, pendientes y velocidades numéricas;
- catálogo máximo de acciones por todos los objetivos futuros.

No mantengas abierta una pregunta que este prompt acaba de cerrar.

---

## 29. Actualizaciones de gobierno, índices y estado

Actualiza como mínimo:

- `docs/STATUS.md`;
- `docs/OPEN-QUESTIONS.md`;
- `docs/INDEX.md` cuando corresponda;
- `docs/20-world/INDEX.md`;
- `docs/40-settlement/INDEX.md`;
- `docs/catalogs/INDEX.md`;
- `docs/90-architecture/INDEX.md` si cambia su resumen;
- `docs/80-interface/INDEX.md` si cambia documentación enlazada;
- `docs/decisions/INDEX.md`;
- `docs/discovery/INDEX.md`;
- `docs/roadmap/INDEX.md` si procede;
- `docs/00-governance/GLOSSARY.md` para nuevos términos canónicos;
- `CHANGELOG.md` según las reglas del repositorio;
- `prompts/INDEX.md` y, si corresponde, `prompts/README.md`.

En `STATUS.md` registra `DESIGN-008` como entrega exclusivamente documental. Resume:

- aprobación del catálogo inicial;
- ocho perfiles;
- programas de edificio;
- entorno mutable;
- agricultura inicial;
- carretera y construcción lineal;
- accesos y perímetros;
- objetos y materiales;
- transporte local y logística por etapas;
- alcance futuro no implementado.

Indica expresamente que no se han implementado mapa, lugares, objetos, agricultura, accesos, transporte, construcción, inventario ni aplicación web.

---

## 30. Validación final

Antes de terminar:

1. Confirma que trabajaste desde `main` con `DESIGN-007` fusionado.
2. Comprueba que el prompt quedó guardado literalmente y enlazado.
3. Revisa que `CAT-004` pase a `approved` y no a `implemented`.
4. Cuenta y verifica los ocho perfiles exactos.
5. Verifica que solo cuatro son programas de edificio iniciales.
6. Comprueba que lugar no se utiliza como sinónimo universal de edificio.
7. Comprueba que terreno, carretera y bosque no sean meros fondos visuales.
8. Verifica que la agricultura básica esté dentro del recorte y las estaciones fuera.
9. Verifica que la cosecha permanezca localizada.
10. Comprueba que carretera despejada y carretera retirada/convertida no se confundan.
11. Verifica barrera, anclajes, perímetro y cruce de carretera.
12. Comprueba que cerrado no equivalga a seguro.
13. Verifica abertura, cierre y modificación como conceptos separados.
14. Comprueba que retirar una puerta no elimine el hueco.
15. Verifica colocación procedural coherente de accesos.
16. Comprueba que crear nuevos huecos quede como horizonte, no primera herramienta CAD.
17. Verifica compatibilidad de accesos con carga y transporte.
18. Comprueba los cinco métodos activos de transporte.
19. Verifica que animales y vehículos permanezcan en horizonte.
20. Comprueba peso, bulto y etiquetas de manipulación.
21. Verifica logística por etapas y puntos de transferencia.
22. Comprueba que `Auto` no sea omnisciente ni se confunda con otros selectores.
23. Verifica que «materiales de reparación» no siga siendo pila universal.
24. Comprueba que `SET-003`, `SET-008` y `SET-009` estén reconciliados sin borrar el horizonte máximo.
25. Verifica que solo exista un motor de acciones/resolución.
26. Comprueba la regla visible/gris/ausente de posibilidades.
27. Verifica que el mapa lógico completo y la materialización diferida convivan sin contradicción.
28. Comprueba que `RDM-003` solo precise el incremento existente.
29. Verifica que `RDM-001` siga `deprecated`.
30. Comprueba que ningún documento esté `implemented`.
31. Busca duplicaciones canónicas y reemplázalas por enlaces.
32. Comprueba front matter, IDs, `canonical_for`, `depends_on`, `related` y estados.
33. Comprueba enlaces relativos e índices.
34. Revisa que cada documento mantenga una responsabilidad y tamaño razonables; divide si se aproxima a un GDD monolítico.
35. Ejecuta `git diff --check`.
36. Confirma que no cambió código, configuración ejecutable ni dependencias.

No instales herramientas ni ejecutes suites de código.

---

## 31. Informe final obligatorio

El informe final de Claude Code debe incluir:

1. Confirmación de la base (`DESIGN-007` fusionado en `main`).
2. Rama creada y commit.
3. URL o referencia de la PR, confirmando que no se fusionó.
4. Documentos nuevos.
5. Documentos modificados.
6. Estados finales.
7. Ocho perfiles aprobados.
8. Cuatro programas de edificio.
9. Explicación del modelo nodo/línea/área/estructura.
10. Explicación de terreno, carretera, agricultura y construcción lineal.
11. Explicación del modelo abertura/cierre/modificación.
12. Explicación de cómo puertas y portones afectan perímetro y logística.
13. Catálogo inicial de objetos y materiales.
14. Métodos de transporte activos y horizonte futuro.
15. Explicación de carga, rutas, fases y transferencias.
16. Reconciliación de «materiales de reparación».
17. Preguntas cerradas y parámetros todavía abiertos.
18. Contradicciones corregidas.
19. Confirmación de que `RDM-003` no ganó un incremento nuevo.
20. Confirmación de que no se implementó código.
21. Resultado de validación de enlaces, búsquedas y `git diff --check`.

No declares completada la entrega si falta alguna decisión P01–P24, si `CAT-004` sigue `draft`, si se ha reducido el horizonte máximo, si se han mezclado catálogo y estado implementado, si el entorno continúa subordinado a edificios, si puertas o transporte siguen siendo decorativos, si se ha dejado agricultura fuera, si se ha introducido código o si la PR no ha sido creada.
