## Tablón de trabajos: registro de trabajos, reservas, selector determinista
## y órdenes directas. Es el único lugar donde se decide quién hace qué; los
## actores visuales (`Survivor`) solo ejecutan movimiento y avisan de llegada
## o de falta de ruta.
##
## IMPLEMENTATION-003 amplía el mismo tablón con ejecución por fases,
## recursos reservados, necesidades básicas y políticas de obtención. No se
## crea un segundo sistema de trabajos: los módulos de lugares, recursos,
## almacén, fuentes, necesidades y deterioro son piezas pequeñas que este
## tablón coordina.
##
## No es un autoload: `Main.tscn` lo cablea como nodo de la escena principal.
class_name WorkBoard
extends Node

signal jobs_changed()
signal persons_changed()
## Cambios de mundo relevantes para el HUD: recursos, lugares y almacén.
signal world_changed()

const BLOCK_PRIORITY_DISABLED := "Prioridad desactivada para todas las personas"
const BLOCK_NO_SKILL := "Nadie tiene la habilidad mínima"
const BLOCK_NO_ROUTE := "Objetivo sin ruta disponible"
const BLOCK_RESERVED := "Objetivo reservado por otra persona"

const IDLE_NO_JOBS := "No hay trabajos designados"
const IDLE_NOT_ELIGIBLE := "No hay trabajos elegibles según sus prioridades"
const IDLE_ALL_RESERVED := "Los trabajos compatibles ya están reservados"

const DIRECT_WORK_RESERVED := "Objetivo reservado por otra persona"
const DIRECT_WORK_NO_ROUTE := "Objetivo sin ruta disponible"

const SHELTER_SITE_ID := "building.shelter_candidate"
const DEPOSIT_SITE_ID := "site.water_deposit"
const STREAM_SITE_ID := "site.stream_water"
const POND_SITE_ID := "site.pond_fishing"
const FOREST_SITE_ID := "site.forest_mushrooms"
const HOUSE_SITE_ID := "building.house_a"

## Política de acarreo: mantener el depósito lleno (12 de agua).
const WATER_POLICY_LABEL := "Mantener 12 de agua"
const WATER_POLICY_STOP_LABEL := "Detener el mantenimiento de agua"

var navigation: NavigationService = NavigationService.new()

var places := PlaceRegistry.new()
var resources := ResourceRegistry.new()
var storage: StorageStore = null
var spoilage: SpoilageService = null
var conduction := WaterConduction.new()
var execution: WorkExecution = null

## Defensa y vida propia (IMPLEMENTATION-004). Módulos pequeños y con
## responsabilidad propia (sección 15.1); `WorkBoard` los coordina, no
## sustituye su lógica.
var zones := ZoneGrid.new()
var defense := DefenseService.new()
var noise := NoiseService.new()
var event_log := GameEventLog.new()
var threat := ThreatService.new()

## Política de agua por acarreo: mientras esté activa, el tablón repone el
## depósito hasta su capacidad.
var water_policy_active: bool = false

## Reloj actual, inyectado por `Main.gd` a través de `set_current_time` cada
## vez que cambia, para fechar los sucesos sin acoplar este tablón al reloj.
var _current_day: int = GameConstants.CLOCK_START_DAY
var _current_hour: int = GameConstants.CLOCK_START_HOUR
var _current_minute: int = GameConstants.CLOCK_START_MINUTE
var zone_overlay_shown: bool = true
## Segundos de juego observables a ×1 acumulados desde el arranque, para el
## agrupado de sucesos de ruido (`NoiseService.should_log`); no depende del
## reloj de calendario, que solo cambia por minutos.
var _simulated_seconds: float = 0.0

func _simulated_moment() -> float:
	return _simulated_seconds

var _person_states: Dictionary = {}
var _person_actors: Dictionary = {}
var _person_order: Array[String] = []
## Lugares del mundo (edificios explorables y lugares del terreno).
var _sites: Dictionary = {}
var _site_order: Array[String] = []
var _jobs: Dictionary = {}
var _job_by_key: Dictionary = {}
var _completed_jobs: Array[WorkOrder] = []
## Progreso conservado por clave de trabajo entre cancelaciones.
var _key_progress: Dictionary = {}
var _reservations: Dictionary = {}

var _job_serial: int = 0
var _evaluating: bool = false
var _focus_type: String = ""
var _focus_id: String = ""

func _init() -> void:
	storage = StorageStore.new(resources)
	spoilage = SpoilageService.new(resources)
	execution = WorkExecution.new(places, resources, storage, spoilage, conduction)
	execution.defense = defense

	navigation.zones = zones
	threat.zones = zones
	threat.defense = defense
	threat.noise = noise
	threat.navigation = navigation
	threat.board = self

	noise.noise_emitted.connect(threat.on_noise_emitted)
	defense.defense_damaged.connect(_on_defense_damaged)
	defense.defense_destroyed.connect(_on_defense_destroyed)
	threat.threat_level_changed.connect(func(_level: String) -> void: world_changed.emit())

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
	if state.id == "person.initial.02":
		state.traits.append(PersonWorkState.TRAIT_PURSUE_IMMEDIATE_THREAT)
	threat.register_person(state, actor)

## Punto de defensa (sección 6.1): se registra como lugar de trabajo normal y
## además con `DefenseService`, que conoce su durabilidad y sector.
func register_defense_point(node: DefensePoint) -> void:
	if node == null:
		return
	register_site(node)
	defense.register_point(node)

## Puesto de guardia (sección 10.1): mismo contrato de lugar de trabajo, más
## el registro en `ThreatService` para detección, alcance y visual.
func register_guard_post(node: GuardPost) -> void:
	if node == null:
		return
	register_site(node)
	threat.register_guard_post(node.id, node.global_position, node)

func register_zombie(state: ZombieState, actor: Node) -> void:
	threat.register_zombie(state, actor)

## Reloj actual, para fechar los sucesos del registro (sección 11). Lo llama
## `Main.gd` cada vez que `GameClock` avisa de un cambio.
func set_current_time(day: int, hour: int, minute: int) -> void:
	_current_day = day
	_current_hour = hour
	_current_minute = minute

func log_event(text: String) -> void:
	event_log.log_event(_current_day, _current_hour, _current_minute, text)

## Registra un lugar del mundo. El nodo solo necesita cumplir el contrato
## pequeño `site_id()` / `site_position()` / `site_display_name()`, que
## implementan tanto `WorkTarget` como `Building`.
func register_site(node: Node) -> void:
	if node == null or not node.has_method("site_id"):
		return
	var site_id: String = String(node.call("site_id"))
	if site_id == "":
		return
	_sites[site_id] = node
	if not _site_order.has(site_id):
		_site_order.append(site_id)
		_site_order.sort()
	places.register(site_id, String(node.call("site_display_name")), site_position(site_id))

func register_source(source: FiniteSource) -> void:
	execution.register_source(source)

func get_person_ids() -> Array[String]:
	return _person_order.duplicate()

func get_person_state(person_id: String) -> PersonWorkState:
	return _person_states.get(person_id, null)

func get_person_index(person_id: String) -> int:
	return _person_order.find(person_id)

func get_site(site_id: String) -> Node:
	return _sites.get(site_id, null)

func get_site_ids() -> Array[String]:
	return _site_order.duplicate()

