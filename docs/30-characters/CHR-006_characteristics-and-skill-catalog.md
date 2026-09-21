---
id: CHR-006
title: Nueve características y catálogo de 34 habilidades base
status: approved
canonical_for:
  - las nueve características del personaje
  - arquitectura característica/habilidad/dominio/conocimiento/trabajo
  - catálogo completo de 34 habilidades base
  - habilidades y conceptos descartados o reclasificados
depends_on:
  - CHR-001
related:
  - CHR-002
  - CHR-005
  - CHR-007
  - ARC-004
  - UI-003
---

## 1. Propósito

Fijar el catálogo de horizonte máximo de características y habilidades base
de un superviviente: las nueve características, la arquitectura que separa
característica, habilidad, dominio, conocimiento y trabajo, y el catálogo
completo de 34 habilidades base con sus aplicaciones y dominios posibles.
Este documento no define el potencial oculto, el calibre oculto ni la
adaptación al apocalipsis, que viven en
[CHR-007](CHR-007_hidden-potential-caliber-and-adaptation.md), ni el
procedimiento de resolución que consume este catálogo, que vive en
[ARC-004](../90-architecture/ARC-004_action-and-event-resolution-model.md).

## 2. Principios que no deben romperse

- No todo lo que distingue a una persona debe convertirse en una habilidad
  (ver [CHR-001](CHR-001_character-model.md)).
- Una característica, una habilidad, un dominio, un conocimiento y un
  trabajo son cinco capas distintas que no se sustituyen entre sí (§3.1).
- Ninguna habilidad de este catálogo se elige por comodidad narrativa; cada
  una existe porque progresa, diferencia personajes, tiene varias
  aplicaciones reales y no queda mejor representada como trabajo, dominio o
  conocimiento.

## 3. Modelo funcional

### 3.1 Arquitectura de habilidades, dominios, conocimientos y trabajos

| Capa | Significado | Ejemplo |
|---|---|---|
| Característica | Capacidad general de la persona. | Técnica 7 |
| Habilidad | Competencia amplia que progresa mediante experiencia, práctica, estudio y enseñanza, en una escala aproximada 1–10 (calibración pendiente, ver §7). | Electricidad 5 |
| Dominio / especialización / proficiencia | Parte concreta dentro de una habilidad; su sistema de progreso propio no está cerrado. | Electricidad → instalaciones domésticas, generación, cuadros eléctricos |
| Conocimiento | Información específica que la persona o la comunidad reconoce y sabe aplicar (ver [CHR-002](CHR-002_knowledge-and-learning.md)). | Conoce el esquema de este generador |
| Trabajo | Lo que se hace, no lo que se sabe hacer; puede usar varias características, habilidades, especializaciones, herramientas y personas. | Cazar, registrar una vivienda, desmontar una instalación |

> **Regla central.** Las habilidades representan capacidades que progresan.
> Los dominios representan especialización. Los conocimientos representan lo
> que se sabe. Los trabajos representan lo que se hace.

