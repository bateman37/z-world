/**
 * Diccionario de textos de interfaz para las claves (`*Key`) que produce
 * el núcleo de simulación (biografía, relaciones, pertenencias, registro
 * operacional, motivos de bloqueo). Vive en `catalogs` porque es un dato
 * versionado de presentación, no una regla de simulación ni prosa libre
 * incrustada en componentes.
 */
export const COPY_KEYS: Readonly<Record<string, string>> = {
  // Origen y aficiones.
  "biography.origin.regional_town": "Creció en una localidad de la región, antes del colapso.",
  "hobbies.gardening": "Le gusta cuidar plantas y pequeños huertos.",
  "hobbies.tinkering": "Disfruta desmontar y reparar aparatos por curiosidad.",
  "hobbies.hiking": "Pasa su tiempo libre haciendo rutas de montaña.",
  "hobbies.cooking": "Cocina para familia y amigos siempre que puede.",
  "hobbies.reading": "Es una lectora empedernida.",
  "hobbies.birdwatching": "Observa aves y fauna silvestre en su tiempo libre.",

  // Profesiones (identidad + experiencia resumida).
  "profession.field_nurse": "Enfermera de atención primaria.",
  "profession.field_nurse.experience": "Años atendiendo urgencias menores y primeros auxilios en un centro de salud rural.",
  "profession.maintenance_electrician": "Electricista de mantenimiento.",
  "profession.maintenance_electrician.experience": "Reparaciones eléctricas y mecánicas en edificios e instalaciones industriales.",
  "profession.mountain_guide": "Guía de montaña.",
  "profession.mountain_guide.experience": "Rutas de senderismo y orientación en terreno difícil durante años.",
  "profession.delivery_driver": "Conductora de reparto.",
  "profession.delivery_driver.experience": "Transporte y logística de mercancías por carretera, con nociones de cocina casera.",
  "profession.primary_school_teacher": "Maestra de primaria.",
  "profession.primary_school_teacher.experience": "Años enseñando y mediando en conflictos entre niños y familias.",
  "profession.park_ranger": "Guarda forestal.",
  "profession.park_ranger.experience": "Vigilancia y seguimiento de fauna en un parque natural.",

  // Fortalezas y limitaciones por arquetipo.
  "field_nurse.strengths": "Mantiene la calma ante heridas y sabe priorizar quién necesita ayuda primero.",
  "field_nurse.limitations": "Tiene poca experiencia con maquinaria o trabajos de fuerza.",
  "maintenance_electrician.strengths": "Resuelve problemas técnicos con lo que tenga a mano.",
  "maintenance_electrician.limitations": "Le cuesta relacionarse con desconocidos.",
  "mountain_guide.strengths": "No se pierde y aguanta bien el esfuerzo físico prolongado.",
  "mountain_guide.limitations": "Tiene poca formación técnica o sanitaria.",
  "delivery_driver.strengths": "Organizada y resolutiva bajo presión de tiempo.",
  "delivery_driver.limitations": "Poca experiencia en trabajos manuales especializados.",
  "primary_school_teacher.strengths": "Sabe explicar y calmar a un grupo asustado.",
  "primary_school_teacher.limitations": "Se agota físicamente con rapidez.",
  "park_ranger.strengths": "Detecta movimiento y peligro antes que los demás.",
  "park_ranger.limitations": "No tiene experiencia sanitaria ni social.",

  // Interpretación del acontecimiento compartido (la marcha de cuatro días).
  "shared_event.interpretation.field_nurse": "«Lo que importa es que nadie se quedó atrás sin ayuda.»",
  "shared_event.interpretation.maintenance_electrician": "«Sobrevivimos porque improvisamos soluciones sobre la marcha.»",
  "shared_event.interpretation.mountain_guide": "«Conocer el terreno nos salvó más de una vez.»",
  "shared_event.interpretation.delivery_driver": "«Mantener la cabeza fría y repartir tareas nos sacó adelante.»",
  "shared_event.interpretation.primary_school_teacher": "«Lo más duro fue mantener la calma del grupo.»",
  "shared_event.interpretation.park_ranger": "«Vi el peligro antes de que llegara, y eso marcó la diferencia.»",

  // Pertenencias de llegada.
  "possession.kitchen_knife": "Cuchillo de cocina",
  "possession.hiking_axe": "Piqueta de montaña",
  "possession.iron_pipe": "Barra de hierro",
  "possession.wood_axe": "Hacha de leñador",
  "possession.personal_pack": "Mochila personal",

  // Condiciones de llegada.
  "arrival.fatigue.significant": "Cansancio acumulado tras cuatro días de marcha.",
  "arrival.rest_deficit.two_short_nights": "Solo ha dormido de forma completa dos de las últimas cuatro noches.",
  "arrival.hardship.scarce_water": "El agua ha escaseado durante buena parte del camino.",

  // Relaciones.
  "relationship.strong_prior_bond": "Vínculo fuerte y positivo de antes del colapso.",
  "relationship.prior_acquaintance": "Se conocían de antes, aunque no eran íntimos.",
  "relationship.forged_during_the_march": "El vínculo nació durante los cuatro días de marcha.",
  "relationship.strained_by_recent_decision": "La relación se ha resentido por una decisión reciente.",
  "relationship.newcomer_vouched_for": "Se incorporó al grupo hace pocos días; todavía genera cautela.",

  // Motivos de rechazo/bloqueo de una orden de movimiento.
  "move_rejection.destination_outside_world": "El destino está fuera de los límites conocidos del mundo.",
  "move_rejection.destination_hidden": "Ese punto todavía no se ha observado ni se conoce su ruta.",
  "move_rejection.destination_not_transitable": "No es posible caminar hasta ese punto.",
  "move_rejection.no_known_route": "No existe una ruta conocida hasta ese destino.",
  "move_rejection.person_already_ordered": "Esta persona ya tiene una orden de movimiento en curso.",
  "move_rejection.stale_or_duplicate_command": "La orden ha llegado duplicada o ya no es válida.",

  // Registro operacional.
  "log.game_created": "Partida creada.",
  "log.speed_or_pause_changed": "Se cambió la velocidad o la pausa.",
  "log.move_order_accepted": "Orden de movimiento aceptada.",
  "log.move_order_rejected": "Orden de movimiento rechazada.",
  "log.movement_started": "Movimiento iniciado.",
  "log.movement_completed": "Movimiento completado.",
  "log.movement_blocked": "Movimiento bloqueado.",
  "log.movement_cancelled": "Movimiento cancelado.",
  "log.priority_changed": "Prioridad actualizada.",
  "log.room_entered": "Entró en una estancia.",
  "log.room_exited": "Salió de una estancia.",
  "log.discovery_upgraded": "Se descubrió algo nuevo.",

  // Puntos de interés del mapa.
  "landmark.distant_silo": "Silo distante",
  "landmark.old_signpost": "Poste de señalización antiguo",
  "structure.shelter_candidate": "Posible refugio",

  // Acciones activas del motor de resolución (S4-S6, WEB-002 §5.2/§10).
  "action.recognize.label": "Reconocer",
  "action.observe.label": "Observar",
  "action.inspect.label": "Inspeccionar",
  "action.register.label": "Registrar",
  "action.drink.label": "Beber",
  "action.eat.label": "Comer",
  "action.rest.label": "Descansar",
  "target.unidentified_place": "Lugar sin identificar",
  "target.room": "Estancia conocida",
  "target.room_rest": "Descansar aquí (soporte disponible en la estancia)",
  "resource.water": "Agua",
  "resource.fresh_food": "Alimento fresco",
  "resource.preserved_food": "Alimento conservado",

  // Motivos de bloqueo de trabajos (S4-S6, WEB-002 §5.9/§11.2).
  "block.target_no_longer_exists": "El objetivo ya no existe.",
  "block.no_resource_lot_selected": "No se ha seleccionado ningún recurso.",
  "block.resource_exhausted": "El recurso se ha agotado.",
  "block.resource_reserved": "Ya está reservado por otro trabajo.",
  "block.requirement_failed": "No se cumple un requisito necesario.",
  "block.target_unreachable": "No hay ruta conocida hasta el objetivo.",
  "block.no_known_route": "No hay ruta conocida hasta el objetivo.",
  "block.severe_outcome": "El intento salió mal y hay que volver a intentarlo con un cambio real.",
  "block.critical_need_autoprotection": "Interrumpido: una necesidad crítica exige atención inmediata.",
  "block.no_known_solution_for_hydration": "No se conoce ninguna fuente de agua accesible.",
  "block.no_known_solution_for_nutrition": "No se conoce ningún alimento accesible.",
  "block.no_known_solution_for_rest": "No se conoce ningún lugar de descanso accesible.",

  // Registro operacional — trabajos y necesidades.
  "log.job_created": "Se creó un trabajo.",
  "log.job_state_changed": "Un trabajo cambió de estado.",
  "log.job_phase_changed": "Un trabajo avanzó de fase.",
  "log.job_assignment_changed": "Cambió la asignación de un trabajo.",
  "log.reservation_created": "Se reservó un recurso para un trabajo.",
  "log.reservation_released": "Se liberó una reserva.",
  "log.work_episode_created": "Se resolvió un intento incierto.",
  "log.need_changed": "Una necesidad cambió de estado.",
  "log.consumption_happened": "Se consumió un recurso.",
  "log.rest_progressed": "Progresó un descanso.",
  "log.systemic_intention_created": "Se generó una intención por necesidad crítica.",
  "log.work_interrupted": "Un trabajo se interrumpió.",
  "log.zone_changed": "Cambió una zona.",
  "log.designation_changed": "Cambió una designación.",

  // Perfiles de lugar (CAT-004) usados como etiqueta de blanco contextual.
  "place.RES-10": "Casa familiar mediana",
  "place.RES-17": "Cabaña",
  "place.COM-02": "Supermercado pequeño",
  "place.TAL-01": "Taller mecánico",
  "place.ENV-01": "Fuente local de agua",
  "place.ENV-02": "Campo o parcela abierta",
  "place.ENV-03": "Bosque o matorral",
  "place.ENV-04": "Carretera o camino",

  // Necesidades (etiquetas y bandas cualitativas).
  "need.hydration": "Hidratación",
  "need.nutrition": "Nutrición",
  "need.rest": "Descanso",
  "need.band.stable": "Estable",
  "need.band.in_need": "Con necesidad",
  "need.band.urgent": "Urgente",
  "need.band.critical": "Crítica",
};

export function copyKey(key: string | null | undefined): string {
  if (!key) return "";
  return COPY_KEYS[key] ?? key;
}
