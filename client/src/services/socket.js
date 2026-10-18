import { io } from 'socket.io-client';
import api from './api';

let socket = null;

/**
 * Idempotent: returns the live instance, creating one only if there isn't one
 * already. Recreating a socket that merely hasn't connected yet would silently
 * strip the listeners `useBoardSocket` bound to it, leaving the page connected
 * but deaf. Teardown stays the job of `disconnectSocket`, which nulls the
 * instance so the next session genuinely starts fresh.
 */
export const initSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: (cb) => {
        api
          .get('/participants/socket-token')
          .then((data) => cb({ token: data?.token ?? null }))
          .catch(() => cb({ token: null }));
      },
      autoConnect: false,
    });
  }

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
