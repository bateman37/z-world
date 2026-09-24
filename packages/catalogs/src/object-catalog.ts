import type { BulkClass, HandlingTag, PortabilityKind, ResourceFamily, WorldObjectFamily } from "@z-world/contracts";
import { RESOURCE_FAMILIES, WORLD_OBJECT_FAMILIES } from "@z-world/contracts";

/**
 * Catálogo de variantes de objeto completo de CAT-005 §3.1 (S7, WEB-002
 * §6.1). Datos puros versionados: el generador y la resolución consultan
 * aquí los valores base (peso, bulto, volumen, etiquetas de manipulación,
 * capacidad, portabilidad, funciones, perfiles de transformación y
 * desgaste); ninguna lógica vive en este archivo.
 *
 * Las catorce familias conceptuales de CAT-005 se reparten entre
 * representaciones distintas, sin forzarlas en un único enum (§6.1 del
 * prompt S7-S9): trece son `WorldObjectFamily` (objeto, mueble,
 * instalación, cierre o medio de transporte) y la quinta, «consumible
 * localizado», es `ResourceLot` (ver `CONCEPTUAL_OBJECT_FAMILIES` y
 * `RESOURCE_CATALOG`). Cifras exactas de peso/volumen/capacidad siguen
 * siendo provisionales (CAT-005 §9, pregunta abierta), pero razonables y
 * validadas (`validateObjectCatalog`).
 */

/** Dónde vive cada variante en `SimulationStateV2` (CAT-005 §3.1 ↔ DEC-0015). */
export type ObjectRepresentation = "world_object" | "furniture" | "installed_closure" | "transport_means";

/** Desgaste determinista por uso (S7 §6.2/§6.10): sin azar, solo función del número de usos. */
export interface WearProfile {
  /** Condición perdida por cada uso completo (p. ej. una extracción de agua). */
  readonly perUse: number;
  /** Por debajo de esta condición el objeto queda `broken` con motivo causal explícito. */
  readonly breakdownBelowCondition: number;
  /** Función que se desactiva al averiarse. */
  readonly functionAffected: string;
}

export interface ObjectCatalogEntry {
  readonly variant: string;
  readonly family: WorldObjectFamily;
  readonly representation: ObjectRepresentation;
  readonly labelKey: string;
  readonly defaultWeightKg: number;
  readonly defaultBulk: BulkClass;
  readonly defaultVolumeLiters: number;
  /** Capacidad útil de contención en unidades de `Container` (ver `storageUnitsFor*` en simulation-core), o `null` si no contiene nada. */
  readonly defaultCapacityUnits: number | null;
  /** Capacidad de líquido (litros) para recipientes de líquido, o `null`. */
  readonly liquidCapacityLiters: number | null;
  readonly defaultHandlingTags: readonly HandlingTag[];
  readonly portability: PortabilityKind;
  readonly minOperators: number;
  readonly defaultFunctions: readonly string[];
  readonly repairProfileId: string | null;
  readonly disassemblyProfileId: string | null;
  readonly wear: WearProfile | null;
}

export const OBJECT_CATALOG_VERSION = "s7-v2" as const;

type EntryInput = Omit<ObjectCatalogEntry, "labelKey" | "representation" | "defaultCapacityUnits" | "liquidCapacityLiters" | "defaultFunctions" | "repairProfileId" | "disassemblyProfileId" | "wear" | "minOperators"> &
  Partial<Pick<ObjectCatalogEntry, "representation" | "defaultCapacityUnits" | "liquidCapacityLiters" | "defaultFunctions" | "repairProfileId" | "disassemblyProfileId" | "wear" | "minOperators">>;

function entry(input: EntryInput): ObjectCatalogEntry {
  return {
    representation: "world_object",
    defaultCapacityUnits: null,
    liquidCapacityLiters: null,
    defaultFunctions: [],
    repairProfileId: null,
    disassemblyProfileId: null,
    wear: null,
    minOperators: 1,
    ...input,
    labelKey: `object.${input.variant}`,
  };
}

