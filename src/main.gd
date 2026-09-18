## Composición de la escena principal: conecta cámara, reloj, selección,
## tablón de trabajos y HUD entre sí. Cada sistema mantiene su propio
## estado; este script solo cablea señales y traduce datos para el HUD.
extends Node3D

@onready var _world: Node3D = $World
@onready var _camera_rig: StrategicCamera = $CameraRig
@onready var _clock: GameClock = $GameClock
@onready var _selection_manager: SelectionManager = $SelectionManager
@onready var _work_board: WorkBoard = $WorkBoard
@onready var _hud: HUD = $HUDLayer

var _selected_info: Dictionary = {}
var _context_person_id: String = ""
var _context_hit: Dictionary = {}

func _ready() -> void:
	_selection_manager.camera = _camera_rig.get_camera()

	_setup_work_board()

	_clock.time_changed.connect(_hud.update_clock)
	_clock.speed_state_changed.connect(_hud.update_speed_state)
	_clock.simulation_advanced.connect(_on_simulation_advanced)

	_hud.pause_pressed.connect(_clock.set_paused.bind(true))
	_hud.speed_selected.connect(_clock.set_multiplier)
	_hud.center_camera_requested.connect(_camera_rig.center_camera)
	_hud.priority_cycle_requested.connect(_on_priority_cycle_requested)
	_hud.target_action_requested.connect(_on_target_action_requested)
	_hud.cancel_direct_order_requested.connect(_work_board.cancel_direct_order)
	_hud.context_option_chosen.connect(_on_context_option_chosen)

	_selection_manager.selection_changed.connect(_on_selection_changed)
	_selection_manager.selection_cleared.connect(_on_selection_cleared)
	_selection_manager.context_menu_requested.connect(_on_context_menu_requested)

	_work_board.jobs_changed.connect(_refresh_jobs_panel)
	_work_board.persons_changed.connect(_refresh_priorities_panel)

	_hud.build_priorities_matrix(_person_rows())
	_refresh_priorities_panel()
	_refresh_jobs_panel()

	# GameClock ya emitió su estado inicial en su propio _ready(), antes de
	# que este método conectara el HUD; se empuja una vez a mano para que
	# el HUD arranque mostrando Día 1, 08:00 y la velocidad activa reales.
	var initial_time: Dictionary = _clock.get_current_time()
	_hud.update_clock(initial_time.get("day"), initial_time.get("hour"), initial_time.get("minute"))
	_hud.update_speed_state(_clock.paused, _clock.multiplier)

func _unhandled_input(event: InputEvent) -> void:
	# Cualquier clic izquierdo en el mundo cierra el menú contextual abierto.
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_hud.hide_context_menu()

# --- Cableado del tablón --------------------------------------------------

func _setup_work_board() -> void:
	var navigation_region: NavigationRegion3D = _world.get_node_or_null("Navigation")
	if navigation_region != null:
		_work_board.navigation.set_map(navigation_region.get_navigation_map())

	var survivors: Node = _world.get_node_or_null("Survivors")
	if survivors:
		for survivor in survivors.get_children():
			if survivor is Survivor:
				var state := PersonWorkState.new(survivor.id, survivor.display_name)
				state.position = survivor.global_position
				_work_board.register_person(state, survivor)
				survivor.setup(state, _work_board)

	var targets: Node = _world.get_node_or_null("WorkTargets")
	if targets:
		for target in targets.get_children():
			if target is WorkTarget:
				_work_board.register_target(target)

func _on_simulation_advanced(gameplay_delta: float) -> void:
	_work_board.advance(gameplay_delta)
	_refresh_jobs_panel()
	_refresh_selection_panel()

# --- Selección ------------------------------------------------------------

func _on_selection_changed(info: Dictionary) -> void:
	_selected_info = info
	_work_board.set_focus(String(info.get("entity_type", "")), String(info.get("id", "")))
	_hud.hide_context_menu()
	_refresh_selection_panel()

func _on_selection_cleared() -> void:
	_selected_info = {}
	_work_board.set_focus("", "")
	_hud.hide_context_menu()
	_hud.clear_selection()

func _refresh_selection_panel() -> void:
	if _selected_info.is_empty():
		return
	_hud.update_selection(_build_selection_info())

