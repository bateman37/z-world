# PROMPT PARA CLAUDE CODE — DESIGN-006: cierre del motor de simulación, resolución y presentación de capacidades

## 0. Encargo

Realiza una entrega **exclusivamente documental** en el repositorio `bateman37/z-world` para cerrar, reconciliar e indexar el diseño del motor que resuelve acciones, trabajos y eventos.

Esta entrega debe convertir en decisiones canónicas las veintidós cuestiones `P01`–`P22` registradas en `ARC-008`, incorporando las correcciones finales de Dennis sobre:

- escala real `0–10` para características y habilidades;
- valor `4` como referencia humana media en características;
- existencia real del valor `0`, separado de dato desconocido y de falta de conocimiento;
- tres perfiles cerrados de ponderación entre características y habilidades;
- modelo híbrido de ejecución directa, progreso continuo `D` y comprobaciones significativas `B`;
- umbral de **tres puntos**, no dos, para considerar rutinaria una tarea por superioridad de capacidad;
- cooperación por funciones reales, responsable, supervisión y rendimientos decrecientes;
- dos dimensiones combinables para el modo de trabajo;
- resultados multidimensionales, conocimiento imperfecto, reintentos, aprendizaje y eventos;
- persistencia determinista del azar con equivalencia entre velocidades;
- nivel actual numérico visible en la ficha del personaje;
- potencial real, calibre y máximo numérico siempre ocultos;
- potencial estimado comunicado mediante frases como «puede mejorar mucho», «parece estar cerca de su máximo» o equivalentes, con confianza y evidencia.

No programes nada. No inicialices ni modifiques la aplicación web. No implementes fórmulas, clases, APIs, tablas, migraciones, componentes ni pruebas ejecutables. Esta entrega debe dejar el diseño preparado para que una implementación posterior no tenga que reinterpretar conversaciones ni inventar reglas.

La calidad documental es prioritaria. No reduzcas el encargo a un resumen, no concentres todo en un único documento nuevo y no copies las decisiones sin reconciliarlas con las fuentes canónicas existentes.

---

## 1. Reglas obligatorias de trabajo y Git

### 1.1 Punto de partida

Antes de editar:

1. Lee completos `AGENTS.md` y `CLAUDE.md`.
2. Comprueba el estado real del repositorio y del `main` remoto.
3. Lee `docs/INDEX.md`, `docs/STATUS.md`, `docs/OPEN-QUESTIONS.md` y los índices de todos los dominios afectados.
4. Lee completos todos los documentos enumerados en la sección 2 y sus dependencias declaradas cuando sean necesarias para interpretar correctamente una regla.
5. No confíes en ramas antiguas, conversaciones resumidas ni documentación del prototipo Godot como fuente activa.

Trabaja en una **rama documental nueva creada desde el `main` remoto actualizado**. No reutilices ramas de `IMPLEMENTATION-004`, Godot ni entregas documentales anteriores.

Nombre sugerido:

```text
docs/design-006-resolution-engine-closure
```

Si no puedes partir del `main` remoto vigente sin destruir cambios ajenos, detente e informa. No uses `reset --hard`, no borres trabajo y no sobrescribas una rama ajena.

### 1.2 Pull request

Al terminar:

1. Guarda este prompt literal en:

   ```text
   prompts/DESIGN-006_resolution-engine-closure.md
   ```

2. Actualiza `prompts/INDEX.md` y cualquier índice de prompts pertinente.
3. Haz commit de la entrega documental.
4. Publica la rama.
5. Crea la pull request, pero **no la fusiones**.

Título sugerido:

```text
DESIGN-006: cierre del motor de resolución y capacidades
```

La descripción debe enumerar:

- documentos creados y modificados;
- decisiones `P01`–`P22` cerradas;
- contradicciones corregidas;
- preguntas retiradas de `OPEN-QUESTIONS.md`;
- preguntas de otros dominios que permanecen realmente abiertas;
- estados documentales modificados;
- validaciones ejecutadas;
- confirmación expresa de que no se ha implementado código.

### 1.3 Alcance técnico prohibido

No debes:

- modificar `src/`, `scenes/`, `tests/`, `project.godot` ni ningún archivo del prototipo histórico Godot;
- crear o modificar código Node.js, TypeScript, Next.js, React, Canvas, Prisma o PostgreSQL;
- añadir dependencias, paquetes, esquemas o migraciones;
- implementar generadores, personajes, trabajos, combate, interfaz o persistencia;
- ejecutar suites globales o instalar herramientas innecesarias;
- reabrir el catálogo de nueve características y 34 habilidades de `CHR-006`;
- mostrar el potencial real, el calibre oculto o el máximo numérico de desarrollo;
- convertir ejemplos de este prompt en contenido implementado;
- marcar una capacidad como `implemented`;
- fusionar la PR.

---

## 2. Lectura obligatoria y matriz de reconciliación

Lee completos, como mínimo:

### Gobierno, estado y glosario

- `AGENTS.md`
- `CLAUDE.md`
- `README.md`
- `CHANGELOG.md`
- `docs/INDEX.md`
- `docs/STATUS.md`
- `docs/OPEN-QUESTIONS.md`
- `docs/00-governance/DOC-001_documentation-system.md`
- `docs/00-governance/GLOSSARY.md`

### Personajes, habilidades y aprendizaje

- `docs/30-characters/INDEX.md`
- `docs/30-characters/CHR-001_character-model.md`
- `docs/30-characters/CHR-002_knowledge-and-learning.md`
- `docs/30-characters/CHR-003_autonomy-intentions-and-behavior.md`
- `docs/30-characters/CHR-004_life-history-and-personal-arcs.md`
- `docs/30-characters/CHR-006_characteristics-and-skill-catalog.md`
- `docs/30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md`

### Motor de simulación y persistencia

- `docs/90-architecture/INDEX.md`
- `docs/90-architecture/ARC-002_procedural-generation-and-persistence.md`
- `docs/90-architecture/ARC-003_multiscale-simulation-principles.md`
- `docs/90-architecture/ARC-004_simulation-core-runtime-and-boundaries.md`
- `docs/90-architecture/ARC-006_action-and-event-resolution-model.md`
- `docs/90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md`
- `docs/90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md`

### Trabajo, control e interfaz

- `docs/80-interface/INDEX.md`
- `docs/80-interface/UI-001_interaction-and-command-model.md`
- `docs/80-interface/UI-002_management-at-community-scale.md`
- `docs/80-interface/UI-003_work-priority-taxonomy.md`
- `docs/80-interface/UI-004_qualitative-capability-presentation.md`
- `docs/80-interface/UI-006_contextual-place-interaction-and-teams.md`

