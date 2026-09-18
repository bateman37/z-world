---
id: RDM-001
title: Alcance del primer corte jugable
status: approved
canonical_for:
  - alcance cerrado de la primera versión visual
  - secuencia de entregas de implementación posteriores
depends_on: []
related:
  - UI-001
  - CHR-001
  - CHR-002
  - CHR-003
  - WLD-002
  - SET-003
  - THR-001
  - ARC-002
  - SCN-001
  - RDM-002
  - UI-003
---

## 1. Propósito

Fijar el alcance exacto del primer corte jugable visual de Z-World (no el
juego completo) y la secuencia de entregas de implementación que deben
seguirlo. Este documento no crea código; solo delimita qué se implementará
y en qué orden.

## 2. Principios que no deben romperse

- Este es el primer corte jugable, no una promesa del juego completo. Cada
  entrega de implementación debe indicar qué puede probar el propietario del
  proyecto al terminar y qué queda deliberadamente fuera.
- Ninguna entrega de este roadmap tiene fecha comprometida (ver
  [roadmap/INDEX.md](INDEX.md)).

## 3. Modelo funcional

### 3.1 Incluye

- Godot 4 con GDScript, 3D sencillo y cámara estratégica inclinada (ver
  [ARC-001](../90-architecture/ARC-001_technical-direction.md)).
- Un único mapa local de pueblo de montaña, con variación procedural
  controlada entre partidas (ver
  [SCN-001](../scenarios/SCN-001_mountain-village-arrival.md)).
- Seis supervivientes iniciales; posibilidad funcional de que una persona
  llegue, se marche o muera, sin construir todavía un sistema completo de
  comunidades externas.
- Un edificio inicial existente que se puede inspeccionar, usar como
  almacén, acondicionar para descanso y cerrar parcialmente.
- Los once conocimientos/habilidades iniciales definidos en
  [CHR-001](../30-characters/CHR-001_character-model.md).
- Prioridades individuales de cinco niveles y los diez grupos de trabajo
  definidos en [UI-001](../80-interface/UI-001_interaction-and-command-model.md).
  Este demostrador de diez familias y escala `0–4` es distinto del horizonte
  aprobado de nueve bloques, 34 prioridades y escala `Nunca/1–5` de
  [UI-003](../80-interface/UI-003_work-priority-taxonomy.md); esta entrega
  documental no amplía el alcance del primer corte ni cambia sus entregas 4
  y 5.
- Designaciones con ratón, trabajos, estados, reservas y motivos de bloqueo
  (ver [UI-001](../80-interface/UI-001_interaction-and-command-model.md)).
- Zonas habitual, de precaución y prohibida.
- Control puntual con ratón de una persona para acciones de trabajo,
  exploración y defensa.
- Observar, inspeccionar, acceder, buscar, recoger y transportar en una
  selección limitada de edificios y objetos (ver
  [WLD-002](../20-world/WLD-002_local-exploration-and-information.md)).
- Agua por acarreo y conducción por gravedad; alimento por búsqueda, pesca,
  hongos y caza cuando proceda (ver
  [SET-003](../40-settlement/SET-003_resources-logistics-and-condition.md)).
- Recursos localizados, almacén, condición de alimento fresco y conservación
  elemental.
- Barricadas simples, tapiado, muros básicos, zombis lentos, ruido, retirada
  y combate elemental (ver
  [THR-001](../60-threats/THR-001_zombie-threat-model.md)).
- Autonomía acotada con razones registradas y al menos una iniciativa
  positiva y una posible transgresión de zona (ver
  [CHR-003](../30-characters/CHR-003_autonomy-intentions-and-behavior.md)).
- Aprendizaje observable en remiendo y una habilidad de obtención de
  alimento.
- Guardado y carga local estables con generación bajo demanda reproducible
  (ver
  [ARC-002](../90-architecture/ARC-002_procedural-generation-and-persistence.md)).
- Pausa y velocidades ×1, ×2, ×4 y ×10.

### 3.2 No incluye

- Mapa estratégico jugable, hexágonos explorables o transición de escala.
- Vehículos, animales, electricidad, cultivos estacionales, industria,
  investigación extensa, comercio o rutas regionales.
- Política interna completa, elecciones, facciones formales, clanes
  completos o diplomacia exterior.
- Catálogos grandes de edificios, recetas, recursos, habilidades o biomas.
- Multijugador, cuentas, servicios online, PostgreSQL, Docker o IA
  generativa.
- Primeras personas, WASD, disparo manual, acción tipo Project Zomboid.
- Director narrativo completo, hordas masivas, tipos especiales de zombi,
  epidemias complejas o equilibrio final.
- Fórmulas definitivas de aprendizaje, deterioro, daño, ruido, estaciones,
  población o economía.

## 4. Reglas aprobadas

### Entregas de implementación posteriores

