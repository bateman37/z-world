## Smoke test headless de IMPLEMENTATION-001, 002 y 003.
## Ejecutar con:
##   godot --headless --path . --script res://tests/smoke_test.gd
## No sustituye una suite de pruebas general ni la prueba manual: solo
## verifica los criterios mínimos de las tres entregas. Las comprobaciones
## ligadas a los ocho objetivos demostradores de IMPLEMENTATION-002
## (pilas de escombros y puntos de reconocimiento) se han retirado junto
## con los propios demostradores.
extends SceneTree

func _init() -> void:
	var failures: Array[String] = []

	var main_scene: PackedScene = load("res://scenes/main/Main.tscn")
	if main_scene == null:
		print("FALLO: no se pudo cargar res://scenes/main/Main.tscn")
		quit(1)
		return

	# 1. La escena principal puede cargarse e instanciarse.
	var main := main_scene.instantiate()
	if main == null:
		failures.append("La escena principal no se pudo instanciar.")
		_finish(failures)
		return

	root.add_child(main)

	# 2. Exactamente seis supervivientes con IDs únicos y esperados.
	var expected_ids: Array[String] = [
		"person.initial.01", "person.initial.02", "person.initial.03",
		"person.initial.04", "person.initial.05", "person.initial.06",
	]
	var survivors_node := main.get_node_or_null("World/Survivors")
	var found_ids: Array[String] = []
	if survivors_node:
		for child in survivors_node.get_children():
			var selectable = child.get_node_or_null("Selectable")
			if selectable:
				found_ids.append(selectable.id)
	found_ids.sort()
	var sorted_expected := expected_ids.duplicate()
	sorted_expected.sort()
	if found_ids.size() != 6:
		failures.append("Se esperaban 6 supervivientes, se encontraron %d." % found_ids.size())
	elif found_ids != sorted_expected:
		failures.append("Los IDs de supervivientes no coinciden con los esperados: %s" % [found_ids])

	# 3. Refugio candidato y al menos tres edificios seleccionables en total.
	var buildings_node := main.get_node_or_null("World/Buildings")
	var building_ids: Array[String] = []
	var has_shelter := false
	if buildings_node:
		for child in buildings_node.get_children():
			var selectable = child.get_node_or_null("Selectable")
			if selectable:
				building_ids.append(selectable.id)
				if selectable.id == "building.shelter_candidate":
					has_shelter = true
	if not has_shelter:
		failures.append("No se encontró el refugio candidato seleccionable.")
	if building_ids.size() < 3:
		failures.append("Se esperaban al menos 3 edificios seleccionables, se encontraron %d." % building_ids.size())

	# 4. El HUD contiene los cinco estados de velocidad y el botón de centrar.
	var hud := main.get_node_or_null("HUDLayer")
	if hud == null:
		failures.append("No se encontró el HUD (HUDLayer).")
	else:
		var required_unique_names := [
			"PauseButton", "SpeedX1Button", "SpeedX2Button", "SpeedX4Button",
			"SpeedX10Button", "CenterCameraButton", "ResourcesButton",
			"StoredStripLabel",
		]
		for unique_name in required_unique_names:
			if hud.get_node_or_null("%" + unique_name) == null:
				failures.append("Falta el control del HUD: %s" % unique_name)

	# 5. El reloj comienza en Día 1, 08:00.
	var clock := main.get_node_or_null("GameClock")
	if clock == null:
		failures.append("No se encontró GameClock.")
	else:
		var initial_time: Dictionary = clock.get_current_time()
		if initial_time.get("day") != 1 or initial_time.get("hour") != 8 or initial_time.get("minute") != 0:
			failures.append("El reloj no comienza en Día 1, 08:00: %s" % [initial_time])

		# 6. La conversión de ×1 y ×10 respeta la duración de día aprobada.
		clock.day = 1
		clock._seconds_in_day = 8 * 3600.0
		clock.set_multiplier(1.0)
		clock._process(10.0)
		var minutes_advanced_x1: float = (clock._seconds_in_day - 8 * 3600.0) / 60.0
		if abs(minutes_advanced_x1 - 12.0) > 0.5:
			failures.append("A x1, 10s reales deberían avanzar ~12 minutos simulados; avanzó %.2f." % minutes_advanced_x1)

		clock.day = 1
		clock._seconds_in_day = 8 * 3600.0
		clock.set_multiplier(10.0)
		clock._process(10.0)
		var hours_advanced_x10: float = (clock._seconds_in_day - 8 * 3600.0) / 3600.0
		if abs(hours_advanced_x10 - 2.0) > 0.05:
			failures.append("A x10, 10s reales deberían avanzar ~2 horas simuladas; avanzó %.2f." % hours_advanced_x10)

		# 7. La pausa no incrementa el tiempo simulado.
		clock.set_paused(true)
		var seconds_before_pause: float = clock._seconds_in_day
		clock._process(5.0)
		if not is_equal_approx(clock._seconds_in_day, seconds_before_pause):
			failures.append("El tiempo simulado avanzó estando en pausa.")

	var board = main.get_node_or_null("WorkBoard")
	if board == null:
		failures.append("No se encontró el tablón de trabajos (WorkBoard).")
		_finish(failures)
		return

	# 8. Seis estados de persona, con diez prioridades y once habilidades.
	var person_ids: Array = board.get_person_ids()
	if person_ids.size() != 6:
		failures.append("Se esperaban 6 estados de persona, hay %d." % person_ids.size())
	for person_id in person_ids:
		var checked_state = board.get_person_state(person_id)
		if checked_state.priorities.size() != 10:
			failures.append("%s no tiene 10 prioridades (%d)." % [person_id, checked_state.priorities.size()])
		if checked_state.skills.size() != 11:
			failures.append("%s no tiene 11 habilidades (%d)." % [person_id, checked_state.skills.size()])

	# 9. Las prioridades solo admiten valores 0–4.
	var first = board.get_person_state("person.initial.01")
	first.set_priority("build_repair", 9)
	if first.get_priority("build_repair") != 4:
		failures.append("Una prioridad por encima de 4 no quedó limitada a 4.")
	first.set_priority("build_repair", -3)
	if first.get_priority("build_repair") != 0:
		failures.append("Una prioridad por debajo de 0 no quedó limitada a 0.")
	if first.cycle_priority("build_repair", false) != 4:
		failures.append("El ciclo descendente desde 0 debería volver a 4.")
	if first.cycle_priority("build_repair", true) != 0:
		failures.append("El ciclo ascendente desde 4 debería volver a 0.")
	first.set_priority("build_repair", 2)

	# Comprobaciones de IMPLEMENTATION-003 (sección 19 de su prompt).
	_check_place_information(board, failures)
	_check_logistics(board, failures)
	_check_needs(board, failures)
	_check_spoilage(board, failures)
	_check_finite_sources(board, failures)
	_check_conduction(board, failures)

	_finish(failures)

