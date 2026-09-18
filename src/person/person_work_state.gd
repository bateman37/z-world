## Estado de trabajo de una persona, separado de su representación visual
## (`Survivor`) para poder probar prioridades, habilidades y elegibilidad
## sin renderizado. No contiene necesidades, salud ni rasgos: esta entrega
## solo cubre trabajo (ver IMPLEMENTATION-002, sección 4.1).
class_name PersonWorkState
extends RefCounted

const STATE_IDLE := "idle"
const STATE_MOVING := "moving"
const STATE_WORKING := "working"
const STATE_DIRECT_ORDER := "direct_order"

const STATE_LABELS := {
	STATE_IDLE: "Inactiva",
	STATE_MOVING: "Desplazándose",
	STATE_WORKING: "Trabajando",
	STATE_DIRECT_ORDER: "Orden directa",
}

const DIRECT_ORDER_MOVE := "move"
const DIRECT_ORDER_WORK := "work"

var id: String = ""
var display_name: String = ""
var priorities: Dictionary = {}
var skills: Dictionary = {}
var operational_state: String = STATE_IDLE
var current_job_id: String = ""
## Orden directa vigente: {} si no hay ninguna, o
## {"kind": "move", "position": Vector3} / {"kind": "work", "target_id": ..., "job_id": ...}
var direct_order: Dictionary = {}
var idle_reason: String = ""
## Última posición conocida en el mundo; la mantiene el actor visual y la
## usa el selector para calcular distancias de ruta.
var position: Vector3 = Vector3.ZERO

func _init(p_id: String = "", p_display_name: String = "") -> void:
	id = p_id
	display_name = p_display_name
	priorities = WorkDefinitions.build_default_priorities()
	skills = WorkDefinitions.build_initial_skills(p_id)

func get_priority(family_id: String) -> int:
	return int(priorities.get(family_id, WorkDefinitions.PRIORITY_MIN))

func set_priority(family_id: String, value: int) -> void:
	if not priorities.has(family_id):
		return
	priorities[family_id] = clampi(value, WorkDefinitions.PRIORITY_MIN, WorkDefinitions.PRIORITY_MAX)

func cycle_priority(family_id: String, increase: bool) -> int:
	if not priorities.has(family_id):
		return WorkDefinitions.PRIORITY_MIN
	var levels: int = WorkDefinitions.PRIORITY_MAX - WorkDefinitions.PRIORITY_MIN + 1
	var current: int = get_priority(family_id)
	var next: int = current + (1 if increase else -1)
	next = WorkDefinitions.PRIORITY_MIN + posmod(next - WorkDefinitions.PRIORITY_MIN, levels)
	priorities[family_id] = next
	return next

func get_skill(skill_id: String) -> int:
	return int(skills.get(skill_id, WorkDefinitions.SKILL_MIN))

func set_skill(skill_id: String, value: int) -> void:
	if not skills.has(skill_id):
		return
	skills[skill_id] = clampi(value, WorkDefinitions.SKILL_MIN, WorkDefinitions.SKILL_MAX)

func has_direct_order() -> bool:
	return not direct_order.is_empty()

func is_busy() -> bool:
	return current_job_id != "" or has_direct_order()

func state_label() -> String:
	return String(STATE_LABELS.get(operational_state, operational_state))

func clear_direct_order() -> void:
	direct_order = {}
