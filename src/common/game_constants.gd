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

## Navegación local generada en código (ver `NavigationBuilder`).
const NAV_CELL_SIZE := 1.0
const NAV_AGENT_CLEARANCE := 0.7
const NAV_TREE_RADIUS := 1.3
## Fracción del radio del cono de montaña que se considera intransitable.
const NAV_MOUNTAIN_FOOTPRINT := 0.55

## Movimiento y trabajo. Estas duraciones y velocidades son segundos
## observables a ×1: no usan la conversión de calendario de más abajo.
const PERSON_MOVE_SPEED := 2.4
const PERSON_TURN_SPEED := 6.0
const MOVE_ARRIVAL_RADIUS := 0.6
const WORK_ARRIVAL_RADIUS := 1.6
const WORK_STAND_RADIUS := 1.2
const PERSON_STUCK_SECONDS := 6.0
const WORK_HISTORY_SIZE := 8

const SIM_SECONDS_PER_DAY := 86400.0
const SIM_SECONDS_PER_REAL_SECOND_AT_X1 := 72.0
const CLOCK_START_DAY := 1
const CLOCK_START_HOUR := 8
const CLOCK_START_MINUTE := 0
