# Z-World — DESIGN-002: horizonte máximo de diseño

## 1. Autoridad y contexto

Esta entrega documenta el **horizonte máximo conocido de Z-World**: aquello
que el juego completo debe poder llegar a representar si el desarrollo avanza
por las direcciones ya acordadas. No amplía el primer corte jugable y no
encarga código.

La rama principal comprobada al preparar este prompt contiene `DESIGN-001`
completado y fusionado. Ya existen fuentes aprobadas para visión, interacción
local, personajes, autonomía, exploración, recursos, amenaza zombi inicial,
persistencia y primer corte jugable. Añade únicamente las responsabilidades de
largo plazo que todavía no tienen una fuente suficiente.

Claude Code actúa como documentalista. No reinterpretes estas decisiones ni
completes huecos con preferencias propias. Cuando falte una fórmula o catálogo,
consérvalo como pregunta abierta o contenido `draft` según se indique.

Los estados significan:

- `approved`: dirección funcional aceptada y obligatoria para el diseño
  futuro. No significa implementada ni incluida en la primera versión.
- `draft`: espacio de diseño que se quiere explorar, pero cuyo catálogo,
  detalle o equilibrio puede cambiar antes de aprobarse.
- `implemented`: no debe utilizarse en esta entrega.

## 2. Lectura obligatoria y uso del contexto

Lee, en este orden:

1. `AGENTS.md`, `CLAUDE.md`, `docs/INDEX.md`, `docs/STATUS.md`,
   `docs/OPEN-QUESTIONS.md` y `prompts/README.md`.
2. `DOC-001`, `VIS-001`, `VIS-002` y `RDM-001`.
3. Los índices de los dominios 20 a 90.
4. Solo las fuentes que esta entrega amplía: `WLD-001`, `WLD-002`,
   `CHR-001`, `CHR-002`, `CHR-003`, `SET-001`, `SET-002`, `SET-003`,
   `SOC-001`, `THR-001`, `NAR-001`, `UI-001`, `ARC-001`, `ARC-002` y
   `SCN-001`.
5. `DISC-0001` y `DISC-0002` solo para no convertir ejemplos o referentes en
   reglas nuevas.

Usa `rg` por ID antes de ampliar contexto. No releas todos los prompts, no
investigues fuentes externas y no instales dependencias. Escribe la prosa en
español; conserva IDs, rutas, código, claves y nombres técnicos.

## 3. Objetivo

El repositorio debe responder sin releer conversaciones:

- Qué experiencia pretende ofrecer Z-World cuando alcance su máxima
  profundidad conocida.
- Cómo puede crecer desde seis personas y un edificio hasta una sociedad y
  una región viva sin convertirse en otro juego.
- Qué direcciones ya están aprobadas y cuáles siguen en exploración.
- Cómo construir primero un corte pequeño sin cerrar vías futuras.

No redactes deseos aislados. Cada capacidad futura debe indicar qué sistema
amplía, qué información necesita y qué consecuencias puede producir.

## 4. Documentos nuevos obligatorios

Crea exactamente estos documentos con cabecera YAML conforme a `DOC-001`:

