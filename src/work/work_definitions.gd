## Definiciones estables de familias de prioridad y habilidades.
## Es solo tabla de datos: no guarda estado de partida ni depende de la
## escena, para poder usarse desde lógica pura y desde el HUD.
class_name WorkDefinitions

const PRIORITY_MIN := 0
const PRIORITY_MAX := 4
const PRIORITY_DEFAULT := 2

const SKILL_MIN := 0
const SKILL_MAX := 4
const SKILL_BASE_LEVEL := 1

## Las diez familias de prioridad de UI-001, en orden de presentación.
const PRIORITY_FAMILY_IDS := [
	"needs_care",
	"haul_storage",
	"build_repair",
	"search_recover",
	"explore_recon",
	"water",
	"food",
	"prepare_preserve_mend",
	"healthcare",
	"guard_defense",
]

const PRIORITY_FAMILY_NAMES := {
	"needs_care": "Necesidades y cuidado",
	"haul_storage": "Transporte y almacenamiento",
	"build_repair": "Construcción y reparación",
	"search_recover": "Búsqueda y recuperación",
	"explore_recon": "Exploración y reconocimiento",
	"water": "Obtención de agua",
	"food": "Obtención de alimento",
	"prepare_preserve_mend": "Preparación, conservación y remiendo",
	"healthcare": "Atención sanitaria",
	"guard_defense": "Guardia y defensa",
}

## Las once habilidades iniciales de CHR-001, en orden de presentación.
const SKILL_IDS := [
	"observation_inspection",
	"search_recovery",
	"fishing",
	"mushroom_foraging",
	"tracking_hunting",
	"cooking",
	"food_preservation",
	"mending_sewing",
	"construction_carpentry",
	"plumbing_water",
	"first_aid",
]

const SKILL_NAMES := {
	"observation_inspection": "Observación e inspección",
	"search_recovery": "Búsqueda y recuperación",
	"fishing": "Pesca",
	"mushroom_foraging": "Identificación y recolección de hongos",
	"tracking_hunting": "Rastreo y caza",
	"cooking": "Cocina",
	"food_preservation": "Conservación de alimentos",
	"mending_sewing": "Remiendo y costura",
	"construction_carpentry": "Construcción y carpintería",
	"plumbing_water": "Fontanería y conducción de agua",
	"first_aid": "Primeros auxilios",
}

## Escala provisional 0–4 de implementación (no es la fórmula final de
## progreso: ver CHR-002, que sigue abierto).
const SKILL_LEVEL_LABELS := [
	"Sin experiencia",
	"Principiante",
	"Funcional",
	"Competente",
	"Especialista",
]

## Fortalezas provisionales por persona; el resto de habilidades vale 1.
const INITIAL_SKILL_PROFILES := {
	"person.initial.01": {
		"construction_carpentry": 4,
		"plumbing_water": 2,
		"mending_sewing": 2,
	},
	"person.initial.02": {
		"observation_inspection": 4,
		"tracking_hunting": 3,
		"search_recovery": 2,
	},
	"person.initial.03": {
		"first_aid": 4,
		"observation_inspection": 2,
	},
	"person.initial.04": {
		"cooking": 4,
		"food_preservation": 3,
		"mushroom_foraging": 2,
	},
	"person.initial.05": {
		"fishing": 4,
		"mushroom_foraging": 3,
		"tracking_hunting": 2,
	},
	"person.initial.06": {
		"search_recovery": 4,
		"mending_sewing": 3,
		"construction_carpentry": 2,
	},
}

static func family_name(family_id: String) -> String:
	return String(PRIORITY_FAMILY_NAMES.get(family_id, family_id))

static func skill_name(skill_id: String) -> String:
	return String(SKILL_NAMES.get(skill_id, skill_id))

static func skill_level_label(level: int) -> String:
	var index: int = clampi(level, SKILL_MIN, SKILL_MAX)
	return String(SKILL_LEVEL_LABELS[index])

static func build_default_priorities() -> Dictionary:
	var priorities := {}
	for family_id in PRIORITY_FAMILY_IDS:
		priorities[family_id] = PRIORITY_DEFAULT
	return priorities

static func build_initial_skills(person_id: String) -> Dictionary:
	var skills := {}
	for skill_id in SKILL_IDS:
		skills[skill_id] = SKILL_BASE_LEVEL
	var profile: Dictionary = INITIAL_SKILL_PROFILES.get(person_id, {})
	for skill_id in profile.keys():
		if skills.has(skill_id):
			skills[skill_id] = clampi(int(profile[skill_id]), SKILL_MIN, SKILL_MAX)
	return skills