func site_position(site_id: String) -> Vector3:
	var node: Node = get_site(site_id)
	if node == null or not node.has_method("site_position"):
		return Vector3.ZERO
	return node.call("site_position")

func site_name(site_id: String) -> String:
	var node: Node = get_site(site_id)
	if node == null or not node.has_method("site_display_name"):
		return site_id
	return String(node.call("site_display_name"))

# --- Pertenencias de llegada ---------------------------------------------

## Cada persona llega con algo encima. No es un inventario abstracto: son
## pilas reales que hay que depositar en el almacén cuando exista.
func give_arrival_belongings(person_id: String, entries: Array) -> void:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null:
		return
	for entry in entries:
		var stack: ResourceStack = resources.create_stack(
			String(entry.get("type_id", "")),
			int(entry.get("amount", 0)),
			SHELTER_SITE_ID,
			state.position,
			ResourceDefinitions.LOGISTICS_AVAILABLE
		)
		if stack != null:
			# Las pertenencias quedan en el punto de llegada del grupo, que
			# es el mismo lugar donde se establecerá el almacén.
			stack.position = state.position

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

func get_job_for(site_id: String, action_id: String) -> WorkOrder:
	var job_id: String = String(_job_by_key.get(WorkOrder.make_key(site_id, action_id), ""))
	var job: WorkOrder = _jobs.get(job_id, null)
	if job != null and job.is_active():
		return job
	return null

## Crea (o recupera) el trabajo de la comunidad para una acción concreta.
func designate_action(site_id: String, action_id: String) -> WorkOrder:
	if not _sites.has(site_id) or not WorkActions.ACTIONS.has(action_id):
		return null
	var job: WorkOrder = get_job_for(site_id, action_id)
	if job != null:
		job.origin = WorkOrder.ORIGIN_COMMUNITY
		jobs_changed.emit()
		return job
	job = _create_job(site_id, action_id, WorkOrder.ORIGIN_COMMUNITY)
	_mark_site_state(site_id, WorkTarget.STATE_DESIGNATED)
	evaluate_assignments()
	return job

func cancel_action(site_id: String, action_id: String) -> void:
	var job: WorkOrder = get_job_for(site_id, action_id)
	if job == null:
		return
	_cancel_job(job)
	evaluate_assignments()

func toggle_action(site_id: String, action_id: String) -> void:
	if get_job_for(site_id, action_id) == null:
		designate_action(site_id, action_id)
	else:
		cancel_action(site_id, action_id)

## «Transportar todo lo accesible»: designa un transporte por cada lugar
## que tenga pilas sin recoger.
func designate_haul_all() -> int:
	var created := 0
	for site_id in execution.sites_with_pending_stacks():
		if not _sites.has(site_id):
			continue
		if get_job_for(site_id, WorkActions.HAUL_STORAGE) != null:
			continue
		if designate_action(site_id, WorkActions.HAUL_STORAGE) != null:
			created += 1
	return created

func _create_job(site_id: String, action_id: String, origin: String, owner_person_id: String = "") -> WorkOrder:
	_job_serial += 1
	var job := WorkOrder.new()
	job.id = "job.%04d" % _job_serial
	job.owner_person_id = owner_person_id
	job.action_type = action_id
	job.action_name = WorkActions.action_name(action_id)
	job.target_id = site_id
	job.target_position = site_position(site_id)
	job.family_id = WorkActions.family_id(action_id)
	job.required_skill_id = WorkActions.skill_id(action_id)
	job.required_skill_level = WorkActions.skill_level(action_id)
	job.created_at = float(_job_serial)
	job.origin = origin
	job.state = WorkOrder.STATE_PENDING
	job.setup_phases(action_id)
	var saved: Dictionary = _key_progress.get(job.key(), {})
	job.progress = float(saved.get("progress", 0.0))
	job.phase_index = int(saved.get("phase_index", 0))
	_jobs[job.id] = job
	_job_by_key[job.key()] = job.id
	return job

func _cancel_job(job: WorkOrder) -> void:
	# Cancelar conserva el progreso ya realizado y libera persona, reserva
	# de lugar y reservas de recurso.
	_key_progress[job.key()] = {"progress": job.progress, "phase_index": job.phase_index}
	_detach_person_from_job(job)
	_release_reservation(job)
	execution.release_for(job)
	job.state = WorkOrder.STATE_CANCELLED
	job.result = "Cancelado por el jugador"
	_forget_job(job)
	_mark_site_state(job.target_id, WorkTarget.STATE_AVAILABLE)
	world_changed.emit()

func _forget_job(job: WorkOrder) -> void:
	_jobs.erase(job.id)
	if String(_job_by_key.get(job.key(), "")) == job.id:
		_job_by_key.erase(job.key())

func _detach_person_from_job(job: WorkOrder) -> void:
	if job.assigned_person_id == "":
		return
	if job.action_type == WorkActions.GUARD_ACCESS:
		threat.release_guard(job.target_id)
	var state: PersonWorkState = get_person_state(job.assigned_person_id)
	if state != null and state.current_job_id == job.id:
		state.current_job_id = ""
		state.guard_post_id = ""
		if not state.has_direct_order():
			state.operational_state = PersonWorkState.STATE_IDLE
		_stop_actor(job.assigned_person_id)
	job.assigned_person_id = ""

func _release_reservation(job: WorkOrder) -> void:
	if _reservations.get(job.key(), "") == job.reserved_by_person_id:
		_reservations.erase(job.key())
	job.reserved_by_person_id = ""

func _mark_site_state(site_id: String, state_id: String) -> void:
	var node: Node = get_site(site_id)
	if node == null or not node.has_method("set_target_state"):
		return
	if state_id == WorkTarget.STATE_AVAILABLE and _site_has_active_job(site_id):
		return
	node.call("set_target_state", state_id)

func _site_has_active_job(site_id: String) -> bool:
	for job_id in _jobs.keys():
		var job: WorkOrder = _jobs[job_id]
		if job.target_id == site_id and job.is_active():
			return true
	return false

# --- Selector determinista ------------------------------------------------

func evaluate_assignments() -> void:
	if _evaluating:
		return
	_evaluating = true
	for person_id in _person_order:
		var state: PersonWorkState = _person_states[person_id]
		if not state.is_alive() or state.is_busy():
			continue
		var job: WorkOrder = _best_job_for(state)
		if job != null:
			_assign(state, job)
	_update_block_reasons()
	_update_idle_reasons()
	_evaluating = false
	jobs_changed.emit()
	persons_changed.emit()

## Los trabajos de supervivencia ignoran una prioridad desactivada: es la
## única forma de romper el bloqueo circular «no puede trabajar porque tiene
## sed, no busca agua porque su prioridad está a 0».
func _priority_excludes(state: PersonWorkState, job: WorkOrder) -> bool:
	if job.urgency >= WorkOrder.URGENCY_SURVIVAL:
		return false
	return state.get_priority(job.family_id) <= WorkDefinitions.PRIORITY_MIN

func _is_eligible(state: PersonWorkState, job: WorkOrder) -> bool:
	if not job.is_assignable():
		return false
	if job.owner_person_id != "" and job.owner_person_id != state.id:
		return false
	if WorkActions.is_exclusive(job.action_type) and _reservations.has(job.key()):
		return false
	if _priority_excludes(state, job):
		return false
	if state.get_skill(job.required_skill_id) < job.required_skill_level:
		return false
	if execution.requirement_block(job.action_type, job.target_id) != "":
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

