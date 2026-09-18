## Edificio seleccionable con geometría provisional (primitivas).
## Cada instancia se dimensiona y colorea desde propiedades exportadas
## en lugar de duplicar mallas por edificio.
class_name Building
extends StaticBody3D

@export var id: String = ""
@export var display_name: String = ""
@export var description: String = ""
@export var body_size: Vector3 = Vector3(4.0, 3.0, 4.0)
@export var body_color: Color = Color(0.75, 0.68, 0.55)
@export var roof_color: Color = Color(0.45, 0.22, 0.18)
## Verdadero solo en los edificios que esta entrega hace explorables
## (refugio candidato, Casa 1 y taller). El resto sigue siendo decorado
## seleccionable sin acciones.
@export var explorable: bool = false

## Estado de trabajo visible en el panel de selección.
var target_state: String = WorkTarget.STATE_AVAILABLE

@onready var _body: MeshInstance3D = $Body
@onready var _roof: MeshInstance3D = $Roof
@onready var _collision: CollisionShape3D = $CollisionShape3D
@onready var _ring: MeshInstance3D = $SelectionRing
@onready var _selectable: Selectable = $Selectable

func _ready() -> void:
	# Se crean recursos nuevos en lugar de mutar los definidos en la
	# escena, que se comparten entre todas las instancias de Building.tscn.
	var body_mesh := BoxMesh.new()
	body_mesh.size = body_size
	_body.mesh = body_mesh
	_body.position.y = body_size.y * 0.5

	var body_material := StandardMaterial3D.new()
	body_material.albedo_color = body_color
	_body.material_override = body_material

	var roof_mesh := BoxMesh.new()
	roof_mesh.size = Vector3(body_size.x * 1.05, body_size.y * 0.2, body_size.z * 1.05)
	_roof.mesh = roof_mesh
	_roof.position.y = body_size.y + roof_mesh.size.y * 0.5

	var roof_material := StandardMaterial3D.new()
	roof_material.albedo_color = roof_color
	_roof.material_override = roof_material

	var shape := BoxShape3D.new()
	shape.size = body_size
	_collision.shape = shape
	_collision.position.y = body_size.y * 0.5

	_ring.scale = Vector3(body_size.x * 0.35, 1.0, body_size.z * 0.35)

	_selectable.id = id
	_selectable.entity_type = "site" if explorable else "building"
	_selectable.display_name = display_name
	_selectable.description = description

# --- Contrato de lugar de trabajo ----------------------------------------
# Idéntico al de `WorkTarget`, para que `WorkBoard` no distinga entre un
# edificio explorable y un lugar del terreno.

func site_id() -> String:
	return id

## Las personas trabajan delante del edificio, no dentro de su volumen.
func site_position() -> Vector3:
	return global_position + Vector3(0.0, 0.0, -(body_size.z * 0.5 + 1.4))

func site_kind_id() -> String:
	return "building"

func site_display_name() -> String:
	return display_name

func state_label() -> String:
	return String(WorkTarget.STATE_LABELS.get(target_state, target_state))

func set_target_state(value: String) -> void:
	target_state = value
