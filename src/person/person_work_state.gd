## Estado de trabajo de una persona, separado de su representación visual
## (`Survivor`) para poder probar prioridades, habilidades y elegibilidad
## sin renderizado. Desde IMPLEMENTATION-003 incluye también sus
## necesidades básicas y lo que lleva encima; sigue sin contener salud,
## heridas ni rasgos.
class_name PersonWorkState
extends RefCounted

const STATE_IDLE := "idle"
const STATE_MOVING := "moving"
const STATE_WORKING := "working"
const STATE_DIRECT_ORDER := "direct_order"
## Estados añadidos por IMPLEMENTATION-004 (sección 10): combate cuerpo a
## cuerpo puntual y retirada, ordenada o automática.
const STATE_COMBAT := "combat"
const STATE_RETREATING := "retreating"

const STATE_LABELS := {
	STATE_IDLE: "Inactiva",
	STATE_MOVING: "Desplazándose",
	STATE_WORKING: "Trabajando",
	STATE_DIRECT_ORDER: "Orden directa",
	STATE_COMBAT: "En combate",
	STATE_RETREATING: "Retirándose",
}

const DIRECT_ORDER_MOVE := "move"
const DIRECT_ORDER_WORK := "work"
## Ataque cuerpo a cuerpo puntual (sección 10.2): {"kind": "attack",
## "target_id": zombie_id}.
const DIRECT_ORDER_ATTACK := "attack"
## Retirada ordenada o automática hacia `RALLY_POINT` (sección 10.3).
const DIRECT_ORDER_RETREAT := "retreat"

## Etiqueta interna mínima de la sección 14.1: solo `person.initial.02` la
## posee en esta semilla. No es un sistema de rasgos general.
const TRAIT_PURSUE_IMMEDIATE_THREAT := "pursue_immediate_threat"

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
## Necesidades básicas (hidratación, alimentación y descanso).
var needs: PersonNeeds = null
## Salud y contacto (IMPLEMENTATION-004, sección 9).
var condition: PersonCondition = null
## Práctica de pesca y remiendo (sección 12).
var learning: LearningProgress = null
## Etiquetas mínimas de tendencia (sección 14.1); vacío salvo
## `person.initial.02`.
var traits: Array[String] = []
## Última decisión autónoma registrada (iniciativa o transgresión), para la
## ficha («Decisión reciente»). "" si no hay ninguna vigente.
var recent_decision: String = ""
## Puesto de guardia asignado mientras el trabajo `guard_access` está activo
## o interrumpido por una necesidad; "" si no está de guardia.
var guard_post_id: String = ""
## Zombi con el que está en combate/transgresión en curso, para no repetir
## la decisión de la sección 14.2 durante el mismo contacto.
var _transgression_seen_for: String = ""

func _init(p_id: String = "", p_display_name: String = "") -> void:
	id = p_id
	display_name = p_display_name
	priorities = WorkDefinitions.build_default_priorities()
	skills = WorkDefinitions.build_initial_skills(p_id)
	needs = PersonNeeds.new()
	condition = PersonCondition.new()
	learning = LearningProgress.new()

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

func is_alive() -> bool:
	return condition == null or condition.is_alive()

func has_trait(trait_id: String) -> bool:
	return traits.has(trait_id)

func transgression_registered_for(zombie_id: String) -> bool:
	return _transgression_seen_for == zombie_id

func mark_transgression_for(zombie_id: String) -> void:
	_transgression_seen_for = zombie_id

func clear_transgression_mark() -> void:
	_transgression_seen_for = ""
