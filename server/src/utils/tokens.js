import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { createAppError } from './AppError.js';

const EXPIRY = { session: '30d', recovery: '15m', welcome: '7d', socket: '60s' };

const sign = (payload, expiresIn) => jwt.sign(payload, env.JWT_SECRET, { expiresIn });

export const signSessionToken = (participantId, boardId, role) =>
  sign({ sub: participantId, boardId, role, type: 'session' }, EXPIRY.session);

export const signRecoveryToken = (participantId) =>
  sign({ sub: participantId, type: 'recovery' }, EXPIRY.recovery);

export const signBoardWelcomeToken = (participantId) =>
  sign({ sub: participantId, type: 'welcome' }, EXPIRY.welcome);

export const signSocketToken = (participantId) =>
  sign({ sub: participantId, type: 'socket' }, EXPIRY.socket);

export const verifyToken = (token) => {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (!payload.type) {
      throw createAppError('Invalid token', 401);
    }
    return payload;
  } catch (err) {
    if (err.isOperational) throw err;
    throw createAppError('Invalid or expired token', 401);
  }
};

export const verifySessionToken = (token) => {
  if (!token) {
    throw createAppError('Authentication required', 401);
  }

  const payload = verifyToken(token);
  if (payload.type !== 'session') {
    throw createAppError('Authentication required', 401);
  }

  return payload;
};