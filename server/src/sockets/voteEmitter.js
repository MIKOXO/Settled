import { emitToBoard } from './io.js';

export const emitVoteUpdated = (boardId, payload) =>
  emitToBoard('vote:updated', boardId, payload);