## Amenaza zombi local: estímulos, movimiento lógico, guardia, combate y
## retirada automática (IMPLEMENTATION-004, secciones 7, 8, 10 y 11).
## No decide trabajos comunitarios ni sustituye a `WorkBoard`: recibe
## personas y actores ya registrados por él y le devuelve las cosas que solo
## él puede hacer (interrumpir trabajo, iniciar retirada, dar de baja a una
## persona) a través de las pocas llamadas pequeñas declaradas en
## `WorkBoard` (sección 15.2).
class_name ThreatService
extends RefCounted

const THREAT_CALM := "calm"
const THREAT_ALERT := "alert"
const THREAT_CONTACT := "contact"

const LABEL_CALM := "Amenaza: tranquila"
const LABEL_ALERT := "Amenaza: alerta"
const LABEL_CONTACT := "Amenaza: contacto"

signal threat_level_changed(level: String)

## Referencias compartidas con `WorkBoard`, inyectadas al construirlo.
var zones: ZoneGrid = null
var defense: DefenseService = null
var noise: NoiseService = null
var navigation: NavigationService = null
## `WorkBoard`, para las llamadas pequeñas de interrupción/retirada/baja
## (sección 15.2). Se declara `Node` para no crear una dependencia circular
## de tipos, igual que `Survivor._board`.
var board: Node = null

var _zombies: Dictionary = {}
var _zombie_actors: Dictionary = {}
var _zombie_order: Array[String] = []
var _zombie_marked_dead: Dictionary = {}

var _person_states: Dictionary = {}
var _person_actors: Dictionary = {}

var _guard_posts: Dictionary = {}
var _guard_actors: Dictionary = {}
var _guard_occupant: Dictionary = {}
var _guard_alerted: Dictionary = {}
var _guard_detected: Dictionary = {}

var _current_moment: float = 0.0
var _alert_linger_timer: float = 0.0
var _threat_level: String = THREAT_CALM

# --- Registro ---------------------------------------------------------------

func register_zombie(state: ZombieState, actor: Node) -> void:
	if state == null or state.id == "":
		return
	_zombies[state.id] = state
	if actor != null:
		_zombie_actors[state.id] = actor
	if not _zombie_order.has(state.id):
		_zombie_order.append(state.id)
		_zombie_order.sort()

func register_person(state: PersonWorkState, actor: Node) -> void:
	if state == null or state.id == "":
		return
	_person_states[state.id] = state
	if actor != null:
		_person_actors[state.id] = actor

func register_guard_post(post_id: String, position: Vector3, actor: Node = null) -> void:
	_guard_posts[post_id] = position
	if actor != null:
		_guard_actors[post_id] = actor

func assign_guard(post_id: String, person_id: String) -> void:
	_guard_occupant[post_id] = person_id
	_guard_alerted[post_id] = false
	_guard_detected[post_id] = false
	var actor: Node = _guard_actors.get(post_id, null)
	if is_instance_valid(actor) and actor.has_method("set_guard_active"):
		actor.call("set_guard_active", true)

func release_guard(post_id: String) -> void:
	var person_id: String = String(_guard_occupant.get(post_id, ""))
	_guard_occupant.erase(post_id)
	_guard_alerted.erase(post_id)
	_guard_detected.erase(post_id)
	if person_id != "":
		var person: PersonWorkState = _person_states.get(person_id, null)
		if person != null:
			person.clear_transgression_mark()
	var actor: Node = _guard_actors.get(post_id, null)
	if is_instance_valid(actor) and actor.has_method("set_guard_active"):
		actor.call("set_guard_active", false)

func guard_occupant(post_id: String) -> String:
	return String(_guard_occupant.get(post_id, ""))

func notify_zombie_arrived(_zombie_id: String) -> void:
	pass

func zombie_ids() -> Array[String]:
	return _zombie_order.duplicate()

func get_zombie_state(zombie_id: String) -> ZombieState:
	return _zombies.get(zombie_id, null)

func describe_zombie(zombie_id: String) -> Dictionary:
	var z: ZombieState = get_zombie_state(zombie_id)
	if z == null:
		return {}
	return {"state_text": z.describe()}

