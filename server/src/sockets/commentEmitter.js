import { emitToBoard } from './io.js';

export const emitCommentAdded = (boardId, payload) =>
  emitToBoard('comment:added', boardId, payload);