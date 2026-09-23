import { z } from "zod";
import { entityLocationSchema, type EntityLocation } from "./location-v2.js";

/**
 * Objetos, contenedores y recursos de WEB-002 §6.3/§15 (S7 — `DEC-0019`).
 * S1 dejó una forma esquelética; S7 la profundiza de forma aditiva sobre las
 * formas ya cerradas de `DEC-0015`: ningún campo existente cambia de tipo o
 * de nombre, y todo campo nuevo tiene un `.default()` seguro para que un
 * snapshot generado antes de S7 siga cargando (§5.1 del prompt S7-S9).
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

/** Etiquetas de manipulación de §15.2/§18.2, comunes a objetos y cargas. */
export const HANDLING_TAGS = ["liquid", "fragile", "long", "bulky", "contaminating", "keep_upright"] as const;
export type HandlingTag = (typeof HANDLING_TAGS)[number];
export const handlingTagSchema = z.enum(HANDLING_TAGS);

export const BULK_CLASSES = ["small", "medium", "large", "bulky"] as const;
export type BulkClass = (typeof BULK_CLASSES)[number];
export const bulkClassSchema = z.enum(BULK_CLASSES);

export const PORTABILITY_KINDS = ["handheld", "two_person", "fixed", "vehicle_required"] as const;
export type PortabilityKind = (typeof PORTABILITY_KINDS)[number];
export const portabilityKindSchema = z.enum(PORTABILITY_KINDS);

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
export const worldObjectFamilySchema = z.enum(WORLD_OBJECT_FAMILIES);

/**
 * Receta de reparación versionada (§15.2/§16.2). Referenciada por ID desde
 * `WorldObject.repairProfileId`/`Furniture.repairProfileId`; los datos viven
 * en `packages/catalogs` (`repair-profiles.ts`), nunca en el estado.
 */
export interface RepairRequirement {
  readonly resourceFamily: ResourceFamily;
  readonly quantity: number;
}
export const repairRequirementSchema = z.object({
  resourceFamily: z.string(),
  quantity: z.number().positive(),
});

/**
 * Receta de desmontaje/desguace versionada (§16.3/§SET-009 §3.4). Un
 * `DisassemblyProfile` declara los productos posibles de cada modo; el
 * motor de resolución decide cuánto de cada uno se recupera según
 * condición, conocimiento y herramientas, nunca más de lo declarado
 * (conservación de masa, §6.4 y §16.9 del prompt maestro).
 */
export interface DisassemblyOutput {
  readonly resourceFamily: ResourceFamily;
  readonly selectiveQuantity: number;
  readonly destructiveQuantity: number;
}
export const disassemblyOutputSchema = z.object({
  resourceFamily: z.string(),
  selectiveQuantity: z.number().nonnegative(),
  destructiveQuantity: z.number().nonnegative(),
});

export interface Furniture {
  readonly id: string;
  readonly roomId: string;
  readonly kind: string;
  readonly condition: number;
  readonly functionalState: FunctionalState;
  /** Familia CAT-005 cuando esta pieza de mobiliario/instalación representa una de las catorce (§6.1 del prompt S7-S9: "reparte correctamente entre WorldObject, Furniture..."). `null` para mobiliario decorativo sin comportamiento propio. */
  readonly family: WorldObjectFamily | null;
  readonly variant: string;
  readonly weightKg: number;
  readonly bulk: BulkClass;
  readonly quality: number;
  /** Capacidad útil del contenedor que esta pieza representa (armario, estantería...), o `null` si no contiene nada. */
  readonly capacityUnits: number | null;
  /** `Container` real que materializa el contenido, cuando `capacityUnits` no es `null`. */
  readonly containerId: string | null;
  /**
   * Ubicación física real tras un trabajo de traslado. `null` mientras la
   * pieza sigue en su `roomId` original (compatibilidad con partidas
   * anteriores a S7, que nunca mueven mobiliario); usar `furnitureLocation()`
   * para resolver la ubicación efectiva.
   */
  readonly movedToLocation: EntityLocation | null;
  readonly handlingTags: readonly HandlingTag[];
  readonly functions: readonly string[];
  readonly inactiveFunctionReasons: Readonly<Record<string, string>>;
  readonly repairProfileId: string | null;
  readonly disassemblyProfileId: string | null;
  readonly provenance: string | null;
  readonly knownEvidenceIds: readonly string[];
}