| Ruta | ID | Estado | Responsabilidad canónica |
|---|---|---|---|
| `docs/10-vision/VIS-003_maximum-design-envelope.md` | `VIS-003` | `approved` | Horizonte completo de experiencia y relación con entregas pequeñas. |
| `docs/20-world/WLD-003_strategic-world-and-regional-simulation.md` | `WLD-003` | `approved` | Mapa estratégico, exploración regional y simulación distante. |
| `docs/30-characters/CHR-004_life-history-and-personal-arcs.md` | `CHR-004` | `approved` | Profundidad futura de la persona, descubrimiento y evolución vital. |
| `docs/30-characters/CHR-005_extended-skill-taxonomy.md` | `CHR-005` | `draft` | Taxonomía candidata extensa de habilidades y técnicas. |
| `docs/40-settlement/SET-004_technological-transition-and-knowledge-economy.md` | `SET-004` | `approved` | Del aprovechamiento del mundo anterior a la reconstrucción local. |
| `docs/40-settlement/SET-005_production-web-and-infrastructure.md` | `SET-005` | `approved` | Red de soluciones, mantenimiento e infraestructuras. |
| `docs/50-society/SOC-002_internal-politics-and-leadership.md` | `SOC-002` | `approved` | Liderazgos, grupos, facciones, legitimidad y políticas internas. |
| `docs/50-society/SOC-003_external-communities-and-regional-history.md` | `SOC-003` | `approved` | Crecimiento autónomo de comunidades y relaciones regionales. |
| `docs/60-threats/THR-002_configurable-threat-horizon.md` | `THR-002` | `draft` | Ejes futuros de configuración de zombis y otras presiones. |
| `docs/70-narrative/NAR-002_memory-and-causal-world-history.md` | `NAR-002` | `approved` | Memoria significativa e historia causal del mundo. |
| `docs/80-interface/UI-002_management-at-community-scale.md` | `UI-002` | `approved` | Gestión legible al crecer población, territorio y sistemas. |
| `docs/90-architecture/ARC-003_multiscale-simulation-principles.md` | `ARC-003` | `approved` | Principios para simular detalle local y abstracción regional. |
| `docs/roadmap/RDM-002_long-term-capability-horizon.md` | `RDM-002` | `draft` | Mapa de capacidades futuras, sin fechas ni compromiso de versión. |
| `docs/decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md` | `DEC-0006` | `approved` | Separar visión máxima, alcance de entrega y estado implementado. |

No crees un GDD monolítico ni documentos adicionales. Si una regla ya vive en
una fuente, enlázala y añade solo la extensión que falte.

## 5. Reglas aprobadas del horizonte máximo

### 5.1 Identidad completa — `VIS-003`

Z-World debe poder crecer desde un grupo que busca agua y refugio hasta una
sociedad local conectada con una región. El jugador siempre dirige una
comunidad de personas concretas, no una nación abstracta ni unidades
intercambiables.

El horizonte combina:

- Gestión de asentamiento y transformación del entorno cercano.
- Supervivencia material creíble y dependiente del entorno.
- Personas con historia, capacidades, relaciones, objetivos y evolución.
- Conocimiento individual y colectivo que se aprende, transmite o pierde.
- Política interna, liderazgo y conflicto social emergente.
- Comunidades externas que crecen sin esperar al jugador.
- Región extensa con información incompleta y exploración indirecta.
- Narrativa emergente con causas, consecuencias y memoria.

La variación procedural no consiste solo en recolocar edificios o botín.
Cambian personas, entorno, hallazgos, comunidades, amenazas y decisiones.

No existe una escalera única que termine en armas y defensas que anulen el
juego. La seguridad aporta ventajas y calma reales; la profundidad posterior
puede venir de mantenimiento, especialistas, educación, relaciones,
legitimidad, expansión, comercio y proyectos colectivos.

Supervivencia pacífica, evasión, negociación, sigilo, especialización rural y
recuperación técnica son estrategias posibles. Ninguna es universal.

El horizonte guía arquitectura y documentación, pero no amplía `RDM-001`. Una
capacidad solo existe cuando una entrega la incluye y está implementada y
verificada.

### 5.2 Mundo estratégico — `WLD-003`

El mundo completo tiene dos escalas conectadas:

- Mapa local 3D con personas, edificios, trabajo, producción, defensas y
  amenazas inmediatas.
- Mapa estratégico regional mediante hexágonos, niebla de guerra, rutas,
  comunidades, expediciones, puestos y cambios regionales.

Cada hexágono representa una zona geográfica: bosque, valle agrícola,
carretera, suburbio, pueblo, instalación, río, montaña o área urbana. Escala
numérica y tamaño total siguen abiertos.

La niebla tiene niveles de conocimiento. Antes de visitar pueden conocerse
terreno aproximado, humo, ruido, radio, carreteras, rumores o movimientos.
La información puede ser incompleta, antigua o falsa según `NAR-001`.

El jugador forma expediciones con destino, integrantes, recursos y orientación
general de riesgo. El viaje se simula estratégicamente y presenta decisiones
relevantes. No crea una campaña paralela de control manual constante. El flujo
exacto queda abierto y no contradice que `UI-001` evite formularios para cada
tarea local.

