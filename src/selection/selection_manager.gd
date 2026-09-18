## Selección con clic izquierdo mediante raycast contra la cámara
## estratégica. No se dispara sobre botones del HUD porque estos
## consumen el evento antes de que llegue a `_unhandled_input`.
class_name SelectionManager
extends Node

signal selection_changed(info: Dictionary)
signal selection_cleared()
## Clic derecho sobre el mundo. No cambia la selección: solo informa de qué
## hay bajo el cursor para que `Main.gd` ofrezca acciones contextuales.
signal context_menu_requested(hit: Dictionary, screen_position: Vector2)

var camera: Camera3D
var ray_length: float = 200.0

var _current: Selectable = null

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_LEFT:
			_select_at(event.position)
		elif event.button_index == MOUSE_BUTTON_RIGHT:
			context_menu_requested.emit(_raycast_world(event.position), event.position)

func get_current_info() -> Dictionary:
	if _current == null:
		return {}
	return _current.get_info()

## Describe qué hay bajo el cursor: terreno transitable, objetivo de trabajo
## u otra entidad (en cuyo caso no se ofrecen acciones contextuales).
func _raycast_world(screen_pos: Vector2) -> Dictionary:
	var hit := {"kind": "none", "position": Vector3.ZERO, "target_id": ""}
	if camera == null:
		return hit
	var result: Dictionary = _raycast(screen_pos)
	if result.is_empty():
		return hit
	hit["position"] = result.get("position", Vector3.ZERO)
	var collider = result.get("collider")
	if collider == null:
		return hit
	var selectable: Selectable = collider.get_node_or_null("Selectable")
	if selectable == null:
		hit["kind"] = "terrain"
		return hit
	if selectable.entity_type == "work_target":
		hit["kind"] = "work_target"
		hit["target_id"] = selectable.id
		return hit
	hit["kind"] = "other"
	return hit

func _raycast(screen_pos: Vector2) -> Dictionary:
	var origin: Vector3 = camera.project_ray_origin(screen_pos)
	var direction: Vector3 = camera.project_ray_normal(screen_pos)
	var space_state := camera.get_world_3d().direct_space_state
	var query := PhysicsRayQueryParameters3D.create(origin, origin + direction * ray_length)
	return space_state.intersect_ray(query)

func _select_at(screen_pos: Vector2) -> void:
	if camera == null:
		return
	var result: Dictionary = _raycast(screen_pos)

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
