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
   asentamiento en 3D y moverse por el mapa con la cámara.
2. **Trabajo y personas**: prioridades, designaciones, trabajos, movimiento,
   reservas, estado básico, ficha y control puntual con ratón. Dennis podrá
   asignar prioridades, designar tareas y ver a las personas ejecutarlas.
3. **Exploración y subsistencia**: estado de información, edificios,
   recursos, transporte, almacén, descanso, agua y alimento alternativo.
   Dennis podrá explorar el edificio inicial, obtener agua y alimento por al
   menos dos rutas distintas.
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
