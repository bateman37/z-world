## Ejecución de trabajo por fases: comprueba los requisitos materiales de
## cada acción, reserva las pilas concretas que va a usar y aplica su
## efecto una sola vez al completarse.
##
## `WorkBoard` sigue siendo el único que decide quién hace qué; este módulo
## solo sabe qué cambia en el mundo cuando un trabajo termina. No es un
## framework de recetas: la tabla de acciones es fija y pequeña
## (`WorkActions`).
class_name WorkExecution
extends RefCounted

const REASON_NEEDS_STORAGE := StorageStore.NOT_READY_REASON
const REASON_NOTHING_TO_HAUL := "No hay nada accesible que transportar aquí"
const REASON_NO_CONTAINER := "No hay ningún recipiente de agua disponible"
const REASON_DEPOSIT_FULL := StorageStore.DEPOSIT_FULL_REASON
const REASON_STORAGE_FULL := StorageStore.FULL_REASON
const REASON_ALREADY_PLANNED := "La conducción ya está planificada"
const REASON_NEEDS_PLAN := "Primero hay que planificar la conducción en el manantial elevado"
const REASON_ALREADY_BUILT := "La conducción por gravedad ya está construida"
const REASON_NO_MATERIALS := "Faltan materiales almacenados: %s"
const REASON_NOT_ENOUGH_FRESH := "Hacen falta %d de alimento fresco almacenado para secar"
const REASON_REST_AREA_DONE := "La zona de descanso ya está acondicionada"
const REASON_NO_WATER := "No queda agua en el depósito"
const REASON_NO_FOOD := "No queda alimento comestible almacenado"
const REASON_NO_REST_PLACE := "No hay zona de descanso acondicionada"
const REASON_LEVEL := "Información insuficiente del lugar: hace falta «%s»"
const REASON_NOTHING_MORE := "Este lugar ya está registrado por completo"

## Materiales que consume acondicionar la zona de descanso.
const REST_AREA_COST := {
	ResourceDefinitions.TYPE_CLOTH: 2,
}

var places: PlaceRegistry = null
var resources: ResourceRegistry = null
var storage: StorageStore = null
var spoilage: SpoilageService = null
var conduction: WaterConduction = null
## {source_id: FiniteSource}
var sources: Dictionary = {}
## {site_id: source_id}
var sources_by_site: Dictionary = {}

func _init(
	p_places: PlaceRegistry = null,
	p_resources: ResourceRegistry = null,
	p_storage: StorageStore = null,
	p_spoilage: SpoilageService = null,
	p_conduction: WaterConduction = null
) -> void:
	places = p_places
	resources = p_resources
	storage = p_storage
	spoilage = p_spoilage
	conduction = p_conduction

func register_source(source: FiniteSource) -> void:
	if source == null or source.id == "":
		return
	sources[source.id] = source
	sources_by_site[source.place_id] = source.id

func source_for_site(site_id: String) -> FiniteSource:
	var source_id: String = String(sources_by_site.get(site_id, ""))
	return sources.get(source_id, null)

# --- Requisitos -----------------------------------------------------------

