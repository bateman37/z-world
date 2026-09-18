## Representación visual de la rejilla de zonas territoriales. Un `MultiMesh`
## por estado evita cientos de nodos independientes (sección 5.3). No
## bloquea raycasts ni navegación: son `MeshInstance3D` puros, unos
## centímetros sobre el terreno.
class_name ZoneOverlay
extends Node3D

const OVERLAY_HEIGHT := 0.08

var grid: ZoneGrid = null

var _multi_meshes: Dictionary = {}
var _dirty: bool = true

func _ready() -> void:
	for state_id in ZoneDefinitions.STATE_IDS:
		var instance := MultiMeshInstance3D.new()
		var multi_mesh := MultiMesh.new()
		multi_mesh.transform_format = MultiMesh.TRANSFORM_3D
		var quad := QuadMesh.new()
		quad.size = Vector2(GameConstants.ZONE_CELL_SIZE * 0.92, GameConstants.ZONE_CELL_SIZE * 0.92)
		# Tumbado sobre el terreno, mirando hacia arriba.
		quad.orientation = PlaneMesh.FACE_Y
		multi_mesh.mesh = quad
		var material := StandardMaterial3D.new()
		var color: Color = ZoneDefinitions.state_color(state_id)
		color.a = 0.35
		material.albedo_color = color
		material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		material.cull_mode = BaseMaterial3D.CULL_DISABLED
		instance.material_override = material
		instance.multimesh = multi_mesh
		instance.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		# No participa en física: es una capa puramente informativa.
		add_child(instance)
		_multi_meshes[state_id] = instance

func set_grid(new_grid: ZoneGrid) -> void:
	if grid != null and grid.cell_changed.is_connected(_on_cell_changed):
		grid.cell_changed.disconnect(_on_cell_changed)
	grid = new_grid
	if grid != null:
		grid.cell_changed.connect(_on_cell_changed)
	_dirty = true
	_rebuild()

func _on_cell_changed(_cell: Vector2i, _state_id: String) -> void:
	_dirty = true

## Se llama tras cada trazo de pintura, en lugar de reconstruir por celda:
## un arrastre puede cambiar muchas celdas en el mismo fotograma.
func refresh() -> void:
	_dirty = true
	_rebuild()

func _rebuild() -> void:
	if not _dirty or grid == null:
		return
	_dirty = false
	var by_state: Dictionary = {}
	for state_id in ZoneDefinitions.STATE_IDS:
		by_state[state_id] = []
	for ix in range(grid.cols()):
		for iz in range(grid.rows()):
			var coord := Vector2i(ix, iz)
			var state_id: String = grid.state_at_cell(coord)
			by_state[state_id].append(grid.cell_center(coord))
	for state_id in ZoneDefinitions.STATE_IDS:
		var instance: MultiMeshInstance3D = _multi_meshes[state_id]
		var centers: Array = by_state[state_id]
		var multi_mesh: MultiMesh = instance.multimesh
		multi_mesh.instance_count = centers.size()
		for i in range(centers.size()):
			var center: Vector3 = centers[i]
			var xform := Transform3D(Basis(), Vector3(center.x, OVERLAY_HEIGHT, center.z))
			multi_mesh.set_instance_transform(i, xform)

func set_shown(value: bool) -> void:
	visible = value
