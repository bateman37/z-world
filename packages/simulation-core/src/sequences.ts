import type { CausalSequenceCounters } from "@z-world/contracts";

/**
 * Genérico sobre el tipo exacto de `sequences` (V1 usa `CausalSequenceCounters`
 * tal cual; V2 añade `nextEntityOrdinal` — ver `state-v2.ts`) para que el
 * campo adicional nunca se pierda al reconstruir el objeto por spread.
 */
export function nextEventId<S extends CausalSequenceCounters>(sequences: S): {
  eventId: string;
  sequences: S;
} {
  const eventId = `evt-${sequences.nextDomainEventSequence}`;
  return {
    eventId,
    sequences: {
      ...sequences,
      nextDomainEventSequence: sequences.nextDomainEventSequence + 1,
    },
  };
}

export function nextPersonId(
  seed: string,
  sequences: CausalSequenceCounters,
): { personId: string; sequences: CausalSequenceCounters } {
  const personId = `person-${seed}-${sequences.nextPersonOrdinal}`;
  return {
    personId,
    sequences: { ...sequences, nextPersonOrdinal: sequences.nextPersonOrdinal + 1 },
  };
}

export function nextPlaceId(
  seed: string,
  sequences: CausalSequenceCounters,
): { placeId: string; sequences: CausalSequenceCounters } {
  const placeId = `place-${seed}-${sequences.nextPlaceOrdinal}`;
  return {
    placeId,
    sequences: { ...sequences, nextPlaceOrdinal: sequences.nextPlaceOrdinal + 1 },
  };
}
