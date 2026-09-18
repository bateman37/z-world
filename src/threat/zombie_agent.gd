## Actor visual y de movimiento de un zombi. Simétrico a `Survivor`: no
## decide nada por sí mismo, solo recorre el destino que le manda
## `ThreatService` y avisa al llegar. Su estado lógico vive en `ZombieState`.
class_name ZombieAgent
extends StaticBody3D

@export var id: String = ""
@export var display_name: String = ""

@onready var _visual: Node3D = $Visual
@onready var _selectable: Selectable = $Selectable
@onready var _agent: NavigationAgent3D = $NavigationAgent3D

var zombie_state: ZombieState = null
var _threat: Node = null

var _moving: bool = false
var _destination: Vector3 = Vector3.ZERO
var _arrival_radius: float = 1.0
var _stuck_time: float = 0.0

func _ready() -> void:
	_selectable.id = id
	_selectable.entity_type = "zombie"
	_selectable.display_name = display_name
	_selectable.description = "Zombi lento de la población local. Silueta humanoide verdosa/gris, distinguible de una persona."
	_build_visual()

	_agent.radius = 0.35
	_agent.height = 1.8
	_agent.path_desired_distance = 0.5
	_agent.target_desired_distance = 0.5
	_agent.avoidance_enabled = false

func setup(state: ZombieState, threat: Node) -> void:
	zombie_state = state
	_threat = threat
	if zombie_state != null:
		zombie_state.position = global_position

func go_to(destination: Vector3, arrival_radius: float = 1.0) -> void:
	_destination = Vector3(destination.x, global_position.y, destination.z)
	_arrival_radius = arrival_radius
	_stuck_time = 0.0
	_moving = true
	_agent.target_position = _destination

func stop_moving() -> void:
	_moving = false
	_stuck_time = 0.0

## Avanza con `gameplay_delta`: 0 en pausa, multiplicado por la velocidad.
func advance_simulation(gameplay_delta: float) -> void:
	if zombie_state != null:
		zombie_state.position = global_position
	if not zombie_state.is_alive():
		return
	if not _moving or gameplay_delta <= 0.0:
		return
	var map: RID = _agent.get_navigation_map()
	if not map.is_valid() or NavigationServer3D.map_get_iteration_id(map) == 0:
		return

	var remaining: float = GameConstants.ZOMBIE_SPEED * gameplay_delta
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
		_face(direction)

	if _has_arrived():
		_finish_movement()
		return

func _has_arrived() -> bool:
	var flat_self := Vector3(global_position.x, 0.0, global_position.z)
	var flat_target := Vector3(_destination.x, 0.0, _destination.z)
	if flat_self.distance_to(flat_target) <= _arrival_radius:
		return true
	return _agent.is_navigation_finished()

func _finish_movement() -> void:
	_moving = false
	if zombie_state != null:
		zombie_state.position = global_position
	if _threat != null and _threat.has_method("notify_zombie_arrived"):
		_threat.notify_zombie_arrived(id)

func _face(direction: Vector3) -> void:
	if direction.length_squared() < 0.0001:
		return
	rotation.y = atan2(direction.x, direction.z)

func mark_dead() -> void:
	_moving = false
	for child in _visual.get_children():
		if child is MeshInstance3D and child.material_override is StandardMaterial3D:
			var material: StandardMaterial3D = child.material_override
			material.albedo_color = Color(0.18, 0.16, 0.14)
	rotation_degrees.x = 82.0
	position.y = -0.35

func _build_visual() -> void:
	for child in _visual.get_children():
		child.queue_free()
	var skin := StandardMaterial3D.new()
	skin.albedo_color = Color(0.42, 0.5, 0.38)
	var torso := MeshInstance3D.new()
	var torso_mesh := CapsuleMesh.new()
	torso_mesh.radius = 0.32
	torso_mesh.height = 1.1
	torso.mesh = torso_mesh
	torso.position = Vector3(0.0, 0.85, 0.0)
	torso.material_override = skin
	_visual.add_child(torso)
	var head := MeshInstance3D.new()
	var head_mesh := SphereMesh.new()
	head_mesh.radius = 0.22
	head_mesh.height = 0.44
	head.mesh = head_mesh
	head.position = Vector3(0.0, 1.55, 0.0)
	var head_material := StandardMaterial3D.new()
	head_material.albedo_color = Color(0.5, 0.58, 0.4)
	head.material_override = head_material
	_visual.add_child(head)