## 10. Niveles de información y materialización única del contenido fijo.
func _check_place_information(board, failures: Array[String]) -> void:
	var places = board.places
	var resources = board.resources
	var place = places.get_place("building.house_a")
	if place == null:
		failures.append("No se registró el lugar building.house_a.")
		return
	if place.level != PlaceDefinitions.LEVEL_SIGHTED:
		failures.append("Casa 1 debería empezar «avistada», está en «%s»." % place.level)
	places.observe("building.house_a")
	if place.level != PlaceDefinitions.LEVEL_OBSERVED:
		failures.append("Observar no dejó el lugar en «observado» (%s)." % place.level)
	if place.notes == "":
		failures.append("Observar no reveló ningún indicio.")

	places.inspect("building.house_a", resources)
	if place.level != PlaceDefinitions.LEVEL_INSPECTED:
		failures.append("Inspeccionar no dejó el lugar en «inspeccionado» (%s)." % place.level)
	var after_first: int = resources.stacks_at("building.house_a").size()
	var expected_entries: int = PlaceDefinitions.content_for("building.house_a").size()
	if after_first != expected_entries:
		failures.append("Inspeccionar creó %d pilas en vez de %d." % [after_first, expected_entries])

	# Repetir inspección y registrar no pueden duplicar el contenido fijo.
	places.inspect("building.house_a", resources)
	places.exploit("building.house_a", resources)
	var after_repeat: int = resources.stacks_at("building.house_a").size()
	if after_repeat != after_first:
		failures.append("El contenido fijo se materializó más de una vez (%d → %d)." % [after_first, after_repeat])
	if place.level != PlaceDefinitions.LEVEL_EXPLOITED:
		failures.append("Registrar no dejó el lugar en «aprovechado» (%s)." % place.level)
	if place.emptiness_text().find("registrado") < 0:
		failures.append("Un lugar registrado debería informar de que no queda nada: «%s»." % place.emptiness_text())