## Orden aprobado de desempate (UI-001, sección 3.3): supervivencia,
## prioridad, urgencia, distancia de ruta, tiempo de espera, nivel de
## habilidad exigido y, por último, ID estable del trabajo.
func _is_better(state: PersonWorkState, job: WorkOrder, length: float, best: WorkOrder, best_length: float) -> bool:
	if job.urgency != best.urgency:
		return job.urgency > best.urgency
	var priority: int = state.get_priority(job.family_id)
	var best_priority: int = state.get_priority(best.family_id)
	if priority != best_priority:
		return priority > best_priority
	if absf(length - best_length) > 0.01:
		return length < best_length
	if not is_equal_approx(job.created_at, best.created_at):
		return job.created_at < best.created_at
	if job.required_skill_level != best.required_skill_level:
		return job.required_skill_level > best.required_skill_level
	return job.id < best.id

func _assign(state: PersonWorkState, job: WorkOrder) -> void:
	var reserve_error: String = execution.reserve_for(job, state.id)
	if reserve_error != "":
		job.state = WorkOrder.STATE_BLOCKED
		job.block_reason = reserve_error
		return
	job.assigned_person_id = state.id
	job.block_reason = ""
	if WorkActions.is_exclusive(job.action_type):
		job.reserved_by_person_id = state.id
		_reservations[job.key()] = state.id
		job.state = WorkOrder.STATE_RESERVED
	state.current_job_id = job.id
	state.idle_reason = ""
	_mark_site_state(job.target_id, WorkTarget.STATE_DESIGNATED)
	_start_phase(job, state)

## Punto de trabajo desplazado por persona para que dos personas nunca
## terminen exactamente en la misma posición.
func work_stand_position(target_position: Vector3, person_id: String) -> Vector3:
	var index: int = maxi(get_person_index(person_id), 0)
	var angle: float = TAU * float(index) / maxf(float(_person_order.size()), 1.0)
	var offset := Vector3(cos(angle), 0.0, sin(angle)) * GameConstants.WORK_STAND_RADIUS
	return target_position + offset

# --- Ejecución por fases --------------------------------------------------

func _start_phase(job: WorkOrder, state: PersonWorkState) -> void:
	var phase: String = job.current_phase()
	match phase:
		WorkActions.PHASE_TRAVEL:
			job.state = WorkOrder.STATE_MOVING
			if not state.has_direct_order():
				state.operational_state = PersonWorkState.STATE_MOVING
			_send_actor(state.id, work_stand_position(job.target_position, state.id), GameConstants.WORK_ARRIVAL_RADIUS)
		WorkActions.PHASE_RETURN:
			job.state = WorkOrder.STATE_MOVING
			if not state.has_direct_order():
				state.operational_state = PersonWorkState.STATE_MOVING
			_send_actor(state.id, work_stand_position(job.destination_position, state.id), GameConstants.WORK_ARRIVAL_RADIUS)
		_:
			job.state = WorkOrder.STATE_WORKING
			if not state.has_direct_order():
				state.operational_state = PersonWorkState.STATE_WORKING
			_stop_actor(state.id)
			_mark_site_state(job.target_id, WorkTarget.STATE_IN_PROGRESS)
			if phase == WorkActions.PHASE_ACT:
				_on_act_phase_started(job, state)

## Ruido causal (sección 8, se emite una sola vez al comenzar «act», nunca al
## designar, por fotograma ni al terminar), duración dinámica de pesca y
## remiendo (secciones 12.1/12.2) y arranque de guardia continua (10.1).
func _on_act_phase_started(job: WorkOrder, state: PersonWorkState) -> void:
	var override_duration: float = execution.dynamic_act_duration(job.action_type, state)
	if override_duration >= 0.0 and job.phase_index < job.phase_durations.size():
		job.phase_durations[job.phase_index] = override_duration
		var total := 0.0
		for phase_duration in job.phase_durations:
			total += phase_duration
		job.duration = maxf(total, 0.001)

	var radius: float = WorkActions.noise_radius(job.action_type)
	if radius > 0.0:
		var event: Dictionary = noise.emit(job.action_type, job.target_position, radius, _simulated_moment())
		threat.on_noise_emitted(event)
		if noise.should_log(job.action_type, job.target_position, _simulated_moment()):
			log_event("Ruido de «%s» cerca de %s (alcance %d m)." % [
				WorkActions.action_name(job.action_type), site_name(job.target_id), int(radius),
			])

	if job.action_type == WorkActions.GUARD_ACCESS:
		state.guard_post_id = job.target_id
		threat.assign_guard(job.target_id, state.id)
		state.operational_state = PersonWorkState.STATE_WORKING

func _advance_phase(job: WorkOrder) -> void:
	var state: PersonWorkState = get_person_state(job.assigned_person_id)
	if job.current_phase() == WorkActions.PHASE_ACT:
		execution.on_act_finished(job, job.assigned_person_id)
	if job.is_last_phase():
		_complete_job(job)
		return
	job.phase_index += 1
	job.progress = maxf(job.progress, job.phase_start_progress())
	_key_progress[job.key()] = {"progress": job.progress, "phase_index": job.phase_index}
	if state != null:
		_start_phase(job, state)

# --- Avisos de los actores ------------------------------------------------

func notify_arrived(person_id: String) -> void:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null:
		return
	if state.has_direct_order():
		var order_kind: String = String(state.direct_order.get("kind", ""))
		if order_kind == PersonWorkState.DIRECT_ORDER_MOVE:
			state.clear_direct_order()
			state.operational_state = PersonWorkState.STATE_IDLE
			evaluate_assignments()
			return
		if order_kind == PersonWorkState.DIRECT_ORDER_ATTACK or order_kind == PersonWorkState.DIRECT_ORDER_RETREAT:
			# El combate puntual y la retirada gestionan su propio destino y
			# final por sí mismos en `ThreatService` (sección 10.2/10.3); una
			# llegada intermedia de aproximación no debe tocar su estado.
			return
	var job: WorkOrder = _jobs.get(state.current_job_id, null)
	if job == null:
		state.operational_state = PersonWorkState.STATE_IDLE
		evaluate_assignments()
		return
	if not job.is_travel_phase():
		return
	_advance_phase(job)
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
		_key_progress[job.key()] = {"progress": job.progress, "phase_index": job.phase_index}
		_detach_person_from_job(job)
		_release_reservation(job)
		execution.release_for(job)
		job.state = WorkOrder.STATE_BLOCKED
		job.block_reason = BLOCK_NO_ROUTE
	state.current_job_id = ""
	state.operational_state = PersonWorkState.STATE_IDLE
	evaluate_assignments()

# --- Avance de simulación -------------------------------------------------

