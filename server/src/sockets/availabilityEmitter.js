import { emitToBoard } from './io.js';

export const emitAvailabilityUpdated = (boardId, payload) =>
  emitToBoard('availability:updated', boardId, payload);

export const emitAvailabilityRemoved = (boardId, payload) =>
  emitToBoard('availability:removed', boardId, payload);