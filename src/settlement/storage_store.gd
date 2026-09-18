## Almacén de la comunidad y depósito de agua localizado. No guarda una
## copia de las cantidades: las lee del `ResourceRegistry`, de forma que
## nunca puede desincronizarse de las pilas reales (SET-003, sección 2).
##
## El almacén y el depósito solo existen después de registrar el refugio
## candidato; antes de eso, cualquier transporte queda bloqueado con un
## motivo explícito.
class_name StorageStore
extends RefCounted

const NOT_READY_REASON := "Todavía no hay almacén: registra antes el refugio candidato"
const FULL_REASON := "El almacén está lleno"
const DEPOSIT_FULL_REASON := "El depósito de agua está lleno"

var resources: ResourceRegistry = null
## Falso hasta que el refugio candidato queda registrado.
var ready_for_use: bool = false
## Posición del almacén y del depósito en el mundo.
var storage_position: Vector3 = Vector3.ZERO
var deposit_position: Vector3 = Vector3.ZERO
## Plazas de descanso acondicionadas en el refugio (0 hasta acondicionarlo).
var rest_places: int = 0

func _init(p_resources: ResourceRegistry = null) -> void:
	resources = p_resources

func establish(p_storage_position: Vector3, p_deposit_position: Vector3) -> void:
	ready_for_use = true
	storage_position = p_storage_position
	deposit_position = p_deposit_position

func has_rest_place() -> bool:
	return rest_places > 0

# --- Capacidad ------------------------------------------------------------

func stored_total() -> int:
	if resources == null:
		return 0
	return resources.amount_at(ResourceDefinitions.LOCATION_STORAGE)

func free_space() -> int:
	return maxi(GameConstants.STORAGE_CAPACITY - stored_total(), 0)

func water_total() -> int:
	if resources == null:
		return 0
	return resources.amount_at(ResourceDefinitions.LOCATION_WATER_DEPOSIT)

func water_free_space() -> int:
	return maxi(GameConstants.WATER_DEPOSIT_CAPACITY - water_total(), 0)

## Espacio libre en el contenedor que corresponde a este tipo.
func free_space_for(type_id: String) -> int:
	if ResourceDefinitions.uses_water_deposit(type_id):
		return water_free_space()
	return free_space()

func full_reason_for(type_id: String) -> String:
	if ResourceDefinitions.uses_water_deposit(type_id):
		return DEPOSIT_FULL_REASON
	return FULL_REASON

func position_for(type_id: String) -> Vector3:
	if ResourceDefinitions.uses_water_deposit(type_id):
		return deposit_position
	return storage_position

# --- Contenido ------------------------------------------------------------

## Cantidades almacenadas por tipo, incluidos los ceros, en el orden
## estable del catálogo. Se usa para la franja del HUD.
func stored_by_type() -> Dictionary:
	var totals := {}
	for type_id in ResourceDefinitions.TYPE_IDS:
		totals[type_id] = 0
	if resources == null:
		return totals
	for stack in resources.all_stacks():
		if stack.logistics_state != ResourceDefinitions.LOGISTICS_STORED:
			continue
		if not totals.has(stack.type_id):
			continue
		totals[stack.type_id] = int(totals[stack.type_id]) + stack.amount
	return totals

## Suma almacenada de un tipo concreto (almacén o depósito, según el tipo).
func stored_amount(type_id: String) -> int:
	return int(stored_by_type().get(type_id, 0))

## Texto de la franja superior del HUD.
func summary_line() -> String:
	if not ready_for_use:
		return "Almacén: sin establecer · Depósito de agua: sin establecer"
	var parts := PackedStringArray()
	var totals: Dictionary = stored_by_type()
	for type_id in ResourceDefinitions.TYPE_IDS:
		var amount: int = int(totals.get(type_id, 0))
		if amount <= 0:
			continue
		parts.append("%s %d" % [ResourceDefinitions.type_name(String(type_id)), amount])
	var body: String = " · ".join(parts) if not parts.is_empty() else "vacío"
	return "Almacenado (%d/%d) · Agua en depósito (%d/%d) · %s" % [
		stored_total(), GameConstants.STORAGE_CAPACITY,
		water_total(), GameConstants.WATER_DEPOSIT_CAPACITY,
		body,
	]
