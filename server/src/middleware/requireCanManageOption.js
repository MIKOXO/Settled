import { createAppError } from '../utils/AppError.js';
import { canManageOption } from '../utils/optionGuard.js';

/** Runs after `requireOptionBoardMembership`, which already loaded `req.option`. */
export const requireCanManageOption = (req, _res, next) => {
  if (!canManageOption(req.participant, req.option)) {
    return next(
      createAppError('Only the option creator or board owner can edit or remove this option', 403),
    );
  }
  return next();
};