## Envoltorio público para que `WorkBoard` compruebe la condición 5 de la
## iniciativa de reparación (sección 13: «no hay un zombi a 4 m de esa
## persona») sin acceder a los datos internos de `ThreatService`.
func zombie_within(position: Vector3, range_meters: float) -> bool:
	return _nearest_alive_zombie_within(position, range_meters) != ""

func threat_level_label() -> String:
	match _threat_level:
		THREAT_ALERT:
			return LABEL_ALERT
		THREAT_CONTACT:
			return LABEL_CONTACT
		_:
			return LABEL_CALM

# --- Ruido -------------------------------------------------------------------

## Conectado a `NoiseService.noise_emitted`. Se evalúa una sola vez por
## emisión, nunca por fotograma (sección 8).
func on_noise_emitted(noise_data: Dictionary) -> void:
	var position: Vector3 = noise_data.get("position", Vector3.ZERO)
	var radius: float = float(noise_data.get("radius", 0.0))
	if radius <= 0.0:
		return
	for zid in _zombie_order:
		var z: ZombieState = _zombies[zid]
		if not z.is_alive():
			continue
		if z.state != ZombieState.STATE_IDLE and z.state != ZombieState.STATE_INVESTIGATING:
			continue
		var distance: float = _flat(z.position, position)
		if distance > radius:
			continue
		var margin: float = radius - distance
		if z.state == ZombieState.STATE_INVESTIGATING and margin < z.noise_margin:
			continue
		z.noise_target = position
		z.noise_margin = margin
		z.noise_wait_timer = 0.0
		z.state = ZombieState.STATE_INVESTIGATING

# --- Avance de simulación -----------------------------------------------------

func advance(gameplay_delta: float) -> void:
	if gameplay_delta <= 0.0:
		return
	_current_moment += gameplay_delta

	for zid in _zombie_order:
		var actor: Node = _zombie_actors.get(zid, null)
		if is_instance_valid(actor) and actor.has_method("advance_simulation"):
			actor.advance_simulation(gameplay_delta)

	for zid in _zombie_order:
		var z: ZombieState = _zombies[zid]
		if z.is_alive():
			_tick_zombie(z, gameplay_delta)
		elif not bool(_zombie_marked_dead.get(zid, false)):
			_zombie_marked_dead[zid] = true
			var actor: Node = _zombie_actors.get(zid, null)
			if is_instance_valid(actor) and actor.has_method("mark_dead"):
				actor.call("mark_dead")

	_process_guards(gameplay_delta)
	_process_person_orders(gameplay_delta)
	_check_auto_triggers(gameplay_delta)
	_update_threat_level(gameplay_delta)

# --- Zombis: estados exactos de la sección 7 ---------------------------------

func _tick_zombie(z: ZombieState, dt: float) -> void:
	var previous_state: String = z.state
	_detect_and_transition(z)
	match z.state:
		ZombieState.STATE_INVESTIGATING:
			_tick_investigating(z, dt)
		ZombieState.STATE_PURSUING:
			_tick_pursuing(z, dt)
		ZombieState.STATE_ATTACKING_DEFENSE:
			_tick_attacking_defense(z, dt)
		ZombieState.STATE_ATTACKING_PERSON:
			_tick_attacking_person(z, dt)
		_:
			pass
	if z.state != previous_state:
		_log_zombie_transition(z, previous_state)

func _log_zombie_transition(z: ZombieState, previous: String) -> void:
	match z.state:
		ZombieState.STATE_PURSUING:
			if previous != ZombieState.STATE_ATTACKING_PERSON and previous != ZombieState.STATE_ATTACKING_DEFENSE:
				_log("Un zombi ha detectado a una persona con vida.")
		ZombieState.STATE_ATTACKING_DEFENSE:
			_log("Un zombi empieza a atacar una defensa.")
		ZombieState.STATE_ATTACKING_PERSON:
			_log("Un zombi empieza a atacar a una persona.")
		_:
			pass

func _detect_and_transition(z: ZombieState) -> void:
	if z.state != ZombieState.STATE_IDLE and z.state != ZombieState.STATE_INVESTIGATING:
		return
	var seen: String = _find_visible_person(z.position)
	if seen == "":
		return
	z.target_person_id = seen
	z.last_known_position = _person_states[seen].position
	z.lost_timer = 0.0
	z.state = ZombieState.STATE_PURSUING

