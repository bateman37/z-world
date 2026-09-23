import type { BulkClass, HandlingTag, PortabilityKind, WorldObjectFamily } from "@z-world/contracts";

/**
 * Catálogo de variantes de objeto completo de CAT-005 §15.1 (S7, `DEC-0019`).
 * Datos puros versionados: el generador y la resolución consultan aquí los
 * valores base (peso, bulto, etiquetas, capacidad, portabilidad); ninguna
 * lógica vive en este archivo. Cubre las variantes mínimas aprobadas que
 * esta entrega materializa realmente en el generador o en las pertenencias
 * iniciales; el resto de variantes del horizonte queda como deuda honesta
 * documentada en `DEC-0019`.
 */

export interface ObjectCatalogEntry {
  readonly variant: string;
  readonly family: WorldObjectFamily;
  readonly labelKey: string;
  readonly defaultWeightKg: number;
  readonly defaultBulk: BulkClass;
  readonly defaultVolumeLiters: number;
  readonly defaultCapacityUnits: number | null;
  readonly defaultHandlingTags: readonly HandlingTag[];
  readonly portability: PortabilityKind;
  readonly minOperators: number;
}

export const OBJECT_CATALOG_VERSION = "s7-v1" as const;

export const OBJECT_CATALOG: readonly ObjectCatalogEntry[] = [
  { variant: "personal_liquid_container.bottle", family: "personal_liquid_container", labelKey: "object.personal_liquid_container.bottle", defaultWeightKg: 0.6, defaultBulk: "small", defaultVolumeLiters: 1, defaultCapacityUnits: null, defaultHandlingTags: ["liquid"], portability: "handheld", minOperators: 1 },
  { variant: "personal_liquid_container.canteen", family: "personal_liquid_container", labelKey: "object.personal_liquid_container.canteen", defaultWeightKg: 0.5, defaultBulk: "small", defaultVolumeLiters: 1.5, defaultCapacityUnits: null, defaultHandlingTags: ["liquid"], portability: "handheld", minOperators: 1 },
  { variant: "work_container.bucket", family: "work_container", labelKey: "object.work_container.bucket", defaultWeightKg: 1.2, defaultBulk: "medium", defaultVolumeLiters: 10, defaultCapacityUnits: null, defaultHandlingTags: ["liquid"], portability: "handheld", minOperators: 1 },
  { variant: "work_container.jerry_can", family: "work_container", labelKey: "object.work_container.jerry_can", defaultWeightKg: 2, defaultBulk: "medium", defaultVolumeLiters: 12, defaultCapacityUnits: null, defaultHandlingTags: ["liquid", "bulky"], portability: "handheld", minOperators: 1 },
  { variant: "transport_container.backpack", family: "transport_container", labelKey: "object.transport_container.backpack", defaultWeightKg: 1.5, defaultBulk: "medium", defaultVolumeLiters: 30, defaultCapacityUnits: 15, defaultHandlingTags: [], portability: "handheld", minOperators: 1 },
  { variant: "transport_container.sack", family: "transport_container", labelKey: "object.transport_container.sack", defaultWeightKg: 0.6, defaultBulk: "medium", defaultVolumeLiters: 25, defaultCapacityUnits: 12, defaultHandlingTags: [], portability: "handheld", minOperators: 1 },
  { variant: "transport_container.box", family: "transport_container", labelKey: "object.transport_container.box", defaultWeightKg: 1, defaultBulk: "large", defaultVolumeLiters: 40, defaultCapacityUnits: 20, defaultHandlingTags: ["bulky"], portability: "two_person", minOperators: 1 },
  { variant: "storage_furniture.wardrobe", family: "storage_furniture", labelKey: "object.storage_furniture.wardrobe", defaultWeightKg: 45, defaultBulk: "bulky", defaultVolumeLiters: 300, defaultCapacityUnits: 20, defaultHandlingTags: ["bulky"], portability: "two_person", minOperators: 2 },
  { variant: "storage_furniture.shelf", family: "storage_furniture", labelKey: "object.storage_furniture.shelf", defaultWeightKg: 35, defaultBulk: "bulky", defaultVolumeLiters: 250, defaultCapacityUnits: 20, defaultHandlingTags: ["bulky"], portability: "two_person", minOperators: 2 },
  { variant: "storage_furniture.storage_box", family: "storage_furniture", labelKey: "object.storage_furniture.storage_box", defaultWeightKg: 4, defaultBulk: "large", defaultVolumeLiters: 60, defaultCapacityUnits: 15, defaultHandlingTags: ["bulky"], portability: "two_person", minOperators: 1 },
  { variant: "light_source.lantern", family: "light_source", labelKey: "object.light_source.lantern", defaultWeightKg: 0.7, defaultBulk: "small", defaultVolumeLiters: 2, defaultCapacityUnits: null, defaultHandlingTags: ["fragile"], portability: "handheld", minOperators: 1 },
  { variant: "improvised_tool_or_weapon.kitchen_knife", family: "improvised_tool_or_weapon", labelKey: "object.improvised_tool_or_weapon.kitchen_knife", defaultWeightKg: 0.3, defaultBulk: "small", defaultVolumeLiters: 0.5, defaultCapacityUnits: null, defaultHandlingTags: ["fragile"], portability: "handheld", minOperators: 1 },
  { variant: "improvised_tool_or_weapon.hiking_axe", family: "improvised_tool_or_weapon", labelKey: "object.improvised_tool_or_weapon.hiking_axe", defaultWeightKg: 1.1, defaultBulk: "small", defaultVolumeLiters: 1, defaultCapacityUnits: null, defaultHandlingTags: ["long"], portability: "handheld", minOperators: 1 },
  { variant: "improvised_tool_or_weapon.iron_pipe", family: "improvised_tool_or_weapon", labelKey: "object.improvised_tool_or_weapon.iron_pipe", defaultWeightKg: 1.4, defaultBulk: "small", defaultVolumeLiters: 1, defaultCapacityUnits: null, defaultHandlingTags: ["long"], portability: "handheld", minOperators: 1 },
  { variant: "improvised_tool_or_weapon.wood_axe", family: "improvised_tool_or_weapon", labelKey: "object.improvised_tool_or_weapon.wood_axe", defaultWeightKg: 1.6, defaultBulk: "small", defaultVolumeLiters: 1.5, defaultCapacityUnits: null, defaultHandlingTags: ["long"], portability: "handheld", minOperators: 1 },
  { variant: "tool_set.basic", family: "tool_set", labelKey: "object.tool_set.basic", defaultWeightKg: 3, defaultBulk: "small", defaultVolumeLiters: 8, defaultCapacityUnits: null, defaultHandlingTags: [], portability: "handheld", minOperators: 1 },
  { variant: "tool_set.carpentry", family: "tool_set", labelKey: "object.tool_set.carpentry", defaultWeightKg: 5, defaultBulk: "medium", defaultVolumeLiters: 12, defaultCapacityUnits: null, defaultHandlingTags: [], portability: "handheld", minOperators: 1 },
  { variant: "tool_set.mechanics", family: "tool_set", labelKey: "object.tool_set.mechanics", defaultWeightKg: 6, defaultBulk: "medium", defaultVolumeLiters: 12, defaultCapacityUnits: null, defaultHandlingTags: [], portability: "handheld", minOperators: 1 },
  { variant: "tool_set.agriculture", family: "tool_set", labelKey: "object.tool_set.agriculture", defaultWeightKg: 4, defaultBulk: "medium", defaultVolumeLiters: 10, defaultCapacityUnits: null, defaultHandlingTags: ["long"], portability: "handheld", minOperators: 1 },
  { variant: "rest_furniture.mattress", family: "rest_furniture", labelKey: "object.rest_furniture.mattress", defaultWeightKg: 15, defaultBulk: "bulky", defaultVolumeLiters: 400, defaultCapacityUnits: null, defaultHandlingTags: ["bulky"], portability: "two_person", minOperators: 2 },
  { variant: "rest_furniture.bedroll", family: "rest_furniture", labelKey: "object.rest_furniture.bedroll", defaultWeightKg: 2, defaultBulk: "medium", defaultVolumeLiters: 15, defaultCapacityUnits: null, defaultHandlingTags: [], portability: "handheld", minOperators: 1 },
  { variant: "human_transport.wheelbarrow", family: "human_transport", labelKey: "object.human_transport.wheelbarrow", defaultWeightKg: 18, defaultBulk: "bulky", defaultVolumeLiters: 100, defaultCapacityUnits: null, defaultHandlingTags: ["bulky"], portability: "vehicle_required", minOperators: 1 },
  { variant: "human_transport.handcart", family: "human_transport", labelKey: "object.human_transport.handcart", defaultWeightKg: 25, defaultBulk: "bulky", defaultVolumeLiters: 150, defaultCapacityUnits: null, defaultHandlingTags: ["bulky"], portability: "vehicle_required", minOperators: 1 },
];

export const OBJECT_CATALOG_BY_VARIANT: ReadonlyMap<string, ObjectCatalogEntry> = new Map(OBJECT_CATALOG.map((e) => [e.variant, e]));