### Mundo, conocimiento, objetos y amenazas

- `docs/20-world/WLD-002_local-exploration-and-information.md`
- `docs/20-world/WLD-004_expertise-dependent-recovery.md`
- `docs/40-settlement/SET-003_resources-logistics-and-condition.md`
- `docs/40-settlement/SET-006_knowledge-assets-and-capability.md`
- `docs/40-settlement/SET-008_object-model-and-logistics-families.md`
- `docs/40-settlement/SET-009_disassembly-and-world-transformation.md`
- `docs/60-threats/THR-001_zombie-threat-model.md`
- `docs/70-narrative/NAR-002_memory-and-causal-world-history.md`

### Decisiones, discovery y roadmap

- `docs/decisions/INDEX.md`
- `docs/decisions/DEC-0003_data-driven-design.md`
- `docs/decisions/DEC-0005_reproducible-lazy-generation.md`
- `docs/decisions/DEC-0007_layered-work-and-priorities.md`
- `docs/decisions/DEC-0008_simulation-first-web-architecture.md`
- `docs/decisions/DEC-0009_character-catalog-and-resolution-engine-domain.md`
- `docs/discovery/INDEX.md`
- cualquier documento de discovery que trace el motor, personajes u objetos;
- `docs/roadmap/RDM-003_simulation-first-playable-roadmap.md`.

Antes de escribir, construye para tu trabajo una matriz con:

| Decisión | Fuente canónica principal | Fuentes que deben reconciliarse | Estado anterior | Estado final | Contradicción o pregunta retirada |
|---|---|---|---|---|---|

No es obligatorio publicar esta tabla por separado si toda la trazabilidad queda conservada en un documento de discovery, pero debes utilizarla para revisar las veintidós decisiones una por una.

Si encuentras una contradicción que este prompt resuelve, aplica este prompt como decisión posterior. Si encuentras otra contradicción no resuelta, no inventes una solución: regístrala sin impedir el cierre de `P01`–`P22`.

---

## 3. Principios invariantes del motor

Conserva y refuerza estos principios:

1. El azar modula lo posible, pero no redefine la realidad.
2. El azar no crea objetos, recursos, pistas, conocimientos ni capacidades inexistentes.
3. Existencia, percepción, comprensión y aprovechamiento son capas distintas.
4. La competencia importa: un experto es mucho más fiable que un principiante.
5. En una acción incierta pero realmente accesible, un principiante puede superar ocasionalmente a un experto.
6. Conocimientos, herramientas, acceso y otros requisitos indispensables se comprueban antes del azar.
7. Una acción básica y viable se ejecuta sin porcentaje artificial de fracaso.
8. El progreso continuo y las comprobaciones puntuales conviven en un único procedimiento.
9. No se comprueba por fotograma, animación o segundo.
10. El progreso, los materiales consumidos, el daño, el conocimiento y las consecuencias persisten.
11. Un reintento exige nuevo esfuerzo, información, método, medios, persona, estado o riesgo; nunca es una pulsación gratuita.
12. La cooperación depende de funciones y aportaciones reales, no de sumar cuerpos.
13. Prioridad, método, ritmo, atención, equipo, asignación y riesgo son conceptos diferentes.
14. Error de ejecución, incumplimiento del objetivo, incidencia, peligro y gravedad no son sinónimos.
15. El jugador comprende causas y riesgos sin gestionar dados ni porcentajes.
16. La misma semilla, estado y órdenes producen el mismo mundo y los mismos resultados relevantes, independientemente de cámara, FPS, recarga o velocidad.

Mantén el procedimiento común:

> **Estado real → objetivo y método → requisitos → responsable y equipo → capacidades pertinentes → ritmo, atención y condiciones → ejecución directa, progreso D o comprobación B → consecuencias multidimensionales → actualización persistente.**

No obligues a que una acción simple atraviese todas las capas.

---

## 4. P01 — Escala `0–10` y significado de los niveles

### 4.1 Decisión cerrada

Características y habilidades utilizan una escala real `0–10`. Corrige toda referencia activa que siga describiéndola como `1–10`.

El valor `4` es la referencia humana media para una característica. No significa que toda persona posea nivel 4 en todas las habilidades especializadas.

Usa como calibración canónica:

| Nivel | Característica | Habilidad |
|---:|---|---|
| 0 | Ninguna capacidad funcional utilizable en esa dimensión; estado extremo, no normal en una persona viable | Ninguna competencia práctica actual |
| 1 | Extremadamente baja | Sin formación; tanteo muy elemental |
| 2 | Muy baja | Principiante, primeras nociones |
| 3 | Inferior a la media | Base limitada o aprendizaje inicial |
| 4 | Media humana | Competencia funcional en esa habilidad |
| 5 | Por encima de la media | Competente y fiable en situaciones habituales |
| 6 | Notable | Experimentada, capaz de afrontar variedad y dificultad |
| 7 | Muy notable | Avanzada, claramente superior a la mayoría |
| 8 | Excepcional | Experta |
| 9 | Extraordinaria | Referente de primer nivel |
| 10 | Extremo humano muy raro | Maestría humana excepcional |

Matices obligatorios:

- `0` es un valor real, no `null`, no «desconocido» y no un dato ausente.
- En características, un `0` base es excepcional; un estado físico o mental puede llevar una capacidad **efectiva** a cero sin convertir necesariamente el valor base en cero.
- En habilidades, `0` puede ser normal cuando no existe experiencia práctica.
- Un `0` actual no implica potencial cero.
- El potencial mínimo ya aprobado permite que cualquier persona aprenda competencias humanas básicas cuando existan oportunidades y medios.
- Los niveles actuales pueden conservar progreso interno fraccionario, aunque la ficha muestre un valor entero `0–10`.
- Los cálculos conservan precisión y solo redondean al final de la presentación correspondiente.

Actualiza `CHR-006`, `CHR-007`, `ARC-006`, `ARC-008`, el glosario y cualquier ejemplo activo incompatible.

---

## 5. P02 — Cero, dato desconocido, conocimiento y precisión

Documenta como cuatro capas separadas:

1. **Nivel real actual:** número `0–10` de característica o habilidad.
2. **Conocimiento/técnica:** información o procedimiento concreto que puede estar presente o ausente.
3. **Información de la comunidad:** lo que se sabe sobre la persona, el método o el mundo.
4. **Confianza:** solidez de esa información.

Reglas:

