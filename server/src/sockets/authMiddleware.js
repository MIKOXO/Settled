import * as cookie from 'cookie';

import { verifyToken } from '../utils/tokens.js';
import { Participant } from '../models/Participant.js';

const SESSION_COOKIE = 'session';

export const socketAuth = (socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) {
      return next(new Error('Authentication required'));
    }

    const parsed = cookie.parseCookie(rawCookie);
    const token = parsed[SESSION_COOKIE];
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const payload = verifyToken(token);
    if (payload.type !== 'session') {
      return next(new Error('Authentication required'));
    }

    socket.participant = {
      id: payload.sub,
      boardId: payload.boardId,
      role: payload.role,
    };

    Participant.findByIdAndUpdate(payload.sub, { lastActiveAt: new Date() }).exec().catch(() => {});

    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
};
