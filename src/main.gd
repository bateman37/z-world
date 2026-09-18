## Composición de la escena principal: conecta cámara, reloj, selección,
## tablón de trabajos y HUD entre sí. Cada sistema mantiene su propio
## estado; este script solo cablea señales, siembra las condiciones
## iniciales del escenario y traduce datos para el HUD.
extends Node3D

## Pertenencias con las que llega cada superviviente (IMPLEMENTATION-003,
## sección 6). Son pilas reales que hay que depositar en el almacén, no un
## inventario abstracto.
const ARRIVAL_BELONGINGS := {
	"person.initial.01": [{"type_id": "basic_tools", "amount": 1}],
	"person.initial.02": [{"type_id": "water_container", "amount": 1}],
	"person.initial.03": [{"type_id": "basic_medicine", "amount": 1}],
	"person.initial.04": [{"type_id": "food_preserved", "amount": 1}],
	"person.initial.05": [{"type_id": "water_container", "amount": 1}],
	"person.initial.06": [{"type_id": "cloth", "amount": 1}],
}

@onready var _world: Node3D = $World
@onready var _camera_rig: StrategicCamera = $CameraRig
@onready var _clock: GameClock = $GameClock
@onready var _selection_manager: SelectionManager = $SelectionManager
@onready var _work_board: WorkBoard = $WorkBoard
@onready var _hud: HUD = $HUDLayer

var _selected_info: Dictionary = {}
var _context_person_id: String = ""
var _context_hit: Dictionary = {}
var _zone_overlay: ZoneOverlay = null
var _current_zone_state: String = ZoneDefinitions.STATE_HABITUAL

func _ready() -> void:
	_selection_manager.camera = _camera_rig.get_camera()

	_setup_work_board()
	_setup_threat_and_defense()

	_clock.time_changed.connect(_hud.update_clock)
	_clock.time_changed.connect(_work_board.set_current_time)
	_clock.speed_state_changed.connect(_hud.update_speed_state)
	_clock.simulation_advanced.connect(_on_simulation_advanced)

	_hud.pause_pressed.connect(_clock.set_paused.bind(true))
	_hud.speed_selected.connect(_clock.set_multiplier)
	_hud.center_camera_requested.connect(_camera_rig.center_camera)
	_hud.priority_cycle_requested.connect(_on_priority_cycle_requested)
	_hud.site_action_requested.connect(_on_site_action_requested)
	_hud.haul_all_requested.connect(_on_haul_all_requested)
	_hud.cancel_direct_order_requested.connect(_work_board.cancel_direct_order)
	_hud.retreat_requested.connect(_work_board.request_retreat)
	_hud.context_option_chosen.connect(_on_context_option_chosen)
	_hud.zone_tool_toggled.connect(_on_zone_tool_toggled)
	_hud.zone_state_selected.connect(_on_zone_state_selected)
	_hud.zone_overlay_toggle_requested.connect(_on_zone_overlay_toggle_requested)

	_selection_manager.selection_changed.connect(_on_selection_changed)
	_selection_manager.selection_cleared.connect(_on_selection_cleared)
	_selection_manager.context_menu_requested.connect(_on_context_menu_requested)
	_selection_manager.zone_paint_requested.connect(_on_zone_paint_requested)

	_work_board.jobs_changed.connect(_refresh_jobs_panel)
	_work_board.persons_changed.connect(_refresh_priorities_panel)
	_work_board.world_changed.connect(_refresh_world_panels)
	_work_board.event_log.event_logged.connect(_on_event_logged)
	_work_board.threat.threat_level_changed.connect(_on_threat_level_changed)

	_hud.build_priorities_matrix(_person_rows())
	_refresh_priorities_panel()
	_refresh_jobs_panel()
	_refresh_world_panels()

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

	var buildings: Node = _world.get_node_or_null("Buildings")
	if buildings:
		for building in buildings.get_children():
			if building is Building and building.explorable:
				_work_board.register_site(building)

	var targets: Node = _world.get_node_or_null("WorkTargets")
	if targets:
		for target in targets.get_children():
			if target is WorkTarget:
				_work_board.register_site(target)

	_register_sources()

	var survivors: Node = _world.get_node_or_null("Survivors")
	if survivors:
		for survivor in survivors.get_children():
			if survivor is Survivor:
				var state := PersonWorkState.new(survivor.id, survivor.display_name)
				state.position = survivor.global_position
				_work_board.register_person(state, survivor)
				survivor.setup(state, _work_board)
				_work_board.give_arrival_belongings(
					survivor.id, ARRIVAL_BELONGINGS.get(survivor.id, [])
				)

