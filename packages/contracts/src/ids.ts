import { z } from "zod";

/** ID estable de una persona dentro de una partida (no revelador). */
export type PersonId = string;
export const personIdSchema = z.string().min(1);

/** ID estable de una entidad espacial (lugar, estructura, hito). */
export type PlaceId = string;
export const placeIdSchema = z.string().min(1);

/** ID estable de una partida guardada. */
export type GameSaveId = string;
export const gameSaveIdSchema = z.string().uuid();

/** ID estable y monotónico de un evento de dominio dentro de una partida. */
export type DomainEventId = string;
export const domainEventIdSchema = z.string().min(1);

/** ID de un comando emitido por el cliente, usado para deduplicación. */
export type CommandId = string;
export const commandIdSchema = z.string().min(1);
