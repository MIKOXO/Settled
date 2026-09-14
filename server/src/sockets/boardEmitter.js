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
