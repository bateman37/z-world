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
import type { FreshnessBand, NoiseBand } from "./events-v2.js";
import type { TransportDestination, TransportMethodChoice, TransportStep } from "./work-v2.js";
import type { BulkClass, TransportMethod } from "./objects-v2.js";
import type { PriorityId } from "./catalog-ids.js";
import type { BuildingLayer, BuildingLifeStage, ConstructionEra, ExploitationStage, HabitabilityBand, LayerKnowledgeState, LayerPhysicalState } from "./building-exploitation-v2.js";
import type { CultivationState } from "./agriculture-v2.js";

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
  /** Cobertura efectiva (S10, WLD-010 §3.2): `"none" | "vegetation" | "debris"`. */
  readonly coverage: string;
}

export interface VisibleLinearFeatureProjection {
  readonly id: string;
  readonly kind: LineTerrainKind;
  readonly polyline: readonly WorldPoint[];
  readonly widthMeters: number;
  /** Estado mutable de la vía (S10, WLD-010 §3.7). `null` para cursos de agua. */
  readonly wayState: string | null;
}

/** Parcela de cultivo visible (S10): geometría real y estado cualitativo, nunca un número interno. */
export interface VisibleCultivationPlotProjection {
  readonly id: string;
  readonly polygon: readonly WorldPoint[];
  readonly state: string;
}

/** Tramo de barrera visible entre dos anclajes (S10, WLD-010 §3.6). */
export interface VisibleBarrierSegmentProjection {
  readonly id: string;
  readonly from: WorldPoint;
  readonly to: WorldPoint;
  readonly built: boolean;
  readonly crossesWay: boolean;
  readonly wayCrossingMode: string | null;
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
  /** S9: el edificio fue desmantelado del todo o demolido (se dibuja como solar/escombros, nunca como edificio en pie). */
  readonly terminal?: "dismantled" | "demolished" | null;
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
  /** S9: transitabilidad conocida del acceso (cierre bloqueado, barricada, tapiado...). */
  readonly passable?: boolean;
}

export interface MapEntitiesProjectionV2 {
  readonly areas: readonly VisibleTerrainAreaProjection[];
  readonly lines: readonly VisibleLinearFeatureProjection[];
  readonly places: readonly VisiblePlaceProjection[];
  readonly buildings: readonly VisibleBuildingProjection[];
  readonly rooms: readonly VisibleRoomProjection[];
  readonly openings: readonly VisibleOpeningProjection[];
  readonly people: ReadonlyArray<{ readonly personId: string; readonly position: WorldPoint; readonly indoors: boolean; readonly roomId: string | null }>;
  /** S10: parcelas de cultivo y tramos de barrera reales (siempre visibles como el resto del terreno; sin omnisciencia de contenido, solo geometría y estado). */
  readonly cultivationPlots: readonly VisibleCultivationPlotProjection[];
  readonly barrierSegments: readonly VisibleBarrierSegmentProjection[];
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
  /** Fases logísticas y ubicaciones visibles de un traslado (S8). Ausente en el resto de trabajos. */
  readonly transport?: TransportJobProjection;
}

/**
 * Ficha cualitativa de un traslado (S8, §10.2 del prompt S7-S9): método,
 * paso logístico, medio, destino, porteadoras, carga y accesos. Nunca
 * incluye cifras internas de tuning ni rutas por niebla.
 */
export interface TransportJobProjection {
  readonly requestedMethod: TransportMethodChoice;
  readonly method: TransportMethod | null;
  readonly step: TransportStep;
  readonly meansLabelKey: string | null;
  readonly destinationLabelKey: string;
  /** Acceso ante el que se detiene esta etapa (punto de transferencia), si la hay. */
  readonly stagedStop: boolean;
  readonly transferPointId: string | null;
  readonly carrierPersonIds: readonly string[];
  readonly requiredCarriers: number;
  readonly loadWeightKg: number | null;
  readonly loadBulk: BulkClass | null;
  /** `carried` | `on_means` | `deposited` | `null` (todavía sin cargar). */
  readonly loadPlacement: "carried" | "on_means" | "deposited" | null;
  readonly accessesCrossed: number;
  readonly accessesTotal: number;
  readonly noiseBand: NoiseBand;
  readonly previousJobId: string | null;
  readonly nextJobId: string | null;
  readonly planNoteKey: string | null;
}

