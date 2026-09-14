import { verifyToken } from '../utils/tokens.js';
import { Participant } from '../models/Participant.js';
import { createAppError } from '../utils/AppError.js';

const SESSION_COOKIE = 'session';

export const requireAuth = async (req, _res, next) => {
  try {
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) {
      throw createAppError('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (payload.type !== 'session') {
      throw createAppError('Authentication required', 401);
    }

    const participant = await Participant.findById(payload.sub).lean();
    if (!participant) {
      throw createAppError('Authentication required', 401);
    }

    req.participant = {
      id: participant._id.toString(),
      boardId: participant.boardId?.toString() ?? payload.boardId,
      role: participant.role,
    };

    Participant.findByIdAndUpdate(payload.sub, { lastActiveAt: new Date() }).exec().catch(() => {});

    next();
  } catch (err) {
    next(err);
  }
};

export const requireOwner = (req, _res, next) => {
  if (req.participant?.role !== 'owner') {
    return next(createAppError('Owner access required', 403));
  }
  next();
};
