---
id: SET-006
title: Activos de conocimiento y capacidad
status: approved
canonical_for:
  - modelo de fuente, fragmento, conocimiento individual y comunitario
  - estados comunitarios de un fragmento
  - fuentes físicas, humanas y digitales de conocimiento
  - conversión de conocimiento recuperado en capacidad real
depends_on:
  - SET-004
related:
  - CHR-002
  - SET-005
  - WLD-004
  - ARC-002
  - DEC-0003
---

## 1. Propósito

Definir el modelo funcional del conocimiento como recurso del mundo: sus
fuentes, fragmentos, estados comunitarios y su conversión en capacidad real,
sin cerrar todavía un esquema de base de datos ni un árbol tecnológico.

## 2. Principios que no deben romperse

> La humanidad ya descubrió la tecnología. El reto es encontrar el
> conocimiento, acceder a él, entenderlo, conservarlo y volver a hacerlo
> útil.

- Z-World no usa como modelo principal una mesa de investigación que genera
  puntos abstractos para comprar tecnologías de un árbol universal. El mundo
  ofrece personas, documentos, objetos, instalaciones y problemas; el
  jugador decide qué recuperar, proteger, estudiar, probar, aplicar y
  transmitir.
- El conocimiento es una categoría de botín por derecho propio y puede
  resultar más decisivo que comida, combustible o un arma.
- Ningún elemento aislado concede capacidad automática: conocimiento,
  persona capaz, habilidades, herramientas, materiales, energía,
  instalación, acceso, tiempo y estado físico y mental se evalúan en
  conjunto.
- Ninguna comunidad recibe automáticamente todas las tecnologías del mundo
  anterior por el mero paso del tiempo (regla ya vigente en
  [SET-004](SET-004_technological-transition-and-knowledge-economy.md)).

## 3. Modelo funcional

### 3.1 Ciclo conceptual

> **Recuperar → identificar → acceder → comprender → experimentar o
> practicar → aplicar → documentar y transmitir.**

No todos los conocimientos recorren todos los pasos ni en el mismo orden.
Una persona puede llegar sabiendo una técnica; otra puede aprender
observando; un manual accesible puede aplicarse directamente por un
experto; un objeto puede comprenderse tras varios desmontajes.

### 3.2 Entidades conceptuales

**Fuente de conocimiento.** Objeto, persona, máquina, instalación,
comunidad o experiencia que contiene o permite inferir conocimiento.
Conserva identidad, procedencia, condición, medio, accesibilidad,
fragmentos potenciales y dependencias para consultarla.

**Fragmento de conocimiento.** Unidad específica y reutilizable de
comprensión, por ejemplo diagnóstico de bombas centrífugas, seguridad
eléctrica doméstica, secado de semillas o acceso a discos SATA. No equivale
necesariamente a una habilidad completa ni a una tecnología desbloqueada.
Un fragmento puede declarar: dominio y tema; alcance; profundidad o
cobertura interna; prerrequisitos conceptuales; técnicas relacionadas;
acciones que ayuda a reconocer o ejecutar; fuentes y personas que lo
portan; confianza y evidencia; necesidades de práctica o validación. Esta
entrega no fija una ontología completa ni miles de IDs; documenta el
contrato que permitirá datos dirigidos por contenido según
[DEC-0003](../decisions/DEC-0003_data-driven-design.md).

**Conocimiento individual.** Lo que una persona comprende y puede recordar,
interpretar o aplicar. Distingue teoría, familiaridad práctica y capacidad
para enseñar cuando sean relevantes. La habilidad general y el conocimiento
de una técnica cooperan, pero no son la misma cifra (ver
[CHR-001](../30-characters/CHR-001_character-model.md)).