## `gameplay_delta` ya viene multiplicado por la velocidad y vale 0 en pausa
## (ver `GameClock.simulation_advanced`).
func advance(gameplay_delta: float) -> void:
	if gameplay_delta <= 0.0:
		return
	_simulated_seconds += gameplay_delta
	for person_id in _person_order:
		var actor: Node = _person_actors.get(person_id, null)
		if is_instance_valid(actor) and actor.has_method("advance_simulation"):
			actor.advance_simulation(gameplay_delta)
		var state: PersonWorkState = _person_states[person_id]
		if state.needs != null:
			state.needs.advance(gameplay_delta)

	spoilage.advance(gameplay_delta)
	conduction.advance(gameplay_delta, storage, resources)
	threat.advance(gameplay_delta)

	var finished: Array[WorkOrder] = []
	for job_id in _jobs.keys():
		var job: WorkOrder = _jobs[job_id]
		if job.state != WorkOrder.STATE_WORKING or job.is_travel_phase():
			continue
		job.progress = minf(job.progress + gameplay_delta, job.duration)
		_key_progress[job.key()] = {"progress": job.progress, "phase_index": job.phase_index}
		if job.progress >= job.phase_end(job.phase_index) - 0.0001:
			finished.append(job)
	for job in finished:
		if job.is_active():
			_advance_phase(job)

	var jobs_before: int = _jobs.size()
	_apply_policies()
	_ensure_need_jobs()
	_refresh_progress_indicators()
	# Solo se reevalúa cuando puede haber cambiado algo: terminó una fase,
	# apareció o desapareció un trabajo, o alguien está sin hacer nada.
	if not finished.is_empty() or _jobs.size() != jobs_before or _has_idle_person():
		evaluate_assignments()
	world_changed.emit()

func _has_idle_person() -> bool:
	for person_id in _person_order:
		if not _person_states[person_id].is_busy():
			return true
	return false

func _complete_job(job: WorkOrder) -> void:
	if job.state == WorkOrder.STATE_COMPLETED:
		return
	job.state = WorkOrder.STATE_COMPLETED
	job.progress = job.duration
	job.block_reason = ""
	var person_id: String = job.assigned_person_id
	var state: PersonWorkState = get_person_state(person_id)
	# El efecto se aplica exactamente una vez, al pasar a `completed`.
	job.result = execution.apply(job, state.needs if state != null else null, state)
	if job.action_type == WorkActions.GUARD_ACCESS and state != null:
		threat.release_guard(job.target_id)
		state.guard_post_id = ""
	_release_reservation(job)
	_forget_job(job)
	_key_progress.erase(job.key())
	_mark_site_state(job.target_id, WorkTarget.STATE_AVAILABLE)
	var node: Node = get_site(job.target_id)
	if node != null and node.has_method("set_progress_visible"):
		node.call("set_progress_visible", false)
	if state != null:
		state.current_job_id = ""
		state.clear_direct_order()
		state.operational_state = PersonWorkState.STATE_IDLE
		_stop_actor(person_id)
	_completed_jobs.push_front(job)
	while _completed_jobs.size() > GameConstants.WORK_HISTORY_SIZE:
		_completed_jobs.pop_back()
	world_changed.emit()

func _refresh_progress_indicators() -> void:
	for site_id in _site_order:
		var node: Node = get_site(site_id)
		if not is_instance_valid(node) or not node.has_method("set_progress_visible"):
			continue
		var job: WorkOrder = _first_job_at(site_id)
		var visible_for_focus := false
		if job != null:
			node.call("set_progress_ratio", job.progress_ratio())
			var focused_person: bool = job.assigned_person_id != "" and _focus_type == "person" and _focus_id == job.assigned_person_id
			visible_for_focus = _is_focused(site_id) or focused_person
		node.call("set_progress_visible", visible_for_focus and job != null and job.progress > 0.0)

func _first_job_at(site_id: String) -> WorkOrder:
	var job_ids: Array = _jobs.keys()
	job_ids.sort()
	for job_id in job_ids:
		var job: WorkOrder = _jobs[job_id]
		if job.target_id == site_id and job.is_active():
			return job
	return null

func _is_focused(entity_id: String) -> bool:
	return _focus_type == "site" and _focus_id == entity_id

func set_focus(entity_type: String, entity_id: String) -> void:
	_focus_type = entity_type
	_focus_id = entity_id
	_refresh_progress_indicators()

# --- Políticas ------------------------------------------------------------

## Regenera los trabajos de las políticas activas: obtención continua en
## una fuente y mantenimiento del depósito de agua por acarreo.
func _apply_policies() -> void:
	for source_id in execution.sources.keys():
		var source: FiniteSource = execution.sources[source_id]
		if not source.policy_active:
			continue
		if source.block_reason() != "":
			continue
		if get_job_for(source.place_id, source.action_id) != null:
			continue
		designate_action(source.place_id, source.action_id)
	if water_policy_active and storage.ready_for_use:
		var below_capacity: bool = storage.water_total() < GameConstants.WATER_DEPOSIT_CAPACITY
		var without_job: bool = get_job_for(STREAM_SITE_ID, WorkActions.FETCH_WATER) == null
		var possible: bool = execution.requirement_block(WorkActions.FETCH_WATER, STREAM_SITE_ID) == ""
		if below_capacity and without_job and possible:
			designate_action(STREAM_SITE_ID, WorkActions.FETCH_WATER)

func toggle_source_policy(site_id: String) -> void:
	var source: FiniteSource = execution.source_for_site(site_id)
	if source == null:
		return
	source.policy_active = not source.policy_active
	_apply_policies()
	evaluate_assignments()

func toggle_water_policy() -> void:
	water_policy_active = not water_policy_active
	_apply_policies()
	evaluate_assignments()

# --- Necesidades básicas --------------------------------------------------

## Lugar donde se resuelve cada necesidad.
func _need_site(need_id: String) -> String:
	if need_id == PersonNeeds.NEED_HYDRATION:
		return DEPOSIT_SITE_ID
	return SHELTER_SITE_ID

## Cadena de supervivencia: qué trabajo abre camino cuando la necesidad es
## crítica y no hay nada que consumir. Es una lista fija y ordenada, no un
## planificador.
func _survival_chain(need_id: String) -> Array:
	match need_id:
		PersonNeeds.NEED_HYDRATION:
			return [
				{"site": SHELTER_SITE_ID, "action": WorkActions.OBSERVE_PLACE},
				{"site": SHELTER_SITE_ID, "action": WorkActions.INSPECT_PLACE},
				{"site": SHELTER_SITE_ID, "action": WorkActions.REGISTER_PLACE},
				{"site": STREAM_SITE_ID, "action": WorkActions.OBSERVE_PLACE},
				{"site": STREAM_SITE_ID, "action": WorkActions.FETCH_WATER},
			]
		PersonNeeds.NEED_NUTRITION:
			return [
				{"site": SHELTER_SITE_ID, "action": WorkActions.OBSERVE_PLACE},
				{"site": SHELTER_SITE_ID, "action": WorkActions.INSPECT_PLACE},
				{"site": SHELTER_SITE_ID, "action": WorkActions.REGISTER_PLACE},
				{"site": HOUSE_SITE_ID, "action": WorkActions.OBSERVE_PLACE},
				{"site": HOUSE_SITE_ID, "action": WorkActions.INSPECT_PLACE},
				{"site": POND_SITE_ID, "action": WorkActions.OBSERVE_PLACE},
				{"site": POND_SITE_ID, "action": WorkActions.INSPECT_PLACE},
				{"site": POND_SITE_ID, "action": WorkActions.FISH_POND},
				{"site": FOREST_SITE_ID, "action": WorkActions.OBSERVE_PLACE},
				{"site": FOREST_SITE_ID, "action": WorkActions.INSPECT_PLACE},
				{"site": FOREST_SITE_ID, "action": WorkActions.GATHER_MUSHROOMS},
			]
		PersonNeeds.NEED_REST:
			return [
				{"site": SHELTER_SITE_ID, "action": WorkActions.OBSERVE_PLACE},
				{"site": SHELTER_SITE_ID, "action": WorkActions.INSPECT_PLACE},
				{"site": SHELTER_SITE_ID, "action": WorkActions.REGISTER_PLACE},
				{"site": SHELTER_SITE_ID, "action": WorkActions.PREPARE_REST_AREA},
			]
	return []

