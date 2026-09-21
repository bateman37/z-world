---
id: SET-007
title: Modelo de objeto y familias logísticas de recursos
status: draft
canonical_for:
  - capas de aprovechamiento de un lugar
  - modelo conceptual de objeto completo, recurso, herramienta y consumible
  - catálogo de horizonte máximo de familias logísticas
  - grados técnicos y reglas de sustitución entre grados
depends_on:
  - SET-003
related:
  - SET-008
  - WLD-004
  - CHR-006
  - ARC-004
---

## 1. Propósito

Definir cómo Z-World representa los objetos del mundo y su conversión en
recursos útiles, con la decisión central:

> **Muchos objetos concretos y reconocibles en el mundo, pero pocas
> familias abstractas de recursos en el almacén.**

Reconcilia dos necesidades: un mundo detallado, coherente y reconocible
(frigoríficos, televisores, ordenadores, lavadoras, calentadores,
herramientas, muebles, ropa, maquinaria), frente a una gestión del
asentamiento que siga siendo comprensible, sin administrar miles de
tornillos, modelos de placas, conectores, rodamientos o repuestos
incompatibles. Este documento no diseña los catálogos que la fuente original
deja expresamente para otros ámbitos: comida, agua, combustibles, armas o
munición.

## 2. Principios que no deben romperse

- El objeto existe antes que su recurso: mientras está completo puede
  inspeccionarse, reconocerse total o parcialmente, usarse en su lugar,
  trasladarse, reservarse, repararse, instalarse en otro lugar, comerciarse
  o desmontarse; solo al desmontarlo se transforma, total o parcialmente,
  en familias logísticas abstractas (ver
  [SET-008](SET-008_disassembly-and-world-transformation.md)).
- El detalle visible no obliga a crear una categoría logística: el mundo
  puede describir tornillos, correas, relés, placas, tubos, conectores o
  válvulas sin que todos sean recursos independientes en el inventario.
- Las familias representan decisiones, no contabilidad: una familia de
  recursos solo existe si diferencia de forma comprensible qué se puede
  construir o reparar, de qué lugar se puede recuperar, qué habilidad o
  herramienta exige, su escasez estratégica o la decisión de conservarlo o
  consumirlo.
- Grado técnico, calidad y condición son tres conceptos distintos: el grado
  es capacidad o complejidad abstracta del componente; la calidad son
  prestaciones o fiabilidad; la condición es el estado físico actual y su
  deterioro. Un motor eléctrico III puede estar destrozado; una herramienta
  básica puede ser de excelente calidad; una placa electrónica I puede
  estar en perfecto estado.
- La persona no crea el contenido del mundo: lo interpreta y lo recupera. Lo
  que puede cambiar según quien inspecciona o desmonta es cuánto reconoce,
  cómo lo describe, si comprende su función, si sabe que puede repararse, si
  identifica componentes de valor, qué cantidad recupera, en qué estado, con
  qué duración y con qué riesgo; nunca cambia arbitrariamente lo que siempre
  había en el lugar (ver
  [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md)).
- Ampliar el catálogo de objetos del mundo no debe ampliar continuamente el
  inventario: cientos o miles de objetos completos pueden incorporarse
  usando combinaciones de familias logísticas ya existentes.

## 3. Modelo funcional

### 3.1 Capas de aprovechamiento de un lugar

Los lugares y edificios contienen varias capas de recursos, descubiertas y
recuperadas mediante acciones distintas:

| Capa | Qué contiene | Acción principal | Ejemplos |
|---|---|---|---|
| Contenido suelto | Objetos almacenados o abandonados. | Registrar o saquear. | Comida, ropa, medicación, libros, herramientas, semillas. |
| Mobiliario y equipamiento | Objetos grandes o funcionales. | Usar, trasladar, reparar o desmontar. | Camas, armarios, frigoríficos, televisores, ordenadores, maquinaria. |
| Instalaciones | Sistemas integrados en el edificio. | Desmontaje selectivo. | Cableado, tuberías, cuadros eléctricos, bombas, calentadores, ventilación. |
| Acabados recuperables | Elementos constructivos todavía separables. | Desmontaje profundo. | Puertas, ventanas, cristales, sanitarios, tablones, chapa, aislamiento. |
| Estructura | Materiales que forman el edificio. | Desmantelamiento o demolición. | Madera, piedra, ladrillo, acero, vigas, tejas, escombros. |

