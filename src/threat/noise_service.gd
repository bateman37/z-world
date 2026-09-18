## Servicio pequeño de ruido causal y visible (IMPLEMENTATION-004, sección 8).
## No es un mapa acústico: cada emisión es un evento puntual con causa,
## posición, radio y momento de simulación. La atracción de zombis se evalúa
## una sola vez al emitirse (quien escuche `noise_emitted` decide en el
## acto), nunca por fotograma.
##
## El agrupado de 5 segundos afecta solo a si una emisión debe añadir una
## línea nueva al registro de sucesos (`should_log`); nunca a quién oye el
## ruido, que se decide siempre con la emisión real.
class_name NoiseService
extends RefCounted

## {id, cause, position, radius, moment}
signal noise_emitted(noise: Dictionary)

var _serial: int = 0
## Último momento registrado por (causa, celda aproximada de 4m).
var _last_logged: Dictionary = {}

func _group_key(cause: String, position: Vector3) -> String:
	var cell_x: int = int(round(position.x / 4.0))
	var cell_z: int = int(round(position.z / 4.0))
	return "%s|%d|%d" % [cause, cell_x, cell_z]

## Emite un ruido. `moment` es el reloj de simulación acumulado en segundos
## observables a ×1 (día*86400 + hora*3600 + minuto*60) para poder comparar
## momentos sin depender del reloj real.
func emit(cause: String, position: Vector3, radius: float, moment: float) -> Dictionary:
	_serial += 1
	var noise := {
		"id": "noise.%04d" % _serial,
		"cause": cause,
		"position": position,
		"radius": radius,
		"moment": moment,
	}
	noise_emitted.emit(noise)
	return noise

## Si esta emisión debe añadir una línea nueva al registro de sucesos, o si
## queda agrupada con una anterior de la misma causa y zona en los últimos
## `GameConstants.NOISE_LOG_GROUP_SECONDS`.
func should_log(cause: String, position: Vector3, moment: float) -> bool:
	var key: String = _group_key(cause, position)
	var last: float = float(_last_logged.get(key, -INF))
	if moment - last >= GameConstants.NOISE_LOG_GROUP_SECONDS:
		_last_logged[key] = moment
		return true
	return false
