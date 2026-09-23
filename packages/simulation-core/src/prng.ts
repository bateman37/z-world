import {
  PRNG_ALGORITHM,
  PRNG_ALGORITHM_VERSION,
  type PrngDomain,
  type PrngStateByDomain,
  type PrngStateByDomainV2,
  type PrngStreamState,
} from "@z-world/contracts";

/**
 * PRNG determinista mulberry32. Prohibido `Math.random()` en núcleo,
 * catálogos generativos y Worker (§7.3 de WEB-001). Cada dominio
 * (`cohort`, `fixture`, `navigation`) tiene un stream independiente
 * derivado de la semilla, de modo que una tirada futura en un dominio no
 * altera la secuencia de otro.
 */

/** Hash determinista xmur3 de una cadena a un entero de 32 bits. */
function xmur3(input: string): () => number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32Next(state: number): { value: number; nextState: number } {
  let t = (state + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t = (t + Math.imul(t ^ (t >>> 7), t | 61)) >>> 0;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, nextState: t };
}

export function createPrngStreamState(seed: string, domain: PrngDomain): PrngStreamState {
  const hash = xmur3(`${seed}::${domain}::v${PRNG_ALGORITHM_VERSION}`);
  return {
    algorithm: PRNG_ALGORITHM,
    algorithmVersion: PRNG_ALGORITHM_VERSION,
    state: hash(),
  };
}

/**
 * Stream derivado de uso local en generación (S7 de WEB-002): hash de la
 * semilla con una etiqueta propia, independiente de los dominios
 * persistidos. Permite añadir contenido nuevo en una versión posterior del
 * generador sin consumir tiradas del stream `world`, de modo que el
 * trazado de pueblo de una semilla ya verificada (E2E, guiones manuales)
 * no se desplaza. Nunca se persiste: solo vive durante la generación.
 */
export function createDerivedPrngStreamState(seed: string, label: string): PrngStreamState {
  const hash = xmur3(`${seed}::derived::${label}::v${PRNG_ALGORITHM_VERSION}`);
  return { algorithm: PRNG_ALGORITHM, algorithmVersion: PRNG_ALGORITHM_VERSION, state: hash() };
}

export function createPrngStateByDomain(seed: string): PrngStateByDomain {
  return {
    cohort: createPrngStreamState(seed, "cohort"),
    fixture: createPrngStreamState(seed, "fixture"),
    navigation: createPrngStreamState(seed, "navigation"),
  };
}

/**
 * Igual que `createPrngStateByDomain`, pero añade el stream `world` que usa
 * el generador semántico real de partidas nuevas (S2 de WEB-002). `fixture`
 * se conserva sin usar, reservado a la migración V1→V2 (§7.1: nunca se
 * genera primero un V1 para migrarlo en una partida nueva).
 */
export function createPrngStateByDomainV2(seed: string): PrngStateByDomainV2 {
  return {
    cohort: createPrngStreamState(seed, "cohort"),
    fixture: createPrngStreamState(seed, "fixture"),
    navigation: createPrngStreamState(seed, "navigation"),
    world: createPrngStreamState(seed, "world"),
    resolution: createPrngStreamState(seed, "resolution"),
  };
}

/**
 * Generador con estado mutable en memoria (envoltorio ergonómico sobre el
 * estado serializable inmutable). `snapshot()` devuelve el `PrngStreamState`
 * a persistir.
 */
export class PrngStream {
  private state: number;

  constructor(private readonly initial: PrngStreamState) {
    this.state = initial.state;
  }

  /** Flotante determinista en [0, 1). */
  nextFloat(): number {
    const { value, nextState } = mulberry32Next(this.state);
    this.state = nextState;
    return value;
  }

  /** Entero determinista en [min, max], ambos inclusive. */
  nextInt(min: number, max: number): number {
    return min + Math.floor(this.nextFloat() * (max - min + 1));
  }

  nextBool(probability = 0.5): boolean {
    return this.nextFloat() < probability;
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error("No se puede elegir de una lista vacía.");
    const index = this.nextInt(0, items.length - 1);
    const item = items[index];
    if (item === undefined) throw new Error("Índice de PRNG fuera de rango inesperadamente.");
    return item;
  }

  /** Barajado Fisher–Yates determinista. */
  shuffle<T>(items: readonly T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      const a = copy[i]!;
      const b = copy[j]!;
      copy[i] = b;
      copy[j] = a;
    }
    return copy;
  }

  snapshot(): PrngStreamState {
    return {
      algorithm: this.initial.algorithm,
      algorithmVersion: this.initial.algorithmVersion,
      state: this.state,
    };
  }
}
