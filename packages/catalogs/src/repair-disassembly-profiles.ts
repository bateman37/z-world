import type { DisassemblyOutput, RepairRequirement, FunctionalState } from "@z-world/contracts";

/**
 * Recetas de reparación y desmontaje versionadas de S7 (`DEC-0019`, §16.2/
 * §16.3 y CAT-005 §4.3). Datos puros: nunca existe una pila universal
 * `repair_materials` — cada perfil declara familias de recurso concretas.
 * Cubre los perfiles de los cuatro demostradores profundos de CAT-005
 * §3.2 (armario/estantería, frigorífico, bomba de agua manual y
 * carretilla/carro). Las cantidades de desmontaje se expresan en kg de la
 * familia producida y nunca superan el peso de la variante
 * (`validateObjectCatalog`, conservación de masa con tolerancia cero).
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
  {
    // Bomba manual (CAT-005 §3.2): junta/pistón y cuerpo, nunca "materiales de reparación" genéricos.
    id: "repair.technical_installation.hand_pump.v1",
    version: 1,
    requirements: [
      { resourceFamily: "mechanical_parts_i", quantity: 1 },
      { resourceFamily: "sheet_metal", quantity: 1 },
    ],
    bestCaseFunctionalState: "functional",
    baseWorkUnits: 60,
  },
  {
    // Carretilla: rueda/eje (piezas mecánicas I) y chapa de la caja.
    id: "repair.human_transport.wheelbarrow.v1",
    version: 1,
    requirements: [
      { resourceFamily: "mechanical_parts_i", quantity: 1 },
      { resourceFamily: "sheet_metal", quantity: 1 },
    ],
    bestCaseFunctionalState: "functional",
    baseWorkUnits: 40,
  },
  {
    // Carro de compra/mano: ruedas y ejes.
    id: "repair.human_transport.handcart.v1",
    version: 1,
    requirements: [{ resourceFamily: "mechanical_parts_i", quantity: 2 }],
    bestCaseFunctionalState: "functional",
    baseWorkUnits: 40,
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
  {
    // Desmontar la bomba inutiliza el servicio de agua de esa fuente para siempre (CAT-005 §10).
    id: "disassembly.technical_installation.hand_pump.v1",
    version: 1,
    outputs: [
      { resourceFamily: "sheet_metal", selectiveQuantity: 4, destructiveQuantity: 5 },
      { resourceFamily: "mechanical_parts_i", selectiveQuantity: 2, destructiveQuantity: 0 },
    ],
    functionsLost: ["water_pumping"],
    baseWorkUnitsSelective: 90,
    baseWorkUnitsDestructive: 30,
  },
  {
    id: "disassembly.human_transport.wheelbarrow.v1",
    version: 1,
    outputs: [
      { resourceFamily: "sheet_metal", selectiveQuantity: 6, destructiveQuantity: 8 },
      { resourceFamily: "mechanical_parts_i", selectiveQuantity: 2, destructiveQuantity: 1 },
      { resourceFamily: "wood_and_planks", selectiveQuantity: 2, destructiveQuantity: 2 },
    ],
    functionsLost: ["hauling"],
    baseWorkUnitsSelective: 60,
    baseWorkUnitsDestructive: 20,
  },
  {
    id: "disassembly.human_transport.handcart.v1",
    version: 1,
    outputs: [
      { resourceFamily: "sheet_metal", selectiveQuantity: 8, destructiveQuantity: 10 },
      { resourceFamily: "mechanical_parts_i", selectiveQuantity: 3, destructiveQuantity: 1 },
    ],
    functionsLost: ["hauling"],
    baseWorkUnitsSelective: 60,
    baseWorkUnitsDestructive: 20,
  },
  // S9 (Puerta C): mobiliario genérico del generador (mesas, sofás, mostradores, cocinas, estanterías de obra...), capa 2
  // de SET-007: desmontarlo da madera o chapa según su material dominante. 40 kg de peso por defecto; nunca más de lo que pesa.
  {
    id: "disassembly.furniture.generic_wood.v1",
    version: 1,
    outputs: [{ resourceFamily: "wood_and_planks", selectiveQuantity: 16, destructiveQuantity: 22 }],
    functionsLost: [],
    baseWorkUnitsSelective: 60,
    baseWorkUnitsDestructive: 20,
  },
  {
    id: "disassembly.furniture.generic_metal.v1",
    version: 1,
    outputs: [
      { resourceFamily: "sheet_metal", selectiveQuantity: 14, destructiveQuantity: 20 },
      { resourceFamily: "mechanical_parts_i", selectiveQuantity: 1, destructiveQuantity: 0 },
    ],
    functionsLost: [],
    baseWorkUnitsSelective: 60,
    baseWorkUnitsDestructive: 20,
  },
];

/** Mobiliario genérico de material dominante metálico (S9); el resto se desmonta como madera. */
export const GENERIC_METAL_FURNITURE_KINDS: ReadonlySet<string> = new Set([
  "furniture.stove",
  "furniture.fridge",
  "furniture.sink",
  "furniture.tub",
  "furniture.hydraulic_lift",
  "furniture.gate_rail",
  "furniture.locker",
  "furniture.parts_shelf",
  "furniture.pallet_rack",
  "furniture.shelving_unit",
  "furniture.counter_till",
  "furniture.camp_stove_counter",
]);

export function genericFurnitureDisassemblyProfileId(kind: string): string {
  return GENERIC_METAL_FURNITURE_KINDS.has(kind) ? "disassembly.furniture.generic_metal.v1" : "disassembly.furniture.generic_wood.v1";
}

export const DISASSEMBLY_PROFILES_BY_ID: ReadonlyMap<string, DisassemblyProfile> = new Map(DISASSEMBLY_PROFILES.map((p) => [p.id, p]));
