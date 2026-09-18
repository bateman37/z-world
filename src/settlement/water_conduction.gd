## Conducción de agua por gravedad desde un manantial elevado (SET-003,
## sección 4). Es la segunda ruta de agua, distinta del acarreo: cuesta
## reconocimiento, materiales y trabajo, pero después produce sin ocupar a
## nadie.
##
## No implementa electricidad, bombas ni potabilización: quedan fuera del
## alcance de IMPLEMENTATION-003.
class_name WaterConduction
extends RefCounted

const STATE_UNPLANNED := "unplanned"
const STATE_PLANNED := "planned"
const STATE_BUILT := "built"

const STATE_LABELS := {
	STATE_UNPLANNED: "Sin planificar",
	STATE_PLANNED: "Planificada, pendiente de construir",
	STATE_BUILT: "Construida y produciendo",
}

## Materiales que consume la construcción, una sola vez.
const BUILD_COST := {
	ResourceDefinitions.TYPE_WOOD_PLANKS: 4,
	ResourceDefinitions.TYPE_REPAIR_MATERIALS: 2,
}

var state: String = STATE_UNPLANNED
## Garantiza que los materiales se consumen exactamente una vez.
var materials_consumed: bool = false

var _accumulator: float = 0.0
var produced_total: int = 0

func state_label() -> String:
	return String(STATE_LABELS.get(state, state))

func is_planned() -> bool:
	return state == STATE_PLANNED or state == STATE_BUILT

func is_built() -> bool:
	return state == STATE_BUILT

func plan() -> bool:
	if state != STATE_UNPLANNED:
		return false
	state = STATE_PLANNED
	return true

## Marca la conducción como construida. El consumo de materiales lo hace
## `WorkExecution` con las pilas realmente reservadas; aquí solo se registra
## que ya ocurrió, para que no pueda repetirse.
func mark_built() -> bool:
	if state != STATE_PLANNED or materials_consumed:
		return false
	state = STATE_BUILT
	materials_consumed = true
	_accumulator = 0.0
	return true

## Produce una unidad de agua cada `CONDUCTION_SECONDS_PER_WATER` segundos
## observables a ×1, y nunca por encima de la capacidad del depósito.
## Devuelve las unidades añadidas en esta llamada.
func advance(gameplay_delta: float, storage: StorageStore, resources: ResourceRegistry) -> int:
	if not is_built() or gameplay_delta <= 0.0 or storage == null or resources == null:
		return 0
	if not storage.ready_for_use:
		return 0
	_accumulator += gameplay_delta
	var units: int = int(floor(_accumulator / GameConstants.CONDUCTION_SECONDS_PER_WATER))
	if units <= 0:
		return 0
	_accumulator -= float(units) * GameConstants.CONDUCTION_SECONDS_PER_WATER
	var room: int = storage.water_free_space()
	units = mini(units, room)
	if units <= 0:
		# El depósito está lleno: la conducción no acumula excedente.
		_accumulator = 0.0
		return 0
	resources.create_stack(
		ResourceDefinitions.TYPE_WATER,
		units,
		ResourceDefinitions.LOCATION_WATER_DEPOSIT,
		storage.deposit_position,
		ResourceDefinitions.LOGISTICS_STORED
	)
	produced_total += units
	return units
