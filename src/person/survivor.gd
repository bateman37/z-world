## Superviviente visual y actor de movimiento. No decide qué hacer: recibe
## destinos de `WorkBoard`, recorre la ruta con `NavigationAgent3D` y avisa
## al llegar o cuando el destino resulta inalcanzable. Su estado de trabajo
## vive en `PersonWorkState`, fuera de este nodo.
class_name Survivor
extends StaticBody3D

@export var id: String = ""
@export var display_name: String = ""
@export var description: String = ""
@export var accessory_color: Color = Color(0.8, 0.2, 0.2)

@onready var _accessory: MeshInstance3D = $Accessory
@onready var _selectable: Selectable = $Selectable
@onready var _agent: NavigationAgent3D = $NavigationAgent3D

var work_state: PersonWorkState = null

var _board: Node = null
var _moving: bool = false
var _destination: Vector3 = Vector3.ZERO
var _arrival_radius: float = GameConstants.MOVE_ARRIVAL_RADIUS
var _stuck_time: float = 0.0

func _ready() -> void:
	var material := StandardMaterial3D.new()
	material.albedo_color = accessory_color
	_accessory.material_override = material

	_selectable.id = id
	_selectable.entity_type = "person"
	_selectable.display_name = display_name
	_selectable.description = description

	_agent.radius = 0.35
	_agent.height = 1.7
	_agent.path_desired_distance = 0.5
	_agent.target_desired_distance = 0.5
	_agent.avoidance_enabled = false

## Cablea el estado lógico y el tablón; lo hace `Main.gd`.
func setup(state: PersonWorkState, board: Node) -> void:
	work_state = state
	_board = board
	if work_state != null:
		work_state.position = global_position

func go_to(destination: Vector3, arrival_radius: float) -> void:
	_destination = Vector3(destination.x, global_position.y, destination.z)
	_arrival_radius = arrival_radius
	_stuck_time = 0.0
	_moving = true
	_agent.target_position = _destination

func stop_moving() -> void:
	_moving = false
	_stuck_time = 0.0

func is_moving() -> bool:
	return _moving

## Avanza con el tiempo de juego (`gameplay_delta`): 0 en pausa y
## multiplicado por la velocidad activa.
func advance_simulation(gameplay_delta: float) -> void:
	if work_state != null:
		work_state.position = global_position
	if not _moving or gameplay_delta <= 0.0:
		return
	var map: RID = _agent.get_navigation_map()
	if not map.is_valid() or NavigationServer3D.map_get_iteration_id(map) == 0:
		# El mapa de navegación aún no está sincronizado: no se penaliza a
		# la persona como atascada mientras tanto.
		return

	var start_position: Vector3 = global_position
	var remaining: float = GameConstants.PERSON_MOVE_SPEED * gameplay_delta
	var steps := 0
	while remaining > 0.0 and steps < 16:
		steps += 1
		if _has_arrived():
			_finish_movement()
			return
		var next: Vector3 = _agent.get_next_path_position()
		var direction := Vector3(next.x - global_position.x, 0.0, next.z - global_position.z)
		var distance: float = direction.length()
		if distance < 0.01:
			break
		var step: float = minf(remaining, distance)
		global_position += direction / distance * step
		global_position.y = 0.0
		remaining -= step
		_face(direction, gameplay_delta)

	if _has_arrived():
		_finish_movement()
		return

	if start_position.distance_to(global_position) < 0.02:
		_stuck_time += gameplay_delta
		if _stuck_time >= GameConstants.PERSON_STUCK_SECONDS:
			_moving = false
			_stuck_time = 0.0
			if _board != null and _board.has_method("notify_unreachable"):
				_board.notify_unreachable(id)
	else:
		_stuck_time = 0.0

func _has_arrived() -> bool:
	var flat_self := Vector3(global_position.x, 0.0, global_position.z)
	var flat_target := Vector3(_destination.x, 0.0, _destination.z)
	if flat_self.distance_to(flat_target) <= _arrival_radius:
		return true
	return _agent.is_navigation_finished()

func _finish_movement() -> void:
	_moving = false
	_stuck_time = 0.0
	if work_state != null:
		work_state.position = global_position
	if _board != null and _board.has_method("notify_arrived"):
		_board.notify_arrived(id)

func _face(direction: Vector3, gameplay_delta: float) -> void:
	if direction.length_squared() < 0.0001:
		return
	var target_yaw: float = atan2(direction.x, direction.z)
	var weight: float = clampf(gameplay_delta * GameConstants.PERSON_TURN_SPEED, 0.0, 1.0)
	rotation.y = lerp_angle(rotation.y, target_yaw, weight)
