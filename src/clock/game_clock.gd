## Reloj de simulación independiente de Engine.time_scale. Centraliza
## la conversión de tiempo real a tiempo simulado y emite el estado
## actualizado para que cámara, selección y HUD puedan seguir
## respondiendo mientras está pausado.
class_name GameClock
extends Node

signal time_changed(day: int, hour: int, minute: int)
signal speed_state_changed(paused: bool, multiplier: float)

var day: int = GameConstants.CLOCK_START_DAY
var paused: bool = false
var multiplier: float = 1.0

var _seconds_in_day: float = (
	GameConstants.CLOCK_START_HOUR * 3600.0 + GameConstants.CLOCK_START_MINUTE * 60.0
)

var _last_emitted_day: int = -1
var _last_emitted_hour: int = -1
var _last_emitted_minute: int = -1

func _ready() -> void:
	_emit_time(true)
	speed_state_changed.emit(paused, multiplier)

func _process(delta: float) -> void:
	if paused:
		return
	_seconds_in_day += delta * GameConstants.SIM_SECONDS_PER_REAL_SECOND_AT_X1 * multiplier
	while _seconds_in_day >= GameConstants.SIM_SECONDS_PER_DAY:
		_seconds_in_day -= GameConstants.SIM_SECONDS_PER_DAY
		day += 1
	_emit_time(false)

func set_paused(value: bool) -> void:
	paused = value
	speed_state_changed.emit(paused, multiplier)

func set_multiplier(value: float) -> void:
	multiplier = value
	paused = false
	speed_state_changed.emit(paused, multiplier)

func get_current_time() -> Dictionary:
	return {
		"day": day,
		"hour": int(_seconds_in_day / 3600.0) % 24,
		"minute": int(_seconds_in_day / 60.0) % 60,
	}

func _emit_time(force: bool) -> void:
	var hour := int(_seconds_in_day / 3600.0) % 24
	var minute := int(_seconds_in_day / 60.0) % 60
	if force or hour != _last_emitted_hour or minute != _last_emitted_minute or day != _last_emitted_day:
		_last_emitted_day = day
		_last_emitted_hour = hour
		_last_emitted_minute = minute
		time_changed.emit(day, hour, minute)
