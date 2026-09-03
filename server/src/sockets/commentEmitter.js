import { getIo } from './io.js';

export const emitCommentAdded = (boardId, payload) => {
  const io = getIo();
  if (!io) return;
  io.to(`board:${boardId}`).emit('comment:added', payload);
};