## Fuentes finitas del escenario. Los valores son fijos: esta entrega no
## implementa generación procedural.
func _register_sources() -> void:
	var pond := FiniteSource.new("source.pond_fishing", "Banco de peces del estanque")
	pond.place_id = WorkBoard.POND_SITE_ID
	pond.type_id = ResourceDefinitions.TYPE_FOOD_FRESH
	pond.action_id = WorkActions.FISH_POND
	pond.total = GameConstants.POND_FISH_TOTAL
	pond.remaining = GameConstants.POND_FISH_TOTAL
	_work_board.register_source(pond)

	var forest := FiniteSource.new("source.forest_mushrooms", "Hongos del claro")
	forest.place_id = WorkBoard.FOREST_SITE_ID
	forest.type_id = ResourceDefinitions.TYPE_FOOD_FRESH
	forest.action_id = WorkActions.GATHER_MUSHROOMS
	forest.total = GameConstants.FOREST_MUSHROOM_TOTAL
	forest.remaining = GameConstants.FOREST_MUSHROOM_TOTAL
	_work_board.register_source(forest)

## Zonas territoriales, puntos de defensa, puestos de guardia y zombis
## (IMPLEMENTATION-004). Se cablea después de `_setup_work_board` porque
## reutiliza `_work_board.navigation` y el registro de personas ya hecho.
func _setup_threat_and_defense() -> void:
	_zone_overlay = ZoneOverlay.new()
	_zone_overlay.name = "ZoneOverlay"
	_world.add_child(_zone_overlay)
	_zone_overlay.set_grid(_work_board.zones)

	var defense_points: Node = _world.get_node_or_null("DefensePoints")
	if defense_points:
		for point in defense_points.get_children():
			if point is DefensePoint:
				_work_board.register_defense_point(point)

	var guard_posts: Node = _world.get_node_or_null("GuardPosts")
	if guard_posts:
		for post in guard_posts.get_children():
			if post is GuardPost:
				_work_board.register_guard_post(post)

	var zombies: Node = _world.get_node_or_null("Zombies")
	if zombies:
		for zombie in zombies.get_children():
			if zombie is ZombieAgent:
				var state := ZombieState.new()
				state.id = zombie.id
				state.display_name = zombie.display_name
				state.position = zombie.global_position
				_work_board.register_zombie(state, zombie)
				zombie.setup(state, _work_board.threat)

func _on_event_logged(_line: String) -> void:
	_hud.update_events(_work_board.event_log.recent())

func _on_threat_level_changed(_level: String) -> void:
	_hud.update_threat_level(_work_board.threat.threat_level_label())

func _on_zone_tool_toggled(active: bool) -> void:
	_selection_manager.zone_paint_active = active

func _on_zone_state_selected(state_id: String) -> void:
	_current_zone_state = state_id

func _on_zone_overlay_toggle_requested() -> void:
	_work_board.toggle_zone_overlay()
	_zone_overlay.set_shown(_work_board.zone_overlay_shown)

func _on_zone_paint_requested(from_world: Vector3, to_world: Vector3) -> void:
	_work_board.paint_zone(from_world, to_world, _current_zone_state)
	_zone_overlay.refresh()

func _on_simulation_advanced(gameplay_delta: float) -> void:
	_work_board.advance(gameplay_delta)
	_refresh_jobs_panel()
	_refresh_selection_panel()
	_hud.update_threat_level(_work_board.threat.threat_level_label())

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

