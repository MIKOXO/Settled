import { boardRoom } from './io.js';

export const onConnection = (socket) => {
  socket.join(boardRoom(socket.participant.boardId));
};