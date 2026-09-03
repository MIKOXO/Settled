export const createConnectionHandler = (_io) => {
  const onConnection = (socket) => {
    const room = `board:${socket.participant.boardId}`;
    socket.join(room);

    socket.on('disconnect', () => {});
  };

  return onConnection;
};
