import * as cookie from 'cookie';

import { verifyToken } from '../utils/tokens.js';
import { SESSION_COOKIE } from '../utils/session.js';
import { touchLastActive } from '../services/participantService.js';

export const socketAuth = (socket, next) => {
  const rawCookie = socket.handshake.headers.cookie;
  const token = rawCookie ? cookie.parseCookie(rawCookie)[SESSION_COOKIE] : null;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next(new Error('Invalid or expired token'));
  }

  if (payload.type !== 'session') {
    return next(new Error('Authentication required'));
  }

  socket.participant = {
    id: payload.sub,
    boardId: payload.boardId,
    role: payload.role,
  };

  touchLastActive(payload.sub);
  return next();
};