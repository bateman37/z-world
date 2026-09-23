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
import type { NeedBand, NeedDimension } from "./needs-v2.js";
import type { DesignationKind, JobPhaseKind, JobState, ZonePolicy } from "./work-v2.js";
import type { JobTarget, StorageItemRef } from "./work-v2.js";
import type { FreshnessBand } from "./events-v2.js";
import type { PriorityId } from "./catalog-ids.js";

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

/**
 * Proyecciones de trabajos, necesidades, zonas y designaciones (S4-S6,
 * subhitos de WEB-002 §9 del prompt de subhitos). Cualitativas: nunca
 * incluyen dificultad, margen, banda B ni potencial interno.
 */
export interface PersonNeedProjection {
  readonly dimension: NeedDimension;
  readonly band: NeedBand;
}

export interface JobProjection {
  readonly id: string;
  readonly actionKey: string;
  readonly labelKey: string;
  readonly effectivePriority: PriorityId;
  readonly state: JobState;
  readonly phaseKind: JobPhaseKind | null;
  readonly progressRatio: number;
  readonly assignedPersonIds: readonly string[];
  readonly blockReasonKey: string | null;
  readonly directOrder: boolean;
  readonly target: JobTarget;
}

export interface ZoneProjection {
  readonly id: string;
  readonly policy: ZonePolicy;
  readonly polygon: readonly WorldPoint[];
}

export interface DesignationProjection {
  readonly id: string;
  readonly kind: DesignationKind;
  readonly cancelled: boolean;
  readonly generatedJobCount: number;
}

/** Un blanco concreto y legítimamente conocido/viable para una acción contextual (§10.3: nunca se filtra un secreto mediante el listado, ya viene vacío de él). */
export interface ContextualActionTargetProjection {
  readonly target: JobTarget;
  readonly labelKey: string;
  readonly blockedReasonKey: string | null;
  /** Elemento concreto que `store`/`retrieve_from_storage` mueve hacia/desde el contenedor del blanco (S7). Ausente en el resto de acciones. */
  readonly storageItem?: StorageItemRef & { readonly labelKey: string; readonly holderPersonId: string | null };
}

/**
 * Entrada del inventario localizado conocido (S7, WEB-002 §6.3/§10.2):
 * nunca una bolsa global — cada entrada enlaza a una ubicación real ya
 * conocida (lo lleva alguien, dentro de un contenedor de una estancia
 * registrada, suelto en ella, o en un exterior reconocido). Solo estado
 * reconocido: una instalación no probada se muestra «sin probar».
 */
export interface InventoryEntryProjection {
  readonly id: string;
  readonly entityKind: "world_object" | "resource_lot" | "furniture" | "transport_means";
  readonly labelKey: string;
  readonly locationKind: "carried" | "container" | "room" | "exterior";
  /** Persona que lo lleva (directamente o en su mochila), si aplica. */
  readonly holderPersonId: string | null;
  /** Etiqueta del contenedor/anfitrión que lo contiene, si aplica. */
  readonly containerLabelKey: string | null;
  readonly roomId: string | null;
  readonly quantity: number | null;
  readonly unit: "liter" | "kilogram" | "unit" | null;
  /** `functional_state.*` reconocido, o `functional_state.untested` para una instalación que nadie ha probado. */
  readonly functionalStateKey: string | null;
  /** Banda de conservación de un perecedero (S7 §6.6), o `null`. */
  readonly freshness: FreshnessBand | null;
  /** Instante simulado aproximado en que se echará a perder, derivado del tuning público; `null` si no aplica. */
  readonly spoilsAtSimSeconds: number | null;
  /** Capacidad libre/total en unidades, para contenedores. */
  readonly capacity: { readonly used: number; readonly total: number } | null;
}

export interface ContextualActionOptionProjection {
  readonly actionKey: string;
  readonly labelKey: string;
  readonly targets: readonly ContextualActionTargetProjection[];
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
  readonly needsByPerson: Readonly<Record<string, readonly PersonNeedProjection[]>>;
  readonly jobs: readonly JobProjection[];
  readonly zones: readonly ZoneProjection[];
  readonly designations: readonly DesignationProjection[];
  readonly contextualActions: readonly ContextualActionOptionProjection[];
  readonly inventory: readonly InventoryEntryProjection[];
  readonly revision: number;
}
