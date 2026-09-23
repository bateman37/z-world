import type { ActionMethodDefinition, Job, SimulationStateV2, WorkZone } from "@z-world/contracts";
import { checkHardRequirements, priorityAllowsWork } from "./eligibility.js";
import { locationToNavPoint } from "./location-utils.js";

/**
 * Planificador determinista (WEB-002 §11.7, subhito S5): cuando una persona
 * queda disponible, elige el mejor trabajo elegible siguiendo el orden
 * exacto de criterios del prompt de subhitos §6.4. No usa información
 * oculta, no consume azar, y reacciona solo sobre la lista (pequeña) de
 * trabajos y personas activas — nunca recorre el mundo espacial completo.
 */

function zonePolicyAt(state: SimulationStateV2, point: { x: number; y: number } | null): WorkZone["policy"] | null {
  if (!point) return null;
  for (const zone of Object.values(state.workZones)) {
    if (pointInPolygon(point, zone.polygon)) return zone.policy;
  }
  return null;
}

function pointInPolygon(point: { x: number; y: number }, polygon: readonly { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i]!;
    const pj = polygon[j]!;
    const intersects = pi.y > point.y !== pj.y > point.y && point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

const ZONE_RANK: Readonly<Record<"habitual" | "precaution" | "forbidden" | "none", number>> = {
  habitual: 0,
  none: 0,
  precaution: 1,
  forbidden: 2,
};

export interface PlannerCandidate {
  readonly job: Job;
  readonly priorityRank: number;
  readonly zoneRank: number;
  readonly distance: number;
}

/**
 * Devuelve el mejor trabajo disponible para una persona idle, o `null` si
 * ninguno es elegible. `jobs` debe ser la lista ya filtrada a
 * `proposed`/`available` con hueco de equipo.
 */
export function selectJobForPerson(
  state: SimulationStateV2,
  personId: string,
  jobs: readonly Job[],
  methodsByKey: ReadonlyMap<string, ActionMethodDefinition>,
): Job | null {
  const person = state.people[personId];
  if (!person) return null;
  const personPoint = person.public.position;

  const candidates: PlannerCandidate[] = [];
  for (const job of jobs) {
    if (job.assignments.length >= job.desiredTeamSize) continue;
    if (job.assignments.some((a) => a.personId === personId)) continue;
    const priorityValue = person.public.priorities[job.effectivePriority];
    if (priorityValue === undefined || !priorityAllowsWork(priorityValue)) continue;
    const def = methodsByKey.get(job.actionKey);
    if (!def) continue;
    const hardCheck = checkHardRequirements(def, state, personId, job.target);
    if (!hardCheck.ok) continue;

    const jobPoint = locationToNavPoint(state, job.location);
    const zonePolicy = zonePolicyAt(state, jobPoint) ?? "none";
    if (zonePolicy === "forbidden") continue;

    const distance = jobPoint ? Math.hypot(jobPoint.x - personPoint.x, jobPoint.y - personPoint.y) : Number.POSITIVE_INFINITY;
    candidates.push({
      job,
      priorityRank: typeof priorityValue === "number" ? priorityValue : 5,
      zoneRank: ZONE_RANK[zonePolicy],
      distance,
    });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
    if (a.job.urgency !== b.job.urgency) return b.job.urgency - a.job.urgency;
    if (a.zoneRank !== b.zoneRank) return a.zoneRank - b.zoneRank;
    if (a.distance !== b.distance) return a.distance - b.distance;
    if (a.job.createdAtSimSeconds !== b.job.createdAtSimSeconds) return a.job.createdAtSimSeconds - b.job.createdAtSimSeconds;
    return a.job.id < b.job.id ? -1 : a.job.id > b.job.id ? 1 : 0;
  });

  return candidates[0]!.job;
}