export const OBJECT_CATALOG: readonly ObjectCatalogEntry[] = [
  // 1. Recipiente personal de líquido.
  entry({ variant: "personal_liquid_container.bottle", family: "personal_liquid_container", defaultWeightKg: 0.1, defaultBulk: "small", defaultVolumeLiters: 1.1, liquidCapacityLiters: 1, defaultHandlingTags: ["liquid"], portability: "handheld", defaultFunctions: ["hold_liquid"] }),
  entry({ variant: "personal_liquid_container.canteen", family: "personal_liquid_container", defaultWeightKg: 0.3, defaultBulk: "small", defaultVolumeLiters: 1.7, liquidCapacityLiters: 1.5, defaultHandlingTags: ["liquid"], portability: "handheld", defaultFunctions: ["hold_liquid"] }),
  // 2. Recipiente de trabajo.
  entry({ variant: "work_container.bucket", family: "work_container", defaultWeightKg: 1.2, defaultBulk: "medium", defaultVolumeLiters: 11, liquidCapacityLiters: 10, defaultHandlingTags: ["liquid"], portability: "handheld", defaultFunctions: ["hold_liquid"] }),
  entry({ variant: "work_container.jerry_can", family: "work_container", defaultWeightKg: 1.2, defaultBulk: "medium", defaultVolumeLiters: 13, liquidCapacityLiters: 12, defaultHandlingTags: ["liquid", "bulky"], portability: "handheld", defaultFunctions: ["hold_liquid"] }),
  entry({ variant: "work_container.drum", family: "work_container", defaultWeightKg: 3.5, defaultBulk: "large", defaultVolumeLiters: 32, liquidCapacityLiters: 30, defaultHandlingTags: ["liquid", "bulky", "keep_upright"], portability: "two_person", minOperators: 1, defaultFunctions: ["hold_liquid"] }),
  entry({ variant: "work_container.cooking_pot", family: "work_container", defaultWeightKg: 0.9, defaultBulk: "medium", defaultVolumeLiters: 3.5, liquidCapacityLiters: 3, defaultHandlingTags: [], portability: "handheld", defaultFunctions: ["hold_liquid", "heat_water"] }),
  // 3. Contenedor de transporte.
  entry({ variant: "transport_container.backpack", family: "transport_container", defaultWeightKg: 1.2, defaultBulk: "medium", defaultVolumeLiters: 30, defaultCapacityUnits: 12, defaultHandlingTags: [], portability: "handheld", defaultFunctions: ["storage"] }),
  entry({ variant: "transport_container.sack", family: "transport_container", defaultWeightKg: 0.4, defaultBulk: "medium", defaultVolumeLiters: 25, defaultCapacityUnits: 10, defaultHandlingTags: [], portability: "handheld", defaultFunctions: ["storage"] }),
  entry({ variant: "transport_container.box", family: "transport_container", defaultWeightKg: 1, defaultBulk: "large", defaultVolumeLiters: 40, defaultCapacityUnits: 16, defaultHandlingTags: ["bulky"], portability: "handheld", defaultFunctions: ["storage"] }),
  // 4. Contenedor/mobiliario de almacenamiento (armario/estantería: demostrador profundo §3.2).
  entry({ variant: "storage_furniture.wardrobe", family: "storage_furniture", representation: "furniture", defaultWeightKg: 45, defaultBulk: "bulky", defaultVolumeLiters: 600, defaultCapacityUnits: 20, defaultHandlingTags: ["bulky"], portability: "two_person", minOperators: 2, defaultFunctions: ["storage"], repairProfileId: "repair.storage_furniture.wardrobe_shelf.v1", disassemblyProfileId: "disassembly.storage_furniture.wardrobe_shelf.v1" }),
  entry({ variant: "storage_furniture.shelf", family: "storage_furniture", representation: "furniture", defaultWeightKg: 35, defaultBulk: "bulky", defaultVolumeLiters: 400, defaultCapacityUnits: 20, defaultHandlingTags: ["bulky", "long"], portability: "two_person", minOperators: 2, defaultFunctions: ["storage"], repairProfileId: "repair.storage_furniture.wardrobe_shelf.v1", disassemblyProfileId: "disassembly.storage_furniture.wardrobe_shelf.v1" }),
  entry({ variant: "storage_furniture.storage_box", family: "storage_furniture", defaultWeightKg: 4, defaultBulk: "large", defaultVolumeLiters: 60, defaultCapacityUnits: 15, defaultHandlingTags: ["bulky"], portability: "two_person", defaultFunctions: ["storage"] }),
  // 6. Fuente portátil de luz (y medio de encendido, SCN-003 §3.5).
  entry({ variant: "light_source.flashlight", family: "light_source", defaultWeightKg: 0.3, defaultBulk: "small", defaultVolumeLiters: 0.4, defaultHandlingTags: [], portability: "handheld", defaultFunctions: ["illumination"] }),
  entry({ variant: "light_source.lantern", family: "light_source", defaultWeightKg: 0.8, defaultBulk: "small", defaultVolumeLiters: 2, defaultHandlingTags: ["fragile", "keep_upright"], portability: "handheld", defaultFunctions: ["illumination"] }),
  entry({ variant: "light_source.lighter", family: "light_source", defaultWeightKg: 0.05, defaultBulk: "small", defaultVolumeLiters: 0.05, defaultHandlingTags: [], portability: "handheld", defaultFunctions: ["ignition"] }),
  // 7. Herramienta o arma improvisada.
  entry({ variant: "improvised_tool_or_weapon.kitchen_knife", family: "improvised_tool_or_weapon", defaultWeightKg: 0.25, defaultBulk: "small", defaultVolumeLiters: 0.3, defaultHandlingTags: [], portability: "handheld", defaultFunctions: ["cutting", "melee"] }),
  entry({ variant: "improvised_tool_or_weapon.pocket_knife", family: "improvised_tool_or_weapon", defaultWeightKg: 0.1, defaultBulk: "small", defaultVolumeLiters: 0.1, defaultHandlingTags: [], portability: "handheld", defaultFunctions: ["cutting"] }),
  entry({ variant: "improvised_tool_or_weapon.hammer", family: "improvised_tool_or_weapon", defaultWeightKg: 0.7, defaultBulk: "small", defaultVolumeLiters: 0.5, defaultHandlingTags: [], portability: "handheld", defaultFunctions: ["striking", "melee"] }),
  entry({ variant: "improvised_tool_or_weapon.crowbar", family: "improvised_tool_or_weapon", defaultWeightKg: 1.8, defaultBulk: "small", defaultVolumeLiters: 0.8, defaultHandlingTags: ["long"], portability: "handheld", defaultFunctions: ["prying", "melee"] }),
  entry({ variant: "improvised_tool_or_weapon.hand_axe", family: "improvised_tool_or_weapon", defaultWeightKg: 1, defaultBulk: "small", defaultVolumeLiters: 0.8, defaultHandlingTags: [], portability: "handheld", defaultFunctions: ["chopping", "melee"] }),
  entry({ variant: "improvised_tool_or_weapon.saw", family: "improvised_tool_or_weapon", defaultWeightKg: 0.8, defaultBulk: "medium", defaultVolumeLiters: 1.5, defaultHandlingTags: ["long"], portability: "handheld", defaultFunctions: ["sawing"] }),
  entry({ variant: "improvised_tool_or_weapon.shovel", family: "improvised_tool_or_weapon", defaultWeightKg: 2, defaultBulk: "medium", defaultVolumeLiters: 4, defaultHandlingTags: ["long"], portability: "handheld", defaultFunctions: ["digging", "melee"] }),
  entry({ variant: "improvised_tool_or_weapon.hoe", family: "improvised_tool_or_weapon", defaultWeightKg: 1.6, defaultBulk: "medium", defaultVolumeLiters: 3, defaultHandlingTags: ["long"], portability: "handheld", defaultFunctions: ["tilling", "melee"] }),
  // Variantes heredadas de la cohorte de WEB-001 (armas de llegada): se conservan para no romper identidades existentes.
  entry({ variant: "improvised_tool_or_weapon.hiking_axe", family: "improvised_tool_or_weapon", defaultWeightKg: 1.1, defaultBulk: "small", defaultVolumeLiters: 1, defaultHandlingTags: ["long"], portability: "handheld", defaultFunctions: ["chopping", "melee"] }),
  entry({ variant: "improvised_tool_or_weapon.iron_pipe", family: "improvised_tool_or_weapon", defaultWeightKg: 1.4, defaultBulk: "small", defaultVolumeLiters: 1, defaultHandlingTags: ["long"], portability: "handheld", defaultFunctions: ["melee"] }),
  entry({ variant: "improvised_tool_or_weapon.wood_axe", family: "improvised_tool_or_weapon", defaultWeightKg: 1.6, defaultBulk: "small", defaultVolumeLiters: 1.5, defaultHandlingTags: ["long"], portability: "handheld", defaultFunctions: ["chopping", "melee"] }),
  // 8. Conjunto de herramientas.
  entry({ variant: "tool_set.basic", family: "tool_set", defaultWeightKg: 3, defaultBulk: "small", defaultVolumeLiters: 8, defaultHandlingTags: [], portability: "handheld", defaultFunctions: ["tools.basic"] }),
  entry({ variant: "tool_set.carpentry", family: "tool_set", defaultWeightKg: 5, defaultBulk: "medium", defaultVolumeLiters: 12, defaultHandlingTags: [], portability: "handheld", defaultFunctions: ["tools.carpentry"] }),
  entry({ variant: "tool_set.mechanics", family: "tool_set", defaultWeightKg: 6, defaultBulk: "medium", defaultVolumeLiters: 12, defaultHandlingTags: [], portability: "handheld", defaultFunctions: ["tools.mechanics"] }),
  entry({ variant: "tool_set.agriculture", family: "tool_set", defaultWeightKg: 4, defaultBulk: "medium", defaultVolumeLiters: 10, defaultHandlingTags: ["long"], portability: "handheld", defaultFunctions: ["tools.agriculture"] }),
  // 9. Soporte de descanso.
  entry({ variant: "rest_furniture.mattress", family: "rest_furniture", defaultWeightKg: 15, defaultBulk: "bulky", defaultVolumeLiters: 400, defaultHandlingTags: ["bulky"], portability: "two_person", minOperators: 2, defaultFunctions: ["rest"] }),
  entry({ variant: "rest_furniture.simple_bed", family: "rest_furniture", representation: "furniture", defaultWeightKg: 30, defaultBulk: "bulky", defaultVolumeLiters: 800, defaultHandlingTags: ["bulky"], portability: "two_person", minOperators: 2, defaultFunctions: ["rest"] }),
  entry({ variant: "rest_furniture.bedroll", family: "rest_furniture", defaultWeightKg: 2, defaultBulk: "medium", defaultVolumeLiters: 15, defaultHandlingTags: [], portability: "handheld", defaultFunctions: ["rest"] }),
  // 10. Puesto de trabajo.
  entry({ variant: "workbench.workbench", family: "workbench", representation: "furniture", defaultWeightKg: 60, defaultBulk: "bulky", defaultVolumeLiters: 900, defaultHandlingTags: ["bulky", "long"], portability: "two_person", minOperators: 2, defaultFunctions: ["work_surface"] }),
  // 11. Aparato técnico completo (frigorífico: demostrador profundo §3.2).
  entry({ variant: "technical_appliance.fridge", family: "technical_appliance", representation: "furniture", defaultWeightKg: 65, defaultBulk: "bulky", defaultVolumeLiters: 450, defaultCapacityUnits: 15, defaultHandlingTags: ["bulky", "keep_upright"], portability: "two_person", minOperators: 2, defaultFunctions: ["storage"], repairProfileId: "repair.technical_appliance.fridge.v1", disassemblyProfileId: "disassembly.technical_appliance.fridge.v1" }),
  // 12. Instalación técnica (bomba de agua: demostrador profundo §3.2).
  entry({
    variant: "technical_installation.hand_pump",
    family: "technical_installation",
    defaultWeightKg: 28,
    defaultBulk: "bulky",
    defaultVolumeLiters: 60,
    defaultHandlingTags: ["bulky", "long"],
    portability: "fixed",
    minOperators: 1,
    defaultFunctions: ["water_pumping"],
    repairProfileId: "repair.technical_installation.hand_pump.v1",
    disassemblyProfileId: "disassembly.technical_installation.hand_pump.v1",
    wear: { perUse: 0.06, breakdownBelowCondition: 0.25, functionAffected: "water_pumping" },
  }),
  // 13. Cierre instalado (vive como `InstalledClosure` en `world.installedClosures`; su explotación es S9).
  entry({ variant: "installed_closure_object.door", family: "installed_closure_object", representation: "installed_closure", defaultWeightKg: 25, defaultBulk: "bulky", defaultVolumeLiters: 100, defaultHandlingTags: ["bulky", "long"], portability: "two_person", minOperators: 1, defaultFunctions: ["closure"] }),
  entry({ variant: "installed_closure_object.gate", family: "installed_closure_object", representation: "installed_closure", defaultWeightKg: 60, defaultBulk: "bulky", defaultVolumeLiters: 300, defaultHandlingTags: ["bulky", "long"], portability: "two_person", minOperators: 2, defaultFunctions: ["closure"] }),
  // 14. Transporte humano (carretilla/carro: demostrador profundo §3.2; vive como `TransportMeans`).
  entry({
    variant: "human_transport.wheelbarrow",
    family: "human_transport",
    representation: "transport_means",
    defaultWeightKg: 18,
    defaultBulk: "bulky",
    defaultVolumeLiters: 100,
    defaultHandlingTags: ["bulky"],
    portability: "handheld",
    defaultFunctions: ["hauling"],
    repairProfileId: "repair.human_transport.wheelbarrow.v1",
    disassemblyProfileId: "disassembly.human_transport.wheelbarrow.v1",
    wear: { perUse: 0.03, breakdownBelowCondition: 0.2, functionAffected: "hauling" },
  }),
  entry({
    variant: "human_transport.handcart",
    family: "human_transport",
    representation: "transport_means",
    defaultWeightKg: 25,
    defaultBulk: "bulky",
    defaultVolumeLiters: 150,
    defaultHandlingTags: ["bulky"],
    portability: "handheld",
    defaultFunctions: ["hauling"],
    repairProfileId: "repair.human_transport.handcart.v1",
    disassemblyProfileId: "disassembly.human_transport.handcart.v1",
    wear: { perUse: 0.025, breakdownBelowCondition: 0.2, functionAffected: "hauling" },
  }),
];

