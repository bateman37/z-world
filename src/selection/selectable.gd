## Contrato pequeño y común para cualquier entidad seleccionable
## (persona o edificio). Se añade como nodo hijo del cuerpo físico
## que recibe el raycast de selección.
class_name Selectable
extends Node

@export var id: String = ""
@export var entity_type: String = "" # "person" o "building"
@export var display_name: String = ""
@export var description: String = ""
@export var ring_path: NodePath = ^"../SelectionRing"

var _selected := false

func get_info() -> Dictionary:
	return {
		"id": id,
		"entity_type": entity_type,
		"display_name": display_name,
		"description": description,
	}

func set_selected(value: bool) -> void:
	if _selected == value:
		return
	_selected = value
	var ring := get_node_or_null(ring_path)
	if ring:
		ring.visible = value