Esta distinción evita crear una habilidad nueva para cada actividad, y
diferencia estas capas de la **prioridad**, que expresa disposición y no
concede capacidad alguna por sí sola (ver
[CHR-001](CHR-001_character-model.md#311-prioridad-habilidad-técnica-conocimiento-aptitud-y-medios)
y [UI-003](../80-interface/UI-003_work-priority-taxonomy.md)).

**Acciones que no necesitan habilidad.** Coger un objeto visible,
transportar una caja manejable, barrer, llevar materiales, abrir una puerta
sin dificultad o colocar un objeto en un almacén son acciones cotidianas que
no consultan ninguna habilidad; pueden consumir tiempo, energía o recursos
sin necesitar una comprobación (ver
[ARC-004](../90-architecture/ARC-004_action-and-event-resolution-model.md#33-posibilidad-requisitos-y-acciones-básicas-sin-tirada)).

**Acciones con varias características o habilidades.** Una acción puede
depender de una característica, dos características, una habilidad, dos
habilidades o combinaciones de ambas capas; la media aritmética dentro de
cada pareja requerida se define en
[ARC-004](../90-architecture/ARC-004_action-and-event-resolution-model.md#32-características-habilidades-y-medias),
que este documento no repite.

### 3.2 Nueve características

| # | Característica | Representa | No representa |
|---|---|---|---|
| 1 | Fuerza | Potencia física, ejercer fuerza, levantar/arrastrar/empujar, forcejeos, golpes, trabajos que exigen potencia. | Resistencia prolongada, técnica, uso correcto de una herramienta. |
| 2 | Resistencia | Capacidad de sostener esfuerzo, tolerancia a trabajo físico prolongado, recuperación ante actividad. | Autocontrol (regulación de la conducta; es una habilidad, §3.4). |
| 3 | Agilidad | Movimiento corporal, equilibrio, coordinación global, cambios de posición. | Destreza (precisión manual); una persona puede ser poco ágil y muy precisa con las manos. |
| 4 | Destreza | Precisión manual, control fino, coordinación de manos, manipulación delicada. | Conocimiento técnico. |
| 5 | Percepción | Capacidad sensorial general (vista, oído, olfato, tacto y otras señales). | Advertir (habilidad de atención y detección de relevancia, §3.4). |
| 6 | Técnica | Aptitud general para trabajar con herramientas, seguir procedimientos prácticos, entender la lógica operativa de mecanismos y adaptarse a métodos de trabajo. | Saber Mecánica, Electricidad o Carpintería (habilidades concretas); Destreza (control manual); Razonamiento (análisis). |
| 7 | Razonamiento | Análisis, relación entre datos, inferencia, resolución de problemas, comprensión de situaciones nuevas. | No se aplica automáticamente a cualquier acción «intelectual»; una tarea puede requerir solo Percepción, Técnica o una habilidad concreta. |
| 8 | Carisma | Presencia personal, impacto, capacidad de hacerse escuchar y atraer atención. | Empatía, bondad, liderazgo automático, persuasión automática. |
| 9 | Empatía | Comprender a otras personas, leer emociones, interpretar intenciones, captar necesidades y tensiones sociales. | Carisma; una persona puede ser muy carismática y comprender mal a los demás, o muy empática y con poca presencia social. |

### 3.3 Catálogo completo de 34 habilidades base

Cada habilidad conserva su definición, aplicaciones y dominios posibles;
las combinaciones con otras habilidades o trabajos compuestos se detallan en
§3.5.

**Movimiento**

1. **Escalada.** Ascender, descender, usar apoyos, moverse por desniveles,
   usar cuerdas y equipo apropiado, gestionar desplazamientos verticales.
   Aplicaciones: muros, tejados, fachadas, pozos, barrancos, edificios
   colapsados, torres, antenas, rescates, rutas de escape, accesos
   alternativos. Dominios: escalada con cuerda, rápel, escalada urbana,
   progresión en roca, trabajos en altura.
2. **Natación.** Desenvolverse en el agua: cruzar ríos, canales, embalses,
   zonas inundadas; rescatar personas; escapar; recuperar material o
   vehículos sumergidos. Las situaciones sencillas y seguras pueden ser
   automáticas ([ARC-004](../90-architecture/ARC-004_action-and-event-resolution-model.md#33-posibilidad-requisitos-y-acciones-básicas-sin-tirada));
   la habilidad gana importancia con corriente, distancia, frío, cansancio,
   heridas, carga, oleaje o peligro.

**Combate**

3. **Tiro.** Competencia con armas a distancia; base común con dominios por
   arma concreta (pistola, rifle, escopeta, arco, ballesta, otras).
   Aplicaciones: combate, caza como trabajo compuesto, defensa de
   posiciones, cobertura, tiro bajo presión, entrenamiento de otros.
4. **Combate cuerpo a cuerpo.** Competencia en lucha cercana. Dominios:
   desarmado, cuchillos, armas contundentes, armas largas, herramientas
   usadas como arma, técnicas defensivas. No existe una habilidad
   independiente de «Caza»: una cacería puede usar esta habilidad cuando el
   método lo requiera (ver descartes, §3.4).

**Atención y exploración**

5. **Advertir.** Habilidad clave del motor: prestar atención, detectar que
   algo merece atención, reconocer señales relevantes, anticipar un
   peligro, captar anomalías, por cualquier sentido (ver, oír, oler,
   percibir un cambio). Participa en el **vistazo inicial automático** al
   entrar en un lugar (una amenaza, una salida, una puerta abierta,
   manchas, movimiento, un cable, signos de presencia reciente, sin
   necesitar comprender todavía su significado). Se distingue de
   Percepción (capacidad sensorial general): «Percepción + Advertir»
   detecta un ruido débil y comprende que merece atención; «Advertir +
   Rastreo» reconoce que ciertas marcas indican paso reciente; «Advertir +
   Electricidad» nota que algo en una instalación no parece normal;
   «Advertir + Medicina» se fija en una señal física relevante. **Buscar /
   Registrar** no es otra habilidad: es un trabajo que puede usar Advertir
   y configurarse con el modo de trabajo (normal, exhaustivo, otros por
   definir; ver
   [ARC-005](../90-architecture/ARC-005_teamwork-orders-modes-and-conditions.md#33-modos-de-ejecución-significado-corregido)).
6. **Rastreo.** Leer y seguir señales de movimiento o presencia: huellas,
   rastros, signos de paso, animales, personas, persecución, estimar
   antigüedad de señales cuando sea posible. Se combina con Advertir,
   Supervivencia, conocimiento del animal, estado del terreno y clima.
7. **Sigilo.** Moverse sin ser detectado, reducir ruido, usar cobertura,
   evitar exposición, acercarse sin ser visto u oído. Interviene en
   exploración, infiltración, caza, combate, huida y observación.
8. **Orientación.** Independiente de Supervivencia (§7 declara esta
   separación cerrada). Saber dónde se está, mantener dirección,
   interpretar mapas, usar brújulas, reconocer referencias, reconstruir
   rutas, navegar por terreno difícil. Aplicaciones: expediciones en el
   mapa mundial, bosques, montaña, niebla, noche, tormentas, pérdida de
   referencia, rutas sin carreteras, cuevas, alcantarillado, grandes
   instalaciones, retorno a una posición conocida. Solo tiene sentido
   jugable si el diseño del mapa permite consecuencias reales de perderse
   (ver [WLD-001](../20-world/WLD-001_world-scales.md)); el jugador no
   dispone de conocimiento perfecto del terreno solo porque la interfaz lo
   muestre.

**Supervivencia y naturaleza**

9. **Supervivencia.** Deliberadamente una habilidad amplia y central:
   hacer fuego, improvisar refugios, preparar campamentos, gestionar
   exposición, trabajar agua en condiciones de supervivencia,
   potabilización improvisada, improvisar soluciones de campo, montar
   trampas, reconocer necesidades básicas de supervivencia. Dominios:
   fuego, refugios, supervivencia invernal, campamento, potabilización,
   trampas, supervivencia urbana, supervivencia en montaña. No absorbe
   Orientación, Forrajeo, Rastreo, Pesca ni Manejo de animales: es amplia,
   pero con límites.
10. **Forrajeo.** Localizar recursos útiles en el entorno natural (frutos,
    plantas, hongos, materiales naturales, alimentos); no equivale a
    identificarlos científicamente. Ejemplo: Forrajeo + Advertir localiza
    una planta; Ciencias/Botánica la identifica; Medicina + conocimiento
    específico determina su uso médico.
11. **Pesca.** Experiencia práctica pescando: selección de lugar, lectura
    del agua, técnicas, aparejos, preparación, captura, adaptación a
    especies o entornos. Dominios: río, lago, costa, redes, caña, métodos
    improvisados.
12. **Manejo de animales.** Acercarse, manipular, cuidar, domesticar,
    entrenar e interpretar comportamiento animal, trabajar con ganado y
    reducir estrés animal. Aplicaciones: ganadería, animales de trabajo,
    perros, monturas, animales rescatados, cría, manejo durante
    tratamientos.

**Construcción, oficios y recursos**

13. **Carpintería.** Trabajo con madera: estructuras, muebles,
    reparaciones, puertas, ventanas, refuerzos, barricadas, piezas,
    desmontaje, fabricación. Dominios: estructuras, ebanistería, cubiertas
    de madera, carpintería fina.
14. **Obra.** Sustituye a una separación rígida entre albañilería y
    fontanería. Construcción y mantenimiento de obra civil y edificios.
    Dominios: albañilería, fontanería, hormigón, canalizaciones,
    saneamiento, revestimientos, cubiertas, trabajos de piedra,
    instalaciones de agua básicas. Ejemplos: reparar una tubería doméstica
    usa Obra; instalar una bomba de agua usa Obra + Mecánica; automatizar
    una bomba usa Mecánica + Electricidad; crear una red de agua implica
    varias fases y especialistas. Obra alta no domina automáticamente
    todos sus dominios.
15. **Trabajo del metal.** Competencia general trabajando metales.
    Dominios: soldadura, forja, mecanizado, chapa, fabricación,
    reparación, tratamiento de piezas. No se crean barras separadas para
    herrería, soldadura y mecanizado salvo que el diseño futuro lo
    justifique.
16. **Confección.** Trabajo con materiales textiles y similares: coser,
    reparar ropa, fabricar ropa, adaptar protecciones, trabajar cuero,
    mantener equipamiento textil. Dominios: costura, patronaje, cuero,
    reparación, protección.
17. **Excavación y Extracción.** Sustituye a una habilidad estrecha de
    minería. Excavar, mover tierra, extraer piedra, trabajar canteras,
    obtener arcillas/arena/grava/áridos/minerales, preparar terrenos.
    Dominios: minería, cantería, arcillas, áridos, excavación, movimiento
    de tierras. Aplicaciones: recursos para construcción, cementos y
    mezclas, obras, zanjas, pozos, canteras, excavaciones defensivas,
    explotación de recursos locales.

**Tecnología**

18. **Mecánica.** Sistemas mecánicos: vehículos, motores, bombas,
    maquinaria, transmisiones, generadores en su parte mecánica,
    mantenimiento, diagnóstico mecánico. Dominios: automoción, diésel,
    motores pequeños, maquinaria pesada, bombas, generadores.
19. **Electricidad.** Corriente, cableado, instalaciones, cuadros,
    alimentación, motores eléctricos, generación y distribución. No
    equivale a Electrónica.
20. **Electrónica.** Circuitos, placas, sensores, componentes, reparación
    electrónica, dispositivos. Se combina con Sistemas y Comunicaciones.
21. **Sistemas y Comunicaciones.** Unifica informática y comunicaciones:
    ordenadores, sistemas, software, redes, servidores, recuperación de
    datos, radio, telecomunicaciones, antenas, repetidores, configuración
    de equipos de comunicación. Ejemplos: reparar una placa de radio usa
    Electrónica; configurar un sistema de radio usa Sistemas y
    Comunicaciones; montar un repetidor usa ambas; recuperar datos de un
    servidor usa Sistemas y Comunicaciones.
22. **Cerrajería.** Cerraduras, mecanismos de cierre, apertura,
    mantenimiento, cajas fuertes cuando corresponda y mecanismos
    similares; especialmente relevante en exploración y recuperación de
    recursos.

**Transporte**

23. **Conducción.** Conducir vehículos (automóvil, furgoneta, camión,
    moto, maquinaria, otros vehículos del mundo); los tipos concretos
    pueden convertirse en dominios. Especialmente relevante para el
    sistema de potencial oculto de
    [CHR-007](CHR-007_hidden-potential-caliber-and-adaptation.md): una
    persona puede empezar con nivel muy bajo por falta de experiencia y
    demostrar con el tiempo una capacidad extraordinaria.

**Producción y abastecimiento**

24. **Cocina.** Preparación de alimentos, seguridad alimentaria,
    aprovechamiento, conservación práctica, procesado, planificación
    culinaria. Dominios: conservación, panadería, carnicería/procesado
    animal, cocina de campaña, fermentación, alimentos específicos.
    Carnicería no se mantiene como habilidad independiente por defecto
    (§3.4).
25. **Agricultura.** Cultivos, suelo, siembra, cuidado, cosecha,
    rotaciones, planificación agrícola, producción vegetal. Dominios:
    huerto, cereal, frutales, invernadero, hidroponía, otros sistemas
    futuros. Se combina con Ciencias en tareas avanzadas.

**Salud**

26. **Medicina.** Competencia sanitaria general. Dominios: primeros
    auxilios, enfermería, diagnóstico, traumatología, cirugía,
    farmacología, medicina de urgencias, medicina veterinaria (en
    combinación con Manejo de animales). Primeros Auxilios no es otra
    habilidad 1–10: es un dominio de Medicina (§3.4). Ejemplos: atención
    básica usa Medicina; una intervención quirúrgica usa Medicina +
    dominio de cirugía + conocimientos necesarios; tratar a un animal usa
    Medicina + Manejo de animales según la situación.

**Ciencias**

27. **Ciencias.** No significa «sabe de toda la ciencia»: representa
    formación científica transversal, método, comprensión de principios,
    trabajo experimental y capacidad de aplicar conocimiento científico.
    Dominios: química, biología, botánica, herbolaria/botánica aplicada,
    microbiología, geología, toxicología, ciencia de materiales, otras
    disciplinas futuras. Ejemplos: identificar una planta usa
    Ciencias + Botánica; analizar agua usa Ciencias + Química/Microbiología;
    preparar compuestos usa Ciencias + Química + Técnica; estudiar un
    fertilizante usa Ciencias + Agricultura; estudiar un tratamiento usa
    Ciencias + Medicina; evaluar un material usa Ciencias + Trabajo del
    metal/Obra/Electrónica según el caso. **Investigación no es una
    habilidad**: es un trabajo compuesto (ver §3.5) que evita usar siempre
    «la misma rata de laboratorio» para investigar cualquier cosa.

**Habilidades sociales**

28. **Influencia.** Unifica Persuasión y Engaño (§3.4). Conducir a otra
    persona hacia una percepción, postura, decisión o interpretación, de
    forma honesta, retórica, manipuladora o engañosa; la característica
    relevante cambia según la acción (Carisma + Influencia convence por
    presencia; Razonamiento + Influencia construye una explicación o
    mentira coherente; Empatía + Influencia escoge un argumento adecuado
    para la persona).
29. **Negociación.** Encontrar acuerdos, equilibrar intereses, comercio,
    pactos, concesiones, resolver conflictos de intereses. Se mantiene
    separada de Influencia porque el objetivo no es solo convencer, sino
    alcanzar una solución entre partes.
30. **Liderazgo.** Dirigir, coordinar, organizar grupos, tomar
    responsabilidad, comunicar prioridades, mantener cohesión, ejercer
    liderazgo durante trabajos y situaciones de presión (ver
    [ARC-005](../90-architecture/ARC-005_teamwork-orders-modes-and-conditions.md#31-trabajo-en-equipo-con-un-líder)).
    No sustituye habilidad técnica, Carisma ni Empatía: un gran líder puede
    no ser el mayor especialista. **Es una habilidad, no una
    característica** (reconciliación con el motor, ver §7).
31. **Enseñanza.** Explicar, demostrar, corregir, adaptar la formación,
    acompañar aprendices, convertir experiencia en aprendizaje para otra
    persona; especialmente relevante para la mentoría y el descubrimiento
    de potencial (ver
    [CHR-007](CHR-007_hidden-potential-caliber-and-adaptation.md#35-aprendizaje-práctica-y-mentoría)).
32. **Intimidación.** Influir mediante amenaza, presión, miedo,
    demostración de fuerza o coerción; separada de Influencia porque sus
    consecuencias sociales y contextuales son distintas. No equivale a
    control mental.

**Habilidad personal**

33. **Autocontrol.** Gestionar la propia respuesta ante miedo, presión,
    dolor, provocación, tensión o situaciones límite; no significa no
    sentir, obedecer siempre ni evitar consecuencias emocionales. Mejora
    mediante experiencia, entrenamiento y aprendizaje. Distinta de
    Resistencia (característica física, §3.2).

**Cultura y expresión**

34. **Expresión artística.** Capacidades creativas y expresivas. Dominios:
    música, escritura, dibujo, pintura, interpretación, escultura, otras
    formas. Aplicaciones: moral, cultura comunitaria, identidad,
    memoriales, ocio, expresión personal, comunicación, acontecimientos
    sociales. No es una habilidad «de lujo»: puede participar en cómo una
    comunidad mantiene identidad y cohesión.

### 3.4 Habilidades y conceptos descartados o reclasificados

Para impedir que decisiones ya corregidas reaparezcan como habilidades base:

| Concepto | Tratamiento |
|---|---|
| Táctica | Fuera como habilidad base; puede existir como conocimiento, dominio, experiencia o doctrina. |
| Búsqueda | Fuera como habilidad base; sustituida por Advertir (habilidad) + Buscar/Registrar (trabajo, §3.3.5). |
| Caza | Fuera como habilidad base; trabajo compuesto que usa Advertir, Rastreo, Sigilo, Tiro, Combate cuerpo a cuerpo, Supervivencia, conocimiento animal y entorno. |
| Trampeo | Fuera como habilidad base; pasa a dominio de Supervivencia. |
| Fontanería | Fuera como habilidad base; pasa a dominio de Obra; en tareas complejas se combina con Mecánica, Electricidad y conocimientos específicos. |
| Informática y Comunicaciones (por separado) | No existen como dos habilidades separadas; se unifican en Sistemas y Comunicaciones. Electrónica continúa separada. |
| Persuasión y Engaño (por separado) | No existen como dos habilidades base separadas; se unifican en Influencia. |
| Ciencias (formulación antigua) | Se recupera como habilidad, pero solo funciona gracias a la separación entre habilidad científica general, dominio científico y conocimiento concreto; no equivale a conocer todas las disciplinas. |
| Organización | Fuera como habilidad base; puede ser un trabajo, una responsabilidad, una aplicación de Liderazgo o de Razonamiento, o una función de logística del asentamiento. |
| Memoria | Fuera como habilidad base; pertenece a biografía, recuerdos, conocimiento y rasgos (ver [CHR-007](CHR-007_hidden-potential-caliber-and-adaptation.md#34-descubrimiento-progresivo-del-personaje)); pueden existir particularidades de buena o mala memoria sin una habilidad 1–10 junto a Mecánica o Tiro. |
| Investigación | Fuera como habilidad base; trabajo compuesto que usa las disciplinas realmente relacionadas con el problema. |
| Construcción (genérica) | No existe como habilidad genérica; se resuelve mediante Carpintería, Obra, Trabajo del metal, Excavación y Extracción o combinaciones. |
| Mantenimiento (genérico) | No existe como habilidad genérica; ejemplos: coche → Mecánica; instalación eléctrica → Electricidad; arma → Tiro + dominio; herramienta → Técnica + oficio pertinente; bomba → Mecánica/Obra. |
| Carnicería | No se mantiene inicialmente como habilidad base; puede existir como dominio de Cocina/procesado animal con otros conocimientos cuando sea necesario. |
| Primeros Auxilios | No es otra habilidad; es un dominio de Medicina. |

### 3.5 Trabajos compuestos y ejemplos de uso

Ejemplos que demuestran cómo se combinan característica, habilidad, dominio
y conocimiento sin inventar una habilidad nueva por cada trabajo; el
procedimiento de resolución que ejecuta estas combinaciones vive en
[ARC-004](../90-architecture/ARC-004_action-and-event-resolution-model.md):

- **Entrar en una vivienda.** Fase automática de vistazo inicial:
  Percepción + Advertir (§3.3.5), para advertir peligros, movimiento,
  sonidos, señales evidentes o anomalías, sin revelar necesariamente todo
  el contenido del lugar.
- **Registrar exhaustivamente una vivienda.** Trabajo «Registrar lugar»
  usando Advertir, conocimientos pertinentes, tiempo y modo exhaustivo.
  Ejemplos: Advertir + Rastreo busca signos de presencia; Advertir +
  Mecánica se fija en maquinaria útil; Advertir + Medicina detecta material
  sanitario relevante.
- **Cazar.** Trabajo «Cazar» con fases posibles (encontrar señales, seguir
  rastro, aproximarse, disparar/capturar, recuperar, procesar) que pueden
  usar Advertir, Rastreo, Sigilo, Tiro, Supervivencia y Cocina/dominio de
  procesado. No existe «Caza 7».
- **Investigar una planta medicinal.** Trabajo que puede usar Forrajeo,
  Advertir, Ciencias/Botánica, Medicina, Razonamiento y conocimiento
  específico; no existe una habilidad de Investigación que lo resuelva
  todo.
- **Reparar un generador.** Fases posibles (inspección, diagnóstico,
  desmontaje, reparación mecánica, reparación eléctrica, comprobación) con
  Advertir, Mecánica, Electricidad, Técnica, Razonamiento y conocimientos
  del modelo.
- **Construir una red de agua.** Trabajo colectivo que puede usar
  Obra/Fontanería, Mecánica, Electricidad, Excavación y Extracción,
  Liderazgo y ayudantes en diferentes fases.
- **Recuperar un servidor.** Puede requerir Electrónica (hardware),
  Sistemas y Comunicaciones (software/red), Electricidad (alimentación),
  Razonamiento (diagnóstico) y conocimientos específicos.
- **Preparar un producto químico útil.** Puede requerir Ciencias/Química,
  Técnica, equipo y conocimientos del procedimiento, combinándose según el
  objetivo con Agricultura, Medicina, Cocina, Trabajo del metal u Obra.

## 4. Reglas aprobadas

- Nueve características y 34 habilidades base forman el catálogo de
  horizonte máximo de Z-World (§3.2, §3.3).
- Liderazgo es una habilidad social, no una característica (§3.3.30).
- Advertir, Orientación y Supervivencia son habilidades independientes
  entre sí y con límites propios (§3.3.5, §3.3.8, §3.3.9).
- Ninguna de las habilidades descartadas de §3.4 debe reaparecer como
  habilidad base en catálogos futuros; su función queda cubierta por
  trabajos compuestos, dominios o conocimientos.

## 5. Interacciones con otros sistemas

- El procedimiento que combina estos valores mediante medias por pareja
  vive en
  [ARC-004](../90-architecture/ARC-004_action-and-event-resolution-model.md#32-características-habilidades-y-medias).
- El potencial oculto, el calibre oculto y la adaptación al apocalipsis que
  condicionan cómo evolucionan estas habilidades viven en
  [CHR-007](CHR-007_hidden-potential-caliber-and-adaptation.md).
- El aprendizaje, la práctica, la mentoría y la transferencia parcial entre
  habilidades relacionadas viven en
  [CHR-002](CHR-002_knowledge-and-learning.md).
- Las habilidades específicas cerradas para el primer corte jugable en
  [CHR-001](CHR-001_character-model.md#31-habilidades-específicas-iniciales)
  siguen vigentes como alcance de implementación; ver la reconciliación en
  §7.
- La taxonomía extendida y todavía `draft` de [CHR-005](CHR-005_extended-skill-taxonomy.md)
  queda sustituida como candidato por el catálogo cerrado de este
  documento; ver §7.
- Las 34 prioridades de [UI-003](../80-interface/UI-003_work-priority-taxonomy.md)
  organizan disposición y urgencia de trabajo, no habilidad; no deben
  confundirse con las 34 habilidades de este documento pese a compartir
  cantidad.

## 6. Casos límite o riesgos

- No confundir las 34 prioridades de UI-003 con las 34 habilidades de este
  documento: coinciden en número por coincidencia de diseño, no porque sean
  la misma lista. Cada prioridad puede requerir cero, una o varias
  habilidades de este catálogo, y una habilidad puede ser relevante para
  varias prioridades.
- No convertir Ciencias, Supervivencia o Medicina en una habilidad
  omnisciente: su alcance se limita mediante dominios y conocimientos
  concretos (§3.3.9, §3.3.26, §3.3.27).

## 7. Preguntas abiertas

- **Calibración de la escala 1–10**: qué significa cada punto, curvas de
  progreso y dificultad de alcanzar niveles altos (ver
  [CHR-007](CHR-007_hidden-potential-caliber-and-adaptation.md#71-escalas-exactas)).
- **Dominios de cada habilidad**: los dominios listados en §3.3 son
  ejemplos orientativos, no el catálogo máximo definitivo de
  especializaciones, proficiencias, conocimientos o profesiones.
- **Reconciliación con el alcance de implementación de CHR-001.** Las 11
  habilidades específicas cerradas en
  [CHR-001 §3.1](CHR-001_character-model.md#31-habilidades-específicas-iniciales)
  para el primer corte jugable **no coinciden literalmente** con los
  nombres de este catálogo de horizonte máximo: por ejemplo, CHR-001 lista
  «Búsqueda y recuperación» y «Rastreo y caza» como habilidades propias del
  primer corte, mientras que este documento descarta Búsqueda y Caza como
  habilidades base (§3.4) y las resuelve mediante Advertir y trabajos
  compuestos. Esta es una discrepancia real entre el alcance ya implementado
  y el horizonte máximo, no una contradicción resuelta en silencio: CHR-001
  §3.1 sigue siendo la fuente válida de qué existe en el primer corte
  jugable, y este documento es la fuente válida del horizonte máximo de
  diseño. La estrategia y el momento de migrar el alcance implementado
  hacia este catálogo quedan pendientes, de forma análoga a la migración ya
  reconocida y también pendiente entre las diez familias de prioridad
  implementadas y las 34 prioridades de
  [UI-003](../80-interface/UI-003_work-priority-taxonomy.md) (ver
  [DEC-0007](../decisions/DEC-0007_layered-work-and-priorities.md)).
- Ver [CHR-007](CHR-007_hidden-potential-caliber-and-adaptation.md) para
  las decisiones abiertas de potencial, calibre y adaptación.

## 8. Ejemplos no normativos

Los ejemplos de §3.5 (trabajos compuestos) ilustran el uso del catálogo y no
fijan cantidades, tiempos ni probabilidades.
