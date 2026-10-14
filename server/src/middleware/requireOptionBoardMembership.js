import { Option } from '../models/Option.js';
import { assertParticipantOnBoard } from '../utils/membership.js';
import { createAppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const requireOptionBoardMembership = catchAsync(async function requireOptionBoardMembership(req, _res, next) {
  const option = await Option.findById(req.params.id);
  if (!option) {
    throw createAppError('Option not found', 404);
  }

  await assertParticipantOnBoard(req.participant.id, option.boardId);

  req.option = option;
  next();
});