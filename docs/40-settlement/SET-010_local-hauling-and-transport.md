---
id: SET-010
title: Transporte y logística local
status: approved
canonical_for:
  - composición de un traslado
  - métodos de transporte activos en el primer catálogo
  - horizonte máximo de medios de transporte
  - modelo mínimo de carga (peso, bulto, etiquetas)
  - compatibilidad de ruta con accesos y terreno
  - fases logísticas de un traslado
  - logística por etapas y puntos de transferencia
  - selección de método (Auto o específico)
  - cooperación, ruido, fatiga e interrupciones del transporte
depends_on:
  - SET-003
  - SET-008
related:
  - WLD-010
  - WLD-011
  - CAT-005
  - UI-001
  - UI-003
  - ARC-006
  - ARC-007
  - ARC-008
  - DEC-0013
  - DISC-0007
---

## 1. Propósito

Cerrar el transporte local como sistema físico: qué combina un traslado,
qué métodos están activos en el primer catálogo implementable, cómo se
resume una carga, cómo se comprueba una ruta, en qué fases se ejecuta un
traslado, cómo funciona la logística por etapas y transferencias, cómo se
selecciona un método y qué horizonte de medios queda documentado sin
activarse todavía.

## 2. Principios que no deben romperse

- Un medio de transporte no es un multiplicador universal de velocidad.
- Ningún traslado teletransporta carga ni medio: el medio debe
  encontrarse, reservarse y desplazarse hasta la carga; cancelar un
  trabajo deja carga y medio donde causalmente corresponda.
- El peso no es el único factor de una carga; tampoco se simula
  milimétricamente cada forma.
- Cualquier número de ayudantes no concede una bonificación genérica: el
  espacio y los accesos limitan cuántas personas ayudan realmente.
- El selector `Auto` no es omnisciente: valora solo con información
  conocida por la comunidad.
- Animales de carga/tiro y vehículos no se activan como solución logística
  controlable en este primer catálogo.

## 3. Modelo funcional

### 3.1 Composición de un traslado

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

### 3.2 Métodos activos en el primer recorte

1. **A pulso por una persona**: manos, brazos u hombro.
2. **Con recipiente o equipamiento personal**: mochila, saco, caja, cubo,
   bidón.
3. **Porte coordinado**: dos o más personas para una carga voluminosa o
   pesada.
4. **Carretilla**: adecuada para carga y terreno razonablemente
   transitable, con límites de escalera, pendiente y anchura.
5. **Carro de compra o carro de mano**: útil sobre superficie firme, más
   torpe o ruidoso en barro, grava, bosque y escombros.

