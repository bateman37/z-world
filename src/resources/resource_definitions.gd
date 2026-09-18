## Catálogo estable de tipos de recurso y de estados logísticos
## (ver `docs/40-settlement/SET-003_resources-logistics-and-condition.md`).
## Es solo tabla de datos: no guarda estado de partida ni depende de la
## escena, igual que `WorkDefinitions`.
class_name ResourceDefinitions

# --- Estados logísticos (SET-003, sección 3.1) ----------------------------

const LOGISTICS_AVAILABLE := "available"
const LOGISTICS_RESERVED := "reserved"
const LOGISTICS_IN_TRANSPORT := "in_transport"
const LOGISTICS_STORED := "stored"
const LOGISTICS_CONSUMED := "consumed"
const LOGISTICS_LOST := "lost"

const LOGISTICS_STATES := [
	LOGISTICS_AVAILABLE,
	LOGISTICS_RESERVED,
	LOGISTICS_IN_TRANSPORT,
	LOGISTICS_STORED,
	LOGISTICS_CONSUMED,
	LOGISTICS_LOST,
]

const LOGISTICS_LABELS := {
	LOGISTICS_AVAILABLE: "Disponible",
	LOGISTICS_RESERVED: "Reservado",
	LOGISTICS_IN_TRANSPORT: "En transporte",
	LOGISTICS_STORED: "Almacenado",
	LOGISTICS_CONSUMED: "Consumido",
	LOGISTICS_LOST: "Perdido",
}

# --- Tipos de recurso -----------------------------------------------------

const TYPE_WATER := "water"
const TYPE_FOOD_FRESH := "food_fresh"
const TYPE_FOOD_PRESERVED := "food_preserved"
const TYPE_FOOD_SPOILED := "food_spoiled"
const TYPE_WOOD_PLANKS := "wood_planks"
const TYPE_CLOTH := "cloth"
const TYPE_BASIC_TOOLS := "basic_tools"
const TYPE_REPAIR_MATERIALS := "repair_materials"
const TYPE_BASIC_MEDICINE := "basic_medicine"
const TYPE_WATER_CONTAINER := "water_container"
## Undécimo tipo de recurso, añadido por IMPLEMENTATION-004 (sección 12.2)
## para dar contenido real al remiendo.
const TYPE_DAMAGED_CLOTHING := "damaged_clothing"

## Los diez tipos de IMPLEMENTATION-003, en orden de presentación. Cubren la
## lista de SET-003 sección 3.2 salvo la munición inicial, que esta semilla
## no contiene, y añaden dos tipos que el bucle de subsistencia necesita
## explícitamente: alimento echado a perder y recipientes de agua.
const TYPE_IDS := [
	TYPE_WATER,
	TYPE_FOOD_FRESH,
	TYPE_FOOD_PRESERVED,
	TYPE_FOOD_SPOILED,
	TYPE_WOOD_PLANKS,
	TYPE_CLOTH,
	TYPE_BASIC_TOOLS,
	TYPE_REPAIR_MATERIALS,
	TYPE_BASIC_MEDICINE,
	TYPE_WATER_CONTAINER,
	TYPE_DAMAGED_CLOTHING,
]

## `perishable`: pierde condición con el tiempo.
## `drinkable` / `edible`: puede resolver una necesidad automáticamente.
## `deposit`: se almacena en el depósito de agua, no en el almacén general.
const TYPES := {
	TYPE_WATER: {
		"name": "Agua",
		"perishable": false,
		"drinkable": true,
		"edible": false,
		"deposit": true,
	},
	TYPE_FOOD_FRESH: {
		"name": "Alimento fresco",
		"perishable": true,
		"drinkable": false,
		"edible": true,
		"deposit": false,
	},
	TYPE_FOOD_PRESERVED: {
		"name": "Alimento conservado",
		"perishable": false,
		"drinkable": false,
		"edible": true,
		"deposit": false,
	},
	TYPE_FOOD_SPOILED: {
		"name": "Alimento echado a perder",
		"perishable": false,
		"drinkable": false,
		"edible": false,
		"deposit": false,
	},
	TYPE_WOOD_PLANKS: {
		"name": "Madera y tablones",
		"perishable": false,
		"drinkable": false,
		"edible": false,
		"deposit": false,
	},
	TYPE_CLOTH: {
		"name": "Tela y prendas",
		"perishable": false,
		"drinkable": false,
		"edible": false,
		"deposit": false,
	},
	TYPE_BASIC_TOOLS: {
		"name": "Herramientas básicas",
		"perishable": false,
		"drinkable": false,
		"edible": false,
		"deposit": false,
	},
	TYPE_REPAIR_MATERIALS: {
		"name": "Materiales de reparación",
		"perishable": false,
		"drinkable": false,
		"edible": false,
		"deposit": false,
	},
	TYPE_BASIC_MEDICINE: {
		"name": "Medicinas básicas",
		"perishable": false,
		"drinkable": false,
		"edible": false,
		"deposit": false,
	},
	TYPE_WATER_CONTAINER: {
		"name": "Recipientes de agua",
		"perishable": false,
		"drinkable": false,
		"edible": false,
		"deposit": false,
	},
	TYPE_DAMAGED_CLOTHING: {
		"name": "Prendas dañadas",
		"perishable": false,
		"drinkable": false,
		"edible": false,
		"deposit": false,
	},
}

## Ubicaciones lógicas estables usadas por el almacén y el depósito.
const LOCATION_STORAGE := "storage.main"
const LOCATION_WATER_DEPOSIT := "storage.water_deposit"
const LOCATION_CARRIED := "carried"

static func type_name(type_id: String) -> String:
	var data: Dictionary = TYPES.get(type_id, {})
	return String(data.get("name", type_id))

static func is_perishable(type_id: String) -> bool:
	return bool(TYPES.get(type_id, {}).get("perishable", false))

static func is_drinkable(type_id: String) -> bool:
	return bool(TYPES.get(type_id, {}).get("drinkable", false))

static func is_edible(type_id: String) -> bool:
	return bool(TYPES.get(type_id, {}).get("edible", false))

## Un recurso de depósito ocupa el depósito de agua localizado; el resto
## ocupa la capacidad del almacén general.
static func uses_water_deposit(type_id: String) -> bool:
	return bool(TYPES.get(type_id, {}).get("deposit", false))

static func logistics_label(state_id: String) -> String:
	return String(LOGISTICS_LABELS.get(state_id, state_id))

static func storage_location_for(type_id: String) -> String:
	return LOCATION_WATER_DEPOSIT if uses_water_deposit(type_id) else LOCATION_STORAGE