Una zona puede revelar recursos, amenazas, rutas, comunidades y lugares
especiales. Puede convertirse en puesto, colonia, aliado, ruta comercial,
objetivo de recuperación o área local materializada.

El mundo lejano no se congela. Comunidades, amenazas y rutas cambian. Al
volverse relevante, una zona gana detalle respetando su historia resumida.

El estado regional inicial es posterior a un colapso plausible. Grandes
ciudades pudieron intentar ser controladas por autoridades o ejército y caer
de formas distintas. No aparecen comunidades estables de decenas de miles de
personas sin historia. Familias, puestos, trabajadores, supervivientes y
restos militares pueden ser semillas de comunidades posteriores.

`SCN-001` sigue siendo el primer inicio. Futuros inicios pueden variar
población, lugar, relaciones, pertenencias y condiciones sin diseñar ahora su
generador completo.

### 5.3 Personas y arcos vitales — `CHR-004`

La persona futura amplía `CHR-001`: historia, características, habilidades,
técnicas, conocimientos, aptitudes, estado físico y emocional, valores,
objetivos, hábitos, relaciones, recuerdos, reputación e identidad comunitaria.

No existe una cifra única de valor o potencial. Dos personas con la misma
habilidad pueden diferir en velocidad, constancia, calidad, seguridad, gasto,
desempeño bajo presión, enseñanza e interés por aprender.

La información personal se descubre mediante convivencia, trabajo, peligro,
enseñanza y relaciones. La interfaz permite gestionar sin revelar de inicio
toda la ficha interna.

Una aptitud baja puede producir progreso lento o mesetas duraderas. No todas
las personas serán excelentes en todo ni la práctica infinita elimina toda
limitación. Estas diferencias se descubren con tiempo y evidencia.

Objetivos y valores pueden alinearse o chocar con el colectivo. Una persona
puede buscar seguridad, pertenencia, reconocimiento, saber, venganza,
protección, liderazgo o marcharse. Su generación exacta queda abierta.

Los arcos nacen de experiencias. El miedo puede reducirse, cambiar de contexto
o regresar; alguien puede aprender a actuar pese a él. Relaciones pueden
evolucionar a amistad, rivalidad, mentoría, familia o ruptura. Requieren causas,
no giros aleatorios.

Muerte, marcha o incapacidad afectan funciones, saber, relaciones, legitimidad,
moral y proyectos. La historia conserva lo aportado por esa persona.

### 5.4 Transición tecnológica — `SET-004`

La progresión material usa tres situaciones recurrentes, no eras obligatorias:

1. Aprovechamiento del mundo anterior: alimentos, combustible, medicinas,
   vehículos, herramientas, redes e instalaciones todavía útiles.
2. Agotamiento y degradación: piezas, combustible, carreteras, medicinas y
   sistemas complejos fallan o dejan de ser accesibles.
3. Reconstrucción local: cultivo, cría, conservación, fabricación, agua,
   energía local e intercambio estable.

Una comunidad puede dominar el agua y depender de medicinas antiguas; otra
puede mantener vehículos y carecer de agricultura. No hay nivel global de era.

Investigar es recuperar, comprender y aplicar conocimiento. Sus fuentes pueden
ser libros, manuales, planos, cintas, notas, servidores, instalaciones,
experimentos y personas. Encontrar una fuente no concede capacidad sin
comprensión, habilidades, herramientas, materiales, tiempo y condiciones.

Enseñar, practicar, documentar, crear bibliotecas, escuelas y talleres
convierten conocimiento personal en resiliencia comunitaria.

Pasar de vehículos a animales de tiro, de combustible a gravedad o trabajo
manual, o de refrigeración a conservación son posibilidades, no reemplazos
obligatorios para todas las partidas.

### 5.5 Red productiva — `SET-005`

La economía es una red de soluciones, no una cadena lineal ni árbol universal.
Cada solución futura declara:

