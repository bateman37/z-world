## Consultas de ruta para el selector de trabajos. Aísla `NavigationServer3D`
## del tablón para que la lógica de elección pueda probarse sin un mapa de
## navegación sincronizado.
class_name NavigationService
extends RefCounted

## Margen admitido entre el final de la ruta y el destino pedido antes de
## considerar el objetivo inalcanzable.
const REACH_TOLERANCE := 2.0

var map_rid: RID = RID()

## Rejilla de zonas territoriales (IMPLEMENTATION-004, sección 5.2). Puede
## quedar sin asignar (por ejemplo en pruebas antiguas): sin rejilla, ninguna
## ruta se bloquea por zona.
var zones: ZoneGrid = null

func set_map(rid: RID) -> void:
	map_rid = rid

func _map_ready() -> bool:
	if not map_rid.is_valid():
		return false
	return NavigationServer3D.map_get_iteration_id(map_rid) > 0

## Devuelve {"reachable": bool, "length": float, "blocked_by_zone": bool}.
## Si el mapa de navegación todavía no está sincronizado (por ejemplo en el
## smoke test headless), se usa la distancia en línea recta y no se bloquea
## ningún trabajo por ruta física; la comprobación de zona sigue aplicando.
##
## `ignore_zone` se usa para la orden puntual de movimiento a precaución y
## para la excepción de la sección 14.2: es una intervención explícita, así
## que la ruta no se rechaza solo por cruzar `forbidden`, aunque el llamador
## sigue pudiendo decidir qué hacer con `blocked_by_zone`.
func query(from: Vector3, to: Vector3, ignore_zone: bool = false) -> Dictionary:
	var straight: float = Vector3(from.x, 0.0, from.z).distance_to(Vector3(to.x, 0.0, to.z))
	var path: PackedVector3Array
	var reachable: bool
	var length: float
	if not _map_ready():
		path = PackedVector3Array([from, to])
		reachable = true
		length = straight
	else:
		path = NavigationServer3D.map_get_path(map_rid, from, to, true)
		if path.size() < 2:
			return {"reachable": false, "length": straight, "blocked_by_zone": false}
		length = 0.0
		for i in range(1, path.size()):
			length += path[i - 1].distance_to(path[i])
		var last: Vector3 = path[path.size() - 1]
		reachable = Vector3(last.x, 0.0, last.z).distance_to(Vector3(to.x, 0.0, to.z)) <= REACH_TOLERANCE
	var blocked_by_zone := false
	if zones != null:
		blocked_by_zone = zones.path_crosses_forbidden(path)
		if blocked_by_zone and not ignore_zone:
			reachable = false
	return {"reachable": reachable, "length": length, "blocked_by_zone": blocked_by_zone}

func is_reachable(from: Vector3, to: Vector3) -> bool:
	return bool(query(from, to).get("reachable", false))

## Motivo operativo de ruta física o de zona, o "" si la ruta es viable.
func route_block_reason(from: Vector3, to: Vector3, ignore_zone: bool = false) -> String:
	var result: Dictionary = query(from, to, ignore_zone)
	if bool(result.get("blocked_by_zone", false)) and not ignore_zone:
		return ZoneDefinitions.BLOCK_FORBIDDEN
	if not bool(result.get("reachable", false)):
		return "Objetivo sin ruta disponible"
	return ""
