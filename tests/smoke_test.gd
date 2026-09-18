## Smoke test headless para IMPLEMENTATION-001. Ejecutar con:
##   godot --headless --path . --script res://tests/smoke_test.gd
## No sustituye una suite de pruebas general; solo verifica los
## criterios mínimos de esta entrega (ver sección 13 del prompt).
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

	_finish(failures)

func _finish(failures: Array[String]) -> void:
	if failures.is_empty():
		print("SMOKE TEST OK")
		quit(0)
	else:
		for failure in failures:
			print("FALLO: %s" % failure)
		quit(1)