- Necesidad o resultado.
- Conocimientos y habilidades.
- Personas y tiempo.
- Herramientas, instalaciones, materiales y energía.
- Entradas, salidas, residuos y subproductos relevantes.
- Capacidad, calidad, riesgo, ruido y mantenimiento.
- Dependencias logísticas y alternativas conocidas.

La falta de una pieza puede permitir soluciones manuales, temporales, menos
eficientes o más arriesgadas. Toda alternativa necesita causas reales.

Campos, bosques, agua, talleres, carreteras, almacenes, viviendas y ruinas se
reclaman, adaptan, conectan y mantienen. Construir y reutilizar son vías
complementarias.

Expandirse añade transporte, mantenimiento, vigilancia, defensa, ruido y
coordinación. Una instalación avanzada puede ser potente y frágil; una manual,
limitada y robusta. Redundancia y conocimiento repartido crean resiliencia.

Comida, agua, ropa, energía, transporte y defensa son ejemplos; catálogos y
balance quedan abiertos.

### 5.6 Política interna — `SOC-002`

Población y complejidad hacen aparecer liderazgo, cargos, prestigio, grupos,
normas y conflicto. No se activan con una cifra fija: emergen de relaciones,
recursos, decisiones e historias compartidas.

Los grupos pueden formarse por profesión, procedencia, parentesco, ideología,
estatus, experiencia, función, agravio o proyecto. Una persona puede compartir
intereses con varios grupos sin partido rígido.

Líder formal, líder práctico, especialista imprescindible y figura admirada
son posiciones distintas. Autoridad y legitimidad dependen de confianza,
capacidad, resultados, cargos, recursos, apoyo y normas. Crisis, derrota,
hambre, favoritismo o muerte pueden alterarlas.

El jugador gobierna mediante normas, cargos, reparto, prioridades, diálogo,
concesiones, castigos y coerción. Tienen consecuencias en relaciones,
cumplimiento, productividad, pertenencia, abandono o división.

Las políticas responden a conflictos reales: racionamiento, acogida, armas,
salidas, trabajo, sanidad, castigos, ciudadanía, comercio y riesgo. No son solo
bonificaciones.

Recién llegados pueden integrarse, quedar subordinados, conservar identidad o
generar tensión. Una facción puede disolverse, dividirse, moderarse o
radicalizarse por causas observables. El modelo exacto queda abierto.

### 5.7 Comunidades externas — `SOC-003`

Las comunidades externas conservan identidad y, al menos abstractamente,
población, recursos, territorio, necesidades, conocimientos, liderazgo,
cohesión, objetivos, relaciones y memoria.

Empiezan con tamaños plausibles. Pueden atraer refugiados, perder población,
absorber grupos, fundar puestos, abandonar lugares, comerciar, dividirse,
aliarse, someter, luchar o desaparecer sin esperar al jugador.

No hace falta simular cada individuo lejano. Sí se conservan líderes,
contactos, familiares, rivales o especialistas causalmente relevantes. Al
materializarse, el detalle respeta estado e historia anteriores.

Las relaciones guardan causas: ayuda, deuda, comercio, engaño, violencia,
refugio, abandono, parentesco, amenaza común o territorio. Una cifra puede
resumir, pero no sustituye los hechos.

Ayudar con semillas puede permitir una comunidad agrícola; rechazar soldados
puede contribuir a que controlen una carretera; abandonar un pueblo a una
horda puede cambiar su uso regional. Son ejemplos, no eventos garantizados.

### 5.8 Memoria e historia causal — `NAR-002`

El juego conserva hechos significativos de personas, comunidades, lugares y
proyectos, no cada acción cotidiana con máximo detalle.

Una memoria puede contener sujeto, participantes, lugar, hecho, causa conocida
o percibida, consecuencias, testigos, fuente, interpretación, intensidad,
vigencia y relación con objetivos actuales.

Hecho, recuerdo e información compartida son distintos. Dos personas pueden
interpretar un suceso de forma diferente; una comunidad puede actuar sobre un
rumor falso; nueva evidencia modifica una interpretación sin borrar lo que se
creyó antes.

El sistema narrativo presenta momentos a partir de tensiones, oportunidades,
objetivos y cambios. Presentarlos no crea su causa. Situaciones escritas pueden
aportar texto y decisiones cuando sus condiciones concuerdan con el mundo.

