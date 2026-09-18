## Contador de práctica y progreso de aprendizaje observable, limitado a
## `fishing` y `mending_sewing` (IMPLEMENTATION-004, sección 12).
##
## No implementa el sistema completo de conocimiento de `DESIGN-003`: sigue
## usando la escala provisional de habilidad 0–4 de `WorkDefinitions` y solo
## sube el nivel real de la persona cuando el contador llega al umbral.
class_name LearningProgress
extends RefCounted

const SKILL_FISHING := "fishing"
const SKILL_MENDING := "mending_sewing"

const LEARNABLE_SKILLS := [SKILL_FISHING, SKILL_MENDING]

## Resultados útiles necesarios para pasar del nivel indicado al siguiente.
## El nivel 0 no aprende con estas acciones (necesita una vía de enseñanza
## futura) y el nivel 4 es el máximo provisional.
const THRESHOLDS := {
	1: 2,
	2: 4,
	3: 6,
}

var _counters: Dictionary = {}

func _init() -> void:
	for skill_id in LEARNABLE_SKILLS:
		_counters[skill_id] = 0

func progress(skill_id: String) -> int:
	return int(_counters.get(skill_id, 0))

func threshold_for(level: int) -> int:
	return int(THRESHOLDS.get(level, 0))

## Registra un resultado útil completado y devuelve el nuevo nivel de
## habilidad si sube, o -1 si no. Solo se llama cuando la acción produjo
## realmente su resultado (WorkExecution.apply, nunca al cancelar o
## bloquearse).
func record_result(skill_id: String, current_level: int) -> int:
	if not LEARNABLE_SKILLS.has(skill_id):
		return -1
	if current_level <= 0 or current_level >= WorkDefinitions.SKILL_MAX:
		return -1
	var needed: int = threshold_for(current_level)
	if needed <= 0:
		return -1
	var count: int = progress(skill_id) + 1
	if count >= needed:
		_counters[skill_id] = 0
		return current_level + 1
	_counters[skill_id] = count
	return -1

func describe_line(skill_id: String, current_level: int) -> String:
	if current_level <= 0:
		return "%s: sin práctica registrada todavía" % WorkDefinitions.skill_name(skill_id)
	if current_level >= WorkDefinitions.SKILL_MAX:
		return "%s: nivel máximo provisional (%d)" % [WorkDefinitions.skill_name(skill_id), current_level]
	return "%s: %d/%d resultados útiles para nivel %d" % [
		WorkDefinitions.skill_name(skill_id), progress(skill_id), threshold_for(current_level), current_level + 1,
	]
