import { z } from "zod";
import { worldPointSchema } from "./geometry.js";
import { visibilityStateSchema } from "./fog.js";
import { gameSpeedSchema } from "./clock.js";
import { operationalStateSchema, personPublicFactsSchema } from "./person.js";
import { PRIORITY_IDS } from "./catalog-ids.js";
import { AREA_TERRAIN_KINDS, LINE_TERRAIN_KINDS } from "./world.js";
import { NEED_BANDS, NEED_DIMENSIONS } from "./needs-v2.js";
import {
  DESIGNATION_KINDS,
  JOB_PHASE_KINDS,
  JOB_STATES,
  TRANSPORT_METHOD_CHOICES,
  TRANSPORT_STEPS,
  ZONE_POLICIES,
  jobTargetSchema,
  transportDestinationSchema,
} from "./work-v2.js";
import { bulkClassSchema, TRANSPORT_METHODS } from "./objects-v2.js";
import { FRESHNESS_BANDS, NOISE_BANDS } from "./events-v2.js";
import {
  BUILDING_LAYERS,
  BUILDING_LIFE_STAGES,
  CONSTRUCTION_ERAS,
  EXPLOITATION_STAGES,
  HABITABILITY_BANDS,
  LAYER_KNOWLEDGE_STATES,
  LAYER_PHYSICAL_STATES,
} from "./building-exploitation-v2.js";
import { CULTIVATION_STATES } from "./agriculture-v2.js";

/**
 * Esquema Zod real de `WorkerProjectionsV2` (S11 §5.1): sustituye
 * `z.unknown()` en el protocolo del Worker V2. Se valida en ambos
 * extremos — el propio Worker construye el mensaje, así que aquí importa
 * sobre todo que React nunca trate como válido un payload que no cumpla
 * esta forma (un `postMessage` corrupto, una versión de proyección
 * incompatible, un bug de serialización). Reutiliza los esquemas de
 * dominio ya existentes (`personPublicFactsSchema`, `jobTargetSchema`,
 * `transportDestinationSchema`, `bulkClassSchema`...) en vez de duplicar
 * sus enumeraciones, para que ambos evolucionen juntos.
 */

const gameSummaryProjectionSchema = z.object({
  gameSaveId: z.string(),
  seed: z.string(),
  title: z.string(),
});

const clockProjectionSchema = z.object({
  day: z.number().int().nonnegative(),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  speed: gameSpeedSchema,
});

const saveStatusProjectionSchema = z.object({
  status: z.enum(["saved", "pending_changes", "saving", "save_error", "revision_conflict"]),
  lastSavedSimSeconds: z.number().nullable(),
});

const personCardProjectionSchema = z.object({
  personId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  operationalState: operationalStateSchema,
});

/** Mismos campos que `personPublicFactsSchema` salvo `position`/`activeMovementOrder` (no son parte de la ficha de presentación), renombrando `id` a `personId`. */
const personSheetProjectionSchema = personPublicFactsSchema
  .omit({ id: true, position: true, activeMovementOrder: true })
  .extend({ personId: z.string() });

const movementProjectionSchema = z.object({
  personId: z.string(),
  destination: worldPointSchema,
  path: z.array(worldPointSchema),
  progressRatio: z.number().min(0).max(1),
  remainingDistanceMeters: z.number().nonnegative(),
});

const operationalLogEntryProjectionSchema = z.object({
  eventId: z.string(),
  simSeconds: z.number().int().nonnegative(),
  messageKey: z.string(),
  params: z.record(z.string(), z.string()),
});

const fogMaskProjectionSchema = z.object({
  resolutionMeters: z.number().positive(),
  columns: z.number().int().nonnegative(),
  rows: z.number().int().nonnegative(),
  originX: z.number(),
  originY: z.number(),
  cells: z.array(visibilityStateSchema),
});

const visibleTerrainAreaProjectionSchema = z.object({
  id: z.string(),
  kind: z.enum(AREA_TERRAIN_KINDS),
  polygon: z.array(worldPointSchema),
  coverage: z.string(),
});

const visibleLinearFeatureProjectionSchema = z.object({
  id: z.string(),
  kind: z.enum(LINE_TERRAIN_KINDS),
  polyline: z.array(worldPointSchema),
  widthMeters: z.number().positive(),
  wayState: z.string().nullable(),
});

const visibleCultivationPlotProjectionSchema = z.object({
  id: z.string(),
  polygon: z.array(worldPointSchema),
  state: z.string(),
});

const visibleBarrierSegmentProjectionSchema = z.object({
  id: z.string(),
  from: worldPointSchema,
  to: worldPointSchema,
  built: z.boolean(),
  crossesWay: z.boolean(),
  wayCrossingMode: z.string().nullable(),
});

