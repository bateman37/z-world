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

## Un día simulado equivale a 1200 segundos de juego observables a ×1
## (86400 / 72). Todas las tasas «por día simulado» de IMPLEMENTATION-003 se
## convierten a `gameplay_delta` dividiendo por esta constante.
const SIM_DAY_IN_GAMEPLAY_SECONDS := SIM_SECONDS_PER_DAY / SIM_SECONDS_PER_REAL_SECOND_AT_X1

# --- Almacén, depósito y transporte (IMPLEMENTATION-003, sección 7) --------

## Capacidad total del almacén en unidades de recurso.
const STORAGE_CAPACITY := 50
## Capacidad del depósito de agua localizado.
const WATER_DEPOSIT_CAPACITY := 12
## Unidades máximas que una persona mueve en un solo lote de transporte.
const HAUL_BATCH_MAX := 5
## Unidades de agua que trae cada viaje de acarreo con un recipiente.
const WATER_PER_HAUL_TRIP := 2

# --- Necesidades básicas (sección 8) --------------------------------------

const NEED_MIN := 0.0
const NEED_MAX := 100.0
## Por encima de este valor la necesidad es «normal».
const NEED_WARNED_THRESHOLD := 50.0
## En este valor o por debajo la necesidad es «crítica».
const NEED_CRITICAL_THRESHOLD := 20.0

## Puntos perdidos por día simulado.
const HYDRATION_DECAY_PER_DAY := 40.0
const NUTRITION_DECAY_PER_DAY := 30.0
const REST_DECAY_PER_DAY := 25.0

## Puntos recuperados por una sola acción automática.
const DRINK_RECOVERY := 40.0
const EAT_RECOVERY := 45.0
const REST_RECOVERY := 60.0

# --- Condición y conservación (sección 10) --------------------------------

## Puntos de condición que pierde el alimento fresco por día simulado según
## dónde esté. El alimento conservado no se deteriora en esta entrega.
const FOOD_DECAY_GROUND_PER_DAY := 60.0
const FOOD_DECAY_TRANSPORT_PER_DAY := 45.0
const FOOD_DECAY_STORED_PER_DAY := 25.0

## Secado: 3 unidades de alimento fresco producen 2 de alimento conservado.
const DRYING_INPUT_AMOUNT := 3
const DRYING_OUTPUT_AMOUNT := 2

# --- Fuentes de alimento y agua (secciones 9 y 10) ------------------------

const POND_FISH_TOTAL := 12
const FOREST_MUSHROOM_TOTAL := 8

## Conducción por gravedad: una unidad de agua cada 10 s observables a ×1.
const CONDUCTION_SECONDS_PER_WATER := 10.0

## Plazas de descanso que aporta acondicionar el refugio candidato.
const SHELTER_REST_PLACES := 3
