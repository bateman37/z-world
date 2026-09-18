## Registro de todas las pilas de recurso de la partida y de sus
## transiciones de estado logístico. No conoce trabajos, personas ni HUD:
## solo garantiza que no se duplican ni se pierden cantidades.
class_name ResourceRegistry
extends RefCounted

var _stacks: Dictionary = {}
var _serial: int = 0

# --- Alta y baja ----------------------------------------------------------

func create_stack(
	type_id: String,
	amount: int,
	location_id: String,
	position: Vector3,
	logistics_state: String = ResourceDefinitions.LOGISTICS_AVAILABLE
) -> ResourceStack:
	if amount <= 0 or not ResourceDefinitions.TYPES.has(type_id):
		return null
	_serial += 1
	var stack := ResourceStack.new()
	stack.id = "stack.%04d" % _serial
	stack.type_id = type_id
	stack.amount = amount
	stack.location_id = location_id
	stack.position = position
	stack.logistics_state = logistics_state
	stack.condition = 100.0
	_stacks[stack.id] = stack
	return stack

func get_stack(stack_id: String) -> ResourceStack:
	return _stacks.get(stack_id, null)

func all_stacks() -> Array[ResourceStack]:
	var result: Array[ResourceStack] = []
	var ids: Array = _stacks.keys()
	ids.sort()
	for stack_id in ids:
		result.append(_stacks[stack_id])
	return result

# --- Consultas ------------------------------------------------------------

func stacks_at(location_id: String) -> Array[ResourceStack]:
	var result: Array[ResourceStack] = []
	for stack in all_stacks():
		if stack.is_active() and stack.location_id == location_id:
			result.append(stack)
	return result

func amount_in_state(type_id: String, logistics_state: String) -> int:
	var total := 0
	for stack in all_stacks():
		if stack.type_id == type_id and stack.logistics_state == logistics_state:
			total += stack.amount
	return total

func amount_at(location_id: String, type_id: String = "") -> int:
	var total := 0
	for stack in stacks_at(location_id):
		if type_id == "" or stack.type_id == type_id:
			total += stack.amount
	return total

## Totales por tipo y estado logístico para el panel «Recursos».
func totals_by_type() -> Dictionary:
	var totals := {}
	for type_id in ResourceDefinitions.TYPE_IDS:
		var row := {}
		for logistics_state in ResourceDefinitions.LOGISTICS_STATES:
			row[logistics_state] = 0
		totals[type_id] = row
	for stack in all_stacks():
		if not totals.has(stack.type_id):
			continue
		var row: Dictionary = totals[stack.type_id]
		row[stack.logistics_state] = int(row.get(stack.logistics_state, 0)) + stack.amount
	return totals

## Pilas que una persona podría recoger ahora mismo desde el terreno.
func claimable_on_ground(person_id: String) -> Array[ResourceStack]:
	var result: Array[ResourceStack] = []
	for stack in all_stacks():
		if stack.logistics_state != ResourceDefinitions.LOGISTICS_AVAILABLE:
			continue
		if not stack.is_claimable_by(person_id):
			continue
		result.append(stack)
	return result

func stored_stacks_of_type(type_id: String) -> Array[ResourceStack]:
	var result: Array[ResourceStack] = []
	for stack in all_stacks():
		if stack.type_id != type_id:
			continue
		if stack.logistics_state != ResourceDefinitions.LOGISTICS_STORED:
			continue
		if stack.reserved_by_person_id != "":
			continue
		result.append(stack)
	return result

# --- Transiciones de estado ----------------------------------------------

func reserve(stack_id: String, person_id: String) -> bool:
	var stack: ResourceStack = get_stack(stack_id)
	if stack == null or not stack.is_claimable_by(person_id):
		return false
	stack.reserved_by_person_id = person_id
	if stack.logistics_state == ResourceDefinitions.LOGISTICS_AVAILABLE:
		stack.logistics_state = ResourceDefinitions.LOGISTICS_RESERVED
	return true

