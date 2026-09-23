import type { NaturalOrTechnicalNode, Place, WorldObject } from "@z-world/contracts";
import type { PrngStream } from "../../prng.js";
import type { IdAllocator } from "./id-allocator.js";
import { makeWorldObject } from "./buildings.js";

/**
 * Instalaciones técnicas de S7 (CAT-005 §3.2, demostrador «bomba de agua»):
 * una bomba manual instalada sobre la fuente comunal (`ENV-01`, pozo
 * comunal si existe; si no, la fuente principal), conectada a su nodo
 * hídrico real (`installedAt`), y un cubo al pie como recipiente real
 * donde cae el agua extraída. La bomba nunca produce agua solo por
 * existir: hay que probarla, repararla si está averiada (piezas mecánicas
 * I + chapa, nunca «materiales de reparación» genéricos) y extraer agua
 * con un trabajo real.
 *
 * Usa el stream derivado de S7 (no el stream `world`), de modo que añadir
 * la bomba no desplaza ninguna tirada del trazado del pueblo.
 */
export interface InstallationsResult {
  readonly worldObjects: WorldObject[];
  readonly degradations: readonly string[];
}

export function materializeWaterPump(prng: PrngStream, ids: IdAllocator, nodes: readonly NaturalOrTechnicalNode[], places: readonly Place[]): InstallationsResult {
  const waterNodes = nodes.filter((n) => n.kind === "water_source" && n.placeId);
  const node = waterNodes.find((n) => n.labelKey === "water_source.communal_well") ?? waterNodes[0];
  if (!node || !node.placeId) {
    return { worldObjects: [], degradations: ["No hay ninguna fuente ENV-01 con lugar asociado: no se instaló la bomba de agua demostradora en esta semilla."] };
  }
  const place = places.find((p) => p.id === node.placeId);
  if (!place || place.profileId !== "ENV-01") {
    return { worldObjects: [], degradations: ["La fuente elegida no es un lugar ENV-01: no se instaló la bomba de agua demostradora."] };
  }

  // Estado inicial: seis semanas sin mantenimiento. Averiada (junta gastada)
  // en la mayoría de semillas, degradada pero utilizable en el resto.
  const broken = prng.nextBool(0.7);
  const condition = broken ? 0.15 + prng.nextFloat() * 0.08 : 0.4 + prng.nextFloat() * 0.2;
  const quality = 0.4 + prng.nextFloat() * 0.3;
  const pumpId = ids.next("object");
  const pumpBase = makeWorldObject({
    id: pumpId,
    variant: "technical_installation.hand_pump",
    location: { kind: "world_point", point: { x: node.position.x + 1, y: node.position.y } },
    condition: Math.round(condition * 10000) / 10000,
    quality,
    functionalState: broken ? "broken" : "degraded",
  });
  const pump: WorldObject = {
    ...pumpBase,
    functions: broken ? [] : pumpBase.functions,
    inactiveFunctionReasons: broken ? { water_pumping: "worn_seal" } : {},
    installedAt: { placeId: place.id, nodeId: node.id },
  };

  const bucket = makeWorldObject({
    id: ids.next("object"),
    variant: "work_container.bucket",
    location: { kind: "world_point", point: { x: node.position.x + 2, y: node.position.y + 1 } },
    condition: 0.5 + prng.nextFloat() * 0.3,
    quality: 0.4,
    functionalState: "functional",
  });

  return { worldObjects: [pump, bucket], degradations: [] };
}