func _tick_investigating(z: ZombieState, dt: float) -> void:
	if _flat(z.position, z.noise_target) > 1.2:
		_move_zombie(z, z.noise_target)
		return
	z.noise_wait_timer += dt
	if z.noise_wait_timer >= GameConstants.ZOMBIE_NOISE_MEMORY_SECONDS:
		z.state = ZombieState.STATE_IDLE
		z.noise_margin = -INF

func _tick_pursuing(z: ZombieState, dt: float) -> void:
	var visible: bool = z.target_person_id != "" and _is_visible_person(z, z.target_person_id)
	if visible:
		z.last_known_position = _person_states[z.target_person_id].position
		z.lost_timer = 0.0
	else:
		z.lost_timer += dt

	var blocking: DefensePoint = _defense_blocking(z.position, z.last_known_position)
	if blocking != null:
		z.blocking_defense_id = blocking.id
		z.state = ZombieState.STATE_ATTACKING_DEFENSE
		return

	var distance: float = _flat(z.position, z.last_known_position)
	if visible and distance <= GameConstants.ZOMBIE_ATTACK_RANGE:
		z.state = ZombieState.STATE_ATTACKING_PERSON
		return
	if distance <= 1.2 and not visible:
		if z.lost_timer >= GameConstants.ZOMBIE_LOST_TARGET_MEMORY_SECONDS:
			z.state = ZombieState.STATE_IDLE
			z.target_person_id = ""
		return
	_move_zombie(z, z.last_known_position)

func _tick_attacking_defense(z: ZombieState, dt: float) -> void:
	var point: DefensePoint = defense.get_point(z.blocking_defense_id) if defense != null else null
	if point == null or not point.blocks_path():
		z.blocking_defense_id = ""
		z.state = ZombieState.STATE_PURSUING if z.target_person_id != "" else ZombieState.STATE_IDLE
		return
	var target: Vector3 = point.site_position()
	if _flat(z.position, target) > GameConstants.ZOMBIE_ATTACK_RANGE:
		_move_zombie(z, target)
		return
	z.attack_accumulator += dt
	while z.attack_accumulator >= GameConstants.ZOMBIE_ATTACK_INTERVAL:
		z.attack_accumulator -= GameConstants.ZOMBIE_ATTACK_INTERVAL
		defense.apply_damage(z.blocking_defense_id, GameConstants.ZOMBIE_DAMAGE_TO_DEFENSE)
		if noise != null:
			var pulse: Dictionary = noise.emit("zombie_impact_defense", target, GameConstants.ZOMBIE_IMPACT_NOISE_RADIUS, _current_moment)
			if noise.should_log("zombie_impact_defense", target, _current_moment):
				_log("Un zombi golpea %s." % point.site_display_name())
			on_noise_emitted(pulse)

func _tick_attacking_person(z: ZombieState, dt: float) -> void:
	var person: PersonWorkState = _person_states.get(z.target_person_id, null)
	if person == null or not person.is_alive():
		z.state = ZombieState.STATE_IDLE
		z.target_person_id = ""
		return
	if _flat(z.position, person.position) > GameConstants.ZOMBIE_ATTACK_RANGE:
		z.state = ZombieState.STATE_PURSUING
		return
	z.attack_accumulator += dt
	while z.attack_accumulator >= GameConstants.ZOMBIE_ATTACK_INTERVAL:
		z.attack_accumulator -= GameConstants.ZOMBIE_ATTACK_INTERVAL
		person.condition.apply_damage(GameConstants.ZOMBIE_DAMAGE_TO_PERSON)
		if not person.condition.is_alive():
			_log("%s ha muerto." % person.display_name)
			if board != null:
				board.call("mark_person_dead", person.id)
			z.state = ZombieState.STATE_IDLE
			z.target_person_id = ""
			return
		elif person.condition.is_critical():
			_log("%s está en estado crítico." % person.display_name)

