import { z } from "zod";

/** Historia, saqueo y descubrimiento mínimos de WEB-002 §6.3/§9. Forma esquelética (S1); generador real en S2. */

export interface OccupantProfile {
  readonly id: string;
  readonly placeId: string;
  readonly economicStratum: "low" | "medium" | "high";
  readonly priorProfessionKeys: readonly string[];
  readonly hobbyKeys: readonly string[];
}

export const occupantProfileSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  economicStratum: z.enum(["low", "medium", "high"]),
  priorProfessionKeys: z.array(z.string()),
  hobbyKeys: z.array(z.string()),
});

export interface BusinessProfile {
  readonly id: string;
  readonly placeId: string;
  readonly businessKindKey: string;
  readonly economicStratum: "low" | "medium" | "high";
}

export const businessProfileSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  businessKindKey: z.string(),
  economicStratum: z.enum(["low", "medium", "high"]),
});

export const PLACE_HISTORY_KINDS = [
  "abandonment",
  "evacuation",
  "hasty_flight",
  "looted",
  "later_shelter",
  "temporary_occupation",
  "fire",
  "flood",
  "collapse",
  "recent_presence",
] as const;
export type PlaceHistoryKind = (typeof PLACE_HISTORY_KINDS)[number];

export interface PlaceHistory {
  readonly id: string;
  readonly placeId: string;
  readonly historyKinds: readonly PlaceHistoryKind[];
}

export const placeHistorySchema = z.object({
  id: z.string(),
  placeId: z.string(),
  historyKinds: z.array(z.enum(PLACE_HISTORY_KINDS)),
});

export const LOOT_PRESSURE_BANDS = ["nearly_intact", "lightly_looted", "looted", "heavily_looted", "exhausted"] as const;
export type LootPressureBand = (typeof LOOT_PRESSURE_BANDS)[number];

export interface LootPressureZone {
  readonly id: string;
  readonly placeId: string;
  readonly band: LootPressureBand;
}

export const lootPressureZoneSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  band: z.enum(LOOT_PRESSURE_BANDS),
});

export interface LootingRoute {
  readonly id: string;
  readonly waypointPlaceIds: readonly string[];
}

export const lootingRouteSchema = z.object({
  id: z.string(),
  waypointPlaceIds: z.array(z.string()),
});

export const DISCOVERY_FACETS = ["exterior", "accesses", "rooms", "content", "furniture", "installations", "structure"] as const;
export type DiscoveryFacet = (typeof DISCOVERY_FACETS)[number];

export const KNOWLEDGE_STATES = ["unknown", "sighted", "observed", "inspected", "exploited"] as const;
export type KnowledgeState = (typeof KNOWLEDGE_STATES)[number];

export interface DiscoveryRecord {
  readonly entityId: string;
  readonly facet: DiscoveryFacet;
  readonly state: KnowledgeState;
}

export const discoveryRecordSchema = z.object({
  entityId: z.string(),
  facet: z.enum(DISCOVERY_FACETS),
  state: z.enum(KNOWLEDGE_STATES),
});
