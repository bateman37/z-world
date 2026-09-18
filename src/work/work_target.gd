## Lugar del mapa sobre el que se puede trabajar y que no es un edificio:
## orilla del arroyo, estanque de pesca, claro de hongos, manantial elevado
## y emplazamiento del depósito de agua.
##
## Sustituye a los ocho objetivos demostradores de IMPLEMENTATION-002
## (pilas de escombros y puntos de reconocimiento). Solo representa el
## lugar en el mundo: la información conocida vive en `PlaceRegistry`, los
## recursos en `ResourceRegistry` y los trabajos en `WorkBoard`.
class_name WorkTarget
extends StaticBody3D

const STATE_AVAILABLE := "available"
const STATE_DESIGNATED := "designated"
const STATE_IN_PROGRESS := "in_progress"
const STATE_COMPLETED := "completed"

const STATE_LABELS := {
	STATE_AVAILABLE: "Sin trabajo designado",
	STATE_DESIGNATED: "Con trabajo designado",
	STATE_IN_PROGRESS: "Trabajo en curso",
	STATE_COMPLETED: "Sin trabajo pendiente",
}

const KIND_WATER_POINT := "water_point"
const KIND_FISHING := "fishing"
const KIND_FORAGING := "foraging"
const KIND_SPRING := "spring"
const KIND_DEPOSIT := "deposit"

const PROGRESS_BAR_WIDTH := 1.6

@export var id: String = ""
@export var site_kind: String = KIND_WATER_POINT
@export var display_name: String = ""
@export var description: String = ""

var target_state: String = STATE_AVAILABLE

@onready var _visual: Node3D = $Visual
@onready var _selectable: Selectable = $Selectable
@onready var _progress: Node3D = $Progress
@onready var _progress_fill: MeshInstance3D = $Progress/Fill

var _highlight_material: StandardMaterial3D = null

func _ready() -> void:
	_build_visual()
	_progress.visible = false
	set_progress_ratio(0.0)

	_selectable.id = id
	_selectable.entity_type = "site"
	_selectable.display_name = display_name
	_selectable.description = description

# --- Contrato de lugar de trabajo ----------------------------------------
# `Building` implementa este mismo contrato pequeño; `WorkBoard` no
# distingue entre ambos tipos de nodo.

func site_id() -> String:
	return id

func site_position() -> Vector3:
	return global_position

func site_kind_id() -> String:
	return site_kind

func site_display_name() -> String:
	return display_name

func state_label() -> String:
	return String(STATE_LABELS.get(target_state, target_state))

func set_target_state(value: String) -> void:
	if target_state == value:
		return
	target_state = value
	_apply_state_visual()

func set_progress_visible(value: bool) -> void:
	if is_instance_valid(_progress):
		_progress.visible = value

func set_progress_ratio(ratio: float) -> void:
	if not is_instance_valid(_progress_fill):
		return
	var clamped: float = clampf(ratio, 0.0, 1.0)
	_progress_fill.scale.x = maxf(clamped * PROGRESS_BAR_WIDTH, 0.001)
	_progress_fill.position.x = -PROGRESS_BAR_WIDTH * 0.5 + PROGRESS_BAR_WIDTH * clamped * 0.5

# --- Presentación ---------------------------------------------------------

func _apply_state_visual() -> void:
	if _highlight_material == null:
		return
	match target_state:
		STATE_DESIGNATED:
			_highlight_material.albedo_color = Color(0.95, 0.75, 0.25)
		STATE_IN_PROGRESS:
			_highlight_material.albedo_color = Color(0.95, 0.5, 0.2)
		_:
			_highlight_material.albedo_color = _base_highlight_color()

func _base_highlight_color() -> Color:
	match site_kind:
		KIND_FISHING:
			return Color(0.35, 0.65, 0.8)
		KIND_FORAGING:
			return Color(0.6, 0.5, 0.3)
		KIND_SPRING:
			return Color(0.55, 0.8, 0.85)
		KIND_DEPOSIT:
			return Color(0.5, 0.55, 0.62)
		_:
			return Color(0.4, 0.62, 0.72)

func _build_visual() -> void:
	for child in _visual.get_children():
		child.queue_free()

	var base_material := StandardMaterial3D.new()
	base_material.albedo_color = Color(0.45, 0.42, 0.38)

	_highlight_material = StandardMaterial3D.new()
	_highlight_material.albedo_color = _base_highlight_color()

	match site_kind:
		KIND_FISHING:
			# Pequeño pantalán sobre la orilla del estanque.
			_add_box(Vector3(2.2, 0.16, 0.9), Vector3(0.0, 0.1, 0.0), base_material)
			_add_box(Vector3(0.14, 1.2, 0.14), Vector3(-0.9, 0.6, 0.0), base_material)
			_add_box(Vector3(0.5, 0.5, 0.1), Vector3(-0.9, 1.25, 0.0), _highlight_material)
		KIND_FORAGING:
			# Tocón con hongos agrupados.
			_add_box(Vector3(1.0, 0.5, 1.0), Vector3(0.0, 0.25, 0.0), base_material)
			_add_box(Vector3(0.34, 0.34, 0.34), Vector3(0.28, 0.62, 0.2), _highlight_material)
			_add_box(Vector3(0.26, 0.26, 0.26), Vector3(-0.22, 0.6, -0.18), _highlight_material)
		KIND_SPRING:
			# Brocal de manantial elevado.
			_add_box(Vector3(1.4, 0.7, 1.4), Vector3(0.0, 0.35, 0.0), base_material)
			_add_box(Vector3(1.0, 0.22, 1.0), Vector3(0.0, 0.8, 0.0), _highlight_material)
		KIND_DEPOSIT:
			# Emplazamiento del depósito de agua junto al refugio.
			_add_box(Vector3(1.8, 0.22, 1.8), Vector3(0.0, 0.11, 0.0), base_material)
			_add_box(Vector3(1.3, 1.1, 1.3), Vector3(0.0, 0.78, 0.0), _highlight_material)
		_:
			# Punto de acarreo en la orilla del arroyo.
			_add_box(Vector3(1.6, 0.16, 1.2), Vector3(0.0, 0.1, 0.0), base_material)
			_add_box(Vector3(0.5, 0.6, 0.5), Vector3(0.35, 0.45, 0.0), _highlight_material)

	_apply_state_visual()

func _add_box(size: Vector3, offset: Vector3, material: StandardMaterial3D) -> void:
	var mesh := BoxMesh.new()
	mesh.size = size
	var instance := MeshInstance3D.new()
	instance.mesh = mesh
	instance.position = offset
	instance.material_override = material
	_visual.add_child(instance)