/** Opciones de una orden de traslado (S8, SET-010 §3.9): solo destinos, medios y métodos conocidos y pertinentes. */
export interface TransportOrderOptionsProjection {
  readonly methods: readonly { readonly method: TransportMethodChoice; readonly labelKey: string; readonly blockedReasonKey: string | null }[];
  readonly means: readonly { readonly id: string; readonly method: TransportMethod; readonly labelKey: string; readonly blockedReasonKey: string | null }[];
  readonly destinations: readonly { readonly destination: TransportDestination; readonly labelKey: string; readonly blockedReasonKey: string | null }[];
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
  /** Agrupa blancos de traslado que están en el mismo lugar (para componer una carga con varios elementos, S8). */
  readonly cargoGroupKey?: string;
  /** Detalle legible adicional del blanco (S9: estancias que conecta un acceso, edificio de una instalación...). */
  readonly detailKeys?: readonly string[];
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
  readonly locationKind: "carried" | "container" | "room" | "exterior" | "load" | "transfer_point";
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
  /** El método es irreversible (desmontar, desguazar, destruir un cierre, desmontar una instalación, retirar un acabado, desmantelar, demoler): la orden exige confirmación informada. */
  readonly irreversible?: boolean;
  readonly targets: readonly ContextualActionTargetProjection[];
  /** Opciones propias del traslado (S8). Ausente en el resto de acciones. */
  readonly transport?: TransportOrderOptionsProjection;
}

/**
 * Estado por capas de un edificio conocido (S9 — Puerta C, SET-007 §3.1/§3.4,
 * §10.2 del prompt S7-S9). Cada capa lleva su propio conocimiento y su
 * propio estado físico: nunca se colapsan en una cifra única, y un edificio
 * vaciado de contenido suelto no aparece como «agotado».
 */
export interface BuildingLayerProjection {
  readonly layer: BuildingLayer;
  readonly knowledge: LayerKnowledgeState;
  readonly physical: LayerPhysicalState;
  /** Elementos que la comunidad sabe que quedan en la capa (`null` si no se conoce lo bastante para contarlos). */
  readonly knownRemaining: number | null;
  readonly knownTotal: number | null;
}

export interface BuildingAccessProjection {
  readonly openingId: string;
  readonly widthClass: "narrow" | "normal" | "wide" | "gate";
  readonly connectsToExterior: boolean;
  readonly closureKind: "door" | "gate" | "window" | null;
  /** `open` | `closed` | `locked` | `destroyed` | `none` (hueco sin cierre, p. ej. puerta retirada). */
  readonly closureState: "open" | "closed" | "locked" | "destroyed" | "none";
  readonly obstructionKind: "blockade" | "boarded_up" | "rubble" | "furniture_block" | null;
  readonly passable: boolean;
  readonly reinforced: boolean;
  readonly lockBroken: boolean;
}

/** Habitabilidad/reutilización cualitativa y causal (§8.3 del prompt S7-S9). */
export interface BuildingHabitabilityProjection {
  readonly band: HabitabilityBand;
  readonly uses: { readonly shelter: boolean; readonly rest: boolean; readonly storage: boolean; readonly work: boolean };
  /** Causas conocidas que reducen la habitabilidad (`habitability.factor.*`). */
  readonly factorKeys: readonly string[];
}

/** Previsualización cualitativa de una consecuencia irreversible según el conocimiento actual (nunca cantidades exactas desconocidas). */
export interface IrreversiblePreviewProjection {
  readonly actionKey: "dismantle_structure" | "demolish_building";
  readonly consequenceKeys: readonly string[];
  readonly knownLosses: { readonly furniture: number; readonly installations: number; readonly finishes: number; readonly looseItems: number };
}

export interface BuildingExploitationProjection {
  readonly buildingId: string;
  readonly placeId: string;
  readonly profileId: string | null;
  /** `false` si la partida es anterior a `web-002-semantic-v4` y el edificio no tiene capas 3-5 materializadas (degradación explícita). */
  readonly layersAvailable: boolean;
  readonly stage: ExploitationStage;
  readonly lifeStage: BuildingLifeStage | null;
  /** Época constructiva, solo si la estructura está inspeccionada. */
  readonly era: ConstructionEra | null;
  readonly layers: readonly BuildingLayerProjection[];
  readonly habitability: BuildingHabitabilityProjection | null;
  readonly accesses: readonly BuildingAccessProjection[];
  readonly structureStagesDone: number | null;
  readonly structureStagesTotal: number | null;
  readonly previews: readonly IrreversiblePreviewProjection[];
}

/** Estado operativo de una parcela de cultivo conocida (S10), para el panel de trabajo y para pruebas E2E que necesitan observar la fase agrícola sin depender del lienzo. */
export interface CultivationPlotStatusProjection {
  readonly id: string;
  readonly parcelId: string;
  readonly state: CultivationState;
  readonly damageLevel: number;
  readonly preparationProgress: number;
  readonly activeCropCycleId: string | null;
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
  /** Parcelas de cultivo conocidas con su estado agrícola (S10). */
  readonly cultivationPlots: readonly CultivationPlotStatusProjection[];
  /** Edificios conocidos con su estado por capas (S9). */
  readonly buildings: readonly BuildingExploitationProjection[];
  readonly revision: number;
}
