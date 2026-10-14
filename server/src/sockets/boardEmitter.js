import { emitToBoard } from './io.js';

export const emitBoardDecided = (boardId, payload) =>
  emitToBoard('board:decided', boardId, payload);

export const emitParticipantRemoved = (boardId, payload) =>
  emitToBoard('participant:removed', boardId, payload);

// Settings gate what every participant can do, so a change has to reach every
// client. Only patched keys are sent; clients merge the partial into their board.
export const emitBoardUpdated = (boardId, payload) =>
  emitToBoard('board:updated', boardId, payload);