## Punto de defensa seleccionable y visual del refugio (IMPLEMENTATION-004,
## sección 6). Implementa el mismo contrato pequeño de lugar de trabajo que
## `WorkTarget`/`Building` (`site_id`/`site_position`/`site_display_name`) y
## además expone estado, durabilidad y sector para `DefenseService`.
##
## La geometría es deliberadamente sencilla (tablas/barrera de primitivas):
## este corte no incluye modelos artísticos.
class_name DefensePoint
extends StaticBody3D

const STATE_OPEN := "open"
const STATE_INTACT := "intact"
const STATE_DAMAGED := "damaged"
const STATE_DESTROYED := "destroyed"

const STATE_LABELS := {
	STATE_OPEN: "Abierto",
	STATE_INTACT: "Intacto",
	STATE_DAMAGED: "Dañado",
	STATE_DESTROYED: "Destruido",
}

const SECTOR_NORTH := "north"
const SECTOR_SOUTH := "south"
const SECTOR_EAST := "east"
const SECTOR_WEST := "west"

const ID_SOUTH_DOOR := "defense.shelter.south_door"
const ID_EAST_WINDOW := "defense.shelter.east_window"
const ID_WEST_WINDOW := "defense.shelter.west_window"
const ID_NORTH_GAP := "defense.perimeter.north_gap"

## Catálogo fijo de los cuatro puntos (sección 6.1). Es solo tabla de datos;
## el estado real de cada punto vive en la instancia de la escena.
const POINTS := {
	ID_SOUTH_DOOR: {
		"name": "Puerta sur del refugio",
		"position": Vector3(0.0, 0.0, 4.2),
		"action_id": "reinforce_door",
		"action_name": "Reforzar puerta",
		"cost": {"wood_planks": 2, "repair_materials": 1},
		"duration": 10.0,
		"skill_level": 2,
		"max_durability": 80.0,
		"sector": SECTOR_SOUTH,
	},
	ID_EAST_WINDOW: {
		"name": "Ventana este del refugio",
		"position": Vector3(4.2, 0.0, 8.0),
		"action_id": "barricade_window",
		"action_name": "Tapiar ventana",
		"cost": {"wood_planks": 2},
		"duration": 8.0,
		"skill_level": 1,
		"max_durability": 60.0,
		"sector": SECTOR_EAST,
	},
	ID_WEST_WINDOW: {
		"name": "Ventana oeste del refugio",
		"position": Vector3(-4.2, 0.0, 8.0),
		"action_id": "barricade_window",
		"action_name": "Tapiar ventana",
		"cost": {"wood_planks": 2},
		"duration": 8.0,
		"skill_level": 1,
		"max_durability": 60.0,
		"sector": SECTOR_WEST,
	},
	ID_NORTH_GAP: {
		"name": "Hueco norte del perímetro",
		"position": Vector3(0.0, 0.0, 12.2),
		"action_id": "build_basic_wall",
		"action_name": "Construir muro básico",
		"cost": {"wood_planks": 3, "repair_materials": 1},
		"duration": 12.0,
		"skill_level": 2,
		"max_durability": 100.0,
		"sector": SECTOR_NORTH,
	},
}

const SKILL_ID := "construction_carpentry"
const REPAIR_SKILL_LEVEL := 1
const REPAIR_DURATION := 4.0
const REPAIR_COST := {"repair_materials": 1}
const REPAIR_RECOVERY := 30.0

@export var id: String = ""

var defense_state: String = STATE_OPEN
var durability: float = 0.0

@onready var _visual: Node3D = $Visual
@onready var _selectable: Selectable = $Selectable

var _panel_material: StandardMaterial3D = null

static func data(defense_id: String) -> Dictionary:
	return POINTS.get(defense_id, {})

static func max_durability(defense_id: String) -> float:
	return float(data(defense_id).get("max_durability", 1.0))

static func sector(defense_id: String) -> String:
	return String(data(defense_id).get("sector", ""))