export const furnitureSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  kind: z.string(),
  condition: z.number().min(0).max(1),
  functionalState: functionalStateSchema,
  family: worldObjectFamilySchema.nullable().default(null),
  variant: z.string().default(""),
  weightKg: z.number().nonnegative().default(40),
  bulk: bulkClassSchema.default("bulky"),
  quality: z.number().min(0).max(1).default(0.6),
  capacityUnits: z.number().nonnegative().nullable().default(null),
  containerId: z.string().nullable().default(null),
  movedToLocation: entityLocationSchema.nullable().default(null),
  handlingTags: z.array(handlingTagSchema).default([]),
  functions: z.array(z.string()).default([]),
  inactiveFunctionReasons: z.record(z.string(), z.string()).default({}),
  repairProfileId: z.string().nullable().default(null),
  disassemblyProfileId: z.string().nullable().default(null),
  provenance: z.string().nullable().default(null),
  knownEvidenceIds: z.array(z.string()).default([]),
});

/** Ubicación efectiva de una `Furniture`, compatible con partidas anteriores a S7 (§9.5 de `DEC-0019`). */
export function furnitureLocation(furniture: Pick<Furniture, "roomId" | "movedToLocation">): EntityLocation {
  return furniture.movedToLocation ?? { kind: "room", roomId: furniture.roomId };
}

export interface Container {
  readonly id: string;
  readonly location: EntityLocation;
  readonly capacityUnits: number;
  readonly contentIds: readonly string[];
  /** `Furniture` que materializa físicamente este contenedor (armario, estantería...), si aplica. */
  readonly hostFurnitureId: string | null;
  /** `WorldObject` que materializa físicamente este contenedor (mochila, caja...), si aplica. A lo sumo uno de los dos hosts está poblado. */
  readonly hostWorldObjectId: string | null;
  /** Restricción de compatibilidad de contenido por etiqueta de manipulación (§6.4: "compatibilidades de contención"). `null` = acepta cualquier etiqueta. */
  readonly acceptedHandlingTags: readonly HandlingTag[] | null;
}

export const containerSchema = z.object({
  id: z.string(),
  location: entityLocationSchema,
  capacityUnits: z.number().nonnegative(),
  contentIds: z.array(z.string()),
  hostFurnitureId: z.string().nullable().default(null),
  hostWorldObjectId: z.string().nullable().default(null),
  acceptedHandlingTags: z.array(handlingTagSchema).nullable().default(null),
});

export interface WorldObject {
  readonly id: string;
  readonly family: WorldObjectFamily;
  readonly variant: string;
  readonly location: EntityLocation;
  readonly ownerOrReservedByJobId: string | null;
  readonly weightKg: number;
  readonly bulk: BulkClass;
  readonly condition: number;
  readonly quality: number;
  readonly functionalState: FunctionalState;
  readonly handlingTags: readonly HandlingTag[];
  readonly volumeLiters: number;
  /** Capacidad útil si este objeto puede contener otros (mochila, caja, botella), o `null`. */
  readonly capacityUnits: number | null;
  /** `Container` real que materializa el contenido, cuando `capacityUnits` no es `null`. */
  readonly containerId: string | null;
  readonly functions: readonly string[];
  readonly inactiveFunctionReasons: Readonly<Record<string, string>>;
  readonly portability: PortabilityKind;
  readonly minOperators: number;
  readonly repairProfileId: string | null;
  readonly disassemblyProfileId: string | null;
  readonly provenance: string | null;
  readonly missingParts: readonly string[];
  readonly knownEvidenceIds: readonly string[];
  /**
   * Instalación/conexión real de un objeto fijo (bomba de agua sobre una
   * fuente `ENV-01`, S7 §6.10): el lugar y el nodo hídrico a los que está
   * conectado. `null` para objetos sueltos o portátiles, y para cualquier
   * objeto de una partida anterior a S7 (default seguro).
   */
  readonly installedAt: ObjectInstallation | null;
}

export interface ObjectInstallation {
  readonly placeId: string;
  readonly nodeId: string | null;
}

export const objectInstallationSchema = z.object({
  placeId: z.string(),
  nodeId: z.string().nullable(),
});

