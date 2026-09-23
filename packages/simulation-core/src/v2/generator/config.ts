/**
 * Configuración del generador semántico determinista del pueblo (S2 de
 * WEB-002 §7). Centraliza parámetros, unidades y versión (§7.3): nada de
 * lo que sigue lee el reloj del sistema, `Math.random()`, `crypto` ni
 * locale; todo depende exclusivamente de `seed`, `generatorVersion` y este
 * objeto de configuración.
 */

/** Identificador inequívoco de esta versión del generador (§7.1). Cambiarlo nunca reescribe partidas ya generadas con una versión anterior (§7.4/§25.2). */
export const VILLAGE_GENERATOR_VERSION = "web-002-semantic-v1" as const;

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