## Devuelve una pila reservada a su estado anterior sin alterar la cantidad.
func release(stack_id: String) -> void:
	var stack: ResourceStack = get_stack(stack_id)
	if stack == null:
		return
	stack.reserved_by_person_id = ""
	stack.carrier_person_id = ""
	var in_flight: bool = stack.logistics_state == ResourceDefinitions.LOGISTICS_RESERVED
	in_flight = in_flight or stack.logistics_state == ResourceDefinitions.LOGISTICS_IN_TRANSPORT
	if in_flight:
		var stored_location: bool = stack.location_id == ResourceDefinitions.LOCATION_STORAGE
		stored_location = stored_location or stack.location_id == ResourceDefinitions.LOCATION_WATER_DEPOSIT
		if stored_location:
			stack.logistics_state = ResourceDefinitions.LOGISTICS_STORED
		else:
			stack.logistics_state = ResourceDefinitions.LOGISTICS_AVAILABLE

func pick_up(stack_id: String, person_id: String) -> bool:
	var stack: ResourceStack = get_stack(stack_id)
	if stack == null or not stack.is_active():
		return false
	if stack.reserved_by_person_id != "" and stack.reserved_by_person_id != person_id:
		return false
	stack.reserved_by_person_id = person_id
	stack.carrier_person_id = person_id
	stack.location_id = ResourceDefinitions.LOCATION_CARRIED
	stack.logistics_state = ResourceDefinitions.LOGISTICS_IN_TRANSPORT
	return true

func deposit(stack_id: String, location_id: String) -> bool:
	var stack: ResourceStack = get_stack(stack_id)
	if stack == null or not stack.is_active():
		return false
	stack.location_id = location_id
	stack.logistics_state = ResourceDefinitions.LOGISTICS_STORED
	stack.reserved_by_person_id = ""
	stack.carrier_person_id = ""
	return true

## Deja una pila en el suelo en una posición concreta (por ejemplo al
## cancelar un transporte a medio camino). No duplica ni pierde cantidad.
func drop(stack_id: String, location_id: String, position: Vector3) -> void:
	var stack: ResourceStack = get_stack(stack_id)
	if stack == null or not stack.is_active():
		return
	stack.location_id = location_id
	stack.position = position
	stack.logistics_state = ResourceDefinitions.LOGISTICS_AVAILABLE
	stack.reserved_by_person_id = ""
	stack.carrier_person_id = ""

## Separa `amount` unidades de una pila en otra pila nueva con la misma
## ubicación, condición y estado. La suma de ambas nunca cambia; sirve para
## respetar el tamaño máximo de lote sin duplicar ni perder recursos.
func split(stack_id: String, amount: int) -> ResourceStack:
	var stack: ResourceStack = get_stack(stack_id)
	if stack == null or amount <= 0 or amount >= stack.amount:
		return stack
	_serial += 1
	var piece := ResourceStack.new()
	piece.id = "stack.%04d" % _serial
	piece.type_id = stack.type_id
	piece.amount = amount
	piece.location_id = stack.location_id
	piece.position = stack.position
	piece.logistics_state = stack.logistics_state
	piece.condition = stack.condition
	piece.accessible = stack.accessible
	_stacks[piece.id] = piece
	stack.amount -= amount
	return piece

## Consume `amount` unidades de la pila. Devuelve lo realmente consumido.
func consume(stack_id: String, amount: int) -> int:
	var stack: ResourceStack = get_stack(stack_id)
	if stack == null or not stack.is_active() or amount <= 0:
		return 0
	var taken: int = mini(amount, stack.amount)
	stack.amount -= taken
	if stack.amount <= 0:
		stack.amount = 0
		stack.logistics_state = ResourceDefinitions.LOGISTICS_CONSUMED
		stack.reserved_by_person_id = ""
		stack.carrier_person_id = ""
	return taken

## Marca una pila como perdida (no consumida): no vuelve a estar disponible
## y no se puede recuperar.
func lose(stack_id: String) -> void:
	var stack: ResourceStack = get_stack(stack_id)
	if stack == null:
		return
	stack.logistics_state = ResourceDefinitions.LOGISTICS_LOST
	stack.reserved_by_person_id = ""
	stack.carrier_person_id = ""

## Cambia el tipo de una pila conservando su cantidad y ubicación. Se usa
## cuando el alimento fresco se echa a perder.
func transform_type(stack_id: String, new_type_id: String) -> void:
	var stack: ResourceStack = get_stack(stack_id)
	if stack == null or not ResourceDefinitions.TYPES.has(new_type_id):
		return
	stack.type_id = new_type_id
	stack.condition = 100.0
