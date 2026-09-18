## Puesto de guardia seleccionable (IMPLEMENTATION-004, sección 10.1).
## Implementa el mismo contrato pequeño de lugar de trabajo que
## `WorkTarget`/`Building`/`DefensePoint`.
class_name GuardPost
extends StaticBody3D

const ID_SOUTH := "guard.post.south"
const ID_EAST := "guard.post.east"

const POSTS := {
	ID_SOUTH: {"name": "Puesto de guardia sur", "position": Vector3(0.0, 0.0, 0.0)},
	ID_EAST: {"name": "Puesto de guardia este", "position": Vector3(8.0, 0.0, 8.0)},
}

@export var id: String = ""

var occupied: bool = false

@onready var _visual: Node3D = $Visual
@onready var _selectable: Selectable = $Selectable

var _marker_material: StandardMaterial3D = null

func _ready() -> void:
	var info: Dictionary = POSTS.get(id, {})
	_selectable.id = id
	_selectable.entity_type = "site"
	_selectable.display_name = String(info.get("name", id))
	_selectable.description = "Puesto de guardia. Designar «Vigilar acceso» mantiene a la persona en guardia hasta cancelar, retirarse o morir."
	_build_visual()

func site_id() -> String:
	return id

func site_position() -> Vector3:
	return global_position

func site_kind_id() -> String:
	return "guard_post"

func site_display_name() -> String:
	return String(POSTS.get(id, {}).get("name", id))

func set_target_state(_value: String) -> void:
	pass

func set_progress_visible(_value: bool) -> void:
	pass

func set_progress_ratio(_value: float) -> void:
	pass

func set_guard_active(active: bool) -> void:
	occupied = active
	if _marker_material != null:
		_marker_material.albedo_color = Color(0.9, 0.35, 0.2) if active else Color(0.35, 0.55, 0.85)

func _build_visual() -> void:
	var post_material := StandardMaterial3D.new()
	post_material.albedo_color = Color(0.35, 0.3, 0.25)
	var post := MeshInstance3D.new()
	var post_mesh := CylinderMesh.new()
	post_mesh.top_radius = 0.08
	post_mesh.bottom_radius = 0.1
	post_mesh.height = 1.4
	post.mesh = post_mesh
	post.position = Vector3(0.0, 0.7, 0.0)
	post.material_override = post_material
	_visual.add_child(post)

	_marker_material = StandardMaterial3D.new()
	_marker_material.albedo_color = Color(0.35, 0.55, 0.85)
	var marker := MeshInstance3D.new()
	var marker_mesh := BoxMesh.new()
	marker_mesh.size = Vector3(0.4, 0.4, 0.06)
	marker.mesh = marker_mesh
	marker.position = Vector3(0.0, 1.3, 0.0)
	marker.material_override = _marker_material
	marker.name = "Marker"
	_visual.add_child(marker)