## 11. Reservar, recoger y depositar conserva la cantidad exacta.
func _check_logistics(board, failures: Array[String]) -> void:
	var resources = board.resources
	var storage = board.storage
	storage.establish(Vector3.ZERO, Vector3(1.0, 0.0, 0.0))

	var stack = resources.create_stack(
		ResourceDefinitions.TYPE_WOOD_PLANKS, 5, "building.workshop", Vector3.ZERO,
		ResourceDefinitions.LOGISTICS_AVAILABLE
	)
	if stack == null:
		failures.append("No se pudo crear una pila de prueba.")
		return
	var total_before: int = _total_amount(resources, ResourceDefinitions.TYPE_WOOD_PLANKS)

	if not resources.reserve(stack.id, "person.initial.01"):
		failures.append("No se pudo reservar una pila disponible.")
	if stack.logistics_state != ResourceDefinitions.LOGISTICS_RESERVED:
		failures.append("Reservar no dejó la pila en «reservado» (%s)." % stack.logistics_state)
	if resources.reserve(stack.id, "person.initial.02"):
		failures.append("Una segunda persona pudo reservar una pila ya reservada.")

	resources.pick_up(stack.id, "person.initial.01")
	if stack.logistics_state != ResourceDefinitions.LOGISTICS_IN_TRANSPORT:
		failures.append("Recoger no dejó la pila «en transporte» (%s)." % stack.logistics_state)

	resources.deposit(stack.id, ResourceDefinitions.LOCATION_STORAGE)
	if stack.logistics_state != ResourceDefinitions.LOGISTICS_STORED:
		failures.append("Depositar no dejó la pila «almacenada» (%s)." % stack.logistics_state)
	if stack.amount != 5:
		failures.append("El ciclo de transporte cambió la cantidad de la pila (%d)." % stack.amount)
	if _total_amount(resources, ResourceDefinitions.TYPE_WOOD_PLANKS) != total_before:
		failures.append("El ciclo de transporte no conservó la cantidad total.")

	# Separar un lote tampoco puede duplicar ni perder unidades.
	var piece = resources.split(stack.id, 2)
	if piece == null or piece.amount != 2 or stack.amount != 3:
		failures.append("Separar un lote no repartió la cantidad correctamente.")
	if _total_amount(resources, ResourceDefinitions.TYPE_WOOD_PLANKS) != total_before:
		failures.append("Separar un lote no conservó la cantidad total.")

## 12. Una necesidad crítica consume exactamente una unidad y el valor
## nunca sale del rango 0–100.
func _check_needs(board, failures: Array[String]) -> void:
	var resources = board.resources
	var execution = board.execution
	var needs = board.get_person_state("person.initial.01").needs

	resources.create_stack(
		ResourceDefinitions.TYPE_WATER, 3, ResourceDefinitions.LOCATION_WATER_DEPOSIT,
		Vector3.ZERO, ResourceDefinitions.LOGISTICS_STORED
	)
	var water_before: int = board.storage.water_total()
	needs.set_value(PersonNeeds.NEED_HYDRATION, 5.0)
	if not needs.is_critical(PersonNeeds.NEED_HYDRATION):
		failures.append("Una hidratación de 5 debería ser crítica.")

	var job := WorkOrder.new()
	job.action_type = WorkActions.DRINK
	job.target_id = "site.water_deposit"
	execution.apply(job, needs)

	if board.storage.water_total() != water_before - 1:
		failures.append("Beber no consumió exactamente 1 de agua (%d → %d)." % [
			water_before, board.storage.water_total(),
		])
	if not is_equal_approx(needs.get_value(PersonNeeds.NEED_HYDRATION), 5.0 + GameConstants.DRINK_RECOVERY):
		failures.append("Beber no aplicó la recuperación esperada (%.1f)." % needs.get_value(PersonNeeds.NEED_HYDRATION))

	needs.set_value(PersonNeeds.NEED_HYDRATION, 95.0)
	needs.satisfy(PersonNeeds.NEED_HYDRATION)
	if needs.get_value(PersonNeeds.NEED_HYDRATION) > GameConstants.NEED_MAX:
		failures.append("Una necesidad superó el máximo de 100.")
	needs.set_value(PersonNeeds.NEED_HYDRATION, -40.0)
	if needs.get_value(PersonNeeds.NEED_HYDRATION) < GameConstants.NEED_MIN:
		failures.append("Una necesidad bajó por debajo de 0.")
	needs.set_value(PersonNeeds.NEED_HYDRATION, GameConstants.NEED_MAX)

