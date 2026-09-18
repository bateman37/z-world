## Catálogo estable de estados de zona territorial (IMPLEMENTATION-004,
## sección 5.1). Es solo tabla de datos: no guarda estado de partida ni
## depende de la escena, igual que `WorkDefinitions` y `ResourceDefinitions`.
class_name ZoneDefinitions

const STATE_HABITUAL := "habitual"
const STATE_CAUTION := "caution"
const STATE_FORBIDDEN := "forbidden"

const STATE_IDS := [STATE_HABITUAL, STATE_CAUTION, STATE_FORBIDDEN]

const STATE_LABELS := {
	STATE_HABITUAL: "Habitual",
	STATE_CAUTION: "Precaución",
	STATE_FORBIDDEN: "Prohibida",
}

## Verde translúcido, ámbar y rojo (sección 5.3). El canal alfa se controla
## en `ZoneOverlay`, no aquí.
const STATE_COLORS := {
	STATE_HABITUAL: Color(0.25, 0.75, 0.35),
	STATE_CAUTION: Color(0.95, 0.72, 0.15),
	STATE_FORBIDDEN: Color(0.85, 0.2, 0.2),
}

const BLOCK_FORBIDDEN := "Zona prohibida"

## Rectángulo mundial habitual inicial (sección 5.1): x = -14…14, z = -2…22.
const INITIAL_HABITUAL_MIN := Vector2(-14.0, -2.0)
const INITIAL_HABITUAL_MAX := Vector2(14.0, 22.0)

static func state_label(state_id: String) -> String:
	return String(STATE_LABELS.get(state_id, state_id))

static func state_color(state_id: String) -> Color:
	return STATE_COLORS.get(state_id, Color.WHITE)