- No conocer un procedimiento eléctrico no equivale automáticamente a Electricidad `0`.
- Electricidad `0` no significa que el dato sea desconocido.
- Un valor desconocido no se sustituye por `4`, no se elimina de una media y no se inventa.
- La ausencia de un conocimiento indispensable puede bloquear un método aunque la habilidad general sea alta.
- La falta de práctica puede permitir métodos básicos o guiados cuando estos lo declaren.
- Las medias y modificadores se conservan con precisión interna; no se redondea cada paso.
- No se aplica dos veces una misma causa, por ejemplo cansancio sobre dos capacidades y de nuevo sobre el resultado global.

El nivel actual numérico de la ficha será visible según P22. La incertidumbre sobre potencial, resultados y conocimiento del mundo permanece separada.

---

## 6. P03 — Tres perfiles de ponderación

Después de obtener la característica efectiva y la habilidad efectiva, la fase elige uno de estos perfiles cerrados:

| Perfil | Característica | Habilidad | Uso conceptual |
|---|---:|---:|---|
| Instintivo o físico | 70 % | 30 % | Predominio corporal, sensorial o inmediato |
| Equilibrado | 50 % | 50 % | La aptitud general y la experiencia importan de forma similar |
| Técnico o aprendido | 30 % | 70 % | Predominio del dominio adquirido y el procedimiento |

Fórmula conceptual:

```text
capacidad = característica_efectiva × peso_característica
          + habilidad_efectiva × peso_habilidad
```

Casos permitidos y excepcionales:

- una acción cotidiana puede no necesitar habilidad;
- una fase puede depender solo de características;
- una fase puramente aprendida puede depender solo de habilidad y requisitos de conocimiento;
- no se crean porcentajes artesanales distintos para cada objeto;
- el perfil pertenece a la fase o método, no a la persona;
- una o dos características se agrupan primero mediante media aritmética;
- una o dos habilidades se agrupan primero mediante media aritmética;
- la media de una persona nunca es una fórmula de cooperación entre varias personas.

Incluye ejemplos de los tres perfiles, pero márcalos como ilustrativos y evita crear un catálogo exhaustivo de acciones.

---

## 7. P04 — Modelo B: margen, azar acotado y grados de resultado

### 7.1 Función conceptual aprobada

Para una incertidumbre significativa y accesible:

```text
margen_previo = capacidad_efectiva - dificultad_efectiva
margen_final = margen_previo + variación_B
```

`dificultad_efectiva` incorpora método y condiciones pertinentes sin contabilizar dos veces una misma causa.

### 7.2 Distribución del azar

`variación_B`:

- está centrada en `0`;
- usa una distribución de campana, no uniforme;
- tiene desviación orientativa `1,15`;
- queda limitada al intervalo `[-4, +4]`;
- hace habituales las variaciones pequeñas y muy raras las extremas;
- se genera de forma determinista y persistente según P21.

La especificación documental puede describirla como una distribución normal truncada con esos parámetros. No programes ni elijas una librería.

### 7.3 Cinco bandas internas

| Margen final | Banda interna | Interpretación |
|---:|---|---|
| `>= 3` | Excepcional | Resultado especialmente favorable dentro de lo físicamente posible |
| `>= 1` y `< 3` | Favorable | Se alcanza bien el resultado buscado |
| `>= -1` y `< 1` | Parcial o incierto | Avance, resultado mixto, provisional o información incompleta según la acción |
| `> -3` y `< -1` | Deficiente recuperable | No se alcanza plenamente; persisten consecuencias, costes o trabajo aprovechable |
| `<= -3` | Grave potencial | Solo produce gravedad si la acción contenía un peligro o una consecuencia grave plausible |

Las bandas son internas. Cada familia traduce el resultado a lenguaje causal: una reparación puede quedar provisional; una inspección, incompleta; una pieza, dañada; una negociación, estancada.

Reglas:

- Una banda grave no crea una lesión si no había peligro de lesión.
- Una banda excepcional no crea recursos ni evidencia inexistentes.
- Los requisitos imposibles se bloquean antes de B.
- B no se usa en toda rutina.
- Una resolución coherente puede producir varios efectos relacionados; no se sortean diez consecuencias independientes sin necesidad.
- El jugador no ve el margen, la variación, los umbrales ni un porcentaje exacto.

---

## 8. P05 — Modelo D: variación del progreso continuo

El progreso `D` representa trabajo prolongado y conocido.

Decisiones:

- La variación aleatoria de rendimiento es pequeña: hasta `±8 %` respecto al ritmo calculado.
- Se genera por fase o sesión significativa, no por tick ni por segundo.
- Se mantiene estable al pausar, guardar, cargar o cambiar de velocidad.
- Una interrupción que reanuda la misma fase conserva la variación ya fijada.
- Un cambio real de persona, método, herramienta, estado o fase puede recalcular el rendimiento futuro, nunca el progreso pasado.
- Fatiga, heridas, entorno, herramienta y coordinación son causas distintas y pueden tener efectos mayores que el `±8 %`; no forman parte del ruido aleatorio.
- `D` no necesita permitir que un principiante supere en velocidad a un experto. Las sorpresas pertinentes viven en `B`.
- No existe una tirada final que pueda borrar horas de trabajo correcto.

---

## 9. P06 — Requisitos duros e improvisación por método

Los requisitos pertenecen al **método**, no al objetivo abstracto.

Un objetivo puede admitir métodos diferentes: reparación profesional, sustitución, arreglo provisional, adaptación improvisada, desmontaje o abandono.

Cada método puede declarar:

- conocimientos o técnicas indispensables;
- herramientas;
- materiales;
- energía o infraestructura;
- acceso físico;
- número mínimo de personas;
- funciones necesarias;
- estado mínimo de la persona;
- condiciones ambientales;
- riesgos y consecuencias posibles.

Clasificación aprobada:

1. **Abierto:** cualquiera físicamente capaz puede intentarlo.
2. **Improvisable:** admite una alternativa real más lenta, costosa, frágil o arriesgada.
3. **Guiado o supervisado:** una persona sin dominio completo puede ejecutar pasos permitidos con manual, instrucciones o supervisión efectiva.
4. **Restringido:** sin el conocimiento, medio o condición indispensable, ese método no puede intentarse.

La improvisación debe ser un método descrito y causal, no una probabilidad residual de realizar lo imposible. Bloquear un método no bloquea otros métodos posibles ni otras interacciones con el objetivo.

---

## 10. P07 — Clasificación dinámica de tareas básicas

Una tarea es básica **para una persona, método y situación**, no universalmente.

Se ejecuta directamente cuando:

1. cumple todos los requisitos duros;
2. el método es conocido o suficientemente familiar;
3. la capacidad efectiva supera la dificultad efectiva en **tres puntos o más**;
4. las condiciones son estables;
5. no existe oposición activa;
6. no queda una incertidumbre significativa de descubrimiento, diagnóstico, persuasión o resultado;
7. un pequeño error no puede producir una consecuencia grave pertinente.

Corrige cualquier propuesta anterior que use una diferencia de dos puntos. El umbral acordado es `+3`.

Ejecución directa no significa instantánea, gratuita o inmune a interrupciones. Puede consumir tiempo, materiales, esfuerzo, herramienta y energía. Dos personas pueden completar directamente el mismo trabajo a ritmos diferentes.

---

## 11. P08 — Fases comprobables y episodio persistente

Una comprobación `B` solo aparece ante una oportunidad significativa, como:

- descubrir o interpretar información;
- comprometer material irreversible;
- manipular un elemento delicado;
- entrar en oposición con otro agente;
- exponerse a un peligro;
- verificar un resultado genuinamente incierto;
- cambiar de método de forma significativa.

Un episodio queda definido conceptualmente por:

```text
objetivo + método + blanco + participantes + condiciones relevantes + esfuerzo comprometido
```

Reglas:

- No se comprueba por fotograma, animación, golpe, paso ni unidad transportada.
- Interrumpir y continuar el mismo episodio no genera otra oportunidad aleatoria.
- Guardar/cargar no genera otra oportunidad.
- Cambiar solo el nombre de la orden o alternar un modo sin trabajo real no genera otra oportunidad.
- Otra persona, nueva evidencia, descanso, herramienta diferente, método distinto, mayor profundidad o cambio real de condiciones pueden justificar un nuevo episodio o una nueva fase.
- Una semana de trabajo no puede quedar resumida arbitrariamente en una única tirada final si contiene fases físicamente separables.

---

## 12. P09 — Cooperación por funciones y rendimientos decrecientes

No existe una «habilidad media del equipo» ni un superpersonaje formado con el mejor valor de cada integrante.

Cada acción puede declarar:

- mínimo de personas;
- número recomendado;
- máximo útil simultáneo;
- funciones posibles;
- requisitos individuales o compartidos;
- limitaciones de espacio, acceso y herramientas;
- partes paralelizables.

Funciones aprobadas cuando aporten algo real:

- responsable;
- ejecutor técnico o principal;
- ayudante operativo;
- apoyo logístico;
- revisor;
- vigilancia o retaguardia.

Para una tarea compartida no plenamente paralelizable, usa como referencia de contribución máxima al progreso `D`:

| Participación | Contribución máxima adicional al ritmo principal |
|---|---:|
| Ejecutor principal | 100 % de su ritmo |
| Primer ayudante útil | hasta 60 % |
| Segundo ayudante útil | hasta 35 % |
| Tercer ayudante útil | hasta 20 % |

La contribución real depende de idoneidad, función, espacio, medios y coordinación. No es una bonificación garantizada.

Para calidad o incertidumbre `B`:

- usa la capacidad de quien ejecuta la fase;
- un ayudante puede habilitar el método, eliminar una penalización causal, reducir dificultad, aportar una revisión o asumir otra fase;
- no transfiere su habilidad completa al ejecutor;
- un especialista complementario resuelve su aportación real, no fusiona puntuaciones;
- Liderazgo mejora coordinación y traspasos cuando sea pertinente, pero no sustituye conocimientos técnicos;
- una tarea verdaderamente paralela se divide en trabajos o frentes relacionados en lugar de acumular ayudantes ilimitados.

Conserva el selector ya aprobado `Auto / 1 / 2 / 3 / 4`, la asignación `Comunidad` o `Equipo seleccionado` y el hecho de que `4` no es un límite del motor.

---

## 13. P10 — Responsable, ejecutor, supervisor y sustitución

Documenta estas funciones como separables:

- **Responsable:** mantiene el objetivo, coordina y toma decisiones del trabajo.
- **Ejecutor principal:** realiza la fase técnica o material principal.
- **Supervisor:** habilita o guía pasos que otras personas pueden realizar.

Una misma persona puede ocupar varias funciones cuando la escala lo permita.

Selección automática:

1. requisitos y conocimiento del método;
2. capacidad pertinente;
3. estado y disponibilidad;
4. experiencia con objetivo o procedimiento;
5. Liderazgo como criterio de coordinación, no como sustituto técnico.

El jugador puede elegir manualmente responsable y equipo.

Si el responsable deja de participar:

- continúan las tareas auxiliares seguras y autorizadas;
- se detienen las fases que necesiten su presencia, decisión o conocimiento;
- una persona cualificada puede asumir el rol;
- el progreso se conserva;
- el relevo necesita tiempo de puesta al día proporcional a registros, complejidad y comunicación;
- nadie recibe mágicamente el conocimiento tácito del responsable.

Supervisión:

- exige presencia, atención o comunicación realmente utilizable;
- en tareas delicadas o de riesgo suele ser `1:1`;
- en rutinas guiadas puede cubrir a dos o más personas si el método lo permite;
- consume parte de la atención y tiempo del supervisor;
- no concede bonificación remota por figurar en la orden;
- permite ejecutar pasos transferibles, no delegar técnicas intransferibles.

---

## 14. P11 — Dos dimensiones combinables de modo

Sustituye la lectura de cuatro modos mutuamente excluyentes por dos dimensiones internas:

### 14.1 Ritmo

- **Relajado:** sin apremio, con pausas naturales y dentro de una situación que el equipo considera segura.
- **Normal:** ritmo habitual del procedimiento.
- **Rápido:** prioriza terminar antes en los pasos que admiten aceleración.

### 14.2 Atención o alcance

- **Estándar:** profundidad normal del método.
- **Cuidadoso:** prioriza precisión, conservación, preparación y reducción de errores evitables dentro del alcance elegido.
- **Exhaustivo:** amplía cobertura, comprobaciones o profundidad de búsqueda dentro del alcance físico y metodológico posible.

Las dimensiones son combinables cuando tengan sentido: relajado y exhaustivo, normal y cuidadoso, rápido y estándar, o incluso rápido y cuidadoso en una urgencia que requiera ambas intenciones.

La interfaz puede ofrecer presets contextuales y ocultar opciones irrelevantes. No obligues al jugador a gestionar controles sin efecto en una tarea simple.

`Relajado` no significa exhaustivo, cuidadoso, seguro de forma omnisciente ni mejor calidad. `Exhaustivo` no significa omnisciencia. `Cuidadoso` no garantiza éxito.

---

## 15. P12 — Efectos y costes de ritmo y atención

Usa estos rangos como marco de diseño, no como multiplicadores universales aplicados a toda acción:

