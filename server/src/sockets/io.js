let ioInstance = null;

export const setIo = (io) => {
  ioInstance = io;
};

export const boardRoom = (boardId) => `board:${boardId}`;

/** Every broadcast is board-scoped; there is no global emit path (invariant 4). */
export const emitToBoard = (event, boardId, payload) => {
  if (!ioInstance) return;
  ioInstance.to(boardRoom(boardId)).emit(event, payload);
};