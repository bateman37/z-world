/**
 * Redondeo determinista de todos los números de punto flotante del estado
 * generado a 6 decimales (§9 del encargo de S2: "la recarga debe recuperar
 * exactamente el mismo mundo"). JSONB de PostgreSQL no garantiza el
 * redondeo IEEE-754 exacto de un `double` de 16-17 dígitos significativos
 * (una coordenada nacida de `Math.cos`/`Math.sin`/división puede perder el
 * último dígito al volver de la base de datos); redondear en origen, antes
 * de exponer o persistir nada, elimina esa fuente de no-determinismo sin
 * tocar la precisión que importa al juego (todas las distancias del mundo
 * se miden en metros; una micra de diferencia es indistinguible). Enteros
 * (IDs, PRNG, segundos simulados) no se alteran: redondear un entero a 6
 * decimales lo devuelve exactamente igual.
 */
const PRECISION = 1_000_000;

export function roundStateNumbers<T>(value: T): T {
  if (typeof value === "number") {
    return (Number.isFinite(value) ? Math.round(value * PRECISION) / PRECISION : value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => roundStateNumbers(item)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      result[key] = roundStateNumbers(item);
    }
    return result as T;
  }
  return value;
}
