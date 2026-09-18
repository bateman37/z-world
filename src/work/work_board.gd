## Tablón de trabajos: registro de trabajos, reservas de objetivo, selector
## determinista y órdenes directas. Es el único lugar donde se decide quién
## hace qué; los actores visuales (`Survivor`) solo ejecutan movimiento y
## avisan de llegada o de falta de ruta.
##
## No es un autoload: `Main.tscn` lo cablea como nodo de la escena principal
## (ver IMPLEMENTATION-002, sección 12).
class_name WorkBoard
extends Node

signal jobs_changed()
signal persons_changed()

const BLOCK_PRIORITY_DISABLED := "Prioridad desactivada para todas las personas"
const BLOCK_NO_SKILL := "Nadie tiene la habilidad mínima"
const BLOCK_NO_ROUTE := "Objetivo sin ruta disponible"
const BLOCK_RESERVED := "Objetivo reservado por otra persona"

const IDLE_NO_JOBS := "No hay trabajos designados"
const IDLE_NOT_ELIGIBLE := "No hay trabajos elegibles según sus prioridades"
const IDLE_ALL_RESERVED := "Los trabajos compatibles ya están reservados"

const DIRECT_WORK_COMPLETED := "El objetivo ya está completado"
const DIRECT_WORK_RESERVED := "Objetivo reservado por otra persona"
const DIRECT_WORK_NO_ROUTE := "Objetivo sin ruta disponible"

var navigation: NavigationService = NavigationService.new()

var _person_states: Dictionary = {}
var _person_actors: Dictionary = {}
var _person_order: Array[String] = []
var _targets: Dictionary = {}
var _jobs: Dictionary = {}
var _completed_jobs: Array[WorkOrder] = []
## Progreso conservado por objetivo entre cancelaciones y redesignaciones.
var _target_progress: Dictionary = {}
var _reservations: Dictionary = {}

var _job_serial: int = 0
var _evaluating: bool = false
var _focus_type: String = ""
var _focus_id: String = ""

# --- Registro -------------------------------------------------------------

func register_person(state: PersonWorkState, actor: Node = null) -> void:
	if state == null or state.id == "":
		return
	_person_states[state.id] = state
	if actor != null:
		_person_actors[state.id] = actor
	if not _person_order.has(state.id):
		_person_order.append(state.id)
		_person_order.sort()

func register_target(target: WorkTarget) -> void:
	if target == null or target.id == "":
		return
	_targets[target.id] = target

func get_person_ids() -> Array[String]:
	return _person_order.duplicate()

func get_person_state(person_id: String) -> PersonWorkState:
	return _person_states.get(person_id, null)

func get_target(target_id: String) -> WorkTarget:
	return _targets.get(target_id, null)

func get_person_index(person_id: String) -> int:
	return _person_order.find(person_id)

# --- Prioridades ----------------------------------------------------------

func cycle_priority(person_id: String, family_id: String, increase: bool) -> void:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null:
		return
	state.cycle_priority(family_id, increase)
	persons_changed.emit()
	evaluate_assignments()

func set_priority(person_id: String, family_id: String, value: int) -> void:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null:
		return
	state.set_priority(family_id, value)
	persons_changed.emit()
	evaluate_assignments()

# --- Designaciones --------------------------------------------------------

func designate_target(target_id: String) -> WorkOrder:
	var target: WorkTarget = get_target(target_id)
	if target == null or target.is_completed():
		return null
	var job: WorkOrder = get_job_for_target(target_id)
	if job != null:
		# Un objetivo nunca genera un segundo trabajo: si ya existía uno
		# creado por una orden directa, pasa a ser de la comunidad.
		job.origin = WorkOrder.ORIGIN_COMMUNITY
		if target.target_state == WorkTarget.STATE_AVAILABLE:
			target.set_target_state(WorkTarget.STATE_DESIGNATED)
		jobs_changed.emit()
		return job
	job = _create_job(target, WorkOrder.ORIGIN_COMMUNITY)
	target.set_target_state(WorkTarget.STATE_DESIGNATED)
	evaluate_assignments()
	return job

func cancel_target_designation(target_id: String) -> void:
	var job: WorkOrder = get_job_for_target(target_id)
	if job == null:
		return
	_cancel_job(job)
	evaluate_assignments()

func toggle_target_designation(target_id: String) -> void:
	var target: WorkTarget = get_target(target_id)
	if target == null or target.is_completed():
		return
	if get_job_for_target(target_id) == null:
		designate_target(target_id)
	else:
		cancel_target_designation(target_id)

