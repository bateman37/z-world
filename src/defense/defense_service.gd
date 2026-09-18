## Coordina durabilidad, sectores y reparación de los puntos de defensa
## (IMPLEMENTATION-004, sección 6). No decide qué trabajos existen —eso
## sigue siendo `WorkBoard`/`WorkExecution`— ni ejecuta el combate: solo
## conoce el estado físico de los cuatro puntos fijos y a qué sector
## pertenecen.
class_name DefenseService
extends RefCounted

signal defense_damaged(defense_id: String, ratio: float)
signal defense_destroyed(defense_id: String)

const NOT_REGISTERED_REASON := "Primero hay que registrar el refugio y establecer el almacén"
const ALREADY_BUILT_REASON := "Este punto ya está construido"
const NOT_DAMAGED_REASON := "Esta defensa está intacta"
const DESTROYED_NEEDS_REBUILD_REASON := "La defensa está destruida: hay que reconstruirla por completo"

var storage: StorageStore = null

## {defense_id: DefensePoint}
var _points: Dictionary = {}
## IDs de defensa cuyo daño ≤ 50 % ya generó su evento/iniciativa, hasta el
## siguiente daño (sección 13: «solo un daño posterior puede volver a
## evaluarla»).
var _initiative_seen: Dictionary = {}

func register_point(node: DefensePoint) -> void:
	if node == null or node.id == "":
		return
	_points[node.id] = node

func get_point(defense_id: String) -> DefensePoint:
	return _points.get(defense_id, null)

func point_ids() -> Array[String]:
	var ids: Array[String] = []
	for defense_id in _points.keys():
		ids.append(String(defense_id))
	ids.sort()
	return ids

## Acción disponible ahora mismo para un punto de defensa según su estado
## real (sección 6.2), o "" si no es un punto de defensa conocido. `open` y
## `destroyed` ofrecen la acción inicial completa; `damaged` ofrece
## reparación; `intact` no ofrece nada (ya está construido y sano).
func available_action_for(defense_id: String) -> String:
	var point: DefensePoint = get_point(defense_id)
	if point == null:
		return ""
	match point.defense_state:
		DefensePoint.STATE_DAMAGED:
			return "repair_defense"
		DefensePoint.STATE_OPEN, DefensePoint.STATE_DESTROYED:
			return DefensePoint.initial_action_id(defense_id)
		_:
			return ""

## Motivo por el que la acción de construcción/reparación no se puede hacer
## ahora, o "" si sí se puede.
func requirement_block(action_id: String, defense_id: String) -> String:
	var point: DefensePoint = get_point(defense_id)
	if point == null:
		return "Punto de defensa desconocido"
	if storage == null or not storage.ready_for_use:
		return NOT_REGISTERED_REASON
	if action_id == "repair_defense":
		if point.defense_state == DefensePoint.STATE_DESTROYED:
			return DESTROYED_NEEDS_REBUILD_REASON
		if point.defense_state != DefensePoint.STATE_DAMAGED:
			return NOT_DAMAGED_REASON
		return ""
	# Acción inicial de construcción (reforzar/tapiar/muro).
	if point.defense_state == DefensePoint.STATE_INTACT or point.defense_state == DefensePoint.STATE_DAMAGED:
		return ALREADY_BUILT_REASON
	return ""

## Completa la construcción inicial: fija la durabilidad máxima exactamente
## una vez (sección 6.2).
func complete_construction(defense_id: String) -> void:
	var point: DefensePoint = get_point(defense_id)
	if point == null:
		return
	point.apply_state(DefensePoint.STATE_INTACT, point.max_durability_value())

func complete_repair(defense_id: String) -> float:
	var point: DefensePoint = get_point(defense_id)
	if point == null:
		return 0.0
	var max_durability: float = point.max_durability_value()
	var recovered: float = minf(DefensePoint.REPAIR_RECOVERY, max_durability - point.durability)
	var new_durability: float = point.durability + recovered
	var new_state: String = DefensePoint.STATE_INTACT if new_durability >= max_durability - 0.001 else DefensePoint.STATE_DAMAGED
	point.apply_state(new_state, new_durability)
	return recovered

## Aplica daño a una defensa (golpe de zombi). Devuelve un diccionario con lo
## que ha ocurrido para que `ThreatService`/`WorkBoard` registren sucesos e
## iniciativa: {"damaged": bool, "crossed_half": bool, "destroyed": bool}.
func apply_damage(defense_id: String, amount: float) -> Dictionary:
	var point: DefensePoint = get_point(defense_id)
	var result := {"damaged": false, "crossed_half": false, "destroyed": false}
	if point == null or point.defense_state == DefensePoint.STATE_OPEN or point.defense_state == DefensePoint.STATE_DESTROYED:
		return result
	var before: float = point.durability
	var max_durability: float = point.max_durability_value()
	var after: float = maxf(before - amount, 0.0)
	var new_state: String = DefensePoint.STATE_DAMAGED
	if after <= 0.0:
		new_state = DefensePoint.STATE_DESTROYED
	point.apply_state(new_state, after)
	result["damaged"] = true
	var half: float = max_durability * GameConstants.INITIATIVE_DAMAGE_RATIO
	if before > half and after <= half and new_state != DefensePoint.STATE_DESTROYED:
		result["crossed_half"] = true
		_initiative_seen.erase(defense_id)
	if new_state == DefensePoint.STATE_DESTROYED:
		result["destroyed"] = true
		_initiative_seen.erase(defense_id)
		defense_destroyed.emit(defense_id)
	else:
		defense_damaged.emit(defense_id, after / max_durability)
	return result

## Un punto puede evaluar la iniciativa de reparación si su vida está al
## 50 % o menos y esta caída concreta todavía no se evaluó (sección 13).
func can_evaluate_initiative(defense_id: String) -> bool:
	if _initiative_seen.get(defense_id, false):
		return false
	var point: DefensePoint = get_point(defense_id)
	if point == null or point.defense_state != DefensePoint.STATE_DAMAGED:
		return false
	return point.durability <= point.max_durability_value() * GameConstants.INITIATIVE_DAMAGE_RATIO + 0.001

func mark_initiative_evaluated(defense_id: String) -> void:
	_initiative_seen[defense_id] = true

## Punto de defensa que bloquea el sector dado (norte/sur/este/oeste), o null
## si ese sector está abierto o destruido (sección 6.2).
func blocking_point_for_sector(sector_id: String) -> DefensePoint:
	for point in _points.values():
		if point.sector_id() == sector_id and point.blocks_path():
			return point
	return null

## Sector aproximado según el ángulo de aproximación respecto al centro del
## asentamiento (sección 6.2). En este mapa +x es este, +z es norte (las
## montañas norte están en z positivo grande; el hueco norte del perímetro
## está más al norte que la puerta sur, z 12.2 frente a z 4.2).
static func sector_for_direction(direction: Vector3) -> String:
	var flat := Vector2(direction.x, direction.z)
	if flat.length_squared() < 0.0001:
		return DefensePoint.SECTOR_SOUTH
	var angle: float = flat.angle()
	if angle > -PI * 0.25 and angle <= PI * 0.25:
		return DefensePoint.SECTOR_EAST
	if angle > PI * 0.25 and angle <= PI * 0.75:
		return DefensePoint.SECTOR_NORTH
	if angle > PI * 0.75 or angle <= -PI * 0.75:
		return DefensePoint.SECTOR_WEST
	return DefensePoint.SECTOR_SOUTH