func _has_need_job(person_id: String, need_id: String) -> bool:
	for job_id in _jobs.keys():
		var job: WorkOrder = _jobs[job_id]
		if job.need_id == need_id and job.owner_person_id == person_id:
			return true
	return false

func _has_survival_job(need_id: String) -> bool:
	for job_id in _jobs.keys():
		var job: WorkOrder = _jobs[job_id]
		if job.is_survival() and job.need_id == need_id and job.owner_person_id == "":
			return true
	return false

## Crea las acciones automáticas de beber, comer y descansar y, cuando no
## se pueden hacer, abre la cadena de supervivencia que las desbloquea.
func _ensure_need_jobs() -> void:
	for person_id in _person_order:
		var state: PersonWorkState = _person_states[person_id]
		if state.needs == null or not state.is_alive():
			continue
		var need_id: String = state.needs.most_urgent()
		if need_id == "":
			continue
		if _has_need_job(person_id, need_id):
			continue
		var action_id: String = String(PersonNeeds.NEED_ACTIONS.get(need_id, ""))
		var site_id: String = _need_site(need_id)
		var critical: bool = state.needs.is_critical(need_id)
		if execution.requirement_block(action_id, site_id) == "" and _sites.has(site_id):
			var current: WorkOrder = _jobs.get(state.current_job_id, null)
			if critical and current != null and not current.is_survival():
				# Una necesidad crítica interrumpe el trabajo en curso; el
				# progreso y las reservas se conservan al liberarlo.
				_release_current_work(state)
			var job: WorkOrder = _create_job(site_id, action_id, WorkOrder.ORIGIN_NEED, person_id)
			job.need_id = need_id
			job.urgency = WorkOrder.URGENCY_SURVIVAL if critical else WorkOrder.URGENCY_NORMAL
			continue
		if critical:
			_open_survival_chain(need_id)

func _open_survival_chain(need_id: String) -> void:
	if _has_survival_job(need_id):
		return
	# Antes de ir a buscar nada, se transporta lo que ya esté en el suelo.
	if need_id != PersonNeeds.NEED_REST and storage.ready_for_use:
		for site_id in execution.sites_with_pending_stacks():
			if not _sites.has(site_id):
				continue
			if get_job_for(site_id, WorkActions.HAUL_STORAGE) != null:
				continue
			var haul: WorkOrder = _create_job(site_id, WorkActions.HAUL_STORAGE, WorkOrder.ORIGIN_NEED)
			haul.need_id = need_id
			haul.urgency = WorkOrder.URGENCY_SURVIVAL
			return
	for entry in _survival_chain(need_id):
		var site_id := String(entry.get("site", ""))
		var action_id := String(entry.get("action", ""))
		if not _sites.has(site_id):
			continue
		if get_job_for(site_id, action_id) != null:
			return
		if execution.requirement_block(action_id, site_id) != "":
			continue
		if not _anyone_has_skill(action_id):
			continue
		var job: WorkOrder = _create_job(site_id, action_id, WorkOrder.ORIGIN_NEED)
		job.need_id = need_id
		job.urgency = WorkOrder.URGENCY_SURVIVAL
		return

func _anyone_has_skill(action_id: String) -> bool:
	var skill_id: String = WorkActions.skill_id(action_id)
	var level: int = WorkActions.skill_level(action_id)
	for person_id in _person_order:
		if _person_states[person_id].get_skill(skill_id) >= level:
			return true
	return false

# --- Bloqueos e inactividad ----------------------------------------------

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
	var requirement: String = execution.requirement_block(job.action_type, job.target_id)
	if requirement != "":
		return requirement
	var any_priority := false
	var any_skill := false
	var any_route := false
	for person_id in _person_order:
		var state: PersonWorkState = _person_states[person_id]
		if job.owner_person_id != "" and job.owner_person_id != person_id:
			continue
		if _priority_excludes(state, job):
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
	if WorkActions.is_exclusive(job.action_type) and _reservations.has(job.key()):
		return BLOCK_RESERVED
	return ""

func _update_idle_reasons() -> void:
	for person_id in _person_order:
		var state: PersonWorkState = _person_states[person_id]
		if not state.is_alive():
			state.idle_reason = ""
			continue
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
		if job.owner_person_id != "" and job.owner_person_id != state.id:
			continue
		if _priority_excludes(state, job):
			continue
		if state.get_skill(job.required_skill_id) < job.required_skill_level:
			continue
		compatible = true
		if not (WorkActions.is_exclusive(job.action_type) and _reservations.has(job.key())):
			free_compatible = true
	if not compatible:
		return IDLE_NOT_ELIGIBLE
	if not free_compatible:
		return IDLE_ALL_RESERVED
	return IDLE_NOT_ELIGIBLE

# --- Órdenes directas -----------------------------------------------------

func request_direct_move(person_id: String, world_position: Vector3) -> bool:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null:
		return false
	# El destino nunca sale del terreno útil.
	var destination := Vector3(
		clampf(world_position.x, GameConstants.MAP_BOUNDS_MIN.x, GameConstants.MAP_BOUNDS_MAX.x),
		0.0,
		clampf(world_position.z, GameConstants.MAP_BOUNDS_MIN.y, GameConstants.MAP_BOUNDS_MAX.y)
	)
	if navigation.route_block_reason(state.position, destination) != "":
		return false
	_release_current_work(state)
	state.direct_order = {
		"kind": PersonWorkState.DIRECT_ORDER_MOVE,
		"position": destination,
	}
	state.operational_state = PersonWorkState.STATE_DIRECT_ORDER
	state.idle_reason = ""
	_send_actor(person_id, destination, GameConstants.MOVE_ARRIVAL_RADIUS)
	evaluate_assignments()
	return true

## Describe si una persona puede ejecutar ahora mismo una acción concreta
## sobre un lugar, con su motivo operativo si no puede.
func describe_direct_work(person_id: String, site_id: String, action_id: String) -> Dictionary:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null or not _sites.has(site_id) or not WorkActions.ACTIONS.has(action_id):
		return {"enabled": false, "reason": "Acción no disponible en este lugar"}
	var requirement: String = execution.requirement_block(action_id, site_id)
	if requirement != "":
		return {"enabled": false, "reason": requirement}
	if state.get_skill(WorkActions.skill_id(action_id)) < WorkActions.skill_level(action_id):
		var reason := "No cumple la habilidad mínima: %s ≥ %d" % [
			WorkDefinitions.skill_name(WorkActions.skill_id(action_id)),
			WorkActions.skill_level(action_id),
		]
		return {"enabled": false, "reason": reason}
	if WorkActions.is_exclusive(action_id):
		var reserved_by: String = String(_reservations.get(WorkOrder.make_key(site_id, action_id), ""))
		if reserved_by != "" and reserved_by != person_id:
			return {"enabled": false, "reason": DIRECT_WORK_RESERVED}
	if not navigation.is_reachable(state.position, site_position(site_id)):
		return {"enabled": false, "reason": DIRECT_WORK_NO_ROUTE}
	return {"enabled": true, "reason": ""}