func get_job_for_target(target_id: String) -> WorkOrder:
	for job_id in _jobs.keys():
		var job: WorkOrder = _jobs[job_id]
		if job.target_id == target_id and job.is_active():
			return job
	return null

func _create_job(target: WorkTarget, origin: String) -> WorkOrder:
	_job_serial += 1
	var job := WorkOrder.new()
	job.id = "job.%04d" % _job_serial
	job.action_type = target.action_type
	job.action_name = target.action_name()
	job.target_id = target.id
	job.target_position = target.world_position()
	job.family_id = target.family_id()
	job.required_skill_id = target.required_skill_id()
	job.required_skill_level = target.required_skill_level()
	job.duration = target.duration()
	job.progress = float(_target_progress.get(target.id, 0.0))
	job.created_at = float(_job_serial)
	job.origin = origin
	job.state = WorkOrder.STATE_PENDING
	_jobs[job.id] = job
	return job

func _cancel_job(job: WorkOrder) -> void:
	# Cancelar conserva el progreso ya realizado y libera persona y reserva.
	_target_progress[job.target_id] = job.progress
	_detach_person_from_job(job)
	_release_reservation(job)
	job.state = WorkOrder.STATE_CANCELLED
	job.result = "Cancelado por el jugador"
	_jobs.erase(job.id)
	var target: WorkTarget = get_target(job.target_id)
	if target != null and not target.is_completed():
		target.set_target_state(WorkTarget.STATE_AVAILABLE)
		target.set_progress_visible(false)

func _detach_person_from_job(job: WorkOrder) -> void:
	if job.assigned_person_id == "":
		return
	var state: PersonWorkState = get_person_state(job.assigned_person_id)
	if state != null and state.current_job_id == job.id:
		state.current_job_id = ""
		if not state.has_direct_order():
			state.operational_state = PersonWorkState.STATE_IDLE
		_stop_actor(job.assigned_person_id)
	job.assigned_person_id = ""

func _release_reservation(job: WorkOrder) -> void:
	if _reservations.get(job.target_id, "") == job.reserved_by_person_id:
		_reservations.erase(job.target_id)
	job.reserved_by_person_id = ""

# --- Selector determinista ------------------------------------------------

func evaluate_assignments() -> void:
	if _evaluating:
		return
	_evaluating = true
	for person_id in _person_order:
		var state: PersonWorkState = _person_states[person_id]
		if state.is_busy():
			continue
		var job: WorkOrder = _best_job_for(state)
		if job != null:
			_assign(state, job)
	_update_block_reasons()
	_update_idle_reasons()
	_evaluating = false
	jobs_changed.emit()
	persons_changed.emit()

func _is_eligible(state: PersonWorkState, job: WorkOrder) -> bool:
	if not job.is_assignable():
		return false
	var target: WorkTarget = get_target(job.target_id)
	if target != null and target.is_completed():
		return false
	if _reservations.has(job.target_id):
		return false
	if state.get_priority(job.family_id) <= WorkDefinitions.PRIORITY_MIN:
		return false
	if state.get_skill(job.required_skill_id) < job.required_skill_level:
		return false
	return true

func _best_job_for(state: PersonWorkState) -> WorkOrder:
	var best: WorkOrder = null
	var best_length := 0.0
	var job_ids: Array = _jobs.keys()
	job_ids.sort()
	for job_id in job_ids:
		var job: WorkOrder = _jobs[job_id]
		if not _is_eligible(state, job):
			continue
		var route: Dictionary = navigation.query(state.position, job.target_position)
		if not bool(route.get("reachable", false)):
			continue
		var length := float(route.get("length", 0.0))
		if best == null or _is_better(state, job, length, best, best_length):
			best = job
			best_length = length
	return best

## Orden aprobado de desempate (IMPLEMENTATION-002, sección 6): prioridad,
## urgencia, distancia de ruta, tiempo de espera, nivel de habilidad exigido
## y, por último, ID estable del trabajo.
func _is_better(state: PersonWorkState, job: WorkOrder, length: float, best: WorkOrder, best_length: float) -> bool:
	var priority: int = state.get_priority(job.family_id)
	var best_priority: int = state.get_priority(best.family_id)
	if priority != best_priority:
		return priority > best_priority
	if job.urgency != best.urgency:
		return job.urgency > best.urgency
	if absf(length - best_length) > 0.01:
		return length < best_length
	if not is_equal_approx(job.created_at, best.created_at):
		return job.created_at < best.created_at
	if job.required_skill_level != best.required_skill_level:
		return job.required_skill_level > best.required_skill_level
	return job.id < best.id