const visiblePlaceProjectionSchema = z.object({
  id: z.string(),
  position: worldPointSchema,
  profileId: z.string().nullable(),
  buildingId: z.string().nullable(),
  knowledge: z.enum(["sighted", "observed"]),
});

const visibleBuildingProjectionSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  footprint: z.array(worldPointSchema),
  terminal: z.enum(["dismantled", "demolished"]).nullable().optional(),
});

const visibleRoomProjectionSchema = z.object({
  id: z.string(),
  buildingId: z.string(),
  polygon: z.array(worldPointSchema),
});

const visibleOpeningProjectionSchema = z.object({
  id: z.string(),
  position: worldPointSchema,
  connectsToExterior: z.boolean(),
  passable: z.boolean().optional(),
});

const mapEntitiesProjectionV2Schema = z.object({
  areas: z.array(visibleTerrainAreaProjectionSchema),
  lines: z.array(visibleLinearFeatureProjectionSchema),
  places: z.array(visiblePlaceProjectionSchema),
  buildings: z.array(visibleBuildingProjectionSchema),
  rooms: z.array(visibleRoomProjectionSchema),
  openings: z.array(visibleOpeningProjectionSchema),
  people: z.array(z.object({ personId: z.string(), position: worldPointSchema, indoors: z.boolean(), roomId: z.string().nullable() })),
  cultivationPlots: z.array(visibleCultivationPlotProjectionSchema),
  barrierSegments: z.array(visibleBarrierSegmentProjectionSchema),
});

const personNeedProjectionSchema = z.object({
  dimension: z.enum(NEED_DIMENSIONS),
  band: z.enum(NEED_BANDS),
});

const transportOrderOptionsProjectionSchema = z.object({
  methods: z.array(z.object({ method: z.enum(TRANSPORT_METHOD_CHOICES), labelKey: z.string(), blockedReasonKey: z.string().nullable() })),
  means: z.array(z.object({ id: z.string(), method: z.enum(TRANSPORT_METHODS), labelKey: z.string(), blockedReasonKey: z.string().nullable() })),
  destinations: z.array(z.object({ destination: transportDestinationSchema, labelKey: z.string(), blockedReasonKey: z.string().nullable() })),
});

const transportJobProjectionSchema = z.object({
  requestedMethod: z.enum(TRANSPORT_METHOD_CHOICES),
  method: z.enum(TRANSPORT_METHODS).nullable(),
  step: z.enum(TRANSPORT_STEPS),
  meansLabelKey: z.string().nullable(),
  destinationLabelKey: z.string(),
  stagedStop: z.boolean(),
  transferPointId: z.string().nullable(),
  carrierPersonIds: z.array(z.string()),
  requiredCarriers: z.number().int().nonnegative(),
  loadWeightKg: z.number().nonnegative().nullable(),
  loadBulk: bulkClassSchema.nullable(),
  loadPlacement: z.enum(["carried", "on_means", "deposited"]).nullable(),
  accessesCrossed: z.number().int().nonnegative(),
  accessesTotal: z.number().int().nonnegative(),
  noiseBand: z.enum(NOISE_BANDS),
  previousJobId: z.string().nullable(),
  nextJobId: z.string().nullable(),
  planNoteKey: z.string().nullable(),
});

const jobProjectionSchema = z.object({
  id: z.string(),
  actionKey: z.string(),
  labelKey: z.string(),
  effectivePriority: z.enum(PRIORITY_IDS),
  state: z.enum(JOB_STATES),
  phaseKind: z.enum(JOB_PHASE_KINDS).nullable(),
  progressRatio: z.number().min(0).max(1),
  assignedPersonIds: z.array(z.string()),
  blockReasonKey: z.string().nullable(),
  directOrder: z.boolean(),
  target: jobTargetSchema,
  transport: transportJobProjectionSchema.optional(),
});

const zoneProjectionSchema = z.object({
  id: z.string(),
  policy: z.enum(ZONE_POLICIES),
  polygon: z.array(worldPointSchema),
});

const designationProjectionSchema = z.object({
  id: z.string(),
  kind: z.enum(DESIGNATION_KINDS),
  cancelled: z.boolean(),
  generatedJobCount: z.number().int().nonnegative(),
});

const storageItemRefWithLabelSchema = z.object({
  kind: z.enum(["world_object", "resource_lot"]),
  id: z.string(),
  labelKey: z.string(),
  holderPersonId: z.string().nullable(),
});

const contextualActionTargetProjectionSchema = z.object({
  target: jobTargetSchema,
  labelKey: z.string(),
  blockedReasonKey: z.string().nullable(),
  storageItem: storageItemRefWithLabelSchema.optional(),
  cargoGroupKey: z.string().optional(),
  detailKeys: z.array(z.string()).optional(),
});

const contextualActionOptionProjectionSchema = z.object({
  actionKey: z.string(),
  labelKey: z.string(),
  irreversible: z.boolean().optional(),
  targets: z.array(contextualActionTargetProjectionSchema),
  transport: transportOrderOptionsProjectionSchema.optional(),
});

