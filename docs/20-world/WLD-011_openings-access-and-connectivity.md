---
id: WLD-011
title: Aberturas, cierres y conectividad
status: approved
canonical_for:
  - separación entre abertura, cierre instalado y modificación/obstrucción
  - colocación procedural coherente de accesos
  - conexiones entre espacios y grafo de circulación
  - estados y acciones iniciales sobre accesos existentes
  - tapiado, ventanas y brechas
  - compatibilidad de accesos con carga y transporte
  - horizonte de nuevos huecos, rampas y escaleras
depends_on:
  - WLD-005
  - WLD-010
related:
  - WLD-002
  - SET-007
  - SET-010
  - CAT-002
  - CAT-005
  - UI-006
  - ARC-005
  - ARC-006
  - DEC-0013
  - DISC-0007
---

## 1. Propósito

Cerrar que las entradas de un edificio no son decoración ni una propiedad
booleana: son topología física real que condiciona circulación, defensa y
logística. Define el modelo de abertura, cierre instalado y
modificación/obstrucción como conceptos separados, la colocación
procedural coherente de accesos, las conexiones posibles, los estados y
acciones iniciales, el tapiado, las ventanas y brechas, y la
compatibilidad entre carga, ruta y abertura.

## 2. Principios que no deben romperse

- Retirar una puerta no elimina la abertura; destruir el cierre puede
  dejar el hueco transitable; bloquear con muebles no transforma el hueco
  en pared; tapiar sí sustituye funcionalmente la abertura por un tramo
  cerrado; una brecha causada por daño puede crear una abertura donde
  antes no existía; una puerta recuperada puede conservarse como objeto
  completo reutilizable; la condición del hueco, la del cierre y las
  obstrucciones evolucionan de forma separada.
- Las entradas se generan según calle o camino, orientación y huella de
  parcela, patio y carga/descarga, programa de estancias, función
  original del edificio, época constructiva, accesibilidad y edificios y
  terreno adyacentes; nunca aleatoriamente sobre cualquier pared.
- La garantía de [SCN-003](../scenarios/SCN-003_first-day-starting-state.md)
  se conserva: el refugio provisional dispone de una salida secundaria
  existente o razonablemente creable. Esa garantía de escenario no se
  convierte en una obligación de dos puertas para todos los edificios.
- Las acciones desconocidas permanecen ausentes; las conocidas pero
  bloqueadas aparecen deshabilitadas con motivo, conforme a
  [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md).
- Un acceso viable a pie puede ser inviable para una carga concreta; la
  orden explica el bloqueo, nunca teletransporta el objeto a través del
  hueco ni busca una ruta omnisciente desconocida por la comunidad.

## 3. Modelo funcional

### 3.1 Tres conceptos separados

1. **Abertura**: hueco físico que conecta dos espacios.
2. **Cierre instalado**: puerta, portón, ventana, persiana, verja o
   trampilla que controla ese hueco.
3. **Modificación u obstrucción**: cerradura, bloqueo, barricada,
   tablones, refuerzo, escombros o tapiado.

### 3.2 Conexiones posibles