La historia debe poder reconstruirse en hitos: llegada, fundación, pérdidas,
incorporaciones, descubrimientos, obras, disputas, alianzas, migraciones y
cambios de liderazgo. Formatos de diario, memoria y director quedan abiertos.

### 5.9 Gestión a escala — `UI-002`

La interfaz conserva claridad al pasar de seis personas a decenas y al manejar
varias zonas, instalaciones y grupos. El jugador no repite órdenes individuales
para sostener tareas ordinarias.

La gestión escala con prioridades, roles, equipos, políticas, turnos cuando
sean necesarios, zonas, plantillas y excepciones. `UI-001` sigue siendo la base
local y el control con ratón continúa disponible.

La información se muestra por capas:

1. Estado general y alertas que requieren atención.
2. Paneles de personas, recursos, producción, territorio y sociedad.
3. Causas y dependencias de un problema concreto.
4. Detalle personal o técnico para investigar.

Una alerta conduce a su causa y a acciones posibles. No se ocultan fallos tras
estados genéricos ni se satura con cada pensamiento cotidiano.

La ficha muestra lo necesario para trabajar y cuidar a alguien. Historia,
relaciones, deseos, recuerdos y aptitudes se descubren progresivamente mediante
indicios, rangos o confianza, no números secretos sin contexto.

Automatizar no borra personalidad. Equipos y roles definen responsabilidades;
las personas conservan capacidad, estado, motivación y autonomía. El control
puntual no es la única forma eficiente de jugar.

Diseño visual y flujos exactos quedan para prototipo. La dirección aprobada es
gestión clara, menús comprensibles y explicación causal.

### 5.10 Simulación multiescala — `ARC-003`

La fidelidad cambia según relevancia sin crear mundos incoherentes:

- Personas, trabajos, recursos y amenazas cercanos se simulan con detalle.
- Zonas y comunidades lejanas se actualizan de forma resumida.
- Entidades relevantes mantienen IDs, estado e historia suficientes para
  aumentar o reducir detalle.
- Materializar no reescribe hechos; abstraer no borra consecuencias.

Los sistemas se actualizan con frecuencias adecuadas. Movimiento visible puede
ser frecuente; deterioro, cultivos, relaciones o población pueden evaluarse en
intervalos mayores. La velocidad afecta tiempo simulado, no fuerza todo en
cada fotograma.

Simulación, datos y presentación siguen separados. Habilidades, técnicas,
recursos, edificios, soluciones, situaciones y amenazas deben definirse con
datos e IDs estables cuando se implementen, sin fijar ahora el formato.

El guardado conserva estado semántico y cambios; no cada elemento visual. La
generación reproducible de `ARC-002` cubre detalles no materializados.

El rendimiento se mide con escenarios reales. No se simula cada ciudadano,
objeto, relación y ruta distante a máximo detalle cada fotograma, pero tampoco
se elimina identidad o causalidad necesaria para la visión.

Godot 4 y GDScript siguen aprobados. No se abre migración a Unity, servidor,
clases, carpetas o base de datos.

## 6. Borradores deliberados

### 6.1 Taxonomía candidata — `CHR-005`

Documenta este mapa amplio, no una lista cerrada. Las familias solo organizan;
no regalan competencia común.

| Familia | Habilidades candidatas |
|---|---|
| Percepción y exploración | Observación, registro de edificios, orientación, cartografía, búsqueda, sigilo, rastreo e interpretación de señales. |
| Agua y medio natural | Localización de agua, potabilización, pesca, trampas, caza, recolección vegetal, identificación de hongos, plantas medicinales y fuego. |
| Agricultura | Suelos, semillas, siembra, riego, plagas, cosecha, conservación de semillas e invernaderos. |
| Animales | Manejo, cría, alimentación, salud, doma, sacrificio y tiro. |
| Alimentación | Cocina, carnicería, panificación, ahumado, secado, salado, fermentación, envasado y seguridad alimentaria. |
| Construcción | Carpintería, albañilería, cubiertas, cimentación, aislamiento, vidrio, demolición y fortificación. |
| Oficios | Remiendo, costura, cuero, hilado, metalurgia, soldadura, forja, cerámica y herramientas. |
| Sistemas técnicos | Fontanería, mecánica, electricidad, electrónica, radio, informática, química, refrigeración y energía. |
| Salud | Primeros auxilios, enfermería, diagnóstico, cirugía, farmacología, rehabilitación, salud mental, higiene y saneamiento. |
| Seguridad | Vigilancia, sigilo táctico, armas por tipo, arquería, cuerpo a cuerpo, defensa colectiva, planificación y rescate. |
| Comunidad | Enseñanza, liderazgo, negociación, mediación, comercio, administración, logística, documentación y comunicación. |

