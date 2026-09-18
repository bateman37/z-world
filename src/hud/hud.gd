## HUD mínimo. No conoce reloj, cámara ni selección directamente:
## emite señales de intención y expone funciones `update_*` para que
## Main.gd conecte cada sistema sin acoplar el HUD a ellos.
class_name HUD
extends CanvasLayer

signal pause_pressed()
signal speed_selected(multiplier: float)
signal center_camera_requested()

@onready var _clock_label: Label = %ClockLabel
@onready var _pause_button: Button = %PauseButton
@onready var _speed_x1: Button = %SpeedX1Button
@onready var _speed_x2: Button = %SpeedX2Button
@onready var _speed_x4: Button = %SpeedX4Button
@onready var _speed_x10: Button = %SpeedX10Button
@onready var _center_button: Button = %CenterCameraButton
@onready var _selection_id: Label = %SelectionIdValue
@onready var _selection_type: Label = %SelectionTypeValue
@onready var _selection_name: Label = %SelectionNameValue
@onready var _selection_description: Label = %SelectionDescriptionValue

func _ready() -> void:
	_pause_button.pressed.connect(func() -> void: pause_pressed.emit())
	_speed_x1.pressed.connect(func() -> void: speed_selected.emit(1.0))
	_speed_x2.pressed.connect(func() -> void: speed_selected.emit(2.0))
	_speed_x4.pressed.connect(func() -> void: speed_selected.emit(4.0))
	_speed_x10.pressed.connect(func() -> void: speed_selected.emit(10.0))
	_center_button.pressed.connect(func() -> void: center_camera_requested.emit())
	clear_selection()

func update_clock(day: int, hour: int, minute: int) -> void:
	_clock_label.text = "Día %d, %02d:%02d" % [day, hour, minute]

func update_speed_state(paused: bool, multiplier: float) -> void:
	_pause_button.button_pressed = paused
	_speed_x1.button_pressed = not paused and is_equal_approx(multiplier, 1.0)
	_speed_x2.button_pressed = not paused and is_equal_approx(multiplier, 2.0)
	_speed_x4.button_pressed = not paused and is_equal_approx(multiplier, 4.0)
	_speed_x10.button_pressed = not paused and is_equal_approx(multiplier, 10.0)

func update_selection(info: Dictionary) -> void:
	_selection_id.text = String(info.get("id", ""))
	_selection_type.text = "Persona" if info.get("entity_type", "") == "person" else "Edificio"
	_selection_name.text = String(info.get("display_name", ""))
	_selection_description.text = String(info.get("description", ""))

func clear_selection() -> void:
	_selection_id.text = "—"
	_selection_type.text = "—"
	_selection_name.text = "—"
	_selection_description.text = "Nada seleccionado todavía."
