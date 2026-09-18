## Información conocida por la comunidad sobre un lugar concreto. Es
## deliberadamente distinta del estado real del lugar (WLD-002, sección 2):
## el contenido fijo existe desde el principio; lo que cambia es cuánto se
## sabe de él y si ya se ha materializado como pilas recogibles.
class_name PlaceInfo
extends RefCounted

var id: String = ""
var display_name: String = ""
## Nivel de información conocida (ver `PlaceDefinitions.LEVELS`).
var level: String = PlaceDefinitions.LEVEL_SIGHTED
## Verdadero desde que el contenido fijo se convirtió en pilas reales.
## Garantiza que la materialización ocurre exactamente una vez.
var content_materialized: bool = false
## Ids de las pilas creadas al materializar el contenido.
var materialized_stack_ids: Array[String] = []
## Indicios revelados al observar; "" mientras no se haya observado.
var notes: String = ""
## Posición en el mundo desde la que se trabaja sobre este lugar.
var position: Vector3 = Vector3.ZERO

func _init(p_id: String = "", p_display_name: String = "") -> void:
	id = p_id
	display_name = p_display_name

func level_label() -> String:
	return PlaceDefinitions.level_label(level)

func level_description() -> String:
	return PlaceDefinitions.level_description(level)

func reaches(required_level: String) -> bool:
	return PlaceDefinitions.reaches(level, required_level)

## Solo avanza el nivel: la información conocida nunca retrocede.
func raise_level(new_level: String) -> bool:
	if PlaceDefinitions.level_index(new_level) <= PlaceDefinitions.level_index(level):
		return false
	level = new_level
	return true

func has_fixed_content() -> bool:
	return not PlaceDefinitions.content_for(id).is_empty()

## Distinción exigida por WLD-002 sección 4 entre «no reconocido» y
## «agotado»: un lugar sin registrar puede esconder algo; uno registrado
## ya no.
func emptiness_text() -> String:
	if not reaches(PlaceDefinitions.LEVEL_INSPECTED):
		return "No reconocemos nada más útil aquí todavía"
	if reaches(PlaceDefinitions.LEVEL_EXPLOITED):
		return "No queda nada: el lugar ya está registrado"
	return "Queda contenido por recoger"