Este documento se concentra en objetos completos, equipamiento e
instalaciones. La demolición de estructuras pertenece al sistema de
edificios y mantiene reglas propias (fuera de este alcance).

### 3.2 Modelo conceptual de objeto

**Objeto completo.** Entidad reconocible que conserva identidad y función
propias (frigorífico, televisión, ordenador, lavadora, bomba de agua,
calentador, generador, bicicleta, tractor, cama, estufa, máquina de coser,
banco de trabajo). Puede tener, conceptualmente: identidad y tipo,
ubicación física, tamaño y peso, portabilidad, función, consumo energético o
de combustible, capacidad, condición, calidad, estado funcional, piezas
ausentes, requisitos de uso, requisitos de instalación, conocimiento
necesario para evaluarlo, posibilidades de reparación, perfil de
desmontaje, valor de intercambio y valor personal/histórico/narrativo. No
todos estos datos necesitan mostrarse ni simularse con idéntica profundidad
desde la primera versión.

**Recurso almacenado.** Abstracción logística que representa material o
componentes recuperados y agrupables (chapa, madera, cableado, placa
electrónica II, motor eléctrico I, piezas mecánicas II, material de cura).
Debe poder agruparse en pilas comprensibles, transportarse y reservarse,
consumirse en reparación/construcción/producción, aparecer agregado en la
interfaz y mantener solo las diferencias que generen decisiones reales.

**Herramienta o equipo de trabajo.** Objeto funcional que permite realizar
un trabajo o mejora su resultado; no se consume como un componente
ordinario, aunque puede deteriorarse, perderse o romperse (ver §5).

**Consumible.** Objeto o recurso cuya función principal implica gastarlo:
alimento, agua, combustible, medicación o material de cura. Los catálogos
completos de comida, agua, combustibles y munición se tratan en documentos
específicos (fuera de este alcance); este documento solo cierra las
familias médicas y la relación de las plantas con los recursos (§6).

**Vestimenta y equipo personal.** Ropa, calzado, protecciones, mochilas y
otros objetos que una persona utiliza o equipa; conservan identidad y
condición individual cuando eso afecta a su uso (§6).

**Objeto de conocimiento.** Libros, manuales, planos, documentos, discos y
soportes digitales pueden tener valor físico, pero su función principal es
contener conocimiento; no se reducen automáticamente a materiales cuando su
contenido todavía puede recuperarse, estudiarse, copiarse o incorporarse al
conocimiento comunitario (ver
[SET-006](SET-006_knowledge-assets-and-capability.md)).

### 3.3 Familias logísticas de horizonte máximo

Clasificación deliberadamente pequeña, base ampliable, no obligación de
crear nuevas familias por cada objeto que se añada:

| Familia | Clasificación | Representación principal |
|---|---|---|
| Materiales | Chapa, madera, vidrio, tela, piedra y otros materiales de extracción. | Cantidad y calidad aprovechable. |
| Tuberías y cableado | Tuberías para agua u otros fluidos; cableado para transportar electricidad. | Cantidad. |
| Placas electrónicas | Grados I–III. | Cantidad, grado y estado aprovechable. |
| Motores eléctricos | Grados I–III. | Cantidad, grado y estado aprovechable. |
| Motores de combustión | Grados I–III. | Cantidad, grado y estado aprovechable. |
| Baterías | Grados I–III. | Cantidad, grado, condición y carga cuando sea relevante. |
| Piezas mecánicas | Grados I–II. | Cantidad, grado y estado aprovechable. |
| Componentes eléctricos | Grados I–II. | Cantidad, grado y estado aprovechable. |
| Herramientas | Tipo y calidad. | Disponibilidad, calidad y condición. |
| Suministros médicos | Material de cura, analgésicos y antibióticos. | Cantidad y estado sanitario. |
| Plantas y semillas | Comestibles, medicinales, fibras vegetales y semillas. | Cantidad y propiedades conocidas. |
| Ropa | Tipo, protección y condición. | Objeto equipable o pila cuando sean equivalentes. |

