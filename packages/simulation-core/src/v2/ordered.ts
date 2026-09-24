/**
 * Iteración determinista de colecciones `Record<id, T>` (S7). PostgreSQL
 * `jsonb` no conserva el orden de inserción de las claves (las ordena por
 * longitud y bytes), así que un estado recargado itera `Object.values` en
 * otro orden que el mismo estado en memoria. Todo recorrido cuyo orden
 * afecte al resultado (qué trabajo avanza antes, qué evento consume antes
 * una secuencia, qué arista gana un empate de ruta) usa estas funciones:
 * así seguir en memoria y seguir tras recargar producen exactamente lo
 * mismo (§11 del prompt S7-S9: "recarga no remuestrea ni duplica").
 */
export function valuesById<T extends { readonly id: string }>(record: Readonly<Record<string, T>>): T[] {
  return Object.values(record).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** Trabajos en orden causal estable: creación y, a igualdad, ID. */
export function jobsInOrder<T extends { readonly id: string; readonly createdAtSimSeconds: number }>(record: Readonly<Record<string, T>>): T[] {
  return Object.values(record).sort((a, b) => a.createdAtSimSeconds - b.createdAtSimSeconds || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
