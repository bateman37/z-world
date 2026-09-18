## Modelo de un trabajo concreto sobre un lugar del mapa. Es un objeto
## de datos puro (sin nodos) para poder probar el tablón y el selector sin
## renderizado. Ver IMPLEMENTATION-002, sección 5.2, ampliado con fases,
## recursos reservados y destino en IMPLEMENTATION-003, sección 11.
class_name WorkOrder
extends RefCounted

const STATE_PENDING := "pending"
const STATE_RESERVED := "reserved"
const STATE_MOVING := "moving"
const STATE_WORKING := "working"
const STATE_COMPLETED := "completed"
const STATE_CANCELLED := "cancelled"
const STATE_BLOCKED := "blocked"

const STATE_LABELS := {
	STATE_PENDING: "Pendiente",
	STATE_RESERVED: "Reservado",
	STATE_MOVING: "En camino",
	STATE_WORKING: "En ejecución",
	STATE_COMPLETED: "Completado",
	STATE_CANCELLED: "Cancelado",
	STATE_BLOCKED: "Bloqueado",
}

## Origen del trabajo: designación de la comunidad, orden directa puntual o
## necesidad básica generada por el propio sistema.
const ORIGIN_COMMUNITY := "community"
const ORIGIN_DIRECT := "direct"
const ORIGIN_NEED := "need"

const URGENCY_NORMAL := 1
## Las necesidades críticas se atienden antes que cualquier otro trabajo
## automático (UI-001, sección 3.3, punto 2).
const URGENCY_SURVIVAL := 3

var id: String = ""
var action_type: String = ""
var action_name: String = ""
var target_id: String = ""
var target_position: Vector3 = Vector3.ZERO
var family_id: String = ""
var required_skill_id: String = ""
var required_skill_level: int = 0
var state: String = STATE_PENDING
## Tiempo de trabajo acumulado en las fases que consumen tiempo.
var progress: float = 0.0
## Suma de las duraciones de todas las fases del trabajo.
var duration: float = 1.0
var urgency: int = URGENCY_NORMAL
var assigned_person_id: String = ""
var reserved_by_person_id: String = ""
var origin: String = ORIGIN_COMMUNITY
## Contador monótono de creación; sirve de desempate por tiempo de espera.
var created_at: float = 0.0
var result: String = ""
var block_reason: String = ""

# --- Fases, recursos y destino (IMPLEMENTATION-003) -----------------------

var phases: Array[String] = []
var phase_durations: Array[float] = []
var phase_index: int = 0
## Recursos que el trabajo necesita: {type_id: cantidad}.
var required_resources: Dictionary = {}
## Pilas concretas reservadas para este trabajo.
var reserved_stack_ids: Array[String] = []
## Destino de entrega cuando el trabajo tiene fase de retorno.
var destination_id: String = ""
var destination_position: Vector3 = Vector3.ZERO
## Necesidad que este trabajo resuelve, si es un trabajo de necesidad.
var need_id: String = ""
## Persona a la que pertenece en exclusiva un trabajo de necesidad
## personal; "" cuando cualquiera puede tomarlo.
var owner_person_id: String = ""

## Clave estable de reserva: un mismo lugar admite acciones distintas, pero
## nunca dos veces la misma acción a la vez.
static func make_key(p_target_id: String, p_action_type: String) -> String:
	return "%s|%s" % [p_target_id, p_action_type]

## Un trabajo de necesidad personal pertenece a una sola persona, así que
## su clave la incluye: dos personas pueden beber a la vez.
func key() -> String:
	var base: String = make_key(target_id, action_type)
	return base if owner_person_id == "" else "%s|%s" % [base, owner_person_id]

func setup_phases(action_id: String) -> void:
	phases = WorkActions.phases(action_id)
	phase_durations = WorkActions.phase_durations(action_id)
	phase_index = 0
	duration = 0.0
	for phase_duration in phase_durations:
		duration += phase_duration
	if duration <= 0.0:
		duration = 1.0

func current_phase() -> String:
	if phase_index < 0 or phase_index >= phases.size():
		return ""
	return phases[phase_index]

func is_travel_phase() -> bool:
	var phase: String = current_phase()
	return phase == WorkActions.PHASE_TRAVEL or phase == WorkActions.PHASE_RETURN

func is_last_phase() -> bool:
	return phase_index >= phases.size() - 1

## Tiempo de trabajo acumulado al terminar la fase `index`.
func phase_end(index: int) -> float:
	var total := 0.0
	for i in range(mini(index + 1, phase_durations.size())):
		total += phase_durations[i]
	return total

## Progreso que corresponde al inicio de la fase actual; al saltar una fase
## de desplazamiento el progreso no retrocede ni se duplica.
func phase_start_progress() -> float:
	return phase_end(phase_index - 1) if phase_index > 0 else 0.0

func progress_ratio() -> float:
	if duration <= 0.0:
		return 1.0
	return clampf(progress / duration, 0.0, 1.0)

func state_label() -> String:
	return String(STATE_LABELS.get(state, state))

func phase_label() -> String:
	return WorkActions.phase_label(current_phase())

func is_active() -> bool:
	return state != STATE_COMPLETED and state != STATE_CANCELLED

func is_assignable() -> bool:
	return assigned_person_id == "" and (state == STATE_PENDING or state == STATE_BLOCKED)

func is_survival() -> bool:
	return origin == ORIGIN_NEED
