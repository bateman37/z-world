## Niveles de información de lugares y contenido fijo de los edificios
## explorables (WLD-002, sección 3.1). Es solo tabla de datos.
##
## El contenido es fijo y determinista: esta entrega no implementa
## generación procedural (ver IMPLEMENTATION-003, sección 17).
class_name PlaceDefinitions

const LEVEL_UNKNOWN := "unknown"
const LEVEL_SIGHTED := "sighted"
const LEVEL_OBSERVED := "observed"
const LEVEL_INSPECTED := "inspected"
const LEVEL_EXPLOITED := "exploited"

## Orden de progreso de la información conocida.
const LEVELS := [
	LEVEL_UNKNOWN,
	LEVEL_SIGHTED,
	LEVEL_OBSERVED,
	LEVEL_INSPECTED,
	LEVEL_EXPLOITED,
]

const LEVEL_LABELS := {
	LEVEL_UNKNOWN: "No conocido",
	LEVEL_SIGHTED: "Avistado",
	LEVEL_OBSERVED: "Observado",
	LEVEL_INSPECTED: "Inspeccionado",
	LEVEL_EXPLOITED: "Aprovechado",
}

## Qué sabe la comunidad en cada nivel, en términos operativos.
const LEVEL_DESCRIPTIONS := {
	LEVEL_UNKNOWN: "No hay información operativa de este lugar.",
	LEVEL_SIGHTED: "Se conoce su presencia y su aspecto exterior.",
	LEVEL_OBSERVED: "Se han obtenido indicios visibles desde fuera.",
	LEVEL_INSPECTED: "Se conoce su contenido y se puede recoger.",
	LEVEL_EXPLOITED: "Registrado por completo: no queda nada más que encontrar.",
}

## Contenido fijo de los tres edificios explorables de esta entrega. Se
## materializa una sola vez, al inspeccionar el lugar.
const FIXED_CONTENT := {
	"building.shelter_candidate": [
		{"type_id": ResourceDefinitions.TYPE_WOOD_PLANKS, "amount": 4},
		{"type_id": ResourceDefinitions.TYPE_REPAIR_MATERIALS, "amount": 2},
		{"type_id": ResourceDefinitions.TYPE_CLOTH, "amount": 3},
		{"type_id": ResourceDefinitions.TYPE_BASIC_TOOLS, "amount": 1},
		# IMPLEMENTATION-004, sección 12.2: 4 prendas dañadas para el remiendo.
		{"type_id": ResourceDefinitions.TYPE_DAMAGED_CLOTHING, "amount": 4},
	],
	"building.house_a": [
		{"type_id": ResourceDefinitions.TYPE_FOOD_PRESERVED, "amount": 2},
		{"type_id": ResourceDefinitions.TYPE_WATER_CONTAINER, "amount": 2},
		{"type_id": ResourceDefinitions.TYPE_CLOTH, "amount": 3},
		{"type_id": ResourceDefinitions.TYPE_BASIC_MEDICINE, "amount": 1},
	],
	"building.workshop": [
		{"type_id": ResourceDefinitions.TYPE_BASIC_TOOLS, "amount": 2},
		{"type_id": ResourceDefinitions.TYPE_REPAIR_MATERIALS, "amount": 4},
		{"type_id": ResourceDefinitions.TYPE_WOOD_PLANKS, "amount": 3},
		{"type_id": ResourceDefinitions.TYPE_WATER_CONTAINER, "amount": 1},
	],
}

## Indicios que revela «Observar el lugar», antes de poder inspeccionarlo.
const OBSERVED_NOTES := {
	"building.shelter_candidate": "Puerta atrancada por dentro, tejado entero y un hogar utilizable. Parece el mejor candidato a refugio y almacén.",
	"building.house_a": "Cocina visible desde la ventana, con armarios cerrados y un botiquín pequeño en la pared.",
	"building.workshop": "Banco de trabajo, tablones apilados y cajas de herramientas volcadas junto a la entrada.",
	"site.pond_fishing": "Movimiento bajo la superficie del estanque y una orilla firme desde la que trabajar.",
	"site.forest_mushrooms": "Tocones húmedos y hongos agrupados bajo los árboles; no todos son seguros a simple vista.",
	"site.stream_water": "Agua corriente y clara, con acceso fácil desde el camino.",
	"site.highland_spring": "Manantial por encima del nivel del pueblo: una conducción por gravedad sería posible.",
	"site.water_deposit": "Emplazamiento llano junto al refugio, apto para un depósito de agua.",
}

static func level_label(level_id: String) -> String:
	return String(LEVEL_LABELS.get(level_id, level_id))

static func level_description(level_id: String) -> String:
	return String(LEVEL_DESCRIPTIONS.get(level_id, ""))

static func level_index(level_id: String) -> int:
	var index: int = LEVELS.find(level_id)
	return index if index >= 0 else 0

## Compara dos niveles sin asumir que el recorrido es lineal: solo dice si
## la información conocida alcanza al menos un nivel dado.
static func reaches(current_level: String, required_level: String) -> bool:
	return level_index(current_level) >= level_index(required_level)

static func content_for(place_id: String) -> Array:
	return FIXED_CONTENT.get(place_id, [])

static func observed_note(place_id: String) -> String:
	return String(OBSERVED_NOTES.get(place_id, "Sin indicios relevantes."))