func _assign(state: PersonWorkState, job: WorkOrder) -> void:
	job.assigned_person_id = state.id
	job.reserved_by_person_id = state.id
	job.block_reason = ""
	job.state = WorkOrder.STATE_RESERVED
	_reservations[job.target_id] = state.id
	state.current_job_id = job.id
	state.idle_reason = ""
	state.operational_state = PersonWorkState.STATE_MOVING
	var target: WorkTarget = get_target(job.target_id)
	if target != null and target.target_state == WorkTarget.STATE_AVAILABLE:
		target.set_target_state(WorkTarget.STATE_DESIGNATED)
	job.state = WorkOrder.STATE_MOVING
	_send_actor(state.id, work_stand_position(job.target_position, state.id), GameConstants.WORK_ARRIVAL_RADIUS)

## Punto de trabajo desplazado por persona para que dos personas nunca
## terminen exactamente en la misma posición.
func work_stand_position(target_position: Vector3, person_id: String) -> Vector3:
	var index: int = maxi(get_person_index(person_id), 0)
	var angle: float = TAU * float(index) / maxf(float(_person_order.size()), 1.0)
	var offset := Vector3(cos(angle), 0.0, sin(angle)) * GameConstants.WORK_STAND_RADIUS
	return target_position + offset

func _update_block_reasons() -> void:
	for job_id in _jobs.keys():
		var job: WorkOrder = _jobs[job_id]
		if job.assigned_person_id != "":
			continue
		var reason: String = _block_reason_for(job)
		if reason == "":
			job.state = WorkOrder.STATE_PENDING
			job.block_reason = ""
		else:
			job.state = WorkOrder.STATE_BLOCKED
			job.block_reason = reason

## Devuelve la razón operativa concreta o "" si el trabajo no está
## bloqueado (por ejemplo, si solo espera a que alguien quede libre).
func _block_reason_for(job: WorkOrder) -> String:
	var any_priority := false
	var any_skill := false
	var any_route := false
	for person_id in _person_order:
		var state: PersonWorkState = _person_states[person_id]
		if state.get_priority(job.family_id) <= WorkDefinitions.PRIORITY_MIN:
			continue
		any_priority = true
		if state.get_skill(job.required_skill_id) < job.required_skill_level:
			continue
		any_skill = true
		if navigation.is_reachable(state.position, job.target_position):
			any_route = true
	if not any_priority:
		return BLOCK_PRIORITY_DISABLED
	if not any_skill:
		return BLOCK_NO_SKILL
	if not any_route:
		return BLOCK_NO_ROUTE
	if _reservations.has(job.target_id):
		return BLOCK_RESERVED
	return ""

func _update_idle_reasons() -> void:
	for person_id in _person_order:
		var state: PersonWorkState = _person_states[person_id]
		if state.is_busy():
			state.idle_reason = ""
			continue
		state.operational_state = PersonWorkState.STATE_IDLE
		state.idle_reason = _idle_reason_for(state)

func _idle_reason_for(state: PersonWorkState) -> String:
	if _jobs.is_empty():
		return IDLE_NO_JOBS
	var compatible := false
	var free_compatible := false
	for job_id in _jobs.keys():
		var job: WorkOrder = _jobs[job_id]
		var target: WorkTarget = get_target(job.target_id)
		if target != null and target.is_completed():
			continue
		if state.get_priority(job.family_id) <= WorkDefinitions.PRIORITY_MIN:
			continue
		if state.get_skill(job.required_skill_id) < job.required_skill_level:
			continue
		compatible = true
		if not _reservations.has(job.target_id):
			free_compatible = true
	if not compatible:
		return IDLE_NOT_ELIGIBLE
	if not free_compatible:
		return IDLE_ALL_RESERVED
	# Hay trabajos compatibles y libres, pero ninguno resultó elegible en
	# esta evaluación (por ejemplo, sin ruta válida desde su posición).
	return IDLE_NOT_ELIGIBLE

# --- Órdenes directas -----------------------------------------------------