| Opción | Efectos y costes posibles |
|---|---|
| Relajado | Pausas naturales, menor presión y menor acumulación de estrés/fatiga en trabajos largos seguros; no mejora cobertura ni calidad por sí mismo |
| Normal | Referencia de la familia de trabajo |
| Rápido | Reducción aproximada del tiempo de `20–35 %` donde se pueda acelerar; puede aumentar fatiga, ruido, desgaste, omisiones, consumo o exposición |
| Cuidadoso | Aumento aproximado del tiempo de `25–50 %`; puede mejorar conservación, precisión, calidad o reducción de errores evitables |
| Exhaustivo | Aumento aproximado del trabajo de `50–200 %` según alcance; mejora cobertura y oportunidades de detectar o comprobar, pero alarga fatiga y exposición |

Cada familia declara qué ejes son pertinentes. No apliques todos los efectos a la vez ni conviertas una opción en universalmente óptima.

El cambio de modo afecta solo al trabajo pendiente. No repara retroactivamente una pieza, no mejora una zona ya revisada y no devuelve recursos consumidos.

---

## 16. P13 — Límites temporales, prioridad e herencia

Un taller, edificio, zona o tipo de trabajo puede conservar políticas predeterminadas de:

- equipo habitual;
- ritmo y atención;
- horario;
- prioridad;
- riesgo admitido;
- herramientas preferidas;
- reglas de repetición.

Al crear una orden, esta **copia** los valores vigentes. Cambiar después el lugar no modifica silenciosamente una orden iniciada; debe existir una acción explícita para aplicar la nueva política.

Límites posibles, mostrados solo cuando sean pertinentes:

- hasta completar;
- hasta una hora o momento;
- durante una cantidad de trabajo;
- hasta el anochecer;
- hasta producir, recuperar o almacenar una cantidad;
- hasta gastar un presupuesto;
- hasta alcanzar un punto seguro.

Al alcanzar el límite:

- se conserva todo el progreso;
- se completa únicamente el paso mínimo necesario para detenerse con seguridad;
- se actualizan y liberan reservas según corresponda;
- se informa de lo realizado y lo pendiente;
- no se declara fracaso por no haber autorizado más tiempo.

Prioridad decide qué se atiende antes; no equivale a rapidez, riesgo, método ni calidad.

---

## 17. P14 — Respuesta ante cambios, pérdida de medios y amenazas

Políticas cualitativas aprobadas:

| Política | Conducta general |
|---|---|
| Prudente | Se detiene y reevalúa ante cualquier riesgo nuevo relevante |
| Estándar | Continúa ante cambios menores; pausa si el método deja de ser válido o aparece peligro real |
| Decidida | Acepta riesgos conocidos dentro del límite autorizado de la orden |
| Emergencia | Prioriza salvar vidas o contener el desastre sin ignorar límites físicos |

Reglas:

- perder un requisito imprescindible bloquea únicamente la fase afectada;
- un peligro inmediato permite autoprotección o retirada sin esperar una orden;
- un cambio menor recalcula lo pendiente, no el pasado;
- personalidad, miedo, disciplina, lealtad, autonomía y relación con el responsable pueden modificar la reacción;
- una orden no convierte a la persona en un dron suicida;
- elegir relajado no vuelve seguro un peligro oculto;
- una persona puede malinterpretar el riesgo por conocimiento imperfecto;
- toda interrupción conserva progreso, estado, consumo y conocimiento.

Reconcílialo con `CHR-003`, `UI-006`, `THR-001` y P20.

---

## 18. P15 — Resultados multidimensionales, críticos e incidencias

No utilices «crítico» o «pifia» como una capa universal que inventa acontecimientos.

Un resultado puede afectar, cuando corresponda, a:

- cumplimiento del objetivo;
- progreso;
- calidad;
- conservación;
- duración;
- consumo;
- ruido;
- desgaste;
- fatiga;
- información;
- exposición;
- daño;
- relaciones o memoria.

Las dimensiones deben derivarse de una causa coherente y pueden quedar vinculadas por una única resolución. No se realizan tiradas independientes para cada eje salvo que representen incertidumbres realmente diferentes.

Reglas:

- Un resultado excepcional permanece dentro de los límites del mundo.
- Un resultado técnico deficiente no lesiona automáticamente.
- Una lesión necesita un peligro capaz de causarla.
- Protección puede reducir consecuencias sin mejorar la calidad técnica.
- Una buena planificación conserva la reducción de riesgo obtenida; el motor no inventa otra amenaza para compensarla.
- La exposición se acumula según tiempo y condiciones, nunca mediante una probabilidad fija por fotograma.
- Un peligro puede programar una oportunidad causal de incidencia dentro del episodio; el momento y resultado quedan sujetos a P21.
- Una banda grave de B se traduce al peor resultado coherente que esa acción permita, no a una catástrofe universal.

---

## 19. P16 — Conocimiento imperfecto y comunicación

Conserva cuatro capas:

1. realidad existente;
2. percepción;
3. interpretación o creencia;
4. capacidad de aprovechamiento.

Una interpretación puede registrar conceptualmente:

- autor;
- evidencia usada;
- conclusión o hipótesis;
- confianza cualitativa;
- fecha;
- método;
- personas a quienes se comunicó;
- revisiones posteriores.

Intensidad acordada:

- incertidumbre frecuente cuando faltan pruebas;
- errores plausibles ocasionales;
- errores firmes poco habituales en especialistas, salvo evidencia pobre, estado adverso o casos extraordinarios;
- nada de producir continuamente información falsa por drama;
- una nueva revisión puede confirmar, matizar o corregir;
- dos personas pueden discrepar;
- el conocimiento no se teletransporta a toda la comunidad;
- una actuación aislada no revela el techo de una persona;
- el fallo de un experto puede ser propio y no necesita justificarse siempre mediante un peligro externo.

La interfaz debe poder expresar autoría y confianza: «Marta cree que…», «faltan comprobaciones», «la última revisión fue…».

---

## 20. P17 — Reintentos y presupuestos de autonomía

Un intento idéntico no genera otra resolución gratuita.

Puede existir un nuevo intento por:

- nuevo trabajo o mayor profundidad;
- método diferente;
- otra persona;
- herramienta distinta;
- nueva evidencia;
- descanso o cambio real de estado;
- aceptación de mayor consumo, daño o riesgo;
- reparación o repetición física de una parte deteriorada.

Cada orden puede definir:

- tiempo máximo;
- presupuesto de materiales;
- riesgo máximo;
- repeticiones automáticas;
- cuándo solicitar ayuda;
- cuándo cambiar de método;
- cuándo detenerse;
- si admite improvisación.