## Amplía la información del `Selectable` con el estado de trabajo real.
func _build_selection_info() -> Dictionary:
	var info: Dictionary = _selected_info.duplicate()
	var entity_type := String(info.get("entity_type", ""))
	var entity_id := String(info.get("id", ""))
	info["progress"] = -1.0

	if entity_type == "person":
		var state: PersonWorkState = _work_board.get_person_state(entity_id)
		if state != null:
			info["state_text"] = state.state_label()
			info["action_text"] = _work_board.describe_person_action(state)
			info["reason_text"] = state.idle_reason
			info["progress"] = _work_board.get_person_progress_ratio(state)
			info["has_direct_order"] = state.has_direct_order()
			var skills: Array = []
			for skill_id in WorkDefinitions.SKILL_IDS:
				var level: int = state.get_skill(String(skill_id))
				skills.append({
					"name": WorkDefinitions.skill_name(String(skill_id)),
					"level": level,
					"label": WorkDefinitions.skill_level_label(level),
				})
			info["skills"] = skills
	elif entity_type == "work_target":
		var target: WorkTarget = _work_board.get_target(entity_id)
		if target != null:
			info["state_text"] = target.state_label()
			var job: WorkOrder = _work_board.get_job_for_target(entity_id)
			if job != null:
				info["action_text"] = _work_board.describe_job(job)
				info["reason_text"] = job.block_reason
				info["progress"] = job.progress_ratio()
				info["target_action"] = "Cancelar designación"
			elif target.is_completed():
				info["action_text"] = "Trabajo completado"
				info["target_action"] = ""
			else:
				info["action_text"] = "%s (sin designar)" % target.action_name()
				info["target_action"] = "Designar trabajo"
	return info

# --- Paneles --------------------------------------------------------------

func _person_rows() -> Array:
	var rows: Array = []
	for person_id in _work_board.get_person_ids():
		var state: PersonWorkState = _work_board.get_person_state(person_id)
		if state == null:
			continue
		rows.append({
			"id": state.id,
			"display_name": state.display_name,
			"priorities": state.priorities,
		})
	return rows

func _refresh_priorities_panel() -> void:
	_hud.update_priorities(_person_rows())
	_refresh_selection_panel()

func _refresh_jobs_panel() -> void:
	var active_lines := PackedStringArray()
	for job in _work_board.get_active_jobs():
		active_lines.append(_work_board.describe_job(job))
	var completed_lines := PackedStringArray()
	for completed_job in _work_board.get_completed_jobs():
		completed_lines.append(_work_board.describe_job(completed_job))
	_hud.update_jobs(active_lines, completed_lines)

func _on_priority_cycle_requested(person_id: String, family_id: String, increase: bool) -> void:
	_work_board.cycle_priority(person_id, family_id, increase)

func _on_target_action_requested(target_id: String) -> void:
	if target_id == "":
		return
	_work_board.toggle_target_designation(target_id)
	_refresh_selection_panel()

# --- Menú contextual ------------------------------------------------------

func _on_context_menu_requested(hit: Dictionary, screen_position: Vector2) -> void:
	# El clic derecho no cambia la selección y solo ofrece acciones si hay
	# una persona seleccionada.
	if String(_selected_info.get("entity_type", "")) != "person":
		_hud.hide_context_menu()
		return
	var person_id := String(_selected_info.get("id", ""))
	var options: Array = _work_board.get_context_options(person_id, hit)
	if options.is_empty():
		_hud.hide_context_menu()
		return
	_context_person_id = person_id
	_context_hit = hit
	_hud.show_context_menu(options, screen_position, String(_selected_info.get("display_name", "")))

func _on_context_option_chosen(option_id: String) -> void:
	if _context_person_id == "":
		return
	match option_id:
		"move_here":
			_work_board.request_direct_move(_context_person_id, _context_hit.get("position", Vector3.ZERO))
		"direct_work":
			_work_board.request_direct_work(_context_person_id, String(_context_hit.get("target_id", "")))
		"designate":
			_work_board.designate_target(String(_context_hit.get("target_id", "")))
	_refresh_selection_panel()
	_refresh_jobs_panel()
