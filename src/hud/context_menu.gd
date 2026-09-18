## Menú contextual pequeño junto al cursor. Solo muestra las opciones que
## le pasa `Main.gd`; no conoce trabajos ni personas. Consume sus propios
## clics para que no lleguen al mundo.
class_name ContextMenu
extends PanelContainer

signal option_chosen(option_id: String)
signal menu_closed()

const CANCEL_OPTION := "cancel"

@onready var _options_box: VBoxContainer = $Margin/Options

func _ready() -> void:
	visible = false
	mouse_filter = Control.MOUSE_FILTER_STOP

## `options` es una lista de {id, label, enabled, reason}. Siempre se añade
## «Cancelar» al final.
func open(options: Array, screen_position: Vector2, title: String = "") -> void:
	for child in _options_box.get_children():
		child.queue_free()

	if title != "":
		var title_label := Label.new()
		title_label.text = title
		title_label.add_theme_font_size_override("font_size", 14)
		title_label.modulate = Color(1, 1, 1, 0.75)
		_options_box.add_child(title_label)

	for option in options:
		var button := Button.new()
		var label := String(option.get("label", ""))
		var enabled: bool = bool(option.get("enabled", true))
		var reason := String(option.get("reason", ""))
		button.text = label if enabled or reason == "" else "%s — %s" % [label, reason]
		button.disabled = not enabled
		button.tooltip_text = reason
		button.alignment = HORIZONTAL_ALIGNMENT_LEFT
		var option_id := String(option.get("id", ""))
		button.pressed.connect(func() -> void: _choose(option_id))
		_options_box.add_child(button)

	var cancel_button := Button.new()
	cancel_button.text = "Cancelar"
	cancel_button.alignment = HORIZONTAL_ALIGNMENT_LEFT
	cancel_button.pressed.connect(func() -> void: _choose(CANCEL_OPTION))
	_options_box.add_child(cancel_button)

	visible = true
	# Se coloca tras un fotograma para conocer el tamaño real y no salirse
	# de la pantalla.
	position = screen_position
	call_deferred("_clamp_to_screen", screen_position)

func close() -> void:
	if not visible:
		return
	visible = false
	menu_closed.emit()

func _choose(option_id: String) -> void:
	visible = false
	if option_id != CANCEL_OPTION:
		option_chosen.emit(option_id)
	menu_closed.emit()

func _clamp_to_screen(screen_position: Vector2) -> void:
	var viewport_size: Vector2 = get_viewport_rect().size
	var menu_size: Vector2 = size
	var target: Vector2 = screen_position
	target.x = clampf(target.x, 8.0, maxf(8.0, viewport_size.x - menu_size.x - 8.0))
	target.y = clampf(target.y, 8.0, maxf(8.0, viewport_size.y - menu_size.y - 8.0))
	position = target
