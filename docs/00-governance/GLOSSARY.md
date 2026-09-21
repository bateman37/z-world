# Glosario

Términos usados de forma consistente en la documentación de Z-World. No es un
documento canónico de reglas; si un término tiene una definición funcional
detallada, esa definición vive en su documento de dominio y este glosario solo
enlaza a ella.

- **Asentamiento**: el refugio y su entorno transformado por la comunidad. Ver
  `docs/40-settlement/INDEX.md`.
- **Comunidad**: el conjunto de personas que habitan el asentamiento del
  jugador. Ver `docs/50-society/INDEX.md`.
- **Mapa local**: escala detallada donde se gestiona el asentamiento. Su
  representación activa es un mapa 2D cenital sobre Canvas
  (`docs/80-interface/UI-005_top-down-simulation-workbench.md`); las
  menciones a un «mapa local 3D» describen el prototipo histórico Godot. Ver
  `docs/20-world/WLD-001_world-scales.md`.
- **Mapa regional (o estratégico)**: escala mayor y más abstracta para
  exploración, rutas, comunidades y expediciones; horizonte futuro, no
  implementación activa. Ver `docs/20-world/WLD-001_world-scales.md` y
  `docs/20-world/WLD-003_strategic-world-and-regional-simulation.md`.
- **Perfil de escenario**: conjunto de límites que acota qué mundo local
  puede generar una semilla (entorno, tamaño, densidad, alturas, red viaria,
  catálogo permitido y presupuesto de complejidad). Ver
  `docs/20-world/WLD-008_local-procedural-map-generation.md`.
- **Estructura espacial técnica invisible**: celdas, sectores, polígonos o
  grafos internos que sostienen navegación, niebla, zonas y consultas
  espaciales sin imponerse como estética del mapa. Ver
  `docs/20-world/WLD-008_local-procedural-map-generation.md`.
- **Equipo operativo local**: conjunto de personas asignadas a una orden
  contextual del mapa local, con tamaño `Auto / 1 / 2 / 3 / 4`. No es un
  límite de población, de respuesta a una emergencia ni de una expedición
  regional. Ver
  `docs/80-interface/UI-006_contextual-place-interaction-and-teams.md`.
- **Situación narrativa**: momento relevante presentado al jugador, derivado
  del estado simulado, no de un evento aleatorio aislado. Ver
  `docs/70-narrative/NAR-001_emergent-narrative.md`.
- **Documento canónico**: fuente única de verdad de una regla funcional. Ver
  `docs/00-governance/DOC-001_documentation-system.md`.
- **Descubrimiento**: síntesis de ideas o alternativas todavía no cerradas.
  Ver `docs/discovery/INDEX.md`.
- **Decisión**: elección ya adoptada con motivo y consecuencias registrados.
  Ver `docs/decisions/INDEX.md`.
- **Horizonte máximo**: lo que el juego completo debe poder llegar a
  representar si el desarrollo avanza por las direcciones ya acordadas; no
  amplía el alcance de una entrega ni implica implementación. Ver
  `docs/10-vision/VIS-003_maximum-design-envelope.md`.
- **Alcance de entrega**: lo que una etapa concreta de desarrollo se
  compromete a construir, siempre menor o igual al horizonte máximo. La hoja
  de ruta activa es `docs/roadmap/RDM-003_simulation-first-playable-roadmap.md`;
  `docs/roadmap/RDM-001_first-playable-slice.md` (`deprecated`) conserva el
  alcance histórico del prototipo Godot.
- **Materialización**: generación diferida de **detalle semántico** de una
  zona, persona o comunidad lejana cuando se vuelve relevante, respetando su
  historia resumida previa. No implica abrir un mapa local nuevo, cambiar de
  pantalla ni generar una misión táctica. Ver
  `docs/90-architecture/ARC-003_multiscale-simulation-principles.md` y
  `docs/20-world/WLD-003_strategic-world-and-regional-simulation.md`.
