## Las dos evaluaciones causales acotadas de IMPLEMENTATION-004: iniciativa
## de reparación (sección 13) y transgresión de zona de un puesto de guardia
## (sección 14.2). No es un planificador alternativo: recibe los hechos ya
## comprobados por `WorkBoard`/`ThreatService` (habilidad, prioridad,
## necesidades, distancia a zombis, zona, material disponible…) y solo aplica
## el umbral y el desempate exactos del prompt.
class_name AutonomyService
extends RefCounted

const INITIATIVE_MESSAGE := "Ha decidido reparar la defensa dañada antes de que ceda."
const TRANSGRESSION_MESSAGE := "Ha cruzado el límite para interceptar un zombi que amenazaba el acceso."

## `candidates`: Array de {"person_id": String, "skill_level": int,
## "route_length": float}, ya filtrada por el llamador a las personas que
## cumplen las cinco condiciones de la sección 13. Aquí solo se hace el
## desempate: mayor habilidad de construcción, luego menor longitud de ruta
## y, en empate, ID estable. Devuelve "" si no hay candidatos.
static func choose_repair_initiative(candidates: Array) -> String:
	var ordered: Array = candidates.duplicate()
	ordered.sort_custom(func(a, b): return String(a.get("person_id", "")) < String(b.get("person_id", "")))
	var best_id := ""
	var best_skill := -1
	var best_route := INF
	for candidate in ordered:
		var skill: int = int(candidate.get("skill_level", 0))
		var route: float = float(candidate.get("route_length", INF))
		var person_id: String = String(candidate.get("person_id", ""))
		if best_id == "":
			best_id = person_id
			best_skill = skill
			best_route = route
			continue
		if skill != best_skill:
			if skill > best_skill:
				best_id = person_id
				best_skill = skill
				best_route = route
			continue
		if absf(route - best_route) > 0.01:
			if route < best_route:
				best_id = person_id
				best_skill = skill
				best_route = route
	return best_id

## Sección 14.2: las seis condiciones ya evaluadas por el llamador
## (`ThreatService`), para no duplicar consultas de mundo aquí. Devuelve si
## la transgresión debe activarse ahora mismo.
static func can_transgress(
	is_active_guard: bool,
	zombie_within_range: bool,
	zombie_cell_forbidden: bool,
	no_other_zombie_near: bool,
	health_ok: bool,
	route_exists: bool,
	forbidden_depth_ok: bool,
	already_registered_for_contact: bool
) -> bool:
	if already_registered_for_contact:
		return false
	return (
		is_active_guard
		and zombie_within_range
		and zombie_cell_forbidden
		and no_other_zombie_near
		and health_ok
		and route_exists
		and forbidden_depth_ok
	)