func request_direct_work(person_id: String, site_id: String, action_id: String) -> bool:
	var availability: Dictionary = describe_direct_work(person_id, site_id, action_id)
	if not bool(availability.get("enabled", false)):
		return false
	var state: PersonWorkState = get_person_state(person_id)
	_release_current_work(state)

	var job: WorkOrder = get_job_for(site_id, action_id)
	if job == null:
		job = _create_job(site_id, action_id, WorkOrder.ORIGIN_DIRECT)
	else:
		_detach_person_from_job(job)
		_release_reservation(job)
		execution.release_for(job)
	var reserve_error: String = execution.reserve_for(job, person_id)
	if reserve_error != "":
		job.state = WorkOrder.STATE_BLOCKED
		job.block_reason = reserve_error
		evaluate_assignments()
		return false
	job.assigned_person_id = person_id
	job.block_reason = ""
	if WorkActions.is_exclusive(action_id):
		job.reserved_by_person_id = person_id
		_reservations[job.key()] = person_id

	state.current_job_id = job.id
	state.idle_reason = ""
	state.direct_order = {
		"kind": PersonWorkState.DIRECT_ORDER_WORK,
		"target_id": site_id,
		"action_id": action_id,
		"job_id": job.id,
	}
	state.operational_state = PersonWorkState.STATE_DIRECT_ORDER
	_mark_site_state(site_id, WorkTarget.STATE_DESIGNATED)
	_start_phase(job, state)
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
				_key_progress[job.key()] = {"progress": job.progress, "phase_index": job.phase_index}
				_detach_person_from_job(job)
				_release_reservation(job)
				execution.release_for(job)
				job.state = WorkOrder.STATE_PENDING
	state.current_job_id = ""
	state.operational_state = PersonWorkState.STATE_IDLE
	_stop_actor(person_id)
	evaluate_assignments()

# --- Combate puntual y retirada (sección 10.2/10.3) ------------------------

## Clic derecho sobre un zombi vivo con una persona seleccionada.
func request_attack(person_id: String, zombie_id: String) -> bool:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null or not state.is_alive():
		return false
	var z: ZombieState = threat.get_zombie_state(zombie_id)
	if z == null or not z.is_alive():
		return false
	_release_current_work(state)
	state.direct_order = {"kind": PersonWorkState.DIRECT_ORDER_ATTACK, "target_id": zombie_id}
	state.operational_state = PersonWorkState.STATE_COMBAT
	state.idle_reason = ""
	evaluate_assignments()
	return true

## «Retirarse al refugio», ordenada por el jugador con una persona viva
## seleccionada (sección 10.3).
func request_retreat(person_id: String) -> bool:
	start_retreat(person_id, "")
	return true

## Punto de integración pequeño para `ThreatService` (sección 15.2): inicia
## la retirada tanto por orden del jugador como por disparo automático
## (salud crítica o varios zombis cerca). Interrumpe incluso una orden
## directa en curso.
func start_retreat(person_id: String, reason: String) -> void:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null or not state.is_alive():
		return
	if state.has_direct_order() and String(state.direct_order.get("kind", "")) == PersonWorkState.DIRECT_ORDER_RETREAT:
		return
	_release_current_work(state)
	state.direct_order = {"kind": PersonWorkState.DIRECT_ORDER_RETREAT}
	state.operational_state = PersonWorkState.STATE_RETREATING
	state.idle_reason = ""
	if reason != "":
		state.recent_decision = reason
		log_event("%s: %s" % [state.display_name, reason])
	evaluate_assignments()

## Llamado por `ThreatService` cuando el objetivo de un ataque puntual muere,
## se pierde o la orden debe terminar.
func finish_attack_order(person_id: String) -> void:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null:
		return
	state.clear_direct_order()
	state.operational_state = PersonWorkState.STATE_IDLE
	_stop_actor(person_id)
	evaluate_assignments()

## Llamado por `ThreatService` al llegar al punto de reunión: si ya no hay
## peligro inmediato, vuelve a la asignación automática (sección 10.3).
func finish_retreat(person_id: String) -> void:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null:
		return
	state.clear_direct_order()
	state.operational_state = PersonWorkState.STATE_IDLE
	_stop_actor(person_id)
	evaluate_assignments()

## Baja de una persona (sección 9): interrumpe movimiento, combate y
## trabajo, libera reservas y deja su carga en el sitio sin duplicarla ni
## consumirla. La persona queda excluida de nuevas asignaciones, guardias e
## iniciativas, pero su fila y su ficha siguen visibles y deshabilitadas.
func mark_person_dead(person_id: String) -> void:
	var state: PersonWorkState = get_person_state(person_id)
	if state == null:
		return
	_release_current_work(state)
	state.clear_direct_order()
	state.operational_state = PersonWorkState.STATE_IDLE
	persons_changed.emit()
	world_changed.emit()

# --- Zonas territoriales (sección 5) ----------------------------------------

## Pinta un trazo continuo de zona (sección 5.1/5.3). Si se pinta `forbidden`,
## interrumpe en el siguiente momento seguro cualquier trabajo cuya ruta
## quede bloqueada, conservando progreso y liberando reservas, y saca de la
## celda a quien quede atrapado dentro hacia la habitual más cercana.
func paint_zone(from_world: Vector3, to_world: Vector3, state_id: String) -> void:
	var changed: Array[Vector2i] = zones.paint_stroke(from_world, to_world, state_id)
	if changed.is_empty():
		return
	if state_id == ZoneDefinitions.STATE_FORBIDDEN:
		_recheck_jobs_against_zone()
		_release_trapped_persons()
	evaluate_assignments()
	world_changed.emit()

func _recheck_jobs_against_zone() -> void:
	for job_id in _jobs.keys():
		var job: WorkOrder = _jobs[job_id]
		if job.assigned_person_id == "" or not job.is_active():
			continue
		var state: PersonWorkState = get_person_state(job.assigned_person_id)
		if state == null:
			continue
		if navigation.route_block_reason(state.position, job.target_position) != ZoneDefinitions.BLOCK_FORBIDDEN:
			continue
		_key_progress[job.key()] = {"progress": job.progress, "phase_index": job.phase_index}
		_detach_person_from_job(job)
		_release_reservation(job)
		execution.release_for(job)
		job.state = WorkOrder.STATE_BLOCKED
		job.block_reason = ZoneDefinitions.BLOCK_FORBIDDEN
		state.current_job_id = ""
		state.operational_state = PersonWorkState.STATE_IDLE

func _release_trapped_persons() -> void:
	for person_id in _person_order:
		var state: PersonWorkState = _person_states[person_id]
		if not state.is_alive() or state.has_direct_order():
			continue
		if zones.state_at(state.position) != ZoneDefinitions.STATE_FORBIDDEN:
			continue
		var exit_position: Vector3 = zones.nearest_habitual_world(state.position)
		_send_actor(person_id, exit_position, GameConstants.MOVE_ARRIVAL_RADIUS)
		state.operational_state = PersonWorkState.STATE_MOVING
		state.idle_reason = "Ha salido de una zona recién prohibida."

