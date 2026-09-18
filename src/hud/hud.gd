## HUD mínimo. No conoce reloj, cámara, selección ni tablón de trabajos
## directamente: emite señales de intención y expone funciones `update_*`
## para que Main.gd conecte cada sistema sin acoplar el HUD a ellos.
class_name HUD
extends CanvasLayer

signal pause_pressed()
signal speed_selected(multiplier: float)
signal center_camera_requested()
signal priority_cycle_requested(person_id: String, family_id: String, increase: bool)
## Designa o cancela una acción concreta sobre un lugar desde el panel de
## selección.
signal site_action_requested(site_id: String, action_id: String)
signal haul_all_requested()
signal cancel_direct_order_requested(person_id: String)
signal context_option_chosen(option_id: String)

const PRIORITY_COLORS := [
	Color(0.62, 0.62, 0.66),
	Color(0.45, 0.62, 0.85),
	Color(0.85, 0.85, 0.85),
	Color(0.95, 0.78, 0.35),
	Color(0.5, 0.88, 0.55),
]

@onready var _clock_label: Label = %ClockLabel
@onready var _pause_button: Button = %PauseButton
@onready var _speed_x1: Button = %SpeedX1Button
@onready var _speed_x2: Button = %SpeedX2Button
@onready var _speed_x4: Button = %SpeedX4Button
@onready var _speed_x10: Button = %SpeedX10Button
@onready var _center_button: Button = %CenterCameraButton
@onready var _priorities_button: Button = %PrioritiesButton
@onready var _jobs_button: Button = %JobsButton
@onready var _resources_button: Button = %ResourcesButton
@onready var _stored_strip: Label = %StoredStripLabel

@onready var _selection_id: Label = %SelectionIdValue
@onready var _selection_type: Label = %SelectionTypeValue
@onready var _selection_name: Label = %SelectionNameValue
@onready var _selection_description: Label = %SelectionDescriptionValue
@onready var _selection_state_row: HBoxContainer = %SelectionStateRow
@onready var _selection_state: Label = %SelectionStateValue
@onready var _selection_action_row: HBoxContainer = %SelectionActionRow
@onready var _selection_action: Label = %SelectionActionValue
@onready var _selection_reason_row: HBoxContainer = %SelectionReasonRow
@onready var _selection_reason: Label = %SelectionReasonValue
@onready var _selection_progress_row: HBoxContainer = %SelectionProgressRow
@onready var _selection_progress: Label = %SelectionProgressValue
@onready var _skills_title: Label = %SelectionSkillsTitle
@onready var _skills_list: Label = %SelectionSkillsList
@onready var _needs_title: Label = %SelectionNeedsTitle
@onready var _needs_list: Label = %SelectionNeedsList
@onready var _load_row: HBoxContainer = %SelectionLoadRow
@onready var _load_value: Label = %SelectionLoadValue
@onready var _info_list: Label = %SelectionInfoList
@onready var _actions_title: Label = %SelectionActionsTitle
@onready var _actions_box: VBoxContainer = %SelectionActionsBox
@onready var _haul_all_button: Button = %HaulAllButton
@onready var _cancel_direct_order_button: Button = %CancelDirectOrderButton

@onready var _priorities_panel: Panel = %PrioritiesPanel
@onready var _priorities_grid: GridContainer = %PrioritiesGrid
@onready var _jobs_panel: Panel = %JobsPanel
@onready var _jobs_list: Label = %JobsListLabel
@onready var _completed_list: Label = %CompletedListLabel
@onready var _resources_panel: Panel = %ResourcesPanel
@onready var _resources_list: Label = %ResourcesListLabel
@onready var _context_menu: ContextMenu = %ContextMenu

var _priority_cells: Dictionary = {}
var _selected_target_id: String = ""
var _selected_person_id: String = ""

func _ready() -> void:
	_pause_button.pressed.connect(func() -> void: pause_pressed.emit())
	_speed_x1.pressed.connect(func() -> void: speed_selected.emit(1.0))
	_speed_x2.pressed.connect(func() -> void: speed_selected.emit(2.0))
	_speed_x4.pressed.connect(func() -> void: speed_selected.emit(4.0))
	_speed_x10.pressed.connect(func() -> void: speed_selected.emit(10.0))
	_center_button.pressed.connect(func() -> void: center_camera_requested.emit())
	_priorities_button.pressed.connect(_toggle_priorities_panel)
	_jobs_button.pressed.connect(_toggle_jobs_panel)
	_resources_button.pressed.connect(_toggle_resources_panel)
	_haul_all_button.pressed.connect(func() -> void: haul_all_requested.emit())
	_cancel_direct_order_button.pressed.connect(func() -> void: cancel_direct_order_requested.emit(_selected_person_id))
	_context_menu.option_chosen.connect(func(option_id: String) -> void: context_option_chosen.emit(option_id))
	_priorities_panel.visible = false
	_jobs_panel.visible = false
	_resources_panel.visible = false
	clear_selection()

