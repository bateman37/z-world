## Modelo de datos de la rejilla de zonas territoriales, independiente de su
## representación visual (`ZoneOverlay`). IMPLEMENTATION-004, sección 5.1.
##
## La rejilla es cuadrada de `GameConstants.ZONE_CELL_SIZE` metros dentro de
## `GameConstants.MAP_BOUNDS_MIN`/`MAP_BOUNDS_MAX`. Por defecto toda celda es
## `caution`; el rectángulo habitual inicial se aplica una sola vez al crear
## la rejilla.
class_name ZoneGrid
extends RefCounted

signal cell_changed(cell: Vector2i, state_id: String)

var _cells: Dictionary = {}
var _cols: int = 0
var _rows: int = 0

func _init() -> void:
	var cell: float = GameConstants.ZONE_CELL_SIZE
	_cols = int(ceil((GameConstants.MAP_BOUNDS_MAX.x - GameConstants.MAP_BOUNDS_MIN.x) / cell))
	_rows = int(ceil((GameConstants.MAP_BOUNDS_MAX.y - GameConstants.MAP_BOUNDS_MIN.y) / cell))
	for ix in range(_cols):
		for iz in range(_rows):
			var coord := Vector2i(ix, iz)
			_cells[coord] = ZoneDefinitions.STATE_CAUTION if not _in_initial_habitual(coord) else ZoneDefinitions.STATE_HABITUAL

func cols() -> int:
	return _cols

func rows() -> int:
	return _rows

## Centro en el mundo de una celda de la rejilla.
func cell_center(coord: Vector2i) -> Vector3:
	var cell: float = GameConstants.ZONE_CELL_SIZE
	var x: float = GameConstants.MAP_BOUNDS_MIN.x + (float(coord.x) + 0.5) * cell
	var z: float = GameConstants.MAP_BOUNDS_MIN.y + (float(coord.y) + 0.5) * cell
	return Vector3(x, 0.0, z)

func world_to_cell(world_position: Vector3) -> Vector2i:
	var cell: float = GameConstants.ZONE_CELL_SIZE
	var ix: int = int(floor((world_position.x - GameConstants.MAP_BOUNDS_MIN.x) / cell))
	var iz: int = int(floor((world_position.z - GameConstants.MAP_BOUNDS_MIN.y) / cell))
	return Vector2i(clampi(ix, 0, _cols - 1), clampi(iz, 0, _rows - 1))

func _in_initial_habitual(coord: Vector2i) -> bool:
	var center: Vector3 = cell_center(coord)
	return (
		center.x >= ZoneDefinitions.INITIAL_HABITUAL_MIN.x and center.x <= ZoneDefinitions.INITIAL_HABITUAL_MAX.x
		and center.z >= ZoneDefinitions.INITIAL_HABITUAL_MIN.y and center.z <= ZoneDefinitions.INITIAL_HABITUAL_MAX.y
	)

func is_valid_cell(coord: Vector2i) -> bool:
	return coord.x >= 0 and coord.x < _cols and coord.y >= 0 and coord.y < _rows

func state_at_cell(coord: Vector2i) -> String:
	return String(_cells.get(coord, ZoneDefinitions.STATE_CAUTION))

func state_at(world_position: Vector3) -> String:
	return state_at_cell(world_to_cell(world_position))

## Pinta una celda concreta. Devuelve verdadero si algo cambió.
func paint_cell(coord: Vector2i, state_id: String) -> bool:
	if not is_valid_cell(coord) or not ZoneDefinitions.STATE_IDS.has(state_id):
		return false
	if state_at_cell(coord) == state_id:
		return false
	_cells[coord] = state_id
	cell_changed.emit(coord, state_id)
	return true

func paint_world(world_position: Vector3, state_id: String) -> bool:
	return paint_cell(world_to_cell(world_position), state_id)

## Pinta un trazo continuo entre dos puntos del mundo, muestreando cada
## fracción de celda para no dejar huecos aunque el ratón se mueva rápido en
## un solo fotograma (sección 5.1). Devuelve las celdas realmente cambiadas.
func paint_stroke(from_world: Vector3, to_world: Vector3, state_id: String) -> Array[Vector2i]:
	var changed: Array[Vector2i] = []
	var distance: float = Vector2(from_world.x, from_world.z).distance_to(Vector2(to_world.x, to_world.z))
	var step: float = GameConstants.ZONE_CELL_SIZE * 0.5
	var steps: int = maxi(1, int(ceil(distance / step)))
	for i in range(steps + 1):
		var t: float = float(i) / float(steps)
		var point: Vector3 = from_world.lerp(to_world, t)
		var coord: Vector2i = world_to_cell(point)
		if paint_cell(coord, state_id) and not changed.has(coord):
			changed.append(coord)
	return changed

## Comprueba si el segmento cruza alguna celda `forbidden`, muestreando cada
## metro como mucho (sección 5.2). Incluye ambos extremos salvo que
## `skip_start` pida ignorar el punto de partida (una persona que ya está
## dentro de una celda prohibida debe poder salir de ella; sección 5.2).
func segment_crosses_forbidden(from_world: Vector3, to_world: Vector3, skip_start: bool = false) -> bool:
	var distance: float = Vector2(from_world.x, from_world.z).distance_to(Vector2(to_world.x, to_world.z))
	var steps: int = maxi(1, int(ceil(distance / 1.0)))
	for i in range(steps + 1):
		if i == 0 and skip_start:
			continue
		var t: float = float(i) / float(steps)
		var point: Vector3 = from_world.lerp(to_world, t)
		if state_at(point) == ZoneDefinitions.STATE_FORBIDDEN:
			return true
	return false

## Comprueba una ruta completa (lista de puntos consecutivos) por segmentos.
## El primer punto de toda la ruta (la posición actual de quien se mueve) no
## se cuenta por sí solo: si ya está dentro de una celda prohibida, la regla
## nunca debe atraparla; el resto de la ruta sigue comprobándose entera.
func path_crosses_forbidden(points: PackedVector3Array) -> bool:
	if points.size() < 2:
		return false
	if segment_crosses_forbidden(points[0], points[1], true):
		return true
	for i in range(2, points.size()):
		if segment_crosses_forbidden(points[i - 1], points[i]):
			return true
	return false

## Celda `habitual` accesible más cercana a un punto del mundo, por distancia
## en anillos crecientes. Sirve para que una persona atrapada en una zona
## recién prohibida siempre tenga una salida (sección 5.2).
func nearest_habitual_world(world_position: Vector3) -> Vector3:
	var origin: Vector2i = world_to_cell(world_position)
	if state_at_cell(origin) == ZoneDefinitions.STATE_HABITUAL:
		return world_position
	var max_radius: int = maxi(_cols, _rows)
	for radius in range(1, max_radius + 1):
		var best: Vector2i = origin
		var best_found := false
		var best_distance := INF
		for dx in range(-radius, radius + 1):
			for dz in range(-radius, radius + 1):
				if maxi(absi(dx), absi(dz)) != radius:
					continue
				var coord := Vector2i(origin.x + dx, origin.y + dz)
				if not is_valid_cell(coord):
					continue
				if state_at_cell(coord) != ZoneDefinitions.STATE_HABITUAL:
					continue
				var candidate_distance: float = Vector2(dx, dz).length()
				if candidate_distance < best_distance:
					best_distance = candidate_distance
					best = coord
					best_found = true
		if best_found:
			return cell_center(best)
	return world_position
