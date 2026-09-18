## Construye en código la malla de navegación del mapa local al cargar la
## escena: Dennis no tiene que hornear nada a mano en el editor.
##
## En lugar de rasterizar la geometría con el horneador (que dependería de
## colisionadores y dejaría fuera el agua, que solo es una malla), se genera
## una rejilla determinista sobre el terreno útil y se descartan las celdas
## que invaden edificios, agua, arbolado o la base transitable de las
## montañas. El resultado es reproducible y no atraviesa esos elementos.
class_name NavigationBuilder
extends NavigationRegion3D

const NAV_HEIGHT := 0.05

var _obstacle_rects: Array[Rect2] = []
var _obstacle_circles: Array = []
var _vertices: PackedVector3Array = PackedVector3Array()
var _vertex_cache: Dictionary = {}

func _ready() -> void:
	navigation_mesh = build_navigation_mesh()

func build_navigation_mesh() -> NavigationMesh:
	_collect_obstacles()
	var cell: float = GameConstants.NAV_CELL_SIZE
	var min_x: float = GameConstants.MAP_BOUNDS_MIN.x
	var min_z: float = GameConstants.MAP_BOUNDS_MIN.y
	var cells_x: int = int(floor((GameConstants.MAP_BOUNDS_MAX.x - min_x) / cell))
	var cells_z: int = int(floor((GameConstants.MAP_BOUNDS_MAX.y - min_z) / cell))

	_vertices = PackedVector3Array()
	_vertex_cache = {}
	var polygons: Array = []

	for ix in range(cells_x):
		for iz in range(cells_z):
			var rect := Rect2(min_x + ix * cell, min_z + iz * cell, cell, cell)
			if _is_blocked(rect):
				continue
			var a: int = _vertex_index(ix, iz, min_x, min_z, cell)
			var b: int = _vertex_index(ix + 1, iz, min_x, min_z, cell)
			var c: int = _vertex_index(ix + 1, iz + 1, min_x, min_z, cell)
			var d: int = _vertex_index(ix, iz + 1, min_x, min_z, cell)
			polygons.append(PackedInt32Array([a, b, c, d]))

	var mesh := NavigationMesh.new()
	mesh.vertices = _vertices
	for polygon in polygons:
		mesh.add_polygon(polygon)
	return mesh

func _vertex_index(ix: int, iz: int, min_x: float, min_z: float, cell: float) -> int:
	var key := Vector2i(ix, iz)
	if _vertex_cache.has(key):
		return int(_vertex_cache[key])
	var index: int = _vertices.size()
	_vertices.append(Vector3(min_x + ix * cell, NAV_HEIGHT, min_z + iz * cell))
	_vertex_cache[key] = index
	return index

func _is_blocked(cell_rect: Rect2) -> bool:
	for rect in _obstacle_rects:
		if rect.intersects(cell_rect):
			return true
	var center: Vector2 = cell_rect.get_center()
	var cell_radius: float = cell_rect.size.length() * 0.5
	for circle in _obstacle_circles:
		if center.distance_to(circle["center"]) <= float(circle["radius"]) + cell_radius:
			return true
	return false

func _collect_obstacles() -> void:
	_obstacle_rects = []
	_obstacle_circles = []
	var clearance: float = GameConstants.NAV_AGENT_CLEARANCE
	var world: Node = get_parent()
	if world == null:
		return

	var buildings: Node = world.get_node_or_null("Buildings")
	if buildings:
		for building in buildings.get_children():
			if building is Node3D and "body_size" in building:
				var size: Vector3 = building.body_size
				_add_rect(building.global_position, Vector2(size.x, size.z), clearance)

	var water: Node = world.get_node_or_null("Water")
	if water:
		for surface in water.get_children():
			if surface is MeshInstance3D and surface.mesh != null:
				var aabb: AABB = surface.mesh.get_aabb()
				_add_rect(surface.global_position, Vector2(aabb.size.x, aabb.size.z), clearance)

	var forest: Node = world.get_node_or_null("Forest")
	if forest:
		for tree in forest.get_children():
			if tree is Node3D:
				_obstacle_circles.append({
					"center": Vector2(tree.global_position.x, tree.global_position.z),
					"radius": GameConstants.NAV_TREE_RADIUS + clearance,
				})

	var mountains: Node = world.get_node_or_null("Mountains")
	if mountains:
		for mountain in mountains.get_children():
			if mountain is Node3D:
				# La base transitable de un cono es menor que su radio total:
				# solo se descarta su parte baja para no recortar el pueblo.
				var radius: float = mountain.scale.x * GameConstants.NAV_MOUNTAIN_FOOTPRINT
				_obstacle_circles.append({
					"center": Vector2(mountain.global_position.x, mountain.global_position.z),
					"radius": radius + clearance,
				})

func _add_rect(center: Vector3, size: Vector2, clearance: float) -> void:
	var half: Vector2 = size * 0.5 + Vector2(clearance, clearance)
	_obstacle_rects.append(Rect2(center.x - half.x, center.z - half.y, half.x * 2.0, half.y * 2.0))
