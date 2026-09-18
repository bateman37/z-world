## Pila de recurso localizada. Es un objeto de datos puro (sin nodos) para
## poder probar reservas, transporte y deterioro sin renderizado.
##
## Cumple el mínimo de SET-003 sección 2: tipo, cantidad, ubicación,
## condición, accesibilidad, portador si aplica y estado de reserva.
class_name ResourceStack
extends RefCounted

var id: String = ""
var type_id: String = ""
var amount: int = 0
## Ubicación lógica: id de un lugar del mapa, `storage.main`,
## `storage.water_deposit` o `carried`.
var location_id: String = ""
## Posición en el mundo desde la que se puede recoger.
var position: Vector3 = Vector3.ZERO
var logistics_state: String = ResourceDefinitions.LOGISTICS_AVAILABLE
## Condición 0–100 para los tipos perecederos; 100 fijo para el resto.
var condition: float = 100.0
## Persona que la tiene reservada o la transporta ("" si ninguna).
var reserved_by_person_id: String = ""
var carrier_person_id: String = ""
## Falso mientras la pila todavía no ha sido descubierta por la comunidad.
var accessible: bool = true

func type_name() -> String:
	return ResourceDefinitions.type_name(type_id)

func logistics_label() -> String:
	return ResourceDefinitions.logistics_label(logistics_state)

func is_perishable() -> bool:
	return ResourceDefinitions.is_perishable(type_id)

func is_active() -> bool:
	if logistics_state == ResourceDefinitions.LOGISTICS_CONSUMED:
		return false
	return logistics_state != ResourceDefinitions.LOGISTICS_LOST

## Una pila se puede tomar para un trabajo si está disponible, accesible y
## no la ha reservado nadie más.
func is_claimable_by(person_id: String) -> bool:
	if not is_active() or not accessible or amount <= 0:
		return false
	var on_hand: bool = logistics_state == ResourceDefinitions.LOGISTICS_AVAILABLE
	on_hand = on_hand or logistics_state == ResourceDefinitions.LOGISTICS_STORED
	if not on_hand:
		return false
	return reserved_by_person_id == "" or reserved_by_person_id == person_id

func condition_label() -> String:
	if not is_perishable():
		return "Estable"
	if condition >= 70.0:
		return "En buen estado"
	if condition >= 35.0:
		return "Empezando a estropearse"
	return "A punto de echarse a perder"

func describe() -> String:
	var text := "%s ×%d · %s" % [type_name(), amount, logistics_label()]
	if is_perishable():
		text += " · condición %d %%" % int(round(condition))
	return text