## Motivo operativo por el que la acción no se puede hacer ahora en ese
## lugar, o "" si sí se puede. No comprueba habilidad, prioridad ni ruta:
## de eso se ocupa `WorkBoard`.
func requirement_block(action_id: String, site_id: String) -> String:
	var level_reason: String = _level_block(action_id, site_id)
	if level_reason != "":
		return level_reason
	match action_id:
		WorkActions.OBSERVE_PLACE:
			return _already_reason(site_id, PlaceDefinitions.LEVEL_OBSERVED)
		WorkActions.INSPECT_PLACE:
			return _already_reason(site_id, PlaceDefinitions.LEVEL_INSPECTED)
		WorkActions.REGISTER_PLACE:
			return _already_reason(site_id, PlaceDefinitions.LEVEL_EXPLOITED)
		WorkActions.HAUL_STORAGE:
			return _haul_block(site_id)
		WorkActions.FETCH_WATER:
			return _fetch_water_block()
		WorkActions.PLAN_CONDUCTION:
			if conduction == null:
				return REASON_ALREADY_PLANNED
			return REASON_ALREADY_PLANNED if conduction.is_planned() else ""
		WorkActions.BUILD_CONDUCTION:
			return _build_conduction_block()
		WorkActions.FISH_POND, WorkActions.GATHER_MUSHROOMS:
			var source: FiniteSource = source_for_site(site_id)
			if source == null:
				return FiniteSource.REASON_NOT_RECOGNISED
			return source.block_reason()
		WorkActions.DRY_FOOD:
			if storage == null or not storage.ready_for_use:
				return REASON_NEEDS_STORAGE
			if spoilage == null or spoilage.available_fresh_for_drying() < GameConstants.DRYING_INPUT_AMOUNT:
				return REASON_NOT_ENOUGH_FRESH % GameConstants.DRYING_INPUT_AMOUNT
			return ""
		WorkActions.PREPARE_REST_AREA:
			if storage == null or not storage.ready_for_use:
				return REASON_NEEDS_STORAGE
			if storage.has_rest_place():
				return REASON_REST_AREA_DONE
			return _materials_block(REST_AREA_COST)
		WorkActions.DRINK:
			if storage == null or storage.water_total() <= 0:
				return REASON_NO_WATER
			return ""
		WorkActions.EAT:
			return "" if _find_edible_stack() != null else REASON_NO_FOOD
		WorkActions.REST:
			if storage == null or not storage.has_rest_place():
				return REASON_NO_REST_PLACE
			return ""
	return ""

func _level_block(action_id: String, site_id: String) -> String:
	var required: String = WorkActions.required_level(action_id)
	if required == "":
		return ""
	var place: PlaceInfo = places.get_place(site_id) if places != null else null
	if place == null:
		return ""
	if place.reaches(required):
		return ""
	return REASON_LEVEL % PlaceDefinitions.level_label(required)

func _already_reason(site_id: String, level: String) -> String:
	var place: PlaceInfo = places.get_place(site_id) if places != null else null
	if place == null:
		return ""
	if not place.reaches(level):
		return ""
	if level == PlaceDefinitions.LEVEL_EXPLOITED:
		return REASON_NOTHING_MORE
	return "El lugar ya está en nivel «%s»" % place.level_label()

func _haul_block(site_id: String) -> String:
	if storage == null or not storage.ready_for_use:
		return REASON_NEEDS_STORAGE
	if haulable_stacks(site_id).is_empty():
		return REASON_NOTHING_TO_HAUL
	if storage.free_space() <= 0 and storage.water_free_space() <= 0:
		return REASON_STORAGE_FULL
	return ""

func _fetch_water_block() -> String:
	if storage == null or not storage.ready_for_use:
		return REASON_NEEDS_STORAGE
	if storage.water_free_space() <= 0:
		return REASON_DEPOSIT_FULL
	if _find_container_stack() == null:
		return REASON_NO_CONTAINER
	return ""

func _build_conduction_block() -> String:
	if conduction == null:
		return REASON_NEEDS_PLAN
	if conduction.is_built():
		return REASON_ALREADY_BUILT
	if not conduction.is_planned():
		return REASON_NEEDS_PLAN
	if storage == null or not storage.ready_for_use:
		return REASON_NEEDS_STORAGE
	return _materials_block(WaterConduction.BUILD_COST)

func _materials_block(cost: Dictionary) -> String:
	var missing := PackedStringArray()
	for type_id in cost.keys():
		var needed: int = int(cost[type_id])
		if _stored_amount_free(String(type_id)) < needed:
			missing.append("%s ×%d" % [ResourceDefinitions.type_name(String(type_id)), needed])
	if missing.is_empty():
		return ""
	return REASON_NO_MATERIALS % ", ".join(missing)

func _stored_amount_free(type_id: String) -> int:
	if resources == null:
		return 0
	var total := 0
	for stack in resources.stored_stacks_of_type(type_id):
		total += stack.amount
	return total

# --- Selección de pilas ---------------------------------------------------

## Pilas sin recoger que hay en un lugar y que caben en el almacén.
func haulable_stacks(site_id: String) -> Array[ResourceStack]:
	var result: Array[ResourceStack] = []
	if resources == null:
		return result
	for stack in resources.stacks_at(site_id):
		if stack.logistics_state != ResourceDefinitions.LOGISTICS_AVAILABLE:
			continue
		if stack.reserved_by_person_id != "":
			continue
		result.append(stack)
	return result