Una habilidad puede dividirse, combinarse o eliminarse tras prototipos. No
asignes valores, niveles, curvas ni IDs. No reemplaces las once habilidades de
`RDM-001`.

### 6.2 Amenazas configurables — `THR-002`

`THR-001` mantiene aprobado el zombi estándar lento. Registra como borrador:

- Velocidad, resistencia, sentidos y reacción al ruido.
- Densidad, concentración urbana, migración y hordas.
- Transmisión, incubación, síntomas y consecuencias de infección.
- Actividad por hora, clima, estación o ambiente.
- Cadáveres, degradación y riesgos sanitarios.
- Frecuencia e intensidad de amenazas humanas, enfermedad, fuego, clima y
  escasez crítica.

No conviertas esto en opciones definitivas, presets, fórmulas o mutaciones
aprobadas. No añadas zombis fantásticos sin decisión futura.

### 6.3 Horizonte de capacidades — `RDM-002`

Organiza capacidades acumulativas, no fechas ni versiones prometidas:

1. Primer corte local de `RDM-001`.
2. Asentamiento sostenible: producción, mantenimiento, aprendizaje,
   estaciones, agricultura y población.
3. Comunidad social: integración, liderazgo, políticas, facciones y memoria.
4. Región viva: mapa, expediciones, comunidades, puestos, rutas y simulación.
5. Reconstrucción: educación, redes productivas, comercio, animales, energía
   local y proyectos sociales duraderos.

Cada capacidad enlaza sus fuentes y dependencias. No crees prompts de
implementación.

## 7. Decisión transversal — `DEC-0006`

Registra:

- El horizonte máximo conserva decisiones de producto a largo plazo.
- Un roadmap acotado define qué se pretende construir en una etapa.
- `implemented` solo describe algo existente y verificado.
- Una capacidad `approved` no entra en `RDM-001` ni autoriza programarla.
- Una capacidad `draft` no autoriza asumir sus detalles en código.
- Una entrega pequeña puede reducir contenido y detalle, pero no cerrar una
  dirección aprobada sin registrar una decisión.

Esto permite pensar en grande sin encargar un juego inabarcable ahora.

## 8. Actualizaciones de fuentes existentes

Actualiza sin duplicar:

- `VIS-001` y `VIS-002`: enlazar `VIS-003` y añadir crecimiento desde
  comunidad local a región viva conservando identidad y causalidad.
- `WLD-001`: enlazar `WLD-003`; mantener abierta escala numérica.
- `CHR-001`, `CHR-002` y `CHR-003`: enlazar `CHR-004`; enlazar `CHR-005` como
  taxonomía `draft`, sin importarla al primer corte.
- `SET-001`, `SET-002` y `SET-003`: enlazar `SET-004` y `SET-005`.
- `SOC-001`: dejarlo como resumen y puerta de entrada; enlazar `SOC-002` y
  `SOC-003` para detalle interno y externo.
- `THR-001`: enlazar `THR-002`; solo el perfil lento actual está aprobado.
- `NAR-001`: enlazar `NAR-002`; conservar causalidad.
- `UI-001`: enlazar `UI-002`; no alterar reglas cerradas de `DESIGN-001`.
- `ARC-001` y `ARC-002`: enlazar `ARC-003`; mantener abiertas carpetas,
  formato de datos y guardado.
- `RDM-001`: enlazar `RDM-002` y declarar que no cambia su alcance.
- `SCN-001`: indicar que futuros escenarios podrán variar población y lugar,
  sin diseñarlos aquí.
