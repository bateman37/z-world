## Necesidades básicas de una persona: hidratación, alimentación y
## descanso, en escala 0–100 (100 = plenamente cubierta). Es un objeto de
## datos puro, separado de `PersonWorkState` y del actor visual, para poder
## probar tasas y umbrales sin renderizado.
##
## No implementa salud, enfermedad, heridas, miedo ni muerte: quedan fuera
## del alcance de IMPLEMENTATION-003 (sección 17).
class_name PersonNeeds
extends RefCounted

const NEED_HYDRATION := "hydration"
const NEED_NUTRITION := "nutrition"
const NEED_REST := "rest"

const NEED_IDS := [NEED_HYDRATION, NEED_NUTRITION, NEED_REST]

const NEED_NAMES := {
	NEED_HYDRATION: "Hidratación",
	NEED_NUTRITION: "Alimentación",
	NEED_REST: "Descanso",
}

## Acción automática que resuelve cada necesidad.
const NEED_ACTIONS := {
	NEED_HYDRATION: "drink",
	NEED_NUTRITION: "eat",
	NEED_REST: "rest",
}

const DECAY_PER_DAY := {
	NEED_HYDRATION: GameConstants.HYDRATION_DECAY_PER_DAY,
	NEED_NUTRITION: GameConstants.NUTRITION_DECAY_PER_DAY,
	NEED_REST: GameConstants.REST_DECAY_PER_DAY,
}

const RECOVERY := {
	NEED_HYDRATION: GameConstants.DRINK_RECOVERY,
	NEED_NUTRITION: GameConstants.EAT_RECOVERY,
	NEED_REST: GameConstants.REST_RECOVERY,
}

const LEVEL_NORMAL := "normal"
const LEVEL_WARNED := "warned"
const LEVEL_CRITICAL := "critical"

const LEVEL_LABELS := {
	LEVEL_NORMAL: "normal",
	LEVEL_WARNED: "advertida",
	LEVEL_CRITICAL: "crítica",
}

var values: Dictionary = {}

func _init() -> void:
	for need_id in NEED_IDS:
		values[need_id] = GameConstants.NEED_MAX

func get_value(need_id: String) -> float:
	return float(values.get(need_id, GameConstants.NEED_MAX))

## Fija un valor sin salirse nunca del rango 0–100.
func set_value(need_id: String, value: float) -> void:
	if not values.has(need_id):
		return
	values[need_id] = clampf(value, GameConstants.NEED_MIN, GameConstants.NEED_MAX)

func apply(need_id: String, delta: float) -> void:
	set_value(need_id, get_value(need_id) + delta)

## Aplica la recuperación de la acción automática correspondiente.
func satisfy(need_id: String) -> void:
	apply(need_id, float(RECOVERY.get(need_id, 0.0)))

## `gameplay_delta` son segundos observables a ×1; las tasas están
## expresadas por día simulado.
func advance(gameplay_delta: float) -> void:
	if gameplay_delta <= 0.0:
		return
	var days: float = gameplay_delta / GameConstants.SIM_DAY_IN_GAMEPLAY_SECONDS
	for need_id in NEED_IDS:
		apply(String(need_id), -float(DECAY_PER_DAY.get(need_id, 0.0)) * days)

static func level_for(value: float) -> String:
	if value <= GameConstants.NEED_CRITICAL_THRESHOLD:
		return LEVEL_CRITICAL
	if value <= GameConstants.NEED_WARNED_THRESHOLD:
		return LEVEL_WARNED
	return LEVEL_NORMAL

func level(need_id: String) -> String:
	return level_for(get_value(need_id))

func is_critical(need_id: String) -> bool:
	return level(need_id) == LEVEL_CRITICAL

func has_critical() -> bool:
	for need_id in NEED_IDS:
		if is_critical(String(need_id)):
			return true
	return false

## Necesidad más urgente (la de valor más bajo) o "" si todas son normales.
## El desempate es estable por el orden del catálogo.
func most_urgent() -> String:
	var worst := ""
	var worst_value: float = GameConstants.NEED_MAX
	for need_id in NEED_IDS:
		var value: float = get_value(String(need_id))
		if level_for(value) == LEVEL_NORMAL:
			continue
		if worst == "" or value < worst_value - 0.0001:
			worst = String(need_id)
			worst_value = value
	return worst

static func need_name(need_id: String) -> String:
	return String(NEED_NAMES.get(need_id, need_id))

static func level_label(level_id: String) -> String:
	return String(LEVEL_LABELS.get(level_id, level_id))

## Líneas para la ficha de persona.
func describe_lines() -> PackedStringArray:
	var lines := PackedStringArray()
	for need_id in NEED_IDS:
		var value: float = get_value(String(need_id))
		lines.append("%s: %d (%s)" % [
			need_name(String(need_id)),
			int(round(value)),
			level_label(level_for(value)),
		])
	return lines
