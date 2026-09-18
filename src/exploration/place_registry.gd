## Registro de la información conocida sobre los lugares del mapa local.
## Es el único lugar donde sube el nivel de información y donde el
## contenido fijo se convierte en pilas reales.
class_name PlaceRegistry
extends RefCounted

var _places: Dictionary = {}
var _order: Array[String] = []

func register(place_id: String, display_name: String, position: Vector3, level: String = PlaceDefinitions.LEVEL_SIGHTED) -> PlaceInfo:
	if place_id == "":
		return null
	if _places.has(place_id):
		return _places[place_id]
	var place := PlaceInfo.new(place_id, display_name)
	place.position = position
	place.level = level
	_places[place_id] = place
	_order.append(place_id)
	_order.sort()
	return place

func get_place(place_id: String) -> PlaceInfo:
	return _places.get(place_id, null)

func place_ids() -> Array[String]:
	return _order.duplicate()

func all_places() -> Array[PlaceInfo]:
	var result: Array[PlaceInfo] = []
	for place_id in _order:
		result.append(_places[place_id])
	return result

## Observar: revela indicios y deja el lugar en nivel «observado».
func observe(place_id: String) -> bool:
	var place: PlaceInfo = get_place(place_id)
	if place == null:
		return false
	place.notes = PlaceDefinitions.observed_note(place_id)
	return place.raise_level(PlaceDefinitions.LEVEL_OBSERVED)

## Inspeccionar: deja el lugar en nivel «inspeccionado» y materializa su
## contenido fijo una sola vez.
func inspect(place_id: String, resources: ResourceRegistry) -> bool:
	var place: PlaceInfo = get_place(place_id)
	if place == null:
		return false
	if place.notes == "":
		place.notes = PlaceDefinitions.observed_note(place_id)
	var raised: bool = place.raise_level(PlaceDefinitions.LEVEL_INSPECTED)
	materialize(place_id, resources)
	return raised

## Registrar: deja el lugar en nivel «aprovechado». Vuelve a intentar la
## materialización por si se llegó aquí por una vía distinta; la operación
## es idempotente.
func exploit(place_id: String, resources: ResourceRegistry) -> bool:
	var place: PlaceInfo = get_place(place_id)
	if place == null:
		return false
	materialize(place_id, resources)
	return place.raise_level(PlaceDefinitions.LEVEL_EXPLOITED)

## Convierte el contenido fijo del lugar en pilas disponibles. Solo puede
## ocurrir una vez por lugar: repetir la llamada no duplica nada.
func materialize(place_id: String, resources: ResourceRegistry) -> int:
	var place: PlaceInfo = get_place(place_id)
	if place == null or resources == null:
		return 0
	if place.content_materialized:
		return 0
	place.content_materialized = true
	var created := 0
	for entry in PlaceDefinitions.content_for(place_id):
		var stack: ResourceStack = resources.create_stack(
			String(entry.get("type_id", "")),
			int(entry.get("amount", 0)),
			place_id,
			place.position,
			ResourceDefinitions.LOGISTICS_AVAILABLE
		)
		if stack != null:
			place.materialized_stack_ids.append(stack.id)
			created += 1
	return created

## Cuántas unidades del contenido materializado siguen sin recoger.
func pending_amount(place_id: String, resources: ResourceRegistry) -> int:
	if resources == null:
		return 0
	var total := 0
	for stack in resources.stacks_at(place_id):
		var pending: bool = stack.logistics_state == ResourceDefinitions.LOGISTICS_AVAILABLE
		pending = pending or stack.logistics_state == ResourceDefinitions.LOGISTICS_RESERVED
		if pending:
			total += stack.amount
	return total