func _defense_blocking(zombie_position: Vector3, approach_target: Vector3) -> DefensePoint:
	if defense == null:
		return null
	var focus: Vector3 = GameConstants.SHELTER_FOCUS_POSITION
	if _flat(zombie_position, focus) > GameConstants.SETTLEMENT_DEFENSE_RADIUS + 1.0:
		return null
	var direction: Vector3 = zombie_position - focus
	if direction.length_squared() < 0.0001:
		direction = approach_target - focus
	var sector: String = DefenseService.sector_for_direction(direction)
	return defense.blocking_point_for_sector(sector)

func _move_zombie(z: ZombieState, target: Vector3) -> void:
	var actor: Node = _zombie_actors.get(z.id, null)
	if is_instance_valid(actor) and actor.has_method("go_to"):
		actor.call("go_to", target, 1.0)

func _on_zombie_died(z: ZombieState) -> void:
	_log("Un zombi ha sido neutralizado.")

# --- Guardia (sección 10.1) --------------------------------------------------

func _process_guards(dt: float) -> void:
	for post_id in _guard_posts.keys():
		var person_id: String = String(_guard_occupant.get(post_id, ""))
		if person_id == "":
			continue
		var person: PersonWorkState = _person_states.get(person_id, null)
		if person == null or not person.is_alive():
			continue
		var post_position: Vector3 = _guard_posts[post_id]
		var detected: String = _nearest_alive_zombie_within(post_position, GameConstants.GUARD_DETECTION_RANGE)
		_guard_detected[post_id] = detected != ""
		if detected == "":
			_guard_alerted[post_id] = false
			person.clear_transgression_mark()
			continue
		if not bool(_guard_alerted.get(post_id, false)):
			_guard_alerted[post_id] = true
			_log("%s ha detectado un zombi cerca del puesto." % person.display_name)

		var z: ZombieState = _zombies[detected]
		if person.has_trait(PersonWorkState.TRAIT_PURSUE_IMMEDIATE_THREAT):
			_evaluate_transgression(person, z, post_position)
		_guard_engage(person, z, post_position, dt)

func _guard_engage(person: PersonWorkState, z: ZombieState, post_position: Vector3, dt: float) -> void:
	var actor: Node = _person_actors.get(person.id, null)
	if actor == null:
		return
	var distance_post_to_zombie: float = _flat(post_position, z.position)
	if distance_post_to_zombie > GameConstants.GUARD_ENGAGE_RANGE:
		if _flat(person.position, post_position) > 0.6:
			actor.call("go_to", post_position, 0.6)
		else:
			actor.call("stop_moving")
		return
	if distance_post_to_zombie > GameConstants.GUARD_LEASH_RANGE:
		actor.call("go_to", post_position, 0.6)
		return
	var target_forbidden: bool = zones != null and zones.state_at(z.position) == ZoneDefinitions.STATE_FORBIDDEN
	if target_forbidden and not person.transgression_registered_for(z.id):
		# Sin la transgresión activa, la guardia respeta la zona: se queda al
		# borde en vez de perseguir dentro de la celda prohibida.
		actor.call("go_to", post_position, 0.6)
		return
	_swing_at(person, actor, z, dt, GameConstants.MELEE_RANGE)

func _swing_at(person: PersonWorkState, actor: Node, z: ZombieState, dt: float, attack_range: float) -> void:
	if _flat(person.position, z.position) > attack_range:
		actor.call("go_to", z.position, attack_range * 0.75)
		return
	actor.call("stop_moving")
	person.combat_accumulator += dt
	while person.combat_accumulator >= GameConstants.MELEE_ATTACK_INTERVAL:
		person.combat_accumulator -= GameConstants.MELEE_ATTACK_INTERVAL
		var died: bool = z.apply_damage(GameConstants.MELEE_DAMAGE_TO_ZOMBIE)
		if noise != null:
			var pulse: Dictionary = noise.emit("melee_impact", person.position, GameConstants.MELEE_NOISE_RADIUS, _current_moment)
			if noise.should_log("melee_impact", person.position, _current_moment):
				_log("%s golpea a un zombi." % person.display_name)
			on_noise_emitted(pulse)
		if died:
			_on_zombie_died(z)
			return

# --- Transgresión autónoma acotada (sección 14.2) ----------------------------

