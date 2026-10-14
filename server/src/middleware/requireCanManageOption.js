import { createAppError } from '../utils/AppError.js';
import { canManageOption } from '../utils/optionGuard.js';

/** Runs after `requireOptionBoardMembership`, which already loaded `req.option`. */
export const requireCanManageOption = (req, _res, next) => {
  if (!canManageOption(req.participant, req.option)) {
    return next(createAppError('Only the person who proposed this option can edit or remove it', 403));
  }
  return next();
};