## 13. El alimento fresco se deteriora, el conservado no, y al llegar a 0
## el fresco se transforma una sola vez en alimento echado a perder.
func _check_spoilage(board, failures: Array[String]) -> void:
	var resources = board.resources
	var spoilage = board.spoilage
	var fresh = resources.create_stack(
		ResourceDefinitions.TYPE_FOOD_FRESH, 2, ResourceDefinitions.LOCATION_STORAGE,
		Vector3.ZERO, ResourceDefinitions.LOGISTICS_STORED
	)
	var preserved = resources.create_stack(
		ResourceDefinitions.TYPE_FOOD_PRESERVED, 2, ResourceDefinitions.LOCATION_STORAGE,
		Vector3.ZERO, ResourceDefinitions.LOGISTICS_STORED
	)

	spoilage.advance(GameConstants.SIM_DAY_IN_GAMEPLAY_SECONDS)
	var expected: float = 100.0 - GameConstants.FOOD_DECAY_STORED_PER_DAY
	if absf(fresh.condition - expected) > 0.5:
		failures.append("Un día almacenado debería dejar el fresco en %.0f; está en %.1f." % [expected, fresh.condition])
	if not is_equal_approx(preserved.condition, 100.0):
		failures.append("El alimento conservado no debería deteriorarse (%.1f)." % preserved.condition)

	spoilage.advance(GameConstants.SIM_DAY_IN_GAMEPLAY_SECONDS * 4.0)
	if fresh.type_id != ResourceDefinitions.TYPE_FOOD_SPOILED:
		failures.append("Al llegar a condición 0 el fresco debería transformarse en echado a perder (%s)." % fresh.type_id)
	if fresh.amount != 2:
		failures.append("La transformación cambió la cantidad de la pila (%d)." % fresh.amount)
	if preserved.type_id != ResourceDefinitions.TYPE_FOOD_PRESERVED:
		failures.append("El alimento conservado cambió de tipo indebidamente.")
	resources.lose(fresh.id)

## 14. Pesca y hongos tienen disponibilidad limitada y distinguen «no
## reconocido» de «agotado».
func _check_finite_sources(board, failures: Array[String]) -> void:
	var pond = board.execution.source_for_site("site.pond_fishing")
	var forest = board.execution.source_for_site("site.forest_mushrooms")
	if pond == null or forest == null:
		failures.append("No se registraron las fuentes de pesca y hongos.")
		return
	if pond.block_reason() != FiniteSource.REASON_NOT_RECOGNISED:
		failures.append("Una fuente sin inspeccionar debería decir «no reconocido»: «%s»." % pond.block_reason())
	if pond.take(1) != 0:
		failures.append("Se pudo extraer de una fuente todavía no reconocida.")

	pond.recognised = true
	forest.recognised = true
	if pond.total != GameConstants.POND_FISH_TOTAL:
		failures.append("El estanque no tiene la disponibilidad fijada (%d)." % pond.total)
	if forest.total != GameConstants.FOREST_MUSHROOM_TOTAL:
		failures.append("El claro de hongos no tiene la disponibilidad fijada (%d)." % forest.total)

	var taken := 0
	for i in range(GameConstants.POND_FISH_TOTAL + 3):
		taken += pond.take(1)
	if taken != GameConstants.POND_FISH_TOTAL:
		failures.append("El estanque entregó %d unidades en vez de %d." % [taken, GameConstants.POND_FISH_TOTAL])
	if not pond.is_exhausted():
		failures.append("El estanque debería quedar agotado tras extraer todo.")
	if pond.block_reason() != FiniteSource.REASON_EXHAUSTED:
		failures.append("Una fuente agotada debería decir «agotada»: «%s»." % pond.block_reason())
	if forest.block_reason() != "":
		failures.append("El claro de hongos reconocido no debería estar bloqueado: «%s»." % forest.block_reason())

