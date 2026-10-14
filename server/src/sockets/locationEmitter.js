import { emitToBoard } from './io.js';

export const emitLocationUpdated = (boardId, payload) =>
  emitToBoard('location:updated', boardId, payload);

export const emitLocationRemoved = (boardId, payload) =>
  emitToBoard('location:removed', boardId, payload);