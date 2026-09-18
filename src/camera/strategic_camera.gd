## Cámara estratégica cenital inclinada, controlada solo con ratón:
## botón central para desplazar, rueda para zoom suave, límites de
## mapa y zoom centralizados en GameConstants.
class_name StrategicCamera
extends Node3D

@onready var _camera: Camera3D = $Camera3D

var _dragging := false
var _last_mouse_pos := Vector2.ZERO
var _zoom := GameConstants.CAMERA_ZOOM_DEFAULT
var _target_zoom := GameConstants.CAMERA_ZOOM_DEFAULT

func _ready() -> void:
	rotation_degrees.x = GameConstants.CAMERA_PITCH_DEGREES
	position = GameConstants.SHELTER_FOCUS_POSITION
	_apply_zoom()

func get_camera() -> Camera3D:
	return _camera

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_MIDDLE and event.pressed:
			_dragging = true
			_last_mouse_pos = event.position
		elif event.button_index == MOUSE_BUTTON_WHEEL_UP and event.pressed:
			_target_zoom = clamp(_target_zoom - GameConstants.CAMERA_ZOOM_STEP, GameConstants.CAMERA_ZOOM_MIN, GameConstants.CAMERA_ZOOM_MAX)
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN and event.pressed:
			_target_zoom = clamp(_target_zoom + GameConstants.CAMERA_ZOOM_STEP, GameConstants.CAMERA_ZOOM_MIN, GameConstants.CAMERA_ZOOM_MAX)

func _input(event: InputEvent) -> void:
	# Se usa `_input` (no `_unhandled_input`) para mover/soltar el arrastre
	# ya iniciado, de forma que pasar el ratón sobre el HUD durante el
	# arrastre no lo interrumpa. El inicio del arrastre sí respeta al HUD.
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_MIDDLE and not event.pressed:
		_dragging = false
	elif event is InputEventMouseMotion and _dragging:
		var delta: Vector2 = event.position - _last_mouse_pos
		_last_mouse_pos = event.position
		_pan(delta)

func _pan(delta: Vector2) -> void:
	var right: Vector3 = global_transform.basis.x
	var forward: Vector3 = -global_transform.basis.z
	right.y = 0.0
	forward.y = 0.0
	right = right.normalized()
	forward = forward.normalized()
	var move: Vector3 = (-right * delta.x + forward * delta.y) * GameConstants.CAMERA_PAN_SPEED
	var new_pos: Vector3 = position + move
	new_pos.x = clamp(new_pos.x, GameConstants.MAP_BOUNDS_MIN.x, GameConstants.MAP_BOUNDS_MAX.x)
	new_pos.z = clamp(new_pos.z, GameConstants.MAP_BOUNDS_MIN.y, GameConstants.MAP_BOUNDS_MAX.y)
	position = new_pos

func _process(delta: float) -> void:
	if not is_equal_approx(_zoom, _target_zoom):
		_zoom = lerp(_zoom, _target_zoom, clamp(delta * GameConstants.CAMERA_ZOOM_SMOOTHING, 0.0, 1.0))
		_apply_zoom()

func _apply_zoom() -> void:
	_camera.position.z = _zoom

func center_camera() -> void:
	position = GameConstants.SHELTER_FOCUS_POSITION