# --- Reloj y velocidades --------------------------------------------------

func update_clock(day: int, hour: int, minute: int) -> void:
	_clock_label.text = "Día %d, %02d:%02d" % [day, hour, minute]

func update_speed_state(paused: bool, multiplier: float) -> void:
	_pause_button.button_pressed = paused
	_speed_x1.button_pressed = not paused and is_equal_approx(multiplier, 1.0)
	_speed_x2.button_pressed = not paused and is_equal_approx(multiplier, 2.0)
	_speed_x4.button_pressed = not paused and is_equal_approx(multiplier, 4.0)
	_speed_x10.button_pressed = not paused and is_equal_approx(multiplier, 10.0)

# --- Selección ------------------------------------------------------------

func update_stored_strip(text: String) -> void:
	_stored_strip.text = text

func update_resources(rows: Array) -> void:
	var lines := PackedStringArray()
	for row in rows:
		lines.append("%s — total %d · %s" % [
			String(row.get("name", "")), int(row.get("total", 0)), String(row.get("detail", "")),
		])
	_resources_list.text = "\n".join(lines) if not lines.is_empty() else "Sin recursos conocidos."

func update_selection(info: Dictionary) -> void:
	var entity_type := String(info.get("entity_type", ""))
	_selected_target_id = String(info.get("id", "")) if entity_type == "site" else ""
	_selected_person_id = String(info.get("id", "")) if entity_type == "person" else ""

	_selection_id.text = String(info.get("id", ""))
	_selection_type.text = _entity_type_label(entity_type)
	_selection_name.text = String(info.get("display_name", ""))
	_selection_description.text = String(info.get("description", ""))

	var state_text := String(info.get("state_text", ""))
	_selection_state_row.visible = state_text != ""
	_selection_state.text = state_text

	var action_text := String(info.get("action_text", ""))
	_selection_action_row.visible = action_text != ""
	_selection_action.text = action_text

	var reason_text := String(info.get("reason_text", ""))
	_selection_reason_row.visible = reason_text != ""
	_selection_reason.text = reason_text

	var progress: float = float(info.get("progress", -1.0))
	_selection_progress_row.visible = progress >= 0.0
	_selection_progress.text = "%d %%" % int(round(progress * 100.0))

	var skills: Array = info.get("skills", [])
	_skills_title.visible = not skills.is_empty()
	_skills_list.visible = not skills.is_empty()
	if not skills.is_empty():
		var lines := PackedStringArray()
		for skill in skills:
			lines.append("%s: %d (%s)" % [
				String(skill.get("name", "")),
				int(skill.get("level", 0)),
				String(skill.get("label", "")),
			])
		_skills_list.text = "\n".join(lines)

	var needs: Array = info.get("needs", [])
	_needs_title.visible = not needs.is_empty()
	_needs_list.visible = not needs.is_empty()
	if not needs.is_empty():
		_needs_list.text = "\n".join(PackedStringArray(needs))

	var load_text := String(info.get("load_text", ""))
	_load_row.visible = load_text != ""
	_load_value.text = load_text

	var info_lines: Array = info.get("info_lines", [])
	_info_list.visible = not info_lines.is_empty()
	if not info_lines.is_empty():
		_info_list.text = "\n".join(PackedStringArray(info_lines))

	_build_action_buttons(String(info.get("id", "")), info.get("actions", []))
	_haul_all_button.visible = bool(info.get("show_haul_all", false))

	_cancel_direct_order_button.visible = bool(info.get("has_direct_order", false))

## `actions` es [{action_id, label, enabled, reason, designated}].
func _build_action_buttons(site_id: String, actions: Array) -> void:
	for child in _actions_box.get_children():
		child.queue_free()
	_actions_title.visible = not actions.is_empty()
	_actions_box.visible = not actions.is_empty()
	for action in actions:
		var action_id := String(action.get("action_id", ""))
		var designated: bool = bool(action.get("designated", false))
		var reason := String(action.get("reason", ""))
		var enabled: bool = bool(action.get("enabled", false))
		var button := Button.new()
		button.alignment = HORIZONTAL_ALIGNMENT_LEFT
		button.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		button.custom_minimum_size = Vector2(300, 0)
		if designated:
			button.text = "Cancelar designación: %s" % String(action.get("label", ""))
		elif enabled or reason == "":
			button.text = "Designar: %s" % String(action.get("label", ""))
		else:
			button.text = "Designar: %s — %s" % [String(action.get("label", "")), reason]
		var family := String(action.get("family", ""))
		if reason != "":
			button.tooltip_text = "%s · %s" % [family, reason]
		else:
			button.tooltip_text = family
		button.pressed.connect(func() -> void: site_action_requested.emit(site_id, action_id))
		_actions_box.add_child(button)

