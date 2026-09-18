## Fuente única de valores compartidos entre cámara, reloj y mundo local.
## Evita duplicar límites y velocidades mágicas en varios scripts.
class_name GameConstants

const MAP_BOUNDS_MIN := Vector2(-34.0, -24.0)
const MAP_BOUNDS_MAX := Vector2(34.0, 24.0)

const CAMERA_ZOOM_MIN := 8.0
const CAMERA_ZOOM_MAX := 40.0
const CAMERA_ZOOM_DEFAULT := 20.0
const CAMERA_ZOOM_STEP := 2.0
const CAMERA_ZOOM_SMOOTHING := 6.0
const CAMERA_PITCH_DEGREES := -50.0
const CAMERA_PAN_SPEED := 0.05

const SHELTER_FOCUS_POSITION := Vector3(0.0, 0.0, 8.0)

const SIM_SECONDS_PER_DAY := 86400.0
const SIM_SECONDS_PER_REAL_SECOND_AT_X1 := 72.0
const CLOCK_START_DAY := 1
const CLOCK_START_HOUR := 8
const CLOCK_START_MINUTE := 0