## Lugares distintos del almacén que tienen algo accesible que transportar.
func sites_with_pending_stacks() -> Array[String]:
	var site_ids: Array[String] = []
	if resources == null:
		return site_ids
	for stack in resources.all_stacks():
		if stack.logistics_state != ResourceDefinitions.LOGISTICS_AVAILABLE:
			continue
		if stack.reserved_by_person_id != "":
			continue
		var not_a_site: bool = stack.location_id == ResourceDefinitions.LOCATION_STORAGE
		not_a_site = not_a_site or stack.location_id == ResourceDefinitions.LOCATION_WATER_DEPOSIT
		not_a_site = not_a_site or stack.location_id == ResourceDefinitions.LOCATION_CARRIED
		if not_a_site:
			continue
		if not site_ids.has(stack.location_id):
			site_ids.append(stack.location_id)
	site_ids.sort()
	return site_ids

func _find_container_stack() -> ResourceStack:
	if resources == null:
		return null
	for stack in resources.all_stacks():
		if stack.type_id != ResourceDefinitions.TYPE_WATER_CONTAINER:
			continue
		if stack.reserved_by_person_id != "":
			continue
		var usable: bool = stack.logistics_state == ResourceDefinitions.LOGISTICS_STORED
		usable = usable or stack.logistics_state == ResourceDefinitions.LOGISTICS_AVAILABLE
		if usable:
			return stack
	return null

## Alimento comestible almacenado, prefiriendo el fresco (que se deteriora)
## antes que el conservado.
func _find_edible_stack() -> ResourceStack:
	if resources == null:
		return null
	for type_id in [ResourceDefinitions.TYPE_FOOD_FRESH, ResourceDefinitions.TYPE_FOOD_PRESERVED]:
		for stack in resources.stored_stacks_of_type(String(type_id)):
			if stack.amount > 0:
				return stack
	return null

# --- Reservas -------------------------------------------------------------

## Reserva las pilas concretas que el trabajo va a usar y fija su destino.
## Devuelve "" si todo fue bien o el motivo del fallo.
func reserve_for(job: WorkOrder, person_id: String) -> String:
	job.reserved_stack_ids.clear()
	match job.action_type:
		WorkActions.HAUL_STORAGE:
			return _reserve_haul(job, person_id)
		WorkActions.FETCH_WATER:
			return _reserve_fetch_water(job, person_id)
		WorkActions.BUILD_CONDUCTION:
			return _reserve_materials(job, person_id, WaterConduction.BUILD_COST)
		WorkActions.PREPARE_REST_AREA:
			return _reserve_materials(job, person_id, REST_AREA_COST)
	return ""

func _reserve_haul(job: WorkOrder, person_id: String) -> String:
	var candidates: Array[ResourceStack] = haulable_stacks(job.target_id)
	if candidates.is_empty():
		return REASON_NOTHING_TO_HAUL
	# Un lote no mezcla destinos: o va al almacén general o al depósito.
	var destination_type: String = candidates[0].type_id
	var to_deposit: bool = ResourceDefinitions.uses_water_deposit(destination_type)
	var room: int = storage.water_free_space() if to_deposit else storage.free_space()
	if room <= 0:
		return storage.full_reason_for(destination_type)
	var budget: int = mini(GameConstants.HAUL_BATCH_MAX, room)
	for stack in candidates:
		if budget <= 0:
			break
		if ResourceDefinitions.uses_water_deposit(stack.type_id) != to_deposit:
			continue
		var piece: ResourceStack = stack
		if stack.amount > budget:
			piece = resources.split(stack.id, budget)
		if piece == null or not resources.reserve(piece.id, person_id):
			continue
		job.reserved_stack_ids.append(piece.id)
		budget -= piece.amount
	if job.reserved_stack_ids.is_empty():
		return REASON_NOTHING_TO_HAUL
	if to_deposit:
		job.destination_id = ResourceDefinitions.LOCATION_WATER_DEPOSIT
	else:
		job.destination_id = ResourceDefinitions.LOCATION_STORAGE
	job.destination_position = storage.position_for(destination_type)
	return ""

func _reserve_fetch_water(job: WorkOrder, person_id: String) -> String:
	var container: ResourceStack = _find_container_stack()
	if container == null:
		return REASON_NO_CONTAINER
	var piece: ResourceStack = container
	if container.amount > 1:
		piece = resources.split(container.id, 1)
	if piece == null or not resources.reserve(piece.id, person_id):
		return REASON_NO_CONTAINER
	job.reserved_stack_ids.append(piece.id)
	job.destination_id = ResourceDefinitions.LOCATION_WATER_DEPOSIT
	job.destination_position = storage.deposit_position
	return ""

