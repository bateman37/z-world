## Consultas de ruta para el selector de trabajos. Aísla `NavigationServer3D`
## del tablón para que la lógica de elección pueda probarse sin un mapa de
## navegación sincronizado.
class_name NavigationService
extends RefCounted

## Margen admitido entre el final de la ruta y el destino pedido antes de
## considerar el objetivo inalcanzable.
const REACH_TOLERANCE := 2.0

var map_rid: RID = RID()

func set_map(rid: RID) -> void:
	map_rid = rid

func _map_ready() -> bool:
	if not map_rid.is_valid():
		return false
	return NavigationServer3D.map_get_iteration_id(map_rid) > 0

## Devuelve {"reachable": bool, "length": float}. Si el mapa de navegación
## todavía no está sincronizado (por ejemplo en el smoke test headless), se
## usa la distancia en línea recta y no se bloquea ningún trabajo por ruta.
func query(from: Vector3, to: Vector3) -> Dictionary:
	var straight: float = Vector3(from.x, 0.0, from.z).distance_to(Vector3(to.x, 0.0, to.z))
	if not _map_ready():
		return {"reachable": true, "length": straight}
	var path: PackedVector3Array = NavigationServer3D.map_get_path(map_rid, from, to, true)
	if path.size() < 2:
		return {"reachable": false, "length": straight}
	var length := 0.0
	for i in range(1, path.size()):
		length += path[i - 1].distance_to(path[i])
	var last: Vector3 = path[path.size() - 1]
	var reachable: bool = Vector3(last.x, 0.0, last.z).distance_to(Vector3(to.x, 0.0, to.z)) <= REACH_TOLERANCE
	return {"reachable": reachable, "length": length}

func is_reachable(from: Vector3, to: Vector3) -> bool:
	return bool(query(from, to).get("reachable", false))