export const worldObjectSchema = z.object({
  id: z.string(),
  family: worldObjectFamilySchema,
  variant: z.string(),
  location: entityLocationSchema,
  ownerOrReservedByJobId: z.string().nullable(),
  weightKg: z.number().nonnegative(),
  bulk: bulkClassSchema,
  condition: z.number().min(0).max(1),
  quality: z.number().min(0).max(1),
  functionalState: functionalStateSchema,
  handlingTags: z.array(handlingTagSchema).default([]),
  volumeLiters: z.number().nonnegative().default(0),
  capacityUnits: z.number().nonnegative().nullable().default(null),
  containerId: z.string().nullable().default(null),
  functions: z.array(z.string()).default([]),
  inactiveFunctionReasons: z.record(z.string(), z.string()).default({}),
  portability: portabilityKindSchema.default("handheld"),
  minOperators: z.number().int().positive().default(1),
  repairProfileId: z.string().nullable().default(null),
  disassemblyProfileId: z.string().nullable().default(null),
  provenance: z.string().nullable().default(null),
  missingParts: z.array(z.string()).default([]),
  knownEvidenceIds: z.array(z.string()).default([]),
  installedAt: objectInstallationSchema.nullable().default(null),
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
  /** Calidad conocida por la comunidad (p. ej. potabilidad del agua), separada de `condition` (§15.4/§8.6). `true` = calidad conocida y fiable para consumo/uso. */
  readonly qualityKnown: boolean;
  readonly quality: number;
  readonly provenance: string | null;
  /** Instante de simulación (segundos) desde el que este lote empezó a deteriorarse, o `null` si no aplica deterioro (§15.6). */
  readonly decayStartedAtSimSeconds: number | null;
  /**
   * Condición del lote en `decayStartedAtSimSeconds` (S7 §6.6): el
   * deterioro es una función cerrada del tiempo transcurrido desde ese
   * instante (`packages/catalogs/src/decay-tuning.ts`), nunca una resta
   * acumulada por tick, así que la velocidad de juego y el tamaño del paso
   * no alteran el resultado ni pueden contarlo dos veces. `null` si el lote
   * no se deteriora o si procede de una partida anterior a S7 (el motor lo
   * fija la primera vez que avanza el reloj con reglas S7, sin
   * retroactividad).
   */
  readonly conditionAtDecayStart: number | null;
}

export const resourceLotSchema = z.object({
  id: z.string(),
  family: z.enum(RESOURCE_FAMILIES),
  quantity: z.number().nonnegative(),
  unit: z.enum(["liter", "kilogram", "unit"]),
  location: entityLocationSchema,
  condition: z.number().min(0).max(1),
  reservedByJobId: z.string().nullable(),
  qualityKnown: z.boolean().default(true),
  quality: z.number().min(0).max(1).default(1),
  provenance: z.string().nullable().default(null),
  decayStartedAtSimSeconds: z.number().int().nonnegative().nullable().default(null),
  conditionAtDecayStart: z.number().min(0).max(1).nullable().default(null),
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

/**
 * Carretilla o carro como objeto completo de la familia `human_transport`
 * (CAT-005 §3.2, demostrador S7). Conserva su identidad propia de
 * `TransportMeans` (S8 la usará como medio de carga) y gana, de forma
 * aditiva, el ciclo de vida de objeto de S7: calidad, estado funcional,
 * funciones activas/inactivas, piezas ausentes y perfiles de
 * reparación/desmontaje. Todos los campos nuevos tienen `.default()`
 * seguro: una partida anterior a S7 carga como carretilla/carro funcional
 * sin perfil explícito (el motor resuelve entonces el perfil versionado
 * del método, ver `resolveTransformationProfileId`).
 */
export interface TransportMeans {
  readonly id: string;
  readonly method: Extract<TransportMethod, "wheelbarrow" | "handcart">;
  readonly location: EntityLocation;
  readonly capacityKg: number;
  readonly condition: number;
  readonly currentLoadBundleId: string | null;
  readonly variant: string;
  readonly weightKg: number;
  readonly bulk: BulkClass;
  readonly quality: number;
  readonly functionalState: FunctionalState;
  readonly handlingTags: readonly HandlingTag[];
  readonly functions: readonly string[];
  readonly inactiveFunctionReasons: Readonly<Record<string, string>>;
  readonly missingParts: readonly string[];
  readonly repairProfileId: string | null;
  readonly disassemblyProfileId: string | null;
  readonly provenance: string | null;
  readonly knownEvidenceIds: readonly string[];
}

export const transportMeansSchema = z.object({
  id: z.string(),
  method: z.enum(["wheelbarrow", "handcart"]),
  location: entityLocationSchema,
  capacityKg: z.number().positive(),
  condition: z.number().min(0).max(1),
  currentLoadBundleId: z.string().nullable(),
  variant: z.string().default(""),
  weightKg: z.number().nonnegative().default(20),
  bulk: bulkClassSchema.default("bulky"),
  quality: z.number().min(0).max(1).default(0.5),
  functionalState: functionalStateSchema.default("functional"),
  handlingTags: z.array(handlingTagSchema).default(["bulky"]),
  functions: z.array(z.string()).default(["hauling"]),
  inactiveFunctionReasons: z.record(z.string(), z.string()).default({}),
  missingParts: z.array(z.string()).default([]),
  repairProfileId: z.string().nullable().default(null),
  disassemblyProfileId: z.string().nullable().default(null),
  provenance: z.string().nullable().default(null),
  knownEvidenceIds: z.array(z.string()).default([]),
});

/**
 * Referencia a un elemento físico que un traslado mueve (S8): objeto
 * completo, lote de recurso o mueble. Aditiva sobre `StorageItemRef` de S7.
 */
export const CARGO_REF_KINDS = ["world_object", "resource_lot", "furniture"] as const;
export type CargoRefKind = (typeof CARGO_REF_KINDS)[number];
export type CargoRef =
  | { readonly kind: "world_object"; readonly id: string }
  | { readonly kind: "resource_lot"; readonly id: string }
  | { readonly kind: "furniture"; readonly id: string };
export const cargoRefSchema = z.object({ kind: z.enum(CARGO_REF_KINDS), id: z.string().min(1) });

/** Estado físico de una carga (S8 §7.2 del prompt S7-S9). */
export const LOAD_BUNDLE_STATES = ["loaded", "in_transit", "deposited"] as const;
export type LoadBundleState = (typeof LOAD_BUNDLE_STATES)[number];

/**
 * Carga real en tránsito (S8, SET-010 §3.5, §7.2 del prompt S7-S9). Su
 * contenido tiene como ubicación `in_load_bundle` (o el contenedor
 * personal que la materializa, `containerId`), y la carga tiene a su vez
 * una única ubicación: la lleva una persona (`carried_by_person`, la
 * porteadora principal), va montada en un medio (`mounted_on_transport`) o
 * quedó depositada (`world_point`/`room`/`transfer_point`). Peso, volumen,
 * bulto y etiquetas se calculan del contenido real al cargar y se
 * conservan: peso y bulto bloquean de forma independiente. Todos los
 * campos añadidos en S8 tienen `.default()` seguro.
 */
export interface LoadBundle {
  readonly id: string;
  readonly method: TransportMethod;
  readonly carriedByPersonIds: readonly string[];
  readonly transportMeansId: string | null;
  readonly contentObjectIds: readonly string[];
  readonly contentResourceLotIds: readonly string[];
  readonly totalWeightKg: number;
  readonly location: EntityLocation;
  readonly contentFurnitureIds: readonly string[];
  /** Contenedor personal (mochila, saco, caja...) que materializa la carga con el método `personal_container`; su contenido conserva ubicación `container`. */
  readonly containerId: string | null;
  readonly totalVolumeLiters: number;
  readonly bulk: BulkClass;
  readonly handlingTags: readonly HandlingTag[];
  /** Mínimo duro de personas que exige el contenido (mueble o bidón para dos, etc.). */
  readonly minCarriers: number;
  /** Peor condición del contenido al cargar (conservación, §7.2). `null` si no aplica. */
  readonly lowestContentCondition: number | null;
  readonly state: LoadBundleState;
  readonly jobId: string | null;
  /** Ubicación de la que se recogió la carga (procedencia del traslado). */
  readonly originLocation: EntityLocation | null;
  /** Reparto del porte a pulso en equipo: qué porteadora lleva cada elemento (§7.4). Vacío si la carga es única. */
  readonly allocation: Readonly<Record<string, string>>;
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
  contentFurnitureIds: z.array(z.string()).default([]),
  containerId: z.string().nullable().default(null),
  totalVolumeLiters: z.number().nonnegative().default(0),
  bulk: bulkClassSchema.default("small"),
  handlingTags: z.array(handlingTagSchema).default([]),
  minCarriers: z.number().int().positive().default(1),
  lowestContentCondition: z.number().min(0).max(1).nullable().default(null),
  state: z.enum(LOAD_BUNDLE_STATES).default("loaded"),
  jobId: z.string().nullable().default(null),
  originLocation: entityLocationSchema.nullable().default(null),
  allocation: z.record(z.string(), z.string()).default({}),
});

/** Clases de punto de transferencia de SET-010 §3.8 activas en S8. */
export const TRANSFER_POINT_KINDS = ["building_access", "staging_area", "meeting_point", "field_edge", "perimeter_gate"] as const;
export type TransferPointKind = (typeof TRANSFER_POINT_KINDS)[number];

/**
 * Punto de transferencia real (S8, SET-010 §3.8): lugar físico donde una
 * etapa deja su carga para que otra continúe (p. ej. el carro se detiene
 * ante el portón y el resto sigue a pulso). `openingId` enlaza el acceso
 * junto al que se crea, si lo hay.
 */
export interface TransferPoint {
  readonly id: string;
  readonly location: EntityLocation;
  readonly labelKey: string;
  readonly kind: TransferPointKind;
  readonly openingId: string | null;
  readonly createdByJobId: string | null;
  readonly createdAtSimSeconds: number;
}

export const transferPointSchema = z.object({
  id: z.string(),
  location: entityLocationSchema,
  labelKey: z.string(),
  kind: z.enum(TRANSFER_POINT_KINDS).default("staging_area"),
  openingId: z.string().nullable().default(null),
  createdByJobId: z.string().nullable().default(null),
  createdAtSimSeconds: z.number().int().nonnegative().default(0),
});