**Conocimiento comunitario.** No es una mente colectiva ni un bonus global.
Es el conjunto trazable de: personas portadoras; fuentes accesibles;
materiales catalogados; procedimientos documentados; lugares de consulta;
talleres, escuelas y prácticas que permiten reproducirlo; aprendices y
redundancia. La comunidad puede «tener» un manual y carecer de alguien
capaz de entenderlo. Puede entender una técnica y carecer de medios para
ejecutarla. Puede ejecutar algo gracias a una única persona sin haberlo
preservado de forma resiliente.

**Capacidad real.** Una acción compleja evalúa conjuntamente: conocimiento
pertinente, persona capaz, habilidades, herramientas, materiales, energía,
instalación, acceso, tiempo, estado físico y mental, y condiciones del
entorno.

### 3.3 Estados comunitarios de un fragmento

Estados cualitativos, no una barra tecnológica universal:

1. **Desconocido**: la comunidad no reconoce la existencia del fragmento.
2. **Indicado**: existen pistas o referencias, pero no una fuente
   utilizable.
3. **Disponible**: existe una persona o fuente identificada, aunque pueda
   seguir inaccesible o sin comprender. Debe indicar además si el soporte
   está accesible.
4. **Parcialmente comprendido**: se entienden partes o usos limitados.
5. **Operativo**: al menos una persona puede aplicarlo en condiciones
   concretas con medios adecuados. No significa que todas las personas
   sepan aplicarlo.
6. **Resiliente**: se ha documentado o distribuido entre suficientes
   fuentes y personas para que una sola pérdida no lo elimine. No significa
   inmortal: pueden perderse personas, biblioteca, taller y copias.

Estos estados resumen una red de portadores y evidencias; no sustituyen sus
causas. La simulación puede conservar progreso interno continuo, cobertura
y confianza. La interfaz muestra estados, lagunas y causas, no un
porcentaje universal de «investigación» (ver presentación cualitativa en
[UI-004](../80-interface/UI-004_qualitative-capability-presentation.md)).

### 3.4 Familias de fuentes

**Escritas y gráficas.** Libros, manuales, enciclopedias, revistas,
material escolar o universitario, cuadernos, diarios, planos, mapas,
esquemas, catálogos, instrucciones, procedimientos de empresa y
documentación técnica.

**Audiovisuales y analógicas.** VHS, casetes, cintas, fotografías,
microformas, CD, DVD, grabaciones y material formativo. Su acceso puede
depender de lector, energía y estado.

**Digitales.** Pendrives, tarjetas, discos duros, SSD, teléfonos, tabletas,
portátiles, PCs, NAS, servidores y sistemas industriales. «Tenemos el
soporte» no significa «podemos acceder al contenido».

**Personas.** Experiencia profesional, práctica vital, memoria, técnicas
tácitas y capacidad pedagógica de agricultores, enfermeros, electricistas,
mecánicos, docentes, informáticos, fontaneros, veterinarios, carpinteros y
cualquier otro trasfondo generado.

**Objetos, máquinas e instalaciones.** Una bomba, motor, ordenador, cultivo,
taller o red municipal permite observar, medir, desmontar, reparar y
experimentar. El objeto puede enseñar aunque no exista manual.

**Otras comunidades.** Comercio de documentos, formación, demostraciones,
especialistas, acuerdos, aprendices, espionaje o conocimiento compartido.
Esta entrega no diseña la diplomacia regional completa.

**Experiencia y acontecimientos.** Práctica, éxito, error, accidente,
observación de otra persona, diagnóstico, reparación y resolución de un
problema pueden producir conocimiento individual o evidencia comunitaria.

### 3.5 Acceso digital, compatibilidad y obsolescencia

Una fuente digital puede requerir una cadena causal: energía; dispositivo
funcional; puerto, lector, cable o adaptador compatible; pantalla,
periférico o almacenamiento suficiente; sistema operativo, controlador,
aplicación o códec; contraseña, clave o recuperación de datos cuando
proceda; persona con conocimientos informáticos; tiempo y un entorno que no
destruya el soporte. No todo punto es requisito universal: cada fuente
declara los que le corresponden.

