import { createAppError } from '../utils/AppError.js';
import { canManageOption } from '../utils/optionGuard.js';

/** The photo is part of the option, so it inherits the option's own rule. */
export const requireCanAttachPhoto = (req, _res, next) => {
  if (!canManageOption(req.participant, req.option)) {
    return next(createAppError('Only the option creator or board owner can attach a photo', 403));
  }
  return next();
};