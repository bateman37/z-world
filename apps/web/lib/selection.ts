import type { JobTarget } from "@z-world/contracts";

/**
 * Selección universal del mapa (S11 §7.3): cualquier entidad conocida que
 * el Canvas puede dibujar y por tanto seleccionar. Deliberadamente no
 * incluye objetos/lotes de recursos sueltos (la proyección del mapa no
 * lleva su posición — se seleccionan desde el panel de inventario, que sí
 * los conoce) ni zonas/designaciones (viven como polígonos de trabajo, no
 * como entidades del mundo con ficha propia).
 */
export type SelectionTarget =
  | { readonly kind: "person"; readonly id: string }
  | { readonly kind: "place"; readonly id: string }
  | { readonly kind: "building"; readonly id: string }
  | { readonly kind: "room"; readonly id: string }
  | { readonly kind: "opening"; readonly id: string }
  | { readonly kind: "cultivation_plot"; readonly id: string }
  | { readonly kind: "barrier_segment"; readonly id: string };

const JOB_TARGET_KIND_BY_SELECTION_KIND: Partial<Record<SelectionTarget["kind"], JobTarget["kind"]>> = {
  place: "place",
  building: "building",
  room: "room",
  opening: "opening",
  cultivation_plot: "cultivation_plot",
  barrier_segment: "barrier_segment",
};

/** Extrae el id concreto de un `JobTarget`, o `null` para los que no identifican una única entidad (`area`, `own_need`). */
export function jobTargetIdOf(target: JobTarget): string | null {
  switch (target.kind) {
    case "place":
      return target.placeId;
    case "building":
      return target.buildingId;
    case "room":
      return target.roomId;
    case "opening":
      return target.openingId;
    case "resource_lot":
      return target.resourceLotId;
    case "furniture":
      return target.furnitureId;
    case "world_object":
      return target.worldObjectId;
    case "container":
      return target.containerId;
    case "transport_means":
      return target.transportMeansId;
    case "building_installation":
      return target.installationId;
    case "building_finish":
      return target.finishId;
    case "terrain_area":
      return target.terrainAreaId;
    case "linear_feature":
      return target.linearFeatureId;
    case "cultivation_plot":
      return target.cultivationPlotId;
    case "barrier_segment":
      return target.barrierSegmentId;
    default:
      return null;
  }
}

/** Un `JobTarget` de una acción contextual "es" la entidad seleccionada en el mapa cuando su tipo e id coinciden. */
export function selectionMatchesJobTarget(selection: SelectionTarget, target: JobTarget): boolean {
  const expectedKind = JOB_TARGET_KIND_BY_SELECTION_KIND[selection.kind];
  if (!expectedKind || target.kind !== expectedKind) return false;
  return jobTargetIdOf(target) === selection.id;
}
