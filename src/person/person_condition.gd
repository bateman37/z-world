## Estado físico de una persona: salud y contacto (IMPLEMENTATION-004,
## sección 9). Objeto de datos puro, separado de `PersonNeeds` y de la
## escena visual, igual que el resto del modelo de `PersonWorkState`.
##
## No implementa infección, mordeduras diferenciadas, hemorragias,
## enfermedades ni curación: el daño de contacto es una herida básica
## provisional (fuera de alcance, sección 17).
class_name PersonCondition
extends RefCounted

const LABEL_HEALTHY := "Sana"
const LABEL_WOUNDED := "Herida"
const LABEL_CRITICAL := "Crítica"
const LABEL_DECEASED := "Fallecida"

var health: float = 100.0

func _init() -> void:
	health = 100.0

func is_alive() -> bool:
	return health > 0.0

func apply_damage(amount: float) -> void:
	if amount <= 0.0 or not is_alive():
		return
	health = clampf(health - amount, 0.0, 100.0)

func heal(amount: float) -> void:
	if amount <= 0.0 or not is_alive():
		return
	health = clampf(health + amount, 0.0, 100.0)

func is_critical() -> bool:
	return is_alive() and health <= 25.0

func label() -> String:
	if not is_alive():
		return LABEL_DECEASED
	if health <= 25.0:
		return LABEL_CRITICAL
	if health <= 60.0:
		return LABEL_WOUNDED
	return LABEL_HEALTHY

func describe() -> String:
	return "Salud: %d (%s)" % [int(round(health)), label()]
