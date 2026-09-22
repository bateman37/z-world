import type { CausalSequenceCounters } from "@z-world/contracts";

export function nextEventId(sequences: CausalSequenceCounters): {
  eventId: string;
  sequences: CausalSequenceCounters;
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
