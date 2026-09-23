import type { Container, PersonStateV2, ResourceLot, WorldObject } from "@z-world/contracts";
import { POSSESSION_LABEL_TO_VARIANT } from "@z-world/catalogs";
import type { PrngStream } from "../../prng.js";
import type { IdAllocator } from "./id-allocator.js";
import { catalogEntry, makeResourceLot, makeWorldObject } from "./buildings.js";

/**
 * Pertenencias iniciales de SCN-003 §3.5 materializadas por persona (S7,
 * WEB-002 §6.11): cada objeto es un `WorldObject`/`ResourceLot` real con
 * una única ubicación (lo lleva la persona, o va dentro de su mochila —
 * un `Container` real alojado por el objeto mochila). No existe inventario
 * global: el resumen `PersonPublicFacts.possessions` de WEB-001 se
 * conserva tal cual como registro de llegada, con los mismos IDs que los
 * objetos reales, y la ficha de persona deriva sus pertenencias del
 * inventario real (nunca dos existencias divergentes).
 *
 * Presupuesto garantizado del grupo (SCN-003 §3.5) y cómo se cumple:
 * - recipientes con 8–12 L de capacidad total: cantimplora (1,5 L) o
 *   botella (1 L) por persona, alternando, más una olla de 3 L → 10,5 L;
 * - 5–8 L de agua: el mismo presupuesto que v1 dejaba en el refugio
 *   (`groupSupplies.waterLiters`), repartido llenando los recipientes en
 *   orden estable de cohorte;
 * - unas seis comidas sencillas: una ración de alimento conservado por
 *   persona, en su mochila;
 * - un medio de encendido (mechero), un utensilio de corte (navaja), una
 *   luz con energía limitada (linterna), material de primeros auxilios y
 *   una olla, repartidos por posición estable en la cohorte;
 * - mochila para todo el grupo (la `possession.personal_pack` de WEB-001,
 *   ahora con contenedor real);
 * - un arma cuerpo a cuerpo o improvisada por protagonista (la de WEB-001).
 * No se duplica nada del refugio: el refugio de v2 ya no contiene el agua
 * ni las comidas (ver `scenario.ts`).
 */
export interface BelongingsResult {
  readonly worldObjects: WorldObject[];
  readonly containers: Container[];
  readonly resourceLots: ResourceLot[];
}

export interface GroupSupplies {
  readonly waterLiters: number;
  readonly waterCondition: number;
  readonly mealCount: number;
  readonly mealCondition: number;
}

const round3 = (value: number): number => Math.round(value * 1000) / 1000;

export function materializeInitialBelongings(
  prng: PrngStream,
  ids: IdAllocator,
  people: Readonly<Record<string, PersonStateV2>>,
  peopleOrder: readonly string[],
  supplies: GroupSupplies,
): BelongingsResult {
  const worldObjects: WorldObject[] = [];
  const containers: { -readonly [K in keyof Container]: Container[K] extends readonly (infer U)[] ? U[] : Container[K] }[] = [];
  const resourceLots: ResourceLot[] = [];
  const vessels: { id: string; capacity: number }[] = [];

  for (const [index, personId] of peopleOrder.entries()) {
    const person = people[personId];
    if (!person) continue;
    const carried = { kind: "carried_by_person" as const, personId };

    let packContainerId: string | null = null;
    for (const possession of person.public.possessions) {
      const variant = POSSESSION_LABEL_TO_VARIANT[possession.labelKey] ?? (possession.isMeleeOrImprovisedWeapon ? "improvised_tool_or_weapon.iron_pipe" : "transport_container.backpack");
      const obj = makeWorldObject({ id: possession.id, variant, location: carried, condition: 0.8, quality: 0.5, functionalState: "functional", provenance: "scn003_arrival" });
      if (catalogEntry(variant).defaultCapacityUnits !== null) {
        packContainerId = `${possession.id}-container`;
        containers.push({
          id: packContainerId,
          location: { kind: "on_object", objectId: possession.id },
          capacityUnits: catalogEntry(variant).defaultCapacityUnits!,
          contentIds: [],
          hostFurnitureId: null,
          hostWorldObjectId: possession.id,
          acceptedHandlingTags: null,
        });
        worldObjects.push({ ...obj, containerId: packContainerId });
      } else {
        worldObjects.push(obj);
      }
    }

    const intoPack = (id: string): WorldObject["location"] => {
      if (!packContainerId) return carried;
      containers.find((c) => c.id === packContainerId)!.contentIds.push(id);
      return { kind: "container", containerId: packContainerId };
    };
    const condition = (): number => round3(0.55 + prng.nextFloat() * 0.35);

    // Recipiente personal de líquido (alterna cantimplora / botella).
    const vesselVariant = index % 2 === 0 ? "personal_liquid_container.canteen" : "personal_liquid_container.bottle";
    const vesselId = ids.next("object");
    worldObjects.push(makeWorldObject({ id: vesselId, variant: vesselVariant, location: intoPack(vesselId), condition: condition(), quality: 0.5, functionalState: "functional", provenance: "scn003_arrival" }));
    vessels.push({ id: vesselId, capacity: catalogEntry(vesselVariant).liquidCapacityLiters! });

    // Una comida sencilla por persona.
    if (index < supplies.mealCount) {
      const mealId = ids.next("resource-lot");
      resourceLots.push(makeResourceLot({ id: mealId, family: "preserved_food", quantity: 1, unit: "unit", location: intoPack(mealId), condition: round3(supplies.mealCondition), provenance: "scn003_arrival" }));
    }

    // Objetos de grupo repartidos por posición estable de cohorte.
    const groupItem = GROUP_ITEMS_BY_INDEX[index];
    if (groupItem) {
      if (groupItem.kind === "object") {
        const itemId = ids.next("object");
        worldObjects.push(makeWorldObject({ id: itemId, variant: groupItem.variant, location: intoPack(itemId), condition: condition(), quality: 0.5, functionalState: "functional", provenance: "scn003_arrival" }));
        const liquid = catalogEntry(groupItem.variant).liquidCapacityLiters;
        if (liquid) vessels.push({ id: itemId, capacity: liquid });
      } else {
        const lotId = ids.next("resource-lot");
        resourceLots.push(makeResourceLot({ id: lotId, family: groupItem.family, quantity: groupItem.quantity, unit: "unit", location: intoPack(lotId), condition: condition(), provenance: "scn003_arrival" }));
      }
    }
  }

  // Agua del grupo: llena los recipientes en orden estable hasta agotar el presupuesto.
  let remaining = supplies.waterLiters;
  for (const vessel of vessels) {
    if (remaining <= 0) break;
    const liters = round3(Math.min(vessel.capacity, remaining));
    remaining = round3(remaining - liters);
    resourceLots.push(
      makeResourceLot({ id: ids.next("resource-lot"), family: "water", quantity: liters, unit: "liter", location: { kind: "on_object", objectId: vessel.id }, condition: round3(supplies.waterCondition), provenance: "scn003_arrival" }),
    );
  }

  return { worldObjects, containers, resourceLots };
}

type GroupItem = { readonly kind: "object"; readonly variant: string } | { readonly kind: "lot"; readonly family: ResourceLot["family"]; readonly quantity: number };

const GROUP_ITEMS_BY_INDEX: readonly (GroupItem | null)[] = [
  { kind: "object", variant: "light_source.flashlight" },
  { kind: "object", variant: "light_source.lighter" },
  { kind: "object", variant: "improvised_tool_or_weapon.pocket_knife" },
  { kind: "object", variant: "work_container.cooking_pot" },
  { kind: "lot", family: "healing_material", quantity: 2 },
  null,
];
