import { getIo } from './io.js';

export const emitLocationUpdated = (boardId, payload) => {
  const io = getIo();
  if (!io) return;
  io.to(`board:${boardId}`).emit('location:updated', payload);
};

export const emitLocationRemoved = (boardId, payload) => {
  const io = getIo();
  if (!io) return;
  io.to(`board:${boardId}`).emit('location:removed', payload);
};
