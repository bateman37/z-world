## Superviviente visual reutilizable. En esta entrega permanece quieto:
## solo expone identidad y una pequeña variación visual para
## distinguirlo del resto (ver Selectable para selección/contrato).
class_name Survivor
extends StaticBody3D

@export var id: String = ""
@export var display_name: String = ""
@export var description: String = ""
@export var accessory_color: Color = Color(0.8, 0.2, 0.2)

@onready var _accessory: MeshInstance3D = $Accessory
@onready var _selectable: Selectable = $Selectable

func _ready() -> void:
	var material := StandardMaterial3D.new()
	material.albedo_color = accessory_color
	_accessory.material_override = material

	_selectable.id = id
	_selectable.entity_type = "person"
	_selectable.display_name = display_name
	_selectable.description = description
