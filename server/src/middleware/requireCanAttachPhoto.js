import { createAppError } from '../utils/AppError.js';
import { canManageOption } from '../utils/optionGuard.js';

// The photo is part of the option, so it follows the option's own rule (see
// utils/optionGuard.js) rather than repeating it: creator OR owner. Board
// membership is already established by requireOptionBoardMembership, and
// requireAuth attached a role read fresh from the DB, so this reads no further
// than the loaded option and the session — the previous Board lookup here only
// re-derived the owner it already had.
export const requireCanAttachPhoto = (req, _res, next) => {
  if (!canManageOption(req.participant, req.option)) {
    return next(createAppError('Only the option creator or board owner can attach a photo', 403));
  }
  return next();
};