## Amplía la información del `Selectable` con el estado real de trabajo,
## necesidades, carga, información del lugar y acciones disponibles.
func _build_selection_info() -> Dictionary:
	var info: Dictionary = _selected_info.duplicate()
	var entity_type := String(info.get("entity_type", ""))
	var entity_id := String(info.get("id", ""))
	info["progress"] = -1.0

	if entity_type == "person":
		var state: PersonWorkState = _work_board.get_person_state(entity_id)
		if state != null:
			info["state_text"] = "En guardia" if state.guard_post_id != "" else state.state_label()
			info["action_text"] = _work_board.describe_person_action(state)
			info["reason_text"] = state.idle_reason
			info["progress"] = _work_board.get_person_progress_ratio(state)
			info["has_direct_order"] = state.has_direct_order()
			info["load_text"] = _work_board.describe_person_load(entity_id)
			var needs: Array = []
			for line in state.needs.describe_lines():
				needs.append(line)
			info["needs"] = needs
			var skills: Array = []
			for skill_id in WorkDefinitions.SKILL_IDS:
				var level: int = state.get_skill(String(skill_id))
				skills.append({
					"name": WorkDefinitions.skill_name(String(skill_id)),
					"level": level,
					"label": WorkDefinitions.skill_level_label(level),
				})
			info["skills"] = skills
			info["health_text"] = state.condition.describe() if state.condition != null else ""
			info["decision_text"] = state.recent_decision
			var learning: Array = []
			if state.learning != null:
				for skill_id in LearningProgress.LEARNABLE_SKILLS:
					learning.append(state.learning.describe_line(skill_id, state.get_skill(skill_id)))
			info["learning"] = learning
			info["show_retreat"] = state.is_alive()
	elif entity_type == "zombie":
		var described_zombie: Dictionary = _work_board.threat.describe_zombie(entity_id)
		info["state_text"] = String(described_zombie.get("state_text", ""))
	elif entity_type == "site":
		var described: Dictionary = _work_board.describe_site(entity_id)
		info["state_text"] = String(described.get("state_text", ""))
		var info_lines: Array = []
		for line in described.get("info_lines", PackedStringArray()):
			info_lines.append(line)
		info["info_lines"] = info_lines
		info["actions"] = _work_board.describe_site_actions("", entity_id)
		info["show_haul_all"] = not _work_board.execution.sites_with_pending_stacks().is_empty()
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

func _refresh_world_panels() -> void:
	_hud.update_stored_strip(_work_board.storage.summary_line())
	_hud.update_resources(_work_board.describe_resource_rows())

func _on_priority_cycle_requested(person_id: String, family_id: String, increase: bool) -> void:
	_work_board.cycle_priority(person_id, family_id, increase)

func _on_site_action_requested(site_id: String, action_id: String) -> void:
	if site_id == "" or action_id == "":
		return
	_work_board.toggle_action(site_id, action_id)
	_refresh_selection_panel()
	_refresh_jobs_panel()

func _on_haul_all_requested() -> void:
	_work_board.designate_haul_all()
	_refresh_selection_panel()
	_refresh_jobs_panel()

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
	var site_id := String(_context_hit.get("target_id", ""))
	var parts: PackedStringArray = option_id.split("|")
	var verb: String = parts[0] if parts.size() > 0 else ""
	var argument: String = parts[1] if parts.size() > 1 else ""
	match verb:
		"move_here":
			_work_board.request_direct_move(_context_person_id, _context_hit.get("position", Vector3.ZERO))
		"attack":
			_work_board.request_attack(_context_person_id, argument)
		"direct":
			_work_board.request_direct_work(_context_person_id, site_id, argument)
		"designate":
			_work_board.designate_action(site_id, argument)
		"cancel":
			_work_board.cancel_action(site_id, argument)
		"policy":
			if argument == "water":
				_work_board.toggle_water_policy()
			else:
				_work_board.toggle_source_policy(site_id)
		"haul_all":
			_work_board.designate_haul_all()
	_refresh_selection_panel()
	_refresh_jobs_panel()
	_refresh_world_panels()