## 15. La conducción por gravedad reserva y consume sus materiales una sola
## vez y nunca supera la capacidad de 12 del depósito.
func _check_conduction(board, failures: Array[String]) -> void:
	var resources = board.resources
	var execution = board.execution
	var storage = board.storage
	var conduction = board.conduction

	# Se parte del material que ya hubiera almacenado y se añade justo el
	# coste, para poder comprobar que se consume exactamente una vez.
	var baseline := {}
	for type_id in WaterConduction.BUILD_COST.keys():
		baseline[type_id] = _stored_amount(resources, String(type_id))
		resources.create_stack(
			String(type_id), int(WaterConduction.BUILD_COST[type_id]),
			ResourceDefinitions.LOCATION_STORAGE, Vector3.ZERO,
			ResourceDefinitions.LOGISTICS_STORED
		)
	conduction.plan()

	var job := WorkOrder.new()
	job.action_type = WorkActions.BUILD_CONDUCTION
	job.target_id = "site.water_deposit"
	var error: String = execution.reserve_for(job, "person.initial.01")
	if error != "":
		failures.append("No se pudieron reservar los materiales de la conducción: %s" % error)
		return
	var reserved_total := 0
	for stack_id in job.reserved_stack_ids:
		reserved_total += resources.stack_by_id(String(stack_id)).amount
	var expected_cost := 0
	for type_id in WaterConduction.BUILD_COST.keys():
		expected_cost += int(WaterConduction.BUILD_COST[type_id])
	if reserved_total != expected_cost:
		failures.append("La conducción reservó %d unidades en vez de %d." % [reserved_total, expected_cost])

	execution.apply(job, null)
	if not conduction.is_built():
		failures.append("La conducción no quedó construida tras completar el trabajo.")
	for type_id in WaterConduction.BUILD_COST.keys():
		var expected_left: int = int(baseline.get(type_id, 0))
		if _stored_amount(resources, String(type_id)) != expected_left:
			failures.append("El consumo de %s no fue exacto (%d, esperado %d)." % [
				String(type_id), _stored_amount(resources, String(type_id)), expected_left,
			])

	# Repetir la construcción no puede volver a consumir materiales.
	var before_total: int = _total_active(resources)
	execution.apply(job, null)
	if _total_active(resources) != before_total:
		failures.append("Repetir la construcción volvió a consumir materiales.")

	# Producción automática limitada por la capacidad del depósito.
	conduction.advance(GameConstants.CONDUCTION_SECONDS_PER_WATER * 40.0, storage, resources)
	if storage.water_total() != GameConstants.WATER_DEPOSIT_CAPACITY:
		failures.append("La conducción debería llenar el depósito hasta %d; hay %d." % [
			GameConstants.WATER_DEPOSIT_CAPACITY, storage.water_total(),
		])
	conduction.advance(GameConstants.CONDUCTION_SECONDS_PER_WATER * 10.0, storage, resources)
	if storage.water_total() > GameConstants.WATER_DEPOSIT_CAPACITY:
		failures.append("La conducción superó la capacidad del depósito (%d)." % storage.water_total())

# --- Utilidades -----------------------------------------------------------

func _total_amount(resources, type_id: String) -> int:
	var total := 0
	for stack in resources.all_stacks():
		if stack.type_id == type_id and stack.is_active():
			total += stack.amount
	return total

func _stored_amount(resources, type_id: String) -> int:
	var total := 0
	for stack in resources.all_stacks():
		if stack.type_id == type_id and stack.logistics_state == ResourceDefinitions.LOGISTICS_STORED:
			total += stack.amount
	return total

func _total_active(resources) -> int:
	var total := 0
	for stack in resources.all_stacks():
		if stack.is_active():
			total += stack.amount
	return total

func _finish(failures: Array[String]) -> void:
	if failures.is_empty():
		print("SMOKE TEST OK")
		quit(0)
	else:
		for failure in failures:
			print("FALLO: %s" % failure)
		quit(1)
