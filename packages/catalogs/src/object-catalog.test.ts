import { describe, expect, it } from "vitest";
import { RESOURCE_FAMILIES, WORLD_OBJECT_FAMILIES } from "@z-world/contracts";
import { CONCEPTUAL_OBJECT_FAMILIES, OBJECT_CATALOG, OBJECT_CATALOG_BY_VARIANT, RESOURCE_CATALOG, validateObjectCatalog } from "./object-catalog.js";
import { DISASSEMBLY_PROFILES, DISASSEMBLY_PROFILES_BY_ID, REPAIR_PROFILES } from "./repair-disassembly-profiles.js";
import { ACTION_METHODS_BY_KEY } from "./action-methods.js";
import { DECAY_TUNING_BY_FAMILY } from "./decay-tuning.js";

/** Catálogo de objetos S7 (CAT-005 §3.1/§3.2/§4.3, WEB-002 §6.1 del prompt S7-S9). */
describe("catálogo de objetos S7", () => {
  const profileIds = new Set([...REPAIR_PROFILES.map((p) => p.id), ...DISASSEMBLY_PROFILES.map((p) => p.id)]);
  const outputsById = new Map([...DISASSEMBLY_PROFILES_BY_ID].map(([id, p]) => [id, p.outputs]));

  it("valida sin problemas (familias, variantes mínimas, cifras físicas, perfiles y conservación de masa)", () => {
    const report = validateObjectCatalog(outputsById, profileIds);
    expect(report.problems).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it("cubre exactamente las catorce familias conceptuales de CAT-005 §3.1", () => {
    expect(CONCEPTUAL_OBJECT_FAMILIES).toHaveLength(14);
    expect(new Set(CONCEPTUAL_OBJECT_FAMILIES.map((f) => f.id)).size).toBe(14);
    // Trece son familias de objeto completo; el consumible localizado vive como ResourceLot.
    const objectFamilies = CONCEPTUAL_OBJECT_FAMILIES.filter((f) => f.representation === "world_object_family").map((f) => f.worldObjectFamily);
    expect(new Set(objectFamilies)).toEqual(new Set(WORLD_OBJECT_FAMILIES));
    expect(CONCEPTUAL_OBJECT_FAMILIES.filter((f) => f.representation === "resource_lot").map((f) => f.id)).toEqual(["localized_consumable"]);
    for (const family of WORLD_OBJECT_FAMILIES) {
      expect(OBJECT_CATALOG.some((e) => e.family === family)).toBe(true);
    }
    expect(new Set(RESOURCE_CATALOG.map((r) => r.family))).toEqual(new Set(RESOURCE_FAMILIES));
  });

  it("los cuatro demostradores profundos tienen perfiles de reparación y desmontaje reales", () => {
    for (const variant of ["storage_furniture.wardrobe", "storage_furniture.shelf", "technical_appliance.fridge", "technical_installation.hand_pump", "human_transport.wheelbarrow", "human_transport.handcart"]) {
      const entry = OBJECT_CATALOG_BY_VARIANT.get(variant);
      expect(entry, variant).toBeDefined();
      expect(entry!.repairProfileId).not.toBeNull();
      expect(entry!.disassemblyProfileId).not.toBeNull();
    }
    expect(OBJECT_CATALOG_BY_VARIANT.get("technical_installation.hand_pump")!.wear).not.toBeNull();
  });

  it("no existe ninguna pila universal `repair_materials` (CAT-005 §4.3)", () => {
    expect(RESOURCE_FAMILIES as readonly string[]).not.toContain("repair_materials");
    for (const profile of REPAIR_PROFILES) {
      expect(profile.requirements.length).toBeGreaterThan(0);
      for (const requirement of profile.requirements) expect(requirement.resourceFamily).not.toBe("repair_materials");
    }
  });

  it("almacenar/retirar apuntan a un contenedor real y solo el alimento fresco se deteriora", () => {
    expect(ACTION_METHODS_BY_KEY.get("store")!.targetKinds).toEqual(["container"]);
    expect(ACTION_METHODS_BY_KEY.get("retrieve_from_storage")!.targetKinds).toEqual(["container"]);
    expect(ACTION_METHODS_BY_KEY.get("draw_water")!.priority).toBe("water_supply");
    expect([...DECAY_TUNING_BY_FAMILY.keys()]).toEqual(["fresh_food"]);
  });
});
