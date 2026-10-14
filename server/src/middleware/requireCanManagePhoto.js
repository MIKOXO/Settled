import { createAppError } from '../utils/AppError.js';
import { canManageOption } from '../utils/optionGuard.js';

/**
 * The photo belongs to the option, so it inherits the option's own rule. Covers
 * replacing the photo and detaching it alike — one gate, two routes.
 */
export const requireCanManagePhoto = (req, _res, next) => {
  if (!canManageOption(req.participant, req.option)) {
    return next(createAppError('Only the person who proposed this option can change its photo', 403));
  }
  return next();
};