- **Simulación distante**: actualización resumida y menos frecuente de
  zonas, comunidades o entidades lejanas al foco de juego actual. Ver
  `docs/90-architecture/ARC-003_multiscale-simulation-principles.md`.
- **Conocimiento comunitario**: saber conservado más allá de una sola
  persona, mediante enseñanza, libros, planos, archivos, escuelas,
  bibliotecas y talleres. Ver
  `docs/30-characters/CHR-002_knowledge-and-learning.md`.
- **Red de soluciones**: conjunto de formas alternativas de resolver una
  necesidad material, cada una con sus propios requisitos y consecuencias,
  sin una cadena tecnológica única. Ver
  `docs/40-settlement/SET-005_production-web-and-infrastructure.md`.
- **Capacidad efectiva**: valor de una característica o de una habilidad
  que alimenta una resolución, igual al valor único requerido o a la media
  aritmética cuando el método requiere dos del mismo grupo; el peso entre
  el grupo de características y el de habilidades se resuelve mediante uno
  de tres perfiles cerrados (instintivo/físico, equilibrado, técnico/
  aprendido). Ver
  `docs/90-architecture/ARC-006_action-and-event-resolution-model.md`.
- **Escala real `0–10`**: escala numérica de características y habilidades,
  con `4` como referencia humana media de una característica y `0` como
  valor real de competencia nula, distinto de dato desconocido o de falta
  de conocimiento. El nivel actual es visible en la ficha del personaje;
  el potencial, el calibre y el máximo numérico permanecen ocultos. Ver
  `docs/30-characters/CHR-006_characteristics-and-skill-catalog.md`.
- **Modelo B**: resolución de una incertidumbre pertinente dentro de una
  acción o fase mediante un margen entre capacidad efectiva y dificultad
  efectiva, una variación aleatoria acotada y persistente, y cinco bandas
  internas de resultado. Ver
  `docs/90-architecture/ARC-006_action-and-event-resolution-model.md`.
- **Modelo D**: progreso continuo de un trabajo prolongado en función del
  tiempo trabajado y el rendimiento pertinente, con una variación acotada
  de hasta `±8 %` por fase o sesión significativa. Ver
  `docs/90-architecture/ARC-006_action-and-event-resolution-model.md`.
- **Potencial oculto**: margen real de desarrollo de una característica o
  de un campo de habilidad, nunca mostrado como cifra al jugador. Ver
  `docs/30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md`.
- **Potencial estimado**: opinión cualitativa que la comunidad construye
  sobre el potencial oculto de una persona, comunicada mediante un
  catálogo cerrado de frases moduladas por confianza (por ejemplo, «parece
  estar cerca de su máximo en este ámbito»), nunca mediante cifras,
  fracciones o rangos. Ver
  `docs/30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md`.
- **Calibre oculto**: tipo de superviviente de 1 a 5 estrellas, generado
  antes que el resto del personaje, que condiciona la distribución de
  potenciales sin ser un bonificador directo. Ver
  `docs/30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md`.
- **Adaptación al apocalipsis**: sistema separado del calibre oculto que
  mide cuánto ha aprendido una persona a desenvolverse en el mundo
  posterior al colapso. Ver
  `docs/30-characters/CHR-007_hidden-potential-caliber-and-adaptation.md`.
- **Familia logística**: categoría abstracta y reducida de recursos
  almacenables en la que se agrupan componentes recuperados de objetos
  completos, sin representar cada pieza individual. Ver
  `docs/40-settlement/SET-008_object-model-and-logistics-families.md`.
- **Desmontaje**: transformación de un objeto completo en componentes
  reutilizables, materiales, residuos u objetos secundarios, distinta de
  registrar/saquear, desguazar o demoler. Ver
  `docs/40-settlement/SET-009_disassembly-and-world-transformation.md`.
