## Objetivo de trabajo demostrador (pila de escombros o punto de
## reconocimiento). Solo representa el objetivo en el mundo: los trabajos,
## reservas y progreso los gestiona `WorkBoard`. No es un recurso ni un
## sistema de exploración (ver IMPLEMENTATION-002, sección 13).
class_name WorkTarget
extends StaticBody3D

const STATE_AVAILABLE := "available"
const STATE_DESIGNATED := "designated"
const STATE_IN_PROGRESS := "in_progress"
const STATE_COMPLETED := "completed"

const STATE_LABELS := {
	STATE_AVAILABLE: "Disponible",
	STATE_DESIGNATED: "Designado",
	STATE_IN_PROGRESS: "En curso",
	STATE_COMPLETED: "Completado",
}

const ACTION_CLEAR_RUBBLE := "clear_rubble"
const ACTION_SCOUT_POINT := "scout_point"

## Tabla estable de acciones demostrables de esta entrega.
const ACTIONS := {
	ACTION_CLEAR_RUBBLE: {
		"name": "Despejar escombros",
		"family_id": "build_repair",
		"skill_id": "construction_carpentry",
		"skill_level": 2,
		"duration": 8.0,
	},
	ACTION_SCOUT_POINT: {
		"name": "Reconocer punto",
		"family_id": "explore_recon",
		"skill_id": "observation_inspection",
		"skill_level": 2,
		"duration": 6.0,
	},
}

const PROGRESS_BAR_WIDTH := 1.6

@export var id: String = ""
@export var action_type: String = ACTION_CLEAR_RUBBLE
@export var display_name: String = ""
@export var description: String = ""

var target_state: String = STATE_AVAILABLE

@onready var _visual: Node3D = $Visual
@onready var _collision: CollisionShape3D = $CollisionShape3D
@onready var _selectable: Selectable = $Selectable
@onready var _progress: Node3D = $Progress
@onready var _progress_fill: MeshInstance3D = $Progress/Fill

var _highlight_material: StandardMaterial3D = null

func _ready() -> void:
	_build_visual()
	_progress.visible = false
	set_progress_ratio(0.0)

	_selectable.id = id
	_selectable.entity_type = "work_target"
	_selectable.display_name = display_name if display_name != "" else action_name()
	_selectable.description = description

func action_name() -> String:
	return String(_action_data().get("name", action_type))

func family_id() -> String:
	return String(_action_data().get("family_id", ""))

func required_skill_id() -> String:
	return String(_action_data().get("skill_id", ""))

func required_skill_level() -> int:
	return int(_action_data().get("skill_level", 0))

func duration() -> float:
	return float(_action_data().get("duration", 1.0))

func state_label() -> String:
	return String(STATE_LABELS.get(target_state, target_state))

func world_position() -> Vector3:
	return global_position

func is_completed() -> bool:
	return target_state == STATE_COMPLETED

func set_target_state(value: String) -> void:
	if target_state == value:
		return
	target_state = value
	_apply_state_visual()

func set_progress_visible(value: bool) -> void:
	if is_instance_valid(_progress):
		_progress.visible = value and not is_completed()

func set_progress_ratio(ratio: float) -> void:
	if not is_instance_valid(_progress_fill):
		return
	var clamped: float = clampf(ratio, 0.0, 1.0)
	_progress_fill.scale.x = maxf(clamped * PROGRESS_BAR_WIDTH, 0.001)
	_progress_fill.position.x = -PROGRESS_BAR_WIDTH * 0.5 + PROGRESS_BAR_WIDTH * clamped * 0.5

func _action_data() -> Dictionary:
	return ACTIONS.get(action_type, {})

func _apply_state_visual() -> void:
	if target_state == STATE_COMPLETED:
		if action_type == ACTION_CLEAR_RUBBLE:
			# La pila despejada desaparece del mapa.
			visible = false
		else:
			# El punto queda marcado como reconocido y deja de ofrecer trabajo.
			_tint_visual(Color(0.35, 0.72, 0.45))
		if is_instance_valid(_progress):
			_progress.visible = false
		if is_instance_valid(_collision):
			_collision.set_deferred("disabled", action_type == ACTION_CLEAR_RUBBLE)
		return

	if _highlight_material == null:
		return
	match target_state:
		STATE_DESIGNATED:
			_highlight_material.albedo_color = Color(0.95, 0.75, 0.25)
		STATE_IN_PROGRESS:
			_highlight_material.albedo_color = Color(0.95, 0.5, 0.2)
		_:
			_highlight_material.albedo_color = Color(0.6, 0.6, 0.62)

func _tint_visual(color: Color) -> void:
	if _highlight_material != null:
		_highlight_material.albedo_color = color

func _build_visual() -> void:
	for child in _visual.get_children():
		child.queue_free()

	var base_material := StandardMaterial3D.new()
	base_material.albedo_color = Color(0.45, 0.42, 0.38)

	_highlight_material = StandardMaterial3D.new()
	_highlight_material.albedo_color = Color(0.6, 0.6, 0.62)

	if action_type == ACTION_CLEAR_RUBBLE:
		_add_box(Vector3(1.5, 0.5, 1.5), Vector3(0.0, 0.25, 0.0), base_material)
		_add_box(Vector3(0.9, 0.45, 0.9), Vector3(0.25, 0.7, -0.15), _highlight_material)
		_add_box(Vector3(0.6, 0.35, 0.7), Vector3(-0.35, 0.65, 0.3), base_material)
	else:
		_add_box(Vector3(0.9, 0.15, 0.9), Vector3(0.0, 0.08, 0.0), base_material)
		_add_box(Vector3(0.14, 1.6, 0.14), Vector3(0.0, 0.9, 0.0), base_material)
		_add_box(Vector3(0.7, 0.45, 0.08), Vector3(0.0, 1.55, 0.0), _highlight_material)

	_apply_state_visual()

func _add_box(size: Vector3, offset: Vector3, material: StandardMaterial3D) -> void:
	var mesh := BoxMesh.new()
	mesh.size = size
	var instance := MeshInstance3D.new()
	instance.mesh = mesh
	instance.position = offset
	instance.material_override = material
	_visual.add_child(instance)