Esta tabla es el **horizonte máximo** de familias logísticas y complementa,
sin sustituir, los **9 recursos rastreados en la primera versión** ya
cerrados en
[SET-003 §3.2](SET-003_resources-logistics-and-condition.md#32-recursos-rastreados-en-la-primera-versión).
Ninguna familia de esta tabla se implementa por este documento; ver la
reconciliación en §7.

### 3.4 Materiales sin grado técnico

**Familias iniciales**: chapa, madera, vidrio, tela, piedra y otros
materiales de extracción que se decidan posteriormente. Se representan
mediante tipo, cantidad y **calidad aprovechable** (resume conservación,
pureza, facilidad de reutilización y pérdidas previsibles al trabajarlo, sin
niveles ni presentación cerrados todavía).

**Objetos completos frente a material.** Una puerta, una ventana o una viga
recuperada pueden mantenerse como objetos reutilizables si conservan una
función directa; solo pasan a ser madera, vidrio o metal genérico cuando se
procesan, se rompen o dejan de merecer identidad individual.

### 3.5 Tuberías y cableado

Dos familias funcionales simples: **tuberías** (transportan agua u otros
fluidos dentro de las soluciones previstas) y **cableado** (transporta
electricidad y conecta instalaciones), sin gestionar cada diámetro,
aleación, aislamiento, conector o norma eléctrica. La viabilidad de una
instalación puede depender de cantidad disponible, distancia, herramientas,
conocimiento, calidad del trabajo, estado general del material y requisitos
específicos de la solución; la abstracción logística no impide que el mundo
describa una tubería rota, un cable quemado o una instalación de cobre de
especial valor.

### 3.6 Placas electrónicas, motores y baterías (grados I–III)

| Familia | Grado I | Grado II | Grado III |
|---|---|---|---|
| Placas electrónicas | Juguetes, radios sencillas, aparatos pequeños, controles básicos → reparaciones electrónicas simples, alarmas, automatismos básicos. | Televisores, electrodomésticos programables, comunicaciones y sistemas de control → control de instalaciones, equipos de comunicación, automatización intermedia. | Ordenadores, servidores, equipamiento industrial/médico/militar → computación, control avanzado, sistemas complejos y proyectos especializados. |
| Motores eléctricos | Ventiladores, juguetes, mecanismos y herramientas pequeñas → automatismos y mecanismos ligeros. | Frigoríficos, lavadoras, bombas domésticas y herramientas potentes → bombeo, talleres, maquinaria media. | Ascensores, maquinaria industrial, grandes bombas, equipos especializados → infraestructura y producción pesada. |
| Motores de combustión | Motosierras, generadores pequeños, ciclomotores, maquinaria ligera → equipos portátiles y trabajos ligeros. | Coches, furgonetas, generadores medianos, maquinaria intermedia → transporte y producción de escala media. | Camiones, tractores, maquinaria pesada → transporte pesado, agricultura mecanizada e infraestructura. |
| Baterías | Aparatos portátiles, pequeñas instalaciones, herramientas → consumo reducido y equipos portátiles. | Coches, sistemas domésticos, equipos medianos → arranque, almacenamiento doméstico, trabajo medio. | Vehículos pesados, instalaciones industriales, almacenamiento de gran capacidad → infraestructura, maquinaria pesada, redes locales. |

Los límites de la abstracción se aplican a las cuatro familias: un grado
superior no está necesariamente en mejor condición que uno inferior; un
ordenador no entrega siempre una placa III funcional; una placa III no
repara gratuitamente cualquier aparato más sencillo; adaptar un componente
de grado superior puede exigir conocimiento, herramientas, tiempo y
componentes adicionales; la existencia de un motor no garantiza que el
sistema completo funcione (también pueden hacer falta combustible,
batería, piezas mecánicas, herramientas, reparación, lubricación y
conocimiento); las baterías, además, pueden requerir carga actual,
capacidad degradada, posibilidad de recarga y riesgo por daño o mala
manipulación, sin convertirse en una simulación eléctrica individual
innecesaria. La procedencia concreta puede seguir apareciendo en la
descripción narrativa sin crear una nueva familia de inventario.

### 3.7 Piezas mecánicas y componentes eléctricos (grados I–II)

Se renuncia deliberadamente a separar tornillería, engranajes, rodamientos,
correas, cadenas, muelles, transmisiones y mecanismos en numerosas familias
logísticas:

| Familia | Grado I | Grado II |
|---|---|---|
| Piezas mecánicas | Mecanismos comunes y reparaciones sencillas: bicicletas, puertas, herramientas, muebles, mecanismos básicos. | Maquinaria, vehículos y mecanismos exigentes: motores, bombas, talleres, tractores, equipamiento pesado. |
| Componentes eléctricos | Instalaciones domésticas o de baja exigencia: interruptores, fusibles, pequeños relés, protecciones, conexiones comunes. | Sistemas de potencia elevada, industriales o complejos: cuadros, contactores, transformadores, inversores, protecciones exigentes. |

La descripción narrativa o la evaluación de un especialista puede
identificar la pieza concreta; el almacén la absorbe como pieza del grado
correspondiente salvo que el objeto tenga valor funcional por sí solo. El
cableado se mantiene separado de los componentes eléctricos porque
representa la extensión física de las redes y se consume principalmente por
distancia o recorrido.

### 3.8 Reglas de sustitución entre grados

- **Un grado superior puede cubrir una necesidad inferior, pero no
  gratuitamente**: la adaptación puede exigir mayor habilidad, conocimiento
  específico, herramientas adecuadas, componentes auxiliares, más tiempo, o
  desperdicio/pérdida de parte del valor técnico. Ejemplo: usar la única
  placa electrónica III de la comunidad para reparar una radio puede ser
  posible, pero estratégicamente ruinoso.
- **Acumular grados inferiores no crea automáticamente un grado superior**:
  varias placas I no se convierten por suma en una placa III; una solución
  concreta puede permitir combinar componentes inferiores, pero debe formar
  parte del diseño de esa solución y exigir el conocimiento correspondiente.
- **El requisito pertenece a la solución concreta**: cada reparación,
  construcción o proyecto declara las familias necesarias, grados mínimos o
  admitidos, posibles sustituciones, consecuencias de adaptar componentes,
  y herramientas y conocimientos requeridos (ver la declaración de
  solución de producción ya cerrada en
  [SET-005](SET-005_production-web-and-infrastructure.md)). No existe una
  conversión universal que ignore el contexto.

## 4. Reglas aprobadas

- El objeto existe antes que su recurso; solo el desmontaje lo transforma
  en familias logísticas (§2, §3.2).
- Grado técnico, calidad y condición son tres conceptos distintos que nunca
  se confunden (§2).
- La tabla de familias logísticas de §3.3 es el catálogo de horizonte
  máximo; no autoriza su implementación inmediata (§7).
- Un grado superior nunca sustituye gratuitamente a uno inferior, y los
  grados inferiores nunca se suman automáticamente para crear uno superior
  (§3.8).

## 5. Herramientas

Las herramientas no son meros bonos: pueden habilitar un trabajo que de
otro modo no puede realizarse, mejorar la velocidad, reducir errores,
disminuir accidentes, aumentar el rendimiento del desmontaje, preservar
mejor los componentes recuperados o potenciar una habilidad sin
reemplazarla (ver también
[ARC-005](../90-architecture/ARC-005_teamwork-orders-modes-and-conditions.md#35-estado-herramientas-y-entorno)).

**Conjuntos funcionales iniciales**, para evitar administrar cada
destornillador y llave por separado: herramientas básicas, carpintería,
mecánica, electricidad, construcción, agricultura, costura, medicina. Los
objetos concretos (martillo, sierra, llave inglesa, multímetro, alicates,
azada, máquina de coser) pueden seguir existiendo en el mundo e integrarse
en el conjunto correspondiente cuando sean equivalentes desde el punto de
vista logístico.

**Propiedades**: tipo, calidad (lo bien que permiten ejecutar el trabajo) y
condición (desgaste y posibilidad de fallo). Queda pendiente si algunos
equipos especializados deben conservar identidad individual por su
importancia excepcional (ver §7).

## 6. Suministros médicos, plantas, semillas y ropa

**Suministros médicos.** Tres familias iniciales, sin multiplicar
medicamentos:

| Familia | Representa | Uso general |
|---|---|---|
| Material de cura | Vendas, gasas, desinfectantes y consumibles de atención inmediata. | Limpiar, cubrir y tratar heridas. |
| Analgésicos | Medicación contra dolor, fiebre y malestar. | Alivio y estabilización sintomática. |
| Antibióticos | Tratamientos contra infecciones bacterianas. | Control de infecciones cuando sean apropiados. |

Los antibióticos no sustituyen al material de cura; un analgésico no
elimina la causa de una lesión; el conocimiento sanitario cambia la
identificación y el uso seguro; el estado sanitario, la caducidad o la
conservación pueden afectar a su utilidad sin crear una categoría distinta
por medicamento. En el futuro pueden existir tratamientos específicos
vinculados a enfermedades, condiciones crónicas o necesidades personales sin
ampliar ahora el inventario general.

**Plantas y semillas.** No se almacena cada especie vegetal como familia
independiente; se clasifican por utilidad principal: plantas comestibles
(alimento, ingredientes, recolección de emergencia), plantas medicinales
(remedios, preparados, tratamientos tradicionales), fibras vegetales
(cuerda, tejido, relleno, materiales de fabricación) y semillas (inicio,
mantenimiento y reproducción de cultivos). La especie concreta sigue siendo
relevante para reconocer si es segura, saber cuándo recogerla, procesarla
correctamente, cultivarla, obtener distinto rendimiento, descubrir usos
adicionales o provocar intoxicaciones y errores de identificación: la
abstracción logística no elimina el conocimiento individual (ver
[CHR-002](../30-characters/CHR-002_knowledge-and-learning.md)). Una persona
puede ver «setas desconocidas» mientras otra reconoce una variedad
comestible; tras identificarlas y procesarlas, se integran en una familia de
uso comprensible.

**Ropa.** Conserva más identidad que un material genérico porque puede
equiparse directamente y afectar a la persona. Se diferencia al menos por
tipo, protección y condición; en el futuro la protección puede considerar
frío, lluvia, calor, mordeduras o arañazos, golpes, movilidad, visibilidad y
carga o capacidad de transporte, sin que todos estos factores estén activos
desde la primera versión. La ropa puede utilizarse, repararse, remendarse,
adaptarse, intercambiarse o convertirse en tela cuando deja de compensar
conservarla; la habilidad Confección
([CHR-006 §3.3.16](../30-characters/CHR-006_characteristics-and-skill-catalog.md#33-catálogo-completo-de-34-habilidades-base))
influye en la calidad de las reparaciones y en la cantidad de tela
recuperada.

## 7. Interacciones con otros sistemas y preguntas abiertas

- Los 9 recursos rastreados en la primera versión (agua, alimento fresco,
  alimento conservado, madera y tablones, tela y prendas, herramientas
  básicas, materiales de reparación, medicinas básicas, munición inicial)
  y los 6 estados de logística ya están cerrados en
  [SET-003](SET-003_resources-logistics-and-condition.md); este documento
  no los sustituye. **Reconciliación pendiente:** la migración desde esos 9
  recursos agregados hacia las 12 familias logísticas de horizonte máximo
  de §3.3, y desde ellas hacia objetos completos individuales, no tiene
  fecha ni estrategia decidida; es análoga a la migración ya reconocida y
  también pendiente entre las diez familias de prioridad implementadas y
  las 34 de [UI-003](../80-interface/UI-003_work-priority-taxonomy.md) (ver
  [DEC-0007](../decisions/DEC-0007_layered-work-and-priorities.md)).
- El desmontaje que transforma un objeto completo en estas familias vive en
  [SET-008](SET-008_disassembly-and-world-transformation.md).
- El reconocimiento dependiente de la persona (qué se sabe de un objeto
  antes de tocarlo) vive en
  [WLD-004](../20-world/WLD-004_expertise-dependent-recovery.md).
- Las habilidades y conocimientos que habilitan cada familia y grado viven
  en [CHR-006](../30-characters/CHR-006_characteristics-and-skill-catalog.md).
- El procedimiento de resolución que ejecuta una reparación o construcción
  usando estas familias vive en
  [ARC-004](../90-architecture/ARC-004_action-and-event-resolution-model.md).

**Preguntas abiertas propias de este documento**: nombres definitivos de
los niveles de calidad aprovechable (§3.4); número final de conjuntos de
herramientas y si algún equipo especializado conserva identidad individual
(§5); catálogo completo de prendas y protecciones más allá de tipo/
protección/condición (§6); catálogo de comida, agua, combustibles, armas y
munición (fuera de este alcance, ver §1); catálogo completo de especies
vegetales (§6); tratamiento de materiales peligrosos y de residuos/
escombros (no tratado en este documento).

## 8. Ejemplos no normativos

Los ejemplos de procedencia y uso de cada grado en §3.6 son orientativos y
no fijan cantidades, tiempos ni probabilidades de recuperación; esas
cuestiones se resuelven mediante el modelo de desmontaje de
[SET-008](SET-008_disassembly-and-world-transformation.md).