func clear_selection() -> void:
	_selected_target_id = ""
	_selected_person_id = ""
	_selection_id.text = "—"
	_selection_type.text = "—"
	_selection_name.text = "—"
	_selection_description.text = "Nada seleccionado todavía."
	_selection_state_row.visible = false
	_selection_action_row.visible = false
	_selection_reason_row.visible = false
	_selection_progress_row.visible = false
	_skills_title.visible = false
	_skills_list.visible = false
	_needs_title.visible = false
	_needs_list.visible = false
	_load_row.visible = false
	_info_list.visible = false
	_actions_title.visible = false
	_actions_box.visible = false
	_haul_all_button.visible = false
	_cancel_direct_order_button.visible = false
	for child in _actions_box.get_children():
		child.queue_free()

func _entity_type_label(entity_type: String) -> String:
	match entity_type:
		"person":
			return "Persona"
		"building":
			return "Edificio"
		"site":
			return "Lugar"
		_:
			return "—"

# --- Paneles grandes ------------------------------------------------------

func _toggle_priorities_panel() -> void:
	_show_only_panel(_priorities_panel)

func _toggle_jobs_panel() -> void:
	_show_only_panel(_jobs_panel)

func _toggle_resources_panel() -> void:
	_show_only_panel(_resources_panel)

## Solo hay un panel grande abierto a la vez.
func _show_only_panel(panel: Panel) -> void:
	var opening: bool = not panel.visible
	_priorities_panel.visible = false
	_jobs_panel.visible = false
	_resources_panel.visible = false
	panel.visible = opening
	_priorities_button.button_pressed = _priorities_panel.visible
	_jobs_button.button_pressed = _jobs_panel.visible
	_resources_button.button_pressed = _resources_panel.visible

## `persons` es [{id, display_name}]. Construye la matriz una sola vez.
func build_priorities_matrix(persons: Array) -> void:
	for child in _priorities_grid.get_children():
		child.queue_free()
	_priority_cells.clear()
	_priorities_grid.columns = persons.size() + 1

	var corner := Label.new()
	corner.text = "Familia de trabajo"
	corner.custom_minimum_size = Vector2(260, 0)
	_priorities_grid.add_child(corner)
	for person in persons:
		var header := Label.new()
		var person_name := String(person.get("display_name", ""))
		header.text = person_name.replace("Superviviente ", "Sup. ")
		header.tooltip_text = person_name
		header.custom_minimum_size = Vector2(72, 0)
		header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		_priorities_grid.add_child(header)

	for family_id in WorkDefinitions.PRIORITY_FAMILY_IDS:
		var family_label := Label.new()
		family_label.text = WorkDefinitions.family_name(family_id)
		family_label.custom_minimum_size = Vector2(260, 0)
		_priorities_grid.add_child(family_label)
		for person in persons:
			var person_id := String(person.get("id", ""))
			var cell := Button.new()
			cell.custom_minimum_size = Vector2(72, 30)
			cell.focus_mode = Control.FOCUS_NONE
			cell.text = "2"
			cell.gui_input.connect(_on_priority_cell_input.bind(person_id, String(family_id), cell))
			_priorities_grid.add_child(cell)
			_priority_cells["%s|%s" % [person_id, family_id]] = cell

## `persons` es [{id, display_name, priorities}].
func update_priorities(persons: Array) -> void:
	for person in persons:
		var person_id := String(person.get("id", ""))
		var person_name := String(person.get("display_name", ""))
		var priorities: Dictionary = person.get("priorities", {})
		for family_id in WorkDefinitions.PRIORITY_FAMILY_IDS:
			var cell: Button = _priority_cells.get("%s|%s" % [person_id, family_id], null)
			if cell == null:
				continue
			var value: int = int(priorities.get(family_id, 0))
			cell.text = str(value)
			cell.add_theme_color_override("font_color", PRIORITY_COLORS[clampi(value, 0, 4)])
			cell.tooltip_text = "%s · %s · prioridad %d" % [
				person_name, WorkDefinitions.family_name(family_id), value,
			]

func _on_priority_cell_input(event: InputEvent, person_id: String, family_id: String, cell: Button) -> void:
	if not (event is InputEventMouseButton) or not event.pressed:
		return
	if event.button_index == MOUSE_BUTTON_LEFT:
		priority_cycle_requested.emit(person_id, family_id, true)
		cell.accept_event()
	elif event.button_index == MOUSE_BUTTON_RIGHT:
		priority_cycle_requested.emit(person_id, family_id, false)
		cell.accept_event()

func update_jobs(active_lines: PackedStringArray, completed_lines: PackedStringArray) -> void:
	_jobs_list.text = "\n".join(active_lines) if not active_lines.is_empty() else "No hay trabajos designados."
	_completed_list.text = "\n".join(completed_lines) if not completed_lines.is_empty() else "Todavía no se ha completado ningún trabajo."

# --- Menú contextual ------------------------------------------------------

func show_context_menu(options: Array, screen_position: Vector2, title: String = "") -> void:
	_context_menu.open(options, screen_position, title)

func hide_context_menu() -> void:
	_context_menu.close()
