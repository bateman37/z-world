## Smoke test headless de IMPLEMENTATION-001 e IMPLEMENTATION-002.
## Ejecutar con:
##   godot --headless --path . --script res://tests/smoke_test.gd
## No sustituye una suite de pruebas general ni la prueba manual: solo
## verifica los criterios mínimos de ambas entregas (secciones 13 y 16 de
## sus prompts respectivos).
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
			"SpeedX10Button", "CenterCameraButton",
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

	# Comprobaciones de IMPLEMENTATION-002 (sección 16 de su prompt).
	var board = main.get_node_or_null("WorkBoard")
	if board == null:
		failures.append("No se encontró el tablón de trabajos (WorkBoard).")
	elif clock != null:
		_check_work(board, clock, failures)

	_finish(failures)

func _check_work(board, clock, failures: Array[String]) -> void:
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

	# 10. Designar crea un solo trabajo y una reserva no se comparte.
	board.designate_target("work.rubble.01")
	board.designate_target("work.rubble.01")
	var jobs_for_target := 0
	for active_job in board.get_active_jobs():
		if active_job.target_id == "work.rubble.01":
			jobs_for_target += 1
	if jobs_for_target != 1:
		failures.append("Designar dos veces el mismo objetivo creó %d trabajos." % jobs_for_target)
	var owner: String = String(board.get_reservations().get("work.rubble.01", ""))
	if owner == "":
		failures.append("El trabajo designado no generó ninguna reserva.")
	else:
		var other_id := "person.initial.06" if owner != "person.initial.06" else "person.initial.01"
		if board.request_direct_work(other_id, "work.rubble.01"):
			failures.append("Una segunda persona pudo reservar un objetivo ya reservado.")
		if String(board.get_reservations().get("work.rubble.01", "")) != owner:
			failures.append("La reserva del objetivo cambió de persona indebidamente.")
	board.cancel_target_designation("work.rubble.01")

	# 11. El selector prefiere prioridad 4 antes que 2 y excluye a quien no
	# cumple la habilidad mínima.
	for person_id in person_ids:
		var reset_state = board.get_person_state(person_id)
		reset_state.set_priority("build_repair", 0)
		reset_state.set_priority("explore_recon", 0)
	board.designate_target("work.rubble.02")
	board.designate_target("work.recon.01")
	first.set_skill("observation_inspection", 3)
	first.set_priority("build_repair", 2)
	first.set_priority("explore_recon", 4)
	board.evaluate_assignments()
	var chosen = null
	for candidate_job in board.get_active_jobs():
		if candidate_job.assigned_person_id == "person.initial.01":
			chosen = candidate_job
	if chosen == null:
		failures.append("El selector no asignó ningún trabajo con prioridad 4 disponible.")
	elif chosen.family_id != "explore_recon":
		failures.append("El selector eligió la familia %s en vez de la de prioridad 4." % chosen.family_id)
	board.cancel_target_designation("work.rubble.02")
	board.cancel_target_designation("work.recon.01")
	first.set_skill("observation_inspection", 1)
	first.set_priority("explore_recon", 2)

	for person_id in person_ids:
		board.get_person_state(person_id).set_priority("build_repair", 0)
	board.get_person_state("person.initial.02").set_priority("build_repair", 4)
	board.designate_target("work.rubble.03")
	var blocked = board.get_job_for_target("work.rubble.03")
	if blocked == null:
		failures.append("No se creó el trabajo de prueba de habilidad mínima.")
	else:
		if blocked.assigned_person_id != "":
			failures.append("Se asignó un trabajo a quien no cumple la habilidad mínima.")
		if blocked.block_reason != "Nadie tiene la habilidad mínima":
			failures.append("Motivo de bloqueo inesperado: %s" % blocked.block_reason)
	board.cancel_target_designation("work.rubble.03")

	# 12. La pausa detiene el progreso y ×10 no completa dos veces.
	for person_id in person_ids:
		var restored_state = board.get_person_state(person_id)
		for family_id in WorkDefinitions.PRIORITY_FAMILY_IDS:
			restored_state.set_priority(String(family_id), 2)
	board.designate_target("work.rubble.04")
	var final_job = board.get_job_for_target("work.rubble.04")
	if final_job == null or final_job.assigned_person_id == "":
		failures.append("El trabajo de escombros no se asignó a ninguna persona.")
	else:
		board.notify_arrived(final_job.assigned_person_id)
		if final_job.state != "working":
			failures.append("El trabajo no pasó a ejecución al llegar la persona.")
		var progress_before: float = final_job.progress
		clock.set_paused(true)
		clock._process(1.0)
		if not is_equal_approx(final_job.progress, progress_before):
			failures.append("El progreso del trabajo avanzó estando en pausa.")
		clock.set_multiplier(10.0)
		clock._process(1.0)
		if board.get_completed_jobs().size() != 1:
			failures.append("A ×10 no se completó exactamente un trabajo (%d)." % board.get_completed_jobs().size())
		clock._process(1.0)
		if board.get_completed_jobs().size() != 1:
			failures.append("Un trabajo se completó dos veces al seguir avanzando a ×10.")
		var target = board.get_target("work.rubble.04")
		if target != null and not target.is_completed():
			failures.append("El objetivo completado no quedó marcado como completado.")
	clock.set_paused(true)

func _finish(failures: Array[String]) -> void:
	if failures.is_empty():
		print("SMOKE TEST OK")
		quit(0)
	else:
		for failure in failures:
			print("FALLO: %s" % failure)
		quit(1)