func toggle_zone_overlay() -> void:
	zone_overlay_shown = not zone_overlay_shown

# --- Defensa: iniciativa autónoma de reparación (sección 13) ---------------

func _on_defense_damaged(defense_id: String, ratio: float) -> void:
	if defense.can_evaluate_initiative(defense_id):
		var point: DefensePoint = defense.get_point(defense_id)
		log_event("%s ha bajado al 50%% o menos de su durabilidad." % point.site_display_name())
		_try_create_repair_initiative(defense_id)
	world_changed.emit()

func _on_defense_destroyed(defense_id: String) -> void:
	var point: DefensePoint = defense.get_point(defense_id)
	log_event("%s ha sido destruida." % (point.site_display_name() if point != null else defense_id))
	world_changed.emit()

## Sección 13: evalúa las cinco condiciones y, si hay una persona elegible,
## crea el trabajo de reparación con origen `initiative`.
func _try_create_repair_initiative(defense_id: String) -> void:
	defense.mark_initiative_evaluated(defense_id)
	if get_job_for(defense_id, WorkActions.REPAIR_DEFENSE) != null:
		return
	if resources.stored_stacks_of_type(ResourceDefinitions.TYPE_REPAIR_MATERIALS).is_empty():
		return
	var point: DefensePoint = defense.get_point(defense_id)
	if point == null:
		return
	if zones.state_at(point.site_position()) == ZoneDefinitions.STATE_FORBIDDEN:
		return
	var candidates: Array = []
	for person_id in _person_order:
		var state: PersonWorkState = _person_states[person_id]
		if not state.is_alive() or state.is_busy():
			continue
		var urgent: String = state.needs.most_urgent() if state.needs != null else ""
		if urgent != "" and state.needs.is_critical(urgent):
			continue
		if state.get_skill("construction_carpentry") < 2:
			continue
		if state.get_priority("build_repair") <= 0:
			continue
		if threat.zombie_within(state.position, GameConstants.INITIATIVE_ZOMBIE_RANGE):
			continue
		var route: Dictionary = navigation.query(state.position, point.site_position())
		if not bool(route.get("reachable", false)):
			continue
		candidates.append({
			"person_id": person_id,
			"skill_level": state.get_skill("construction_carpentry"),
			"route_length": float(route.get("length", INF)),
		})
	var chosen_id: String = AutonomyService.choose_repair_initiative(candidates)
	if chosen_id == "":
		return
	_create_job(defense_id, WorkActions.REPAIR_DEFENSE, WorkOrder.ORIGIN_INITIATIVE, chosen_id)
	var chosen_state: PersonWorkState = _person_states[chosen_id]
	chosen_state.recent_decision = AutonomyService.INITIATIVE_MESSAGE
	log_event("%s: %s" % [chosen_state.display_name, AutonomyService.INITIATIVE_MESSAGE])
	evaluate_assignments()

## Libera el trabajo automático en curso de una persona: vuelve a `pending`,
## conserva su progreso y libera las reservas.
func _release_current_work(state: PersonWorkState) -> void:
	if state.has_direct_order():
		cancel_direct_order(state.id)
	if state.current_job_id == "":
		return
	var job: WorkOrder = _jobs.get(state.current_job_id, null)
	state.current_job_id = ""
	if job != null:
		if job.action_type == WorkActions.GUARD_ACCESS:
			# El puesto sigue designado: otra persona puede ocuparlo
			# (sección 10.1). Solo se libera la ocupación actual.
			threat.release_guard(job.target_id)
		_key_progress[job.key()] = {"progress": job.progress, "phase_index": job.phase_index}
		job.assigned_person_id = ""
		_release_reservation(job)
		execution.release_for(job)
		job.state = WorkOrder.STATE_PENDING
	state.guard_post_id = ""
	_stop_actor(state.id)

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
	var line := "%s · %s · %s · %s · %d%%" % [
		job.action_name, site_name(job.target_id), person_text, job.state_label(),
		int(round(job.progress_ratio() * 100.0)),
	]
	if job.is_survival():
		line = "⚠ " + line
	if job.is_initiative():
		line += " · Iniciativa"
	if WorkActions.is_continuous(job.action_type) and job.current_phase() == WorkActions.PHASE_ACT:
		line += " · Guardia continua"
	if job.current_phase() != "":
		line += " · %s" % job.phase_label()
	if job.block_reason != "":
		line += " · %s" % job.block_reason
	if job.result != "":
		line += " · %s" % job.result
	return line

## Descripción de la actividad actual de una persona para la ficha y el HUD.
func describe_person_action(state: PersonWorkState) -> String:
	if state.has_direct_order():
		match String(state.direct_order.get("kind", "")):
			PersonWorkState.DIRECT_ORDER_MOVE:
				return "Orden directa: mover a un punto"
			PersonWorkState.DIRECT_ORDER_ATTACK:
				return "Orden directa: atacar cuerpo a cuerpo"
			PersonWorkState.DIRECT_ORDER_RETREAT:
				return "Retirándose al refugio"
	var job: WorkOrder = _jobs.get(state.current_job_id, null)
	if job == null:
		return "Sin trabajo"
	var prefix := "Orden directa: " if state.has_direct_order() else ""
	return "%s%s · %s (%s)" % [prefix, job.action_name, site_name(job.target_id), job.phase_label()]

func get_person_progress_ratio(state: PersonWorkState) -> float:
	var job: WorkOrder = _jobs.get(state.current_job_id, null)
	if job == null:
		return -1.0
	return job.progress_ratio()

## Qué lleva encima una persona, para su ficha.
func describe_person_load(person_id: String) -> String:
	var parts := PackedStringArray()
	for stack in resources.all_stacks():
		if stack.carrier_person_id != person_id or not stack.is_active():
			continue
		parts.append("%s ×%d" % [stack.type_name(), stack.amount])
	return " · ".join(parts) if not parts.is_empty() else "Sin carga"

## Acciones que ofrece un lugar a una persona, con su estado de bloqueo.
## Se usa tanto en el panel de selección como en el menú contextual.
## Acciones estáticas de `WorkActions.SITE_ACTIONS`, salvo en un punto de
## defensa: ahí la acción disponible depende de su estado real (abierto,
## dañado o destruido; sección 6.2), así que se resuelve con
## `DefenseService.available_action_for`.
func _site_action_ids(site_id: String) -> Array[String]:
	var defense_action: String = defense.available_action_for(site_id)
	if defense_action != "":
		return [defense_action]
	return WorkActions.site_actions(site_id)

func describe_site_actions(person_id: String, site_id: String) -> Array:
	var rows: Array = []
	if not _sites.has(site_id):
		return rows
	var action_ids: Array[String] = _site_action_ids(site_id)
	if not execution.haulable_stacks(site_id).is_empty() and not action_ids.has(WorkActions.HAUL_STORAGE):
		action_ids.append(WorkActions.HAUL_STORAGE)
	for action_id in action_ids:
		var availability: Dictionary = {}
		if person_id != "":
			availability = describe_direct_work(person_id, site_id, action_id)
		else:
			# Sin persona seleccionada solo se comprueban los requisitos
			# materiales y de información del lugar.
			var requirement: String = execution.requirement_block(action_id, site_id)
			availability = {"enabled": requirement == "", "reason": requirement}
		rows.append({
			"action_id": action_id,
			"label": WorkActions.action_name(action_id),
			"family": WorkDefinitions.family_name(WorkActions.family_id(action_id)),
			"enabled": bool(availability.get("enabled", false)),
			"reason": String(availability.get("reason", "")),
			"designated": get_job_for(site_id, action_id) != null,
		})
	return rows