El motor puede repetir automáticamente tareas seguras dentro del presupuesto. Debe detenerse o elevar una decisión antes de cruzar un coste irreversible no autorizado, un riesgo superior o un método diferente.

Cancelar, reasignar, guardar/cargar o alternar modos no restaura materiales, elimina daños ni vuelve a sortear el mismo episodio.

---

## 21. P18 — Oposición activa y pasiva

- **Pasiva:** dificultad del entorno, objeto o condición sin voluntad propia.
- **Activa:** capacidad pertinente de un actor comparada con la del oponente.

La oposición activa utiliza una única resolución relativa de margen. No uses dos tiradas independientes que dupliquen la variabilidad sin causa.

Aplicaciones: sigilo frente a percepción, engaño frente a lectura social, ataque frente a defensa, inmovilización frente a resistencia, persecución frente a huida.

Las situaciones prolongadas se dividen en oportunidades significativas: contacto, aproximación, maniobra, cambio de cobertura, pérdida de visión, nueva evidencia o retirada. No se compara a todos los agentes entre sí a cada paso ni se hace una comprobación global constante.

El sistema de combate podrá añadir reglas propias en su entrega futura, pero deberá respetar este marco y no reemplazarlo silenciosamente.

---

## 22. P19 — Aprendizaje por participación

Fórmula conceptual:

```text
aprendizaje = práctica significativa
            × desafío pertinente
            × participación real
            × retroalimentación
            × mentoría
            × facilidad personal
```

Reglas:

- Una rutina trivial ya dominada aporta muy poco.
- El aprendizaje máximo aparece cerca del límite actual cuando la persona puede comprender y practicar.
- Una tarea totalmente incomprensible aporta poco sin guía.
- Estar presente no equivale a practicar.
- Transportar herramientas no enseña Mecánica; puede enseñar logística, carga o el trabajo realmente realizado.
- Un aprendiz debe ejecutar pasos pertinentes para desarrollar una habilidad práctica.
- Un error enseña si se identifica, comprende, revisa o recibe explicación.
- Un error mal interpretado puede no enseñar o consolidar una mala práctica.
- Si intervienen dos habilidades, el aprendizaje se reparte según participación y fases; no se otorga el total a ambas.
- La media usada para ejecutar no es automáticamente el reparto de experiencia.
- Las características cambian mucho más lentamente mediante exposición sostenida, no XP puntual.
- El potencial condiciona desarrollo futuro y velocidad, nunca mejora la acción actual.
- Mentores y equipos aceleran aprendizaje y conocimiento del potencial solo con interacción real.

Reconcílialo con `CHR-002` y `CHR-007` sin cerrar aquí las curvas completas de potencial, distribución de calibre o catálogo de dominios que sigan perteneciendo a otros apartados.

---

## 23. P20 — Eventos, causalidad, avisos y pausa

Cadena aprobada:

1. ocurre una causa real;
2. se registra el evento de dominio;
3. se aplican cambios persistentes;
4. se generan consecuencias derivadas sin duplicar la causa;
5. cada persona percibe lo que pueda percibir;
6. se actualiza su conocimiento;
7. se agrupan notificaciones relacionadas;
8. se aplica la política de atención.

Cada evento debe poder identificar conceptualmente: momento simulado, lugar, actores, causa, efectos, visibilidad, gravedad, cadena causal y necesidad de reacción. No diseñes aún un esquema de base de datos.

Niveles de atención:

| Nivel | Tratamiento |
|---|---|
| Registro | Persiste en historial; no interrumpe |
| Aviso | Notificación agrupada |
| Importante | Aviso destacado y posibilidad de reducir automáticamente a `×1` |
| Crítico | Pausa automática porque existe peligro inmediato o una decisión necesaria |

Valores predeterminados de pausa crítica:

- persona incapacitada o en peligro inmediato;
- incendio, derrumbe o amenaza no controlada;
- primer contacto humano relevante;
- decisión moral o social que requiere respuesta;
- pérdida de un medio indispensable que bloquea una cadena relevante;
- situación donde continuar unos segundos puede causar una pérdida grave.

Las categorías deben ser configurables por el jugador sin eliminar valores predeterminados razonables. Las notificaciones repetidas por la misma causa se agrupan. Un evento y su notificación no son la misma entidad.

---

## 24. P21 — Persistencia aleatoria y equivalencia temporal

Invariante fuerte:

> **Misma semilla + mismo estado + mismas órdenes = mismos resultados relevantes, con independencia de cámara, FPS, pausa, guardado/carga o velocidad `×1/×2/×4/×10`.**

Cada oportunidad incierta debe poder derivarse conceptualmente de:

- semilla del mundo;
- identificador estable del episodio;
- entidad o acción;
- propósito de la resolución;
- ordinal estable de la oportunidad.

Reglas:

- El resultado se genera una vez y se conserva.
- Guardar/cargar no lo rerrollea.
- El tiempo de simulación, no los fotogramas, determina exposición, plazos y eventos.
- Dividir o agrupar intervalos no multiplica peligros ni consumos.
- La simulación fuera de pantalla conserva causas, gastos, riesgos, aprendizaje y consecuencias relevantes.
- Cambiar legítimamente el estado, método u orden puede cambiar lo que aún no se ha resuelto, nunca lo ya ocurrido.
- La semilla por sí sola no sustituye el identificador persistente del episodio.

No diseñes la API del generador aleatorio ni el formato final de persistencia. Cierra el comportamiento exigido.

---

## 25. P22 — Presentación visible y potencial oculto

### 25.1 Nivel actual visible

La ficha del personaje muestra el nivel actual numérico `0–10` de características y habilidades. Este valor expresa lo que la persona puede hacer hoy.

Corrige la contradicción con `UI-004`:

- la prohibición de cifras se mantiene para umbrales de trabajo, dificultad, fórmula, modificadores y probabilidades;
- no se aplica al nivel actual de características y habilidades dentro de la ficha del personaje;
- una evaluación operativa no muestra «requiere Electricidad 6», «43 % de éxito» ni el margen matemático;
- una herramienta de depuración puede mostrar cálculos internos, pero queda fuera de la experiencia normal.

### 25.2 Capas de potencial

Conserva esta separación:

1. **Nivel actual:** visible como `0–10`.
2. **Potencial real:** máximo interno oculto; nunca se muestra como número, fracción, rango o barra exacta.
3. **Potencial estimado:** opinión cualitativa basada en evidencias.
4. **Confianza de la estimación:** cuánto fundamento tiene la comunidad.
5. **Velocidad de aprendizaje:** variable distinta del potencial restante.
6. **Calibre oculto `1–5` estrellas:** nunca visible y nunca bonificador directo.
7. **Adaptación al apocalipsis:** sistema separado de calibre y potencial.