Ejemplo normativo de estructura, no de contenido garantizado: un disco duro
municipal puede estar catalogado y seguir inaccesible hasta conseguir
electricidad, PC, adaptador y una persona capaz. Al acceder puede revelar
planos de agua, inventarios, saneamiento, edificios o mantenimiento. El
objeto encontrado meses antes adquiere utilidad sin cambiar retroactivamente
su contenido.

La tecnología obsoleta no desaparece de un árbol. Tiene compatibilidades,
lectores, formatos, condición y cadenas de acceso. Un soporte puede
degradarse, copiarse, repararse o quedar temporalmente inutilizable.

### 3.6 Fragmentación, redundancia y consulta posterior

Una fuente aporta fragmentos y profundidad, nunca necesariamente una
tecnología completa. Un manual de electricidad doméstica puede cubrir
seguridad, cableado y diagnóstico básico sin enseñar electrónica
industrial.

Una segunda fuente relacionada puede: cubrir lagunas; aportar otro método;
aumentar confianza mediante contraste; permitir estudio paralelo; facilitar
enseñanza; servir de copia de seguridad; conservarse en otro lugar;
intercambiarse.

Una fuente no se consume por estudiarla. Una persona puede comprender solo
una parte, conservarla y volver meses después con más base. La condición
del soporte sí puede degradarse por tiempo, uso, accidente o ambiente si el
sistema correspondiente lo modela.

### 3.7 Anti-bloqueo injusto por azar

El mundo influye en el desarrollo porque cada partida ofrece distintas
personas, lugares, manuales, máquinas, comunidades y problemas, sin
eliminar agencia. Para evitar dependencia absoluta de una única tirada:

- Una capacidad esencial de supervivencia debe admitir varias rutas o una
  alternativa material más básica.
- Un mismo fragmento puede provenir de persona, manual, vídeo, comunidad,
  práctica, reparación, desmontaje o experimento, con cobertura y
  dificultad distintas.
- El hallazgo raro puede acelerar o especializar, no bloquear para siempre
  todas las soluciones a una necesidad esencial.
- Una técnica avanzada concreta sí puede ser rara, pero la necesidad que
  resuelve debe admitir otras estrategias plausibles cuando el diseño las
  contemple.
- No se garantiza que todas las partidas alcancen todas las tecnologías.

La variedad procede de oportunidades y costes distintos, no de partidas
inviables por faltar un único libro obligatorio.

### 3.8 Conocimiento que revela acciones y lugares

Aprender no cambia mágicamente el objeto. Cambia lo que la comunidad
reconoce y puede intentar: antes de diagnóstico, «bomba desconocida» solo
ofrece observar o desmontar a ciegas; con diagnóstico básico, inspeccionar
y probar; con comprensión y medios, reparar, adaptar, instalar o
reconstruir.

Mapas, diarios, contratos, archivos municipales, catálogos o comunicaciones
pueden revelar depósitos, pozos, granjas y talleres; direcciones de
proveedores; redes de agua, saneamiento o energía; carreteras, refugios y
rutas; comunidades, riesgos y lugares del mapa estratégico. El conocimiento
puede crear **información o una pista de localización**, nunca
teletransportar un lugar ni garantizar que su estado actual coincida con un
documento antiguo. `WLD-003` y `NAR-002` gobiernan antigüedad, rumor y
cambio regional.

## 4. Reglas aprobadas

- Un fragmento de conocimiento no equivale automáticamente a una habilidad
  completa ni a una tecnología desbloqueada.
- Los seis estados comunitarios de la sección 3.3 son los únicos estados
  cualitativos aprobados para un fragmento; ninguno implica el siguiente de
  forma automática.
- Ninguna acción compleja recibe capacidad por un solo elemento aislado
  (fuente, persona, herramienta o material) sin el resto de condiciones de
  la sección 3.2.
