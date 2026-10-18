import { verifyToken } from '../utils/tokens.js';
import { touchLastActive } from '../services/participantService.js';
import { Participant } from '../models/Participant.js';
import { createAppError } from '../utils/AppError.js';

export const socketAuth = async (socket, next) => {
  const token = socket.handshake?.auth?.token ?? null;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next(new Error('Invalid or expired token'));
  }

  if (payload.type !== 'socket') {
    return next(new Error('Authentication required'));
  }

  try {
    const participant = await Participant.findById(payload.sub).lean();
    if (!participant) {
      return next(new Error('Authentication required'));
    }

    socket.participant = {
      id: participant._id.toString(),
      boardId: participant.boardId?.toString() ?? null,
      role: participant.role,
    };

    touchLastActive(payload.sub);
    return next();
  } catch {
    return next(new Error('Authentication required'));
  }
};