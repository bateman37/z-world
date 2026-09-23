/**
 * Asignador de IDs estables y reproducibles para el generador (§7.2/§7.4 de
 * WEB-002): `${kind}-${seed}-${ordinal}`, igual que `nextPersonId`/
 * `nextPlaceId` de WEB-001 (`../sequences.ts`). Es un contador puro en
 * memoria durante la generación; el resultado final expone el próximo
 * ordinal libre para persistirlo en `sequences.nextEntityOrdinal`, de modo
 * que cualquier ID generado después (ya en juego) nunca colisione con uno
 * de generación.
 *
 * Determinista por construcción: el ID depende únicamente del orden de
 * llamada dentro de un pipeline de generación fijo (siempre el mismo para
 * una versión de generador dada), nunca de un reloj, UUID aleatorio o
 * locale.
 */
export class IdAllocator {
  private ordinal: number;

  constructor(
    private readonly seed: string,
    startOrdinal = 0,
  ) {
    this.ordinal = startOrdinal;
  }

  next(kind: string): string {
    const id = `${kind}-${this.seed}-${this.ordinal}`;
    this.ordinal += 1;
    return id;
  }

  get nextOrdinal(): number {
    return this.ordinal;
  }
}
