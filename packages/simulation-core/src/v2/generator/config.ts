/**
 * Configuración del generador semántico determinista del pueblo (S2 de
 * WEB-002 §7). Centraliza parámetros, unidades y versión (§7.3): nada de
 * lo que sigue lee el reloj del sistema, `Math.random()`, `crypto` ni
 * locale; todo depende exclusivamente de `seed`, `generatorVersion` y este
 * objeto de configuración.
 */

/** Identificador inequívoco de esta versión del generador (§7.1). Cambiarlo nunca reescribe partidas ya generadas con una versión anterior (§7.4/§25.2). */
export const VILLAGE_GENERATOR_VERSION = "web-002-semantic-v2" as const;

/**
 * Historial de versiones del generador (§5.2 del prompt S7-S9). Una
 * partida conserva siempre la versión con la que se generó; cargarla nunca
 * la regenera ni le añade contenido observable nuevo.
 *
 * - `web-002-semantic-v1` (S2-S6, y los tres primeros commits parciales de
 *   S7): pueblo semántico, refugio con agua/comida/luz/descanso.
 * - `web-002-semantic-v2` (S7, Puerta A): variantes de catálogo concretas
 *   en todo objeto generado; bomba de agua manual instalada sobre la
 *   fuente comunal `ENV-01` con un cubo al pie; carretilla/carro con ciclo
 *   de vida de objeto; alimento fresco con deterioro activo; pertenencias
 *   iniciales de SCN-003 materializadas por persona (el agua y las comidas
 *   que v1 dejaba en el refugio pasan a llevarlas las personas, sin
 *   duplicarse). Los objetos nuevos usan un stream PRNG derivado propio,
 *   así que el trazado espacial de una semilla es idéntico al de v1.
 */
export const PREVIOUS_VILLAGE_GENERATOR_VERSIONS = ["web-002-semantic-v1"] as const;

export interface VillageGeneratorConfig {
  /** Media huella del sector, en metros. 1500 → sector de ~3 × 3 km (§7.1). */
  readonly halfExtentMeters: number;
  /** Resolución de la rejilla de niebla, en metros (idéntica a WEB-001). */
  readonly fogResolutionMeters: number;
}

export const DEFAULT_VILLAGE_GENERATOR_CONFIG: VillageGeneratorConfig = {
  halfExtentMeters: 1500,
  fogResolutionMeters: 5,
};