static func initial_action_id(defense_id: String) -> String:
	return String(data(defense_id).get("action_id", ""))

func _ready() -> void:
	var info: Dictionary = data(id)
	_selectable.id = id
	_selectable.entity_type = "site"
	_selectable.display_name = String(info.get("name", id))
	_selectable.description = "Punto de defensa del sector %s del refugio." % String(info.get("sector", ""))
	_build_visual()

# --- Contrato de lugar de trabajo -----------------------------------------

func site_id() -> String:
	return id

func site_position() -> Vector3:
	return global_position

func site_kind_id() -> String:
	return "defense"

func site_display_name() -> String:
	return String(data(id).get("name", id))

func state_label() -> String:
	return String(STATE_LABELS.get(defense_state, defense_state))

## `WorkBoard._mark_site_state` llama a esto con los estados genéricos de
## `WorkTarget`; un punto de defensa no cambia su geometría por eso, solo por
## `apply_state`, así que aquí no hace falta nada más que aceptar la llamada.
func set_target_state(_value: String) -> void:
	pass

func max_durability_value() -> float:
	return max_durability(id)

func sector_id() -> String:
	return sector(id)

## Aplica un nuevo estado lógico y actualiza la geometría.
func apply_state(new_state: String, new_durability: float) -> void:
	defense_state = new_state
	durability = clampf(new_durability, 0.0, max_durability_value())
	_apply_visual()

func blocks_path() -> bool:
	return defense_state == STATE_INTACT or defense_state == STATE_DAMAGED

# --- Presentación ----------------------------------------------------------

func _build_visual() -> void:
	for child in _visual.get_children():
		child.queue_free()
	_panel_material = StandardMaterial3D.new()
	_panel_material.albedo_color = Color(0.5, 0.4, 0.3)
	var frame_material := StandardMaterial3D.new()
	frame_material.albedo_color = Color(0.35, 0.3, 0.25)
	_add_box(Vector3(1.6, 0.12, 0.12), Vector3(0.0, 0.0, 0.0), frame_material)
	_add_box(Vector3(0.12, 1.6, 0.12), Vector3(-0.7, 0.8, 0.0), frame_material)
	_add_box(Vector3(0.12, 1.6, 0.12), Vector3(0.7, 0.8, 0.0), frame_material)
	var panel := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = Vector3(1.3, 1.5, 0.08)
	panel.mesh = mesh
	panel.position = Vector3(0.0, 0.75, 0.0)
	panel.material_override = _panel_material
	panel.name = "Panel"
	_visual.add_child(panel)
	_apply_visual()

func _add_box(size: Vector3, offset: Vector3, material: StandardMaterial3D) -> void:
	var mesh := BoxMesh.new()
	mesh.size = size
	var instance := MeshInstance3D.new()
	instance.mesh = mesh
	instance.position = offset
	instance.material_override = material
	_visual.add_child(instance)

func _apply_visual() -> void:
	if not is_instance_valid(_panel_material):
		return
	var panel: Node = _visual.get_node_or_null("Panel")
	match defense_state:
		STATE_OPEN:
			_panel_material.albedo_color = Color(0.5, 0.4, 0.3, 0.15)
			_panel_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
			if panel:
				panel.scale = Vector3(1.0, 1.0, 0.15)
		STATE_INTACT:
			_panel_material.albedo_color = Color(0.55, 0.42, 0.22)
			_panel_material.transparency = BaseMaterial3D.TRANSPARENCY_DISABLED
			if panel:
				panel.scale = Vector3.ONE
		STATE_DAMAGED:
			_panel_material.albedo_color = Color(0.75, 0.55, 0.15)
			_panel_material.transparency = BaseMaterial3D.TRANSPARENCY_DISABLED
			if panel:
				panel.scale = Vector3.ONE
		STATE_DESTROYED:
			_panel_material.albedo_color = Color(0.25, 0.2, 0.18, 0.4)
			_panel_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
			if panel:
				panel.scale = Vector3(1.0, 0.35, 0.15)
