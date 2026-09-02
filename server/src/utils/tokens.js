import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { createAppError } from './AppError.js';

const SESSION_EXPIRY = '30d';
const RECOVERY_EXPIRY = '15m';

export const signSessionToken = (participantId, boardId, role) =>
  jwt.sign(
    { sub: participantId, boardId, role, type: 'session' },
    env.JWT_SECRET,
    { expiresIn: SESSION_EXPIRY },
  );

export const signRecoveryToken = (participantId) =>
  jwt.sign(
    { sub: participantId, type: 'recovery' },
    env.JWT_SECRET,
    { expiresIn: RECOVERY_EXPIRY },
  );

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
