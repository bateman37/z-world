## Selección con clic izquierdo mediante raycast contra la cámara
## estratégica. No se dispara sobre botones del HUD porque estos
## consumen el evento antes de que llegue a `_unhandled_input`.
class_name SelectionManager
extends Node

signal selection_changed(info: Dictionary)
signal selection_cleared()

var camera: Camera3D
var ray_length: float = 200.0

var _current: Selectable = null

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		_select_at(event.position)

func _select_at(screen_pos: Vector2) -> void:
	if camera == null:
		return
	var origin: Vector3 = camera.project_ray_origin(screen_pos)
	var direction: Vector3 = camera.project_ray_normal(screen_pos)
	var space_state := camera.get_world_3d().direct_space_state
	var query := PhysicsRayQueryParameters3D.create(origin, origin + direction * ray_length)
	var result := space_state.intersect_ray(query)

	var selectable: Selectable = null
	if not result.is_empty():
		var collider = result.get("collider")
		if collider:
			selectable = collider.get_node_or_null("Selectable")
	_set_current(selectable)

func _set_current(selectable: Selectable) -> void:
	if selectable == _current:
		return
	if _current:
		_current.set_selected(false)
	_current = selectable
	if _current:
		_current.set_selected(true)
		selection_changed.emit(_current.get_info())
	else:
		selection_cleared.emit()