El roadmap fija estas cinco entregas, en este orden, sin fechas:

1. **Vertical slice visual**: proyecto Godot, cámara, selección, mapa local
   mínimo, seis personas visibles y reloj/velocidades. Dennis podrá ver el
   asentamiento en 3D y moverse por el mapa con la cámara. **Estado:**
   implementada técnicamente como `IMPLEMENTATION-001` (proyecto Godot
   4.7.2 importable, mapa local fijo, seis supervivientes seleccionables,
   cámara estratégica con ratón, reloj con pausa y velocidades ×1/×2/×4/×10);
   **aceptada manualmente por Dennis el 18 de septiembre de 2026** (ver
   [README.md](../../README.md) y [docs/STATUS.md](../STATUS.md)). No
   incluye trabajo, prioridades, designaciones, recursos, autonomía,
   amenazas, generación procedural ni guardado: esos siguen en las
   entregas 2 a 5.
2. **Trabajo y personas**: prioridades, designaciones, trabajos, movimiento,
   reservas, estado básico, ficha y control puntual con ratón. Dennis podrá
   asignar prioridades, designar tareas y ver a las personas ejecutarlas.
   **Estado:** implementada técnicamente como `IMPLEMENTATION-002` (estado
   de trabajo por persona con diez prioridades y once habilidades, ocho
   objetivos de trabajo demostradores, tablón con reservas y selector
   determinista, navegación 3D generada en código, ejecución con progreso,
   menú contextual de clic derecho y paneles de prioridades, trabajos y
   ficha). Sus ocho objetivos demostradores fueron retirados por la tercera
   entrega, que los sustituyó por lugares reales.
3. **Exploración y subsistencia**: estado de información, edificios,
   recursos, transporte, almacén, descanso, agua y alimento alternativo.
   Dennis podrá explorar el edificio inicial, obtener agua y alimento por al
   menos dos rutas distintas. **Estado:** implementada técnicamente como
   `IMPLEMENTATION-003` (cinco niveles de información con observar,
   inspeccionar y registrar; ocho lugares reales en sustitución de los ocho
   demostradores; diez tipos de recurso con seis estados logísticos;
   pertenencias de llegada; almacén de 50 y depósito de agua de 12 con
   transporte en lotes de hasta 5; necesidades de hidratación, alimentación
   y descanso con acciones automáticas y cadena de supervivencia; alimento
   por registro, pesca y hongos; agua por acarreo y por conducción de
   gravedad; deterioro y secado; ejecución de trabajo por fases en el mismo
   tablón; franja de almacenados, panel «Recursos», acciones por lugar y
   ficha con necesidades y carga); **aceptación manual pendiente** de que
   Dennis la ejecute (ver [README.md](../../README.md) y
   [docs/STATUS.md](../STATUS.md)). No incluye defensa, zombis, ruido,
   guardia, aprendizaje, autonomía, zonas de territorio ni persistencia:
   siguen en las entregas 4 y 5, que no se han iniciado. `WLD-002`,
   `SET-003`, `CHR-001` y `UI-001` siguen siendo `approved`: solo se ha
   implementado su subconjunto.
4. **Defensa y vida propia**: cierre de accesos, zombis elementales, ruido,
   guardia, retirada, aprendizaje e iniciativa autónoma acotada. Dennis podrá
   ver zombis amenazando el asentamiento, defenderlo de forma básica y
   observar al menos una decisión autónoma con su razón visible.
5. **Persistencia y prueba integrada**: generación reproducible, guardado,
   carga y los casos manuales de aceptación. Dennis podrá guardar, cerrar y
   recargar la partida conservando el estado del asentamiento.

Cada entrega debe indicar qué puede probar Dennis al terminar y qué queda
deliberadamente fuera. Esta entrega documental no redacta un prompt de
programación: cada entrega de implementación requerirá su propio prompt.

## 5. Interacciones con otros sistemas

Este documento consolida el alcance definido en `UI-001`, `CHR-001`,
`CHR-002`, `CHR-003`, `WLD-002`, `SET-003`, `THR-001` y `ARC-002`. No repite
sus reglas funcionales; solo fija qué parte de ellas entra en el primer
corte.

El horizonte máximo de capacidades futuras se organiza en
[RDM-002](RDM-002_long-term-capability-horizon.md) (`draft`); ese mapa no
amplía ni reduce el alcance fijado aquí.

## 6. Casos límite o riesgos

- Si una entrega de implementación futura descubre que el alcance aquí
  fijado es inviable en el plazo disponible, debe registrarse como
  contradicción y ajustarse este documento, no resolverse en silencio
  reduciendo el alcance dentro del código.

## 7. Preguntas abiertas

Ninguna adicional a las heredadas de los documentos de dominio enlazados en
la sección 5. Ver `docs/OPEN-QUESTIONS.md`.

## 8. Ejemplos no normativos

Ninguno.
