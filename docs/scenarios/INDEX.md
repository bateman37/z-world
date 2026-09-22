# scenarios — Escenarios

## Responsabilidad

Registra condiciones iniciales de partida concretas, distintas de las reglas
generales de simulación.

## Qué pertenece aquí

- Condiciones iniciales de partida (punto de partida, no guion).

## Qué no pertenece aquí

- Reglas generales de narrativa emergente: `docs/70-narrative/`.
- Contenido de situaciones concretas futuras (`game_data/`, cuando exista).

## Documentos

| ID | Estado | Propósito |
|---|---|---|
| [SCN-001](SCN-001_mountain-village-arrival.md) | `approved` | Llegada al pueblo de montaña: punto de entrada y síntesis del escenario, condición inicial, no historia obligatoria. |
| [SCN-002](SCN-002_initial-survivor-cohort.md) | `approved` | Cohorte protagonista: seis adultos procedurales, distribución mínima de calibre oculto, cobertura funcional y red de relaciones. |
| [SCN-003](SCN-003_first-day-starting-state.md) | `approved` | Estado de llegada y primera noche: momento exacto, estado físico, pertenencias, refugio provisional, garantías de semilla y amenaza inicial. |

## Dependencias con otros dominios

- `10-vision`, `40-settlement`, `70-narrative`.
- `20-world` (`WLD-009` fija el presupuesto numérico del mapa de este
  escenario; `WLD-005` y `WLD-008` fijan su generación).
- `30-characters` (`CHR-007` registra la distribución mínima de calibre
  de la cohorte protagonista).
- `decisions` (`DEC-0012` registra el contrato transversal del
  escenario).
