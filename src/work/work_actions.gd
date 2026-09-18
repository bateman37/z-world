## Catálogo estable de acciones contextuales de IMPLEMENTATION-003, con su
## familia de prioridad (UI-001), su requisito de habilidad (CHR-001), su
## duración y sus fases de ejecución.
##
## Es solo tabla de datos: no crea trabajos ni aplica efectos. Los trabajos
## los sigue creando `WorkBoard` y los efectos los aplica `WorkExecution`;
## no existe un segundo sistema de trabajos.
class_name WorkActions

# --- Fases ----------------------------------------------------------------

## Desplazarse al lugar de la acción.
const PHASE_TRAVEL := "travel"
## Ejecutar la acción en el lugar.
const PHASE_ACT := "act"
## Desplazarse al destino (almacén o depósito) con la carga.
const PHASE_RETURN := "return"
## Depositar la carga en el destino.
const PHASE_DELIVER := "deliver"

const PHASE_LABELS := {
	PHASE_TRAVEL: "En camino al lugar",
	PHASE_ACT: "Trabajando en el lugar",
	PHASE_RETURN: "Llevando la carga",
	PHASE_DELIVER: "Depositando",
}

## Duración fija de la fase de depósito, en segundos observables a ×1.
const DELIVER_DURATION := 2.0

# --- Acciones -------------------------------------------------------------

const OBSERVE_PLACE := "observe_place"
const INSPECT_PLACE := "inspect_place"
const REGISTER_PLACE := "register_place"
const HAUL_STORAGE := "haul_storage"
const FETCH_WATER := "fetch_water"
const PLAN_CONDUCTION := "plan_conduction"
const BUILD_CONDUCTION := "build_conduction"
const FISH_POND := "fish_pond"
const GATHER_MUSHROOMS := "gather_mushrooms"
const DRY_FOOD := "dry_food"
const PREPARE_REST_AREA := "prepare_rest_area"
const DRINK := "drink"
const EAT := "eat"
const REST := "rest"

## Acciones de defensa, guardia, combate y remiendo (IMPLEMENTATION-004,
## secciones 6, 10.1, 10.2 y 12.2).
const REINFORCE_DOOR := "reinforce_door"
const BARRICADE_WINDOW := "barricade_window"
const BUILD_BASIC_WALL := "build_basic_wall"
const REPAIR_DEFENSE := "repair_defense"
const GUARD_ACCESS := "guard_access"
const MEND_CLOTHING := "mend_clothing"
## Ataque cuerpo a cuerpo puntual: no es una acción designable desde el
## tablón (no tiene lugar fijo, el objetivo es un zombi vivo), pero comparte
## el mismo catálogo de duración/ruido que el resto para no repartir números
## mágicos por varios scripts (sección 8).
const ATTACK_MELEE := "attack_melee"

## Duración de la fase «act» de la guardia continua: deliberadamente enorme
## para que el trabajo nunca complete por progreso (sección 10.1: permanece
## «En guardia» hasta cancelar, ser relevada, retirarse o morir).
const GUARD_ACT_DURATION := 1000000.0

