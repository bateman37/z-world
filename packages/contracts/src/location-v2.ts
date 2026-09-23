import { z } from "zod";
import { worldPointSchema, type WorldPoint } from "./geometry.js";

/**
 * Unión discriminada de ubicación única (§6.4 de WEB-002). Todo objeto,
 * lote y medio tiene exactamente una ubicación canónica; las vistas de
 * "inventario comunitario" son proyecciones agrupadas, nunca otra fuente
 * de verdad.
 */
export const ENTITY_LOCATION_KINDS = [
  "world_point",
  "room",
  "zone",
  "container",
  "carried_by_person",
  "mounted_on_transport",
  "installed_at_opening",
  "transfer_point",
  "work_site",
  "field_edge",
] as const;
export type EntityLocationKind = (typeof ENTITY_LOCATION_KINDS)[number];

export type EntityLocation =
  | { readonly kind: "world_point"; readonly point: WorldPoint }
  | { readonly kind: "room"; readonly roomId: string }
  | { readonly kind: "zone"; readonly zoneId: string }
  | { readonly kind: "container"; readonly containerId: string }
  | { readonly kind: "carried_by_person"; readonly personId: string }
  | { readonly kind: "mounted_on_transport"; readonly transportId: string }
  | { readonly kind: "installed_at_opening"; readonly openingId: string }
  | { readonly kind: "transfer_point"; readonly transferPointId: string }
  | { readonly kind: "work_site"; readonly jobId: string }
  | { readonly kind: "field_edge"; readonly parcelId: string };

export const entityLocationSchema: z.ZodType<EntityLocation> = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("world_point"), point: worldPointSchema }),
  z.object({ kind: z.literal("room"), roomId: z.string() }),
  z.object({ kind: z.literal("zone"), zoneId: z.string() }),
  z.object({ kind: z.literal("container"), containerId: z.string() }),
  z.object({ kind: z.literal("carried_by_person"), personId: z.string() }),
  z.object({ kind: z.literal("mounted_on_transport"), transportId: z.string() }),
  z.object({ kind: z.literal("installed_at_opening"), openingId: z.string() }),
  z.object({ kind: z.literal("transfer_point"), transferPointId: z.string() }),
  z.object({ kind: z.literal("work_site"), jobId: z.string() }),
  z.object({ kind: z.literal("field_edge"), parcelId: z.string() }),
]);

/** Extrae el ID de la entidad contenedora referenciada, si la ubicación lo tiene. */
export function locationReferenceId(location: EntityLocation): string | null {
  switch (location.kind) {
    case "world_point":
      return null;
    case "room":
      return location.roomId;
    case "zone":
      return location.zoneId;
    case "container":
      return location.containerId;
    case "carried_by_person":
      return location.personId;
    case "mounted_on_transport":
      return location.transportId;
    case "installed_at_opening":
      return location.openingId;
    case "transfer_point":
      return location.transferPointId;
    case "work_site":
      return location.jobId;
    case "field_edge":
      return location.parcelId;
    default: {
      const exhaustive: never = location;
      throw new Error(`Ubicación no reconocida: ${JSON.stringify(exhaustive)}`);
    }
  }
}