Quedan expresamente prohibidos:

- `Conducción 3/8`;
- `potencial 177`;
- `potencial 8–10`;
- estrellas visibles;
- porcentaje de potencial consumido;
- barra que revele el techo real;
- frases que se presenten como certeza cuando falta evidencia.

### 25.3 Catálogo canónico de frases de potencial

Documenta un catálogo base equivalente al siguiente. Puede ajustarse la redacción para naturalidad, pero no cambiar el significado ni introducir cifras:

| Situación estimada | Frase base |
|---|---|
| Evidencia insuficiente | «Todavía no conocemos bien sus posibilidades en este ámbito.» |
| Indicios iniciales de margen extraordinario | «Da señales de poder mejorar muchísimo en este ámbito.» |
| Mucho margen | «Parece tener mucho margen para seguir mejorando.» |
| Margen notable | «Todavía puede mejorar de forma notable.» |
| Margen moderado | «Todavía puede progresar, aunque su margen parece más limitado.» |
| Margen reducido | «Su evolución empieza a estabilizarse.» |
| Muy cerca del máximo | «Parece estar cerca de su máximo en este ámbito.» |
| Máximo prácticamente desarrollado | «Todo indica que ha desarrollado prácticamente todo lo que podía alcanzar en este ámbito.» |

La redacción comunica **margen restante estimado**, no velocidad garantizada, facilidad, valor actual ni promesa de alcanzar el techo.

### 25.4 Confianza y actualización de frases

La frase se modula mediante evidencia:

- sin evidencia suficiente: no se emite una valoración de margen;
- confianza baja: «da señales», «podría», «parece»;
- confianza media: «parece tener», «todo apunta»;
- confianza alta: «todo indica», sin convertirlo en certeza matemática.

La valoración cambia por dos causas diferentes que deben registrarse:

1. la comunidad conoce mejor a la persona;
2. la persona desarrolla parte de su potencial y reduce su margen restante.

Evita oscilaciones frecuentes:

- exige nueva evidencia relevante o progreso acumulado;
- utiliza estabilidad/histéresis conceptual entre bandas;
- no cambia por una única actuación extraordinaria o un mal día;
- mentoría y trabajo compartido pueden acelerar la confianza;
- una frase anterior puede revisarse si aparece evidencia nueva, explicando la incertidumbre y no reescribiendo el pasado.

### 25.5 Presentación de acciones y resultados

En la orden o acción no muestres:

- porcentaje de éxito;
- tirada;
- dificultad numérica;
- modificadores internos;
- umbral requerido;
- probabilidad de crítico;
- contenido o peligro que la comunidad todavía desconoce.

Muestra:

- posible o bloqueado;
- adecuación cualitativa;
- dificultad relativa conocida;
- riesgos conocidos;
- confianza;
- causas principales;
- qué falta o qué podría mejorar el método;
- fase, progreso, consumo y motivo de interrupción;
- resultado causal y estado persistente final.

Ejemplos válidos:

> «Luis parece adecuado para la reparación. Conoce el tipo de instalación, pero carece de una herramienta específica. El trabajo sería lento y existe riesgo de deteriorar componentes.»

> «La reparación ha quedado provisional. Luis identificó correctamente la avería, pero el aislamiento disponible no permite una solución permanente.»

Conserva en `UI-004` los estados cualitativos `Gris`, `Advertencia`, `Adecuada`, `Familiar` e `Incierta` para prioridades y evaluación operativa. No los sustituyas por el número visible de la ficha.

---

## 26. Estados documentales y fuentes canónicas

### 26.1 Motor de resolución

Tras integrar correctamente todas las decisiones:

- `ARC-006`, `ARC-007` y `ARC-008` deben dejar de presentar `P01`–`P22` como abiertas;
- pueden pasar de `draft` a `approved` si su alcance canónico queda completamente cubierto por estas decisiones;
- no deben quedar con fórmulas antiguas, alternativas contradictorias o ejemplos presentados como balance vigente;
- deben conservar ejemplos útiles claramente etiquetados;
- cualquier cuestión futura de balance por acción se presenta como parametrización de contenido, no como reapertura del modelo base.

### 26.2 Personajes y potencial

- `CHR-006` mantiene `approved` y se actualiza a escala `0–10`, media humana 4 y nivel actual visible.
- `CHR-007` incorpora el catálogo de frases, la relación entre nivel actual, potencial oculto y confianza, y retira sus preguntas abiertas de escala y frases.
- `CHR-007` puede permanecer `draft` si continúan abiertas la distribución exacta de estrellas, campos de potencial, adaptación al apocalipsis, dominios, rasgos o interfaz visual final.
- No cierres por extensión asuntos de `CHR-007` que este prompt no decide.

### 26.3 Interfaz

- `UI-004` mantiene su presentación cualitativa de prioridades y trabajos.
- Corrige su prohibición absoluta de mostrar `Mecánica 5/10`: el nivel actual sí aparece numéricamente en la ficha, pero no como umbral de una acción.
- Conserva separados prioridad, capacidad, dificultad, confianza, riesgo, dependencia física y disposición personal.

### 26.4 Decisión transversal y trazabilidad

Crea, si los identificadores siguen libres tras comprobar `main`:

```text
docs/decisions/DEC-0011_hybrid-resolution-engine-and-capability-presentation.md
```

Debe registrar como decisión transversal:

- modelo híbrido directo/D/B;
- escala `0–10` con media humana 4;
- perfiles de ponderación;
- episodios persistentes;
- cooperación por funciones;
- modos en dos dimensiones;
- conocimiento imperfecto;
- determinismo temporal;
- nivel actual visible y potencial oculto.

Crea también, si el identificador sigue libre:

```text
docs/discovery/DISC-0005_resolution-engine-closure-traceability.md
```

Debe distinguir con máxima claridad:

- decisiones finales de `P01`–`P22`;
- acuerdos previos preservados;
- correcciones introducidas en esta entrega;
- fórmulas descartadas o sustituidas;
- ejemplos no normativos;
- cuestiones de otros sistemas que siguen abiertas.

Si los IDs están ocupados en el `main` real, utiliza los siguientes libres y actualiza todos los enlaces.

---

## 27. Limpieza de preguntas abiertas e índices

Actualiza como mínimo:

- `docs/OPEN-QUESTIONS.md`;
- `docs/STATUS.md`;
- `docs/INDEX.md` cuando corresponda;
- índices de `30-characters`, `80-interface`, `90-architecture`, `decisions` y `discovery`;
- `docs/00-governance/GLOSSARY.md`;
- `CHANGELOG.md` según las reglas del repositorio;
- `prompts/INDEX.md`.

En `OPEN-QUESTIONS.md`:

- elimina la lista `P01`–`P22` como decisiones pendientes;
- elimina preguntas duplicadas que esta entrega haya cerrado;
- conserva cuestiones realmente ajenas: porcentajes de calibre, catálogo completo de dominios, adaptación, arte de interfaz, fórmulas específicas de combate, catálogos de contenido, etc.;
- no dejes referencias que afirmen que la escala sigue siendo `1–10`, que la media humana es 5, que el umbral rutinario es `+2` o que los modos son necesariamente excluyentes;
- no presentes las constantes documentadas como código implementado.

En `STATUS.md`, registra `DESIGN-006` como entrega documental, resume el cierre de `P01`–`P22`, enumera las fuentes principales afectadas y deja claro que la nueva línea web sigue sin implementación del motor.

---

## 28. Casos de validación documental obligatorios

La documentación final debe responder sin contradicción al menos a estos casos:

1. Una persona con Fuerza 4 representa la referencia humana media de esa característica.
2. Una persona con Electricidad 0 carece de competencia práctica, pero puede tener potencial y aprender lo básico.
3. Electricidad 0 no significa «dato desconocido».
4. Una persona con Mecánica 8 puede estar cerca de su máximo oculto; la ficha muestra `8` y una frase, nunca `8/9`.
5. Una persona con Conducción 1 puede tener enorme potencial; ese potencial no mejora cómo conduce hoy.
6. Una tarea con capacidad tres puntos sobre dificultad y sin incertidumbre pertinente se ejecuta directamente.
7. Una diferencia de solo dos puntos no activa por sí sola la regla de tarea básica.
8. Un conocimiento indispensable bloquea un método aunque la media de capacidad sea alta.
9. Un método improvisado real puede seguir disponible con otros costes.
10. Un experto suele superar a un principiante en B, pero existe solapamiento ocasional en acciones accesibles.
11. D conserva el progreso y su variación al interrumpir y continuar.
12. Añadir tres ayudantes no transfiere sus habilidades ni multiplica automáticamente la velocidad por cuatro.
13. Un especialista abandona una reparación; el equipo conserva lo hecho y solo continúan los pasos permitidos.
14. Un trabajo puede ser relajado y exhaustivo simultáneamente.
15. Cambiar a cuidadoso al final no recupera una pieza ya dañada.
16. Una revisión equivocada puede corregirse con nueva evidencia sin cambiar la verdad del mundo.
17. Repetir una inspección idéntica sin coste ni cambio no produce otra tirada.
18. Un aprendiz que solo transporta herramientas no obtiene Mecánica.
19. Un fallo técnico sin peligro no genera una lesión arbitraria.
20. Veinte personas que detectan el mismo incendio no generan veinte pausas independientes.
21. Ejecutar a `×10`, mirar otra zona o recargar no cambia el resultado del episodio.
22. La ficha muestra el nivel actual, mientras la orden muestra idoneidad y riesgo cualitativos sin revelar probabilidades.
23. «Parece estar cerca de su máximo» expresa una estimación con evidencia, no el máximo real.
24. Una actuación excepcional aislada no revela calibre ni potencial.

Añade los casos adicionales necesarios para cubrir cooperación, oposición, eventos, aprendizaje, protección, exposición y presupuesto de reintentos.

---

## 29. Reconciliaciones y formulaciones prohibidas

Elimina o corrige como vigentes:

- escala `1–10` sin valor cero;
- media humana 5;
- habilidad ausente tratada como dato desconocido;
- fórmula universal `(característica + 2 × habilidad) / 3`;
- fórmula universal 50/50 para toda actividad;
- umbral `+2` para tareas básicas;
- tirada por tick, golpe, paso o segundo;
- repetición gratuita para buscar mejor resultado;
- suma directa de habilidades de un equipo;
- bonificación universal por ayudante;
- responsable remoto que mejora una tarea sin participar;
- cuatro modos necesariamente excluyentes;
- relajado como sinónimo de exhaustivo;
- crítico como creador universal de accidentes o recursos;
- aprendizaje completo por mera presencia;
- notificación confundida con evento;
- resultado dependiente de FPS, cámara o velocidad;
- potencial visible, estrellas visibles o rango numérico estimado;
- prohibición de mostrar el nivel actual `0–10` en la ficha;
- porcentaje exacto de éxito en la interfaz normal.

No borres antecedentes históricos útiles: márcalos como sustituidos, ejemplos no normativos o explicación del cambio cuando la trazabilidad lo requiera.

---

## 30. Validación técnica y documental

Antes de terminar:

1. Revisa uno por uno `P01`–`P22` y confirma que ninguno permanece abierto o contradictorio.
2. Busca referencias activas a `1–10`, «media humana 5», umbral `+2`, fórmula antigua de ponderación, modos excluyentes y prohibición total de números actuales.
3. Revisa que `0` no se use como sinónimo de `null`, desconocido o conocimiento ausente.
4. Verifica que todos los enlaces relativos creados o modificados sean válidos.
5. Comprueba front matter, IDs, estados, `depends_on` y `related`.
6. Comprueba que los índices incluyan cualquier documento nuevo.
7. Comprueba que `OPEN-QUESTIONS.md` conserve solo preguntas realmente abiertas.
8. Comprueba que ningún documento pase a `implemented`.
9. Comprueba que no se haya modificado código ni configuración ejecutable.
10. Ejecuta `git diff --check`.

No instales dependencias ni ejecutes suites de código: la entrega es exclusivamente documental.

---

## 31. Informe final obligatorio

El informe final de Claude Code debe incluir:

1. Rama creada y commit.
2. URL o referencia de la PR creada, confirmando que no se fusionó.
3. Documentos nuevos.
4. Documentos modificados.
5. Resumen de cierre de cada bloque: `P01–P08`, `P09–P14`, `P15–P20`, `P21–P22`.
6. Contradicciones corregidas, especialmente escala `0–10`, media humana 4, umbral `+3` y nivel actual visible frente a potencial oculto.
7. Estados documentales resultantes y justificación.
8. Preguntas de otros sistemas que permanecen abiertas.
9. Confirmación de que no se tocó código.
10. Resultado de enlaces, búsquedas de contradicciones y `git diff --check`.

No declares la entrega completada si falta alguna de las veintidós decisiones, la presentación del potencial sigue indefinida, el prompt no está guardado e indexado o la PR no ha sido creada.