## `requires_level` es el nivel de información mínimo del lugar.
## `exclusive` indica si el lugar solo admite una persona a la vez.
## `automatic` marca las acciones que genera el propio sistema de
## necesidades y que no se designan desde la interfaz.
## `noise_radius` es el radio de ruido causal de la sección 8; 0 si la acción
## no genera ruido (catálogo único, sin números mágicos repartidos).
const ACTIONS := {
	OBSERVE_PLACE: {
		"name": "Observar el lugar",
		"family_id": "explore_recon",
		"skill_id": "observation_inspection",
		"skill_level": 1,
		"duration": 5.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": PlaceDefinitions.LEVEL_SIGHTED,
		"exclusive": true,
		"automatic": false,
	},
	INSPECT_PLACE: {
		"name": "Inspeccionar el lugar",
		"family_id": "search_recover",
		"skill_id": "observation_inspection",
		"skill_level": 2,
		"duration": 10.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": PlaceDefinitions.LEVEL_OBSERVED,
		"exclusive": true,
		"automatic": false,
		"noise_radius": 4.0,
	},
	REGISTER_PLACE: {
		"name": "Registrar el lugar",
		"family_id": "search_recover",
		"skill_id": "search_recovery",
		"skill_level": 2,
		"duration": 12.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": PlaceDefinitions.LEVEL_INSPECTED,
		"exclusive": true,
		"automatic": false,
		"noise_radius": 8.0,
	},
	HAUL_STORAGE: {
		"name": "Transportar al almacén",
		"family_id": "haul_storage",
		"skill_id": "",
		"skill_level": 0,
		"duration": 4.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT, PHASE_RETURN, PHASE_DELIVER],
		"requires_level": "",
		"exclusive": false,
		"automatic": false,
	},
	FETCH_WATER: {
		"name": "Acarrear agua",
		"family_id": "water",
		"skill_id": "",
		"skill_level": 0,
		"duration": 6.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT, PHASE_RETURN, PHASE_DELIVER],
		"requires_level": PlaceDefinitions.LEVEL_OBSERVED,
		"exclusive": false,
		"automatic": false,
	},
	PLAN_CONDUCTION: {
		"name": "Planificar conducción por gravedad",
		"family_id": "water",
		"skill_id": "plumbing_water",
		"skill_level": 2,
		"duration": 12.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": PlaceDefinitions.LEVEL_INSPECTED,
		"exclusive": true,
		"automatic": false,
	},
	BUILD_CONDUCTION: {
		"name": "Construir conducción por gravedad",
		"family_id": "build_repair",
		"skill_id": "construction_carpentry",
		"skill_level": 2,
		"duration": 20.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		# El requisito de información recae sobre el manantial elevado, no
		# sobre el emplazamiento del depósito: lo cubre la planificación.
		"requires_level": "",
		"exclusive": true,
		"automatic": false,
		"noise_radius": 22.0,
	},
	FISH_POND: {
		"name": "Pescar en el estanque",
		"family_id": "food",
		"skill_id": "fishing",
		# Sección 12.1: un principiante puede intentarlo (antes exigía 2).
		"skill_level": 1,
		"duration": 10.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": PlaceDefinitions.LEVEL_INSPECTED,
		"exclusive": true,
		"automatic": false,
	},
	GATHER_MUSHROOMS: {
		"name": "Recolectar hongos",
		"family_id": "food",
		"skill_id": "mushroom_foraging",
		"skill_level": 2,
		"duration": 8.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": PlaceDefinitions.LEVEL_INSPECTED,
		"exclusive": true,
		"automatic": false,
	},
	DRY_FOOD: {
		"name": "Secar alimento fresco",
		"family_id": "prepare_preserve_mend",
		"skill_id": "food_preservation",
		"skill_level": 2,
		"duration": 14.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": PlaceDefinitions.LEVEL_INSPECTED,
		"exclusive": true,
		"automatic": false,
	},
	PREPARE_REST_AREA: {
		"name": "Acondicionar zona de descanso",
		"family_id": "build_repair",
		"skill_id": "construction_carpentry",
		"skill_level": 2,
		"duration": 14.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": PlaceDefinitions.LEVEL_INSPECTED,
		"exclusive": true,
		"automatic": false,
		"noise_radius": 12.0,
	},
	REINFORCE_DOOR: {
		"name": "Reforzar puerta",
		"family_id": "build_repair",
		"skill_id": "construction_carpentry",
		"skill_level": 2,
		"duration": 10.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": "",
		"exclusive": true,
		"automatic": false,
		"noise_radius": 22.0,
	},
	BARRICADE_WINDOW: {
		"name": "Tapiar ventana",
		"family_id": "build_repair",
		"skill_id": "construction_carpentry",
		"skill_level": 1,
		"duration": 8.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": "",
		"exclusive": true,
		"automatic": false,
		"noise_radius": 22.0,
	},
	BUILD_BASIC_WALL: {
		"name": "Construir muro básico",
		"family_id": "build_repair",
		"skill_id": "construction_carpentry",
		"skill_level": 2,
		"duration": 12.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": "",
		"exclusive": true,
		"automatic": false,
		"noise_radius": 22.0,
	},
	REPAIR_DEFENSE: {
		"name": "Reparar defensa",
		"family_id": "build_repair",
		"skill_id": "construction_carpentry",
		"skill_level": 1,
		"duration": 4.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": "",
		"exclusive": true,
		"automatic": false,
		"noise_radius": 12.0,
	},
	GUARD_ACCESS: {
		"name": "Vigilar acceso",
		"family_id": "guard_defense",
		"skill_id": "",
		"skill_level": 0,
		"duration": GUARD_ACT_DURATION,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": "",
		"exclusive": true,
		"automatic": false,
		"noise_radius": 0.0,
		"continuous": true,
	},
	MEND_CLOTHING: {
		"name": "Remendar una prenda",
		"family_id": "prepare_preserve_mend",
		"skill_id": "mending_sewing",
		"skill_level": 1,
		"duration": 14.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": "",
		"exclusive": false,
		"automatic": false,
		"noise_radius": 0.0,
	},
	ATTACK_MELEE: {
		"name": "Atacar cuerpo a cuerpo",
		"family_id": "guard_defense",
		"skill_id": "",
		"skill_level": 0,
		"duration": 0.0,
		"phases": [],
		"requires_level": "",
		"exclusive": false,
		"automatic": false,
		"noise_radius": GameConstants.MELEE_NOISE_RADIUS,
	},
	DRINK: {
		"name": "Beber",
		"family_id": "needs_care",
		"skill_id": "",
		"skill_level": 0,
		"duration": 3.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": "",
		"exclusive": false,
		"automatic": true,
	},
	EAT: {
		"name": "Comer",
		"family_id": "needs_care",
		"skill_id": "",
		"skill_level": 0,
		"duration": 4.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": "",
		"exclusive": false,
		"automatic": true,
	},
	REST: {
		"name": "Descansar",
		"family_id": "needs_care",
		"skill_id": "",
		"skill_level": 0,
		"duration": 10.0,
		"phases": [PHASE_TRAVEL, PHASE_ACT],
		"requires_level": "",
		"exclusive": false,
		"automatic": true,
	},
}

