import { z } from "zod";
import { entityLocationSchema, type EntityLocation } from "./location-v2.js";

/**
 * Objetos, contenedores y recursos mínimos de WEB-002 §6.3/§15. Forma
 * esquelética (S1): el catálogo de 14 familias y los cuatro demostradores
 * profundos llegan con comportamiento real en S7.
 */

export const FUNCTIONAL_STATES = [
  "functional",
  "degraded",
  "broken",
  "incomplete",
  "repairable",
  "irreparable",
  "parts_only",
] as const;
export type FunctionalState = (typeof FUNCTIONAL_STATES)[number];
export const functionalStateSchema = z.enum(FUNCTIONAL_STATES);

export interface Furniture {
  readonly id: string;
  readonly roomId: string;
  readonly kind: string;
  readonly condition: number;
  readonly functionalState: FunctionalState;
}

export const furnitureSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  kind: z.string(),
  condition: z.number().min(0).max(1),
  functionalState: functionalStateSchema,
});

export interface Container {
  readonly id: string;
  readonly location: EntityLocation;
  readonly capacityUnits: number;
  readonly contentIds: readonly string[];
}

export const containerSchema = z.object({
  id: z.string(),
  location: entityLocationSchema,
  capacityUnits: z.number().nonnegative(),
  contentIds: z.array(z.string()),
});

/** Las catorce familias de objeto completo de CAT-005 (§15.1). */
export const WORLD_OBJECT_FAMILIES = [
  "personal_liquid_container",
  "work_container",
  "transport_container",
  "storage_furniture",
  "light_source",
  "improvised_tool_or_weapon",
  "tool_set",
  "rest_furniture",
  "workbench",
  "technical_appliance",
  "technical_installation",
  "installed_closure_object",
  "human_transport",
] as const;
export type WorldObjectFamily = (typeof WORLD_OBJECT_FAMILIES)[number];

export interface WorldObject {
  readonly id: string;
  readonly family: WorldObjectFamily;
  readonly variant: string;
  readonly location: EntityLocation;
  readonly ownerOrReservedByJobId: string | null;
  readonly weightKg: number;
  readonly bulk: "small" | "medium" | "large" | "bulky";
  readonly condition: number;
  readonly quality: number;
  readonly functionalState: FunctionalState;
}

export const worldObjectSchema = z.object({
  id: z.string(),
  family: z.enum(WORLD_OBJECT_FAMILIES),
  variant: z.string(),
  location: entityLocationSchema,
  ownerOrReservedByJobId: z.string().nullable(),
  weightKg: z.number().nonnegative(),
  bulk: z.enum(["small", "medium", "large", "bulky"]),
  condition: z.number().min(0).max(1),
  quality: z.number().min(0).max(1),
  functionalState: functionalStateSchema,
});

/** Familias de recursos localizados de §15.3 (subconjunto activo, no el horizonte). */
export const RESOURCE_FAMILIES = [
  "water",
  "fresh_food",
  "preserved_food",
  "seeds",
  "healing_material",
  "wood_and_planks",
  "sheet_metal",
  "wiring",
  "electrical_components_i",
  "mechanical_parts_i",
  "electric_motors_ii",
] as const;
export type ResourceFamily = (typeof RESOURCE_FAMILIES)[number];

export interface ResourceLot {
  readonly id: string;
  readonly family: ResourceFamily;
  readonly quantity: number;
  readonly unit: "liter" | "kilogram" | "unit";
  readonly location: EntityLocation;
  readonly condition: number;
  readonly reservedByJobId: string | null;
}

export const resourceLotSchema = z.object({
  id: z.string(),
  family: z.enum(RESOURCE_FAMILIES),
  quantity: z.number().nonnegative(),
  unit: z.enum(["liter", "kilogram", "unit"]),
  location: entityLocationSchema,
  condition: z.number().min(0).max(1),
  reservedByJobId: z.string().nullable(),
});

/** Los cinco métodos activos de transporte (§18.1). */
export const TRANSPORT_METHODS = [
  "hand_carry",
  "personal_container",
  "coordinated_carry",
  "wheelbarrow",
  "handcart",
] as const;
export type TransportMethod = (typeof TRANSPORT_METHODS)[number];

export interface TransportMeans {
  readonly id: string;
  readonly method: Extract<TransportMethod, "wheelbarrow" | "handcart">;
  readonly location: EntityLocation;
  readonly capacityKg: number;
  readonly condition: number;
  readonly currentLoadBundleId: string | null;
}

export const transportMeansSchema = z.object({
  id: z.string(),
  method: z.enum(["wheelbarrow", "handcart"]),
  location: entityLocationSchema,
  capacityKg: z.number().positive(),
  condition: z.number().min(0).max(1),
  currentLoadBundleId: z.string().nullable(),
});

export interface LoadBundle {
  readonly id: string;
  readonly method: TransportMethod;
  readonly carriedByPersonIds: readonly string[];
  readonly transportMeansId: string | null;
  readonly contentObjectIds: readonly string[];
  readonly contentResourceLotIds: readonly string[];
  readonly totalWeightKg: number;
  readonly location: EntityLocation;
}

export const loadBundleSchema = z.object({
  id: z.string(),
  method: z.enum(TRANSPORT_METHODS),
  carriedByPersonIds: z.array(z.string()),
  transportMeansId: z.string().nullable(),
  contentObjectIds: z.array(z.string()),
  contentResourceLotIds: z.array(z.string()),
  totalWeightKg: z.number().nonnegative(),
  location: entityLocationSchema,
});

export interface TransferPoint {
  readonly id: string;
  readonly location: EntityLocation;
  readonly labelKey: string;
}

export const transferPointSchema = z.object({
  id: z.string(),
  location: entityLocationSchema,
  labelKey: z.string(),
});
