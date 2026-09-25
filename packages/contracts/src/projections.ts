import type { GameSpeed } from "./clock.js";
import type { CharacteristicId, PriorityId, SkillId } from "./catalog-ids.js";
import type { PriorityValue } from "./priority-value.js";
import type {
  ArrivalCondition,
  BiographySummary,
  CurrentLevel,
  OperationalState,
  PossessionItem,
  PotentialPhraseKey,
  RelationshipLink,
} from "./person.js";
import type { WorldPoint } from "./geometry.js";
import type { AreaFeature, LineFeature, PointFeature, StructureFeature } from "./world.js";
import type { VisibilityState } from "./fog.js";

/**
 * Proyecciones de solo lectura que el Worker envía a React (§8.2). Nunca
 * incluyen calibre, potencial numérico real, máximos ocultos ni cualquier
 * campo que permita inferirlos.
 */

export interface GameSummaryProjection {
  readonly gameSaveId: string;
  readonly seed: string;
  readonly title: string;
}

export interface ClockProjection {
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly speed: GameSpeed;
}

export type SaveStatus = "saved" | "pending_changes" | "saving" | "save_error" | "revision_conflict";

export interface SaveStatusProjection {
  readonly status: SaveStatus;
  readonly lastSavedSimSeconds: number | null;
}

export interface PersonCardProjection {
  readonly personId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly operationalState: OperationalState;
}

export interface PersonSheetProjection {
  readonly personId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly ageYears: number;
  readonly biography: BiographySummary;
  readonly characteristics: Readonly<Record<CharacteristicId, CurrentLevel>>;
  readonly skills: Readonly<Record<SkillId, CurrentLevel>>;
  readonly potentialPhraseByCharacteristic: Readonly<Record<CharacteristicId, PotentialPhraseKey>>;
  readonly potentialPhraseBySkill: Readonly<Record<SkillId, PotentialPhraseKey>>;
  readonly priorities: Readonly<Record<PriorityId, PriorityValue>>;
  readonly relationships: readonly RelationshipLink[];
  readonly sharedEventInterpretationKey: string;
  readonly possessions: readonly PossessionItem[];
  readonly arrivalCondition: ArrivalCondition;
  readonly operationalState: OperationalState;
  readonly lastBlockReasonKey: string | null;
}

export interface MovementProjection {
  readonly personId: string;
  readonly destination: WorldPoint;
  readonly path: readonly WorldPoint[];
  readonly progressRatio: number;
  readonly remainingDistanceMeters: number;
}

export interface MapEntitiesProjection {
  readonly areas: readonly AreaFeature[];
  readonly lines: readonly LineFeature[];
  readonly points: readonly PointFeature[];
  readonly structures: readonly StructureFeature[];
  readonly people: ReadonlyArray<{ readonly personId: string; readonly position: WorldPoint }>;
}

export interface FogMaskProjection {
  readonly resolutionMeters: number;
  readonly columns: number;
  readonly rows: number;
  readonly originX: number;
  readonly originY: number;
  readonly cells: readonly VisibilityState[];
}

/** Niveles de atención del registro operativo (S11 §6.2): registro < aviso < importante < crítico. */
export const OPERATIONAL_LOG_LEVELS = ["log", "notice", "important", "critical"] as const;
export type OperationalLogLevel = (typeof OPERATIONAL_LOG_LEVELS)[number];

export interface OperationalLogEntryProjection {
  readonly eventId: string;
  readonly simSeconds: number;
  readonly messageKey: string;
  readonly params: Readonly<Record<string, string>>;
  readonly level: OperationalLogLevel;
  /** Repeticiones agrupadas por causa/entidad/ventana simulada (S11 §6.2): 1 si no se agrupó con nada. */
  readonly count: number;
}

/** Envoltorio de todas las proyecciones que el Worker emite a React. */
export interface WorkerProjections {
  readonly gameSummary: GameSummaryProjection;
  readonly clock: ClockProjection;
  readonly saveStatus: SaveStatusProjection;
  readonly personCards: readonly PersonCardProjection[];
  /** Fichas completas de las seis personas (la cohorte es pequeña y fija). */
  readonly personSheets: Readonly<Record<string, PersonSheetProjection>>;
  readonly mapEntities: MapEntitiesProjection;
  readonly fog: FogMaskProjection;
  readonly movements: readonly MovementProjection[];
  readonly operationalLog: readonly OperationalLogEntryProjection[];
  readonly revision: number;
}
