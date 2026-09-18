## Fuente finita de recurso localizada (estanque de pesca, claro de hongos
## o punto de agua). Distingue siempre «no reconocido» de «agotado», como
## exige WLD-002 sección 4, y admite una política sencilla de activar o
## detener la obtención continua.
class_name FiniteSource
extends RefCounted

const REASON_NOT_RECOGNISED := "No reconocemos nada más útil aquí todavía: hay que inspeccionar el lugar"
const REASON_EXHAUSTED := "No queda nada: la fuente está agotada"

var id: String = ""
var display_name: String = ""
## Lugar del mapa al que pertenece; su nivel de información decide si la
## fuente está reconocida.
var place_id: String = ""
var type_id: String = ""
var action_id: String = ""
## Unidades obtenidas por cada ejecución de la acción.
var yield_per_action: int = 1
var total: int = 0
var remaining: int = 0
## Una fuente inagotable (el arroyo) nunca se agota.
var unlimited: bool = false
## Política del jugador: mientras esté activa, el tablón regenera el
## trabajo automáticamente al completarse el anterior.
var policy_active: bool = false
## Falso mientras el lugar asociado no esté inspeccionado.
var recognised: bool = false

func _init(p_id: String = "", p_display_name: String = "") -> void:
	id = p_id
	display_name = p_display_name

func is_exhausted() -> bool:
	return not unlimited and remaining <= 0

## Motivo operativo por el que no se puede obtener nada, o "" si se puede.
func block_reason() -> String:
	if not recognised:
		return REASON_NOT_RECOGNISED
	if is_exhausted():
		return REASON_EXHAUSTED
	return ""

## Extrae hasta `amount` unidades y devuelve lo realmente extraído.
func take(amount: int) -> int:
	if amount <= 0 or not recognised:
		return 0
	if unlimited:
		return amount
	var taken: int = mini(amount, remaining)
	remaining -= taken
	return taken

func availability_text() -> String:
	if not recognised:
		return "Sin reconocer"
	if unlimited:
		return "Sin límite conocido"
	return "Quedan %d de %d" % [remaining, total]

func policy_label() -> String:
	return "Detener obtención continua" if policy_active else "Obtener de forma continua"