func _evaluate_transgression(person: PersonWorkState, z: ZombieState, post_position: Vector3) -> void:
	if not person.is_alive():
		return
	var zombie_cell_forbidden: bool = zones != null and zones.state_at(z.position) == ZoneDefinitions.STATE_FORBIDDEN
	var within_range: bool = _flat(z.position, post_position) <= GameConstants.TRANSGRESSION_ZOMBIE_RANGE
	var no_other_zombie_near: bool = _nearest_alive_zombie_within(z.position, GameConstants.TRANSGRESSION_OTHER_ZOMBIE_RANGE, z.id) == ""
	var urgent_need: String = person.needs.most_urgent() if person.needs != null else ""
	var no_critical_need: bool = urgent_need == "" or not person.needs.is_critical(urgent_need)
	var health_ok: bool = person.condition.health > GameConstants.TRANSGRESSION_HEALTH_THRESHOLD and no_critical_need
	var route_exists := true
	if navigation != null:
		route_exists = bool(navigation.query(person.position, z.position, true).get("reachable", false))
	var depth: float = 0.0
	if zombie_cell_forbidden and zones != null:
		depth = zones.nearest_habitual_world(z.position).distance_to(z.position)
	var forbidden_depth_ok: bool = depth <= GameConstants.TRANSGRESSION_MAX_FORBIDDEN_DEPTH
	var already: bool = person.transgression_registered_for(z.id)

	var should_cross: bool = AutonomyService.can_transgress(
		true, within_range, zombie_cell_forbidden, no_other_zombie_near,
		health_ok, route_exists, forbidden_depth_ok, already
	)
	if should_cross:
		person.mark_transgression_for(z.id)
		person.recent_decision = AutonomyService.TRANSGRESSION_MESSAGE
		_log("%s: %s" % [person.display_name, AutonomyService.TRANSGRESSION_MESSAGE])

# --- Órdenes puntuales de combate y retirada (sección 10.2/10.3) -------------

func _process_person_orders(dt: float) -> void:
	for person_id in _person_states.keys():
		var person: PersonWorkState = _person_states[person_id]
		if not person.is_alive() or not person.has_direct_order():
			continue
		var kind: String = String(person.direct_order.get("kind", ""))
		if kind == PersonWorkState.DIRECT_ORDER_ATTACK:
			_process_attack_order(person, dt)
		elif kind == PersonWorkState.DIRECT_ORDER_RETREAT:
			_process_retreat_order(person, dt)

func _process_attack_order(person: PersonWorkState, dt: float) -> void:
	var zombie_id: String = String(person.direct_order.get("target_id", ""))
	var z: ZombieState = _zombies.get(zombie_id, null)
	var actor: Node = _person_actors.get(person.id, null)
	if z == null or not z.is_alive():
		if board != null:
			board.call("finish_attack_order", person.id)
		return
	if actor == null:
		return
	_swing_at(person, actor, z, dt, GameConstants.MELEE_RANGE)
	if not z.is_alive() and board != null:
		board.call("finish_attack_order", person.id)

func _process_retreat_order(person: PersonWorkState, dt: float) -> void:
	var actor: Node = _person_actors.get(person.id, null)
	if actor == null:
		return
	var rally: Vector3 = GameConstants.RALLY_POINT
	var blocker: String = _nearest_alive_zombie_within(person.position, GameConstants.MELEE_RANGE)
	if blocker != "":
		_swing_at(person, actor, _zombies[blocker], dt, GameConstants.MELEE_RANGE)
		return
	if _flat(person.position, rally) <= GameConstants.MOVE_ARRIVAL_RADIUS:
		if board != null:
			board.call("finish_retreat", person.id)
		return
	actor.call("go_to", rally, GameConstants.MOVE_ARRIVAL_RADIUS)

