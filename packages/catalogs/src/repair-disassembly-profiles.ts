import type { DisassemblyOutput, RepairRequirement, FunctionalState } from "@z-world/contracts";

/**
 * Recetas de reparación y desmontaje versionadas de S7 (`DEC-0019`, §16.2/
 * §16.3 y CAT-005 §4.3). Datos puros: nunca existe una pila universal
 * `repair_materials` — cada perfil declara familias de recurso concretas.
 * Cubre, en esta entrega, los perfiles necesarios para los demostradores
 * armario/estantería y frigorífico (§15.6); el resto de familias
 * conceptuales quedan documentadas como deuda honesta en `DEC-0019`.
 */

export interface RepairProfile {
  readonly id: string;
  readonly version: number;
  readonly requirements: readonly RepairRequirement[];
  /** Mejor estado funcional alcanzable por una reparación completa con este perfil. */
  readonly bestCaseFunctionalState: FunctionalState;
  readonly baseWorkUnits: number;
}

export const REPAIR_PROFILES: readonly RepairProfile[] = [
  {
    id: "repair.storage_furniture.wardrobe_shelf.v1",
    version: 1,
    requirements: [{ resourceFamily: "wood_and_planks", quantity: 2 }],
    bestCaseFunctionalState: "functional",
    baseWorkUnits: 45,
  },
  {
    id: "repair.technical_appliance.fridge.v1",
    version: 1,
    requirements: [
      { resourceFamily: "electrical_components_i", quantity: 1 },
      { resourceFamily: "mechanical_parts_i", quantity: 1 },
    ],
    bestCaseFunctionalState: "degraded",
    baseWorkUnits: 90,
  },
];

export const REPAIR_PROFILES_BY_ID: ReadonlyMap<string, RepairProfile> = new Map(REPAIR_PROFILES.map((p) => [p.id, p]));

export interface DisassemblyProfile {
  readonly id: string;
  readonly version: number;
  readonly outputs: readonly DisassemblyOutput[];
  /** Claves de función perdidas para siempre al desmontar, sea selectivo o destructivo (§15.6: "desmontarlo elimina para siempre su función de frigorífico"). */
  readonly functionsLost: readonly string[];
  readonly baseWorkUnitsSelective: number;
  readonly baseWorkUnitsDestructive: number;
}

export const DISASSEMBLY_PROFILES: readonly DisassemblyProfile[] = [
  {
    id: "disassembly.storage_furniture.wardrobe_shelf.v1",
    version: 1,
    outputs: [{ resourceFamily: "wood_and_planks", selectiveQuantity: 6, destructiveQuantity: 8 }],
    functionsLost: ["storage"],
    baseWorkUnitsSelective: 90,
    baseWorkUnitsDestructive: 30,
  },
  {
    id: "disassembly.technical_appliance.fridge.v1",
    version: 1,
    outputs: [
      { resourceFamily: "sheet_metal", selectiveQuantity: 5, destructiveQuantity: 7 },
      { resourceFamily: "wiring", selectiveQuantity: 2, destructiveQuantity: 1 },
      { resourceFamily: "electrical_components_i", selectiveQuantity: 2, destructiveQuantity: 0 },
      { resourceFamily: "electric_motors_ii", selectiveQuantity: 1, destructiveQuantity: 1 },
    ],
    functionsLost: ["refrigeration", "storage"],
    baseWorkUnitsSelective: 150,
    baseWorkUnitsDestructive: 45,
  },
];

export const DISASSEMBLY_PROFILES_BY_ID: ReadonlyMap<string, DisassemblyProfile> = new Map(DISASSEMBLY_PROFILES.map((p) => [p.id, p]));