- Índices afectados y `docs/INDEX.md`: añadir rutas breves.
- `docs/00-governance/GLOSSARY.md`: añadir horizonte máximo, alcance de
  entrega, materialización, simulación distante, conocimiento comunitario y
  red de soluciones si no existen.

## 9. Preguntas abiertas

Actualiza `docs/OPEN-QUESTIONS.md`, sin duplicar:

- Escala hexagonal, tamaño regional, revelado y transición entre mapas.
- Expediciones, puestos, colonias y materialización de zonas.
- Fórmulas y frecuencia de simulación lejana.
- Valores y curvas del modelo profundo de personas.
- Lista final, granularidad, transferencias y técnicas de habilidades.
- Formación, negociación y disolución de facciones.
- Política, legitimidad, ciudadanía, castigo y coerción concretos.
- Población, territorio, comercio, guerra y absorción externa.
- Catálogos de producción, mantenimiento, energía, transporte, animales y
  agricultura.
- Memorias, interpretaciones, diario y director narrativo.
- Flujos visuales de gestión a escala.
- Opciones y fórmulas de amenazas.
- Presupuestos, frecuencias, materialización y rendimiento.

No reabras prioridades, zonas, ratón, duración del día, velocidades, zombi
estándar ni generación reproducible cerrados en `DESIGN-001`.

## 10. Estado, changelog y prompt

Actualiza `docs/STATUS.md` con `DESIGN-002` como última entrega documental,
los documentos `approved` y `draft`, confirmación de que `RDM-001` no cambia y
que no existe implementación. La próxima candidata sigue siendo la primera
implementación visual de `RDM-001`, con prompt separado.

Actualiza `README.md` solo para enlazar `VIS-003` como horizonte y `RDM-001`
como alcance inmediato si hace falta. Añade `DESIGN-002` a `CHANGELOG.md`,
distinguiendo aprobados, borradores y ausencia de implementación.

Guarda este prompt como `prompts/DESIGN-002_maximum-design-envelope.md` y
añádelo a `prompts/INDEX.md`. No cambies su contenido sustantivo ni crees copia.

## 11. Fuera de alcance

- Código, escenas, recursos visuales, prototipos o proyecto Godot.
- Datos ejecutables, JSON, schemas o base de datos.
- Fórmulas, valores o balance final.
- Investigación o referentes nuevos.
- Multijugador, servicios online, PostgreSQL o Docker.
- Migración a Unity.
- Prompts de implementación futura.
- Cambiar `RDM-001` para introducir este horizonte.

## 12. Validación documental acotada

No instales dependencias ni ejecutes suites.

1. Ejecuta `git diff --check`.
2. Comprueba que los catorce documentos nuevos existen, tienen ID, estado,
   responsabilidad e índice correctos.
3. Comprueba IDs duplicados, enlaces relativos y responsabilidades cruzadas.
4. Comprueba que toda prosa humana está en español.
5. Comprueba que `CHR-005`, `THR-002` y `RDM-002` son `draft` y no aparecen
   como cerrados o implementados.
6. Comprueba que los demás nuevos son `approved` sin entrar en `RDM-001`.
7. Comprueba que `docs/STATUS.md` declara que no existe juego implementado.

## 13. Criterios de aceptación

- Todo el horizonte conversado queda localizable por dominio.
- Principios aceptados están `approved`; catálogos y configuraciones inmaduras,
  `draft`.
- No se repite `DESIGN-001`; se enlaza.
- La visión máxima no modifica el primer corte.
- Cada capacidad se conecta con sistemas existentes.
- Los índices permiten recuperar contexto sin leer todo el repositorio.
- No se atribuye implementación ni rendimiento inexistente.

## 14. Informe final

Devuelve en español:

1. Documentos creados separados en `approved` y `draft`.
2. Fuentes actualizadas.
3. Decisiones máximas aprobadas.
4. Borradores y preguntas abiertas.
5. Validaciones.
6. Confirmación de que `RDM-001` sigue intacto y no existe implementación.

No continúes con Godot ni redactes el siguiente prompt.