func request_direct_move(person_id: String, world_position: Vector3) -> bool:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null:
		return false
	_release_current_work(state)
	# El destino nunca sale del terreno útil.
	var destination := Vector3(
		clampf(world_position.x, GameConstants.MAP_BOUNDS_MIN.x, GameConstants.MAP_BOUNDS_MAX.x),
		0.0,
		clampf(world_position.z, GameConstants.MAP_BOUNDS_MIN.y, GameConstants.MAP_BOUNDS_MAX.y)
	)
	state.direct_order = {
		"kind": PersonWorkState.DIRECT_ORDER_MOVE,
		"position": destination,
	}
	state.operational_state = PersonWorkState.STATE_DIRECT_ORDER
	state.idle_reason = ""
	_send_actor(person_id, destination, GameConstants.MOVE_ARRIVAL_RADIUS)
	evaluate_assignments()
	return true

func describe_direct_work(person_id: String, target_id: String) -> Dictionary:
	var state: PersonWorkState = get_person_state(person_id)
	var target: WorkTarget = get_target(target_id)
	if state == null or target == null:
		return {"enabled": false, "reason": "Objetivo no disponible"}
	if target.is_completed():
		return {"enabled": false, "reason": DIRECT_WORK_COMPLETED}
	if state.get_skill(target.required_skill_id()) < target.required_skill_level():
		var reason := "No cumple la habilidad mínima: %s ≥ %d" % [
			WorkDefinitions.skill_name(target.required_skill_id()),
			target.required_skill_level(),
		]
		return {"enabled": false, "reason": reason}
	var reserved_by: String = String(_reservations.get(target_id, ""))
	if reserved_by != "" and reserved_by != person_id:
		return {"enabled": false, "reason": DIRECT_WORK_RESERVED}
	if not navigation.is_reachable(state.position, target.world_position()):
		return {"enabled": false, "reason": DIRECT_WORK_NO_ROUTE}
	return {"enabled": true, "reason": ""}

func request_direct_work(person_id: String, target_id: String) -> bool:
	var availability: Dictionary = describe_direct_work(person_id, target_id)
	if not bool(availability.get("enabled", false)):
		return false
	var state: PersonWorkState = get_person_state(person_id)
	var target: WorkTarget = get_target(target_id)
	_release_current_work(state)

	var job: WorkOrder = get_job_for_target(target_id)
	if job == null:
		job = _create_job(target, WorkOrder.ORIGIN_DIRECT)
	else:
		_detach_person_from_job(job)
		_release_reservation(job)
	job.assigned_person_id = person_id
	job.reserved_by_person_id = person_id
	job.block_reason = ""
	job.state = WorkOrder.STATE_MOVING
	_reservations[target_id] = person_id
	if target.target_state == WorkTarget.STATE_AVAILABLE:
		target.set_target_state(WorkTarget.STATE_DESIGNATED)

	state.current_job_id = job.id
	state.idle_reason = ""
	state.direct_order = {
		"kind": PersonWorkState.DIRECT_ORDER_WORK,
		"target_id": target_id,
		"job_id": job.id,
	}
	state.operational_state = PersonWorkState.STATE_DIRECT_ORDER
	_send_actor(person_id, work_stand_position(target.world_position(), person_id), GameConstants.WORK_ARRIVAL_RADIUS)
	evaluate_assignments()
	return true

func cancel_direct_order(person_id: String) -> void:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null or not state.has_direct_order():
		return
	var order: Dictionary = state.direct_order
	state.clear_direct_order()
	if String(order.get("kind", "")) == PersonWorkState.DIRECT_ORDER_WORK:
		var job: WorkOrder = _jobs.get(String(order.get("job_id", "")), null)
		if job != null:
			if job.origin == WorkOrder.ORIGIN_DIRECT:
				_cancel_job(job)
			else:
				_detach_person_from_job(job)
				_release_reservation(job)
				job.state = WorkOrder.STATE_PENDING
				var target: WorkTarget = get_target(job.target_id)
				if target != null and not target.is_completed():
					target.set_target_state(WorkTarget.STATE_DESIGNATED)
					target.set_progress_visible(false)
	state.current_job_id = ""
	state.operational_state = PersonWorkState.STATE_IDLE
	_stop_actor(person_id)
	evaluate_assignments()

## Libera el trabajo automático en curso de una persona: vuelve a `pending`,
## conserva su progreso y libera la reserva.
func _release_current_work(state: PersonWorkState) -> void:
	if state.has_direct_order():
		cancel_direct_order(state.id)
	if state.current_job_id == "":
		return
	var job: WorkOrder = _jobs.get(state.current_job_id, null)
	state.current_job_id = ""
	if job != null:
		_target_progress[job.target_id] = job.progress
		job.assigned_person_id = ""
		_release_reservation(job)
		job.state = WorkOrder.STATE_PENDING
		var target: WorkTarget = get_target(job.target_id)
		if target != null and not target.is_completed():
			target.set_target_state(WorkTarget.STATE_DESIGNATED)
			target.set_progress_visible(false)
	_stop_actor(state.id)