- Ninguna necesidad esencial de supervivencia depende de un único hallazgo
  aleatorio sin alternativa plausible.

## 5. Interacciones con otros sistemas

- El aprendizaje individual, la práctica, la enseñanza, la mentoría, el
  conocimiento tácito, la pérdida y la recuperación de una persona se
  desarrollan en
  [CHR-002](../30-characters/CHR-002_knowledge-and-learning.md), sin que
  este documento copie su catálogo.
- La investigación como recuperación, comprensión y aplicación (no árbol
  tecnológico) sigue definida en
  [SET-004](SET-004_technological-transition-and-knowledge-economy.md),
  que este documento amplía con el modelo de fuentes y fragmentos.
- Cada solución de la red productiva de
  [SET-005](SET-005_production-web-and-infrastructure.md) declara también
  los fragmentos de conocimiento o técnicas requeridos.
- El reconocimiento y saqueo dependientes de la persona que producen
  evidencia sobre fuentes físicas se rigen por
  [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md).
- La persona cambia lo reconocido o recuperado causalmente, nunca el
  contenido base derivado de la semilla, según
  [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md).

## 6. Casos límite o riesgos

- Tratar «tener el soporte» como equivalente a «poder acceder al
  contenido» rompería la cadena de acceso digital de la sección 3.5.
- Convertir un estado comunitario en un porcentaje único de investigación
  reintroduciría la barra tecnológica que este documento rechaza.
- Perder a la única persona portadora de un fragmento operativo sin
  documentación ni redundancia puede degradar ese fragmento por debajo de
  `Operativo`; ver pérdida y resiliencia en
  [CHR-002](../30-characters/CHR-002_knowledge-and-learning.md).

## 7. Preguntas abiertas

- Fórmulas numéricas exactas de cobertura, confianza, dificultad y
  progreso interno de un fragmento. Ver `docs/OPEN-QUESTIONS.md`.
- Catálogo exhaustivo de fragmentos, dominios y técnicas.
- Frecuencia y equilibrio de aparición de fuentes de conocimiento por
  semilla.
- Número de personas o copias necesarias para considerar un fragmento
  `Resiliente`.
- Reglas completas de idiomas, cifrado, contraseñas y recuperación forense
  de fuentes digitales.

## 8. Ejemplos no normativos

Ejemplo transversal a conservar, no garantizado ni obligatorio en ningún
mapa concreto:

1. Una exploración preliminar detecta una posible estación municipal de
   bombeo.
2. Ana, sin conocimientos técnicos, la registra y recupera herramientas,
   bidones, metal y documentación; deja constancia de maquinaria que no
   sabe identificar.
3. Marcos, con experiencia mecánica, vuelve y reconoce dos bombas, una
   probablemente reparable, un motor compatible, piezas aprovechables y un
   manual técnico. Nada de eso apareció por llevar a Marcos: ya estaba
   allí (ver
   [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md)).
4. Logística traslada el manual y los recursos portátiles.
5. Catalogar conocimiento lo identifica como manual de bombas centrífugas
   con fragmentos de mantenimiento, diagnóstico, desmontaje e instalación.
6. Luis intenta estudiarlo. La interfaz indica «Difícil» y explica la base
   que le falta, sin mostrar «Mecánica 5 / dificultad 6» (ver
   [UI-004](../80-interface/UI-004_qualitative-capability-presentation.md)).
7. Luis intenta una reparación con medios imperfectos: tarda, consume una
   junta, obtiene una reparación parcial y aprende del resultado.
8. Tras más práctica y estudio, vuelve al mismo manual y comprende
   apartados que antes no podía aprovechar.

Este ejemplo demuestra conjuntamente contenido estable, información
dependiente de la persona, logística física, conocimiento fragmentario,
consulta posterior, aplicación imperfecta y desarrollo del personaje. No es
un evento garantizado ni contenido obligatorio del primer mapa.