Una abertura puede conectar: exterior y estancia; dos estancias; dos
plantas; interior y patio; interior y garaje; interior y exterior de un
perímetro; carretera y recinto; edificio existente y ampliación. Forma
parte del grafo real de circulación, evacuación, defensa y logística
definido junto a [WLD-005 §3.4](WLD-005_semantic-place-and-building-generation.md#34-programa-de-estancias-y-grafo-funcional).

### 3.3 Colocación procedural coherente

Perfiles iniciales de [CAT-004](../catalogs/CAT-004_initial-semantic-place-slice.md):

| Edificio | Accesos plausibles |
|---|---|
| Casa mediana (`RES-10`) | Entrada principal; posible salida trasera; posible conexión de garaje. |
| Cabaña (`RES-17`) | Entrada principal; salida adicional poco frecuente; ventanas potencialmente utilizables. |
| Supermercado (`COM-02`) | Acceso de clientes; acceso de carga/servicio; posible salida secundaria. |
| Taller (`TAL-01`) | Puerta personal; portón ancho; posible acceso trasero o de almacén. |

### 3.4 Estados y acciones iniciales

El primer catálogo permite declarar, según corresponda: abrir y cerrar;
bloquear y desbloquear; forzar; despejar una obstrucción; reparar cierre,
marco o mecanismo; reforzar; barricadar; tapiar; desmontar preservando el
cierre; retirar o destruir de forma destructiva.

### 3.5 Tapiar un acceso

Tapiar no es un bono abstracto de defensa. Puede: consumir tiempo,
materiales y herramientas; generar ruido y escombros; recuperar o
destruir el cierre anterior según el método; eliminar una ruta de
evacuación; empeorar la circulación o el transporte; dejar una estancia
como fondo de saco; afectar luz, ventilación, temperatura o uso cuando
corresponda; ser parcial, provisional o profundo.

### 3.6 Ventanas, brechas y accesos no convencionales

Una ventana es un acceso potencial según tamaño, altura, apertura,
cristal, persiana y capacidad de la persona. Una brecha puede permitir
paso, visión, ruido, clima o amenaza sin admitir todas las cargas. Trepar
o atravesar no equivale a disponer de una ruta logística ordinaria.
Romper una ventana puede crear acceso y peligro por cristales, ruido o
exposición. Puertas, ventanas, portones y brechas utilizan el mismo marco
de posibilidad, conocimiento, acceso y resultado.

### 3.7 Compatibilidad de accesos y transporte

Cada abertura puede expresar conceptualmente: anchura y altura útiles;
umbral, desnivel o escalón; estado y obstrucciones; dirección o
limitaciones de apertura cuando importen; superficie inmediata; giro y
aproximación disponibles; y qué categorías de persona, carga o medio
pueden atravesarla.

Clases cualitativas de presentación inicial:

| Clase | Paso orientativo |
|---|---|
| Estrecho | Una persona sin carga voluminosa. |
| Normal | Persona con mochila, caja o recipientes manejables. |
| Ancho | Dos porteadores, carretilla o carro manual compatible. |
| Portón | Carro grande, animal de tiro o vehículo compatible. |

Estas clases no fijan medidas métricas finales; la geometría interna puede
conservar precisión suficiente para navegación, y la interfaz la resume
cualitativamente. Un acceso viable a pie puede ser inviable para un
frigorífico, un colchón, una puerta recuperada, una tubería larga, dos
porteadores coordinados, una carretilla, un carro de compra o un futuro
carro animal o vehículo (ver
[SET-010](../40-settlement/SET-010_local-hauling-and-transport.md)).

### 3.8 Horizonte futuro: crear o modificar huecos

Debe quedar documentado, sin incluirse en el primer código, que será
posible: crear un hueco nuevo; ampliar o estrechar uno existente;
trasladar una entrada; instalar una puerta o portón; añadir escalera o
rampa; cerrar definitivamente un hueco. Flujo conceptual futuro: (1)
inspeccionar la pared o estructura; (2) reconocer material, instalaciones
y función estructural; (3) elegir tipo y dimensiones funcionales del
acceso; (4) reservar personas, herramientas y materiales; (5) preparar,
apuntalar o colocar dintel cuando proceda; (6) abrir el hueco con ruido,
residuos y exposición; (7) instalar cierre o acabado; (8) actualizar
navegación, defensa, habitabilidad y logística. No requiere un editor
CAD; en una versión futura puede ser una acción contextual sobre un tramo
de pared.

## 4. Reglas aprobadas

- Abertura, cierre instalado y modificación/obstrucción son tres
  conceptos separados que ninguna implementación puede colapsar.
- Retirar el cierre nunca elimina la abertura; tapiar sí la sustituye
  funcionalmente por un tramo cerrado.
- Los accesos se colocan según la sección 3.3; ninguna implementación
  puede posicionarlos aleatoriamente sobre cualquier pared.
- La garantía de salida secundaria de `SCN-003` no se generaliza a una
  obligación de dos puertas para todos los edificios.
- Ninguna carga atraviesa un hueco incompatible sin explicación causal ni
  teletransporte.
- Crear o modificar un hueco nuevo permanece como horizonte futuro, no
  como primera herramienta CAD (sección 3.8).

## 5. Interacciones con otros sistemas

- El grafo funcional y el programa de estancias que estos accesos
  conectan se definen en
  [WLD-005](WLD-005_semantic-place-and-building-generation.md).
- El modelo de nodo, línea, área y estructura, y la red de perímetro que
  estos accesos cierran o abren, se definen en
  [WLD-010](WLD-010_mutable-terrain-and-spatial-construction.md).
- Puertas y portones como cierres instalados forman parte del catálogo de
  objetos de [CAT-005](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md).
- La recuperación, tapiado y demolición de elementos estructurales se
  reconcilian con
  [SET-007](../40-settlement/SET-007_building-exploitation-reuse-and-demolition.md).
- La compatibilidad de carga y ruta con cada acceso se define en detalle
  en [SET-010](../40-settlement/SET-010_local-hauling-and-transport.md).
- La ficha contextual, el selector de posibilidades y la regla de
  visibilidad se definen en
  [UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md).
- Las entidades conceptuales de abertura, cierre instalado, obstrucción y
  conexión se definen en
  [ARC-005](../90-architecture/ARC-005_semantic-world-data-model.md).

## 6. Casos límite o riesgos

- Presentar una puerta cerrada como equivalente a un hueco tapiado
  contradice la sección 3.1.
- Colocar accesos sin relación con estancias, calle o parcela contradice
  la sección 3.3.
- Revelar instalaciones ocultas de una pared sin inspección previa al
  proponer un hueco nuevo contradice la regla de visibilidad de la
  sección 2.
- Dejar que un objeto voluminoso atraviese cualquier puerta sin
  comprobación contradice la sección 3.7.

## 7. Preguntas abiertas

- Ingeniería estructural detallada de huecos nuevos (sección 3.8).
- Anchuras y alturas métricas exactas por clase cualitativa de la sección
  3.7.
- Daño y asalto detallado contra cierres y perímetros.
- Interfaz gráfica definitiva de la ficha de acceso.

## 8. Ejemplos no normativos

- Destruir la puerta principal de la cabaña puede dejar la abertura
  transitable y generar ruido; la puerta, si se recupera entera, puede
  reinstalarse en otro edificio conservando su identidad.
- Tapiar la salida trasera de la casa mediana puede consumir tablones y
  clavos, eliminar esa vía de evacuación y dejar el dormitorio adyacente
  como fondo de saco hasta que se abra un nuevo hueco.
