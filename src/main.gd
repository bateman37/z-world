## Composición de la escena principal: conecta cámara, reloj,
## selección y HUD entre sí. Cada sistema mantiene su propio estado;
## este script solo cablea señales.
extends Node3D

@onready var _camera_rig: StrategicCamera = $CameraRig
@onready var _clock: GameClock = $GameClock
@onready var _selection_manager: SelectionManager = $SelectionManager
@onready var _hud: HUD = $HUDLayer

func _ready() -> void:
	_selection_manager.camera = _camera_rig.get_camera()

	_clock.time_changed.connect(_hud.update_clock)
	_clock.speed_state_changed.connect(_hud.update_speed_state)

	_hud.pause_pressed.connect(_clock.set_paused.bind(true))
	_hud.speed_selected.connect(_clock.set_multiplier)
	_hud.center_camera_requested.connect(_camera_rig.center_camera)

	_selection_manager.selection_changed.connect(_hud.update_selection)
	_selection_manager.selection_cleared.connect(_hud.clear_selection)

	# GameClock ya emitió su estado inicial en su propio _ready(), antes de
	# que este método conectara el HUD; se empuja una vez a mano para que
	# el HUD arranque mostrando Día 1, 08:00 y la velocidad activa reales.
	var initial_time: Dictionary = _clock.get_current_time()
	_hud.update_clock(initial_time.get("day"), initial_time.get("hour"), initial_time.get("minute"))
	_hud.update_speed_state(_clock.paused, _clock.multiplier)