# --- Avisos de los actores ------------------------------------------------

func notify_arrived(person_id: String) -> void:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null:
		return
	if state.has_direct_order() and String(state.direct_order.get("kind", "")) == PersonWorkState.DIRECT_ORDER_MOVE:
		state.clear_direct_order()
		state.operational_state = PersonWorkState.STATE_IDLE
		evaluate_assignments()
		return
	var job: WorkOrder = _jobs.get(state.current_job_id, null)
	if job == null:
		state.operational_state = PersonWorkState.STATE_IDLE
		evaluate_assignments()
		return
	if job.state == WorkOrder.STATE_WORKING:
		return
	job.state = WorkOrder.STATE_WORKING
	if not state.has_direct_order():
		state.operational_state = PersonWorkState.STATE_WORKING
	var target: WorkTarget = get_target(job.target_id)
	if target != null:
		target.set_target_state(WorkTarget.STATE_IN_PROGRESS)
	jobs_changed.emit()
	persons_changed.emit()

func notify_unreachable(person_id: String) -> void:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null:
		return
	if state.has_direct_order():
		cancel_direct_order(person_id)
		return
	var job: WorkOrder = _jobs.get(state.current_job_id, null)
	if job != null:
		_target_progress[job.target_id] = job.progress
		_detach_person_from_job(job)
		_release_reservation(job)
		job.state = WorkOrder.STATE_BLOCKED
		job.block_reason = BLOCK_NO_ROUTE
		var target: WorkTarget = get_target(job.target_id)
		if target != null and not target.is_completed():
			target.set_target_state(WorkTarget.STATE_DESIGNATED)
	state.current_job_id = ""
	state.operational_state = PersonWorkState.STATE_IDLE
	evaluate_assignments()

# --- Avance de simulación -------------------------------------------------

## `gameplay_delta` ya viene multiplicado por la velocidad y vale 0 en pausa
## (ver `GameClock.simulation_advanced`).
func advance(gameplay_delta: float) -> void:
	if gameplay_delta <= 0.0:
		return
	for person_id in _person_order:
		var actor: Node = _person_actors.get(person_id, null)
		if is_instance_valid(actor) and actor.has_method("advance_simulation"):
			actor.advance_simulation(gameplay_delta)

	var finished: Array[WorkOrder] = []
	for job_id in _jobs.keys():
		var job: WorkOrder = _jobs[job_id]
		if job.state != WorkOrder.STATE_WORKING:
			continue
		job.progress = minf(job.progress + gameplay_delta, job.duration)
		_target_progress[job.target_id] = job.progress
		if job.progress >= job.duration:
			finished.append(job)
	for job in finished:
		_complete_job(job)
	_refresh_progress_indicators()
	if not finished.is_empty():
		evaluate_assignments()

func _complete_job(job: WorkOrder) -> void:
	if job.state == WorkOrder.STATE_COMPLETED:
		return
	job.state = WorkOrder.STATE_COMPLETED
	job.progress = job.duration
	job.result = "Completado"
	job.block_reason = ""
	var person_id: String = job.assigned_person_id
	_release_reservation(job)
	_jobs.erase(job.id)
	_target_progress.erase(job.target_id)
	var target: WorkTarget = get_target(job.target_id)
	if target != null:
		# El cambio visual se aplica una sola vez: `set_target_state` ignora
		# los estados repetidos.
		target.set_target_state(WorkTarget.STATE_COMPLETED)
		target.set_progress_visible(false)
	var state: PersonWorkState = get_person_state(person_id)
	if state != null:
		state.current_job_id = ""
		state.clear_direct_order()
		state.operational_state = PersonWorkState.STATE_IDLE
		_stop_actor(person_id)
	_completed_jobs.push_front(job)
	while _completed_jobs.size() > GameConstants.WORK_HISTORY_SIZE:
		_completed_jobs.pop_back()