Carretilla y carro comparten el mismo motor de transporte y se
diferencian mediante datos y posibilidades reales, no mediante sistemas
distintos (ver
[CAT-005 §3.1](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md#31-familias-de-comportamiento-iniciales),
familia «Transporte humano»).

### 3.3 Horizonte máximo de métodos

Documentado sin activarse todavía: arrastre directo; lona, camilla o
arnés; cadena humana; trineo o plataforma de arrastre; carro de
plataforma; carretilla vertical o diablillo; bicicleta con alforjas;
bicicleta con remolque; poleas, cabrestantes, rampas, rodillos y
polipastos; animal de carga; carro o carreta animal; motocicleta, quad,
coche, furgoneta, pickup, camión y tractor; remolques y maquinaria
especializada. Los vehículos y animales pueden existir como restos o
entidades del mundo cuando otra regla lo permita, pero no funcionan
todavía como solución logística controlable.

### 3.4 Propiedades de un método

Cada método puede declarar conceptualmente: capacidad de peso; capacidad
de volumen; tipos de carga compatibles; operadores necesarios; anchura y
giro; superficies y pendientes compatibles; velocidad cargado y vacío;
esfuerzo y fatiga; ruido; tiempo de preparación, carga y descarga;
condición y averías; combustible, energía, alimento o mantenimiento
cuando corresponda; facilidad de abandono o retirada ante peligro. No se
cierran cifras exactas.

### 3.5 Modelo mínimo de carga

Se usa conceptualmente: peso; volumen o bulto; etiquetas de manipulación
cuando aporten decisiones (líquido, frágil, largo, voluminoso,
contaminante o mantener vertical); cantidad mínima de personas o medio
necesario cuando exista requisito duro. Se evitan ambos extremos: peso
como único factor, y simulación milimétrica de cada forma.

### 3.6 Ruta completa

La viabilidad considera: puertas, ventanas, portones y brechas (ver
[WLD-011](../20-world/WLD-011_openings-access-and-connectivity.md));
escaleras, rampas y umbrales; anchura y giros; pendiente; carretera,
tierra, barro, bosque, grava, escombros y agua; muros, barricadas y
cierres; zonas habituales, de precaución y prohibidas; amenazas e
información conocida; origen y destino accesibles. La ruta puede quedar
bloqueada antes de empezar o descubrir un obstáculo durante el trabajo si
la información era incompleta; el resultado debe producir explicación y
evento coherentes.

### 3.7 Fases logísticas

Un trabajo de transporte puede requerir: (1) reservar carga y medio; (2)
recuperar o recoger el medio; (3) desplazarse al origen; (4) preparar y
cargar; (5) recorrer la ruta; (6) atravesar accesos; (7) descargar; (8)
almacenar, entregar o instalar; (9) estacionar, devolver o abandonar el
medio según el resultado. Interrumpir el trabajo no devuelve mágicamente
carga y medio a sus posiciones iniciales.

### 3.8 Logística por etapas y puntos de transferencia

Destinos válidos: inventario o equipamiento personal; mochila, recipiente,
carretilla o carro; punto de reunión; borde de campo; zona temporal de
carga; puerta o portón del perímetro; almacén exterior; estancia;
contenedor; taller; obra; instalación productiva. Ejemplo obligatorio: un
carro llega hasta el portón, descarga allí, y varias personas llevan la
carga a una despensa a través de una puerta más estrecha (ver
[WLD-011 §3.7](../20-world/WLD-011_openings-access-and-connectivity.md#37-compatibilidad-de-accesos-y-transporte)).

### 3.9 Selección del método

La orden puede expresar `Método de transporte: Auto / método concreto
disponible`. Este selector no se confunde con: la prioridad
`Nunca/1–5` (ver [UI-003](../80-interface/UI-003_work-priority-taxonomy.md)); el
tamaño de equipo `Auto/1/2/3/4` (ver
[UI-006](../80-interface/UI-006_contextual-place-interaction-and-teams.md));
el modo de ritmo o atención (ver
[ARC-007](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md));
ni la asignación de personas. `Auto` puede valorar, con información
conocida: viajes necesarios; tiempo; fatiga; ruido; riesgo; terreno;
accesos; conservación de la carga; disponibilidad y condición del medio;
combustible o recursos futuros cuando existan. El jugador puede imponer
un método específico y recibir el motivo si no es viable.

### 3.10 Cooperación y seguridad

Dos personas pueden coordinar una carga que una sola no puede mover; un
ayudante puede estabilizar, guiar, abrir paso o vigilar. Añadir personas
no concede bonificación genérica; el espacio y los accesos limitan cuántas
ayudan realmente. Ruido y exposición se producen a lo largo de la ruta,
no solo al finalizar. Las políticas de respuesta a amenaza, interrupción y
retirada se heredan de
[ARC-007](../90-architecture/ARC-007_teamwork-orders-modes-and-conditions.md)
y [ARC-008](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md).
Ante peligro puede quedar carga abandonada, carro volcado, objeto dañado
o trabajo incompleto.

## 4. Reglas aprobadas

- Los cinco métodos de la sección 3.2 son los únicos activos en el primer
  catálogo; el horizonte de la sección 3.3 no se activa sin una nueva
  decisión.
- Ningún traslado teletransporta carga ni medio; cancelar un trabajo deja
  ambos en su posición causal.
- El selector de la sección 3.9 nunca se confunde con prioridad, equipo,
  ritmo ni atención.
- `Auto` solo valora entre medios conocidos y disponibles; nunca usa un
  vehículo o animal inexistente.
- Una carga puede fallar por bulto sin fallar por peso, y viceversa.

## 5. Interacciones con otros sistemas

- Los objetos de transporte (carretilla, carro) y sus atributos se
  definen en
  [CAT-005](../catalogs/CAT-005_initial-object-resource-and-transport-slice.md).
- La compatibilidad de accesos con carga se define en detalle en
  [WLD-011 §3.7](../20-world/WLD-011_openings-access-and-connectivity.md#37-compatibilidad-de-accesos-y-transporte).
- Las zonas, terreno y transformación que condicionan la ruta se definen
  en [WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md).
- Los estados de logística y condición de los recursos transportados se
  definen en
  [SET-003](SET-003_resources-logistics-and-condition.md).
- El modelo de objeto completo transportado se define en
  [SET-008](SET-008_object-model-and-logistics-families.md).
- El procedimiento de resolución, cooperación y eventos que ejecuta un
  traslado se define en
  [ARC-006](../90-architecture/ARC-006_action-and-event-resolution-model.md)–[ARC-008](../90-architecture/ARC-008_outcomes-knowledge-events-and-validation.md).

## 6. Casos límite o riesgos

- Tratar un medio como bonificación abstracta de velocidad contradice la
  sección 2.
- Permitir que `Auto` elija un vehículo o animal inexistente contradice la
  sección 3.9.
- Confundir el selector de método con prioridad o tamaño de equipo
  contradice la sección 3.9.
- Sumar ayudantes sin límite de espacio o acceso contradice la sección
  3.10.

## 7. Preguntas abiertas

- Cifras exactas de capacidad, velocidad, pendiente y anchura por método.
- Fórmulas exactas de ruido y fatiga.
- Catálogo y activación de animales de carga/tiro y vehículos.
- Interfaz gráfica definitiva del selector de método y de la ficha de
  traslado.

## 8. Ejemplos no normativos

- Un frigorífico exige porte coordinado o una carretilla compatible; dos
  porteadores no pueden atravesar una abertura demasiado estrecha y deben
  buscar otra vía o reducir la carga.
- Un carro de compra es eficiente sobre la carretera firme del pueblo,
  pero se vuelve más torpe y ruidoso al cruzar un tramo embarrado o
  cubierto de escombros.
