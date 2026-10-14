import { findBoardForParticipant } from '../utils/membership.js';
import { createAppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const requireCanCreateOption = catchAsync(async function requireCanCreateOption(req, _res, next) {
  req.board = await findBoardForParticipant(req.participant.id, req.params.boardId);

  if (req.board.optionsOwnerOnly && req.participant.role !== 'owner') {
    throw createAppError('Owner-only board', 403);
  }

  next();
});