func _refresh_progress_indicators() -> void:
	for target_id in _targets.keys():
		var target: WorkTarget = _targets[target_id]
		if not is_instance_valid(target):
			continue
		var job: WorkOrder = get_job_for_target(target_id)
		var visible_for_focus := false
		if job != null:
			target.set_progress_ratio(job.progress_ratio())
			visible_for_focus = _is_focused(target_id) or (job.assigned_person_id != "" and _focus_type == "person" and _focus_id == job.assigned_person_id)
		target.set_progress_visible(visible_for_focus and job != null and job.progress > 0.0)

func _is_focused(entity_id: String) -> bool:
	return _focus_type == "work_target" and _focus_id == entity_id

func set_focus(entity_type: String, entity_id: String) -> void:
	_focus_type = entity_type
	_focus_id = entity_id
	_refresh_progress_indicators()

# --- Actores --------------------------------------------------------------

func _send_actor(person_id: String, destination: Vector3, arrival_radius: float) -> void:
	var actor: Node = _person_actors.get(person_id, null)
	if is_instance_valid(actor) and actor.has_method("go_to"):
		actor.go_to(destination, arrival_radius)

func _stop_actor(person_id: String) -> void:
	var actor: Node = _person_actors.get(person_id, null)
	if is_instance_valid(actor) and actor.has_method("stop_moving"):
		actor.stop_moving()

# --- Consultas para la interfaz ------------------------------------------

func get_active_jobs() -> Array[WorkOrder]:
	var jobs: Array[WorkOrder] = []
	var job_ids: Array = _jobs.keys()
	job_ids.sort()
	for job_id in job_ids:
		jobs.append(_jobs[job_id])
	return jobs

func get_completed_jobs() -> Array[WorkOrder]:
	return _completed_jobs.duplicate()

func get_reservations() -> Dictionary:
	return _reservations.duplicate()

func describe_job(job: WorkOrder) -> String:
	var person_text := "—"
	if job.assigned_person_id != "":
		var state: PersonWorkState = get_person_state(job.assigned_person_id)
		person_text = state.display_name if state != null else job.assigned_person_id
	var target: WorkTarget = get_target(job.target_id)
	var target_text: String = target.display_name if target != null else job.target_id
	var line := "%s · %s · %s · %s · %d%%" % [
		job.action_name, target_text, person_text, job.state_label(),
		int(round(job.progress_ratio() * 100.0)),
	]
	if job.block_reason != "":
		line += " · %s" % job.block_reason
	return line

## Descripción de la actividad actual de una persona para la ficha y el HUD.
func describe_person_action(state: PersonWorkState) -> String:
	if state.has_direct_order() and String(state.direct_order.get("kind", "")) == PersonWorkState.DIRECT_ORDER_MOVE:
		return "Orden directa: mover a un punto"
	var job: WorkOrder = _jobs.get(state.current_job_id, null)
	if job == null:
		return "Sin trabajo"
	var target: WorkTarget = get_target(job.target_id)
	var target_text: String = target.display_name if target != null else job.target_id
	var prefix := "Orden directa: " if state.has_direct_order() else ""
	return "%s%s · %s (%s)" % [prefix, job.action_name, target_text, job.state_label()]

func get_person_progress_ratio(state: PersonWorkState) -> float:
	var job: WorkOrder = _jobs.get(state.current_job_id, null)
	if job == null:
		return -1.0
	return job.progress_ratio()

## Opciones del menú contextual para una persona seleccionada.
## `hit` es {"kind": "terrain"|"work_target", "position": Vector3, "target_id": String}.
func get_context_options(person_id: String, hit: Dictionary) -> Array:
	var options: Array = []
	var kind: String = String(hit.get("kind", ""))
	if kind == "terrain":
		options.append({
			"id": "move_here",
			"label": "Mover aquí",
			"enabled": true,
			"reason": "",
		})
		return options
	if kind == "work_target":
		var target_id: String = String(hit.get("target_id", ""))
		var target: WorkTarget = get_target(target_id)
		if target == null:
			return options
		if target.is_completed():
			options.append({
				"id": "completed",
				"label": "Objetivo completado",
				"enabled": false,
				"reason": DIRECT_WORK_COMPLETED,
			})
			return options
		var availability: Dictionary = describe_direct_work(person_id, target_id)
		options.append({
			"id": "direct_work",
			"label": "Hacer ahora: %s" % target.action_name(),
			"enabled": bool(availability.get("enabled", false)),
			"reason": String(availability.get("reason", "")),
		})
		if get_job_for_target(target_id) == null:
			options.append({
				"id": "designate",
				"label": "Designar para la comunidad",
				"enabled": true,
				"reason": "",
			})
	return options