## Opciones del menú contextual para una persona seleccionada.
## `hit` es {"kind": "terrain"|"site"|..., "position": Vector3, "target_id": String}.
func get_context_options(person_id: String, hit: Dictionary) -> Array:
	var options: Array = []
	var kind: String = String(hit.get("kind", ""))
	if kind == "terrain":
		var state: PersonWorkState = get_person_state(person_id)
		var reason := ""
		if state != null:
			reason = navigation.route_block_reason(state.position, hit.get("position", Vector3.ZERO))
		options.append({"id": "move_here", "label": "Mover aquí", "enabled": reason == "", "reason": reason})
		return options
	if kind == "zombie":
		var zombie_id := String(hit.get("target_id", ""))
		var z: ZombieState = threat.get_zombie_state(zombie_id)
		var enabled: bool = z != null and z.is_alive()
		var reason := "" if enabled else "Objetivo muerto"
		options.append({
			"id": "attack|%s" % zombie_id,
			"label": "Atacar cuerpo a cuerpo",
			"enabled": enabled,
			"reason": reason,
		})
		return options
	if kind != "site":
		return options
	var site_id: String = String(hit.get("target_id", ""))
	for row in describe_site_actions(person_id, site_id):
		var action_id := String(row.get("action_id", ""))
		options.append({
			"id": "direct|%s" % action_id,
			"label": "Hacer ahora: %s" % String(row.get("label", "")),
			"enabled": bool(row.get("enabled", false)),
			"reason": String(row.get("reason", "")),
		})
		if not bool(row.get("designated", false)):
			options.append({
				"id": "designate|%s" % action_id,
				"label": "Designar: %s" % String(row.get("label", "")),
				"enabled": true,
				"reason": "",
			})
		else:
			options.append({
				"id": "cancel|%s" % action_id,
				"label": "Cancelar designación: %s" % String(row.get("label", "")),
				"enabled": true,
				"reason": "",
			})
	var source: FiniteSource = execution.source_for_site(site_id)
	if source != null:
		options.append({
			"id": "policy|source",
			"label": source.policy_label(),
			"enabled": source.recognised,
			"reason": "" if source.recognised else FiniteSource.REASON_NOT_RECOGNISED,
		})
	if site_id == STREAM_SITE_ID:
		options.append({
			"id": "policy|water",
			"label": WATER_POLICY_STOP_LABEL if water_policy_active else WATER_POLICY_LABEL,
			"enabled": true,
			"reason": "",
		})
	if not execution.haulable_stacks(site_id).is_empty():
		options.append({
			"id": "haul_all",
			"label": "Transportar todo lo accesible",
			"enabled": storage.ready_for_use,
			"reason": "" if storage.ready_for_use else StorageStore.NOT_READY_REASON,
		})
	return options

## Información de un lugar para el panel de selección.
func describe_site(site_id: String) -> Dictionary:
	var place: PlaceInfo = places.get_place(site_id)
	if place == null:
		return {}
	var lines := PackedStringArray()
	lines.append("Información: %s — %s" % [place.level_label(), place.level_description()])
	if place.notes != "":
		lines.append("Indicios: %s" % place.notes)
	var pending: int = places.pending_amount(site_id, resources)
	if place.has_fixed_content():
		lines.append("Contenido sin recoger: %d unidades · %s" % [pending, place.emptiness_text()])
	var source: FiniteSource = execution.source_for_site(site_id)
	if source != null:
		lines.append("Fuente: %s · %s" % [source.availability_text(), source.policy_label()])
		if source.block_reason() != "":
			lines.append("Aviso: %s" % source.block_reason())
	if site_id == DEPOSIT_SITE_ID:
		lines.append("Conducción por gravedad: %s" % conduction.state_label())
		lines.append("Depósito: %d/%d" % [storage.water_total(), GameConstants.WATER_DEPOSIT_CAPACITY])
	if site_id == SHELTER_SITE_ID:
		lines.append("Almacén: %s" % ("establecido" if storage.ready_for_use else "sin establecer"))
		lines.append("Plazas de descanso: %d" % storage.rest_places)
	var state_text: String = place.level_label()
	## Un punto de defensa muestra su estado, durabilidad y sector reales en
	## vez del nivel de información genérico (sección 6.2: «El panel del
	## punto muestra estado, durabilidad actual/máxima, sector, trabajo
	## activo y bloqueo»).
	var point: DefensePoint = defense.get_point(site_id)
	if point != null:
		state_text = point.state_label()
		lines = PackedStringArray()
		lines.append("Estado: %s · Sector: %s" % [point.state_label(), DefensePoint.sector(site_id)])
		if point.defense_state != DefensePoint.STATE_OPEN:
			lines.append("Durabilidad: %d/%d" % [int(round(point.durability)), int(point.max_durability_value())])
		var active_job: WorkOrder = _job_for_site(site_id)
		if active_job != null:
			lines.append("Trabajo activo: %s (%s)" % [active_job.action_name, active_job.state_label()])
		var pending_action: String = defense.available_action_for(site_id)
		if pending_action != "":
			var block: String = defense.requirement_block(pending_action, site_id)
			if block != "":
				lines.append("Bloqueo: %s" % block)
	elif _guard_post_ids().has(site_id):
		var occupant_id: String = threat.guard_occupant(site_id)
		var occupant_name := "sin ocupar"
		if occupant_id != "":
			var occupant_state: PersonWorkState = get_person_state(occupant_id)
			occupant_name = occupant_state.display_name if occupant_state != null else occupant_id
		state_text = "En guardia (%s)" % occupant_name if occupant_id != "" else "Sin ocupar"
		lines = PackedStringArray(["Puesto de guardia: %s" % state_text])
	return {
		"state_text": state_text,
		"info_lines": lines,
	}

## Punto de defensa en trabajo activo (designado o en curso) para su ficha,
## o null si no tiene ninguno.
func _job_for_site(site_id: String) -> WorkOrder:
	for job_id in _jobs.keys():
		var job: WorkOrder = _jobs[job_id]
		if job.target_id == site_id and job.is_active():
			return job
	return null

func _guard_post_ids() -> Array[String]:
	var ids: Array[String] = [GuardPost.ID_SOUTH, GuardPost.ID_EAST]
	return ids

## Filas del panel «Recursos»: cantidad por tipo y estado logístico.
func describe_resource_rows() -> Array:
	var rows: Array = []
	var totals: Dictionary = resources.totals_by_type()
	for type_id in ResourceDefinitions.TYPE_IDS:
		var row: Dictionary = totals.get(type_id, {})
		var parts := PackedStringArray()
		var total := 0
		for logistics_state in ResourceDefinitions.LOGISTICS_STATES:
			var amount: int = int(row.get(logistics_state, 0))
			total += amount
			parts.append("%s %d" % [ResourceDefinitions.logistics_label(String(logistics_state)), amount])
		rows.append({
			"type_id": type_id,
			"name": ResourceDefinitions.type_name(String(type_id)),
			"total": total,
			"detail": " · ".join(parts),
		})
	return rows
