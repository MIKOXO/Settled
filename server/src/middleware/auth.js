import { verifySessionToken } from '../utils/tokens.js';
import { readSessionToken } from '../utils/session.js';
import { touchLastActive } from '../services/participantService.js';
import { Participant } from '../models/Participant.js';
import { createAppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const requireAuth = catchAsync(async function requireAuth(req, _res, next) {
  const payload = verifySessionToken(readSessionToken(req));

  // Read fresh rather than trusting the JWT's copy of the role: a claim or a
  // removal must take effect on the next request, not the next login.
  const participant = await Participant.findById(payload.sub).lean();
  if (!participant) {
    throw createAppError('Authentication required', 401);
  }

  req.participant = {
    id: participant._id.toString(),
    boardId: participant.boardId?.toString() ?? payload.boardId,
    role: participant.role,
  };

  touchLastActive(payload.sub);
  next();
});

export const requireOwner = (req, _res, next) => {
  if (req.participant?.role !== 'owner') {
    return next(createAppError('Owner access required', 403));
  }
  return next();
};