const inventoryEntryProjectionSchema = z.object({
  id: z.string(),
  entityKind: z.enum(["world_object", "resource_lot", "furniture", "transport_means"]),
  labelKey: z.string(),
  locationKind: z.enum(["carried", "container", "room", "exterior", "load", "transfer_point"]),
  holderPersonId: z.string().nullable(),
  containerLabelKey: z.string().nullable(),
  roomId: z.string().nullable(),
  quantity: z.number().nullable(),
  unit: z.enum(["liter", "kilogram", "unit"]).nullable(),
  functionalStateKey: z.string().nullable(),
  freshness: z.enum(FRESHNESS_BANDS).nullable(),
  spoilsAtSimSeconds: z.number().nullable(),
  capacity: z.object({ used: z.number().nonnegative(), total: z.number().nonnegative() }).nullable(),
});

const buildingLayerProjectionSchema = z.object({
  layer: z.enum(BUILDING_LAYERS),
  knowledge: z.enum(LAYER_KNOWLEDGE_STATES),
  physical: z.enum(LAYER_PHYSICAL_STATES),
  knownRemaining: z.number().int().nonnegative().nullable(),
  knownTotal: z.number().int().nonnegative().nullable(),
});

const buildingAccessProjectionSchema = z.object({
  openingId: z.string(),
  widthClass: z.enum(["narrow", "normal", "wide", "gate"]),
  connectsToExterior: z.boolean(),
  closureKind: z.enum(["door", "gate", "window"]).nullable(),
  closureState: z.enum(["open", "closed", "locked", "destroyed", "none"]),
  obstructionKind: z.enum(["blockade", "boarded_up", "rubble", "furniture_block"]).nullable(),
  passable: z.boolean(),
  reinforced: z.boolean(),
  lockBroken: z.boolean(),
});

const buildingHabitabilityProjectionSchema = z.object({
  band: z.enum(HABITABILITY_BANDS),
  uses: z.object({ shelter: z.boolean(), rest: z.boolean(), storage: z.boolean(), work: z.boolean() }),
  factorKeys: z.array(z.string()),
});

const irreversiblePreviewProjectionSchema = z.object({
  actionKey: z.enum(["dismantle_structure", "demolish_building"]),
  consequenceKeys: z.array(z.string()),
  knownLosses: z.object({
    furniture: z.number().int().nonnegative(),
    installations: z.number().int().nonnegative(),
    finishes: z.number().int().nonnegative(),
    looseItems: z.number().int().nonnegative(),
  }),
});

const buildingExploitationProjectionSchema = z.object({
  buildingId: z.string(),
  placeId: z.string(),
  profileId: z.string().nullable(),
  layersAvailable: z.boolean(),
  stage: z.enum(EXPLOITATION_STAGES),
  lifeStage: z.enum(BUILDING_LIFE_STAGES).nullable(),
  era: z.enum(CONSTRUCTION_ERAS).nullable(),
  layers: z.array(buildingLayerProjectionSchema),
  habitability: buildingHabitabilityProjectionSchema.nullable(),
  accesses: z.array(buildingAccessProjectionSchema),
  structureStagesDone: z.number().int().nonnegative().nullable(),
  structureStagesTotal: z.number().int().nonnegative().nullable(),
  previews: z.array(irreversiblePreviewProjectionSchema),
});

const cultivationPlotStatusProjectionSchema = z.object({
  id: z.string(),
  parcelId: z.string(),
  state: z.enum(CULTIVATION_STATES),
  damageLevel: z.number().min(0).max(1),
  preparationProgress: z.number().min(0).max(1),
  activeCropCycleId: z.string().nullable(),
});

export const workerProjectionsV2Schema = z.object({
  gameSummary: gameSummaryProjectionSchema,
  clock: clockProjectionSchema,
  saveStatus: saveStatusProjectionSchema,
  personCards: z.array(personCardProjectionSchema),
  personSheets: z.record(z.string(), personSheetProjectionSchema),
  mapEntities: mapEntitiesProjectionV2Schema,
  fog: fogMaskProjectionSchema,
  movements: z.array(movementProjectionSchema),
  operationalLog: z.array(operationalLogEntryProjectionSchema),
  needsByPerson: z.record(z.string(), z.array(personNeedProjectionSchema)),
  jobs: z.array(jobProjectionSchema),
  zones: z.array(zoneProjectionSchema),
  designations: z.array(designationProjectionSchema),
  contextualActions: z.array(contextualActionOptionProjectionSchema),
  inventory: z.array(inventoryEntryProjectionSchema),
  cultivationPlots: z.array(cultivationPlotStatusProjectionSchema),
  buildings: z.array(buildingExploitationProjectionSchema),
  revision: z.number().int().nonnegative(),
});
