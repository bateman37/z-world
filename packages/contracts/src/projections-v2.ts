import type {
  ClockProjection,
  FogMaskProjection,
  GameSummaryProjection,
  MovementProjection,
  OperationalLogEntryProjection,
  PersonCardProjection,
  PersonSheetProjection,
  SaveStatusProjection,
} from "./projections.js";
import type { WorldPoint } from "./geometry.js";
import type { AreaTerrainKind, LineTerrainKind } from "./world.js";

/**
 * Proyecciones de solo lectura del runtime V2 (S3 de WEB-002 §5.8).
 * Reutiliza sin cambios los sub-tipos que ya son válidos para V2
 * (`ClockProjection`, `SaveStatusProjection`, `PersonCardProjection`,
 * `PersonSheetProjection`, `FogMaskProjection`, `MovementProjection`,
 * `OperationalLogEntryProjection`: mismo reloj, misma niebla, misma
 * ficha pública) y declara solo lo que cambia: el mundo espacial V2. Cada
 * entidad espacial incluye únicamente lo que su nivel de conocimiento
 * (`DiscoveryRecord`) permite mostrar — nunca perfil, programa de
 * estancias ni estado de cierre de algo no descubierto.
 */

export interface VisibleTerrainAreaProjection {
  readonly id: string;
  readonly kind: AreaTerrainKind;
  readonly polygon: readonly WorldPoint[];
}

export interface VisibleLinearFeatureProjection {
  readonly id: string;
  readonly kind: LineTerrainKind;
  readonly polyline: readonly WorldPoint[];
  readonly widthMeters: number;
}

export type PlaceKnowledgeLevel = "sighted" | "observed";

export interface VisiblePlaceProjection {
  readonly id: string;
  readonly position: WorldPoint;
  /** `null` mientras solo se ha detectado la silueta (`sighted`): revelar el perfil filtraría el tipo de lugar antes de tiempo (§5.5). */
  readonly profileId: string | null;
  readonly buildingId: string | null;
  readonly knowledge: PlaceKnowledgeLevel;
}

export interface VisibleBuildingProjection {
  readonly id: string;
  readonly placeId: string;
  readonly footprint: readonly WorldPoint[];
}

export interface VisibleRoomProjection {
  readonly id: string;
  readonly buildingId: string;
  readonly polygon: readonly WorldPoint[];
}

export interface VisibleOpeningProjection {
  readonly id: string;
  readonly position: WorldPoint;
  readonly connectsToExterior: boolean;
}

export interface MapEntitiesProjectionV2 {
  readonly areas: readonly VisibleTerrainAreaProjection[];
  readonly lines: readonly VisibleLinearFeatureProjection[];
  readonly places: readonly VisiblePlaceProjection[];
  readonly buildings: readonly VisibleBuildingProjection[];
  readonly rooms: readonly VisibleRoomProjection[];
  readonly openings: readonly VisibleOpeningProjection[];
  readonly people: ReadonlyArray<{ readonly personId: string; readonly position: WorldPoint; readonly indoors: boolean; readonly roomId: string | null }>;
}

/** Envoltorio de todas las proyecciones que el runtime V2 envía a React. */
export interface WorkerProjectionsV2 {
  readonly gameSummary: GameSummaryProjection;
  readonly clock: ClockProjection;
  readonly saveStatus: SaveStatusProjection;
  readonly personCards: readonly PersonCardProjection[];
  readonly personSheets: Readonly<Record<string, PersonSheetProjection>>;
  readonly mapEntities: MapEntitiesProjectionV2;
  readonly fog: FogMaskProjection;
  readonly movements: readonly MovementProjection[];
  readonly operationalLog: readonly OperationalLogEntryProjection[];
  readonly revision: number;
}