func _reserve_materials(job: WorkOrder, person_id: String, cost: Dictionary) -> String:
	var blocked: String = _materials_block(cost)
	if blocked != "":
		return blocked
	var type_ids: Array = cost.keys()
	type_ids.sort()
	for type_id in type_ids:
		var remaining: int = int(cost[type_id])
		for stack in resources.stored_stacks_of_type(String(type_id)):
			if remaining <= 0:
				break
			var piece: ResourceStack = stack
			if stack.amount > remaining:
				piece = resources.split(stack.id, remaining)
			if piece == null or not resources.reserve(piece.id, person_id):
				continue
			job.reserved_stack_ids.append(piece.id)
			remaining -= piece.amount
		if remaining > 0:
			release_for(job)
			return _materials_block(cost)
	return ""

## Libera todas las reservas de un trabajo sin alterar cantidades. Lo que
## la persona ya llevaba encima se deja en el lugar de origen, en lugar de
## quedar atrapado en un inventario invisible.
func release_for(job: WorkOrder) -> void:
	if resources == null:
		return
	for stack_id in job.reserved_stack_ids:
		var stack: ResourceStack = resources.get_stack(String(stack_id))
		if stack == null:
			continue
		if stack.logistics_state == ResourceDefinitions.LOGISTICS_IN_TRANSPORT:
			resources.drop(stack.id, job.target_id, job.target_position)
		else:
			resources.release(stack.id)
	job.reserved_stack_ids.clear()

# --- Fases ----------------------------------------------------------------

## Se llama al terminar la fase de trabajo en el lugar, antes del retorno.
## Es donde las pilas pasan a «en transporte».
func on_act_finished(job: WorkOrder, person_id: String) -> void:
	match job.action_type:
		WorkActions.HAUL_STORAGE:
			for stack_id in job.reserved_stack_ids:
				resources.pick_up(String(stack_id), person_id)
		WorkActions.FETCH_WATER:
			for stack_id in job.reserved_stack_ids:
				resources.pick_up(String(stack_id), person_id)
			var water: ResourceStack = resources.create_stack(
				ResourceDefinitions.TYPE_WATER,
				GameConstants.WATER_PER_HAUL_TRIP,
				ResourceDefinitions.LOCATION_CARRIED,
				job.target_position,
				ResourceDefinitions.LOGISTICS_IN_TRANSPORT
			)
			if water != null:
				water.carrier_person_id = person_id
				water.reserved_by_person_id = person_id
				job.reserved_stack_ids.append(water.id)

# --- Efecto final ---------------------------------------------------------

## Aplica el efecto del trabajo exactamente una vez y devuelve el texto de
## resultado que se mostrará en el panel «Trabajos».
func apply(job: WorkOrder, needs: PersonNeeds) -> String:
	match job.action_type:
		WorkActions.OBSERVE_PLACE:
			places.observe(job.target_id)
			return "Lugar observado"
		WorkActions.INSPECT_PLACE:
			places.inspect(job.target_id, resources)
			_recognise_source(job.target_id)
			var pending: int = places.pending_amount(job.target_id, resources)
			return "Lugar inspeccionado · %d unidades por recoger" % pending
		WorkActions.REGISTER_PLACE:
			places.exploit(job.target_id, resources)
			_recognise_source(job.target_id)
			if job.target_id == "building.shelter_candidate":
				_establish_storage(job)
				return "Refugio registrado · almacén y depósito establecidos"
			return "Lugar registrado por completo"
		WorkActions.HAUL_STORAGE:
			return _deliver_carried(job)
		WorkActions.FETCH_WATER:
			return _deliver_carried(job)
		WorkActions.PLAN_CONDUCTION:
			conduction.plan()
			return "Conducción por gravedad planificada"
		WorkActions.BUILD_CONDUCTION:
			var consumed: int = _consume_reserved(job)
			conduction.mark_built()
			return "Conducción construida · %d unidades de material consumidas" % consumed
		WorkActions.FISH_POND, WorkActions.GATHER_MUSHROOMS:
			return _take_from_source(job)
		WorkActions.DRY_FOOD:
			if spoilage.dry_stored_food():
				return "Secado: %d frescos → %d conservados" % [
					GameConstants.DRYING_INPUT_AMOUNT, GameConstants.DRYING_OUTPUT_AMOUNT,
				]
			return "No había alimento fresco suficiente"
		WorkActions.PREPARE_REST_AREA:
			_consume_reserved(job)
			storage.rest_places = GameConstants.SHELTER_REST_PLACES
			return "Zona de descanso acondicionada (%d plazas)" % storage.rest_places
		WorkActions.DRINK:
			return _drink(needs)
		WorkActions.EAT:
			return _eat(needs)
		WorkActions.REST:
			if needs != null:
				needs.satisfy(PersonNeeds.NEED_REST)
			return "Descanso completado"
	return "Completado"