## Salud crítica, al menos dos zombis muy cerca, o un zombi que interrumpe un
## trabajo ordinario (sección 10.2/10.3).
func _check_auto_triggers(dt: float) -> void:
	for person_id in _person_states.keys():
		var person: PersonWorkState = _person_states[person_id]
		if not person.is_alive():
			continue
		if person.has_direct_order() and String(person.direct_order.get("kind", "")) == PersonWorkState.DIRECT_ORDER_RETREAT:
			continue
		var nearby: int = _count_alive_zombies_within(person.position, GameConstants.RETREAT_ZOMBIE_RANGE)
		var critical_health: bool = person.condition.is_critical() and person.condition.health <= GameConstants.RETREAT_HEALTH_THRESHOLD
		if critical_health or nearby >= GameConstants.RETREAT_ZOMBIE_COUNT:
			if board != null:
				var reason: String = "Salud crítica: se retira hacia el refugio." if critical_health else "Varios zombis cerca: se retira hacia el refugio."
				board.call("start_retreat", person_id, reason)
			continue
		if person.guard_post_id != "":
			continue
		if person.has_direct_order() and String(person.direct_order.get("kind", "")) == PersonWorkState.DIRECT_ORDER_ATTACK:
			continue
		if person.current_job_id == "":
			continue
		var close: String = _nearest_alive_zombie_within(person.position, GameConstants.COMBAT_INTERRUPT_RANGE)
		if close != "" and board != null:
			board.call("start_retreat", person_id, "Un zombi se ha acercado mientras trabajaba.")

# --- Amenaza (sección 11) ----------------------------------------------------

func _update_threat_level(dt: float) -> void:
	var active_attack := false
	var known_contact := false
	for zid in _zombie_order:
		var z: ZombieState = _zombies[zid]
		if z.state == ZombieState.STATE_ATTACKING_DEFENSE or z.state == ZombieState.STATE_ATTACKING_PERSON:
			active_attack = true
			known_contact = true
		elif z.state == ZombieState.STATE_PURSUING:
			known_contact = true
	for post_id in _guard_detected.keys():
		if bool(_guard_detected[post_id]):
			known_contact = true

	var new_level: String
	if active_attack:
		new_level = THREAT_CONTACT
		_alert_linger_timer = GameConstants.THREAT_ALERT_LINGER_SECONDS
	elif known_contact:
		new_level = THREAT_ALERT
		_alert_linger_timer = GameConstants.THREAT_ALERT_LINGER_SECONDS
	elif _alert_linger_timer > 0.0:
		_alert_linger_timer = maxf(_alert_linger_timer - dt, 0.0)
		new_level = THREAT_ALERT
	else:
		new_level = THREAT_CALM

	if new_level != _threat_level:
		_threat_level = new_level
		threat_level_changed.emit(new_level)

# --- Utilidades ---------------------------------------------------------------

func _flat(a: Vector3, b: Vector3) -> float:
	return Vector2(a.x - b.x, a.z - b.z).length()

func _is_visible_person(z: ZombieState, person_id: String) -> bool:
	var person: PersonWorkState = _person_states.get(person_id, null)
	if person == null or not person.is_alive():
		return false
	return _flat(z.position, person.position) <= GameConstants.ZOMBIE_VISION_RANGE

func _find_visible_person(position: Vector3) -> String:
	var best_id := ""
	var best_distance := INF
	var ids: Array = _person_states.keys()
	ids.sort()
	for person_id in ids:
		var person: PersonWorkState = _person_states[person_id]
		if not person.is_alive():
			continue
		var distance: float = _flat(position, person.position)
		if distance <= GameConstants.ZOMBIE_VISION_RANGE and distance < best_distance:
			best_distance = distance
			best_id = person_id
	return best_id

func _nearest_alive_zombie_within(position: Vector3, max_range: float, exclude_id: String = "") -> String:
	var best_id := ""
	var best_distance := INF
	for zid in _zombie_order:
		if zid == exclude_id:
			continue
		var z: ZombieState = _zombies[zid]
		if not z.is_alive():
			continue
		var distance: float = _flat(position, z.position)
		if distance <= max_range and distance < best_distance:
			best_distance = distance
			best_id = zid
	return best_id

func _count_alive_zombies_within(position: Vector3, max_range: float, exclude_id: String = "") -> int:
	var count := 0
	for zid in _zombie_order:
		if zid == exclude_id:
			continue
		var z: ZombieState = _zombies[zid]
		if z.is_alive() and _flat(position, z.position) <= max_range:
			count += 1
	return count

func _log(text: String) -> void:
	if board != null and board.has_method("log_event"):
		board.call("log_event", text)
