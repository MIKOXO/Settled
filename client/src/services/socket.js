import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (socket?.connected) return socket;

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};
