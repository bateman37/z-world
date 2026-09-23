import type { BulkClass, PersonStateV2 } from "@z-world/contracts";
import {
  HELPER_CONTRIBUTION_CAPS,
  USEFUL_CARRIERS_BY_BULK,
  USEFUL_CARRIERS_BY_OPENING,
  type OpeningWidthClass,
  type TransportMethodDefinition,
} from "@z-world/catalogs";
import { computeEffectiveCapacity, isUniversalCapacity } from "../resolution/capacity.js";
import { needOf } from "../needs/evolve-needs.js";

/**
 * Cooperación real y capacidad de porte (S8, §7.4 del prompt S7-S9; cierra
 * la deuda de `DEC-0018` sobre la contribución de ayudantes). Reutiliza la
 * capacidad efectiva exacta de S4 (perfiles 70/30, 50/50, 30/70): no hay
 * una segunda fórmula de competencia.
 */

const round3 = (value: number): number => Math.round(value * 1000) / 1000;

/** Capacidad efectiva 0-10 de una persona para un método de transporte (característica/habilidad del catálogo). */
export function transportCapacityOf(person: PersonStateV2, def: TransportMethodDefinition): number {
  const capacity = computeEffectiveCapacity(person.public, def.carryCapacity);
  return isUniversalCapacity(capacity) ? 10 : capacity;
}

/**
 * Kg que una persona puede portar con un método manual. Una persona muy
 * fatigada (descanso en banda crítica) porta menos: la necesidad afecta al
 * trabajo, no solo a un indicador.
 */
export function personCarryKg(person: PersonStateV2, def: TransportMethodDefinition): number {
  const base = def.perPersonBaseKg + def.perPersonKgPerCapacityPoint * transportCapacityOf(person, def);
  const rest = needOf(person.needs, "rest");
  const fatigueFactor = rest.band === "critical" ? 0.6 : rest.band === "urgent" ? 0.85 : 1;
  return round3(base * fatigueFactor);
}

/**
 * Contribución de cada participante con los topes exactos 100/60/35/20:
 * la principal aporta el 100 % de lo suyo; los ayudantes útiles, ordenados
 * de mayor a menor aporte, hasta el 60 %, 35 % y 20 %. Un ayudante más allá
 * del cuarto no aporta nada.
 */
export function cappedContributions(values: readonly number[]): number[] {
  if (values.length === 0) return [];
  const [primary, ...helpers] = values;
  const sortedHelpers = [...helpers].sort((a, b) => b - a);
  return [primary!, ...sortedHelpers].map((v, i) => round3(v * (HELPER_CONTRIBUTION_CAPS[i] ?? 0)));
}

/** Kg totales que un equipo porta en porte coordinado (una sola carga compartida). */
export function coordinatedTeamKg(carriers: readonly PersonStateV2[], def: TransportMethodDefinition): number {
  return round3(cappedContributions(carriers.map((p) => personCarryKg(p, def))).reduce((a, b) => a + b, 0));
}

/**
 * Factor de ritmo de trabajo de un equipo sobre una tarea compartida (carga,
 * descarga, trabajo D): 1 + Σ contribución relativa de cada ayudante útil,
 * con los mismos topes, reducida por su capacidad frente a la principal
 * (acotada a [0,25, 1]). No es una bonificación genérica: solo cuentan los
 * ayudantes que caben (`usefulLimit`).
 */
export function teamWorkFactor(capacities: readonly number[], usefulLimit: number): number {
  if (capacities.length <= 1) return 1;
  const useful = capacities.slice(0, Math.max(1, usefulLimit));
  const primary = Math.max(useful[0] ?? 1, 0.5);
  const helpers = useful.slice(1).sort((a, b) => b - a);
  let factor = 1;
  helpers.forEach((capacity, i) => {
    const cap = HELPER_CONTRIBUTION_CAPS[i + 1] ?? 0;
    factor += cap * Math.max(0.25, Math.min(1, capacity / primary));
  });
  return round3(factor);
}

/**
 * Cuántas personas pueden ayudar realmente a la vez (SET-010 §3.10): lo
 * limitan el bulto de la carga (espacio alrededor), la abertura más
 * estrecha de la ruta y el máximo del método.
 */
export function usefulCarrierLimit(def: TransportMethodDefinition, bulk: BulkClass, narrowestOpening: OpeningWidthClass | null): number {
  const byBulk = USEFUL_CARRIERS_BY_BULK[bulk];
  const byAccess = USEFUL_CARRIERS_BY_OPENING[narrowestOpening ?? "none"];
  if (def.method === "hand_carry") {
    // A pulso en equipo cada persona lleva su parte por separado: el límite es de personas, no de espacio alrededor de un único objeto.
    return def.maxOperators;
  }
  if (def.method === "coordinated_carry") return Math.max(def.minOperators, Math.min(def.maxOperators, byBulk, byAccess));
  return Math.min(def.maxOperators, Math.max(1, Math.min(byBulk, byAccess)));
}