## Acciones que declara cada lugar del mapa local (WLD-002, sección 3.2:
## cada lugar declara qué verbos admite; no todos aparecen en todos).
## «Transportar al almacén» no figura aquí porque se ofrece en cualquier
## lugar que tenga pilas accesibles sin recoger.
const SITE_ACTIONS := {
	"building.shelter_candidate": [OBSERVE_PLACE, INSPECT_PLACE, REGISTER_PLACE, PREPARE_REST_AREA, MEND_CLOTHING],
	"building.house_a": [OBSERVE_PLACE, INSPECT_PLACE, REGISTER_PLACE],
	"building.workshop": [OBSERVE_PLACE, INSPECT_PLACE, REGISTER_PLACE, DRY_FOOD],
	"site.stream_water": [OBSERVE_PLACE, FETCH_WATER],
	"site.pond_fishing": [OBSERVE_PLACE, INSPECT_PLACE, FISH_POND],
	"site.forest_mushrooms": [OBSERVE_PLACE, INSPECT_PLACE, GATHER_MUSHROOMS],
	"site.highland_spring": [OBSERVE_PLACE, INSPECT_PLACE, PLAN_CONDUCTION],
	"site.water_deposit": [BUILD_CONDUCTION],
	## Los cuatro puntos de defensa (sección 6.1) y los dos puestos de guardia
	## (sección 10.1) ofrecen una única acción estática cada uno; los puntos
	## de defensa además dependen del estado real, que `WorkBoard` resuelve
	## dinámicamente con `DefenseService.available_action_for`.
	"defense.shelter.south_door": [REINFORCE_DOOR],
	"defense.shelter.east_window": [BARRICADE_WINDOW],
	"defense.shelter.west_window": [BARRICADE_WINDOW],
	"defense.perimeter.north_gap": [BUILD_BASIC_WALL],
	"guard.post.south": [GUARD_ACCESS],
	"guard.post.east": [GUARD_ACCESS],
}

static func site_actions(site_id: String) -> Array[String]:
	var result: Array[String] = []
	for action_id in SITE_ACTIONS.get(site_id, []):
		result.append(String(action_id))
	return result

static func data(action_id: String) -> Dictionary:
	return ACTIONS.get(action_id, {})

static func action_name(action_id: String) -> String:
	return String(data(action_id).get("name", action_id))

static func family_id(action_id: String) -> String:
	return String(data(action_id).get("family_id", ""))

static func skill_id(action_id: String) -> String:
	return String(data(action_id).get("skill_id", ""))

static func skill_level(action_id: String) -> int:
	return int(data(action_id).get("skill_level", 0))

static func duration(action_id: String) -> float:
	return float(data(action_id).get("duration", 1.0))

## Radio de ruido causal de la sección 8; 0 si la acción no genera ruido.
static func noise_radius(action_id: String) -> float:
	return float(data(action_id).get("noise_radius", 0.0))

## Trabajo continuo (sección 10.1): no completa por progreso acumulado.
static func is_continuous(action_id: String) -> bool:
	return bool(data(action_id).get("continuous", false))

static func required_level(action_id: String) -> String:
	return String(data(action_id).get("requires_level", ""))

static func is_exclusive(action_id: String) -> bool:
	return bool(data(action_id).get("exclusive", true))

static func is_automatic(action_id: String) -> bool:
	return bool(data(action_id).get("automatic", false))

static func phases(action_id: String) -> Array[String]:
	var result: Array[String] = []
	for phase in data(action_id).get("phases", [PHASE_TRAVEL, PHASE_ACT]):
		result.append(String(phase))
	return result

## Duración de cada fase. Las fases de desplazamiento duran lo que tarde la
## persona en llegar, no un tiempo fijo, y por eso valen `0`.
static func phase_durations(action_id: String) -> Array[float]:
	var result: Array[float] = []
	for phase in phases(action_id):
		match phase:
			PHASE_ACT:
				result.append(duration(action_id))
			PHASE_DELIVER:
				result.append(DELIVER_DURATION)
			_:
				result.append(0.0)
	return result

static func phase_label(phase_id: String) -> String:
	return String(PHASE_LABELS.get(phase_id, phase_id))