export const OBJECT_CATALOG_BY_VARIANT: ReadonlyMap<string, ObjectCatalogEntry> = new Map(OBJECT_CATALOG.map((e) => [e.variant, e]));

/** Variante de catálogo correspondiente a cada método de `TransportMeans` (S7). */
export const TRANSPORT_MEANS_VARIANT_BY_METHOD: Readonly<Record<"wheelbarrow" | "handcart", string>> = {
  wheelbarrow: "human_transport.wheelbarrow",
  handcart: "human_transport.handcart",
};

/**
 * Consumibles localizados y materiales (CAT-005 §3.1 fila 5 y §4.2): viven
 * como `ResourceLot`, nunca como objeto completo ni como pila universal.
 * `perishable` marca los lotes con deterioro temporal activo en S7
 * (`decay-tuning.ts`).
 */
export interface ResourceCatalogEntry {
  readonly family: ResourceFamily;
  readonly labelKey: string;
  readonly unit: "liter" | "kilogram" | "unit";
  readonly kgPerUnit: number;
  readonly role: "localized_consumable" | "material";
  readonly perishable: boolean;
}

export const RESOURCE_CATALOG: readonly ResourceCatalogEntry[] = [
  { family: "water", labelKey: "resource.water", unit: "liter", kgPerUnit: 1, role: "localized_consumable", perishable: false },
  { family: "fresh_food", labelKey: "resource.fresh_food", unit: "unit", kgPerUnit: 0.4, role: "localized_consumable", perishable: true },
  { family: "preserved_food", labelKey: "resource.preserved_food", unit: "unit", kgPerUnit: 0.4, role: "localized_consumable", perishable: false },
  { family: "healing_material", labelKey: "resource.healing_material", unit: "unit", kgPerUnit: 0.3, role: "localized_consumable", perishable: false },
  { family: "seeds", labelKey: "resource.seeds", unit: "kilogram", kgPerUnit: 1, role: "localized_consumable", perishable: false },
  { family: "wood_and_planks", labelKey: "resource.wood_and_planks", unit: "kilogram", kgPerUnit: 1, role: "material", perishable: false },
  { family: "sheet_metal", labelKey: "resource.sheet_metal", unit: "kilogram", kgPerUnit: 1, role: "material", perishable: false },
  { family: "wiring", labelKey: "resource.wiring", unit: "kilogram", kgPerUnit: 1, role: "material", perishable: false },
  { family: "electrical_components_i", labelKey: "resource.electrical_components_i", unit: "kilogram", kgPerUnit: 1, role: "material", perishable: false },
  { family: "mechanical_parts_i", labelKey: "resource.mechanical_parts_i", unit: "kilogram", kgPerUnit: 1, role: "material", perishable: false },
  { family: "electric_motors_ii", labelKey: "resource.electric_motors_ii", unit: "kilogram", kgPerUnit: 1, role: "material", perishable: false },
  // S9 (Puerta C): materiales de instalaciones, acabados y estructura de edificios (CAT-002 §3.6-§3.9).
  { family: "piping", labelKey: "resource.piping", unit: "kilogram", kgPerUnit: 1, role: "material", perishable: false },
  { family: "glass", labelKey: "resource.glass", unit: "kilogram", kgPerUnit: 1, role: "material", perishable: false },
  { family: "ceramics", labelKey: "resource.ceramics", unit: "kilogram", kgPerUnit: 1, role: "material", perishable: false },
  { family: "masonry", labelKey: "resource.masonry", unit: "kilogram", kgPerUnit: 1, role: "material", perishable: false },
  { family: "roof_tiles", labelKey: "resource.roof_tiles", unit: "kilogram", kgPerUnit: 1, role: "material", perishable: false },
  { family: "structural_steel", labelKey: "resource.structural_steel", unit: "kilogram", kgPerUnit: 1, role: "material", perishable: false },
  { family: "rubble", labelKey: "resource.rubble", unit: "kilogram", kgPerUnit: 1, role: "material", perishable: false },
];

