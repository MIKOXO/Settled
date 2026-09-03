import { getIo } from './io.js';

export const emitAvailabilityUpdated = (boardId, payload) => {
  const io = getIo();
  if (!io) return;
  io.to(`board:${boardId}`).emit('availability:updated', payload);
};
