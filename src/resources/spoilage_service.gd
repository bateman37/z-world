## Condición y conservación (SET-003, sección 3.3). Único lugar donde el
## alimento fresco pierde condición y donde se decide su transformación en
## alimento echado a perder. No conoce trabajos ni personas.
##
## Las curvas exactas siguen abiertas en SET-003; los valores de esta
## entrega son los aprobados en IMPLEMENTATION-003, sección 10.
class_name SpoilageService
extends RefCounted

var resources: ResourceRegistry = null

func _init(p_resources: ResourceRegistry = null) -> void:
	resources = p_resources

## Puntos de condición por día simulado según dónde esté la pila.
static func decay_per_day(stack: ResourceStack) -> float:
	match stack.logistics_state:
		ResourceDefinitions.LOGISTICS_STORED:
			return GameConstants.FOOD_DECAY_STORED_PER_DAY
		ResourceDefinitions.LOGISTICS_IN_TRANSPORT:
			return GameConstants.FOOD_DECAY_TRANSPORT_PER_DAY
		_:
			return GameConstants.FOOD_DECAY_GROUND_PER_DAY

## Avanza el deterioro. `gameplay_delta` son segundos observables a ×1.
## Devuelve la lista de ids de pila que se han transformado en esta llamada.
func advance(gameplay_delta: float) -> Array[String]:
	var transformed: Array[String] = []
	if resources == null or gameplay_delta <= 0.0:
		return transformed
	var days: float = gameplay_delta / GameConstants.SIM_DAY_IN_GAMEPLAY_SECONDS
	for stack in resources.all_stacks():
		if not stack.is_active() or not stack.is_perishable():
			continue
		stack.condition = maxf(stack.condition - decay_per_day(stack) * days, 0.0)
		if stack.condition <= 0.0:
			# La transformación ocurre una sola vez: la pila deja de ser
			# perecedera al cambiar de tipo.
			resources.transform_type(stack.id, ResourceDefinitions.TYPE_FOOD_SPOILED)
			transformed.append(stack.id)
	return transformed

## Secado: `DRYING_INPUT_AMOUNT` unidades de alimento fresco almacenado
## producen `DRYING_OUTPUT_AMOUNT` de alimento conservado almacenado.
## Devuelve true solo si había material suficiente y se ejecutó una vez.
func dry_stored_food() -> bool:
	if resources == null:
		return false
	if available_fresh_for_drying() < GameConstants.DRYING_INPUT_AMOUNT:
		return false
	var remaining: int = GameConstants.DRYING_INPUT_AMOUNT
	for stack in resources.stored_stacks_of_type(ResourceDefinitions.TYPE_FOOD_FRESH):
		if remaining <= 0:
			break
		remaining -= resources.consume(stack.id, remaining)
	if remaining > 0:
		return false
	resources.create_stack(
		ResourceDefinitions.TYPE_FOOD_PRESERVED,
		GameConstants.DRYING_OUTPUT_AMOUNT,
		ResourceDefinitions.LOCATION_STORAGE,
		Vector3.ZERO,
		ResourceDefinitions.LOGISTICS_STORED
	)
	return true

func available_fresh_for_drying() -> int:
	if resources == null:
		return 0
	var total := 0
	for stack in resources.stored_stacks_of_type(ResourceDefinitions.TYPE_FOOD_FRESH):
		total += stack.amount
	return total
