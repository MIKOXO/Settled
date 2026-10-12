import { getIo } from './io.js';

export const emitBoardDecided = (boardId, payload) => {
  const io = getIo();
  if (!io) return;
  io.to(`board:${boardId}`).emit('board:decided', payload);
};

export const emitParticipantRemoved = (boardId, payload) => {
  const io = getIo();
  if (!io) return;
  io.to(`board:${boardId}`).emit('participant:removed', payload);
};

// Board settings (name, type, optionsOwnerOnly) gate what every participant
// can do, so a change has to reach every client without a reload. Only the
// patched keys are broadcast — clients merge the partial into their board,
// which keeps the payload to what actually changed.
export const emitBoardUpdated = (boardId, payload) => {
  const io = getIo();
  if (!io) return;
  io.to(`board:${boardId}`).emit('board:updated', payload);
};