export const RESOURCE_CATALOG_BY_FAMILY: ReadonlyMap<ResourceFamily, ResourceCatalogEntry> = new Map(RESOURCE_CATALOG.map((e) => [e.family, e]));

/** Las catorce familias conceptuales exactas de CAT-005 §3.1, con su representación real y variantes mínimas exigidas. */
export interface ConceptualFamilyEntry {
  readonly id: string;
  readonly labelKey: string;
  readonly representation: "world_object_family" | "resource_lot";
  /** Familia `WorldObjectFamily` cuando `representation === "world_object_family"`. */
  readonly worldObjectFamily: WorldObjectFamily | null;
  /** Variantes mínimas de CAT-005 §3.1 (o familias de recurso para el consumible localizado) que deben existir en el catálogo. */
  readonly requiredVariants: readonly string[];
}

export const CONCEPTUAL_OBJECT_FAMILIES: readonly ConceptualFamilyEntry[] = [
  { id: "personal_liquid_container", labelKey: "family.personal_liquid_container", representation: "world_object_family", worldObjectFamily: "personal_liquid_container", requiredVariants: ["personal_liquid_container.bottle", "personal_liquid_container.canteen"] },
  { id: "work_container", labelKey: "family.work_container", representation: "world_object_family", worldObjectFamily: "work_container", requiredVariants: ["work_container.bucket", "work_container.drum", "work_container.jerry_can"] },
  { id: "transport_container", labelKey: "family.transport_container", representation: "world_object_family", worldObjectFamily: "transport_container", requiredVariants: ["transport_container.backpack", "transport_container.sack", "transport_container.box"] },
  { id: "storage_furniture", labelKey: "family.storage_furniture", representation: "world_object_family", worldObjectFamily: "storage_furniture", requiredVariants: ["storage_furniture.wardrobe", "storage_furniture.shelf", "storage_furniture.storage_box"] },
  { id: "localized_consumable", labelKey: "family.localized_consumable", representation: "resource_lot", worldObjectFamily: null, requiredVariants: ["water", "fresh_food", "preserved_food", "healing_material", "seeds"] },
  { id: "light_source", labelKey: "family.light_source", representation: "world_object_family", worldObjectFamily: "light_source", requiredVariants: ["light_source.flashlight", "light_source.lantern"] },
  {
    id: "improvised_tool_or_weapon",
    labelKey: "family.improvised_tool_or_weapon",
    representation: "world_object_family",
    worldObjectFamily: "improvised_tool_or_weapon",
    requiredVariants: [
      "improvised_tool_or_weapon.kitchen_knife",
      "improvised_tool_or_weapon.hammer",
      "improvised_tool_or_weapon.crowbar",
      "improvised_tool_or_weapon.hand_axe",
      "improvised_tool_or_weapon.saw",
      "improvised_tool_or_weapon.shovel",
      "improvised_tool_or_weapon.hoe",
    ],
  },
  { id: "tool_set", labelKey: "family.tool_set", representation: "world_object_family", worldObjectFamily: "tool_set", requiredVariants: ["tool_set.basic", "tool_set.carpentry", "tool_set.mechanics", "tool_set.agriculture"] },
  { id: "rest_furniture", labelKey: "family.rest_furniture", representation: "world_object_family", worldObjectFamily: "rest_furniture", requiredVariants: ["rest_furniture.mattress", "rest_furniture.simple_bed"] },
  { id: "workbench", labelKey: "family.workbench", representation: "world_object_family", worldObjectFamily: "workbench", requiredVariants: ["workbench.workbench"] },
  { id: "technical_appliance", labelKey: "family.technical_appliance", representation: "world_object_family", worldObjectFamily: "technical_appliance", requiredVariants: ["technical_appliance.fridge"] },
  { id: "technical_installation", labelKey: "family.technical_installation", representation: "world_object_family", worldObjectFamily: "technical_installation", requiredVariants: ["technical_installation.hand_pump"] },
  { id: "installed_closure_object", labelKey: "family.installed_closure_object", representation: "world_object_family", worldObjectFamily: "installed_closure_object", requiredVariants: ["installed_closure_object.door", "installed_closure_object.gate"] },
  { id: "human_transport", labelKey: "family.human_transport", representation: "world_object_family", worldObjectFamily: "human_transport", requiredVariants: ["human_transport.wheelbarrow", "human_transport.handcart"] },
];

