## Modelo de un trabajo concreto sobre un objetivo del mapa. Es un objeto
## de datos puro (sin nodos) para poder probar el tablón y el selector sin
## renderizado. Ver IMPLEMENTATION-002, sección 5.2.
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

## Origen del trabajo: designación de la comunidad u orden directa puntual.
const ORIGIN_COMMUNITY := "community"
const ORIGIN_DIRECT := "direct"

## En esta entrega todos los trabajos usan urgencia normal.
const URGENCY_NORMAL := 1

var id: String = ""
var action_type: String = ""
var action_name: String = ""
var target_id: String = ""
var target_position: Vector3 = Vector3.ZERO
var family_id: String = ""
var required_skill_id: String = ""
var required_skill_level: int = 0
var state: String = STATE_PENDING
var progress: float = 0.0
var duration: float = 1.0
var urgency: int = URGENCY_NORMAL
var assigned_person_id: String = ""
var reserved_by_person_id: String = ""
var origin: String = ORIGIN_COMMUNITY
## Contador monótono de creación; sirve de desempate por tiempo de espera.
var created_at: float = 0.0
var result: String = ""
var block_reason: String = ""

func progress_ratio() -> float:
	if duration <= 0.0:
		return 1.0
	return clampf(progress / duration, 0.0, 1.0)

func state_label() -> String:
	return String(STATE_LABELS.get(state, state))

func is_active() -> bool:
	return state != STATE_COMPLETED and state != STATE_CANCELLED

func is_assignable() -> bool:
	return assigned_person_id == "" and (state == STATE_PENDING or state == STATE_BLOCKED)
