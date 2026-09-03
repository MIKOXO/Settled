import { getIo } from './io.js';

export const emitVoteUpdated = (boardId, payload) => {
  const io = getIo();
  if (!io) return;
  io.to(`board:${boardId}`).emit('vote:updated', payload);
};