/**
 * Variante de catálogo S7 para los `labelKey` de pertenencias heredados de
 * la cohorte de WEB-001 (`PossessionItem.labelKey`). Pura correspondencia
 * de datos: la identidad (`id`) del objeto nunca cambia.
 */
export const POSSESSION_LABEL_TO_VARIANT: Readonly<Record<string, string>> = {
  "possession.kitchen_knife": "improvised_tool_or_weapon.kitchen_knife",
  "possession.hiking_axe": "improvised_tool_or_weapon.hiking_axe",
  "possession.iron_pipe": "improvised_tool_or_weapon.iron_pipe",
  "possession.wood_axe": "improvised_tool_or_weapon.wood_axe",
  "possession.personal_pack": "transport_container.backpack",
};

export interface ObjectCatalogReport {
  readonly ok: boolean;
  readonly problems: readonly string[];
}

/**
 * Valida la coherencia del catálogo de objetos S7: las catorce familias
 * conceptuales con todas sus variantes mínimas, cada `WorldObjectFamily`
 * cubierta, variantes únicas y con prefijo de familia, cifras físicas
 * razonables, y conservación de masa de cada perfil de desmontaje frente
 * al peso de la variante (ningún desmontaje fabrica más de lo que pesa).
 */
export function validateObjectCatalog(disassemblyOutputsById: ReadonlyMap<string, readonly { readonly selectiveQuantity: number; readonly destructiveQuantity: number }[]>, knownProfileIds: ReadonlySet<string>): ObjectCatalogReport {
  const problems: string[] = [];
  if (CONCEPTUAL_OBJECT_FAMILIES.length !== 14) problems.push(`Se esperaban 14 familias conceptuales, hay ${CONCEPTUAL_OBJECT_FAMILIES.length}.`);

  const seenVariants = new Set<string>();
  for (const e of OBJECT_CATALOG) {
    if (seenVariants.has(e.variant)) problems.push(`Variante duplicada: ${e.variant}.`);
    seenVariants.add(e.variant);
    if (!e.variant.startsWith(`${e.family}.`)) problems.push(`La variante ${e.variant} no lleva el prefijo de su familia ${e.family}.`);
    if (e.defaultWeightKg <= 0) problems.push(`Peso no positivo en ${e.variant}.`);
    if (e.defaultVolumeLiters <= 0) problems.push(`Volumen no positivo en ${e.variant}.`);
    if (e.defaultCapacityUnits !== null && e.defaultCapacityUnits <= 0) problems.push(`Capacidad no positiva en ${e.variant}.`);
    if (e.liquidCapacityLiters !== null && e.liquidCapacityLiters >= e.defaultVolumeLiters + 0.001) problems.push(`La capacidad de líquido de ${e.variant} supera su propio volumen.`);
    if (e.defaultBulk === "small" && e.defaultWeightKg > 5) problems.push(`${e.variant} es 'small' pero pesa ${e.defaultWeightKg} kg.`);
    if (e.minOperators < 1) problems.push(`minOperators inválido en ${e.variant}.`);
    for (const profileId of [e.repairProfileId, e.disassemblyProfileId]) {
      if (profileId && !knownProfileIds.has(profileId)) problems.push(`${e.variant} referencia un perfil inexistente: ${profileId}.`);
    }
    if (e.disassemblyProfileId) {
      const outputs = disassemblyOutputsById.get(e.disassemblyProfileId) ?? [];
      const selective = outputs.reduce((acc, o) => acc + o.selectiveQuantity, 0);
      const destructive = outputs.reduce((acc, o) => acc + o.destructiveQuantity, 0);
      if (selective > e.defaultWeightKg || destructive > e.defaultWeightKg) problems.push(`El desmontaje de ${e.variant} produciría más masa (${Math.max(selective, destructive)} kg) de la que pesa (${e.defaultWeightKg} kg).`);
    }
  }

  const coveredFamilies = new Set(OBJECT_CATALOG.map((e) => e.family));
  for (const family of WORLD_OBJECT_FAMILIES) {
    if (!coveredFamilies.has(family)) problems.push(`La familia ${family} no tiene ninguna variante en el catálogo.`);
  }

  const resourceFamilies = new Set<string>(RESOURCE_CATALOG.map((r) => r.family));
  for (const family of RESOURCE_FAMILIES) {
    if (!resourceFamilies.has(family)) problems.push(`La familia de recurso ${family} no está en RESOURCE_CATALOG.`);
  }

  for (const conceptual of CONCEPTUAL_OBJECT_FAMILIES) {
    for (const variant of conceptual.requiredVariants) {
      const present = conceptual.representation === "resource_lot" ? resourceFamilies.has(variant) : seenVariants.has(variant);
      if (!present) problems.push(`Falta la variante mínima ${variant} de la familia conceptual ${conceptual.id}.`);
    }
    if (conceptual.worldObjectFamily && !coveredFamilies.has(conceptual.worldObjectFamily)) problems.push(`La familia conceptual ${conceptual.id} no tiene representación en OBJECT_CATALOG.`);
  }

  return { ok: problems.length === 0, problems };
}
