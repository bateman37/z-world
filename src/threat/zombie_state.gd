## Estado lógico de un zombi de la población fija (IMPLEMENTATION-004,
## sección 7). Objeto de datos puro, separado de su representación visual
## (`ZombieAgent`), igual que `PersonWorkState` respecto a `Survivor`.
class_name ZombieState
extends RefCounted

const STATE_IDLE := "idle"
const STATE_INVESTIGATING := "investigating_noise"
const STATE_PURSUING := "pursuing"
const STATE_ATTACKING_DEFENSE := "attacking_defense"
const STATE_ATTACKING_PERSON := "attacking_person"
const STATE_DEAD := "dead"

const STATE_LABELS := {
	STATE_IDLE: "En calma",
	STATE_INVESTIGATING: "Investiga un ruido",
	STATE_PURSUING: "Persigue a alguien",
	STATE_ATTACKING_DEFENSE: "Ataca una defensa",
	STATE_ATTACKING_PERSON: "Ataca a una persona",
	STATE_DEAD: "Neutralizado",
}

var id: String = ""
var display_name: String = ""
var position: Vector3 = Vector3.ZERO
var health: float = GameConstants.ZOMBIE_HEALTH
var state: String = STATE_IDLE

## Punto de ruido que está investigando y su margen (radio - distancia) para
## poder compararlo con un ruido nuevo mientras investiga (sección 7.2).
var noise_target: Vector3 = Vector3.ZERO
var noise_margin: float = -INF
## Tiempo que lleva esperando sin encontrar objetivo tras llegar al ruido.
var noise_wait_timer: float = 0.0

## Persona que persigue o ataca, y su última posición conocida.
var target_person_id: String = ""
var last_known_position: Vector3 = Vector3.ZERO
var lost_timer: float = 0.0

## Defensa que le bloquea el paso hacia el asentamiento.
var blocking_defense_id: String = ""

var attack_accumulator: float = 0.0

func is_alive() -> bool:
	return state != STATE_DEAD and health > 0.0

func apply_damage(amount: float) -> bool:
	if amount <= 0.0 or not is_alive():
		return false
	health = clampf(health - amount, 0.0, GameConstants.ZOMBIE_HEALTH)
	if health <= 0.0:
		state = STATE_DEAD
		return true
	return false

func state_label() -> String:
	return String(STATE_LABELS.get(state, state))

func describe() -> String:
	return "Salud: %d/%d (%s)" % [int(round(health)), int(GameConstants.ZOMBIE_HEALTH), state_label()]