func _recognise_source(site_id: String) -> void:
	var source: FiniteSource = source_for_site(site_id)
	if source != null:
		source.recognised = true

func _establish_storage(job: WorkOrder) -> void:
	if storage == null or storage.ready_for_use:
		return
	var deposit: PlaceInfo = places.get_place("site.water_deposit")
	var deposit_position: Vector3 = deposit.position if deposit != null else job.target_position
	storage.establish(job.target_position, deposit_position)

## Deposita todo lo transportado. Si el destino se ha llenado por el
## camino, la carga queda en el suelo junto al almacén: nunca desaparece.
func _deliver_carried(job: WorkOrder) -> String:
	var delivered := 0
	var left := 0
	for stack_id in job.reserved_stack_ids:
		var stack: ResourceStack = resources.get_stack(String(stack_id))
		if stack == null or not stack.is_active():
			continue
		var destination: String = ResourceDefinitions.storage_location_for(stack.type_id)
		var room: int = storage.free_space_for(stack.type_id)
		if room >= stack.amount:
			resources.deposit(stack.id, destination)
			delivered += stack.amount
		else:
			resources.drop(stack.id, ResourceDefinitions.LOCATION_STORAGE, storage.storage_position)
			left += stack.amount
	job.reserved_stack_ids.clear()
	if left > 0:
		return "Depositadas %d unidades · %d quedan en el suelo por falta de capacidad" % [delivered, left]
	return "Depositadas %d unidades" % delivered

func _consume_reserved(job: WorkOrder) -> int:
	var consumed := 0
	for stack_id in job.reserved_stack_ids:
		var stack: ResourceStack = resources.get_stack(String(stack_id))
		if stack == null:
			continue
		consumed += resources.consume(stack.id, stack.amount)
	job.reserved_stack_ids.clear()
	return consumed

func _take_from_source(job: WorkOrder) -> String:
	var source: FiniteSource = source_for_site(job.target_id)
	if source == null:
		return FiniteSource.REASON_NOT_RECOGNISED
	var taken: int = source.take(source.yield_per_action)
	if taken <= 0:
		return FiniteSource.REASON_EXHAUSTED
	resources.create_stack(
		source.type_id,
		taken,
		job.target_id,
		job.target_position,
		ResourceDefinitions.LOGISTICS_AVAILABLE
	)
	return "Obtenidas %d unidades de %s · %s" % [
		taken, ResourceDefinitions.type_name(source.type_id), source.availability_text(),
	]

## Beber consume exactamente una unidad de agua del depósito.
func _drink(needs: PersonNeeds) -> String:
	var stacks: Array[ResourceStack] = resources.stacks_at(ResourceDefinitions.LOCATION_WATER_DEPOSIT)
	for stack in stacks:
		if stack.type_id != ResourceDefinitions.TYPE_WATER or stack.amount <= 0:
			continue
		if resources.consume(stack.id, 1) == 1:
			if needs != null:
				needs.satisfy(PersonNeeds.NEED_HYDRATION)
			return "Bebe 1 de agua"
	return REASON_NO_WATER

## Comer consume exactamente una unidad de alimento comestible.
func _eat(needs: PersonNeeds) -> String:
	var stack: ResourceStack = _find_edible_stack()
	if stack == null:
		return REASON_NO_FOOD
	var type_name: String = stack.type_name()
	if resources.consume(stack.id, 1) == 1:
		if needs != null:
			needs.satisfy(PersonNeeds.NEED_NUTRITION)
		return "Come 1 de %s" % type_name
	return REASON_NO_FOOD
