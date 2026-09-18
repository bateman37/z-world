## Historial acotado de sucesos relevantes (IMPLEMENTATION-004, sección 11).
## Deliberadamente pequeño: no es un `event bus` universal, solo una lista
## con fecha y frase en español que cualquier servicio puede rellenar.
class_name GameEventLog
extends RefCounted

signal event_logged(line: String)

## Se antepone al modelo de sucesos: `WorkBoard`/`Main` inyectan el día y la
## hora actuales antes de registrar, para no acoplar este módulo al reloj.
var _entries: Array[String] = []

func log_event(day: int, hour: int, minute: int, text: String) -> void:
	if text == "":
		return
	var line := "Día %d, %02d:%02d — %s" % [day, hour, minute, text]
	_entries.push_front(line)
	while _entries.size() > GameConstants.EVENT_LOG_MAX:
		_entries.pop_back()
	event_logged.emit(line)

func recent(count: int = GameConstants.EVENT_LOG_PANEL_SIZE) -> Array[String]:
	var result: Array[String] = []
	for i in range(mini(count, _entries.size())):
		result.append(_entries[i])
	return result

func all_entries() -> Array[String]:
	return _entries.duplicate()
